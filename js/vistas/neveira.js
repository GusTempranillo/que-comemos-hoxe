/* Vista "Neveira": o inventario do que hai na casa.
   É o que fai que o resto da app deixe de ser un recetario bonito:
   sen saber o que hai, non se pode suxerir nada útil. */
window.QCH = window.QCH || {};
QCH.vistas = QCH.vistas || {};

QCH.vistas.neveira = (function () {

  let busca = '';

  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function fila(id, cant) {
    const ing = QCH.ingrediente(id);
    // Mobile-first: 40 px de lado no móbil (o polgar non acerta en 28),
    // 32 px no escritorio, onde hai punteiro.
    const btn = 'w-10 h-10 md:w-8 md:h-8 rounded-full grid place-items-center transition-colors shrink-0';
    return '<li class="flex items-center gap-1.5 sm:gap-2 py-1 border-b border-tinta/6 dark:border-white/8 last:border-0">' +
      '<span class="w-2 h-2 rounded-full shrink-0" style="background:' + QCH.CATEGORIAS[ing.cat].cor + '"></span>' +
      '<button type="button" data-accion="ing-editar-abrir" data-id="' + id + '" aria-label="Editar ' + QCH.esc(ing.nome) + '" ' +
        'class="text-sm text-tinta dark:text-crema grow truncate min-w-0 text-left hover:text-pemento transition-colors">' + QCH.esc(ing.nome) + '</button>' +
      '<div class="flex items-center gap-0.5 sm:gap-1 shrink-0">' +
        '<button type="button" data-accion="nev-menos" data-id="' + id + '" aria-label="Quitar ' + QCH.esc(ing.nome) + '" ' +
          'class="' + btn + ' text-tinta/50 dark:text-crema/50 hover:bg-tinta/8 dark:hover:bg-white/10">' +
          QCH.icona('menos', 'w-4 h-4', 2.5) + '</button>' +
        '<span class="text-xs tabular-nums text-tinta/60 dark:text-crema/60 w-[62px] sm:w-20 text-center shrink-0">' +
          QCH.fmtCant(cant) + ' ' + QCH.esc(ing.unid) + '</span>' +
        '<button type="button" data-accion="nev-mais" data-id="' + id + '" aria-label="Engadir ' + QCH.esc(ing.nome) + '" ' +
          'class="' + btn + ' text-tinta/50 dark:text-crema/50 hover:bg-tinta/8 dark:hover:bg-white/10">' +
          QCH.icona('mais', 'w-4 h-4', 2.5) + '</button>' +
        '<button type="button" data-accion="nev-quitar" data-id="' + id + '" aria-label="Sacar ' + QCH.esc(ing.nome) + ' da neveira" ' +
          'class="' + btn + ' text-tinta/30 dark:text-crema/30 hover:text-pemento hover:bg-pemento/10">' +
          QCH.icona('lixo', 'w-4 h-4', 2) + '</button>' +
      '</div></li>';
  }

  function candidatos() {
    const nev = QCH.estado.get().neveira;
    const q = normalizar(busca.trim());
    if (!q) return [];
    return QCH.INGREDIENTES
      .filter(i => nev[i.id] === undefined && normalizar(i.nome).indexOf(q) !== -1)
      .slice(0, 6);
  }

  return {
    setBusca(v) { busca = v; },
    getBusca() { return busca; },

    render() {
      const s = QCH.estado.get();
      const ids = Object.keys(s.neveira).filter(id => s.neveira[id] > 0);
      const porCat = {};
      ids.forEach(id => { const c = QCH.ingrediente(id).cat; (porCat[c] = porCat[c] || []).push(id); });
      Object.keys(porCat).forEach(c => porCat[c].sort((a, b) => QCH.ingrediente(a).nome.localeCompare(QCH.ingrediente(b).nome)));

      const podo = QCH.RECEITAS.filter(r => QCH.disponibilidade(r).completa);
      const cands = candidatos();

      return '<div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">' +
        '<header class="mb-7 anim-entrada flex flex-wrap items-start justify-between gap-4">' +
          '<div>' +
            '<h1 class="font-display text-3xl sm:text-4xl text-tinta dark:text-crema mb-2">A neveira</h1>' +
            '<p class="text-tinta/55 dark:text-crema/55 max-w-2xl">' + ids.length + ' cousas apuntadas. Non fai falta que estea perfecta: canto máis se pareza á realidade, mellores serán as suxestións.</p>' +
          '</div>' +
          QCH.btn('Novo ingrediente', 'ing-crear-abrir', { variante: 'secundario', icona: 'mais' }) +
        '</header>' +

        '<div class="grid lg:grid-cols-[1fr_340px] gap-6 items-start">' +

          '<div class="min-w-0 rounded-3xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-5 anim-entrada" style="animation-delay:.06s">' +
            '<div class="relative mb-4">' +
              '<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta/35 dark:text-crema/35 pointer-events-none">' + QCH.icona('mais', 'w-4 h-4', 2) + '</span>' +
              '<input type="text" data-accion="buscar-ingrediente" data-foco="ing" value="' + QCH.esc(busca) + '" ' +
                'placeholder="Engadir algo á neveira…" aria-label="Engadir ingrediente" ' +
                'class="w-full pl-10 pr-4 py-2.5 rounded-full bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
              (cands.length
                ? '<div class="absolute z-30 left-0 right-0 mt-1.5 rounded-2xl bg-papel dark:bg-carbon border border-tinta/10 dark:border-white/12 shadow-xl overflow-hidden">' +
                    cands.map(i => '<button type="button" data-accion="nev-engadir" data-id="' + i.id + '" ' +
                      'class="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-pemento/8 transition-colors">' +
                      '<span class="w-2 h-2 rounded-full shrink-0" style="background:' + QCH.CATEGORIAS[i.cat].cor + '"></span>' +
                      '<span class="text-sm text-tinta dark:text-crema grow">' + QCH.esc(i.nome) + '</span>' +
                      '<span class="text-xs text-tinta/40 dark:text-crema/40">' + QCH.esc(QCH.CATEGORIAS[i.cat].nome) + '</span>' +
                      '</button>').join('') +
                  '</div>'
                : (busca.trim()
                    ? '<div class="absolute z-30 left-0 right-0 mt-1.5 rounded-2xl bg-papel dark:bg-carbon border border-tinta/10 dark:border-white/12 shadow-xl p-3 flex items-center justify-between gap-3">' +
                        '<p class="text-xs text-tinta/50 dark:text-crema/50">Nada novo con ese nome.</p>' +
                        QCH.btn('Crear "' + busca.trim() + '"', 'ing-crear-abrir', { variante: 'primario', pequeno: true, icona: 'mais' }) +
                      '</div>'
                    : '')) +
            '</div>' +

            (ids.length
              ? Object.keys(porCat).sort().map(cat =>
                  '<section class="mb-5 last:mb-0">' +
                    '<h2 class="text-[11px] font-bold uppercase tracking-[.12em] mb-1" style="color:' + QCH.CATEGORIAS[cat].cor + '">' +
                      QCH.esc(QCH.CATEGORIAS[cat].nome) + '</h2>' +
                    '<ul>' + porCat[cat].map(id => fila(id, s.neveira[id])).join('') + '</ul>' +
                  '</section>').join('')
              : QCH.baleiro('A neveira está baleira', 'Engade o que teñas na casa e a app empezará a suxerir pratos que poidas facer hoxe mesmo.')) +
          '</div>' +

          '<div class="min-w-0 rounded-3xl bg-loureiro/8 dark:bg-loureiro/12 border border-loureiro/25 p-5 anim-entrada lg:sticky lg:top-[76px]" style="animation-delay:.12s">' +
            '<div class="flex items-center gap-2 mb-1">' +
              '<span class="text-loureiro dark:text-[#8FC79E]">' + QCH.icona('check', 'w-5 h-5', 2.2) + '</span>' +
              '<h2 class="font-display text-lg text-tinta dark:text-crema">Podes facer agora</h2>' +
            '</div>' +
            '<p class="text-sm text-tinta/55 dark:text-crema/55 mb-4">Sen ir mercar nada, para ' + QCH.numComensais() + ' comensais.</p>' +
            (podo.length
              ? '<ul class="space-y-2">' + podo.map(r =>
                  '<li class="flex items-center gap-3 p-2 rounded-2xl bg-papel/70 dark:bg-carbon/70 cursor-pointer hover:bg-papel dark:hover:bg-carbon transition-colors" ' +
                    'data-accion="abrir-receita" data-id="' + r.id + '">' +
                    '<div class="w-11 h-11 rounded-xl overflow-hidden shrink-0">' + QCH.imaxePrato(r) + '</div>' +
                    '<div class="min-w-0"><p class="font-display text-sm text-tinta dark:text-crema truncate">' + QCH.esc(r.nome) + '</p>' +
                    '<p class="text-[11px] text-tinta/45 dark:text-crema/45">' + QCH.fmtTempo(r.tempo) + '</p></div>' +
                  '</li>').join('') + '</ul>'
              : '<p class="text-sm text-tinta/50 dark:text-crema/50 italic">Con isto aínda non sae ningún prato enteiro. Engade un par de cousas máis.</p>') +
          '</div>' +

        '</div></div>';
    }
  };
})();
