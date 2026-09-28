// Eye Gesture & Face Tracking Engine for Montessori Living Totem
// Detects: Right Wink, Left Wink, Double Blink, Long Sleep Eyes Closed, and Real-Time Face Gaze Tracking.

export interface EyeGestureCallbacks {
  onRightWink?: () => void;
  onLeftWink?: () => void;
  onDoubleBlink?: () => void;
  onLongEyesClosed?: () => void;
  onGazeMove?: (point: { x: number; y: number }) => void;
  onEyeStateChange?: (state: { leftOpen: boolean; rightOpen: boolean; leftEar: number; rightEar: number }) => void;
}

export class EyeGestureEngine {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private callbacks: EyeGestureCallbacks = {};
  private isRunning: boolean = false;

  // Gesture state tracking
  private lastLeftOpen: boolean = true;
  private lastRightOpen: boolean = true;
  private leftClosedStartTime: number = 0;
  private rightClosedStartTime: number = 0;
  private bothClosedStartTime: number = 0;
  private lastBlinkTime: number = 0;
  private blinkCount: number = 0;
  private lastWinkActionTime: number = 0;

  // MediaPipe FaceLandmarker instance (lazy loaded)
  private faceLandmarker: any = null;
  private isMediaPipeReady: boolean = false;

  constructor(callbacks: EyeGestureCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: EyeGestureCallbacks) {
    this.callbacks = callbacks;
  }

  public async start(): Promise<boolean> {
    if (this.isRunning) return true;

    try {
      // 1. Get webcam stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      // 2. Setup hidden video element
      this.videoElement = document.createElement("video");
      this.videoElement.srcObject = this.stream;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      await this.videoElement.play();

      // 3. Setup canvas for image processing
      this.canvasElement = document.createElement("canvas");
      this.canvasElement.width = 160;
      this.canvasElement.height = 120;
      this.ctx = this.canvasElement.getContext("2d", { willReadFrequently: true });

      this.isRunning = true;

      // 4. Try loading MediaPipe FaceLandmarker in background
      this.initMediaPipe().catch(() => {
        // Fallback to pure optical analysis if MediaPipe fails
      });

      // 5. Start processing loop
      this.processFrame();

      return true;
    } catch (err) {
      console.warn("Camera access declined or unavailable:", err);
      this.stop();
      return false;
    }
  }

