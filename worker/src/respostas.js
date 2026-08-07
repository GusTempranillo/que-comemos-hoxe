/* Respostas HTTP e CORS.
   Todo o que sae do Worker pasa por aquí. É a propósito: as cabeceiras de CORS
   constrúense sempre nun `Headers` novo e sempre con `set()`, nunca con
   `append()`, así que non hai forma de duplicar `Access-Control-Allow-Origin`.
   Duplicala invalídaa e o navegador bloquea a resposta — xa foi un fallo real
   neste proxecto (ESTRUTURA.md §9). */

/* Lista de orixes permitidas, tal e como veñen na variable ORIXES_PERMITIDAS
   (separadas por comas). Sen comodíns: a comprobación é de igualdade exacta. */
function orixesPermitidas(env) {
  return String(env.ORIXES_PERMITIDAS || '')
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/* Devolve a orixe da petición só se está permitida; se non, null.
   Non se responde nunca con `*`: as rutas privadas levan credenciais e o
   contido é doméstico. */
export function orixeAceptada(peticion, env) {
  const orixe = peticion.headers.get('Origin');
  if (!orixe) return null;
  return orixesPermitidas(env).includes(orixe.replace(/\/$/, '')) ? orixe : null;
}

function cabeceirasBase(peticion, env) {
  const cabeceiras = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  const orixe = orixeAceptada(peticion, env);
  if (orixe) {
    cabeceiras.set('Access-Control-Allow-Origin', orixe);
    /* A resposta depende da orixe: sen isto, unha caché intermedia podería
       servirlle a un navegador a cabeceira calculada para outro. */
    cabeceiras.set('Vary', 'Origin');
  }
  return cabeceiras;
}

export function json(datos, peticion, env, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: cabeceirasBase(peticion, env)
  });
}

/* Forma de erro que xa espera `js/api.js`: sempre JSON, sempre con estes tres
   campos (ESTRUTURA.md §5.3). O cliente xera pola súa conta `rede` e
   `erro_<status>`, así que aquí nunca se devolve un corpo baleiro. */
export function erro(codigo, mensaxe, peticion, env, estado = 400) {
  return new Response(JSON.stringify({ erro: true, codigo, mensaxe }), {
    status: estado,
    headers: cabeceirasBase(peticion, env)
  });
}

/* Resposta á comprobación previa (preflight) do navegador.
   Se a orixe non está permitida devólvese 403 sen cabeceiras de CORS: o
   navegador bloqueará a chamada real, que é o que se quere. */
export function previa(peticion, env) {
  const orixe = orixeAceptada(peticion, env);
  if (!orixe) return new Response(null, { status: 403 });

  const cabeceiras = new Headers();
  cabeceiras.set('Access-Control-Allow-Origin', orixe);
  cabeceiras.set('Vary', 'Origin');
  cabeceiras.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  cabeceiras.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  cabeceiras.set('Access-Control-Max-Age', '86400');
  return new Response(null, { status: 204, headers: cabeceiras });
}
