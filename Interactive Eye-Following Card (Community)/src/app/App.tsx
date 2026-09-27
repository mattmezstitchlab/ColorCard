import { useMemo, useState } from "react";
import { Eye, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { EyeCard } from "./components/EyeCard";

type Category =
  | "Lieu"
  | "Musique"
  | "Image"
  | "Fleurs"
  | "Réception"
  | "Mariés"
  | "Transport"
  | "Organisation"
  | "Personnes";

type CardState = "disponible" | "sélectionnée" | "à confirmer";

interface CardData {
  id: string;
  category: Category;
  provider: string;
  service: string;
  offer: string;
  description: string;
  start: string;
  end: string;
  price: number;
  color: string;
  state: CardState;
}

const CATEGORY_COLORS: Record<Category, string> = {
  Lieu: "#2D6CDF",
  Musique: "#E83E8C",
  Image: "#2F9E44",
  Fleurs: "#8B5CF6",
  Réception: "#F08C00",
  Mariés: "#D94841",
  Transport: "#12B886",
  Organisation: "#495057",
  Personnes: "#7048E8",
};

const CATEGORY_CARDS: Record<Category, Array<[string, string, string]>> = {
  Lieu: [
    ["Domaine", "Lieu de réception", "Privatisation"],
    ["Château", "Lieu de réception", "Mariage au château"],
    ["Salle", "Lieu de réception", "Salle de mariage"],
    ["Hôtel", "Hébergement", "Chambres & réception"],
    ["Cérémonie laïque", "Cérémonie", "Espace cérémonie"],
  ],
  Musique: [
    ["DJ", "DJ", "Soirée dansante"],
    ["Saxophoniste", "Saxophone", "Cocktail"],
    ["Groupe live", "Musique live", "Cocktail & soirée"],
    ["Pianiste", "Piano", "Cérémonie"],
    ["Violoniste", "Violon", "Cérémonie"],
    ["Chanteur", "Voix", "Cérémonie"],
    ["Sonorisation", "Technique", "Sonorisation"],
    ["Éclairage", "Lumière", "Mise en lumière"],
  ],
  Image: [
    ["Photographe", "Photo", "Reportage mariage"],
    ["Vidéaste", "Vidéo", "Film de mariage"],
    ["Photobooth", "Photo", "Borne photo"],
    ["Drone", "Aérien", "Prises de vue drone"],
    ["Album", "Photo", "Album mariage"],
  ],
  Fleurs: [
    ["Fleuriste", "Floral", "Décoration florale"],
    ["Bouquet", "Floral", "Bouquet de la mariée"],
    ["Boutonnières", "Floral", "Boutonnières"],
    ["Arche", "Floral", "Arche cérémonie"],
    ["Centres de table", "Floral", "Décoration des tables"],
    ["Bougies", "Décoration", "Ambiance lumineuse"],
  ],
  Réception: [
    ["Traiteur", "Traiteur", "Réception complète"],
    ["Cocktail", "Traiteur", "Cocktail apéritif"],
    ["Dîner", "Traiteur", "Dîner assis"],
    ["Wedding cake", "Dessert", "Pièce montée"],
    ["Bar", "Boissons", "Bar événementiel"],
    ["Brunch", "Réception", "Brunch lendemain"],
  ],
  Mariés: [
    ["Robe", "Mariée", "Robe de mariée"],
    ["Costume", "Marié", "Costume"],
    ["Chaussures", "Mariés", "Chaussures"],
    ["Coiffure", "Beauté", "Coiffure"],
    ["Maquillage", "Beauté", "Maquillage"],
    ["Bijoux", "Mariés", "Bijoux"],
    ["Alliances", "Mariés", "Alliances"],
  ],
  Transport: [
    ["Voiture des mariés", "Transport", "Voiture cérémonie"],
    ["Navette", "Transport", "Navette invités"],
    ["Chauffeur", "Transport", "Chauffeur privé"],
    ["Taxi", "Transport", "Retour invités"],
    ["Parking", "Logistique", "Stationnement"],
  ],
  Organisation: [
    ["Wedding planner", "Organisation", "Organisation complète"],
    ["Coordinateur jour J", "Organisation", "Coordination"],
    ["Officiant", "Cérémonie", "Cérémonie laïque"],
    ["Papeterie", "Papeterie", "Papeterie mariage"],
    ["Faire-part", "Papeterie", "Faire-part"],
    ["Menus", "Papeterie", "Menus de table"],
    ["Plans de table", "Papeterie", "Plan de table"],
  ],
  Personnes: [
    ["Mariés", "Couple", "Les mariés"],
    ["Témoins", "Entourage", "Témoins"],
    ["Parents", "Entourage", "Parents"],
    ["Enfants", "Entourage", "Enfants"],
    ["Invités", "Entourage", "Invités"],
  ],
};

const CATEGORIES = Object.keys(CATEGORY_CARDS) as Category[];

const PRESETS: CardData[] = CATEGORIES.flatMap((category) =>
  CATEGORY_CARDS[category].map(([provider, service, offer], index) => ({
    id: category + "-" + index + "-" + provider,
    category,
    provider,
    service,
    offer,
    description: offer,
    start: index % 2 === 0 ? "14:00" : "18:30",
    end: index % 2 === 0 ? "16:00" : "20:00",
    price: category === "Personnes" ? 0 : 300 + index * 75,
    color: CATEGORY_COLORS[category],
    state: "disponible",
  }))
);

function newCard(category: Category = "Musique"): CardData {
  return {
    id: "custom-" + Date.now(),
    category,
    provider: "Nouveau prestataire",
    service: "Service",
    offer: "Nouvelle offre",
    description: "À personnaliser",
    start: "14:00",
    end: "16:00",
    price: 0,
    color: CATEGORY_COLORS[category],
    state: "disponible",
  };
}

const money = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666]">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#666]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-none border border-[#303030] bg-[#1d1d1d] px-2.5 py-2 text-[11px] text-white outline-none focus:border-[#777]";

