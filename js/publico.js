/* Páxina pública dun menú compartido. A ruta /m/<token> cae no mesmo
   index.html da PWA en Cloudflare Pages; esta peza toma o control antes de
   que arranque a app privada e non precisa nin usa un token de sesión. */
window.QCH = window.QCH || {};

(function () {
  function tokenDaRuta() {
    const atopado = location.pathname.match(/^\/m\/([^/]+)\/?$/);
    return atopado ? decodeURIComponent(atopado[1]) : null;
  }

  function persoas(lista) {
    if (!Array.isArray(lista) || !lista.length) return 'Aínda sen confirmar';
    return lista.map(valor => {
      if (typeof valor === 'string') {
        const persoa = QCH.persoa(valor);
        return persoa ? persoa.nome : valor;
      }
      return valor && valor.nome ? valor.nome : '';
    }).filter(Boolean).join(', ') || 'Aínda sen confirmar';
  }

  function ingredientes(receita) {
    if (!receita || !Array.isArray(receita.ingredientes)) return '';
    return receita.ingredientes.map(ingrediente => {
      const nome = QCH.ingrediente(ingrediente.id).nome;
      return '<li class="flex justify-between gap-4 py-2 border-b border-tinta/8 dark:border-white/10 last:border-0">' +
        '<span>' + QCH.esc(nome) + '</span>' +
        '<span class="text-tinta/55 dark:text-crema/55 whitespace-nowrap">' + QCH.fmtCant(ingrediente.cant) + ' ' + QCH.esc(ingrediente.unid) + '</span>' +
      '</li>';
    }).join('');
  }

  function nutricion(datos) {
    const n = datos && datos.nutricion;
    if (!n) return '<p class="text-sm text-tinta/55 dark:text-crema/55">A información nutricional aínda non está dispoñible.</p>';
    const campos = [
      ['calorias', 'kcal'], ['proteinas', 'g proteínas'], ['hidratos', 'g hidratos'], ['graxas', 'g graxas'], ['fibra', 'g fibra']
    ];
    return '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">' + campos.map(campo =>
      '<div class="rounded-2xl bg-crema dark:bg-fondo px-3 py-3"><p class="text-lg font-semibold">' + QCH.esc(n[campo[0]] == null ? '—' : n[campo[0]]) +
      '</p><p class="text-xs text-tinta/50 dark:text-crema/50">' + campo[1] + '</p></div>'
    ).join('') + '</div>';
  }

  function renderizar(datos) {
    const receita = datos.receita;
    document.title = receita.nome + ' — Que comemos hoxe?';
    return '<div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">' +
      '<p class="text-[11px] font-bold uppercase tracking-[.18em] text-pemento mb-3">Menú compartido</p>' +
      '<article class="rounded-3xl overflow-hidden bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10">' +
        '<div class="aspect-[16/9]">' + QCH.imaxePrato(receita) + '</div>' +
        '<div class="p-5 sm:p-7">' +
          '<h1 class="font-display text-3xl sm:text-4xl text-tinta dark:text-crema">' + QCH.esc(receita.nome) + '</h1>' +
          (receita.subtitulo ? '<p class="mt-3 text-tinta/65 dark:text-crema/65 leading-relaxed">' + QCH.esc(receita.subtitulo) + '</p>' : '') +
          '<div class="mt-5 flex flex-wrap gap-2 text-sm"><span class="rounded-full bg-pemento/10 text-pemento px-3 py-1.5">Para: ' + QCH.esc(persoas(datos.comensaisPrevistos)) + '</span>' +
          (receita.tempo ? '<span class="rounded-full bg-tinta/6 dark:bg-white/10 px-3 py-1.5">' + QCH.esc(QCH.fmtTempo(receita.tempo)) + '</span>' : '') + '</div>' +
        '</div>' +
      '</article>' +
      '<section class="mt-7 rounded-3xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-5 sm:p-7">' +
        '<h2 class="font-display text-2xl mb-4">Ingredientes</h2><ul>' + ingredientes(receita) + '</ul>' +
      '</section>' +
      '<section class="mt-7 rounded-3xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-5 sm:p-7">' +
        '<h2 class="font-display text-2xl mb-4">Nutrición</h2>' + nutricion(datos) +
      '</section>' +
      '<p class="mt-8 text-center text-xs text-tinta/40 dark:text-crema/40">Que comemos hoxe?</p>' +
    '</div>';
  }

  QCH.eRutaPublica = () => !!tokenDaRuta();
  QCH.iniciarPublico = function () {
    const token = tokenDaRuta();
    const app = document.getElementById('app');
    const cabeceira = document.getElementById('cabeceira');
    const barra = document.getElementById('barra-inferior');
    if (!token || !app) return;
    if (cabeceira) cabeceira.remove();
    if (barra) barra.remove();
    app.innerHTML = '<div class="max-w-2xl mx-auto px-4 py-16 text-center text-tinta/60 dark:text-crema/60">Cargando o menú…</div>';
    const carga = document.getElementById('cargando');
    if (carga) carga.remove();

    QCH.api.menuPublico(token).then(datos => {
      if (!datos || !datos.receita) throw { mensaxe: 'A ligazón non contén un menú válido' };
      app.innerHTML = renderizar(datos);
    }).catch(() => {
      app.innerHTML = '<div class="max-w-md mx-auto px-5 py-20 text-center">' +
        '<h1 class="font-display text-3xl text-tinta dark:text-crema">Esta ligazón xa non está dispoñible</h1>' +
        '<p class="mt-3 text-tinta/60 dark:text-crema/60">Pode que caducase ou que non exista. Pídelle á persoa que cociña unha ligazón nova.</p>' +
      '</div>';
    });
  };
})();
