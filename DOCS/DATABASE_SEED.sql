-- DATABASE_SEED.sql
-- Carga inicial para as táboas de DATABASE_SCHEMA.sql, xerada a man a
-- partir dos arrays estáticos actuais: js/datos/ingredientes.js,
-- js/datos/receitas.js e js/datos/familia.js. Son os mesmos datos que
-- hoxe arrancan a app sen conexión/sen sesión — esta carga fai que a
-- base de datos parta do mesmo punto.
--
-- Non se executou contra ningunha instancia real de Supabase dende
-- este repo (ver nota en DATABASE_SCHEMA.sql). Pénsase para executarse
-- despois dese ficheiro.

-- ============================================================
-- Ingredientes (QCH.INGREDIENTES)
-- ============================================================
insert into qch_ingredientes (id, nome, categoria, unidade) values
  ('pataca', 'Patacas', 'verdura', 'g'),
  ('cebola', 'Cebola', 'verdura', 'ud'),
  ('allo', 'Allo', 'verdura', 'dente'),
  ('pemento_verde', 'Pemento verde', 'verdura', 'ud'),
  ('pemento_padron', 'Pementos de Padrón', 'verdura', 'g'),
  ('tomate', 'Tomate', 'verdura', 'ud'),
  ('cenoria', 'Cenoria', 'verdura', 'ud'),
  ('repolo', 'Repolo', 'verdura', 'g'),
  ('grelos', 'Grelos', 'verdura', 'g'),
  ('cogomelos', 'Cogomelos', 'verdura', 'g'),
  ('perexil', 'Perexil', 'verdura', 'ramallo'),
  ('leituga', 'Leituga', 'verdura', 'ud'),
  ('calabacin', 'Cabaciña', 'verdura', 'ud'),
  ('guisantes', 'Chícharos', 'verdura', 'g'),
  ('garavanzos', 'Garavanzos', 'legume', 'g'),
  ('lentellas', 'Lentellas', 'legume', 'g'),
  ('fabas', 'Fabas brancas', 'legume', 'g'),
  ('chourizo', 'Chourizo', 'carne', 'ud'),
  ('lacon', 'Lacón', 'carne', 'g'),
  ('touciño', 'Touciño', 'carne', 'g'),
  ('polo', 'Polo', 'carne', 'g'),
  ('tenreira', 'Tenreira', 'carne', 'g'),
  ('porco', 'Carne de porco', 'carne', 'g'),
  ('xamon', 'Xamón', 'carne', 'g'),
  ('merluza', 'Merluza', 'peixe', 'g'),
  ('polbo', 'Polbo', 'peixe', 'g'),
  ('atun_lata', 'Atún en lata', 'peixe', 'lata'),
  ('xarda', 'Xarda', 'peixe', 'g'),
  ('ameixas', 'Ameixas', 'peixe', 'g'),
  ('mexillons', 'Mexillóns', 'peixe', 'g'),
  ('bacallau', 'Bacallau', 'peixe', 'g'),
  ('ovo', 'Ovos', 'lacteo', 'ud'),
  ('leite', 'Leite', 'lacteo', 'ml'),
  ('manteiga', 'Manteiga', 'lacteo', 'g'),
  ('queixo', 'Queixo', 'lacteo', 'g'),
  ('nata', 'Nata', 'lacteo', 'ml'),
  ('bebida_vexetal', 'Bebida vexetal', 'lacteo', 'ml'),
  ('aceite', 'Aceite de oliva', 'despensa', 'ml'),
  ('sal', 'Sal', 'despensa', 'pitada'),
  ('fariña', 'Fariña', 'despensa', 'g'),
  ('arroz', 'Arroz', 'despensa', 'g'),
  ('macarrons', 'Macarróns', 'despensa', 'g'),
  ('pan_ralado', 'Pan relado', 'despensa', 'g'),
  ('azucre', 'Azucre', 'despensa', 'g'),
  ('masa_empanada', 'Masa de empanada', 'despensa', 'ud'),
  ('tomate_frito', 'Tomate frito', 'despensa', 'g'),
  ('caldo', 'Caldo de verduras', 'despensa', 'ml'),
  ('viño_branco', 'Viño branco', 'despensa', 'ml'),
  ('tofu', 'Tofu firme', 'despensa', 'g'),
  ('pemento_doce', 'Pemento doce', 'especia', 'pitada'),
  ('pemento_picante', 'Pemento picante', 'especia', 'pitada'),
  ('loureiro', 'Loureiro', 'especia', 'folla'),
  ('pementa', 'Pementa negra', 'especia', 'pitada'),
  ('azafran', 'Azafrán', 'especia', 'pitada'),
  ('canela', 'Canela', 'especia', 'pitada')
