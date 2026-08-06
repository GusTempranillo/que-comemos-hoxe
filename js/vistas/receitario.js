/* Vista "Receitario": o catálogo. É a base da que dependen o calendario
   e a lista da compra, así que os filtros teñen que ser rápidos e claros. */
window.QCH = window.QCH || {};
QCH.vistas = QCH.vistas || {};

QCH.vistas.receitario = (function () {

  const CATS = [
    { id: null,        nome: 'Todo' },
    { id: 'verdura',   nome: 'Verdura' },
    { id: 'peixe',     nome: 'Peixe' },
    { id: 'carne',     nome: 'Carne' },
    { id: 'legume',    nome: 'Legumes' },
    { id: 'masa',      nome: 'Masa' },
    { id: 'sobremesa', nome: 'Sobremesa' }
  ];

  const TEMPOS = [
    { v: null, nome: 'Calquera' },
    { v: 30,   nome: 'Ata 30 min' },
    { v: 45,   nome: 'Ata 45 min' },
    { v: 60,   nome: 'Ata 1 h' }
  ];

  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filtrar() {
    const f = QCH.estado.get().filtros;
    const q = normalizar(f.texto.trim());
    return QCH.RECEITAS.filter(r => {
      if (f.cat && r.cat !== f.cat) return false;
      if (f.tempoMax && r.tempo > f.tempoMax) return false;
      if (f.dificultade && r.dificultade !== f.dificultade) return false;
      if (f.soNeveira && !QCH.disponibilidade(r).completa) return false;
      if (q) {
        const feo = normalizar(r.nome + ' ' + r.subtitulo + ' ' + r.tags.join(' ') + ' ' +
          r.ingredientes.map(i => QCH.ingrediente(i.id).nome).join(' '));
        if (feo.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function chip(activo, texto, accion, datos) {
    return '<button type="button" data-accion="' + accion + '"' + (datos || '') +
      ' aria-pressed="' + !!activo + '" class="shrink-0 whitespace-nowrap px-4 md:px-3.5 min-h-[40px] md:min-h-[32px] rounded-full text-sm font-medium border transition-all ' +
      (activo
        ? 'bg-tinta text-crema border-tinta dark:bg-crema dark:text-tinta dark:border-crema'
        : 'bg-transparent text-tinta/65 border-tinta/15 hover:border-tinta/35 dark:text-crema/65 dark:border-white/15 dark:hover:border-white/35') +
      '">' + QCH.esc(texto) + '</button>';
  }

  return {
    filtrar,
    render() {
      const f = QCH.estado.get().filtros;
      const res = filtrar();
      const hai = QCH.RECEITAS.filter(r => QCH.disponibilidade(r).completa).length;

      return '<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">' +
        '<header class="mb-6 anim-entrada flex flex-wrap items-start justify-between gap-4">' +
          '<div>' +
            '<h1 class="font-display text-3xl sm:text-4xl text-tinta dark:text-crema mb-2">O receitario</h1>' +
            '<p class="text-tinta/55 dark:text-crema/55 max-w-2xl">' + QCH.RECEITAS.length + ' pratos da casa. ' +
              (hai ? '<strong class="text-loureiro dark:text-[#8FC79E] font-semibold">' + hai + '</strong> podes facelos agora mesmo co que hai na neveira.' : '') + '</p>' +
          '</div>' +
          QCH.btn('Nova receita', 'nova-receita', { variante: 'primario', icona: 'mais' }) +
        '</header>' +

        '<div class="sticky top-[60px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 bg-crema/85 dark:bg-fondo/85 backdrop-blur-md border-b border-tinta/6 dark:border-white/8">' +
          '<div class="flex flex-col gap-3">' +
            '<div class="relative">' +
              '<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta/35 dark:text-crema/35 pointer-events-none">' + QCH.icona('buscar', 'w-4 h-4', 2) + '</span>' +
              '<input type="search" data-accion="buscar" data-foco="busca" value="' + QCH.esc(f.texto) + '" ' +
                'placeholder="Busca por prato ou por ingrediente…" aria-label="Buscar receitas" ' +
                'class="w-full pl-10 pr-4 min-h-[44px] md:min-h-[40px] rounded-full bg-papel dark:bg-carbon border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
            '</div>' +
            // Mobile-first: doce filtros non caben en 390 px sen facer cinco
            // filas. Despráza en horizontal no móbil e reflúe no escritorio.
            '<div class="flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-0.5">' +
              CATS.map(c => chip(f.cat === c.id, c.nome, 'filtro-cat', ' data-cat="' + (c.id || '') + '"')).join('') +
              '<span class="shrink-0 w-px h-5 bg-tinta/10 dark:bg-white/10 mx-1"></span>' +
              TEMPOS.map(t => chip(f.tempoMax === t.v, t.nome, 'filtro-tempo', ' data-tempo="' + (t.v || '') + '"')).join('') +
              '<span class="shrink-0 w-px h-5 bg-tinta/10 dark:bg-white/10 mx-1"></span>' +
              '<button type="button" data-accion="filtro-neveira" aria-pressed="' + !!f.soNeveira + '" ' +
                'class="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-4 md:px-3.5 min-h-[40px] md:min-h-[32px] rounded-full text-sm font-medium border transition-all ' +
                (f.soNeveira ? 'bg-loureiro text-white border-loureiro' : 'bg-transparent text-tinta/65 border-tinta/15 hover:border-tinta/35 dark:text-crema/65 dark:border-white/15') + '">' +
                QCH.icona('neveira', 'w-3.5 h-3.5', 2) + 'Só co que teño</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">' +
          '<span class="text-sm text-tinta/45 dark:text-crema/45">' +
            (res.length === QCH.RECEITAS.length
              ? 'Todas as receitas'
              : res.length + (res.length === 1 ? ' receita atopada' : ' receitas atopadas')) + '</span>' +
          (res.length !== QCH.RECEITAS.length
            ? QCH.btn('Limpar filtros', 'limpar-filtros', { variante: 'fantasma', pequeno: true, icona: 'pechar' })
            : '') +
        '</div>' +

        (res.length
          ? '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">' +
              res.map(r => QCH.tarxetaReceita(r)).join('') + '</div>'
          : QCH.baleiro('Nada por aquí', 'Non hai ningunha receita que cumpra eses filtros. Proba a quitar algún.',
              QCH.btn('Limpar filtros', 'limpar-filtros', { variante: 'primario' }))) +
      '</div>';
    }
  };
})();
