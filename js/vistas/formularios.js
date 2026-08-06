/* Formularios de edición: ingredientes, receitas (con versión) e persoas
   (con adaptacións). Único perfil "cociñeiro" (VISION.md §Usuarios): calquera
   que use a app pode crear e modificar, así que estes formularios están
   accesibles dende calquera vista, sen roles nin permisos especiais.

   Os formularios de receita e adaptacións gardan un "borrador" en memoria
   (módulo, non QCH.estado) porque cambian de forma cando se engaden ou
   quitan liñas — cómpre repintar o modal sen perder o que xa se escribiu,
   así que primeiro se "recolle" (lerFormularioReceita) o que hai nos campos
   e despois repíntase a partir dese borrador actualizado. */
window.QCH = window.QCH || {};

QCH.UNIDADES = ['g', 'ml', 'ud', 'dente', 'pitada', 'lata', 'folla', 'ramallo'];
QCH.CATEGORIAS_RECEITA = [
  { id: 'verdura', nome: 'Verdura' }, { id: 'peixe', nome: 'Peixe' },
  { id: 'carne', nome: 'Carne' }, { id: 'legume', nome: 'Legumes' },
  { id: 'masa', nome: 'Masa' }, { id: 'sobremesa', nome: 'Sobremesa' }
];

function campoTexto(id, etiqueta, valor, opts) {
  const o = opts || {};
  return '<div>' +
    '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="' + id + '">' + QCH.esc(etiqueta) + '</label>' +
    (o.area
      ? '<textarea id="' + id + '" rows="' + (o.filas || 2) + '" placeholder="' + QCH.esc(o.placeholder || '') + '" ' +
        'class="w-full px-4 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' + QCH.esc(valor) + '</textarea>'
      : '<input type="' + (o.tipo || 'text') + '" id="' + id + '" value="' + QCH.esc(valor == null ? '' : valor) + '" placeholder="' + QCH.esc(o.placeholder || '') + '" ' +
        (o.min != null ? ' min="' + o.min + '"' : '') +
        'class="w-full px-4 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">') +
    '</div>';
}

function campoSelect(id, etiqueta, opcions, seleccionado) {
  return '<div>' +
    '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="' + id + '">' + QCH.esc(etiqueta) + '</label>' +
    '<select id="' + id + '" class="w-full px-4 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
      opcions.map(o => '<option value="' + QCH.esc(o.id) + '"' + (o.id === seleccionado ? ' selected' : '') + '>' + QCH.esc(o.nome) + '</option>').join('') +
    '</select></div>';
}

function cabeceiraFormulario(titulo) {
  return '<div class="flex items-start justify-between gap-4 mb-5">' +
    '<h2 class="font-display text-2xl text-tinta dark:text-crema">' + QCH.esc(titulo) + '</h2>' +
    '<button type="button" data-accion="pechar-modal" aria-label="Pechar" data-autofoco ' +
      'class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
      QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button></div>';
}

/* ================= Ingredientes ================= */

QCH.abrirFormularioIngrediente = function (idEditar, nomeInicial) {
  const editando = idEditar ? QCH.ingrediente(idEditar) : null;
  const nome = editando ? editando.nome : (nomeInicial || '');

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      cabeceiraFormulario(editando ? 'Editar ingrediente' : 'Novo ingrediente') +
      '<form data-accion="form-ingrediente-gardar" data-id="' + (idEditar || '') + '" class="space-y-4" novalidate>' +
        campoTexto('ing-nome', 'Nome', nome, { placeholder: 'Ex.: Grelos' }) +
        campoSelect('ing-cat', 'Categoría', Object.keys(QCH.CATEGORIAS).map(id => ({ id, nome: QCH.CATEGORIAS[id].nome })), editando ? editando.cat : 'despensa') +
        campoSelect('ing-unid', 'Unidade', QCH.UNIDADES.map(u => ({ id: u, nome: u })), editando ? editando.unid : 'ud') +
        '<button type="submit" class="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-[.97] text-sm px-5 min-h-[44px] md:min-h-[38px] bg-pemento text-white hover:bg-[#B93A26] shadow-sm hover:shadow-md">' +
          (editando ? 'Gardar cambios' : 'Crear ingrediente') + '</button>' +
      '</form></div>',
    'sm:max-w-md'
  ));
};

/* ================= Receitas ================= */

let borradorReceita = null;

