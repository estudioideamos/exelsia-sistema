export type EstadoOperacion =
  | "en_curso"
  | "oficializada"
  | "despachada"
  | "mafia_solicitado"
  | "depositada"
  | "completada";

export const ESTADOS: Record<EstadoOperacion, { label: string; className: string }> = {
  en_curso: { label: "En curso", className: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  oficializada: { label: "Oficializada", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  despachada: { label: "Despachada", className: "bg-primary/15 text-primary border-primary/30" },
  mafia_solicitado: { label: "MAFIA solicitado", className: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
  depositada: { label: "Depositada", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  completada: { label: "Completada", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

export type Cliente = {
  id: string;
  nombre: string;
  cuit: string;
  codImport: string;
  pais: string;
  emailContacto: string;
  telefono: string;
  direccion: string;
  operacionesActivas: number;
  notas?: string;
};

export type Operacion = {
  id: string;
  orden: string;
  clienteId: string;
  cliente: string;
  exportador: string;
  origen: string;
  via: "Aéreo" | "Marítimo" | "Terrestre";
  incoterm: string;
  divisa: string;
  awbBl: string;
  fechaArribo: string;
  forwarder: string;
  factura: string;
  fob: number;
  estado: EstadoOperacion;
  descripcion: string;
};

export const clientes: Cliente[] = [
  {
    id: "sigma-aldrich",
    nombre: "Sigma Aldrich de Argentina SRL",
    cuit: "30-69313680-2",
    codImport: "62",
    pais: "Argentina",
    emailContacto: "comex@sigmaaldrich.com.ar",
    telefono: "+54 11 4555-0100",
    direccion: "Av. Del Libertador 1500, CABA",
    operacionesActivas: 8,
    notas: "Cliente estratégico. Prioridad alta en despachos aéreos.",
  },
  {
    id: "rotoplas",
    nombre: "Rotoplas Argentina SA",
    cuit: "30-69082706-5",
    codImport: "45",
    pais: "Argentina",
    emailContacto: "importaciones@rotoplas.com.ar",
    telefono: "+54 11 4555-0200",
    direccion: "Parque Industrial Pilar, Bs. As.",
    operacionesActivas: 5,
  },
  {
    id: "bercris",
    nombre: "Bercris SRL",
    cuit: "30-71052363-7",
    codImport: "64",
    pais: "Argentina",
    emailContacto: "administracion@bercris.com.ar",
    telefono: "+54 341 400-1122",
    direccion: "Zona Franca Rosario, Santa Fe",
    operacionesActivas: 3,
  },
  {
    id: "analistas-empresarios",
    nombre: "Analistas Empresarios SRL",
    cuit: "30-58782819-3",
    codImport: "66",
    pais: "Argentina",
    emailContacto: "operaciones@analistasemp.com.ar",
    telefono: "+54 11 4777-3300",
    direccion: "San Martín 800, CABA",
    operacionesActivas: 2,
  },
];

export const operaciones: Operacion[] = [
  {
    id: "11106",
    orden: "I1106",
    clienteId: "sigma-aldrich",
    cliente: "Sigma Aldrich de Argentina SRL",
    exportador: "Sigma Aldrich International GmbH",
    origen: "Alemania",
    via: "Aéreo",
    incoterm: "FCA",
    divisa: "USD",
    awbBl: "NUE272465",
    fechaArribo: "07/03/2015",
    forwarder: "PANALPINA",
    factura: "8941556458",
    fob: 4453.12,
    estado: "en_curso",
    descripcion: "Productos químicos",
  },
  {
    id: "11090",
    orden: "I1090",
    clienteId: "sigma-aldrich",
    cliente: "Sigma Aldrich de Argentina SRL",
    exportador: "Sigma Aldrich International GmbH",
    origen: "USA",
    via: "Aéreo",
    incoterm: "FCA",
    divisa: "USD",
    awbBl: "MIKE472389",
    fechaArribo: "09/03/2015",
    forwarder: "DHL",
    factura: "636389106",
    fob: 6559.62,
    estado: "despachada",
    descripcion: "Productos químicos",
  },
  {
    id: "11106b",
    orden: "I1106",
    clienteId: "rotoplas",
    cliente: "Rotoplas Argentina SA",
    exportador: "Rotoplas SA de CV",
    origen: "México",
    via: "Marítimo",
    incoterm: "FOB",
    divisa: "USD",
    awbBl: "BUE19153006",
    fechaArribo: "13/03/2015",
    forwarder: "SACO SHIPPING",
    factura: "2532751",
    fob: 21036.79,
    estado: "mafia_solicitado",
    descripcion: "Toner not recibido - faltantes",
  },
  {
    id: "11095",
    orden: "I1095",
    clienteId: "bercris",
    cliente: "Bercris SRL",
    exportador: "Dongshing Diamond Industrial Co.",
    origen: "Corea del Sur",
    via: "Marítimo",
    incoterm: "TCA",
    divisa: "USD",
    awbBl: "SDB84002308",
    fechaArribo: "29/04/2015",
    forwarder: "SAVINO DEL BENE",
    factura: "13924-1039M",
    fob: 18033.10,
    estado: "depositada",
    descripcion: "Discos y prensas de diamante",
  },
  {
    id: "11107",
    orden: "I1107",
    clienteId: "analistas-empresarios",
    cliente: "Analistas Empresarios SRL",
    exportador: "Dellas S.P.A.",
    origen: "Italia",
    via: "Marítimo",
    incoterm: "EXW",
    divisa: "EURO",
    awbBl: "SOB013802902",
    fechaArribo: "14/04/2015",
    forwarder: "SAVINO DEL BENE",
    factura: "FVM1509128",
    fob: 10154.50,
    estado: "completada",
    descripcion: "Muelas segmentos de muela",
  },
  {
    id: "11111",
    orden: "I1111",
    clienteId: "sigma-aldrich",
    cliente: "Sigma Aldrich de Argentina SRL",
    exportador: "TG Medical SDN BHD",
    origen: "Malasia",
    via: "Aéreo",
    incoterm: "TCA",
    divisa: "USD",
    awbBl: "PGIA1500067",
    fechaArribo: "13/03/2015",
    forwarder: "DELFIN",
    factura: "2086096137",
    fob: 28276.90,
    estado: "oficializada",
    descripcion: "Guantes de cirugía",
  },
];

export function estadoLabel(estado: EstadoOperacion) {
  return ESTADOS[estado]?.label ?? estado;
}
