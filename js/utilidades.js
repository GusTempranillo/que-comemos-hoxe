/* Utilidades transversais: iconografía SVG, arte xerativa dos pratos,
   formateo e pequenos axudantes de DOM. Todo vectorial e local:
   a app non depende de ningunha imaxe externa para verse ben. */
window.QCH = window.QCH || {};

/* ---------- DOM ---------- */
QCH.$  = (sel, ctx) => (ctx || document).querySelector(sel);
QCH.$$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
QCH.esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ---------- Formateo ---------- */
QCH.fmtTempo = (min) => min < 60 ? min + ' min'
  : (min % 60 === 0 ? (min / 60) + ' h' : Math.floor(min / 60) + ' h ' + (min % 60) + ' min');

QCH.fmtCant = (n) => {
  const r = Math.round(n * 10) / 10;
  return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)).replace('.', ',');
};

QCH.NIVEL_DIF = { 1: 'Doado', 2: 'Medio', 3: 'Require man' };

/* Canto sube ou baixa a neveira por toque, e con canto se engade algo novo.
   Vive aquí para que a vista e as accións non poidan discrepar. */
const PASO_UNID    = { g: 100, ml: 100, ud: 1, dente: 1, pitada: 1, lata: 1, folla: 1, ramallo: 1 };
const INICIAL_UNID = { g: 500, ml: 500, ud: 2, dente: 4, pitada: 5, lata: 2, folla: 3, ramallo: 1 };
QCH.pasoUnidade      = (u) => PASO_UNID[u] || 1;
QCH.cantidadeInicial = (u) => INICIAL_UNID[u] || 1;

/* ---------- Iconas (24×24, trazo, herdan currentColor) ---------- */
const P = {
  hoxe:      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.2"/>',
  semana:    '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10.5h18"/>',
  receitario:'<path d="M6.5 3H19v18H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3z"/><path d="M4 17.2h15"/><path d="M9 7.5h6"/>',
  neveira:   '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M5 10h14M8.5 6v2M8.5 13v3"/>',
  familia:   '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20.5v-.8A6.5 6.5 0 0 1 15.5 19.7v.8"/><path d="M17 11.4a3 3 0 1 0-1.6-5.5"/><path d="M21.5 20.5v-.8a5 5 0 0 0-3.4-4.7"/>',
  buscar:    '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.9-3.9"/>',
  mais:      '<path d="M12 5.5v13M5.5 12h13"/>',
  menos:     '<path d="M5.5 12h13"/>',
  pechar:    '<path d="M18 6L6 18M6 6l12 12"/>',
  check:     '<path d="M20 6.5L9.2 17.3 4 12.1"/>',
  reloxo:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.2 1.9"/>',
  lume:      '<path d="M12 2.4c2.7 3.2 5.5 5.7 5.5 9.7a5.5 5.5 0 1 1-11 0c0-1.9.9-3.4 1.8-4.5.1 1.3.6 2.3 1.4 3 .3-3.1 1-5.7 2.3-8.2z"/>',
  xerar:     '<path d="M12 3l1.7 4.6L18.3 9.3l-4.6 1.7L12 15.6l-1.7-4.6L5.7 9.3l4.6-1.7z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  compra:    '<path d="M4.5 8.5h15l-1.3 10.9a2 2 0 0 1-2 1.6H7.8a2 2 0 0 1-2-1.6z"/><path d="M9 8.5V6a3 3 0 0 1 6 0v2.5"/>',
  lixo:      '<path d="M4 7h16M9.5 7V4.8h5V7"/><path d="M6.3 7l.9 13h9.6l.9-13"/>',
  sol:       '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/>',
  lua:       '<path d="M20.5 13.4A8.6 8.6 0 1 1 10.6 3.5a6.8 6.8 0 0 0 9.9 9.9z"/>',
  dereita:   '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
  esquerda:  '<path d="M15 5.5L8.5 12 15 18.5"/>',
  alerta:    '<path d="M12 3.2l9 16.2H3z"/><path d="M12 9.5v4.2M12 16.8h.02"/>',
  persoa:    '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.6v-.9a7.5 7.5 0 0 1 15 0v.9"/>',
  editar:    '<path d="M4 20.2h4.2L19.4 9a2.9 2.9 0 0 0-4.2-4.1L4 16.1z"/>',
  menu:      '<path d="M4 7h16M4 12h16M4 17h16"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.2M12 7.9h.02"/>',
  volver:    '<path d="M10 5.5L3.5 12 10 18.5"/><path d="M3.5 12H20"/>'
};

