-- Exelsia Sistema — esquema inicial
-- Catálogos

create table paises (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table divisas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table incoterms (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table vias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table exportadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cuit text,
  cod text
);

-- Clientes (perfil)

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cuit text,
  cod_import text,
  pais_id uuid references paises(id),
  email_contacto text,
  telefono text,
  direccion text,
  notas text,
  created_at timestamptz not null default now()
);

-- Perfiles de usuario (extiende auth.users)

create type user_role as enum ('admin', 'cliente');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'cliente',
  cliente_id uuid references clientes(id),
  nombre text,
  created_at timestamptz not null default now()
);

-- Operaciones

create type estado_operacion as enum (
  'en_curso',
  'oficializada',
  'despachada',
  'mafia_solicitado',
  'depositada',
  'completada'
);

create table operaciones (
  id uuid primary key default gen_random_uuid(),
  orden text not null,
  cliente_id uuid not null references clientes(id),
  exportador_id uuid references exportadores(id),
  pais_origen_id uuid references paises(id),
  via_id uuid references vias(id),
  incoterm_id uuid references incoterms(id),
  divisa_id uuid references divisas(id),
  awb_bl text,
  fecha_arribo date,
  peso_kg numeric,
  forwarder text,
  factura text,
  fecha_factura date,
  orden_compra text,
  oficializacion_dua text,
  tc numeric,
  gastos_fob numeric,
  fob numeric,
  flete numeric,
  seguro numeric,
  base_imponible numeric,
  iva numeric,
  descripcion text,
  intervinientes text,
  estado estado_operacion not null default 'en_curso',
  fecha_oficializacion date,
  fecha_despacho date,
  comentarios text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table operacion_estado_historial (
  id uuid primary key default gen_random_uuid(),
  operacion_id uuid not null references operaciones(id) on delete cascade,
  estado_anterior estado_operacion,
  estado_nuevo estado_operacion not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);

create table archivos_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  operacion_id uuid references operaciones(id) on delete set null,
  nombre_archivo text not null,
  storage_path text not null,
  subido_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Helper: rol y cliente del usuario autenticado

create function auth_role() returns user_role
language sql stable
as $$
  select role from profiles where id = auth.uid();
$$;

create function auth_cliente_id() returns uuid
language sql stable
as $$
  select cliente_id from profiles where id = auth.uid();
$$;

-- RLS

alter table paises enable row level security;
alter table divisas enable row level security;
alter table incoterms enable row level security;
alter table vias enable row level security;
alter table exportadores enable row level security;
alter table clientes enable row level security;
alter table profiles enable row level security;
alter table operaciones enable row level security;
alter table operacion_estado_historial enable row level security;
alter table archivos_cliente enable row level security;

-- Catálogos: lectura para cualquier usuario autenticado, escritura solo admin
create policy "catalogos_read" on paises for select using (auth.uid() is not null);
create policy "catalogos_write" on paises for all using (auth_role() = 'admin');

create policy "catalogos_read" on divisas for select using (auth.uid() is not null);
create policy "catalogos_write" on divisas for all using (auth_role() = 'admin');

create policy "catalogos_read" on incoterms for select using (auth.uid() is not null);
create policy "catalogos_write" on incoterms for all using (auth_role() = 'admin');

create policy "catalogos_read" on vias for select using (auth.uid() is not null);
create policy "catalogos_write" on vias for all using (auth_role() = 'admin');

create policy "catalogos_read" on exportadores for select using (auth.uid() is not null);
create policy "catalogos_write" on exportadores for all using (auth_role() = 'admin');

-- Clientes: admin ve todo, cliente ve su propia ficha
create policy "clientes_admin_all" on clientes for all using (auth_role() = 'admin');
create policy "clientes_propio" on clientes for select using (id = auth_cliente_id());

-- Profiles: cada usuario ve su propio perfil, admin ve todos
create policy "profiles_propio" on profiles for select using (id = auth.uid());
create policy "profiles_admin_all" on profiles for all using (auth_role() = 'admin');

-- Operaciones: admin ve/edita todo, cliente solo lee las suyas
create policy "operaciones_admin_all" on operaciones for all using (auth_role() = 'admin');
create policy "operaciones_propias" on operaciones for select using (cliente_id = auth_cliente_id());

-- Historial: mismo criterio que operaciones
create policy "historial_admin_all" on operacion_estado_historial for all using (auth_role() = 'admin');
create policy "historial_propio" on operacion_estado_historial for select using (
  operacion_id in (select id from operaciones where cliente_id = auth_cliente_id())
);

-- Archivos: admin ve/edita todo, cliente solo lee los suyos
create policy "archivos_admin_all" on archivos_cliente for all using (auth_role() = 'admin');
create policy "archivos_propios" on archivos_cliente for select using (cliente_id = auth_cliente_id());

-- Trigger: crear perfil automáticamente al registrar un usuario (rol por defecto: cliente)
create function handle_new_user() returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Trigger: mantener updated_at en operaciones
create function set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger operaciones_set_updated_at
  before update on operaciones
  for each row execute function set_updated_at();
