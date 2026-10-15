-- Endurecimiento de seguridad. Se puede correr más de una vez.

-- 1) Catálogos: hasta ahora los leía cualquier usuario autenticado, incluso una cuenta
--    creada por registro público sin cliente asignado. Ahora solo los leen administradores
--    y usuarios que ya están vinculados a un cliente.
do $$
declare t text;
begin
  foreach t in array array['paises','divisas','incoterms','vias','exportadores'] loop
    execute format('drop policy if exists "catalogos_read" on %I', t);
    execute format(
      'create policy "catalogos_read" on %I for select using (auth_role() = ''admin'' or auth_cliente_id() is not null)',
      t
    );
  end loop;
end $$;

-- 2) Storage: límite de tamaño por archivo (25 MB) en el bucket de documentos.
update storage.buckets
set file_size_limit = 26214400
where id = 'archivos-clientes';