  private async initMediaPipe() {
    try {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });
      this.isMediaPipeReady = true;
    } catch (e) {
      // Fallback works seamlessly
      this.isMediaPipeReady = false;
    }
  }

  private processFrame = () => {
    if (!this.isRunning || !this.videoElement || !this.ctx || !this.canvasElement) {
      return;
    }

    const now = performance.now();

    if (this.videoElement.readyState >= 2) {
      if (this.isMediaPipeReady && this.faceLandmarker) {
        this.processMediaPipe(now);
      } else {
        this.processOptical(now);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.processFrame);
  };

  // 1. High-precision MediaPipe Face Landmarks Detection
  private processMediaPipe(now: number) {
    if (!this.videoElement || !this.faceLandmarker) return;

    try {
      const results = this.faceLandmarker.detectForVideo(this.videoElement, now);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        // Nose tip for head gaze tracking (landmark 1)
        const nose = landmarks[1];
        if (nose) {
          // Mirror horizontal coordinate for natural webcam reflection
          const screenX = (1 - nose.x) * window.innerWidth;
          const screenY = nose.y * window.innerHeight;
          this.callbacks.onGazeMove?.({ x: screenX, y: screenY });
        }

        // Calculate Eye Aspect Ratio (EAR) for Left and Right Eye
        // Left Eye: 159 (top), 145 (bottom), 33 (outer), 133 (inner)
        const leftH = Math.hypot(landmarks[159].x - landmarks[145].x, landmarks[159].y - landmarks[145].y);
        const leftW = Math.hypot(landmarks[33].x - landmarks[133].x, landmarks[33].y - landmarks[133].y);
        const leftEAR = leftW > 0 ? leftH / leftW : 0.3;

        // Right Eye: 386 (top), 374 (bottom), 362 (inner), 263 (outer)
        const rightH = Math.hypot(landmarks[386].x - landmarks[374].x, landmarks[386].y - landmarks[374].y);
        const rightW = Math.hypot(landmarks[263].x - landmarks[362].x, landmarks[263].y - landmarks[362].y);
        const rightEAR = rightW > 0 ? rightH / rightW : 0.3;

        // User's Left eye is on the right side of mirrored camera (landmarks[159])
        const leftOpen = leftEAR > 0.17;
        const rightOpen = rightEAR > 0.17;

        this.callbacks.onEyeStateChange?.({ leftOpen, rightOpen, leftEar: leftEAR, rightEar: rightEAR });
        this.analyzeGestures(leftOpen, rightOpen, now);
      }
    } catch {
      // fallback
    }
  }

  // 2. Ultra-Fast In-Browser Canvas Optical Blink Fallback
  private processOptical(now: number) {
    if (!this.videoElement || !this.ctx || !this.canvasElement) return;

    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    // Draw downscaled frame
    this.ctx.drawImage(this.videoElement, 0, 0, w, h);
    const frame = this.ctx.getImageData(0, 0, w, h);
    const data = frame.data;

    // Sample Left Eye Region (top-left mirrored) & Right Eye Region (top-right mirrored)
    let leftDarkness = 0;
    let rightDarkness = 0;
    let leftSamples = 0;
    let rightSamples = 0;

    const eyeYStart = Math.floor(h * 0.3);
    const eyeYEnd = Math.floor(h * 0.55);

    // Left eye box
    const leftXStart = Math.floor(w * 0.22);
    const leftXEnd = Math.floor(w * 0.44);

    // Right eye box
    const rightXStart = Math.floor(w * 0.56);
    const rightXEnd = Math.floor(w * 0.78);

    for (let y = eyeYStart; y < eyeYEnd; y += 2) {
      for (let x = leftXStart; x < leftXEnd; x += 2) {
        const idx = (y * w + x) * 4;
        const lum = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
        leftDarkness += lum;
        leftSamples++;
      }
      for (let x = rightXStart; x < rightXEnd; x += 2) {
        const idx = (y * w + x) * 4;
        const lum = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
        rightDarkness += lum;
        rightSamples++;
      }
    }

    const leftAvg = leftSamples > 0 ? leftDarkness / leftSamples : 120;
    const rightAvg = rightSamples > 0 ? rightDarkness / rightSamples : 120;

    // Relative variation
    const leftOpen = leftAvg < 145;
    const rightOpen = rightAvg < 145;

    this.analyzeGestures(leftOpen, rightOpen, now);
  }

  // 3. Gesture State Machine (Winks, Double Blink, Sleep)
  private analyzeGestures(leftOpen: boolean, rightOpen: boolean, now: number) {
    const cooldown = 650; // ms between consecutive wink actions

    // Case A: User's Right Eye Closed (Mirrored camera = Right side of screen = rightOpen is false)
    if (!rightOpen && leftOpen) {
      if (this.lastRightOpen) {
        this.rightClosedStartTime = now;
      }
      const duration = now - this.rightClosedStartTime;
      if (duration > 120 && duration < 800 && now - this.lastWinkActionTime > cooldown) {
        this.lastWinkActionTime = now;
        this.callbacks.onRightWink?.();
      }
    }

    // Case B: User's Left Eye Closed (Mirrored camera = Left side of screen = leftOpen is false)
    else if (!leftOpen && rightOpen) {
      if (this.lastLeftOpen) {
        this.leftClosedStartTime = now;
      }
      const duration = now - this.lastLeftOpen ? now - this.leftClosedStartTime : 0;
      if (duration > 120 && duration < 800 && now - this.lastWinkActionTime > cooldown) {
        this.lastWinkActionTime = now;
        this.callbacks.onLeftWink?.();
      }
    }

    // Case C: Both Eyes Closed
    else if (!leftOpen && !rightOpen) {
      if (this.lastLeftOpen && this.lastRightOpen) {
        this.bothClosedStartTime = now;
      }
      const closedDuration = now - this.bothClosedStartTime;

      // Long sleep detection: closed > 1500ms
      if (closedDuration > 1500 && now - this.lastWinkActionTime > 2000) {
        this.lastWinkActionTime = now;
        this.callbacks.onLongEyesClosed?.();
      }
    }

    // Case D: Both Eyes Reopened after a brief closure (Blink detected)
    else if (leftOpen && rightOpen && (!this.lastLeftOpen && !this.lastRightOpen)) {
      const closedDuration = now - this.bothClosedStartTime;
      if (closedDuration > 80 && closedDuration < 450) {
        // Blink occurred
        if (now - this.lastBlinkTime < 600) {
          this.blinkCount++;
          if (this.blinkCount >= 2 && now - this.lastWinkActionTime > cooldown) {
            this.lastWinkActionTime = now;
            this.blinkCount = 0;
            this.callbacks.onDoubleBlink?.();
          }
        } else {
          this.blinkCount = 1;
        }
        this.lastBlinkTime = now;
      }
    }

    this.lastLeftOpen = leftOpen;
    this.lastRightOpen = rightOpen;
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.videoElement = null;
    this.canvasElement = null;
    this.ctx = null;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}
