/* Estado único da aplicación, con subscrición e persistencia en localStorage.
   Todas as vistas len de aquí e escriben por aquí. Non hai estado escondido
   dentro dos compoñentes: iso é o que mantén o calendario, a neveira e o
   receitario coherentes entre si. */
window.QCH = window.QCH || {};

QCH.DIAS = [
  { id: 'luns',     nome: 'Luns',     curto: 'Lun' },
  { id: 'martes',   nome: 'Martes',   curto: 'Mar' },
  { id: 'mercores', nome: 'Mércores', curto: 'Mér' },
  { id: 'xoves',    nome: 'Xoves',    curto: 'Xov' },
  { id: 'venres',   nome: 'Venres',   curto: 'Ven' },
  { id: 'sabado',   nome: 'Sábado',   curto: 'Sáb' },
  { id: 'domingo',  nome: 'Domingo',  curto: 'Dom' }
];

/* Na casa faise un só xantar ao día, e cociñao unha soa persoa.
   Todo o que percorre as comidas usa esta lista, así que a semana
   pasa a ter sete ocos en vez de catorce. */
QCH.COMIDAS = [
  { id: 'xantar', nome: 'Xantar' }
];

QCH.slot = (dia, comida) => dia + ':' + comida;

/* Índice do día de hoxe dentro de QCH.DIAS (0 = luns) */
QCH.hoxeIdx = () => (new Date().getDay() + 6) % 7;
QCH.diaHoxe = () => QCH.DIAS[QCH.hoxeIdx()];

const CLAVE = 'qch:v1';

function neveiraInicial() {
  return {
    pataca: 1500, cebola: 4, allo: 8, ovo: 12, aceite: 1000, sal: 20,
    arroz: 500, macarrons: 500, tomate_frito: 400, lentellas: 500,
    cenoria: 4, pemento_verde: 2, leite: 1000, fariña: 1000, queixo: 200,
    atun_lata: 4, garavanzos: 500, tomate: 5, chourizo: 2, pemento_doce: 10,
    loureiro: 5, azucre: 500, manteiga: 250, canela: 5, pementa: 10, perexil: 2
  };
}

/* Semana de partida. Énchese case toda para que a app teña vida ao abrila,
   pero déixanse dous ocos (nunca os de hoxe) para que se vexa como é un oco. */
function semanaInicial() {
  const orde = ['tortilla', 'caldo', 'macarrons', 'lentellas', 'merluza', 'empanada', 'polbo',
                'ensalada_garavanzos', 'arroz_verduras', 'pementos', 'caldeirada', 'croquetas', 'zorza', 'filloas'];
  const s = {};
  let i = 0;
  QCH.DIAS.forEach(d => QCH.COMIDAS.forEach(c => { s[QCH.slot(d.id, c.id)] = orde[i % orde.length]; i++; }));
  const h = QCH.hoxeIdx();
  delete s[QCH.slot(QCH.DIAS[(h + 3) % 7].id, 'xantar')];
  delete s[QCH.slot(QCH.DIAS[(h + 5) % 7].id, 'xantar')];
  return s;
}

function cociñeirosIniciais() {
  const cociñeiros = QCH.PERSOAS.filter(p => p.cociña).map(p => p.id);
  const c = {};
  let i = 0;
  QCH.DIAS.forEach(d => QCH.COMIDAS.forEach(m => { c[QCH.slot(d.id, m.id)] = cociñeiros[i % cociñeiros.length]; i++; }));
  return c;
}

function inicial() {
  return {
    vista: 'hoxe',
    tema: 'claro',
    comensais: QCH.PERSOAS.map(p => p.id),
    neveira: neveiraInicial(),
    semana: semanaInicial(),
    cociñeiros: cociñeirosIniciais(),
    filtros: { texto: '', tempoMax: null, dificultade: null, cat: null, soNeveira: false },
    receitaAberta: null,
    diaAberto: null
  };
}

