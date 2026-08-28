create table configuracion_email (
  id uuid primary key default gen_random_uuid(),
  asunto text not null,
  cuerpo text not null,
  updated_at timestamptz not null default now()
);

alter table configuracion_email enable row level security;

create policy "configuracion_email_admin_all" on configuracion_email for all using (auth_role() = 'admin');

insert into configuracion_email (asunto, cuerpo) values (
  'Actualización de tu operación {{orden}}: {{estado}}',
  '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
  <h2 style="color: #E02B20;">Exelsia</h2>
  <p>Hola {{cliente}},</p>
  <p>Tu operación <strong>{{orden}}</strong> cambió de estado a:</p>
  <p style="font-size: 18px; font-weight: bold;">{{estado}}</p>
  <p>Podés ver el detalle completo ingresando al portal de Exelsia.</p>
  <p style="color: #888; font-size: 12px; margin-top: 32px;">
    Este es un aviso automático, no respondas a este email.
  </p>
</div>'
);
