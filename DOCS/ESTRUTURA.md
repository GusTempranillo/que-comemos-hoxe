# ESTRUTURA.md
## Mapa técnico de Que comemos hoxe

> Este documento describe a arquitectura técnica **de partida cero** acordada para o proxecto: sen VPS, sen n8n, sen datos de proba que migrar. Complementa `VISION.md` (o porqué) con o cómo. Se algo aquí queda desactualizado respecto ao código real, o código manda — actualizar este documento no mesmo cambio que toque infraestrutura.

---

# 1. Mapa xeral

```
┌────────────────────────┐
│   Cloudflare Pages       │  Frontend estático (HTML/CSS/JS, sen build).
│   qch.pages.dev          │  Autodesprega en cada push a main dende GitHub.
└────────────┬─────────────┘
             │ HTTPS + Authorization: Bearer <token>
             ▼
┌────────────────────────┐
│   Cloudflare Worker      │  Único backend do proxecto. Todas as rutas
│   api.qch.workers.dev    │  privadas e públicas viven aquí (ver §3).
└────────────┬─────────────┘
             │ service_role key (nunca exposta ao navegador)
             ▼
┌────────────────────────┐      ┌──────────────────────────┐
│   Supabase Cloud          │      │   Cloudflare R2            │
│   (Postgres + Auth)       │      │   Fotos das receitas        │
│   táboas: ver §4          │      │   (principal, galería,      │
│                            │      │    proceso)                 │
└────────────────────────┘      └──────────────────────────┘

┌────────────────────────┐
│   GitHub                 │  Repositorio único, fonte de verdade.
│   + GitHub Actions        │  - cron cada 6 días: ping de lectura a Supabase
│                            │    (anti-pause do plan gratuíto).
│                            │  - despregue do Worker (wrangler deploy).
└────────────────────────┘
```

Non hai servidor propio en ningures. As tres pezas de pago potencial (Cloudflare, Supabase, GitHub) teñen plan gratuíto dabondo para o volume dunha soa familia (ver §7).

---

# 2. Compoñentes

## 2.1 Frontend — Cloudflare Pages

- HTML/CSS/JS servido tal cal, sen paso de build (mantense a filosofía de simplicidade: abrir e funciona).
- `js/api.js` é o único módulo que fala co Worker (`fetch`); ningún outro ficheiro fai chamadas de rede.
- Service worker (`sw.js`) mantén a app usable offline; os datos locais (`localStorage`) seguen sendo a capa sempre-dispoñible, sincronizada en segundo plano co Worker.
- A xeración da imaxe de compartir (JPG, texto + decoración, ver `VISION.md` § Compartición diaria) é 100 % local nun `<canvas>` — non chama a ningunha ruta do Worker.

## 2.2 Backend — un único Cloudflare Worker

Un só Worker fai de backend completo: autenticación, catálogos, sincronización de estado e proxy á IA. Motivo: pouca lóxica de negocio real (validar token, ler/escribir Supabase, chamar a un modelo), e un só sitio para desplegar/rotar segredos/mirar logs. Se algunha ruta medra de máis (por exemplo a IA, se se lle engade procesamento pesado), sepárase nese momento nun Worker propio — non antes.

Responsabilidades do Worker:
- Validar o token da casa en cada petición privada.
- Ler/escribir en Supabase coa `service_role key` (nunca exposta ao cliente).
- Chamar á API de IA (Kimi/Moonshot, compatible OpenAI) coa clave gardada como secret.
- Aplicar CORS restrinxido á orixe de Cloudflare Pages.

## 2.3 Base de datos — Supabase Cloud (plan gratuíto)

Postgres xestionado + Auth + API REST automática (PostgREST). O Worker é quen fala con Supabase; o frontend nunca o fai directamente (mantense o principio "sen segredos no navegador" da VISION).

## 2.4 Imaxes — Cloudflare R2

Bucket para as fotos das receitas (principal, galería, proceso — VISION § Fotografías). Subida dende o móbil vía o Worker (que xera URLs prefirmadas ou recibe o binario e o reenvía a R2), nunca cunha clave de R2 exposta no cliente.

## 2.5 CI/CD e mantemento — GitHub + GitHub Actions

- **Push a `main`** → Cloudflare Pages redesprega o frontend automaticamente (integración nativa Git).
- **GitHub Action (`.github/workflows/deploy-worker.yml`)** → despraga o Worker con `wrangler deploy` en cada push que toque `worker/`.
- **GitHub Action (`.github/workflows/manter-supabase-vivo.yml`)** → `cron: '0 6 */6 * *'`, fai unha lectura mínima (`GET` a unha táboa con `anon key`) para evitar o auto-pause de Supabase tras 7 días de inactividade.

---

# 3. Rutas do Worker

