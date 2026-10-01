-- La migración original (add_mensajes.sql) solo definía select/insert para
-- clientes. Faltaban las políticas de update/delete sobre sus propios
-- mensajes, necesarias para la función de editar/borrar del portal.

create policy "mensajes_autor_update" on operacion_mensajes for update using (
  autor_id = auth.uid()
) with check (
  autor_id = auth.uid()
);

create policy "mensajes_autor_delete" on operacion_mensajes for delete using (
  autor_id = auth.uid()
);
