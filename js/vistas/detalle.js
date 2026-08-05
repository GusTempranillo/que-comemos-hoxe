/* Modais: ficha de receita e selector de prato para un oco do calendario.
   A ficha non é só a receita: é a receita xa traducida ao que hai que facer
   distinto para cada persoa da mesa. Aí está o valor. */
window.QCH = window.QCH || {};

QCH.modal = (function () {
  let cont, previo = null;

  function nodo() {
    if (!cont) cont = document.getElementById('modal');
    return cont;
  }

  function abrir(html) {
    const c = nodo();
    previo = document.activeElement;
    c.innerHTML = html;
    c.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    const panel = c.querySelector('.panel-modal');
    if (window.gsap && panel) {
      gsap.fromTo(c.querySelector('.veo-modal'), { opacity: 0 }, { opacity: 1, duration: .22, ease: 'power2.out' });
      gsap.fromTo(panel, { opacity: 0, y: 26, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .34, ease: 'power3.out' });
    }
    const foco = c.querySelector('[data-autofoco]') || c.querySelector('button');
    if (foco) foco.focus();
  }

  function pechar() {
    const c = nodo();
    if (c.classList.contains('hidden')) return;
    c.classList.add('hidden');
    c.innerHTML = '';
    document.body.classList.remove('overflow-hidden');
    if (previo && previo.focus) previo.focus();
    previo = null;
  }

  function envoltorio(interior, ancho) {
    return '<div class="veo-modal fixed inset-0 z-50 bg-tinta/55 backdrop-blur-sm" data-accion="pechar-modal"></div>' +
      '<div class="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-6 pointer-events-none overflow-y-auto">' +
        '<div class="panel-modal pointer-events-auto w-full ' + (ancho || 'sm:max-w-3xl') +
          ' bg-crema dark:bg-fondo rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto" ' +
          'role="dialog" aria-modal="true">' + interior + '</div>' +
      '</div>';
  }

  return { abrir, pechar, envoltorio, aberto: () => nodo() && !nodo().classList.contains('hidden') };
})();

