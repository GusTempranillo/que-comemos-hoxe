# TASK_PLAN.md
# Plan de tarefas

> Este documento traduce `ROADMAP.md` en tarefas concretas e marcables. `ROADMAP.md` segue sendo a fonte da verdade sobre **que** fases existen e por que; este documento é o **como**, fase a fase, e vaise actualizando a medida que se traballa.

---

# Como usar este documento

- Marca `[x]` cando unha tarefa estea rematada de verdade (funciona, é sinxela de usar, non rompe compatibilidade — criterios de `FUNCTIONAL_SPECIFICATION.md` §11).
- As tarefas da fase actual (Fase 2) están desenvolvidas a nivel técnico. As fases posteriores quedan ao mesmo nivel que `ROADMAP.md` a propósito: detallalas antes de tempo suporía inventar decisións (provedor de IA, esquema definitivo de Supabase...) que aínda non están tomadas.
- Antes de empezar unha fase nova, relé `VISION.md` e `AI_GUIDELINES.md` — en concreto as "preguntas antes de propoñer cambios" de `AI_GUIDELINES.md`.
- Cando se remate unha fase, actualiza tamén o estado en `ROADMAP.md`.

---

# Estado actual (punto de partida)

Revisado directamente contra o código en `js/`:

- ✅ **PWA**: manifest, service worker, funcionamento offline do armazón da app.
- ✅ **Receitario básico**: `js/datos/receitas.js`, vista `js/vistas/receitario.js`, busca e filtros.
- ✅ **Planificación do xantar**: calendario semanal (`js/vistas/semana.js`), xerador de menú por puntuación (`js/xerador.js`).
- ✅ **Neveira e adaptacións por persoa**: `js/vistas/neveira.js`, `js/datos/familia.js`.
- ✅ **Despregamento en Cloudflare Pages**: feito (versión previa a esta integración; ver nota de 2.6/2.8 sobre se xa inclúe este commit).
- 🟡 **Cliente de API, login e compartición no frontend** (`78d6e22 feat: conecta a web coa API de n8n`): `js/api.js`, `js/vistas/configuracion.js`, `js/publico.js` e os cambios en `js/app.js`/`index.html`/`sw.js` xa están no código. Implementan o contrato de `API_CONTRACT.md` completo dende o punto de vista do frontend. Non se puido verificar dende este repositorio se hai un backend n8n real respondendo, nin se CORS está configurado — ver `BACKEND_N8N_STATUS.md`.
- ❌ **Resto** (Supabase real, R2, IA, nutrición, fotografías reais, modo cociñar, aprendizaxe): sen empezar no frontend. Os arrays estáticos de `js/datos/` seguen sendo o arranque e o modo sen conexión/sen sesión.

En resumo: a Fase 1 (receitario, planificación, neveira, PWA) está completa. A Fase 2 xa ten código de frontend para autenticación e sincronización (2.1, 2.3, 2.7 abaixo), pero iso non abonda para darlas por rematadas de verdade (criterio de "Como usar este documento": ten que funcionar, non só estar escrito) — falta confirmar dende fóra do repo que o backend responde e está publicado.

---

# Fase 2 — Sincronización

Obxectivo (de `ROADMAP.md`): deixar de depender só do navegador. Trasladar a fonte da verdade a n8n + Supabase sen romper nada do que xa funciona.

Principio guía (`ARCHITECTURE.md`): o frontend nunca fala directamente coa base de datos; todo pasa por n8n mediante HTTPS e un token.

## 2.1 · Deseñar o contrato de API ✅

- [x] Listar as operacións que hoxe fai `js/estado.js` sobre `localStorage` e convertelas en endpoints n8n: ler/gardar `semana`, ler/gardar `neveira`, ler/gardar `cociñeiros`, ler `comensais` (persoas), ler `receitas`, ler `ingredientes`.
- [x] Definir os mesmos "shapes" de datos que xa usan `QCH.receita(id)`, `QCH.ingrediente(id)` e `QCH.persoa(id)` (ver `js/datos/*.js`), para que as vistas non teñan que cambiar cando os datos veñan da rede en vez de estar en memoria.
- [x] Definir os endpoints de autenticación (login por token) e de compartición (crear URL efémera, consultar menú público por token).
- [x] Documentar o contrato — `API_CONTRACT.md`, agora reescrito para describir exactamente o que chama `js/api.js` no código actual, non unha proposta previa ao código.

## 2.2 · Autenticación por token ✅ (frontend); backend real sen confirmar

