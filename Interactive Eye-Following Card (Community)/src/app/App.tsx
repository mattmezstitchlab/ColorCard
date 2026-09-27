import { useMemo, useState } from "react";
import { Eye, Plus, Search, Trash2, Check } from "lucide-react";
import { EyeCard } from "./components/EyeCard";

type DisplayMode = "ticker" | "alternating" | "static" | "stack";

interface ColorCardRecord {
  id: string;
  name: string;
  role: string;
  category: string;
  color: string;
  message: string;
  displayMode: DisplayMode;
}

const PALETTE = [
  "#E83E8C", "#2D6CDF", "#2F9E44", "#8B5CF6", "#F08C00",
  "#12B886", "#D94841", "#7048E8", "#00A6A6", "#B86BFF",
];

const ROLE_CATEGORIES: Array<[string[], string]> = [
  [["dj", "musique", "sax", "violon", "piano", "chanteur", "groupe", "musicien", "concert"], "Musique"],
  [["photo", "photographe", "vidéo", "videaste", "drone", "image"], "Image"],
  [["fleur", "floral", "bouquet", "plante"], "Fleurs"],
  [["traiteur", "cuisine", "chef", "restaurant", "bar", "pâtissier", "gateau"], "Réception"],
  [["transport", "chauffeur", "taxi", "navette", "voiture"], "Transport"],
  [["lieu", "domaine", "château", "salle", "hôtel", "hotel"], "Lieu"],
  [["organisateur", "planner", "coordination", "officiant", "organisation"], "Organisation"],
  [["marié", "mariee", "mariés", "couple", "époux", "épouse"], "Personnes"],
];

const deriveCategory = (role: string) => {
  const value = role.trim().toLowerCase();
  const found = ROLE_CATEGORIES.find(([words]) => words.some((word) => value.includes(word)));
  return found?.[1] ?? (role.trim() ? role.trim().replace(/\s+/g, " ").split(" ").slice(0, 2).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "À classer");
};

const colorFor = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

const MODE_LABELS: Record<DisplayMode, string> = {
  ticker: "Défilement",
  alternating: "Vivant",
  static: "Fixe",
  stack: "Empilé",
};

