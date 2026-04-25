/**
 * Syncs splash + nav bitmaps into `src/assets/` before Vite runs.
 *
 * TITLE: newest `TITLE-*.png` or `logo-*.png` in Cursor project `assets/`
 * (or INKTRIX_SPLASH).
 * SUBMARK: written to `src/imports/submark.png` (same pattern as EP.png).
 *   Newest `submark-*.png` in Cursor assets, or INKTRIX_SUBMARK, else inktrix-splash.
 *
 * Skip all: SKIP_SPLASH_SYNC=1 · Force refresh: FORCE_SPLASH_COPY=1
 */
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  statSync,
  readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cursorAssets = join(
  homedir(),
  ".cursor",
  "projects",
  "Users-katelynwoody-Desktop-Tattoo-Inspiration-App",
  "assets"
);

const outTitle = join(root, "src", "assets", "TITLE.png");
const outSubmark = join(root, "src", "imports", "submark.png");
const outSplash = join(root, "src", "imports", "inktrix-splash.png");
const outPublic = join(root, "public", "TITLE.png");
const inProjSplash = join(root, "src", "imports", "inktrix-splash.png");

const TITLE_IN_CURSOR = /^TITLE-.+\.png$/i;
const LOGO_IN_CURSOR = /^logo-.+\.png$/i;
const SUBMARK_IN_CURSOR = /^submark-.+\.png$/i;

function ensureDirs() {
  mkdirSync(join(root, "public"), { recursive: true });
  mkdirSync(join(root, "src", "imports"), { recursive: true });
  mkdirSync(join(root, "src", "assets"), { recursive: true });
}

function titleLooksPresent() {
  try {
    return existsSync(outTitle) && statSync(outTitle).size > 200;
  } catch {
    return false;
  }
}

function newestTitlePngInCursorAssets() {
  if (!existsSync(cursorAssets)) return null;
  let best = null;
  let bestMtime = -1;
  try {
    for (const name of readdirSync(cursorAssets)) {
      if (!TITLE_IN_CURSOR.test(name) && !LOGO_IN_CURSOR.test(name)) continue;
      const full = join(cursorAssets, name);
      try {
        const m = statSync(full).mtimeMs;
        if (m > bestMtime) {
          bestMtime = m;
          best = full;
        }
      } catch {
        /* skip */
      }
    }
  } catch {
    return null;
  }
  return best;
}

function shouldSkipTitleCopy(newestCursorTitle) {
  if (process.env.FORCE_SPLASH_COPY === "1") return false;
  if (!titleLooksPresent()) return false;
  if (!newestCursorTitle) return true;
  try {
    return statSync(newestCursorTitle).mtimeMs <= statSync(outTitle).mtimeMs;
  } catch {
    return false;
  }
}

function syncTitle() {
  const newestCursorTitle = newestTitlePngInCursorAssets();
  if (shouldSkipTitleCopy(newestCursorTitle)) {
    return;
  }

  const fromEnv = process.env.INKTRIX_SPLASH;

  const legacySources = [
    join(cursorAssets, "logo-07efd004-4317-4797-a0f2-aa7e2d8f6e4f.png"),
    join(
      cursorAssets,
      "Screenshot_2026-04-24_at_9.47.02_PM-6ea986a2-d98c-4693-811f-ccf97f2de414.png"
    ),
    join(cursorAssets, "ttrix-017cd06b-bd00-4356-9d7b-43db472e3cba.png"),
    join(
      cursorAssets,
      "Screenshot_2026-04-24_at_9.23.35_PM-231e9e89-72ca-4a22-b51a-152416ab53a4.png"
    ),
  ];

  let chosen = null;
  if (fromEnv && existsSync(fromEnv)) {
    chosen = fromEnv;
  } else if (newestCursorTitle) {
    chosen = newestCursorTitle;
  } else {
    for (const src of legacySources) {
      if (existsSync(src)) {
        chosen = src;
        break;
      }
    }
  }

  if (!chosen && existsSync(inProjSplash)) {
    chosen = inProjSplash;
  }

  if (!chosen) {
    console.warn(
      "[ensure-splash] No TITLE source. Add `src/assets/TITLE.png` or set INKTRIX_SPLASH."
    );
    return;
  }

  try {
    copyFileSync(chosen, outTitle);
    copyFileSync(chosen, outPublic);
    if (chosen !== inProjSplash) {
      copyFileSync(chosen, outSplash);
    }
    const s = statSync(outTitle).size;
    if (s > 100) {
      console.log(
        `[ensure-splash] TITLE <- ${chosen} (${s} bytes)`
      );
    }
  } catch (e) {
    console.warn("[ensure-splash] TITLE copy failed:", e);
  }
}

function submarkLooksPresent() {
  try {
    return existsSync(outSubmark) && statSync(outSubmark).size > 80;
  } catch {
    return false;
  }
}

function newestSubmarkPngInCursorAssets() {
  if (!existsSync(cursorAssets)) return null;
  let best = null;
  let bestMtime = -1;
  try {
    for (const name of readdirSync(cursorAssets)) {
      if (!SUBMARK_IN_CURSOR.test(name)) continue;
      const full = join(cursorAssets, name);
      try {
        const m = statSync(full).mtimeMs;
        if (m > bestMtime) {
          bestMtime = m;
          best = full;
        }
      } catch {
        /* skip */
      }
    }
  } catch {
    return null;
  }
  return best;
}

function shouldSkipSubmarkCopy(newest) {
  if (process.env.FORCE_SPLASH_COPY === "1") return false;
  if (!submarkLooksPresent()) return false;
  if (!newest) return true;
  try {
    return statSync(newest).mtimeMs <= statSync(outSubmark).mtimeMs;
  } catch {
    return false;
  }
}

function syncSubmark() {
  const newest = newestSubmarkPngInCursorAssets();
  if (shouldSkipSubmarkCopy(newest)) {
    return;
  }

  const fromEnv = process.env.INKTRIX_SUBMARK;
  const pinned = join(
    cursorAssets,
    "submark-8546ff9c-5cde-47cc-9d1b-be5abfcb29bc.png"
  );

  let chosen = null;
  if (fromEnv && existsSync(fromEnv)) {
    chosen = fromEnv;
  } else if (newest) {
    chosen = newest;
  } else if (existsSync(pinned)) {
    chosen = pinned;
  }

  if (!chosen) {
    if (submarkLooksPresent()) {
      return;
    }
    if (existsSync(inProjSplash)) {
      chosen = inProjSplash;
      console.warn(
        "[ensure-splash] submark: using fallback inktrix-splash.png — add `submark-*.png` to Cursor assets or commit `src/imports/submark.png`."
      );
    } else {
      console.warn(
        "[ensure-splash] No submark source. Add `src/imports/submark.png` or a `submark-*.png` in Cursor assets."
      );
      return;
    }
  }

  try {
    copyFileSync(chosen, outSubmark);
    const s = statSync(outSubmark).size;
    if (s > 50) {
      console.log(`[ensure-splash] submark <- ${chosen} (${s} bytes)`);
    }
  } catch (e) {
    console.warn("[ensure-splash] submark copy failed:", e);
  }
}

function main() {
  if (process.env.SKIP_SPLASH_SYNC === "1") {
    return;
  }

  ensureDirs();
  syncSubmark();
  syncTitle();
}

main();
