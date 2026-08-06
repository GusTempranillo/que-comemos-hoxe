# Backend n8n — estado dende o punto de vista do código

> Este documento afirmaba orixinalmente só o que se podía verificar lendo o código deste repositorio, xa que a sandbox de Claude Code non ten acceso a n8n, Supabase nin infraestrutura fóra do repo. A sección **"Estado confirmado"** de máis abaixo é a excepción: recolle respostas dadas directamente por quen administra esa infraestrutura (Codex) e polo propio usuario probando en navegador real, e trátase como fonte fiable, non como dedución do código. **Isto xa non é sempre certo**: a execución do 2026-08-06 que arranxou `POST /ia/axuda` si tivo acceso directo ao VPS (Docker, n8n e o seu PostgreSQL, e o Supabase autoaloxado), polo que ese apartado non é dedución nin testemuño de terceiros, senón comprobación de primeira man. Comproba de que tipo é cada sección antes de fiarte dela.

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

## Fase 3: estado confirmado (2026-08-06) — migración aditiva xa aplicada en produción

- A revisión da configuración de infraestrutura gardada neste repositorio contradí a premisa de compatibilidade de `DATABASE_SCHEMA.sql`: o seed e os workflows Supabase usan `qch_receitas`, `qch_ingredientes` e `qch_persoas` coa forma `id text primary key, data jsonb not null`, non coas columnas relacionais propostas no documento de Fase 3.
- En consecuencia, `create table if not exists` non altera as táboas existentes e `DATABASE_SEED.sql` fallaría ao tentar inserir, por exemplo, `nome`, `categoria` ou `pasos`. **Non se executou nin schema nin seed**, e non se tocaron os workflows activos.
- Non se puido facer unha inspección SQL directa nin aplicar/validar cambios nesta execución: o perfil de permisos bloquea o socket Docker que dá acceso á instancia local de n8n/PostgreSQL. Esta limitación non se resolveu con ningún atallo.
- Decisión consciente para `qch_estado`: `semana` e `cociñeiros` quedan por agora como JSON. As claves son días da semana (`luns:xantar` etc.), non datas; `qch_planificacion.data` require unha data concreta e unha migración automática inventaría esa información. `neveira` tamén permanece en JSON, como corresponde á Fase 8.

### Migración aditiva deseñada (2026-08-06) — pendente de execución contra infraestrutura real

- `DATABASE_MIGRATION_FASE3.sql` (novo) deseña a migración aditiva pedida: **non toca** `qch_receitas`, `qch_ingredientes`, `qch_persoas` nin `qch_estado` — quedan exactamente coma están, porque `GET /receitas`, `GET /ingredientes` e `GET /persoas` xa están verificados de punta a punta lendo `data jsonb` directamente (ver "Estado confirmado" máis arriba), e cambiar ese camiño sen necesidade funcional inmediata só arrisca o único contrato xa probado.
- Só engade as táboas de relación que realmente faltan (`qch_receita_ingredientes`, `qch_adaptacions`, `qch_fotografias`, `qch_receita_versions`, `qch_nutricion`, `qch_planificacion`, `qch_eventos_cocinado`), referenciando o `id` que xa existe hoxe en `qch_receitas`/`qch_persoas`/`qch_ingredientes` — non hai que crear eses catálogos de novo.
- `qch_receita_ingredientes` e `qch_adaptacions` pópoanse por **extracción** dende `data jsonb` (`jsonb_array_elements`/`jsonb_each` sobre `data->'ingredientes'` e `data->'adaptacions'`), non copiando datos á man: así non poden diverxer da produción real. Inclúe consultas de verificación que comparan conta de filas e reconstrúen o JSON orixinal por `jsonb_agg` antes de dar por boa a extracción.
- **Non se tocan workflows.** `GET /receitas` e `GET /persoas` seguen a ler `data` sen cambios: esta migración non cambia nada que a app xa use hoxe. Se algunha fase futura (nutrición agregada, busca de ingredientes entre receitas, diario de cociñado — Fases 4-8) necesita que un workflow componga a resposta dende as táboas relacionais en vez de dende `data`, `DATABASE_MIGRATION_FASE3.sql` §5 deixa a consulta de referencia (`jsonb_agg`/`jsonb_object_agg`) para facelo entón, coma cambio á parte e xustificado.
- **Verificado primeiro nunha instancia desbotable.** Antes de tocar produción, executouse contra un PostgreSQL 16 local cunha réplica exacta da forma de produción (`id text primary key, data jsonb not null` nas tres táboas), cargada cos 55/14/8 rexistros reais de `js/datos/*.js`, dúas veces seguidas: as tres consultas de verificación devolveron 0 filas de diferenza en ambas as execucións (proba de fidelidade da extracción e de idempotencia).

