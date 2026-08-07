/* Sesións: un único token de casa, non contas por persoa.
   VISION.md define un só perfil ("cociñeiros"), así que a complexidade de
   Supabase Auth por persoa non compraría nada (ESTRUTURA.md §5.2).

   O token que escribe a persoa (TOKEN_CASA) só se usa para obter unha sesión.
   No navegador queda unicamente o token de sesión, que caduca. */

import { crearSesion, buscarSesion, borrarSesionsCaducadas } from './supabase.js';

const DIAS_SESION_POR_DEFECTO = 14;

async function resumo(texto) {
  const datos = new TextEncoder().encode(texto);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', datos));
}

/* Comparación en tempo constante. Compáranse os resumos SHA-256 e non os
   textos: así son sempre 32 bytes e nin sequera a lonxitude do token da casa
   se pode deducir do tempo de resposta. */
async function iguaisEnTempoConstante(a, b) {
  const [ra, rb] = await Promise.all([resumo(a), resumo(b)]);
  let diferenza = 0;
  for (let i = 0; i < ra.length; i++) diferenza |= ra[i] ^ rb[i];
  return diferenza === 0;
}

function tokenNovo() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function diasDeSesion(env) {
  const dias = Number(env.DIAS_SESION);
  return Number.isFinite(dias) && dias > 0 ? dias : DIAS_SESION_POR_DEFECTO;
}

/* Valida o token da casa e abre unha sesión.
   Devolve `{ token, caduca }` — exactamente o que garda `QCH.api.login()`. */
export async function iniciarSesion(env, tokenAcceso) {
  if (!env.TOKEN_CASA) {
    return { erro: 'sen_configurar', mensaxe: 'O servidor aínda non ten token de casa configurado' };
  }
  if (typeof tokenAcceso !== 'string' || !tokenAcceso) {
    return { erro: 'token_incorrecto', mensaxe: 'Fai falta o token da casa' };
  }
  if (!(await iguaisEnTempoConstante(tokenAcceso, env.TOKEN_CASA))) {
    return { erro: 'token_incorrecto', mensaxe: 'Ese token non é o da casa' };
  }

  const token = tokenNovo();
  const caduca = new Date(Date.now() + diasDeSesion(env) * 86400000).toISOString();
  await crearSesion(env, token, caduca);

  /* Non se agarda por isto: a persoa xa ten a súa sesión. */
  borrarSesionsCaducadas(env).catch(() => null);

  return { sesion: { token, caduca } };
}

/* Comproba a cabeceira `Authorization: Bearer <token>` das rutas privadas.
   Devolve `{ token }` se vale, ou `{ erro, mensaxe }` coa forma do contrato. */
export async function validarSesion(env, peticion) {
  const cabeceira = peticion.headers.get('Authorization') || '';
  const token = cabeceira.startsWith('Bearer ') ? cabeceira.slice(7).trim() : '';
  if (!token) {
    return { erro: 'sen_sesion', mensaxe: 'Fai falta iniciar sesión' };
  }

  const sesion = await buscarSesion(env, token);
  if (!sesion) {
    return { erro: 'token_invalido', mensaxe: 'A sesión non é válida. Inicia sesión de novo' };
  }
  if (new Date(sesion.caduca_en).getTime() <= Date.now()) {
    return { erro: 'token_caducado', mensaxe: 'A sesión caducou' };
  }
  return { token };
}
