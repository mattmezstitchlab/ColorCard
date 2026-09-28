// ============================================================================
// Eye Gesture & Face Tracking Engine — v2
// ----------------------------------------------------------------------------
// Détecte : clin d'œil droit, clin d'œil gauche, double clignement,
// yeux fermés longtemps, et suivi du regard temps réel.
//
// Améliorations v2 par rapport à v1 :
//  1. Mapping anatomique correct des yeux (v1 inversait gauche/droite).
//  2. EAR corrigé de l'aspect ratio + moyenne sur 3 paires verticales.
//  3. Fusion EAR + blendshapes MediaPipe (bien plus robuste : lunettes,
//     tête inclinée, faible lumière).
//  4. Calibration adaptative continue de l'œil ouvert (par personne/distance).
//  5. Hystérésis + lissage temporel : plus de faux positifs sur 1 frame.
//  6. Machine à états par « épisode » : un clignement normal (2 yeux) ne peut
//     plus être pris pour un clin d'œil.
//  7. Déduplication des frames vidéo (requestVideoFrameCallback) : 3x moins
//     de CPU et timestamps MediaPipe monotones.
//  8. Chargement modèle résilient : WASM local → CDN épinglés, GPU → CPU,
//     mise en cache du modèle (CacheStorage).
//  9. Regard lissé (filtre One Euro) + micro-regard via blendshapes iris.
// 10. Télémétrie complète (fps, luminosité, taille du visage, qualité) pour
//     pouvoir diagnostiquer « ça ne marche pas » côté UI.
// ============================================================================

const TASKS_VISION_VERSION = "1.0.1";

/** Sources WASM essayées dans l'ordre (local d'abord = offline-friendly). */
const WASM_SOURCES = [
  "/mediapipe/wasm",
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`,
  `https://unpkg.com/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`,
];

/** Sources du modèle face_landmarker (478 points + blendshapes). */
const MODEL_SOURCES = [
  "/mediapipe/models/face_landmarker.task",
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
];

const MODEL_CACHE = "colorcard-mediapipe-v1";

// ----------------------------------------------------------------------------
// Types publics
// ----------------------------------------------------------------------------

export type EngineStatus =
  | "idle"
  | "requesting-camera"
  | "loading-model"
  | "searching"
  | "tracking"
  | "paused"
  | "error";

export type EngineMode = "none" | "mediapipe-gpu" | "mediapipe-cpu" | "optical";

export type EngineErrorCode =
  | "insecure-context"
  | "no-media-devices"
  | "permission-denied"
  | "permissions-policy"
  | "no-camera"
  | "camera-busy"
  | "model-failed"
  | "unknown";

export type TrackingQuality = "good" | "dark" | "too-far" | "no-face" | "starting";

export interface EyeMetrics {
  faceDetected: boolean;
  /** 0 = œil grand ouvert, 1 = œil fermé (œil GAUCHE de la personne). */
  leftClosure: number;
  /** 0 = œil grand ouvert, 1 = œil fermé (œil DROIT de la personne). */
  rightClosure: number;
  leftOpen: boolean;
  rightOpen: boolean;
  leftEar: number;
  rightEar: number;
  /** Seuil de fermeture courant (dépend de la sensibilité). */
  closeThreshold: number;
  fps: number;
  /** Luminosité moyenne du visage, 0..1. */
  brightness: number;
  /** Largeur du visage relative à l'image, 0..1. */
  faceSize: number;
  quality: TrackingQuality;
  mode: EngineMode;
  usingBlendshapes: boolean;
  calibrated: boolean;
}

export interface EyeGestureCallbacks {
  onRightWink?: () => void;
  onLeftWink?: () => void;
  onDoubleBlink?: () => void;
  onLongEyesClosed?: () => void;
  onGazeMove?: (point: { x: number; y: number }) => void;
  onStatusChange?: (status: EngineStatus, mode: EngineMode) => void;
  onMetrics?: (metrics: EyeMetrics) => void;
  onError?: (code: EngineErrorCode, message: string) => void;
  /** Progression de la calibration manuelle, 0..1 puis null à la fin. */
  onCalibrationProgress?: (progress: number | null) => void;
}

export interface EyeGestureSettings {
  /** 0 = très strict (peu de faux positifs), 1 = très réactif. */
  sensitivity: number;
  winkEnabled: boolean;
  doubleBlinkEnabled: boolean;
  longCloseEnabled: boolean;
  gazeEnabled: boolean;
  /** Amplitude du suivi du regard (1 = naturel). */
  gazeStrength: number;
  /** Inverse gauche/droite si l'utilisateur trouve le mapping inversé. */
  swapWinkSides: boolean;
}

export const DEFAULT_SETTINGS: EyeGestureSettings = {
  sensitivity: 0.5,
  winkEnabled: true,
  doubleBlinkEnabled: true,
  longCloseEnabled: true,
  gazeEnabled: true,
  gazeStrength: 1,
  swapWinkSides: false,
};

// ----------------------------------------------------------------------------
// Indices des points MediaPipe (convention anatomique de la personne filmée)
// FACEMESH_RIGHT_EYE = 33/133/159/145… → œil DROIT de la personne
// FACEMESH_LEFT_EYE  = 362/263/386/374… → œil GAUCHE de la personne
// ----------------------------------------------------------------------------