QCH.estado = (function () {
  let s = inicial();
  const subs = [];

  try {
    const gardado = localStorage.getItem(CLAVE);
    if (gardado) {
      const p = JSON.parse(gardado);
      s = Object.assign(s, p, { receitaAberta: null, diaAberto: null });
      s.filtros = Object.assign(inicial().filtros, p.filtros || {});
      // Datos gardados cando había cea: os ocos que xa non existen hai que
      // tiralos, se non seguirían contando na lista da compra.
      const válidos = QCH.COMIDAS.map(c => ':' + c.id);
      let limpado = false;
      [s.semana, s.cociñeiros].forEach(mapa => {
        Object.keys(mapa || {}).forEach(k => {
          if (!válidos.some(v => k.endsWith(v))) { delete mapa[k]; limpado = true; }
        });
      });
      // Se limpamos algo, reescribimos xa: doutro xeito o lixo seguiría
      // gardado ata que alguén tocase algo.
      if (limpado) gardar();
    }
  } catch (e) { /* localStorage bloqueado (modo privado ou file://): seguimos en memoria */ }

  function gardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        tema: s.tema, comensais: s.comensais, neveira: s.neveira,
        semana: s.semana, cociñeiros: s.cociñeiros, filtros: s.filtros
      }));
    } catch (e) { /* sen persistencia, pero a app funciona igual */ }
  }

  function notificar(motivo) { subs.forEach(f => f(s, motivo)); }

  return {
    get: () => s,
    subscribe: (f) => { subs.push(f); return () => subs.splice(subs.indexOf(f), 1); },
    set(patch, motivo) { Object.assign(s, patch); gardar(); notificar(motivo || 'set'); },
    update(fn, motivo) { fn(s); gardar(); notificar(motivo || 'update'); },
    reiniciar() { s = inicial(); gardar(); notificar('reiniciar'); }
  };
})();

/* ---------- Consultas derivadas ---------- */

/* Cantos comensais hai activos */
QCH.numComensais = () => QCH.estado.get().comensais.length || 1;

/* Cantidade necesaria dun ingrediente para o número real de comensais */
QCH.cantidadeReal = function (receita, ing) {
  const factor = QCH.numComensais() / receita.racions;
  return ing.cant * factor;
};

/* Que falta na neveira para facer unha receita, xa escalado aos comensais.
   Devolve {completa, faltan:[{ing, falta, unid}], cobertura: 0..1} */
QCH.disponibilidade = function (receita) {
  const nev = QCH.estado.get().neveira;
  const faltan = [];
  let teñoPeso = 0;
  receita.ingredientes.forEach(ing => {
    const precisa = QCH.cantidadeReal(receita, ing);
    const teño = nev[ing.id] || 0;
    if (teño >= precisa) { teñoPeso++; }
    else { faltan.push({ id: ing.id, falta: precisa - teño, unid: ing.unid }); }
  });
  const total = receita.ingredientes.length;
  return {
    completa: faltan.length === 0,
    faltan,
    cobertura: total ? teñoPeso / total : 1
  };
};

/* Lista da compra derivada da semana enteira, agregada por ingrediente.
   Só suma o que NON hai na neveira; non pretende ser un xestor de listas. */
QCH.listaDaCompra = function () {
  const s = QCH.estado.get();
  const nev = Object.assign({}, s.neveira);
  const precisa = {};
  Object.values(s.semana).forEach(rid => {
    const r = QCH.receita(rid);
    if (!r) return;
    r.ingredientes.forEach(ing => {
      precisa[ing.id] = (precisa[ing.id] || 0) + QCH.cantidadeReal(r, ing);
    });
  });
  const compra = [];
  Object.keys(precisa).forEach(id => {
    const falta = precisa[id] - (nev[id] || 0);
    if (falta > 0.001) compra.push({ id, cant: falta, unid: QCH.ingrediente(id).unid, cat: QCH.ingrediente(id).cat });
  });
  return compra.sort((a, b) => a.cat.localeCompare(b.cat) || QCH.ingrediente(a.id).nome.localeCompare(QCH.ingrediente(b.id).nome));
};