- [x] Pantalla de acceso sinxelo: modal de Configuración (`js/vistas/configuracion.js`), un só formulario URL + token, sen roles.
- [x] O token vive en `localStorage` (`qch:api:v1`, xunto coa URL base e a caducidade que devolva o servidor) e envíase como `Authorization: Bearer <token>` en cada chamada privada (`js/api.js`).
- [x] O código introducido pola persoa non se garda — só se envía en `POST /auth/login`; o que persiste é o token de sesión devolto polo servidor, coherente con "non é unha API key" de `AI_GUIDELINES.md`.
- Pendente de confirmar (non verificable dende o código): que ese login funcione de verdade contra un n8n real en produción — ver `BACKEND_N8N_STATUS.md`.

## 2.3 · Cliente de API (`js/api.js`) ✅

- [x] `js/api.js` existe, namespace `QCH.api`, IIFE, sen clases nin dependencias externas, mesmo estilo que `js/estado.js`/`js/xerador.js`.
- [x] `<script src="js/api.js">` engadido en `index.html` na orde correcta (despois de `estado.js`, antes de `xerador.js`), e entrada en `ARMAZON` de `sw.js` (que subiu a `qch-v4`).
- [x] Funcións pequenas, JS clásico, sen build.

> Detalle completo do que implementa `QCH.api` en `API_CONTRACT.md`.

## 2.4 · Migrar os datos estáticos a datos remotos ✅

- [x] `QCH.api.prepararCasa()` substitúe `QCH.RECEITAS`, `QCH.INGREDIENTES` e `QCH.PERSOAS` en memoria polos datos remotos tras un login correcto, sen que as vistas cambiasen.
- [x] Modo sen conexión conservado: se `prepararCasa()` falla, o login segue sendo válido e a app continúa cos datos locais/estáticos; reinténtase ao recuperar conexión.

## 2.5 · Sincronización offline-first ✅

- [x] `QCH.estado.subscribe()` en `js/app.js` chama a `QCH.api.sincronizar()` despois de pintar, nunca antes — a rede non bloquea a interface.
- [x] Cola de pendentes en `localStorage` (`qch:api:pendentes:v1`); reintento automático en `online` e en cada sincronización nova.
- [x] Sen fusión de conflitos: un `409` ou calquera outro erro trátase coma un fallo de rede normal (queda pendente). Isto é unha decisión simple, non un caso sen cubrir — documentado como tal en `API_CONTRACT.md` §6.

## 2.6 · Axustar o Service Worker 🟡

- [x] `sw.js` cachea os ficheiros novos (`js/api.js`, `js/vistas/configuracion.js`, `js/publico.js`) e subiu de versión (`qch-v1` → `qch-v4`).
- [x] O fallback a `index.html` sen conexión séguese aplicando igual (non se tocou esa parte do `fetch` handler).
- [ ] **Non se implementou** unha estratexia diferenciada (network-first/stale-while-revalidate) para as respostas de API: o `fetch` handler de `sw.js` simplemente ignora calquera petición de orixe distinta (`url.origin !== location.origin`), así que as chamadas a n8n nin se cachean nin pasan polo Service Worker — van sempre directas á rede. Practicamente equivale a "network-only" para a API (non se amosan datos vellos), pero non é o deseño explícito que describía esta tarefa; se algún día a API se serve dende o mesmo dominio, isto habería que revisalo.

## 2.7 · Compartición do menú ✅ (frontend); endpoint de n8n sen confirmar

- [x] Botón "Compartir" en `js/vistas/hoxe.js`, acción `compartir-menu` en `js/app.js`: chama a `POST /compartir`, usa `navigator.share` se está dispoñible e, se non, abre `wa.me` cun texto co enlace.
- [x] Páxina pública `js/publico.js`: detecta `/m/<token>`, quita cabeceira e barra de navegación, chama a `GET /publico/<token>` sen sesión, e amosa receita, ingredientes e comensais previstos; nutrición amósase só se o servidor a devolve, senón un aviso de "aínda non dispoñible" (non alérxenos nin equilibrio semanal/mensual — iso non está implementado).
- Pendente de confirmar (fóra deste repo): que o endpoint `POST /compartir` en n8n cree de verdade unha URL efémera, non indexable e con caducidade — o frontend asume esa forma pero non pode verificala.

## 2.8 · Infraestrutura n8n (fóra deste repositorio) — sen confirmar dende este repo

- [ ] Non hai forma de verificar dende este repositorio se a instancia de n8n está configurada, ten os workflows creados, ou está conectada a Supabase. `BACKEND_N8N_STATUS.md` documenta explicitamente este límite en vez de asumir un estado.
- [ ] Isto segue sendo traballo de infraestrutura/configuración á parte, coordinado con quen administre o VPS/n8n/Supabase.

## 2.9 · Edición de catálogos dende a interface (crear/modificar) ✅

VISION.md §Usuarios: "Todas as persoas que acceden á aplicación poden crear, modificar e planificar" — non hai perfil de só lectura. Ata este punto só se podía axustar cantidades na neveira e activar/desactivar comensais xa existentes; non se podía crear ingredientes, receitas nin persoas novas, nin editar as xa existentes, nin xestionar adaptacións dende a interface.

