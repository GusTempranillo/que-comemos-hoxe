/* Vista "Semana": o calendario de menús e o xerador.
   O xerador non decide só: propón, explica por que, e déixase corrixir.

   Deseño mobile-first: no móbil cada oco é unha fila compacta (miniatura
   á esquerda, texto á dereita) porque son sete ocos e hai que poder pasalos
   co polgar. A partir de md convértese na grella de 7 columnas. */
window.QCH = window.QCH || {};
QCH.vistas = QCH.vistas || {};

QCH.vistas.semana = (function () {

  let modo = 'equilibrado';
  let motivos = {};
  let verMotivos = false;

  function cela(dia, comida, ehoxe) {
    const s = QCH.estado.get();
    const k = QCH.slot(dia.id, comida.id);
    const r = QCH.receita(s.semana[k]);
    const datos = ' data-dia="' + dia.id + '" data-comida="' + comida.id + '"';
    // No móbil pode crecer (o texto manda); no escritorio vai fixo para que
    // as 7 columnas aliñen fila con fila.
    const alto = 'min-h-[88px] ' + (verMotivos ? 'md:h-[168px]' : 'md:h-[132px]');

    if (!r) {
      return '<div class="cela-oco ' + alto + ' rounded-2xl border-2 border-dashed border-tinta/12 dark:border-white/12 ' +
        'flex flex-row md:flex-col items-center justify-center gap-2 cursor-pointer hover:border-pemento/50 hover:bg-pemento/4 transition-colors px-3" ' +
        'data-accion="abrir-selector"' + datos + ' role="button" tabindex="0" aria-label="Escoller ' + QCH.esc(comida.nome) + ' do ' + QCH.esc(dia.nome) + '">' +
        '<span class="text-tinta/25 dark:text-crema/25 shrink-0">' + QCH.icona('mais', 'w-5 h-5', 2) + '</span>' +
        '<span class="md:hidden text-sm text-tinta/35 dark:text-crema/35">Sen decidir</span>' +
        '</div>';
    }

    const d = QCH.disponibilidade(r);
    const punto = d.completa ? 'bg-loureiro' : (d.cobertura >= 0.7 ? 'bg-mel' : 'bg-pemento');
    const razon = (motivos[k] && motivos[k].length) ? motivos[k].join(' · ') : '';

    return '<div class="cela group relative ' + alto + ' rounded-2xl overflow-hidden bg-papel dark:bg-carbon border ' +
      (ehoxe ? 'border-pemento/45' : 'border-tinta/8 dark:border-white/10') +
      ' cursor-pointer hover:border-pemento/45 transition-colors flex flex-row md:flex-col" ' +
      'data-accion="abrir-selector"' + datos + ' role="button" tabindex="0"' +
      (razon ? ' title="' + QCH.esc(razon) + '"' : '') + '>' +

      '<div class="relative h-full w-[92px] md:w-full md:h-14 shrink-0">' + QCH.imaxePrato(r) +
        '<span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ' + punto + ' ring-2 ring-white/70 dark:ring-black/40" title="' +
          (d.completa ? 'Tes todos os ingredientes' : 'Fáltanche ingredientes') + '"></span>' +
      '</div>' +

      '<div class="px-3 py-2 md:p-2.5 flex flex-col justify-center md:justify-start grow min-w-0">' +
        (QCH.COMIDAS.length > 1
          ? '<span class="md:hidden text-[10px] font-bold uppercase tracking-[.14em] text-tinta/35 dark:text-crema/35 mb-0.5">' + QCH.esc(comida.nome) + '</span>'
          : '') +
        '<p class="font-display text-[15px] md:text-[13px] leading-snug text-tinta dark:text-crema line-clamp-2">' + QCH.esc(r.nome) + '</p>' +
        '<p class="text-[11px] text-tinta/40 dark:text-crema/40 mt-0.5 md:mt-auto md:pt-1">' + QCH.fmtTempo(r.tempo) + '</p>' +
        (verMotivos && razon ? '<p class="text-[10px] leading-snug text-tinta/45 dark:text-crema/45 italic mt-1 line-clamp-2">' + QCH.esc(razon) + '</p>' : '') +
      '</div>' +

      // Só no escritorio: no móbil quítase o prato desde o propio selector,
      // así non hai obxectivos diminutos nin toques accidentais.
      '<button type="button" class="hidden md:grid absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/45 text-white place-items-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" ' +
        'data-accion="baleirar-slot"' + datos + ' aria-label="Quitar este prato">' + QCH.icona('pechar', 'w-3 h-3', 2.5) + '</button>' +
      '</div>';
  }

  function columnaDia(dia, i) {
    const ehoxe = i === QCH.hoxeIdx();
    return '<section class="dia-col flex flex-col gap-2">' +
      '<div class="flex items-center gap-2 md:justify-center px-0.5">' +
        '<h2 class="font-display text-base md:text-sm ' + (ehoxe ? 'text-pemento font-bold' : 'text-tinta/70 dark:text-crema/70') + '">' +
          '<span class="md:hidden">' + QCH.esc(dia.nome) + '</span><span class="hidden md:inline">' + QCH.esc(dia.curto) + '</span></h2>' +
        (ehoxe ? '<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pemento text-white">Hoxe</span>' : '') +
      '</div>' +
      QCH.COMIDAS.map(c => cela(dia, c, ehoxe)).join('') +
      '</section>';
  }

  function panelCompra() {
    const lista = QCH.listaDaCompra();
    if (!lista.length) {
      return '<div class="rounded-3xl bg-loureiro/8 dark:bg-loureiro/15 border border-loureiro/25 p-5 flex items-center gap-3">' +
        '<span class="text-loureiro dark:text-[#8FC79E] shrink-0">' + QCH.icona('check', 'w-6 h-6', 2) + '</span>' +
        '<div><p class="font-display text-lg text-tinta dark:text-crema">Non che falta nada</p>' +
        '<p class="text-sm text-tinta/55 dark:text-crema/55">Tes na neveira todo o que precisa a semana enteira.</p></div></div>';
    }
    const porCat = {};
    lista.forEach(it => { (porCat[it.cat] = porCat[it.cat] || []).push(it); });
    return '<div class="rounded-3xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-5">' +
      '<div class="flex items-center gap-2.5 mb-1">' +
        '<span class="text-pemento shrink-0">' + QCH.icona('compra', 'w-5 h-5', 2) + '</span>' +
        '<h2 class="font-display text-lg text-tinta dark:text-crema">Fáltache mercar</h2>' +
      '</div>' +
      '<p class="text-sm text-tinta/50 dark:text-crema/50 mb-4">Calculado restando o que xa tes na neveira, para ' + QCH.numComensais() + ' comensais.</p>' +
      '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">' +
      Object.keys(porCat).map(cat =>
        '<div>' +
          '<h3 class="text-[11px] font-bold uppercase tracking-[.12em] mb-1.5" style="color:' + QCH.CATEGORIAS[cat].cor + '">' + QCH.esc(QCH.CATEGORIAS[cat].nome) + '</h3>' +
          '<ul class="space-y-1">' + porCat[cat].map(it =>
            '<li class="flex items-baseline justify-between gap-3 text-sm">' +
              '<span class="text-tinta/75 dark:text-crema/75">' + QCH.esc(QCH.ingrediente(it.id).nome) + '</span>' +
              '<span class="tabular-nums text-xs text-tinta/45 dark:text-crema/45 shrink-0">' + QCH.fmtCant(it.cant) + ' ' + QCH.esc(it.unid) + '</span>' +
            '</li>').join('') + '</ul>' +
        '</div>').join('') +
      '</div></div>';
  }

  return {
    setModo(m) { modo = m; },
    getModo() { return modo; },
    setMotivos(m) { motivos = m || {}; },
    alternarMotivos() { verMotivos = !verMotivos; return verMotivos; },

    render() {
      return '<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">' +
        '<header class="mb-6 anim-entrada">' +
          '<h1 class="font-display text-3xl sm:text-4xl text-tinta dark:text-crema mb-2">A semana</h1>' +
          '<p class="text-tinta/55 dark:text-crema/55 max-w-2xl">Un xantar por día, sete en total. Podes poñelos a man, prato a prato, ou deixar que a app propoña a semana enteira e corrixir o que non che cadre.</p>' +
        '</header>' +

        '<div class="mb-6 rounded-3xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-4 sm:p-5 anim-entrada" style="animation-delay:.06s">' +
          '<div class="flex flex-col lg:flex-row lg:items-end gap-4">' +
            '<div class="grow min-w-0">' +
              '<p class="text-[11px] font-bold uppercase tracking-[.12em] text-tinta/40 dark:text-crema/40 mb-2">Como queres a semana</p>' +
              // No móbil despráza en horizontal: tres tarxetas non collen a lo ancho.
              '<div class="flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible -mx-1 px-1 pb-1 lg:mx-0 lg:px-0 lg:pb-0" role="radiogroup" aria-label="Modo do xerador">' +
                QCH.MODOS.map(m =>
                  '<button type="button" role="radio" aria-checked="' + (modo === m.id) + '" data-accion="modo" data-modo="' + m.id + '" ' +
                    'class="shrink-0 text-left px-3.5 py-2.5 rounded-2xl border transition-all w-[190px] lg:w-auto ' +
                    (modo === m.id ? 'border-pemento bg-pemento/8 dark:bg-pemento/15' : 'border-tinta/10 dark:border-white/10 hover:border-tinta/25 dark:hover:border-white/25') + '">' +
                    '<span class="block text-sm font-semibold ' + (modo === m.id ? 'text-pemento' : 'text-tinta dark:text-crema') + '">' + QCH.esc(m.nome) + '</span>' +
                    '<span class="block text-[11px] text-tinta/45 dark:text-crema/45 lg:max-w-[190px] leading-snug">' + QCH.esc(m.desc) + '</span>' +
                  '</button>').join('') +
              '</div>' +
            '</div>' +
            // Os dous botóns con texto que non parte non caben un ao lado do
            // outro por debaixo de sm: apílanse.
            '<div class="flex flex-col sm:flex-row gap-2 lg:shrink-0">' +
              '<div class="grow lg:grow-0 [&>button]:w-full">' +
                QCH.btn(verMotivos ? 'Ocultar motivos' : 'Ver por que', 'alternar-motivos', { variante: 'secundario', icona: 'info' }) + '</div>' +
              '<div class="grow lg:grow-0 [&>button]:w-full">' +
                QCH.btn('Xerar semana', 'xerar-semana', { variante: 'primario', icona: 'xerar' }) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div id="grella-semana" class="grid grid-cols-1 md:grid-cols-7 gap-x-3 gap-y-5 md:gap-y-3 mb-8 anim-entrada" style="animation-delay:.12s">' +
          QCH.DIAS.map((d, i) => columnaDia(d, i)).join('') +
        '</div>' +

        '<div class="anim-entrada" style="animation-delay:.18s">' + panelCompra() + '</div>' +
      '</div>';
    }
  };
})();
