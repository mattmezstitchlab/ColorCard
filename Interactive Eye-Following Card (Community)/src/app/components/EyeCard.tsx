import type { CSSProperties } from "react";
import { Eye } from "./Eye";

export interface EyeCardProps {
  monsterBg?: string;
  cardBg?: string;
  eyeWhite?: string;
  pupilColor?: string;
  hexDisplay?: string;
  name?: string;
  label?: string;
  price?: number;
  message?: string;
  displayMode?: "ticker" | "alternating" | "static" | "stack";
  pattern?: string;
  patternAnimated?: boolean;
  patternColor?: string;
  patternScale?: number;
  patternOpacity?: number;
  patternRotation?: number;
}

function Eyes({ eyeWhite, pupilColor }: { eyeWhite: string; pupilColor: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" data-name="eyes">
      <div className="flex items-center justify-center gap-1">
        <Eye isRightEye={false} eyeColor={eyeWhite} pupilColor={pupilColor} />
        <Eye isRightEye={true} eyeColor={eyeWhite} pupilColor={pupilColor} />
      </div>
    </div>
  );
}

function Monster({ monsterBg, eyeWhite, pupilColor, pattern, patternAnimated, patternColor, patternScale, patternOpacity, patternRotation }: { monsterBg: string; eyeWhite: string; pupilColor: string; pattern: string; patternAnimated: boolean; patternColor: string; patternScale: number; patternOpacity: number; patternRotation: number }) {
  const patternStyles: Record<string, CSSProperties> = {
    none: {},
    stripes: { backgroundImage: "repeating-linear-gradient(var(--cc-pattern-rotation), transparent 0 18px, var(--cc-pattern-color) 18px 24px)" },
    checker: { backgroundImage: "linear-gradient(45deg, var(--cc-pattern-color) 25%, transparent 25%, transparent 75%, var(--cc-pattern-color) 75%), linear-gradient(45deg, var(--cc-pattern-color) 25%, transparent 25%, transparent 75%, var(--cc-pattern-color) 75%)", backgroundPosition: "0 0, 14px 14px", backgroundSize: "28px 28px" },
    dots: { backgroundImage: "radial-gradient(var(--cc-pattern-color) 2px, transparent 2.5px)", backgroundSize: "18px 18px" },
    grid: { backgroundImage: "linear-gradient(var(--cc-pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--cc-pattern-color) 1px, transparent 1px)", backgroundSize: "22px 22px" },
    waves: { backgroundImage: "repeating-radial-gradient(ellipse at 0 100%, transparent 0 12px, var(--cc-pattern-color) 13px 15px, transparent 16px 28px)" },
    tiger: { backgroundImage: "repeating-linear-gradient(var(--cc-pattern-rotation), transparent 0 22px, var(--cc-pattern-color) 23px 30px, transparent 31px 48px)" },
    leopard: { backgroundImage: "radial-gradient(circle at 20% 30%, var(--cc-pattern-color) 0 4px, transparent 5px), radial-gradient(circle at 70% 60%, var(--cc-pattern-color) 0 5px, transparent 6px)", backgroundSize: "44px 44px, 58px 58px" },
    zebra: { backgroundImage: "repeating-linear-gradient(var(--cc-pattern-rotation), transparent 0 11px, rgba(0,0,0,.25) 12px 18px, transparent 19px 30px)" },
    scales: { backgroundImage: "radial-gradient(ellipse at 50% 100%, transparent 0 9px, var(--cc-pattern-color) 10px 12px, transparent 13px)", backgroundSize: "24px 18px" },
    bubbles: { backgroundImage: "radial-gradient(circle, var(--cc-pattern-color) 0 3px, transparent 4px), radial-gradient(circle, rgba(0,0,0,.12) 0 5px, transparent 6px)", backgroundSize: "30px 30px, 47px 47px", backgroundPosition: "0 0, 15px 12px" },
    botanical: { backgroundImage: "radial-gradient(ellipse 9px 18px at 25% 25%, var(--cc-pattern-color) 0 45%, transparent 50%), radial-gradient(ellipse 9px 18px at 75% 75%, var(--cc-pattern-color) 0 45%, transparent 50%)", backgroundSize: "44px 44px" },
    diagonal: { backgroundImage: "repeating-linear-gradient(var(--cc-pattern-rotation), transparent 0 8px, var(--cc-pattern-color) 8px 10px, transparent 10px 22px)" },
    pixel: { backgroundImage: "linear-gradient(90deg, var(--cc-pattern-color) 50%, transparent 50%), linear-gradient(var(--cc-pattern-color) 50%, transparent 50%)", backgroundSize: "16px 16px" },
    prism: { backgroundImage: "repeating-conic-gradient(from 15deg, var(--cc-pattern-color) 0 10deg, transparent 10deg 25deg)" },
  };
  const hex = patternColor.replace("#","");
  const r = parseInt(hex.slice(0,2),16) || 0, g = parseInt(hex.slice(2,4),16) || 0, b = parseInt(hex.slice(4,6),16) || 0;
  const alpha = Math.max(0.05, Math.min(0.6, patternOpacity / 100));
  const rgba = `rgba(${r},${g},${b},${alpha})`;
  const base = patternStyles[pattern] ?? {};
  const patternStyle: CSSProperties = { ...base, backgroundSize: `${patternScale}px ${patternScale}px`, ["--cc-pattern-color" as string]: rgba, ["--cc-pattern-rotation" as string]: `${patternRotation}deg` };
  return (
    <div
      style={{ backgroundColor: monsterBg, ...patternStyle }}
      className={`relative aspect-square w-full overflow-hidden ${patternAnimated && pattern !== "none" ? "colorcard-pattern-motion" : ""}`}
      data-name="monster"
    >
      <Eyes eyeWhite={eyeWhite} pupilColor={pupilColor} />
    </div>
  );
}
function Legend({ hexDisplay, name, label, price, message, displayMode }: {
  hexDisplay: string;
  name: string;
  label: string;
  price: number;
  message: string;
  displayMode: "ticker" | "alternating" | "static" | "stack";
}) {
  const text = message || label;
  const content =
    displayMode === "ticker" ? (
      <div className="overflow-hidden whitespace-nowrap">
        <div className="colorcard-marquee inline-block min-w-full pr-8">{text}</div>
        <div className="colorcard-marquee inline-block pr-8">{text}</div>
      </div>
    ) :
    displayMode === "alternating" ? <span className="animate-pulse">{text}</span> :
    displayMode === "stack" ? <span className="line-clamp-2">{text}</span> :
    <span>{text}</span>;

  return (
    <div className="min-h-[180px] w-full px-5 py-6" data-name="legend">
      <div className="text-[16px] font-semibold uppercase tracking-[0.14em] text-black/55">{hexDisplay}</div>
      <div className="mt-1 truncate text-[30px] font-bold uppercase leading-tight tracking-[0.01em] text-black">{name}</div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[18px] font-semibold uppercase leading-snug tracking-[0.03em] text-black/70">
        <span className="min-w-0 flex-1 overflow-hidden">{content}</span>
        {price > 0 && <span className="shrink-0 font-semibold">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price)}</span>}
      </div>
    </div>
  );
}

export function EyeCard({
  monsterBg = "#0062AD",
  cardBg = "#FBF0DC",
  eyeWhite = "#FBF0DC",
  pupilColor = "#000000",
  hexDisplay = "SAXOPHONE",
  name = "Saxophoniste",
  label = "Cocktail",
  price = 0,
  message = "",
  displayMode = "ticker",
  pattern = "none",
  patternAnimated = false,
  patternColor = "#000000",
  patternScale = 28,
  patternOpacity = 22,
  patternRotation = 45,
}: EyeCardProps) {
  return (
    <div style={{ backgroundColor: cardBg }} className="relative w-full overflow-hidden">
      <div className="flex flex-col overflow-hidden">
        <Monster
          monsterBg={monsterBg}
          eyeWhite={eyeWhite}
          pupilColor={pupilColor}
          pattern={pattern}
          patternAnimated={patternAnimated}
          patternColor={patternColor}
          patternScale={patternScale}
          patternOpacity={patternOpacity}
          patternRotation={patternRotation}
        />
        <Legend hexDisplay={hexDisplay} name={name} label={label} price={price} message={message} displayMode={displayMode} />
      </div>
    </div>
  );
}
