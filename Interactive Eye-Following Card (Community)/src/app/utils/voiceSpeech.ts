// Montessori Totem Voice Engine for Children
// Provides instant, warm, soothing French speech for daily rituals

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakTotemMessage(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[«»"“”]/g, "")
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "fr-FR";
  utterance.rate = 0.92; // Calm, measured pacing for children
  utterance.pitch = 1.05; // Warm, gentle tone

  // Find best French voice if available
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(
    (v) => v.lang.startsWith("fr") && (v.name.includes("Audrey") || v.name.includes("Thomas") || v.name.includes("Virginie") || v.name.includes("Amelie") || v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("French"))
  ) || voices.find((v) => v.lang.startsWith("fr"));

  if (frVoice) {
    utterance.voice = frVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopTotemSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
