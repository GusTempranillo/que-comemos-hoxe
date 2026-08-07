/* Que comemos hoxe — o único backend.
   Un só Worker cobre auth, catálogos e sincronización; e máis adiante o
   diario, as fotos e a IA (ESTRUTURA.md §5). A lóxica real é pouca —validar un
   token, ler e escribir Supabase— e así hai un só sitio onde despregar, rotar
   segredos e mirar rexistros.

   Rutas implementadas hoxe (pasos 2 e 3 do plan da §13):
     GET  /saude                              sen sesión
     POST /auth/login                         sen sesión
     GET  /receitas /ingredientes /persoas    con sesión
     GET  PUT /semana /neveira /cociñeiros    con sesión

   Aínda sen implementar: /diario, /receitas/:id, /receitas/:id/fotos e
   /ia/axuda — pasos 4 en diante. */

import { json, erro, previa, orixeAceptada } from './respostas.js';
import { iniciarSesion, validarSesion } from './sesions.js';
import { catalogo, eCatalogo } from './catalogos.js';
import { eRecurso, validar, obter, gardar } from './estado.js';

const TAMAÑO_MAXIMO_CORPO = 1024 * 1024; // 1 MB: a semana enteira son uns poucos KB

/* A ruta /cociñeiros chega co ñ codificado (`/coci%C3%B1eiros`), porque así o
   manda calquera navegador. Descodifícase antes de comparar. */
function ruta(url) {
  let camiño = url.pathname;
  try { camiño = decodeURIComponent(camiño); } catch (e) { /* secuencia mal formada: úsase tal cal */ }
  return camiño.length > 1 ? camiño.replace(/\/+$/, '') : camiño;
}

async function corpoJson(peticion) {
  const lonxitude = Number(peticion.headers.get('Content-Length') || 0);
  if (lonxitude > TAMAÑO_MAXIMO_CORPO) {
    return { erro: 'corpo_grande', mensaxe: 'O corpo da petición é grande de máis' };
  }
  const texto = await peticion.text();
  if (texto.length > TAMAÑO_MAXIMO_CORPO) {
    return { erro: 'corpo_grande', mensaxe: 'O corpo da petición é grande de máis' };
  }
  if (!texto) return { valor: undefined };
  try {
    return { valor: JSON.parse(texto) };
  } catch (e) {
    return { erro: 'corpo_invalido', mensaxe: 'O corpo non é JSON válido' };
  }
}

async function encamiñar(peticion, env) {
  const url = new URL(peticion.url);
  const camiño = ruta(url);
  const metodo = peticion.method.toUpperCase();

  /* ----- Rutas sen sesión ----- */

  if (camiño === '/saude') {
    if (metodo !== 'GET') return erro('metodo_non_permitido', 'Esa ruta só admite GET', peticion, env, 405);
    /* Só booleanos: serve para saber se falta configurar algo sen ensinar
       nunca o valor de ningún segredo. */
    return json({
      ok: true,
      servizo: 'qch-worker',
      hora: new Date().toISOString(),
      configurado: {
        supabase: !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
        tokenCasa: !!env.TOKEN_CASA,
        orixes: String(env.ORIXES_PERMITIDAS || '').split(',').filter(o => o.trim()).length
      }
    }, peticion, env);
  }

  if (camiño === '/auth/login') {
    if (metodo !== 'POST') return erro('metodo_non_permitido', 'Esa ruta só admite POST', peticion, env, 405);
    const corpo = await corpoJson(peticion);
    if (corpo.erro) return erro(corpo.erro, corpo.mensaxe, peticion, env);

    const resultado = await iniciarSesion(env, corpo.valor && corpo.valor.token);
    if (resultado.erro) {
      const estado = resultado.erro === 'sen_configurar' ? 503 : 401;
      return erro(resultado.erro, resultado.mensaxe, peticion, env, estado);
    }
    return json(resultado.sesion, peticion, env);
  }

  /* ----- A partir de aquí, todo require sesión ----- */

  const nome = camiño.slice(1);
  if (!eCatalogo(nome) && !eRecurso(nome)) {
    return erro('non_atopado', 'Esa ruta non existe neste servidor', peticion, env, 404);
  }

  const sesion = await validarSesion(env, peticion);
  if (sesion.erro) return erro(sesion.erro, sesion.mensaxe, peticion, env, 401);

  if (eCatalogo(nome)) {
    if (metodo !== 'GET') {
      return erro('metodo_non_permitido', 'Os catálogos son de só lectura por agora', peticion, env, 405);
    }
    return json(await catalogo(env, nome), peticion, env);
  }

  if (metodo === 'GET') {
    return json(await obter(env, nome), peticion, env);
  }

  if (metodo === 'PUT') {
    const corpo = await corpoJson(peticion);
    if (corpo.erro) return erro(corpo.erro, corpo.mensaxe, peticion, env);

    const invalido = validar(nome, corpo.valor);
    if (invalido) return erro(invalido.erro, invalido.mensaxe, peticion, env);

    const actualizadoEn = await gardar(env, nome, corpo.valor);
    return json({ gardado: true, actualizado_en: actualizadoEn }, peticion, env);
  }

  return erro('metodo_non_permitido', 'Esa ruta admite GET e PUT', peticion, env, 405);
}

export default {
  async fetch(peticion, env) {
    if (peticion.method === 'OPTIONS') return previa(peticion, env);

    /* Unha petición desde un navegador cunha orixe que non está na lista
       córtase aquí. As chamadas sen cabeceira `Origin` (curl, o cron de
       vixilancia) déixanse pasar: CORS protexe navegadores, non servidores;
       o que protexe os datos é o token de sesión. */
    if (peticion.headers.get('Origin') && !orixeAceptada(peticion, env)) {
      return erro('orixe_non_permitida', 'Esta orixe non pode usar esta API', peticion, env, 403);
    }

    try {
      return await encamiñar(peticion, env);
    } catch (e) {
      /* O detalle vai ao rexistro do Worker (`wrangler tail`), non á resposta:
         podería levar información do esquema de Supabase. */
      console.error('Fallo sen controlar:', e && (e.stack || e.message), e && e.detalle);
      const estado = e && e.detalle === 'sen_configurar' ? 503 : 500;
      const codigo = estado === 503 ? 'sen_configurar' : 'erro_servidor';
      const mensaxe = estado === 503
        ? 'O servidor aínda non está configurado de todo'
        : 'Algo fallou no servidor. Téntao de novo nun momento';
      return erro(codigo, mensaxe, peticion, env, estado);
    }
  }
};
