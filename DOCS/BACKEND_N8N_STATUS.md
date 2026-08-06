# Backend n8n — estado dende o punto de vista do código

> Este documento afirmaba orixinalmente só o que se podía verificar lendo o código deste repositorio, xa que a sandbox de Claude Code non ten acceso a n8n, Supabase nin infraestrutura fóra do repo. A sección **"Estado confirmado"** de máis abaixo é a excepción: recolle respostas dadas directamente por quen administra esa infraestrutura (Codex) e polo propio usuario probando en navegador real, e trátase como fonte fiable, non como dedución do código.

## Estado confirmado (2026-08-05): backend en produción e verificado de punta a punta ✅

- **Os 10 workflows QCH están activos e publicados en n8n.** A API responde en `https://n8n.xosemiguel.eu/webhook/qch`.
- **Login funciona**: `POST /auth/login` cun token válido devolve `{ token, caduca }`; a sesión dura **14 días**.
- **Código de acceso da casa**: `qch-e0d33e6e7850c5565af4400d6add2129` (xa non é o valor por defecto `1234` que traía n8n sen configurar).
- **Catálogos funcionan**: `GET /receitas` devolve un array de 14 receitas coa forma `[{ "id": "tortilla", ... }, ...]`, válida segundo `listaValida()` de `js/api.js`.
- **Persistencia funciona**: houbo un fallo real detectado e corrixido por Codex (o `PUT` de `/semana`, `/neveira` e `/cociñeiros` devolvía `200 {"gardado":true,...}` pero a lectura seguinte volvía ao valor antigo). Xa está arranxado nos tres workflows.
- **CORS funciona**: houbo un segundo fallo real, tamén corrixido — a resposta traía a cabeceira `Access-Control-Allow-Origin` **duplicada** (`https://qch.pages.dev, https://qch.pages.dev`), porque tanto Nginx coma n8n a engadían á vez; o navegador rexeita iso por spec aínda que o valor sexa "correcto". Codex quitou a inxección en Nginx; agora só n8n emite esa cabeceira, unha soa vez, tanto en `POST` coma en `OPTIONS` (preflight).
- **Proba de punta a punta feita en navegador real** (non só contra a API): abrir `https://qch.pages.dev`, iniciar sesión co código de acceso real, cambiar a cantidade dun ingrediente na neveira, premer F5 → **o cambio persiste**. Confirmado polo usuario.
- **Supabase existe** e está en uso polos workflows. Táboas reais: `qch_receitas`, `qch_ingredientes`, `qch_persoas`, `qch_estado`, `qch_sesions`, `qch_comparticions`. `semana`, `neveira` e `cociñeiros` **non son táboas separadas**: son claves dentro do JSON de `qch_estado`.
- **Existe un endpoint de IA**: `POST /ia/propoñer-semana`, con Moonshot/Kimi — está inactivo e o frontend aínda non o chama (coherente con `API_CONTRACT.md` §6).
- `https://qch.pages.dev` serve o frontend coa integración da API: `index.html`, `js/api.js` e `js/app.js` coinciden byte a byte coa copia local deste repo.

### Consecuencia práctica

A Fase 2 (sincronización) está **funcionalmente completa e verificada**: login, lectura/escritura de `semana`/`neveira`/`cociñeiros`, e persistencia entre recargas, todo confirmado dende un navegador real contra a API de produción. Aínda quedan sen probar explicitamente **compartición** (`POST /compartir` + `GET /publico/<token>`) e o comportamento offline/reconexión (`sincronizar`, cola de pendentes) — ver "Como confirmar o resto".

## Fase 3: estado confirmado (2026-08-06) — non aplicada

- A revisión da configuración de infraestrutura gardada neste repositorio contradí a premisa de compatibilidade de `DATABASE_SCHEMA.sql`: o seed e os workflows Supabase usan `qch_receitas`, `qch_ingredientes` e `qch_persoas` coa forma `id text primary key, data jsonb not null`, non coas columnas relacionais propostas no documento de Fase 3.
- En consecuencia, `create table if not exists` non altera as táboas existentes e `DATABASE_SEED.sql` fallaría ao tentar inserir, por exemplo, `nome`, `categoria` ou `pasos`. **Non se executou nin schema nin seed**, e non se tocaron os workflows activos.
- Non se puido facer unha inspección SQL directa nin aplicar/validar cambios nesta execución: o perfil de permisos bloquea o socket Docker que dá acceso á instancia local de n8n/PostgreSQL. Esta limitación non se resolveu con ningún atallo.
- Decisión consciente para `qch_estado`: `semana` e `cociñeiros` quedan por agora como JSON. As claves son días da semana (`luns:xantar` etc.), non datas; `qch_planificacion.data` require unha data concreta e unha migración automática inventaría esa información. `neveira` tamén permanece en JSON, como corresponde á Fase 8.

### Migración aditiva deseñada (2026-08-06) — pendente de execución contra infraestrutura real

