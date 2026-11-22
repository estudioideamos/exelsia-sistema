-- Importación / exportación y avisos por evento. Se puede correr más de una vez.
-- IMPORTANTE: correr esto ANTES de publicar la versión nueva del sistema.

-- 1) Tipo de operación y campos propios de cada tipo.
alter table operaciones add column if not exists tipo text not null default 'importacion';
alter table operaciones drop constraint if exists operaciones_tipo_check;
alter table operaciones add constraint operaciones_tipo_check check (tipo in ('importacion', 'exportacion'));

alter table operaciones add column if not exists procedencia text;          -- importación
alter table operaciones add column if not exists destino text;              -- exportación
alter table operaciones add column if not exists nombre_transporte text;
alter table operaciones add column if not exists vto_forzoso date;          -- importación
alter table operaciones add column if not exists fecha_salida date;         -- exportación (ETD)
alter table operaciones add column if not exists cutoff_documental date;    -- exportación
alter table operaciones add column if not exists cutoff_fisico date;        -- exportación
alter table operaciones add column if not exists cuit_ata text;             -- exportación
alter table operaciones add column if not exists fecha_precumplido date;    -- exportación
alter table operaciones add column if not exists fecha_cumplido date;       -- exportación

create index if not exists operaciones_tipo_idx on operaciones (tipo);

-- 2) Avisos por evento. Se guardan en cliente_alertas con estas claves:
--      evento:<evento>   la casilla recibe el aviso
--      adjunto:<evento>  la casilla recibe además los documentos
--    Las casillas que ya existen quedan recibiendo todos los eventos, para no silenciar a nadie.
insert into cliente_alertas (cliente_id, estado, destinatario_id)
select d.cliente_id, e.clave, d.id
from cliente_destinatarios d
cross join (
  values
    ('evento:creacion'), ('adjunto:creacion'),
    ('evento:fecha_transporte'),
    ('evento:anticipos'), ('adjunto:anticipos'),
    ('evento:oficializacion'), ('adjunto:oficializacion'),
    ('evento:entrega'),
    ('evento:facturacion'), ('adjunto:facturacion')
) as e(clave)
on conflict do nothing;