on conflict (id) do nothing;

-- ============================================================
-- Persoas (QCH.PERSOAS)
-- ============================================================
insert into qch_persoas (id, nome, cor, cociña, nota, restricions) values
  ('amparo', 'Amparo', '#C0563C', true,  'Cociña os domingos. Non lle gusta improvisar.', '{}'),
  ('manuel', 'Manuel', '#4E7A8C', false, 'Pregunta todos os días o que hai de comer.', array['sen sal engadido']),
  ('isabel', 'Isabel', '#8A5FA8', true,  'Organiza a semana. É quen máis usa a app.', '{}'),
  ('xoan',   'Xoán',   '#3E6B4F', true,  'Cociña entre semana, sempre con présa.', '{}'),
  ('coral',  'Coral',  '#2F8F7E', false, 'Vexetariana desde hai dous anos.', array['vexetariana']),
  ('brais',  'Brais',  '#B07C2E', false, 'Come de todo menos peixe con espiñas.', '{}'),
  ('sabela', 'Sabela', '#A8447A', true,  'A que máis experimenta. Cociña os sábados.', array['sen lactosa']),
  ('anton',  'Antón',  '#D08A2E', false, 'Nove anos. Negocia todo o que come.', '{}')
on conflict (id) do nothing;

-- ============================================================
-- Receitas (QCH.RECEITAS) — campos base; pasos como array JSON.
-- ============================================================
insert into qch_receitas (id, nome, subtitulo, pasos, consello, categoria, arte, paleta, tempo_preparacion_min, dificultade, racions, vexetariana, tags) values
  ('tortilla', 'Tortilla de patacas', 'A discusión eterna: con cebola ou sen ela. Aquí resólvese por comensal.',
    '["Pela e corta as patacas en láminas finas, non moi regulares: así agarran mellor o ovo.","Pocha as patacas a lume medio en abundante aceite, uns 20 minutos. Non se trata de fritir, senón de que abranden.","Se levas cebola, engádea cortada en xuliana aos 10 minutos.","Bate os ovos cunha boa pitada de sal e mestura coas patacas escorridas. Deixa repousar 5 minutos.","Calla na tixola 3 minutos por cada lado. O punto do centro é cousa de cada casa."]'::jsonb,
    'O repouso da mestura antes de callar é o que marca a diferenza entre unha tortilla boa e unha memorable.',
    'verdura', 'redondo', array['#E9B14A', '#C97C21'], 40, 1, 4, true, array['tradicional', 'de sempre']),

  ('caldo', 'Caldo galego', 'O prato que sabe mellor ao día seguinte. Fai de máis, sempre.',
    '["Pon as fabas a remollo a noite anterior. Este paso non se salta.","Cocer o lacón e o touciño nunha pota grande con auga fría, 45 minutos, retirando a escuma.","Engade as fabas escorridas e cocer outros 30 minutos.","Incorpora as patacas cachadas e os grelos limpos. 20 minutos máis.","Rectifica de sal ao final: o lacón xa sala moito o caldo."]'::jsonb,
    'Cachar a pataca (rompela coa punta do coitelo en vez de cortala) libera amidón e engorda o caldo.',
    'legume', 'cunca', array['#5C8A5E', '#2F5638'], 90, 1, 4, false, array['tradicional', 'de culler', 'inverno']),

  ('empanada', 'Empanada de atún', 'Serve quente, morna ou fría. Nunca sobra, e se sobra, mellor.',
    '["Pocha a cebola e o pemento en xuliana a lume moi baixo, 25 minutos. Este é o segredo do recheo.","Engade o tomate e cocer 10 minutos máis, ata que non quede líquido.","Mestura co atún escorrido e o ovo cocido picado. Deixa arrefriar por completo.","Estende a masa, reparte o recheo frío, tapa e sela os bordes cun repulgo.","Pinta con ovo batido, fai un burato no centro e forno a 200 °C, 30 minutos."]'::jsonb,
    'O recheo ten que estar frío e seco antes de montar. Se está quente ou solto, a masa de abaixo empapa.',
    'peixe', 'rectangulo', array['#E0A552', '#B06A26'], 70, 2, 4, false, array['tradicional', 'para levar']),

  ('pementos', 'Pementos de Padrón', 'Uns pican e outros non. É medio prato e medio xogo de azar.',
    '["Lava e seca moi ben os pementos. A auga na tixola con aceite quente é mala compañeira.","Quece o aceite a lume forte e bótaos de golpe.","Move a tixola sen parar 4 ou 5 minutos, ata que engurren e collan cor.","Escorre sobre papel e sal groso por riba, xenerosamente."]'::jsonb,
    'Bota sal só ao servir. Se salas antes, os pementos soltan auga e non enrugan ben.',
    'verdura', 'disperso', array['#4E8A46', '#2C5A2A'], 15, 1, 4, true, array['rápido', 'entrante', 'tradicional']),

  ('lentellas', 'Lentellas guisadas', 'O prato de martes por excelencia. Barato, rápido e senta ben.',
    '["Fai un sofrito con cebola, cenoria e allo picados moi miúdos.","Engade o pemento doce fóra do lume para que non queime e amargue.","Incorpora as lentellas, o loureiro e o chourizo. Cubre con auga dous dedos por riba.","Cocer a lume suave 40 minutos. Se espesa de máis, engade auga quente, nunca fría."]'::jsonb,
    'As lentellas non precisan remollo, pero si auga branda. Se a túa é moi dura, unha pitada de bicarbonato.',
    'legume', 'cunca', array['#B2662F', '#7A3E1C'], 55, 1, 4, false, array['de culler', 'económico']),

  ('polbo', 'Polbo á feira', 'Táboa de madeira, tesoiras e pemento. Non necesita máis.',
    '["Conxela o polbo con antelación e descongélao: rompe as fibras mellor que calquera truco.","\"Asustar\" o polbo: mergúllao e sácao da auga fervendo tres veces antes de deixalo dentro.","Cocer 35-45 minutos segundo o tamaño. Pincha coa punta dun coitelo para ver o punto.","Cocer as patacas na mesma auga: collen todo o sabor.","Corta con tesoiras sobre táboa, e por riba sal groso, pemento doce, un toque de picante e bo aceite."]'::jsonb,
    'Deixa repousar o polbo 10 minutos na súa auga despois de cocer, co lume apagado. Queda máis tenro.',
    'peixe', 'taboa', array['#C4553E', '#8A2F22'], 60, 3, 4, false, array['tradicional', 'festivo']),

  ('merluza', 'Merluza á galega', 'Peixe branco, pataca e allada. A cociña do Atlántico en tres pasos.',
    '["Cocer as patacas en rodelas grosas coa cebola, 15 minutos.","Pon as postas de merluza por riba e cocer só 6-8 minutos. Pasarse é o único xeito de estragalo.","Á parte, dourar os allos laminados no aceite. Retirar do lume e engadir o pemento doce.","Regar o peixe coa allada quente e o perexil picado. Servir de contado."]'::jsonb,
    'A allada faise fóra do lume. Se o pemento doce ferve no aceite, amarga e cambia de cor.',
    'peixe', 'prato_peixe', array['#5E93A8', '#2E5C70'], 35, 2, 4, false, array['saudable', 'tradicional']),

  ('arroz_verduras', 'Arroz con verduras', 'O comodín da semana: leva o que teñas na neveira.',
    '["Sofrite o allo, o pemento e a cenoria en dados pequenos, 8 minutos.","Engade a cabaciña e os chícharos, 3 minutos máis.","Incorpora o arroz e remexe un minuto para que se impregne.","Bota o caldo quente co azafrán. 18 minutos a lume medio sen remexer.","Apaga e deixa repousar 5 minutos tapado antes de servir."]'::jsonb,
    'Regra fácil: dobre e medio de caldo que de arroz. E o caldo sempre quente ao entrar.',
    'verdura', 'pan_arroz', array['#D8A93F', '#9C6C1E'], 30, 1, 4, true, array['rápido', 'aproveitamento', 'económico']),

  ('macarrons', 'Macarróns con tomate', 'O que sempre funciona cando ninguén se pon de acordo.',
    '["Pon a auga a ferver con sal abundante: debe saber a mar.","Mentres, pocha a cebola e o allo moi picados ata que estean transparentes.","Engade o tomate e deixa reducir 10 minutos a lume baixo.","Cocer a pasta un minuto menos do que di o paquete e rematala na salsa.","Queixo relado por riba e ao forno 5 minutos se queres gratinado."]'::jsonb,
    'Garda medio vaso da auga de cocción: emulsiona a salsa e faina agarrarse á pasta.',
    'masa', 'pasta', array['#D75A3C', '#94321F'], 25, 1, 4, true, array['rápido', 'nenos', 'económico']),

  ('zorza', 'Zorza con patacas', 'Carne adobada e pataca. Prato de domingo con moitos anos enriba.',
    '["Adoba a carne en dados co allo picado, os pementos e sal. Mínimo 12 horas na neveira.","Frite as patacas en bastóns grosos e resérvaas quentes.","Saltea a zorza a lume forte en tandas pequenas, para que doure en vez de cocer.","Xunta todo na tixola un minuto e serve inmediatamente."]'::jsonb,
    'Se botas toda a carne de golpe baixa a temperatura e cócese no seu propio zume. En tandas, sempre.',
    'carne', 'taboa', array['#C0472E', '#7E2617'], 35, 2, 4, false, array['tradicional', 'festivo']),

  ('croquetas', 'Croquetas de cocido', 'A segunda vida do caldo do domingo. Aproveitamento en estado puro.',
    '["Pica a carne sobrante do cocido moi miúda e pocha a cebola na manteiga.","Engade a fariña e cocíñaa 3 minutos: se sabe a cru, a bechamel estará estragada.","Bota o leite quente pouco a pouco, sen deixar de remover, ata que espese e se despegue da pota.","Estende nunha fonte, tapa a pel con filme e arrefría 4 horas como mínimo.","Forma, empana con ovo e pan relado, e frite en aceite moi quente por tandas."]'::jsonb,
    'A masa ten que estar completamente fría. Con présa non hai croqueta que aguante o aceite.',
    'carne', 'bolitas', array['#D99C4E', '#A0651F'], 60, 3, 4, false, array['aproveitamento', 'tradicional']),

  ('ensalada_garavanzos', 'Ensalada de garavanzos', 'Cinco minutos de traballo real. Ideal para os días imposibles.',
    '["Escorre e lava ben os garavanzos cocidos.","Pica o tomate, a cebola e o pemento en dados pequenos e regulares.","Cocer os ovos 10 minutos e cortalos en cuartos.","Mestura todo cun bo aceite e deixa repousar 15 minutos na neveira antes de servir."]'::jsonb,
    'Deixa a cebola picada 10 minutos en auga fría: perde o picor forte e non repite.',
    'legume', 'ensalada', array['#7FA648', '#4B6E27'], 20, 1, 4, true, array['rápido', 'saudable', 'verán']),

  ('caldeirada', 'Caldeirada de peixe', 'Peixe, pataca e allada. O guiso mariñeiro de toda a costa.',
    '["Fai unha cama de cebola e pemento en xuliana no fondo da pota.","Coloca as patacas en rodelas grosas, o loureiro e sal. Cubre con auga xusta.","Cocer 20 minutos ata que a pataca estea case feita.","Pon o peixe limpo por riba e cocer 8 minutos máis, tapado.","Rematar cunha allada de allos dourados e pemento doce fóra do lume."]'::jsonb,
    'Nunca remexas a caldeirada cunha culler: move a pota en círculos para non desfacer o peixe.',
    'peixe', 'cunca', array['#4E8296', '#27505F'], 50, 2, 4, false, array['tradicional', 'de culler']),

  ('filloas', 'Filloas', 'De Entroido, pero ninguén vai protestar se aparecen en maio.',
    '["Bate os ovos co leite e o azucre.","Engade a fariña peneirada e unha pitada de sal, sen grumos.","Deixa repousar a masa 30 minutos: é o que fai que saian finas.","Unta a filloeira cun anaco de touciño ou manteiga e fai as filloas moi delgadas.","Azucre e canela por riba, ou o recheo que se prefira."]'::jsonb,
    'A primeira filloa sempre sae mal. É a que proba a temperatura da tixola; asúmeo e segue.',
    'sobremesa', 'apilado', array['#E4B96A', '#B4813A'], 40, 2, 4, true, array['sobremesa', 'tradicional', 'nenos'])