### Aplicada en produción real (2026-08-06) ✅ — confirmado polo usuario

- Supabase é **autoaloxado** (Docker no VPS propio, non Supabase Cloud): a base de datos vive no contedor `supabase-db` (`supabase/postgres:17.6.1.136`), separado do contedor `n8n-postgres-1` que usa n8n para o seu propio estado interno.
- O usuario confirmou dende o VPS que `qch_receitas`, `qch_ingredientes` e `qch_persoas` teñen alí exactamente `id text` + `data jsonb`, coma se asumía.
- Fixo backup previo das seis táboas (`pg_dump` das táboas existentes) e despois executou `DATABASE_MIGRATION_FASE3.sql` directamente contra `supabase-db` (`docker exec -i supabase-db psql -U postgres -d postgres < DOCS/DATABASE_MIGRATION_FASE3.sql`).
- **Resultado idéntico á proba local**: `INSERT 0 94` en `qch_receita_ingredientes`, `INSERT 0 11` en `qch_adaptacions`, e as tres consultas de verificación da sección 4 devolveron `(0 rows)` — sen diferenzas entre o JSON orixinal e o extraído, e a reconstrución por `jsonb_agg` da receita `tortilla` coincide (salvo o formato numérico cosmético xa documentado, `800` fronte a `800.00`).
- `qch_receitas`, `qch_ingredientes`, `qch_persoas` e `qch_estado` **non se tocaron**: seguen exactamente coma antes. `GET /receitas` e `GET /persoas` non cambiaron e non hai que tocar ningún workflow para que sigan funcionando.
- As táboas de relación novas (`qch_receita_ingredientes`, `qch_adaptacions`, `qch_fotografias`, `qch_receita_versions`, `qch_nutricion`, `qch_planificacion`, `qch_eventos_cocinado`) **xa existen en produción**, poboadas por extracción fiel dende `data jsonb`, listas para que futuras fases (nutrición, diario de cociñado, lista da compra agregada) as usen.

Fase 3 (o alcance desta migración) está completa e verificada de punta a punta contra a instancia real. O que queda por diante é traballo de fases futuras: decidir cando (se algunha vez) un workflow pasa a compoñer `GET /receitas`/`GET /persoas` dende as táboas relacionais en vez de dende `data` (non necesario hoxe), e usar as táboas novas para funcionalidade que aínda non existe (nutrición, eventos de cociñado, planificación con datas reais).

## O que si está no código (verificable dende este repo)

- `js/api.js` implementa un cliente HTTP completo cara a unha API con forma n8n: login por código de casa, catálogos de só lectura, estado planificable (`semana`/`neveira`/`cociñeiros`) con `PUT` completo, compartición e lectura pública. O contrato exacto que asume está en `API_CONTRACT.md`.
- A URL por defecto que trae o código é `https://n8n.xosemiguel.eu/webhook/qch` (constante en `js/api.js`), pero é editable dende o modal de Configuración (`js/vistas/configuracion.js`) — non está fixada (hardcoded) de forma que non se poida cambiar.
- O fluxo de login (`js/vistas/configuracion.js` + acción `config-iniciar-sesion` en `js/app.js`) pide unha URL e un "token de acceso" nun formulario; ese valor introducido pola persoa **non se garda**, só se envía en `POST /auth/login`. O que si se garda en `localStorage` (clave `qch:api:v1`) é o token de sesión que devolva o servidor e a súa data de caducidade, se o servidor a manda.
- `index.html` e `sw.js` xa cargan e cachean `js/api.js`, `js/vistas/configuracion.js` e `js/publico.js` (`sw.js` subiu de `qch-v1` a `qch-v4`).
- O botón "Compartir" (`js/vistas/hoxe.js`) e a páxina pública en `/m/<token>` (`js/publico.js`) están implementados e chaman a `POST /compartir` / `GET /publico/<token>` respectivamente.
- Os arrays estáticos de `js/datos/` **non se eliminaron**: seguen a ser o punto de partida antes de iniciar sesión e o modo de traballo cando non hai conexión ou aínda non se configurou ningunha URL. Tras un login e `prepararCasa()` correctos, `QCH.RECEITAS`, `QCH.INGREDIENTES` e `QCH.PERSOAS` pásanse a substituír en memoria polos datos remotos (ver `API_CONTRACT.md` §3).
- `js/api.js` (liñas 51-61, función `chamar`) tolera corpos de erro que non sigan a forma do contrato (por exemplo un 404 cru de n8n) sen romper: xera `{ codigo: 'erro_' + status, ... }` e rexeita a promesa de forma controlada.

