/* Catálogo canónico de ingredientes.
   É a táboa mestra: as receitas e a neveira apuntan sempre a estes ids,
   nunca a texto libre. Así "cebola" é a mesma cousa en todas partes.

   `kcal100`/`prot100`/`carb100`/`grax100`/`fibra100` son valores
   nutricionais estándar por 100 g (ou 100 ml) de parte comestible —
   cifras típicas de calquera táboa nutricional, non un cálculo exacto
   por lote. `gramosUd` só existe cando `unid` non é xa `g` nin `ml`
   (ex. "1 ud" de cebola, "1 dente" de allo): é o peso medio dese
   ingrediente para poder converter a gramos antes de escalar os
   valores por 100 g. Isto é o que permite calcular a nutrición de
   calquera receita en local (`QCH.nutricionReceita`), sen IA nin
   backend — ver ROADMAP.md Fase 7. */
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
  { id: 'pataca',        nome: 'Patacas',           cat: 'verdura',  unid: 'g',       kcal100: 77,  prot100: 2,    carb100: 17, grax100: 0.1, fibra100: 2.2 },
  { id: 'cebola',        nome: 'Cebola',            cat: 'verdura',  unid: 'ud',      kcal100: 40,  prot100: 1.1,  carb100: 9,  grax100: 0.1, fibra100: 1.7, gramosUd: 110 },
  { id: 'allo',          nome: 'Allo',              cat: 'verdura',  unid: 'dente',   kcal100: 149, prot100: 6.4,  carb100: 33, grax100: 0.5, fibra100: 2.1, gramosUd: 3 },
  { id: 'pemento_verde', nome: 'Pemento verde',     cat: 'verdura',  unid: 'ud',      kcal100: 20,  prot100: 0.9,  carb100: 4.6,grax100: 0.2, fibra100: 1.7, gramosUd: 120 },
  { id: 'pemento_padron',nome: 'Pementos de Padrón',cat: 'verdura',  unid: 'g',       kcal100: 20,  prot100: 1,    carb100: 4.5,grax100: 0.2, fibra100: 1.7 },
  { id: 'tomate',        nome: 'Tomate',            cat: 'verdura',  unid: 'ud',      kcal100: 18,  prot100: 0.9,  carb100: 3.9,grax100: 0.2, fibra100: 1.2, gramosUd: 123 },
  { id: 'cenoria',       nome: 'Cenoria',           cat: 'verdura',  unid: 'ud',      kcal100: 41,  prot100: 0.9,  carb100: 10, grax100: 0.2, fibra100: 2.8, gramosUd: 61 },
  { id: 'repolo',        nome: 'Repolo',            cat: 'verdura',  unid: 'g',       kcal100: 25,  prot100: 1.3,  carb100: 5.8,grax100: 0.1, fibra100: 2.5 },
  { id: 'grelos',        nome: 'Grelos',            cat: 'verdura',  unid: 'g',       kcal100: 32,  prot100: 1.5,  carb100: 4.5,grax100: 0.3, fibra100: 3.2 },
  { id: 'cogomelos',     nome: 'Cogomelos',         cat: 'verdura',  unid: 'g',       kcal100: 22,  prot100: 3.1,  carb100: 3.3,grax100: 0.3, fibra100: 1 },
  { id: 'perexil',       nome: 'Perexil',           cat: 'verdura',  unid: 'ramallo', kcal100: 36,  prot100: 3,    carb100: 6.3,grax100: 0.8, fibra100: 3.3, gramosUd: 15 },
  { id: 'leituga',       nome: 'Leituga',           cat: 'verdura',  unid: 'ud',      kcal100: 15,  prot100: 1.4,  carb100: 2.9,grax100: 0.2, fibra100: 1.3, gramosUd: 300 },
  { id: 'calabacin',     nome: 'Cabaciña',          cat: 'verdura',  unid: 'ud',      kcal100: 17,  prot100: 1.2,  carb100: 3.1,grax100: 0.3, fibra100: 1, gramosUd: 200 },
  { id: 'guisantes',     nome: 'Chícharos',         cat: 'verdura',  unid: 'g',       kcal100: 81,  prot100: 5.4,  carb100: 14, grax100: 0.4, fibra100: 5.7 },

  // — legumes —
  { id: 'garavanzos',    nome: 'Garavanzos',        cat: 'legume',   unid: 'g',       kcal100: 364, prot100: 19,   carb100: 61, grax100: 6,   fibra100: 17 },
  { id: 'lentellas',     nome: 'Lentellas',         cat: 'legume',   unid: 'g',       kcal100: 353, prot100: 25,   carb100: 60, grax100: 1.1, fibra100: 11 },
  { id: 'fabas',         nome: 'Fabas brancas',     cat: 'legume',   unid: 'g',       kcal100: 333, prot100: 21,   carb100: 60, grax100: 1.2, fibra100: 15 },

  // — carne —
  { id: 'chourizo',      nome: 'Chourizo',          cat: 'carne',    unid: 'ud',      kcal100: 455, prot100: 24,   carb100: 2,  grax100: 38,  fibra100: 0, gramosUd: 225 },
  { id: 'lacon',         nome: 'Lacón',             cat: 'carne',    unid: 'g',       kcal100: 300, prot100: 18,   carb100: 0,  grax100: 25,  fibra100: 0 },
  { id: 'touciño',       nome: 'Touciño',           cat: 'carne',    unid: 'g',       kcal100: 541, prot100: 9,    carb100: 0,  grax100: 55,  fibra100: 0 },
  { id: 'polo',          nome: 'Polo',              cat: 'carne',    unid: 'g',       kcal100: 165, prot100: 31,   carb100: 0,  grax100: 3.6, fibra100: 0 },
  { id: 'tenreira',      nome: 'Tenreira',          cat: 'carne',    unid: 'g',       kcal100: 250, prot100: 26,   carb100: 0,  grax100: 15,  fibra100: 0 },
  { id: 'porco',         nome: 'Carne de porco',    cat: 'carne',    unid: 'g',       kcal100: 242, prot100: 27,   carb100: 0,  grax100: 14,  fibra100: 0 },
  { id: 'xamon',         nome: 'Xamón',             cat: 'carne',    unid: 'g',       kcal100: 145, prot100: 21,   carb100: 1,  grax100: 6,   fibra100: 0 },

  // — peixe —
  { id: 'merluza',       nome: 'Merluza',           cat: 'peixe',    unid: 'g',       kcal100: 86,  prot100: 17,   carb100: 0,  grax100: 1.3, fibra100: 0 },
  { id: 'polbo',         nome: 'Polbo',             cat: 'peixe',    unid: 'g',       kcal100: 82,  prot100: 15,   carb100: 2.2,grax100: 1,   fibra100: 0 },
  { id: 'atun_lata',     nome: 'Atún en lata',      cat: 'peixe',    unid: 'lata',    kcal100: 116, prot100: 26,   carb100: 0,  grax100: 1,   fibra100: 0, gramosUd: 80 },
  { id: 'xarda',         nome: 'Xarda',             cat: 'peixe',    unid: 'g',       kcal100: 205, prot100: 19,   carb100: 0,  grax100: 14,  fibra100: 0 },
  { id: 'ameixas',       nome: 'Ameixas',           cat: 'peixe',    unid: 'g',       kcal100: 74,  prot100: 13,   carb100: 2.6,grax100: 1,   fibra100: 0 },
  { id: 'mexillons',     nome: 'Mexillóns',         cat: 'peixe',    unid: 'g',       kcal100: 86,  prot100: 12,   carb100: 3.7,grax100: 2.2, fibra100: 0 },
  { id: 'bacallau',      nome: 'Bacallau',          cat: 'peixe',    unid: 'g',       kcal100: 82,  prot100: 18,   carb100: 0,  grax100: 0.7, fibra100: 0 },

  // — lácteos e ovos —
  { id: 'ovo',           nome: 'Ovos',              cat: 'lacteo',   unid: 'ud',      kcal100: 155, prot100: 13,   carb100: 1.1,grax100: 11,  fibra100: 0, gramosUd: 53 },
  { id: 'leite',         nome: 'Leite',             cat: 'lacteo',   unid: 'ml',      kcal100: 61,  prot100: 3.2,  carb100: 4.8,grax100: 3.3, fibra100: 0 },
  { id: 'manteiga',      nome: 'Manteiga',          cat: 'lacteo',   unid: 'g',       kcal100: 717, prot100: 0.9,  carb100: 0.1,grax100: 81,  fibra100: 0 },
  { id: 'queixo',        nome: 'Queixo',            cat: 'lacteo',   unid: 'g',       kcal100: 350, prot100: 25,   carb100: 1.3,grax100: 28,  fibra100: 0 },
  { id: 'nata',          nome: 'Nata',              cat: 'lacteo',   unid: 'ml',      kcal100: 340, prot100: 2.1,  carb100: 3,  grax100: 36,  fibra100: 0 },
  { id: 'bebida_vexetal',nome: 'Bebida vexetal',    cat: 'lacteo',   unid: 'ml',      kcal100: 45,  prot100: 1,    carb100: 6,  grax100: 1.5, fibra100: 0.5 },

  // — despensa —
  { id: 'aceite',        nome: 'Aceite de oliva',   cat: 'despensa', unid: 'ml',      kcal100: 884, prot100: 0,    carb100: 0,  grax100: 100, fibra100: 0 },
  { id: 'sal',           nome: 'Sal',               cat: 'despensa', unid: 'pitada',  kcal100: 0,   prot100: 0,    carb100: 0,  grax100: 0,   fibra100: 0, gramosUd: 1 },
  { id: 'fariña',        nome: 'Fariña',            cat: 'despensa', unid: 'g',       kcal100: 364, prot100: 10,   carb100: 76, grax100: 1,   fibra100: 2.7 },
  { id: 'arroz',         nome: 'Arroz',             cat: 'despensa', unid: 'g',       kcal100: 365, prot100: 7.1,  carb100: 80, grax100: 0.7, fibra100: 1.3 },
  { id: 'macarrons',     nome: 'Macarróns',         cat: 'despensa', unid: 'g',       kcal100: 371, prot100: 13,   carb100: 75, grax100: 1.5, fibra100: 3.2 },
  { id: 'pan_ralado',    nome: 'Pan relado',        cat: 'despensa', unid: 'g',       kcal100: 395, prot100: 13,   carb100: 72, grax100: 5,   fibra100: 4 },
  { id: 'azucre',        nome: 'Azucre',            cat: 'despensa', unid: 'g',       kcal100: 387, prot100: 0,    carb100: 100,grax100: 0,   fibra100: 0 },
  { id: 'masa_empanada', nome: 'Masa de empanada',  cat: 'despensa', unid: 'ud',      kcal100: 280, prot100: 7,    carb100: 45, grax100: 8,   fibra100: 2, gramosUd: 250 },
  { id: 'tomate_frito',  nome: 'Tomate frito',      cat: 'despensa', unid: 'g',       kcal100: 82,  prot100: 1.6,  carb100: 11, grax100: 3.5, fibra100: 1.5 },
  { id: 'caldo',         nome: 'Caldo de verduras', cat: 'despensa', unid: 'ml',      kcal100: 5,   prot100: 0.3,  carb100: 0.8,grax100: 0.1, fibra100: 0 },
  { id: 'viño_branco',   nome: 'Viño branco',       cat: 'despensa', unid: 'ml',      kcal100: 82,  prot100: 0.1,  carb100: 2.6,grax100: 0,   fibra100: 0 },
  { id: 'tofu',          nome: 'Tofu firme',        cat: 'despensa', unid: 'g',       kcal100: 76,  prot100: 8,    carb100: 1.9,grax100: 4.8, fibra100: 0.3 },

  // — especias — (cantidades tan pequenas que a súa achega real é case nula,
  // pero os valores por 100 g inclúense igual para que o cálculo sexa completo)
  { id: 'pemento_doce',  nome: 'Pemento doce',      cat: 'especia',  unid: 'pitada',  kcal100: 282, prot100: 14,   carb100: 54, grax100: 13,  fibra100: 35, gramosUd: 1 },
  { id: 'pemento_picante',nome:'Pemento picante',   cat: 'especia',  unid: 'pitada',  kcal100: 282, prot100: 12,   carb100: 50, grax100: 15,  fibra100: 35, gramosUd: 1 },
  { id: 'loureiro',      nome: 'Loureiro',          cat: 'especia',  unid: 'folla',   kcal100: 313, prot100: 7.6,  carb100: 75, grax100: 8.4, fibra100: 26, gramosUd: 0.2 },
  { id: 'pementa',       nome: 'Pementa negra',     cat: 'especia',  unid: 'pitada',  kcal100: 251, prot100: 10,   carb100: 64, grax100: 3.3, fibra100: 25, gramosUd: 0.5 },
  { id: 'azafran',       nome: 'Azafrán',           cat: 'especia',  unid: 'pitada',  kcal100: 310, prot100: 11,   carb100: 65, grax100: 6,   fibra100: 3.9, gramosUd: 0.1 },
  { id: 'canela',        nome: 'Canela',            cat: 'especia',  unid: 'pitada',  kcal100: 247, prot100: 4,    carb100: 81, grax100: 1.2, fibra100: 53, gramosUd: 1 }
];

QCH.mapaIngredientes = QCH.INGREDIENTES.reduce((m, i) => (m[i.id] = i, m), {});
QCH.ingrediente = (id) => QCH.mapaIngredientes[id] || { id, nome: id, cat: 'despensa', unid: 'ud' };
