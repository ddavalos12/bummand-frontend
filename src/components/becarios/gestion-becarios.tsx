"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  UserCheck,
  Building2,
  GraduationCap,
  Mail,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Edit2,
  Church,
} from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface BecarioVista {
  id: number;
  nombre: string;
  ci: string;
  carrera: string;
  universidad: string;
  iglesia: string;
  lugar_practica: string;
  tutor_nombre: string;
  tutor_correo: string;
  estado: "activo" | "pendiente_validacion";
}

const SUPERVISORES_INSTITUCIONALES = [
  { nombre: "Angel Javier Ali Paz", correo: "angel.ali@diaconia.bo" },
  { nombre: "Claudia Cabrera", correo: "claudia.cabrera@diaconia.bo" },
  { nombre: "Rodrigo Solorzano", correo: "rodrigo.solorzano@diaconia.bo" },
  { nombre: "Lic. Mónica Valenzuela", correo: "monica.valenzuela@diaconia.bo" },
];

const BECARIOS_INICIALES: BecarioVista[] = [
  {
    id: 1,
    nombre: "Nilda Amalia Churata Paye",
    ci: "10028341",
    carrera: "Educación Parvularia",
    universidad: "UMSA",
    iglesia: "Iglesia Central El Alto",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Edgar Elias Alarcon Huanca",
    ci: "9160054",
    carrera: "Medicina",
    universidad: "UPEA",
    iglesia: "Comunidad Cristiana Vida Nueva",
    lugar_practica: "Sucursal Juan Pablo II",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "pendiente_validacion",
  },
  {
    id: 3,
    nombre: "Adai Belen Huayta Cardozo",
    ci: "13696496",
    carrera: "Estadística",
    universidad: "UMSA",
    iglesia: "Misión Alianza Central",
    lugar_practica: "Oficina Central Bloque B",
    tutor_nombre: "Rodrigo Solorzano",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
  },
  {
    id: 4,
    nombre: "Ronald Franz Mamani Quispe",
    ci: "8472910",
    carrera: "Bioquímica y Farmacia",
    universidad: "UMSA",
    iglesia: "Iglesia Evangélica Los Andes",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "pendiente_validacion",
  },
];

