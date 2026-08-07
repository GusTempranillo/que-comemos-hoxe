# ESTRUTURA.md
**Mapa técnico de Que comemos hoxe**

Este documento describe **como** está feita a aplicación e cara a onde vai a infraestrutura. Complementa `VISION.md`, que describe o **porqué**.

Dúas advertencias antes de nada:

- **O código manda.** Se algo aquí contradí o que fai o código, o código ten razón e este documento está desactualizado. Actualízase no mesmo cambio que toque infraestrutura.
- **Distingue o que hai do que se planea.** A §2 marca claramente que parte está construída e que parte é destino. Non asumas que algo funciona só porque aparece descrito aquí.

---

## 1. Mapa xeral (destino)

```
                        ┌──────────────────────────┐
                        │  Cloudflare Pages         │
                        │  qch.pages.dev            │
                        │                           │
                        │  Frontend estático.       │
                        │  Sen paso de build.       │
                        │  Redesprega en cada push. │
                        └─────────────┬─────────────┘
                                      │
                                      │  HTTPS
                                      │  Authorization: Bearer <token>
                                      ▼
                        ┌──────────────────────────┐
                        │  Cloudflare Worker        │
                        │  api.qch.workers.dev      │
                        │                           │
                        │  Único backend.           │
                        │  Auth · catálogos · sync  │
                        │  · fotos · IA  (ver §5)   │
                        └──┬────────────┬───────┬───┘
                           │            │       │
        service_role key   │            │       │  binding R2
        (nunca no cliente) │            │       │  (sen claves)
                           ▼            │       ▼
          ┌────────────────────────┐    │   ┌──────────────────────┐
          │  Supabase Cloud         │    │   │  Cloudflare R2        │
          │  PostgreSQL             │    │   │  Fotos das receitas   │
          │  Táboas: ver §6         │    │   │  principal · galería  │
          └────────────────────────┘    │   │  · proceso            │
                                         │   └──────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  API de IA            │
                              │  Kimi / Moonshot      │
                              │  (compatible OpenAI)  │
                              └──────────────────────┘

          ┌───────────────────────────────────────────────────┐
          │  GitHub — repositorio único, fonte de verdade      │
          │                                                    │
          │  Actions:  · despregue do Worker (wrangler)        │
          │            · ping diario a Supabase (anti-pause)   │
          └───────────────────────────────────────────────────┘
```

Non hai ningún servidor propio. Todas as pezas teñen plan gratuíto dabondo para o volume dunha soa familia (ver §11).

---

## 2. Estado actual fronte a destino

