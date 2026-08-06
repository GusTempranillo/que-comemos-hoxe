/* Imaxe JPG do xantar do día, pensada para compartir fóra da app (WhatsApp,
   etc.) sen depender de ningunha ligazón nin do backend: todo se debuxa en
   local nun <canvas> a partir dos datos que xa hai na app. Deseño tipo
   "cartel" de texto — sen fotos nin ilustracións, así que non depende de
   que ningunha imaxe externa cargue nin de permisos CORS. */
window.QCH = window.QCH || {};

QCH.imaxeMenu = (function () {
  const LARGO = 1080, MARXE = 84;
  let blobActual = null;

  const EMOJI_CAT = { carne: '🥩', legume: '🫘', masa: '🥟', peixe: '🐟', sobremesa: '🍰', verdura: '🥕' };
  const EMOJI_TIPO = { sen: '🚫', substituir: '🔄', prato: '🍽️' };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* Devolve as liñas xa partidas para que caiban en `maxAncho`. Precisa que
     `ctx.font` xa estea posto antes de chamala. */
  function partirLiñas(ctx, texto, maxAncho) {
    const palabras = texto.split(/\s+/).filter(Boolean);
    const liñas = [];
    let actual = '';
    palabras.forEach(p => {
      const proba = actual ? actual + ' ' + p : p;
      if (ctx.measureText(proba).width > maxAncho && actual) {
        liñas.push(actual);
        actual = p;
      } else {
        actual = proba;
      }
    });
    if (actual) liñas.push(actual);
    return liñas;
  }

  function agardarFontes() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    // Non bloquear para sempre se as fontes web non chegan a cargar sen rede.
    const carga = Promise.all([
      document.fonts.load('700 60px Fraunces'),
      document.fonts.load('700 30px Inter'),
      document.fonts.load('400 28px Inter')
    ]).catch(() => null);
    return Promise.race([carga, new Promise(r => setTimeout(r, 1200))]);
  }

  function nomesComensais(comensais) {
    return comensais.map(id => { const p = QCH.persoa(id); return p ? p.nome : null; }).filter(Boolean).join(', ');
  }

  /* Debuxa (ou só mide) o cartel enteiro. `pintar=false` executa toda a
     mesma lóxica de medición de texto e avance de `y` pero omite calquera
     operación que pinte de verdade no lenzo — así pódese calcular a altura
     total que precisa o contido (que varía moito: unha familia con 8
     comensais e moitas adaptacións precisa moito máis alto ca unha sen
     ningunha) nunha primeira pasada, e reutilizar exactamente o mesmo
     deseño para pintalo de verdade despois de fixar o tamaño real do
     lenzo. */
  function debuxarCartel(ctx, receita, cociñeiro, pintar) {
    let y = MARXE;
    const centro = LARGO / 2;
    const anchoTexto = LARGO - MARXE * 2;

    function liña(yy, cor, grosor) {
      if (!pintar) return;
      ctx.strokeStyle = cor || '#19141014';
      ctx.lineWidth = grosor || 2;
      ctx.beginPath(); ctx.moveTo(MARXE, yy); ctx.lineTo(LARGO - MARXE, yy); ctx.stroke();
    }

    function centrado(texto, font, cor) {
      ctx.font = font;
      if (pintar) {
        ctx.fillStyle = cor;
        ctx.textAlign = 'center';
        ctx.fillText(texto, centro, y);
        ctx.textAlign = 'left';
      }
    }

    // ---------- Cabeceira do cartel ----------
    centrado('· · ·', '700 20px Inter, sans-serif', '#D6452F99');
    y += 40;
    centrado('MENÚ DE HOXE', '700 28px Inter, sans-serif', '#D6452F');
    y += 38;
    const dataTxt = QCH.dataLonga();
    centrado(dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1), '500 26px Inter, sans-serif', '#19141099');
    y += 32;
    liña(y); liña(y + 5, '#19141008', 2);
    y += 56;

    // ---------- Prato ----------
    const emoxiCat = EMOJI_CAT[receita.cat] || '🍽️';
    centrado(emoxiCat, '46px sans-serif', '#191410');
    y += 68;
    ctx.font = '700 56px Fraunces, Georgia, serif';
    partirLiñas(ctx, receita.nome, anchoTexto).slice(0, 2).forEach(l => { centrado(l, ctx.font, '#191410'); y += 60; });
    y += 8;

    if (receita.subtitulo) {
      ctx.font = '400 27px Inter, sans-serif';
      partirLiñas(ctx, receita.subtitulo, anchoTexto - 80).slice(0, 2).forEach(l => { centrado(l, ctx.font, '#19141099'); y += 34; });
      y += 12;
    }

    // Meta: tempo, dificultade (chamas), vexetariana — centrado nunha fila
    const lumes = '🔥'.repeat(receita.dificultade || 1);
    const metaTxt = '⏱️ ' + QCH.fmtTempo(receita.tempo) + '    ' + lumes + ' ' + QCH.NIVEL_DIF[receita.dificultade] +
      (receita.vexetariana ? '    🌱 Vexetariana' : '');
    centrado(metaTxt, '600 25px Inter, sans-serif', '#191410CC');
    y += 46;

    liña(y);
    y += 48;

    // ---------- Variacións por comensal (o diferenciador da app) ----------
    ctx.font = '700 30px Fraunces, Georgia, serif';
    if (pintar) { ctx.fillStyle = '#191410'; ctx.fillText('Na mesa', MARXE, y); }
    y += 42;

    const adaptacions = QCH.adaptacionsDe(receita.id);
    if (!adaptacions.length) {
      ctx.font = '400 25px Inter, sans-serif';
      if (pintar) { ctx.fillStyle = '#19141088'; ctx.fillText('🍽️  Todos comen o mesmo prato.', MARXE, y); }
      y += 30;
    } else {
      adaptacions.forEach(a => {
        const emoxi = EMOJI_TIPO[a.tipo] || '•';
        const texto = emoxi + '  ' + a.persoa.nome + ' — ' + a.texto;
        ctx.font = '400 25px Inter, sans-serif';
        partirLiñas(ctx, texto, anchoTexto).slice(0, 2).forEach((l, i) => {
          if (pintar) { ctx.fillStyle = i === 0 ? '#191410' : '#19141088'; ctx.fillText((i === 0 ? l : '     ' + l), MARXE, y); }
          y += 32;
        });
      });
    }
    y += 24;

    liña(y);
    y += 48;

    // ---------- Comensais e cociñeiro ----------
    const n = QCH.numComensais();
    ctx.font = '600 26px Inter, sans-serif';
    if (pintar) { ctx.fillStyle = '#191410'; ctx.fillText('👥  Para ' + n + (n === 1 ? ' comensal' : ' comensais'), MARXE, y); }
    y += 34;
    const nomes = nomesComensais(QCH.estado.get().comensais);
    if (nomes) {
      ctx.font = '400 24px Inter, sans-serif';
      partirLiñas(ctx, nomes, anchoTexto).slice(0, 2).forEach(l => { if (pintar) { ctx.fillStyle = '#19141088'; ctx.fillText(l, MARXE, y); } y += 30; });
    }
    if (cociñeiro) {
      y += 6;
      ctx.font = '400 24px Inter, sans-serif';
      if (pintar) { ctx.fillStyle = '#19141088'; ctx.fillText('👩‍🍳  Cociña ' + cociñeiro.nome, MARXE, y); }
      y += 30;
    }
    y += 24;

    liña(y);
    y += 48;

    // ---------- Nutrición ----------
    ctx.font = '700 30px Fraunces, Georgia, serif';
    if (pintar) { ctx.fillStyle = '#191410'; ctx.fillText('🥗  Nutrición', MARXE, y); }
    y += 44;

    const nut = receita.nutricion;
    if (nut) {
      const campos = [
        [nut.calorias, 'kcal'], [nut.proteinas, 'g prot.'], [nut.hidratos, 'g hidr.'], [nut.graxas, 'g graxas'], [nut.fibra, 'g fibra']
      ].filter(c => c[0] != null);
      const gap = 16, anchoCaixa = (anchoTexto - gap * (campos.length - 1)) / campos.length;
      campos.forEach((c, i) => {
        const cx = MARXE + i * (anchoCaixa + gap);
        if (pintar) {
          ctx.fillStyle = '#19141008';
          roundRect(ctx, cx, y, anchoCaixa, 96, 18);
          ctx.fill();
          ctx.fillStyle = '#191410';
        }
        ctx.font = '700 30px Inter, sans-serif';
        ctx.textAlign = 'center';
        if (pintar) ctx.fillText(String(c[0]), cx + anchoCaixa / 2, y + 42);
        ctx.font = '400 18px Inter, sans-serif';
        if (pintar) { ctx.fillStyle = '#19141066'; ctx.fillText(c[1], cx + anchoCaixa / 2, y + 72); }
        ctx.textAlign = 'left';
      });
      y += 96;
    } else {
      ctx.font = '400 24px Inter, sans-serif';
      if (pintar) { ctx.fillStyle = '#19141066'; ctx.fillText('Información nutricional aínda non dispoñible.', MARXE, y - 4); }
      y += 20;
    }
    y += 40;

    // ---------- Pé do cartel ----------
    liña(y); liña(y + 5, '#19141008', 2);
    y += 52;
    centrado('✦ Que comemos hoxe? ✦', '600 24px Fraunces, Georgia, serif', '#19141055');
    y += 20;

    return y + MARXE - 20;
  }

  async function debuxar(canvas, receita, cociñeiro) {
    // Primeira pasada, só para medir: canto máis xente e adaptacións, máis
    // alto precisa ser o cartel. Un contexto calquera serve para medir
    // texto, sen necesidade de que o lenzo teña xa o tamaño final.
    const medidor = document.createElement('canvas').getContext('2d');
    const altura = Math.ceil(debuxarCartel(medidor, receita, cociñeiro, false));

    canvas.width = LARGO;
    canvas.height = altura;
    const ctx = canvas.getContext('2d');

    // Fondo: JPG non ten transparencia, así que hai que pintalo enteiro.
    ctx.fillStyle = '#FBF7F0';
    ctx.fillRect(0, 0, LARGO, altura);
    ctx.textBaseline = 'alphabetic';

    debuxarCartel(ctx, receita, cociñeiro, true);
    return canvas;
  }

  function xerar(diaId) {
    const dia = QCH.DIAS.find(d => d.id === diaId) || QCH.diaHoxe();
    const s = QCH.estado.get();
    const receita = QCH.receita(s.semana[QCH.slot(dia.id, 'xantar')]);
    if (!receita) return Promise.reject({ mensaxe: 'Primeiro escolle un prato para hoxe' });
    const cociñeiro = QCH.persoa(s.cociñeiros[QCH.slot(dia.id, 'xantar')]);

    const canvas = document.createElement('canvas');
    return agardarFontes().then(() => debuxar(canvas, receita, cociñeiro)).then(() =>
      new Promise(resolve => canvas.toBlob(blob => resolve({ canvas, blob }), 'image/jpeg', 0.92))
    );
  }

  function nomeFicheiro(receita) {
    const base = receita.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return 'menu-' + (base || 'hoxe') + '.jpg';
  }

  function abrir(diaId) {
    const dia = QCH.DIAS.find(d => d.id === diaId) || QCH.diaHoxe();
    const receita = QCH.receita(QCH.estado.get().semana[QCH.slot(dia.id, 'xantar')]);
    if (!receita) { QCH.toast('Primeiro escolle un prato para hoxe', 'aviso'); return; }

    blobActual = null;
    QCH.modal.abrir(QCH.modal.envoltorio(
      '<div class="p-5 sm:p-7">' +
        '<div class="flex items-start justify-between gap-4 mb-4">' +
          '<div>' +
            '<h2 class="font-display text-2xl text-tinta dark:text-crema">Imaxe do menú</h2>' +
            '<p class="text-sm text-tinta/55 dark:text-crema/55 mt-1">Lista para descargar ou compartir coma foto.</p>' +
          '</div>' +
          '<button type="button" data-accion="pechar-modal" aria-label="Pechar" ' +
            'class="w-9 h-9 rounded-full grid place-items-center text-tinta/50 hover:bg-tinta/6 dark:text-crema/50 dark:hover:bg-white/10 shrink-0">' +
            QCH.icona('pechar', 'w-4 h-4', 2) + '</button>' +
        '</div>' +
        '<div id="previsualizacion-imaxe-menu" class="rounded-2xl overflow-hidden bg-tinta/5 dark:bg-white/5 grid place-items-center min-h-[280px]">' +
          '<p class="text-sm text-tinta/45 dark:text-crema/45 py-16">Debuxando a imaxe…</p>' +
        '</div>' +
        '<div class="flex gap-2 mt-5" id="botois-imaxe-menu"></div>' +
      '</div>', 'sm:max-w-lg'
    ));

    xerar(dia.id).then(({ canvas, blob }) => {
      blobActual = blob;
      const previa = document.getElementById('previsualizacion-imaxe-menu');
      const botois = document.getElementById('botois-imaxe-menu');
      if (!previa || !botois) return; // pechouse o modal antes de rematar
      previa.innerHTML = '';
      canvas.className = 'w-full h-auto block';
      previa.appendChild(canvas);
      botois.innerHTML =
        QCH.btn('Descargar', 'descargar-imaxe-menu', { variante: 'primario', icona: 'descargar', datos: ' data-ficheiro="' + QCH.esc(nomeFicheiro(receita)) + '"' }) +
        (navigator.share ? QCH.btn('Compartir', 'compartir-imaxe-menu', { variante: 'secundario', icona: 'compartir', datos: ' data-ficheiro="' + QCH.esc(nomeFicheiro(receita)) + '"' }) : '');
    }).catch(erro => {
      const previa = document.getElementById('previsualizacion-imaxe-menu');
      if (previa) previa.innerHTML = '<p class="text-sm text-pemento py-16 px-6 text-center">' + QCH.esc((erro && erro.mensaxe) || 'Non se puido xerar a imaxe') + '</p>';
    });
  }

  function descargar(ficheiro) {
    if (!blobActual) return;
    const url = URL.createObjectURL(blobActual);
    const a = document.createElement('a');
    a.href = url;
    a.download = ficheiro || 'menu.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function compartirNativo(ficheiro) {
    if (!blobActual || !navigator.share) return;
    const file = new File([blobActual], ficheiro || 'menu.jpg', { type: 'image/jpeg' });
    const datos = { files: [file], title: 'Que comemos hoxe?' };
    if (navigator.canShare && !navigator.canShare(datos)) { descargar(ficheiro); return; }
    navigator.share(datos).catch(erro => { if (erro && erro.name !== 'AbortError') descargar(ficheiro); });
  }

  return { abrir, descargar, compartirNativo };
})();