function receitaEnBorrador(idEditar) {
  const orix = idEditar ? QCH.receita(idEditar) : null;
  return orix ? {
    id: orix.id, nome: orix.nome, subtitulo: orix.subtitulo, cat: orix.cat,
    foto: orix.foto || '', tempo: orix.tempo, dificultade: orix.dificultade,
    racions: orix.racions, vexetariana: !!orix.vexetariana,
    tags: (orix.tags || []).join(', '), consello: orix.consello || '',
    ingredientes: orix.ingredientes.map(i => Object.assign({}, i)),
    pasos: orix.pasos.slice(), numVersions: (orix.versions || []).length
  } : {
    id: null, nome: '', subtitulo: '', cat: 'verdura', foto: '',
    tempo: 30, dificultade: 1, racions: 4, vexetariana: false, tags: '', consello: '',
    ingredientes: [], pasos: [''], numVersions: 0
  };
}

/* Le o que hai agora nos campos do DOM e actualízao no borrador, para non
   perder texto xa escrito cando se repinta o formulario (ao engadir/quitar
   unha liña de ingrediente ou de paso). */
function lerFormularioReceita() {
  const b = borradorReceita;
  const $ = (id) => document.getElementById(id);
  if ($('rf-nome')) {
    b.nome = $('rf-nome').value;
    b.subtitulo = $('rf-subtitulo').value;
    b.cat = $('rf-cat').value;
    b.foto = $('rf-foto').value;
    b.tempo = parseInt($('rf-tempo').value, 10) || 0;
    b.dificultade = parseInt($('rf-dificultade').value, 10) || 1;
    b.racions = parseInt($('rf-racions').value, 10) || 4;
    b.vexetariana = $('rf-vexetariana').checked;
    b.tags = $('rf-tags').value;
    b.consello = $('rf-consello').value;
    b.ingredientes = b.ingredientes.map((ing, i) => ({
      id: $('rf-ing-id-' + i).value,
      cant: parseFloat($('rf-ing-cant-' + i).value) || 0,
      unid: QCH.ingrediente($('rf-ing-id-' + i).value).unid
    }));
    b.pasos = b.pasos.map((p, i) => $('rf-paso-' + i).value);
  }
}

function filaIngredienteReceita(ing, i) {
  const opcions = QCH.INGREDIENTES.slice().sort((a, b) => a.nome.localeCompare(b.nome));
  return '<div class="flex items-end gap-2">' +
    '<div class="grow min-w-0">' +
      (i === 0 ? '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5">Ingrediente</label>' : '') +
      '<select id="rf-ing-id-' + i + '" class="w-full px-3 py-2 rounded-lg bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema">' +
        opcions.map(o => '<option value="' + QCH.esc(o.id) + '"' + (o.id === ing.id ? ' selected' : '') + '>' + QCH.esc(o.nome) + '</option>').join('') +
      '</select></div>' +
    '<div class="w-24 shrink-0">' +
      (i === 0 ? '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5">Cantidade</label>' : '') +
      '<input type="number" min="0" step="any" id="rf-ing-cant-' + i + '" value="' + QCH.esc(ing.cant) + '" ' +
        'class="w-full px-3 py-2 rounded-lg bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema">' +
    '</div>' +
    '<button type="button" data-accion="receita-quita-ingrediente" data-i="' + i + '" aria-label="Quitar ingrediente" ' +
      'class="shrink-0 w-9 h-9 rounded-lg grid place-items-center text-tinta/40 hover:text-pemento hover:bg-pemento/10 dark:text-crema/40">' +
      QCH.icona('lixo', 'w-4 h-4', 2) + '</button></div>';
}

function filaPasoReceita(paso, i) {
  return '<div class="flex items-start gap-2">' +
    '<span class="shrink-0 w-7 h-7 mt-1 rounded-full bg-pemento/10 text-pemento grid place-items-center text-xs font-bold">' + (i + 1) + '</span>' +
    '<textarea id="rf-paso-' + i + '" rows="2" placeholder="Que hai que facer neste paso…" ' +
      'class="grow min-w-0 px-3 py-2 rounded-lg bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema">' + QCH.esc(paso) + '</textarea>' +
    '<button type="button" data-accion="receita-quita-paso" data-i="' + i + '" aria-label="Quitar paso" ' +
      'class="shrink-0 w-9 h-9 mt-1 rounded-lg grid place-items-center text-tinta/40 hover:text-pemento hover:bg-pemento/10 dark:text-crema/40">' +
      QCH.icona('lixo', 'w-4 h-4', 2) + '</button></div>';
}

