import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  Camera,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  EyeCard,
  ChildRitualMilestone,
} from "./components/EyeCard";
import {
  StudioLogoIcon,
} from "./components/ModernIcons";
import { playCardTone, toggleAudioMute, getAudioMuted } from "./utils/audioSynth";
import { EyeGestureEngine } from "./utils/eyeGestureEngine";

// Curated Montessori Rhythms Presets
export const PRESETS_DATA: Record<string, { title: string; subtitle: string; milestones: ChildRitualMilestone[] }> = {
  ecole: {
    title: "JOUR D'ÉCOLE & RITUELS",
    subtitle: "Jour d'école",
    milestones: [
      { id: "e-1", name: "Réveil Doux & Habillage", color: "#FEF08A", timeSlot: "07:00 — 08:00" },
      { id: "e-2", name: "Petit-Déjeuner Solaire", color: "#F97316", timeSlot: "08:00 — 08:30" },
      { id: "e-3", name: "École & Découvertes", color: "#00A8E8", timeSlot: "08:30 — 12:00" },
      { id: "e-4", name: "Déjeuner & Récréation", color: "#22C55E", timeSlot: "12:00 — 13:30" },
      { id: "e-5", name: "Ateliers & Créativité", color: "#A855F7", timeSlot: "13:30 — 16:30" },
      { id: "e-6", name: "Goûter & Temps Libre", color: "#FDBA74", timeSlot: "16:30 — 17:30" },
      { id: "e-7", name: "Concentration Montessori", color: "#006494", timeSlot: "17:30 — 18:30" },
      { id: "e-8", name: "Bain & Bulles d'Eau", color: "#38BDF8", timeSlot: "18:30 — 19:30" },
      { id: "e-9", name: "Dîner en Famille", color: "#EA580C", timeSlot: "19:30 — 20:30" },
      { id: "e-10", name: "Histoire & Câlin", color: "#E9D5FF", timeSlot: "20:30 — 21:00" },
      { id: "e-11", name: "Nuit Étoilée & Sommeil", color: "#0B101E", timeSlot: "21:00 — 07:00" },
    ],
  },
  mercredi: {
    title: "MERCREDI NATURE & CRÉATION",
    subtitle: "Mercredi Libre",
    milestones: [
      { id: "m-1", name: "Réveil Paisible & Dessin", color: "#FDE047", timeSlot: "08:00 — 09:30" },
      { id: "m-2", name: "Exploration Parc & Grand Air", color: "#84CC16", timeSlot: "09:30 — 12:00" },
      { id: "m-3", name: "Cuisine Autonome & Repas", color: "#FB923C", timeSlot: "12:00 — 13:30" },
      { id: "m-4", name: "Temps Calme & Lecture", color: "#007EA7", timeSlot: "13:30 — 15:30" },
      { id: "m-5", name: "Argile & Bricolage Bois", color: "#9A3412", timeSlot: "15:30 — 17:30" },
      { id: "m-6", name: "Danse & Jeux Sans Écran", color: "#FF007F", timeSlot: "17:30 — 19:30" },
      { id: "m-7", name: "Dîner Doux & Rangement", color: "#16A34A", timeSlot: "19:30 — 20:30" },
      { id: "m-8", name: "Nuit des Constellations", color: "#1E1B4B", timeSlot: "20:30 — 08:00" },
    ],
  },
  weekend: {
    title: "WEEK-END & CABANE EN PLEIN AIR",
    subtitle: "Week-end",
    milestones: [
      { id: "w-1", name: "Matin Douceur en Pyjama", color: "#FFEDD5", timeSlot: "08:30 — 10:00" },
      { id: "w-2", name: "Cabane Secrète dans les Bois", color: "#65A30D", timeSlot: "10:00 — 13:00" },
      { id: "w-3", name: "Pique-Nique sur l'Herbe", color: "#CA8A04", timeSlot: "13:00 — 15:00" },
      { id: "w-4", name: "Jeux de Société & Rires", color: "#0EA5E9", timeSlot: "15:00 — 18:00" },
      { id: "w-5", name: "Dessin des Émotions", color: "#D8B4FE", timeSlot: "18:00 — 19:30" },
      { id: "w-6", name: "Veillée aux Bougies", color: "#EAB308", timeSlot: "19:30 — 21:00" },
      { id: "w-7", name: "Grand Sommeil Réparateur", color: "#0F172A", timeSlot: "21:00 — 08:30" },
    ],
  },
  meteo_emotions: {
    title: "MÉTÉO DU CŒUR & ÉMOTIONS",
    subtitle: "Météo du Cœur",
    milestones: [
      { id: "emo-1", name: "Joie du Matin & Sourire", color: "#FACC15", timeSlot: "08:00 — 10:00" },
      { id: "emo-2", name: "Accueillir la Grosse Colère", color: "#EF4444", timeSlot: "10:00 — 12:00" },
      { id: "emo-3", name: "Câlin Réconfortant & Sas Doux", color: "#FDF2F8", timeSlot: "12:00 — 14:00" },
      { id: "emo-4", name: "Bulle & Respiration Zen", color: "#14B8A6", timeSlot: "14:00 — 16:00" },
      { id: "emo-5", name: "Ciel Bleu & Légèreté", color: "#7DD3FC", timeSlot: "16:00 — 18:00" },
      { id: "emo-6", name: "Gratitude du Soir", color: "#C084FC", timeSlot: "18:00 — 20:00" },
      { id: "emo-7", name: "Sécurité & Doux Sommeil", color: "#00171F", timeSlot: "20:00 — 08:00" },
    ],
  },
};

