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

function Monster({
  monsterBg,
  eyeWhite,
  pupilColor,
}: {
  monsterBg: string;
  eyeWhite: string;
  pupilColor: string;
}) {
  return (
    <div
      style={{ backgroundColor: monsterBg }}
      className="relative h-[150px] w-full overflow-hidden"
      data-name="monster"
    >
      <Eyes eyeWhite={eyeWhite} pupilColor={pupilColor} />
    </div>
  );
}

function Legend({
  hexDisplay,
  name,
  label,
  price,
  message,
  displayMode,
}: {
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
    displayMode === "alternating" ? (
      <span className="animate-pulse">{text}</span>
    ) :
    displayMode === "stack" ? (
      <span className="line-clamp-2">{text}</span>
    ) : <span>{text}</span>;

  return (
  return (
    <div className="w-full px-4 py-3" data-name="legend">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/55">
        {hexDisplay}
      </div>
      <div className="mt-0.5 truncate text-[16px] font-bold leading-tight text-black">
        {name}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-black/65">
        <span className="min-w-0 flex-1 overflow-hidden">{content}</span>
        {price > 0 && <span className="shrink-0 font-semibold">{new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(price)}</span>}
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
}: EyeCardProps) {
  return (
    <div style={{ backgroundColor: cardBg }} className="relative w-full overflow-hidden">
      <div className="flex flex-col overflow-hidden">
        <Monster monsterBg={monsterBg} eyeWhite={eyeWhite} pupilColor={pupilColor} />
        <Legend hexDisplay={hexDisplay} name={name} label={label} price={price} message={message} displayMode={displayMode} />
      </div>
    </div>
  );
}