- `DATABASE_MIGRATION_FASE3.sql` (novo) deseña a migración aditiva pedida: **non toca** `qch_receitas`, `qch_ingredientes`, `qch_persoas` nin `qch_estado` — quedan exactamente coma están, porque `GET /receitas`, `GET /ingredientes` e `GET /persoas` xa están verificados de punta a punta lendo `data jsonb` directamente (ver "Estado confirmado" máis arriba), e cambiar ese camiño sen necesidade funcional inmediata só arrisca o único contrato xa probado.
- Só engade as táboas de relación que realmente faltan (`qch_receita_ingredientes`, `qch_adaptacions`, `qch_fotografias`, `qch_receita_versions`, `qch_nutricion`, `qch_planificacion`, `qch_eventos_cocinado`), referenciando o `id` que xa existe hoxe en `qch_receitas`/`qch_persoas`/`qch_ingredientes` — non hai que crear eses catálogos de novo.
- `qch_receita_ingredientes` e `qch_adaptacions` pópoanse por **extracción** dende `data jsonb` (`jsonb_array_elements`/`jsonb_each` sobre `data->'ingredientes'` e `data->'adaptacions'`), non copiando datos á man: así non poden diverxer da produción real. Inclúe consultas de verificación que comparan conta de filas e reconstrúen o JSON orixinal por `jsonb_agg` antes de dar por boa a extracción.
- **Non se tocan workflows.** `GET /receitas` e `GET /persoas` seguen a ler `data` sen cambios: esta migración non cambia nada que a app xa use hoxe. Se algunha fase futura (nutrición agregada, busca de ingredientes entre receitas, diario de cociñado — Fases 4-8) necesita que un workflow componga a resposta dende as táboas relacionais en vez de dende `data`, `DATABASE_MIGRATION_FASE3.sql` §5 deixa a consulta de referencia (`jsonb_agg`/`jsonb_object_agg`) para facelo entón, coma cambio á parte e xustificado.
- **Verificado nunha instancia desbotable, non na produción real.** Esta execución si tivo acceso a un PostgreSQL 16 local (non ao Supabase/n8n de produción, ao que segue sen haber acceso — mesma limitación de arriba). Creouse alí unha réplica exacta da forma de produción (`id text primary key, data jsonb not null` nas tres táboas), cargouse cos 55/14/8 rexistros reais de `js/datos/*.js`, e executouse `DATABASE_MIGRATION_FASE3.sql` dúas veces seguidas: as tres consultas de verificación devolveron 0 filas de diferenza en ambas as execucións (proba de que a extracción é fiel e de que o ficheiro é idempotente). Isto confirma que o SQL é correcto; **non** confirma nada sobre os datos ou a configuración reais de produción, que este repositorio non pode inspeccionar. Ata que alguén con acceso á infraestrutura real o execute alí e confirme os mesmos resultados, a fonte de verdade segue sendo o JSON actual e as táboas de relación novas non existen aínda en produción.

Para completar a Fase 3 fai falta: (1) que quen administre Supabase execute `DATABASE_MIGRATION_FASE3.sql` contra a instancia real, (2) revisar as consultas de verificación da sección 4 dese ficheiro (deberían devolver 0 filas), e (3) só entón, se algunha funcionalidade futura o require, actualizar o workflow correspondente para ler das táboas novas. Ata entón, a fonte de verdade segue sendo o JSON actual en `data`.

## O que si está no código (verificable dende este repo)

- `js/api.js` implementa un cliente HTTP completo cara a unha API con forma n8n: login por código de casa, catálogos de só lectura, estado planificable (`semana`/`neveira`/`cociñeiros`) con `PUT` completo, compartición e lectura pública. O contrato exacto que asume está en `API_CONTRACT.md`.
- A URL por defecto que trae o código é `https://n8n.xosemiguel.eu/webhook/qch` (constante en `js/api.js`), pero é editable dende o modal de Configuración (`js/vistas/configuracion.js`) — non está fixada (hardcoded) de forma que non se poida cambiar.
- O fluxo de login (`js/vistas/configuracion.js` + acción `config-iniciar-sesion` en `js/app.js`) pide unha URL e un "token de acceso" nun formulario; ese valor introducido pola persoa **non se garda**, só se envía en `POST /auth/login`. O que si se garda en `localStorage` (clave `qch:api:v1`) é o token de sesión que devolva o servidor e a súa data de caducidade, se o servidor a manda.
- `index.html` e `sw.js` xa cargan e cachean `js/api.js`, `js/vistas/configuracion.js` e `js/publico.js` (`sw.js` subiu de `qch-v1` a `qch-v4`).
- O botón "Compartir" (`js/vistas/hoxe.js`) e a páxina pública en `/m/<token>` (`js/publico.js`) están implementados e chaman a `POST /compartir` / `GET /publico/<token>` respectivamente.
- Os arrays estáticos de `js/datos/` **non se eliminaron**: seguen a ser o punto de partida antes de iniciar sesión e o modo de traballo cando non hai conexión ou aínda non se configurou ningunha URL. Tras un login e `prepararCasa()` correctos, `QCH.RECEITAS`, `QCH.INGREDIENTES` e `QCH.PERSOAS` pásanse a substituír en memoria polos datos remotos (ver `API_CONTRACT.md` §3).
- `js/api.js` (liñas 51-61, función `chamar`) tolera corpos de erro que non sigan a forma do contrato (por exemplo un 404 cru de n8n) sen romper: xera `{ codigo: 'erro_' + status, ... }` e rexeita a promesa de forma controlada.

## O que aínda queda por confirmar

- Compartición: `POST /compartir` + páxina pública `/m/<token>` (`js/publico.js`), aínda non probada de punta a punta.
- Comportamento offline-first en produción: cambiar algo sen conexión, recuperar conexión, e comprobar que `reintentarPendentes()` sincroniza correctamente (`API_CONTRACT.md` §4).
- Comportamento exacto ante un `409` de conflito (segue sen resolver, ver `API_CONTRACT.md` §6).

## Como confirmar o resto

1. Compartir un menú dende a app e abrir a URL pública nunha xanela sen sesión iniciada.
2. Cambiar algo coa conexión desactivada (modo avión / DevTools "Offline"), reactivar a conexión, e comprobar que o cambio chega ao servidor sen ter que recargar.
