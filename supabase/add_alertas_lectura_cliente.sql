-- El cliente puede ver (solo lectura) a qué casillas se le envían los avisos.
create policy "destinatarios_cliente_select" on cliente_destinatarios
  for select using (cliente_id = auth_cliente_id());

create policy "alertas_cliente_select" on cliente_alertas
  for select using (cliente_id = auth_cliente_id());
