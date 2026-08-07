/* Estado sincronizado: semana, neveira e cociñeiros.
   Cada `PUT` substitúe o recurso enteiro; non hai actualizacións parciais nin
   fusión de cambios (ESTRUTURA.md §5.1 e §7). */

import { lerEstado, gardarEstado } from './supabase.js';

/* Que forma ten cada recurso, tal e como o escribe `js/estado.js`:
   - semana e cociñeiros: `"dia:xantar" → id` (texto)
   - neveira: `ingredienteId → cantidade` (número) */
const RECURSOS = {
  semana: { valor: v => typeof v === 'string', queEspera: 'identificadores de receita' },
  neveira: { valor: v => typeof v === 'number' && Number.isFinite(v), queEspera: 'cantidades numéricas' },
  cociñeiros: { valor: v => typeof v === 'string', queEspera: 'identificadores de persoa' }
};

export function eRecurso(nome) {
  return Object.prototype.hasOwnProperty.call(RECURSOS, nome);
}

function eObxectoPlano(valor) {
  return !!valor && typeof valor === 'object' && !Array.isArray(valor);
}

/* Validación deliberadamente curta.
   Se o Worker rexeita un `PUT` que o frontend considera correcto, ese cambio
   queda na cola de pendentes de `js/api.js` e reinténtase para sempre, sen que
   a persoa vexa nada raro. Así que aquí só se rexeita o que é claramente lixo:
   o que non é un obxecto, e os valores que non teñen o tipo do recurso. */
export function validar(nome, corpo) {
  if (!eObxectoPlano(corpo)) {
    return { erro: 'corpo_invalido', mensaxe: 'Agardábase un obxecto JSON' };
  }
  const regra = RECURSOS[nome];
  const malos = Object.keys(corpo).filter(clave => !regra.valor(corpo[clave]));
  if (malos.length) {
    return {
      erro: 'corpo_invalido',
      mensaxe: `En "${nome}" agárdanse ${regra.queEspera}; non valen: ${malos.slice(0, 5).join(', ')}`
    };
  }
  return null;
}

/* Un recurso que aínda non se gardou nunca devolve `{}`, non un 404: para o
   frontend "sen semana gardada" e "semana baleira" son o mesmo, e un 404
   faríalle rexeitar `prepararCasa()` enteiro. */
export async function obter(env, nome) {
  const data = await lerEstado(env, nome);
  return eObxectoPlano(data) ? data : {};
}

export function gardar(env, nome, corpo) {
  return gardarEstado(env, nome, corpo);
}
