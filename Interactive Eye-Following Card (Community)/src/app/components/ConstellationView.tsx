import React, { useEffect, useRef, useState } from "react";
import { ColorCardRecord, ContextRecord } from "../App";
import { EyeCard } from "./EyeCard";
import { NodalContextIcon } from "./ModernIcons";
import { playCardTone } from "../utils/audioSynth";

interface ConstellationViewProps {
  cards: ColorCardRecord[];
  contexts: ContextRecord[];
  onSelectCard: (cardId: string) => void;
}

export function ConstellationView({ cards, contexts, onSelectCard }: { cards: ColorCardRecord[]; contexts: ContextRecord[]; onSelectCard: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredContextId, setHoveredContextId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  // Animation loop for organic cosmic drift
  useEffect(() => {
    let animId: number;
    const loop = () => {
      setTime((t) => t + 0.008);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Node positions computation
  const contextPositions = contexts.map((ctx, idx) => {
    const angle = (idx / contexts.length) * Math.PI * 2 + time * 0.2;
    const radius = 180 + Math.sin(time + idx) * 15;
    return {
      context: ctx,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * (radius * 0.7),
    };
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex-1 w-full h-[calc(100vh-120px)] overflow-hidden bg-[#07070A] rounded-2xl border border-[#1C1C28] flex items-center justify-center select-none"
    >
      {/* BACKGROUND COSMIC GRID */}
      <div className="absolute inset-0 bg-[radial-gradient(#202030_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* CENTER GRAVITATIONAL CORE */}
      <div className="absolute size-28 rounded-full bg-blue-500/10 border border-blue-500/20 blur-sm animate-pulse" />
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10">
        <NodalContextIcon size={24} className="text-blue-400 opacity-80" />
        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#707088] mt-1">
          Noyau Gravitationnel
        </span>
      </div>

      {/* SVG CONNECTING BEAMS / ORBITS */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <g transform={`translate(${containerRef.current?.clientWidth ? containerRef.current.clientWidth / 2 : 400}, ${containerRef.current?.clientHeight ? containerRef.current.clientHeight / 2 : 300})`}>
          {/* Orbital tracks */}
          <ellipse cx="0" cy="0" rx="180" ry="126" fill="none" stroke="#222234" strokeWidth="1" strokeDasharray="3 4" />
          <ellipse cx="0" cy="0" rx="280" ry="196" fill="none" stroke="#181826" strokeWidth="1" strokeDasharray="2 6" />

          {/* Links between cards and their assigned contexts */}
          {cards.map((card, cardIdx) => {
            const cardAngle = (cardIdx / cards.length) * Math.PI * 2 + time * 0.35;
            const cardRadius = 260 + Math.cos(time + cardIdx) * 20;
            const cardX = Math.cos(cardAngle) * cardRadius;
            const cardY = Math.sin(cardAngle) * (cardRadius * 0.7);

            return card.assignments.map((asg) => {
              const ctxPos = contextPositions.find((cp) => cp.context.id === asg.contextId);
              if (!ctxPos) return null;

              const isHighlighted = hoveredCardId === card.id || hoveredContextId === asg.contextId;

              return (
                <line
                  key={`${card.id}-${asg.contextId}`}
                  x1={cardX}
                  y1={cardY}
                  x2={ctxPos.x}
                  y2={ctxPos.y}
                  stroke={isHighlighted ? card.color : "#2C2C40"}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeOpacity={isHighlighted ? 0.9 : 0.35}
                  strokeDasharray={isHighlighted ? "none" : "2 4"}
                  className="transition-all duration-200"
                />
              );
            });
          })}
        </g>
      </svg>

      {/* CONTEXT NODES */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {contextPositions.map(({ context, x, y }) => {
          const isHovered = hoveredContextId === context.id;
          return (
            <div
              key={context.id}
              onMouseEnter={() => setHoveredContextId(context.id)}
              onMouseLeave={() => setHoveredContextId(null)}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute pointer-events-auto cursor-pointer group transition-transform duration-75"
            >
              <div
                className={`px-3 py-1.5 rounded-full backdrop-blur-md border transition-all flex items-center gap-2 shadow-xl ${
                  isHovered
                    ? "bg-amber-400 text-black border-white scale-110 ring-4 ring-amber-400/30"
                    : "bg-[#14141E]/90 text-white border-[#34344A] hover:border-white"
                }`}
              >
                <span className="size-2 rounded-full bg-amber-400 group-hover:bg-black animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{context.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING COLORCARDS */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {cards.map((card, idx) => {
          const cardAngle = (idx / cards.length) * Math.PI * 2 + time * 0.35;
          const cardRadius = 260 + Math.cos(time + idx) * 20;
          const cardX = Math.cos(cardAngle) * cardRadius;
          const cardY = Math.sin(cardAngle) * (cardRadius * 0.7);
          const isHovered = hoveredCardId === card.id;

          return (
            <div
              key={card.id}
              onMouseEnter={() => {
                setHoveredCardId(card.id);
                playCardTone(card.color, "hover");
              }}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => onSelectCard(card.id)}
              style={{
                transform: `translate(${cardX}px, ${cardY}px) scale(${isHovered ? 1.08 : 0.82})`,
              }}
              className="absolute w-[180px] pointer-events-auto cursor-pointer transition-all duration-200 z-20 hover:z-30 group"
            >
              <div className="relative shadow-2xl">
                <EyeCard
                  monsterBg={card.color}
                  cardBg={card.cardBg || "#FBF0DC"}
                  eyeWhite={card.cardBg || "#FBF0DC"}
                  pupilColor="#000000"
                  hexDisplay={card.category.toUpperCase()}
                  name={card.name}
                  label={card.role}
                  message={card.message}
                  displayMode="static"
                  pattern={card.pattern || "none"}
                  patternAnimated={card.patternAnimated || false}
                  patternColor={card.patternColor || "#000000"}
                  patternScale={card.patternScale || 28}
                  patternOpacity={card.patternOpacity ?? 25}
                  patternRotation={card.patternRotation ?? 45}
                  compact={true}
                />
              </div>

              {/* CARD LABEL PILL */}
              <div className="mt-1 text-center">
                <span className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/80 text-white border border-white/20">
                  {card.assignments.length} contexte{card.assignments.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM INFO HINT */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[9px] uppercase tracking-wider text-[#606075] pointer-events-none">
        <span>Constellation Nodal Orbitale</span>
        <span>Cliquez sur une carte pour l'ouvrir dans le Studio</span>
      </div>
    </div>
  );
}
