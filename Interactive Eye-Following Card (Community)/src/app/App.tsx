import { useMemo, useState } from "react";
import { Eye, RotateCcw, Search, ChevronRight, Check } from "lucide-react";
import { EyeCard } from "./components/EyeCard";

type Category =
  | "Lieu" | "Musique" | "Image" | "Fleurs" | "Réception"
  | "Mariés" | "Transport" | "Organisation" | "Personnes";
type CardState = "disponible" | "sélectionnée" | "à confirmer";
type ParticipantRole = "Marié" | "Témoin" | "Invité" | "Famille";
type GameId = "classique" | "grand" | "weekend";

interface Participant {
  id: string; name: string; role: ParticipantRole;
  attendance: "oui" | "non" | "à répondre"; guests: number; note: string;
}
interface CardData {
  id: string; category: Category; provider: string; service: string;
  offer: string; description: string; price: number; color: string; state: CardState;
}
interface TimelineMoment {
  time: string; title: string; detail: string; categories: Category[];
}
interface GamePack {
  id: GameId; name: string; eyebrow: string; description: string;
  logic: string; moments: TimelineMoment[]; categories: Category[];
}

const CATEGORY_COLORS: Record<Category, string> = {
  Lieu: "#2D6CDF", Musique: "#E83E8C", Image: "#2F9E44",
  Fleurs: "#8B5CF6", Réception: "#F08C00", Mariés: "#D94841",
  Transport: "#12B886", Organisation: "#495057", Personnes: "#7048E8",
};

const CATEGORY_CARDS: Record<Category, Array<[string, string, string]>> = {
  Lieu: [
    ["Domaine", "Lieu de réception", "Privatisation"], ["Château", "Lieu de réception", "Mariage au château"],
    ["Salle", "Lieu de réception", "Salle de mariage"], ["Hôtel", "Hébergement", "Chambres & réception"],
    ["Cérémonie laïque", "Cérémonie", "Espace cérémonie"],
  ],
  Musique: [
    ["DJ", "DJ", "Soirée dansante"], ["Saxophoniste", "Saxophone", "Cocktail"],
    ["Groupe live", "Musique live", "Cocktail & soirée"], ["Pianiste", "Piano", "Cérémonie"],
    ["Violoniste", "Violon", "Cérémonie"], ["Chanteur", "Voix", "Cérémonie"],
    ["Sonorisation", "Technique", "Sonorisation"], ["Éclairage", "Lumière", "Mise en lumière"],
  ],
  Image: [
    ["Photographe", "Photo", "Reportage mariage"], ["Vidéaste", "Vidéo", "Film de mariage"],
    ["Photobooth", "Photo", "Borne photo"], ["Drone", "Aérien", "Prises de vue drone"], ["Album", "Photo", "Album mariage"],
  ],
  Fleurs: [
    ["Fleuriste", "Floral", "Décoration florale"], ["Bouquet", "Floral", "Bouquet de la mariée"],
    ["Boutonnières", "Floral", "Boutonnières"], ["Arche", "Floral", "Arche cérémonie"],
    ["Centres de table", "Floral", "Décoration des tables"], ["Bougies", "Décoration", "Ambiance lumineuse"],
  ],
  Réception: [
    ["Traiteur", "Traiteur", "Réception complète"], ["Cocktail", "Traiteur", "Cocktail apéritif"],
    ["Dîner", "Traiteur", "Dîner assis"], ["Wedding cake", "Dessert", "Pièce montée"],
    ["Bar", "Boissons", "Bar événementiel"], ["Brunch", "Réception", "Brunch lendemain"],
  ],
  Mariés: [
    ["Robe", "Mariée", "Robe de mariée"], ["Costume", "Marié", "Costume"], ["Chaussures", "Mariés", "Chaussures"],
    ["Coiffure", "Beauté", "Coiffure"], ["Maquillage", "Beauté", "Maquillage"],
    ["Bijoux", "Mariés", "Bijoux"], ["Alliances", "Mariés", "Alliances"],
  ],
  Transport: [
    ["Voiture des mariés", "Transport", "Voiture cérémonie"], ["Navette", "Transport", "Navette invités"],
    ["Chauffeur", "Transport", "Chauffeur privé"], ["Taxi", "Transport", "Retour invités"],
    ["Parking", "Logistique", "Stationnement"],
  ],
  Organisation: [
    ["Wedding planner", "Organisation", "Organisation complète"], ["Coordinateur jour J", "Organisation", "Coordination"],
    ["Officiant", "Cérémonie", "Cérémonie laïque"], ["Papeterie", "Papeterie", "Papeterie mariage"],
    ["Faire-part", "Papeterie", "Faire-part"], ["Menus", "Papeterie", "Menus de table"],
    ["Plans de table", "Papeterie", "Plan de table"],
  ],
  Personnes: [
    ["Mariés", "Couple", "Les mariés"], ["Témoins", "Entourage", "Témoins"],
    ["Parents", "Entourage", "Parents"], ["Enfants", "Entourage", "Enfants"], ["Invités", "Entourage", "Invités"],
  ],
};

