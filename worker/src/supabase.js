/* Acceso a Supabase pola súa API REST (PostgREST).
   Sen a biblioteca oficial a propósito: o que se precisa é `fetch` con dúas
   cabeceiras, e así `worker/` non ten dependencias, nin node_modules, nin
   ficheiro de bloqueo que manter.

   A `service_role key` salta RLS e nunca sae de aquí. Ningunha función deste
   ficheiro devolve algo que a poida conter. */

export class ErroSupabase extends Error {
  constructor(mensaxe, estado, detalle) {
    super(mensaxe);
    this.estado = estado;
    this.detalle = detalle;
  }
}

function comprobarConfiguracion(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ErroSupabase('Faltan os segredos de Supabase no Worker', 0, 'sen_configurar');
  }
}

async function chamar(env, ruta, opcions = {}) {
  comprobarConfiguracion(env);
  const url = String(env.SUPABASE_URL).replace(/\/$/, '') + '/rest/v1' + ruta;
  const cabeceiras = new Headers(opcions.headers || {});
  cabeceiras.set('apikey', env.SUPABASE_SERVICE_ROLE_KEY);
  cabeceiras.set('Authorization', 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY);
  if (opcions.body !== undefined) cabeceiras.set('Content-Type', 'application/json');

  let resposta;
  try {
    resposta = await fetch(url, { ...opcions, headers: cabeceiras });
  } catch (e) {
    throw new ErroSupabase('Non se puido contactar con Supabase', 0, String(e && e.message));
  }

  if (!resposta.ok) {
    /* O corpo de erro de PostgREST pode traer detalles do esquema; quédase no
       rexistro do Worker, non se lle devolve á persoa usuaria. */
    const texto = await resposta.text().catch(() => '');
    throw new ErroSupabase('Supabase devolveu ' + resposta.status, resposta.status, texto.slice(0, 500));
  }

  if (resposta.status === 204) return null;
  const texto = await resposta.text();
  return texto ? JSON.parse(texto) : null;
}

/* Le unha táboa enteira ordenada por id. Os catálogos dunha familia son
   centos de filas como moito, así que non hai paxinación que xestionar. */
export function seleccionarTodo(env, taboa, columnas = 'id,data') {
  return chamar(env, `/${taboa}?select=${encodeURIComponent(columnas)}&order=id.asc`);
}

/* Le a fila dun recurso de estado ('semana', 'neveira', 'cociñeiros').
   Devolve o `data` gardado, ou null se aínda non hai fila. */
export async function lerEstado(env, clave) {
  const filas = await chamar(
    env,
    `/qch_estado?clave=eq.${encodeURIComponent(clave)}&select=data&limit=1`
  );
  return Array.isArray(filas) && filas.length ? filas[0].data : null;
}

/* Substitúe o recurso enteiro. Un só `upsert`: insire se non existe e
   sobrescribe se xa estaba. `actualizado_en` mándase explicitamente porque o
   `default now()` da táboa só se aplica ao insertar, non ao sobrescribir. */
export async function gardarEstado(env, clave, data) {
  const actualizadoEn = new Date().toISOString();
  await chamar(env, '/qch_estado?on_conflict=clave', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ clave, data, actualizado_en: actualizadoEn })
  });
  return actualizadoEn;
}

export function crearSesion(env, token, caducaEn) {
  return chamar(env, '/qch_sesions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ token, caduca_en: caducaEn })
  });
}

export async function buscarSesion(env, token) {
  const filas = await chamar(
    env,
    `/qch_sesions?token=eq.${encodeURIComponent(token)}&select=token,caduca_en&limit=1`
  );
  return Array.isArray(filas) && filas.length ? filas[0] : null;
}

/* Limpeza oportunista das sesións caducadas. Chámase ao iniciar sesión, que é
   raro dabondo para non estorbar e frecuente dabondo para que a táboa non
   medre soa. Se falla, non importa: non é parte do login. */
export function borrarSesionsCaducadas(env) {
  return chamar(env, `/qch_sesions?caduca_en=lt.${encodeURIComponent(new Date().toISOString())}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  });
}
