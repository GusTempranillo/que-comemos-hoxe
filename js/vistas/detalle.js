/* Modais: ficha de receita e selector de prato para un oco do calendario.
   A ficha non é só a receita: é a receita xa traducida ao que hai que facer
   distinto para cada persoa da mesa. Aí está o valor. */
window.QCH = window.QCH || {};

QCH.modal = (function () {
  let cont, previo = null, aoPechar = null;

  function nodo() {
    if (!cont) cont = document.getElementById('modal');
    return cont;
  }

  // aoPechar é opcional: para vistas coma o modo cociñar, que precisan
  // liberar recursos (temporizadores, bloqueo de pantalla) sen importar
  // como se pechou o modal (botón, fondo ou tecla Escape).
  function abrir(html, aoPecharCallback) {
    const c = nodo();
    previo = document.activeElement;
    aoPechar = aoPecharCallback || null;
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
    if (aoPechar) { aoPechar(); aoPechar = null; }
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

  const bloqueHistoria = r.historia
    ? '<div class="rounded-2xl bg-mel/8 dark:bg-mel/15 border border-mel/20 p-4">' +
        '<p class="text-[11px] font-bold uppercase tracking-[.12em] text-[#8A5A10] dark:text-[#F0C57A] mb-1">Historia</p>' +
        '<p class="text-sm text-tinta/70 dark:text-crema/70 leading-relaxed italic">' + QCH.esc(r.historia) + '</p>' +
      '</div>'
    : '';

  function bloqueDiario() {
    const eventos = QCH.eventosDe(r.id);
    const diasDende = QCH.diasDendeUltimoCociñado(r.id);

    const lista = eventos.length
      ? '<ul class="divide-y divide-tinta/6 dark:divide-white/8">' + eventos.map(ev => {
          const p = QCH.persoa(ev.responsableId);
          return '<li class="flex items-start gap-3 py-3 first:pt-0 last:pb-0">' +
            (p ? QCH.avatar(p, 30) : '') +
            '<div class="min-w-0 grow">' +
              '<div class="flex items-baseline justify-between gap-2">' +
                '<p class="text-sm font-semibold text-tinta dark:text-crema truncate">' + QCH.esc(p ? p.nome : 'Alguén') + '</p>' +
                '<span class="shrink-0 text-xs tabular-nums text-tinta/45 dark:text-crema/45">' + QCH.esc(ev.data) + '</span>' +
              '</div>' +
              '<p class="text-mel dark:text-[#F0C57A] text-sm leading-none mt-0.5" aria-label="' + ev.valoracion + ' de 5 estrelas">' + QCH.estrelas(ev.valoracion) + '</p>' +
              (ev.comentario ? '<p class="text-sm text-tinta/70 dark:text-crema/70 mt-1">' + QCH.esc(ev.comentario) + '</p>' : '') +
              (ev.cambios ? '<p class="text-xs text-tinta/45 dark:text-crema/45 mt-1">Cambios: ' + QCH.esc(ev.cambios) + '</p>' : '') +
            '</div></li>';
        }).join('') + '</ul>'
      : '<p class="text-sm text-tinta/50 dark:text-crema/50">Aínda non hai rexistros. Cando a cociñes, garda como saíu.</p>';

    return '<div class="rounded-2xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-4 sm:p-5">' +
      '<div class="flex items-center justify-between gap-3 mb-1">' +
        '<h3 class="font-display text-lg text-tinta dark:text-crema">Diario de cociñado</h3>' +
        QCH.btn('Rexistrar', 'abrir-rexistro-cociñado', { variante: 'secundario', pequeno: true, icona: 'mais', datos: ' data-id="' + r.id + '"' }) +
      '</div>' +
      (diasDende != null
        ? '<p class="text-xs text-tinta/45 dark:text-crema/45 mb-3">' +
            (diasDende === 0 ? 'Cociñado hoxe' : 'Hai ' + diasDende + (diasDende === 1 ? ' día' : ' días') + ' que non se cociña') +
          '</p>'
        : '<p class="text-xs text-tinta/45 dark:text-crema/45 mb-3">Aínda non rexistrado</p>') +
      lista +
    '</div>';
  }

  const nut = QCH.nutricionReceita(r);
  const bloqueNutricion = nut
    ? '<div class="rounded-2xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-4 sm:p-5">' +
        '<h3 class="font-display text-lg text-tinta dark:text-crema mb-1">Nutrición</h3>' +
        '<p class="text-xs text-tinta/45 dark:text-crema/45 mb-3">Por ración, calculado a partir dos ingredientes. Estimación aproximada: en pratos fritos pode saír por riba do real, porque conta todo o aceite da tixola coma se se comese enteiro.</p>' +
        '<div class="grid grid-cols-3 sm:grid-cols-5 gap-2.5">' + [
          [nut.calorias, 'kcal'], [nut.proteinas, 'g prot.'], [nut.hidratos, 'g hidr.'], [nut.graxas, 'g graxas'], [nut.fibra, 'g fibra']
        ].map(c =>
          '<div class="rounded-xl bg-crema dark:bg-fondo px-2 py-3 text-center">' +
            '<p class="text-lg font-semibold text-tinta dark:text-crema">' + QCH.esc(c[0]) + '</p>' +
            '<p class="text-[11px] text-tinta/50 dark:text-crema/50">' + c[1] + '</p>' +
          '</div>').join('') +
        '</div></div>'
    : '';

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
          '<div class="flex flex-col sm:flex-row gap-2 [&>button]:w-full sm:[&>button]:w-auto">' +
            QCH.btn('Axuda da IA', 'abrir-axuda-ia', { variante: 'fantasma', icona: 'xerar', datos: ' data-id="' + r.id + '"' }) +
            QCH.btn('Modo cociñar', 'abrir-modo-cociñar', { variante: 'secundario', icona: 'lume', datos: ' data-id="' + r.id + '"' }) +
            QCH.btn('Poñer na semana', 'poñer-na-semana', { variante: 'primario', icona: 'semana', datos: ' data-id="' + r.id + '"' }) +
          '</div>' +
        '</div>' +

        bloqueHistoria +

        // As adaptacións van ARRIBA, antes dos ingredientes: é o que esta app
        // sabe e as demais non, e nun móbil o que queda abaixo non se le.
        bloqueAdap +

        bloqueNutricion +

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

        bloqueDiario() +
      '</div>' +
    '</div>'
  ));
};