| Peza | Hoxe | Destino |
|---|---|---|
| Frontend | Construído e funcionando (Cloudflare Pages) | Igual, cambiando só a URL do backend |
| Compartir menú | Imaxe JPG local, funcionando | Igual, sen cambios |
| Nutrición | Calculada en local, funcionando | Igual, sen cambios |
| Auth, catálogos, sync | Apuntan a n8n nun VPS — workflows inactivos, 12 rutas devolven 404 | Worker de Cloudflare |
| IA (`/ia/axuda`) | n8n non responde nunca (petición queda pendente) | Worker de Cloudflare, con memoria de conversa |
| Base de datos | Supabase autoaloxado no VPS | Supabase Cloud (plan gratuíto) |
| Fotos | Non implementadas | Cloudflare R2 |
| Diario de cociñado | Só en `localStorage`, **nunca sincronizado** | Sincronizado (ver §7 e o aviso de abaixo) |
| `servidor-ia/` | Servidor Node/Express para VPS (PR #12) | **Queda obsoleto** — substitúeo o Worker |
| `js/publico.js` | Páxina pública `/m/<token>`, xa sen forma de crear ligazóns | **Elimínase** (ver §12) |

> **O risco máis serio hoxe**: o diario de cociñado (`estado.diario`) é a "memoria culinaria" que `VISION.md` pon no centro do proxecto, e vive só no `localStorage` do dispositivo. Bórrase a caché do navegador ou cámbiase de móbil, e pérdese. Sincronizalo é a prioridade número un en canto haxa backend.

Non hai datos que migrar: todo o contido actual é de demostración e pártese de cero.

---

## 3. Estrutura do repositorio

```
que-comemos-hoxe/
├── index.html              Único HTML. Carga os scripts en orde fixa (§4.1)
│                            e configura Tailwind en liña.
├── sw.js                   Service worker. Lista ARMAZON = ficheiros cacheados.
├── manifest.json           PWA.
├── css/estilos.css
├── iconos/
├── vendor/                 Terceiros vendorizados a propósito (sen CDN, sen npm).
│   ├── tailwind-browser.js
│   └── gsap.min.js
├── js/
│   ├── datos/              Datos estáticos: arranque e reserva sen conexión.
│   │   ├── ingredientes.js
│   │   ├── receitas.js
│   │   └── familia.js
│   ├── utilidades.js       DOM, iconas SVG, arte xerada, formato, nutrición.
│   ├── estado.js           A única tenda de estado.
│   ├── api.js              O único ficheiro que chama a fetch().
│   ├── xerador.js          Xerador de menú semanal (puntuación explícita).
│   ├── vistas/
│   │   ├── comuns.js       Fragmentos de UI reutilizados.
│   │   ├── hoxe.js  semana.js  receitario.js  neveira.js  familia.js
│   │   ├── detalle.js      Ficha de receita + QCH.modal.
│   │   ├── cociñar.js      Modo cociñar.
│   │   └── configuracion.js  Modal de sesión (URL base + token).
│   ├── publico.js          Páxina pública /m/<token>. A eliminar (§12).
│   ├── compartirImaxe.js   Imaxe JPG do menú, 100 % local.
│   └── app.js              Armazón: navegación, renderizado, eventos, sync.
├── worker/                 Backend en Cloudflare Workers. Sen dependencias.
│   ├── wrangler.toml       Configuración e nomes dos segredos (§9).
│   └── src/                index (rutas) · respostas (CORS/erros) · supabase
│                            · sesions · catalogos · estado
├── supabase/
│   └── esquema.sql         O esquema (§6), listo para aplicar a man.
├── servidor-ia/            Obsoleto tras adoptar o Worker (§2).
└── DOCS/
```

---

## 4. Frontend

Sen frameworks, sen paso de build, sen empaquetador. Ábrese e funciona — incluso por `file://`, agás o service worker.

### 4.1 Espazo de nomes e orde de carga

Todo colga dun único global, `window.QCH`, que cada script vai enchendo. Cárganse como `<script>` clásicos (non módulos ES) nunha **orde fixa e deliberada**:

```
datos/ingredientes → datos/receitas → datos/familia → utilidades → estado
→ api → xerador → vistas/comuns → vistas (hoxe, semana, receitario, neveira,
familia, detalle, cociñar, configuracion) → publico → compartirImaxe → app
```

> **Regra**: engadir un ficheiro a `js/` obriga a engadir tamén (a) a súa etiqueta `<script>` en `index.html`, na posición correcta, e (b) a súa entrada na lista `ARMAZON` de `sw.js`. Esquecer o segundo rompe a app sen conexión de forma silenciosa.

### 4.2 Estado

`QCH.estado` (en `js/estado.js`) é a **única** tenda. Non hai estado por compoñente.

| Clave | Contido | Sincronízase? |
|---|---|---|
| `vista` | Pantalla activa | Non (local) |
| `tema` | Claro/escuro | Non (local) |
| `comensais` | Quen come hoxe | Non (local) |
| `filtros` | Filtros do receitario | Non (local) |
| `semana` | `"dia:xantar" → receitaId` | **Si** |
| `neveira` | `ingredienteId → cantidade` | **Si** |
| `cociñeiros` | `"dia:xantar" → persoaId` | **Si** |
| `diario` | Eventos de cociñado por receita | **Debería** (hoxe non — ver §2) |

Lectura con `QCH.estado.get()`; escritura só con `QCH.estado.set(patch, motivo)` ou `QCH.estado.update(fn, motivo)`. Nunca mutar o obxecto devolto por `get()` fóra dun `update()`.

Cada escritura persiste en `localStorage` e avisa aos subscritores. `js/app.js` é o único subscritor: en cada cambio volve pintar a vista activa enteira (`app.innerHTML = vista.render()`) e despois restaura o desprazamento e o foco (identificado con atributos `data-foco`), para que repintar todo o DOM non se note.

Os eventos do diario **nunca se editan nin se borran**: só se engaden. É unha decisión de produto, non un detalle de implementación (`VISION.md` § Receitario vivo).

### 4.3 Eventos

Non hai escoitadores por elemento. `js/app.js` instala un único `click`/`keydown`/`input` en `document` que despacha segundo o atributo `data-accion`, lendo os demais `data-*` do mesmo elemento como parámetros (`data-id`, `data-dia`, `data-comida`…).

Para engadir unha acción: `data-accion="nome"` no elemento, e unha entrada `nome: (el, ev) => {…}` no obxecto `accions` de `app.js`.

### 4.4 Vistas e modais

Cada vista é un IIFE asignado a `QCH.vistas.<id>` que expón polo menos `render()`, devolvendo unha cadea de HTML construída por concatenación (sen motor de plantillas, sen JSX) con clases de Tailwind. O array `NAV` de `app.js` asocia a navegación cos ids de vista.

`QCH.modal` (en `js/vistas/detalle.js`) é un controlador xenérico único: `abrir(html)` / `pechar()` / `envoltorio(interior, ancho)`. As vistas constrúen o HTML interior e pásanllo.

### 4.5 Regras do dominio que non se poden romper

- **Un só xantar ao día.** `QCH.COMIDAS` ten unha soa entrada, pero o código percorre o array en vez de fixar `"xantar"`: xeneralizouse a propósito.
- **As receitas son para 4 racións** (`racions: 4`); `QCH.cantidadeReal()` escala ao número real de comensais.
- **As adaptacións son por persoa E por receita**, con tres niveis: `sen` (quitar un ingrediente), `substituir` (cambialo) e `prato` (cociñar outra cousa ese día). Non colapsar isto nunha preferencia global por persoa — é o diferenciador do produto.
- **O xerador non é IA.** `QCH.xerador` puntúa cada oco cunha función explícita e auditable (cobertura da neveira, encaixe co día, variedade fronte aos días veciños, custo das adaptacións, máis algo de azar) e devolve `motivos` lexibles para que a familia entenda por que se propuxo un prato.
- **A nutrición calcúlase en local** (`QCH.nutricionReceita`), sumando os ingredientes escalados a gramos e dividindo entre `racions`. Funciona sen conexión. Limitación coñecida e asumida: en pratos fritidos sobreestima, porque conta todo o aceite como consumido. Amósase como estimación aproximada en vez de aplicar un factor de corrección inventado.
- **A arte das receitas** (`QCH.arte`) é SVG xerado a partir do id (determinista), usado como reserva detrás de calquera foto real.

---

## 5. Backend: un único Cloudflare Worker

Un só Worker cobre auth, catálogos, sincronización, fotos e IA. Razón: a lóxica real é pouca (validar un token, ler/escribir Supabase, chamar a un modelo), e un só sitio onde despregar, rotar segredos e mirar rexistros. Se algunha ruta medra moito, sepárase **nese momento**, non antes.

### 5.1 Rutas

| Método e ruta | Bearer | Corpo / resposta |
|---|---:|---|
| `POST /auth/login` | Non | `{ token }` → `{ token, caduca }` |
| `GET /receitas` | Si | Catálogo de receitas |
| `GET /ingredientes` | Si | Catálogo de ingredientes |
| `GET /persoas` | Si | Catálogo de persoas |
| `GET` `PUT /semana` | Si | `{ "dia:xantar": receitaId }` |
| `GET` `PUT /neveira` | Si | `{ ingredienteId: cantidade }` |
| `GET` `PUT /cociñeiros` | Si | `{ "dia:xantar": persoaId }` |
| `GET` `PUT /diario` | Si | Eventos de cociñado (ver §7) |
| `POST` `PUT /receitas/:id` | Si | Crear ou versionar unha receita |
| `POST /receitas/:id/fotos` | Si | Sobe unha foto a R2, devolve a URL |
| `POST /ia/axuda` | Si | `{ accion, receitaId?, conversaId?, mensaxe, contexto }` → `{ accion, modelo, conversaId, proposta }` (§8) |
| `GET /saude` | Non | Comprobación de vida |

Todo `PUT` **substitúe o recurso enteiro**; non hai actualizacións parciais.

Non hai rutas de compartición pública: a compartición diaria é a imaxe JPG xerada no dispositivo, sen backend.

### 5.2 Autenticación

Un **único token de casa**, non contas individuais: `VISION.md` define un só perfil ("cociñeiros"), así que non ten sentido a complexidade de Supabase Auth por persoa.

`POST /auth/login` recibe o token compartido, e se é correcto crea unha sesión en `qch_sesions` cun token de sesión novo e a súa caducidade. As demais rutas privadas validan ese token de sesión na cabeceira `Authorization`.

### 5.3 Formato de erro

Erros sempre en JSON, coa forma que o frontend xa espera:

```json
{ "erro": true, "codigo": "token_caducado", "mensaxe": "A sesión caducou" }
```

O cliente xa xera pola súa conta `{ codigo: "rede" }` cando nin sequera chega ao servidor, e `{ codigo: "erro_<status>" }` cando a resposta non é JSON parseable.

### 5.4 Nota sobre os límites do Worker

O plan gratuíto limita **tempo de CPU** (10 ms por petición), non tempo de espera. Agardar por unha resposta lenta da IA non consome CPU, así que as chamadas a Kimi caben sen problema no plan gratuíto — que era precisamente onde n8n fallaba.

---

## 6. Esquema de Supabase

Pártese de cero cun esquema deliberadamente simple: `id` + `jsonb`. As receitas son documentos con forma irregular (ingredientes, pasos, versións, adaptacións) e normalizalas agora sería complexidade sen necesidade real.

O esquema completo vive en **`supabase/esquema.sql`**, listo para pegar no SQL Editor dun proxecto novo. Non se duplica aquí para que non poidan contradicirse: ese ficheiro é a versión que manda.

Táboas: `qch_receitas`, `qch_ingredientes`, `qch_persoas` (catálogos), `qch_estado` (unha fila por recurso sincronizado), `qch_diario` (un evento por fila), `qch_sesions` e `qch_conversas`.

**O diario é a excepción ao patrón `qch_estado`**: é un rexistro que só medra e que nunca se sobrescribe, así que ten táboa propia con unha fila por evento, non un `jsonb` que se substitúe enteiro. Perder unha entrada por escritura concorrente sería perder memoria familiar.

**Fotos**: gardadas en R2, non en Supabase. `qch_receitas.data` garda só as URLs.

**RLS**: como o acceso se valida no Worker cun token de casa (non hai usuarios de Supabase Auth), non hai políticas por usuario que escribir. Pero non chega con non escribilas: as táboas do esquema `public` quedan expostas por PostgREST á *anon key*, que é pública por deseño. Por iso o esquema activa RLS en todas as táboas **sen crear ningunha política**: así ningún rol normal ve unha soa fila, mentres que a `service_role key` —que nunca sae do Worker— salta RLS por definición. Iso é o que fai certo que **o Worker sexa o único camiño** aos datos. Se algún día o frontend falase directo con Supabase, habería que deseñar políticas antes.

---

## 7. Sincronización sen conexión

O dispositivo nunca agarda pola rede. O contrato é:

1. A escritura local pinta a interface **de inmediato** e persiste en `localStorage`.
2. Só despois, `js/app.js` dispara `QCH.api.sincronizar(motivo, …)` en segundo plano.
3. `sincronizar()` garda sempre a última versión completa dese recurso nunha cola de pendentes antes de intentar a chamada. Se non hai conexión, nin o intenta.
4. Se falla, queda pendente e reinténtase: no seguinte cambio, ao recuperar conexión (evento `online`), ou nun reintento explícito.
5. Ao recuperar conexión reenvíanse primeiro os pendentes; **só se non queda nada pendente** se descarga a versión remota. Nunca se sobrescriben cambios locais sen enviar.

Non hai fusión de cambios nin manexo de conflitos: gaña a última escritura. Para unha soa familia é aceptable; se algún día molesta, o sinal será ver cambios pisados entre dous móbiles á vez.

**O diario precisa outro trato**: como só engade eventos, sincronízase enviando os eventos novos (identificados polo seu `id`, xerado no cliente), non substituíndo o recurso enteiro. Así dous dispositivos que cociñaron cousas distintas sen conexión non se borran mutuamente o historial.

Claves de `localStorage`: estado da app, configuración da API (URL base + token), copia dos catálogos descargados e cola de pendentes.

---

## 8. Memoria das conversas coa IA

Un modelo non lembra nada entre chamadas. A memoria constrúea o Worker:

1. Recibe `conversaId` (ou crea unha conversa nova se non chega).
2. Le `mensaxes` de `qch_conversas`.
3. Engade a mensaxe nova da persoa usuaria.
4. Manda o historial ao modelo, recortado se supera un límite razoable de contexto (descartando as máis antigas, ou resumíndoas se algún día compensa).
5. Garda a resposta no historial e devólvea xunto co `conversaId`.

É exactamente o que faría un nodo de memoria de n8n, só que en código explícito e auditable.

Accións previstas: `redactar`, `mellorar`, `adaptar`, `sobras`, `lista_compra`, `recomendar`, e `nutricion` só para **afinar** a estimación local segundo o método de cociñado (§4.5). A `proposta` non ten forma fixa: o frontend píntaa xenericamente (texto, listas ou pares clave/valor, todo escapado) sen asumir esquema.

---

## 9. Segredos e seguridade

Como *secrets* de Cloudflare Worker (`wrangler secret put`), nunca en código nin en ficheiros subidos ao repositorio:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
- `TOKEN_CASA` — o token compartido que valida `POST /auth/login`

R2 **non precisa claves**: móntase como *binding* en `wrangler.toml` e accédese dende o código do Worker. Unha peza menos que rotar.

Outras regras:

- CORS restrinxido á orixe exacta de Cloudflare Pages. Coidado con **non duplicar a cabeceira** (`Access-Control-Allow-Origin` dúas veces invalídaa; xa foi un fallo real neste proxecto).
- O navegador nunca ve a `service_role key`, a clave da IA nin nada de R2.
- O `TOKEN_CASA` protexe datos familiares, non bancarios, pero unha rotación implica volver iniciar sesión en todos os dispositivos: escóllase un token longo e xerado ao azar.

---

## 10. Despregamento

| Que | Como | Cando |
|---|---|---|
| Frontend | Integración nativa de Cloudflare Pages con GitHub | En cada push (as ramas obteñen unha vista previa propia) |
| Worker | GitHub Action con `wrangler deploy` | En cada push que toque `worker/` |
| Esquema | SQL versionado no repositorio, aplicado a man | Cando cambia |
| Anti-pause | GitHub Action `cron: '0 6 * * *'`, unha lectura mínima a Supabase | A diario |

Dúas trampas coñecidas do anti-pause:

- Supabase pausa o proxecto tras **7 días** sen actividade. Un ping diario deixa marxe de sobra; intervalos de varios días con `*/N` no día do mes son innecesariamente axustados porque `*/N` reiníciase a fin de mes.
- **GitHub desactiva os workflows programados tras 60 días sen actividade no repositorio.** Nun proxecto familiar que pasa meses quedo é un escenario real, e o fallo é silencioso: o cron para, e despois Supabase pásuase. Se o repositorio queda inactivo moito tempo, convén comprobar que o workflow segue activo.

---

## 11. Custo agardado

Volume dunha soa familia: poucos MB de datos e uso diario lixeiro.

| Servizo | Plan | Límite relevante | Marxe |
|---|---|---|---|
| Cloudflare Pages | Gratuíto | 500 compilacións/mes; peticións e ancho de banda sen límite | Ampla |
| Cloudflare Workers | Gratuíto | 100 000 peticións/día; 10 ms de CPU por petición | Ampla |
| Cloudflare R2 | Gratuíto | 10 GB gardados, sen custo de saída | Ampla, agás miles de fotos en alta resolución |
| Supabase | Gratuíto | 500 MB de BD, 5 GB de tráfico/mes, pausa aos 7 días | Ampla en tamaño; a pausa mitígase co cron (§10) |
| API de IA | Uso | Segundo consumo | Único custo real, pequeno e a demanda |

Custo de infraestrutura agardado: **0 €/mes**, máis o que se gaste en IA.

---

## 12. Fóra de alcance (por agora)

- **Compartición pública por URL.** Substituída pola imaxe JPG local. Ao adoptar o Worker, `js/publico.js` queda sen uso e debe eliminarse: hai que quitalo tamén de `index.html` e de `ARMAZON` en `sw.js`.
- **`servidor-ia/`.** Superado polo Worker; elimínase para non manter dous backends de IA.
- **Contas individuais por persoa.** Un só token de casa (§5.2).
- **Varios Workers.** Só se algunha ruta medra moito.
- **Fusión de cambios concorrentes.** Gaña a última escritura (§7).

---

## 13. Como chegar aquí

Orde suxerida, cada paso verificable por si mesmo:

1. Crear o proxecto de Supabase Cloud e aplicar o esquema da §6.
2. Crear o Worker coas rutas de auth e catálogos; probar contra el dende a app.
3. Engadir `semana`, `neveira` e `cociñeiros`; comprobar a sincronización sen conexión.
4. **Engadir `diario` e sincronizalo** — pecha o risco de perda de memoria culinaria da §2.
5. Migrar a IA ao Worker con memoria de conversa; eliminar `servidor-ia/`.
6. Engadir fotos con R2.
7. Eliminar `js/publico.js` e limpar `index.html` e `sw.js`.
8. Configurar as Actions de despregue e anti-pause.
9. Dar de baixa o VPS cando nada dependa xa del.
