import React, { useRef, useState, useEffect } from "react";
import { Eye } from "./Eye";
import { playCardTone } from "../utils/audioSynth";

// Continuous High-Density Chromatic Mosaic Palette (13 rows x 9 columns = ~117 nuances)
export const CHROMATIC_MOSAIC_ROWS = [
  // 1. Monochromes & Grays
  [
    { hex: "#FFFFFF", name: "Blanc Pur" },
    { hex: "#E4E4E7", name: "Gris Platine" },
    { hex: "#CBD5E1", name: "Gris Perle" },
    { hex: "#94A3B8", name: "Gris Acier" },
    { hex: "#64748B", name: "Ardoise" },
    { hex: "#475569", name: "Anthracite" },
    { hex: "#334155", name: "Charbon" },
    { hex: "#1E293B", name: "Onyx" },
    { hex: "#09090B", name: "Noir Absolu" },
  ],
  // 2. Cyan to Cobalt to Deep Navy
  [
    { hex: "#00A8E8", name: "Cyan Pur" },
    { hex: "#0096D6", name: "Bleu Azur" },
    { hex: "#007EA7", name: "Bleu Océan" },
    { hex: "#006494", name: "Bleu Céruléen" },
    { hex: "#004B73", name: "Bleu Pétrole" },
    { hex: "#003459", name: "Bleu Profond" },
    { hex: "#00233D", name: "Bleu Nuit" },
    { hex: "#00171F", name: "Abyssal" },
    { hex: "#1E1B4B", name: "Bleu Sidéral" },
  ],
  // 3. Magenta, Violet, Deep Imperial Purple
  [
    { hex: "#FF007F", name: "Rose Néon" },
    { hex: "#E60072", name: "Fuchsia Vif" },
    { hex: "#CC0066", name: "Magenta Intense" },
    { hex: "#B30059", name: "Framboise" },
    { hex: "#99004D", name: "Pourpre" },
    { hex: "#800040", name: "Violet Impérial" },
    { hex: "#660033", name: "Prune Profond" },
    { hex: "#4D0026", name: "Bordeaux Noir" },
    { hex: "#33001A", name: "Aubergine Nuit" },
  ],
  // 4. Midnight Blue & Obsidian Indigo
  [
    { hex: "#1E293B", name: "Ardoise Sombre" },
    { hex: "#1E1B4B", name: "Indigo Nuit" },
    { hex: "#1E2950", name: "Cobalt Noir" },
    { hex: "#172554", name: "Bleu Abysse" },
    { hex: "#141C38", name: "Pétrole Foncé" },
    { hex: "#0F172A", name: "Obsidienne" },
    { hex: "#0B101E", name: "Bleu Spatial" },
    { hex: "#080C17", name: "Noir Indigo" },
    { hex: "#04060C", name: "Vide Sidéral" },
  ],
  // 5. Sky Blue, Azure, Electric Cyan
  [
    { hex: "#E0F2FE", name: "Givre Cyan" },
    { hex: "#BAE6FD", name: "Ciel Clair" },
    { hex: "#7DD3FC", name: "Azur Doux" },
    { hex: "#38BDF8", name: "Bleu Céleste" },
    { hex: "#0EA5E9", name: "Cyan Électrique" },
    { hex: "#0284C7", name: "Bleu Méditerranée" },
    { hex: "#0369A1", name: "Bleu Marine" },
    { hex: "#075985", name: "Bleu Profond" },
    { hex: "#0C4A6E", name: "Bleu Saphir" },
  ],
  // 6. Lavender, Periwinkle, Royal Purple
  [
    { hex: "#F3E8FF", name: "Lilas Pastel" },
    { hex: "#E9D5FF", name: "Lavande Douce" },
    { hex: "#D8B4FE", name: "Glycine" },
    { hex: "#C084FC", name: "Orchidée" },
    { hex: "#A855F7", name: "Violet Lumineux" },
    { hex: "#9333EA", name: "Pourpre Vif" },
    { hex: "#7E22CE", name: "Améthyste" },
    { hex: "#6B21A8", name: "Violet Royal" },
    { hex: "#581C87", name: "Aubergine" },
  ],
  // 7. Warm Yellows, Ochres, Olives
  [
    { hex: "#FEF08A", name: "Jaune Paille" },
    { hex: "#FDE047", name: "Jaune Soleil" },
    { hex: "#FACC15", name: "Or Pur" },
    { hex: "#EAB308", name: "Ocre Solaire" },
    { hex: "#CA8A04", name: "Ambre Antique" },
    { hex: "#A16207", name: "Olive Doré" },
    { hex: "#854D0E", name: "Bronze Solaire" },
    { hex: "#713F12", name: "Terre de Sienne" },
    { hex: "#451A03", name: "Brun Ébène" },
  ],
  // 8. Lime, Chartreuse, Forest Green
  [
    { hex: "#D9F99D", name: "Vert Tilleul" },
    { hex: "#BEF264", name: "Vert Anis" },
    { hex: "#A3E635", name: "Vert Pomme" },
    { hex: "#84CC16", name: "Vert Feuille" },
    { hex: "#65A30D", name: "Vert Mousse" },
    { hex: "#4D7C0F", name: "Vert Forêt" },
    { hex: "#3F6212", name: "Pin Sombre" },
    { hex: "#365314", name: "Émeraude Sombre" },
    { hex: "#1A2E05", name: "Vert Nuit" },
  ],
  // 9. Turquoise, Mint, Dark Emerald
  [
    { hex: "#CCFBF1", name: "Eau de Menthe" },
    { hex: "#99F6E4", name: "Turquoise Clair" },
    { hex: "#5EEAD4", name: "Menthe Vif" },
    { hex: "#2DD4BF", name: "Turquoise Pur" },
    { hex: "#14B8A6", name: "Émeraude Luxe" },
    { hex: "#0D9488", name: "Jade" },
    { hex: "#0F766E", name: "Vert Canard" },
    { hex: "#115E59", name: "Teal Profond" },
    { hex: "#042F2E", name: "Vert Abyssal" },
  ],
  // 10. Mandarine, Orange, Terracotta
  [
    { hex: "#FFEDD5", name: "Pêche Pâle" },
    { hex: "#FED7AA", name: "Abricot Clair" },
    { hex: "#FDBA74", name: "Mandarine Douce" },
    { hex: "#FB923C", name: "Orange Vif" },
    { hex: "#F97316", name: "Tangerine" },
    { hex: "#EA580C", name: "Orange Brûlé" },
    { hex: "#C2410C", name: "Rouille" },
    { hex: "#9A3412", name: "Terracotta" },
    { hex: "#7C2D12", name: "Acajou Sombre" },
  ],
  // 11. Vivid Scarlet, Crimson, Burgundy
  [
    { hex: "#FEE2E2", name: "Rose Pâle" },
    { hex: "#FECACA", name: "Corail Doux" },
    { hex: "#FCA5A5", name: "Rose Saumon" },
    { hex: "#F87171", name: "Rouge Corail" },
    { hex: "#EF4444", name: "Rouge Écarlate" },
    { hex: "#DC2626", name: "Rouge Vif" },
    { hex: "#B91C1C", name: "Carmin" },
    { hex: "#991B1B", name: "Rubis" },
    { hex: "#450A0A", name: "Grenat Noir" },
  ],
  // 12. Hot Pink, Raspberry, Deep Berry
  [
    { hex: "#FDF2F8", name: "Rose Poudré" },
    { hex: "#FCE7F3", name: "Rose Bonbon" },
    { hex: "#FBCFE8", name: "Rose Barbe à Papa" },
    { hex: "#F472B6", name: "Rose Magenta" },
    { hex: "#EC4899", name: "Fuchsia Électrique" },
    { hex: "#DB2777", name: "Framboise Vif" },
    { hex: "#BE185D", name: "Cassis" },
    { hex: "#9D174D", name: "Cerise Noire" },
    { hex: "#500724", name: "Bordeaux Noir" },
  ],
  // 13. Vanilla, Champagne, Warm Earths
  [
    { hex: "#FAFAF9", name: "Craie Pure" },
    { hex: "#F5F5F4", name: "Ivoire" },
    { hex: "#E7E5E4", name: "Sable Doré" },
    { hex: "#D6D3D1", name: "Galet" },
    { hex: "#A8A29E", name: "Taupe Moyen" },
    { hex: "#78716C", name: "Terre Brune" },
    { hex: "#57534E", name: "Terre d'Ombre" },
    { hex: "#44403C", name: "Cacao" },
    { hex: "#1C1917", name: "Chocolat Noir" },
  ],
];