const CATEGORIES = Object.keys(CATEGORY_CARDS) as Category[];
const PRESETS: CardData[] = CATEGORIES.flatMap((category) =>
  CATEGORY_CARDS[category].map(([provider, service, offer], index) => ({
    id: category + "-" + index + "-" + provider, category, provider, service, offer,
    description: offer, price: category === "Personnes" ? 0 : 300 + index * 75,
    color: CATEGORY_COLORS[category], state: "disponible" as CardState,
  }))
);

const GAME_PACKS: GamePack[] = [
  {
    id: "classique", name: "Classique", eyebrow: "LE GRAND CLASSIQUE",
    description: "Le déroulé essentiel pour un mariage en une journée.",
    logic: "Une progression simple : cérémonie → cocktail → dîner → soirée.",
    categories: ["Lieu", "Musique", "Image", "Fleurs", "Réception", "Mariés", "Transport", "Organisation", "Personnes"],
    moments: [
      { time: "AVANT", title: "Préparation", detail: "Mariés · photo · beauté · organisation", categories: ["Mariés", "Image", "Organisation"] },
      { time: "01", title: "Cérémonie", detail: "Lieu · officiant · musique · invités", categories: ["Lieu", "Musique", "Organisation", "Personnes"] },
      { time: "02", title: "Cocktail", detail: "Traiteur · musique · photo · fleurs", categories: ["Réception", "Musique", "Image", "Fleurs"] },
      { time: "03", title: "Dîner", detail: "Réception · décoration · animations", categories: ["Réception", "Fleurs", "Organisation"] },
      { time: "04", title: "Soirée", detail: "DJ · groupe · lumière · gâteau", categories: ["Musique", "Réception", "Image"] },
    ],
  },
  {
    id: "grand", name: "Grand mariage", eyebrow: "FORMAT COMPLET",
    description: "Pour une journée avec plusieurs équipes, transitions et temps forts.",
    logic: "Préparation → cérémonie → cocktail → photos → dîner → bal → soirée.",
    categories: ["Lieu", "Musique", "Image", "Fleurs", "Réception", "Mariés", "Transport", "Organisation", "Personnes"],
    moments: [
      { time: "10:00", title: "Préparation", detail: "Beauté · détails · photo · coordination", categories: ["Mariés", "Image", "Organisation"] },
      { time: "15:00", title: "Cérémonie", detail: "Accueil · officiant · musique · transport", categories: ["Lieu", "Musique", "Transport", "Personnes"] },
      { time: "16:00", title: "Cocktail", detail: "Invités · traiteur · musique · fleurs", categories: ["Réception", "Musique", "Fleurs", "Personnes"] },
      { time: "17:30", title: "Photos", detail: "Couple · famille · groupe · vidéo", categories: ["Image", "Personnes", "Transport"] },
      { time: "19:00", title: "Dîner", detail: "Service · discours · animations · gâteau", categories: ["Réception", "Organisation", "Musique"] },
      { time: "21:30", title: "Ouverture de bal", detail: "Entrée · première danse · lumière", categories: ["Musique", "Image", "Organisation"] },
      { time: "22:00", title: "Soirée", detail: "DJ · live · bar · fin de réception", categories: ["Musique", "Réception", "Transport"] },
    ],
  },
  {
    id: "weekend", name: "Week-end", eyebrow: "PLUSIEURS JOURS",
    description: "Un jeu pensé pour accueillir l'arrivée, le Jour J et le lendemain.",
    logic: "Veille → Jour J → lendemain. Chaque journée possède sa propre séquence.",
    categories: ["Lieu", "Musique", "Image", "Fleurs", "Réception", "Mariés", "Transport", "Organisation", "Personnes"],
    moments: [
      { time: "J-1", title: "Veille", detail: "Arrivées · hébergement · dîner · accueil", categories: ["Lieu", "Transport", "Réception", "Organisation"] },
      { time: "J", title: "Jour J", detail: "Cérémonie · cocktail · dîner · soirée", categories: ["Lieu", "Musique", "Image", "Réception", "Personnes"] },
      { time: "J+1", title: "Lendemain", detail: "Brunch · départs · transport · souvenirs", categories: ["Réception", "Transport", "Image", "Personnes"] },
    ],
  },
];

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "p-1", name: "Les mariés", role: "Marié", attendance: "oui", guests: 0, note: "" },
  { id: "p-2", name: "Paul Martin", role: "Témoin", attendance: "à répondre", guests: 0, note: "" },
  { id: "p-3", name: "Claire Martin", role: "Témoin", attendance: "oui", guests: 0, note: "" },
  { id: "p-4", name: "Jean Dupont", role: "Invité", attendance: "oui", guests: 1, note: "Sans gluten" },
  { id: "p-5", name: "Sophie Dupont", role: "Invité", attendance: "à répondre", guests: 0, note: "" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666]">{children}</div>;
}
const inputClass = "w-full rounded-none border border-[#303030] bg-[#1d1d1d] px-2.5 py-2 text-[11px] text-white outline-none focus:border-[#777]";

