import { useState } from "react";
import { EyeCard } from "./components/EyeCard";
import { Plus, Shuffle, RotateCcw, Trash2, Palette } from "lucide-react";

interface CardData {
  id: string;
  monsterBg: string;
  cardBg: string;
  eyeWhite: string;
  pupilColor: string;
  hexDisplay: string;
  name: string;
  label: string;
}

const CREAM = "#FBF0DC";

const PRESET_COLORS = [
  { color: "#0062AD", name: "Cookie Monster" },
  { color: "#E8391D", name: "Elmo" },
  { color: "#F7C948", name: "Big Bird" },
  { color: "#3D7A2B", name: "Oscar" },
  { color: "#7B5EA7", name: "Grover" },
  { color: "#8B6355", name: "Snuffleupagus" },
  { color: "#C63678", name: "Abby Cadabby" },
  { color: "#FF6B35", name: "Zoe" },
  { color: "#2E9B8A", name: "Rosita" },
  { color: "#4A235A", name: "The Count" },
  { color: "#E8A030", name: "Prairie Dawn" },
  { color: "#1B6B3B", name: "Kermit" },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeCard(color: string, name: string, label = "Sesame Street"): CardData {
  return {
    id: uid(),
    monsterBg: color,
    cardBg: CREAM,
    eyeWhite: CREAM,
    pupilColor: "#000000",
    hexDisplay: color.toUpperCase(),
    name,
    label,
  };
}

const DEFAULT_CARDS: CardData[] = PRESET_COLORS.map((p) =>
  makeCard(p.color, p.name)
);

const NATURAL_W = 458;
const NATURAL_H = 680;

const SIZES = { S: 0.5, M: 0.65, L: 0.85 } as const;
type SizeKey = keyof typeof SIZES;

function ScaledCard({
  scale,
  selected,
  onSelect,
  children,
}: {
  scale: number;
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  const w = Math.round(NATURAL_W * scale);
  const h = Math.round(NATURAL_H * scale);
  return (
    <div
      className={`relative flex-shrink-0 cursor-pointer transition-all duration-150 rounded-[2px] ${
        selected
          ? "ring-2 ring-white ring-offset-2 ring-offset-[#111111]"
          : "ring-2 ring-transparent hover:ring-white/20 ring-offset-2 ring-offset-[#111111]"
      }`}
      style={{ width: w, height: h, overflow: "hidden" }}
      onClick={onSelect}
    >
      <div
        style={{
          width: NATURAL_W,
          height: NATURAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
      {selected && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#555] mb-2">
      {children}
    </div>
  );
}

function ColorSwatch({
  color,
  active,
  title,
  onClick,
}: {
  color: string;
  active?: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-9 rounded transition-all duration-100 hover:scale-110 ${
        active ? "ring-2 ring-white ring-offset-1 ring-offset-[#1A1A1A]" : ""
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-[#555] uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function App() {
  const [cards, setCards] = useState<CardData[]>(DEFAULT_CARDS);
  const [size, setSize] = useState<SizeKey>("M");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scale = SIZES[size];
  const selectedCard = cards.find((c) => c.id === selectedId) ?? null;

  const handleCanvasClick = () => setSelectedId(null);

  const handleCardClick = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const updateCard = (id: string, updates: Partial<CardData>) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  };

  const handlePresetClick = (color: string, name: string) => {
    if (selectedCard) {
      updateCard(selectedCard.id, {
        monsterBg: color,
        hexDisplay: color.toUpperCase(),
        name,
      });
    } else {
      setCards((prev) => [...prev, makeCard(color, name)]);
    }
  };

  const shuffleColors = () => {
    setCards((prev) =>
      prev.map((card) => {
        const picked =
          PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
        return {
          ...card,
          monsterBg: picked.color,
          hexDisplay: picked.color.toUpperCase(),
          name: picked.name,
        };
      })
    );
  };

  const resetCards = () => {
    setCards(DEFAULT_CARDS.map((c) => ({ ...c, id: uid() })));
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[252px] flex-shrink-0 bg-[#161616] border-r border-[#252525] flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-2.5">
            <Palette size={14} className="text-[#FBF0DC]" />
            <span className="text-[#FBF0DC] text-[11px] font-bold tracking-[0.18em] uppercase">
              Monster Palette
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0 flex-1">
          {/* Card Size */}
          <div className="px-4 py-4 border-b border-[#252525]">
            <SectionLabel>Card Size</SectionLabel>
            <div className="flex gap-1.5">
              {(Object.keys(SIZES) as SizeKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded transition-colors ${
                    size === s
                      ? "bg-white text-black"
                      : "bg-[#252525] text-[#777] hover:bg-[#2E2E2E] hover:text-[#CCC]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div className="px-4 py-4 border-b border-[#252525]">
            <SectionLabel>
              {selectedCard ? "Change Color" : "Add Card"}
            </SectionLabel>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <ColorSwatch
                  key={preset.color}
                  color={preset.color}
                  title={preset.name}
                  active={selectedCard?.monsterBg === preset.color}
                  onClick={() => handlePresetClick(preset.color, preset.name)}
                />
              ))}
              {/* Custom color picker */}
              <label
                title="Custom color"
                className="size-9 rounded bg-[#252525] flex items-center justify-center cursor-pointer hover:bg-[#2E2E2E] transition-colors"
              >
                <Plus size={13} className="text-[#666]" />
                <input
                  type="color"
                  className="sr-only"
                  onChange={(e) => {
                    const color = e.target.value;
                    if (selectedCard) {
                      updateCard(selectedCard.id, {
                        monsterBg: color,
                        hexDisplay: color.toUpperCase(),
                      });
                    } else {
                      setCards((prev) => [
                        ...prev,
                        makeCard(color, "Custom"),
                      ]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Canvas Actions */}
          <div className="px-4 py-4 border-b border-[#252525]">
            <SectionLabel>Canvas</SectionLabel>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={shuffleColors}
                className="flex items-center gap-2 px-3 py-2 rounded bg-[#252525] text-[#AAA] text-[11px] font-medium hover:bg-[#2E2E2E] hover:text-white transition-colors"
              >
                <Shuffle size={12} />
                Shuffle All Colors
              </button>
              <button
                onClick={resetCards}
                className="flex items-center gap-2 px-3 py-2 rounded bg-[#252525] text-[#AAA] text-[11px] font-medium hover:bg-[#2E2E2E] hover:text-white transition-colors"
              >
                <RotateCcw size={12} />
                Reset to Default
              </button>
            </div>
          </div>

          {/* Selected Card Editor */}
          {selectedCard && (
            <div className="px-4 py-4 flex flex-col gap-3 border-b border-[#252525]">
              <SectionLabel>Edit Card</SectionLabel>

              {/* Monster color */}
              <FieldRow label="Monster Color">
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div
                      className="size-7 rounded border border-[#333] flex-shrink-0"
                      style={{ backgroundColor: selectedCard.monsterBg }}
                    />
                    <input
                      type="color"
                      value={selectedCard.monsterBg}
                      className="sr-only"
                      onChange={(e) =>
                        updateCard(selectedCard.id, {
                          monsterBg: e.target.value,
                          hexDisplay: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </label>
                  <span className="text-[10px] text-[#555] font-mono">
                    {selectedCard.monsterBg.toUpperCase()}
                  </span>
                </div>
              </FieldRow>

              {/* Card background */}
              <FieldRow label="Card Background">
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div
                      className="size-7 rounded border border-[#333] flex-shrink-0"
                      style={{ backgroundColor: selectedCard.cardBg }}
                    />
                    <input
                      type="color"
                      value={selectedCard.cardBg}
                      className="sr-only"
                      onChange={(e) =>
                        updateCard(selectedCard.id, {
                          cardBg: e.target.value,
                          eyeWhite: e.target.value,
                        })
                      }
                    />
                  </label>
                  <span className="text-[10px] text-[#555] font-mono">
                    {selectedCard.cardBg.toUpperCase()}
                  </span>
                </div>
              </FieldRow>

              {/* Pupil color */}
              <FieldRow label="Pupil Color">
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div
                      className="size-7 rounded border border-[#333] flex-shrink-0"
                      style={{ backgroundColor: selectedCard.pupilColor }}
                    />
                    <input
                      type="color"
                      value={selectedCard.pupilColor}
                      className="sr-only"
                      onChange={(e) =>
                        updateCard(selectedCard.id, {
                          pupilColor: e.target.value,
                        })
                      }
                    />
                  </label>
                  <span className="text-[10px] text-[#555] font-mono">
                    {selectedCard.pupilColor.toUpperCase()}
                  </span>
                </div>
              </FieldRow>

              {/* Hex display text */}
              <FieldRow label="Hex Label">
                <input
                  type="text"
                  value={selectedCard.hexDisplay}
                  onChange={(e) =>
                    updateCard(selectedCard.id, { hexDisplay: e.target.value })
                  }
                  className="bg-[#252525] text-white text-[11px] font-mono px-2 py-1.5 rounded border border-[#333] focus:border-[#555] outline-none w-full"
                />
              </FieldRow>

              {/* Name */}
              <FieldRow label="Name">
                <input
                  type="text"
                  value={selectedCard.name}
                  onChange={(e) =>
                    updateCard(selectedCard.id, { name: e.target.value })
                  }
                  className="bg-[#252525] text-white text-[11px] px-2 py-1.5 rounded border border-[#333] focus:border-[#555] outline-none w-full"
                />
              </FieldRow>

              {/* Label */}
              <FieldRow label="Label">
                <input
                  type="text"
                  value={selectedCard.label}
                  onChange={(e) =>
                    updateCard(selectedCard.id, { label: e.target.value })
                  }
                  className="bg-[#252525] text-white text-[11px] px-2 py-1.5 rounded border border-[#333] focus:border-[#555] outline-none w-full"
                />
              </FieldRow>

              <button
                onClick={() => deleteCard(selectedCard.id)}
                className="flex items-center gap-2 px-3 py-2 mt-1 rounded bg-[#2C1515] text-[#CC6060] text-[11px] font-medium hover:bg-[#381A1A] hover:text-[#FF8080] transition-colors"
              >
                <Trash2 size={12} />
                Delete Card
              </button>
            </div>
          )}

          {!selectedCard && (
            <div className="px-4 py-4 text-[10px] text-[#3A3A3A] italic">
              Click a card to select and edit it
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#252525] mt-auto">
          <p className="text-[9px] text-[#3A3A3A] leading-relaxed">
            Original design by{" "}
            <a
              href="https://www.instagram.com/faelpt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#555] underline hover:text-[#888] transition-colors"
            >
              Rafael Serra
            </a>
          </p>
          <a
            href="https://anotherplanet.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-[#3A3A3A] underline hover:text-[#555] transition-colors"
          >
            anotherplanet.io
          </a>
        </div>
      </aside>

      {/* ── Canvas ── */}
      <main
        className="flex-1 overflow-auto"
        style={{
          backgroundColor: "#111111",
          backgroundImage:
            "radial-gradient(circle, #2A2A2A 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        onClick={handleCanvasClick}
      >
        <div
          className="p-8 flex flex-wrap gap-5 content-start min-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {cards.map((card) => (
            <ScaledCard
              key={card.id}
              scale={scale}
              selected={selectedId === card.id}
              onSelect={handleCardClick(card.id)}
            >
              <EyeCard
                monsterBg={card.monsterBg}
                cardBg={card.cardBg}
                eyeWhite={card.eyeWhite}
                pupilColor={card.pupilColor}
                hexDisplay={card.hexDisplay}
                name={card.name}
                label={card.label}
              />
            </ScaledCard>
          ))}

          {/* Empty state */}
          {cards.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-3">
              <div className="text-[#333] text-4xl">👁️</div>
              <p className="text-[#444] text-sm">
                No cards — pick a color from the sidebar to add one
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
