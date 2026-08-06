/* Modo cociñar (Fase 9): pantalla completa, paso a paso, cos temporizadores
   que faga falta e a pantalla sempre acesa mentres se cociña. Non usa
   QCH.estado (é interacción efémera de sesión, non datos da casa) nin o
   envoltorio habitual do modal (precisa ocupar a pantalla enteira). */
window.QCH = window.QCH || {};

QCH.cociñar = null;

QCH.abrirModoCociñar = function (receitaId) {
  const r = QCH.receita(receitaId);
  if (!r || !r.pasos.length) return;

  const estado = { pasoActual: 0, temporizadores: {} };
  let wakeLock = null, ticker = null;

  /* ---------- Temporizadores ---------- */
  function extraerMinutos(texto) {
    const m = texto.match(/(\d+)\s*min/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function mmss(seg) {
    const m = Math.floor(seg / 60), s = seg % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function soarAlarma() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.55);
    } catch (e) { /* sen audio dispoñible; quedan a vibración e o aviso */ }
  }

  function iniciarTicker() {
    if (ticker) return;
    ticker = setInterval(() => {
      let redebuxar = false, tocar = false;
      Object.keys(estado.temporizadores).forEach(k => {
        const t = estado.temporizadores[k];
        if (!t.activo) return;
        t.restante--;
        if (Number(k) === estado.pasoActual) tocar = true;
        if (t.restante <= 0) {
          t.restante = 0; t.activo = false; t.rematado = true;
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          soarAlarma();
          QCH.toast('Temporizador do paso ' + (Number(k) + 1) + ' rematado');
          if (Number(k) === estado.pasoActual) redebuxar = true;
        }
      });
      if (redebuxar) pintarPaso();
      else if (tocar) marcaxeTempo(estado.pasoActual);
    }, 1000);
  }

  function marcaxeTempo(i) {
    const t = estado.temporizadores[i];
    const el = document.getElementById('temp-contador-' + i);
    if (t && el) el.textContent = mmss(t.restante);
  }

  function alternarTemporizador(i, minutos) {
    let t = estado.temporizadores[i];
    if (!t || t.rematado) {
      estado.temporizadores[i] = { restante: minutos * 60, total: minutos * 60, activo: true, rematado: false };
    } else {
      t.activo = !t.activo;
    }
    iniciarTicker();
    pintarPaso();
  }

  /* ---------- Pantalla sempre acesa ---------- */
  function pedirWakeLock() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(wl => { wakeLock = wl; }).catch(() => { /* denegado; segue sen bloqueo */ });
  }
  function onVisibilidade() {
    if (wakeLock !== null && document.visibilityState === 'visible') pedirWakeLock();
  }

  /* ---------- Navegación ---------- */
  function ir(i) {
    estado.pasoActual = Math.max(0, Math.min(r.pasos.length - 1, i));
    pintarPaso();
  }
  function rematar() {
    QCH.modal.pechar();
    QCH.toast('Bo proveito!');
  }

  /* ---------- Debuxo ---------- */
  function corpo() {
    const total = r.pasos.length;
    const i = estado.pasoActual;
    const paso = r.pasos[i];
    const min = extraerMinutos(paso);
    const t = estado.temporizadores[i];
    const ultimo = i === total - 1;

    const puntos = r.pasos.map((_, idx) =>
      '<button type="button" data-accion="cociñar-ir" data-paso="' + idx + '" aria-label="Ir ao paso ' + (idx + 1) + '" ' +
        'class="h-1.5 rounded-full transition-all ' +
        (idx === i ? 'w-6 bg-pemento' : idx < i ? 'w-1.5 bg-pemento/40' : 'w-1.5 bg-tinta/12 dark:bg-white/15') + '"></button>'
    ).join('');

    let widget = '';
    if (min != null) {
      const boton = !t
        ? QCH.btn('Iniciar (' + min + ' min)', 'cociñar-temporizador', { variante: 'primario', pequeno: true, icona: 'reloxo', datos: ' data-paso="' + i + '" data-min="' + min + '"' })
        : t.rematado
          ? QCH.btn('Reiniciar', 'cociñar-temporizador', { variante: 'secundario', pequeno: true, datos: ' data-paso="' + i + '" data-min="' + min + '"' })
          : QCH.btn(t.activo ? 'Pausar' : 'Continuar', 'cociñar-temporizador', { variante: 'secundario', pequeno: true, datos: ' data-paso="' + i + '" data-min="' + min + '"' });

      widget = '<div class="mt-6 rounded-2xl bg-papel dark:bg-carbon border border-tinta/8 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4">' +
        '<div class="flex items-center gap-3 min-w-0">' +
          '<span class="shrink-0 w-10 h-10 rounded-full bg-pemento/10 text-pemento grid place-items-center">' + QCH.icona('reloxo', 'w-5 h-5', 2) + '</span>' +
          '<div class="min-w-0"><p class="text-sm font-semibold text-tinta dark:text-crema">' + (t && t.rematado ? 'Rematado' : 'Temporizador') + '</p>' +
            '<p id="temp-contador-' + i + '" class="text-2xl font-display tabular-nums text-tinta dark:text-crema">' + mmss(t ? t.restante : min * 60) + '</p></div>' +
        '</div>' + boton +
      '</div>';
    }

    return '<div id="vista-cociñar" class="fixed inset-0 z-50 bg-crema dark:bg-fondo flex flex-col" role="dialog" aria-modal="true" aria-label="Modo cociñar">' +
      '<div class="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-7 pt-[calc(env(safe-area-inset-top)+14px)] pb-3 border-b border-tinta/8 dark:border-white/10">' +
        '<div class="min-w-0">' +
          '<p class="text-[11px] font-bold uppercase tracking-[.14em] text-pemento mb-0.5">Modo cociñar</p>' +
          '<h2 class="font-display text-lg sm:text-xl text-tinta dark:text-crema truncate">' + QCH.esc(r.nome) + '</h2>' +
        '</div>' +
        '<button type="button" data-accion="pechar-modal" aria-label="Saír do modo cociñar" data-autofoco ' +
          'class="shrink-0 w-11 h-11 rounded-full bg-tinta/6 dark:bg-white/10 hover:bg-tinta/12 text-tinta/60 dark:text-crema/60 grid place-items-center transition-colors">' +
          QCH.icona('pechar', 'w-4 h-4', 2.2) + '</button>' +
      '</div>' +

      '<div class="flex items-center gap-1.5 px-5 sm:px-7 py-3 flex-wrap">' + puntos + '</div>' +

      '<div class="grow overflow-y-auto px-5 sm:px-7 pb-4">' +
        '<p class="text-xs font-semibold text-tinta/45 dark:text-crema/45 mb-2">Paso ' + (i + 1) + ' de ' + total + '</p>' +
        '<p class="font-display text-2xl sm:text-3xl leading-snug text-tinta dark:text-crema">' + QCH.esc(paso) + '</p>' +
        widget +
      '</div>' +

      '<div class="shrink-0 flex items-center gap-3 px-5 sm:px-7 py-4 border-t border-tinta/8 dark:border-white/10" ' +
        'style="padding-bottom:calc(env(safe-area-inset-bottom) + 16px)">' +
        QCH.btn('Anterior', 'cociñar-anterior', { variante: 'fantasma', icona: 'esquerda' }) +
        (ultimo
          ? QCH.btn('Rematar', 'cociñar-rematar', { variante: 'primario', icona: 'check' })
          : QCH.btn('Seguinte', 'cociñar-seguinte', { variante: 'primario', icona: 'dereita' })) +
      '</div>' +
    '</div>';
  }

  function pintarPaso() {
    const antigo = document.getElementById('vista-cociñar');
    if (antigo) antigo.outerHTML = corpo();
  }

  function limpar() {
    document.removeEventListener('visibilitychange', onVisibilidade);
    Object.keys(estado.temporizadores).forEach(k => { estado.temporizadores[k].activo = false; });
    if (ticker) { clearInterval(ticker); ticker = null; }
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    QCH.cociñar = null;
  }

  QCH.cociñar = {
    anterior: () => ir(estado.pasoActual - 1),
    seguinte: () => ir(estado.pasoActual + 1),
    ir,
    alternarTemporizador,
    rematar
  };

  document.addEventListener('visibilitychange', onVisibilidade);
  pedirWakeLock();
  QCH.modal.abrir(corpo(), limpar);
};
