create table operacion_mensajes (
  id uuid primary key default gen_random_uuid(),
  operacion_id uuid not null references operaciones(id) on delete cascade,
  autor_id uuid not null references auth.users(id),
  texto text not null,
  created_at timestamptz not null default now()
);

alter table operacion_mensajes enable row level security;

create policy "mensajes_admin_all" on operacion_mensajes for all using (auth_role() = 'admin');

create policy "mensajes_cliente_select" on operacion_mensajes for select using (
  operacion_id in (select id from operaciones where cliente_id = auth_cliente_id())
);

create policy "mensajes_cliente_insert" on operacion_mensajes for insert with check (
  autor_id = auth.uid()
  and operacion_id in (select id from operaciones where cliente_id = auth_cliente_id())
);