QCH.icona = function (nome, clase, grosor) {
  const d = P[nome] || P.info;
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (grosor || 1.7) +
    '" stroke-linecap="round" stroke-linejoin="round" class="' + (clase || 'w-5 h-5') +
    '" aria-hidden="true">' + d + '</svg>';
};

/* Versión maciza: a trazo fino hai formas (a chama) que non se len
   a 14 px. Recheas si. */
QCH.iconaChea = function (nome, clase) {
  const d = P[nome] || P.info;
  return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="' + (clase || 'w-4 h-4') +
    '" aria-hidden="true">' + d + '</svg>';
};

/* ---------- Xerador pseudo-aleatorio determinista ----------
   A mesma receita debuxa sempre exactamente o mesmo, pero cada
   receita ten a súa propia composición. */
function semente(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ---------- Arte xerativa dos pratos ---------- */
const ARQUETIPOS = {
  redondo(r, c) { // tortilla: disco con porción cortada
    let s = '<circle cx="200" cy="152" r="86" fill="' + c.b + '"/>' +
            '<circle cx="200" cy="148" r="86" fill="' + c.a + '"/>' +
            '<path d="M200 148 L200 62 A86 86 0 0 1 275 190 Z" fill="' + c.b + '" opacity=".55"/>';
    for (let i = 0; i < 26; i++) {
      const ang = r() * Math.PI * 2, rad = 18 + r() * 62;
      s += '<circle cx="' + (200 + Math.cos(ang) * rad).toFixed(1) + '" cy="' + (148 + Math.sin(ang) * rad).toFixed(1) +
           '" r="' + (2 + r() * 3.4).toFixed(1) + '" fill="#fff" opacity="' + (0.10 + r() * 0.16).toFixed(2) + '"/>';
    }
    return s;
  },
  cunca(r, c) { // guiso: cunca vista en escorzo con vapor
    let s = '<path d="M104 128h192a8 8 0 0 1 8 8c0 52-42 88-104 88s-104-36-104-88a8 8 0 0 1 8-8z" fill="' + c.b + '"/>' +
            '<ellipse cx="200" cy="132" rx="96" ry="26" fill="' + c.a + '"/>';
    for (let i = 0; i < 22; i++) {
      const x = 118 + r() * 164, y = 120 + r() * 24;
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (3 + r() * 5).toFixed(1) +
           '" fill="#fff" opacity="' + (0.10 + r() * 0.20).toFixed(2) + '"/>';
    }
    for (let i = 0; i < 3; i++) {
      const x = 160 + i * 40;
      s += '<path d="M' + x + ' 96 q10 -16 0 -30 q-10 -14 0 -28" stroke="#fff" stroke-opacity=".26" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    return s;
  },
  rectangulo(r, c) { // empanada: rectángulo con reixa
    let s = '<rect x="88" y="74" width="224" height="152" rx="16" fill="' + c.b + '"/>' +
            '<rect x="98" y="82" width="204" height="136" rx="12" fill="' + c.a + '"/>';
    for (let i = 1; i < 5; i++) s += '<path d="M' + (98 + i * 41) + ' 82v136" stroke="' + c.b + '" stroke-width="7" opacity=".6"/>';
    for (let i = 1; i < 3; i++) s += '<path d="M98 ' + (82 + i * 45) + 'h204" stroke="' + c.b + '" stroke-width="7" opacity=".6"/>';
    for (let i = 0; i < 16; i++) s += '<circle cx="' + (92 + i * 14.5).toFixed(0) + '" cy="' + (i % 2 ? 78 : 222) + '" r="4" fill="' + c.b + '"/>';
    s += '<circle cx="200" cy="150" r="9" fill="' + c.b + '"/>';
    return s;
  },
  disperso(r, c) { // pementos ceibos
    let s = '';
    for (let i = 0; i < 11; i++) {
      const x = 70 + r() * 260, y = 80 + r() * 150, rot = r() * 360, l = 40 + r() * 26;
      s += '<g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ') rotate(' + rot.toFixed(0) + ')">' +
           '<path d="M0 0 q10 -6 18 2 q10 10 2 20 q-10 12 -22 4 Q-6 18 0 0z" fill="' + (i % 3 ? c.a : c.b) + '" transform="scale(' + (l / 40).toFixed(2) + ')"/>' +
           '<path d="M0 0 l-7 -8" stroke="' + c.b + '" stroke-width="4" stroke-linecap="round"/></g>';
    }
    return s;
  },
  taboa(r, c) { // táboa de madeira con rodelas
    let s = '<rect x="60" y="70" width="280" height="164" rx="12" fill="#8A6440"/>' +
            '<rect x="60" y="70" width="280" height="164" rx="12" fill="' + c.b + '" opacity=".2"/>';
    for (let i = 0; i < 6; i++) s += '<path d="M60 ' + (86 + i * 27) + 'h280" stroke="#6E4E31" stroke-width="2" opacity=".45"/>';
    for (let i = 0; i < 9; i++) {
      const x = 96 + (i % 3) * 92 + r() * 16, y = 108 + Math.floor(i / 3) * 46 + r() * 10;
      s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + (16 + r() * 7).toFixed(1) + '" fill="' + c.a + '"/>' +
           '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + (6 + r() * 3).toFixed(1) + '" fill="' + c.b + '" opacity=".75"/>';
    }
    return s;
  },
  prato_peixe(r, c) { // prato branco con posta de peixe
    let s = '<circle cx="200" cy="150" r="104" fill="#F6EFE4"/><circle cx="200" cy="150" r="82" fill="#EDE2D2"/>' +
            '<path d="M120 150 q40 -46 92 -46 q46 0 68 46 q-22 46 -68 46 q-52 0 -92 -46z" fill="' + c.a + '"/>' +
            '<path d="M280 150 l34 -24v48z" fill="' + c.a + '"/>' +
            '<circle cx="164" cy="142" r="5" fill="' + c.b + '"/>';
    for (let i = 0; i < 5; i++) s += '<path d="M' + (176 + i * 20) + ' 126 q6 24 0 48" stroke="' + c.b + '" stroke-width="3" fill="none" opacity=".5"/>';
    return s;
  },
  pan_arroz(r, c) { // tixola vista dende arriba
    let s = '<circle cx="188" cy="150" r="102" fill="#3A342E"/><circle cx="188" cy="150" r="90" fill="' + c.b + '"/>' +
            '<rect x="284" y="142" width="86" height="16" rx="8" fill="#3A342E"/>' +
            '<circle cx="188" cy="150" r="78" fill="' + c.a + '"/>';
    for (let i = 0; i < 60; i++) {
      const ang = r() * Math.PI * 2, rad = r() * 74;
      s += '<ellipse cx="' + (188 + Math.cos(ang) * rad).toFixed(1) + '" cy="' + (150 + Math.sin(ang) * rad).toFixed(1) +
           '" rx="4.2" ry="2.4" transform="rotate(' + (r() * 180).toFixed(0) + ' ' + (188 + Math.cos(ang) * rad).toFixed(1) + ' ' + (150 + Math.sin(ang) * rad).toFixed(1) +
           ')" fill="#fff" opacity="' + (0.30 + r() * 0.4).toFixed(2) + '"/>';
    }
    return s;
  },
  pasta(r, c) { // tubos de macarrón
    let s = '<circle cx="200" cy="150" r="100" fill="' + c.b + '" opacity=".55"/>';
    for (let i = 0; i < 15; i++) {
      const x = 92 + r() * 216, y = 82 + r() * 138, rot = r() * 180;
      s += '<g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ') rotate(' + rot.toFixed(0) + ')">' +
           '<rect x="-24" y="-9" width="48" height="18" rx="9" fill="' + c.a + '"/>' +
           '<ellipse cx="-24" cy="0" rx="4" ry="9" fill="' + c.b + '"/></g>';
    }
    return s;
  },
  bolitas(r, c) { // croquetas
    let s = '<ellipse cx="200" cy="206" rx="120" ry="26" fill="' + c.b + '" opacity=".35"/>';
    for (let i = 0; i < 8; i++) {
      const x = 92 + (i % 4) * 72 + r() * 12, y = 118 + Math.floor(i / 4) * 58 + r() * 8, rot = -24 + r() * 48;
      s += '<g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ') rotate(' + rot.toFixed(0) + ')">' +
           '<rect x="-30" y="-17" width="60" height="34" rx="17" fill="' + c.a + '"/>' +
           '<rect x="-30" y="-17" width="60" height="12" rx="6" fill="#fff" opacity=".18"/></g>';
    }
    return s;
  },
  ensalada(r, c) { // cunca vista cenital con anacos
    let s = '<circle cx="200" cy="150" r="104" fill="#F3EBDD"/><circle cx="200" cy="150" r="90" fill="' + c.b + '" opacity=".3"/>';
    const cores = [c.a, c.b, '#D4553C', '#E4B54A', '#F2E7D3'];
    for (let i = 0; i < 34; i++) {
      const ang = r() * Math.PI * 2, rad = r() * 82;
      const x = 200 + Math.cos(ang) * rad, y = 150 + Math.sin(ang) * rad;
      s += '<rect x="' + (x - 8).toFixed(1) + '" y="' + (y - 8).toFixed(1) + '" width="' + (10 + r() * 8).toFixed(1) +
           '" height="' + (10 + r() * 8).toFixed(1) + '" rx="4" transform="rotate(' + (r() * 90).toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) +
           ')" fill="' + cores[Math.floor(r() * cores.length)] + '" opacity=".92"/>';
    }
    return s;
  },
  apilado(r, c) { // filloas amoreadas, vista lateral
    let s = '<ellipse cx="200" cy="214" rx="118" ry="20" fill="' + c.b + '" opacity=".3"/>';
    for (let i = 6; i >= 0; i--) {
      const y = 200 - i * 17, off = (r() - 0.5) * 14;
      s += '<ellipse cx="' + (200 + off).toFixed(0) + '" cy="' + y + '" rx="106" ry="21" fill="' + (i % 2 ? c.a : c.b) + '"/>' +
           '<ellipse cx="' + (200 + off).toFixed(0) + '" cy="' + (y - 3) + '" rx="106" ry="19" fill="#fff" opacity=".10"/>';
    }
    s += '<circle cx="200" cy="86" r="9" fill="#fff" opacity=".55"/>';
    return s;
  }
};

