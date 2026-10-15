-- Índices para las consultas más frecuentes (listados, filtros por cliente y detalle).
create index if not exists operaciones_fecha_arribo_idx on operaciones (fecha_arribo desc nulls last);
create index if not exists operaciones_cliente_idx on operaciones (cliente_id);
create index if not exists operaciones_estado_idx on operaciones (estado);
create index if not exists operaciones_created_at_idx on operaciones (created_at desc);

create index if not exists operacion_mensajes_operacion_idx on operacion_mensajes (operacion_id);

create index if not exists archivos_cliente_operacion_idx on archivos_cliente (operacion_id);
create index if not exists archivos_cliente_cliente_idx on archivos_cliente (cliente_id);

create index if not exists historial_operacion_idx on operacion_estado_historial (operacion_id, changed_at desc);
create index if not exists historial_changed_at_idx on operacion_estado_historial (changed_at desc);
