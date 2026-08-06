-- DATABASE_MIGRATION_FASE3.sql
-- Migración aditiva desde o esquema JSON real de produción cara ao modelo
-- relacional que falta (ver DATABASE_MODEL.md e DATABASE_SCHEMA.sql).
--
-- Motivo de existir este ficheiro á parte de DATABASE_SCHEMA.sql /
-- DATABASE_SEED.sql: a revisión de 2026-08-06 (BACKEND_N8N_STATUS.md,
-- "Fase 3: estado confirmado") confirmou que qch_receitas, qch_ingredientes
-- e qch_persoas son hoxe `id text primary key, data jsonb not null` en
-- produción, non as táboas con columnas relacionais que propoñía
-- DATABASE_SCHEMA.sql. `create table if not exists` contra esas tres táboas
-- non fai nada (a táboa xa existe) e DATABASE_SEED.sql fallaría ao inserir
-- columnas coma `nome` ou `pasos` que non existen. Nada diso se executou.
--
-- Deseño desta migración:
--   1. NON toca qch_receitas, qch_ingredientes nin qch_persoas. Seguen sendo
--      `id + data jsonb`; GET /receitas, GET /ingredientes e GET /persoas xa
--      están verificados en produción lendo esa columna (BACKEND_N8N_STATUS.md,
--      "Estado confirmado") — cambiar ese camiño non aporta nada hoxe e arrisca
--      romper o único contrato xa probado de punta a punta.
--   2. NON toca qch_estado (semana, neveira, cociñeiros seguen en JSON — ver
--      motivo en BACKEND_N8N_STATUS.md, non hai datas reais para poboar
--      qch_planificacion sen inventalas).
--   3. Engade só as táboas que faltan no modelo conceptual
--      (ReceitaIngrediente, Adaptación, Fotografía, Versión, Nutrición,
--      Planificación, Evento de cociñado) coma en DATABASE_SCHEMA.sql,
--      referenciando o `id` que xa existe hoxe en qch_receitas/qch_persoas.
--   4. Para as dúas táboas de relación que xa teñen datos escondidos dentro
--      do JSON (ingredientes de cada receita, adaptacións de cada persoa),
--      EXTRÁEOS de `data jsonb` con `jsonb_array_elements` / `jsonb_each` en
--      vez de copialos á man (evita que o seed e a produción diverxan).
--   5. Todo é idempotente (`create table if not exists`, `on conflict do
--      nothing`) para poder executarse varias veces sen risco.
--   6. Inclúe consultas de verificación ao final para comprobar, antes de
--      tocar ningún workflow, que o extraído coincide co JSON orixinal.
--
-- Verificación feita (2026-08-06): este SQL executouse contra unha
-- instancia local de PostgreSQL 16 desbotable (non a produción real, á que
-- este repositorio non ten acceso — ver BACKEND_N8N_STATUS.md), coas
-- táboas creadas coa forma exacta `id text primary key, data jsonb not
-- null` e cargadas cos 55 ingredientes / 14 receitas / 8 persoas reais de
-- js/datos/*.js (mesmos datos que xa hai en produción, confirmados por
-- GET /receitas e GET /persoas). Resultado: as insercións das seccións 2 e
-- 3 crean 94 filas en qch_receita_ingredientes e 11 en qch_adaptacions —
-- coinciden exactamente coas contas de DATABASE_SEED.sql —, as tres
-- consultas de verificación da sección 4 devolven 0 filas de diferenza, e
-- reexecutar o ficheiro enteiro unha segunda vez non crea filas
-- duplicadas (proba de idempotencia). Isto confirma que o SQL en si é
-- correcto; NON confirma nada sobre a instancia de produción real, que
-- pode ter datos ou configuración distintos aos arrays estáticos actuais.
--
-- Fóra de alcance deste ficheiro (traballo de infraestrutura, non deste
-- repositorio — mesmo patrón que 2.8 e o resto de Fase 3): executalo
-- contra a instancia REAL de Supabase (con acceso e permisos que esta
-- execución non tivo), e decidir se e cando algún workflow pasa a ler
-- destas táboas relacionais en vez de `data jsonb`.

-- ============================================================
-- 0. Comprobacións previas (executar e revisar a man antes de seguir).
--    Non fan cambios; só describen a forma real dos datos hoxe.
-- ============================================================

-- 0.1 Confirmar que as táboas de catálogo seguen sendo id + data jsonb
--     (se isto devolve columnas relacionais en vez de "data", este ficheiro
--     xa non aplica e hai que revisalo).
-- select column_name, data_type
--   from information_schema.columns
--  where table_name in ('qch_receitas', 'qch_ingredientes', 'qch_persoas')
--  order by table_name, ordinal_position;

-- 0.2 Confirmar que cada receita ten un array `ingredientes` coa forma
--     [{ "id": "...", "cant": n, "unid": "..." }, ...].
-- select id, jsonb_typeof(data->'ingredientes') as tipo_ingredientes
--   from qch_receitas
--  where jsonb_typeof(data->'ingredientes') is distinct from 'array';

-- 0.3 Confirmar que cada persoa ten un obxecto `adaptacions` (pode ser {}).
-- select id, jsonb_typeof(data->'adaptacions') as tipo_adaptacions
--   from qch_persoas
--  where jsonb_typeof(data->'adaptacions') is distinct from 'object';

-- ============================================================
-- 1. Táboas novas que faltan no modelo relacional (idempotentes).
--    Mesma forma que DATABASE_SCHEMA.sql; FK contra o `id` que xa
--    existe hoxe en qch_receitas/qch_ingredientes/qch_persoas.
-- ============================================================

create table if not exists qch_receita_ingredientes (
  id             bigint generated always as identity primary key,
  receita_id     text not null references qch_receitas(id) on delete cascade,
  ingrediente_id text not null references qch_ingredientes(id) on delete restrict,
  cantidade      numeric(8,2) not null,
  unidade        text not null,
  observacions   text,
  orde           integer not null default 0,
  unique (receita_id, ingrediente_id)
);
create index if not exists idx_receita_ingredientes_receita on qch_receita_ingredientes(receita_id);
create index if not exists idx_receita_ingredientes_ingrediente on qch_receita_ingredientes(ingrediente_id);

create table if not exists qch_adaptacions (
  id             bigint generated always as identity primary key,
  persoa_id      text not null references qch_persoas(id) on delete cascade,
  receita_id     text not null references qch_receitas(id) on delete cascade,
  tipo           text not null check (tipo in ('sen', 'substituir', 'prato')),
  ingrediente_id text references qch_ingredientes(id),
  substituto_id  text references qch_ingredientes(id),
  prato_alt      text,
  motivo         text,
  creado_en      timestamptz not null default now()
);
create index if not exists idx_adaptacions_receita on qch_adaptacions(receita_id);
create index if not exists idx_adaptacions_persoa on qch_adaptacions(persoa_id);

-- Índice único por expresión en vez de `unique(persoa_id, receita_id, tipo,
-- ingrediente_id)`: as adaptacións de tipo 'prato' non teñen
-- `ingrediente_id` (é NULL), e en SQL dous NULL nunca se consideran iguais
-- para efectos de UNIQUE — un `unique(...)` normal deixaría inserir a mesma
-- adaptación 'prato' varias veces cada vez que se reexecuta esta migración.
-- `coalesce(ingrediente_id, '')` arranxa iso tratando "sen ingrediente" coma
-- un valor consistente.
create unique index if not exists uq_adaptacions_persoa_receita_tipo_ingrediente
  on qch_adaptacions (persoa_id, receita_id, tipo, coalesce(ingrediente_id, ''));

create table if not exists qch_fotografias (
  id           bigint generated always as identity primary key,
  receita_id   text not null references qch_receitas(id) on delete cascade,
  tipo         text not null check (tipo in ('principal', 'proceso', 'presentacion', 'variante')),
  url          text not null,
  autor_id     text references qch_persoas(id),
  data         timestamptz not null default now(),
  descricion   text
);
create index if not exists idx_fotografias_receita on qch_fotografias(receita_id);

create table if not exists qch_receita_versions (
  id             bigint generated always as identity primary key,
  receita_id     text not null references qch_receitas(id) on delete cascade,
  numero         integer not null,
  autor_id       text references qch_persoas(id),
  data           timestamptz not null default now(),
  motivo         text,
  resumo_cambios text,
  snapshot       jsonb not null,
  unique (receita_id, numero)
);
create index if not exists idx_receita_versions_receita on qch_receita_versions(receita_id);

create table if not exists qch_nutricion (
  receita_id     text primary key references qch_receitas(id) on delete cascade,
  calorias       numeric(7,1),
  proteinas_g    numeric(6,1),
  hidratos_g     numeric(6,1),
  graxas_g       numeric(6,1),
  fibra_g        numeric(6,1),
  sodio_mg       numeric(7,1),
  por_racion     boolean not null default true,
  calculado_por  text,
  observacions   text,
  actualizado_en timestamptz not null default now()
);

create table if not exists qch_planificacion (
  id             bigint generated always as identity primary key,
  data           date not null,
  comida         text not null default 'xantar',
  receita_id     text references qch_receitas(id),
  comensais      text[] not null default '{}',
  responsable_id text references qch_persoas(id),
  observacions   text,
  actualizado_en timestamptz not null default now(),
  unique (data, comida)
);
create index if not exists idx_planificacion_data on qch_planificacion(data);

create table if not exists qch_eventos_cocinado (
  id             bigint generated always as identity primary key,
  receita_id     text not null references qch_receitas(id),
  data           timestamptz not null default now(),
  cociñeiro_id   text references qch_persoas(id),
  valoracion     smallint check (valoracion between 1 and 5),
  tempo_real_min integer,
  comentarios    text,
  foto_id        bigint references qch_fotografias(id)
);
create index if not exists idx_eventos_cocinado_receita on qch_eventos_cocinado(receita_id);
create index if not exists idx_eventos_cocinado_data on qch_eventos_cocinado(data);

-- qch_comparticions xa existe en produción (BACKEND_N8N_STATUS.md); non se
-- redefine aquí para non arriscar unha forma distinta á real.

-- ============================================================
-- 2. Extracción: qch_receita_ingredientes desde
--    qch_receitas.data->'ingredientes' (array de { id, cant, unid }).
-- ============================================================

insert into qch_receita_ingredientes (receita_id, ingrediente_id, cantidade, unidade, orde)
select
  r.id,
  ing.valor ->> 'id',
  (ing.valor ->> 'cant')::numeric,
  ing.valor ->> 'unid',
  (ing.orde - 1)::integer
from qch_receitas r,
     jsonb_array_elements(r.data -> 'ingredientes') with ordinality as ing(valor, orde)
where jsonb_typeof(r.data -> 'ingredientes') = 'array'
on conflict (receita_id, ingrediente_id) do nothing;

-- ============================================================
-- 3. Extracción: qch_adaptacions desde qch_persoas.data->'adaptacions'
--    (obxecto { receitaId: { tipo, ingrediente, por, pratoAlt, motivo } },
--    ver js/datos/familia.js — nunca un array).
-- ============================================================

insert into qch_adaptacions (persoa_id, receita_id, tipo, ingrediente_id, substituto_id, prato_alt, motivo)
select
  p.id,
  adapt.receita_id,
  adapt.valor ->> 'tipo',
  adapt.valor ->> 'ingrediente',
  adapt.valor ->> 'por',
  adapt.valor ->> 'pratoAlt',
  adapt.valor ->> 'motivo'
from qch_persoas p,
     jsonb_each(p.data -> 'adaptacions') as adapt(receita_id, valor)
where jsonb_typeof(p.data -> 'adaptacions') = 'object'
on conflict (persoa_id, receita_id, tipo, coalesce(ingrediente_id, '')) do nothing;

-- ============================================================
-- 4. Verificación — comparar o extraído contra o JSON orixinal antes de
--    tocar ningún workflow. Todas estas consultas deberían devolver 0
--    filas nunha migración correcta.
-- ============================================================

-- 4.1 Cada receita debe ter tantas filas en qch_receita_ingredientes coma
--     elementos no seu array `ingredientes` orixinal.
select
  r.id as receita_id,
  jsonb_array_length(r.data -> 'ingredientes') as ingredientes_no_json,
  count(ri.id) as ingredientes_na_relacion
from qch_receitas r
left join qch_receita_ingredientes ri on ri.receita_id = r.id
where jsonb_typeof(r.data -> 'ingredientes') = 'array'
group by r.id, r.data
having jsonb_array_length(r.data -> 'ingredientes') <> count(ri.id);

-- 4.2 Cada persoa debe ter tantas filas en qch_adaptacions coma claves no
--     seu obxecto `adaptacions` orixinal.
select
  p.id as persoa_id,
  (select count(*) from jsonb_object_keys(p.data -> 'adaptacions')) as adaptacions_no_json,
  count(a.id) as adaptacions_na_relacion
from qch_persoas p
left join qch_adaptacions a on a.persoa_id = p.id
where jsonb_typeof(p.data -> 'adaptacions') = 'object'
group by p.id, p.data
having (select count(*) from jsonb_object_keys(p.data -> 'adaptacions')) <> count(a.id);

-- 4.3 Reconstruír o array `ingredientes` dunha receita concreta desde a
--     táboa relacional e comparalo co JSON orixinal (proba de fidelidade,
--     útil se algún día un workflow decide compoñer a resposta desde aquí
--     en vez de desde `data`). Cambiar 'tortilla' por calquera id. Nota:
--     probado contra os 14/55/8 rexistros reais de js/datos/*.js — as dúas
--     columnas coinciden elemento a elemento; a única diferenza é cosmética
--     (`800` no JSON orixinal fronte a `800.00` na reconstrución, porque
--     `cantidade` é `numeric(8,2)`), non un erro de datos.
select
  r.data -> 'ingredientes' as orixinal,
  (
    select jsonb_agg(jsonb_build_object('id', ri.ingrediente_id, 'cant', ri.cantidade, 'unid', ri.unidade) order by ri.orde)
    from qch_receita_ingredientes ri
    where ri.receita_id = r.id
  ) as reconstruido
from qch_receitas r
where r.id = 'tortilla';

-- ============================================================
-- 5. Sobre "recompoñer o contrato" nos workflows de n8n
-- ============================================================
-- GET /receitas, GET /ingredientes e GET /persoas xa devolven hoxe a forma
-- correcta lendo `data` directamente (verificado en produción, ver
-- BACKEND_N8N_STATUS.md "Estado confirmado"). Esta migración non cambia eses
-- tres workflows nin o seu camiño de lectura: seguirían a ler `data` tal
-- cal, que non se toca en ningún paso de arriba.
--
-- As táboas novas (qch_receita_ingredientes, qch_adaptacions e o resto) son
-- para funcionalidade futura que si necesita consultas relacionais reais
-- (lista da compra agregada entre varias receitas, busca "en que receitas
-- aparece este ingrediente", nutrición, diario de cociñado — Fases 4 a 8).
-- Se nalgún momento futuro un workflow quixese construír a resposta de
-- GET /receitas dende estas táboas en vez de dende `data`, a consulta 4.3
-- de arriba amosa o xeito de reconstruír o array `ingredientes` por
-- `jsonb_agg`; habería que facer o mesmo para `adaptacions` en GET /persoas
-- usando `jsonb_object_agg` sobre qch_adaptacions. Iso é un cambio de
-- workflow á parte, deliberadamente non incluído aquí: cambiar un contrato
-- xa verificado de punta a punta sen necesidade funcional inmediata sería
-- risco sen beneficio.
