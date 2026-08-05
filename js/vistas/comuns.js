/* Pezas de interface reutilizadas por varias vistas. */
window.QCH = window.QCH || {};
QCH.vistas = QCH.vistas || {};

QCH.MESES = ['xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuño',
             'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro'];

QCH.dataLonga = function (d) {
  const data = d || new Date();
  return QCH.DIAS[(data.getDay() + 6) % 7].nome + ', ' + data.getDate() + ' de ' + QCH.MESES[data.getMonth()];
};

/* Etiqueta pequena con icona */
QCH.pill = function (icona, texto, clase) {
  return '<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ' +
    (clase || 'bg-tinta/5 text-tinta/70 dark:bg-white/10 dark:text-crema/70') + '">' +
    QCH.icona(icona, 'w-3.5 h-3.5', 2) + QCH.esc(texto) + '</span>';
};

/* Tempo + dificultade + categoría */
QCH.metaReceita = function (r) {
  const lumes = Array.from({ length: 3 }, (_, i) =>
    '<span class="' + (i < r.dificultade ? 'opacity-100 text-pemento' : 'opacity-20') + '">' +
      QCH.iconaChea('lume', 'w-3.5 h-3.5') + '</span>'
  ).join('');
  return '<div class="flex flex-wrap items-center gap-2">' +
    QCH.pill('reloxo', QCH.fmtTempo(r.tempo)) +
    '<span class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-tinta/5 text-tinta/70 dark:bg-white/10 dark:text-crema/70" title="' +
      QCH.esc(QCH.NIVEL_DIF[r.dificultade]) + '">' + lumes + '<span class="ml-0.5">' + QCH.esc(QCH.NIVEL_DIF[r.dificultade]) + '</span></span>' +
    (r.vexetariana ? QCH.pill('check', 'Vexetariana', 'bg-loureiro/12 text-loureiro dark:bg-loureiro/25 dark:text-[#8FC79E]') : '') +
    '</div>';
};

/* Barra de dispoñibilidade contra a neveira */
QCH.barraDispo = function (r) {
  const d = QCH.disponibilidade(r);
  const pct = Math.round(d.cobertura * 100);
  const cor = d.completa ? 'bg-loureiro' : (d.cobertura >= 0.7 ? 'bg-mel' : 'bg-pemento');
  const txt = d.completa
    ? 'Tes todo o que fai falta'
    : 'Fáltanche ' + d.faltan.length + (d.faltan.length === 1 ? ' ingrediente' : ' ingredientes');
  return '<div class="space-y-1.5">' +
    '<div class="flex items-center justify-between text-xs">' +
      '<span class="' + (d.completa ? 'text-loureiro dark:text-[#8FC79E] font-semibold' : 'text-tinta/60 dark:text-crema/60') + '">' + QCH.esc(txt) + '</span>' +
      '<span class="tabular-nums text-tinta/40 dark:text-crema/40">' + pct + '%</span>' +
    '</div>' +
    '<div class="h-1.5 rounded-full bg-tinta/8 dark:bg-white/10 overflow-hidden">' +
      '<div class="h-full rounded-full ' + cor + ' transition-[width] duration-700 ease-out" style="width:' + pct + '%"></div>' +
    '</div></div>';
};

/* Chips das adaptacións por comensal — o diferenciador do produto */
QCH.chipsAdaptacions = function (receitaId, max) {
  const lista = QCH.adaptacionsDe(receitaId);
  if (!lista.length) {
    return '<p class="text-xs text-tinta/45 dark:text-crema/45 italic">Todos comen o mesmo prato.</p>';
  }
  const tope = max || lista.length;
  const estilos = {
    sen:        'bg-tinta/6 text-tinta/75 dark:bg-white/10 dark:text-crema/75',
    substituir: 'bg-mel/18 text-[#8A5A10] dark:bg-mel/25 dark:text-[#F0C57A]',
    prato:      'bg-pemento/12 text-pemento dark:bg-pemento/25 dark:text-[#F0977F]'
  };
  let html = '<div class="flex flex-wrap gap-1.5">';
  lista.slice(0, tope).forEach(a => {
    html += '<span class="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full text-xs font-medium ' + estilos[a.tipo] + '" ' +
      'title="' + QCH.esc(a.persoa.nome + ' · ' + a.motivo) + '">' +
      QCH.avatar(a.persoa, 18) + QCH.esc(a.texto) + '</span>';
  });
  if (lista.length > tope) {
    html += '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-tinta/6 text-tinta/50 dark:bg-white/10 dark:text-crema/50">+' + (lista.length - tope) + '</span>';
  }
  return html + '</div>';
};

