"use client";

import React, { useState } from "react";
import {
  Utensils,
  Coffee,
  Plus,
  FileText,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  Coins,
  ShieldCheck,
  Search,
  Receipt,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  BotonJuicy,
} from "@/components/animaciones";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface RegistroRacionRefrigerio {
  id: number;
  fecha: string;
  evento_o_jornada: string;
  tipo_refrigerio: "desayuno" | "refrigerio_tarde" | "almuerzo_taller" | "especial_diaconal";
  cantidad_raciones: number;
  costo_unitario_bs: number;
  costo_total_bs: number;
  sede_nombre: string;
  bloque: string;
  responsable_entrega: string;
  estado_reposicion: "pendiente" | "solicitada" | "reembolsada";
  observaciones?: string;
}

const REGISTROS_REFRIGERIOS_INICIALES: RegistroRacionRefrigerio[] = [
  {
    id: 1,
    fecha: "2026-10-09",
    evento_o_jornada: "Viernes Formativo y Encuentro Diaconal",
    tipo_refrigerio: "refrigerio_tarde",
    cantidad_raciones: 28,
    costo_unitario_bs: 15.0,
    costo_total_bs: 420.0,
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque B (Auditorio)",
    responsable_entrega: "Angel Javier Ali Paz",
    estado_reposicion: "reembolsada",
    observaciones: "Empanadas de queso horneadas y yogurt probiótico para becarios.",
  },
  {
    id: 2,
    fecha: "2026-10-02",
    evento_o_jornada: "Taller de Inducción y Registro de Horas",
    tipo_refrigerio: "desayuno",
    cantidad_raciones: 24,
    costo_unitario_bs: 12.5,
    costo_total_bs: 300.0,
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque A (Administración)",
    responsable_entrega: "Claudia Cabrera",
    estado_reposicion: "reembolsada",
    observaciones: "Sándwich de pavo con jugo de naranja natural.",
  },
  {
    id: 3,
    fecha: "2026-09-25",
    evento_o_jornada: "Jornada de Prácticas y Confraternización",
    tipo_refrigerio: "almuerzo_taller",
    cantidad_raciones: 30,
    costo_unitario_bs: 22.0,
    costo_total_bs: 660.0,
    sede_nombre: "Agencia Juan Pablo II",
    bloque: "Bloque A",
    responsable_entrega: "Rodrigo Solorzano",
    estado_reposicion: "solicitada",
    observaciones: "Almuerzo completo con postre y fruta para jornada extendida.",
  },
  {
    id: 4,
    fecha: "2026-09-18",
    evento_o_jornada: "Viernes de Capacitación en TIC y Liderazgo",
    tipo_refrigerio: "refrigerio_tarde",
    cantidad_raciones: 26,
    costo_unitario_bs: 15.0,
    costo_total_bs: 390.0,
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque B (Auditorio)",
    responsable_entrega: "Angel Javier Ali Paz",
    estado_reposicion: "pendiente",
    observaciones: "Refrigerio de media tarde adquirido según orden institucional.",
  },
];