/* ---------- Ficha de receita ---------- */
QCH.abrirReceita = function (id) {
  const r = QCH.receita(id);
  if (!r) return;
  const n = QCH.numComensais();
  const disp = QCH.disponibilidade(r);
  const nev = QCH.estado.get().neveira;
  const adap = QCH.adaptacionsDe(r.id);

  const ingredientes = r.ingredientes.map(ing => {
    const info = QCH.ingrediente(ing.id);
    const precisa = QCH.cantidadeReal(r, ing);
    const teño = nev[ing.id] || 0;
    const ok = teño >= precisa;
    return '<li class="flex items-baseline gap-2.5 py-1.5">' +
      '<span class="shrink-0 mt-0.5 ' + (ok ? 'text-loureiro dark:text-[#8FC79E]' : 'text-tinta/25 dark:text-crema/25') + '">' +
        QCH.icona(ok ? 'check' : 'mais', 'w-3.5 h-3.5', 2.5) + '</span>' +
      '<span class="grow text-sm ' + (ok ? 'text-tinta dark:text-crema' : 'text-tinta/60 dark:text-crema/60') + '">' + QCH.esc(info.nome) + '</span>' +
      '<span class="shrink-0 text-xs tabular-nums text-tinta/45 dark:text-crema/45">' + QCH.fmtCant(precisa) + ' ' + QCH.esc(ing.unid) + '</span>' +
      '</li>';
  }).join('');

  const pasos = r.pasos.map((p, i) =>
    '<li class="flex gap-3.5 pb-4 last:pb-0">' +
      '<span class="shrink-0 w-7 h-7 rounded-full bg-pemento/10 text-pemento grid place-items-center text-xs font-bold">' + (i + 1) + '</span>' +
      '<p class="text-sm text-tinta/75 dark:text-crema/75 leading-relaxed pt-1">' + QCH.esc(p) + '</p>' +
    '</li>').join('');

  const bloqueAdap = adap.length
    ? '<div class="rounded-2xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-4">' +
        '<div class="flex items-center gap-2 mb-1">' +
          '<span class="text-pemento">' + QCH.icona('familia', 'w-4 h-4', 2) + '</span>' +
          '<h3 class="font-display text-base text-tinta dark:text-crema">Na mesa, este prato faise así</h3>' +
        '</div>' +
        '<p class="text-xs text-tinta/50 dark:text-crema/50 mb-3">' + adap.length +
          (adap.length === 1 ? ' persoa precisa un axuste.' : ' persoas precisan un axuste.') + '</p>' +
        '<ul class="space-y-2.5">' + adap.map(a =>
          '<li class="flex items-start gap-2.5">' + QCH.avatar(a.persoa, 26) +
            '<div class="min-w-0"><p class="text-sm text-tinta dark:text-crema leading-tight">' +
              '<strong class="font-semibold">' + QCH.esc(a.persoa.nome) + '</strong>: ' + QCH.esc(a.texto) + '</p>' +
              '<p class="text-xs text-tinta/45 dark:text-crema/45">' + QCH.esc(a.motivo) +
                (a.tipo === 'prato' ? ' · cociñar aparte' : '') + '</p></div></li>').join('') +
        '</ul></div>'
    : '<div class="rounded-2xl bg-loureiro/8 dark:bg-loureiro/15 border border-loureiro/20 p-4 flex items-center gap-2.5">' +
        '<span class="text-loureiro dark:text-[#8FC79E]">' + QCH.icona('check', 'w-4 h-4', 2.2) + '</span>' +
        '<p class="text-sm text-tinta/70 dark:text-crema/70">Este prato cómeno todos igual. Unha pota e listo.</p></div>';

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="relative">' +
      '<div class="relative aspect-[21/9] sm:aspect-[2.6/1]">' + QCH.imaxePrato(r) +
        '<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Pechar" ' +
          'class="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 text-white grid place-items-center transition-colors backdrop-blur-sm" data-autofoco>' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
        '<div class="absolute inset-x-0 bottom-0 p-5 sm:p-7">' +
          '<h2 class="font-display text-3xl sm:text-4xl text-white leading-tight">' + QCH.esc(r.nome) + '</h2>' +
          '<p class="text-white/75 text-sm mt-1 max-w-xl">' + QCH.esc(r.subtitulo) + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="p-5 sm:p-7 space-y-6">' +
        '<div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">' +
          QCH.metaReceita(r) +
          '<div class="[&>button]:w-full sm:[&>button]:w-auto">' +
            QCH.btn('Poñer na semana', 'poñer-na-semana', { variante: 'primario', icona: 'semana', datos: ' data-id="' + r.id + '"' }) +
          '</div>' +
        '</div>' +

        // As adaptacións van ARRIBA, antes dos ingredientes: é o que esta app
        // sabe e as demais non, e nun móbil o que queda abaixo non se le.
        bloqueAdap +

        '<div class="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6">' +
          '<div>' +
            '<div class="flex items-baseline justify-between mb-2">' +
              '<h3 class="font-display text-lg text-tinta dark:text-crema">Ingredientes</h3>' +
              '<span class="text-xs text-tinta/45 dark:text-crema/45">para ' + n + (n === 1 ? ' comensal' : ' comensais') + '</span>' +
            '</div>' +
            '<ul class="divide-y divide-tinta/5 dark:divide-white/8">' + ingredientes + '</ul>' +
            '<div class="mt-3">' + QCH.barraDispo(r) + '</div>' +
            (!disp.completa
              ? '<p class="mt-2 text-xs text-tinta/45 dark:text-crema/45">O que falta xa está contado na lista da compra da semana.</p>'
              : '') +
          '</div>' +
          '<div>' +
            '<h3 class="font-display text-lg text-tinta dark:text-crema mb-3">Elaboración</h3>' +
            '<ol>' + pasos + '</ol>' +
            '<div class="mt-4 rounded-2xl bg-mel/10 dark:bg-mel/15 border border-mel/25 p-4">' +
              '<p class="text-[11px] font-bold uppercase tracking-[.12em] text-[#8A5A10] dark:text-[#F0C57A] mb-1">O truco</p>' +
              '<p class="text-sm text-tinta/70 dark:text-crema/70 leading-relaxed">' + QCH.esc(r.consello) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  ));
};

/* ---------- Selector de prato para un oco ---------- */
QCH.abrirSelector = function (dia, comida) {
  const s = QCH.estado.get();
  const k = QCH.slot(dia, comida);
  const actual = s.semana[k];
  const d = QCH.DIAS.find(x => x.id === dia);
  const c = QCH.COMIDAS.find(x => x.id === comida);
  if (!d || !c) return;

  const tarxetas = QCH.RECEITAS.map(r => {
    const disp = QCH.disponibilidade(r);
    const sel = r.id === actual;
    return '<button type="button" data-accion="escoller-prato" data-id="' + r.id + '" data-dia="' + dia + '" data-comida="' + comida + '" ' +
      'class="text-left rounded-2xl overflow-hidden border transition-all group ' +
      (sel ? 'border-pemento ring-2 ring-pemento/25' : 'border-tinta/8 dark:border-white/10 hover:border-pemento/50') + '">' +
      '<div class="relative aspect-[16/10]">' +
        '<div class="absolute inset-0 transition-transform duration-500 group-hover:scale-105">' + QCH.imaxePrato(r) + '</div>' +
        (disp.completa ? '<span class="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-loureiro ring-2 ring-white/70" title="Tes todos os ingredientes"></span>' : '') +
        (sel ? '<span class="absolute top-2 right-2 w-6 h-6 rounded-full bg-pemento text-white grid place-items-center">' + QCH.icona('check', 'w-3.5 h-3.5', 3) + '</span>' : '') +
      '</div>' +
      '<div class="p-2.5 bg-papel dark:bg-carbon">' +
        '<p class="font-display text-sm text-tinta dark:text-crema leading-tight line-clamp-2">' + QCH.esc(r.nome) + '</p>' +
        '<p class="text-[11px] text-tinta/45 dark:text-crema/45 mt-0.5">' + QCH.fmtTempo(r.tempo) + '</p>' +
      '</div></button>';
  }).join('');

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="sticky top-0 z-10 bg-crema/95 dark:bg-fondo/95 backdrop-blur-md px-5 sm:px-7 pt-5 pb-4 border-b border-tinta/8 dark:border-white/10">' +
      '<div class="flex items-start justify-between gap-4">' +
        '<div>' +
          '<p class="text-[11px] font-bold uppercase tracking-[.14em] text-pemento mb-0.5">' + QCH.esc(c.nome) + ' do ' + QCH.esc(d.nome.toLowerCase()) + '</p>' +
          '<h2 class="font-display text-2xl text-tinta dark:text-crema">Que poñemos?</h2>' +
        '</div>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Pechar" data-autofoco ' +
          'class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
      '</div>' +
      '<div class="flex flex-wrap gap-2 mt-3">' +
        QCH.btn('Que suxire a app', 'suxerir-oco', { variante: 'primario', pequeno: true, icona: 'xerar', datos: ' data-dia="' + dia + '" data-comida="' + comida + '"' }) +
        (actual ? QCH.btn('Deixar baleiro', 'baleirar-slot', { variante: 'fantasma', pequeno: true, icona: 'lixo', datos: ' data-dia="' + dia + '" data-comida="' + comida + '"' }) : '') +
      '</div>' +
    '</div>' +
    '<div class="p-5 sm:p-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">' + tarxetas + '</div>',
    'sm:max-w-4xl'
  ));
};