const RIGHT_EYE = {
  outer: 33,
  inner: 133,
  top: [159, 158, 160],
  bottom: [145, 153, 144],
  iris: [469, 470, 471, 472],
};

const LEFT_EYE = {
  outer: 263,
  inner: 362,
  top: [386, 385, 387],
  bottom: [374, 380, 373],
  iris: [474, 475, 476, 477],
};

const FACE_OVAL_SAMPLES = [10, 152, 234, 454, 1, 168];

// ----------------------------------------------------------------------------
// Utilitaires
// ----------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Filtre One Euro : lissage fort au repos, très réactif sur les mouvements rapides. */
class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev = 0;
  private tPrev = 0;

  constructor(minCutoff = 1.2, beta = 0.02, dCutoff = 1) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private static alpha(cutoff: number, dt: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = 0;
  }

  filter(x: number, timestamp: number): number {
    if (this.xPrev === null) {
      this.xPrev = x;
      this.tPrev = timestamp;
      return x;
    }
    const dt = Math.max(1e-3, (timestamp - this.tPrev) / 1000);
    this.tPrev = timestamp;

    const dx = (x - this.xPrev) / dt;
    const aD = OneEuroFilter.alpha(this.dCutoff, dt);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    this.dxPrev = dxHat;

    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = OneEuroFilter.alpha(cutoff, dt);
    const xHat = a * x + (1 - a) * this.xPrev;
    this.xPrev = xHat;
    return xHat;
  }
}

/** Suit la valeur « œil ouvert » de référence : montée rapide, descente très lente. */
class OpenBaseline {
  private value: number;
  private samples = 0;
  private readonly floor: number;
  private readonly ceil: number;

  constructor(initial: number, floor: number, ceil: number) {
    this.value = initial;
    this.floor = floor;
    this.ceil = ceil;
  }

  get current() {
    return this.value;
  }

  get ready() {
    return this.samples > 25;
  }

  set(v: number) {
    this.value = clamp(v, this.floor, this.ceil);
    this.samples = 999;
  }

  /** Met à jour uniquement avec des échantillons « œil probablement ouvert ». */
  update(ear: number) {
    this.samples++;
    if (!Number.isFinite(ear) || ear <= 0) return;
    // Montée rapide (on cherche le max plausible), descente lente (dérive de
    // distance/pose) mais jamais sous le plancher.
    const rate = ear > this.value ? 0.22 : 0.0015;
    this.value = clamp(this.value + (ear - this.value) * rate, this.floor, this.ceil);
  }
}

interface ClosureEpisode {
  eye: "left" | "right" | "both";
  startedAt: number;
  peakClosure: number;
  otherEyePeakClosure: number;
  contaminated: boolean; // l'autre œil s'est fermé aussi → clignement, pas clin d'œil
  fired: boolean;
}

// ----------------------------------------------------------------------------
// Moteur
// ----------------------------------------------------------------------------

export class EyeGestureEngine {
  private callbacks: EyeGestureCallbacks = {};
  private settings: EyeGestureSettings = { ...DEFAULT_SETTINGS };

  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private vfcId: number | null = null;

  private isRunning = false;
  private status: EngineStatus = "idle";
  private mode: EngineMode = "none";

  private faceLandmarker: any = null;
  private blendshapeIndex: Record<string, number> | null = null;
  private lastVideoTime = -1;
  private lastMpTimestamp = 0;

  // Canvas pour la luminosité + fallback optique
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // Signaux lissés
  private leftClosure = 0;
  private rightClosure = 0;
  private leftBaseline = new OpenBaseline(0.3, 0.12, 0.48);
  private rightBaseline = new OpenBaseline(0.3, 0.12, 0.48);
  private leftIsClosed = false;
  private rightIsClosed = false;
  private lastLeftEar = 0.3;
  private lastRightEar = 0.3;

  // Épisodes de fermeture
  private leftEpisode: ClosureEpisode | null = null;
  private rightEpisode: ClosureEpisode | null = null;
  private bothEpisode: ClosureEpisode | null = null;
  private longClosedFired = false;

  // Clignements
  private lastBlinkAt = 0;
  private blinkStreak = 0;
  private lastActionAt = 0;

  // Regard
  private gazeFilterX = new OneEuroFilter(1.1, 0.025);
  private gazeFilterY = new OneEuroFilter(1.1, 0.025);

  // Télémétrie
  private frameTimes: number[] = [];
  private lastMetricsAt = 0;
  private brightness = 0.5;
  private faceSize = 0;
  private faceDetected = false;
  private lastFaceAt = 0;

  // Calibration manuelle
  private calibrating = false;
  private calibrationStartedAt = 0;
  private calibrationSamplesL: number[] = [];
  private calibrationSamplesR: number[] = [];

  private visibilityHandler: (() => void) | null = null;

  constructor(callbacks: EyeGestureCallbacks = {}, settings?: Partial<EyeGestureSettings>) {
    this.callbacks = callbacks;
    if (settings) this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.restoreCalibration();
  }

  // --------------------------------------------------------------------------
  // API publique
  // --------------------------------------------------------------------------

