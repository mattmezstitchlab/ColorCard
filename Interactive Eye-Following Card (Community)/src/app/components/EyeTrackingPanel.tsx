import React, { useEffect, useRef } from "react";
import type {
  EngineErrorCode,
  EngineStatus,
  EyeGestureSettings,
  EyeMetrics,
} from "../utils/eyeGestureEngine";

export interface EyeTrackingPanelProps {
  open: boolean;
  onClose: () => void;
  stream: MediaStream | null;
  status: EngineStatus;
  metrics: EyeMetrics | null;
  error: { code: EngineErrorCode; message: string } | null;
  settings: EyeGestureSettings;
  onSettingsChange: (partial: Partial<EyeGestureSettings>) => void;
  onCalibrate: () => void;
  calibrationProgress: number | null;
}

const STATUS_LABEL: Record<EngineStatus, { text: string; tone: string }> = {
  idle: { text: "Caméra éteinte", tone: "bg-neutral-600" },
  "requesting-camera": { text: "Autorisation caméra…", tone: "bg-amber-500" },
  "loading-model": { text: "Chargement du modèle…", tone: "bg-amber-500" },
  searching: { text: "Recherche du visage…", tone: "bg-amber-500" },
  tracking: { text: "Visage suivi", tone: "bg-emerald-500" },
  paused: { text: "En pause (onglet masqué)", tone: "bg-neutral-500" },
  error: { text: "Erreur", tone: "bg-rose-500" },
};

const QUALITY_HINT: Record<string, string> = {
  good: "Conditions idéales, les clins d'œil sont fiables.",
  dark: "Il fait trop sombre : rapproche une lampe ou allume la lumière.",
  "too-far": "Tu es trop loin : rapproche-toi à environ 50–70 cm de l'écran.",
  "no-face": "Aucun visage détecté : centre-toi bien face à la caméra.",
  starting: "Initialisation en cours…",
};

const MODE_LABEL: Record<string, string> = {
  none: "démarrage",
  "mediapipe-gpu": "précis (GPU)",
  "mediapipe-cpu": "précis (CPU)",
  optical: "dégradé",
};

