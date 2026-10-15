-- Avisos configurables por cliente + categoría de archivos.

-- Casillas de mail de cada cliente (puede tener varias).
create table cliente_destinatarios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  email text not null,
  etiqueta text,
  created_at timestamptz not null default now(),
  unique (cliente_id, email)
);

-- Qué casilla recibe el aviso de cada etapa. Una fila = "esta casilla recibe esta etapa".
-- Si un cliente no tiene casillas cargadas, los avisos siguen yendo a su email de contacto.
create table cliente_alertas (
  cliente_id uuid not null references clientes(id) on delete cascade,
  estado text not null,
  destinatario_id uuid not null references cliente_destinatarios(id) on delete cascade,
  primary key (cliente_id, estado, destinatario_id)
);

alter table cliente_destinatarios enable row level security;
alter table cliente_alertas enable row level security;

create policy "destinatarios_admin_all" on cliente_destinatarios for all using (auth_role() = 'admin');
create policy "alertas_admin_all" on cliente_alertas for all using (auth_role() = 'admin');

-- Categoría del archivo (BL, Factura exterior, Despacho PDF, etc.).
alter table archivos_cliente add column tipo text;

-- Qué categorías de archivo viajan (como links de descarga) en el aviso de cada etapa.
create table etapa_documentos (
  estado text not null,
  tipo text not null,
  primary key (estado, tipo)
);

alter table etapa_documentos enable row level security;

create policy "etapa_documentos_admin_all" on etapa_documentos for all using (auth_role() = 'admin');