/* ---------- Rexistro dun evento de cociñado ---------- */
QCH.estrelas = function (n) {
  return Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('');
};

QCH.abrirRexistroCociñado = function (receitaId) {
  const r = QCH.receita(receitaId);
  if (!r) return;
  const cociñeiros = QCH.PERSOAS.filter(p => p.cociña);
  const hoxeIso = new Date().toISOString().slice(0, 10);

  const opcionsResponsable = cociñeiros.map(p =>
    '<option value="' + QCH.esc(p.id) + '">' + QCH.esc(p.nome) + '</option>').join('');
  const opcionsValoracion = [5, 4, 3, 2, 1].map(n =>
    '<option value="' + n + '"' + (n === 5 ? ' selected' : '') + '>' + QCH.estrelas(n) + '</option>').join('');

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      '<div class="flex items-start justify-between gap-4 mb-1">' +
        '<div>' +
          '<p class="text-[11px] font-bold uppercase tracking-[.14em] text-pemento mb-0.5">Diario de cociñado</p>' +
          '<h2 class="font-display text-2xl text-tinta dark:text-crema">' + QCH.esc(r.nome) + '</h2>' +
        '</div>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Pechar" data-autofoco ' +
          'class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
      '</div>' +
      '<form data-accion="gardar-rexistro-cociñado" data-id="' + QCH.esc(r.id) + '" class="space-y-4 mt-4" novalidate>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="reg-data">Data</label>' +
            '<input type="date" id="reg-data" value="' + hoxeIso + '" max="' + hoxeIso + '" ' +
              'class="w-full px-3.5 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="reg-valoracion">Valoración</label>' +
            '<select id="reg-valoracion" class="w-full px-3.5 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
              opcionsValoracion + '</select>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="reg-responsable">Quen cociñou</label>' +
          '<select id="reg-responsable" class="w-full px-3.5 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
            opcionsResponsable + '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="reg-comentario">Como saíu (opcional)</label>' +
          '<textarea id="reg-comentario" rows="2" placeholder="Notas, dificultades, o que se dixo á mesa…" ' +
            'class="w-full px-3.5 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all resize-none"></textarea>' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="reg-cambios">Cambios respecto á receita (opcional)</label>' +
          '<textarea id="reg-cambios" rows="2" placeholder="Menos sal, sen chourizo, o dobre de tempo…" ' +
            'class="w-full px-3.5 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all resize-none"></textarea>' +
        '</div>' +
        '<button type="submit" class="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pemento text-sm px-5 min-h-[44px] md:min-h-[38px] bg-pemento text-white hover:bg-[#B93A26] shadow-sm hover:shadow-md">' +
          'Gardar rexistro</button>' +
      '</form>' +
    '</div>',
    'sm:max-w-md'
  ));
};

