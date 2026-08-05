/* Modal de configuración: onde o cociñeiro escribe a URL do n8n da casa e o
   token de acceso (2.2). É deliberadamente un modal, non unha vista de
   pantalla completa: a app ten que seguir abrindo sen conexión (§8 de
   FUNCTIONAL_SPECIFICATION.md), así que iniciar sesión nunca pode ser unha
   porta que bloquee o resto do uso. */
window.QCH = window.QCH || {};

QCH.abrirConfiguracion = function (opts) {
  const o = opts || {};
  const autenticado = QCH.api.estaAutenticada();
  const url = o.url != null ? o.url : QCH.api.baseUrl();

  const corpo = autenticado
    ? '<p class="text-sm text-tinta/70 dark:text-crema/70 mb-1">Sesión iniciada nesta casa.</p>' +
      (url ? '<p class="text-xs text-tinta/45 dark:text-crema/45 mb-5 break-all">' + QCH.esc(url) + '</p>' : '') +
      (QCH.api.pendentes().length ? '<p class="text-xs text-mel mb-4">Hai cambios gardados neste dispositivo pendentes de sincronizar.</p>' : '') +
      QCH.btn('Pechar sesión', 'config-pechar-sesion', { variante: 'fantasma', icona: 'pechar' })
    : '<form data-accion="config-iniciar-sesion" class="space-y-4" novalidate>' +
        '<div>' +
          '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="config-url">URL do servidor (n8n)</label>' +
          '<input type="url" id="config-url" placeholder="https://…/webhook/qch" value="' + QCH.esc(url) + '" ' +
            'class="w-full px-4 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
          '<p class="mt-1.5 text-xs text-tinta/45 dark:text-crema/45">Xa vén cuberta coa dirección desta casa.</p>' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs font-semibold text-tinta/60 dark:text-crema/60 mb-1.5" for="config-token">Token de acceso</label>' +
          '<input type="password" id="config-token" placeholder="O token da casa" ' +
            'class="w-full px-4 py-2.5 rounded-xl bg-crema dark:bg-fondo border border-tinta/10 dark:border-white/10 text-sm text-tinta dark:text-crema placeholder:text-tinta/35 dark:placeholder:text-crema/35 focus:outline-none focus:border-pemento/60 focus:ring-2 focus:ring-pemento/15 transition-all">' +
        '</div>' +
        (o.erro ? '<p class="text-xs text-pemento">' + QCH.esc(o.erro) + '</p>' : '') +
        '<button type="submit"' + (o.enviando ? ' disabled' : '') +
          ' class="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pemento text-sm px-5 min-h-[44px] md:min-h-[38px] bg-pemento text-white hover:bg-[#B93A26] shadow-sm hover:shadow-md disabled:opacity-60">' +
          (o.enviando ? 'Conectando…' : 'Iniciar sesión') + '</button>' +
      '</form>';

  QCH.modal.abrir(QCH.modal.envoltorio(
    '<div class="p-5 sm:p-7">' +
      '<div class="flex items-start justify-between gap-4 mb-5">' +
        '<h2 class="font-display text-2xl text-tinta dark:text-crema">Configuración</h2>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Pechar" data-autofoco ' +
          'class="shrink-0 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
      '</div>' +
      corpo +
    '</div>',
    'sm:max-w-md'
  ));
};
