/* Vista "Hoxe": a pantalla que responde á pregunta que dá nome á app.
   Está pensada para o consultor pasivo — o que só quere saber que hai de
   comer sen ter que navegar por ningures. Por iso é a vista de inicio. */
window.QCH = window.QCH || {};
QCH.vistas = QCH.vistas || {};

QCH.vistas.hoxe = (function () {

  /* Un xantar ao día e un cociñeiro: o resumo é unha frase soa. */
  function resumo(dia) {
    const s = QCH.estado.get();
    const k = QCH.slot(dia.id, 'xantar');
    const r = QCH.receita(s.semana[k]);
    if (!r) return 'Aínda non hai nada decidido para hoxe.';
    const p = QCH.persoa(s.cociñeiros[k]);
    return 'Hoxe hai ' + r.nome.toLowerCase() + '.' + (p ? ' Cociña ' + p.nome + '.' : '');
  }

  function tarxetaComida(dia, comida) {
    const s = QCH.estado.get();
    const k = QCH.slot(dia.id, comida.id);
    const r = QCH.receita(s.semana[k]);
    const cociñeiro = QCH.persoa(s.cociñeiros[k]);

    const cabeceira = '<div class="flex items-center justify-between mb-3">' +
      '<span class="text-[11px] font-bold uppercase tracking-[.14em] text-pemento">' + QCH.esc(comida.nome) + '</span>' +
      (cociñeiro && r ? '<span class="inline-flex items-center gap-1.5 text-xs text-tinta/55 dark:text-crema/55">' +
        QCH.avatar(cociñeiro, 20) + 'cociña ' + QCH.esc(cociñeiro.nome) + '</span>' : '') +
      '</div>';

    if (!r) {
      return '<article class="rounded-3xl border-2 border-dashed border-tinta/15 dark:border-white/15 p-6 flex flex-col min-h-[280px]">' +
        cabeceira +
        '<div class="grow grid place-items-center text-center">' +
          '<div>' +
            '<p class="font-display text-xl text-tinta/70 dark:text-crema/70 mb-1">Sen decidir</p>' +
            '<p class="text-sm text-tinta/45 dark:text-crema/45 mb-4">Ninguén escolleu aínda o ' + QCH.esc(comida.nome.toLowerCase()) + '.</p>' +
            QCH.btn('Escoller prato', 'abrir-selector', { variante: 'primario', icona: 'mais', datos: ' data-dia="' + dia.id + '" data-comida="' + comida.id + '"' }) +
          '</div>' +
        '</div></article>';
    }

    return '<article class="tarxeta-hoxe rounded-3xl overflow-hidden bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 flex flex-col">' +
      '<div class="relative aspect-[16/9] cursor-pointer group" data-accion="abrir-receita" data-id="' + r.id + '">' +
        '<div class="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">' + QCH.imaxePrato(r) + '</div>' +
        '<div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 to-transparent"></div>' +
        '<div class="absolute inset-x-0 bottom-0 p-5">' +
          '<span class="text-[11px] font-bold uppercase tracking-[.14em] text-white/85">' + QCH.esc(comida.nome) + '</span>' +
          '<h2 class="font-display text-2xl sm:text-3xl text-white leading-tight mt-0.5">' + QCH.esc(r.nome) + '</h2>' +
        '</div>' +
      '</div>' +
      '<div class="p-5 flex flex-col gap-4 grow">' +
        (cociñeiro ? '<div class="flex items-center gap-2 text-sm text-tinta/60 dark:text-crema/60">' +
          QCH.avatar(cociñeiro, 24) + '<span>Cociña <strong class="font-semibold text-tinta dark:text-crema">' + QCH.esc(cociñeiro.nome) + '</strong></span></div>' : '') +
        '<p class="text-sm text-tinta/60 dark:text-crema/60 leading-relaxed">' + QCH.esc(r.subtitulo) + '</p>' +
        QCH.metaReceita(r) +
        QCH.barraDispo(r) +
        '<div>' +
          '<p class="text-[11px] font-bold uppercase tracking-[.12em] text-tinta/40 dark:text-crema/40 mb-2">Na mesa</p>' +
          QCH.chipsAdaptacions(r.id, 4) +
        '</div>' +
        '<div class="flex gap-2 mt-auto pt-1">' +
          QCH.btn('Ver receita', 'abrir-receita', { variante: 'primario', datos: ' data-id="' + r.id + '"' }) +
          QCH.btn('Cambiar', 'abrir-selector', { variante: 'fantasma', datos: ' data-dia="' + dia.id + '" data-comida="' + comida.id + '"' }) +
        '</div>' +
      '</div></article>';
  }

  function tiraMañá() {
    const s = QCH.estado.get();
    const mañá = QCH.DIAS[(QCH.hoxeIdx() + 1) % 7];
    const pratos = QCH.COMIDAS.map(c => ({ c, r: QCH.receita(s.semana[QCH.slot(mañá.id, c.id)]) }));
    if (!pratos.some(p => p.r)) return '';
    return '<section class="mt-10">' +
      '<div class="flex items-baseline justify-between mb-4">' +
        '<h2 class="font-display text-xl text-tinta dark:text-crema">E mañá, ' + QCH.esc(mañá.nome.toLowerCase()) + '</h2>' +
        QCH.btn('Ver a semana', 'ir-semana', { variante: 'fantasma', pequeno: true, icona: 'dereita' }) +
      '</div>' +
      '<div class="grid gap-3 max-w-md">' +
        pratos.filter(p => p.r).map(p =>
          '<div class="flex items-center gap-3 p-3 rounded-2xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 cursor-pointer hover:border-pemento/40 transition-colors" ' +
            'data-accion="abrir-receita" data-id="' + p.r.id + '">' +
            '<div class="w-16 h-16 rounded-xl overflow-hidden shrink-0">' + QCH.imaxePrato(p.r) + '</div>' +
            '<div class="min-w-0">' +
              '<span class="text-[10px] font-bold uppercase tracking-[.14em] text-tinta/40 dark:text-crema/40">' + QCH.esc(p.c.nome) + '</span>' +
              '<p class="font-display text-base text-tinta dark:text-crema truncate">' + QCH.esc(p.r.nome) + '</p>' +
              '<p class="text-xs text-tinta/45 dark:text-crema/45">' + QCH.fmtTempo(p.r.tempo) + '</p>' +
            '</div>' +
          '</div>').join('') +
      '</div></section>';
  }

  return {
    render() {
      const dia = QCH.diaHoxe();
      const n = QCH.numComensais();
      return '<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">' +
        '<header class="mb-8 sm:mb-10 anim-entrada">' +
          '<p class="text-[11px] font-bold uppercase tracking-[.18em] text-pemento mb-2">' + QCH.esc(QCH.dataLonga()) + '</p>' +
          '<h1 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-tinta dark:text-crema mb-3">Que comemos hoxe?</h1>' +
          '<p class="text-base sm:text-lg text-tinta/60 dark:text-crema/60 max-w-2xl leading-relaxed">' + QCH.esc(resumo(dia)) + '</p>' +
          // Non un enlace no medio dun parágrafo: nun móbil iso é un obxectivo
          // de 20 px de alto. Un botón de verdade, ao lado do texto.
          '<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">' +
            '<span class="text-sm text-tinta/40 dark:text-crema/40">Para ' + n + (n === 1 ? ' comensal' : ' comensais') + '</span>' +
            QCH.btn('Axustar quen come', 'ir-familia', { variante: 'fantasma', pequeno: true, icona: 'familia' }) +
          '</div>' +
        '</header>' +
        // Un só xantar: unha tarxeta, non unha grella de dúas.
        '<div class="max-w-2xl anim-entrada" style="animation-delay:.08s">' +
          QCH.COMIDAS.map(c => tarxetaComida(dia, c)).join('') +
        '</div>' +
        '<div class="anim-entrada" style="animation-delay:.16s">' + tiraMañá() + '</div>' +
      '</div>';
    }
  };
})();
