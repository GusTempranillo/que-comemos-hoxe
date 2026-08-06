/* Imaxe JPG do xantar do día, pensada para compartir fóra da app (WhatsApp,
   etc.) sen depender de ningunha ligazón nin do backend: todo se debuxa en
   local nun <canvas> a partir dos datos que xa hai na app. */
window.QCH = window.QCH || {};

QCH.imaxeMenu = (function () {
  const LARGO = 1080, ALTO = 1350, MARXE = 64;
  let blobActual = null;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* Devolve as liñas xa partidas para que caiban en `maxAncho`. */
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

  function cargarImaxeArte(receita) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject({ mensaxe: 'Non se puido debuxar a ilustración do prato' });
      // QCH.arte() devolve un <svg> sen `xmlns`: válido inserido inline no
      // HTML (que é o único uso que fai o resto da app), pero un documento
      // SVG autónomo (coma o que precisa unha imaxe por URI de datos) esíxeo.
      const svg = QCH.arte(receita).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
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

  function debuxar(canvas, dia, receita, cociñeiro) {
    const ctx = canvas.getContext('2d');
    canvas.width = LARGO;
    canvas.height = ALTO;

    // Fondo: JPG non ten transparencia, así que hai que pintalo enteiro.
    ctx.fillStyle = '#FBF7F0';
    ctx.fillRect(0, 0, LARGO, ALTO);

    let y = MARXE;

    ctx.fillStyle = '#D6452F';
    ctx.font = '700 24px Inter, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('MENÚ COMPARTIDO', MARXE, y + 22);

    ctx.fillStyle = '#19141099';
    ctx.font = '500 26px Inter, sans-serif';
    const dataTxt = QCH.dataLonga();
    ctx.fillText(dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1), LARGO - MARXE - ctx.measureText(dataTxt).width, y + 20);

    y += 56;

    // Ilustración do prato
    const anchoArte = LARGO - MARXE * 2, altoArte = Math.round(anchoArte * 9 / 16);
    return cargarImaxeArte(receita).then(img => {
      ctx.save();
      roundRect(ctx, MARXE, y, anchoArte, altoArte, 28);
      ctx.clip();
      ctx.drawImage(img, MARXE, y, anchoArte, altoArte);
      ctx.restore();
      y += altoArte + 44;

      // Nome do prato
      ctx.fillStyle = '#191410';
      ctx.font = '700 58px Fraunces, Georgia, serif';
      const liñasNome = partirLiñas(ctx, receita.nome, LARGO - MARXE * 2);
      liñasNome.slice(0, 2).forEach(l => { ctx.fillText(l, MARXE, y); y += 62; });
      y += 6;

      // Subtítulo
      if (receita.subtitulo) {
        ctx.fillStyle = '#19141099';
        ctx.font = '400 28px Inter, sans-serif';
        const liñasSub = partirLiñas(ctx, receita.subtitulo, LARGO - MARXE * 2);
        liñasSub.slice(0, 2).forEach(l => { ctx.fillText(l, MARXE, y); y += 36; });
        y += 18;
      }

      // Meta: tempo, dificultade, vexetariana
      ctx.font = '600 24px Inter, sans-serif';
      const chips = [QCH.fmtTempo(receita.tempo), QCH.NIVEL_DIF[receita.dificultade]];
      if (receita.vexetariana) chips.push('Vexetariana');
      let x = MARXE;
      chips.forEach(txt => {
        const w = ctx.measureText(txt).width + 40;
        ctx.fillStyle = '#19141010';
        roundRect(ctx, x, y, w, 46, 23);
        ctx.fill();
        ctx.fillStyle = '#191410CC';
        ctx.fillText(txt, x + 20, y + 31);
        x += w + 14;
      });
      y += 46 + 40;

      // Comensais e cociñeiro
      const nomes = nomesComensais(QCH.estado.get().comensais);
      ctx.fillStyle = '#191410';
      ctx.font = '600 26px Inter, sans-serif';
      ctx.fillText('Para ' + QCH.numComensais() + (QCH.numComensais() === 1 ? ' comensal' : ' comensais'), MARXE, y);
      y += 34;
      if (nomes) {
        ctx.fillStyle = '#19141088';
        ctx.font = '400 24px Inter, sans-serif';
        partirLiñas(ctx, nomes, LARGO - MARXE * 2).slice(0, 2).forEach(l => { ctx.fillText(l, MARXE, y); y += 30; });
      }
      if (cociñeiro) {
        y += 6;
        ctx.fillStyle = '#19141088';
        ctx.font = '400 24px Inter, sans-serif';
        ctx.fillText('Cociña ' + cociñeiro.nome, MARXE, y);
        y += 30;
      }
      y += 24;

      // Liña separadora
      ctx.strokeStyle = '#19141014';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(MARXE, y); ctx.lineTo(LARGO - MARXE, y); ctx.stroke();
      y += 48;

      // Nutrición: só se hai datos calculados na propia receita.
      ctx.fillStyle = '#191410';
      ctx.font = '700 32px Fraunces, Georgia, serif';
      ctx.fillText('Nutrición', MARXE, y);
      y += 44;

      const n = receita.nutricion;
      if (n) {
        const campos = [
          [n.calorias, 'kcal'], [n.proteinas, 'g prot.'], [n.hidratos, 'g hidr.'], [n.graxas, 'g graxas'], [n.fibra, 'g fibra']
        ].filter(c => c[0] != null);
        const gap = 16, anchoCaixa = (LARGO - MARXE * 2 - gap * (campos.length - 1)) / campos.length;
        campos.forEach((c, i) => {
          const cx = MARXE + i * (anchoCaixa + gap);
          ctx.fillStyle = '#19141008';
          roundRect(ctx, cx, y, anchoCaixa, 96, 18);
          ctx.fill();
          ctx.fillStyle = '#191410';
          ctx.font = '700 30px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(c[0]), cx + anchoCaixa / 2, y + 42);
          ctx.fillStyle = '#19141066';
          ctx.font = '400 18px Inter, sans-serif';
          ctx.fillText(c[1], cx + anchoCaixa / 2, y + 72);
          ctx.textAlign = 'left';
        });
        y += 96;
      } else {
        ctx.fillStyle = '#19141066';
        ctx.font = '400 24px Inter, sans-serif';
        ctx.fillText('Información nutricional aínda non dispoñible.', MARXE, y - 4);
        y += 20;
      }

      // Pé de páxina
      ctx.textAlign = 'center';
      ctx.fillStyle = '#19141055';
      ctx.font = '600 24px Fraunces, Georgia, serif';
      ctx.fillText('Que comemos hoxe?', LARGO / 2, ALTO - 46);
      ctx.textAlign = 'left';

      return canvas;
    });
  }

  function xerar(diaId) {
    const dia = QCH.DIAS.find(d => d.id === diaId) || QCH.diaHoxe();
    const s = QCH.estado.get();
    const receita = QCH.receita(s.semana[QCH.slot(dia.id, 'xantar')]);
    if (!receita) return Promise.reject({ mensaxe: 'Primeiro escolle un prato para hoxe' });
    const cociñeiro = QCH.persoa(s.cociñeiros[QCH.slot(dia.id, 'xantar')]);

    const canvas = document.createElement('canvas');
    return agardarFontes().then(() => debuxar(canvas, dia, receita, cociñeiro)).then(() =>
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
