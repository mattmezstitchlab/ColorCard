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
  const patternStyle: React.CSSProperties = pattern === "none" ? {} :
    pattern === "stripes" ? { backgroundImage: "repeating-linear-gradient(135deg, transparent 0 18px, rgba(0,0,0,.18) 18px 24px)" } :
    pattern === "checker" ? { backgroundImage: "linear-gradient(45deg, rgba(0,0,0,.18) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.18) 75%), linear-gradient(45deg, rgba(0,0,0,.18) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.18) 75%)", backgroundPosition: "0 0, 14px 14px", backgroundSize: "28px 28px" } :
    pattern === "dots" ? { backgroundImage: "radial-gradient(rgba(0,0,0,.22) 2px, transparent 2.5px)", backgroundSize: "18px 18px" } :
    pattern === "grid" ? { backgroundImage: "linear-gradient(rgba(0,0,0,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.14) 1px, transparent 1px)", backgroundSize: "22px 22px" } :
    pattern === "waves" ? { backgroundImage: "repeating-radial-gradient(ellipse at 0 100%, transparent 0 12px, rgba(0,0,0,.16) 13px 15px, transparent 16px 28px)" } :
    pattern === "tiger" ? { backgroundImage: "repeating-linear-gradient(120deg, transparent 0 22px, rgba(0,0,0,.24) 23px 30px, transparent 31px 48px)" } :
    pattern === "leopard" ? { backgroundImage: "radial-gradient(circle at 20% 30%, rgba(0,0,0,.28) 0 4px, transparent 5px), radial-gradient(circle at 70% 60%, rgba(0,0,0,.22) 0 5px, transparent 6px)", backgroundSize: "44px 44px, 58px 58px" } :
    pattern === "pixel" ? { backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.15) 50%, transparent 50%), linear-gradient(rgba(0,0,0,.15) 50%, transparent 50%)", backgroundSize: "16px 16px" } : {};
  return (
    <div style={{ backgroundColor: monsterBg, ...patternStyle }} className={`relative aspect-square w-full overflow-hidden ${patternAnimated && pattern !== "none" ? "colorcard-pattern-motion" : ""}`} data-name="monster">
  return (
    <div style={{ backgroundColor: monsterBg }} className="relative aspect-square w-full overflow-hidden" data-name="monster">
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
}: EyeCardProps) {
  return (
    <div style={{ backgroundColor: cardBg }} className="relative w-full overflow-hidden">
      <div className="flex flex-col overflow-hidden">
        <Monster monsterBg={monsterBg} eyeWhite={eyeWhite} pupilColor={pupilColor} pattern={pattern} patternAnimated={patternAnimated} />
        <Legend hexDisplay={hexDisplay} name={name} label={label} price={price} message={message} displayMode={displayMode} />
      </div>
    </div>
  );
}