| Método e ruta | Bearer | Corpo / resposta |
|---|---:|---|
| `POST /auth/login` | Non | `{ token }` → `{ token, caduca }`. Token de sesión gardado en `qch_sesions`. |
| `GET /receitas` | Si | Catálogo completo de receitas. |
| `GET /ingredientes` | Si | Catálogo de ingredientes. |
| `GET /persoas` | Si | Catálogo de persoas da familia. |
| `GET/PUT /semana` | Si | `{ "dia:xantar": receitaId }`. `PUT` substitúe o recurso enteiro. |
| `GET/PUT /neveira` | Si | `{ ingredienteId: cantidade }`. |
| `GET/PUT /cociñeiros` | Si | `{ "dia:xantar": persoaId }`. |
| `POST /receitas/:id/fotos` | Si | Sube unha foto a R2, devolve a URL pública/asinada. |
| `POST /ia/axuda` | Si | `{ accion, receitaId?, conversaId?, mensaxe, contexto }` → `{ accion, modelo, proposta }`. Ver §5 (memoria de conversa). |
| `GET /saude` | Non | Comprobación simple de que o Worker está vivo. |

Non hai ruta de compartición pública (`/compartir`, `/publico/<token>`) — a compartición diaria é só a imaxe JPG xerada en local, sen backend (ver `VISION.md`).

---

# 4. Esquema de Supabase

Partindo de cero, esquema simple (jsonb) coherente coa filosofía de simplicidade — non relacional de máis mentres non hai necesidade real:

```sql
create table qch_receitas (
  id text primary key,
  data jsonb not null,          -- nome, ingredientes, elaboración, tempos, custo,
                                 -- nutrición, versións históricas, valoracións, adaptacións
  actualizado_en timestamptz default now()
);

create table qch_ingredientes (
  id text primary key,
  data jsonb not null
);

create table qch_persoas (
  id text primary key,
  data jsonb not null
);

create table qch_estado (
  clave text primary key,       -- 'semana' | 'neveira' | 'cociñeiros'
  data jsonb not null,
  actualizado_en timestamptz default now()
);

create table qch_sesions (
  token text primary key,
  creado_en timestamptz default now(),
  caduca_en timestamptz not null
);

create table qch_conversas (    -- memoria da IA (ver §5)
  id uuid primary key default gen_random_uuid(),
  receita_id text references qch_receitas(id),
  mensaxes jsonb not null default '[]',
  actualizado_en timestamptz default now()
);
```

Fotos: gardadas en R2, non en Supabase; `qch_receitas.data` só garda as URLs (principal, galería, proceso).

RLS: como só hai un token de casa (non usuarios individuais de Supabase Auth), o acceso valídase no Worker, non con políticas RLS por usuario — as táboas son accesibles só coa `service_role key`, que nunca sae do Worker.

---

# 5. Memoria de conversa coa IA

Cando se fala coa IA para ir axustando unha receita (engadir ingredientes, cambiar cantidades, etc.), o Worker:

1. Recibe `conversaId` (ou crea unha nova se non existe).
2. Le `mensaxes` de `qch_conversas` para ese `id`.
3. Engade a mensaxe nova do usuario ao historial.
4. Manda o historial completo (recortado se pasa dun límite de tokens razoable) ao modelo (Kimi/Moonshot).
5. Garda a resposta no historial e devólvea ao frontend.

Non hai "memoria" na IA en si — é o Worker + Supabase quen a xestiona, igual que faría calquera workflow de n8n cun nodo de memoria, só que en código explícito.

---

# 6. Segredos

Todos gardados como *secrets* de Cloudflare Worker (`wrangler secret put`), nunca en código nin en `.env` subido a Git:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY` (Kimi/Moonshot), `AI_BASE_URL`, `AI_MODEL`
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `IA_ACCESS_TOKEN` / token da casa, se se xestiona por variable en vez de só en Supabase

CORS no Worker restrinxido á orixe exacta de Cloudflare Pages.

---

# 7. Custo agardado

Volume dunha soa familia (poucos MB de datos, uso diario lixeiro):

| Servizo | Plan | Límite relevante | Marxe agardada |
|---|---|---|---|
| Cloudflare Pages | Gratuíto | Sen límite práctico para un sitio estático | Ampla |
| Cloudflare Workers | Gratuíto | 100.000 peticións/día | Ampla |
| Cloudflare R2 | Gratuíto | 10 GB almacenamento, sen cargo por saída vía Workers | Ampla mentres non se acumulen miles de fotos en alta resolución |
| Supabase Cloud | Gratuíto | 500 MB BD, 5 GB transferencia/mes, auto-pause tras 7 días sen actividade | Ampla en tamaño; auto-pause mitigado co cron de GitHub Actions (§2.5) |
| GitHub Actions | Gratuíto (repo público) ou minutos incluídos (privado) | — | Ampla, cron lixeiro |

Custo total agardado: **0 €/mes** mentres o uso non escale moito máis alá dunha familia.

---

# 8. O que queda explicitamente fóra (por agora)

- Compartición pública por URL (substituída pola imaxe JPG local, ver `VISION.md`).
- Auth individual por membro da familia (mantense o token único de casa — só hai un perfil, "cociñeiros", segundo a VISION).
- Separación en varios Workers — só se xustifica se algunha ruta medra moito.