export default function App() {
  const [cards, setCards] = useState<CardData[]>(PRESETS);
  const [activeCategory, setActiveCategory] = useState<Category | "Toutes">("Toutes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showLibrary, setShowLibrary] = useState(true);

  const selected = cards.find((card) => card.id === selectedId) ?? null;

  const visible = useMemo(
    () =>
      cards.filter((card) => {
        const categoryMatch = activeCategory === "Toutes" || card.category === activeCategory;
        const q = query.trim().toLowerCase();
        const queryMatch =
          !q ||
          [card.provider, card.service, card.offer, card.category].some((value) =>
            value.toLowerCase().includes(q)
          );
        return categoryMatch && queryMatch;
      }),
    [cards, activeCategory, query]
  );

  const selectedCount = cards.filter((c) => c.state === "sélectionnée").length;
  const selectedBudget = cards
    .filter((c) => c.state === "sélectionnée")
    .reduce((sum, c) => sum + c.price, 0);

  const update = (id: string, patch: Partial<CardData>) =>
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...patch } : card)));

  const addCard = () => {
    const card = newCard(activeCategory === "Toutes" ? "Musique" : activeCategory);
    setCards((current) => [card, ...current]);
    setSelectedId(card.id);
  };

  const duplicate = () => {
    if (!selected) return;
    const copy = { ...selected, id: "copy-" + Date.now(), provider: selected.provider + " — copie" };
    setCards((current) => [copy, ...current]);
    setSelectedId(copy.id);
  };

  const reset = () => {
    setCards(PRESETS);
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0c0c0c] text-white">
      <aside className="flex w-[286px] shrink-0 flex-col border-r border-[#262626] bg-[#111]">
        <header className="border-b border-[#262626] px-5 py-4">
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">COLORCARD / MARIAGE</span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-[#777]">Le playground de la carte. Les yeux restent le signal visuel central.</p>
        </header>

        <div className="border-b border-[#262626] p-4">
          <SectionLabel>Bibliothèque</SectionLabel>
          <button
            onClick={() => setShowLibrary((value) => !value)}
            className="flex w-full items-center justify-between border border-[#303030] bg-[#191919] px-3 py-2.5 text-left text-[11px] hover:bg-[#222]"
          >
            <span>{showLibrary ? "Toutes les cartes" : "Bibliothèque masquée"}</span>
            <span className="font-mono text-[#777]">{cards.length}</span>
          </button>
        </div>

        {showLibrary && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 flex flex-wrap gap-1">
              {(["Toutes", ...CATEGORIES] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="border px-2 py-1 text-[9px] uppercase tracking-wide transition-colors"
                  style={{
                    borderColor: activeCategory === category ? "#fff" : "#303030",
                    color: activeCategory === category ? "#fff" : "#777",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative mb-3">
              <Search size={13} className="absolute left-2.5 top-2.5 text-[#666]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher une carte…"
                className={inputClass + " pl-8"}
              />
            </div>
            <div className="space-y-1">
              {visible.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedId(card.id)}
                  className="group flex w-full items-center gap-2 border border-transparent px-2 py-2 text-left hover:border-[#303030] hover:bg-[#191919]"
                >
                  <span className="h-7 w-1 shrink-0" style={{ backgroundColor: card.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold text-white">{card.provider}</span>
                    <span className="block truncate text-[9px] text-[#777]">{card.category} · {card.service}</span>
                  </span>
                  {card.state === "sélectionnée" && <span className="text-[9px]">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#262626] p-4">
          <button onClick={addCard} className="mb-1.5 flex w-full items-center justify-center gap-2 bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black hover:bg-[#ddd]">
            <Plus size={13} /> Nouvelle carte
          </button>
          <button onClick={reset} className="flex w-full items-center justify-center gap-2 border border-[#303030] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#888] hover:text-white">
            <RotateCcw size={12} /> Réinitialiser
          </button>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-[#262626] px-6 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#777]">Jeu de cartes</div>
            <div className="mt-1 text-sm">Choisir · éditer · comparer · observer</div>
          </div>
          <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.14em] text-[#777]">
            <span>{selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}</span>
            <span>{money(selectedBudget)}</span>
          </div>
        </div>

        <div
          className="flex-1 overflow-auto"
          style={{
            backgroundImage: "radial-gradient(circle, #252525 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="flex flex-wrap items-start gap-6 p-8">
            {visible.map((card) => (
              <div key={card.id} className="group relative">
                <div
                  onClick={() => setSelectedId(card.id)}
                  className="cursor-pointer transition-transform duration-200 hover:-translate-y-1 w-[300px] sm:w-[320px]"
                  style={{
                    outline: selectedId === card.id ? "2px solid white" : "2px solid transparent",
                    outlineOffset: 6,
                  }}
                >
                  <EyeCard
                    monsterBg={card.color}
                    cardBg="#FBF0DC"
                    eyeWhite="#FBF0DC"
                    pupilColor="#000"
                    hexDisplay={card.service.toUpperCase()}
                    name={card.provider}
                    label={card.offer}
                  />
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    update(card.id, {
                      state: card.state === "sélectionnée" ? "disponible" : "sélectionnée",
                    });
                  }}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center border border-black/20 bg-[#FBF0DC] text-black shadow-sm"
                  title="Sélectionner"
                >
                  {card.state === "sélectionnée" ? "✓" : "+"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#262626] px-6 py-2 text-[9px] uppercase tracking-[0.16em] text-[#555]">
          <span>Carte = identité · service · offre · temps · prix · couleur · état</span>
          <span>Yeux actifs</span>
        </div>
      </main>

      {selected && (
        <aside className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[#262626] bg-[#111]">
          <div className="flex items-center justify-between border-b border-[#262626] px-5 py-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]">Éditer la carte</div>
              <div className="mt-1 text-[9px] text-[#666]">{selected.category}</div>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-[#777] hover:text-white"><X size={15} /></button>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <SectionLabel>Identité</SectionLabel>
              <div className="space-y-3">
                <Field label="Prestataire / nom">
                  <input className={inputClass} value={selected.provider} onChange={(e) => update(selected.id, { provider: e.target.value })} />
                </Field>
                <Field label="Catégorie">
                  <select className={inputClass} value={selected.category} onChange={(e) => {
                    const category = e.target.value as Category;
                    update(selected.id, { category, color: CATEGORY_COLORS[category] });
                  }}>
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </Field>
                <Field label="Couleur de la carte">
                  <div className="flex gap-2">
                    <input type="color" value={selected.color} onChange={(e) => update(selected.id, { color: e.target.value })} className="h-9 w-12 border-0 bg-transparent p-0" />
                    <input className={inputClass} value={selected.color} onChange={(e) => update(selected.id, { color: e.target.value })} />
                  </div>
                </Field>
              </div>
            </div>

            <div>
              <SectionLabel>Service</SectionLabel>
              <div className="space-y-3">
                <Field label="Service">
                  <input className={inputClass} value={selected.service} onChange={(e) => update(selected.id, { service: e.target.value })} />
                </Field>
                <Field label="Offre / formule">
                  <input className={inputClass} value={selected.offer} onChange={(e) => update(selected.id, { offer: e.target.value })} />
                </Field>
                <Field label="Description">
                  <textarea className={inputClass + " min-h-[70px] resize-y"} value={selected.description} onChange={(e) => update(selected.id, { description: e.target.value })} />
                </Field>
              </div>
            </div>

            <div>
              <SectionLabel>Temps & prix</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Début"><input type="time" className={inputClass} value={selected.start} onChange={(e) => update(selected.id, { start: e.target.value })} /></Field>
                <Field label="Fin"><input type="time" className={inputClass} value={selected.end} onChange={(e) => update(selected.id, { end: e.target.value })} /></Field>
              </div>
              <div className="mt-3">
                <Field label="Prix (€)"><input type="number" className={inputClass} value={selected.price} onChange={(e) => update(selected.id, { price: Number(e.target.value) })} /></Field>
              </div>
            </div>

            <div>
              <SectionLabel>État</SectionLabel>
              <div className="grid grid-cols-3 gap-1">
                {(["disponible", "sélectionnée", "à confirmer"] as CardState[]).map((state) => (
                  <button
                    key={state}
                    onClick={() => update(selected.id, { state })}
                    className="border px-2 py-2 text-[9px] uppercase tracking-wide"
                    style={{
                      borderColor: selected.state === state ? "#fff" : "#303030",
                      color: selected.state === state ? "#fff" : "#666",
                    }}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#262626] pt-4">
              <SectionLabel>Expérimentation</SectionLabel>
              <p className="mb-3 text-[10px] leading-4 text-[#666]">
                Ici, tout est volontairement éditable. Cette phase sert à découvrir le modèle de carte avant de figer les permissions et le futur PACTE.
              </p>
              <button onClick={duplicate} className="mb-2 w-full border border-[#303030] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#aaa] hover:text-white">Dupliquer la carte</button>
              <button
                onClick={() => {
                  setCards((current) => current.filter((card) => card.id !== selected.id));
                  setSelectedId(null);
                }}
                className="flex w-full items-center justify-center gap-2 border border-[#402020] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#b66] hover:text-[#f88]"
              >
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
