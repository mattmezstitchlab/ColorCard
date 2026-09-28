// Web Audio API Synesthetic Sound Engine for ColorCard Studio

let audioCtx: AudioContext | null = null;
let isAudioMuted = true; // muted by default for respect of user environment

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAudioMute(muted?: boolean): boolean {
  if (muted !== undefined) {
    isAudioMuted = muted;
  } else {
    isAudioMuted = !isAudioMuted;
  }
  if (!isAudioMuted) {
    getAudioContext();
  }
  return isAudioMuted;
}

export function getAudioMuted(): boolean {
  return isAudioMuted;
}

// Convert hex color to frequency in Hz (calm musical pentatonic / harmonic frequencies)
function colorToFrequency(hexColor: string): number {
  const clean = hexColor.replace("#", "");
  const num = parseInt(clean.slice(0, 6), 16) || 0;
  // Map to pleasing musical range [220Hz (A3) - 659Hz (E5)] in Pentatonic scale
  const pentatonicScale = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37, 659.25];
  const index = num % pentatonicScale.length;
  return pentatonicScale[index];
}

// Play soft tactile micro-chime on interaction
export function playCardTone(hexColor: string, type: "hover" | "change" | "step" | "time" = "change") {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = colorToFrequency(hexColor);
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (type === "hover") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.12);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === "step") {
    // Harmonic triad chord for step progression
    [1, 1.25, 1.5].forEach((ratio) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(baseFreq * ratio, now);
      g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.35);
    });
  } else if (type === "time") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * 0.75, now);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } else {
    // Subtle parameter touch
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }
}
