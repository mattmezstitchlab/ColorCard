import React, { useEffect, useMemo, useState } from "react";
import {
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  EyeCard,
  WeddingMilestone,
} from "./components/EyeCard";
import {
  StudioLogoIcon,
} from "./components/ModernIcons";
import { playCardTone, toggleAudioMute, getAudioMuted } from "./utils/audioSynth";

// 4 Curated Real-Life Presets
export const PRESETS_DATA: Record<string, { title: string; subtitle: string; milestones: WeddingMilestone[] }> = {
  mariage: {
    title: "MARIAGE DE CHLOÉ & ALEXANDRE",
    subtitle: "Mariage & Événement",
    milestones: [
      {
        id: "m-1",
        name: "Élodie Martin Studio",
        role: "Make-Up Artist & Coiffure Mariée",
        color: "#DB2777",
        cardBg: "#FDF2F8",
        timeSlot: "08:30 — 11:30",
        startMinute: 510,
        endMinute: 690,
        location: "Suite Nuptiale · Domaine de Champlâtreux",
        message: "MISE EN BEAUTÉ DE LA MARIÉE ET DES TÉMOINS",
        phone: "06 12 34 56 78",
        equipment: "Miroir LED pro, fer wavy Dyson, gamme waterproof",
        notes: "Teint lumineux naturel et chignon bas bohème.",
        agentGreeting: "BONJOUR ! JE GÈRE LA MISE EN BEAUTÉ DE LA MARIÉE DÈS 08H30.",
      },
      {
        id: "m-2",
        name: "Atelier Botanique Paris",
        role: "Designer Floral & Scénographe",
        color: "#16A34A",
        cardBg: "#F0FDF4",
        timeSlot: "10:00 — 13:00",
        startMinute: 600,
        endMinute: 780,
        location: "Allée des Charmes & Salle de Réception",
        message: "ARCHE FLORALE ET CENTRES DE TABLE EUCALYPTUS",
        phone: "06 23 45 67 89",
        equipment: "Arche en chêne massif, 14 compositions florales, rubans de soie",
        notes: "Palette pampa, pivoines blanches et touches terracotta poudrées.",
        agentGreeting: "BONJOUR ! TOUTES LES COMPOSITIONS FLORALES SONT PRÊTES.",
      },
      {
        id: "m-3",
        name: "Vintage Cars Prestige",
        role: "Chauffeur Privé & Jaguar Type E 1968",
        color: "#004B73",
        cardBg: "#F0F9FF",
        timeSlot: "12:00 — 14:00",
        startMinute: 720,
        endMinute: 840,
        location: "Mairie de Paris 8e → Domaine de Champlâtreux",
        message: "TRANSFERT DES MARIÉS EN VOITURE DE COLLECTION",
        phone: "06 34 56 78 90",
        equipment: "Véhicule lustré, bouteille de champagne à bord, chauffeur en livrée",
        notes: "Itinéraire via les quais de Seine pour shooting photo cortège.",
        agentGreeting: "BONJOUR ! LA JAGUAR TYPE E SERA PRÊTE DÈS 11H45.",
      },
      {
        id: "m-4",
        name: "Claire Vaneau",
        role: "Officiante de Cérémonie & Conteuse",
        color: "#9333EA",
        cardBg: "#FAF5FF",
        timeSlot: "14:00 — 15:30",
        startMinute: 840,
        endMinute: 930,
        location: "Parc du Domaine · Clairière des Chênes",
        message: "ÉCHANGE DES VŒUX ET RITUEL DU SABLE",
        phone: "06 45 67 89 01",
        equipment: "Pupitre laqué, micro HF Sennheiser, livrets personnalisés",
        notes: "Discours des 4 témoins intégrés. Durée totale : 45 min.",
        agentGreeting: "BONJOUR ! LE TEXTE DES VŒUX ET LE DÉROULÉ SONT PRÊTS.",
      },
      {
        id: "m-5",
        name: "Maison Lumière Visuals",
        role: "Photographe & Vidéaste Drone 4K",
        color: "#CA8A04",
        cardBg: "#FEFCE8",
        timeSlot: "15:30 — 23:30",
        startMinute: 930,
        endMinute: 1410,
        location: "Parc, Cocktail & Dîner · Domaine",
        message: "SÉANCE COUPLE SUNSET ET CLICHÉS SPONTANÉS",
        phone: "06 56 78 90 12",
        equipment: "2 Boîtiers Sony A7IV, Drone DJI Mavic 3 Pro, éclairage nomade",
        notes: "Shooting golden hour à 18h45. Galerie privée sous 15 jours.",
        agentGreeting: "BONJOUR ! JE SUIS VOTRE PHOTOGRAPHE DE LA JOURNÉE.",
      },
      {
        id: "m-6",
        name: "Alexandre Delacroix",
        role: "Saxophoniste Live & Sets Jazz",
        color: "#006494",
        cardBg: "#FBF0DC",
        timeSlot: "17:30 — 20:00",
        startMinute: 1050,
        endMinute: 1200,
        location: "Terrasse des Jardins · Vue Panoramique",
        message: "SET LIVE JAZZ & DEEP HOUSE AU COUCHER DU SOLEIL",
        phone: "06 67 89 01 23",
        equipment: "Saxophones Alto & Ténor, système son Bose L1 Pro sans fil",
        notes: "Reprise jazz de Daft Punk à l'entrée des mariés au vin d'honneur.",
        agentGreeting: "BONJOUR ! JE GÈRE L'AMBIANCE MUSICALE DU COCKTAIL.",
      },
      {
        id: "m-7",
        name: "Chef Antoine & Gourmet",
        role: "Traiteur Gastronomique & Chef de Rang",
        color: "#DC2626",
        cardBg: "#FEF2F2",
        timeSlot: "19:30 — 23:30",
        startMinute: 1170,
        endMinute: 1410,
        location: "Grande Orangerie · 120 Couverts",
        message: "MENU 4 TEMPS, SERVICE À L'ASSIETTE & ACCORDS METS-VINS",
        phone: "06 78 90 12 34",
        equipment: "Brigade de 6 cuisiniers, 8 serveurs, vaisselle dorée et cristal",
        notes: "Option végétarienne pour 14 personnes. Dégustation validée.",
        agentGreeting: "BONJOUR ! LE SERVICE DU DÎNER GASTRONOMIQUE EST CALIBRÉ.",
      },
      {
        id: "m-8",
        name: "Pâtisserie Céleste",
        role: "Cake Designer & Cascade Champagne",
        color: "#EA580C",
        cardBg: "#FFF7ED",
        timeSlot: "23:00 — 00:30",
        startMinute: 1380,
        endMinute: 30,
        location: "Terrasse Éclairée aux Flambeaux",
        message: "WEDDING CAKE FLORAL 4 ÉTAGES FRAMBOISE ET PISTACHE",
        phone: "06 89 01 23 45",
        equipment: "Support rotatif rétro-éclairé, fontaines lumineuses",
        notes: "Livraison en camion frigorifique à 22h00 pour découpe à 23h30.",
        agentGreeting: "BONJOUR ! LE GÂTEAU DE MARIAGE SERA LIVRÉ FRAIS À 22H00.",
      },
      {
        id: "m-9",
        name: "DJ Nightwave & Scéno FX",
        role: "DJ Club, Scénographie Lumière & Étincelles",
        color: "#7C3AED",
        cardBg: "#FAF5FF",
        timeSlot: "00:00 — 04:00",
        startMinute: 0,
        endMinute: 240,
        location: "Piste de Danse · Grande Salle",
        message: "OUVERTURE DE BAL, JET D'ÉTINCELLES FROIDES ET SET JUSQU'À L'AUBE",
        phone: "06 90 12 34 56",
        equipment: "Régie Pioneer CDJ-3000, 8 Lyres Beam, machines à étincelles Sparkular",
        notes: "Ouverture de bal sur 'Can't Take My Eyes Off You' puis club house.",
        agentGreeting: "BONJOUR ! LA SCÉNO LUMIÈRE ET LA PLAYLIST DU CLUB SONT PRÊTES.",
      },
    ],
  },
  freelance: {
    title: "JOURNÉE DE CRÉATION & FOCUS",
    subtitle: "Freelance & Télétravail",
    milestones: [
      {
        id: "f-1",
        name: "Café & Planification Clé",
        role: "Mise en route & Veille",
        color: "#F59E0B",
        cardBg: "#FEFCE8",
        timeSlot: "08:30 — 09:30",
        startMinute: 510,
        endMinute: 570,
        location: "Bureau / Espace Créatif",
        message: "LECTURE, VEILLE ET DÉFINITION DES 3 OBJECTIFS MAJEURS",
        phone: "06 00 00 00 00",
        equipment: "Carnet papier, café filtre, musique binaurale",
        notes: "Pas d'écrans de réseaux sociaux avant 12h.",
        agentGreeting: "BONJOUR ! PRÊT POUR UNE JOURNÉE ULTRA-PRODUCTIVE ?",
      },
      {
        id: "f-2",
        name: "Deep Work Sprint #1",
        role: "Design, Architecture & Code",
        color: "#006494",
        cardBg: "#F0F9FF",
        timeSlot: "09:30 — 12:30",
        startMinute: 570,
        endMinute: 750,
        location: "Poste de travail principal",
        message: "IMMERSION TOTALE SANS NOTIFICATIONS NI EMAILS",
        phone: "06 00 00 00 00",
        equipment: "Casque anti-bruit, mode Ne Pas Déranger activé",
        notes: "Livrer la première version complète du composant.",
        agentGreeting: "MODE FOCUS ACTIVÉ. JE FILTRE TOUTES VOS DISTRACTIONS.",
      },
      {
        id: "f-3",
        name: "Déjeuner & Marche Solaire",
        role: "Déconnexion & Respiration",
        color: "#16A34A",
        cardBg: "#F0FDF4",
        timeSlot: "12:30 — 14:00",
        startMinute: 750,
        endMinute: 840,
        location: "Extérieur / Parc & Cuisine",
        message: "REPAS SAIN, HYDRATATION ET MARCHE AU SOLEIL",
        phone: "06 00 00 00 00",
        equipment: "Lunettes de soleil, marche active de 30 min",
        notes: "Zéro travail pendant cette pause.",
        agentGreeting: "BONJOUR ! PROFITEZ DE CETTE PAUSE POUR VOUS RESSOURCER.",
      },
      {
        id: "f-4",
        name: "Live Client & Restitution",
        role: "Présentation & Démo Produit",
        color: "#7C3AED",
        cardBg: "#FAF5FF",
        timeSlot: "14:00 — 16:30",
        startMinute: 840,
        endMinute: 990,
        location: "Salle de réunion virtuelle",
        message: "DÉMO PROJET, RETOURS CLIENT ET VALIDATIONS",
        phone: "06 00 00 00 00",
        equipment: "Micro Shure, caméra HD, slides de restitution",
        notes: "Prendre en note les ajustements demandés.",
        agentGreeting: "LA DÉMO CLIENT EST PRÊTE. BONNE PRÉSENTATION !",
      },
      {
        id: "f-5",
        name: "Clôture & Inbox Zero",
        role: "Facturation & Rangement",
        color: "#334155",
        cardBg: "#F8FAFC",
        timeSlot: "16:30 — 18:00",
        startMinute: 990,
        endMinute: 1080,
        location: "Bureau",
        message: "ENVOI DES LIVRABLES, EMAILS ET PLAN POUR DEMAIN",
        phone: "06 00 00 00 00",
        equipment: "Outil de comptabilité, gestionnaire de tâches",
        notes: "Fermer tous les onglets du navigateur avant de quitter.",
        agentGreeting: "JOURNÉE ACCOMPLIE AVEC SUCCÈS. REPOSEZ-VOUS BIEN !",
      },
    ],
  },
  tournage: {
    title: "SHOOTING MODE & FILM PUBLICITAIRE",
    subtitle: "Régie Tournage & Production",
    milestones: [
      {
        id: "t-1",
        name: "Set Lumière & Machinerie",
        role: "Chef Électricien & Cadreurs",
        color: "#475569",
        cardBg: "#F8FAFC",
        timeSlot: "07:00 — 08:30",
        startMinute: 420,
        endMinute: 510,
        location: "Studio 4 · Plaine Saint-Denis",
        message: "MONTAGE DES PROJECTEURS, DIFFUSIONS ET TESTS CAMÉRA",
        phone: "06 11 22 33 44",
        equipment: "Projecteurs Aputure 600d, pied Manfrotto, retour vidéo",
        notes: "Ambiance clair-obscur feutrée pour le plan d'ouverture.",
        agentGreeting: "BONJOUR ! LE MATÉRIEL EST EN COURS D'INSTALLATION.",
      },
      {
        id: "t-2",
        name: "HMC & Habillage Talents",
        role: "Make-Up Artist & Styliste",
        color: "#DB2777",
        cardBg: "#FDF2F8",
        timeSlot: "08:30 — 10:00",
        startMinute: 510,
        endMinute: 600,
        location: "Loge Principale",
        message: "MISE EN BEAUTÉ HAUTE COUTURE ET HABILLAGE SILHOUETTES",
        phone: "06 22 33 44 55",
        equipment: "Table HMC, steamer vapeur, 3 tenues validées",
        notes: "Raccord maquillage toutes les 45 minutes.",
        agentGreeting: "LES MODÈLES SONT PRÊTS POUR LE PLATEAU.",
      },
      {
        id: "t-3",
        name: "Tournage Séquence Master",
        role: "Réalisateur & Équipe Image",
        color: "#DC2626",
        cardBg: "#FEF2F2",
        timeSlot: "10:00 — 13:00",
        startMinute: 600,
        endMinute: 780,
        location: "Plateau Principal",
        message: "PLANS LARGES, TRAVELLINGS ET CHORÉGRAPHIE SILHOUETTES",
        phone: "06 33 44 55 66",
        equipment: "Caméra Arri Alexa Mini LF, optiques Cooke Anamorphic",
        notes: "Silences plateau demandés. 12 prises prévues.",
        agentGreeting: "MOTEUR DEMANDÉ. TOURNAGE EN COURS SUR LE PLATEAU.",
      },
      {
        id: "t-4",
        name: "Plans Sérigraphie & Détails",
        role: "Cadreur & Équipe Son",
        color: "#CA8A04",
        cardBg: "#FEFCE8",
        timeSlot: "14:00 — 17:30",
        startMinute: 840,
        endMinute: 1050,
        location: "Plateau B / Table de Packshot",
        message: "GROS PLANS PRODUIT, TEXTURES ET EFFETS DE LUMIÈRE SLOW-MO",
        phone: "06 44 55 66 77",
        equipment: "Objectif Macro 100mm, plateau tournant motorisé",
        notes: "Prises à 120 images/seconde pour les ralentis.",
        agentGreeting: "PLANS DÉTAILS ENREGISTRÉS EN TRÈS HAUTE DÉFINITION.",
      },
      {
        id: "t-5",
        name: "Dérushage & Wrap Général",
        role: "DIT & Régisseur Général",
        color: "#003459",
        cardBg: "#F0F9FF",
        timeSlot: "17:30 — 19:30",
        startMinute: 1050,
        endMinute: 1170,
        location: "Poste DIT & Camion Régie",
        message: "DOUBLE BACKUP CHECKSUM, CONTRÔLE RUSHES ET DÉMONTAGE",
        phone: "06 55 66 77 88",
        equipment: "Station RAID OWC, disques SSD de transport, caisses flight-case",
        notes: "Envoi du rapport de production et sauvegarde cloud.",
        agentGreeting: "WRAP TERMINÉ ! TOUS LES RUSHES SONT SÉCURISÉS.",
      },
    ],
  },
  famille: {
    title: "ROUTINE QUOTIDIENNE DE LA MAISON",
    subtitle: "Famille & Enfants",
    milestones: [
      {
        id: "r-1",
        name: "Matin & Petit-Déjeuner",
        role: "Éveil & Énergie",
        color: "#F59E0B",
        cardBg: "#FEFCE8",
        timeSlot: "07:00 — 08:15",
        startMinute: 420,
        endMinute: 495,
        location: "Cuisine & Entrée",
        message: "PETIT-DÉJEUNER VITAMINÉ, HABILLAGE ET DÉPART ÉCOLE",
        phone: "06 00 00 00 00",
        equipment: "Sacs préparés la veille, gourdes remplies",
        notes: "Musique douce au réveil.",
        agentGreeting: "BONJOUR ! TRÈS BELLE JOURNÉE QUI COMMENCE.",
      },
      {
        id: "r-2",
        name: "Journée d'Apprentissage",
        role: "École & Découverte",
        color: "#006494",
        cardBg: "#F0F9FF",
        timeSlot: "08:30 — 16:30",
        startMinute: 510,
        endMinute: 990,
        location: "École & Activités",
        message: "CONCENTRATION, ATELIERS ET TEMPS DE RÉCRÉATION",
        phone: "06 00 00 00 00",
        equipment: "Cartable, trousse, cahier de liaison",
        notes: "Goûter prévu dans la petite poche.",
        agentGreeting: "JOURNÉE SCOLAIRE EN COURS. APPRENEZ BIEN !",
      },
      {
        id: "r-3",
        name: "Goûter, Parc & Devoirs",
        role: "Détente & Plein Air",
        color: "#16A34A",
        cardBg: "#F0FDF4",
        timeSlot: "16:30 — 18:30",
        startMinute: 990,
        endMinute: 1110,
        location: "Parc du quartier & Bureau maison",
        message: "PAUSE FRUITS, VÉLO EN PLEIN AIR ET LECTURE DU SOIR",
        phone: "06 00 00 00 00",
        equipment: "Ballon de foot, goûter maison, livre de contes",
        notes: "30 minutes de grand air avant les devoirs.",
        agentGreeting: "C'EST L'HEURE DU GOÛTER ET DE LA DÉTENTE !",
      },
      {
        id: "r-4",
        name: "Bain, Dîner & Histoire",
        role: "Douceur & Nuit Paisible",
        color: "#9333EA",
        cardBg: "#FAF5FF",
        timeSlot: "18:30 — 20:30",
        startMinute: 1110,
        endMinute: 1230,
        location: "Chambre & Salle de bain",
        message: "REPAS CHAUD, HISTOIRE DU SOIR ET ENDORMISSEMENT",
        phone: "06 00 00 00 00",
        equipment: "Veilleuse douce, livre illustré préféré",
        notes: "Lumières tamisées dès 20h00.",
        agentGreeting: "BONNE NUIT ET FAITES DE TRÈS BEAUX RÊVES !",
      },
    ],
  },
};