## `POST /ia/axuda` (2026-08-06): arranxado e verificado en navegador ✅

Este apartado substitúe ao informe anterior ("a petición non recibe resposta ❌"), que quedou pendente porque aquela execución non tiña acceso a n8n. Esta si o tivo: n8n (`n8nio/n8n:2.30.5`, contedor `n8n-n8n-1`), o seu PostgreSQL e o Supabase autoaloxado. Todo o que segue está comprobado con peticións reais, e a proba final fíxoa o usuario **dende o navegador**, que é como se detectara o fallo orixinal.

Workflow: **"Que comemos hoxe — POST /ia/axuda"**, id `QchAiAssistant01`.

### Causa raíz

Tres fallos independentes, non un só:

1. **A variable `QCH_KIMI_MODEL` non existía.** A expresión do nodo era `{{ $vars.QCH_KIMI_MODEL || 'kimi-k2.5' }}`, así que sempre caía no literal `kimi-k2.5`. Ese modelo **non existe** nesta conta de Moonshot: `GET https://api.moonshot.ai/v1/models` devolve só `kimi-k3`, `kimi-k2.7-code`, `kimi-k2.7-code-highspeed` e `kimi-k2.6`. A credencial "Moonshot account" é **válida** (HTTP 200); o problema nunca foi a API key.

2. **A temperatura depende do modo de razoamento, non do modelo.** O nodo `@n8n/n8n-nodes-langchain.moonshot` envía **sempre** o campo `thinking`, e por defecto `{"type":"disabled"}` (`message.operation.js`: `if (options.thinkingMode && !options.webSearch) ... else body.thinking = { type: 'disabled' }`). Comprobado contra a API:

   | `thinking` | `temperature` admitida |
   |---|---|
   | `disabled` (o que envía o nodo por defecto) | **0.6** |
   | `enabled` ou omitido | **1** |

   Polo tanto o `0.6` que se puxera a man **xa era correcto**; o único erro real deste bloque era o id do modelo. Non hai que "corrixir" esa temperatura a 1 mentres `Thinking Mode` siga desactivado: devolve `400 Bad request`.

3. **Editar o workflow na base de datos non abonda.** n8n 2.x separa *borrador* de *versión publicada*: `workflow_entity.nodes` é o borrador e a execución usa `workflow_entity.activeVersionId` → `workflow_history`. Actualizar só `workflow_entity` non cambia nada do que se executa. Hai que inserir unha versión nova en `workflow_history`, apuntar alí `activeVersionId` (rexistrando o cambio en `workflow_publish_history`) e reiniciar n8n para que rexistre de novo o webhook activo.

### Cambios realizados