/* ---------- Axuda da IA (Fase 4) ----------
   A IA nunca modifica a receita por conta propia: só devolve unha
   proposta de só lectura. Aplicala é sempre unha decisión do cociñeiro,
   fóra desta pantalla (COOKBOOK_MODEL.md §Papel da IA). */
QCH.axudaIA = null;

/* "Calcular nutrición" non está aquí: quitouse a favor de
   QCH.nutricionReceita(), que a calcula en local a partir dos
   ingredientes (ver bloqueNutricion máis abaixo) sen depender da IA
   nin de n8n. */
const OPCIONS_IA = [
  { accion: 'mellorar', icona: 'editar', titulo: 'Mellorar a receita', descricion: 'Redacción e pasos máis claros.' },
  { accion: 'adaptar', icona: 'familia', titulo: 'Adaptar á familia', descricion: 'Suxestións segundo os comensais de hoxe.' }
];

/* Debuxa calquera forma que devolva `proposta` sen asumir un esquema
   fixo: a resposta da IA non está normalizada, así que isto amosa
   texto, listas e obxectos aniñados de forma xenérica e sempre escapada. */
function renderizarPropostaIA(v) {
  if (v == null) return '<p class="text-sm text-tinta/50 dark:text-crema/50">Sen contido.</p>';
  if (typeof v === 'string') return '<p class="text-sm text-tinta/80 dark:text-crema/80 leading-relaxed whitespace-pre-line">' + QCH.esc(v) + '</p>';
  if (typeof v === 'number' || typeof v === 'boolean') return '<p class="text-sm text-tinta/80 dark:text-crema/80">' + QCH.esc(String(v)) + '</p>';
  if (Array.isArray(v)) {
    if (!v.length) return '<p class="text-sm text-tinta/50 dark:text-crema/50">Sen contido.</p>';
    return '<ul class="list-disc pl-5 space-y-1.5">' + v.map(item =>
      '<li class="text-sm text-tinta/80 dark:text-crema/80">' + renderizarPropostaIA(item) + '</li>').join('') + '</ul>';
  }
  if (typeof v === 'object') {
    const claves = Object.keys(v);
    if (!claves.length) return '<p class="text-sm text-tinta/50 dark:text-crema/50">Sen contido.</p>';
    return '<dl class="space-y-3">' + claves.map(k =>
      '<div><dt class="text-[11px] font-bold uppercase tracking-[.1em] text-tinta/40 dark:text-crema/40">' +
        QCH.esc(k.replace(/_/g, ' ')) + '</dt><dd class="mt-0.5">' + renderizarPropostaIA(v[k]) + '</dd></div>'
    ).join('') + '</dl>';
  }
  return QCH.esc(String(v));
}

