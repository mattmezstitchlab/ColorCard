import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { playCardTone } from "../utils/audioSynth";

interface TimeScrubberProps {
  cardColor: string;
  timeMinutes: number; // 0 to 1439 (minutes in 24h)
  onChangeTime: (minutes: number) => void;
  markers?: Array<{ time: string; label: string; contextName: string }>;
}

export function TimeScrubber({
  cardColor,
  timeMinutes,
  onChangeTime,
  markers = [],
}: TimeScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeTime((timeMinutes + 10) % 1440);
        if (timeMinutes % 60 === 0) {
          playCardTone(cardColor, "time");
        }
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeMinutes, onChangeTime, cardColor]);

  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  // Time period label
  const getPeriodLabel = (h: number) => {
    if (h >= 5 && h < 12) return "Matinée · Préparation";
    if (h >= 12 && h < 14) return "Midi · Accueil";
    if (h >= 14 && h < 18) return "Après-midi · Balances & Répétitions";
    if (h >= 18 && h < 22) return "Soirée · Performance Live";
    return "Nuit · After & Clôture";
  };

  return (
    <div className="w-full bg-[#111117] border border-[#20202C] rounded-xl p-3 space-y-2 select-none shadow-lg">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-blue-400" />
          <span className="font-bold uppercase tracking-wider text-white">Lentille Temporelle 24h</span>
          <span className="text-[9px] text-[#78788C] hidden sm:inline">({getPeriodLabel(hours)})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-white px-2 py-0.5 rounded-md bg-[#1B1B26] border border-white/10">
            {formattedTime}
          </span>
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              playCardTone(cardColor, "hover");
            }}
            className={`size-6 rounded-md flex items-center justify-center transition-colors ${
              isPlaying ? "bg-amber-400 text-black" : "bg-[#20202C] hover:bg-white hover:text-black text-white"
            }`}
            title={isPlaying ? "Pause simulation" : "Lancer simulation 24h"}
          >
            {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
          </button>
          <button
            onClick={() => onChangeTime(720)} // Reset to 12:00
            className="size-6 rounded-md bg-[#20202C] hover:bg-[#2C2C3C] text-[#88889C] hover:text-white flex items-center justify-center transition-colors"
            title="Réinitialiser à midi"
          >
            <RotateCcw size={10} />
          </button>
        </div>
      </div>

      {/* TIMELINE SLIDER WITH MARKERS */}
      <div className="relative pt-2 pb-1">
        <input
          type="range"
          min="0"
          max="1439"
          value={timeMinutes}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChangeTime(v);
            if (v % 30 === 0) playCardTone(cardColor, "time");
          }}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-[#262638] rounded-lg"
        />

        {/* TIME STOPS TICKS */}
        <div className="flex justify-between text-[7.5px] font-mono text-[#58586E] px-0.5 mt-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>

        {/* ASSIGNMENT MARKERS OVER SLIDER */}
        {markers.map((m, idx) => {
          const parts = m.time.split(":");
          const markerMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
          const percent = (markerMin / 1440) * 100;
          return (
            <button
              key={idx}
              onClick={() => onChangeTime(markerMin)}
              className="absolute top-0 transform -translate-x-1/2 group"
              style={{ left: `${percent}%` }}
              title={`${m.time} - ${m.contextName}`}
            >
              <span className="block size-2 rounded-full bg-amber-400 ring-2 ring-black group-hover:scale-150 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
