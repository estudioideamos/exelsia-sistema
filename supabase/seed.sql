-- Datos de ejemplo para desarrollo

insert into paises (nombre) values
  ('Argentina'), ('México'), ('USA'), ('Alemania'), ('Varios'),
  ('Corea del Sur'), ('Suiza'), ('Italia'), ('Malasia'), ('China'),
  ('España'), ('Taiwán'), ('Canadá'), ('Brasil');

insert into divisas (nombre) values ('USD'), ('EURO'), ('GBP');

insert into incoterms (nombre) values
  ('FOB'), ('CIF'), ('EXW'), ('DAP'), ('DAT'), ('CFR'), ('FCA'), ('CIP'), ('CPT'), ('FAS');

insert into vias (nombre) values
  ('Aéreo'), ('Marítimo'), ('Terrestre camión'), ('Terrestre tren');

insert into exportadores (nombre, cuit, cod) values
  ('Sigma Aldrich International GmbH', 'ALE/ITA/SUIZ', '101'),
  ('Dongshing Diamond Industrial Co. Ltd.', 'COREA', '102'),
  ('Katun Corporation', 'USA', '103'),
  ('Dellas S.P.A.', 'ITA', '104'),
  ('Rotoplas SA de CV', 'MEX', '100'),
  ('TG Medical SDN BHD', 'MALASIA', '106');

insert into clientes (nombre, cuit, cod_import, pais_id, email_contacto, telefono, direccion, notas) values
  ('Sigma Aldrich de Argentina SRL', '30-69313680-2', '62', (select id from paises where nombre = 'Argentina'), 'comex@sigmaaldrich.com.ar', '+54 11 4555-0100', 'Av. Del Libertador 1500, CABA', 'Cliente estratégico. Prioridad alta en despachos aéreos.'),
  ('Rotoplas Argentina SA', '30-69082706-5', '45', (select id from paises where nombre = 'Argentina'), 'importaciones@rotoplas.com.ar', '+54 11 4555-0200', 'Parque Industrial Pilar, Bs. As.', null),
  ('Bercris SRL', '30-71052363-7', '64', (select id from paises where nombre = 'Argentina'), 'administracion@bercris.com.ar', '+54 341 400-1122', 'Zona Franca Rosario, Santa Fe', null),
  ('Analistas Empresarios SRL', '30-58782819-3', '66', (select id from paises where nombre = 'Argentina'), 'operaciones@analistasemp.com.ar', '+54 11 4777-3300', 'San Martín 800, CABA', null);

insert into operaciones (orden, cliente_id, exportador_id, pais_origen_id, via_id, incoterm_id, divisa_id, awb_bl, fecha_arribo, forwarder, factura, fob, estado, descripcion)
values
  ('I1106', (select id from clientes where nombre = 'Sigma Aldrich de Argentina SRL'), (select id from exportadores where nombre = 'Sigma Aldrich International GmbH'), (select id from paises where nombre = 'Alemania'), (select id from vias where nombre = 'Aéreo'), (select id from incoterms where nombre = 'FCA'), (select id from divisas where nombre = 'USD'), 'NUE272465', '2015-03-07', 'PANALPINA', '8941556458', 4453.12, 'en_curso', 'Productos químicos'),
  ('I1090', (select id from clientes where nombre = 'Sigma Aldrich de Argentina SRL'), (select id from exportadores where nombre = 'Sigma Aldrich International GmbH'), (select id from paises where nombre = 'USA'), (select id from vias where nombre = 'Aéreo'), (select id from incoterms where nombre = 'FCA'), (select id from divisas where nombre = 'USD'), 'MIKE472389', '2015-03-09', 'DHL', '636389106', 6559.62, 'despachada', 'Productos químicos'),
  ('I1106', (select id from clientes where nombre = 'Rotoplas Argentina SA'), (select id from exportadores where nombre = 'Rotoplas SA de CV'), (select id from paises where nombre = 'México'), (select id from vias where nombre = 'Marítimo'), (select id from incoterms where nombre = 'FOB'), (select id from divisas where nombre = 'USD'), 'BUE19153006', '2015-03-13', 'SACO SHIPPING', '2532751', 21036.79, 'mafia_solicitado', 'Toner not recibido - faltantes'),
  ('I1095', (select id from clientes where nombre = 'Bercris SRL'), (select id from exportadores where nombre = 'Dongshing Diamond Industrial Co. Ltd.'), (select id from paises where nombre = 'Corea del Sur'), (select id from vias where nombre = 'Marítimo'), (select id from incoterms where nombre = 'FCA'), (select id from divisas where nombre = 'USD'), 'SDB84002308', '2015-04-29', 'SAVINO DEL BENE', '13924-1039M', 18033.10, 'depositada', 'Discos y prensas de diamante'),
  ('I1107', (select id from clientes where nombre = 'Analistas Empresarios SRL'), (select id from exportadores where nombre = 'Dellas S.P.A.'), (select id from paises where nombre = 'Italia'), (select id from vias where nombre = 'Marítimo'), (select id from incoterms where nombre = 'EXW'), (select id from divisas where nombre = 'EURO'), 'SOB013802902', '2015-04-14', 'SAVINO DEL BENE', 'FVM1509128', 10154.50, 'completada', 'Muelas segmentos de muela'),
  ('I1111', (select id from clientes where nombre = 'Sigma Aldrich de Argentina SRL'), (select id from exportadores where nombre = 'TG Medical SDN BHD'), (select id from paises where nombre = 'Malasia'), (select id from vias where nombre = 'Aéreo'), (select id from incoterms where nombre = 'FCA'), (select id from divisas where nombre = 'USD'), 'PGIA1500067', '2015-03-13', 'DELFIN', '2086096137', 28276.90, 'oficializada', 'Guantes de cirugía');