export default function App() {
  const [cards, setCards] = useState<ColorCardRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("ticker");
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");

  const activeCard = cards.find((card) => card.id === activeId) ?? null;
  const previewCategory = deriveCategory(role);
  const previewColor = colorFor(previewCategory);

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(cards.map((card) => card.category)))],
    [cards],
  );

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((card) => {
      const categoryMatch = filter === "Toutes" || card.category === filter;
      const searchMatch = !q || [card.name, card.role, card.category, card.message].some((value) => value.toLowerCase().includes(q));
      return categoryMatch && searchMatch;
    });
  }, [cards, filter, search]);

  const resetEditor = () => {
    setActiveId(null);
    setRole("");
    setName("");
    setMessage("");
    setDisplayMode("ticker");
  };

  const createCard = () => {
    const cleanRole = role.trim();
    const cleanName = name.trim();
    if (!cleanRole || !cleanName) return;

    const category = deriveCategory(cleanRole);
    const card: ColorCardRecord = {
      id: "card-" + Date.now(),
      name: cleanName,
      role: cleanRole,
      category,
      color: colorFor(category),
      message: message.trim(),
      displayMode,
    };
    setCards((current) => [...current, card]);
    setActiveId(card.id);
  };

  const updateActive = (patch: Partial<ColorCardRecord>) => {
    if (!activeCard) return;
    setCards((current) => current.map((card) => card.id === activeCard.id ? { ...card, ...patch } : card));
  };

  const addMessageInstantly = () => {
    if (!activeCard) return;
    const clean = message.trim();
    if (!clean) return;
    updateActive({ message: clean });
    setMessage("");
  };

  const deleteCard = (id: string) => {
    setCards((current) => current.filter((card) => card.id !== id));
    if (activeId === id) resetEditor();
  };

  const selectCard = (card: ColorCardRecord) => {
    setActiveId(card.id);
    setRole(card.role);
    setName(card.name);
    setMessage(card.message);
    setDisplayMode(card.displayMode);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <style>{`
        @keyframes colorcard-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .colorcard-marquee { animation: colorcard-marquee 9s linear infinite; }
      `}</style>

      <header className="flex items-center justify-between border-b border-[#252525] px-6 py-4">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em]">COLORCARD</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-[#666]">
          {cards.length} carte{cards.length !== 1 ? "s" : ""}
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        <section className="mx-auto max-w-[720px]">
          <div className="mb-7 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#666]">UN REGISTRE VIVANT</div>
            <h1 className="mt-2 text-4xl font-bold uppercase tracking-[-0.04em]">Une carte. N'importe quel rôle.</h1>
            <p className="mx-auto mt-3 max-w-lg text-[11px] leading-5 text-[#777]">
              Crée une carte, donne-lui un rôle, puis fais parler ses yeux avec un message instantané.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[430px]">
            <div className="relative">
              <EyeCard
                monsterBg={activeCard?.color ?? previewColor}
                cardBg="#FBF0DC"
                eyeWhite="#FBF0DC"
                pupilColor="#000"
                hexDisplay={(activeCard?.category ?? previewCategory).toUpperCase()}
                name={activeCard?.name ?? name || "Ma carte"}
                label={activeCard?.role ?? role || "Choisir un rôle"}
                message={activeCard?.message ?? message || "Écrivez quelque chose…"}
                displayMode={activeCard?.displayMode ?? displayMode}
              />
              {activeCard && (
                <button
                  onClick={() => deleteCard(activeCard.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-black/75 text-white hover:bg-black"
                  aria-label="Supprimer la carte"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <div className="mt-4 border border-[#303030] bg-[#111] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#666]">{activeCard ? "Carte sélectionnée" : "Créer une carte"}</div>
                  <div className="mt-1 text-[13px] font-bold uppercase">{activeCard ? activeCard.name : "Personnaliser"}</div>
                </div>
                {activeCard && <button onClick={resetEditor} className="text-[9px] uppercase tracking-[0.14em] text-[#666] hover:text-white">Nouvelle carte</button>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Rôle</span>
                  <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. Saxophoniste, Maman, DJ…" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-2.5 text-[11px] text-white outline-none focus:border-white" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Nom</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom affiché" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-2.5 text-[11px] text-white outline-none focus:border-white" />
                </label>
              </div>

              <div className="mt-3 flex items-end gap-2">
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Message</span>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && activeCard) addMessageInstantly(); }}
                    placeholder="Un message qui apparaît sous les yeux…"
                    className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-2.5 text-[11px] text-white outline-none focus:border-white"
                  />
                </label>
                {activeCard && (
                  <button onClick={addMessageInstantly} className="flex h-[37px] items-center gap-1.5 border border-white px-3 text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-white hover:text-black">
                    <Plus size={12} /> Instantané
                  </button>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[8px] uppercase tracking-[0.14em] text-[#666]">Affichage du message</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(MODE_LABELS) as DisplayMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setDisplayMode(mode);
                        if (activeCard) updateActive({ displayMode: mode });
                      }}
                      className="border px-2 py-2 text-[8px] uppercase tracking-[0.08em]"
                      style={{ borderColor: (activeCard?.displayMode ?? displayMode) === mode ? "#fff" : "#303030", color: (activeCard?.displayMode ?? displayMode) === mode ? "#fff" : "#666" }}
                    >
                      {MODE_LABELS[mode]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#242424] pt-4">
                <div>
                  <div className="text-[8px] uppercase tracking-[0.14em] text-[#666]">Catégorie automatique</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    <i className="h-2 w-2" style={{ backgroundColor: activeCard?.color ?? previewColor }} />
                    {activeCard?.category ?? previewCategory}
                  </div>
                </div>
                {!activeCard && (
                  <button
                    onClick={createCard}
                    disabled={!role.trim() || !name.trim()}
                    className="bg-white px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    Ajouter la carte →
                  </button>
                )}
                {activeCard && (
                  <button onClick={resetEditor} className="border border-[#303030] px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-[#888] hover:border-white hover:text-white">
                    Terminer
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-[#252525] pt-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Votre registre</div>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight">Toutes les cartes</h2>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className="border px-3 py-1.5 text-[8px] uppercase tracking-[0.1em]"
                  style={{ borderColor: filter === category ? "#fff" : "#303030", color: filter === category ? "#fff" : "#666" }}
                >
                  {category} {category !== "Toutes" && <span className="text-[#444]">{cards.filter((card) => card.category === category).length}</span>}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-[220px]">
              <Search size={12} className="absolute left-2.5 top-2.5 text-[#666]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="w-full border border-[#303030] bg-[#111] py-2 pl-7 pr-3 text-[9px] text-white outline-none focus:border-white" />
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="mx-auto mt-12 max-w-md border border-dashed border-[#303030] p-10 text-center">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#666]">Le registre commence ici</div>
              <p className="mt-2 text-[11px] leading-5 text-[#777]">La première carte est au centre. Crée-la, puis elle viendra automatiquement rejoindre ce registre.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCards.map((card) => (
                <button key={card.id} onClick={() => selectCard(card)} className="group relative text-left transition-transform hover:-translate-y-1">
                  <EyeCard
                    monsterBg={card.color}
                    cardBg="#FBF0DC"
                    eyeWhite="#FBF0DC"
                    pupilColor="#000"
                    hexDisplay={card.category.toUpperCase()}
                    name={card.name}
                    label={card.role}
                    message={card.message || "Ajouter un message…"}
                    displayMode={card.displayMode}
                  />
                  {activeId === card.id && <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-white text-black"><Check size={12} /></div>}
                </button>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-[#252525] py-5 text-center text-[8px] uppercase tracking-[0.16em] text-[#444]">
          Une carte = un rôle · une couleur automatique · un message · un mode d'affichage
        </footer>
      </main>
    </div>
  );
}
