-- DATABASE_SCHEMA.sql
-- Esquema relacional de "Que comemos hoxe" para Supabase (PostgreSQL).
--
-- Traduce a SQL o modelo conceptual de DATABASE_MODEL.md. ATENCIÓN: non é
-- unha migración executable contra a produción actual — é o modelo de
-- referencia completo (incluídas Persoa, Receita e Ingrediente en forma
-- relacional, tal e como as describe DATABASE_MODEL.md), útil se algún día
-- se crea unha instancia de Supabase nova dende cero.
--
-- Contexto importante (BACKEND_N8N_STATUS.md, "Estado confirmado"): a
-- produción real xa ten qch_receitas, qch_ingredientes e qch_persoas, pero
-- coa forma `id text primary key, data jsonb not null`, non coas columnas
-- relacionais que amosan os tres bloques comentados máis abaixo. Por iso
-- este ficheiro NON os inclúe coma `create table` activo: farían un
-- `create table if not exists` que non fai nada contra a táboa real (xa
-- existe) e ademais suxeriría columnas que non existen. `semana`, `neveira`
-- e `cociñeiros` tampouco son táboas: son claves dentro do JSON de
-- qch_estado.
--
-- A migración aditiva real contra a produción actual —que non toca
-- qch_receitas/qch_ingredientes/qch_persoas/qch_estado e só engade as
-- táboas de relación que faltan, poboándoas por extracción dende
-- `data jsonb`— é DATABASE_MIGRATION_FASE3.sql. Ese é o ficheiro pensado
-- para executarse; este segue sendo o modelo de referencia completo.

-- ============================================================
-- Ingrediente, Persoa e Receita en forma relacional — SÓ como referencia
-- do modelo conceptual completo (DATABASE_MODEL.md). NON crear isto contra
-- a produción actual: qch_ingredientes, qch_persoas e qch_receitas xa
-- existen como `id + data jsonb` (ver cabeceira). Deixado comentado a
-- propósito para que ninguén o execute por erro copiando este ficheiro.
-- ============================================================

-- create table qch_ingredientes (
--   id           text primary key,        -- mesmo id que usan js/datos/ingredientes.js e o frontend
--   nome         text not null,
--   categoria    text not null,           -- verdura | legume | carne | peixe | lacteo | despensa | especia
--   unidade      text not null,           -- g | ml | ud | dente | pitada | folla | ramallo | lata...
--   estacionalidade text,                 -- opcional, Fase 8
--   observacions text,
--   creado_en    timestamptz not null default now(),
--   actualizado_en timestamptz not null default now()
-- );

-- create table qch_persoas (
--   id           text primary key,
--   nome         text not null,
--   alcume       text,
--   activo       boolean not null default true,
--   cor          text,
--   cociña       boolean not null default false,
--   nota         text,
--   restricions  text[] not null default '{}',
--   observacions text,
--   creado_en    timestamptz not null default now(),
--   actualizado_en timestamptz not null default now()
-- );

-- create table qch_receitas (
--   id            text primary key,
--   nome          text not null,
--   subtitulo     text,
--   descricion    text,
--   elaboracion   text,                   -- resumo/introdución longa, se a hai
--   pasos         jsonb not null default '[]',   -- array ordenado de instrucións
--   consello      text,
--   categoria     text,                   -- verdura | legume | carne | peixe | masa | sobremesa...
--   arte          text,                   -- semente para QCH.arte (ilustración xerada)
--   paleta        text[],
--   tempo_preparacion_min integer,
--   tempo_cocinado_min    integer,
--   dificultade   smallint not null default 1 check (dificultade between 1 and 3),
--   racions       integer not null default 4,
--   custo_estimado numeric(6,2),
--   vexetariana   boolean not null default false,
--   tags          text[] not null default '{}',
--   estado        text not null default 'publicada' check (estado in ('borrador', 'publicada')),
--   creado_en     timestamptz not null default now(),
--   actualizado_en timestamptz not null default now()
-- );

-- ============================================================
-- A partir de aquí, táboas de relación que SI faltan en produción hoxe e
-- que DATABASE_MIGRATION_FASE3.sql crea e pobla de verdade. Repetidas aquí
-- (activas, non comentadas) coma referencia do modelo completo; a versión
-- executable e coas consultas de extracción/verificación vive só en
-- DATABASE_MIGRATION_FASE3.sql.
-- ============================================================

-- ============================================================
-- ReceitaIngrediente — táboa de relación (falta en produción hoxe;
-- os ingredientes viven embebidos no JSON de cada receita).
-- ============================================================
create table if not exists qch_receita_ingredientes (
  id            bigint generated always as identity primary key,
  receita_id    text not null references qch_receitas(id) on delete cascade,
  ingrediente_id text not null references qch_ingredientes(id) on delete restrict,
  cantidade     numeric(8,2) not null,
  unidade       text not null,
  observacions  text,
  orde          integer not null default 0,   -- orde de aparición na receita
  unique (receita_id, ingrediente_id)
);
create index if not exists idx_receita_ingredientes_receita on qch_receita_ingredientes(receita_id);
create index if not exists idx_receita_ingredientes_ingrediente on qch_receita_ingredientes(ingrediente_id);

-- ============================================================
-- Adaptación — por persoa E por receita (o diferenciador do produto,
-- ver js/datos/familia.js). Nunca global.
-- ============================================================
create table if not exists qch_adaptacions (
  id            bigint generated always as identity primary key,
  persoa_id     text not null references qch_persoas(id) on delete cascade,
  receita_id    text not null references qch_receitas(id) on delete cascade,
  tipo          text not null check (tipo in ('sen', 'substituir', 'prato')),
  ingrediente_id text references qch_ingredientes(id),      -- usado en 'sen' e 'substituir'
  substituto_id text references qch_ingredientes(id),       -- usado en 'substituir'
  prato_alt     text,                                       -- usado en 'prato'
  motivo        text,
  creado_en     timestamptz not null default now(),
  unique (persoa_id, receita_id, tipo, ingrediente_id)
);
create index if not exists idx_adaptacions_receita on qch_adaptacions(receita_id);
create index if not exists idx_adaptacions_persoa on qch_adaptacions(persoa_id);

