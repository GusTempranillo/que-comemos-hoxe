# worker/ — o backend de Que comemos hoxe

Un único Cloudflare Worker. Sen dependencias: só `fetch` e as APIs web que xa
trae o runtime, así que non hai `package.json`, nin `node_modules`, nin
ficheiro de bloqueo que manter.

O deseño e o porqué están en `DOCS/ESTRUTURA.md` §5. Aquí só está o que fai
falta para poñelo a andar.

## Que hai implementado

Pasos 2 e 3 do plan da `ESTRUTURA.md` §13:

| Método e ruta | Sesión | Resposta |
|---|---:|---|
| `GET /saude` | Non | `{ ok, servizo, hora, configurado }` |
| `POST /auth/login` | Non | `{ token, caduca }` |
| `GET /receitas` | Si | Array de receitas |
| `GET /ingredientes` | Si | Array de ingredientes |
| `GET /persoas` | Si | Array de persoas |
| `GET` `PUT /semana` | Si | `{ "dia:xantar": receitaId }` |
| `GET` `PUT /neveira` | Si | `{ ingredienteId: cantidade }` |
| `GET` `PUT /cociñeiros` | Si | `{ "dia:xantar": persoaId }` |

Todo `PUT` substitúe o recurso enteiro. Un recurso que aínda non se gardou
devolve `{}`, non un 404.

Aínda **sen implementar** (pasos 4 en diante): `/diario`, `POST`/`PUT
/receitas/:id`, `/receitas/:id/fotos` e `/ia/axuda`.

## Posta en marcha

**1. Supabase.** Crea o proxecto e aplica `supabase/esquema.sql` no SQL Editor.
Apunta a URL do proxecto e a `service_role key` (Settings → API).

**2. Segredos.** Desde `worker/`:

```bash
npx wrangler@4 login
npx wrangler@4 secret put SUPABASE_URL
npx wrangler@4 secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler@4 secret put TOKEN_CASA
```

O `TOKEN_CASA` é o que se escribe unha vez en cada móbil. Xérao ao azar e
longo, por exemplo `openssl rand -hex 32`. Non protexe datos bancarios, pero
rotalo obriga a volver iniciar sesión en todos os dispositivos.

**3. Orixes.** En `wrangler.toml`, `ORIXES_PERMITIDAS` ten que levar a orixe
exacta de Cloudflare Pages. Compróbase por igualdade, sen comodíns: se
despregas unha rama e queres probar contra a súa vista previa, engade tamén
esa URL.

**4. Despregue.**

```bash
npx wrangler@4 deploy
```

**5. Comproba.** `GET /saude` di se falta algo por configurar, sen ensinar
ningún valor:

```bash
curl https://qch-api.<a-túa-conta>.workers.dev/saude
```

**6. Apunta a app ao Worker.** No modal de Configuración da app, pon a URL do
Worker como URL base e o `TOKEN_CASA` como token.

## Probar en local

```bash
cp .dev.vars.exemplo .dev.vars   # e enche os valores
npx wrangler@4 dev
```

`wrangler dev` fala co Supabase real: non hai base de datos de proba, así que
o que escribas queda escrito.

## Notas

- **A base de datos empeza baleira.** Ata que haxa filas en `qch_receitas`,
  `qch_ingredientes` e `qch_persoas`, os catálogos devolven `[]` e a app,
  despois de iniciar sesión, substituirá os datos de demostración de
  `js/datos/` por listas baleiras. Non é un fallo do Worker.
- **CORS.** Todas as respostas se constrúen nun sitio só
  (`src/respostas.js`) e sempre con `set()`, para que
  `Access-Control-Allow-Origin` non se poida duplicar: duplicala invalídaa e o
  navegador bloquea a resposta. Xa foi un fallo real neste proxecto.
- **`POST /auth/login` non ten límite de intentos.** Cun token longo e
  aleatorio adiviñalo por forza bruta non é realista, pero se algún día
  molesta, o sitio de arranxalo é un *rate limiting binding* de Cloudflare.
- **Tempo de CPU, non de espera.** O plan gratuíto limita 10 ms de CPU por
  petición; agardar por Supabase ou pola IA non consome CPU. Era precisamente
  aí onde fallaba n8n.
