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
| `POST /compartir` | Si | `QCH.api.compartir(dia)`, acción `compartir-menu` en `js/app.js` | Petición `{ dia }`; resposta debe traer `{ url }` (o frontend rexeita a promesa se non). |
| `GET /publico/<token>` | Non | `QCH.api.menuPublico(token)`, `js/publico.js` | Resposta debe traer polo menos `{ receita }`; o frontend le tamén `comensaisPrevistos` e `nutricion` se existen. |

**Non implementado no frontend**: non hai `POST /auth/logout` (pechar sesión é só local: borra o token en `localStorage`), nin ningunha chamada relacionada con IA (`/ia/propoñer-semana` ou similar) — se ese endpoint existe en n8n, o frontend aínda non o chama.

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

# 5. Compartición (`compartir-menu` en `js/app.js`, páxina en `js/publico.js`)

- O botón "Compartir" (engadido en `js/vistas/hoxe.js`) esixe sesión iniciada; se non, abre o modal de configuración.
- Chama a `POST /compartir` co día actual e agarda `{ url }`. Se o navegador soporta `navigator.share`, ábrese o selector nativo; se non, ábrese `https://wa.me/?text=...` cunha mensaxe cun enlace.
- `js/publico.js` detecta rutas `/m/<token>` (`QCH.eRutaPublica`), retira a cabeceira e a barra de navegación, e chama a `GET /publico/<token>` sen autenticación. Amosa receita, ingredientes e comensais previstos; se non hai `nutricion` no obxecto devolto, amosa "A información nutricional aínda non está dispoñible" en lugar de romper.
- Se a chamada falla ou a resposta non trae `receita`, amosa unha mensaxe xenérica ("Esta ligazón xa non está dispoñible") — nunca un erro técnico.

---

# 6. Preguntas abertas (sen resolver dende o código)

- Duración e renovación real do token de sesión: o frontend só garda o `caduca` que devolva o servidor; non hai valor asumido no código.
- Comportamento exacto ante un `409` de conflito: hoxe trátase igual que calquera outro erro (queda pendente).
- Se existe ou non un endpoint de IA en n8n: o frontend non o chama, así que este repositorio non pode confirmalo nin negalo.

Todo o relativo a **se o backend real (n8n + Supabase) está activo, publicado ou accesible dende `qch.pages.dev`** é información externa a este repositorio: ver `BACKEND_N8N_STATUS.md`, que a marca explicitamente como non verificada dende aquí.
