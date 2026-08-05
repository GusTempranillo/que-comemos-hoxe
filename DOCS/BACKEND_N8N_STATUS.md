# Backend n8n — estado dende o punto de vista do código

> Este documento afirmaba orixinalmente só o que se podía verificar lendo o código deste repositorio, xa que a sandbox de Claude Code non ten acceso a n8n, Supabase nin infraestrutura fóra do repo. A sección **"Estado confirmado"** de máis abaixo é a excepción: recolle respostas dadas directamente por quen administra esa infraestrutura (Codex, 2026-08-05) e trátase como fonte fiable, non como dedución do código.

## Estado confirmado (Codex, 2026-08-05, actualizado o mesmo día)

- **Os 10 workflows QCH están activos e publicados.** Xa non devolven 404 — a API está en produción.
- `POST /auth/login` cun token válido devolve `{"token":"qch_msgocc3v_0vtzzm2cmhyh","caduca":"2026-08-19T22:44:20.683Z"}` (14 días, coma o previsto).
- `GET /receitas` devolve un array de 14 receitas coa forma `[{ "id": "tortilla", ... }, ...]`, válida segundo `listaValida()` de `js/api.js`.
- **`QCH_HOUSE_TOKEN` xa foi cambiado**: o código de acceso real da casa é `qch-e0d33e6e7850c5565af4400d6add2129` (xa non é `1234`).
- **Atopouse e corrixiuse un fallo real de persistencia**: o `PUT` de `/neveira` (e tamén `/semana` e `/cociñeiros`) devolvía `200 {"gardado":true,...}` pero a lectura seguinte volvía ao valor antigo (proba: gardar `sal: 21`, unha sesión nova lía `sal: 20`, o valor de reserva). Corrixido nos tres workflows por Codex; a comprobación repetida contra a API pública xa pasa: tras gardar, unha sesión nova le o valor novo.
- **Pendente de confirmar visualmente**: unha proba de verdade en navegador (abrir `qch.pages.dev`, iniciar sesión, cambiar a neveira dende a UI, recargar e ver que persiste) aínda non se fixo — tanto a sandbox de Codex coma a de Claude Code teñen bloqueado o acceso de rede a `qch.pages.dev`/`n8n.xosemiguel.eu` (proxy da sandbox, non un problema do servidor). A comprobación feita foi contra a API directamente (login → PUT → nova sesión → GET), non dende o navegador.
- Resposta real actual de `POST /auth/login` (mentres estea inactivo):
  ```json
  {
    "code": 404,
    "message": "The requested webhook \"POST qch/auth/login\" is not registered.",
    "hint": "The workflow must be active for a production URL to run successfully..."
  }
  ```
  Esta forma **non coincide** coa que espera `js/api.js` (`{ erro: true, codigo, mensaxe }`) — non hai un manexador global de erros de infraestrutura en n8n; ese formato correcto só se aplica aos erros de aplicación (ver abaixo), non aos 404 de webhook inactivo.
- Cando se activen, o login devolve correctamente: `{ "token": "qch_<aleatorio>", "caduca": "<ISO-8601 UTC>" }`. A sesión dura **14 días** (`caduca = agora + 14 días`).
- Os erros de aplicación previstos **si** seguen a forma do contrato, p.ex. login inválido:
  ```json
  { "erro": true, "codigo": "token_invalido", "mensaxe": "O token de acceso non é válido" }
  ```
- **O código de acceso da casa efectivo é `1234`** (valor por defecto no workflow, porque non existe a variable de entorno `QCH_HOUSE_TOKEN` en n8n). **Hai que cambialo antes de activar os endpoints en produción.**
- **CORS está ben configurado** no proxy para `https://qch.pages.dev`:
  - `OPTIONS /auth/login` → `204`, métodos `POST, OPTIONS`.
  - `OPTIONS` das rutas privadas → `204`, métodos `GET, POST, PUT, OPTIONS`.
  - Inclúe `Authorization, Content-Type` e a orixe exacta.
