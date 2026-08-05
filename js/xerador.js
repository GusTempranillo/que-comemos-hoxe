/* Xerador de menú semanal.
   Non hai ningunha IA detrás: é un sistema de puntuación explícito e
   auditable. Cada prato recibe unha nota por slot e escóllese entre os
   mellores con algo de azar, para que dúas semanas nunca saian iguais.

   Prefírese isto a un modelo opaco por unha razón de produto: a familia
   ten que poder entender por que lle tocou ese prato. Por iso o xerador
   devolve tamén os motivos. */
window.QCH = window.QCH || {};

QCH.MODOS = [
  { id: 'equilibrado', nome: 'Equilibrado', desc: 'Mestura variedade, tempo e o que hai na neveira.' },
  { id: 'neveira',     nome: 'Baleirar a neveira', desc: 'Prioriza o que xa tes na casa.' },
  { id: 'rapido',      nome: 'Semana con présa', desc: 'Pratos curtos entre semana.' }
];

QCH.xerador = (function () {

  const PESOS = {
    equilibrado: { neveira: 45, tempo: 1.0, variedade: 1.0, azar: 18 },
    neveira:     { neveira: 95, tempo: 0.6, variedade: 0.8, azar: 10 },
    rapido:      { neveira: 30, tempo: 2.2, variedade: 0.9, azar: 12 }
  };

  function finDeSemana(diaId) { return diaId === 'sabado' || diaId === 'domingo'; }

  /* Nota dun prato para un oco concreto. Devolve {nota, motivos[]} */
  function puntuar(receita, diaId, comidaId, usadas, veciñas, modo) {
    const w = PESOS[modo] || PESOS.equilibrado;
    const motivos = [];
    let nota = 50;

    // Xa está esta semana → practicamente descartado
    if (usadas[receita.id]) return { nota: -1000, motivos: [] };

    // 1 · O que hai na neveira
    const disp = QCH.disponibilidade(receita);
    const puntosNev = disp.cobertura * w.neveira;
    nota += puntosNev;
    if (disp.completa) motivos.push('tes todos os ingredientes');
    else if (disp.cobertura >= 0.75) motivos.push('só che falta o ' + Math.round((1 - disp.cobertura) * 100) + '% dos ingredientes');

    // 2 · Tempo segundo o día
    const fds = finDeSemana(diaId);
    if (!fds) {
      if (receita.tempo > 45) { nota -= 30 * w.tempo; }
      else if (receita.tempo <= 30) { nota += 15 * w.tempo; motivos.push('rápido para un día de diario'); }
    } else {
      if (receita.tempo >= 50) { nota += 20 * w.tempo; motivos.push('hai tempo para cociñalo a modo'); }
    }

    // 3 · A sobremesa non é un xantar
    if (receita.cat === 'sobremesa') nota -= 70;

    // 4 · Variedade fronte aos veciños do calendario
    veciñas.forEach(v => {
      const r = QCH.receita(v);
      if (!r) return;
      if (r.cat === receita.cat) nota -= 26 * w.variedade;
      if (r.arte === receita.arte) nota -= 8 * w.variedade;
    });

    // 5 · Canto traballo extra dá adaptar o prato á familia
    const adap = QCH.adaptacionsDe(receita.id);
    const pratosAparte = adap.filter(a => a.tipo === 'prato').length;
    nota -= pratosAparte * 14;
    if (pratosAparte === 0 && adap.length > 0) motivos.push('adáptase sen cociñar nada aparte');
    if (pratosAparte > 0) motivos.push(pratosAparte + (pratosAparte === 1 ? ' persoa come outra cousa' : ' persoas comen outra cousa'));

    // 6 · Azar, para que a semana non sexa sempre a mesma
    nota += Math.random() * w.azar;

    return { nota, motivos };
  }

  /* Escolle un prato entre os mellores, con peso. Evita que sempre gañe o mesmo. */
  function escoller(candidatas) {
    const top = candidatas.filter(c => c.nota > -900).sort((a, b) => b.nota - a.nota).slice(0, 5);
    if (!top.length) return null;
    const base = top[top.length - 1].nota;
    const pesos = top.map(c => Math.max(0.1, c.nota - base + 6));
    const suma = pesos.reduce((a, b) => a + b, 0);
    let t = Math.random() * suma;
    for (let i = 0; i < top.length; i++) { t -= pesos[i]; if (t <= 0) return top[i]; }
    return top[0];
  }

  function veciñasDe(semana, diaIdx, comidaId) {
    const out = [];
    const anterior = QCH.DIAS[(diaIdx + 6) % 7];
    const seguinte = QCH.DIAS[(diaIdx + 1) % 7];
    [anterior, seguinte].forEach(d => QCH.COMIDAS.forEach(c => {
      const v = semana[QCH.slot(d.id, c.id)];
      if (v) out.push(v);
    }));
    return out;
  }

  return {
    /* Xera a semana completa. Devolve {semana, motivos:{slot:[...]}} */
    semana(modo) {
      const semana = {};
      const motivos = {};
      const usadas = {};

      // Percórrense os sete xantares en orde; cada un puntúase contra o
      // que xa quedou posto nos días veciños.
      const ocos = [];
      QCH.DIAS.forEach((d, i) => QCH.COMIDAS.forEach(c => ocos.push({ dia: d, idx: i, comida: c })));

      ocos.forEach(o => {
        const cands = QCH.RECEITAS.map(r => {
          const p = puntuar(r, o.dia.id, o.comida.id, usadas, veciñasDe(semana, o.idx, o.comida.id), modo);
          return { id: r.id, nota: p.nota, motivos: p.motivos };
        });
        const gaña = escoller(cands);
        if (gaña) {
          const k = QCH.slot(o.dia.id, o.comida.id);
          semana[k] = gaña.id;
          motivos[k] = gaña.motivos;
          usadas[gaña.id] = true;
        }
      });

      return { semana, motivos };
    },

    /* Xera un só oco, respectando o que xa hai no resto da semana. */
    oco(diaId, comidaId, modo) {
      const s = QCH.estado.get();
      const idx = QCH.DIAS.findIndex(d => d.id === diaId);
      const usadas = {};
      Object.keys(s.semana).forEach(k => {
        if (k !== QCH.slot(diaId, comidaId)) usadas[s.semana[k]] = true;
      });
      const cands = QCH.RECEITAS.map(r => {
        const p = puntuar(r, diaId, comidaId, usadas, veciñasDe(s.semana, idx, comidaId), modo);
        return { id: r.id, nota: p.nota, motivos: p.motivos };
      });
      return escoller(cands);
    }
  };
})();