/* ---------- Onde poñer unha receita ---------- */
QCH.abrirOnde = function (receitaId) {
  const r = QCH.receita(receitaId);
  if (!r) return;
  const s = QCH.estado.get();
  const hoxe = QCH.hoxeIdx();

  // Mobile-first: en 390 px sete columnas quedan en 48 px por día e non se
  // len. No móbil cada día é unha fila (Xantar | Cea); desde sm, grella de 7.
  const grella = QCH.DIAS.map((d, i) => {
    const ehoxe = i === hoxe;
    return '<div class="flex flex-row sm:flex-col items-center sm:items-stretch gap-2 sm:gap-1.5">' +
      '<span class="w-14 sm:w-auto shrink-0 text-left sm:text-center text-xs font-semibold ' +
        (ehoxe ? 'text-pemento' : 'text-tinta/50 dark:text-crema/50') + '">' +
        '<span class="sm:hidden">' + QCH.esc(d.nome) + '</span>' +
        '<span class="hidden sm:inline">' + QCH.esc(d.curto) + '</span></span>' +
      '<div class="flex flex-row sm:flex-col gap-2 sm:gap-1.5 grow min-w-0">' +
      QCH.COMIDAS.map(c => {
        const ocupa = QCH.receita(s.semana[QCH.slot(d.id, c.id)]);
        const mesmo = ocupa && ocupa.id === r.id;
        return '<button type="button" data-accion="colocar-en" data-id="' + receitaId + '" data-dia="' + d.id + '" data-comida="' + c.id + '" ' +
          'class="grow sm:grow-0 min-w-0 basis-0 sm:basis-auto rounded-xl border px-2 py-2 min-h-[52px] sm:min-h-0 text-center transition-all ' +
          (mesmo ? 'border-pemento bg-pemento/10' : 'border-tinta/10 dark:border-white/12 hover:border-pemento/60 hover:bg-pemento/5') + '" ' +
          'title="' + QCH.esc(c.nome + ' do ' + d.nome.toLowerCase() + (ocupa ? ' · agora: ' + ocupa.nome : ' · baleiro')) + '">' +
          '<span class="block text-[9px] font-bold uppercase tracking-wider text-tinta/35 dark:text-crema/35">' + QCH.esc(c.nome) + '</span>' +
          '<span class="block text-[11px] sm:text-[10px] leading-tight mt-0.5 ' + (ocupa ? 'text-tinta/65 dark:text-crema/65' : 'text-tinta/25 dark:text-crema/25') + ' line-clamp-2">' +
            QCH.esc(ocupa ? ocupa.nome : '—') + '</span>' +
          '</button>';
      }).join('') +
      '</div></div>';
  }).join('');

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      '<div class="flex items-start justify-between gap-4 mb-1">' +
        '<div>' +
          '<p class="text-[11px] font-bold uppercase tracking-[.14em] text-pemento mb-0.5">Poñer no calendario</p>' +
          '<h2 class="font-display text-2xl text-tinta dark:text-crema">' + QCH.esc(r.nome) + '</h2>' +
        '</div>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Pechar" data-autofoco ' +
          'class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
      '</div>' +
      '<p class="text-sm text-tinta/50 dark:text-crema/50 mb-5">Escolle o oco. Se xa hai algo, substitúese.</p>' +
      '<div class="grid grid-cols-1 sm:grid-cols-7 gap-2">' + grella + '</div>' +
    '</div>',
    'sm:max-w-2xl'
  ));
};
