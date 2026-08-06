/* Vista "Familia": quen come e como come cada quen.
   Aquí é onde vive o diferenciador do produto, así que a vista ten que
   explicalo, non só listalo. */
window.QCH = window.QCH || {};
QCH.vistas = QCH.vistas || {};

QCH.vistas.familia = (function () {

  const ETIQUETA_TIPO = {
    sen:        { txt: 'Quita un ingrediente', cor: 'bg-tinta/8 text-tinta/70 dark:bg-white/10 dark:text-crema/70' },
    substituir: { txt: 'Cambia un ingrediente', cor: 'bg-mel/20 text-[#8A5A10] dark:bg-mel/25 dark:text-[#F0C57A]' },
    prato:      { txt: 'Come outro prato', cor: 'bg-pemento/12 text-pemento dark:bg-pemento/25 dark:text-[#F0977F]' }
  };

  function textoAdaptacion(a) {
    if (a.tipo === 'sen') return 'sen ' + QCH.ingrediente(a.ingrediente).nome.toLowerCase();
    if (a.tipo === 'substituir') return QCH.ingrediente(a.ingrediente).nome.toLowerCase() + ' → ' + QCH.ingrediente(a.por).nome.toLowerCase();
    return a.pratoAlt;
  }

  function tarxetaPersoa(p) {
    const s = QCH.estado.get();
    const activo = s.comensais.indexOf(p.id) !== -1;
    const claves = Object.keys(p.adaptacions);

    return '<article class="rounded-3xl bg-papel dark:bg-carbon border ' +
      (activo ? 'border-tinta/8 dark:border-white/10' : 'border-tinta/6 dark:border-white/6 opacity-55') +
      ' p-5 transition-opacity">' +
      '<div class="flex items-start gap-3 mb-3">' +
        QCH.avatar(p, 44) +
        '<div class="grow min-w-0">' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<h3 class="font-display text-xl text-tinta dark:text-crema">' + QCH.esc(p.nome) + '</h3>' +
            (p.cociña ? '<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pemento/12 text-pemento">Cociña</span>' : '') +
          '</div>' +
          '<p class="text-xs text-tinta/50 dark:text-crema/50 mt-0.5">' + QCH.esc(p.nota) + '</p>' +
        '</div>' +
        '<button type="button" data-accion="editar-persoa" data-id="' + p.id + '" aria-label="Editar ' + QCH.esc(p.nome) + '" ' +
          'class="shrink-0 w-9 h-9 rounded-full grid place-items-center text-tinta/35 hover:text-pemento hover:bg-pemento/10 dark:text-crema/35">' +
          QCH.icona('editar', 'w-4 h-4', 2) + '</button>' +
        // O interruptor vese de 44×24, pero a zona que se toca é de 48×44.
        '<button type="button" data-accion="toggle-comensal" data-id="' + p.id + '" role="switch" aria-checked="' + activo + '" ' +
          'aria-label="' + QCH.esc(p.nome) + ' come na casa" ' +
          'class="shrink-0 w-12 h-11 md:h-9 grid place-items-center -mr-1.5">' +
          '<span class="relative block w-11 h-6 rounded-full transition-colors ' + (activo ? 'bg-loureiro' : 'bg-tinta/15 dark:bg-white/15') + '">' +
            '<span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ' + (activo ? 'left-[22px]' : 'left-0.5') + '"></span>' +
          '</span>' +
        '</button>' +
      '</div>' +

      (p.restricions.length
        ? '<div class="flex flex-wrap gap-1.5 mb-3">' + p.restricions.map(r =>
            '<span class="text-xs font-medium px-2.5 py-1 rounded-full bg-loureiro/12 text-loureiro dark:bg-loureiro/25 dark:text-[#8FC79E]">' + QCH.esc(r) + '</span>').join('') + '</div>'
        : '') +

      (claves.length
        ? '<div class="space-y-2 pt-3 border-t border-tinta/6 dark:border-white/8">' +
            '<p class="text-[11px] font-bold uppercase tracking-[.12em] text-tinta/40 dark:text-crema/40">' +
              claves.length + (claves.length === 1 ? ' adaptación' : ' adaptacións') + '</p>' +
            claves.map(rid => {
              const r = QCH.receita(rid); const a = p.adaptacions[rid];
              if (!r) return '';
              const et = ETIQUETA_TIPO[a.tipo];
              return '<div class="flex items-start gap-2.5 text-sm cursor-pointer group" data-accion="abrir-receita" data-id="' + rid + '">' +
                '<div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 mt-0.5">' + QCH.imaxePrato(r) + '</div>' +
                '<div class="min-w-0 grow">' +
                  '<p class="text-tinta dark:text-crema group-hover:text-pemento transition-colors leading-tight">' + QCH.esc(r.nome) + '</p>' +
                  '<p class="text-xs text-tinta/55 dark:text-crema/55 leading-snug">' + QCH.esc(textoAdaptacion(a)) + '</p>' +
                  '<span class="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ' + et.cor + '">' + et.txt + '</span>' +
                '</div></div>';
            }).join('') +
          '</div>'
        : '<p class="text-xs text-tinta/40 dark:text-crema/40 italic pt-3 border-t border-tinta/6 dark:border-white/8">' +
            // Con restricións xerais pero sen axustes por prato, dicir "come de
            // todo" contradiría a etiqueta que hai xusto enriba.
            (p.restricions.length ? 'Sen axustes en ningunha receita concreta.' : 'Come de todo, sen axustes.') +
          '</p>') +

      '</article>';
  }

  return {
    render() {
      const s = QCH.estado.get();
      const activos = s.comensais.length;
      const totalAdap = QCH.PERSOAS.reduce((n, p) => n + Object.keys(p.adaptacions).length, 0);

      return '<div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">' +
        '<header class="mb-7 anim-entrada flex flex-wrap items-start justify-between gap-4">' +
          '<div>' +
            '<h1 class="font-display text-3xl sm:text-4xl text-tinta dark:text-crema mb-2">A familia</h1>' +
            '<p class="text-tinta/55 dark:text-crema/55 max-w-2xl">' + activos + ' de ' + QCH.PERSOAS.length + ' comensais na mesa e ' +
              totalAdap + ' adaptacións apuntadas. Apaga a quen non coma na casa: as cantidades da compra recalcúlanse soas.</p>' +
          '</div>' +
          QCH.btn('Nova persoa', 'nova-persoa', { variante: 'primario', icona: 'mais' }) +
        '</header>' +

        '<div class="rounded-3xl bg-tinta dark:bg-carbon text-crema p-6 sm:p-7 mb-6 anim-entrada" style="animation-delay:.06s">' +
          '<h2 class="font-display text-xl sm:text-2xl mb-2">As regras non son da persoa. Son da persoa e do prato.</h2>' +
          '<p class="text-crema/70 text-sm leading-relaxed max-w-3xl mb-5">' +
            'Isabel non quere cebola <em>na tortilla</em>, pero cómea sen problema <em>na empanada</em>. ' +
            'Unha regra global do tipo «Isabel: sen cebola» sería falsa e acabaría ignorada. ' +
            'Por iso aquí cada axuste vai atado a unha receita concreta.</p>' +
          '<div class="grid sm:grid-cols-3 gap-3">' +
            [['1', 'Quitar', 'Sácase un ingrediente dese prato.'],
             ['2', 'Cambiar', 'Trócase por outro só nese prato.'],
             ['3', 'Outro prato', 'Esa persoa come algo distinto ese día.']].map(n =>
              '<div class="rounded-2xl bg-white/8 p-4">' +
                '<span class="inline-grid place-items-center w-6 h-6 rounded-full bg-pemento text-white text-xs font-bold mb-2">' + n[0] + '</span>' +
                '<p class="font-semibold text-sm mb-0.5">' + n[1] + '</p>' +
                '<p class="text-xs text-crema/60 leading-snug">' + n[2] + '</p>' +
              '</div>').join('') +
          '</div>' +
        '</div>' +

        '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 anim-entrada" style="animation-delay:.12s">' +
          QCH.PERSOAS.map(p => tarxetaPersoa(p)).join('') +
        '</div></div>';
    }
  };
})();
