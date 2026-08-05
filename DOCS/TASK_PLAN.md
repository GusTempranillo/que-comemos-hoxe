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
- ✅ **Despregamento en Cloudflare Pages**: feito.
- ❌ **Todo o resto** (n8n, Supabase, R2, IA, nutrición, fotografías reais, modo cociñar, aprendizaxe): sen empezar. Os datos de receitas, ingredientes e familia son arrays estáticos en `js/datos/`, e o estado vive só en `localStorage` (`js/estado.js`).

En resumo: **a Fase 1 está completa**. "Login de cociñeiros" e "Compartición do menú" pasaron formalmente á Fase 2 (ver `ROADMAP.md`): ambas precisan dun backend que aínda non existe (token de sesión, URL pública efémera). A Fase 2 é o traballo pendente inmediato.

---

# Fase 2 — Sincronización

Obxectivo (de `ROADMAP.md`): deixar de depender só do navegador. Trasladar a fonte da verdade a n8n + Supabase sen romper nada do que xa funciona.

Principio guía (`ARCHITECTURE.md`): o frontend nunca fala directamente coa base de datos; todo pasa por n8n mediante HTTPS e un token.

## 2.1 · Deseñar o contrato de API

- [ ] Listar as operacións que hoxe fai `js/estado.js` sobre `localStorage` e convertelas en endpoints n8n: ler/gardar `semana`, ler/gardar `neveira`, ler/gardar `cociñeiros`, ler `comensais` (persoas), ler `receitas`, ler `ingredientes`.
- [ ] Definir os mesmos "shapes" de datos que xa usan `QCH.receita(id)`, `QCH.ingrediente(id)` e `QCH.persoa(id)` (ver `js/datos/*.js`), para que as vistas non teñan que cambiar cando os datos veñan da rede en vez de estar en memoria.
- [ ] Definir os endpoints de autenticación (login por token) e de compartición (crear URL efémera, consultar menú público por token).
- [ ] Documentar o contrato (aínda que sexa informalmente, nun ficheiro ou nun workflow de n8n) antes de escribir código no frontend.

## 2.2 · Autenticación por token

- [ ] Deseñar unha pantalla/paso de acceso sinxelo (un único perfil, "cociñeiro", segundo `VISION.md` §Usuarios — non hai roles nin permisos distintos).
- [ ] Decidir onde vive o token no frontend (probablemente `localStorage`, coma o resto do estado) e como se envía nas peticións a n8n.
- [ ] Lembrar que isto **non** é gardar un segredo de aplicación (API key): é un token de sesión do cociñeiro, coherente con "nunca gardar credenciais no navegador" de `AI_GUIDELINES.md` referido a segredos da app, non a sesións de usuario.

## 2.3 · Cliente de API (`js/api.js`)

- [ ] Crear un novo módulo `js/api.js`, seguindo o mesmo patrón de namespace `QCH.*` que xa usan `js/estado.js` e `js/xerador.js` (IIFE, sen clases, sen dependencias externas).
- [ ] Engadir o `<script src="js/api.js">` correspondente en `index.html` (na orde correcta, antes dos módulos que o vaian usar) e a súa entrada en `ARMAZON` en `sw.js`.
- [ ] Manter o mesmo estilo do resto do proxecto: JS clásico (non módulos ES), sen build, funcións pequenas.

## 2.4 · Migrar os datos estáticos a datos remotos

- [ ] Substituír gradualmente `js/datos/receitas.js`, `js/datos/ingredientes.js` e `js/datos/familia.js` por chamadas a `js/api.js`, mantendo `QCH.RECEITAS`, `QCH.INGREDIENTES` e `QCH.PERSOAS` como caché en memoria alimentada pola API (para non ter que reescribir todas as vistas de golpe).
- [ ] Conservar un modo de traballo sen conexión: se a API non responde, seguir a funcionar cos últimos datos coñecidos (xa gardados vía `localStorage` en `js/estado.js`).

## 2.5 · Sincronización offline-first

- [ ] Implementar o fluxo descrito en `FUNCTIONAL_SPECIFICATION.md` §8-9: os cambios gárdanse sempre en local primeiro; se falla a sincronización, consérvanse e reinténtase automaticamente ao recuperar conexión.
- [ ] Non bloquear nunca a interface agardando pola rede — o patrón actual de `QCH.estado.update()` (actualizar local, notificar, pintar) débese manter; a chamada á API vai "por detrás".

## 2.6 · Axustar o Service Worker

- [ ] Revisar `sw.js`: o armazón estático (HTML/CSS/JS/iconos) segue en caché-first coma agora; as respostas de API deben ir en network-first (ou stale-while-revalidate) para non mostrar datos vellos quen ten conexión.
- [ ] Comprobar que o fallback a `index.html` sen conexión segue funcionando cando se engadan chamadas de rede novas.

## 2.7 · Compartición do menú (movida desde a Fase 1)

- [ ] Endpoint en n8n que cree unha URL pública efémera (identificador aleatorio, caducidade dese día, non indexable) — responsabilidade do backend segundo `ARCHITECTURE.md`.
- [ ] Botón "Compartir" na vista `hoxe` (`js/vistas/hoxe.js`) que chame a ese endpoint e abra WhatsApp co enlace, tal como describe `VISION.md` §Compartición diaria.
- [ ] Páxina pública (fóra da app principal, sen autenticación) que amose prato, foto, ingredientes, alérxenos, nutrición, comensais previstos e equilibrio semanal/mensual — contido mínimo definido en `FUNCTIONAL_SPECIFICATION.md` §5.

## 2.8 · Infraestrutura n8n (fóra deste repositorio)

- [ ] Configurar a instancia de n8n: primeiros workflows (login, CRUD de semana/neveira/receitas, xeración de URL de compartición).
- [ ] Conectar n8n con Supabase (ver Fase 3) para persistencia real.
- [ ] Isto é traballo de infraestrutura/configuración, non código JS deste repositorio — trátao como un proxecto á parte coordinado con esta fase.

---

# Fase 3 — Base de datos

Obxectivo: construír a memoria permanente en Supabase.

- [ ] Deseñar o esquema relacional a partir do modelo conceptual de `DATABASE_MODEL.md` (Persoa, Receita, Ingrediente, ReceitaIngrediente, Adaptación, Fotografía, Versión, Información nutricional, Planificación, Evento de cociñado, Compartición).
- [ ] Migrar os datos actuais de `js/datos/*.js` a Supabase como carga inicial.
- [ ] Implementar historial e versionado (nunca eliminar coñecemento, según `DATABASE_MODEL.md` §Filosofía do modelo).
- [ ] Conectar os endpoints de n8n definidos na Fase 2 a Supabase en vez de a datos de proba.

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
