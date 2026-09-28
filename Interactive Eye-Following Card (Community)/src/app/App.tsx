import React, { useEffect, useMemo, useState } from "react";
import {
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  EyeCard,
  ChildRitualMilestone,
} from "./components/EyeCard";
import {
  StudioLogoIcon,
} from "./components/ModernIcons";
import { playCardTone, toggleAudioMute, getAudioMuted } from "./utils/audioSynth";

// Curated Montessori & Child Rhythms Presets
export const PRESETS_DATA: Record<string, { title: string; subtitle: string; milestones: ChildRitualMilestone[] }> = {
  ecole: {
    title: "JOUR D'ÉCOLE & RITUELS DU QUOTIDIEN",
    subtitle: "Jour d'école & Maison",
    milestones: [
      {
        id: "e-1",
        name: "Réveil Doux & Habillage",
        role: "Autonomie & Confiance en Soi",
        color: "#FEF08A",
        cardBg: "#FEFCE8",
        timeSlot: "07:00 — 08:00",
        startMinute: 420,
        endMinute: 480,
        location: "Chambre & Penderie",
        message: "JE M'HABILLE SEUL ET JE RANGE MON PYJAMA",
        phone: "PAPA & MAMAN",
        equipment: "Vêtements préparés la veille sur la chaise basse",
        notes: "Lumière naturelle et musique douce au réveil.",
        agentGreeting: "BONJOUR PETIT EXPLORATEUR ! PRÊT POUR T'HABILLER TOUT SEUL ?",
      },
      {
        id: "e-2",
        name: "Petit-Déjeuner Solaire",
        role: "Énergie & Vitalité du Matin",
        color: "#F97316",
        cardBg: "#FFF7ED",
        timeSlot: "08:00 — 08:30",
        startMinute: 480,
        endMinute: 510,
        location: "Cuisine & Table Familiale",
        message: "JE MANGE MES FRUITS ET JE BOIS MON GRAND VERRE D'EAU",
        phone: "PAPA & MAMAN",
        equipment: "Bol, fruits frais, pain complet, carafe à ma taille",
        notes: "Prendre le temps de savourer chaque bouchée.",
        agentGreeting: "BON APPÉTIT ! FAIS LE PLEIN DE BELLE ÉNERGIE POUR LA JOURNÉE.",
      },
      {
        id: "e-3",
        name: "École & Découvertes",
        role: "Curiosité & Partage en Groupe",
        color: "#00A8E8",
        cardBg: "#F0F9FF",
        timeSlot: "08:30 — 12:00",
        startMinute: 510,
        endMinute: 720,
        location: "Classe & Ateliers Sensoriels",
        message: "J'APPRENDS DE NOUVELLES CHOSES ET J'AIDE MES AMIS",
        phone: "ÉCOLE & ENSEIGNANT",
        equipment: "Cartable léger, matériel Montessori, trousse de crayons",
        notes: "Expériences concrètes et travail en binôme.",
        agentGreeting: "BONNE MATINÉE D'APPRENTISSAGE ET DE BELLES DÉCOUVERTES !",
      },
      {
        id: "e-4",
        name: "Déjeuner & Récréation",
        role: "Partage & Jeux Libres",
        color: "#22C55E",
        cardBg: "#F0FDF4",
        timeSlot: "12:00 — 13:30",
        startMinute: 720,
        endMinute: 810,
        location: "Cantine & Cour de Récréation",
        message: "BON REPAS, RIRES ET JEUX EN PLEIN AIR AVEC LES COPAINS",
        phone: "ÉCOLE & SURVEILLANCE",
        equipment: "Ballon mousse, élastique, espace de jeux verts",
        notes: "Mouvement libre et décharge motrice.",
        agentGreeting: "C'EST LE MOMENT DE JOUER ET DE PROFITER DU SOLEIL !",
      },
      {
        id: "e-5",
        name: "Ateliers & Créativité",
        role: "Dessin, Motricité & Poésie",
        color: "#A855F7",
        cardBg: "#FAF5FF",
        timeSlot: "13:30 — 16:30",
        startMinute: 810,
        endMinute: 990,
        location: "Atelier d'Art & Bibliothèque",
        message: "JE PEINS, JE LIS ET JE LAISSE VOLER MON IMAGINATION",
        phone: "ÉCOLE & MÉDIATHÈQUE",
        equipment: "Pinceaux, gouaches naturelles, livres illustrés",
        notes: "Création libre sans modèle imposé.",
        agentGreeting: "LAISSE PARLER TA CRÉATIVITÉ ET TES COULEURS INTÉRIEURES !",
      },
      {
        id: "e-6",
        name: "Goûter & Temps Libre",
        role: "Détente Saine Sans Écran",
        color: "#FDBA74",
        cardBg: "#FFF7ED",
        timeSlot: "16:30 — 17:30",
        startMinute: 990,
        endMinute: 1050,
        location: "Cuisine & Parc du Quartier",
        message: "FRUIT, TARTINE ET JEUX EN PLEIN AIR SANS ÉCRAN",
        phone: "PAPA & MAMAN",
        equipment: "Goûter maison, gourde inox, vélo ou trottinette",
        notes: "Transition douce après la journée d'école.",
        agentGreeting: "BON GOÛTER ! PRENDS LE TEMPS DE SOUFFLER ET DE RIGOLER.",
      },
      {
        id: "e-7",
        name: "Concentration Montessori",
        role: "Focus Calme & Autonomie",
        color: "#006494",
        cardBg: "#F0F9FF",
        timeSlot: "17:30 — 18:30",
        startMinute: 1050,
        endMinute: 1110,
        location: "Espace de Travail Silencieux",
        message: "JE ME CONCENTRE 25 MINUTES DANS LE CALME ABSOLU",
        phone: "PAPA & MAMAN",
        equipment: "Minuteur visuel sablier, cahier de dessin, lampe chaude",
        notes: "L'enfant choisit l'ordre de ses devoirs/lectures.",
        agentGreeting: "MODE CONCENTRATION ACTIVÉ. TU EN ES TOTALEMENT CAPABLE !",
      },
      {
        id: "e-8",
        name: "Bain & Bulles d'Eau",
        role: "Détente Corporelle & Jeu Doux",
        color: "#38BDF8",
        cardBg: "#F0F9FF",
        timeSlot: "18:30 — 19:30",
        startMinute: 1110,
        endMinute: 1170,
        location: "Salle de Bain",
        message: "JEUX D'EAU, SAVON DOUX ET PYJAMA CHAUD",
        phone: "PAPA & MAMAN",
        equipment: "Jouets de bain en bois/silicone, serviette douce chaude",
        notes: "Eau tiède relaxante pour faire baisser la tension du corps.",
        agentGreeting: "DÉTENDEZ-VOUS DANS L'EAU CHAUDE ! LES BULLES SONT LÀ.",
      },
      {
        id: "e-9",
        name: "Dîner en Famille",
        role: "Partage & Écoute Bienveillante",
        color: "#EA580C",
        cardBg: "#FFF7ED",
        timeSlot: "19:30 — 20:30",
        startMinute: 1170,
        endMinute: 1230,
        location: "Table Familiale",
        message: "NOUS RACONTONS CHACUN NOTRE PLUS BEAU MOMENT DU JOUR",
        phone: "PAPA & MAMAN",
        equipment: "Table dressée ensemble, chandelle douce, repas chaud",
        notes: "Règle des 3 gratitudes partagées autour de la table.",
        agentGreeting: "BON DÎNER ENSEMBLE ! QUEL A ÉTÉ TON PLUS BEAU MOMENT ?",
      },
      {
        id: "e-10",
        name: "Histoire & Câlin du Soir",
        role: "Sécurité Affective & Tendresse",
        color: "#E9D5FF",
        cardBg: "#FAF5FF",
        timeSlot: "20:30 — 21:00",
        startMinute: 1230,
        endMinute: 1260,
        location: "Lit Douillet & Cocon",
        message: "UNE BELLE HISTOIRE APAISANTE AVANT DE FERMER LES YEUX",
        phone: "PAPA & MAMAN",
        equipment: "Livre illustré de contes, veilleuse tamisée, doudou",
        notes: "Voix douce et 3 respirations profondes guidées.",
        agentGreeting: "LE CONTE VA COMMENCER... INSTALLE-TOI CONFORTABLEMENT.",
      },
      {
        id: "e-11",
        name: "Nuit Étoilée & Sommeil",
        role: "Régénération & Grands Rêves",
        color: "#0B101E",
        cardBg: "#0B101E",
        timeSlot: "21:00 — 07:00",
        startMinute: 1260,
        endMinute: 420,
        location: "Cocon de Sommeil",
        message: "JE DORS PAISIBLEMENT, PROTÉGÉ ET EN SÉCURITÉ TOUTE LA NUIT",
        phone: "PAPA & MAMAN",
        equipment: "Veilleuse douce lune, obscurité protectrice, couette chaude",
        notes: "Les yeux du totem s'apaisent pour veiller sur le sommeil.",
        agentGreeting: "BONNE NUIT DOUCE. LES ÉTOILES VEILLENT SUR TON SOMMEIL.",
      },
    ],
  },
  mercredi: {
    title: "MERCREDI NATURE, CRÉATION & AUTONOMIE",
    subtitle: "Mercredi Libre",
    milestones: [
      {
        id: "m-1",
        name: "Réveil Paisible & Dessin Libre",
        role: "Créativité & Joie du Matin",
        color: "#FDE047",
        cardBg: "#FEFCE8",
        timeSlot: "08:00 — 09:30",
        startMinute: 480,
        endMinute: 570,
        location: "Chambre & Tapis Doux",
        message: "JE CRÉE MON PROPRE DESSIN AU RÉVEIL EN PYJAMA",
        phone: "PAPA & MAMAN",
        equipment: "Feuilles épaisses, pastels à la cire d'abeille",
        notes: "Pas d'horaire strict, laisser l'éveil naturel opérer.",
        agentGreeting: "BONJOUR ! C'EST MERCREDI, JOURNÉE D'INVENTION ET DE JEU !",
      },
      {
        id: "m-2",
        name: "Exploration Parc & Grand Air",
        role: "Découverte Sensorielle & Nature",
        color: "#84CC16",
        cardBg: "#F0FDF4",
        timeSlot: "09:30 — 12:00",
        startMinute: 570,
        endMinute: 720,
        location: "Forêt & Parc Naturel",
        message: "OBSERVATION DES OISEAUX, FEUILLES ET CABANES D'ARBRES",
        phone: "PAPA & MAMAN",
        equipment: "Loupe d'observation, panier en osier, bottes de pluie",
        notes: "Ramasser des éléments naturels pour l'atelier de l'après-midi.",
        agentGreeting: "EN AVANT POUR L'AVENTURE DANS LA NATURE ET LE GRAND AIR !",
      },
      {
        id: "m-3",
        name: "Cuisine Autonome & Repas",
        role: "Motricité Fine & Autonomie Montessori",
        color: "#FB923C",
        cardBg: "#FFF7ED",
        timeSlot: "12:00 — 13:30",
        startMinute: 720,
        endMinute: 810,
        location: "Cuisine Basse",
        message: "JE COUPE LES LÉGUMES ET JE DRESSE LA TABLE TOUT SEUL",
        phone: "PAPA & MAMAN",
        equipment: "Couteau d'apprentissage sécurisé en bois, tablier d'enfant",
        notes: "L'enfant participe à toutes les étapes du repas.",
        agentGreeting: "C'EST TOI LE CHEF ! TES MAINS SAVENT TOUT PRÉPARER.",
      },
      {
        id: "m-4",
        name: "Temps Calme & Conte Immersif",
        role: "Repos des Yeux & Écoute",
        color: "#007EA7",
        cardBg: "#F0F9FF",
        timeSlot: "13:30 — 15:30",
        startMinute: 810,
        endMinute: 930,
        location: "Coussin de Lecture",
        message: "JE PLONGE DANS MON LIVRE PRÉFÉRÉ OU J'ÉCOUTE UN CONTE",
        phone: "PAPA & MAMAN",
        equipment: "Boîte à histoires audio sans écran, gros pouf moelleux",
        notes: "Musique relaxante d'ondes pures.",
        agentGreeting: "MOMENT CALME ET DOUX POUR REPOSER TON CORPS ET TES YEUX.",
      },
      {
        id: "m-5",
        name: "Argile, Bricolage & Bois",
        role: "Expérimentation Manuelle",
        color: "#9A3412",
        cardBg: "#FFF7ED",
        timeSlot: "15:30 — 17:30",
        startMinute: 930,
        endMinute: 1050,
        location: "Atelier Garage / Terrasse",
        message: "JE SCULPTE, JE PONCE ET J'ASSEMBLE AVEC MES MAINS",
        phone: "PAPA & MAMAN",
        equipment: "Argile autodurcissante, écorces, ficelle de chanvre",
        notes: "Créer un objet que l'enfant peut garder ou offrir.",
        agentGreeting: "SCULPTE ET INVENTE LIBREMENT AVEC TES MAINS FABULEUSES !",
      },
      {
        id: "m-6",
        name: "Danse, Rires & Musique",
        role: "Libération Motrice & Joie",
        color: "#FF007F",
        cardBg: "#FDF2F8",
        timeSlot: "17:30 — 19:30",
        startMinute: 1050,
        endMinute: 1170,
        location: "Salon / Espace Ouvert",
        message: "DANSE ET JEUX RYTHMIQUES SANS AUCUN ÉCRAN",
        phone: "PAPA & MAMAN",
        equipment: "Maracas en bois, tambourin, musique acoustique entraînante",
        notes: "Sauter, bouger et extérioriser toute l'énergie accumulée.",
        agentGreeting: "METS DE LA MUSIQUE DANS TON CORPS ET DANSE DE BONNE HUMEUR !",
      },
      {
        id: "m-7",
        name: "Dîner Doux & Rangement Heureux",
        role: "Responsabilité & Harmonie",
        color: "#16A34A",
        cardBg: "#F0FDF4",
        timeSlot: "19:30 — 20:30",
        startMinute: 1170,
        endMinute: 1230,
        location: "Maison & Chambre",
        message: "JE REMETS MES OUTILS ET JOUETS DANS LEURS BACS",
        phone: "PAPA & MAMAN",
        equipment: "Bacs de rangement étiquetés par couleur",
        notes: "Le plaisir de retrouver son espace net pour demain.",
        agentGreeting: "CHAQUE JOUET RETROUVE SA MAISON DANS LE CALME.",
      },
      {
        id: "m-8",
        name: "Nuit des Constellations",
        role: "Paix Absolue & Rêves Infinis",
        color: "#1E1B4B",
        cardBg: "#0E0E16",
        timeSlot: "20:30 — 08:00",
        startMinute: 1230,
        endMinute: 480,
        location: "Lit Cocon",
        message: "JE PARS POUR UN MERVEILLEUX VOYAGE DANS LES ÉTOILES",
        phone: "PAPA & MAMAN",
        equipment: "Veilleuse constellation, couette moelleuse",
        notes: "Sommeil profond et régénérant.",
        agentGreeting: "BONNE NUIT DOUCE. TOUT LE MONDE REPOSE EN PAIX.",
      },
    ],
  },
  weekend: {
    title: "WEEK-END, CABANE & VACANCES EN LIBERTÉ",
    subtitle: "Week-end & Plein Air",
    milestones: [
      {
        id: "w-1",
        name: "Matin Douceur en Pyjama",
        role: "Temps Suspendu & Câlin",
        color: "#FFEDD5",
        cardBg: "#FFF7ED",
        timeSlot: "08:30 — 10:00",
        startMinute: 510,
        endMinute: 600,
        location: "Salon Douillet",
        message: "TARTINES CHAUDES AU SOLEIL SANS AUCUN HORAIRE STRICT",
        phone: "FAMILLE",
        equipment: "Pancakes maison, confiture de fraises, chocolat chaud",
        notes: "Discuter des envies d'exploration du week-end.",
        agentGreeting: "C'EST LE WEEK-END ! PRENDS TOUT TON TEMPS EN DOUCEUR.",
      },
      {
        id: "w-2",
        name: "Cabane Secrète dans les Bois",
        role: "Imagination & Coopération",
        color: "#65A30D",
        cardBg: "#F0FDF4",
        timeSlot: "10:00 — 13:00",
        startMinute: 600,
        endMinute: 780,
        location: "Sous-Bois & Clairière",
        message: "CONSTRUCTION D'UN REFUGE EN BRANCHES ET FEUILLES",
        phone: "FAMILLE",
        equipment: "Ficelle, bâtons de bois, mousquetons",
        notes: "Travail d'équipe et motricité globale.",
        agentGreeting: "NOTRE CABANE SECRÈTE PREND FORME ! QUEL BEAU TRAVAIL.",
      },
      {
        id: "w-3",
        name: "Pique-Nique sur l'Herbe",
        role: "Convivialité & Repas Partagé",
        color: "#CA8A04",
        cardBg: "#FEFCE8",
        timeSlot: "13:00 — 15:00",
        startMinute: 780,
        endMinute: 900,
        location: "Grande Pelouse Ensoleillée",
        message: "REPAS SUR LA NAPPE, JEU DU CIEL ET RIGOLADES",
        phone: "FAMILLE",
        equipment: "Grande nappe à carreaux, fruits frais, jeux de cartes",
        notes: "Observer les formes des nuages dans le ciel.",
        agentGreeting: "REGARDE LES NUAGES ET PROFITE DU SOLEIL SUR L'HERBE !",
      },
      {
        id: "w-4",
        name: "Jeux de Société & Expériences",
        role: "Stratégie, Logique & Rire",
        color: "#0EA5E9",
        cardBg: "#F0F9FF",
        timeSlot: "15:00 — 18:00",
        startMinute: 900,
        endMinute: 1080,
        location: "Table du Salon",
        message: "EXPÉRIENCES SCIENTIFIQUES ET DÉFIS COOPÉRATIFS",
        phone: "FAMILLE",
        equipment: "Jeu coopératif en bois, kit d'expériences eau & lumière",
        notes: "Tout le monde joue ensemble pour atteindre l'objectif.",
        agentGreeting: "BRAVO POUR CETTE BELLE STRATÉGIE D'ÉQUIPE !",
      },
      {
        id: "w-5",
        name: "Dessin de la Plus Belle Émotion",
        role: "Expression de Soi & Poésie",
        color: "#D8B4FE",
        cardBg: "#FAF5FF",
        timeSlot: "18:00 — 19:30",
        startMinute: 1080,
        endMinute: 1170,
        location: "Coin Créatif",
        message: "JE REPRÉSENTE MON MEILLEUR SOUVENIR EN COULEURS",
        phone: "FAMILLE",
        equipment: "Grandes feuilles, aquarelle naturelle et pinceaux ronds",
        notes: "L'enfant raconte l'histoire cachée dans son dessin.",
        agentGreeting: "TES COULEURS RACONTENT UNE HISTOIRE MAGNIFIQUE.",
      },
      {
        id: "w-6",
        name: "Veillée aux Bougies & Étoiles",
        role: "Douceur Partagée & Récits",
        color: "#EAB308",
        cardBg: "#FFF7ED",
        timeSlot: "19:30 — 21:00",
        startMinute: 1170,
        endMinute: 1260,
        location: "Terrasse ou Salon Tamisé",
        message: "ÉCOUTE DU CONTE DE LA LUNE ET FEU DE CHEMINÉE",
        phone: "FAMILLE",
        equipment: "Bougies LED sécurisées, tisane aux fleurs douce",
        notes: "Chuchoter et respirer la paix du soir.",
        agentGreeting: "LA VEILLÉE EST DOUCE ET APAISANTE. FERME DOUCEMENT LES YEUX.",
      },
      {
        id: "w-7",
        name: "Grand Sommeil Régénérant",
        role: "Sommeil Profond & Paix",
        color: "#0F172A",
        cardBg: "#0B101E",
        timeSlot: "21:00 — 08:30",
        startMinute: 1260,
        endMinute: 510,
        location: "Chambre Cocon",
        message: "JE DORS D'UN SOMMEIL PROFOND ET SEREIN JUSQU'AU MATIN",
        phone: "FAMILLE",
        equipment: "Lit douillet, veilleuse bleue douce",
        notes: "Récupération physique et mentale totale.",
        agentGreeting: "DORS BIEN MON PETIT. LE MONDE ENTIER REPOSE EN PAIX.",
      },
    ],
  },
  meteo_emotions: {
    title: "MÉTÉO DU CŒUR & AUTO-RÉGULATION DES ÉMOTIONS",
    subtitle: "Météo du Cœur",
    milestones: [
      {
        id: "emo-1",
        name: "Joie du Matin & Sourire",
        role: "Énergie Positive & Rayonnement",
        color: "#FACC15",
        cardBg: "#FEFCE8",
        timeSlot: "08:00 — 10:00",
        startMinute: 480,
        endMinute: 600,
        location: "Espace Lumière",
        message: "JE ME SENS HEUREUX, LÉGER ET PLEIN D'ENTHOUSIASME",
        phone: "CŒUR D'ENFANT",
        equipment: "Sourire, carnet des fiertés, musique joyeuse",
        notes: "Quand le soleil brille à l'intérieur de la poitrine.",
        agentGreeting: "TON CŒUR EST ILLUMINÉ DE SOLEIL ! PARTAGE CETTE JOIE.",
      },
      {
        id: "emo-2",
        name: "Grosse Colère / Tempête Émotionnelle",
        role: "Accueillir la Frustration & Décharger",
        color: "#EF4444",
        cardBg: "#FEF2F2",
        timeSlot: "10:00 — 12:00",
        startMinute: 600,
        endMinute: 720,
        location: "Coin Coussin Décharge",
        message: "J'ACCUEILLE MON ORAGE ET JE SOUFFLE COMME LE VENT",
        phone: "CŒUR D'ENFANT",
        equipment: "Coussin de colère, mouchoirs, balle anti-stress",
        notes: "La colère n'est pas interdite : on apprend à la canaliser.",
        agentGreeting: "J'ACCUEILLE TA COLÈRE. RESPIRE AVEC MOI, JE NE TE JUGE PAS.",
      },
      {
        id: "emo-3",
        name: "Câlin Réconfortant & Sas Doux",
        role: "Réconfort & Dépôt du Chagrin",
        color: "#FDF2F8",
        cardBg: "#FDF2F8",
        timeSlot: "12:00 — 14:00",
        startMinute: 720,
        endMinute: 840,
        location: "Bras Réconfortants & Canapé",
        message: "UN GROS CÂLIN POUR APPORTER LA DOUCEUR À MON CŒUR",
        phone: "CŒUR D'ENFANT",
        equipment: "Couverture lestée, doudou fétiche, câlin chaleureux",
        notes: "Laisser les larmes couler pour libérer les tensions.",
        agentGreeting: "TOUT VA BIEN SE PASSER. TU ES PROTÉGÉ ET AIMÉ.",
      },
      {
        id: "emo-4",
        name: "Bulle Secrète & Respiration Zen",
        role: "Retour au Calme & Ancrage",
        color: "#14B8A6",
        cardBg: "#F0FDFA",
        timeSlot: "14:00 — 16:00",
        startMinute: 840,
        endMinute: 960,
        location: "Tipi / Cabane Sensorielle",
        message: "3 GRANDES INSPIRATIONS PROFONDES PAR LE NEZ",
        phone: "CŒUR D'ENFANT",
        equipment: "Plume magique pour souffler, bol tibétain doux",
        notes: "Inspirer 3s, bloquer 3s, souffler 4s.",
        agentGreeting: "SENS TON CORPS S'APAISER COMME UNE EAU LIMPIDE.",
      },
      {
        id: "emo-5",
        name: "Ciel Bleu & Légèreté Retrouvée",
        role: "Clarté Mentale & Confiance",
        color: "#7DD3FC",
        cardBg: "#F0F9FF",
        timeSlot: "16:00 — 18:00",
        startMinute: 960,
        endMinute: 1080,
        location: "Terrasse & Fenêtre Ouverte",
        message: "LE CIEL EST REVENU CLAIR ET SOURIANT DANS MON CŒUR",
        phone: "CŒUR D'ENFANT",
        equipment: "Bulles de savon à souffler dans l'air",
        notes: "La fierté d'avoir traversé l'émotion difficile.",
        agentGreeting: "LE SOLEIL BRILLE À NOUVEAU DANS TOUT TON CORPS !",
      },
      {
        id: "emo-6",
        name: "Gratitude & Récit du Soir",
        role: "Reconnaissance & Paix",
        color: "#C084FC",
        cardBg: "#FAF5FF",
        timeSlot: "18:00 — 20:00",
        startMinute: 1080,
        endMinute: 1200,
        location: "Coin Méditation Douce",
        message: "JE DIS MERCI POUR TOUT CE QUE J'AI APPRIS AUJOURD'HUI",
        phone: "CŒUR D'ENFANT",
        equipment: "Galet de gratitude à tenir dans la paume",
        notes: "Nommer une chose dont on est fier aujourd'hui.",
        agentGreeting: "TU AS ÉTÉ TRÈS COURAGEUX ET MAGNIFIQUE AUJOURD'HUI.",
      },
      {
        id: "emo-7",
        name: "Sécurité & Doux Sommeil",
        role: "Cocon d'Amour Inconditionnel",
        color: "#00171F",
        cardBg: "#0B101E",
        timeSlot: "20:00 — 08:00",
        startMinute: 1200,
        endMinute: 480,
        location: "Cocon Protecteur",
        message: "JE SUIS EN SÉCURITÉ DANS MON LIT, PROTÉGÉ ET CHÉRI",
        phone: "CŒUR D'ENFANT",
        equipment: "Veilleuse douce et berceuse harmonique",
        notes: "Sommeil réparateur sans aucune angoisse.",
        agentGreeting: "FERME LES YEUX EN TOUTE SÉCURITÉ. DORS PROFONDÉMENT.",
      },
    ],
  },
};

