import React, { useRef, useState, useEffect } from "react";
import { Eye } from "./Eye";
import { playCardTone } from "../utils/audioSynth";

export interface ChildRitualMilestone {
  id: string;
  name: string;
  role?: string;
  color: string;
  cardBg?: string;
  timeSlot: string;
  startMinute?: number;
  endMinute?: number;
  location?: string;
  message?: string;
  phone?: string;
  equipment?: string;
  notes?: string;
  agentGreeting?: string;
  spokenAudioText?: string;
}

export type WeddingMilestone = ChildRitualMilestone;

interface MonsterProps {
  monsterBg?: string;
  eyeWhite?: string;
  pupilColor?: string;
  targetPoint?: { x: number; y: number } | null;
  forceBlink?: boolean;
  forceLeftBlink?: boolean;
  forceRightBlink?: boolean;
  gestureBadge?: string | null;
}

function Monster({
  monsterBg = "#006494",
  eyeWhite = "#FBF0DC",
  pupilColor = "#000000",
  targetPoint = null,
  forceBlink = false,
  forceLeftBlink = false,
  forceRightBlink = false,
  gestureBadge = null,
}: MonsterProps) {
  return (
    <div
      style={{ backgroundColor: monsterBg }}
      className="relative aspect-square w-full overflow-hidden select-none transition-colors duration-300 ease-out flex items-center justify-center"
      data-name="totem-face"
    >
      {/* THE EXPRESSIVE INTERACTIVE EYES (PURE AND UNOBSTRUCTED) */}
      <div className="flex items-center justify-center gap-7 sm:gap-9 pointer-events-none z-10">
        <Eye
          eyeWhite={eyeWhite}
          pupilColor={pupilColor}
          targetPoint={targetPoint}
          forceBlink={forceBlink || forceLeftBlink}
          forceEyeClosed={forceLeftBlink}
        />
        <Eye
          eyeWhite={eyeWhite}
          pupilColor={pupilColor}
          targetPoint={targetPoint}
          forceBlink={forceBlink || forceRightBlink}
          forceEyeClosed={forceRightBlink}
          isRightEye={true}
        />
      </div>

      {/* Gentle Gesture Feedback Pill on the Face */}
      {gestureBadge && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[9.5px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xl border border-white/20 animate-in fade-in zoom-in duration-150 z-20 pointer-events-none whitespace-nowrap">
          {gestureBadge}
        </div>
      )}
    </div>
  );
}

export interface EyeCardProps {
  currentMilestone: ChildRitualMilestone;
  allMilestones: ChildRitualMilestone[];
  onSelectMilestone: (id: string) => void;
  isPlayingTimeline?: boolean;
  onTogglePlayTimeline?: () => void;
  onPrevMilestone?: () => void;
  onNextMilestone?: () => void;
  gazeTargetPoint?: { x: number; y: number } | null;
  forceLeftBlink?: boolean;
  forceRightBlink?: boolean;
  gestureBadge?: string | null;
}