/* Tarxeta de receita para as grellas */
QCH.tarxetaReceita = function (r) {
  const d = QCH.disponibilidade(r);
  return '<article class="tarxeta group cursor-pointer rounded-3xl overflow-hidden bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 flex flex-col" ' +
    'data-accion="abrir-receita" data-id="' + r.id + '" tabindex="0" role="button" aria-label="Ver a receita de ' + QCH.esc(r.nome) + '">' +
    '<div class="relative aspect-[4/3] overflow-hidden">' +
      '<div class="absolute inset-0 transition-transform duration-500 group-hover:scale-105">' + QCH.imaxePrato(r) + '</div>' +
      (d.completa ? '<span class="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-loureiro text-white shadow-sm">' +
        QCH.icona('check', 'w-3 h-3', 2.5) + 'Podes facelo hoxe</span>' : '') +
    '</div>' +
    '<div class="p-4 flex flex-col gap-2.5 grow">' +
      '<h3 class="font-display text-lg leading-tight text-tinta dark:text-crema">' + QCH.esc(r.nome) + '</h3>' +
      '<p class="text-xs text-tinta/55 dark:text-crema/55 leading-relaxed line-clamp-2">' + QCH.esc(r.subtitulo) + '</p>' +
      '<div class="mt-auto pt-1">' + QCH.metaReceita(r) + '</div>' +
    '</div></article>';
};

/* Estado baleiro reutilizable */
QCH.baleiro = function (titulo, texto, accionHtml) {
  return '<div class="text-center py-16 px-6">' +
    '<div class="mx-auto w-14 h-14 rounded-2xl bg-tinta/5 dark:bg-white/10 grid place-items-center text-tinta/30 dark:text-crema/30 mb-4">' +
      QCH.icona('receitario', 'w-7 h-7') + '</div>' +
    '<h3 class="font-display text-xl text-tinta dark:text-crema mb-1.5">' + QCH.esc(titulo) + '</h3>' +
    '<p class="text-sm text-tinta/55 dark:text-crema/55 max-w-sm mx-auto">' + QCH.esc(texto) + '</p>' +
    (accionHtml ? '<div class="mt-5">' + accionHtml + '</div>' : '') +
    '</div>';
};

/* Botóns */
QCH.btn = function (texto, accion, opts) {
  const o = opts || {};
  // Mobile-first: en pantalla táctil os botóns nunca baixan de 44 px de alto
  // e non parten palabras. No escritorio poden ser máis compactos.
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pemento';
  const tam = o.pequeno
    ? 'text-xs px-4 min-h-[40px] md:min-h-[32px] md:px-3.5'
    : 'text-sm px-5 min-h-[44px] md:min-h-[38px]';
  const variantes = {
    primario:  'bg-pemento text-white hover:bg-[#B93A26] shadow-sm hover:shadow-md',
    secundario:'bg-tinta/6 text-tinta hover:bg-tinta/12 dark:bg-white/10 dark:text-crema dark:hover:bg-white/18',
    fantasma:  'text-tinta/70 hover:text-tinta hover:bg-tinta/6 dark:text-crema/70 dark:hover:text-crema dark:hover:bg-white/10'
  };
  return '<button type="button" class="' + base + ' ' + tam + ' ' + (variantes[o.variante || 'secundario']) + '" ' +
    'data-accion="' + accion + '"' + (o.datos || '') + (o.aria ? ' aria-label="' + QCH.esc(o.aria) + '"' : '') + '>' +
    (o.icona ? QCH.icona(o.icona, o.pequeno ? 'w-3.5 h-3.5' : 'w-4 h-4', 2) : '') + QCH.esc(texto) + '</button>';
};