| Onde | Cambio |
|---|---|
| Variable n8n | Créase `QCH_KIMI_MODEL = kimi-k3` (antes só existía `QCH_HOUSE_TOKEN`) |
| `Kimi: asistente culinario` | `onError: continueErrorOutput` (antes non tiña saída de erro) |
| `Kimi: asistente culinario` | Fallback do modelo `'kimi-k2.5'` → `'kimi-k3'` |
| `Kimi: asistente culinario` | `maxTokens` mantense en **1800** (ver nota) |
| `Kimi: asistente culinario` | `temperature` mantense en **0.6** (obrigado por `thinking: disabled`) |
| `Preparar resposta IA` | O campo `modelo` devolvía o fallback `'kimi-k2.5'`; agora `'kimi-k3'` |
| `Preparar erro IA` *(novo)* | Nodo Code na saída de erro → `Responder JSON`, devolve `502 {erro, codigo:'ia_erro', mensaxe}` |
| `Ler ingredientes`, `Ler persoas`, `Ler estado` | `executeOnce: true` (ver rendemento) |

**Nota sobre `maxTokens`:** durante a investigación subiuse a 4000 pensando que os tokens de razoamento consumían o orzamento. **Non é así**: o nodo envía `thinking: disabled`, logo non hai tokens de razoamento. Medido co prompt real, a resposta gasta `completion_tokens: 526` con `finish_reason: stop`, así que os 1800 orixinais xa deixan ~3,4× de marxe. Revertiuse a 1800: o cambio non tiña evidencia detrás.

O nodo novo tolera que n8n entregue o erro como cadea ou como obxecto:

```js
const err = $json.error ?? {};
const message = (typeof err === 'string' ? err : (err.message || err.description)) || 'A IA non puido xerar unha proposta';
return [{ json: { status: 502, response: { erro: true, codigo: 'ia_erro', mensaxe: String(message) } } }];
```

### Fallo adicional atopado: multiplicación de items nas lecturas de Supabase

As catro lecturas van **encadeadas** (`Ler receitas` → `Ler ingredientes` → `Ler persoas` → `Ler estado`) e o nodo Supabase execútase **unha vez por cada item de entrada**. Como cada un fai `getAll` da táboa enteira, o número de items multiplícase:

| Nodo | Items de saída | Chamadas HTTP | Tempo |
|---|---|---|---|
| `Ler receitas` | 16 | 1 | 22 ms |
| `Ler ingredientes` | 880 (16×55) | 16 | 133 ms |
| `Ler persoas` | 7 040 (880×8) | 880 | 5 894 ms |
| `Ler estado` | 21 120 (7 040×3) | 7 040 | 43 329 ms |

Non era un problema de rede nin de Supabase: PostgREST responde en 2-32 ms para as catro táboas. O efecto era **~8 000 peticións HTTP redundantes por cada chamada** e, sobre todo, un prompt de **1 533 837 caracteres** (con 880 ingredientes e 7 040 persoas duplicados) enviado ao modelo en cada petición.

Con `executeOnce: true` nos tres nodos posteriores ao primeiro:

- Lecturas de Supabase: **49,4 s → 73 ms**
- Prompt: **1 533 837 → 12 483 caracteres** (123× menos), coas contas correctas (16 receitas, 55 ingredientes, 8 persoas)
- Extremo a extremo: **65 s → 17 s**

**Isto non era cosmético.** `QCH.api.axudaIA()` chama con `esperaMs = 45000` (AbortController en `chamar()`, `js/api.js`), engadido precisamente cando se detectou o colgado. Cos 65 s previos o frontend **abortaba sempre** aos 45 s: aínda co modelo arranxado, a funcionalidade non podería ter funcionado nunca dende a app. Os ~17 s actuais entran con marxe (~2,4×).

### Probas executadas

Contra `https://n8n.xosemiguel.eu/webhook/qch/ia/axuda` en produción, con sesión real de `qch_sesions`:

| Caso | Resultado |
|---|---|
| `{"accion":"mellorar","receitaId":"tortilla","contexto":{"comensais":["isabel","xoan"]}}` | **200**, `{accion, modelo:"kimi-k3", proposta}` — ~17 s |
| `accion:"adaptar"` / `accion:"nutricion"` / `accion:"recomendar"` | 200, forma correcta, IDs existentes |
| Modelo inexistente forzado (`QCH_KIMI_MODEL` a un valor falso) | **502** `{erro:true, codigo:"ia_erro", ...}` en **0,7 s** — antes deste arranxo a petición quedaba colgada para sempre |
| Sen cabeceira `Authorization` | 401 `token_ausente` |
| `accion:"bailar"` | 400 `accion_invalida` |
| `receitaId:"non_existe"` | 404 `receita_non_atopada` |
| Preflight `OPTIONS` e resposta `POST` con `Origin: https://qch.pages.dev` | `Access-Control-Allow-Origin` correcto e **sen duplicar** (o fallo de CORS de 2026-08-05 non se repite aquí) |
| **Navegador real** (`qch.pages.dev`, sesión iniciada, accións de IA dende a ficha de receita) | **Funciona** — confirmado polo usuario |

