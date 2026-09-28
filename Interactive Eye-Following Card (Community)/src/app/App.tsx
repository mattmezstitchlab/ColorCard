import { useMemo, useState } from "react";
import { Eye, Plus, Search, Trash2, Check, Link2, X } from "lucide-react";
import { EyeCard } from "./components/EyeCard";

type DisplayMode = "ticker" | "alternating" | "static" | "stack";

interface ContextRecord {
  id: string;
  name: string;
  kind: string;
  city: string;
  date: string;
}

interface CardAssignment {
  contextId: string;
  message: string;
  displayMode: DisplayMode;
  time: string;
  location: string;
}

interface ColorCardRecord {
  id: string;
  name: string;
  role: string;
  category: string;
  color: string;
  city: string;
  details: string;
  message: string;
  displayMode: DisplayMode;
  assignments: CardAssignment[];
  pattern: string;
  patternAnimated: boolean;
}

const PATTERNS = ["none", "stripes", "checker", "dots", "grid", "waves", "tiger", "leopard", "zebra", "scales", "bubbles", "botanical", "diagonal", "pixel", "prism"] as const;
const PATTERN_LABELS: Record<string, string> = {
  none: "Uni", stripes: "Rayures", checker: "Damier", dots: "Points", grid: "Grille", waves: "Ondes",
  tiger: "Tigre", leopard: "Léopard", zebra: "Zèbre", scales: "Écailles", bubbles: "Bulles", botanical: "Botanique",
  diagonal: "Diagonale", pixel: "Pixel", prism: "Prisme"
};

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

const MODE_LABELS: Record<DisplayMode, string> = {
  ticker: "Défilement",
  alternating: "Vivant",
  static: "Fixe",
  stack: "Empilé",
};

const deriveCategory = (role: string) => {
  const value = role.trim().toLowerCase();
  const found = ROLE_CATEGORIES.find(([words]) => words.some((word) => value.includes(word)));
  return found?.[1] ?? (role.trim()
    ? role.trim().replace(/\s+/g, " ").split(" ").slice(0, 2).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : "À classer");
};

const colorFor = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

const newId = (prefix: string) => prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);

