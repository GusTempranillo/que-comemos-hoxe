/* A familia e — o importante — as súas adaptacións.
   Este é o diferenciador do produto fronte a calquera app xeral de receitas.

   As regras NON son globais. Son por persoa E por receita:
     nivel 1 · 'sen'         → quítase un ingrediente dese prato
     nivel 2 · 'substituir'  → cámbiase un ingrediente por outro nese prato
     nivel 3 · 'prato'       → esa persoa come outra cousa distinta ese día

   Exemplo real que xustifica todo o modelo: Isabel non quere cebola NA TORTILLA,
   pero si a come na empanada. Unha regra global "Isabel: sen cebola" sería falsa. */
window.QCH = window.QCH || {};

QCH.PERSOAS = [
  {
    id: 'amparo', nome: 'Amparo', cor: '#C0563C', cociña: true,
    nota: 'Cociña os domingos. Non lle gusta improvisar.',
    restricions: [],
    adaptacions: {
      polbo: { tipo: 'sen', ingrediente: 'pemento_picante', motivo: 'Nada de picante' }
    }
  },
  {
    id: 'manuel', nome: 'Manuel', cor: '#4E7A8C', cociña: false,
    nota: 'Pregunta todos os días o que hai de comer.',
    restricions: ['sen sal engadido'],
    adaptacions: {}
  },
  {
    id: 'isabel', nome: 'Isabel', cor: '#8A5FA8', cociña: true,
    nota: 'Organiza a semana. É quen máis usa a app.',
    restricions: [],
    adaptacions: {
      // O caso canónico: sen cebola AQUÍ, pero non en todas partes.
      tortilla: { tipo: 'sen', ingrediente: 'cebola', motivo: 'Na tortilla non, na empanada si' }
    }
  },
  {
    id: 'xoan', nome: 'Xoán', cor: '#3E6B4F', cociña: true,
    nota: 'Cociña entre semana, sempre con présa.',
    restricions: [],
    adaptacions: {}
  },
  {
    id: 'coral', nome: 'Coral', cor: '#2F8F7E', cociña: false,
    nota: 'Vexetariana desde hai dous anos.',
    restricions: ['vexetariana'],
    adaptacions: {
      // Nivel 2: mesmo prato, ingrediente cambiado.
      lentellas: { tipo: 'substituir', ingrediente: 'chourizo', por: 'cogomelos', motivo: 'Sen carne' },
      caldo:     { tipo: 'substituir', ingrediente: 'lacon',    por: 'fabas',     motivo: 'Sen carne' },
      // Nivel 3: prato completamente distinto.
      zorza:     { tipo: 'prato', pratoAlt: 'Tofu á prancha con pemento doce', motivo: 'Non hai versión vexetariana deste prato' },
      croquetas: { tipo: 'prato', pratoAlt: 'Croquetas de cogomelos', motivo: 'Versión propia sen carne' }
    }
  },
  {
    id: 'brais', nome: 'Brais', cor: '#B07C2E', cociña: false,
    nota: 'Come de todo menos peixe con espiñas.',
    restricions: [],
    adaptacions: {
      caldeirada: { tipo: 'prato', pratoAlt: 'Merluza sen espiñas á prancha', motivo: 'Peixe con espiñas non' }
    }
  },
  {
    id: 'sabela', nome: 'Sabela', cor: '#A8447A', cociña: true,
    nota: 'A que máis experimenta. Cociña os sábados.',
    restricions: ['sen lactosa'],
    adaptacions: {
      macarrons: { tipo: 'sen', ingrediente: 'queixo', motivo: 'Sen lactosa' },
      filloas:   { tipo: 'substituir', ingrediente: 'leite', por: 'bebida_vexetal', motivo: 'Sen lactosa' }
    }
  },
  {
    id: 'anton', nome: 'Antón', cor: '#D08A2E', cociña: false,
    nota: 'Nove anos. Negocia todo o que come.',
    restricions: [],
    adaptacions: {
      pementos: { tipo: 'prato', pratoAlt: 'Pan con tomate', motivo: 'Pican' },
      lentellas: { tipo: 'sen', ingrediente: 'cenoria', motivo: 'Non lle gusta a cenoria' }
    }
  }
];

QCH.mapaPersoas = QCH.PERSOAS.reduce((m, p) => (m[p.id] = p, m), {});
QCH.persoa = (id) => QCH.mapaPersoas[id] || null;

/* Devolve todas as adaptacións que aplican a unha receita, xa resoltas
   e listas para pintar. É a función que fai visible o diferenciador. */
QCH.adaptacionsDe = function (receitaId, persoas) {
  const lista = persoas || QCH.estado.get().comensais.map(id => QCH.persoa(id)).filter(Boolean);
  const saida = [];
  lista.forEach(p => {
    const a = p.adaptacions[receitaId];
    if (!a) return;
    let texto;
    if (a.tipo === 'sen') {
      texto = 'sen ' + QCH.ingrediente(a.ingrediente).nome.toLowerCase();
    } else if (a.tipo === 'substituir') {
      texto = QCH.ingrediente(a.ingrediente).nome.toLowerCase() + ' → ' + QCH.ingrediente(a.por).nome.toLowerCase();
    } else {
      texto = a.pratoAlt;
    }
    saida.push({ persoa: p, tipo: a.tipo, texto, motivo: a.motivo });
  });
  return saida;
};
