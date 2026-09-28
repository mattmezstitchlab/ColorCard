import React, { useRef, useState, useEffect } from "react";
import { Eye } from "./Eye";
import { playCardTone } from "../utils/audioSynth";
import { speakTotemMessage, stopTotemSpeech } from "../utils/voiceSpeech";

export interface ChildRitualMilestone {
  id: string;
  name: string;
  role: string;
  color: string;
  cardBg?: string;
  timeSlot: string;
  startMinute: number;
  endMinute: number;
  location: string;
  message: string;
  phone: string;
  equipment: string;
  notes: string;
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
}

function Monster({
  monsterBg = "#006494",
  eyeWhite = "#FBF0DC",
  pupilColor = "#000000",
  targetPoint = null,
  forceBlink = false,
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
          forceBlink={forceBlink}
        />
        <Eye
          eyeWhite={eyeWhite}
          pupilColor={pupilColor}
          targetPoint={targetPoint}
          forceBlink={forceBlink}
          isRightEye={true}
        />
      </div>
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
}

export function EyeCard({
  currentMilestone,
  allMilestones,
  onSelectMilestone,
  isPlayingTimeline = false,
  onTogglePlayTimeline,
  onPrevMilestone,
  onNextMilestone,
}: EyeCardProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [forceBlink, setForceBlink] = useState(false);
  const [gazeOverride, setGazeOverride] = useState<{ x: number; y: number } | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<ChildRitualMilestone | null>(null);

  // Micro-blink on ritual change
  useEffect(() => {
    setForceBlink(true);
    stopTotemSpeech();
    setIsSpeaking(false);
    const timer = setTimeout(() => setForceBlink(false), 140);
    return () => clearTimeout(timer);
  }, [currentMilestone.id]);

  // Handle spoken voice generation
  const handleSpeakRitual = () => {
    if (isSpeaking) {
      stopTotemSpeech();
      setIsSpeaking(false);
      return;
    }

    const speechText =
      currentMilestone.spokenAudioText ||
      currentMilestone.agentGreeting ||
      `C'est l'heure du rituel ${currentMilestone.name}. ${currentMilestone.message}. Tu es autonome et capable !`;

    playCardTone(currentMilestone.color, "step");

    if (cardContainerRef.current) {
      const rect = cardContainerRef.current.getBoundingClientRect();
      setGazeOverride({ x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.8 });
    }

    speakTotemMessage(
      speechText,
      () => {
        setIsSpeaking(true);
        setForceBlink(true);
        setTimeout(() => setForceBlink(false), 180);
      },
      () => {
        setIsSpeaking(false);
        setGazeOverride(null);
      }
    );
  };

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
          targetPoint={gazeOverride}
          forceBlink={forceBlink}
        />

        {/* ------------------------------------------------------------- */}
        {/* Bottom Section: Socle (Strictly Fixed 200px Height)          */}
        {/* ------------------------------------------------------------- */}
        <div
          className="h-[200px] w-full px-5 py-4 flex flex-col justify-between select-none relative bg-[#FBF0DC] text-black"
          data-name="socle-rituel"
        >
          {/* Header block with Time and Location */}
          <div>
            <div className="pb-1.5 flex items-center justify-between border-b border-black/10">
              <div className="text-[24px] sm:text-[26px] font-black uppercase font-mono tracking-tight text-black leading-none">
                {currentMilestone.timeSlot}
              </div>

              <div className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-black/70">
                {currentMilestone.location}
              </div>
            </div>

            {/* Ritual Name */}
            <div className="mt-2 text-[20px] sm:text-[22px] font-black uppercase leading-tight tracking-[-0.01em] text-black truncate">
              {currentMilestone.name}
            </div>

            {/* Intention / Role */}
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-black/60 truncate">
              {currentMilestone.role}
            </div>
          </div>

          {/* Action / Message & Voice Button */}
          <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2.5">
            <div className="text-[12px] font-black uppercase tracking-[0.02em] text-black truncate flex-1">
              « {currentMilestone.message} »
            </div>

            {/* Spoken Voice Button */}
            <button
              type="button"
              onClick={handleSpeakRitual}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm ${
                isSpeaking
                  ? "bg-amber-400 text-black animate-pulse ring-2 ring-black"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
              title="Écouter le Totem"
            >
              <span>{isSpeaking ? "🔊" : "▶"}</span>
              <span>{isSpeaking ? "ÉCOUTE..." : "PARLER"}</span>
            </button>
          </div>

          {/* Timeline Row (Always Fixed at the Bottom of the Socle) */}
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