export default function App() {
  const [cards, setCards] = useState<ColorCardRecord[]>([]);
  const [contexts, setContexts] = useState<ContextRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("ticker");
  const [selectedContextId, setSelectedContextId] = useState("");
  const [assignmentTime, setAssignmentTime] = useState("");
  const [assignmentLocation, setAssignmentLocation] = useState("");
  const [viewMode, setViewMode] = useState<"registry" | "timeline">("registry");
  const [formStep, setFormStep] = useState(1);
  const [customColor, setCustomColor] = useState("#2D6CDF");
  const [pattern, setPattern] = useState<string>("none");
  const [patternAnimated, setPatternAnimated] = useState(false);
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [newContextName, setNewContextName] = useState("");
  const [newContextKind, setNewContextKind] = useState("Événement");
  const [newContextCity, setNewContextCity] = useState("");
  const [newContextDate, setNewContextDate] = useState("");

  const activeCard = cards.find((card) => card.id === activeId) ?? null;
  const selectedContext = contexts.find((context) => context.id === selectedContextId) ?? null;
  const activeAssignment = activeCard?.assignments.find((assignment) => assignment.contextId === selectedContextId) ?? null;

  const timelineItems = useMemo(() => cards.flatMap((card) => card.assignments.flatMap((assignment) => {
    const context = contexts.find((item) => item.id === assignment.contextId);
    if (!context || !context.date || !assignment.time) return [];
    const timestamp = new Date(`${context.date}T${assignment.time}`).getTime();
    if (Number.isNaN(timestamp)) return [];
    return [{ id: `${card.id}-${assignment.contextId}`, timestamp, time: assignment.time, card, assignment, context, location: assignment.location || card.city || context.city }];
  })).sort((a, b) => a.timestamp - b.timestamp), [cards, contexts]);

  const timelineAvailable = timelineItems.length > 0;

  const previewCategory = deriveCategory(role);
  const previewColor = colorFor(previewCategory);

  const visibleMessage = activeCard
    ? (activeAssignment?.message ?? activeCard.message)
    : message;
  const visibleMode = activeCard
    ? (activeAssignment?.displayMode ?? activeCard.displayMode)
    : displayMode;

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(cards.map((card) => card.category)))],
    [cards],
  );

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((card) => {
      const categoryMatch = filter === "Toutes" || card.category === filter;
      const contextText = card.assignments.map((a) => contexts.find((c) => c.id === a.contextId)?.name ?? "").join(" ");
      const searchMatch = !q || [card.name, card.role, card.category, card.city, card.details, card.message, contextText].some((value) => value.toLowerCase().includes(q));
      return categoryMatch && searchMatch;
    });
  }, [cards, contexts, filter, search]);

  const resetEditor = () => {
    setActiveId(null);
    setRole("");
    setName("");
    setCity("");
    setDetails("");
    setMessage("");
    setDisplayMode("ticker");
    setSelectedContextId("");
    setAssignmentTime("");
    setAssignmentLocation("");
    setFormStep(1);
    setCustomColor("#2D6CDF");
    setPattern("none");
    setPatternAnimated(false);
  };

  const createContext = () => {
    const cleanName = newContextName.trim();
    if (!cleanName) return;
    const context: ContextRecord = {
      id: newId("context"),
      name: cleanName,
      kind: newContextKind.trim() || "Contexte",
      city: newContextCity.trim(),
      date: newContextDate.trim(),
    };
    setContexts((current) => [...current, context]);
    setSelectedContextId(context.id);
    setNewContextName("");
    setNewContextCity("");
    setNewContextDate("");
  };

  const createCard = () => {
    const cleanRole = role.trim();
    const cleanName = name.trim();
    if (!cleanRole || !cleanName) return;

    const category = deriveCategory(cleanRole);
    const card: ColorCardRecord = {
      id: newId("card"),
      name: cleanName,
      role: cleanRole,
      category,
      color: customColor,
      pattern,
      patternAnimated,
      city: city.trim(),
      details: details.trim(),
      message: message.trim(),
      displayMode,
      assignments: selectedContextId
        ? [{ contextId: selectedContextId, message: message.trim(), displayMode, time: assignmentTime, location: assignmentLocation.trim() }]
        : [],
    };
    setCards((current) => [...current, card]);
    setActiveId(card.id);
    setFormStep(2);
  };

  const updateActive = (patch: Partial<ColorCardRecord>) => {
    if (!activeCard) return;
    setCards((current) => current.map((card) => card.id === activeCard.id ? { ...card, ...patch } : card));
  };

  const saveContextMessage = () => {
    if (!activeCard || !selectedContextId) return;
    const clean = message.trim();
    const assignments = activeCard.assignments.some((a) => a.contextId === selectedContextId)
      ? activeCard.assignments.map((a) => a.contextId === selectedContextId ? { ...a, message: clean, displayMode, time: assignmentTime, location: assignmentLocation.trim() } : a)
      : [...activeCard.assignments, { contextId: selectedContextId, message: clean, displayMode, time: assignmentTime, location: assignmentLocation.trim() }];
    updateActive({ assignments });
    setMessage("");
  };

  const updateContextMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    if (!activeCard || !selectedContextId) {
      if (activeCard) updateActive({ displayMode: mode });
      return;
    }
    const assignments = activeCard.assignments.some((a) => a.contextId === selectedContextId)
      ? activeCard.assignments.map((a) => a.contextId === selectedContextId ? { ...a, displayMode: mode } : a)
      : [...activeCard.assignments, { contextId: selectedContextId, message: activeCard.message, displayMode: mode, time: assignmentTime, location: assignmentLocation.trim() }];
    updateActive({ assignments });
  };

  const deleteAssignment = () => {
    if (!activeCard || !selectedContextId) return;
    updateActive({ assignments: activeCard.assignments.filter((a) => a.contextId !== selectedContextId) });
    setSelectedContextId("");
    setAssignmentTime("");
    setAssignmentLocation("");
  };

  const deleteCard = (id: string) => {
    setCards((current) => current.filter((card) => card.id !== id));
    if (activeId === id) resetEditor();
  };

  const selectCard = (card: ColorCardRecord) => {
    setActiveId(card.id);
    setRole(card.role);
    setName(card.name);
    setCity(card.city);
    setDetails(card.details);
    setMessage(card.message);
    setDisplayMode(card.displayMode);
    setCustomColor(card.color);
    setPattern(card.pattern ?? "none");
    setPatternAnimated(card.patternAnimated ?? false);
    const firstAssignment = card.assignments[0];
    setSelectedContextId(firstAssignment?.contextId ?? "");
    setAssignmentTime(firstAssignment?.time ?? "");
    setAssignmentLocation(firstAssignment?.location ?? "");
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <style>{`
        @keyframes colorcard-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .colorcard-marquee { animation: colorcard-marquee 9s linear infinite; }
        @keyframes colorcard-pattern-motion { 0% { background-position: 0 0; } 100% { background-position: 80px 60px; } }
        .colorcard-pattern-motion { animation: colorcard-pattern-motion 10s linear infinite; }
      `}</style>

      <header className="flex items-center justify-between border-b border-[#252525] px-6 py-4">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em]">COLORCARD</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-[#666]">
          {cards.length} carte{cards.length !== 1 ? "s" : ""} · {contexts.length} contexte{contexts.length !== 1 ? "s" : ""}
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        <section className="mx-auto max-w-[760px]">
          <div className="mb-7 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#666]">UN REGISTRE VIVANT</div>
            <h1 className="mt-2 text-4xl font-bold uppercase tracking-[-0.04em]">Une carte. N'importe quel rôle.</h1>
            <p className="mx-auto mt-3 max-w-lg text-[11px] leading-5 text-[#777]">
              Qui est qui, où, et dans quel contexte. Une carte peut appartenir à plusieurs groupes.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[430px]">
            <div className="relative">
              <EyeCard
                monsterBg={activeCard?.color ?? customColor ?? previewColor}
                cardBg="#FBF0DC"
                eyeWhite="#FBF0DC"
                pupilColor="#000"
                hexDisplay={(activeCard?.category ?? previewCategory).toUpperCase()}
                name={activeCard?.name ?? (name || "Ma carte")}
                label={activeCard ? [activeCard.role, activeCard.city].filter(Boolean).join(" · ") : [role || "Ajouter un rôle", city].filter(Boolean).join(" · ")}
                message={visibleMessage || "Écrivez quelque chose…"}
                displayMode={visibleMode}
                pattern={activeCard?.pattern ?? pattern}
                patternAnimated={activeCard?.patternAnimated ?? patternAnimated}
              />
              {activeCard && (
                <button onClick={() => deleteCard(activeCard.id)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-black/75 text-white hover:bg-black" aria-label="Supprimer la carte">
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <div className="mt-4 border border-[#303030] bg-[#111] p-5">
              {!activeCard ? (
                <>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#666]">Créer une carte</div>
                      <div className="mt-1 text-[13px] font-bold uppercase">Étape {formStep} / 4</div>
                    </div>
                    <div className="text-[8px] uppercase tracking-[0.12em] text-[#555]">Une seule carte pour commencer</div>
                  </div>

                  <div className="mb-5 flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="h-1 flex-1" style={{ backgroundColor: step <= formStep ? "#fff" : "#303030" }} />
                    ))}
                  </div>

                  {formStep === 1 && (
                    <>
                      <div className="mb-5">
                        <div className="text-[8px] uppercase tracking-[0.14em] text-[#666]">Carte</div>
                        <p className="mt-1 text-[11px] leading-5 text-[#888]">Commence simplement. Le contexte et les détails viennent après.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Nom</span>
                          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom affiché" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Rôle / fonction</span>
                          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Saxophoniste, Maman, DJ…" onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && role.trim()) createCard(); }} className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                      </div>
                      <div className="mt-5 flex justify-end">
                        <button onClick={createCard} disabled={!role.trim() || !name.trim()} className="bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:opacity-25">Créer ma carte →</button>
                      </div>
                    </>
                  )}

                  {formStep > 1 && (
                    <div className="flex items-center justify-between">
                      <button onClick={() => setFormStep((step) => Math.max(1, step - 1))} className="text-[9px] uppercase tracking-[0.1em] text-[#666] hover:text-white">← Retour</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#666]">Carte sélectionnée</div>
                      <div className="mt-1 text-[13px] font-bold uppercase">{activeCard.name}</div>
                    </div>
                    <button onClick={resetEditor} className="text-[9px] uppercase tracking-[0.14em] text-[#666] hover:text-white">Nouvelle carte</button>
                  </div>

                  <div className="mb-5 flex gap-1">
                    {[2, 3, 4].map((step) => (
                      <button key={step} onClick={() => setFormStep(step)} className="h-1 flex-1" style={{ backgroundColor: formStep >= step ? "#fff" : "#303030" }} aria-label={`Étape ${step}`} />
                    ))}
                  </div>

                  {formStep === 2 && (
                    <div>
                      <div className="mb-4">
                        <div className="text-[8px] uppercase tracking-[0.14em] text-[#666]">Profil</div>
                        <p className="mt-1 text-[11px] leading-5 text-[#888]">Ajoute maintenant les informations qui situent cette carte.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Ville</span>
                          <input value={city} onChange={(e) => { setCity(e.target.value); updateActive({ city: e.target.value }); }} placeholder="Valenciennes, Paris…" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Indication</span>
                          <input value={details} onChange={(e) => { setDetails(e.target.value); updateActive({ details: e.target.value }); }} placeholder="Agence, spécialité, groupe…" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                      </div>
                      <div className="mt-5 flex justify-between">
                        <button onClick={() => setFormStep(1)} className="text-[9px] uppercase tracking-[0.1em] text-[#666] hover:text-white">← Carte</button>
                        <button onClick={() => setFormStep(3)} className="bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] text-black">Contexte →</button>
                      </div>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-[8px] uppercase tracking-[0.14em] text-[#666]">Contexte / événement</div>
                          <p className="mt-1 text-[11px] leading-5 text-[#888]">Une carte peut appartenir à plusieurs événements ou groupes.</p>
                        </div>
                        {selectedContext && <button onClick={deleteAssignment} className="text-[8px] uppercase tracking-[0.1em] text-[#666] hover:text-white">Retirer</button>}
                      </div>

                      <select value={selectedContextId} onChange={(e) => {
                        const id = e.target.value;
                        setSelectedContextId(id);
                        const assignment = activeCard.assignments.find((a) => a.contextId === id);
                        if (assignment) {
                          setMessage(assignment.message);
                          setDisplayMode(assignment.displayMode);
                          setAssignmentTime(assignment.time ?? "");
                          setAssignmentLocation(assignment.location ?? "");
                        } else {
                          setMessage(activeCard.message);
                          setDisplayMode(activeCard.displayMode);
                          setAssignmentTime("");
                          setAssignmentLocation("");
                        }
                      }} className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[10px] text-white outline-none focus:border-white">
                        <option value="">Aucun contexte — carte générale</option>
                        {contexts.map((context) => <option key={context.id} value={context.id}>{context.name}{context.city ? ` · ${context.city}` : ""}</option>)}
                      </select>

                      <div className="mt-3 grid gap-2 sm:grid-cols-[1.3fr_.8fr_.9fr_.8fr_auto]">
                        <input value={newContextName} onChange={(e) => setNewContextName(e.target.value)} placeholder="Événement, groupe, projet…" className="w-full border border-[#303030] bg-[#1a1a1a] px-2 py-3 text-[10px] text-white outline-none focus:border-white" />
                        <input value={newContextKind} onChange={(e) => setNewContextKind(e.target.value)} placeholder="Type" className="w-full border border-[#303030] bg-[#1a1a1a] px-2 py-3 text-[10px] text-white outline-none focus:border-white" />
                        <input value={newContextCity} onChange={(e) => setNewContextCity(e.target.value)} placeholder="Ville" className="w-full border border-[#303030] bg-[#1a1a1a] px-2 py-3 text-[10px] text-white outline-none focus:border-white" />
                        <input value={newContextDate} onChange={(e) => setNewContextDate(e.target.value)} placeholder="Date" className="w-full border border-[#303030] bg-[#1a1a1a] px-2 py-3 text-[10px] text-white outline-none focus:border-white" />
                        <button onClick={createContext} disabled={!newContextName.trim()} className="border border-white px-4 py-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-25">Créer</button>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Horaire</span>
                          <input type="time" value={assignmentTime} onChange={(e) => setAssignmentTime(e.target.value)} className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Où ?</span>
                          <input value={assignmentLocation} onChange={(e) => setAssignmentLocation(e.target.value)} placeholder="Lieu, adresse, salle…" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                      </div>

                      <div className="mt-5 border-t border-[#242424] pt-5">
                        <div className="mb-3 text-[8px] uppercase tracking-[0.14em] text-[#666]">Apparence de la carte</div>
                        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                          <label className="flex items-center gap-3">
                            <span className="text-[8px] uppercase tracking-[0.12em] text-[#666]">Couleur</span>
                            <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); updateActive({ color: e.target.value }); }} className="h-10 w-16 cursor-pointer border border-[#303030] bg-transparent p-0.5" />
                          </label>
                          <div>
                            <div className="mb-2 text-[8px] uppercase tracking-[0.12em] text-[#666]">Motif</div>
                            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                              {PATTERNS.map((item) => (
                                <button key={item} onClick={() => { setPattern(item); updateActive({ pattern: item }); }} className="border px-2 py-2.5 text-[8px] font-semibold uppercase tracking-[0.06em]" style={{ borderColor: pattern === item ? "#fff" : "#303030", color: pattern === item ? "#fff" : "#666" }}>{PATTERN_LABELS[item]}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-[8px] uppercase tracking-[0.12em] text-[#777]">
                          <input type="checkbox" checked={patternAnimated} onChange={(e) => { setPatternAnimated(e.target.checked); updateActive({ patternAnimated: e.target.checked }); }} />
                          Motif animé
                        </label>
                      </div>

                      <div className="mt-5 flex justify-between">
                        <button onClick={() => setFormStep(2)} className="text-[9px] uppercase tracking-[0.1em] text-[#666] hover:text-white">← Profil</button>
                        <button onClick={() => { if (selectedContextId) saveContextMessage(); setFormStep(4); }} className="bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] text-black">Message →</button>
                      </div>
                    </div>
                  )}

                  {formStep === 4 && (
                    <div>
                      <div className="mb-4">
                        <div className="text-[8px] uppercase tracking-[0.14em] text-[#666]">Message & affichage</div>
                        <p className="mt-1 text-[11px] leading-5 text-[#888]">Le texte sous les yeux peut changer selon le contexte.</p>
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="min-w-0 flex-1">
                          <span className="mb-1 block text-[8px] uppercase tracking-[0.14em] text-[#666]">Message {selectedContext ? `pour « ${selectedContext.name} »` : ""}</span>
                          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Le texte sous les yeux…" className="w-full border border-[#303030] bg-[#1a1a1a] px-3 py-3 text-[11px] text-white outline-none focus:border-white" />
                        </label>
                        <button onClick={() => selectedContext ? saveContextMessage() : updateActive({ message: message.trim() })} className="flex h-[40px] items-center gap-1.5 border border-white px-3 text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-white hover:text-black"><Plus size={12} /> Enregistrer</button>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 text-[8px] uppercase tracking-[0.14em] text-[#666]">Mode sous les yeux</div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(Object.keys(MODE_LABELS) as DisplayMode[]).map((mode) => (
                            <button key={mode} onClick={() => updateContextMode(mode)} className="border px-2 py-2.5 text-[8px] uppercase tracking-[0.08em]" style={{ borderColor: visibleMode === mode ? "#fff" : "#303030", color: visibleMode === mode ? "#fff" : "#666" }}>
                              {MODE_LABELS[mode]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 flex justify-between border-t border-[#242424] pt-4">
                        <button onClick={() => setFormStep(3)} className="text-[9px] uppercase tracking-[0.1em] text-[#666] hover:text-white">← Contexte</button>
                        <button onClick={() => setFormStep(2)} className="border border-[#303030] px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-[#888] hover:border-white hover:text-white">Modifier le profil</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-[#252525] pt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Lecture</div>
              <div className="mt-1 text-[18px] font-bold uppercase tracking-tight">{viewMode === "timeline" ? "Tout le monde, dans le temps" : "Le registre"}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setViewMode("registry")} className="border px-3 py-2 text-[8px] uppercase tracking-[0.1em]" style={{ borderColor: viewMode === "registry" ? "#fff" : "#303030", color: viewMode === "registry" ? "#fff" : "#666" }}>Registre</button>
              <button onClick={() => setViewMode("timeline")} className="border px-3 py-2 text-[8px] uppercase tracking-[0.1em]" style={{ borderColor: viewMode === "timeline" ? "#fff" : "#303030", color: viewMode === "timeline" ? "#fff" : "#666" }}>Timeline{timelineAvailable ? ` · ${timelineItems.length}` : ""}</button>
            </div>
          </div>

          {viewMode === "timeline" ? (
            <div className="mt-8">
              {timelineItems.length === 0 ? (
                <div className="border border-dashed border-[#303030] p-10 text-center">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[#666]">Timeline en attente</div>
                  <p className="mx-auto mt-2 max-w-lg text-[11px] leading-5 text-[#777]">Ajoutez une date au contexte et une heure à une carte associée. La Timeline se construit automatiquement, sans créer de nouvelle donnée.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-0 left-[66px] top-0 w-px bg-[#303030]" />
                  <div className="space-y-2">
                    {timelineItems.map((item) => (
                      <button key={item.id} onClick={() => { selectCard(item.card); setSelectedContextId(item.context.id); setMessage(item.assignment.message); setDisplayMode(item.assignment.displayMode); setAssignmentTime(item.assignment.time ?? ""); setAssignmentLocation(item.assignment.location ?? ""); }} className="relative grid w-full grid-cols-[54px_24px_1fr] gap-2 text-left group">
                        <div className="pt-3 text-right text-[10px] font-bold tabular-nums text-[#888]">{item.time}</div>
                        <div className="relative flex justify-center pt-4"><span className="z-10 h-2 w-2 rounded-full border border-white bg-[#0c0c0c]" /></div>
                        <div className="border border-[#303030] bg-[#111] p-4 transition-colors group-hover:border-white">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="text-[13px] font-bold uppercase">{item.card.name}</div>
                            <div className="text-[8px] uppercase tracking-[0.12em] text-[#666]">{item.card.role}</div>
                          </div>
                          <div className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#777]">{item.context.name} · {item.location || "Lieu non renseigné"}</div>
                          {item.assignment.message && <div className="mt-2 text-[11px] text-[#bbb]">“{item.assignment.message}”</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Votre registre</div>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight">Qui est qui</h2>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <button key={category} onClick={() => setFilter(category)} className="border px-3 py-1.5 text-[8px] uppercase tracking-[0.1em]" style={{ borderColor: filter === category ? "#fff" : "#303030", color: filter === category ? "#fff" : "#666" }}>
                  {category} {category !== "Toutes" && <span className="text-[#444]">{cards.filter((card) => card.category === category).length}</span>}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-[220px]">
              <Search size={12} className="absolute left-2.5 top-2.5 text-[#666]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une personne, ville, groupe…" className="w-full border border-[#303030] bg-[#111] py-2 pl-7 pr-3 text-[9px] text-white outline-none focus:border-white" />
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="mx-auto mt-12 max-w-md border border-dashed border-[#303030] p-10 text-center">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#666]">Le registre commence ici</div>
              <p className="mt-2 text-[11px] leading-5 text-[#777]">Crée une carte. Puis associe-la à autant de contextes, événements ou groupes que nécessaire.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCards.map((card) => (
                <button key={card.id} onClick={() => selectCard(card)} className="group relative text-left transition-transform hover:-translate-y-1">
                  <EyeCard monsterBg={card.color} cardBg="#FBF0DC" eyeWhite="#FBF0DC" pupilColor="#000" hexDisplay={card.category.toUpperCase()} name={card.name} label={[card.role, card.city].filter(Boolean).join(" · ")} message={card.message || "Ajouter un message…"} displayMode={card.displayMode} pattern={card.pattern ?? "none"} patternAnimated={card.patternAnimated ?? false} />
                  <div className="border-t border-black/10 bg-[#FBF0DC] px-4 pb-3 text-[8px] uppercase tracking-[0.08em] text-black/45">
                    <div className="flex items-center gap-1"><Link2 size={9} /> {card.assignments.length} contexte{card.assignments.length !== 1 ? "s" : ""}</div>
                    <div className="mt-1 truncate">{card.details || "Aucune indication supplémentaire"}</div>
                  </div>
                  {activeId === card.id && <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-white text-black"><Check size={12} /></div>}
                </button>
              ))}
            </div>
          )}
            </>
          )}
        </section>

        {contexts.length > 0 && (
          <section className="mt-14 border-t border-[#252525] pt-7">
            <div className="mb-5">
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#666]">Contextes</div>
              <h2 className="mt-1 text-2xl font-bold uppercase tracking-tight">Événements & groupes</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contexts.map((context) => {
                const linked = cards.filter((card) => card.assignments.some((a) => a.contextId === context.id));
                return (
                  <button key={context.id} onClick={() => { setSelectedContextId(context.id); }} className="border border-[#303030] bg-[#111] p-4 text-left hover:border-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.14em] text-[#666]">{context.kind}</div>
                        <div className="mt-1 text-[14px] font-bold">{context.name}</div>
                      </div>
                      <div className="text-[9px] text-[#666]">{linked.length} carte{linked.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="mt-3 text-[9px] uppercase tracking-[0.08em] text-[#555]">{[context.city, context.date].filter(Boolean).join(" · ") || "Sans indication"}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <footer className="mt-16 border-t border-[#252525] py-5 text-center text-[8px] uppercase tracking-[0.16em] text-[#444]">
          Une carte = qui · fonction · ville · indication · plusieurs contextes · un mode par contexte
        </footer>
      </main>
    </div>
  );
}