export function App() {
  const [activePresetKey, setActivePresetKey] = useState(() => {
    return localStorage.getItem("colorcard_child_preset_key_v10") || "ecole";
  });

  const [eventTitle, setEventTitle] = useState(() => {
    return localStorage.getItem("colorcard_child_title_v10") || PRESETS_DATA.ecole.title;
  });

  const [milestones, setMilestones] = useState<ChildRitualMilestone[]>(() => {
    try {
      const saved = localStorage.getItem("colorcard_child_milestones_v10");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRESETS_DATA.ecole.milestones;
  });

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(() => {
    return milestones[0]?.id || "e-1";
  });

  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => getAudioMuted());
  const [isCopiedItinerary, setIsCopiedItinerary] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("colorcard_child_milestones_v10", JSON.stringify(milestones));
      localStorage.setItem("colorcard_child_title_v10", eventTitle);
      localStorage.setItem("colorcard_child_preset_key_v10", activePresetKey);
    } catch {
      // silent
    }
  }, [milestones, eventTitle, activePresetKey]);

  // Current active ritual milestone
  const currentMilestone = useMemo(() => {
    return milestones.find((m) => m.id === activeMilestoneId) || milestones[0];
  }, [milestones, activeMilestoneId]);

  const currentIndex = useMemo(() => {
    return milestones.findIndex((m) => m.id === activeMilestoneId);
  }, [milestones, activeMilestoneId]);

  // Load a child preset
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

  // Update ritual helper
  const handleUpdateMilestone = (patch: Partial<ChildRitualMilestone>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === activeMilestoneId ? { ...m, ...patch } : m))
    );
    if (patch.color) {
      playCardTone(patch.color, "change");
    }
  };

  // Switch to previous or next ritual
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

  // Rhythm simulation playback: moves through milestones every 2.8 seconds
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
      }, 2800);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline, milestones]);

  // Add custom ritual moment
  const handleAddMoment = () => {
    const newId = `r-${Date.now()}`;
    const newMilestone: ChildRitualMilestone = {
      id: newId,
      name: "Nouveau Rituel",
      role: "Autonomie & Confiance",
      color: "#FACC15",
      cardBg: "#FEFCE8",
      timeSlot: "17:00 — 17:30",
      startMinute: 1020,
      endMinute: 1050,
      location: "Espace Chambre",
      message: "MON NOUVEAU RITUEL HEUREUX DU JOUR",
      phone: "PAPA & MAMAN",
      equipment: "Mon matériel d'activité",
      notes: "Rituel personnalisé par l'enfant.",
      agentGreeting: "BONJOUR ! C'EST L'HEURE DE TON NOUVEAU RITUEL.",
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setActiveMilestoneId(newId);
    playCardTone(newMilestone.color, "step");
  };

  // Duplicate current ritual
  const handleDuplicateCurrent = () => {
    const dupId = `r-${Date.now()}`;
    const dup: ChildRitualMilestone = {
      ...currentMilestone,
      id: dupId,
      name: `${currentMilestone.name} (COPIE)`,
    };
    setMilestones((prev) => [...prev, dup]);
    setActiveMilestoneId(dupId);
    playCardTone(currentMilestone.color, "change");
  };

  // Delete current ritual
  const handleDeleteCurrent = () => {
    if (milestones.length <= 1) return;
    const remaining = milestones.filter((m) => m.id !== activeMilestoneId);
    setMilestones(remaining);
    setActiveMilestoneId(remaining[0].id);
    playCardTone("#DC2626", "change");
  };

  // Export clean 24h Montessori rhythm text to clipboard
  const handleCopyFullItinerary = () => {
    const text = [
      `TOTEM MONTESSORI · RITUEL DE LA JOURNÉE : ${eventTitle.toUpperCase()}`,
      `───────────────────────────────────────────────────────`,
      ...milestones.map((m, i) => `${i + 1}. [${m.timeSlot}] ${m.name} (${m.role})\n   Action : "${m.message}"\n   Lieu : ${m.location}`),
      `───────────────────────────────────────────────────────`,
      `ColorCard · Totem Temporel & Émotionnel pour Enfants`,
    ].join("\n");

    navigator.clipboard?.writeText(text);
    setIsCopiedItinerary(true);
    setTimeout(() => setIsCopiedItinerary(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#EDEDED] font-sans antialiased flex flex-col justify-between selection:bg-white selection:text-black">
      {/* ========================================================================= */}
      {/* 1. TOP BAR (MINIMALIST MONTESSORI HEADER)                                  */}
      {/* ========================================================================= */}
      <header className="bg-[#0A0A0E] border-b border-[#161620] px-4 lg:px-6 py-3 flex items-center justify-between select-none">
        {/* Brand & Ritual Preset Switcher */}
        <div className="flex items-center gap-3">
          <div className="size-7 rounded bg-white text-black flex items-center justify-center shadow-md" title="ColorCard Enfant">
            <StudioLogoIcon size={16} />
          </div>

          {/* Preset Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141E] hover:bg-[#1E1E2C] border border-[#222232] text-[10px] font-black uppercase tracking-wider text-white transition-colors"
            >
              <span>{PRESETS_DATA[activePresetKey]?.subtitle || "Rituels"}</span>
              <span className="text-[9px] opacity-50">▾</span>
            </button>

            {/* Presets Popover */}
            {showPresetMenu && (
              <div className="absolute left-0 top-8 w-64 bg-[#0E0E16] border border-white/20 rounded-xl shadow-2xl py-1.5 z-50 text-left space-y-0.5">
                {[
                  { key: "ecole", label: "Jour d'École & Rituels", desc: "11 étapes · Réveil, ateliers & nuit" },
                  { key: "mercredi", label: "Mercredi Nature & Création", desc: "8 étapes · Grand air, bois & rire" },
                  { key: "weekend", label: "Week-end & Plein Air", desc: "7 étapes · Cabane, pique-nique & repos" },
                  { key: "meteo_emotions", label: "Météo du Cœur & Émotions", desc: "7 étapes · Colère, apaisement & joie" },
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

        {/* Center: Editable Ritual Day Title */}
        <div className="hidden sm:flex items-center gap-2 bg-[#101017] border border-[#1C1C26] rounded-lg px-3.5 py-1 shadow-sm">
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value.toUpperCase())}
            placeholder="TITRE DU RYTHME DE LA JOURNÉE..."
            className="text-[10.5px] font-black uppercase tracking-wider text-white bg-transparent border-b border-dashed border-transparent hover:border-white/30 focus:border-white outline-none text-center max-w-[320px]"
          />
          <span className="text-[9px] text-[#707085] font-bold">({milestones.length})</span>
        </div>

        {/* Right Controls: Copy Ritual + Audio Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyFullItinerary}
            className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all border ${
              isCopiedItinerary
                ? "bg-white text-black border-white shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white border-white/20 active:scale-95"
            }`}
            title="Copier le rythme complet pour impression ou affichage"
          >
            {isCopiedItinerary ? "Rituel copié !" : "Copier Rituels"}
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
            title={isMuted ? "Activer les sons harmoniques" : "Couper le son"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTER LIVING CARD (THE MONTESSORI TEMPORAL & EMOTIONAL TOTEM)         */}
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
                title="Dupliquer ce rituel"
              >
                Dupliquer
              </button>

              <button
                type="button"
                onClick={handleAddMoment}
                className="hover:text-white transition-colors"
                title="Ajouter un rituel"
              >
                + Rituel
              </button>

              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="hover:text-red-400 transition-colors"
                  title="Supprimer ce rituel"
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
        Naviguez entre les rituels avec les pastilles dans le socle ou [←] [→] et [Espace]
      </footer>
    </div>
  );
}

export default App;
