import React, { useState } from "react";
import {
  Wand2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import {
  PATTERNS,
  PATTERN_LABELS,
  PatternType,
  getPatternCSS,
} from "./EyeCard";
import {
  GeometricPatternIcon,
  GeoClockIcon,
} from "./ModernIcons";
import { playCardTone } from "../utils/audioSynth";

interface SmartStudioToolbarProps {
  card: {
    color: string;
    pattern: PatternType;
    patternAnimated: boolean;
    patternAnimationSpeed?: "slow" | "normal" | "fast";
    patternColor?: string;
    patternScale?: number;
    patternOpacity?: number;
    patternRotation?: number;
    message: string;
    assignments: Array<{ time?: string; message?: string; contextId: string }>;
  };
  contexts: Array<{ id: string; name: string }>;
  onUpdate: (patch: Partial<any>) => void;
  timeMinutes: number;
  onChangeTime: (mins: number) => void;
}

export function SmartStudioToolbar({
  card,
  contexts,
  onUpdate,
  timeMinutes,
  onChangeTime,
}: SmartStudioToolbarProps) {
  const [activeTab, setActiveTab] = useState<"patterns" | "time">("patterns");
  const [isPlayingTime, setIsPlayingTime] = useState(false);

  // Time scrubber playback
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTime) {
      interval = setInterval(() => {
        onChangeTime((timeMinutes + 10) % 1440);
        if (timeMinutes % 60 === 0) {
          playCardTone(card.color, "time");
        }
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlayingTime, timeMinutes, onChangeTime, card.color]);

  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  // Smart Auto-Harmony for motif
  const handleAutoHarmony = () => {
    const currentHex = (card.color || "#0062AD").replace("#", "");
    const r = parseInt(currentHex.slice(0, 2), 16) || 0;
    const g = parseInt(currentHex.slice(2, 4), 16) || 0;
    const b = parseInt(currentHex.slice(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    const smartPatternColor = brightness > 140 ? "#000000" : "#FFFFFF";

    onUpdate({
      patternColor: smartPatternColor,
      patternOpacity: brightness > 140 ? 25 : 35,
    });
    playCardTone(card.color, "step");
  };

  const markers = card.assignments.map((a) => ({
    time: a.time || "12:00",
    label: a.message || "",
    contextName: contexts.find((c) => c.id === a.contextId)?.name || "Événement",
  }));

  return (
    <div className="w-full max-w-[420px] space-y-2 select-none">
      {/* 2 SEGMENTED TAB SWITCHER */}
      <div className="flex items-center justify-between bg-[#0E0E14] p-1 rounded-xl border border-[#1A1A26]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("patterns");
            playCardTone(card.color, "hover");
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[9.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "patterns" ? "bg-white text-black shadow-md font-black" : "text-[#78788C] hover:text-white"
          }`}
        >
          <GeometricPatternIcon size={12} />
          <span>Motifs & Graphismes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("time");
            playCardTone(card.color, "hover");
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[9.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "time" ? "bg-white text-black shadow-md font-black" : "text-[#78788C] hover:text-white"
          }`}
        >
          <GeoClockIcon size={12} />
          <span>Lentille Temporelle 24h</span>
        </button>
      </div>

      {/* TOOL CONTAINER */}
      <div className="bg-[#0E0E14] border border-[#1A1A26] rounded-xl p-3 shadow-xl">
        {/* TAB 1: MOTIFS & GRAPHISMES */}
        {activeTab === "patterns" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-white">
              <span>
                Motif : <span className="text-pink-300 ml-1">{PATTERN_LABELS[card.pattern || "none"]}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoHarmony}
                  className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#181826] hover:bg-white hover:text-black text-pink-300 border border-pink-500/20 transition-all"
                  title="Harmoniser automatiquement le contraste du motif"
                >
                  <Wand2 size={10} />
                  Harmoniser
                </button>
                {card.pattern !== "none" && (
                  <button
                    type="button"
                    onClick={() => onUpdate({ pattern: "none" })}
                    className="text-[8px] text-[#707085] hover:text-white"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* 15 PATTERNS MICRO-MATRIX WITH CRISP CSS PREVIEWS */}
            <div className="grid grid-cols-5 gap-1.5">
              {PATTERNS.map((p) => {
                const isSelected = (card.pattern || "none") === p;
                const sampleCSS = getPatternCSS(p, "rgba(255,255,255,0.75)", 45);

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onUpdate({ pattern: p });
                      playCardTone(card.color, "change");
                    }}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? "border-pink-400 bg-pink-500/15 text-white ring-1 ring-pink-400/50"
                        : "border-[#202030] bg-[#12121A] text-[#78788C] hover:border-[#383850] hover:text-white"
                    }`}
                  >
                    <div
                      className="size-7 rounded overflow-hidden bg-[#1E1E2C] border border-white/10 flex items-center justify-center shrink-0 mb-1"
                      style={sampleCSS}
                    />
                    <span className="text-[7.5px] font-bold uppercase tracking-wider truncate w-full text-center">
                      {PATTERN_LABELS[p]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CONTROLS (OPACITY, ROTATION, ANIMATION) */}
            {card.pattern !== "none" && (
              <div className="pt-2 border-t border-[#181824] space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[8px] text-[#808095] mb-1 font-mono">
                      <span>OPACITÉ</span>
                      <span>{card.patternOpacity ?? 25}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={card.patternOpacity ?? 25}
                      onChange={(e) => onUpdate({ patternOpacity: Number(e.target.value) })}
                      className="w-full accent-pink-400 h-1 bg-[#20202E] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[8px] text-[#808095] mb-1 font-mono">
                      <span>ROTATION</span>
                      <span>{card.patternRotation ?? 45}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="15"
                      value={card.patternRotation ?? 45}
                      onChange={(e) => onUpdate({ patternRotation: Number(e.target.value) })}
                      className="w-full accent-pink-400 h-1 bg-[#20202E] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* ANIMATION TOGGLE & SPEED */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[8.5px] font-bold text-[#808095] uppercase tracking-wider">Animation continue</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdate({ patternAnimated: !card.patternAnimated })}
                      className={`text-[8.5px] font-bold px-2 py-0.5 rounded transition-all ${
                        card.patternAnimated
                          ? "bg-pink-500 text-white shadow-sm"
                          : "bg-[#181826] text-[#707085] hover:text-white"
                      }`}
                    >
                      {card.patternAnimated ? "ACTIVE" : "FIXE"}
                    </button>
                    {card.patternAnimated && (
                      <select
                        value={card.patternAnimationSpeed || "normal"}
                        onChange={(e) => onUpdate({ patternAnimationSpeed: e.target.value as any })}
                        className="bg-[#181826] text-white text-[8px] font-bold px-1.5 py-0.5 rounded border border-[#2A2A3C] outline-none"
                      >
                        <option value="slow">Lente</option>
                        <option value="normal">Normale</option>
                        <option value="fast">Rapide</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LENTILLE TEMPORELLE 24H */}
        {activeTab === "time" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-white">Heure de simulation</span>
              <span className="text-sm font-black font-mono text-pink-300 bg-[#181826] px-2 py-0.5 rounded border border-[#2A2A3C]">
                {formattedTime}
              </span>
            </div>

            <div className="relative pt-1 pb-2">
              <input
                type="range"
                min="0"
                max="1439"
                value={timeMinutes}
                onChange={(e) => onChangeTime(Number(e.target.value))}
                className="w-full accent-pink-400 h-2 bg-[#20202E] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-[#606075] mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </div>

            {/* PLAYBACK & REWIND */}
            <div className="flex items-center justify-between pt-1 border-t border-[#181824]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlayingTime(!isPlayingTime)}
                  className={`flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all ${
                    isPlayingTime
                      ? "bg-amber-400 text-black font-black"
                      : "bg-[#181826] text-white hover:bg-white hover:text-black"
                  }`}
                >
                  {isPlayingTime ? <Pause size={10} /> : <Play size={10} />}
                  <span>{isPlayingTime ? "Pause" : "Simuler la journée"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTime(720)}
                  className="p-1 rounded bg-[#181826] text-[#707085] hover:text-white"
                  title="Midi (12:00)"
                >
                  <RotateCcw size={10} />
                </button>
              </div>

              {markers.length > 0 && (
                <span className="text-[8px] text-pink-300 font-semibold font-mono">
                  {markers.length} repère{markers.length > 1 ? "s" : ""} actif{markers.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