QCH.arte = function (receita) {
  const r = semente(receita.id);
  const c = { a: receita.paleta[0], b: receita.paleta[1] };
  const uid = 'a-' + receita.id;
  const fn = ARQUETIPOS[receita.arte] || ARQUETIPOS.redondo;
  return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" class="w-full h-full block" role="img" aria-label="Ilustración de ' + QCH.esc(receita.nome) + '">' +
    '<defs>' +
      '<linearGradient id="' + uid + '-bg" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + c.a + '" stop-opacity=".30"/>' +
        '<stop offset="1" stop-color="' + c.b + '" stop-opacity=".62"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + uid + '-lz" cx=".3" cy=".2" r=".9">' +
        '<stop offset="0" stop-color="#FFF8EC" stop-opacity=".55"/>' +
        '<stop offset="1" stop-color="#FFF8EC" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<filter id="' + uid + '-gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3"/>' +
        '<feColorMatrix type="saturate" values="0"/></filter>' +
    '</defs>' +
    '<rect width="400" height="300" fill="' + c.b + '"/>' +
    '<rect width="400" height="300" fill="url(#' + uid + '-bg)"/>' +
    '<rect width="400" height="300" fill="url(#' + uid + '-lz)"/>' +
    fn(r, c) +
    '<rect width="400" height="300" filter="url(#' + uid + '-gr)" opacity=".13" style="mix-blend-mode:overlay"/>' +
  '</svg>';
};

/* Imaxe do prato: a ilustración vai SEMPRE debaixo e a foto por riba.
   Se a foto non carga (ou non hai rede), non se ve ningún oco: queda a arte. */
QCH.imaxePrato = function (receita, clases) {
  const cls = clases || 'w-full h-full';
  let html = '<div class="relative overflow-hidden ' + cls + '">' + QCH.arte(receita);
  if (receita.foto) {
    html += '<img src="' + QCH.esc(receita.foto) + '" alt="" loading="lazy" decoding="async" ' +
      'class="foto-prato absolute inset-0 w-full h-full object-cover opacity-0" ' +
      'onload="this.classList.add(\'foto-ok\')" onerror="this.remove()">';
  }
  return html + '</div>';
};

/* ---------- Avatar ---------- */
QCH.avatar = function (p, tam) {
  const t = tam || 32;
  return '<span class="inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0" ' +
    'style="width:' + t + 'px;height:' + t + 'px;background:' + p.cor + ';font-size:' + Math.round(t * 0.42) + 'px" ' +
    'title="' + QCH.esc(p.nome) + '">' + QCH.esc(p.nome.charAt(0)) + '</span>';
};