function pintarFormularioReceita() {
  const b = borradorReceita;
  const editando = !!b.id;

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      cabeceiraFormulario(editando ? 'Editar receita' : 'Nova receita') +
      (editando && b.numVersions
        ? '<p class="text-xs text-tinta/45 dark:text-crema/45 -mt-3 mb-5">Gardar crea unha versión nova; as ' + b.numVersions +
          ' anteriores non se perden.</p>' : '') +
      '<form data-accion="receita-gardar" class="space-y-5" novalidate>' +
        '<div class="grid sm:grid-cols-2 gap-4">' +
          campoTexto('rf-nome', 'Nome', b.nome, { placeholder: 'Ex.: Zorza con patacas' }) +
          campoSelect('rf-cat', 'Categoría', QCH.CATEGORIAS_RECEITA, b.cat) +
        '</div>' +
        campoTexto('rf-subtitulo', 'Subtítulo', b.subtitulo, { placeholder: 'Unha liña que dea gana de facelo' }) +
        campoTexto('rf-foto', 'URL da fotografía (opcional)', b.foto, { placeholder: 'https://…' }) +
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">' +
          campoTexto('rf-tempo', 'Tempo (min)', b.tempo, { tipo: 'number', min: 0 }) +
          campoSelect('rf-dificultade', 'Dificultade', [{ id: '1', nome: 'Doado' }, { id: '2', nome: 'Medio' }, { id: '3', nome: 'Require man' }], String(b.dificultade)) +
          campoTexto('rf-racions', 'Racións', b.racions, { tipo: 'number', min: 1 }) +
          '<div class="flex items-end pb-2.5">' +
            '<label class="inline-flex items-center gap-2 text-sm text-tinta dark:text-crema">' +
              '<input type="checkbox" id="rf-vexetariana"' + (b.vexetariana ? ' checked' : '') + ' class="w-4 h-4 rounded accent-pemento"> Vexetariana</label></div>' +
        '</div>' +
        campoTexto('rf-tags', 'Etiquetas (separadas por comas)', b.tags, { placeholder: 'tradicional, rápido…' }) +

        '<div>' +
          '<div class="flex items-center justify-between mb-2">' +
            '<h3 class="font-display text-lg text-tinta dark:text-crema">Ingredientes</h3>' +
            QCH.btn('Engadir', 'receita-add-ingrediente', { variante: 'fantasma', pequeno: true, icona: 'mais' }) +
          '</div>' +
          '<div class="space-y-2.5">' + b.ingredientes.map(filaIngredienteReceita).join('') + '</div>' +
          (!b.ingredientes.length ? '<p class="text-xs text-tinta/40 dark:text-crema/40 italic">Aínda sen ingredientes.</p>' : '') +
        '</div>' +

        '<div>' +
          '<div class="flex items-center justify-between mb-2">' +
            '<h3 class="font-display text-lg text-tinta dark:text-crema">Elaboración</h3>' +
            QCH.btn('Engadir paso', 'receita-add-paso', { variante: 'fantasma', pequeno: true, icona: 'mais' }) +
          '</div>' +
          '<div class="space-y-2.5">' + b.pasos.map(filaPasoReceita).join('') + '</div>' +
        '</div>' +

        campoTexto('rf-consello', 'O truco (opcional)', b.consello, { area: true, filas: 2 }) +

        '<button type="submit" class="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-[.97] text-sm px-5 min-h-[44px] bg-pemento text-white hover:bg-[#B93A26] shadow-sm hover:shadow-md">' +
          (editando ? 'Gardar nova versión' : 'Crear receita') + '</button>' +
      '</form></div>',
    'sm:max-w-2xl'
  ));
}

QCH.abrirFormularioReceita = function (idEditar) {
  borradorReceita = receitaEnBorrador(idEditar);
  pintarFormularioReceita();
};

