
  # Interactive Eye-Following Card (Community)

  This is a code bundle for Interactive Eye-Following Card (Community). The original project is available at https://www.figma.com/design/2LsrxyeYGQEdxQGnm8ug8v/Interactive-Eye-Following-Card--Community-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ---

  ## Détection des yeux (moteur v2)

  Le contrôle par le regard est géré par `src/app/utils/eyeGestureEngine.ts`
  (MediaPipe FaceLandmarker, 478 points + blendshapes, 100 % en local — aucune
  image ne quitte l'appareil).

  ### Gestes reconnus

  | Geste | Action |
  | --- | --- |
  | Clin d'œil droit (maintenu ~0,3 s) | Rituel suivant |
  | Clin d'œil gauche (maintenu ~0,3 s) | Rituel précédent |
  | Double clignement | Lecture / pause de la timeline 24 h |
  | Yeux fermés > 1,4 s | Saut au rituel « nuit » |
  | Mouvement de la tête / des yeux | Le totem suit le regard |

  ### Ce que la v2 corrige

  - **Le moteur n'est plus recréé à chaque changement de rituel.** En v1, le
    `useEffect` dépendait de `currentIndex` : le premier clin d'œil réussi
    coupait la webcam.
  - **Mapping anatomique gauche/droite.** La v1 utilisait le groupe de points
    `33/133/159/145` comme « œil gauche » alors que MediaPipe le définit comme
    `FACE_LANDMARKS_RIGHT_EYE` : les clins d'œil déclenchaient l'action inverse.
  - **EAR corrigé du ratio d'image.** La v1 calculait l'Eye Aspect Ratio sur des
    coordonnées normalisées, ce qui multiplie le résultat par `largeur/hauteur`.
    Sur une webcam 16:9, l'œil fermé mesurait 0,178 pour un seuil figé à 0,170 :
    la fermeture n'était donc quasiment jamais détectée.
  - **Seuil adaptatif au lieu d'un seuil figé.** Une ligne de base de l'œil
    ouvert est apprise en continu (et calibrable manuellement), ce qui absorbe
    les différences de morphologie, de distance et de port de lunettes.
  - **Fusion EAR + blendshapes** (`eyeBlinkLeft` / `eyeBlinkRight`), bien plus
    robustes à l'inclinaison de la tête et à la faible lumière.
  - **Hystérésis + lissage temporel** : un signal qui oscille autour du seuil ne
    produit plus de rafale de faux déclenchements.
  - **Clignement ≠ clin d'œil.** Une machine à états par « épisode de
    fermeture » invalide le clin d'œil dès que le second œil se ferme, y compris
    quand les deux paupières sont désynchronisées de quelques images.
  - **Traitement par image vidéo réelle** (`requestVideoFrameCallback`) : plus de
    frame analysée deux fois, timestamps MediaPipe strictement croissants.
  - **Chargement résilient** : WASM servi en local, repli sur CDN épinglés,
    délégué GPU puis CPU, modèle mis en cache (CacheStorage).
  - **Regard lissé** par filtre One Euro, enrichi du micro-regard des iris.

  ### Réglage & diagnostic

  Le bouton ⚙ de la barre du haut ouvre un panneau affichant l'aperçu caméra,
  l'état de fermeture de chaque œil en temps réel, le seuil courant, les fps et
  la qualité de captation (trop sombre, trop loin, pas de visage…). On y règle
  la sensibilité, l'amplitude du regard, l'activation de chaque geste, et on
  peut lancer une calibration de 2,5 s.

  ### Tests

  ```bash
  node scripts/test-gesture-engine.mjs
  ```

  Rejoue 14 séquences de fermeture d'yeux à 30 fps (clignements synchrones et
  désynchronisés, clins d'œil courts/longs, signal bruité, double clignement…)
  et vérifie que seuls les bons gestes sont émis.

  ### Assets MediaPipe

  `npm run dev` et `npm run build` exécutent d'abord
  `scripts/copy-mediapipe-assets.mjs`, qui copie les binaires WASM depuis
  `node_modules` vers `public/mediapipe/wasm` (dossier ignoré par git, ~23 Mo).
  Si la copie échoue, le moteur retombe automatiquement sur les CDN.
