/* Catálogos de só lectura: receitas, ingredientes e persoas.
   Escríbense aínda a man en Supabase; crear e versionar receitas desde a app é
   o paso seguinte (ESTRUTURA.md §5.1, `POST`/`PUT /receitas/:id`). */

import { seleccionarTodo } from './supabase.js';

const TABOAS = {
  receitas: 'qch_receitas',
  ingredientes: 'qch_ingredientes',
  persoas: 'qch_persoas'
};

/* O frontend agarda un array de obxectos planos coa mesma forma que
   `QCH.RECEITAS` e compañía, e `listaValida()` esixe que cada un teña un `id`
   de tipo texto. En Supabase o documento vai en `data` e o id vai en columna
   propia, así que aquí xúntanse os dous.

   O id da columna gaña sempre: se algún documento trouxese o seu propio `id`
   dentro de `data`, unha discrepancia entre ambos rompería as referencias
   entre receitas, neveira e semana. */
export async function catalogo(env, nome) {
  const filas = await seleccionarTodo(env, TABOAS[nome]);
  return (filas || [])
    .filter(fila => fila && fila.id && fila.data && typeof fila.data === 'object')
    .map(fila => ({ ...fila.data, id: fila.id }));
}

export function eCatalogo(nome) {
  return Object.prototype.hasOwnProperty.call(TABOAS, nome);
}
