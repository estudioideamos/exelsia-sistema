import { AppTopbar } from "@/components/app-topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Ship,
  Users,
  History,
  Globe2,
  Settings,
  UserCircle,
  Search,
  Bell,
  Moon,
  PanelLeftClose,
  FileSpreadsheet,
  FileDown,
  Trash2,
  MessageCircle,
  Lock,
  KeyRound,
  Mail,
  Pencil,
} from "lucide-react";

const SECCIONES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "operaciones", label: "Operaciones" },
  { id: "clientes", label: "Clientes" },
  { id: "catalogos", label: "Catálogos" },
  { id: "historial", label: "Historial de auditoría" },
  { id: "configuracion", label: "Configuración y emails" },
  { id: "portal", label: "Portal del cliente" },
  { id: "cuenta", label: "Tu cuenta y atajos" },
];

function Seccion({
  id,
  icono: Icono,
  titulo,
  children,
}: {
  id: string;
  icono: typeof LayoutDashboard;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-24 border-border/60">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icono className="h-4.5 w-4.5" />
        </div>
        <CardTitle className="text-lg">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

function Punto({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-foreground">{titulo}</p>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
      {children}
    </kbd>
  );
}

export default function ManualPage() {
  return (
    <>
      <AppTopbar title="Manual de uso" description="Guía completa de la plataforma Exelsia" />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[220px_1fr]">
          <nav className="hidden xl:block">
            <div className="sticky top-24 space-y-1 rounded-xl border border-border/60 bg-card/40 p-3">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Contenido
              </p>
              {SECCIONES.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="animate-fade-in-up space-y-6">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
              <CardContent className="space-y-2 pt-6">
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                  Bienvenida al sistema de Exelsia
                </h1>
                <p className="text-sm text-muted-foreground">
                  Esta guía recorre cada sección del panel: qué hace, cómo se usa y qué ve el
                  cliente del otro lado. Podés navegar por el índice de la izquierda o simplemente
                  bajar con scroll.
                </p>
              </CardContent>
            </Card>

            <Seccion id="dashboard" icono={LayoutDashboard} titulo="Dashboard">
              <p>
                Es la pantalla de inicio: un resumen general de toda la operatoria, pensado para
                ver el estado del negocio de un vistazo.
              </p>
              <Punto titulo="Tarjetas de KPI">
                Operaciones en curso, clientes activos, pendientes de despacho y FOB total
                acumulado.
              </Punto>
              <Punto titulo="Operaciones recientes">
                Las últimas operaciones cargadas, con acceso directo a cada una.
              </Punto>
              <Punto titulo="Operaciones por estado">
                Gráfico de barras con la distribución de todas las operaciones según su estado
                actual.
              </Punto>
              <Punto titulo="Clientes con más actividad">
                Ranking de los 5 clientes con más operaciones activas.
              </Punto>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                <FileDown className="h-4 w-4 shrink-0 text-primary" />
                <p>
                  <span className="font-medium text-foreground">Exportar PDF: </span>
                  el botón arriba a la derecha genera un reporte imprimible con todo el resumen,
                  listo para guardar o compartir.
                </p>
              </div>
            </Seccion>

            <Seccion id="operaciones" icono={Ship} titulo="Operaciones">
              <p>
                El corazón del sistema: acá se cargan, editan y siguen todas las operaciones de
                comercio exterior.
              </p>

              <Punto titulo="La tabla">
                Cada fila es una operación. Hacé clic en cualquier columna (Orden, Cliente, Vía,
                Arribo, FOB, Estado) para ordenar ascendente o descendente, como en Excel. La
                columna con el ícono de mensaje muestra cuántos mensajes tiene esa operación; si
                el número aparece resaltado en rojo, significa que el cliente escribió y todavía
                no le respondiste.
              </Punto>

              <Punto titulo="Buscar, paginar y navegar">
                Usá el buscador de arriba (o el atajo <Kbd>⌘K</Kbd> / <Kbd>Ctrl K</Kbd>) para
                encontrar una operación por orden, cliente o AWB/BL sin salir de la pantalla en la
                que estás. Los controles de "Resultados por página" están arriba y abajo de la
                tabla; por defecto muestra 50 y podés subirlo a 100, 500 o "Todo".
              </Punto>

              <Punto titulo="Nueva operación / Editar">
                El formulario está organizado en 4 pestañas para no perderte entre tantos campos:
                <span className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">General</Badge>
                  <Badge variant="secondary">Comercial</Badge>
                  <Badge variant="secondary">Aduana</Badge>
                  <Badge variant="secondary">Anticipos / MAFIA</Badge>
                </span>
              </Punto>

              <Punto titulo="Cambiar el estado">
                El selector de estado (arriba a la derecha del detalle) dispara automáticamente un
                email al cliente avisándole del cambio, y queda registrado en el historial de esa
                operación.
              </Punto>

              <Punto titulo="Detalle de una operación">
                Al entrar a una operación vas a ver todos sus datos agrupados igual que en el
                formulario, más:
              </Punto>
              <ul className="ml-1 list-disc space-y-1.5 pl-4">
                <li>
                  <span className="font-medium text-foreground">Archivos</span>: subís documentos
                  arrastrándolos o haciendo clic; quedan visibles también en el perfil del
                  cliente.
                </li>
                <li>
                  <span className="font-medium text-foreground">Historial</span>: línea de tiempo
                  con cada cambio de estado, cuándo y quién lo hizo.
                </li>
                <li>
                  <span className="font-medium text-foreground">Notas internas</span>: un cuaderno
                  privado por operación que{" "}
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3" /> nunca ve el cliente
                  </span>
                  .
                </li>
                <li>
                  <span className="font-medium text-foreground">Mensajes con el cliente</span>:
                  chat sobre esa operación puntual, visible para vos y para el cliente dueño.
                  Podés <Pencil className="inline h-3 w-3" /> editar o{" "}
                  <Trash2 className="inline h-3 w-3" /> borrar tus propios mensajes (el cliente no
                  puede editar ni borrar los suyos).
                </li>
              </ul>

              <Punto titulo="Importar desde Excel">
                El botón "Importar" acepta un archivo .xlsx/.csv con columnas Orden, Cliente,
                Exportador, Origen, Vía, AWB/BL, Arribo, FOB y Estado. Si la orden ya existe la
                actualiza; si no, la crea (resolviendo cliente y exportador por nombre). Al final
                te muestra un resumen de filas creadas, actualizadas y con error.
              </Punto>

              <Punto titulo="Exportar, imprimir y borrar">
                Con el check de la izquierda seleccionás una o varias filas. "Exportar" te deja
                elegir Excel o CSV (o imprimir un reporte con membrete de Exelsia); "Borrar
                seleccionados" las elimina para siempre, previa confirmación.
              </Punto>
            </Seccion>

            <Seccion id="clientes" icono={Users} titulo="Clientes">
              <Punto titulo="La grilla">
                Cada tarjeta es un cliente, con sus datos de contacto y la cantidad de operaciones
                activas. Mismo sistema de selección, exportar, importar y borrar que en
                Operaciones.
              </Punto>
              <Punto titulo="Perfil del cliente">
                Al entrar a un cliente ves y editás sus datos, todas sus operaciones y sus
                archivos (los generales y los que se subieron dentro de cada operación puntual,
                identificados con la orden correspondiente).
              </Punto>
            </Seccion>

            <Seccion id="catalogos" icono={Globe2} titulo="Catálogos">
              <p>
                Países, Divisas, Incoterms, Vías y Exportadores son listas simples que alimentan
                los formularios de operaciones y clientes. En cada una podés crear, editar y
                borrar ítems, y ordenar/paginar igual que en las tablas grandes. Los países
                muestran su bandera y las vías su ícono correspondiente.
              </p>
            </Seccion>

            <Seccion id="historial" icono={History} titulo="Historial de auditoría">
              <p>
                Un registro cronológico de todos los cambios de estado de todas las operaciones,
                con quién lo hizo y cuándo. Sirve para auditar qué pasó con cualquier operación
                sin tener que entrar una por una.
              </p>
            </Seccion>

            <Seccion id="configuracion" icono={Settings} titulo="Configuración y emails">
              <Punto titulo="Avisos por email">
                Cada uno de los 6 estados de una operación tiene su propia plantilla de mail.
                Elegís el estado en el desplegable y editás asunto y cuerpo.
              </Punto>
              <Punto titulo="Editor Visual o HTML">
                Podés escribir con el editor visual (como un Word simple: negrita, cursiva,
                subrayado, links) o pasar a modo HTML si necesitás más control. Las variables
                disponibles (
                <span className="font-mono text-xs">{"{{cliente}}"}</span>,{" "}
                <span className="font-mono text-xs">{"{{orden}}"}</span>,{" "}
                <span className="font-mono text-xs">{"{{estado}}"}</span>, etc.) se insertan con
                un clic en el lugar donde esté el cursor.
              </Punto>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <p>
                  El envío usa Resend. Mientras el dominio de Exelsia no esté verificado ahí,
                  los emails reales solo pueden llegar a la casilla verificada de prueba — es una
                  limitación del proveedor, no del sistema.
                </p>
              </div>
            </Seccion>

            <Seccion id="portal" icono={UserCircle} titulo="Portal del cliente">
              <p>
                Cada cliente tiene su propio acceso, separado del panel de administración, donde
                solo ve <span className="font-medium text-foreground">sus propios datos</span>{" "}
                (esto lo garantiza la base de datos, no solo la interfaz).
              </p>
              <Punto titulo="Qué ve el cliente">
                Sus operaciones con seguimiento en tiempo real, gráfico de sus estados, sus
                archivos, su perfil de contacto y el hilo de mensajes de cada operación.
              </Punto>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
                <p>
                  <span className="font-medium text-foreground">Estado de cuenta: </span>
                  desde su pantalla principal, el cliente puede descargar un PDF con todas sus
                  operaciones y el FOB total del período.
                </p>
              </div>
            </Seccion>

            <Seccion id="cuenta" icono={KeyRound} titulo="Tu cuenta y atajos">
              <Punto titulo="Buscador global">
                <Search className="mr-1 inline h-3.5 w-3.5" />
                Arriba a la derecha, en cualquier pantalla. Atajo: <Kbd>⌘K</Kbd> / <Kbd>Ctrl K</Kbd>.
              </Punto>
              <Punto titulo="Notificaciones">
                <Bell className="mr-1 inline h-3.5 w-3.5" />
                La campana avisa sobre cambios de estado y mensajes nuevos de clientes.
              </Punto>
              <Punto titulo="Modo claro / oscuro">
                <Moon className="mr-1 inline h-3.5 w-3.5" />
                Botón junto a la campana; se recuerda tu elección.
              </Punto>
              <Punto titulo="Colapsar el menú">
                <PanelLeftClose className="mr-1 inline h-3.5 w-3.5" />
                El botón al pie del menú lateral lo reduce a solo íconos, para tener más espacio
                en pantallas chicas.
              </Punto>
              <Punto titulo="Recuperar contraseña">
                Desde el login, "¿Olvidaste tu contraseña?" te envía un link para elegir una
                nueva.
              </Punto>
              <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  ¿Falta algo o algo no se entiende? Cualquier cambio a la plataforma se coordina
                  directamente, este manual se actualiza junto con cada mejora.
                </p>
              </div>
            </Seccion>

            <Separator />
            <p className="pb-6 text-center text-xs text-muted-foreground">
              Exelsia · Sistema de Operaciones
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