- [x] `js/catalogo.js` (novo): mutacións locais sobre `QCH.INGREDIENTES`/`QCH.RECEITAS`/`QCH.PERSOAS` — crear/editar ingrediente, crear/editar receita (con versionado: a versión anterior gárdase enteira en `receita.versions` antes de aplicar cambios, nunca se sobrescribe sen deixar rastro, `VISION.md` §Receitario vivo), crear/editar persoa, gardar/quitar adaptación por persoa e receita.
- [x] `js/vistas/formularios.js` (novo): formularios modais para ingrediente, receita (nome, categoría, tempo, dificultade, racións, vexetariana, etiquetas, ingredientes e pasos dinámicos, truco) e persoa (nome, cor, nota, restricións, cociña), máis un editor de adaptacións por receita (tipo sen/substituír/prato) accesible dende a ficha de cada receita.
- [x] Botóns novos: "Nova receita" e "Editar" na ficha de receita (`receitario.js`, `detalle.js`), "Adaptacións" na ficha de receita (`detalle.js`), "Novo ingrediente" e edición por fila na neveira (`neveira.js`), "Nova persoa" e "Editar" por tarxeta na familia (`familia.js`).
- [x] Persistencia local-first: cada edición gárdase de inmediato en `localStorage` (`qch:catalogos:v1`, mesma clave que xa usaba a caché de catálogos remotos) para que sobreviva a recargar a páxina aínda sen sesión nin conexión — mesmo principio que xa usaba a neveira.
- [x] Sincronización: `QCH.api.sincronizarCatalogo()` (novo en `js/api.js`) segue o mesmo patrón offline-first que `semana`/`neveira`/`cociñeiros` (cola de pendentes, reintento automático). Precisaba `PUT /receitas`, `PUT /ingredientes` e `PUT /persoas` en n8n — especificados en `API_CONTRACT.md` §8.
- [x] Proba manual de punta a punta en local (navegador headless, sen backend): crear receita nova, editala (xera versión), crear ingrediente novo, crear persoa nova, gardar unha adaptación — todo persiste tras recargar a páxina.
- [x] **`PUT /receitas`, `/ingredientes` e `/persoas` xa están activos en produción** (confirmado por Codex, 2026-08-06) — ver `BACKEND_N8N_STATUS.md`. Non fixo falta ningún cambio de frontend: `sincronizarCatalogo()` xa apuntaba a esas rutas exactas dende que se escribiu.
- [x] **Verificado de punta a punta en produción polo usuario** (2026-08-06), probando en `https://claude-proyecto-continuacion.qch.pages.dev` (preview do PR #6 contra o backend real): a edición de catálogos funciona. A Fase 2.9 está completa e verificada, igual que xa o estaba `semana`/`neveira`/`cociñeiros` (§2.2).

---

# Fase 3 — Base de datos

Obxectivo: construír a memoria permanente en Supabase.

> Contexto de partida (confirmado en `BACKEND_N8N_STATUS.md`, "Estado confirmado"): xa hai un backend n8n en produción con Supabase detrás, con táboas reais `qch_receitas`, `qch_ingredientes`, `qch_persoas`, `qch_estado`, `qch_sesions`, `qch_comparticions`. Pero `semana`, `neveira` e `cociñeiros` hoxe **non son táboas**: son claves soltas dentro do JSON de `qch_estado`. Esta fase é sobre completar o modelo relacional que falta, non sobre crear un backend dende cero.

- [x] Deseñar o esquema relacional obxectivo a partir do modelo conceptual de `DATABASE_MODEL.md` (Persoa, Receita, Ingrediente, ReceitaIngrediente, Adaptación, Fotografía, Versión, Información nutricional, Planificación, Evento de cociñado, Compartición) — `DATABASE_SCHEMA.sql`. A revisión posterior demostrou que non convive directamente co esquema JSON de produción; precisa unha migración aditiva previa.
- [x] Preparar a carga inicial de referencia dos datos actuais de `js/datos/*.js` como SQL — `DATABASE_SEED.sql` (14 receitas, ingredientes, persoas e adaptacións). Non é executable contra o esquema JSON actual sen a migración previa.
- [x] Deseñar historial e versionado sen eliminar coñecemento (`DATABASE_MODEL.md` §Filosofía do modelo) — táboa `qch_receita_versions` en `DATABASE_SCHEMA.sql`, cun `snapshot` completo por versión.
- [x] Deseñar a migración aditiva desde o esquema JSON real — `DATABASE_MIGRATION_FASE3.sql`. Non toca `qch_receitas`/`qch_ingredientes`/`qch_persoas`/`qch_estado` (seguen coma están, `GET /receitas` e `GET /persoas` xa funcionan lendo `data`); só crea as táboas de relación que faltan e as pobla por extracción (`jsonb_array_elements`/`jsonb_each`) dende `data->'ingredientes'` e `data->'adaptacions'`, con consultas de verificación (conta de filas e reconstrución por `jsonb_agg`) antes de dar nada por válido. `semana` e `cociñeiros` mantéñense en `qch_estado` por agora: non conteñen datas coas que poboar `qch_planificacion` sen inventar información.
- [x] **Executar `DATABASE_MIGRATION_FASE3.sql` contra a instancia real de Supabase e revisar as súas consultas de verificación.** Feito polo usuario dende o VPS (2026-08-06): backup previo, migración aplicada contra o contedor `supabase-db` (Supabase autoaloxado en Docker), resultado idéntico á proba local (94 filas en `qch_receita_ingredientes`, 11 en `qch_adaptacions`, 0 diferenzas nas tres verificacións). Ver `BACKEND_N8N_STATUS.md` §"Aplicada en produción real".
- [ ] Só se algunha funcionalidade futura (nutrición agregada, busca de ingredientes entre receitas, diario de cociñado) necesita que un workflow lea das táboas relacionais novas en vez de `data`: actualizar ese workflow entón, coa consulta de referencia de `DATABASE_MIGRATION_FASE3.sql` §5. `GET /receitas` e `GET /persoas` non cambian coa migración aditiva en si. Ver `BACKEND_N8N_STATUS.md` §"Fase 3: estado confirmado".

---

# Fase 4 — Intelixencia Artificial

Obxectivo: converter a IA nun asistente culinario, integrada exclusivamente desde n8n (`ARCHITECTURE.md` §Intelixencia Artificial).

- [ ] Redacción e mellora de textos de receitas.
- [ ] Cálculo nutricional automático.
- [ ] Proposta de menús equilibrados (complementando, non substituíndo, o xerador determinista actual de `js/xerador.js`).
- [ ] Adaptación de receitas e aproveitamento de sobras.
- [ ] Xeración da lista da compra.
- [ ] Recordar sempre `COOKBOOK_MODEL.md` §Papel da IA: a IA nunca modifica unha receita sen confirmación explícita.

---

# Fase 5 — Memoria culinaria

Obxectivo: crear o diario da cociña (`DATABASE_MODEL.md` §Evento de cociñado).

- [ ] Rexistro de cada elaboración: data, responsable, fotografías, cambios, valoración, comentarios.
- [ ] Vista/historial por receita que amose eses eventos.

---

# Fase 6 — Fotografías

Obxectivo: xestión completa das imaxes en Cloudflare R2.

- [ ] Subida desde o móbil (cámara e galería).
- [ ] Galería por receita e cambio de foto principal.
- [ ] Optimización automática das imaxes (responsabilidade do backend, `ARCHITECTURE.md` §Almacenamento de imaxes).

---

# Fase 7 — Nutrición

Obxectivo: seguimento nutricional por receita e por ración.

- [ ] Amosar calorías, proteínas, hidratos, graxas, fibra.
- [ ] Equilibrio nutricional semanal e mensual.
- [ ] Detección de excesos ou carencias (apoiada en IA, Fase 4).

---

# Fase 8 — Inventario e compras

Obxectivo: ampliar a neveira actual a un inventario completo.

- [ ] Despensa (ademais da neveira xa existente).
- [ ] Produtos de tempada e caducidades.
- [ ] Lista da compra intelixente (hoxe xa hai unha base determinista en `QCH.listaDaCompra()`, `js/estado.js`; esta fase amplíaa).

---

# Fase 9 — Modo cociñar

Obxectivo: experiencia optimizada durante a elaboración.

- [ ] Pasos un a un a partir de `receita.pasos` (xa existe en `js/datos/receitas.js`).
- [ ] Temporizadores.
- [ ] Pantalla sempre activa (Wake Lock API).
- [ ] Control por voz (futuro, fóra de alcance inicial).

---

# Fase 10 — Aprendizaxe continua

Obxectivo: que a IA aprenda dos hábitos da familia a partir dos datos xa acumulados nas fases anteriores (eventos de cociñado, valoracións, frecuencia de consumo).

- [ ] Definir que sinais se usan (pratos favoritos, frecuencia, adaptacións habituais, equilibrio alimentario — `VISION.md` §Memoria culinaria).
- [ ] Recomendacións cada vez máis personalizadas no xerador de menú e/ou na IA da Fase 4.

---

# Ideas futuras (sen fase asignada)

Recollidas en `ROADMAP.md` §Ideas futuras; non planificar en detalle ata que se aborden: importación de receitas desde fotos, OCR de receitas manuscritas, escaneo de códigos de barras, estatísticas anuais, receitas de celebración/tempada, calendario gastronómico, exportación a PDF, libro familiar de receitas, integración con asistentes de voz, notificacións intelixentes.
