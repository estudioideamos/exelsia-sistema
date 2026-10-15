-- Verificación en dos pasos: refuerzo en la base de datos.
-- Si el usuario tiene un segundo factor verificado y su sesión todavía es de nivel aal1
-- (solo contraseña), las funciones de rol devuelven null y las políticas RLS no le
-- dejan leer ni escribir nada, aunque llame directo a la API. Los usuarios sin segundo
-- factor no se ven afectados.

create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public
as $$
  select p.role
  from profiles p
  where p.id = auth.uid()
    and (
      coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status = 'verified'
      )
    );
$$;

create or replace function auth_cliente_id() returns uuid
language sql stable security definer set search_path = public
as $$
  select p.cliente_id
  from profiles p
  where p.id = auth.uid()
    and (
      coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status = 'verified'
      )
    );
$$;
