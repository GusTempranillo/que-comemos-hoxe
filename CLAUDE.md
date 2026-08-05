# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Que comemos hoxe** ("What are we eating today") is a Galician-language PWA for planning a family's daily lunch, managing a living recipe book, and tracking a fridge/pantry inventory. The frontend now ships a full n8n API client (`js/api.js`, login modal, offline-sync, public share page — see `DOCS/API_CONTRACT.md`), but static arrays in `js/datos/` and `localStorage` remain the startup data and the offline/not-logged-in fallback; they're swapped for remote data only after a successful login. Whether a real n8n/Supabase backend is actually live, reachable, and CORS-configured for this frontend is **not verifiable from this repo** — see `DOCS/BACKEND_N8N_STATUS.md`, which documents exactly that gap. Don't assume the backend is working end-to-end just because the client code exists.

Read `DOCS/` before making non-trivial changes, in this order: `VISION.md` → `ARCHITECTURE.md` → `AI_GUIDELINES.md` → `BACKEND_N8N_STATUS.md` / `API_CONTRACT.md` (when touching login, API or sync) → `COOKBOOK_MODEL.md` / `DATABASE_MODEL.md` / `FUNCTIONAL_SPECIFICATION.md` → `ROADMAP.md`.

## Running the app

Antes de comezar calquera tarefa, le tamén AI_COLABORACION.md e cumpre todas as súas normas.

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
- The frontend must stay usable offline (service worker) and must never talk to a database directly — all business logic is meant to live in n8n, with Supabase as the single source of truth. `js/api.js` implements that client contract (see `DOCS/API_CONTRACT.md`); `js/estado.js` + `localStorage` remain the always-on local layer that the API syncs into/from in the background, never something the UI blocks on.
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
js/api.js                  → QCH.api: n8n HTTP client, login, offline sync queue, catalog cache, share (DOCS/API_CONTRACT.md)
js/xerador.js              → QCH.xerador (weekly menu generator/scorer)
js/vistas/comuns.js        → shared UI fragments reused across views (cards, pills, chips...)
js/vistas/{hoxe,semana,receitario,neveira,familia,detalle}.js → QCH.vistas.<nome>, one per screen
js/vistas/configuracion.js → QCH.abrirConfiguracion: login/logout modal (base URL + house token)
js/publico.js               → QCH.eRutaPublica/QCH.iniciarPublico: unauthenticated /m/<token> share page
js/app.js                  → shell: nav, render loop, global click/input delegation, theme, toasts, sync trigger
```

**State**: `QCH.estado` (in `js/estado.js`) is the one and only store — no per-component state. It holds `vista` (current screen), `tema`, `comensais` (who's eating today), `neveira` (fridge contents by ingredient id → quantity), `semana` (calendar: `"dia:comida"` slot → recipe id), `cociñeiros` (who cooks which slot), and `filtros`. Read via `QCH.estado.get()`, write via `QCH.estado.set(patch, motivo)` or `QCH.estado.update(fn, motivo)` — never mutate the object returned by `get()` directly outside of `update()`. Every write persists to `localStorage` and notifies subscribers. `js/app.js` is the sole subscriber; on any change it fully re-renders the active view (`app.innerHTML = vista.render()`), then restores scroll position and focus (matched via `data-foco` attributes) so re-rendering the whole DOM doesn't feel jarring. Whenever the change reason (`motivo`) is `semana`, `neveira`, or `cociñeiros`, `js/app.js`'s subscriber also fires `QCH.api.sincronizar(motivo, ...)` in the background — the write and re-render already happened locally, the network call never blocks them.

**API client** (`js/api.js`, `QCH.api`): the only place in the codebase that calls `fetch()`. Wraps the n8n endpoints in `DOCS/API_CONTRACT.md` (login, read-only catalogs, `GET`/`PUT` on `semana`/`neveira`/`cociñeiros`, share, public read). Base URL and session token live in `localStorage` (`qch:api:v1`); a downloaded catalog snapshot is cached in `qch:catalogos:v1`; unsent writes queue in `qch:api:pendentes:v1` and retry on reconnect (`window`'s `online` event) or on the next local change to that same resource. Before login (or offline), `QCH.RECEITAS`/`QCH.INGREDIENTES`/`QCH.PERSOAS` stay as the static arrays from `js/datos/`; a successful login + `prepararCasa()` swaps them for the remote catalogs in memory. Whether the configured n8n instance is actually reachable in production is not something this client (or this repo) can confirm — see `DOCS/BACKEND_N8N_STATUS.md`.

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
