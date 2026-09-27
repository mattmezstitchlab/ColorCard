import { useMemo, useState } from "react";
import { Eye, RotateCcw, Search } from "lucide-react";
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
type ParticipantRole = "Marié" | "Témoin" | "Invité" | "Famille";

interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  attendance: "oui" | "non" | "à répondre";
  guests: number;
  note: string;
}

interface CardData {
  id: string;
  category: Category;
  provider: string;
  service: string;
  offer: string;
  description: string;
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
    price: category === "Personnes" ? 0 : 300 + index * 75,
    color: CATEGORY_COLORS[category],
    state: "disponible",
  }))
);

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "p-1", name: "Les mariés", role: "Marié", attendance: "oui", guests: 0, note: "" },
  { id: "p-2", name: "Paul Martin", role: "Témoin", attendance: "à répondre", guests: 0, note: "" },
  { id: "p-3", name: "Claire Martin", role: "Témoin", attendance: "oui", guests: 0, note: "" },
  { id: "p-4", name: "Jean Dupont", role: "Invité", attendance: "oui", guests: 1, note: "Sans gluten" },
  { id: "p-5", name: "Sophie Dupont", role: "Invité", attendance: "à répondre", guests: 0, note: "" },
];

function newCard(category: Category = "Musique"): CardData {
  return {
    id: "custom-" + Date.now(),
    category,
    provider: "Nouveau prestataire",
    service: "Service",
    offer: "Nouvelle offre",
    description: "À personnaliser",
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showLibrary, setShowLibrary] = useState(true);
  const [view, setView] = useState<"cartes" | "registre">("cartes");
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [participantDraft, setParticipantDraft] = useState("");
  const [participantRole, setParticipantRole] = useState<ParticipantRole>("Invité");

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

  const presentCount = participants.filter((p) => p.attendance === "oui").length;
  const pendingCount = participants.filter((p) => p.attendance === "à répondre").length;
  const update = (id: string, patch: Partial<CardData>) =>
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...patch } : card)));

  const reset = () => {
    setCards(PRESETS);
    setParticipants(INITIAL_PARTICIPANTS);
  };

  const addParticipant = () => {
    const name = participantDraft.trim();
    if (!name) return;
    setParticipants((current) => [
      ...current,
      { id: "p-" + Date.now(), name, role: participantRole, attendance: "à répondre", guests: 0, note: "" },
    ]);
    setParticipantDraft("");
  };

  const updateParticipant = (id: string, patch: Partial<Participant>) => {
    setParticipants((current) => current.map((p) => (p.id === id ? { ...p, ...patch } : p)));
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
                  onClick={() => setSelectedIds((ids) => ids.includes(card.id) ? ids.filter((id) => id !== card.id) : [...ids, card.id])}
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
          <button onClick={reset} className="flex w-full items-center justify-center gap-2 border border-[#303030] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#888] hover:text-white">
            <RotateCcw size={12} /> Réinitialiser
          </button>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-[#262626] px-6 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#777]">Jeu de mariage</div>
            <div className="mt-1 text-sm">{view === "cartes" ? "Choisir les cartes. Les horaires viendront ensuite dans la Timeline." : "Registre des participants"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView("cartes")} className="border px-3 py-1.5 text-[9px] uppercase tracking-wide" style={{ borderColor: view === "cartes" ? "#fff" : "#303030", color: view === "cartes" ? "#fff" : "#666" }}>Cartes</button>
            <button onClick={() => setView("registre")} className="border px-3 py-1.5 text-[9px] uppercase tracking-wide" style={{ borderColor: view === "registre" ? "#fff" : "#303030", color: view === "registre" ? "#fff" : "#666" }}>Registre · {participants.length}</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #252525 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          {view === "cartes" ? (
          <div className="flex flex-wrap items-start gap-6 p-8">
            {visible.map((card) => (
              <div key={card.id} className="group relative">
                <div
                  onClick={() => setSelectedIds((ids) => ids.includes(card.id) ? ids.filter((id) => id !== card.id) : [...ids, card.id])}
                  className="cursor-pointer transition-transform duration-200 hover:-translate-y-1 w-[300px] sm:w-[320px]"
                  style={{
                    outline: selectedIds.includes(card.id) ? "2px solid white" : "2px solid transparent",
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
                    price={card.price}
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
          ) : (
            <div className="mx-auto max-w-5xl p-8">
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="border border-[#303030] bg-[#111] p-4"><div className="text-[9px] uppercase tracking-[0.16em] text-[#666]">Registre</div><div className="mt-1 text-2xl">{participants.length}</div><div className="mt-1 text-[9px] text-[#666]">personnes enregistrées</div></div>
                <div className="border border-[#303030] bg-[#111] p-4"><div className="text-[9px] uppercase tracking-[0.16em] text-[#666]">Présents</div><div className="mt-1 text-2xl">{presentCount}</div><div className="mt-1 text-[9px] text-[#666]">réponses positives</div></div>
                <div className="border border-[#303030] bg-[#111] p-4"><div className="text-[9px] uppercase tracking-[0.16em] text-[#666]">À répondre</div><div className="mt-1 text-2xl">{pendingCount}</div><div className="mt-1 text-[9px] text-[#666]">invitations ouvertes</div></div>
              </div>

              <div className="mb-6 border border-[#303030] bg-[#111] p-4">
                <SectionLabel>Ajouter une personne</SectionLabel>
                <div className="flex gap-2">
                  <input value={participantDraft} onChange={(e) => setParticipantDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addParticipant(); }} placeholder="Prénom Nom" className={inputClass + " flex-1"} />
                  <select value={participantRole} onChange={(e) => setParticipantRole(e.target.value as ParticipantRole)} className={inputClass + " w-[130px]"}>{(["Invité","Témoin","Famille","Marié"] as ParticipantRole[]).map((r) => <option key={r}>{r}</option>)}</select>
                  <button onClick={addParticipant} className="bg-white px-4 text-[9px] font-bold uppercase tracking-wide text-black">Ajouter</button>
                </div>
              </div>

              <div className="border border-[#303030] bg-[#111]">
                <div className="grid grid-cols-[1fr_120px_120px_80px_1fr] border-b border-[#303030] px-4 py-3 text-[9px] uppercase tracking-[0.14em] text-[#666]"><span>Nom / carte</span><span>Rôle</span><span>Présence</span><span>Invités</span><span>Indication</span></div>
                {participants.map((p) => (
                  <div key={p.id} className="grid grid-cols-[1fr_120px_120px_80px_1fr] items-center border-b border-[#202020] px-4 py-3 last:border-0">
                    <div><div className="text-[11px] font-semibold">{p.name}</div><div className="mt-1 text-[8px] uppercase tracking-wide text-[#666]">Carte · {p.role}</div></div>
                    <select value={p.role} onChange={(e) => updateParticipant(p.id, { role: e.target.value as ParticipantRole })} className="border border-[#303030] bg-[#1d1d1d] px-2 py-1.5 text-[9px]">{(["Marié","Témoin","Invité","Famille"] as ParticipantRole[]).map((r) => <option key={r}>{r}</option>)}</select>
                    <select value={p.attendance} onChange={(e) => updateParticipant(p.id, { attendance: e.target.value as Participant["attendance"] })} className="border border-[#303030] bg-[#1d1d1d] px-2 py-1.5 text-[9px]">{(["oui","à répondre","non"] as Participant["attendance"][]).map((r) => <option key={r}>{r}</option>)}</select>
                    <input type="number" min="0" value={p.guests} onChange={(e) => updateParticipant(p.id, { guests: Number(e.target.value) })} className="w-16 border border-[#303030] bg-[#1d1d1d] px-2 py-1.5 text-[9px]" />
                    <input value={p.note} onChange={(e) => updateParticipant(p.id, { note: e.target.value })} placeholder="Allergie, besoin, remarque…" className="border border-[#303030] bg-[#1d1d1d] px-2 py-1.5 text-[9px]" />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[9px] uppercase tracking-[0.12em] text-[#555]">Chaque personne pourra plus tard recevoir son lien personnel pour créer / compléter sa carte sans accéder au reste du mariage.</div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#262626] px-6 py-2 text-[9px] uppercase tracking-[0.16em] text-[#555]">
          <span>Carte = identité · domaine · service · offre · prix · état</span>
          <span>{view === "cartes" ? "Yeux actifs" : "Registre · accès par rôle"}</span>
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
                <Field label="Domaine">
                  <select className={inputClass} value={selected.category} onChange={(e) => {
                    const category = e.target.value as Category;
                    update(selected.id, { category, color: CATEGORY_COLORS[category] });
                  }}>
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </Field>
                <Field label="Domaine / couleur">
                  <div className="flex items-center gap-2 border border-[#303030] bg-[#191919] px-2.5 py-2">
                    <span className="h-4 w-4 shrink-0" style={{ backgroundColor: selected.color }} />
                    <span className="text-[10px] text-white">{selected.category}</span>
                    <span className="ml-auto text-[9px] uppercase tracking-wide text-[#666]">automatique</span>
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
                <Field label="Indication">
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
                Le domaine détermine automatiquement la couleur. Les horaires et les indications sont des données de la carte, pas des éléments graphiques libres.
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