A proposta devolta respecta as restricións reais da base de datos (p. ex. propón a cebola aparte porque Isabel a ten marcada como restrición en `qch_persoas`), o que confirma que o contexto chega ben ao modelo.

### Riscos e cousas a vixiar

- **Latencia ~17 s, contra un timeout de cliente de 45 s.** É a chamada á IA e non se pode baixar moito co nodo actual: `kimi-k3` razoa sempre e o nodo non expón o nivel de esforzo. A marxe é cómoda pero non enorme; se algún día se activa `Thinking Mode` ou se engade moito contexto ao prompt, hai que revisar ese 45 s de `js/api.js` antes de que volva aparecer o abort.
- **`temperature` e `thinking` van atados.** Se alguén activa `Thinking Mode` no nodo, hai que subir `temperature` a 1 no mesmo cambio, ou romperá con `400`.
- **A licenza de n8n caduca o 2026-08-15.** As *Variables* son función de licenza; se caduca, `$vars.QCH_KIMI_MODEL` deixaría de resolverse. Por iso o fallback do nodo se deixou en `'kimi-k3'` e non nun valor inválido: aínda que se perdan as variables, o workflow segue funcionando.
- **`kimi-k2.5` non existe e `kimi-k3` pode desaparecer igual.** Moonshot renomea modelos; se volve aparecer un 404, o primeiro que hai que mirar é `GET https://api.moonshot.ai/v1/models` e actualizar a variable `QCH_KIMI_MODEL` (non fai falta tocar o workflow).
- **Editar por SQL require publicar.** Calquera cambio futuro feito directamente na base de datos ten que crear versión nova en `workflow_history` e mover `activeVersionId`; se non, non ten efecto ningún aínda que `workflow_entity` se vexa correcto.
- **`qch_receitas` ten hoxe 16 receitas**, non 14 como di a sección "Estado confirmado" de máis arriba.
- **Versión publicada actual: `b4a72e30-6c19-4d85-9f03-1a8de5c26b47`.** Copia de seguridade do estado **previo** a todos estes cambios: `workflow_history.versionId = 3094f88d-f745-4761-aae4-6bb4c9271712`.
- **Non restaurar `e8d0a5c1`** dende o historial da UI se non se quere `maxTokens = 4000`: é idéntica á activa agás nese valor. Publicáronse ademais dúas versións intermedias durante a investigación (`a1f7c3d2`, con `temperature = 1`, que devolvía `400` en cada petición; e `c2e9b4a6`, sen `executeOnce`, que tardaba 65 s e superaba o timeout de 45 s do cliente); **borráronse as dúas** de `workflow_history` precisamente para que ninguén as restaure por erro. As súas entradas seguen en `workflow_publish_history` como rastro do que pasou.

## O que aínda queda por confirmar

- Compartición: `POST /compartir` + páxina pública `/m/<token>` (`js/publico.js`), aínda non probada de punta a punta.
- Comportamento offline-first en produción: cambiar algo sen conexión, recuperar conexión, e comprobar que `reintentarPendentes()` sincroniza correctamente (`API_CONTRACT.md` §4).
- Comportamento exacto ante un `409` de conflito (segue sen resolver, ver `API_CONTRACT.md` §6).

## Como confirmar o resto

1. Compartir un menú dende a app e abrir a URL pública nunha xanela sen sesión iniciada.
2. Cambiar algo coa conexión desactivada (modo avión / DevTools "Offline"), reactivar a conexión, e comprobar que o cambio chega ao servidor sen ter que recargar.
*(O punto sobre `POST /ia/axuda` que había aquí xa está resolto — ver o apartado "arranxado e verificado en navegador ✅" máis arriba.)*