QCH.accionsFormularioReceita = {
  'receita-add-ingrediente': () => {
    lerFormularioReceita();
    const primeiro = QCH.INGREDIENTES[0];
    borradorReceita.ingredientes.push({ id: primeiro.id, cant: 0, unid: primeiro.unid });
    pintarFormularioReceita();
  },
  'receita-quita-ingrediente': (el) => {
    lerFormularioReceita();
    borradorReceita.ingredientes.splice(parseInt(el.getAttribute('data-i'), 10), 1);
    pintarFormularioReceita();
  },
  'receita-add-paso': () => {
    lerFormularioReceita();
    borradorReceita.pasos.push('');
    pintarFormularioReceita();
  },
  'receita-quita-paso': (el) => {
    lerFormularioReceita();
    borradorReceita.pasos.splice(parseInt(el.getAttribute('data-i'), 10), 1);
    pintarFormularioReceita();
  },
  'receita-gardar': () => {
    lerFormularioReceita();
    const b = borradorReceita;
    if (!b.nome.trim()) { QCH.toast('Ponlle un nome á receita', 'aviso'); return; }
    const datos = {
      nome: b.nome.trim(), subtitulo: b.subtitulo.trim(), cat: b.cat, foto: b.foto.trim(),
      tempo: b.tempo, dificultade: b.dificultade, racions: b.racions, vexetariana: b.vexetariana,
      tags: QCH.catalogo.listaTexto(b.tags), consello: b.consello.trim(),
      ingredientes: b.ingredientes.filter(i => i.id),
      pasos: b.pasos.map(p => p.trim()).filter(Boolean)
    };
    const receita = b.id ? QCH.catalogo.editarReceita(b.id, datos) : QCH.catalogo.crearReceita(datos);
    QCH.modal.pechar();
    QCH.toast((b.id ? 'Nova versión gardada: ' : 'Receita creada: ') + receita.nome);
  }
};

/* ================= Persoas ================= */

QCH.abrirFormularioPersoa = function (idEditar) {
  const editando = idEditar ? QCH.persoa(idEditar) : null;
  const p = editando || { nome: '', cor: '#4E7A8C', cociña: false, nota: '', restricions: [] };
  const CORES = ['#C0563C', '#4E7A8C', '#8A5FA8', '#3E6B4F', '#2F8F7E', '#B07C2E', '#A8447A', '#D08A2E'];

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      cabeceiraFormulario(editando ? 'Editar persoa' : 'Nova persoa') +
      '<form data-accion="form-persoa-gardar" data-id="' + (idEditar || '') + '" class="space-y-4" novalidate>' +
        campoTexto('per-nome', 'Nome', p.nome, { placeholder: 'Ex.: Uxía' }) +
        '<div>' +
          '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5">Cor</label>' +
          '<div class="flex flex-wrap gap-2">' + CORES.map(c =>
            '<label class="cursor-pointer">' +
              '<input type="radio" name="per-cor" value="' + c + '"' + (c === p.cor ? ' checked' : '') + ' class="sr-only peer">' +
              '<span class="block w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-crema dark:ring-offset-fondo ring-transparent peer-checked:ring-tinta dark:peer-checked:ring-crema transition-all" style="background:' + c + '"></span>' +
            '</label>').join('') + '</div></div>' +
        campoTexto('per-nota', 'Nota (opcional)', p.nota, { placeholder: 'Algo curto que a describa' }) +
        campoTexto('per-restricions', 'Restricións (separadas por comas)', (p.restricions || []).join(', '), { placeholder: 'vexetariana, sen lactosa…' }) +
        '<label class="inline-flex items-center gap-2 text-sm text-tinta dark:text-crema">' +
          '<input type="checkbox" id="per-cociña"' + (p.cociña ? ' checked' : '') + ' class="w-4 h-4 rounded accent-pemento"> Cociña na casa</label>' +
        '<button type="submit" class="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-[.97] text-sm px-5 min-h-[44px] bg-pemento text-white hover:bg-[#B93A26] shadow-sm hover:shadow-md">' +
          (editando ? 'Gardar cambios' : 'Engadir á familia') + '</button>' +
      '</form></div>',
    'sm:max-w-md'
  ));
};

/* ================= Adaptacións por receita ================= */

const ETIQUETA_TIPO_ADAP = { sen: 'Quita un ingrediente', substituir: 'Cambia un ingrediente', prato: 'Come outro prato' };

