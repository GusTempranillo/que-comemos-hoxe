/* O receitario. É a peza central do modelo: o calendario e a lista da compra
   dependen del, nunca ao revés. As cantidades son sempre para 4 racións;
   a app reescálaas segundo os comensais de cada día. */
window.QCH = window.QCH || {};

QCH.RECEITAS = [
  {
    id: 'tortilla',
    nome: 'Tortilla de patacas',
    subtitulo: 'A discusión eterna: con cebola ou sen ela. Aquí resólvese por comensal.',
    historia: 'Receita de sempre, sen dono claro: cada casa xura que a súa é a orixinal. Aquí quedou fixada a norma da cebola por comensal para acabar coa discusión de vez.',
    cat: 'verdura', arte: 'redondo', paleta: ['#E9B14A', '#C97C21'],
    foto: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=70',
    tempo: 40, dificultade: 1, racions: 4, vexetariana: true,
    tags: ['tradicional', 'de sempre'],
    ingredientes: [
      { id: 'pataca', cant: 800, unid: 'g' },
      { id: 'ovo', cant: 6, unid: 'ud' },
      { id: 'cebola', cant: 1, unid: 'ud' },
      { id: 'aceite', cant: 200, unid: 'ml' },
      { id: 'sal', cant: 2, unid: 'pitada' }
    ],
    pasos: [
      'Pela e corta as patacas en láminas finas, non moi regulares: así agarran mellor o ovo.',
      'Pocha as patacas a lume medio en abundante aceite, uns 20 minutos. Non se trata de fritir, senón de que abranden.',
      'Se levas cebola, engádea cortada en xuliana aos 10 minutos.',
      'Bate os ovos cunha boa pitada de sal e mestura coas patacas escorridas. Deixa repousar 5 minutos.',
      'Calla na tixola 3 minutos por cada lado. O punto do centro é cousa de cada casa.'
    ],
    consello: 'O repouso da mestura antes de callar é o que marca a diferenza entre unha tortilla boa e unha memorable.'
  },
  {
    id: 'caldo',
    nome: 'Caldo galego',
    subtitulo: 'O prato que sabe mellor ao día seguinte. Fai de máis, sempre.',
    historia: 'O prato de inverno que non falta ningún domingo desde hai xeracións. Faise sempre de máis a propósito: sabe mellor recentado o luns.',
    cat: 'legume', arte: 'cunca', paleta: ['#5C8A5E', '#2F5638'],
    foto: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=70',
    tempo: 90, dificultade: 1, racions: 4, vexetariana: false,
    tags: ['tradicional', 'de culler', 'inverno'],
    ingredientes: [
      { id: 'fabas', cant: 250, unid: 'g' },
      { id: 'pataca', cant: 500, unid: 'g' },
      { id: 'grelos', cant: 400, unid: 'g' },
      { id: 'lacon', cant: 300, unid: 'g' },
      { id: 'touciño', cant: 100, unid: 'g' },
      { id: 'chourizo', cant: 1, unid: 'ud' },
      { id: 'sal', cant: 1, unid: 'pitada' }
    ],
    pasos: [
      'Pon as fabas a remollo a noite anterior. Este paso non se salta.',
      'Cocer o lacón e o touciño nunha pota grande con auga fría, 45 minutos, retirando a escuma.',
      'Engade as fabas escorridas e cocer outros 30 minutos.',
      'Incorpora as patacas cachadas e os grelos limpos. 20 minutos máis.',
      'Rectifica de sal ao final: o lacón xa sala moito o caldo.'
    ],
    consello: 'Cachar a pataca (rompela coa punta do coitelo en vez de cortala) libera amidón e engorda o caldo.'
  },
  {
    id: 'empanada',
    nome: 'Empanada de atún',
    subtitulo: 'Serve quente, morna ou fría. Nunca sobra, e se sobra, mellor.',
    historia: 'Clásica para levar de viaxe ou merenda. O recheo cambia segundo o que haxa na despensa, pero a de atún é a que nunca falla.',
    cat: 'peixe', arte: 'rectangulo', paleta: ['#E0A552', '#B06A26'],
    foto: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=70',
    tempo: 70, dificultade: 2, racions: 4, vexetariana: false,
    tags: ['tradicional', 'para levar'],
    ingredientes: [
      { id: 'masa_empanada', cant: 2, unid: 'ud' },
      { id: 'atun_lata', cant: 3, unid: 'lata' },
      { id: 'cebola', cant: 2, unid: 'ud' },
      { id: 'pemento_verde', cant: 1, unid: 'ud' },
      { id: 'tomate_frito', cant: 200, unid: 'g' },
      { id: 'ovo', cant: 2, unid: 'ud' },
      { id: 'aceite', cant: 50, unid: 'ml' }
    ],
    pasos: [
      'Pocha a cebola e o pemento en xuliana a lume moi baixo, 25 minutos. Este é o segredo do recheo.',
      'Engade o tomate e cocer 10 minutos máis, ata que non quede líquido.',
      'Mestura co atún escorrido e o ovo cocido picado. Deixa arrefriar por completo.',
      'Estende a masa, reparte o recheo frío, tapa e sela os bordes cun repulgo.',
      'Pinta con ovo batido, fai un burato no centro e forno a 200 °C, 30 minutos.'
    ],
    consello: 'O recheo ten que estar frío e seco antes de montar. Se está quente ou solto, a masa de abaixo empapa.'
  },
  {
    id: 'pementos',
    nome: 'Pementos de Padrón',
    subtitulo: 'Uns pican e outros non. É medio prato e medio xogo de azar.',
    historia: 'Entrante case obrigatorio en calquera reunión da casa. O chiste de "uns pican e outros non" repítese sempre á mesa, e nunca deixa de facer graza.',
    cat: 'verdura', arte: 'disperso', paleta: ['#4E8A46', '#2C5A2A'],
    foto: 'https://images.unsplash.com/photo-1601001435957-74f0958a93eb?w=900&q=70',
    tempo: 15, dificultade: 1, racions: 4, vexetariana: true,
    tags: ['rápido', 'entrante', 'tradicional'],
    ingredientes: [
      { id: 'pemento_padron', cant: 500, unid: 'g' },
      { id: 'aceite', cant: 150, unid: 'ml' },
      { id: 'sal', cant: 3, unid: 'pitada' }
    ],
    pasos: [
      'Lava e seca moi ben os pementos. A auga na tixola con aceite quente é mala compañeira.',
      'Quece o aceite a lume forte e bótaos de golpe.',
      'Move a tixola sen parar 4 ou 5 minutos, ata que engurren e collan cor.',
      'Escorre sobre papel e sal groso por riba, xenerosamente.'
    ],
    consello: 'Bota sal só ao servir. Se salas antes, os pementos soltan auga e non enrugan ben.'
  },
  {
    id: 'lentellas',
    nome: 'Lentellas guisadas',
    subtitulo: 'O prato de martes por excelencia. Barato, rápido e senta ben.',
    historia: 'Fixo na semana desde hai anos: cando ninguén sabe que cociñar, sempre hai lentellas. Sinxelo, económico, e ninguén o rexeita nunca.',
    cat: 'legume', arte: 'cunca', paleta: ['#B2662F', '#7A3E1C'],
    foto: 'https://images.unsplash.com/photo-1614777986387-015c2a89b696?w=900&q=70',
    tempo: 55, dificultade: 1, racions: 4, vexetariana: false,
    tags: ['de culler', 'económico'],
    ingredientes: [
      { id: 'lentellas', cant: 400, unid: 'g' },
      { id: 'cebola', cant: 1, unid: 'ud' },
      { id: 'cenoria', cant: 2, unid: 'ud' },
      { id: 'allo', cant: 2, unid: 'dente' },
      { id: 'chourizo', cant: 1, unid: 'ud' },
      { id: 'pemento_doce', cant: 1, unid: 'pitada' },
      { id: 'loureiro', cant: 1, unid: 'folla' },
      { id: 'aceite', cant: 40, unid: 'ml' }
    ],
    pasos: [
      'Fai un sofrito con cebola, cenoria e allo picados moi miúdos.',
      'Engade o pemento doce fóra do lume para que non queime e amargue.',
      'Incorpora as lentellas, o loureiro e o chourizo. Cubre con auga dous dedos por riba.',
      'Cocer a lume suave 40 minutos. Se espesa de máis, engade auga quente, nunca fría.'
    ],
    consello: 'As lentellas non precisan remollo, pero si auga branda. Se a túa é moi dura, unha pitada de bicarbonato.'
  },
  {
    id: 'polbo',
    nome: 'Polbo á feira',
    subtitulo: 'Táboa de madeira, tesoiras e pemento. Non necesita máis.',
    historia: 'Reservado para as ocasións especiais, coma nunha feira de aldea. Require paciencia e man experta, por iso non se fai calquera día da semana.',
    cat: 'peixe', arte: 'taboa', paleta: ['#C4553E', '#8A2F22'],
    foto: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&q=70',
    tempo: 60, dificultade: 3, racions: 4, vexetariana: false,
    tags: ['tradicional', 'festivo'],
    ingredientes: [
      { id: 'polbo', cant: 1500, unid: 'g' },
      { id: 'pataca', cant: 600, unid: 'g' },
      { id: 'pemento_doce', cant: 3, unid: 'pitada' },
      { id: 'pemento_picante', cant: 1, unid: 'pitada' },
      { id: 'aceite', cant: 80, unid: 'ml' },
      { id: 'sal', cant: 3, unid: 'pitada' }
    ],
    pasos: [
      'Conxela o polbo con antelación e descongélao: rompe as fibras mellor que calquera truco.',
      '"Asustar" o polbo: mergúllao e sácao da auga fervendo tres veces antes de deixalo dentro.',
      'Cocer 35-45 minutos segundo o tamaño. Pincha coa punta dun coitelo para ver o punto.',
      'Cocer as patacas na mesma auga: collen todo o sabor.',
      'Corta con tesoiras sobre táboa, e por riba sal groso, pemento doce, un toque de picante e bo aceite.'
    ],
    consello: 'Deixa repousar o polbo 10 minutos na súa auga despois de cocer, co lume apagado. Queda máis tenro.'
  },
  {
    id: 'merluza',
    nome: 'Merluza á galega',
    subtitulo: 'Peixe branco, pataca e allada. A cociña do Atlántico en tres pasos.',
    historia: 'Peixe de confianza, o que se pon cando se quere quedar ben sen complicarse. Herdanza directa da cociña costeira galega.',
    cat: 'peixe', arte: 'prato_peixe', paleta: ['#5E93A8', '#2E5C70'],
    foto: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=900&q=70',
    tempo: 35, dificultade: 2, racions: 4, vexetariana: false,
    tags: ['saudable', 'tradicional'],
    ingredientes: [
      { id: 'merluza', cant: 800, unid: 'g' },
      { id: 'pataca', cant: 600, unid: 'g' },
      { id: 'cebola', cant: 1, unid: 'ud' },
      { id: 'allo', cant: 4, unid: 'dente' },
      { id: 'pemento_doce', cant: 2, unid: 'pitada' },
      { id: 'aceite', cant: 100, unid: 'ml' },
      { id: 'perexil', cant: 1, unid: 'ramallo' }
    ],
    pasos: [
      'Cocer as patacas en rodelas grosas coa cebola, 15 minutos.',
      'Pon as postas de merluza por riba e cocer só 6-8 minutos. Pasarse é o único xeito de estragalo.',
      'Á parte, dourar os allos laminados no aceite. Retirar do lume e engadir o pemento doce.',
      'Regar o peixe coa allada quente e o perexil picado. Servir de contado.'
    ],
    consello: 'A allada faise fóra do lume. Se o pemento doce ferve no aceite, amarga e cambia de cor.'
  },
  {
    id: 'arroz_verduras',
    nome: 'Arroz con verduras',
    subtitulo: 'O comodín da semana: leva o que teñas na neveira.',
    historia: 'Naceu como solución cando a neveira ten de todo un pouco e nada abonda por si só. Cambia coas estacións e case nunca sae igual dúas veces.',
    cat: 'verdura', arte: 'pan_arroz', paleta: ['#D8A93F', '#9C6C1E'],
    foto: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&q=70',
    tempo: 30, dificultade: 1, racions: 4, vexetariana: true,
    tags: ['rápido', 'aproveitamento', 'económico'],
    ingredientes: [
      { id: 'arroz', cant: 320, unid: 'g' },
      { id: 'pemento_verde', cant: 1, unid: 'ud' },
      { id: 'cenoria', cant: 1, unid: 'ud' },
      { id: 'calabacin', cant: 1, unid: 'ud' },
      { id: 'guisantes', cant: 150, unid: 'g' },
      { id: 'allo', cant: 2, unid: 'dente' },
      { id: 'caldo', cant: 800, unid: 'ml' },
      { id: 'azafran', cant: 1, unid: 'pitada' }
    ],
    pasos: [
      'Sofrite o allo, o pemento e a cenoria en dados pequenos, 8 minutos.',
      'Engade a cabaciña e os chícharos, 3 minutos máis.',
      'Incorpora o arroz e remexe un minuto para que se impregne.',
      'Bota o caldo quente co azafrán. 18 minutos a lume medio sen remexer.',
      'Apaga e deixa repousar 5 minutos tapado antes de servir.'
    ],
    consello: 'Regra fácil: dobre e medio de caldo que de arroz. E o caldo sempre quente ao entrar.'
  },
  {
    id: 'macarrons',
    nome: 'Macarróns con tomate',
    subtitulo: 'O que sempre funciona cando ninguén se pon de acordo.',
    historia: 'O prato de paz da casa: gusta a todos sen excepción, e por iso volve á mesa case todas as semanas desde que os nenos eran pequenos.',
    cat: 'masa', arte: 'pasta', paleta: ['#D75A3C', '#94321F'],
    foto: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=900&q=70',
    tempo: 25, dificultade: 1, racions: 4, vexetariana: true,
    tags: ['rápido', 'nenos', 'económico'],
    ingredientes: [
      { id: 'macarrons', cant: 400, unid: 'g' },
      { id: 'tomate_frito', cant: 400, unid: 'g' },
      { id: 'cebola', cant: 1, unid: 'ud' },
      { id: 'allo', cant: 1, unid: 'dente' },
      { id: 'queixo', cant: 100, unid: 'g' },
      { id: 'aceite', cant: 30, unid: 'ml' }
    ],
    pasos: [
      'Pon a auga a ferver con sal abundante: debe saber a mar.',
      'Mentres, pocha a cebola e o allo moi picados ata que estean transparentes.',
      'Engade o tomate e deixa reducir 10 minutos a lume baixo.',
      'Cocer a pasta un minuto menos do que di o paquete e rematala na salsa.',
      'Queixo relado por riba e ao forno 5 minutos se queres gratinado.'
    ],
    consello: 'Garda medio vaso da auga de cocción: emulsiona a salsa e faina agarrarse á pasta.'
  },
  {
    id: 'zorza',
    nome: 'Zorza con patacas',
    subtitulo: 'Carne adobada e pataca. Prato de domingo con moitos anos enriba.',
    historia: 'Ven do adobo que se facía para conservar a carne despois da matanza. Hoxe xa non fai falta conservala, pero o sabor quedou para sempre.',
    cat: 'carne', arte: 'taboa', paleta: ['#C0472E', '#7E2617'],
    foto: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=900&q=70',
    tempo: 35, dificultade: 2, racions: 4, vexetariana: false,
    tags: ['tradicional', 'festivo'],
    ingredientes: [
      { id: 'porco', cant: 700, unid: 'g' },
      { id: 'pataca', cant: 700, unid: 'g' },
      { id: 'allo', cant: 3, unid: 'dente' },
      { id: 'pemento_doce', cant: 3, unid: 'pitada' },
      { id: 'pemento_picante', cant: 1, unid: 'pitada' },
      { id: 'aceite', cant: 150, unid: 'ml' },
      { id: 'sal', cant: 2, unid: 'pitada' }
    ],
    pasos: [
      'Adoba a carne en dados co allo picado, os pementos e sal. Mínimo 12 horas na neveira.',
      'Frite as patacas en bastóns grosos e resérvaas quentes.',
      'Saltea a zorza a lume forte en tandas pequenas, para que doure en vez de cocer.',
      'Xunta todo na tixola un minuto e serve inmediatamente.'
    ],
    consello: 'Se botas toda a carne de golpe baixa a temperatura e cócese no seu propio zume. En tandas, sempre.'
  },
  {
    id: 'croquetas',
    nome: 'Croquetas de cocido',
    subtitulo: 'A segunda vida do caldo do domingo. Aproveitamento en estado puro.',
    historia: 'Nada se tira nesta casa: o caldo do cocido do domingo remata sempre convertido en croquetas para entre semana. Ningunha sae igual á anterior.',
    cat: 'carne', arte: 'bolitas', paleta: ['#D99C4E', '#A0651F'],
    foto: 'https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?w=900&q=70',
    tempo: 60, dificultade: 3, racions: 4, vexetariana: false,
    tags: ['aproveitamento', 'tradicional'],
    ingredientes: [
      { id: 'lacon', cant: 200, unid: 'g' },
      { id: 'leite', cant: 750, unid: 'ml' },
      { id: 'fariña', cant: 90, unid: 'g' },
      { id: 'manteiga', cant: 70, unid: 'g' },
      { id: 'cebola', cant: 1, unid: 'ud' },
      { id: 'ovo', cant: 2, unid: 'ud' },
      { id: 'pan_ralado', cant: 200, unid: 'g' },
      { id: 'aceite', cant: 400, unid: 'ml' }
    ],
    pasos: [
      'Pica a carne sobrante do cocido moi miúda e pocha a cebola na manteiga.',
      'Engade a fariña e cocíñaa 3 minutos: se sabe a cru, a bechamel estará estragada.',
      'Bota o leite quente pouco a pouco, sen deixar de remover, ata que espese e se despegue da pota.',
      'Estende nunha fonte, tapa a pel con filme e arrefría 4 horas como mínimo.',
      'Forma, empana con ovo e pan relado, e frite en aceite moi quente por tandas.'
    ],
    consello: 'A masa ten que estar completamente fría. Con présa non hai croqueta que aguante o aceite.'
  },
  {
    id: 'ensalada_garavanzos',
    nome: 'Ensalada de garavanzos',
    subtitulo: 'Cinco minutos de traballo real. Ideal para os días imposibles.',
    historia: 'A solución para os días sen tempo nin gañas de complicarse. Chegou á casa como receita de verán e quedou para todo o ano.',
    cat: 'legume', arte: 'ensalada', paleta: ['#7FA648', '#4B6E27'],
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=70',
    tempo: 20, dificultade: 1, racions: 4, vexetariana: true,
    tags: ['rápido', 'saudable', 'verán'],
    ingredientes: [
      { id: 'garavanzos', cant: 500, unid: 'g' },
      { id: 'tomate', cant: 2, unid: 'ud' },
      { id: 'cebola', cant: 1, unid: 'ud' },
      { id: 'pemento_verde', cant: 1, unid: 'ud' },
      { id: 'ovo', cant: 2, unid: 'ud' },
      { id: 'atun_lata', cant: 1, unid: 'lata' },
      { id: 'aceite', cant: 40, unid: 'ml' }
    ],
    pasos: [
      'Escorre e lava ben os garavanzos cocidos.',
      'Pica o tomate, a cebola e o pemento en dados pequenos e regulares.',
      'Cocer os ovos 10 minutos e cortalos en cuartos.',
      'Mestura todo cun bo aceite e deixa repousar 15 minutos na neveira antes de servir.'
    ],
    consello: 'Deixa a cebola picada 10 minutos en auga fría: perde o picor forte e non repite.'
  },
  {
    id: 'caldeirada',
    nome: 'Caldeirada de peixe',
    subtitulo: 'Peixe, pataca e allada. O guiso mariñeiro de toda a costa.',
    historia: 'Guiso mariñeiro herdado de xeracións que vivían do mar. Cada casa da costa ten a súa versión; esta é a que se cociña aquí.',
    cat: 'peixe', arte: 'cunca', paleta: ['#4E8296', '#27505F'],
    foto: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=900&q=70',
    tempo: 50, dificultade: 2, racions: 4, vexetariana: false,
    tags: ['tradicional', 'de culler'],
    ingredientes: [
      { id: 'xarda', cant: 800, unid: 'g' },
      { id: 'pataca', cant: 800, unid: 'g' },
      { id: 'cebola', cant: 2, unid: 'ud' },
      { id: 'pemento_verde', cant: 1, unid: 'ud' },
      { id: 'allo', cant: 4, unid: 'dente' },
      { id: 'pemento_doce', cant: 2, unid: 'pitada' },
      { id: 'loureiro', cant: 1, unid: 'folla' },
      { id: 'aceite', cant: 100, unid: 'ml' }
    ],
    pasos: [
      'Fai unha cama de cebola e pemento en xuliana no fondo da pota.',
      'Coloca as patacas en rodelas grosas, o loureiro e sal. Cubre con auga xusta.',
      'Cocer 20 minutos ata que a pataca estea case feita.',
      'Pon o peixe limpo por riba e cocer 8 minutos máis, tapado.',
      'Rematar cunha allada de allos dourados e pemento doce fóra do lume.'
    ],
    consello: 'Nunca remexas a caldeirada cunha culler: move a pota en círculos para non desfacer o peixe.'
  },
  {
    id: 'filloas',
    nome: 'Filloas',
    subtitulo: 'De Entroido, pero ninguén vai protestar se aparecen en maio.',
    historia: 'Tradición de Entroido que se colou no resto do ano. Ninguén protesta cando aparecen fóra de tempo; máis ben o contrario.',
    cat: 'sobremesa', arte: 'apilado', paleta: ['#E4B96A', '#B4813A'],
    foto: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=70',
    tempo: 40, dificultade: 2, racions: 4, vexetariana: true,
    tags: ['sobremesa', 'tradicional', 'nenos'],
    ingredientes: [
      { id: 'fariña', cant: 250, unid: 'g' },
      { id: 'leite', cant: 500, unid: 'ml' },
      { id: 'ovo', cant: 3, unid: 'ud' },
      { id: 'azucre', cant: 60, unid: 'g' },
      { id: 'manteiga', cant: 40, unid: 'g' },
      { id: 'canela', cant: 1, unid: 'pitada' },
      { id: 'sal', cant: 1, unid: 'pitada' }
    ],
    pasos: [
      'Bate os ovos co leite e o azucre.',
      'Engade a fariña peneirada e unha pitada de sal, sen grumos.',
      'Deixa repousar a masa 30 minutos: é o que fai que saian finas.',
      'Unta a filloeira cun anaco de touciño ou manteiga e fai as filloas moi delgadas.',
      'Azucre e canela por riba, ou o recheo que se prefira.'
    ],
    consello: 'A primeira filloa sempre sae mal. É a que proba a temperatura da tixola; asúmeo e segue.'
  }
];

QCH.mapaReceitas = QCH.RECEITAS.reduce((m, r) => (m[r.id] = r, m), {});
QCH.receita = (id) => QCH.mapaReceitas[id] || null;
