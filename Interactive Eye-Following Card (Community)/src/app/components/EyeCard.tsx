
import { Eye } from "./Eye";

export interface EyeCardProps {
  monsterBg?: string;
  cardBg?: string;
  eyeWhite?: string;
  pupilColor?: string;
  hexDisplay?: string;
  name?: string;
  label?: string;
  start?: string;
  end?: string;
  price?: number;
}

function Eyes({ eyeWhite, pupilColor }: { eyeWhite: string; pupilColor: string }) {
  return (
    <div className="relative shrink-0" data-name="eyes">
      <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center p-0 relative">
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
      className="relative shrink-0 aspect-[1.586/1] w-full overflow-clip"
      data-name="monster"
    >
      <div className="flex flex-col items-center justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-center justify-center px-[22px] py-[117px] relative">
          <Eyes eyeWhite={eyeWhite} pupilColor={pupilColor} />
        </div>
      </div>
    </div>
  );
}

function Hero({ hexDisplay, name }: { hexDisplay: string; name: string }) {
  return (
    <div className="relative shrink-0 w-full" data-name="hero">
      <div className="box-border content-stretch flex flex-col items-start justify-start leading-[0] not-italic p-0 relative text-[#000000] text-left w-full">
        <div
          className="font-['Inter:Bold',_sans-serif] font-bold min-w-full relative shrink-0 text-[28px]"
          style={{ width: "min-content" }}
        >
          <p className="block leading-[30px] text-[28px] font-bold">{hexDisplay}</p>
        </div>
        <div
          className="font-['Inter:Medium',_sans-serif] font-medium min-w-full relative shrink-0 text-[15px]"
          style={{ width: "min-content" }}
        >
          <p className="block leading-[normal] text-[24px]">{name}</p>
        </div>
      </div>
    </div>
  );
}

function Legend({
  hexDisplay,
  name,
  label,
  start,
  end,
  price,
}: {
  hexDisplay: string;
  name: string;
  label: string;
  start: string;
  end: string;
  price: number;
}) {
  return (
    <div className="relative shrink-0 w-full" data-name="legend">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start px-0 py-[9px] relative w-full">
          <Hero hexDisplay={hexDisplay} name={name} />
          <div className="flex w-full items-center justify-between gap-3 text-[#000000]">
            <div className="min-w-0 truncate text-[11px] font-medium leading-[normal]">{label}</div>
            <div className="shrink-0 text-[11px] font-semibold leading-[normal]">{start} — {end}</div>
          </div>
          <div className="flex w-full items-center justify-between gap-3 text-[#000000]/65">
            <div className="min-w-0 truncate text-[9px] leading-[normal]">Prestation · horaires</div>
            <div className="shrink-0 text-[10px] font-semibold leading-[normal]">
              {price > 0 ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EyeCard({
  monsterBg = "#0062AD",
  cardBg = "#FBF0DC",
  eyeWhite = "#FBF0DC",
  pupilColor = "#000000",
  hexDisplay = "#0062AD",
  name = "Cookie Monster",
  label = "Sesame Street",
  start = "14:00",
  end = "16:00",
  price = 0,
}: EyeCardProps) {
  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="relative w-full max-w-[380px]"
    >
      <div className="flex flex-col justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-center p-[18px] relative">
          <Monster monsterBg={monsterBg} eyeWhite={eyeWhite} pupilColor={pupilColor} />
          <Legend hexDisplay={hexDisplay} name={name} label={label} start={start} end={end} price={price} />
        </div>
      </div>
    </div>
  );
}
