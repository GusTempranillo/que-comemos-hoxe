/* Catálogo canónico de ingredientes.
   É a táboa mestra: as receitas e a neveira apuntan sempre a estes ids,
   nunca a texto libre. Así "cebola" é a mesma cousa en todas partes. */
window.QCH = window.QCH || {};

QCH.CATEGORIAS = {
  verdura:  { nome: 'Verdura e horta', cor: '#3E6B4F' },
  legume:   { nome: 'Legumes',         cor: '#8A6A3B' },
  carne:    { nome: 'Carne',           cor: '#B4402C' },
  peixe:    { nome: 'Peixe e marisco', cor: '#2F6E86' },
  lacteo:   { nome: 'Lácteos e ovos',  cor: '#C98A2E' },
  despensa: { nome: 'Despensa',        cor: '#7A6A57' },
  especia:  { nome: 'Especias',        cor: '#9C5B2E' }
};

QCH.INGREDIENTES = [
  // — verdura —
  { id: 'pataca',        nome: 'Patacas',           cat: 'verdura',  unid: 'g' },
  { id: 'cebola',        nome: 'Cebola',            cat: 'verdura',  unid: 'ud' },
  { id: 'allo',          nome: 'Allo',              cat: 'verdura',  unid: 'dente' },
  { id: 'pemento_verde', nome: 'Pemento verde',     cat: 'verdura',  unid: 'ud' },
  { id: 'pemento_padron',nome: 'Pementos de Padrón',cat: 'verdura',  unid: 'g' },
  { id: 'tomate',        nome: 'Tomate',            cat: 'verdura',  unid: 'ud' },
  { id: 'cenoria',       nome: 'Cenoria',           cat: 'verdura',  unid: 'ud' },
  { id: 'repolo',        nome: 'Repolo',            cat: 'verdura',  unid: 'g' },
  { id: 'grelos',        nome: 'Grelos',            cat: 'verdura',  unid: 'g' },
  { id: 'cogomelos',     nome: 'Cogomelos',         cat: 'verdura',  unid: 'g' },
  { id: 'perexil',       nome: 'Perexil',           cat: 'verdura',  unid: 'ramallo' },
  { id: 'leituga',       nome: 'Leituga',           cat: 'verdura',  unid: 'ud' },
  { id: 'calabacin',     nome: 'Cabaciña',          cat: 'verdura',  unid: 'ud' },
  { id: 'guisantes',     nome: 'Chícharos',         cat: 'verdura',  unid: 'g' },

  // — legumes —
  { id: 'garavanzos',    nome: 'Garavanzos',        cat: 'legume',   unid: 'g' },
  { id: 'lentellas',     nome: 'Lentellas',         cat: 'legume',   unid: 'g' },
  { id: 'fabas',         nome: 'Fabas brancas',     cat: 'legume',   unid: 'g' },

  // — carne —
  { id: 'chourizo',      nome: 'Chourizo',          cat: 'carne',    unid: 'ud' },
  { id: 'lacon',         nome: 'Lacón',             cat: 'carne',    unid: 'g' },
  { id: 'touciño',       nome: 'Touciño',           cat: 'carne',    unid: 'g' },
  { id: 'polo',          nome: 'Polo',              cat: 'carne',    unid: 'g' },
  { id: 'tenreira',      nome: 'Tenreira',          cat: 'carne',    unid: 'g' },
  { id: 'porco',         nome: 'Carne de porco',    cat: 'carne',    unid: 'g' },
  { id: 'xamon',         nome: 'Xamón',             cat: 'carne',    unid: 'g' },

  // — peixe —
  { id: 'merluza',       nome: 'Merluza',           cat: 'peixe',    unid: 'g' },
  { id: 'polbo',         nome: 'Polbo',             cat: 'peixe',    unid: 'g' },
  { id: 'atun_lata',     nome: 'Atún en lata',      cat: 'peixe',    unid: 'lata' },
  { id: 'xarda',         nome: 'Xarda',             cat: 'peixe',    unid: 'g' },
  { id: 'ameixas',       nome: 'Ameixas',           cat: 'peixe',    unid: 'g' },
  { id: 'mexillons',     nome: 'Mexillóns',         cat: 'peixe',    unid: 'g' },
  { id: 'bacallau',      nome: 'Bacallau',          cat: 'peixe',    unid: 'g' },

  // — lácteos e ovos —
  { id: 'ovo',           nome: 'Ovos',              cat: 'lacteo',   unid: 'ud' },
  { id: 'leite',         nome: 'Leite',             cat: 'lacteo',   unid: 'ml' },
  { id: 'manteiga',      nome: 'Manteiga',          cat: 'lacteo',   unid: 'g' },
  { id: 'queixo',        nome: 'Queixo',            cat: 'lacteo',   unid: 'g' },
  { id: 'nata',          nome: 'Nata',              cat: 'lacteo',   unid: 'ml' },
  { id: 'bebida_vexetal',nome: 'Bebida vexetal',    cat: 'lacteo',   unid: 'ml' },

  // — despensa —
  { id: 'aceite',        nome: 'Aceite de oliva',   cat: 'despensa', unid: 'ml' },
  { id: 'sal',           nome: 'Sal',               cat: 'despensa', unid: 'pitada' },
  { id: 'fariña',        nome: 'Fariña',            cat: 'despensa', unid: 'g' },
  { id: 'arroz',         nome: 'Arroz',             cat: 'despensa', unid: 'g' },
  { id: 'macarrons',     nome: 'Macarróns',         cat: 'despensa', unid: 'g' },
  { id: 'pan_ralado',    nome: 'Pan relado',        cat: 'despensa', unid: 'g' },
  { id: 'azucre',        nome: 'Azucre',            cat: 'despensa', unid: 'g' },
  { id: 'masa_empanada', nome: 'Masa de empanada',  cat: 'despensa', unid: 'ud' },
  { id: 'tomate_frito',  nome: 'Tomate frito',      cat: 'despensa', unid: 'g' },
  { id: 'caldo',         nome: 'Caldo de verduras', cat: 'despensa', unid: 'ml' },
  { id: 'viño_branco',   nome: 'Viño branco',       cat: 'despensa', unid: 'ml' },
  { id: 'tofu',          nome: 'Tofu firme',        cat: 'despensa', unid: 'g' },

  // — especias —
  { id: 'pemento_doce',  nome: 'Pemento doce',      cat: 'especia',  unid: 'pitada' },
  { id: 'pemento_picante',nome:'Pemento picante',   cat: 'especia',  unid: 'pitada' },
  { id: 'loureiro',      nome: 'Loureiro',          cat: 'especia',  unid: 'folla' },
  { id: 'pementa',       nome: 'Pementa negra',     cat: 'especia',  unid: 'pitada' },
  { id: 'azafran',       nome: 'Azafrán',           cat: 'especia',  unid: 'pitada' },
  { id: 'canela',        nome: 'Canela',            cat: 'especia',  unid: 'pitada' }
];

QCH.mapaIngredientes = QCH.INGREDIENTES.reduce((m, i) => (m[i.id] = i, m), {});
QCH.ingrediente = (id) => QCH.mapaIngredientes[id] || { id, nome: id, cat: 'despensa', unid: 'ud' };
