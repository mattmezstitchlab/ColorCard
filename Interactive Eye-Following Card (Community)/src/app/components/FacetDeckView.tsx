import React from "react";
import { ColorCardRecord, ContextRecord } from "../App";
import { EyeCard } from "./EyeCard";
import { Layers, X } from "lucide-react";

interface FacetDeckViewProps {
  card: ColorCardRecord;
  contexts: ContextRecord[];
  onClose: () => void;
}

export function FacetDeckView({ card, contexts, onClose }: FacetDeckViewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222230]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-400 flex items-center gap-2">
            <Layers size={13} />
            Mode Multi-Facettes · Perspective Shift
          </div>
          <h2 className="text-xl font-black uppercase text-white mt-1">
            Déclinaisons de « {card.name} »
          </h2>
          <p className="text-xs text-[#88889C] mt-0.5">
            Une seule donnée source. Autant de reflets que de contextes d'affectation.
          </p>
        </div>

        <button
          onClick={onClose}
          className="size-9 rounded-full bg-[#181822] hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X size={16} />
        </button>
      </div>

      {/* MULTI-FACET CARDS GRID */}
      <div className="my-auto py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {/* 1. CARTE UNIVERSELLE FONDAMENTALE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-white px-1">
            <span>01. Carte Universelle</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono">Base</span>
          </div>

          <div className="relative transform transition-transform hover:scale-[1.02]">
            <EyeCard
              monsterBg={card.color}
              cardBg={card.cardBg || "#FBF0DC"}
              eyeWhite={card.cardBg || "#FBF0DC"}
              pupilColor="#000000"
              hexDisplay={card.category.toUpperCase()}
              name={card.name}
              label={[card.role, card.city].filter(Boolean).join(" · ")}
              message={card.message}
              displayMode={card.displayMode}
              pattern={card.pattern || "none"}
              patternAnimated={card.patternAnimated || false}
              patternAnimationSpeed={card.patternAnimationSpeed || "normal"}
              patternColor={card.patternColor || "#000000"}
              patternScale={card.patternScale || 28}
              patternOpacity={card.patternOpacity ?? 25}
              patternRotation={card.patternRotation ?? 45}
            />
          </div>
          <p className="text-[10px] text-[#707085] px-1 italic">
            Message par défaut et posture générale de la carte dans le registre.
          </p>
        </div>

        {/* CONTEXT-SPECIFIC FACETS */}
        {card.assignments.map((asg, idx) => {
          const ctx = contexts.find((c) => c.id === asg.contextId);
          const auraType =
            ctx?.name.toLowerCase().includes("gala") ? "gala" : ctx?.name.toLowerCase().includes("nuit") ? "nuit_blanche" : "mirage";

          return (
            <div key={asg.contextId} className="space-y-2">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-amber-400 px-1">
                <span>0{idx + 2}. Reflet {ctx?.name || asg.contextId}</span>
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">
                  {asg.time || "Spécifique"}
                </span>
              </div>

              <div className="relative transform transition-transform hover:scale-[1.02]">
                <EyeCard
                  monsterBg={card.color}
                  cardBg={card.cardBg || "#FBF0DC"}
                  eyeWhite={card.cardBg || "#FBF0DC"}
                  pupilColor="#000000"
                  hexDisplay={(ctx?.kind || "CONTEXTE").toUpperCase()}
                  name={card.name}
                  label={[card.role, asg.location || ctx?.city || card.city].filter(Boolean).join(" · ")}
                  message={asg.message || card.message}
                  displayMode={asg.displayMode || card.displayMode}
                  pattern={card.pattern || "none"}
                  patternAnimated={card.patternAnimated || false}
                  patternAnimationSpeed={card.patternAnimationSpeed || "normal"}
                  patternColor={card.patternColor || "#000000"}
                  patternScale={card.patternScale || 28}
                  patternOpacity={card.patternOpacity ?? 25}
                  patternRotation={card.patternRotation ?? 45}
                  contextAura={auraType}
                  showSpectralSeal={true}
                />
              </div>

              <div className="text-[10px] text-[#88889C] px-1 space-y-0.5">
                <div className="font-semibold text-white">📍 {asg.location || ctx?.city}</div>
                <div className="text-[9px] text-[#606075]">Horaire assigné : {asg.time || "Non défini"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="text-center text-[9px] uppercase tracking-widest text-[#505065] pt-4 border-t border-[#20202C]">
        ColorCard Studio · Perspective Shift Engine
      </div>
    </div>
  );
}
