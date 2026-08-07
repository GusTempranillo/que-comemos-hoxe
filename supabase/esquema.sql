-- Esquema de "Que comemos hoxe" para Supabase Cloud.
--
-- Fonte: DOCS/ESTRUTURA.md §6. Este ficheiro é agora a versión canónica do
-- esquema; se cambia algo aquí, actualízase tamén a descrición da §6.
--
-- Como aplicalo nun proxecto novo:
--   1. Crea o proxecto en https://supabase.com (rexión próxima, plan gratuíto).
--   2. Abre o SQL Editor do proxecto e pega este ficheiro enteiro.
--   3. Execútao unha soa vez. É idempotente: volver executalo non rompe nada,
--      pero tampouco modifica táboas que xa existan.
--   4. Copia a URL do proxecto e a service_role key (Settings → API) e gárdaas
--      como segredos do Worker. Nunca no navegador nin neste repositorio.
--
-- Deseño: `id` + `jsonb`. As receitas son documentos de forma irregular
-- (ingredientes, pasos, versións, adaptacións) e normalizalas agora sería
-- complexidade sen necesidade real para unha soa familia.
--
-- Nota: `gen_random_uuid()` forma parte do núcleo de PostgreSQL desde a
-- versión 13, así que en Supabase non fai falta activar ningunha extensión.

-- ---------------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------------

-- O receitario. É a peza central: todo o demais apunta a receitas.
-- `data` garda o documento completo tal e como o consome o frontend
-- (nome, subtítulo, historia, ingredientes, pasos, tempos, custo, versións,
-- valoracións, adaptacións e as URLs das fotos gardadas en R2).
create table if not exists qch_receitas (
  id             text primary key,
  data           jsonb not null,
  actualizado_en timestamptz not null default now()
);

-- Táboa mestra de ingredientes: as receitas e a neveira apuntan sempre a
-- estes ids, nunca a texto libre. `data` leva nome, unidade, categoría e os
-- valores nutricionais por 100 g/ml que permiten calcular a nutrición en local.
create table if not exists qch_ingredientes (
  id   text primary key,
  data jsonb not null
);

-- As persoas da casa. `data` leva o nome e as adaptacións, que son por persoa
-- E por receita (tres niveis: sen / substituír / prato). Non colapsar iso nunha
-- preferencia global por persoa: é o diferenciador do produto.
create table if not exists qch_persoas (
  id   text primary key,
  data jsonb not null
);

-- ---------------------------------------------------------------------------
-- Estado sincronizado
-- ---------------------------------------------------------------------------

-- Unha fila por recurso: 'semana', 'neveira' e 'cociñeiros'.
-- Cada PUT substitúe o recurso enteiro; non hai actualizacións parciais nin
-- fusión de cambios (gaña a última escritura, ver ESTRUTURA.md §7).
create table if not exists qch_estado (
  clave          text primary key,
  data           jsonb not null,
  actualizado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Diario de cociñado
-- ---------------------------------------------------------------------------

-- A excepción ao patrón de qch_estado: é un rexistro que só medra.
-- Os eventos NUNCA se editan nin se borran, só se engaden — é a memoria
-- culinaria da familia (VISION.md §Memoria culinaria). Por iso ten unha fila
-- por evento en vez dun jsonb que se substitúe enteiro: perder unha entrada
-- por unha escritura concorrente sería perder memoria familiar.
-- O `id` ('ev_<marca>_<azar>') xérase no cliente para que dous dispositivos
-- sen conexión non se pisen o historial ao sincronizar.
create table if not exists qch_diario (
  id         text primary key,
  receita_id text not null references qch_receitas(id),
  data       date not null,
  detalle    jsonb not null default '{}',  -- quen cociñou, valoración, notas
  creado_en  timestamptz not null default now()
);

create index if not exists qch_diario_receita_data_idx
  on qch_diario (receita_id, data desc);

-- ---------------------------------------------------------------------------
-- Sesións
-- ---------------------------------------------------------------------------

-- Un único token de casa (non contas individuais): VISION.md define un só
-- perfil, "cociñeiros". POST /auth/login valida ese token compartido e crea
-- aquí unha sesión cun token propio e a súa caducidade.
create table if not exists qch_sesions (
  token     text primary key,
  creado_en timestamptz not null default now(),
  caduca_en timestamptz not null
);

create index if not exists qch_sesions_caduca_idx on qch_sesions (caduca_en);

-- ---------------------------------------------------------------------------
-- Memoria das conversas coa IA
-- ---------------------------------------------------------------------------

-- Un modelo non lembra nada entre chamadas: a memoria constrúea o Worker
-- lendo e reescribindo `mensaxes` (ESTRUTURA.md §8).
-- Aínda sen usar: correspóndelle ao paso 5 do plan da §13.
create table if not exists qch_conversas (
  id             uuid primary key default gen_random_uuid(),
  receita_id     text references qch_receitas(id) on delete set null,
  mensaxes       jsonb not null default '[]',
  actualizado_en timestamptz not null default now()
);

create index if not exists qch_conversas_actualizado_idx
  on qch_conversas (actualizado_en);

-- ---------------------------------------------------------------------------
-- Seguridade a nivel de fila (RLS)
-- ---------------------------------------------------------------------------
--
-- O acceso valídao o Worker cun token de casa; non hai usuarios de Supabase
-- Auth, así que non hai políticas por usuario. Pero as táboas do esquema
-- `public` quedan expostas por PostgREST á anon key, que é pública por
-- deseño e viaxa no navegador de calquera que use o proxecto.
--
-- Activar RLS **sen crear ningunha política** é o que fai realidade a regra da
-- ESTRUTURA.md §6: ningún rol normal (anon, authenticated) ve nin unha fila,
-- mentres que a service_role salta RLS por definición. Resultado: o Worker é
-- o único camiño aos datos, que é exactamente o deseño.
--
-- Se algún día o frontend falase directo con Supabase, habería que deseñar
-- políticas ANTES de facelo.

alter table qch_receitas     enable row level security;
alter table qch_ingredientes enable row level security;
alter table qch_persoas      enable row level security;
alter table qch_estado       enable row level security;
alter table qch_diario       enable row level security;
alter table qch_sesions      enable row level security;
alter table qch_conversas    enable row level security;