on conflict (id) do nothing;

-- ============================================================
-- ReceitaIngrediente — un INSERT por liña de ingrediente/receita,
-- coa mesma orde en que aparecen en js/datos/receitas.js.
-- ============================================================
insert into qch_receita_ingredientes (receita_id, ingrediente_id, cantidade, unidade, orde) values
  ('tortilla', 'pataca', 800, 'g', 0), ('tortilla', 'ovo', 6, 'ud', 1), ('tortilla', 'cebola', 1, 'ud', 2), ('tortilla', 'aceite', 200, 'ml', 3), ('tortilla', 'sal', 2, 'pitada', 4),

  ('caldo', 'fabas', 250, 'g', 0), ('caldo', 'pataca', 500, 'g', 1), ('caldo', 'grelos', 400, 'g', 2), ('caldo', 'lacon', 300, 'g', 3), ('caldo', 'touciño', 100, 'g', 4), ('caldo', 'chourizo', 1, 'ud', 5), ('caldo', 'sal', 1, 'pitada', 6),

  ('empanada', 'masa_empanada', 2, 'ud', 0), ('empanada', 'atun_lata', 3, 'lata', 1), ('empanada', 'cebola', 2, 'ud', 2), ('empanada', 'pemento_verde', 1, 'ud', 3), ('empanada', 'tomate_frito', 200, 'g', 4), ('empanada', 'ovo', 2, 'ud', 5), ('empanada', 'aceite', 50, 'ml', 6),

  ('pementos', 'pemento_padron', 500, 'g', 0), ('pementos', 'aceite', 150, 'ml', 1), ('pementos', 'sal', 3, 'pitada', 2),

  ('lentellas', 'lentellas', 400, 'g', 0), ('lentellas', 'cebola', 1, 'ud', 1), ('lentellas', 'cenoria', 2, 'ud', 2), ('lentellas', 'allo', 2, 'dente', 3), ('lentellas', 'chourizo', 1, 'ud', 4), ('lentellas', 'pemento_doce', 1, 'pitada', 5), ('lentellas', 'loureiro', 1, 'folla', 6), ('lentellas', 'aceite', 40, 'ml', 7),

  ('polbo', 'polbo', 1500, 'g', 0), ('polbo', 'pataca', 600, 'g', 1), ('polbo', 'pemento_doce', 3, 'pitada', 2), ('polbo', 'pemento_picante', 1, 'pitada', 3), ('polbo', 'aceite', 80, 'ml', 4), ('polbo', 'sal', 3, 'pitada', 5),

  ('merluza', 'merluza', 800, 'g', 0), ('merluza', 'pataca', 600, 'g', 1), ('merluza', 'cebola', 1, 'ud', 2), ('merluza', 'allo', 4, 'dente', 3), ('merluza', 'pemento_doce', 2, 'pitada', 4), ('merluza', 'aceite', 100, 'ml', 5), ('merluza', 'perexil', 1, 'ramallo', 6),

  ('arroz_verduras', 'arroz', 320, 'g', 0), ('arroz_verduras', 'pemento_verde', 1, 'ud', 1), ('arroz_verduras', 'cenoria', 1, 'ud', 2), ('arroz_verduras', 'calabacin', 1, 'ud', 3), ('arroz_verduras', 'guisantes', 150, 'g', 4), ('arroz_verduras', 'allo', 2, 'dente', 5), ('arroz_verduras', 'caldo', 800, 'ml', 6), ('arroz_verduras', 'azafran', 1, 'pitada', 7),

  ('macarrons', 'macarrons', 400, 'g', 0), ('macarrons', 'tomate_frito', 400, 'g', 1), ('macarrons', 'cebola', 1, 'ud', 2), ('macarrons', 'allo', 1, 'dente', 3), ('macarrons', 'queixo', 100, 'g', 4), ('macarrons', 'aceite', 30, 'ml', 5),

  ('zorza', 'porco', 700, 'g', 0), ('zorza', 'pataca', 700, 'g', 1), ('zorza', 'allo', 3, 'dente', 2), ('zorza', 'pemento_doce', 3, 'pitada', 3), ('zorza', 'pemento_picante', 1, 'pitada', 4), ('zorza', 'aceite', 150, 'ml', 5), ('zorza', 'sal', 2, 'pitada', 6),

  ('croquetas', 'lacon', 200, 'g', 0), ('croquetas', 'leite', 750, 'ml', 1), ('croquetas', 'fariña', 90, 'g', 2), ('croquetas', 'manteiga', 70, 'g', 3), ('croquetas', 'cebola', 1, 'ud', 4), ('croquetas', 'ovo', 2, 'ud', 5), ('croquetas', 'pan_ralado', 200, 'g', 6), ('croquetas', 'aceite', 400, 'ml', 7),

  ('ensalada_garavanzos', 'garavanzos', 500, 'g', 0), ('ensalada_garavanzos', 'tomate', 2, 'ud', 1), ('ensalada_garavanzos', 'cebola', 1, 'ud', 2), ('ensalada_garavanzos', 'pemento_verde', 1, 'ud', 3), ('ensalada_garavanzos', 'ovo', 2, 'ud', 4), ('ensalada_garavanzos', 'atun_lata', 1, 'lata', 5), ('ensalada_garavanzos', 'aceite', 40, 'ml', 6),

  ('caldeirada', 'xarda', 800, 'g', 0), ('caldeirada', 'pataca', 800, 'g', 1), ('caldeirada', 'cebola', 2, 'ud', 2), ('caldeirada', 'pemento_verde', 1, 'ud', 3), ('caldeirada', 'allo', 4, 'dente', 4), ('caldeirada', 'pemento_doce', 2, 'pitada', 5), ('caldeirada', 'loureiro', 1, 'folla', 6), ('caldeirada', 'aceite', 100, 'ml', 7),

  ('filloas', 'fariña', 250, 'g', 0), ('filloas', 'leite', 500, 'ml', 1), ('filloas', 'ovo', 3, 'ud', 2), ('filloas', 'azucre', 60, 'g', 3), ('filloas', 'manteiga', 40, 'g', 4), ('filloas', 'canela', 1, 'pitada', 5), ('filloas', 'sal', 1, 'pitada', 6)
