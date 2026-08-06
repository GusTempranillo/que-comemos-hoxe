# Contrato da API (frontend ↔ n8n)

> Este documento describe o contrato **tal e como o implementa `js/api.js`** (engadido en `78d6e22 feat: conecta a web coa API de n8n`). Non describe a infraestrutura n8n/Supabase en si — iso está fóra deste repositorio e non se pode verificar dende aquí; ver `BACKEND_N8N_STATUS.md` para o que si se pode afirmar sobre ese lado.
>
> Principio guía (`ARCHITECTURE.md` §Backend, §Seguridade): o frontend nunca fala coa base de datos; todo pasa por n8n vía HTTPS cun token.

---

# 1. Convencións (segundo `js/api.js`)

- **Base URL**: gardada en `localStorage` (clave `qch:api:v1`, campo `baseUrl`), configurable dende o modal de Configuración (`js/vistas/configuracion.js`). Valor por defecto no código: `https://n8n.xosemiguel.eu/webhook/qch` (constante `URL_PREDETERMINADA`).
- **Formato**: JSON en ida e volta. `Content-Type: application/json`.
- **Autenticación**: cabeceira `Authorization: Bearer <token>` en todas as chamadas privadas. As únicas chamadas que `js/api.js` fai sen esa cabeceira son `POST /auth/login` e `GET /publico/<token>`.
- **Erros**: `js/api.js` agarda que o corpo de erro sexa JSON coa forma `{ erro: true, codigo, mensaxe }`; se non pode parsear JSON, xera un erro xenérico `{ codigo: 'erro_' + status, mensaxe: '...' }` no propio frontend. Se falla a rede antes de chegar ao servidor, xera `{ codigo: 'rede', mensaxe: 'Non se puido contactar co servidor' }`.
- **Ids**: os mesmos ids curtos en minúsculas que xa usa o código (`pataca`, `tortilla`, `isabel`...); `js/api.js` valida que cada elemento dos catálogos teña un `id` de tipo `string` antes de aceptalos (`listaValida`).

---

# 2. Endpoints que o frontend chama hoxe

Extraídos directamente de `QCH.api` en `js/api.js`. Esta é a lista completa — non hai ningunha chamada a `fetch()` fóra deste módulo.

| Método e ruta | Bearer | Chamado dende | Corpo / resposta esperados polo frontend |
|---|---:|---|---|
| `POST /auth/login` | Non | `QCH.api.login(token)` | Petición `{ token }`; resposta `{ token, caduca }`. O `token` recibido substitúe o escrito pola persoa; só o de sesión se garda. |
| `GET /receitas` | Si | `QCH.api.receitas()`, `prepararCasa()` | Array coa forma de `QCH.RECEITAS` (validado con `listaValida`). |
| `GET /ingredientes` | Si | `QCH.api.ingredientes()`, `prepararCasa()` | Array coa forma de `QCH.INGREDIENTES`. |
| `GET /persoas` | Si | `QCH.api.persoas()`, `prepararCasa()` | Array coa forma de `QCH.PERSOAS`. |
| `GET /semana` | Si | `QCH.api.obterSemana()`, `prepararCasa()` | Obxecto `{ "dia:xantar": receitaId }`. |
| `PUT /semana` | Si | `QCH.api.gardarSemana()`, `sincronizar('semana', …)` | Substitúe o recurso enteiro. |
| `GET /neveira` | Si | `QCH.api.obterNeveira()`, `prepararCasa()` | Obxecto `{ ingredienteId: cantidade }`. |
| `PUT /neveira` | Si | `QCH.api.gardarNeveira()`, `sincronizar('neveira', …)` | Substitúe o recurso enteiro. |
| `GET /cociñeiros` | Si | `QCH.api.obterCociñeiros()`, `prepararCasa()` | Obxecto `{ "dia:xantar": persoaId }`. |
| `PUT /cociñeiros` | Si | `QCH.api.gardarCociñeiros()`, `sincronizar('cociñeiros', …)` | Substitúe o recurso enteiro. |
| `POST /compartir` | Si | *(sen usar)* | Segue definido no contrato, pero o botón que o chamaba (`compartir-menu`) quitouse da interface — a ligazón que devolvía non funcionaba de forma fiable en produción, ver §5. |
| `GET /publico/<token>` | Non | `QCH.api.menuPublico(token)`, `js/publico.js` | Resposta debe traer polo menos `{ receita }`; o frontend le tamén `comensaisPrevistos` e `nutricion` se existen. Mantense por se hai ligazóns xa creadas antes, pero xa non hai forma na interface de crear ligazóns novas. |
| `POST /ia/axuda` | Si | `QCH.api.axudaIA(accion, receitaId, contexto)`, botón "Axuda da IA" en `js/vistas/detalle.js` | Petición `{ accion, receitaId, contexto }` (`contexto` inclúe polo menos `{ comensais }`); resposta `{ accion, modelo, proposta }`. `accion` é unha de `redactar`, `mellorar`, `nutricion`, `adaptar`, `sobras`, `lista_compra`, `recomendar` — o frontend hoxe só ofrece `mellorar`, `nutricion` e `adaptar` dende a ficha de receita. `proposta` non ten forma fixa: o frontend píntaa xenericamente (texto, listas ou pares clave/valor, todo escapado) sen asumir esquema. |

