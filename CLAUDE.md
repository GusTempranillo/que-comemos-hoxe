# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Que comemos hoxe** ("What are we eating today") is a Galician-language PWA for planning a family's daily lunch, managing a living recipe book, and tracking a fridge/pantry inventory. It is currently a **frontend-only prototype**: all data (recipes, ingredients, family members) is hardcoded in `js/datos/`, and state lives in `localStorage`. The long-term architecture (see `DOCS/ARCHITECTURE.md`) moves all business logic to n8n + Supabase + Cloudflare R2, but none of that backend exists yet — don't assume it does.

Read `DOCS/` before making non-trivial changes, in this order: `VISION.md` → `ARCHITECTURE.md` → `AI_GUIDELINES.md` → `COOKBOOK_MODEL.md` / `DATABASE_MODEL.md` / `FUNCTIONAL_SPECIFICATION.md` → `ROADMAP.md`.

## Running the app

There is no build step, no package manager, and no test suite — the app is plain HTML/CSS/JS served (or opened) as-is.

```bash
# Any static server works, e.g.:
npx serve .
# or just open index.html directly in a browser (file:// also works,
# except the service worker won't register from file://)
```

To verify a change, open the app in a browser and click through it — there is nothing to compile or lint.

## Non-negotiable constraints (from DOCS/AI_GUIDELINES.md and DOCS/ARCHITECTURE.md)

- **No frameworks** (React, Vue, Angular...) and **no build/compile step** (Vite, Webpack, bundlers, transpilers, npm scripts). Tailwind is loaded pre-compiled from `vendor/tailwind-browser.js` and configured inline in `index.html` specifically so nothing needs a build.
- Scripts are loaded as classic `<script>` tags (not ES modules) in a fixed order in `index.html`, on purpose, so the app also works opened directly via `file://`. If you add a new `js/` file, add a matching `<script>` tag in `index.html` **and** an entry in the `ARMAZON` cache list in `sw.js`.
- The frontend must stay usable offline (service worker) and must never talk to a database directly — per the target architecture all business logic is meant to live in n8n, with Supabase as the single source of truth. Since that backend doesn't exist yet, current "sync" is just `localStorage`.
- Never delete recipe/history data outright — the product philosophy (`VISION.md`, `COOKBOOK_MODEL.md`) treats recipes as living family heritage: changes should read as versions/evolution, not destruction, even in prototype code.
- All user-facing text, code comments, and identifiers (variable/function names) are in **Galician**. Keep new code consistent with this — don't switch to Spanish or English mid-file.

## Architecture

Everything hangs off a single global namespace, `window.QCH`, populated by each script in load order:

```
js/datos/ingredientes.js   → QCH.INGREDIENTES, QCH.ingrediente(id)
js/datos/receitas.js       → QCH.RECEITAS, QCH.receita(id)   (the central entity — everything else references recipes)
js/datos/familia.js        → QCH.PERSOAS, QCH.persoa(id), QCH.adaptacionsDe(receitaId)
js/utilidades.js           → DOM helpers, icons (inline SVG), generative dish art, formatting
js/estado.js               → QCH.estado (the single state store, see below) + derived queries
js/xerador.js              → QCH.xerador (weekly menu generator/scorer)
js/vistas/comuns.js        → shared UI fragments reused across views (cards, pills, chips...)
js/vistas/{hoxe,semana,receitario,neveira,familia,detalle}.js → QCH.vistas.<nome>, one per screen
js/app.js                  → shell: nav, render loop, global click/input delegation, theme, toasts
```

**State**: `QCH.estado` (in `js/estado.js`) is the one and only store — no per-component state. It holds `vista` (current screen), `tema`, `comensais` (who's eating today), `neveira` (fridge contents by ingredient id → quantity), `semana` (calendar: `"dia:comida"` slot → recipe id), `cociñeiros` (who cooks which slot), and `filtros`. Read via `QCH.estado.get()`, write via `QCH.estado.set(patch, motivo)` or `QCH.estado.update(fn, motivo)` — never mutate the object returned by `get()` directly outside of `update()`. Every write persists to `localStorage` and notifies subscribers. `js/app.js` is the sole subscriber; on any change it fully re-renders the active view (`app.innerHTML = vista.render()`), then restores scroll position and focus (matched via `data-foco` attributes) so re-rendering the whole DOM doesn't feel jarring.

**Views** (`js/vistas/*.js`, except `comuns.js`): each is an IIFE assigned to `QCH.vistas.<id>`, exposing at least a `render()` method returning an HTML string. `js/app.js`'s `NAV` array maps nav items to view ids; `pintar()` looks up `QCH.vistas[s.vista]` and renders it. Views build markup with string concatenation (no templating engine, no JSX) and Tailwind utility classes.

**Actions/events**: there's no per-element event binding. `js/app.js` installs one global `click`/`keydown`/`input` listener on `document` that dispatches based on a `data-accion="..."` attribute (see the `accions` object in `app.js`), reading other `data-*` attributes on the same element for parameters (e.g. `data-id`, `data-dia`, `data-comida`). To add a new interactive action: give the element `data-accion="nome"` (+ any `data-*` params it needs), then add a `nome: (el, ev) => {...}` entry to `accions`.

**Modals**: `QCH.modal` (in `js/vistas/detalle.js`) is a single generic modal controller (`abrir(html)` / `pechar()` / `envoltorio(interior, ancho)`); views build the inner HTML and hand it to `QCH.modal.abrir()`.

**Domain model specifics worth knowing**:
- Only one lunch (`xantar`) is planned per day — `QCH.COMIDAS` currently has a single entry; the code was deliberately generalized from an earlier two-meal model, so it still loops over `QCH.COMIDAS` rather than hardcoding "xantar" in most places.
- Recipe quantities in `js/datos/receitas.js` are always for 4 servings (`racions: 4`); `QCH.cantidadeReal()` scales them to the actual number of `comensais`.
- Family "adaptations" (`js/datos/familia.js`) are **per person AND per recipe**, not global — e.g. a person can dislike onion in one dish but eat it in another. Three severity levels: `sen` (drop an ingredient), `substituir` (swap one), `prato` (cooks something entirely different that day). This per-recipe granularity is called out in the code as the product's key differentiator — don't collapse it into a global per-person preference.
- The weekly menu generator (`QCH.xerador` in `js/xerador.js`) is **not AI** — it's an explicit, auditable scoring function per slot (fridge coverage, time-of-day/weekend fit, variety vs. neighboring days, adaptation overhead, plus randomness) that also returns human-readable `motivos` (reasons) for its picks, by design, so the family can understand why a dish was suggested.
- Recipe illustrations (`QCH.arte` in `js/utilidades.js`) are procedurally generated SVGs seeded from the recipe id (deterministic per recipe), used as a placeholder/fallback behind any real photo (`receita.foto`) so the UI never shows a broken image or empty box.

## Repo layout notes

- `DOCS/` holds the product/architecture specs (Galician). Treat them as authoritative for scope decisions — if a proposed change doesn't serve "conservar, mellorar ou transmitir o coñecemento culinario da familia" (per `VISION.md`), reconsider it.
- `vendor/` contains vendored third-party scripts (Tailwind's browser build, GSAP) checked in directly — this is intentional (see comments in `index.html`), not something to "fix" by switching to a CDN or package manager.
