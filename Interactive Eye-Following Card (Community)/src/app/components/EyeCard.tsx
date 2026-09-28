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

function Monster({ monsterBg, eyeWhite, pupilColor, pattern, patternAnimated }: { monsterBg: string; eyeWhite: string; pupilColor: string; pattern: string; patternAnimated: boolean }) {
  const patternStyles: Record<string, CSSProperties> = {
    none: {},
    stripes: { backgroundImage: "repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,.18) 18px 24px)" },
    checker: { backgroundImage: "linear-gradient(45deg, rgba(0,0,0,.18) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.18) 75%), linear-gradient(45deg, rgba(0,0,0,.18) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.18) 75%)", backgroundPosition: "0 0, 14px 14px", backgroundSize: "28px 28px" },
    dots: { backgroundImage: "radial-gradient(rgba(0,0,0,.22) 2px, transparent 2.5px)", backgroundSize: "18px 18px" },
    grid: { backgroundImage: "linear-gradient(rgba(0,0,0,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.14) 1px, transparent 1px)", backgroundSize: "22px 22px" },
    waves: { backgroundImage: "repeating-radial-gradient(ellipse at 0 100%, transparent 0 12px, rgba(0,0,0,.16) 13px 15px, transparent 16px 28px)" },
    tiger: { backgroundImage: "repeating-linear-gradient(120deg, transparent 0 22px, rgba(0,0,0,.24) 23px 30px, transparent 31px 48px)" },
    leopard: { backgroundImage: "radial-gradient(circle at 20% 30%, rgba(0,0,0,.28) 0 4px, transparent 5px), radial-gradient(circle at 70% 60%, rgba(0,0,0,.22) 0 5px, transparent 6px)", backgroundSize: "44px 44px, 58px 58px" },
    zebra: { backgroundImage: "repeating-linear-gradient(160deg, transparent 0 11px, rgba(0,0,0,.25) 12px 18px, transparent 19px 30px)" },
    scales: { backgroundImage: "radial-gradient(ellipse at 50% 100%, transparent 0 9px, rgba(0,0,0,.2) 10px 12px, transparent 13px)", backgroundSize: "24px 18px" },
    bubbles: { backgroundImage: "radial-gradient(circle, rgba(0,0,0,.2) 0 3px, transparent 4px), radial-gradient(circle, rgba(0,0,0,.12) 0 5px, transparent 6px)", backgroundSize: "30px 30px, 47px 47px", backgroundPosition: "0 0, 15px 12px" },
    botanical: { backgroundImage: "radial-gradient(ellipse 9px 18px at 25% 25%, rgba(0,0,0,.16) 0 45%, transparent 50%), radial-gradient(ellipse 9px 18px at 75% 75%, rgba(0,0,0,.13) 0 45%, transparent 50%)", backgroundSize: "44px 44px" },
    diagonal: { backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,.16) 8px 10px, transparent 10px 22px)" },
    pixel: { backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.15) 50%, transparent 50%), linear-gradient(rgba(0,0,0,.15) 50%, transparent 50%)", backgroundSize: "16px 16px" },
    prism: { backgroundImage: "repeating-conic-gradient(from 15deg, rgba(0,0,0,.13) 0 10deg, transparent 10deg 25deg)" },
  };
  const patternStyle = patternStyles[pattern] ?? {};
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
