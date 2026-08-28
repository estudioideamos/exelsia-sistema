-- Bucket privado para archivos de clientes (facturas, packing list, certificados, etc.)
insert into storage.buckets (id, name, public)
values ('archivos-clientes', 'archivos-clientes', false)
on conflict (id) do nothing;

-- Los archivos se guardan con path: {cliente_id}/{filename}
-- Admin: acceso total. Cliente: solo lectura de su propia carpeta.

create policy "archivos_storage_admin_all"
on storage.objects for all
using (bucket_id = 'archivos-clientes' and auth_role() = 'admin')
with check (bucket_id = 'archivos-clientes' and auth_role() = 'admin');

create policy "archivos_storage_cliente_read"
on storage.objects for select
using (
  bucket_id = 'archivos-clientes'
  and (storage.foldername(name))[1] = auth_cliente_id()::text
);