export function App() {
  const [activePresetKey, setActivePresetKey] = useState(() => {
    return localStorage.getItem("colorcard_child_preset_key_v16") || "ecole";
  });

  const [eventTitle, setEventTitle] = useState(() => {
    return localStorage.getItem("colorcard_child_title_v16") || PRESETS_DATA.ecole.title;
  });

  const [milestones, setMilestones] = useState<ChildRitualMilestone[]>(() => {
    try {
      const saved = localStorage.getItem("colorcard_child_milestones_v16");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRESETS_DATA.ecole.milestones;
  });

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(() => {
    return milestones[0]?.id || "e-1";
  });

  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => getAudioMuted());
  const [isCopiedItinerary, setIsCopiedItinerary] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showGestureGuide, setShowGestureGuide] = useState(false);

  // Camera Eye Detection State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [gazePoint, setGazePoint] = useState<{ x: number; y: number } | null>(null);
  const [forceLeftBlink, setForceLeftBlink] = useState(false);
  const [forceRightBlink, setForceRightBlink] = useState(false);
  const [gestureBadge, setGestureBadge] = useState<string | null>(null);
  const gestureEngineRef = useRef<EyeGestureEngine | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("colorcard_child_milestones_v16", JSON.stringify(milestones));
      localStorage.setItem("colorcard_child_title_v16", eventTitle);
      localStorage.setItem("colorcard_child_preset_key_v16", activePresetKey);
    } catch {
      // silent
    }
  }, [milestones, eventTitle, activePresetKey]);

  // Current active ritual milestone
  const currentMilestone = useMemo(() => {
    return milestones.find((m) => m.id === activeMilestoneId) || milestones[0];
  }, [milestones, activeMilestoneId]);

  const currentIndex = useMemo(() => {
    return milestones.findIndex((m) => m.id === activeMilestoneId);
  }, [milestones, activeMilestoneId]);

  // Switch to previous or next ritual
  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + milestones.length) % milestones.length;
    setActiveMilestoneId(milestones[prevIdx].id);
    playCardTone(milestones[prevIdx].color, "hover");
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % milestones.length;
    setActiveMilestoneId(milestones[nextIdx].id);
    playCardTone(milestones[nextIdx].color, "hover");
  };

  const showGestureTrigger = (text: string) => {
    setGestureBadge(text);
    setTimeout(() => setGestureBadge(null), 1500);
  };

  // Setup Eye Gesture Engine
  useEffect(() => {
    gestureEngineRef.current = new EyeGestureEngine({
      onRightWink: () => {
        setForceRightBlink(true);
        setTimeout(() => setForceRightBlink(false), 260);
        showGestureTrigger("😉 Clin d'œil droit ➔ Suivant");
        handleNext();
      },
      onLeftWink: () => {
        setForceLeftBlink(true);
        setTimeout(() => setForceLeftBlink(false), 260);
        showGestureTrigger("😉 Clin d'œil gauche ➔ Précédent");
        handlePrev();
      },
      onDoubleBlink: () => {
        setIsPlayingTimeline((prev) => {
          const next = !prev;
          showGestureTrigger(next ? "👀 Double clignement ➔ Lecture 24H" : "👀 Double clignement ➔ Pause");
          return next;
        });
      },
      onLongEyesClosed: () => {
        const lastMilestone = milestones[milestones.length - 1];
        if (lastMilestone) {
          setActiveMilestoneId(lastMilestone.id);
          playCardTone(lastMilestone.color, "change");
          showGestureTrigger("😴 Yeux fermés ➔ Rituel Sommeil & Nuit");
        }
      },
      onGazeMove: (point) => {
        setGazePoint(point);
      },
    });

    return () => {
      gestureEngineRef.current?.stop();
    };
  }, [milestones, currentIndex]);

  const toggleCameraTracking = async () => {
    if (isCameraActive) {
      gestureEngineRef.current?.stop();
      setIsCameraActive(false);
      setGazePoint(null);
      showGestureTrigger("📷 Caméra désactivée");
    } else {
      if (gestureEngineRef.current) {
        const ok = await gestureEngineRef.current.start();
        if (ok) {
          setIsCameraActive(true);
          showGestureTrigger("✨ Détection Yeux Activée !");
        } else {
          alert("Veuillez autoriser l'accès à la caméra pour tester la détection des clins d'œil.");
        }
      }
    }
  };

  // Load a child preset
  const handleSelectPreset = (key: string) => {
    const preset = PRESETS_DATA[key];
    if (!preset) return;

    setActivePresetKey(key);
    setEventTitle(preset.title);
    setMilestones(preset.milestones);
    setActiveMilestoneId(preset.milestones[0].id);
    setShowPresetMenu(false);
    playCardTone(preset.milestones[0].color, "change");
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlayingTimeline((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, milestones]);

  // Rhythm simulation playback: moves through milestones every 3.2 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setActiveMilestoneId((prevId) => {
          const idx = milestones.findIndex((m) => m.id === prevId);
          const nextIdx = (idx + 1) % milestones.length;
          playCardTone(milestones[nextIdx].color, "step");
          return milestones[nextIdx].id;
        });
      }, 3200);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline, milestones]);

  // Export clean text
  const handleCopyFullItinerary = () => {
    const text = [
      `TOTEM MONTESSORI · RITUEL : ${eventTitle.toUpperCase()}`,
      `───────────────────────────────────────────────────────`,
      ...milestones.map((m, i) => `${i + 1}. [${m.timeSlot}] ${m.name}`),
      `───────────────────────────────────────────────────────`,
      `ColorCard · Totem Temporel & Émotionnel`,
    ].join("\n");

    navigator.clipboard?.writeText(text);
    setIsCopiedItinerary(true);
    setTimeout(() => setIsCopiedItinerary(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#EDEDED] font-sans antialiased flex flex-col justify-between selection:bg-white selection:text-black">
      {/* ========================================================================= */}
      {/* 1. TOP BAR (PROMINENT CAMERA EYE GESTURE BUTTON & PRESETS)                 */}
      {/* ========================================================================= */}
      <header className="bg-[#0A0A0E] border-b border-[#161620] px-4 lg:px-6 py-3 flex items-center justify-between select-none">
        {/* Brand & Ritual Preset Switcher */}
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-lg bg-white text-black flex items-center justify-center shadow-md" title="ColorCard Totem">
            <StudioLogoIcon size={16} />
          </div>

          {/* Preset Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14141E] hover:bg-[#1E1E2C] border border-[#222232] text-[10px] font-black uppercase tracking-wider text-white transition-colors"
            >
              <span>{PRESETS_DATA[activePresetKey]?.subtitle || "Rituels"}</span>
              <span className="text-[9px] opacity-50">▾</span>
            </button>

            {/* Presets Popover */}
            {showPresetMenu && (
              <div className="absolute left-0 top-9 w-64 bg-[#0E0E16] border border-white/20 rounded-xl shadow-2xl py-1.5 z-50 text-left space-y-0.5">
                {[
                  { key: "ecole", label: "Jour d'École & Rituels", desc: "11 étapes · Réveil doux à la nuit" },
                  { key: "mercredi", label: "Mercredi Nature & Création", desc: "8 étapes · Grand air, bois & rire" },
                  { key: "weekend", label: "Week-end & Plein Air", desc: "7 étapes · Cabane, pique-nique & repos" },
                  { key: "meteo_emotions", label: "Météo du Cœur & Émotions", desc: "7 étapes · Colère, apaisement & joie" },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSelectPreset(p.key)}
                    className={`w-full px-3 py-2 text-left transition-colors flex flex-col ${
                      activePresetKey === p.key ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-[10.5px] font-black uppercase">{p.label}</span>
                    <span className={`text-[8.5px] ${activePresetKey === p.key ? "text-black/70" : "text-[#707085]"}`}>
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: PROMINENT CAMERA EYE DETECTION BUTTON */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCameraTracking}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 border ${
              isCameraActive
                ? "bg-emerald-400 text-black border-emerald-300 ring-2 ring-emerald-400/50 animate-pulse"
                : "bg-white text-black hover:bg-neutral-200 border-white"
            }`}
            title="Activer la détection caméra (Contrôle par clins d'œil et suivi du regard)"
          >
            {isCameraActive ? <Camera size={14} /> : <Sparkles size={14} />}
            <span>{isCameraActive ? "DÉTECTION YEUX ACTIVE" : "ACTIVER DÉTECTION YEUX"}</span>
          </button>

          {/* Guide Popup Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGestureGuide(!showGestureGuide)}
              className="p-1.5 rounded-lg bg-[#14141E] hover:bg-[#1E1E2C] border border-[#222232] text-white/70 hover:text-white transition-colors"
              title="Guide des codes secrets par clins d'œil"
            >
              <HelpCircle size={14} />
            </button>

            {showGestureGuide && (
              <div className="absolute left-1/2 -translate-x-1/2 top-9 w-72 bg-[#0E0E16] border border-white/20 rounded-xl shadow-2xl p-3.5 z-50 text-left space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                  <span className="text-[10.5px] font-black uppercase text-white">Codes Secrets du Regard</span>
                  <button onClick={() => setShowGestureGuide(false)} className="text-white/50 hover:text-white text-xs font-bold">✕</button>
                </div>
                <div className="space-y-1.5 text-[9.5px] text-white/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">😉 Clin d'œil droit</span>
                    <span className="text-emerald-400 font-mono">Rituel suivant ›</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">😉 Clin d'œil gauche</span>
                    <span className="text-emerald-400 font-mono">Rituel précédent ‹</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">👀 Double clignement</span>
                    <span className="text-amber-400 font-mono">Lecture / Pause ▶</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">😴 Yeux fermés (2s)</span>
                    <span className="text-indigo-400 font-mono">Nuit & Dodo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">👀 Suivi du regard</span>
                    <span className="text-sky-400 font-mono">Le Totem te regarde</span>
                  </div>
                </div>
                <div className="text-[8px] font-mono text-white/40 pt-1.5 border-t border-white/10 text-center">
                  100% calculé en local · Zéro image envoyée
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Copy & Audio */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyFullItinerary}
            className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all border ${
              isCopiedItinerary
                ? "bg-white text-black border-white shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white border-white/20 active:scale-95"
            }`}
            title="Copier le rythme complet"
          >
            {isCopiedItinerary ? "Copié !" : "Copier"}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = toggleAudioMute();
              setIsMuted(next);
              if (!next) playCardTone(currentMilestone.color, "change");
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted
                ? "bg-[#12121A] border-[#1E1E28] text-[#606070]"
                : "bg-white text-black border-white shadow-sm"
            }`}
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTER LIVING CARD (THE MONTESSORI TEMPORAL TOTEM)                     */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden bg-[#070709]">
        <div className="w-full max-w-[360px] sm:max-w-[380px] flex flex-col items-center">
          <EyeCard
            currentMilestone={currentMilestone}
            allMilestones={milestones}
            onSelectMilestone={(id) => setActiveMilestoneId(id)}
            isPlayingTimeline={isPlayingTimeline}
            onTogglePlayTimeline={() => setIsPlayingTimeline(!isPlayingTimeline)}
            onPrevMilestone={handlePrev}
            onNextMilestone={handleNext}
            gazeTargetPoint={gazePoint}
            forceLeftBlink={forceLeftBlink}
            forceRightBlink={forceRightBlink}
            gestureBadge={gestureBadge}
          />

          {/* Minimalist Sub-Card Action Bar */}
          <div className="w-full flex items-center justify-between text-[9.5px] font-bold text-[#656575] mt-3 px-1">
            <span className="font-mono text-white/80">
              Rituel {currentIndex + 1} / {milestones.length}
            </span>

            {/* Quick camera switch link if camera is off */}
            {!isCameraActive ? (
              <button
                type="button"
                onClick={toggleCameraTracking}
                className="text-[9px] text-white/80 hover:text-white underline font-mono flex items-center gap-1 transition-colors"
              >
                <span>Activer le contrôle par clins d'œil</span>
              </button>
            ) : (
              <span className="text-[9px] text-emerald-400 font-mono">
                Clignez de l'œil droit ou gauche
              </span>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MINIMAL CLEAN FOOTER                                                    */}
      {/* ========================================================================= */}
      <footer className="py-2.5 text-center text-[9px] text-[#454555] font-mono select-none">
        Totem Temporel Montessori · Contrôle par pastilles, clavier ou clins d'œil
      </footer>
    </div>
  );
}

export default App;