  setCallbacks(callbacks: EyeGestureCallbacks) {
    this.callbacks = callbacks;
  }

  setSettings(partial: Partial<EyeGestureSettings>) {
    this.settings = { ...this.settings, ...partial };
  }

  getSettings(): EyeGestureSettings {
    return { ...this.settings };
  }

  getIsRunning() {
    return this.isRunning;
  }

  getStatus() {
    return this.status;
  }

  getMode() {
    return this.mode;
  }

  /** Élément vidéo brut, à brancher dans un <video> d'aperçu côté UI. */
  getStream(): MediaStream | null {
    return this.stream;
  }

  async start(): Promise<boolean> {
    if (this.isRunning) return true;

    if (typeof window === "undefined") return false;

    if (!window.isSecureContext) {
      this.fail("insecure-context", "La caméra nécessite une connexion sécurisée (HTTPS).");
      return false;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.fail("no-media-devices", "Ce navigateur ne donne pas accès à la caméra.");
      return false;
    }

    this.setStatus("requesting-camera");

    try {
      this.stream = await this.acquireStream();
    } catch (err) {
      this.handleCameraError(err);
      return false;
    }

    try {
      const video = document.createElement("video");
      video.srcObject = this.stream;
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      // Certains navigateurs ne décodent pas une vidéo hors du DOM : on la garde
      // attachée mais invisible, sans impacter la mise en page.
      video.setAttribute("aria-hidden", "true");
      Object.assign(video.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none",
        zIndex: "-1",
      } as CSSStyleDeclaration);
      document.body.appendChild(video);
      this.videoElement = video;
      await video.play();

      this.canvas = document.createElement("canvas");
      this.canvas.width = 64;
      this.canvas.height = 48;
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

      this.stream.getVideoTracks().forEach((t) => {
        t.addEventListener("ended", () => {
          if (this.isRunning) this.fail("no-camera", "Le flux caméra a été interrompu.");
        });
      });

      this.isRunning = true;
      this.resetSignals();
      this.setStatus("loading-model");

      // Le modèle se charge en tâche de fond : la boucle démarre tout de suite.
      this.initMediaPipe();

      this.visibilityHandler = () => {
        if (document.hidden) {
          this.setStatus("paused");
        } else if (this.isRunning) {
          this.resetSignals();
          this.setStatus(this.faceDetected ? "tracking" : "searching");
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);

      this.scheduleNextFrame();
      return true;
    } catch (err) {
      this.fail("unknown", err instanceof Error ? err.message : "Erreur d'initialisation caméra.");
      this.stop();
      return false;
    }
  }