function filaAdaptacionPersoa(persoa, receita) {
  const a = persoa.adaptacions[receita.id];
  const tipo = a ? a.tipo : '';
  const ingsReceita = receita.ingredientes.map(i => QCH.ingrediente(i.id));
  const todosIngs = QCH.INGREDIENTES.slice().sort((x, y) => x.nome.localeCompare(y.nome));

  return '<div class="rounded-2xl border border-tinta/8 dark:border-white/10 p-4 space-y-3" data-persoa-row="' + persoa.id + '">' +
    '<div class="flex items-center gap-2.5">' + QCH.avatar(persoa, 28) +
      '<span class="font-display text-base text-tinta dark:text-crema">' + QCH.esc(persoa.nome) + '</span>' +
    '</div>' +
    '<select id="adap-tipo-' + persoa.id + '" class="w-full px-3 py-2 rounded-lg bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema">' +
      '<option value=""' + (!tipo ? ' selected' : '') + '>Sen adaptación — come igual ca todos</option>' +
      '<option value="sen"' + (tipo === 'sen' ? ' selected' : '') + '>' + ETIQUETA_TIPO_ADAP.sen + '</option>' +
      '<option value="substituir"' + (tipo === 'substituir' ? ' selected' : '') + '>' + ETIQUETA_TIPO_ADAP.substituir + '</option>' +
      '<option value="prato"' + (tipo === 'prato' ? ' selected' : '') + '>' + ETIQUETA_TIPO_ADAP.prato + '</option>' +
    '</select>' +
    '<div class="grid sm:grid-cols-2 gap-2.5">' +
      '<div><label class="block text-[11px] text-tinta/50 dark:text-crema/50 mb-1">Quitar/cambiar este ingrediente (para "quita"/"cambia")</label>' +
      '<select id="adap-ingrediente-' + persoa.id + '" class="w-full px-3 py-2 rounded-lg bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema">' +
        ingsReceita.map(i => '<option value="' + QCH.esc(i.id) + '"' + (a && a.ingrediente === i.id ? ' selected' : '') + '>' + QCH.esc(i.nome) + '</option>').join('') +
      '</select></div>' +
      '<div><label class="block text-[11px] text-tinta/50 dark:text-crema/50 mb-1">Por este (só para "cambia")</label>' +
      '<select id="adap-por-' + persoa.id + '" class="w-full px-3 py-2 rounded-lg bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema">' +
        todosIngs.map(i => '<option value="' + QCH.esc(i.id) + '"' + (a && a.por === i.id ? ' selected' : '') + '>' + QCH.esc(i.nome) + '</option>').join('') +
      '</select></div>' +
    '</div>' +
    campoTexto('adap-pratoalt-' + persoa.id, 'Prato distinto (só para "come outro prato")', a && a.pratoAlt || '', { placeholder: 'Ex.: Tofu á prancha' }) +
    campoTexto('adap-motivo-' + persoa.id, 'Motivo', a && a.motivo || '', { placeholder: 'Ex.: Sen lactosa' }) +
    '<div class="flex gap-2">' +
      QCH.btn('Gardar', 'adap-gardar', { variante: 'primario', pequeno: true, icona: 'check', datos: ' data-persoa="' + persoa.id + '" data-receita="' + receita.id + '"' }) +
      (a ? QCH.btn('Quitar adaptación', 'adap-quitar', { variante: 'fantasma', pequeno: true, icona: 'lixo', datos: ' data-persoa="' + persoa.id + '" data-receita="' + receita.id + '"' }) : '') +
    '</div></div>';
}

QCH.abrirAdaptacions = function (receitaId) {
  const receita = QCH.receita(receitaId);
  if (!receita) return;

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      cabeceiraFormulario('Adaptacións · ' + receita.nome) +
      '<p class="text-sm text-tinta/55 dark:text-crema/55 mb-5">Cada axuste é desta persoa NESTE prato — non cambia nada nas demais receitas.</p>' +
      '<div class="space-y-4">' + QCH.PERSOAS.map(p => filaAdaptacionPersoa(p, receita)).join('') + '</div>' +
    '</div>',
    'sm:max-w-2xl'
  ));
};

QCH.accionsAdaptacions = {
  'adap-gardar': (el) => {
    const persoaId = el.getAttribute('data-persoa');
    const receitaId = el.getAttribute('data-receita');
    const $ = (id) => document.getElementById(id + '-' + persoaId);
    const tipo = $('adap-tipo').value;
    if (!tipo) { QCH.catalogo.quitarAdaptacion(persoaId, receitaId); QCH.abrirAdaptacions(receitaId); return; }
    const motivo = $('adap-motivo').value.trim() || 'Sen motivo apuntado';
    let adaptacion;
    if (tipo === 'sen') adaptacion = { tipo, ingrediente: $('adap-ingrediente').value, motivo };
    else if (tipo === 'substituir') adaptacion = { tipo, ingrediente: $('adap-ingrediente').value, por: $('adap-por').value, motivo };
    else adaptacion = { tipo: 'prato', pratoAlt: $('adap-pratoalt').value.trim() || 'Outro prato', motivo };
    QCH.catalogo.gardarAdaptacion(persoaId, receitaId, adaptacion);
    QCH.toast('Adaptación gardada');
    QCH.abrirAdaptacions(receitaId);
  },
  'adap-quitar': (el) => {
    QCH.catalogo.quitarAdaptacion(el.getAttribute('data-persoa'), el.getAttribute('data-receita'));
    QCH.toast('Adaptación quitada', 'aviso');
    QCH.abrirAdaptacions(el.getAttribute('data-receita'));
  }
};
