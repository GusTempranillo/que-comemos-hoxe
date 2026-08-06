/* Edición local dos catálogos (ingredientes, receitas, persoas).
   VISION.md §Usuarios: "Todas as persoas que acceden á aplicación poden
   crear, modificar e planificar" — non hai perfís de só lectura.

   Segue o mesmo patrón que xa usa a neveira: garda primeiro en local
   (para que funcione sen conexión e sen backend de escritura), e despois
   intenta sincronizar en segundo plano cando hai sesión. Se aínda non hai
   endpoints de escritura en n8n (ver DOCS/API_CONTRACT.md §8), o cambio
   simplemente queda pendente e sincronízase o día que existan, sen que
   haxa que tocar este ficheiro.

   As receitas nunca perden historia: editar crea unha versión nova
   (COOKBOOK_MODEL.md / VISION.md §Receitario vivo), nunca sobrescribe
   sen deixar rastro. */
window.QCH = window.QCH || {};

QCH.catalogo = (function () {

  function normalizarId(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'novo';
  }

  function idUnico(base, xaExisten) {
    let id = normalizarId(base);
    let n = 2;
    while (xaExisten.indexOf(id) !== -1) { id = normalizarId(base) + '_' + n; n++; }
    return id;
  }

  function listaTexto(texto) {
    return String(texto || '').split(',').map(t => t.trim()).filter(Boolean);
  }

  function actualizarMapas() {
    QCH.mapaIngredientes = QCH.INGREDIENTES.reduce((m, i) => (m[i.id] = i, m), {});
    QCH.mapaReceitas = QCH.RECEITAS.reduce((m, r) => (m[r.id] = r, m), {});
    QCH.mapaPersoas = QCH.PERSOAS.reduce((m, p) => (m[p.id] = p, m), {});
  }

  function gardarESincronizar(recurso, lista) {
    actualizarMapas();
    QCH.api.gardarCatalogosCache();
    // QCH.RECEITAS/INGREDIENTES/PERSOAS non forman parte de QCH.estado, así
    // que un cambio aquí non repinta a vista por si só: forzamos un aviso
    // de estado (sen cambiar nada del) para que app.js volva pintar.
    QCH.estado.set({}, 'catalogo');
    return QCH.api.sincronizarCatalogo(recurso, lista);
  }

  /* ---------- Ingredientes ---------- */

  function engadirIngrediente(datos) {
    const id = idUnico(datos.nome, QCH.INGREDIENTES.map(i => i.id));
    const ingrediente = {
      id,
      nome: (datos.nome || '').trim() || id,
      cat: datos.cat || 'despensa',
      unid: datos.unid || 'ud'
    };
    QCH.INGREDIENTES = QCH.INGREDIENTES.concat([ingrediente]);
    gardarESincronizar('ingredientes', QCH.INGREDIENTES);
    return ingrediente;
  }

  function editarIngrediente(id, cambios) {
    const idx = QCH.INGREDIENTES.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const actualizado = Object.assign({}, QCH.INGREDIENTES[idx], cambios, { id });
    QCH.INGREDIENTES = QCH.INGREDIENTES.slice();
    QCH.INGREDIENTES[idx] = actualizado;
    gardarESincronizar('ingredientes', QCH.INGREDIENTES);
    return actualizado;
  }

  /* ---------- Receitas ---------- */

  function receitaBaleira() {
    return {
      nome: 'Receita nova', subtitulo: '', cat: 'despensa',
      arte: 'redondo', paleta: ['#B2662F', '#7A3E1C'], foto: '',
      tempo: 30, dificultade: 1, racions: 4, vexetariana: false,
      tags: [], ingredientes: [], pasos: [], consello: '', versions: []
    };
  }

  /* Nunca sobrescribe sen deixar rastro: a versión anterior completa
     (agás o seu propio historial, para non aniñar versións dentro de
     versións) queda gardada en receita.versions antes de aplicar cambios. */
  function crearVersion(receita) {
    const snapshot = Object.assign({}, receita);
    delete snapshot.versions;
    snapshot.gardadaEn = new Date().toISOString();
    return snapshot;
  }

  function crearReceita(datos) {
    const id = idUnico(datos.nome, QCH.RECEITAS.map(r => r.id));
    const receita = Object.assign(receitaBaleira(), datos, { id });
    QCH.RECEITAS = QCH.RECEITAS.concat([receita]);
    gardarESincronizar('receitas', QCH.RECEITAS);
    return receita;
  }

  function editarReceita(id, cambios) {
    const idx = QCH.RECEITAS.findIndex(r => r.id === id);
    if (idx === -1) return null;
    const orixinal = QCH.RECEITAS[idx];
    const versions = (orixinal.versions || []).concat([crearVersion(orixinal)]);
    const actualizada = Object.assign({}, orixinal, cambios, { id, versions });
    QCH.RECEITAS = QCH.RECEITAS.slice();
    QCH.RECEITAS[idx] = actualizada;
    gardarESincronizar('receitas', QCH.RECEITAS);
    return actualizada;
  }

  /* ---------- Persoas ---------- */

  function persoaBaleira() {
    return { nome: 'Persoa nova', cor: '#4E7A8C', cociña: false, nota: '', restricions: [], adaptacions: {} };
  }

  function engadirPersoa(datos) {
    const id = idUnico(datos.nome, QCH.PERSOAS.map(p => p.id));
    const persoa = Object.assign(persoaBaleira(), datos, { id, adaptacions: {} });
    QCH.PERSOAS = QCH.PERSOAS.concat([persoa]);
    actualizarMapas();
    QCH.estado.update(s => { s.comensais.push(id); }, 'comensais');
    gardarESincronizar('persoas', QCH.PERSOAS);
    return persoa;
  }

  function editarPersoa(id, cambios) {
    const idx = QCH.PERSOAS.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const actualizada = Object.assign({}, QCH.PERSOAS[idx], cambios, { id });
    QCH.PERSOAS = QCH.PERSOAS.slice();
    QCH.PERSOAS[idx] = actualizada;
    gardarESincronizar('persoas', QCH.PERSOAS);
    return actualizada;
  }

  function gardarAdaptacion(persoaId, receitaId, adaptacion) {
    const idx = QCH.PERSOAS.findIndex(p => p.id === persoaId);
    if (idx === -1) return null;
    const persoa = QCH.PERSOAS[idx];
    const adaptacions = Object.assign({}, persoa.adaptacions, { [receitaId]: adaptacion });
    return editarPersoa(persoaId, { adaptacions });
  }

  function quitarAdaptacion(persoaId, receitaId) {
    const idx = QCH.PERSOAS.findIndex(p => p.id === persoaId);
    if (idx === -1) return null;
    const persoa = QCH.PERSOAS[idx];
    const adaptacions = Object.assign({}, persoa.adaptacions);
    delete adaptacions[receitaId];
    return editarPersoa(persoaId, { adaptacions });
  }

  return {
    normalizarId, idUnico, listaTexto,
    engadirIngrediente, editarIngrediente,
    crearReceita, editarReceita,
    engadirPersoa, editarPersoa, gardarAdaptacion, quitarAdaptacion
  };
})();
