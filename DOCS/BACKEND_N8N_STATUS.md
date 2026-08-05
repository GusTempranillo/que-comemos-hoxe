# Backend n8n — estado dende o punto de vista do código

> Este documento só afirma o que se pode verificar lendo o código deste repositorio (commit `78d6e22 feat: conecta a web coa API de n8n` e posteriores). **Non ten acceso a n8n, a Supabase, nin a ningunha infraestrutura fóra deste repo** — calquera dato sobre se o backend real está activo, publicado, ou configurado correctamente (CORS, workflows activados, variables de n8n, esquema de Supabase) ten que confirmalo directamente quen administra esa infraestrutura. Non asumas nada disto por estar escrito aquí nin en ningún outro sitio deste repo.

## O que si está no código (verificable)

- `js/api.js` implementa un cliente HTTP completo cara a unha API con forma n8n: login por código de casa, catálogos de só lectura, estado planificable (`semana`/`neveira`/`cociñeiros`) con `PUT` completo, compartición e lectura pública. O contrato exacto que asume está en `API_CONTRACT.md`.
- A URL por defecto que trae o código é `https://n8n.xosemiguel.eu/webhook/qch` (constante en `js/api.js`), pero é editable dende o modal de Configuración (`js/vistas/configuracion.js`) — non está fixada (hardcoded) de forma que non se poida cambiar.
- O fluxo de login (`js/vistas/configuracion.js` + acción `config-iniciar-sesion` en `js/app.js`) pide unha URL e un "token de acceso" nun formulario; ese valor introducido pola persoa **non se garda**, só se envía en `POST /auth/login`. O que si se garda en `localStorage` (clave `qch:api:v1`) é o token de sesión que devolva o servidor e a súa data de caducidade, se o servidor a manda.
- `index.html` e `sw.js` xa cargan e cachean `js/api.js`, `js/vistas/configuracion.js` e `js/publico.js` (`sw.js` subiu de `qch-v1` a `qch-v4`).
- O botón "Compartir" (`js/vistas/hoxe.js`) e a páxina pública en `/m/<token>` (`js/publico.js`) están implementados e chaman a `POST /compartir` / `GET /publico/<token>` respectivamente.
- Os arrays estáticos de `js/datos/` **non se eliminaron**: seguen a ser o punto de partida antes de iniciar sesión e o modo de traballo cando non hai conexión ou aínda non se configurou ningunha URL. Tras un login e `prepararCasa()` correctos, `QCH.RECEITAS`, `QCH.INGREDIENTES` e `QCH.PERSOAS` pásanse a substituír en memoria polos datos remotos (ver `API_CONTRACT.md` §3).

## O que o código NON permite afirmar

- **Se hai algunha instancia de n8n respondendo de verdade en `https://n8n.xosemiguel.eu/webhook/qch`.** O código só define ese valor coma URL por defecto; non hai forma de comprobar dende este repositorio se ese servidor existe, está activo, ou ten os workflows correspondentes creados.
- **Se CORS está configurado** para permitir que `qch.pages.dev` (ou calquera outra orixe) chame a ese servidor. Sen iso, as chamadas fallarían dende un navegador aínda que o servidor estea a funcionar.
- **Cal é o código de acceso real da casa**, cantos días dura unha sesión, ou calquera outro parámetro operativo do lado do servidor. O frontend non define nin asume ningún destes valores — simplemente envía o que escriba a persoa e garda o que devolva o servidor.
- **Se existe Supabase, que esquema ten, ou que táboas usa.** Nada diso é visible dende `js/`.
- **Se hai algún workflow de intelixencia artificial (Kimi ou outro) dispoñible.** Como se indica en `API_CONTRACT.md` §2, o frontend non chama a ningún endpoint de IA; se existe no backend, aínda non está conectado aquí.
- **Se a versión publicada en `https://qch.pages.dev` xa inclúe este commit.** Iso depende do despregamento en Cloudflare Pages, que é un proceso externo a este repositorio.

## Como confirmar o resto

Estes puntos requiren acceso directo á infraestrutura (VPS de n8n, panel de Supabase, panel de Cloudflare Pages) e non se poden validar dende Claude Code neste repositorio:

1. Comprobar que a instancia de n8n responde en `https://n8n.xosemiguel.eu/webhook/qch/auth/login` (por exemplo, cunha chamada de proba fóra do navegador, xa que dende o navegador faría falta CORS).
2. Comprobar a configuración de CORS no servidor n8n/Nginx.
3. Comprobar que os workflows correspondentes están activos en n8n.
4. Comprobar que `https://qch.pages.dev` serve realmente os ficheiros deste commit (`js/api.js` incluído).
5. Facer unha proba de punta a punta: abrir a app publicada, configurar a URL, iniciar sesión, cambiar algo na neveira, recargar e comprobar que persiste.

Ata que alguén con acceso a eses sistemas confirme estes puntos, trátaos como pendentes — non como feitos.