export interface WeddingMilestone {
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
}

interface MonsterProps {
  monsterBg?: string;
  eyeWhite?: string;
  pupilColor?: string;
  targetPoint?: { x: number; y: number } | null;
  forceBlink?: boolean;
  onChangeColor?: (color: string) => void;
  onCopyCardId?: () => void;
  onToggleChatMode?: () => void;
}

function Monster({
  monsterBg = "#006494",
  eyeWhite = "#FBF0DC",
  pupilColor = "#000000",
  targetPoint = null,
  forceBlink = false,
  onChangeColor,
  onCopyCardId,
  onToggleChatMode,
}: MonsterProps) {
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [hoveredColorInfo, setHoveredColorInfo] = useState<{ hex: string; name: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const closeAll = () => {
    setIsPickingColor(false);
    setShowActionMenu(false);
  };

  const handleCopy = () => {
    onCopyCardId?.();
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      closeAll();
    }, 1500);
  };

  const handleSelectMosaicColor = (colorHex: string) => {
    onChangeColor?.(colorHex);
    playCardTone(colorHex, "change");
    closeAll();
  };

  return (
    <div
      style={{ backgroundColor: isPickingColor ? "#09090E" : monsterBg }}
      className="relative aspect-square w-full overflow-hidden select-none transition-colors duration-350 ease-out"
      data-name="monster"
    >
      {/* Click outside backdrop */}
      {showActionMenu && (
        <div onClick={closeAll} className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[1px]" />
      )}

      {/* TOP CONTROLS: COLOR SWATCH (LEFT) & ACTION [...] (RIGHT) */}
      {!isPickingColor && (
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-40 pointer-events-auto">
          {/* COLOR SWATCH BUTTON */}
          <button
            type="button"
            onClick={() => {
              setIsPickingColor(true);
              setShowActionMenu(false);
            }}
            className="size-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-black/40 backdrop-blur-sm"
            title="Nuancier chromatique"
          >
            <span
              className="size-5 rounded-full border border-white/80 shadow-inner"
              style={{ backgroundColor: monsterBg }}
            />
          </button>

          {/* ACTION BUTTON [...] */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="text-white hover:text-white/80 transition-transform hover:scale-125 p-1 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              title="Options"
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="19" cy="12" r="2.2" />
              </svg>
            </button>

            {showActionMenu && (
              <div className="absolute right-0 top-9 w-52 bg-[#0D0D14] border border-white/20 rounded-xl shadow-2xl py-1.5 z-50 text-left space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onToggleChatMode?.();
                    closeAll();
                  }}
                  className="w-full px-3 py-2 text-[10.5px] font-black uppercase text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <span>Discuter avec l'agent</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full px-3 py-2 text-[10px] font-semibold text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <span>{isCopied ? "Fiche copiée !" : "Copier le contact"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL-BLEED CHROMATIC MOSAIC PALETTE */}
      {isPickingColor ? (
        <div className="absolute inset-0 z-50 bg-[#08080C] p-2.5 flex flex-col justify-between animate-in fade-in duration-150 select-none">
          <div className="flex items-center justify-between border-b border-white/15 pb-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="size-3.5 rounded-full border border-white/40" style={{ backgroundColor: hoveredColorInfo?.hex || monsterBg }} />
              <div className="text-[10px] font-black uppercase text-white tracking-wider">
                {hoveredColorInfo ? `${hoveredColorInfo.name} · ${hoveredColorInfo.hex}` : "Nuancier Chromatique"}
              </div>
            </div>

            <button
              type="button"
              onClick={closeAll}
              className="text-[#808095] hover:text-white p-1 text-xs font-black"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 my-2 flex flex-col gap-[2px] overflow-hidden">
            {CHROMATIC_MOSAIC_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex-1 flex gap-[2px]">
                {row.map((item) => {
                  const isSelected = monsterBg.toLowerCase() === item.hex.toLowerCase();
                  return (
                    <button
                      key={item.hex}
                      type="button"
                      onMouseEnter={() => setHoveredColorInfo(item)}
                      onMouseLeave={() => setHoveredColorInfo(null)}
                      onClick={() => handleSelectMosaicColor(item.hex)}
                      style={{ backgroundColor: item.hex }}
                      className={`flex-1 rounded-[2px] transition-transform duration-75 hover:scale-125 hover:z-20 shadow-sm border ${
                        isSelected ? "ring-2 ring-white border-white scale-110 z-10" : "border-black/20 hover:border-white"
                      }`}
                      title={`${item.name} (${item.hex})`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="text-center text-[8px] font-mono text-white/50 uppercase">
            Cliquez sur une nuance pour l'appliquer
          </div>
        </div>
      ) : (
        /* THE EXPRESSIVE INTERACTIVE EYES */
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex items-center justify-center gap-7 sm:gap-9">
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
      )}
    </div>
  );
}

export interface EyeCardProps {
  currentMilestone: WeddingMilestone;
  allMilestones: WeddingMilestone[];
  onSelectMilestone: (id: string) => void;
  onUpdateMilestone: (patch: Partial<WeddingMilestone>) => void;
  isPlayingTimeline?: boolean;
  onTogglePlayTimeline?: () => void;
  onPrevMilestone?: () => void;
  onNextMilestone?: () => void;
  onAddMilestone?: () => void;
}

export function EyeCard({
  currentMilestone,
  allMilestones,
  onSelectMilestone,
  onUpdateMilestone,
  isPlayingTimeline = false,
  onTogglePlayTimeline,
  onPrevMilestone,
  onNextMilestone,
  onAddMilestone,
}: EyeCardProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [isInChatMode, setIsInChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [agentResponseText, setAgentResponseText] = useState(
    currentMilestone.agentGreeting || `BONJOUR ! JE SUIS L'AGENT DE ${currentMilestone.name.toUpperCase()}. COMMENT PUIS-JE VOUS AIDER ?`
  );
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [forceBlink, setForceBlink] = useState(false);
  const [gazeOverride, setGazeOverride] = useState<{ x: number; y: number } | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<WeddingMilestone | null>(null);

  // Micro-blink on milestone switch for lifelike organic reaction
  useEffect(() => {
    setForceBlink(true);
    const timer = setTimeout(() => setForceBlink(false), 140);
    return () => clearTimeout(timer);
  }, [currentMilestone.id]);

  // Sync greeting on milestone change
  useEffect(() => {
    if (currentMilestone.agentGreeting) {
      setAgentResponseText(currentMilestone.agentGreeting);
    } else {
      setAgentResponseText(`BONJOUR ! JE SUIS L'AGENT DE ${currentMilestone.name.toUpperCase()}. COMMENT PUIS-JE VOUS AIDER ?`);
    }
  }, [currentMilestone.id, currentMilestone.name, currentMilestone.agentGreeting]);

  // Chat submission with intelligent actions
  const handleSendChat = (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const query = (directPrompt || chatInput).trim().toUpperCase();
    if (!query) return;

    setChatInput("");
    setIsAgentThinking(true);
    playCardTone(currentMilestone.color, "change");

    if (cardContainerRef.current) {
      const rect = cardContainerRef.current.getBoundingClientRect();
      setGazeOverride({ x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.2 });
    }

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("heure") || lower.includes("quand") || lower.includes("timing") || lower.includes("horaire") || lower.includes("programme")) {
        reply = `HORAIRE : ${currentMilestone.timeSlot} AU ${currentMilestone.location.toUpperCase()}.`;
      } else if (lower.includes("musique") || lower.includes("morceau") || lower.includes("set") || lower.includes("chanson") || lower.includes("playlist")) {
        reply = `PLAYLIST CALIBRÉE POUR LE CRÉNEAU ${currentMilestone.timeSlot}.`;
      } else if (lower.includes("contact") || lower.includes("numéro") || lower.includes("téléphone") || lower.includes("tel")) {
        reply = `CONTACT DIRECT : ${currentMilestone.phone} (${currentMilestone.name}).`;
      } else if (lower.includes("matériel") || lower.includes("équipement") || lower.includes("sono") || lower.includes("scéno")) {
        reply = `ÉQUIPEMENT : ${currentMilestone.equipment.toUpperCase()}.`;
      } else if (lower.includes("message") || lower.includes("brief") || lower.includes("change") || lower.includes("modifie")) {
        const newMsg = `BRIEF CONFIRMÉ · ${query.replace(/MESSAGE|BRIEF|CHANGE|MODIFIE/g, "").trim() || "PRESTATION CONFIRMÉE"}`;
        onUpdateMilestone({ message: newMsg });
        reply = `BRIEF MIS À JOUR : "${newMsg}".`;
      } else {
        reply = `DEMANDE ENREGISTRÉE POUR ${currentMilestone.name.toUpperCase()} (TÉL: ${currentMilestone.phone}).`;
      }

      setAgentResponseText(reply);
      setIsAgentThinking(false);
      playCardTone(currentMilestone.color, "step");

      setForceBlink(true);
      setTimeout(() => setForceBlink(false), 220);

      if (cardContainerRef.current) {
        const rect = cardContainerRef.current.getBoundingClientRect();
        setGazeOverride({ x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.85 });
      }

      setTimeout(() => {
        setGazeOverride(null);
      }, 1800);
    }, 450);
  };

  const handleInputFocus = () => {
    if (cardContainerRef.current) {
      const rect = cardContainerRef.current.getBoundingClientRect();
      setGazeOverride({ x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.95 });
    }
  };

  const handleInputBlur = () => {
    if (!isAgentThinking) {
      setGazeOverride(null);
    }
  };

  return (
    <div
      ref={cardContainerRef}
      className="relative w-full select-none"
    >
      {/* SINGLE LIVING HERO CARD */}
      <div
        style={{ backgroundColor: currentMilestone.cardBg || "#FBF0DC" }}
        className="relative w-full overflow-hidden shadow-2xl border border-black/10 rounded-sm flex flex-col"
      >
        {/* Monster face with interactive eyes */}
        <Monster
          monsterBg={currentMilestone.color}
          eyeWhite={currentMilestone.cardBg || "#FBF0DC"}
          pupilColor="#000000"
          targetPoint={gazeOverride}
          forceBlink={forceBlink}
          onChangeColor={(newCol) => onUpdateMilestone({ color: newCol })}
          onCopyCardId={() =>
            navigator.clipboard?.writeText(
              `${currentMilestone.name} (${currentMilestone.role}) · ${currentMilestone.timeSlot} · ${currentMilestone.phone}`
            )
          }
          onToggleChatMode={() => setIsInChatMode(!isInChatMode)}
        />

        {/* ------------------------------------------------------------- */}
        {/* SOCLE DE LA CARTE: L'HORAIRE EN GRAND & TIMELINE DE POINTS    */}
        {/* ------------------------------------------------------------- */}
        {!isInChatMode ? (
          /* FACE PRINCIPALE: HORAIRE GRAND & PROPRE, SANS AUCUN PICTO SURCHARGÉ */
          <div className="w-full px-5 py-4 flex flex-col justify-between select-none relative" data-name="legend">
            <div>
              {/* 1. L'HORAIRE EN GRAND FORMAT (PUR, TYPOGRAPHIQUE) */}
              <div className="pb-2 border-b border-black/10">
                <input
                  type="text"
                  value={currentMilestone.timeSlot}
                  onChange={(e) => onUpdateMilestone({ timeSlot: e.target.value })}
                  placeholder="17:30 — 20:00"
                  className="text-[22px] sm:text-[26px] font-black uppercase font-mono tracking-tight text-black bg-transparent border-b border-dashed border-black/15 hover:border-black/50 focus:border-black outline-none w-full"
                />
              </div>

              {/* 2. Nom du Prestataire / Moment (Édition in-situ) */}
              <input
                type="text"
                value={currentMilestone.name}
                onChange={(e) => onUpdateMilestone({ name: e.target.value.toUpperCase() })}
                placeholder="NOM DU PRESTATAIRE..."
                className="mt-2.5 w-full bg-transparent border-b border-dashed border-black/25 hover:border-black/60 focus:border-black outline-none text-[22px] sm:text-[25px] font-black uppercase leading-tight tracking-[-0.01em] text-black"
              />

              {/* 3. Rôle / Spécialité (Édition in-situ) */}
              <input
                type="text"
                value={currentMilestone.role}
                onChange={(e) => onUpdateMilestone({ role: e.target.value.toUpperCase() })}
                placeholder="RÔLE & SPÉCIALITÉ..."
                className="mt-0.5 w-full bg-transparent border-b border-dashed border-black/20 focus:border-black outline-none text-[11.5px] font-bold uppercase text-black/70 truncate"
              />
            </div>

            {/* 4. Brief de Mission & Bouton Chat Agent Typographique */}
            <div className="my-2.5 flex items-center justify-between gap-3 text-black pt-1.5 border-t border-black/10">
              <input
                type="text"
                value={currentMilestone.message}
                onChange={(e) => onUpdateMilestone({ message: e.target.value.toUpperCase() })}
                placeholder="BRIEF / MISSION DU MOMENT..."
                className="flex-1 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-[0.02em] text-black bg-transparent border-b border-dashed border-black/25 hover:border-black/60 focus:border-black outline-none truncate"
              />

              <button
                type="button"
                onClick={() => setIsInChatMode(true)}
                className="px-2.5 py-1 rounded-full bg-black text-white hover:bg-neutral-800 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm transition-transform hover:scale-105 active:scale-95"
                title="Discuter avec l'agent"
              >
                CHAT
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 5. LA TIMELINE DANS LE SOCLE : PASTILLES DE COULEURS ÉPURÉES  */}
            {/* ------------------------------------------------------------- */}
            <div className="pt-2.5 border-t border-black/10 flex flex-col gap-1.5 select-none relative">
              {/* Micro-Tooltip au survol d'un point */}
              {hoveredMilestone && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9.5px] font-mono font-black px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-30 animate-in fade-in duration-100 flex items-center gap-1.5">
                  <span>{hoveredMilestone.timeSlot.split(" ")[0]}</span>
                  <span className="opacity-60">·</span>
                  <span>{hoveredMilestone.name.split(" ")[0]}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-1.5">
                {/* Play/Pause day simulation */}
                {onTogglePlayTimeline && (
                  <button
                    type="button"
                    onClick={onTogglePlayTimeline}
                    className="size-6 sm:size-7 rounded-full bg-black text-white hover:bg-neutral-800 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 text-[10px] font-bold"
                    title={isPlayingTimeline ? "Pause" : "Lecture 24h"}
                  >
                    {isPlayingTimeline ? "❚❚" : "▶"}
                  </button>
                )}

                {/* Left Step Arrow */}
                {onPrevMilestone && (
                  <button
                    type="button"
                    onClick={onPrevMilestone}
                    className="text-black/50 hover:text-black font-bold text-sm transition-colors px-1"
                    title="Précédent"
                  >
                    ‹
                  </button>
                )}

                {/* Chromatic Timeline Dots with fine connecting line */}
                <div className="flex-1 flex items-center justify-between gap-1 px-1 relative">
                  <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[1px] bg-black/15 pointer-events-none z-0" />

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
                              ? "size-4.5 sm:size-5 ring-2 ring-black shadow-md border-2 border-white"
                              : "size-3 sm:size-3.5 border border-black/30 shadow-xs"
                          }`}
                          style={{ backgroundColor: m.color }}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Right Step Arrow */}
                {onNextMilestone && (
                  <button
                    type="button"
                    onClick={onNextMilestone}
                    className="text-black/50 hover:text-black font-bold text-sm transition-colors px-1"
                    title="Suivant"
                  >
                    ›
                  </button>
                )}

                {/* Add New Moment directly from socle */}
                {onAddMilestone && (
                  <button
                    type="button"
                    onClick={onAddMilestone}
                    className="size-5 rounded-full bg-black/10 hover:bg-black text-black hover:text-white flex items-center justify-center shrink-0 transition-colors font-bold text-xs ml-0.5"
                    title="Ajouter un moment"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* FACE CONVERSATION: DISCUSSION DIRECTE DANS LE SOCLE AVEC L'AGENT */
          <div className="w-full px-5 py-3.5 flex flex-col justify-between select-none relative bg-[#F4E6CE] transition-all" data-name="socle-conversation">
            <div className="flex items-center justify-between text-black/60 border-b border-black/10 pb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-black">
                <span>AGENT · {currentMilestone.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsInChatMode(false)}
                className="text-[9px] font-black uppercase tracking-wider text-black/60 hover:text-black flex items-center gap-1 transition-colors"
              >
                <span>RETOUR</span>
              </button>
            </div>

            <div className="my-2 min-h-[36px] flex items-center overflow-hidden">
              {isAgentThinking ? (
                <div className="text-[12px] font-black uppercase tracking-wide text-black/40 animate-pulse">
                  RÉFLEXION EN COURS...
                </div>
              ) : (
                <div className="text-[12.5px] sm:text-[13.5px] font-black uppercase leading-tight tracking-tight text-black line-clamp-2">
                  {agentResponseText}
                </div>
              )}
            </div>

            {/* Quick Suggestion Buttons in Pure Typography */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar text-[8.5px] font-black uppercase">
              {[
                { label: "HORAIRES", query: "QUELS SONT LES HORAIRES EXACTS ?" },
                { label: "PLAYLIST", query: "QUELLE EST LA PLAYLIST PRÉVUE ?" },
                { label: "CONTACT", query: "QUEL EST LE CONTACT DIRECT ?" },
                { label: "MATÉRIEL", query: "QUEL MATÉRIEL EST PRÉVU ?" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(undefined, chip.query)}
                  className="px-2.5 py-1 rounded-md bg-black/10 hover:bg-black text-black hover:text-white transition-colors whitespace-nowrap shrink-0 font-bold"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-1 border-t border-black/15">
              <input
                type="text"
                value={chatInput}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => setChatInput(e.target.value.toUpperCase())}
                placeholder="MESSAGE EN MAJUSCULES... ↵"
                className="flex-1 bg-black/5 hover:bg-black/10 focus:bg-white border border-black/20 focus:border-black rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px] font-black uppercase tracking-wider text-black placeholder:text-black/40 outline-none transition-colors"
              />
              <button
                type="submit"
                className="size-7 rounded-lg bg-black text-white hover:bg-neutral-800 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 font-bold text-xs"
                title="Envoyer"
              >
                ↵
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EyeCard;