-- ============================================================
-- Fotografía — parte da memoria da receita, nunca se substitúe,
-- só se engaden novas (Fase 6).
-- ============================================================
create table if not exists qch_fotografias (
  id            bigint generated always as identity primary key,
  receita_id    text not null references qch_receitas(id) on delete cascade,
  tipo          text not null check (tipo in ('principal', 'proceso', 'presentacion', 'variante')),
  url           text not null,        -- Cloudflare R2
  autor_id      text references qch_persoas(id),
  data          timestamptz not null default now(),
  descricion    text
);
create index if not exists idx_fotografias_receita on qch_fotografias(receita_id);

-- ============================================================
-- Versión — historial de cambios importantes dunha receita.
-- Filosofía non negociable (AI_GUIDELINES.md, DATABASE_MODEL.md):
-- nunca se elimina coñecemento. Cada cambio relevante crea unha
-- fila nova aquí; a fila en qch_receitas reflicte sempre a última.
-- `snapshot` garda a receita completa nese momento para poder
-- reconstruír calquera versión anterior sen perda.
-- ============================================================
create table if not exists qch_receita_versions (
  id            bigint generated always as identity primary key,
  receita_id    text not null references qch_receitas(id) on delete cascade,
  numero        integer not null,
  autor_id      text references qch_persoas(id),
  data          timestamptz not null default now(),
  motivo        text,
  resumo_cambios text,
  snapshot      jsonb not null,       -- receita completa (incl. ingredientes) nese momento
  unique (receita_id, numero)
);
create index if not exists idx_receita_versions_receita on qch_receita_versions(receita_id);

-- ============================================================
-- Información nutricional — por receita e por ración (Fase 7).
-- ============================================================
create table if not exists qch_nutricion (
  receita_id    text primary key references qch_receitas(id) on delete cascade,
  calorias      numeric(7,1),
  proteinas_g   numeric(6,1),
  hidratos_g    numeric(6,1),
  graxas_g      numeric(6,1),
  fibra_g       numeric(6,1),
  sodio_mg      numeric(7,1),
  por_racion    boolean not null default true,
  calculado_por text,      -- 'ia' | 'manual', ver Fase 4
  observacions  text,
  actualizado_en timestamptz not null default now()
);

-- ============================================================
-- Planificación — o xantar dun día. Só existe un xantar por día
-- (ver COMIDAS en js/datos e DATABASE_MODEL.md). Forma normalizada
-- alternativa á clave "semana" solta en qch_estado.
-- ============================================================
create table if not exists qch_planificacion (
  id              bigint generated always as identity primary key,
  data            date not null,
  comida          text not null default 'xantar',
  receita_id      text references qch_receitas(id),
  comensais       text[] not null default '{}',   -- ids de qch_persoas
  responsable_id  text references qch_persoas(id),
  observacions    text,
  actualizado_en  timestamptz not null default now(),
  unique (data, comida)
);
create index if not exists idx_planificacion_data on qch_planificacion(data);

-- ============================================================
-- Evento de cociñado — o diario culinario da familia (Fase 5).
-- Cada vez que se prepara unha receita créase un rexistro; nunca
-- se sobrescribe nin se borra.
-- ============================================================
create table if not exists qch_eventos_cocinado (
  id            bigint generated always as identity primary key,
  receita_id    text not null references qch_receitas(id),
  data          timestamptz not null default now(),
  cociñeiro_id  text references qch_persoas(id),
  valoracion    smallint check (valoracion between 1 and 5),
  tempo_real_min integer,
  comentarios   text,
  foto_id       bigint references qch_fotografias(id)
);
create index if not exists idx_eventos_cocinado_receita on qch_eventos_cocinado(receita_id);
create index if not exists idx_eventos_cocinado_data on qch_eventos_cocinado(data);

-- ============================================================
-- Compartición — URL pública efémera (xa existe como
-- qch_comparticions; forma de referencia por se se recrea).
-- ============================================================
create table if not exists qch_comparticions (
  token         text primary key,
  data          timestamptz not null default now(),
  caduca_en     timestamptz not null,
  receita_id    text references qch_receitas(id),
  planificacion_id bigint references qch_planificacion(id),
  estado        text not null default 'activa' check (estado in ('activa', 'caducada', 'revogada'))
);

-- ============================================================
-- Notas de deseño
-- ============================================================
-- - Todas as PK de dominio (receita, ingrediente, persoa) usan o mesmo
--   `id` de texto que xa emprega o frontend (js/datos/*.js e
--   API_CONTRACT.md), para non ter que traducir ids en ningures.
-- - Nada se borra en cascada agresivamente sen pensalo: `on delete
--   restrict` en ingrediente_id de qch_receita_ingredientes evita que
--   borrar un ingrediente do catálogo rompa receitas existentes en
--   silencio.
-- - RLS (Row Level Security): as chamadas actuais veñen sempre de n8n
--   cunha service role key, nunca directamente do navegador (ver
--   AI_GUIDELINES.md "nunca acceder directamente á base de datos dende
--   o navegador"), así que RLS non é o mecanismo de autorización aquí
--   — a autenticación por código de casa xa vive en qch_sesions. Se no
--   futuro algo chama a Supabase sen pasar por n8n, isto habería que
--   revisalo antes.