  stop() {
    this.isRunning = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.vfcId !== null && this.videoElement && "cancelVideoFrameCallback" in this.videoElement) {
      (this.videoElement as any).cancelVideoFrameCallback(this.vfcId);
      this.vfcId = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }
    this.canvas = null;
    this.ctx = null;
    this.faceDetected = false;
    this.calibrating = false;
    this.callbacks.onCalibrationProgress?.(null);
    this.setStatus("idle");
    this.mode = "none";
  }

  /**
   * Calibration manuelle : l'utilisateur garde les yeux grands ouverts ~2,5 s.
   * On mémorise son EAR de référence (persisté en localStorage).
   */
  startCalibration() {
    if (!this.isRunning) return;
    this.calibrating = true;
    this.calibrationStartedAt = performance.now();
    this.calibrationSamplesL = [];
    this.calibrationSamplesR = [];
    this.callbacks.onCalibrationProgress?.(0);
  }

  cancelCalibration() {
    this.calibrating = false;
    this.callbacks.onCalibrationProgress?.(null);
  }

  resetCalibration() {
    this.leftBaseline = new OpenBaseline(0.3, 0.12, 0.48);
    this.rightBaseline = new OpenBaseline(0.3, 0.12, 0.48);
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem("colorcard_eye_calibration_v2");
    } catch {
      /* ignore */
    }
  }

  // --------------------------------------------------------------------------
  // Caméra
  // --------------------------------------------------------------------------

  private async acquireStream(): Promise<MediaStream> {
    // Une résolution plus haute améliore nettement la détection des paupières
    // quand l'enfant est à 1 m de l'écran. On dégrade si la webcam refuse.
    const attempts: MediaStreamConstraints[] = [
      {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: "user",
        },
        audio: false,
      },
      { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, audio: false },
      { video: true, audio: false },
    ];

    let lastErr: unknown = null;
    for (const constraints of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        lastErr = err;
        const name = (err as DOMException)?.name;
        // Inutile d'insister si c'est un refus de permission.
        if (name === "NotAllowedError" || name === "SecurityError") break;
      }
    }
    throw lastErr;
  }

  private handleCameraError(err: unknown) {
    const name = (err as DOMException)?.name ?? "";
    const message = (err as Error)?.message ?? "";

    if (name === "NotAllowedError" || name === "SecurityError") {
      // Dans une iframe sans allow="camera", le navigateur renvoie aussi
      // NotAllowedError : on le détecte pour proposer l'ouverture en plein écran.
      const inIframe = window.self !== window.top;
      if (inIframe || /permissions policy|feature policy/i.test(message)) {
        this.fail(
          "permissions-policy",
          "La caméra est bloquée dans cet aperçu intégré. Ouvre la page dans un onglet complet pour l'autoriser."
        );
      } else {
        this.fail("permission-denied", "Accès caméra refusé. Autorise la caméra dans la barre d'adresse du navigateur.");
      }
      return;
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      this.fail("no-camera", "Aucune caméra détectée sur cet appareil.");
      return;
    }
    if (name === "NotReadableError" || name === "AbortError") {
      this.fail("camera-busy", "La caméra est déjà utilisée par une autre application (visio, etc.).");
      return;
    }
    this.fail("unknown", message || "Impossible d'accéder à la caméra.");
  }

  // --------------------------------------------------------------------------
  // Chargement MediaPipe (résilient)
  // --------------------------------------------------------------------------

  private async initMediaPipe() {
    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

      let fileset: any = null;
      for (const base of WASM_SOURCES) {
        try {
          fileset = await FilesetResolver.forVisionTasks(base);
          break;
        } catch {
          /* source suivante */
        }
      }
      if (!fileset) throw new Error("WASM introuvable");

      const modelBuffer = await this.loadModelBuffer();

      const baseOptionsCommon = modelBuffer
        ? { modelAssetBuffer: new Uint8Array(modelBuffer) }
        : { modelAssetPath: MODEL_SOURCES[MODEL_SOURCES.length - 1] };

      const build = async (delegate: "GPU" | "CPU") =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { ...baseOptionsCommon, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          // Seuils abaissés : un enfant un peu loin ou de profil reste suivi.
          minFaceDetectionConfidence: 0.4,
          minFacePresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
        } as any);

      try {
        this.faceLandmarker = await build("GPU");
        this.mode = "mediapipe-gpu";
      } catch {
        this.faceLandmarker = await build("CPU");
        this.mode = "mediapipe-cpu";
      }

      if (!this.isRunning) {
        this.faceLandmarker?.close?.();
        this.faceLandmarker = null;
        return;
      }
      this.setStatus("searching");
    } catch (err) {
      this.mode = "optical";
      this.callbacks.onError?.(
        "model-failed",
        "Modèle de détection indisponible : mode dégradé (clignements seulement)."
      );
      this.setStatus("searching");
    }
  }

  /** Télécharge le modèle avec cache navigateur pour un démarrage instantané ensuite. */
  private async loadModelBuffer(): Promise<ArrayBuffer | null> {
    for (const url of MODEL_SOURCES) {
      try {
        if (typeof caches !== "undefined") {
          const cache = await caches.open(MODEL_CACHE);
          const hit = await cache.match(url);
          if (hit) return await hit.arrayBuffer();

          const res = await fetch(url, { cache: "force-cache" });
          if (!res.ok) continue;
          try {
            await cache.put(url, res.clone());
          } catch {
            /* quota : on continue sans cache */
          }
          return await res.arrayBuffer();
        }
        const res = await fetch(url, { cache: "force-cache" });
        if (res.ok) return await res.arrayBuffer();
      } catch {
        /* source suivante */
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Boucle de traitement
  // --------------------------------------------------------------------------

  private scheduleNextFrame() {
    if (!this.isRunning || !this.videoElement) return;

    // requestVideoFrameCallback = une passe par frame vidéo réelle (pas par
    // frame d'affichage) : ~3x moins de calcul et aucune frame traitée 2 fois.
    if ("requestVideoFrameCallback" in this.videoElement) {
      this.vfcId = (this.videoElement as any).requestVideoFrameCallback(() => this.tick());
    } else {
      this.rafId = requestAnimationFrame(() => this.tick());
    }
  }

  private tick() {
    if (!this.isRunning || !this.videoElement) return;

    const now = performance.now();

    if (document.hidden) {
      this.scheduleNextFrame();
      return;
    }

    const video = this.videoElement;
    const hasNewFrame = video.readyState >= 2 && video.currentTime !== this.lastVideoTime;

    if (hasNewFrame) {
      this.lastVideoTime = video.currentTime;
      this.trackFps(now);

      if (this.faceLandmarker) {
        this.processMediaPipe(now);
      } else if (this.mode === "optical") {
        this.processOptical(now);
      }

      this.emitMetrics(now);
    }

    this.scheduleNextFrame();
  }

  private trackFps(now: number) {
    this.frameTimes.push(now);
    while (this.frameTimes.length > 0 && now - this.frameTimes[0] > 1000) {
      this.frameTimes.shift();
    }
  }

  private get fps() {
    return this.frameTimes.length;
  }

  // --------------------------------------------------------------------------
  // Pipeline MediaPipe
  // --------------------------------------------------------------------------

  private processMediaPipe(now: number) {
    const video = this.videoElement!;
    // MediaPipe exige des timestamps strictement croissants.
    const ts = Math.max(now, this.lastMpTimestamp + 1);
    this.lastMpTimestamp = ts;

    let results: any;
    try {
      results = this.faceLandmarker.detectForVideo(video, ts);
    } catch {
      return;
    }

    const landmarks = results?.faceLandmarks?.[0];
    if (!landmarks || landmarks.length < 468) {
      this.onFaceLost(now);
      return;
    }

    this.faceDetected = true;
    this.lastFaceAt = now;
    if (this.status !== "tracking") this.setStatus("tracking");

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // --- Géométrie : EAR corrigé de l'aspect ratio ---------------------------
    const rightEar = this.computeEar(landmarks, RIGHT_EYE, vw, vh);
    const leftEar = this.computeEar(landmarks, LEFT_EYE, vw, vh);
    this.lastLeftEar = leftEar;
    this.lastRightEar = rightEar;

    // --- Blendshapes : signal de clignement direct du modèle -----------------
    let bsLeft = -1;
    let bsRight = -1;
    const categories = results?.faceBlendshapes?.[0]?.categories;
    if (categories?.length) {
      if (!this.blendshapeIndex) {
        this.blendshapeIndex = {};
        categories.forEach((c: any, i: number) => {
          this.blendshapeIndex![c.categoryName] = i;
        });
      }
      const idxL = this.blendshapeIndex["eyeBlinkLeft"];
      const idxR = this.blendshapeIndex["eyeBlinkRight"];
      if (idxL !== undefined) bsLeft = categories[idxL].score;
      if (idxR !== undefined) bsRight = categories[idxR].score;
    }

    // --- Calibration manuelle en cours ? ------------------------------------
    if (this.calibrating) {
      this.stepCalibration(now, leftEar, rightEar);
    }

    // --- Baseline adaptative (uniquement sur œil probablement ouvert) --------
    const openHintL = bsLeft >= 0 ? bsLeft < 0.25 : leftEar > this.leftBaseline.current * 0.85;
    const openHintR = bsRight >= 0 ? bsRight < 0.25 : rightEar > this.rightBaseline.current * 0.85;
    if (openHintL) this.leftBaseline.update(leftEar);
    if (openHintR) this.rightBaseline.update(rightEar);

    // --- Fusion des deux signaux en un score de fermeture 0..1 ---------------
    const rawLeft = this.fuseClosure(leftEar, this.leftBaseline.current, bsLeft);
    const rawRight = this.fuseClosure(rightEar, this.rightBaseline.current, bsRight);

    // Lissage exponentiel court : tue le bruit d'une frame isolée sans ajouter
    // de latence perceptible (~2 frames).
    const alpha = 0.55;
    this.leftClosure = this.leftClosure + (rawLeft - this.leftClosure) * alpha;
    this.rightClosure = this.rightClosure + (rawRight - this.rightClosure) * alpha;

    // --- Hystérésis : deux seuils pour éviter le clignotement d'état ---------
    this.applyHysteresis();

    this.updateGestures(now);

    // --- Visage : taille + luminosité ---------------------------------------
    this.updateFaceQuality(landmarks, vw, vh, now);

    // --- Regard --------------------------------------------------------------
    if (this.settings.gazeEnabled) {
      this.updateGaze(landmarks, categories, now);
    }
  }

  /** EAR = moyenne de 3 hauteurs / largeur, en pixels (donc aspect-correct). */
  private computeEar(
    landmarks: any[],
    eye: { outer: number; inner: number; top: number[]; bottom: number[] },
    vw: number,
    vh: number
  ): number {
    const px = (i: number) => landmarks[i].x * vw;
    const py = (i: number) => landmarks[i].y * vh;

    const width = Math.hypot(px(eye.outer) - px(eye.inner), py(eye.outer) - py(eye.inner));
    if (width <= 0.001) return 0.3;

    let sum = 0;
    let count = 0;
    for (let i = 0; i < eye.top.length; i++) {
      const t = eye.top[i];
      const b = eye.bottom[i];
      if (landmarks[t] && landmarks[b]) {
        sum += Math.hypot(px(t) - px(b), py(t) - py(b));
        count++;
      }
    }
    if (count === 0) return 0.3;
    return sum / count / width;
  }

  /**
   * Convertit EAR + blendshape en un score de fermeture normalisé 0..1.
   * Les blendshapes sont prioritaires (robustes aux lunettes/pose), l'EAR sert
   * de garde-fou et de repli.
   */
  private fuseClosure(ear: number, baseline: number, blendshape: number): number {
    const ratio = baseline > 0 ? ear / baseline : 1;
    // ratio 0.90 → ouvert (0) ; ratio 0.45 → fermé (1)
    const earClosure = clamp01((0.9 - ratio) / (0.9 - 0.45));

    if (blendshape < 0) return earClosure;

    // Le blendshape est souvent « paresseux » entre 0.3 et 0.6 : on le recadre.
    const bsClosure = clamp01((blendshape - 0.18) / (0.62 - 0.18));
    return clamp01(0.62 * bsClosure + 0.38 * earClosure);
  }

  /** Seuils dérivés de la sensibilité utilisateur. */
  private thresholds() {
    const s = clamp01(this.settings.sensitivity);
    const closeEnter = lerp(0.74, 0.46, s);
    return {
      closeEnter,
      openExit: closeEnter - 0.16,
      winkHoldMs: lerp(340, 150, s),
      minWinkMs: lerp(200, 110, s),
      maxWinkMs: 1500,
      minBlinkMs: 50,
      maxBlinkMs: 520,
      doubleBlinkWindowMs: lerp(520, 850, s),
      longCloseMs: 1400,
      otherEyeMaxClosure: lerp(0.24, 0.42, s),
      minAsymmetry: lerp(0.46, 0.26, s),
      actionCooldownMs: 650,
    };
  }

  // --------------------------------------------------------------------------
  // Machine à états des gestes
  // --------------------------------------------------------------------------

  /**
   * Double seuil : il faut dépasser `closeEnter` pour passer « fermé », et
   * repasser sous `openExit` pour revenir « ouvert ». Un signal qui oscille
   * autour du seuil ne produit donc plus de rafale d'événements.
   */
  private applyHysteresis() {
    const { closeEnter, openExit } = this.thresholds();

    if (!this.leftIsClosed && this.leftClosure > closeEnter) this.leftIsClosed = true;
    else if (this.leftIsClosed && this.leftClosure < openExit) this.leftIsClosed = false;

    if (!this.rightIsClosed && this.rightClosure > closeEnter) this.rightIsClosed = true;
    else if (this.rightIsClosed && this.rightClosure < openExit) this.rightIsClosed = false;
  }

  private updateGestures(now: number) {
    const T = this.thresholds();
    const l = this.leftIsClosed;
    const r = this.rightIsClosed;

    // ---- Épisode « les deux yeux fermés » ----------------------------------
    if (l && r) {
      if (!this.bothEpisode) {
        this.bothEpisode = {
          eye: "both",
          startedAt: now,
          peakClosure: 0,
          otherEyePeakClosure: 0,
          contaminated: false,
          fired: false,
        };
        this.longClosedFired = false;
      }
      this.bothEpisode.peakClosure = Math.max(
        this.bothEpisode.peakClosure,
        Math.min(this.leftClosure, this.rightClosure)
      );

      // Un clignement en cours invalide tout clin d'œil candidat.
      if (this.leftEpisode) this.leftEpisode.contaminated = true;
      if (this.rightEpisode) this.rightEpisode.contaminated = true;

      const heldMs = now - this.bothEpisode.startedAt;
      if (
        this.settings.longCloseEnabled &&
        !this.longClosedFired &&
        heldMs > T.longCloseMs &&
        this.canFire(now, 1200)
      ) {
        this.longClosedFired = true;
        this.fire(now, () => this.callbacks.onLongEyesClosed?.());
      }
    } else if (this.bothEpisode) {
      // Réouverture : clignement valide ?
      const duration = now - this.bothEpisode.startedAt;
      const wasBlink = duration >= T.minBlinkMs && duration <= T.maxBlinkMs && !this.longClosedFired;
      this.bothEpisode = null;
      this.longClosedFired = false;

      if (wasBlink && this.settings.doubleBlinkEnabled) {
        if (now - this.lastBlinkAt <= T.doubleBlinkWindowMs) {
          this.blinkStreak++;
        } else {
          this.blinkStreak = 1;
        }
        this.lastBlinkAt = now;

        if (this.blinkStreak >= 2 && this.canFire(now, T.actionCooldownMs)) {
          this.blinkStreak = 0;
          this.fire(now, () => this.callbacks.onDoubleBlink?.());
        }
      }
    }

    // Le compteur de double clignement expire tout seul.
    if (this.blinkStreak > 0 && now - this.lastBlinkAt > T.doubleBlinkWindowMs) {
      this.blinkStreak = 0;
    }

    // ---- Épisodes « un seul œil fermé » (clins d'œil) ----------------------
    this.trackWinkEye("left", l, r, this.leftClosure, this.rightClosure, now, T);
    this.trackWinkEye("right", r, l, this.rightClosure, this.leftClosure, now, T);
  }

  private trackWinkEye(
    eye: "left" | "right",
    isClosed: boolean,
    otherClosed: boolean,
    closure: number,
    otherClosure: number,
    now: number,
    T: ReturnType<EyeGestureEngine["thresholds"]>
  ) {
    const key = eye === "left" ? "leftEpisode" : "rightEpisode";
    let episode = this[key];

    if (isClosed) {
      if (!episode) {
        episode = {
          eye,
          startedAt: now,
          peakClosure: closure,
          otherEyePeakClosure: otherClosure,
          contaminated: otherClosed,
          fired: false,
        };
        this[key] = episode;
      }
      episode.peakClosure = Math.max(episode.peakClosure, closure);
      episode.otherEyePeakClosure = Math.max(episode.otherEyePeakClosure, otherClosure);

      if (otherClosed || otherClosure > T.otherEyeMaxClosure) {
        episode.contaminated = true;
      }

      const held = now - episode.startedAt;
      const asymmetry = closure - otherClosure;

      // Déclenchement « maintenu » : réactif pour un vrai clin d'œil volontaire,
      // après la fenêtre de grâce qui laisse le temps à l'autre œil de suivre
      // si c'est en fait un clignement.
      if (
        this.settings.winkEnabled &&
        !episode.fired &&
        !episode.contaminated &&
        held >= T.winkHoldMs &&
        asymmetry >= T.minAsymmetry &&
        this.canFire(now, T.actionCooldownMs)
      ) {
        episode.fired = true;
        this.fireWink(eye, now);
      }
      return;
    }

    if (!episode) return;

    // Relâchement : clin d'œil bref non encore déclenché ?
    const duration = now - episode.startedAt;
    const asymmetry = episode.peakClosure - episode.otherEyePeakClosure;

    if (
      this.settings.winkEnabled &&
      !episode.fired &&
      !episode.contaminated &&
      duration >= T.minWinkMs &&
      duration <= T.maxWinkMs &&
      asymmetry >= T.minAsymmetry &&
      this.canFire(now, T.actionCooldownMs)
    ) {
      this.fireWink(eye, now);
    }

    this[key] = null;
  }

  private fireWink(eye: "left" | "right", now: number) {
    const swapped = this.settings.swapWinkSides ? (eye === "left" ? "right" : "left") : eye;
    this.fire(now, () => {
      if (swapped === "left") this.callbacks.onLeftWink?.();
      else this.callbacks.onRightWink?.();
    });
  }

  private canFire(now: number, cooldown: number) {
    return now - this.lastActionAt > cooldown;
  }

  private fire(now: number, action: () => void) {
    this.lastActionAt = now;
    action();
  }

  // --------------------------------------------------------------------------
  // Qualité de suivi & regard
  // --------------------------------------------------------------------------

  private updateFaceQuality(landmarks: any[], vw: number, vh: number, now: number) {
    const left = landmarks[234];
    const right = landmarks[454];
    if (left && right) {
      this.faceSize = Math.abs(right.x - left.x);
    }

    // Luminosité échantillonnée 4x/s seulement (coût GPU→CPU du readback).
    if (this.ctx && this.canvas && this.videoElement && now - this.lastMetricsAt > 240) {
      try {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.drawImage(this.videoElement, 0, 0, w, h);
        const data = this.ctx.getImageData(0, 0, w, h).data;
        let sum = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 16) {
          sum += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
          n++;
        }
        this.brightness = n > 0 ? sum / n / 255 : 0.5;
      } catch {
        /* ignore */
      }
    }
  }

  private updateGaze(landmarks: any[], categories: any[] | undefined, now: number) {
    // 1. Position de la tête (signal dominant : « le totem me suit »).
    const noseTip = landmarks[1] ?? landmarks[4];
    const forehead = landmarks[10];
    const chin = landmarks[152];
    if (!noseTip) return;

    const cx = forehead && chin ? (noseTip.x * 2 + forehead.x + chin.x) / 4 : noseTip.x;
    const cy = forehead && chin ? (noseTip.y * 2 + forehead.y + chin.y) / 4 : noseTip.y;

    // Miroir horizontal (reflet naturel type miroir).
    const mx = 1 - cx;
    const my = cy;

    // 2. Micro-regard via blendshapes iris (l'enfant bouge les yeux sans bouger
    //    la tête → le totem le suit quand même).
    let gazeH = 0;
    let gazeV = 0;
    if (categories?.length && this.blendshapeIndex) {
      const get = (name: string) => {
        const i = this.blendshapeIndex![name];
        return i === undefined ? 0 : categories[i].score;
      };
      const lookRight = (get("eyeLookOutRight") + get("eyeLookInLeft")) / 2;
      const lookLeft = (get("eyeLookOutLeft") + get("eyeLookInRight")) / 2;
      const lookUp = (get("eyeLookUpLeft") + get("eyeLookUpRight")) / 2;
      const lookDown = (get("eyeLookDownLeft") + get("eyeLookDownRight")) / 2;
      gazeH = clamp(lookRight - lookLeft, -1, 1);
      gazeV = clamp(lookDown - lookUp, -1, 1);
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const gain = 1.45 * clamp(this.settings.gazeStrength, 0, 3);

    const targetX = w * (0.5 + (mx - 0.5) * gain) + gazeH * w * 0.22 * this.settings.gazeStrength;
    const targetY = h * (0.5 + (my - 0.5) * gain * 1.15) + gazeV * h * 0.16 * this.settings.gazeStrength;

    const smoothX = this.gazeFilterX.filter(targetX, now);
    const smoothY = this.gazeFilterY.filter(targetY, now);

    this.callbacks.onGazeMove?.({
      x: clamp(smoothX, -w * 0.5, w * 1.5),
      y: clamp(smoothY, -h * 0.5, h * 1.5),
    });
  }

  private onFaceLost(now: number) {
    // Tolérance de 400 ms : une frame ratée ne doit pas casser l'état.
    if (now - this.lastFaceAt < 400) return;

    if (this.faceDetected) {
      this.faceDetected = false;
      this.resetSignals();
    }
    if (this.status === "tracking") this.setStatus("searching");
  }

  // --------------------------------------------------------------------------
  // Calibration
  // --------------------------------------------------------------------------

  private stepCalibration(now: number, leftEar: number, rightEar: number) {
    const DURATION = 2500;
    const elapsed = now - this.calibrationStartedAt;
    this.calibrationSamplesL.push(leftEar);
    this.calibrationSamplesR.push(rightEar);
    this.callbacks.onCalibrationProgress?.(clamp01(elapsed / DURATION));

    if (elapsed < DURATION) return;

    this.calibrating = false;
    const median = (arr: number[]) => {
      if (!arr.length) return 0.3;
      const s = [...arr].sort((a, b) => a - b);
      // 70e centile : on vise l'œil bien ouvert, pas les clignements parasites.
      return s[Math.min(s.length - 1, Math.floor(s.length * 0.7))];
    };
    const l = median(this.calibrationSamplesL);
    const r = median(this.calibrationSamplesR);
    this.leftBaseline.set(l);
    this.rightBaseline.set(r);
    this.persistCalibration(l, r);
    this.callbacks.onCalibrationProgress?.(null);
  }

  private persistCalibration(left: number, right: number) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem("colorcard_eye_calibration_v2", JSON.stringify({ left, right }));
    } catch {
      /* ignore */
    }
  }

  private restoreCalibration() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem("colorcard_eye_calibration_v2");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.left === "number") this.leftBaseline.set(parsed.left);
      if (typeof parsed?.right === "number") this.rightBaseline.set(parsed.right);
    } catch {
      /* ignore */
    }
  }

  // --------------------------------------------------------------------------
  // Repli optique (si le modèle ne charge pas du tout)
  // --------------------------------------------------------------------------

  private opticalBaseline = -1;

  private processOptical(now: number) {
    if (!this.ctx || !this.canvas || !this.videoElement) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.drawImage(this.videoElement, 0, 0, w, h);
    const data = this.ctx.getImageData(0, 0, w, h).data;

    // Bande des yeux, luminance moyenne normalisée par la luminance globale :
    // insensible à l'éclairage ambiant, contrairement à la v1 (seuil absolu).
    let eyeSum = 0;
    let eyeN = 0;
    let allSum = 0;
    let allN = 0;
    const y0 = Math.floor(h * 0.3);
    const y1 = Math.floor(h * 0.55);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const lum = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
        allSum += lum;
        allN++;
        if (y >= y0 && y < y1 && x > w * 0.25 && x < w * 0.75) {
          eyeSum += lum;
          eyeN++;
        }
      }
    }

    const global = allN > 0 ? allSum / allN : 1;
    this.brightness = global / 255;
    const ratio = eyeN > 0 && global > 1 ? eyeSum / eyeN / global : 1;

    if (this.opticalBaseline < 0) this.opticalBaseline = ratio;
    this.opticalBaseline += (ratio - this.opticalBaseline) * 0.01;

    // Yeux fermés → moins de contraste sombre (pupilles/cils) → ratio remonte.
    const closure = clamp01((ratio - this.opticalBaseline) / 0.06);
    this.leftClosure = closure;
    this.rightClosure = closure;

    const { closeEnter, openExit } = this.thresholds();
    const closed = this.leftIsClosed ? closure > openExit : closure > closeEnter;
    this.leftIsClosed = closed;
    this.rightIsClosed = closed;
    this.faceDetected = true;

    // En mode dégradé : clignements seulement, jamais de clins d'œil.
    const savedWink = this.settings.winkEnabled;
    this.settings.winkEnabled = false;
    this.updateGestures(now);
    this.settings.winkEnabled = savedWink;
  }

  // --------------------------------------------------------------------------
  // Sorties
  // --------------------------------------------------------------------------

  private resetSignals() {
    this.leftClosure = 0;
    this.rightClosure = 0;
    this.leftIsClosed = false;
    this.rightIsClosed = false;
    this.leftEpisode = null;
    this.rightEpisode = null;
    this.bothEpisode = null;
    this.longClosedFired = false;
    this.blinkStreak = 0;
    this.gazeFilterX.reset();
    this.gazeFilterY.reset();
  }

  private computeQuality(): TrackingQuality {
    if (this.mode === "none") return "starting";
    if (!this.faceDetected) return "no-face";
    if (this.brightness < 0.16) return "dark";
    if (this.mode.startsWith("mediapipe") && this.faceSize > 0 && this.faceSize < 0.14) return "too-far";
    return "good";
  }

  private emitMetrics(now: number) {
    // ~12 Hz : suffisant pour l'UI, sans noyer React de re-rendus.
    if (now - this.lastMetricsAt < 80) return;
    this.lastMetricsAt = now;

    this.callbacks.onMetrics?.({
      faceDetected: this.faceDetected,
      leftClosure: this.leftClosure,
      rightClosure: this.rightClosure,
      leftOpen: !this.leftIsClosed,
      rightOpen: !this.rightIsClosed,
      leftEar: this.lastLeftEar,
      rightEar: this.lastRightEar,
      closeThreshold: this.thresholds().closeEnter,
      fps: this.fps,
      brightness: this.brightness,
      faceSize: this.faceSize,
      quality: this.computeQuality(),
      mode: this.mode,
      usingBlendshapes: this.blendshapeIndex !== null,
      calibrated: this.leftBaseline.ready && this.rightBaseline.ready,
    });
  }

  private setStatus(status: EngineStatus) {
    if (this.status === status) return;
    this.status = status;
    this.callbacks.onStatusChange?.(status, this.mode);
  }

  private fail(code: EngineErrorCode, message: string) {
    this.setStatus("error");
    this.callbacks.onError?.(code, message);
  }
}

export default EyeGestureEngine;