export function App() {
  const [activePresetKey, setActivePresetKey] = useState(() => {
    return localStorage.getItem("colorcard_active_preset_key_v9") || "mariage";
  });

  const [eventTitle, setEventTitle] = useState(() => {
    return localStorage.getItem("colorcard_event_title_v9") || PRESETS_DATA.mariage.title;
  });

  const [milestones, setMilestones] = useState<WeddingMilestone[]>(() => {
    try {
      const saved = localStorage.getItem("colorcard_wedding_master_v9");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRESETS_DATA.mariage.milestones;
  });

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(() => {
    return milestones[0]?.id || "m-1";
  });

  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => getAudioMuted());
  const [isCopiedItinerary, setIsCopiedItinerary] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("colorcard_wedding_master_v9", JSON.stringify(milestones));
      localStorage.setItem("colorcard_event_title_v9", eventTitle);
      localStorage.setItem("colorcard_active_preset_key_v9", activePresetKey);
    } catch {
      // silent
    }
  }, [milestones, eventTitle, activePresetKey]);

  // Current active milestone
  const currentMilestone = useMemo(() => {
    return milestones.find((m) => m.id === activeMilestoneId) || milestones[0];
  }, [milestones, activeMilestoneId]);

  const currentIndex = useMemo(() => {
    return milestones.findIndex((m) => m.id === activeMilestoneId);
  }, [milestones, activeMilestoneId]);

  // Load a preset
  const handleSelectPreset = (key: string) => {
    const preset = PRESETS_DATA[key];
    if (!preset) return;

    setActivePresetKey(key);
    setEventTitle(preset.title);
    setMilestones(preset.milestones);
    setActiveMilestoneId(preset.milestones[0].id);
    setShowPresetMenu(false);
    playCardTone(preset.milestones[0].color, "change");
  };

  // Update helper
  const handleUpdateMilestone = (patch: Partial<WeddingMilestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === activeMilestoneId ? { ...m, ...patch } : m))
    );
    if (patch.color) {
      playCardTone(patch.color, "change");
    }
  };

  // Switch to previous or next milestone
  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + milestones.length) % milestones.length;
    setActiveMilestoneId(milestones[prevIdx].id);
    playCardTone(milestones[prevIdx].color, "hover");
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % milestones.length;
    setActiveMilestoneId(milestones[nextIdx].id);
    playCardTone(milestones[nextIdx].color, "hover");
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlayingTimeline((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, milestones]);

  // Timeline simulation playback: moves through milestones every 2.5 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setActiveMilestoneId((prevId) => {
          const idx = milestones.findIndex((m) => m.id === prevId);
          const nextIdx = (idx + 1) % milestones.length;
          playCardTone(milestones[nextIdx].color, "step");
          return milestones[nextIdx].id;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline, milestones]);

  // Add custom moment
  const handleAddMoment = () => {
    const newId = `m-${Date.now()}`;
    const newMilestone: WeddingMilestone = {
      id: newId,
      name: "Nouvelle Mission",
      role: "Rôle & Spécialité",
      color: "#3B82F6",
      cardBg: "#FBF0DC",
      timeSlot: "16:00 — 18:00",
      startMinute: 960,
      endMinute: 1080,
      location: "Lieu de la mission",
      message: "NOUVELLE MISSION PLANIFIÉE",
      phone: "06 00 00 00 00",
      equipment: "Équipement autonome",
      notes: "Consignes de coordination",
      agentGreeting: "BONJOUR ! JE SUIS L'AGENT DE CE NOUVEAU MOMENT.",
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setActiveMilestoneId(newId);
    playCardTone(newMilestone.color, "step");
  };

  // Duplicate current milestone
  const handleDuplicateCurrent = () => {
    const dupId = `m-${Date.now()}`;
    const dup: WeddingMilestone = {
      ...currentMilestone,
      id: dupId,
      name: `${currentMilestone.name} (COPIE)`,
    };
    setMilestones((prev) => [...prev, dup]);
    setActiveMilestoneId(dupId);
    playCardTone(currentMilestone.color, "change");
  };

  // Delete current milestone
  const handleDeleteCurrent = () => {
    if (milestones.length <= 1) return;
    const remaining = milestones.filter((m) => m.id !== activeMilestoneId);
    setMilestones(remaining);
    setActiveMilestoneId(remaining[0].id);
    playCardTone("#DC2626", "change");
  };

  // Copy clean 24h timeline text itinerary to clipboard
  const handleCopyFullItinerary = () => {
    const text = [
      `DÉROULÉ 24H · ${eventTitle.toUpperCase()}`,
      `────────────────────────────────────`,
      ...milestones.map((m, i) => `${i + 1}. [${m.timeSlot}] ${m.name} — ${m.role}\n   Brief: ${m.message}\n   Contact: ${m.phone}`),
      `────────────────────────────────────`,
      `ColorCard Studio 24H`,
    ].join("\n");

    navigator.clipboard?.writeText(text);
    setIsCopiedItinerary(true);
    setTimeout(() => setIsCopiedItinerary(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#EDEDED] font-sans antialiased flex flex-col justify-between selection:bg-white selection:text-black">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (MINIMALIST WITH PRESET SELECTOR)                       */}
      {/* ========================================================================= */}
      <header className="bg-[#0A0A0E] border-b border-[#161620] px-4 lg:px-6 py-3 flex items-center justify-between select-none">
        {/* Brand & Preset Dropdown */}
        <div className="flex items-center gap-3">
          <div className="size-7 rounded bg-white text-black flex items-center justify-center shadow-md">
            <StudioLogoIcon size={16} />
          </div>

          {/* Preset Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141E] hover:bg-[#1E1E2C] border border-[#222232] text-[10px] font-black uppercase tracking-wider text-white transition-colors"
            >
              <span>{PRESETS_DATA[activePresetKey]?.subtitle || "Modèle"}</span>
              <span className="text-[9px] opacity-50">▾</span>
            </button>

            {/* Presets Popover */}
            {showPresetMenu && (
              <div className="absolute left-0 top-8 w-60 bg-[#0E0E16] border border-white/20 rounded-xl shadow-2xl py-1.5 z-50 text-left space-y-0.5">
                {[
                  { key: "mariage", label: "Mariage & Événement", desc: "9 moments · Du matin à la nuit" },
                  { key: "freelance", label: "Focus Freelance & Créatif", desc: "5 blocs · Deep work & pause" },
                  { key: "tournage", label: "Tournage & Régie Shooting", desc: "5 étapes · Set, prises & wrap" },
                  { key: "famille", label: "Routine Quotidienne & Famille", desc: "4 temps · Maison & école" },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSelectPreset(p.key)}
                    className={`w-full px-3 py-2 text-left transition-colors flex flex-col ${
                      activePresetKey === p.key ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-[10.5px] font-black uppercase">{p.label}</span>
                    <span className={`text-[8.5px] ${activePresetKey === p.key ? "text-black/70" : "text-[#707085]"}`}>
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Editable Event Title */}
        <div className="hidden sm:flex items-center gap-2 bg-[#101017] border border-[#1C1C26] rounded-lg px-3.5 py-1 shadow-sm">
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value.toUpperCase())}
            placeholder="TITRE DE L'ÉVÉNEMENT..."
            className="text-[10.5px] font-black uppercase tracking-wider text-white bg-transparent border-b border-dashed border-transparent hover:border-white/30 focus:border-white outline-none text-center max-w-[280px]"
          />
          <span className="text-[9px] text-[#707085] font-bold">({milestones.length})</span>
        </div>

        {/* Right Controls: Copy Timeline + Audio */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyFullItinerary}
            className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all border ${
              isCopiedItinerary
                ? "bg-white text-black border-white shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white border-white/20 active:scale-95"
            }`}
            title="Copier le planning complet"
          >
            {isCopiedItinerary ? "Planning copié !" : "Copier Déroulé"}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = toggleAudioMute();
              setIsMuted(next);
              if (!next) playCardTone(currentMilestone.color, "change");
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted
                ? "bg-[#12121A] border-[#1E1E28] text-[#606070]"
                : "bg-white text-black border-white shadow-sm"
            }`}
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTER LIVING CARD (THE SOLE HERO - SINGLE UNIFIED VIEW)               */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden bg-[#070709]">
        <div className="w-full max-w-[370px] sm:max-w-[390px] flex flex-col items-center">
          <EyeCard
            currentMilestone={currentMilestone}
            allMilestones={milestones}
            onSelectMilestone={(id) => setActiveMilestoneId(id)}
            onUpdateMilestone={handleUpdateMilestone}
            isPlayingTimeline={isPlayingTimeline}
            onTogglePlayTimeline={() => setIsPlayingTimeline(!isPlayingTimeline)}
            onPrevMilestone={handlePrev}
            onNextMilestone={handleNext}
            onAddMilestone={handleAddMoment}
          />

          {/* Minimalist Sub-Card Action Row */}
          <div className="w-full flex items-center justify-between text-[9.5px] font-bold text-[#656575] mt-3 px-1">
            <span className="font-mono text-white/80">
              {currentIndex + 1} / {milestones.length}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDuplicateCurrent}
                className="hover:text-white transition-colors"
                title="Dupliquer ce moment"
              >
                Dupliquer
              </button>

              <button
                type="button"
                onClick={handleAddMoment}
                className="hover:text-white transition-colors"
                title="Ajouter un moment"
              >
                + Moment
              </button>

              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="hover:text-red-400 transition-colors"
                  title="Supprimer ce moment"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MINIMAL CLEAN FOOTER                                                    */}
      {/* ========================================================================= */}
      <footer className="py-2 text-center text-[9px] text-[#454555] font-mono select-none">
        Naviguez avec les pastilles dans le socle ou avec les touches [←] [→] et [Espace]
      </footer>
    </div>
  );
}

export default App;
