// Banc d'essai de la machine à états des gestes (sans navigateur ni caméra).
// Rejoue des séquences de fermeture d'yeux réalistes à 30 fps et vérifie que
// les bons gestes — et uniquement eux — sont déclenchés.
//
// Lancement : node scripts/test-gesture-engine.mjs

import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// --- Compilation à la volée du moteur TypeScript ----------------------------
const outDir = await mkdtemp(join(tmpdir(), "eye-engine-"));
const outFile = join(outDir, "engine.mjs");
await build({
  entryPoints: [join(root, "src/app/utils/eyeGestureEngine.ts")],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: ["@mediapipe/tasks-vision"],
  logLevel: "silent",
});
const { EyeGestureEngine } = await import(pathToFileURL(outFile).href);

// --- Harnais ----------------------------------------------------------------
const FPS = 30;
const FRAME_MS = 1000 / FPS;

function createHarness(settings = {}) {
  const events = [];
  const engine = new EyeGestureEngine(
    {
      onLeftWink: () => events.push("leftWink"),
      onRightWink: () => events.push("rightWink"),
      onDoubleBlink: () => events.push("doubleBlink"),
      onLongEyesClosed: () => events.push("longClosed"),
    },
    settings
  );

  let t = 1000;

  /** Avance de `ms` en maintenant les niveaux de fermeture indiqués. */
  const hold = (ms, leftClosure, rightClosure) => {
    const frames = Math.max(1, Math.round(ms / FRAME_MS));
    for (let i = 0; i < frames; i++) {
      t += FRAME_MS;
      engine.leftClosure = leftClosure;
      engine.rightClosure = rightClosure;
      engine.applyHysteresis();
      engine.updateGestures(t);
    }
  };

  return { engine, events, hold };
}

// --- Assertions -------------------------------------------------------------
let failures = 0;
let passed = 0;

function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } else {
    failures++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}\n      attendu : ${e}\n      obtenu  : ${a}`);
  }
}

console.log("\n\x1b[1mMoteur de gestes oculaires — scénarios\x1b[0m\n");

// 1. Clignement naturel parfaitement synchrone → aucun clin d'œil.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(130, 0.95, 0.95); // clignement ~130 ms
  hold(900, 0.02, 0.02);
  check("clignement synchrone → aucun clin d'œil", events, []);
}

// 2. Clignement DÉSYNCHRONISÉ (cas réel : un œil ferme 2 frames avant l'autre).
//    C'était LE faux positif principal de la v1.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(66, 0.95, 0.1); // œil gauche part en avance (2 frames)
  hold(130, 0.95, 0.95);
  hold(66, 0.1, 0.95); // œil droit se rouvre en retard
  hold(900, 0.02, 0.02);
  check("clignement désynchronisé → aucun clin d'œil", events, []);
}

// 3. Vrai clin d'œil droit volontaire (400 ms, autre œil bien ouvert).
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(400, 0.03, 0.96);
  hold(900, 0.02, 0.02);
  check("clin d'œil droit maintenu → rightWink ×1", events, ["rightWink"]);
}

// 4. Vrai clin d'œil gauche bref (220 ms) → déclenché au relâchement.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(220, 0.96, 0.03);
  hold(900, 0.02, 0.02);
  check("clin d'œil gauche bref → leftWink ×1", events, ["leftWink"]);
}

// 5. Clin d'œil très long (1,2 s) → une seule action, pas de rafale.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(1200, 0.03, 0.96);
  hold(900, 0.02, 0.02);
  check("clin d'œil maintenu 1,2 s → rightWink ×1 (pas de rafale)", events, ["rightWink"]);
}

// 6. Double clignement volontaire → doubleBlink unique.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(120, 0.95, 0.95);
  hold(180, 0.02, 0.02);
  hold(120, 0.95, 0.95);
  hold(900, 0.02, 0.02);
  check("double clignement → doubleBlink ×1", events, ["doubleBlink"]);
}

// 7. Deux clignements très espacés (1,5 s) → pas de double clignement.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(120, 0.95, 0.95);
  hold(1500, 0.02, 0.02);
  hold(120, 0.95, 0.95);
  hold(900, 0.02, 0.02);
  check("clignements espacés 1,5 s → aucun geste", events, []);
}

// 8. Yeux fermés 2 s → longClosed une seule fois, sans doubleBlink parasite.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(2000, 0.95, 0.95);
  hold(900, 0.02, 0.02);
  check("yeux fermés 2 s → longClosed ×1", events, ["longClosed"]);
}

// 9. Bruit autour du seuil → aucun déclenchement (rôle de l'hystérésis).
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  for (let i = 0; i < 40; i++) {
    hold(FRAME_MS, 0.58 + (i % 2) * 0.09, 0.58 + ((i + 1) % 2) * 0.09);
  }
  hold(600, 0.02, 0.02);
  check("signal bruité autour du seuil → aucun geste", events, []);
}

// 10. Inversion gauche/droite à la demande de l'utilisateur.
{
  const { events, hold } = createHarness({ swapWinkSides: true });
  hold(600, 0.02, 0.02);
  hold(400, 0.03, 0.96); // œil droit fermé
  hold(900, 0.02, 0.02);
  check("swapWinkSides → le clin droit émet leftWink", events, ["leftWink"]);
}

// 11. Clins d'œil désactivés → seuls les clignements restent actifs.
{
  const { events, hold } = createHarness({ winkEnabled: false });
  hold(600, 0.02, 0.02);
  hold(400, 0.03, 0.96);
  hold(900, 0.02, 0.02);
  check("winkEnabled=false → aucun clin d'œil", events, []);
}

// 12. Deux clins d'œil successifs → deux actions distinctes.
{
  const { events, hold } = createHarness();
  hold(600, 0.02, 0.02);
  hold(400, 0.03, 0.96);
  hold(800, 0.02, 0.02);
  hold(400, 0.03, 0.96);
  hold(600, 0.02, 0.02);
  check("deux clins d'œil espacés → rightWink ×2", events, ["rightWink", "rightWink"]);
}

// 13. Sensibilité maximale : un clin d'œil court doit toujours passer…
{
  const { events, hold } = createHarness({ sensitivity: 1 });
  hold(600, 0.02, 0.02);
  hold(160, 0.9, 0.05);
  hold(900, 0.02, 0.02);
  check("sensibilité 100 % → clin d'œil court détecté", events, ["leftWink"]);
}

// 14. …et un clignement normal ne doit toujours pas passer.
{
  const { events, hold } = createHarness({ sensitivity: 1 });
  hold(600, 0.02, 0.02);
  hold(33, 0.9, 0.2);
  hold(130, 0.95, 0.95);
  hold(33, 0.2, 0.9);
  hold(900, 0.02, 0.02);
  const winks = events.filter((e) => e.includes("Wink"));
  check("sensibilité 100 % → clignement ≠ clin d'œil", winks, []);
}

await rm(outDir, { recursive: true, force: true });

console.log(
  `\n${failures === 0 ? "\x1b[32m" : "\x1b[31m"}${passed} réussis, ${failures} échoués\x1b[0m\n`
);
process.exit(failures === 0 ? 0 : 1);
