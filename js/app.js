/* Armazón da aplicación: navegación, delegación de eventos, tema e avisos.
   Só hai un punto de renderizado. Cando cambia o estado, redebúxase a vista
   activa e restáuranse foco e desprazamento para que non se note. */
window.QCH = window.QCH || {};

(function () {
  const NAV = [
    { id: 'hoxe',       nome: 'Hoxe',       icona: 'hoxe' },
    { id: 'semana',     nome: 'Semana',     icona: 'semana' },
    { id: 'receitario', nome: 'Receitario', icona: 'receitario' },
    { id: 'neveira',    nome: 'Neveira',    icona: 'neveira' },
    { id: 'familia',    nome: 'Familia',    icona: 'familia' }
  ];

  let app, cabeceira, barraInferior;

  /* ---------- Avisos ---------- */
  QCH.toast = function (texto, tipo) {
    const cont = document.getElementById('toasts');
    if (!cont) return;
    const cores = {
      ok:    'bg-loureiro text-white',
      aviso: 'bg-mel text-[#3A2708]',
      erro:  'bg-pemento text-white'
    };
    const el = document.createElement('div');
    el.className = 'pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg text-sm font-medium ' + (cores[tipo] || cores.ok);
    el.setAttribute('role', 'status');
    el.innerHTML = QCH.icona(tipo === 'erro' ? 'alerta' : 'check', 'w-4 h-4', 2.4) + '<span>' + QCH.esc(texto) + '</span>';
    cont.appendChild(el);
    if (window.gsap) {
      gsap.fromTo(el, { opacity: 0, y: 14, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .3, ease: 'back.out(1.6)' });
      gsap.to(el, { opacity: 0, y: -10, duration: .3, delay: 2.8, ease: 'power2.in', onComplete: () => el.remove() });
    } else {
      setTimeout(() => el.remove(), 3000);
    }
  };

  /* ---------- Navegación ---------- */
  function botonNav(item, activo, mobil) {
    if (mobil) {
      return '<button type="button" data-accion="nav" data-vista="' + item.id + '" aria-current="' + (activo ? 'page' : 'false') + '" ' +
        'class="flex flex-col items-center gap-0.5 py-2 px-1 grow transition-colors ' +
        (activo ? 'text-pemento' : 'text-tinta/45 dark:text-crema/45') + '">' +
        QCH.icona(item.icona, 'w-[22px] h-[22px]', activo ? 2.2 : 1.8) +
        '<span class="text-[10px] font-semibold">' + QCH.esc(item.nome) + '</span></button>';
    }
    return '<button type="button" data-accion="nav" data-vista="' + item.id + '" aria-current="' + (activo ? 'page' : 'false') + '" ' +
      'class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ' +
      (activo
        ? 'bg-tinta text-crema dark:bg-crema dark:text-tinta'
        : 'text-tinta/60 hover:text-tinta hover:bg-tinta/6 dark:text-crema/60 dark:hover:text-crema dark:hover:bg-white/10') + '">' +
      QCH.icona(item.icona, 'w-4 h-4', 1.9) + QCH.esc(item.nome) + '</button>';
  }

  function pintarCabeceira() {
    const s = QCH.estado.get();
    cabeceira.innerHTML =
      '<div class="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-4">' +
        '<button type="button" data-accion="nav" data-vista="hoxe" class="flex items-center gap-2 shrink-0 min-h-[44px] group" aria-label="Ir ao inicio">' +
          '<span class="w-8 h-8 rounded-xl bg-pemento text-white grid place-items-center font-display text-base leading-none group-hover:rotate-[-6deg] transition-transform shrink-0">?</span>' +
          '<span class="font-display text-[13px] sm:text-[15px] text-tinta dark:text-crema leading-none whitespace-nowrap">Que comemos hoxe?</span>' +
        '</button>' +
        '<nav class="hidden md:flex items-center gap-1 mx-auto" aria-label="Principal">' +
          NAV.map(i => botonNav(i, s.vista === i.id, false)).join('') +
        '</nav>' +
        '<div class="ml-auto md:ml-0 flex items-center gap-1.5 shrink-0">' +
          '<span class="hidden sm:inline-flex items-center gap-1 text-xs text-tinta/45 dark:text-crema/45 px-2">' +
            QCH.icona('familia', 'w-3.5 h-3.5', 2) + s.comensais.length + '</span>' +
          '<button type="button" data-accion="tema" aria-label="Cambiar entre modo claro e escuro" ' +
            'class="w-11 h-11 md:w-9 md:h-9 rounded-full grid place-items-center text-tinta/60 dark:text-crema/60 hover:bg-tinta/8 dark:hover:bg-white/10 transition-colors">' +
            QCH.icona(s.tema === 'escuro' ? 'sol' : 'lua', 'w-[18px] h-[18px]', 1.9) + '</button>' +
          '<button type="button" data-accion="abrir-configuracion" aria-label="Configuración" ' +
            'class="w-11 h-11 md:w-9 md:h-9 rounded-full grid place-items-center text-tinta/60 dark:text-crema/60 hover:bg-tinta/8 dark:hover:bg-white/10 transition-colors">' +
            QCH.icona('config', 'w-[18px] h-[18px]', 1.9) + '</button>' +
        '</div>' +
      '</div>';
  }

  function pintarBarraInferior() {
    const s = QCH.estado.get();
    barraInferior.innerHTML = '<div class="flex items-stretch max-w-lg mx-auto">' +
      NAV.map(i => botonNav(i, s.vista === i.id, true)).join('') + '</div>';
  }

  /* ---------- Renderizado ---------- */
  let pintando = false;

  function pintar(motivo) {
    if (pintando) return;
    pintando = true;

    // Gardar foco e desprazamento antes de substituír o DOM
    const act = document.activeElement;
    const chaveFoco = act && act.getAttribute ? act.getAttribute('data-foco') : null;
    const caret = chaveFoco && act.selectionStart != null ? act.selectionStart : null;
    const scroll = window.scrollY;

    const s = QCH.estado.get();
    const vista = QCH.vistas[s.vista] || QCH.vistas.hoxe;
    app.innerHTML = vista.render();

    pintarCabeceira();
    pintarBarraInferior();

    if (chaveFoco) {
      const novo = app.querySelector('[data-foco="' + chaveFoco + '"]');
      if (novo) {
        novo.focus();
        if (caret != null && novo.setSelectionRange) {
          try { novo.setSelectionRange(caret, caret); } catch (e) { /* type=search nalgúns navegadores */ }
        }
      }
    }
    if (motivo !== 'nav') window.scrollTo(0, scroll);

    pintando = false;
  }

  QCH.pintar = pintar;

  function irA(vista) {
    if (QCH.estado.get().vista === vista) return;
    QCH.estado.set({ vista }, 'nav');
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }

  /* ---------- Tema ---------- */
  function aplicarTema() {
    const escuro = QCH.estado.get().tema === 'escuro';
    document.documentElement.classList.toggle('escuro', escuro);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', escuro ? '#14100D' : '#FBF7F0');
  }

  /* ---------- Accións ---------- */
  const accions = {
    nav: (el) => irA(el.getAttribute('data-vista')),
    'ir-semana': () => irA('semana'),
    'ir-familia': () => irA('familia'),

    tema: () => {
      QCH.estado.set({ tema: QCH.estado.get().tema === 'escuro' ? 'claro' : 'escuro' }, 'tema');
      aplicarTema();
    },

    'abrir-receita': (el) => QCH.abrirReceita(el.getAttribute('data-id')),
    'abrir-selector': (el) => QCH.abrirSelector(el.getAttribute('data-dia'), el.getAttribute('data-comida')),
    'pechar-modal': () => QCH.modal.pechar(),

    'abrir-modo-cociñar': (el) => QCH.abrirModoCociñar(el.getAttribute('data-id')),
    'abrir-rexistro-cociñado': (el) => QCH.abrirRexistroCociñado(el.getAttribute('data-id')),
    'gardar-rexistro-cociñado': (el) => {
      const id = el.getAttribute('data-id');
      const responsableId = QCH.$('#reg-responsable', el).value;
      if (!responsableId) { QCH.toast('Falta quen cociñou', 'aviso'); return; }
      QCH.rexistrarCociñado(id, {
        data: QCH.$('#reg-data', el).value || new Date().toISOString().slice(0, 10),
        responsableId,
        valoracion: parseInt(QCH.$('#reg-valoracion', el).value, 10),
        comentario: QCH.$('#reg-comentario', el).value.trim(),
        cambios: QCH.$('#reg-cambios', el).value.trim()
      });
      QCH.modal.pechar();
      QCH.toast('Rexistrado no diario');
    },
    'cociñar-anterior': () => QCH.cociñar && QCH.cociñar.anterior(),
    'cociñar-seguinte': () => QCH.cociñar && QCH.cociñar.seguinte(),
    'cociñar-ir': (el) => QCH.cociñar && QCH.cociñar.ir(parseInt(el.getAttribute('data-paso'), 10)),
    'cociñar-rematar': () => QCH.cociñar && QCH.cociñar.rematar(),
    'cociñar-temporizador': (el) => QCH.cociñar && QCH.cociñar.alternarTemporizador(
      parseInt(el.getAttribute('data-paso'), 10), parseInt(el.getAttribute('data-min'), 10)
    ),

    'escoller-prato': (el) => {
      const id = el.getAttribute('data-id');
      const dia = el.getAttribute('data-dia');
      const comida = el.getAttribute('data-comida');
      QCH.estado.update(s => { s.semana[QCH.slot(dia, comida)] = id; }, 'semana');
      QCH.modal.pechar();
      QCH.toast(QCH.receita(id).nome + ' xa está no calendario');
    },

    'baleirar-slot': (el) => {
      const dia = el.getAttribute('data-dia');
      const comida = el.getAttribute('data-comida');
      QCH.estado.update(s => { delete s.semana[QCH.slot(dia, comida)]; }, 'semana');
      QCH.modal.pechar();
      QCH.toast('Oco baleirado', 'aviso');
    },

    'suxerir-oco': (el) => {
      const dia = el.getAttribute('data-dia');
      const comida = el.getAttribute('data-comida');
      const r = QCH.xerador.oco(dia, comida, QCH.vistas.semana.getModo());
      if (!r) { QCH.toast('Non atopo ningunha suxestión', 'erro'); return; }
      QCH.estado.update(s => { s.semana[QCH.slot(dia, comida)] = r.id; }, 'semana');
      QCH.modal.pechar();
      QCH.toast('Suxestión: ' + QCH.receita(r.id).nome);
    },

    'poñer-na-semana': (el) => QCH.abrirOnde(el.getAttribute('data-id')),

    'colocar-en': (el) => {
      const id = el.getAttribute('data-id');
      const dia = el.getAttribute('data-dia');
      const comida = el.getAttribute('data-comida');
      QCH.estado.update(s => { s.semana[QCH.slot(dia, comida)] = id; }, 'semana');
      QCH.modal.pechar();
      const d = QCH.DIAS.find(x => x.id === dia);
      QCH.toast(QCH.receita(id).nome + ' · ' + d.nome.toLowerCase());
    },

    'xerar-semana': () => {
      const res = QCH.xerador.semana(QCH.vistas.semana.getModo());
      QCH.vistas.semana.setMotivos(res.motivos);
      QCH.estado.update(s => { s.semana = res.semana; }, 'semana');
      QCH.toast('Semana nova, ' + Object.keys(res.semana).length + ' pratos');
      if (window.gsap) {
        const celas = QCH.$$('#grella-semana .cela, #grella-semana .cela-oco');
        gsap.fromTo(celas, { opacity: 0, y: 18, scale: .96 },
          { opacity: 1, y: 0, scale: 1, duration: .42, ease: 'power3.out', stagger: { each: .022, from: 'start' } });
      }
    },

    modo: (el) => { QCH.vistas.semana.setModo(el.getAttribute('data-modo')); pintar(); },
    'alternar-motivos': () => { QCH.vistas.semana.alternarMotivos(); pintar(); },

    'filtro-cat': (el) => {
      const v = el.getAttribute('data-cat') || null;
      QCH.estado.update(s => { s.filtros.cat = v; }, 'filtro');
    },
    'filtro-tempo': (el) => {
      const v = el.getAttribute('data-tempo');
      QCH.estado.update(s => { s.filtros.tempoMax = v ? parseInt(v, 10) : null; }, 'filtro');
    },
    'filtro-neveira': () => QCH.estado.update(s => { s.filtros.soNeveira = !s.filtros.soNeveira; }, 'filtro'),
    'limpar-filtros': () => QCH.estado.update(s => {
      s.filtros = { texto: '', tempoMax: null, dificultade: null, cat: null, soNeveira: false };
    }, 'filtro'),

    'nev-mais':   (el) => cambiarNeveira(el.getAttribute('data-id'), 1),
    'nev-menos':  (el) => cambiarNeveira(el.getAttribute('data-id'), -1),
    'nev-quitar': (el) => {
      const id = el.getAttribute('data-id');
      QCH.estado.update(s => { delete s.neveira[id]; }, 'neveira');
      QCH.toast(QCH.ingrediente(id).nome + ' fóra da neveira', 'aviso');
    },
    'nev-engadir': (el) => {
      const id = el.getAttribute('data-id');
      const ing = QCH.ingrediente(id);
      const inicial = QCH.cantidadeInicial(ing.unid);
      QCH.vistas.neveira.setBusca('');
      QCH.estado.update(s => { s.neveira[id] = inicial; }, 'neveira');
      QCH.toast(ing.nome + ' na neveira');
    },

    'abrir-axuda-ia': (el) => QCH.abrirAxudaIA(el.getAttribute('data-id')),
    'ia-pedir': (el) => QCH.axudaIA && QCH.axudaIA.pedir(el.getAttribute('data-ia-accion')),
    'ia-volver': () => QCH.axudaIA && QCH.axudaIA.volver(),

    'abrir-configuracion': () => QCH.abrirConfiguracion(),

    'config-iniciar-sesion': (el) => {
      const campoUrl = QCH.$('#config-url', el);
      const campoToken = QCH.$('#config-token', el);
      const url = campoUrl ? campoUrl.value.trim() : '';
      const token = campoToken ? campoToken.value.trim() : '';
      if (!url || !token) { QCH.toast('Cubre os dous campos', 'aviso'); return; }

      QCH.abrirConfiguracion({ url, enviando: true });
      QCH.api.configurar(url);
      QCH.api.login(token).then(resposta => {
        QCH.toast(resposta.aviso ? 'Sesión iniciada; sincronizarase cando haxa rede' : 'Sesión iniciada');
        QCH.modal.pechar();
      }).catch(e => {
        QCH.abrirConfiguracion({ url, erro: (e && e.mensaxe) || 'Non se puido iniciar sesión' });
      });
    },

    'config-pechar-sesion': () => {
      QCH.api.logout();
      QCH.toast('Sesión pechada', 'aviso');
      QCH.abrirConfiguracion();
    },

    'compartir-menu': (el) => {
      const dia = el.getAttribute('data-dia');
      const receita = QCH.receita(QCH.estado.get().semana[QCH.slot(dia, 'xantar')]);
      if (!receita) { QCH.toast('Primeiro escolle un prato para hoxe', 'aviso'); return; }
      if (!QCH.api.estaAutenticada()) {
        QCH.toast('Inicia sesión para crear a ligazón', 'aviso');
        QCH.abrirConfiguracion();
        return;
      }
      QCH.api.compartir(dia).then(resposta => {
        if (!resposta || !resposta.url) return Promise.reject({ mensaxe: 'Non se recibiu a ligazón pública' });
        const texto = 'Hoxe hai ' + receita.nome + ': ' + resposta.url;
        if (navigator.share) return navigator.share({ title: 'Que comemos hoxe?', text: texto, url: resposta.url });
        window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      }).catch(erro => {
        /* Pechar o selector nativo de compartir non é un erro que haxa que
           amosar; en calquera outro caso explicamos que a ligazón non saíu. */
        if (erro && erro.name === 'AbortError') return;
        QCH.toast((erro && erro.mensaxe) || 'Non se puido crear a ligazón', 'erro');
      });
    },

    'toggle-comensal': (el) => {
      const id = el.getAttribute('data-id');
      QCH.estado.update(s => {
        const i = s.comensais.indexOf(id);
        if (i === -1) s.comensais.push(id);
        else if (s.comensais.length > 1) s.comensais.splice(i, 1);
        else QCH.toast('Ten que quedar alguén na mesa', 'aviso');
      }, 'comensais');
    }
  };

  function cambiarNeveira(id, signo) {
    const paso = QCH.pasoUnidade(QCH.ingrediente(id).unid);
    QCH.estado.update(s => {
      const novo = Math.max(0, (s.neveira[id] || 0) + signo * paso);
      if (novo === 0) delete s.neveira[id]; else s.neveira[id] = novo;
    }, 'neveira');
  }

  /* ---------- Escoita global ---------- */
  function conectar() {
    document.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-accion]');
      if (!el) return;
      const nome = el.getAttribute('data-accion');
      const fn = accions[nome];
      if (fn) { ev.preventDefault(); fn(el, ev); }
    });

    // Enter/Espazo nos elementos con role=button que non son <button>
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && QCH.modal.aberto()) { QCH.modal.pechar(); return; }
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const el = ev.target.closest('[data-accion][role="button"]');
      if (!el || el.tagName === 'BUTTON') return;
      ev.preventDefault();
      const fn = accions[el.getAttribute('data-accion')];
      if (fn) fn(el, ev);
    });

    // Formularios (ex. login en configuracion.js): Intro ou o botón "ir" do
    // teclado móbil disparan 'submit' directamente, sen pasar por 'click'.
    document.addEventListener('submit', (ev) => {
      const el = ev.target.closest('[data-accion]');
      if (!el) return;
      ev.preventDefault();
      const fn = accions[el.getAttribute('data-accion')];
      if (fn) fn(el, ev);
    });

    document.addEventListener('input', (ev) => {
      const el = ev.target.closest('[data-accion]');
      if (!el) return;
      const nome = el.getAttribute('data-accion');
      if (nome === 'buscar') {
        QCH.estado.update(s => { s.filtros.texto = el.value; }, 'filtro');
      } else if (nome === 'buscar-ingrediente') {
        QCH.vistas.neveira.setBusca(el.value);
        pintar();
      }
    });
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    if (QCH.eRutaPublica && QCH.eRutaPublica()) {
      QCH.iniciarPublico();
      return;
    }
    app = document.getElementById('app');
    cabeceira = document.getElementById('cabeceira');
    barraInferior = document.getElementById('barra-inferior');

    aplicarTema();
    conectar();
    QCH.estado.subscribe((s, motivo) => {
      pintar(motivo);
      if (motivo === 'semana' || motivo === 'neveira' || motivo === 'cociñeiros') {
        QCH.api.sincronizar(motivo, s[motivo]);
      }
    });
    pintar('nav');

    window.addEventListener('online', () => {
      QCH.api.reintentarPendentes().then(() => {
        /* Non descargamos unha versión remota por riba de cambios que aínda
           seguen na cola. Primeiro teñen que chegar á casa. */
        if (QCH.api.estaAutenticada() && !QCH.api.pendentes().length) {
          return QCH.api.prepararCasa();
        }
      }).catch(() => { /* tentamos na seguinte conexión */ });
    });

    document.getElementById('cargando').remove();

    // O service worker só ten sentido servindo por http(s); desde file:// non se rexistra.
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* sen modo sen conexión, nada crítico */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