on conflict (receita_id, ingrediente_id) do nothing;

-- ============================================================
-- Adaptacións (QCH.PERSOAS[].adaptacions) — o diferenciador do
-- produto: por persoa E por receita, nunca global.
-- ============================================================
insert into qch_adaptacions (persoa_id, receita_id, tipo, ingrediente_id, substituto_id, prato_alt, motivo) values
  ('amparo', 'polbo', 'sen', 'pemento_picante', null, null, 'Nada de picante'),

  ('isabel', 'tortilla', 'sen', 'cebola', null, null, 'Na tortilla non, na empanada si'),

  ('coral', 'lentellas', 'substituir', 'chourizo', 'cogomelos', null, 'Sen carne'),
  ('coral', 'caldo', 'substituir', 'lacon', 'fabas', null, 'Sen carne'),
  ('coral', 'zorza', 'prato', null, null, 'Tofu á prancha con pemento doce', 'Non hai versión vexetariana deste prato'),
  ('coral', 'croquetas', 'prato', null, null, 'Croquetas de cogomelos', 'Versión propia sen carne'),

  ('brais', 'caldeirada', 'prato', null, null, 'Merluza sen espiñas á prancha', 'Peixe con espiñas non'),

  ('sabela', 'macarrons', 'sen', 'queixo', null, null, 'Sen lactosa'),
  ('sabela', 'filloas', 'substituir', 'leite', 'bebida_vexetal', null, 'Sen lactosa'),

  ('anton', 'pementos', 'prato', null, null, 'Pan con tomate', 'Pican'),
  ('anton', 'lentellas', 'sen', 'cenoria', null, null, 'Non lle gusta a cenoria')
on conflict (persoa_id, receita_id, tipo, ingrediente_id) do nothing;