export function ControlRefrigerios() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const [registros, set_registros] = useState<RegistroRacionRefrigerio[]>(
    REGISTROS_REFRIGERIOS_INICIALES
  );
  const [busqueda, set_busqueda] = useState("");
  const [modal_nuevo_abierto, set_modal_nuevo_abierto] = useState(false);
  const [planilla_seleccionada, set_planilla_seleccionada] = useState<RegistroRacionRefrigerio | null>(
    null
  );

  // Formulario nuevo refrigerio
  const [nueva_fecha, set_nueva_fecha] = useState("2026-10-12");
  const [nuevo_evento, set_nuevo_evento] = useState("");
  const [nuevo_tipo, set_nuevo_tipo] = useState<
    "desayuno" | "refrigerio_tarde" | "almuerzo_taller" | "especial_diaconal"
  >("refrigerio_tarde");
  const [nueva_cantidad, set_nueva_cantidad] = useState("25");
  const [nuevo_costo_unitario, set_nuevo_costo_unitario] = useState("15.00");
  const [nueva_sede, set_nueva_sede] = useState("Oficina Central El Alto");
  const [nuevo_bloque, set_nuevo_bloque] = useState("Bloque B (Auditorio)");
  const [nuevo_responsable, set_nuevo_responsable] = useState(
    usuario?.nombre || "Angel Javier Ali Paz"
  );
  const [nuevas_observaciones, set_nuevas_observaciones] = useState("");

  // Métricas dinámicas
  const total_raciones = registros.reduce((acc, r) => acc + r.cantidad_raciones, 0);
  const costo_total_acumulado = registros.reduce((acc, r) => acc + r.costo_total_bs, 0);
  const raciones_pendientes = registros.filter((r) => r.estado_reposicion === "pendiente").length;
  const fondo_multas_aplicado = 850.0; // Fondo transferido de multas de viernes

  const registros_filtrados = registros.filter(
    (r) =>
      r.evento_o_jornada.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.sede_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.responsable_entrega.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarGuardarRefrigerio = (e: React.FormEvent) => {
    e.preventDefault();
    const cant = parseInt(nueva_cantidad, 10) || 1;
    const precio_u = parseFloat(nuevo_costo_unitario) || 15.0;
    const costo_t = cant * precio_u;

    const nuevo: RegistroRacionRefrigerio = {
      id: registros.length + 1,
      fecha: nueva_fecha,
      evento_o_jornada: nuevo_evento || "Jornada de Prácticas Institucionales",
      tipo_refrigerio: nuevo_tipo,
      cantidad_raciones: cant,
      costo_unitario_bs: precio_u,
      costo_total_bs: costo_t,
      sede_nombre: nueva_sede,
      bloque: nuevo_bloque,
      responsable_entrega: nuevo_responsable,
      estado_reposicion: "pendiente",
      observaciones: nuevas_observaciones,
    };

    set_registros([nuevo, ...registros]);
    set_nuevo_evento("");
    set_nuevas_observaciones("");
    set_modal_nuevo_abierto(false);
    toast.success(`Registro de ${cant} raciones de refrigerio guardado con éxito.`);
  };

  const manejarSolicitarReposicion = (id: number) => {
    set_registros((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, estado_reposicion: "solicitada" } : r
      )
    );
    toast.success("Planilla de reposición institucional enviada para liquidación administrativa.");
  };

  const manejarDescargarPlanillaHtml = (reg: RegistroRacionRefrigerio) => {
    const contenido_html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Planilla Oficial de Reposición de Refrigerios - BUMAND</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #063A6B; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { margin: 0; color: #063A6B; font-size: 20px; text-transform: uppercase; }
          .header h2 { margin: 4px 0; color: #5B6D77; font-size: 13px; font-weight: normal; }
          .datos-tabla { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          .datos-tabla th, .datos-tabla td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
          .datos-tabla th { background-color: #F8FAFC; color: #063A6B; }
          .totales { margin-top: 20px; text-align: right; font-size: 14px; font-weight: bold; color: #063A6B; }
          .firmas { margin-top: 60px; display: flex; justify-content: space-around; text-align: center; font-size: 11px; }
          .firma-linea { border-top: 1px solid #64748B; width: 200px; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Diaconía FRIF - IFD · Programa BUMAND</h1>
          <h2>PLANILLA OFICIAL DE REPOSICIÓN Y RENDICIÓN DE REFRIGERIOS INSTITUCIONALES</h2>
          <p style="font-size: 11px; color: #64748B; margin: 2px;">Correlativo: REP-${reg.id.toString().padStart(4, "0")} · Gestión 2026</p>
        </div>

        <table class="datos-tabla">
          <tr>
            <th>Fecha del Evento:</th>
            <td>${reg.fecha}</td>
            <th>Sede / Bloque:</th>
            <td>${reg.sede_nombre} - ${reg.bloque}</td>
          </tr>
          <tr>
            <th>Evento / Jornada:</th>
            <td>${reg.evento_o_jornada}</td>
            <th>Tipo de Ración:</th>
            <td>${reg.tipo_refrigerio.replace("_", " ").toUpperCase()}</td>
          </tr>
          <tr>
            <th>Raciones Distribuidas:</th>
            <td><strong>${reg.cantidad_raciones} estudiantes</strong></td>
            <th>Costo Unitario:</th>
            <td>Bs ${reg.costo_unitario_bs.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Responsable de Entrega:</th>
            <td>${reg.responsable_entrega}</td>
            <th>Estado de Descargo:</th>
            <td>${reg.estado_reposicion.toUpperCase()}</td>
          </tr>
          <tr>
            <th>Observaciones:</th>
            <td colspan="3">${reg.observaciones || "Conforme a lista de asistencia y rúbricas de recepción de los estudiantes becarios."}</td>
          </tr>
        </table>

        <div class="totales">
          IMPORTE TOTAL A REINTEGRAR: Bs ${reg.costo_total_bs.toFixed(2)}
        </div>

        <div class="firmas">
          <div>
            <div class="firma-linea">
              <strong>${reg.responsable_entrega}</strong><br/>
              Supervisor / Responsable de Entrega
            </div>
          </div>
          <div>
            <div class="firma-linea">
              <strong>Lic. Administración y Finanzas</strong><br/>
              Firma y Sello de Autorización
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([contenido_html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `Planilla_Reposicion_Refrigerio_${reg.id}.html`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

    toast.success("Planilla de reposición descargada para impresión y descargo contable.");
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold font-display text-[#063A6B]">
              Control y Liquidación de Refrigerios Institucionales
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestión y descargo de raciones alimentarias entregadas a becarios en jornadas de formación, prácticas y viernes de liderazgo.
          </p>
        </div>

        <Dialog open={modal_nuevo_abierto} onOpenChange={set_modal_nuevo_abierto}>
          <DialogTrigger asChild>
            <div>
              <BotonJuicy variante="primario" tamaño="md">
                <Plus className="w-4 h-4" />
                <span>Registrar Entrega de Refrigerios</span>
              </BotonJuicy>
            </div>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E3DCCB] rounded-2xl shadow-2xl"
          >
            <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA]">
              <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#17B4C4]" />
                Registrar Raciones de Refrigerio
              </DialogTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Descargo oficial de raciones entregadas por evento o fecha institucional.
              </CardDescription>
            </DialogHeader>

            <form onSubmit={manejarGuardarRefrigerio} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Fecha de Entrega</Label>
                    <Input
                      type="date"
                      value={nueva_fecha}
                      onChange={(e) => set_nueva_fecha(e.target.value)}
                      required
                      className="h-9 text-xs border-[#E3DCCB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Tipo de Refrigerio</Label>
                    <Select
                      value={nuevo_tipo}
                      onValueChange={(val: any) => val && set_nuevo_tipo(val)}
                    >
                      <SelectTrigger className="h-9 text-xs border-[#E3DCCB]">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desayuno">Desayuno Nutritivo</SelectItem>
                        <SelectItem value="refrigerio_tarde">Refrigerio de Tarde</SelectItem>
                        <SelectItem value="almuerzo_taller">Almuerzo de Taller</SelectItem>
                        <SelectItem value="especial_diaconal">Especial Diaconal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Evento o Jornada Vinculada</Label>
                  <Input
                    placeholder="Ej. Encuentro de Liderazgo y Acción Diaconal"
                    value={nuevo_evento}
                    onChange={(e) => set_nuevo_evento(e.target.value)}
                    required
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Cantidad de Raciones</Label>
                    <Input
                      type="number"
                      min={1}
                      value={nueva_cantidad}
                      onChange={(e) => set_nueva_cantidad(e.target.value)}
                      required
                      className="h-9 text-xs font-mono border-[#E3DCCB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Costo Unitario (Bs)</Label>
                    <Input
                      type="number"
                      step="0.50"
                      min={1}
                      value={nuevo_costo_unitario}
                      onChange={(e) => set_nuevo_costo_unitario(e.target.value)}
                      required
                      className="h-9 text-xs font-mono border-[#E3DCCB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Sede Institucional</Label>
                    <Select value={nueva_sede} onValueChange={(val) => val && set_nueva_sede(val)}>
                      <SelectTrigger className="h-9 text-xs border-[#E3DCCB]">
                        <SelectValue placeholder="Sede" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Oficina Central El Alto">Oficina Central El Alto</SelectItem>
                        <SelectItem value="Agencia Juan Pablo II">Agencia Juan Pablo II</SelectItem>
                        <SelectItem value="Agencia La Paz Central">Agencia La Paz Central</SelectItem>
                        <SelectItem value="Sucursal Villa Adela">Sucursal Villa Adela</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Bloque</Label>
                    <Select value={nuevo_bloque} onValueChange={(val) => val && set_nuevo_bloque(val)}>
                      <SelectTrigger className="h-9 text-xs border-[#E3DCCB]">
                        <SelectValue placeholder="Bloque" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bloque A (Administración)">Bloque A (Administración)</SelectItem>
                        <SelectItem value="Bloque B (Auditorio)">Bloque B (Auditorio)</SelectItem>
                        <SelectItem value="Bloque Único">Bloque Único</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Supervisor / Responsable de Entrega</Label>
                  <Input
                    value={nuevo_responsable}
                    onChange={(e) => set_nuevo_responsable(e.target.value)}
                    required
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Observaciones / Menú Detallado</Label>
                  <Textarea
                    placeholder="Detalle de los alimentos entregados a los becarios..."
                    value={nuevas_observaciones}
                    onChange={(e) => set_nuevas_observaciones(e.target.value)}
                    rows={2}
                    className="text-xs border-[#E3DCCB] rounded-xl"
                  />
                </div>
              </DialogBody>

              <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 flex justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => set_modal_nuevo_abierto(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl text-xs h-9 font-bold shadow-sm"
                >
                  Guardar Entrega
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarjetas de Métricas Ejecutivas de Refrigerios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaSpotlight
          color_luz="rgba(23, 180, 196, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Raciones Entregadas
          </span>
          <div className="text-3xl font-bold font-display text-[#063A6B]">
            <ContadorRodilloAnimado valor={total_raciones} sufijo=" raciones" />
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">100% estudiantes beneficiarios</p>
        </TarjetaSpotlight>

        <TarjetaSpotlight
          color_luz="rgba(6, 58, 107, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Costo Total Devengado
          </span>
          <div className="text-3xl font-bold font-display text-[#063A6B]">
            Bs <ContadorRodilloAnimado valor={Math.round(costo_total_acumulado)} />
          </div>
          <p className="text-[11px] text-muted-foreground">Promedio: Bs 15.00 por ración</p>
        </TarjetaSpotlight>

        <TarjetaSpotlight
          color_luz="rgba(248, 199, 102, 0.2)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-[#063A6B] flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-[#F8C766]" />
            Aporte de Fondo Multas
          </span>
          <div className="text-3xl font-bold font-display text-[#F8C766]">
            Bs {fondo_multas_aplicado.toFixed(2)}
          </div>
          <p className="text-[11px] text-muted-foreground">Recaudación de viernes reinvertida</p>
        </TarjetaSpotlight>

        <TarjetaSpotlight
          color_luz="rgba(226, 105, 75, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Planillas Pendientes
          </span>
          <div className="text-3xl font-bold font-display text-amber-600">
            <ContadorRodilloAnimado valor={raciones_pendientes} sufijo=" planillas" />
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Requieren descargo y firma</p>
        </TarjetaSpotlight>
      </div>

      {/* Barra de Filtro y Búsqueda */}
      <div className="p-4 bg-white rounded-2xl border border-[#E3DCCB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por jornada, sede o responsable..."
            value={busqueda}
            onChange={(e) => set_busqueda(e.target.value)}
            className="pl-9 text-xs rounded-xl border-[#E3DCCB] h-10 bg-slate-50/50"
          />
        </div>
        <Badge variant="outline" className="text-xs font-mono border-[#17B4C4] text-[#063A6B]">
          {registros_filtrados.length} Registros de Raciones
        </Badge>
      </div>

      {/* Tabla de Registros de Refrigerios */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E3DCCB]/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#063A6B]">
              Historial de Raciones Entregadas y Estado de Reposición
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#E3DCCB]/50">
            {registros_filtrados.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-sm shrink-0">
                    <Coffee className="w-5 h-5 text-[#063A6B]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#063A6B]">
                        {item.evento_o_jornada}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono border-[#E3DCCB]">
                        {item.tipo_refrigerio.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-[#1E293B]">
                        <Building className="w-3.5 h-3.5 text-[#063A6B]" />
                        {item.sede_nombre} ({item.bloque})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3" /> {item.fecha}
                      </span>
                      <span>·</span>
                      <span className="text-muted-foreground">Resp: {item.responsable_entrega}</span>
                    </div>
                    {item.observaciones && (
                      <p className="text-[11px] text-muted-foreground italic">{item.observaciones}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                  <div className="text-left sm:text-right space-y-0.5 font-mono">
                    <div className="text-xs font-bold text-[#063A6B]">
                      {item.cantidad_raciones} raciones x Bs {item.costo_unitario_bs.toFixed(2)}
                    </div>
                    <div className="text-sm font-bold text-[#E2694B]">
                      Total: Bs {item.costo_total_bs.toFixed(2)}
                    </div>
                  </div>

                  {/* Estado de Reposición */}
                  <div className="min-w-[120px] text-right">
                    {item.estado_reposicion === "reembolsada" && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reembolsada
                      </Badge>
                    )}
                    {item.estado_reposicion === "solicitada" && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs gap-1">
                        <Clock className="w-3 h-3" /> Solicitada
                      </Badge>
                    )}
                    {item.estado_reposicion === "pendiente" && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1">
                        <Receipt className="w-3 h-3" /> Pendiente Descargo
                      </Badge>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => set_planilla_seleccionada(item)}
                      className="h-8 px-2.5 text-xs border-[#17B4C4] text-[#063A6B] rounded-lg font-bold flex items-center gap-1"
                      title="Ver Planilla Oficial"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Planilla
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => manejarDescargarPlanillaHtml(item)}
                      className="h-8 px-2 text-xs rounded-lg hover:bg-slate-100 text-[#063A6B]"
                      title="Descargar Descargo HTML/PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualizador de Planilla Oficial de Reposición */}
      {planilla_seleccionada && (
        <Dialog
          open={Boolean(planilla_seleccionada)}
          onOpenChange={(abierto) => !abierto && set_planilla_seleccionada(null)}
        >
          <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E3DCCB] shadow-2xl">
            <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
              <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Planilla de Reposición Institucional de Refrigerios
              </DialogTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Documento oficial de descargo diaconal para reintegro de fondos.
              </CardDescription>
            </DialogHeader>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#063A6B]">
                    {planilla_seleccionada.evento_o_jornada}
                  </span>
                  <Badge className="font-mono text-[10px] bg-[#063A6B] text-white">
                    REP-{planilla_seleccionada.id.toString().padStart(4, "0")}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Fecha de Ejecución:</span>
                    <strong className="text-slate-800">{planilla_seleccionada.fecha}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sede y Bloque:</span>
                    <strong className="text-slate-800">
                      {planilla_seleccionada.sede_nombre} ({planilla_seleccionada.bloque})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cantidad Entregada:</span>
                    <strong className="text-slate-800">
                      {planilla_seleccionada.cantidad_raciones} raciones
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Costo Unitario:</span>
                    <strong className="text-slate-800">
                      Bs {planilla_seleccionada.costo_unitario_bs.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[#063A6B] to-[#0a4d8a] text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono text-[#7FE0E6] block font-bold">
                    Importe Total a Reponer
                  </span>
                  <span className="text-2xl font-bold font-display text-[#F8C766]">
                    Bs {planilla_seleccionada.costo_total_bs.toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-xs text-white/80">
                  <p>Certificado por:</p>
                  <p className="font-bold text-white">{planilla_seleccionada.responsable_entrega}</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <p className="font-semibold">Nota Institucional:</p>
                <p className="text-[11px] mt-0.5">
                  Las raciones fueron cotejadas contra la lista de asistencia geocercada y presencial de los becarios universitarios.
                </p>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => set_planilla_seleccionada(null)}
                className="rounded-xl text-xs"
              >
                Cerrar
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => manejarDescargarPlanillaHtml(planilla_seleccionada)}
                  className="rounded-xl text-xs border-[#17B4C4] text-[#063A6B] font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Planilla
                </Button>
                {planilla_seleccionada.estado_reposicion === "pendiente" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      manejarSolicitarReposicion(planilla_seleccionada.id);
                      set_planilla_seleccionada(null);
                    }}
                    className="rounded-xl text-xs bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold"
                  >
                    Solicitar Reposición
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
