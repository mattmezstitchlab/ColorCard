
import { Eye } from "./Eye";

export interface EyeCardProps {
  monsterBg?: string;
  cardBg?: string;
  eyeWhite?: string;
  pupilColor?: string;
  hexDisplay?: string;
  name?: string;
  label?: string;
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
      className="relative shrink-0 h-[432px] w-full overflow-clip"
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
          className="font-['Inter:Bold',_sans-serif] font-bold min-w-full relative shrink-0 text-[64px]"
          style={{ width: "min-content" }}
        >
          <p className="block leading-[68px] text-[64px] font-bold">{hexDisplay}</p>
        </div>
        <div
          className="font-['Inter:Medium',_sans-serif] font-medium min-w-full relative shrink-0 text-[24px]"
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
}: {
  hexDisplay: string;
  name: string;
  label: string;
}) {
  return (
    <div className="relative shrink-0 w-full" data-name="legend">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[55px] items-start justify-start px-0 py-[9px] relative w-full">
          <Hero hexDisplay={hexDisplay} name={name} />
          <div
            className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] min-w-full not-italic relative shrink-0 text-[#000000] text-[16px] text-left"
            style={{ width: "min-content" }}
          >
            <p className="block leading-[normal]">{label}</p>
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
}: EyeCardProps) {
  return (
    <div
      style={{ backgroundColor: cardBg }}
      className="relative w-full max-w-[458px]"
    >
      <div className="flex flex-col justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-center p-[18px] relative">
          <Monster monsterBg={monsterBg} eyeWhite={eyeWhite} pupilColor={pupilColor} />
          <Legend hexDisplay={hexDisplay} name={name} label={label} />
        </div>
      </div>
    </div>
  );
}