QCH.abrirAxudaIA = function (receitaId) {
  const r = QCH.receita(receitaId);
  if (!r) return;
  if (!QCH.api.estaAutenticada()) {
    QCH.toast('Inicia sesión para usar a axuda da IA', 'aviso');
    QCH.abrirConfiguracion();
    return;
  }

  let estado = { fase: 'opcions', accion: null, proposta: null, modelo: null, erro: null };

  function pedir(accion) {
    estado = { fase: 'cargando', accion, proposta: null, modelo: null, erro: null };
    redebuxar();
    const comensais = QCH.estado.get().comensais;
    QCH.api.axudaIA(accion, r.id, { comensais }).then(resp => {
      if (estado.fase !== 'cargando' || estado.accion !== accion) return; // xa se pechou ou se cambiou de opción
      estado.fase = 'resultado';
      estado.proposta = resp && resp.proposta != null ? resp.proposta : null;
      estado.modelo = resp && resp.modelo;
      redebuxar();
    }).catch(erro => {
      if (estado.fase !== 'cargando' || estado.accion !== accion) return;
      estado.fase = 'erro';
      estado.erro = (erro && erro.mensaxe) || 'Non se puido contactar coa IA';
      redebuxar();
    });
  }

  function volver() {
    estado = { fase: 'opcions', accion: null, proposta: null, modelo: null, erro: null };
    redebuxar();
  }

  function corpo() {
    if (estado.fase === 'cargando') {
      const op = OPCIONS_IA.find(o => o.accion === estado.accion);
      return '<div class="py-10 flex flex-col items-center gap-3 text-center">' +
        '<div class="w-10 h-10 rounded-full border-2 border-pemento/25 border-t-pemento animate-spin"></div>' +
        '<p class="text-sm text-tinta/60 dark:text-crema/60">' +
          (op ? QCH.esc(op.titulo) + '…' : 'Un momento…') + '</p>' +
      '</div>';
    }

    if (estado.fase === 'erro') {
      return '<div class="py-6 text-center space-y-4">' +
        '<p class="text-sm text-pemento">' + QCH.esc(estado.erro) + '</p>' +
        QCH.btn('Volver', 'ia-volver', { variante: 'secundario', icona: 'volver' }) +
      '</div>';
    }

    if (estado.fase === 'resultado') {
      const op = OPCIONS_IA.find(o => o.accion === estado.accion);
      return '<div class="space-y-4">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<p class="text-xs font-semibold text-tinta/45 dark:text-crema/45">' +
            (op ? QCH.esc(op.titulo) : 'Proposta') + (estado.modelo ? ' · ' + QCH.esc(estado.modelo) : '') +
          '</p>' +
          QCH.btn('Volver', 'ia-volver', { variante: 'fantasma', pequeno: true, icona: 'volver' }) +
        '</div>' +
        '<div class="rounded-2xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-4 sm:p-5">' +
          renderizarPropostaIA(estado.proposta) +
        '</div>' +
        '<p class="text-xs text-tinta/40 dark:text-crema/40">Isto é só unha suxestión da IA. Non se cambiou nada na receita.</p>' +
      '</div>';
    }

    return '<div class="space-y-2">' +
      OPCIONS_IA.map(o =>
        '<button type="button" data-accion="ia-pedir" data-ia-accion="' + o.accion + '" ' +
          'class="w-full text-left flex items-center gap-3 rounded-2xl border border-tinta/8 dark:border-white/10 p-4 hover:border-pemento/50 hover:bg-pemento/5 dark:hover:bg-pemento/10 transition-colors">' +
          '<span class="shrink-0 w-10 h-10 rounded-full bg-pemento/10 text-pemento grid place-items-center">' + QCH.icona(o.icona, 'w-5 h-5', 2) + '</span>' +
          '<span class="min-w-0"><span class="block text-sm font-semibold text-tinta dark:text-crema">' + QCH.esc(o.titulo) + '</span>' +
            '<span class="block text-xs text-tinta/50 dark:text-crema/50">' + QCH.esc(o.descricion) + '</span></span>' +
        '</button>'
      ).join('') +
    '</div>';
  }

  function redebuxar() {
    const cont = document.getElementById('axuda-ia-corpo');
    if (cont) cont.innerHTML = corpo();
  }

  QCH.axudaIA = { pedir, volver };

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      '<div class="flex items-start justify-between gap-4 mb-1">' +
        '<div>' +
          '<p class="text-[11px] font-bold uppercase tracking-[.14em] text-pemento mb-0.5">Axuda da IA</p>' +
          '<h2 class="font-display text-2xl text-tinta dark:text-crema">' + QCH.esc(r.nome) + '</h2>' +
        '</div>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Pechar" data-autofoco ' +
          'class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
      '</div>' +
      '<div id="axuda-ia-corpo" class="mt-4">' + corpo() + '</div>' +
    '</div>',
    'sm:max-w-lg'
  ), () => { QCH.axudaIA = null; });
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