export default function App() {
  const [cards, setCards] = useState<CardData[]>(PRESETS);
  const [gameId, setGameId] = useState<GameId>("classique");
  const [activeCategory, setActiveCategory] = useState<Category | "Toutes">("Toutes");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showLibrary, setShowLibrary] = useState(true);
  const [showGames, setShowGames] = useState(true);
  const [view, setView] = useState<"cartes" | "timeline" | "registre">("cartes");
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [participantDraft, setParticipantDraft] = useState("");
  const [participantRole, setParticipantRole] = useState<ParticipantRole>("Invité");

  const game = GAME_PACKS.find((item) => item.id === gameId)!;
  const visible = useMemo(() => cards.filter((card) => {
    const inGame = game.categories.includes(card.category);
    const categoryMatch = activeCategory === "Toutes" || card.category === activeCategory;
    const q = query.trim().toLowerCase();
    const queryMatch = !q || [card.provider, card.service, card.offer, card.category].some((v) => v.toLowerCase().includes(q));
    return inGame && categoryMatch && queryMatch;
  }), [cards, game, activeCategory, query]);

  const selectedCards = cards.filter((card) => selectedIds.includes(card.id));
  const presentCount = participants.filter((p) => p.attendance === "oui").length;
  const pendingCount = participants.filter((p) => p.attendance === "à répondre").length;

  const toggleCard = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    setCards((current) => current.map((card) => card.id === id
      ? { ...card, state: card.state === "sélectionnée" ? "disponible" : "sélectionnée" }
      : card));
  };

  const chooseGame = (id: GameId) => {
    setGameId(id);
    setActiveCategory("Toutes");
    setQuery("");
    setSelectedIds([]);
    setCards((current) => current.map((card) => ({ ...card, state: "disponible" })));
    setView("cartes");
  };

  const reset = () => {
    setCards(PRESETS);
    setSelectedIds([]);
    setParticipants(INITIAL_PARTICIPANTS);
    setGameId("classique");
    setActiveCategory("Toutes");
    setQuery("");
    setView("cartes");
  };

  const addParticipant = () => {
    const name = participantDraft.trim();
    if (!name) return;
    setParticipants((current) => [...current, {
      id: "p-" + Date.now(), name, role: participantRole, attendance: "à répondre", guests: 0, note: "",
    }]);
    setParticipantDraft("");
  };
  const updateParticipant = (id: string, patch: Partial<Participant>) =>
    setParticipants((current) => current.map((p) => p.id === id ? { ...p, ...patch } : p));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0c0c0c] text-white">
      <aside className="flex w-[310px] shrink-0 flex-col border-r border-[#262626] bg-[#111]">
        <header className="border-b border-[#262626] px-5 py-4">
          <div className="flex items-center gap-2"><Eye size={16} /><span className="text-[11px] font-bold uppercase tracking-[0.2em]">COLORCARD / MARIAGE</span></div>
          <p className="mt-2 text-[10px] leading-4 text-[#777]">Un jeu de cartes organisé. Les yeux restent le signal visuel central.</p>
        </header>

        <div className="border-b border-[#262626] p-4">
          <button onClick={() => setShowGames((v) => !v)} className="mb-3 flex w-full items-center justify-between text-left">
            <SectionLabel>Choisir votre jeu</SectionLabel><ChevronRight size={13} className={showGames ? "rotate-90 text-white" : "text-[#555]"} />
          </button>
          {showGames && <div className="space-y-2">
            {GAME_PACKS.map((pack) => (
              <button key={pack.id} onClick={() => chooseGame(pack.id)}
                className="w-full border p-3 text-left transition-colors"
                style={{ borderColor: gameId === pack.id ? "#fff" : "#303030", backgroundColor: gameId === pack.id ? "#1d1d1d" : "transparent" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-[0.08em]">{pack.name}</span>
                  {gameId === pack.id && <Check size={13} />}
                </div>
                <div className="mt-1 text-[9px] uppercase tracking-[0.13em] text-[#666]">{pack.eyebrow}</div>
                <div className="mt-2 text-[10px] leading-4 text-[#888]">{pack.description}</div>
                <div className="mt-2 flex gap-1 overflow-hidden">
                  {pack.moments.map((m) => <span key={m.title} className="shrink-0 border border-[#333] px-1.5 py-1 text-[8px] uppercase text-[#666]">{m.title}</span>)}
                </div>
              </button>
            ))}
          </div>}
        </div>

        <div className="border-b border-[#262626] p-4">
          <SectionLabel>Jeu actif</SectionLabel>
          <div className="border border-[#303030] bg-[#191919] p-3">
            <div className="text-[12px] font-bold uppercase tracking-[0.1em]">{game.name}</div>
            <div className="mt-1 text-[9px] leading-4 text-[#777]">{game.logic}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <button onClick={() => setShowLibrary((v) => !v)} className="mb-3 flex w-full items-center justify-between text-left">
            <SectionLabel>Cartes du jeu</SectionLabel><span className="font-mono text-[9px] text-[#777]">{visible.length}</span>
          </button>
          {showLibrary && <>
            <div className="mb-3 flex flex-wrap gap-1">
              {(["Toutes", ...game.categories] as const).map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)}
                  className="border px-2 py-1 text-[9px] uppercase tracking-wide"
                  style={{ borderColor: activeCategory === category ? "#fff" : "#303030", color: activeCategory === category ? "#fff" : "#777" }}>
                  {category}
                </button>
              ))}
            </div>
            <div className="relative mb-3"><Search size={13} className="absolute left-2.5 top-2.5 text-[#666]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher une carte…" className={inputClass + " pl-8"} />
            </div>
            <div className="space-y-1">
              {visible.map((card) => <button key={card.id} onClick={() => toggleCard(card.id)}
                className="group flex w-full items-center gap-2 border border-transparent px-2 py-2 text-left hover:border-[#303030] hover:bg-[#191919]">
                <span className="h-7 w-1 shrink-0" style={{ backgroundColor: card.color }} />
                <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold">{card.provider}</span><span className="block truncate text-[9px] text-[#777]">{card.category} · {card.service}</span></span>
                {card.state === "sélectionnée" && <Check size={11} />}
              </button>)}
            </div>
          </>}
        </div>

        <div className="border-t border-[#262626] p-4">
          <button onClick={reset} className="flex w-full items-center justify-center gap-2 border border-[#303030] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#888] hover:text-white"><RotateCcw size={12} /> Réinitialiser le jeu</button>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-[#262626] px-6 py-3">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#777]">Jeu · {game.name}</div>
            <div className="mt-1 text-sm">{view === "cartes" ? "Choisissez les cartes. Vous ne configurez pas encore les horaires." : view === "timeline" ? "La Timeline organise ensuite le quand, où et comment." : "Les participants entrent dans le jeu."}</div></div>
          <div className="flex items-center gap-2">
            {(["cartes", "timeline", "registre"] as const).map((tab) => <button key={tab} onClick={() => setView(tab)}
              className="border px-3 py-1.5 text-[9px] uppercase tracking-wide"
              style={{ borderColor: view === tab ? "#fff" : "#303030", color: view === tab ? "#fff" : "#666" }}>
              {tab === "registre" ? "Registre · " + participants.length : tab === "timeline" ? "Timeline" : "Cartes · " + selectedCards.length}
            </button>)}
          </div>
        </div>

        <div className="flex-1 overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #252525 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          {view === "cartes" && <div className="p-8">
            <div className="mb-6 flex items-end justify-between border-b border-[#252525] pb-4">
              <div><div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Votre jeu</div><h1 className="mt-1 text-2xl font-bold uppercase tracking-tight">{game.name}</h1></div>
              <div className="text-right text-[9px] uppercase tracking-[0.12em] text-[#666]">{selectedCards.length} carte{selectedCards.length > 1 ? "s" : ""} sélectionnée{selectedCards.length > 1 ? "s" : ""}</div>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              {visible.map((card) => <div key={card.id} className="group relative w-[300px] sm:w-[320px]">
                <div onClick={() => toggleCard(card.id)} className="cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                  style={{ outline: selectedIds.includes(card.id) ? "2px solid white" : "2px solid transparent", outlineOffset: 6 }}>
                  <EyeCard monsterBg={card.color} cardBg="#FBF0DC" eyeWhite="#FBF0DC" pupilColor="#000" hexDisplay={card.service.toUpperCase()} name={card.provider} label={card.offer} price={card.price} />
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleCard(card.id); }} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center border border-black/20 bg-[#FBF0DC] text-black shadow-sm">
                  {selectedIds.includes(card.id) ? <Check size={13} /> : "+"}
                </button>
              </div>)}
            </div>
            <div className="mt-10 border border-[#303030] bg-[#111] p-4 text-[10px] leading-5 text-[#777]">
              <strong className="text-white">Règle du jeu :</strong> les cartes sont des objets prédéfinis. Le couple choisit ce dont il a besoin ; il ne redéfinit ni le domaine ni sa couleur. Les horaires seront définis dans la Timeline.
            </div>
          </div>}

          {view === "timeline" && <div className="mx-auto max-w-6xl p-8">
            <div className="mb-7"><div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Structure déterminée par le jeu</div>
              <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight">Timeline · {game.name}</h1>
              <p className="mt-2 max-w-2xl text-[10px] leading-5 text-[#777]">{game.logic} Les horaires, lieux et relations seront renseignés ici à l'étape suivante.</p></div>
            <div className="relative">
              <div className="absolute bottom-0 left-[58px] top-0 w-px bg-[#303030]" />
              <div className="space-y-3">{game.moments.map((moment, index) => <div key={moment.title} className="relative grid grid-cols-[116px_1fr] gap-5">
                <div className="pt-4 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-[#666]">{moment.time}</div>
                <div className="relative border border-[#303030] bg-[#111] p-4">
                  <div className="absolute -left-[22px] top-5 h-3 w-3 border border-[#111] bg-white" />
                  <div className="flex items-start justify-between gap-4"><div><div className="text-[15px] font-bold uppercase tracking-tight">{moment.title}</div><div className="mt-1 text-[10px] text-[#777]">{moment.detail}</div></div><span className="text-[9px] text-[#555]">0{index + 1}</span></div>
                  <div className="mt-4 flex flex-wrap gap-1">{moment.categories.map((category) => <span key={category} className="flex items-center gap-1 border border-[#303030] px-2 py-1 text-[8px] uppercase text-[#777]"><i className="h-1.5 w-1.5" style={{ backgroundColor: CATEGORY_COLORS[category] }} />{category}</span>)}</div>
                  {selectedCards.length > 0 && <div className="mt-3 border-t border-[#242424] pt-3 text-[9px] text-[#555]">{selectedCards.filter((c) => moment.categories.includes(c.category)).map((c) => c.provider).join(" · ") || "Aucune carte sélectionnée pour ce moment"}</div>}
                </div>
              </div>)}</div>
            </div>
            <div className="mt-8 border border-[#303030] bg-[#111] p-4 text-[10px] leading-5 text-[#777]"><strong className="text-white">Étape suivante :</strong> placer les cartes sélectionnées dans les moments du jeu, puis définir horaires, lieux, déplacements et relations.</div>
          </div>}

          {view === "registre" && <div className="mx-auto max-w-6xl p-8">
            <div className="mb-7 flex items-end justify-between border-b border-[#252525] pb-5">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Cartes du mariage</div>
                <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight">Le registre</h1>
                <p className="mt-2 max-w-xl text-[10px] leading-5 text-[#777]">Chaque personne devient une carte. Pas de tableau à remplir : le rôle, la présence et les informations vivent sur la carte.</p>
              </div>
              <div className="text-right text-[9px] uppercase tracking-[0.12em] text-[#666]">
                {participants.length} personnes · {presentCount} présentes · {pendingCount} à répondre
              </div>
            </div>

            <div className="mb-7">
              <SectionLabel>Ajouter par carte</SectionLabel>
              <div className="grid grid-cols-4 gap-3">
                {(["Marié","Témoin","Invité","Famille"] as ParticipantRole[]).map((role) => (
                  <button key={role}
                    onClick={() => {
                      const n = participants.filter((p) => p.role === role).length + 1;
                      setParticipants((current) => [...current, { id: "p-" + Date.now() + "-" + n, name: role === "Invité" ? "Nouvel invité" : "Nouvelle carte", role, attendance: "à répondre", guests: 0, note: "" }]);
                    }}
                    className="border border-[#303030] bg-[#111] p-3 text-left transition hover:border-white hover:bg-[#181818]">
                    <div className="mb-3 h-1 w-full" style={{ backgroundColor: CATEGORY_COLORS.Personnes }} />
                    <div className="text-[11px] font-bold uppercase">{role}</div>
                    <div className="mt-1 text-[9px] leading-4 text-[#666]">Créer une carte {role.toLowerCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-6">
              {participants.map((p) => (
                <div key={p.id} className="relative w-[300px] sm:w-[320px]">
                  <div className="overflow-hidden transition-transform duration-200 hover:-translate-y-1">
                    <EyeCard
                      monsterBg={CATEGORY_COLORS.Personnes}
                      cardBg="#FBF0DC"
                      eyeWhite="#FBF0DC"
                      pupilColor="#000"
                      hexDisplay={p.role.toUpperCase()}
                      name={p.name}
                      label={p.attendance === "oui" ? "Présent" : p.attendance === "non" ? "Absent" : "À répondre"}
                      price={0}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between border border-[#303030] bg-[#111] px-3 py-2">
                    <button
                      onClick={() => updateParticipant(p.id, { attendance: p.attendance === "oui" ? "à répondre" : "oui" })}
                      className="text-[9px] uppercase tracking-[0.12em] text-[#aaa] hover:text-white">
                      {p.attendance === "oui" ? "Présent ✓" : "Confirmer présence"}
                    </button>
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#555]">{p.guests > 0 ? "+" + p.guests : "Carte personnelle"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 border border-[#303030] bg-[#111] p-4 text-[10px] leading-5 text-[#777]">
              <strong className="text-white">Principe :</strong> on ne remplit pas un registre. On construit le registre avec des cartes. Plus tard, chaque invité pourra recevoir sa carte personnelle par lien et compléter uniquement ce qui lui appartient.
            </div>
          </div>}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#262626] px-6 py-2 text-[9px] uppercase tracking-[0.16em] text-[#555]">
          <span>Jeu = cartes + couleurs + logique + Timeline</span><span>{selectedCards.length} sélectionnées · {participants.length} personnes</span>
        </div>
      </main>
    </div>
  );
}
