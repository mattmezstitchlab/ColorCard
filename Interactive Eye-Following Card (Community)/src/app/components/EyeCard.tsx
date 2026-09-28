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

// Helper to determine if a background color is dark for optimal typographic contrast
function isDarkBgColor(hexColor?: string): boolean {
  if (!hexColor) return false;
  const clean = hexColor.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}

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
      className="relative aspect-square w-full overflow-hidden select-none transition-colors duration-400 ease-out flex items-center justify-center"
      data-name="totem-face"
    >
      {/* THE EXPRESSIVE INTERACTIVE EYES (100% PURE AND UNOBSTRUCTED) */}
      <div className="flex items-center justify-center gap-7 sm:gap-9 pointer-events-none z-10">
        <Eye
          eyeWhite={eyeWhite}
          pupilColor={pupilColor}
          targetPoint={targetPoint}
          forceBlink={forceBlink}
          monsterBg={monsterBg}
        />
        <Eye
          eyeWhite={eyeWhite}
          pupilColor={pupilColor}
          targetPoint={targetPoint}
          forceBlink={forceBlink}
          monsterBg={monsterBg}
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

  const isNightTheme = isDarkBgColor(currentMilestone.cardBg);

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
      className="relative w-full select-none"
    >
      {/* SINGLE ICONIC LIVING TOTEM CARD */}
      <div
        style={{
          backgroundColor: currentMilestone.cardBg || (isNightTheme ? "#0B101E" : "#FBF0DC"),
        }}
        className={`relative w-full overflow-hidden shadow-2xl rounded-2xl flex flex-col transition-colors duration-400 border ${
          isNightTheme ? "border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8)]" : "border-black/10 shadow-xl"
        }`}
      >
        {/* Living face with interactive eyes (Pure and Clean) */}
        <Monster
          monsterBg={currentMilestone.color}
          eyeWhite={isNightTheme ? "#E2E8F0" : currentMilestone.cardBg || "#FBF0DC"}
          pupilColor="#000000"
          targetPoint={gazeOverride}
          forceBlink={forceBlink}
        />

        {/* ------------------------------------------------------------- */}
        {/* SOCLE DE LA CARTE: TYPOGRAPHIE PURE, LISIBLE JOUR & NUIT       */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`w-full px-5 py-4 flex flex-col justify-between select-none relative transition-colors duration-350 ${
            isNightTheme ? "bg-[#0E1322] text-white" : "text-black"
          }`}
          data-name="socle-rituel"
        >
          <div>
            {/* 1. L'HORAIRE DU RITUEL EN GRAND FORMAT TYPOGRAPHIQUE */}
            <div
              className={`pb-2 flex items-center justify-between border-b ${
                isNightTheme ? "border-white/15 text-white" : "border-black/10 text-black"
              }`}
            >
              <div className="text-[24px] sm:text-[27px] font-black uppercase font-mono tracking-tight">
                {currentMilestone.timeSlot}
              </div>

              {/* Lieu / Espace discret */}
              <div
                className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isNightTheme ? "bg-white/15 text-white font-bold" : "bg-black/5 text-black/80 font-bold"
                }`}
              >
                {currentMilestone.location}
              </div>
            </div>

            {/* 2. Nom du Rituel (Figé, Typographie Audacieuse) */}
            <div
              className={`mt-2.5 text-[21px] sm:text-[24px] font-black uppercase leading-tight tracking-[-0.01em] ${
                isNightTheme ? "text-white" : "text-black"
              }`}
            >
              {currentMilestone.name}
            </div>

            {/* 3. Intention / Rôle Montessori */}
            <div
              className={`mt-0.5 text-[11px] font-bold uppercase tracking-wide truncate ${
                isNightTheme ? "text-white/80" : "text-black/60"
              }`}
            >
              {currentMilestone.role}
            </div>
          </div>

          {/* 4. Action / Mission de l'Enfant & Bouton VOIX DU TOTEM */}
          <div
            className={`my-3 pt-2.5 border-t flex items-center justify-between gap-3 ${
              isNightTheme ? "border-white/15" : "border-black/10"
            }`}
          >
            <div
              className={`text-[12.5px] sm:text-[13px] font-black uppercase tracking-[0.02em] leading-snug line-clamp-2 ${
                isNightTheme ? "text-white/95" : "text-black"
              }`}
            >
              « {currentMilestone.message} »
            </div>

            {/* BOUTON VOCAL DU TOTEM (PAROLE DIRECTE) */}
            <button
              type="button"
              onClick={handleSpeakRitual}
              className={`px-3 py-1.5 rounded-full text-[9.5px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition-transform active:scale-95 shadow-md ${
                isSpeaking
                  ? "bg-amber-400 text-black animate-pulse ring-2 ring-white"
                  : isNightTheme
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
              title="Écouter la voix du Totem"
            >
              <span className="text-xs">{isSpeaking ? "🔊" : "▶"}</span>
              <span>{isSpeaking ? "ÉCOUTE..." : "PARLER"}</span>
            </button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 5. TIMELINE DANS LE SOCLE : PASTILLES CHROMATIQUES ÉPURÉES    */}
          {/* ------------------------------------------------------------- */}
          <div
            className={`pt-2 border-t flex flex-col gap-1.5 select-none relative ${
              isNightTheme ? "border-white/15" : "border-black/10"
            }`}
          >
            {/* Tooltip au survol */}
            {hoveredMilestone && (
              <div
                className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[9.5px] font-mono font-black px-2.5 py-0.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap z-30 animate-in fade-in duration-100 flex items-center gap-1.5 ${
                  isNightTheme ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
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
                  className={`size-6 sm:size-7 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 text-[10px] font-bold ${
                    isNightTheme ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                  }`}
                  title={isPlayingTimeline ? "Pause" : "Lecture 24h"}
                >
                  {isPlayingTimeline ? "❚❚" : "▶"}
                </button>
              )}

              {/* Flèche précédente */}
              {onPrevMilestone && (
                <button
                  type="button"
                  onClick={onPrevMilestone}
                  className={`font-bold text-sm transition-colors px-1 ${
                    isNightTheme ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                  }`}
                  title="Précédent"
                >
                  ‹
                </button>
              )}

              {/* Pastilles chromatiques reliées */}
              <div className="flex-1 flex items-center justify-between gap-1 px-1 relative">
                <div
                  className={`absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none z-0 ${
                    isNightTheme ? "bg-white/20" : "bg-black/15"
                  }`}
                />

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
                            ? isNightTheme
                              ? "size-4.5 sm:size-5 ring-2 ring-white shadow-md border-2 border-[#0E1322]"
                              : "size-4.5 sm:size-5 ring-2 ring-black shadow-md border-2 border-white"
                            : isNightTheme
                            ? "size-3 sm:size-3.5 border border-white/40 shadow-xs"
                            : "size-3 sm:size-3.5 border border-black/30 shadow-xs"
                        }`}
                        style={{ backgroundColor: m.color }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Flèche suivante */}
              {onNextMilestone && (
                <button
                  type="button"
                  onClick={onNextMilestone}
                  className={`font-bold text-sm transition-colors px-1 ${
                    isNightTheme ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                  }`}
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
