// Copie les binaires WASM de @mediapipe/tasks-vision dans public/mediapipe/wasm
// pour que la détection démarre sans dépendre d'un CDN au runtime.
// Exécuté automatiquement via les scripts npm `predev` / `prebuild`.
// Le dossier public/mediapipe est ignoré par git (≈23 Mo).

import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const dest = join(root, "public", "mediapipe", "wasm");

// Uniquement les variantes réellement chargées par FilesetResolver.
const FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

async function main() {
  if (!(await exists(src))) {
    console.warn("[mediapipe] paquet tasks-vision introuvable — repli CDN au runtime.");
    return;
  }

  await mkdir(dest, { recursive: true });

  let copied = 0;
  for (const file of FILES) {
    const from = join(src, file);
    const to = join(dest, file);
    if (!(await exists(from))) continue;

    // Ne recopie que si la taille diffère (démarrage à chaud instantané).
    if (await exists(to)) {
      const [a, b] = await Promise.all([stat(from), stat(to)]);
      if (a.size === b.size) continue;
    }
    await copyFile(from, to);
    copied++;
  }

  console.log(
    copied > 0
      ? `[mediapipe] ${copied} fichier(s) WASM copié(s) dans public/mediapipe/wasm`
      : "[mediapipe] assets WASM déjà à jour"
  );
}

main().catch((err) => {
  // Jamais bloquant : le moteur retombe sur le CDN.
  console.warn("[mediapipe] copie ignorée :", err?.message ?? err);
});