- **Supabase existe** e está en uso polos workflows (credencial de Supabase configurada). Táboas reais: `qch_receitas`, `qch_ingredientes`, `qch_persoas`, `qch_estado`, `qch_sesions`, `qch_comparticions`. **`semana`, `neveira` e `cociñeiros` non son táboas separadas**: son claves dentro do JSON de `qch_estado`.
- **Existe un endpoint de IA**: `POST /ia/propoñer-semana`, con Moonshot/Kimi — está inactivo e o frontend aínda non o chama (coherente co que xa dicía `API_CONTRACT.md` §6).
- `https://qch.pages.dev` **si serve** o frontend coa integración da API: `index.html`, `js/api.js` e `js/app.js` coinciden byte a byte coa copia local deste repo; `js/api.js` apunta a `https://n8n.xosemiguel.eu/webhook/qch`.

### Consecuencia práctica

Ata que se activen os 10 workflows QCH en n8n, **calquera intento de login ou sincronización dende a app publicada falla** (404), e a app queda a traballar cos datos locais (`js/datos/` + `localStorage`), tal e como está deseñada para facer cando o backend non responde. Isto xa non é unha suposición: é o comportamento confirmado.

**Pendente antes de activar en produción**: cambiar o código de acceso da casa (hoxe `1234` por defecto) definindo `QCH_HOUSE_TOKEN` en n8n.

---

## O que si está no código (verificable dende este repo)

- `js/api.js` implementa un cliente HTTP completo cara a unha API con forma n8n: login por código de casa, catálogos de só lectura, estado planificable (`semana`/`neveira`/`cociñeiros`) con `PUT` completo, compartición e lectura pública. O contrato exacto que asume está en `API_CONTRACT.md`.
- A URL por defecto que trae o código é `https://n8n.xosemiguel.eu/webhook/qch` (constante en `js/api.js`), pero é editable dende o modal de Configuración (`js/vistas/configuracion.js`) — non está fixada (hardcoded) de forma que non se poida cambiar.
- O fluxo de login (`js/vistas/configuracion.js` + acción `config-iniciar-sesion` en `js/app.js`) pide unha URL e un "token de acceso" nun formulario; ese valor introducido pola persoa **non se garda**, só se envía en `POST /auth/login`. O que si se garda en `localStorage` (clave `qch:api:v1`) é o token de sesión que devolva o servidor e a súa data de caducidade, se o servidor a manda.
- `index.html` e `sw.js` xa cargan e cachean `js/api.js`, `js/vistas/configuracion.js` e `js/publico.js` (`sw.js` subiu de `qch-v1` a `qch-v4`).
- O botón "Compartir" (`js/vistas/hoxe.js`) e a páxina pública en `/m/<token>` (`js/publico.js`) están implementados e chaman a `POST /compartir` / `GET /publico/<token>` respectivamente.
- Os arrays estáticos de `js/datos/` **non se eliminaron**: seguen a ser o punto de partida antes de iniciar sesión e o modo de traballo cando non hai conexión ou aínda non se configurou ningunha URL. Tras un login e `prepararCasa()` correctos, `QCH.RECEITAS`, `QCH.INGREDIENTES` e `QCH.PERSOAS` pásanse a substituír en memoria polos datos remotos (ver `API_CONTRACT.md` §3).

## O que aínda queda por confirmar

- Verificado dende o código (2026-08-05): `js/api.js` (liñas 51-61, función `chamar`) xa tolera o 404 "cru" de n8n sen romper. Como ese corpo non trae `erro: true`, cae na rama `else` e xera `{ codigo: 'erro_404', mensaxe: 'O servidor devolveu un erro inesperado' }`; a promesa rexéitase de forma controlada e a app segue traballando cos datos locais. **Non fai falta ningún cambio de código para esta xanela.**
- Se hai algún plan/data para activar os 10 workflows en produción.
- Comportamento exacto ante un `409` de conflito (segue sen resolver, ver `API_CONTRACT.md` §6).

## Como confirmar o resto

1. Activar os 10 workflows QCH en n8n (toggle no editor) e volver probar as 12 rutas.
2. Cambiar `QCH_HOUSE_TOKEN` antes de activar, para non deixar `1234` en produción.
3. Facer unha proba de punta a punta: abrir `https://qch.pages.dev`, configurar a URL (xa é a que trae por defecto), iniciar sesión co código de casa real, cambiar algo na neveira, recargar e comprobar que persiste.