**Non implementado no frontend**: non hai `POST /auth/logout` (pechar sesión é só local: borra o token en `localStorage`). Das accións de IA definidas no contrato, o frontend só chama a `mellorar`, `nutricion` e `adaptar`; `redactar`, `sobras`, `lista_compra` e `recomendar` non teñen UI aínda.

---

# 3. O que fai `prepararCasa()` (chamado tras un login correcto)

1. Fai en paralelo `GET /receitas`, `/ingredientes`, `/persoas`, `/semana`, `/neveira`, `/cociñeiros`.
2. Se algunha resposta non ten a forma válida, rexeita a promesa enteira con `{ codigo: 'resposta_invalida', ... }` e non aplica nada.
3. Se todas son válidas: substitúe `QCH.RECEITAS`, `QCH.INGREDIENTES`, `QCH.PERSOAS` polos datos remotos, garda unha copia en `localStorage` (`qch:catalogos:v1`), e chama a `QCH.estado.set({ semana, neveira, cociñeiros }, 'remoto')`.
4. Reintenta calquera cambio pendente na cola local (`reintentarPendentes`).

Se `login()` obtén sesión pero `prepararCasa()` falla nese intre, `login()` non propaga o erro: devolve a resposta do login cun campo `aviso`, e a app segue funcionando cos datos locais.

---

# 4. Sincronización offline-first (implementada en `js/api.js` + `js/app.js`)

1. `QCH.estado.subscribe()` en `js/app.js` chama a `QCH.api.sincronizar(motivo, s[motivo])` cada vez que cambia `semana`, `neveira` ou `cociñeiros` — a interface xa pintou antes diso; a chamada á rede non bloquea.
2. `sincronizar()` garda sempre a última versión completa dese recurso en `qch:api:pendentes:v1` antes de intentar a chamada. Se `navigator.onLine === false`, nin sequera o intenta nese momento.
3. Se a chamada falla, o valor volve quedar en `pendentes` e se reintenta na seguinte chamada (a `sincronizar` doutro cambio, ao recuperar conexión, ou en `reintentarPendentes()`).
4. `window.addEventListener('online', …)` en `js/app.js` chama a `reintentarPendentes()` e, só se non queda nada pendente, volve chamar a `prepararCasa()` para traer a versión remota — deliberadamente non sobrescribe cambios locais aínda sen enviar.
5. Non hai lóxica de fusión (`merge`) nin manexo explícito dun `409`: se o servidor devolve un erro, trátase coma calquera outro fallo de rede (queda pendente e reinténtase).

`tema`, `filtros` e `comensais` non pasan por `QCH.api.sincronizar` — seguen sendo só locais, coma antes desta integración.

---

# 5. Compartición: ligazón pública (retirada da interface) e imaxe JPG (`js/compartirImaxe.js`)

- **Ligazón pública**: había un botón "Compartir" en `js/vistas/hoxe.js` que chamaba a `POST /compartir` e agardaba `{ url }`. Quitouse porque a URL que devolvía non funcionaba de forma fiable en produción (nin sequera se puido confirmar se o fallo está en `POST /compartir`, en `GET /publico/<token>`, ou nos dous — non verificable dende este repositorio). `js/publico.js` (a páxina que le `/m/<token>`) e `GET /publico/<token>` en `js/api.js` mantéñense por se hai ligazóns xa creadas antes por outra vía, pero non hai xa ningún camiño na interface para crear unha ligazón nova.
- **Imaxe JPG** (o que a substitúe): botón "Imaxe" en `js/vistas/hoxe.js`, lóxica en `js/compartirImaxe.js` (`QCH.imaxeMenu`). Non chama a ningún endpoint: é un cartel só de texto e emoticonos decorativos debuxado nun `<canvas>` local (sen foto nin ilustración — deseño deliberado, ver máis abaixo). Inclúe nome, subtítulo, tempo/dificultade/vexetariana, as variacións por comensal (`QCH.adaptacionsDe`), comensais, cociñeiro e nutrición (`QCH.nutricionReceita`, ver §7). A altura do lenzo calcúlase nunha primeira pasada de só medida antes de pintar, para axustarse ao contido real. Ofrece descarga directa e, se o navegador soporta Web Share API con ficheiros, compartir nativo coma foto.