/** Barre de fermeture d'un œil, avec repère de seuil de déclenchement. */
function ClosureBar({
  label,
  value,
  threshold,
  closed,
}: {
  label: string;
  value: number;
  threshold: number;
  closed: boolean;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[8.5px] font-black uppercase tracking-wider text-white/60">
        {label}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-75 ${
            closed ? "bg-rose-400" : "bg-emerald-400"
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-[2px] bg-white/80"
          style={{ left: `${Math.round(threshold * 100)}%` }}
          title="Seuil de déclenchement"
        />
      </div>
      <span
        className={`w-9 shrink-0 text-right font-mono text-[9px] ${
          closed ? "text-rose-300" : "text-emerald-300"
        }`}
      >
        {closed ? "fermé" : "ouvert"}
      </span>
    </div>
  );
}

export function EyeTrackingPanel({
  open,
  onClose,
  stream,
  status,
  metrics,
  error,
  settings,
  onSettingsChange,
  onCalibrate,
  calibrationProgress,
}: EyeTrackingPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {
        /* autoplay bloqué : sans conséquence, l'aperçu reste noir */
      });
    } else if (!stream) {
      el.srcObject = null;
    }
  }, [stream, open]);

  if (!open) return null;

  const statusInfo = STATUS_LABEL[status];
  const quality = metrics?.quality ?? "starting";
  const isDegraded = metrics?.mode === "optical";

  return (
    <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto mt-3 rounded-2xl border border-white/15 bg-[#0B0B12] p-3.5 shadow-2xl">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${statusInfo.tone} ${status === "tracking" ? "animate-pulse" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-wider text-white">
            {statusInfo.text}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-white/50 transition-colors hover:text-white"
          title="Fermer le panneau"
        >
          ✕
        </button>
      </div>

      {/* Erreur caméra (bloquante) ou modèle indisponible (dégradé) */}
      {error &&
        (error.code === "model-failed" ? (
          <div className="mt-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[9.5px] leading-relaxed text-amber-200">
            <div className="font-black uppercase tracking-wider text-amber-300">Mode dégradé</div>
            <p className="mt-1">{error.message}</p>
          </div>
        ) : (
          <div className="mt-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-[9.5px] leading-relaxed text-rose-200">
            <div className="font-black uppercase tracking-wider text-rose-300">Problème caméra</div>
            <p className="mt-1">{error.message}</p>
            {error.code === "permissions-policy" && (
              <a
                href={typeof window !== "undefined" ? window.location.href : "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block font-mono underline hover:text-white"
              >
                → Ouvrir dans un onglet complet
              </a>
            )}
          </div>
        ))}

      <div className="mt-3 flex gap-3">
        {/* Aperçu caméra (miroir) */}
        <div className="relative size-[96px] shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className="size-full scale-x-[-1] object-cover"
          />
          {metrics && !metrics.faceDetected && status !== "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-[8px] font-bold uppercase leading-tight text-amber-300">
              Aucun
              <br />
              visage
            </div>
          )}
          {metrics?.faceDetected && (
            <div className="absolute bottom-1 left-1 rounded bg-emerald-500/90 px-1 py-[1px] text-[7px] font-black uppercase text-black">
              suivi
            </div>
          )}
          {calibrationProgress !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-1 text-center">
              <span className="text-[8px] font-black uppercase leading-tight text-white">
                Garde les yeux
                <br />
                ouverts
              </span>
              <div className="mt-1.5 h-1 w-14 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-emerald-400 transition-[width]"
                  style={{ width: `${Math.round(calibrationProgress * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Signaux temps réel */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <ClosureBar
            label="Œil G."
            value={metrics?.leftClosure ?? 0}
            threshold={metrics?.closeThreshold ?? 0.6}
            closed={metrics ? !metrics.leftOpen : false}
          />
          <ClosureBar
            label="Œil D."
            value={metrics?.rightClosure ?? 0}
            threshold={metrics?.closeThreshold ?? 0.6}
            closed={metrics ? !metrics.rightOpen : false}
          />
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[8px] text-white/40">
            <span>{metrics?.fps ?? 0} fps</span>
            <span>·</span>
            <span>{MODE_LABEL[metrics?.mode ?? "none"]}</span>
            {metrics?.usingBlendshapes && (
              <>
                <span>·</span>
                <span className="text-emerald-400/70">blendshapes</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conseil qualité */}
      <div
        className={`mt-2.5 rounded-lg px-2.5 py-1.5 text-[9px] leading-relaxed ${
          quality === "good"
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-amber-500/10 text-amber-300"
        }`}
      >
        {QUALITY_HINT[quality] ?? QUALITY_HINT.starting}
        {isDegraded && " · Modèle indisponible : clins d'œil désactivés."}
      </div>

      {/* Sensibilité */}
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-black uppercase tracking-wider text-white/70">
            Sensibilité
          </label>
          <span className="font-mono text-[9px] text-white/50">
            {Math.round(settings.sensitivity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.sensitivity * 100)}
          onChange={(e) => onSettingsChange({ sensitivity: Number(e.target.value) / 100 })}
          className="mt-1 w-full accent-emerald-400"
        />
        <div className="flex justify-between font-mono text-[7.5px] text-white/35">
          <span>Strict · zéro faux positif</span>
          <span>Réactif</span>
        </div>
      </div>

      {/* Amplitude du regard */}
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-black uppercase tracking-wider text-white/70">
            Amplitude du regard
          </label>
          <span className="font-mono text-[9px] text-white/50">
            {settings.gazeStrength.toFixed(1)}×
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={Math.round(settings.gazeStrength * 100)}
          onChange={(e) => onSettingsChange({ gazeStrength: Number(e.target.value) / 100 })}
          className="mt-1 w-full accent-sky-400"
        />
      </div>

      {/* Bascules */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { key: "winkEnabled" as const, label: "Clins d'œil" },
          { key: "doubleBlinkEnabled" as const, label: "Double clign." },
          { key: "longCloseEnabled" as const, label: "Yeux fermés" },
          { key: "gazeEnabled" as const, label: "Suivi regard" },
          { key: "swapWinkSides" as const, label: "Inverser G/D" },
        ].map((toggle) => {
          const active = settings[toggle.key];
          return (
            <button
              key={toggle.key}
              type="button"
              onClick={() => onSettingsChange({ [toggle.key]: !active } as Partial<EyeGestureSettings>)}
              className={`rounded-lg border px-2 py-1.5 text-[8.5px] font-black uppercase tracking-wider transition-colors ${
                active
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {toggle.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCalibrate}
          disabled={calibrationProgress !== null || status !== "tracking"}
          className="rounded-lg border border-sky-400/60 bg-sky-400/15 px-2 py-1.5 text-[8.5px] font-black uppercase tracking-wider text-sky-200 transition-colors hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-35"
          title="Mémorise l'ouverture naturelle de tes yeux pour fiabiliser la détection"
        >
          {calibrationProgress !== null ? "Calibration…" : "Calibrer"}
        </button>
      </div>

      <p className="mt-2.5 border-t border-white/10 pt-2 text-center font-mono text-[7.5px] leading-relaxed text-white/30">
        100 % calculé en local · aucune image ne quitte l'appareil
      </p>
    </div>
  );
}

export default EyeTrackingPanel;