export function EyeCard({
  currentMilestone,
  allMilestones,
  onSelectMilestone,
  isPlayingTimeline = false,
  onTogglePlayTimeline,
  onPrevMilestone,
  onNextMilestone,
  gazeTargetPoint = null,
  forceLeftBlink = false,
  forceRightBlink = false,
  gestureBadge = null,
}: EyeCardProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [forceBlink, setForceBlink] = useState(false);
  const [hoveredMilestone, setHoveredMilestone] = useState<ChildRitualMilestone | null>(null);

  // Micro-blink on ritual change
  useEffect(() => {
    setForceBlink(true);
    const timer = setTimeout(() => setForceBlink(false), 140);
    return () => clearTimeout(timer);
  }, [currentMilestone.id]);

  return (
    <div
      ref={cardContainerRef}
      className="relative w-full max-w-[360px] sm:max-w-[380px] select-none mx-auto"
    >
      {/* SINGLE ICONIC LIVING TOTEM CARD (STRICTLY LOCKED FIXED FORMAT) */}
      <div className="relative w-full overflow-hidden shadow-2xl rounded-2xl flex flex-col bg-[#FBF0DC] border border-black/10">
        {/* Top Section: Monster Face (Strictly Square Aspect Ratio) */}
        <Monster
          monsterBg={currentMilestone.color}
          eyeWhite="#FBF0DC"
          pupilColor="#000000"
          targetPoint={gazeTargetPoint}
          forceBlink={forceBlink}
          forceLeftBlink={forceLeftBlink}
          forceRightBlink={forceRightBlink}
          gestureBadge={gestureBadge}
        />

        {/* ------------------------------------------------------------- */}
        {/* Bottom Section: Socle (Strictly Fixed 145px Height)          */}
        {/* ONLY: Horaire, Titre, et Timeline de pastilles                */}
        {/* ------------------------------------------------------------- */}
        <div
          className="h-[145px] w-full px-5 py-4 flex flex-col justify-between select-none relative bg-[#FBF0DC] text-black"
          data-name="socle-rituel"
        >
          {/* Header block with ONLY Time & Title */}
          <div>
            {/* 1. L'HORAIRE */}
            <div className="text-[25px] sm:text-[27px] font-black uppercase font-mono tracking-tight text-black leading-none pb-1.5 border-b border-black/10">
              {currentMilestone.timeSlot}
            </div>

            {/* 2. LE TITRE */}
            <div className="mt-2 text-[20px] sm:text-[22px] font-black uppercase leading-tight tracking-[-0.01em] text-black truncate">
              {currentMilestone.name}
            </div>
          </div>

          {/* 3. TIMELINE DANS LE SOCLE : PASTILLES CHROMATIQUES ÉPURÉES */}
          <div className="pt-2 border-t border-black/10 flex flex-col gap-1 select-none relative">
            {/* Tooltip on hover */}
            {hoveredMilestone && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9.5px] font-mono font-black px-2.5 py-0.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap z-30 animate-in fade-in duration-100 flex items-center gap-1.5 bg-black text-white">
                <span>{hoveredMilestone.timeSlot.split(" ")[0]}</span>
                <span className="opacity-50">·</span>
                <span>{hoveredMilestone.name}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-1.5">
              {/* Play / Pause 24h simulation */}
              {onTogglePlayTimeline && (
                <button
                  type="button"
                  onClick={onTogglePlayTimeline}
                  className="size-6 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 text-[9.5px] font-bold bg-black text-white hover:bg-neutral-800"
                  title={isPlayingTimeline ? "Pause" : "Lecture 24h"}
                >
                  {isPlayingTimeline ? "❚❚" : "▶"}
                </button>
              )}

              {/* Prev Arrow */}
              {onPrevMilestone && (
                <button
                  type="button"
                  onClick={onPrevMilestone}
                  className="font-bold text-sm transition-colors px-1 text-black/40 hover:text-black"
                  title="Précédent"
                >
                  ‹
                </button>
              )}

              {/* Timeline Dots */}
              <div className="flex-1 flex items-center justify-between gap-1 px-1 relative">
                <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none z-0 bg-black/15" />

                {allMilestones.map((m) => {
                  const isSelected = m.id === currentMilestone.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onMouseEnter={() => setHoveredMilestone(m)}
                      onMouseLeave={() => setHoveredMilestone(null)}
                      onClick={() => {
                        onSelectMilestone(m.id);
                        playCardTone(m.color, "hover");
                      }}
                      className={`group relative flex items-center justify-center transition-all duration-150 z-10 ${
                        isSelected ? "scale-125 z-20" : "hover:scale-115 opacity-75 hover:opacity-100"
                      }`}
                      title={`${m.timeSlot} : ${m.name}`}
                    >
                      <span
                        className={`rounded-full transition-all ${
                          isSelected
                            ? "size-4.5 ring-2 ring-black shadow-md border-2 border-white"
                            : "size-3 border border-black/30 shadow-xs"
                        }`}
                        style={{ backgroundColor: m.color }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Next Arrow */}
              {onNextMilestone && (
                <button
                  type="button"
                  onClick={onNextMilestone}
                  className="font-bold text-sm transition-colors px-1 text-black/40 hover:text-black"
                  title="Suivant"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EyeCard;