---

# 7. Nutrición: calculada en local, non pola IA (`QCH.nutricionReceita` en `js/utilidades.js`)

- Cada ingrediente en `QCH.INGREDIENTES` (`js/datos/ingredientes.js`) leva valores nutricionais estándar por 100 g/ml (`kcal100`, `prot100`, `carb100`, `grax100`, `fibra100`) e, cando a súa unidade non é xa `g` nin `ml` (ex. "1 ud" de cebola), un peso medio (`gramosUd`) para poder convertelo a gramos.
- `QCH.nutricionReceita(receita)` suma a achega de cada ingrediente da receita (xa escalada a gramos) e divide entre `receita.racions` para dar un valor "por ración". Non depende de `POST /ia/axuda` nin de n8n — funciona sen conexión e para calquera receita con ingredientes coñecidos.
- Isto substitúe a acción `nutricion` de `POST /ia/axuda` (contrato §2): xa non está en `OPCIONS_IA` (`js/vistas/detalle.js`) — a ficha da receita amosa a nutrición sempre, sen pedila. O contrato de `POST /ia/axuda` segue definindo `nutricion` coma acción válida por se algún día fai falta recalculala doutro xeito, pero o frontend hoxe só chama a `mellorar` e `adaptar`.
- **Limitación coñecida e deliberadamente non corrixida**: é unha suma simple de ingredientes, non un cálculo real de consumo. En pratos fritos (ex. "Croquetas de cocido") sobreestima moito as calorías e as graxas, porque conta todo o aceite que leva a receita coma se se comese enteiro, cando en realidade só se absorbe unha parte pequena ao fritir. A ficha da receita e a imaxe do menú avisan diso ("Estimación aproximada…") en vez de fixar un factor de corrección inventado.

---

# 8. Preguntas abertas (sen resolver dende o código)

- Comportamento exacto ante un `409` de conflito: hoxe trátase igual que calquera outro erro (queda pendente).

Confirmado directamente por quen administra n8n (ver `BACKEND_N8N_STATUS.md`, "Estado confirmado"): a sesión dura 14 días; existe `POST /ia/propoñer-semana` (Moonshot/Kimi) pero está inactivo e o frontend aínda non o chama.

`POST /ia/axuda` é un endpoint distinto, indicado como xa existente e activo ao encargar esta integración — o frontend (`QCH.api.axudaIA`) chámao coa forma descrita en §2, pero, coma o resto deste documento, isto describe só o que asume o código cliente: dende este repositorio non se pode confirmar de forma independente que a resposta real do servidor cumpra ese contrato en produción.

**Confirmado en produción real (navegador do usuario, non dende este repositorio)**: a petición sae correctamente formada (corpo, cabeceira `Authorization`, ruta), pero o servidor non devolve resposta ningunha — nin éxito nin erro — e a chamada queda indefinidamente pendente na pestana de Rede do navegador. Por iso `QCH.api.axudaIA()` chama a `chamar()` cun `esperaMs` de 45000: sen ese límite, o botón "Axuda da IA" quedaba xirando para sempre. Isto apunta a un problema no workflow de n8n (posiblemente sen nodo de resposta, ou atascado agardando pola chamada ao modelo Kimi/Moonshot), non no frontend — pero iso xa é infraestrutura fóra deste repositorio, ver `BACKEND_N8N_STATUS.md`.

Todo o relativo a **se o backend real (n8n + Supabase) está activo, publicado ou accesible dende `qch.pages.dev`** documéntase en `BACKEND_N8N_STATUS.md` — a día de hoxe os workflows QCH están **inactivos** e as 12 rutas devolven 404, aínda que o resto da infraestrutura (n8n, Supabase, CORS, despregue en Pages) está correctamente configurada.