export function GestionBecarios() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const [lista_becarios, set_lista_becarios] = useState<BecarioVista[]>(BECARIOS_INICIALES);
  const [busqueda, set_busqueda] = useState("");
  const [modal_abierto, set_modal_abierto] = useState(false);

  // Estados del formulario nuevo becario
  const [nuevo_nombre, set_nuevo_nombre] = useState("");
  const [nuevo_ci, set_nuevo_ci] = useState("");
  const [nueva_carrera, set_nueva_carrera] = useState("");
  const [nueva_universidad, set_nueva_universidad] = useState("UMSA");
  const [nueva_iglesia, set_nueva_iglesia] = useState("Iglesia Alianza La Paz");
  const [nuevo_lugar, set_nuevo_lugar] = useState("Oficina Central Bloque A");

  // Estado para Asignar Supervisor (Modal)
  const [modal_supervisor_abierto, set_modal_supervisor_abierto] = useState(false);
  const [becario_seleccionado, set_becario_seleccionado] = useState<BecarioVista | null>(null);
  const [supervisor_seleccionado, set_supervisor_seleccionado] = useState(
    SUPERVISORES_INSTITUCIONALES[0].nombre
  );

  // Estado para Verificación Mensual
  const [verificacion_mensual_activa, set_verificacion_mensual_activa] = useState(false);

  // Filtrado reactivo
  const becarios_filtrados = lista_becarios.filter(
    (b) =>
      b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.ci.includes(busqueda) ||
      b.carrera.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.universidad.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarGuardarBecario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo_nombre.trim() || !nuevo_ci.trim()) return;

    const nuevo: BecarioVista = {
      id: lista_becarios.length + 1,
      nombre: nuevo_nombre,
      ci: nuevo_ci,
      carrera: es_admin ? nueva_carrera || "Ingeniería de Sistemas" : "Carrera Pendiente Asignación",
      universidad: es_admin ? nueva_universidad : "UMSA",
      iglesia: es_admin ? nueva_iglesia : "Iglesia Central",
      lugar_practica: es_admin ? nuevo_lugar : "Oficina Central Bloque A",
      tutor_nombre: SUPERVISORES_INSTITUCIONALES[0].nombre,
      tutor_correo: SUPERVISORES_INSTITUCIONALES[0].correo,
      estado: "pendiente_validacion",
    };

    set_lista_becarios([nuevo, ...lista_becarios]);
    set_nuevo_nombre("");
    set_nuevo_ci("");
    set_nueva_carrera("");
    set_modal_abierto(false);
    toast.success("Becario registrado exitosamente con estado Pendiente Validación.");
  };

  const abrirModalAsignarSupervisor = (becario: BecarioVista) => {
    if (!es_admin) {
      toast.error("Acción restringida: Solo el Administrador puede asignar supervisores.");
      return;
    }
    set_becario_seleccionado(becario);
    set_supervisor_seleccionado(becario.tutor_nombre);
    set_modal_supervisor_abierto(true);
  };

  const manejarGuardarSupervisor = () => {
    if (!becario_seleccionado) return;

    const supervisor_encontrado = SUPERVISORES_INSTITUCIONALES.find(
      (s) => s.nombre === supervisor_seleccionado
    ) || SUPERVISORES_INSTITUCIONALES[0];

    set_lista_becarios((prev) =>
      prev.map((b) =>
        b.id === becario_seleccionado.id
          ? {
              ...b,
              tutor_nombre: supervisor_encontrado.nombre,
              tutor_correo: supervisor_encontrado.correo,
            }
          : b
      )
    );

    toast.success(
      `Supervisor ${supervisor_encontrado.nombre} asignado a ${becario_seleccionado.nombre}`
    );
    set_modal_supervisor_abierto(false);
    set_becario_seleccionado(null);
  };

  const manejarAlternarVerificacionMensual = (activar: boolean) => {
    if (!es_admin) {
      toast.error("Solo el Administrador puede emitir órdenes de verificación mensual.");
      return;
    }

    set_verificacion_mensual_activa(activar);

    if (activar) {
      set_lista_becarios((prev) =>
        prev.map((b) => ({ ...b, estado: "pendiente_validacion" }))
      );
      toast.success(
        "Orden institucional emitida: Se solicitó verificación mensual a todos los becarios.",
        {
          description:
            "El estado de los becarios ha cambiado a 'Pendiente Validación' hasta confirmación de documentos.",
        }
      );
    } else {
      toast.info("Verificación mensual cerrada o finalizada.");
    }
  };

  const manejarValidarBecario = (id: number) => {
    if (!es_admin) {
      toast.error("Solo el Administrador puede validar el estado del becario.");
      return;
    }
    set_lista_becarios((prev) =>
      prev.map((b) => (b.id === id ? { ...b, estado: "activo" } : b))
    );
    toast.success("Expediente del becario validado y marcado como Activo.");
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
      <CardHeader className="pb-4 border-b border-[#E3DCCB]/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold font-display text-[#063A6B]">
              Gestión de Becarios y Gobernanza de Expedientes
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Directorio oficial de estudiantes beneficiarios del programa BUMAND - Diaconía FRIF-IFD.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Control Institucional Exclusivo de Administrador: Solicitar Verificación Mensual */}
            {es_admin && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#063A6B]/5 border border-[#063A6B]/15">
                <Switch
                  id="switch-verificacion-mensual"
                  checked={verificacion_mensual_activa}
                  onCheckedChange={manejarAlternarVerificacionMensual}
                />
                <Label
                  htmlFor="switch-verificacion-mensual"
                  className="text-xs font-semibold text-[#063A6B] cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#17B4C4]" />
                  Solicitar Verificación Mensual de Datos
                </Label>
              </div>
            )}

            <Dialog open={modal_abierto} onOpenChange={set_modal_abierto}>
              {/* @ts-ignore */}
              <DialogTrigger asChild>
                <Button className="h-10 px-4 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" />
                  Nuevo Becario
                </Button>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
              >
                <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
                  <DialogTitle className="text-lg font-bold text-[#063A6B]">
                    Registrar Nuevo Becario BUMAND
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={manejarGuardarBecario} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                    {!es_admin && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Gobernanza activa: Los campos <strong>Universidad</strong>, <strong>Carrera</strong>, <strong>Iglesia</strong> y <strong>Sede</strong> están bloqueados para roles no administradores.
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label htmlFor="nombre_completo" className="text-xs font-semibold text-[#122029]">
                        Nombre Completo
                      </Label>
                      <Input
                        id="nombre_completo"
                        placeholder="Ej. Juan Pérez Mamani"
                        value={nuevo_nombre}
                        onChange={(e) => set_nuevo_nombre(e.target.value)}
                        required
                        className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="ci_num" className="text-xs font-semibold text-[#122029]">
                          Cédula de Identidad (C.I.)
                        </Label>
                        <Input
                          id="ci_num"
                          placeholder="12345678"
                          value={nuevo_ci}
                          onChange={(e) => set_nuevo_ci(e.target.value)}
                          required
                          className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="univ" className="text-xs font-semibold text-[#122029]">
                            Universidad
                          </Label>
                          {!es_admin && (
                            <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                              Solo Admin
                            </Badge>
                          )}
                        </div>
                        <Select
                          value={nueva_universidad}
                          onValueChange={(v) => v && set_nueva_universidad(v)}
                          disabled={!es_admin}
                        >
                          <SelectTrigger className="h-10 border-[#E3DCCB] disabled:opacity-60 disabled:bg-slate-100">
                            <SelectValue placeholder="Universidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UMSA">UMSA</SelectItem>
                            <SelectItem value="UPEA">UPEA</SelectItem>
                            <SelectItem value="UCB">UCB</SelectItem>
                            <SelectItem value="UNIVALLE">UNIVALLE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="carrera_txt" className="text-xs font-semibold text-[#122029]">
                          Carrera
                        </Label>
                        {!es_admin && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                            Solo Admin
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="carrera_txt"
                        placeholder="Ej. Ingeniería de Sistemas"
                        value={nueva_carrera}
                        onChange={(e) => set_nueva_carrera(e.target.value)}
                        disabled={!es_admin}
                        required={es_admin}
                        className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4] disabled:opacity-60 disabled:bg-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="iglesia_txt" className="text-xs font-semibold text-[#122029]">
                          Iglesia Congregacional
                        </Label>
                        {!es_admin && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                            Solo Admin
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="iglesia_txt"
                        placeholder="Ej. Iglesia Bautista Central El Alto"
                        value={nueva_iglesia}
                        onChange={(e) => set_nueva_iglesia(e.target.value)}
                        disabled={!es_admin}
                        required={es_admin}
                        className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4] disabled:opacity-60 disabled:bg-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="lugar_sel" className="text-xs font-semibold text-[#122029]">
                          Sede / Lugar de Práctica Asignado
                        </Label>
                        {!es_admin && (
                          <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                            Solo Admin
                          </Badge>
                        )}
                      </div>
                      <Select
                        value={nuevo_lugar}
                        onValueChange={(v) => v && set_nuevo_lugar(v)}
                        disabled={!es_admin}
                      >
                        <SelectTrigger className="h-10 border-[#E3DCCB] disabled:opacity-60 disabled:bg-slate-100">
                          <SelectValue placeholder="Seleccionar sede" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oficina Central Bloque A">Oficina Central Bloque A</SelectItem>
                          <SelectItem value="Oficina Central Bloque B">Oficina Central Bloque B</SelectItem>
                          <SelectItem value="Sucursal Juan Pablo II">Sucursal Juan Pablo II</SelectItem>
                          <SelectItem value="Sucursal Villa Adela">Sucursal Villa Adela</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </DialogBody>

                  <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => set_modal_abierto(false)}
                      className="h-10 border-[#E3DCCB] rounded-xl hover:bg-slate-100"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl shadow-sm"
                    >
                      Guardar Becario
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, CI, universidad o carrera..."
              value={busqueda}
              onChange={(e) => set_busqueda(e.target.value)}
              className="h-10 pl-9 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-10 px-3 border-[#E3DCCB] text-[#063A6B] font-mono text-xs font-bold">
              Total: {becarios_filtrados.length}
            </Badge>
            {verificacion_mensual_activa && (
              <Badge className="h-10 px-3 bg-amber-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Verificación Mensual Activa
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-[#E3DCCB]">
              <TableHead className="font-bold text-[#063A6B]">Becario</TableHead>
              <TableHead className="font-bold text-[#063A6B]">C.I.</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Carrera / Universidad</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Iglesia</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Sede Asignada</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Supervisor Asignado</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Estado</TableHead>
              <TableHead className="font-bold text-[#063A6B] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {becarios_filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron becarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              becarios_filtrados.map((b) => (
                <TableRow key={b.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 transition-colors">
                  <TableCell className="font-medium text-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-xs">
                        {b.nombre.charAt(0)}
                      </div>
                      <span className="font-semibold">{b.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                    {b.ci}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-[#1E293B]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#17B4C4]" />
                      <span>{b.carrera}</span>
                      <span className="text-muted-foreground font-semibold">({b.universidad})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Church className="w-3.5 h-3.5 text-[#063A6B]" />
                      <span>{b.iglesia}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-[#063A6B] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-[#063A6B]" />
                      <span>{b.lugar_practica}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-semibold text-[#1E293B]">{b.tutor_nombre}</p>
                      <p className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {b.tutor_correo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {b.estado === "activo" ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        ACTIVO
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-bold"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        PENDIENTE VALIDACIÓN
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {es_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModalAsignarSupervisor(b)}
                          className="h-8 px-2.5 text-xs font-bold border-[#063A6B]/30 text-[#063A6B] hover:bg-[#063A6B]/10 rounded-lg flex items-center gap-1"
                          title="Asignar Supervisor"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          Supervisor
                        </Button>
                      )}
                      {es_admin && b.estado === "pendiente_validacion" && (
                        <Button
                          size="sm"
                          onClick={() => manejarValidarBecario(b.id)}
                          className="h-8 px-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1"
                          title="Validar expediente"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal Exclusivo de Administrador: Asignar Supervisor */}
      <Dialog open={modal_supervisor_abierto} onOpenChange={set_modal_supervisor_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[440px] p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#17B4C4]" />
              Asignar Supervisor Institucional
            </DialogTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Vincular tutor responsable para seguimiento de prácticas y rúbrica semestral.
            </CardDescription>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4">
            {becario_seleccionado && (
              <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs space-y-1">
                <p className="font-bold text-[#063A6B]">{becario_seleccionado.nombre}</p>
                <p className="text-muted-foreground">
                  CI: {becario_seleccionado.ci} · {becario_seleccionado.carrera} ({becario_seleccionado.universidad})
                </p>
                <p className="text-muted-foreground font-mono text-[11px]">
                  Sede: {becario_seleccionado.lugar_practica}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="sel-supervisor" className="text-xs font-semibold text-[#122029]">
                Supervisor Responsable
              </Label>
              <Select
                value={supervisor_seleccionado}
                onValueChange={(val) => val && set_supervisor_seleccionado(val)}
              >
                <SelectTrigger id="sel-supervisor" className="h-10 border-[#E3DCCB]">
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISORES_INSTITUCIONALES.map((sup) => (
                    <SelectItem key={sup.correo} value={sup.nombre}>
                      {sup.nombre} ({sup.correo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_supervisor_abierto(false)}
              className="h-9 border-[#E3DCCB] rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={manejarGuardarSupervisor}
              className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Confirmar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
