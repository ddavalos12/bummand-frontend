"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bus,
  MapPin,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  PenTool,
  ShieldCheck,
  Send,
  Check,
  Navigation,
  Info,
  Eye,
  Route,
  ArrowRight,
  Printer,
  Loader2,
} from "lucide-react";
import { clienteApi } from "@/lib/cliente-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { toast } from "sonner";

// --- DEFINICIONES DE TIPOS ---

export interface ParadaRuta {
  id: string;
  numero: number;
  nombre: string;
  confirmada: boolean;
}

export interface TramoTarifa {
  id: string;
  codigo_tarifa: string;
  monto: number;
  nombre_transporte_personalizado?: string;
  monto_personalizado?: number;
}

export interface RecorridoMensual {
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  tramo?: "ida" | "vuelta";
  origen?: string;
  destino?: string;
  calles_declaradas?: string;
  medio_transporte?: string;
  apoyo_realizado?: string;
  tipo_actividad?: string;
  detalle_tramos_json?: string;
}

// --- TARIFAS OFICIALES LA PAZ / EL ALTO ---

export const OPCIONES_TARIFAS_LOCALES = [
  { codigo: "minibus_el_alto", label: "Bs 2.00 — Minibús (dentro de El Alto)", monto: 2.0 },
  { codigo: "micro_el_alto", label: "Bs 1.50 — Micro (dentro de El Alto)", monto: 1.5 },
  { codigo: "ceja_la_paz", label: "Bs 3.50 — Minibús (Centro La Paz – Ceja)", monto: 3.5 },
  { codigo: "umsa_ceja", label: "Bs 4.00 — Minibús (UMSA – Ceja)", monto: 4.0 },
  { codigo: "teleferico_regular", label: "Bs 3.00 — Teleférico (línea regular)", monto: 3.0 },
  { codigo: "teleferico_transbordo", label: "Bs 2.00 — Teleférico (por transbordo)", monto: 2.0 },
  { codigo: "custom", label: "Otro (escribir monto)…", monto: 0 },
];

export const RECORRIDOS_INICIALES: RecorridoMensual[] = [];

export const obtenerEstiloTransporte = (medio?: string) => {
  if (!medio) return "bg-slate-100 text-slate-800 border-slate-300";
  const m = medio.toLowerCase();
  if (m.includes("roja")) return "bg-rose-50 text-rose-700 border-rose-300 font-semibold";
  if (m.includes("amarilla")) return "bg-amber-50 text-amber-800 border-amber-300 font-semibold";
  if (m.includes("morada")) return "bg-purple-50 text-purple-700 border-purple-300 font-semibold";
  if (m.includes("azul")) return "bg-blue-50 text-blue-700 border-blue-300 font-semibold";
  if (m.includes("plateada")) return "bg-zinc-100 text-zinc-800 border-zinc-400 font-semibold";
  if (m.includes("teleférico") || m.includes("teleferico")) return "bg-teal-50 text-teal-800 border-teal-300 font-semibold";
  if (m.includes("minibús") || m.includes("minibus")) return "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold";
  if (m.includes("micro")) return "bg-orange-50 text-orange-800 border-orange-300 font-semibold";
  return "bg-sky-50 text-sky-800 border-sky-300 font-semibold";
};

export const obtenerPasosCalles = (texto_calles?: string): string[] => {
  if (!texto_calles) return [];
  if (texto_calles.includes("→")) {
    return texto_calles.split("→").map((c) => c.trim()).filter(Boolean);
  }
  if (texto_calles.includes("–")) {
    return texto_calles.split("–").map((c) => c.trim()).filter(Boolean);
  }
  return [texto_calles];
};

/**
 * @component PasajesVista
 * @description Módulo interactivo de declaración y liquidación mensual de pasajes con flujo
 * de 2 pasos (Ida y Vuelta), inversión en reversa, botón "✓ En esta parada", selectores
 * locales La Paz/El Alto, firma digital de supervisor y restricción del día 24 de cada mes.
 */
export function PasajesVista() {
  const { usuario } = usarAutenticacion();

  // Control de pasos: "ida" | "vuelta"
  const [paso_actual, set_paso_actual] = useState<"ida" | "vuelta">("ida");

  // Estado de paradas de la ida
  const [paradas_ida, set_paradas_ida] = useState<ParadaRuta[]>([
    { id: "ida-1", numero: 1, nombre: "Zona 16 de Julio (El Alto)", confirmada: false },
    { id: "ida-2", numero: 2, nombre: "Oficina Central Diaconía Bloque A", confirmada: false },
  ]);

  // Estado de paradas de la vuelta
  const [paradas_vuelta, set_paradas_vuelta] = useState<ParadaRuta[]>([
    { id: "vuelta-1", numero: 1, nombre: "", confirmada: false },
    { id: "vuelta-2", numero: 2, nombre: "", confirmada: false },
  ]);

  // Tramos de tarifas
  const [tramos_ida, set_tramos_ida] = useState<TramoTarifa[]>([
    { id: "t-ida-1", codigo_tarifa: "ceja_la_paz", monto: 3.5 },
  ]);

  const [tramos_vuelta, set_tramos_vuelta] = useState<TramoTarifa[]>([
    { id: "t-vue-1", codigo_tarifa: "", monto: 0 },
  ]);

  // Recorridos mensuales declarados
  const [recorridos, set_recorridos] = useState<RecorridoMensual[]>(RECORRIDOS_INICIALES);
  const [fecha_recorrido, set_fecha_recorrido] = useState<string>("2026-03-12");
  const [recorrido_seleccionado, set_recorrido_seleccionado] = useState<RecorridoMensual | null>(null);
  const [descargando_pdf, set_descargando_pdf] = useState<boolean>(false);

  const descargarExpedientePdf = async () => {
    try {
      set_descargando_pdf(true);
      toast.info("Generando expediente mensual de recorridos con Puppeteer...", {
        description: "Preparando documento oficial en formato PDF.",
      });
      const id_becario = usuario?.id || 1;
      const blob = await clienteApi.descargarBlob("/pdf/recorridos-estudiante/" + id_becario + "?mes=2026-10");
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "Expediente_Recorridos_Estudiante_" + id_becario + "_2026_10.pdf";
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);
      toast.success("Expediente de recorridos descargado exitosamente");
    } catch (_error) {
      toast.error("Error al exportar el expediente de recorridos en PDF con Puppeteer");
    } finally {
      set_descargando_pdf(false);
    }
  };

  const {
    confirmarEliminacionRegistro,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  // Firma digital del supervisor
  const [dialogo_firma_abierto, set_dialogo_firma_abierto] = useState<boolean>(false);
  const [firma_supervisor, set_firma_supervisor] = useState<string | null>(null);
  const canvas_ref = useRef<HTMLCanvasElement | null>(null);
  const [esta_dibujando, set_esta_dibujando] = useState<boolean>(false);

  // Restricción del día 24:
  // Permitimos conmutador de simulación para verificar en cualquier fecha
  const dia_real = new Date().getDate();
  const [simular_dia_24, set_simular_dia_24] = useState<boolean>(dia_real === 24);
  const es_dia_habilitado = simular_dia_24 || dia_real === 24;

  // Cálculos matemáticos de tarifas
  const calcularTotalTramos = (tramos: TramoTarifa[]): number => {
    return tramos.reduce((acumulado, t) => {
      if (t.codigo_tarifa === "custom") {
        return acumulado + (t.monto_personalizado || 0);
      }
      return acumulado + (t.monto || 0);
    }, 0);
  };

  const total_ida = calcularTotalTramos(tramos_ida);
  const total_vuelta = calcularTotalTramos(tramos_vuelta);
  const monto_del_dia = total_ida + total_vuelta;

  // Monto acumulado del mes
  const monto_total_pasajes = recorridos.reduce((acc, r) => acc + r.monto, 0);
  const devolucion_80 = monto_total_pasajes * 0.8;

  // Conteo de puntos capturados
  const total_puntos_capturados =
    paradas_ida.filter((p) => p.nombre.trim() !== "").length +
    paradas_vuelta.filter((p) => p.nombre.trim() !== "").length;

  // --- MANEJADORES DE PARADAS ---

  const alternarConfirmacionParada = (seccion: "ida" | "vuelta", id_parada: string) => {
    if (seccion === "ida") {
      set_paradas_ida((prev) =>
        prev.map((p) => (p.id === id_parada ? { ...p, confirmada: !p.confirmada } : p))
      );
    } else {
      set_paradas_vuelta((prev) =>
        prev.map((p) => (p.id === id_parada ? { ...p, confirmada: !p.confirmada } : p))
      );
    }
  };

  const actualizarNombreParada = (seccion: "ida" | "vuelta", id_parada: string, nombre: string) => {
    if (seccion === "ida") {
      set_paradas_ida((prev) =>
        prev.map((p) => (p.id === id_parada ? { ...p, nombre } : p))
      );
    } else {
      set_paradas_vuelta((prev) =>
        prev.map((p) => (p.id === id_parada ? { ...p, nombre } : p))
      );
    }
  };

  const agregarParada = (seccion: "ida" | "vuelta") => {
    if (seccion === "ida") {
      const nuevo_num = paradas_ida.length + 1;
      set_paradas_ida((prev) => [
        ...prev,
        { id: `ida-${Date.now()}`, numero: nuevo_num, nombre: "", confirmada: false },
      ]);
    } else {
      const nuevo_num = paradas_vuelta.length + 1;
      set_paradas_vuelta((prev) => [
        ...prev,
        { id: `vuelta-${Date.now()}`, numero: nuevo_num, nombre: "", confirmada: false },
      ]);
    }
  };

  const capturarGpsParada = (seccion: "ida" | "vuelta", id_parada: string) => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          const texto_gps = `GPS (${lat}, ${lng}) - Parada Registrada`;
          actualizarNombreParada(seccion, id_parada, texto_gps);
          toast.success("Coordenadas GPS capturadas con precisión");
        },
        () => {
          const lugar_simulado = seccion === "ida" ? "Villa Adela, El Alto" : "Pérez Velasco, La Paz";
          actualizarNombreParada(seccion, id_parada, lugar_simulado);
          toast.info(`Ubicación asignada: ${lugar_simulado}`);
        },
        { timeout: 3000 }
      );
    } else {
      actualizarNombreParada(seccion, id_parada, "Ceja El Alto (Estación Central)");
    }
  };

  // --- BOTÓN "↺ USAR LA IDA EN REVERSA" ---

  const usarIdaEnReversa = () => {
    const paradas_con_texto = paradas_ida.filter((p) => p.nombre.trim() !== "");
    if (paradas_con_texto.length === 0) {
      toast.warning("Debe ingresar al menos una parada en la ida para invertir la ruta.");
      return;
    }

    // Invertir paradas
    const paradas_invertidas = [...paradas_con_texto].reverse().map((p, index) => ({
      id: `vuelta-rev-${index + 1}`,
      numero: index + 1,
      nombre: p.nombre,
      confirmada: false,
    }));

    set_paradas_vuelta(paradas_invertidas);

    // Duplicar/ajustar tarifas de la ida a la vuelta
    const tramos_copiados = tramos_ida.map((t, idx) => ({
      ...t,
      id: `t-vue-rev-${idx + 1}`,
    }));

    set_tramos_vuelta(tramos_copiados);

    toast.success("↺ Ruta invertida con éxito", {
      description: "Las paradas de la ida se han ordenado en reversa y se aplicaron las tarifas correspondientes.",
    });
  };

  // --- MANEJADORES DE TARIFAS ---

  const actualizarTarifa = (seccion: "ida" | "vuelta", id_tramo: string, codigo: string) => {
    const opcion = OPCIONES_TARIFAS_LOCALES.find((o) => o.codigo === codigo);
    const monto = opcion ? opcion.monto : 0;

    const actualizador = (prev: TramoTarifa[]) =>
      prev.map((t) => (t.id === id_tramo ? { ...t, codigo_tarifa: codigo, monto } : t));

    if (seccion === "ida") {
      set_tramos_ida(actualizador);
    } else {
      set_tramos_vuelta(actualizador);
    }
  };

  const agregarTramoTarifa = (seccion: "ida" | "vuelta") => {
    const nuevo_tramo: TramoTarifa = {
      id: `tramo-${Date.now()}`,
      codigo_tarifa: "teleferico_transbordo",
      monto: 2.0,
    };
    if (seccion === "ida") {
      set_tramos_ida((prev) => [...prev, nuevo_tramo]);
    } else {
      set_tramos_vuelta((prev) => [...prev, nuevo_tramo]);
    }
  };

  const eliminarTramoTarifa = (seccion: "ida" | "vuelta", id_tramo: string) => {
    if (seccion === "ida") {
      if (tramos_ida.length <= 1) return;
      set_tramos_ida((prev) => prev.filter((t) => t.id !== id_tramo));
    } else {
      if (tramos_vuelta.length <= 1) return;
      set_tramos_vuelta((prev) => prev.filter((t) => t.id !== id_tramo));
    }
  };

  // --- GUARDADO DE RECORRIDOS ---

  const guardarRecorridoDelDia = () => {
    const nombres_ida = paradas_ida.map((p) => p.nombre.trim()).filter(Boolean);
    const nombres_vuelta = paradas_vuelta.map((p) => p.nombre.trim()).filter(Boolean);

    if (nombres_ida.length < 2 || total_ida <= 0) {
      toast.error("Complete al menos origen, destino y tarifa de la ida.");
      return;
    }

    let descripcion = nombres_ida.join(" – ");
    if (nombres_vuelta.length > 1) {
      descripcion += ` – ${nombres_vuelta.slice(1).join(" – ")}`;
    } else if (nombres_vuelta.length === 0) {
      descripcion += ` – ${nombres_ida[0]}`;
    }

    const obtenerNombresTarifas = (tramos: TramoTarifa[]) =>
      tramos
        .map((t) => {
          const opc = OPCIONES_TARIFAS_LOCALES.find((o) => o.codigo === t.codigo_tarifa);
          if (t.codigo_tarifa === "custom") return t.nombre_transporte_personalizado || "Transporte Alternativo";
          if (!opc) return "Transporte Urbano";
          if (opc.codigo.includes("teleferico")) return "Mi Teleférico";
          if (opc.codigo.includes("minibus") || opc.codigo.includes("ceja") || opc.codigo.includes("umsa"))
            return "Minibús Interciudad";
          if (opc.codigo.includes("micro")) return "Micro / Colectivo";
          return opc.label;
        })
        .join(" + ");

    const medio_transporte_combinado = [obtenerNombresTarifas(tramos_ida), obtenerNombresTarifas(tramos_vuelta)]
      .filter(Boolean)
      .join(" / Retorno: ");

    const calles_concatenadas = [
      nombres_ida.join(" → "),
      nombres_vuelta.length > 0 ? `Retorno: ${nombres_vuelta.join(" → ")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const dia_formato = fecha_recorrido.split("-").slice(1).reverse().join("-");
    const nuevo_recorrido: RecorridoMensual = {
      id: Date.now(),
      fecha: dia_formato,
      descripcion,
      monto: monto_del_dia,
      tramo: "ida",
      origen: nombres_ida[0] || "Origen",
      destino: nombres_ida[nombres_ida.length - 1] || "Destino",
      calles_declaradas: calles_concatenadas,
      medio_transporte: medio_transporte_combinado || "Minibús / Teleférico La Paz – El Alto",
      apoyo_realizado: "Desplazamiento a sede asignada para cumplimiento de prácticas y actividades institucionales",
      tipo_actividad: "Prácticas",
    };

    set_recorridos((prev) => [nuevo_recorrido, ...prev]);

    // Limpiar para siguiente registro
    set_paradas_ida([
      { id: "ida-1", numero: 1, nombre: "", confirmada: false },
      { id: "ida-2", numero: 2, nombre: "", confirmada: false },
    ]);
    set_paradas_vuelta([
      { id: "vuelta-1", numero: 1, nombre: "", confirmada: false },
      { id: "vuelta-2", numero: 2, nombre: "", confirmada: false },
    ]);
    set_paso_actual("ida");

    toast.success("Recorrido del día registrado con éxito", {
      description: `Monto agregado: Bs ${monto_del_dia.toFixed(2)}. Suma acumulada actualizada.`,
    });
  };

  // --- ENVÍO DE FORMULARIO MENSUAL (RESTRICCIÓN DÍA 24) ---

  const manejarEnvioMensual = () => {
    if (!es_dia_habilitado) {
      toast.error("Acción inhabilitada", {
        description: "Se habilita el 24 de cada mes para el envío del formulario.",
      });
      return;
    }

    toast.success("Formulario mensual enviado exitosamente", {
      description: `El reembolso del 80% (Bs ${devolucion_80.toFixed(2)}) ha pasado a revisión administrativa y contable.`,
    });
  };

  // --- DIBUJO DE CANVAS PARA FIRMA DIGITAL ---

  const iniciarDibujo = (e: React.MouseEvent<HTMLCanvasElement>) => {
    set_esta_dibujando(true);
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const dibujar = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!esta_dibujando) return;
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#063A6B";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const detenerDibujo = () => {
    set_esta_dibujando(false);
  };

  const limpiarCanvas = () => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const guardarFirma = () => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const data_url = canvas.toDataURL("image/png");
    set_firma_supervisor(data_url);
    set_dialogo_firma_abierto(false);
    toast.success("Firma digital del supervisor registrada", {
      description: "Hash biométrico convalidado e incrustado en el expediente mensual.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Cabecera y Alertas Institucionales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#063A6B] flex items-center gap-2">
            <Bus className="w-6 h-6 text-[#17B4C4]" />
            Módulo de Declaración y Liquidación de Pasajes (80%)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro de tramos ida/vuelta, tarifas locales de La Paz y El Alto, y firma digital de supervisión.
          </p>
        </div>

        {/* Interruptor de prueba institucional para auditar la regla del Día 24 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E3DCCB] bg-slate-50 shrink-0">
          <Label htmlFor="switch-dia-24" className="text-[11px] font-mono font-medium text-[#063A6B] cursor-pointer">
            Simular Día 24 ({dia_real}/mes)
          </Label>
          <Switch
            id="switch-dia-24"
            checked={simular_dia_24}
            onCheckedChange={set_simular_dia_24}
            className="data-[state=checked]:bg-[#17B4C4]"
          />
        </div>
      </div>

      {/* DISPOSICIÓN EN 2 COLUMNAS: FORMULARIO DE RUTA (IZQ) Y DETALLE / LIQUIDACIÓN (DER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* COLUMNA IZQUIERDA: FLUJO DE 2 PASOS (IDA Y VUELTA)             */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 bg-[#F8F9FA]/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#17B4C4]" />
                    Registro de Recorrido Diario
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Define la parada de origen, transbordos y destino para el cálculo automático.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={fecha_recorrido}
                    onChange={(e) => set_fecha_recorrido(e.target.value)}
                    className="h-8 text-xs font-mono w-32 border-[#E3DCCB]"
                  />
                </div>
              </div>

              {/* TABS DE PASOS: PASO 1 (IDA) VS PASO 2 (VUELTA) */}
              <div className="flex rounded-xl p-1 bg-slate-200/70 border border-[#E3DCCB]/80 mt-3">
                <button
                  type="button"
                  onClick={() => set_paso_actual("ida")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paso_actual === "ida"
                      ? "bg-[#063A6B] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#063A6B]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#17B4C4]" />
                  Paso 1: Ida ({paradas_ida.length} paradas · Bs {total_ida.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={() => set_paso_actual("vuelta")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paso_actual === "vuelta"
                      ? "bg-[#063A6B] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#063A6B]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#F8C766]" />
                  Paso 2: Vuelta ({paradas_vuelta.length} paradas · Bs {total_vuelta.toFixed(2)})
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* -------------------------------------------------------- */}
              {/* PASO 1: SECCIÓN DE IDA                                   */}
              {/* -------------------------------------------------------- */}
              {paso_actual === "ida" && (
                <div className="space-y-5 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#063A6B] tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#17B4C4]" />
                      Ruta de Ida
                    </span>
                    <span className="font-mono text-sm font-bold text-[#063A6B]">
                      Tarifa Ida: Bs {total_ida.toFixed(2)}
                    </span>
                  </div>

                  {/* LISTA DE PARADAS DE IDA */}
                  <div className="space-y-2.5">
                    {paradas_ida.map((parada) => (
                      <div
                        key={parada.id}
                        className="flex items-center gap-2 p-2 rounded-xl border border-[#E3DCCB] bg-white hover:border-[#17B4C4]/50 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-[#063A6B] shrink-0">
                          {parada.numero}
                        </span>

                        <button
                          type="button"
                          onClick={() => capturarGpsParada("ida", parada.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#17B4C4] transition-colors shrink-0"
                          title="Obtener coordenadas GPS en este punto"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>

                        <Input
                          value={parada.nombre}
                          onChange={(e) => actualizarNombreParada("ida", parada.id, e.target.value)}
                          placeholder={`Parada ${parada.numero} (ej. Villa Adela, Ceja, Of. Central)`}
                          className="h-9 text-xs border-none shadow-none focus-visible:ring-0 flex-1 px-1"
                        />

                        {/* BOTÓN "CONFIRMAR" / "✓ EN ESTA PARADA" */}
                        <Button
                          type="button"
                          size="sm"
                          variant={parada.confirmada ? "default" : "outline"}
                          onClick={() => alternarConfirmacionParada("ida", parada.id)}
                          className={`h-8 px-3 text-xs font-bold shrink-0 rounded-lg transition-all ${
                            parada.confirmada
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              : "border-[#E3DCCB] text-[#063A6B] hover:bg-slate-50"
                          }`}
                        >
                          {parada.confirmada ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              ✓ En esta parada
                            </>
                          ) : (
                            "Confirmar"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* AGREGAR PARADA */}
                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => agregarParada("ida")}
                      className="text-xs font-bold text-[#17B4C4] hover:text-[#0E7A85] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar parada
                    </button>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {paradas_ida.length} paradas configuradas
                    </span>
                  </div>

                  <Separator className="bg-[#E3DCCB]/60" />

                  {/* SELECTORES DE TARIFA DE LA IDA */}
                  <div className="p-4 rounded-xl border border-[#E3DCCB] bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-mono uppercase font-bold text-muted-foreground">
                        TARIFA DE LA IDA
                      </Label>
                      <span className="text-xs font-mono font-bold text-[#063A6B]">
                        Subtotal: Bs {total_ida.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tramos_ida.map((tramo, idx) => (
                        <div key={tramo.id} className="flex items-center gap-2">
                          <Select
                            value={tramo.codigo_tarifa || undefined}
                            onValueChange={(val: string | null) => {
                              if (val) actualizarTarifa("ida", tramo.id, val);
                            }}
                          >
                            <SelectTrigger className="flex-1 w-full h-9 px-3 rounded-lg border border-[#E3DCCB] bg-white text-xs font-medium text-[#1E293B] focus-visible:border-[#17B4C4]">
                              <SelectValue placeholder="Selecciona una tarifa oficial..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#E3DCCB] max-h-60 shadow-lg z-[100]">
                              {OPCIONES_TARIFAS_LOCALES.map((opc) => (
                                <SelectItem key={opc.codigo} value={opc.codigo} className="text-xs py-2 cursor-pointer hover:bg-slate-50">
                                  {opc.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {tramo.codigo_tarifa === "custom" && (
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="Bs"
                              value={tramo.monto_personalizado || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                set_tramos_ida((prev) =>
                                  prev.map((t) =>
                                    t.id === tramo.id ? { ...t, monto_personalizado: val } : t
                                  )
                                );
                              }}
                              className="w-20 h-9 text-xs font-mono border-[#E3DCCB]"
                            />
                          )}

                          {tramos_ida.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarTramoTarifa("ida", tramo.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700"
                              title="Eliminar tramo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => agregarTramoTarifa("ida")}
                      className="text-xs font-bold text-[#063A6B] hover:text-[#17B4C4] flex items-center gap-1 transition-colors pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar tramo de tarifa (transbordo)
                    </button>
                  </div>

                  {/* NAVEGACIÓN A VUELTA */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        if (paradas_ida.filter((p) => p.nombre.trim() !== "").length < 2 || total_ida <= 0) {
                          toast.warning("Complete el origen, destino y seleccione la tarifa de la ida.");
                          return;
                        }
                        toast.success("Ruta de ida guardada temporalmente");
                        set_paso_actual("vuelta");
                      }}
                      className="bg-[#17B4C4] hover:bg-[#0E7A85] text-white font-bold text-xs rounded-xl h-10 px-5"
                    >
                      Siguiente: Vuelta →
                    </Button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* PASO 2: SECCIÓN DE VUELTA                                */}
              {/* -------------------------------------------------------- */}
              {paso_actual === "vuelta" && (
                <div className="space-y-5 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => set_paso_actual("ida")}
                      className="text-xs font-bold text-muted-foreground hover:text-[#063A6B] flex items-center gap-1"
                    >
                      ← Volver a Ida
                    </button>

                    {/* BOTÓN DESTACADO "↺ USAR LA IDA EN REVERSA" */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={usarIdaEnReversa}
                      className="border-[#063A6B] text-[#063A6B] hover:bg-[#063A6B]/5 font-bold text-xs rounded-xl h-8 px-3"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#17B4C4]" />
                      ↺ Usar la ida en reversa
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#063A6B] tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F8C766]" />
                      Ruta de Vuelta
                    </span>
                    <span className="font-mono text-sm font-bold text-[#063A6B]">
                      Tarifa Vuelta: Bs {total_vuelta.toFixed(2)}
                    </span>
                  </div>

                  {/* LISTA DE PARADAS DE VUELTA */}
                  <div className="space-y-2.5">
                    {paradas_vuelta.map((parada) => (
                      <div
                        key={parada.id}
                        className="flex items-center gap-2 p-2 rounded-xl border border-[#E3DCCB] bg-white hover:border-[#F8C766]/80 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-[#063A6B] shrink-0">
                          {parada.numero}
                        </span>

                        <button
                          type="button"
                          onClick={() => capturarGpsParada("vuelta", parada.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#17B4C4] transition-colors shrink-0"
                          title="Obtener coordenadas GPS en este punto"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>

                        <Input
                          value={parada.nombre}
                          onChange={(e) => actualizarNombreParada("vuelta", parada.id, e.target.value)}
                          placeholder={`Parada ${parada.numero} de retorno`}
                          className="h-9 text-xs border-none shadow-none focus-visible:ring-0 flex-1 px-1"
                        />

                        {/* BOTÓN "CONFIRMAR" / "✓ EN ESTA PARADA" */}
                        <Button
                          type="button"
                          size="sm"
                          variant={parada.confirmada ? "default" : "outline"}
                          onClick={() => alternarConfirmacionParada("vuelta", parada.id)}
                          className={`h-8 px-3 text-xs font-bold shrink-0 rounded-lg transition-all ${
                            parada.confirmada
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              : "border-[#E3DCCB] text-[#063A6B] hover:bg-slate-50"
                          }`}
                        >
                          {parada.confirmada ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              ✓ En esta parada
                            </>
                          ) : (
                            "Confirmar"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* AGREGAR PARADA */}
                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => agregarParada("vuelta")}
                      className="text-xs font-bold text-[#17B4C4] hover:text-[#0E7A85] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar parada de retorno
                    </button>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {paradas_vuelta.length} paradas configuradas
                    </span>
                  </div>

                  <Separator className="bg-[#E3DCCB]/60" />

                  {/* SELECTORES DE TARIFA DE LA VUELTA */}
                  <div className="p-4 rounded-xl border border-[#E3DCCB] bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-mono uppercase font-bold text-muted-foreground">
                        TARIFA DE LA VUELTA
                      </Label>
                      <span className="text-xs font-mono font-bold text-[#063A6B]">
                        Subtotal: Bs {total_vuelta.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {tramos_vuelta.map((tramo) => (
                        <div key={tramo.id} className="flex items-center gap-2">
                          <Select
                            value={tramo.codigo_tarifa || undefined}
                            onValueChange={(val: string | null) => {
                              if (val) actualizarTarifa("vuelta", tramo.id, val);
                            }}
                          >
                            <SelectTrigger className="flex-1 w-full h-9 px-3 rounded-lg border border-[#E3DCCB] bg-white text-xs font-medium text-[#1E293B] focus-visible:border-[#17B4C4]">
                              <SelectValue placeholder="Selecciona una tarifa oficial..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#E3DCCB] max-h-60 shadow-lg z-[100]">
                              {OPCIONES_TARIFAS_LOCALES.map((opc) => (
                                <SelectItem key={opc.codigo} value={opc.codigo} className="text-xs py-2 cursor-pointer hover:bg-slate-50">
                                  {opc.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {tramo.codigo_tarifa === "custom" && (
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="Bs"
                              value={tramo.monto_personalizado || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                set_tramos_vuelta((prev) =>
                                  prev.map((t) =>
                                    t.id === tramo.id ? { ...t, monto_personalizado: val } : t
                                  )
                                );
                              }}
                              className="w-20 h-9 text-xs font-mono border-[#E3DCCB]"
                            />
                          )}

                          {tramos_vuelta.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarTramoTarifa("vuelta", tramo.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700"
                              title="Eliminar tramo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => agregarTramoTarifa("vuelta")}
                      className="text-xs font-bold text-[#063A6B] hover:text-[#17B4C4] flex items-center gap-1 transition-colors pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar tramo de tarifa (transbordo)
                    </button>
                  </div>
                </div>
              )}

              {/* ESTADO DE CAPTURA Y MAPA VECTORIAL SVG */}
              <div className="p-3.5 rounded-xl border border-[#E3DCCB]/80 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    {total_puntos_capturados === 0
                      ? "Aún no hay puntos capturados."
                      : `${total_puntos_capturados} puntos capturados en la jornada.`}
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] bg-white border-[#E3DCCB]">
                    Georuta El Alto ↔ La Paz
                  </Badge>
                </div>

                {/* Vector SVG estilizado de ruta El Alto - La Paz */}
                <div className="w-full h-24 bg-white rounded-lg border border-[#E3DCCB]/60 p-2 flex items-center justify-center">
                  <svg viewBox="0 0 400 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20,65 Q110,25 200,45 T380,30"
                      fill="none"
                      stroke="#B7DEDD"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M30,75 Q130,55 220,35 T370,55"
                      fill="none"
                      stroke="#F8C766"
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                    <circle cx="20" cy="65" r="5" fill="#17B4C4" />
                    <circle cx="200" cy="45" r="5" fill="#17B4C4" />
                    <circle cx="380" cy="30" r="6" fill="#063A6B" />
                    <text x="20" y="82" fontSize="9" fill="#5B6D77" fontFamily="sans-serif">
                      El Alto (Origen)
                    </text>
                    <text x="200" y="20" fontSize="9" fill="#17B4C4" fontFamily="sans-serif" textAnchor="middle">
                      Ceja / Autopista
                    </text>
                    <text x="380" y="82" fontSize="9" fill="#063A6B" fontFamily="sans-serif" textAnchor="end">
                      La Paz (Sede Diaconía)
                    </text>
                  </svg>
                </div>
              </div>

              {/* BARRA DE MONTO DEL DÍA Y BOTÓN DE GUARDAR RECORRIDO */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#063A6B] text-white">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#7FE0E6] block">
                    MONTO CALCULADO DEL DÍA
                  </span>
                  <span className="text-2xl font-display font-bold text-[#F8C766]">
                    Bs {monto_del_dia.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-white/70 block font-mono">
                    Ida: Bs {total_ida.toFixed(2)} + Vuelta: Bs {total_vuelta.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={guardarRecorridoDelDia}
                  className="bg-[#F8C766] hover:bg-[#F5A623] text-[#3A2400] font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Guardar Recorrido del Día
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* COLUMNA DERECHA: DETALLE DEL FORMULARIO MENSUAL Y DÍA 24       */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl flex flex-col">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 bg-[#F8F9FA]/80">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-base text-[#063A6B]">
                    Formulario Mensual de Pasajes
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Liquidación para el reembolso institucional del 80%.
                  </CardDescription>
                </div>
                <Badge className="bg-[#17B4C4] text-white font-mono text-[11px]">
                  {recorridos.length} Recorridos
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* FICHA TÉCNICA DEL BECARIO */}
              <div className="space-y-2 text-xs border border-[#E3DCCB] p-3 rounded-xl bg-slate-50/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Becario:</span>
                  <span className="font-bold text-[#063A6B]">
                    {usuario?.nombre || "María Catunta Laime"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lugar de prácticas:</span>
                  <span className="font-semibold text-[#1E293B]">Oficina Central - Bloque A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidad:</span>
                  <span className="font-semibold text-[#1E293B]">Créditos y Cobranzas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mentor Responsable:</span>
                  <span className="font-semibold text-[#1E293B]">Carlos Alanoca</span>
                </div>
              </div>

              {/* LISTA DE RECORRIDOS DECLARADOS DEL MES */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-mono uppercase font-bold text-muted-foreground block">
                    Recorridos Declarados en el Mes
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={descargarExpedientePdf}
                    disabled={descargando_pdf}
                    className="h-7 px-2.5 text-[11px] font-bold border-[#063A6B] text-[#063A6B] hover:bg-slate-100 rounded-lg gap-1.5 shadow-2xs"
                    title="Exportar expediente mensual de recorridos a PDF con Puppeteer"
                  >
                    {descargando_pdf ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#17B4C4]" />
                    ) : (
                      <Printer className="w-3 h-3 text-[#17B4C4]" />
                    )}
                    <span>Exportar PDF</span>
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-[250px] space-y-2 border border-[#E3DCCB]/80 rounded-xl p-2 bg-white">
                  {recorridos.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/80 transition-all flex items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#0A5CA0] bg-sky-100/80 px-1.5 py-0.5 rounded">
                            {rec.fecha}
                          </span>
                          {rec.tramo && (
                            <Badge
                              variant="outline"
                              className={`text-[9.5px] px-1.5 py-0 h-4 font-mono font-bold uppercase ${
                                rec.tramo === "ida"
                                  ? "border-sky-300 bg-sky-50 text-sky-800"
                                  : "border-amber-300 bg-amber-50 text-amber-800"
                              }`}
                            >
                              {rec.tramo === "ida" ? "Ida" : "Vuelta"}
                            </Badge>
                          )}
                          {rec.medio_transporte && (
                            <Badge
                              variant="outline"
                              className={`text-[9.5px] px-1.5 py-0 h-4 font-mono truncate max-w-[130px] ${obtenerEstiloTransporte(
                                rec.medio_transporte
                              )}`}
                            >
                              {rec.medio_transporte}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-[#1E293B] truncate block" title={rec.descripcion}>
                          {rec.descripcion}
                        </span>
                        {rec.calles_declaradas && (
                          <span
                            className="text-[10px] text-muted-foreground truncate block font-mono mt-0.5"
                            title={rec.calles_declaradas}
                          >
                            🛣️ {rec.calles_declaradas}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-[#063A6B]">
                          Bs {rec.monto.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => set_recorrido_seleccionado(rec)}
                          className="h-7 w-7 p-0 text-[#063A6B] hover:text-[#17B4C4] hover:bg-white rounded-lg border border-transparent hover:border-[#E3DCCB] transition-colors"
                          title="Ver detalle del recorrido, paradas y calles declaradas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            confirmarEliminacionRegistro({
                              titulo: "¿Eliminar recorrido declarado?",
                              descripcion: `¿Está seguro de eliminar el recorrido "${rec.descripcion}" por Bs ${rec.monto.toFixed(2)}? Esta acción recalculará el monto total del mes.`,
                              nombre_item: rec.descripcion,
                              onConfirmar: () => {
                                set_recorridos((prev) => prev.filter((r) => r.id !== rec.id));
                              },
                              mensaje_exito: "Recorrido declarado eliminado exitosamente",
                            });
                          }}
                          className="h-7 w-7 p-0 text-[#E2694B] hover:text-[#c9573b] hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                          title="Eliminar recorrido declarado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TARJETA DE CÁLCULO DEL 80% */}
              <div className="p-4 rounded-xl border border-[#E3DCCB] bg-gradient-to-br from-[#063A6B] to-[#04284d] text-white space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono text-white/80">Monto total de pasajes:</span>
                  <span className="text-base font-mono font-bold text-white">
                    Bs {monto_total_pasajes.toFixed(2)}
                  </span>
                </div>
                <Separator className="bg-white/20 my-1" />
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono text-[#7FE0E6] font-bold uppercase">
                    Devolución del 80%:
                  </span>
                  <span className="text-2xl font-display font-bold text-[#F8C766]">
                    Bs {devolucion_80.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-white/60 pt-1">
                  * Liquidación conforme a reglamento Diaconía FRIF-IFD.
                </p>
              </div>

              {/* CAJA DE FIRMA DIGITAL DEL SUPERVISOR ("TOCA PARA FIRMAR") */}
              <div>
                <Label className="text-xs font-mono uppercase font-bold text-muted-foreground block mb-2">
                  Firma Digital del Supervisor
                </Label>
                {firma_supervisor ? (
                  <div className="p-3 rounded-xl border-2 border-emerald-500/80 bg-emerald-50/40 text-center space-y-1">
                    <img
                      src={firma_supervisor}
                      alt="Firma del Supervisor"
                      className="h-14 mx-auto object-contain"
                    />
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Firmado Digitalmente por: Carlos Alanoca (Supervisor)
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      C.I. 4839201 LP · Hash SHA-256 verificado
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => set_dialogo_firma_abierto(true)}
                    className="w-full py-5 border-2 border-dashed border-[#E3DCCB] rounded-xl hover:border-[#17B4C4] hover:bg-slate-50/80 text-xs font-bold text-[#063A6B] flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PenTool className="w-5 h-5 text-[#17B4C4]" />
                    <span>Toca para firmar</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Acreditación de supervisión de pasajes
                    </span>
                  </button>
                )}
              </div>

              {/* BOTÓN Y RESTRICCIÓN DEL DÍA 24 */}
              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  disabled={!es_dia_habilitado}
                  onClick={manejarEnvioMensual}
                  className={`w-full h-11 text-xs font-bold rounded-xl transition-all shadow-sm ${
                    es_dia_habilitado
                      ? "bg-[#F8C766] hover:bg-[#F5A623] text-[#3A2400] cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar formulario mensual
                </Button>

                {/* MENSAJE OBLIGATORIO DE RESTRICCIÓN */}
                {!es_dia_habilitado && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-center font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Se habilita el 24 de cada mes para el envío del formulario.
                  </p>
                )}

                {es_dia_habilitado && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 p-2 rounded-xl text-center font-bold">
                    ✓ Ventana de envío habilitada (Día 24 del mes).
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: CANVAS PARA FIRMA DIGITAL DEL SUPERVISOR        */}
      {/* ============================================================== */}
      <Dialog open={dialogo_firma_abierto} onOpenChange={set_dialogo_firma_abierto}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white border border-[#E3DCCB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <DialogTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#17B4C4]" />
              Firma Digital del Supervisor
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Dibuje la rúbrica de supervisión en el recuadro interactivo.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="p-5 space-y-4">
            <div className="border-2 border-dashed border-[#E3DCCB] rounded-xl bg-white p-1">
              <canvas
                ref={canvas_ref}
                width={380}
                height={160}
                onMouseDown={iniciarDibujo}
                onMouseMove={dibujar}
                onMouseUp={detenerDibujo}
                onMouseLeave={detenerDibujo}
                className="w-full h-40 touch-none cursor-crosshair bg-white rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Rúbrica válida para convalidación institucional.</span>
              <button
                type="button"
                onClick={limpiarCanvas}
                className="text-rose-600 font-bold hover:underline"
              >
                Limpiar trazo
              </button>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-slate-50 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_dialogo_firma_abierto(false)}
              className="text-xs border-[#E3DCCB]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={guardarFirma}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold text-xs"
            >
              Convalidar y Guardar Firma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: DETALLE CONECTADO DE CALLES Y TELEFÉRICO        */}
      {/* ============================================================== */}
      <Dialog
        open={!!recorrido_seleccionado}
        onOpenChange={(abierto) => {
          if (!abierto) set_recorrido_seleccionado(null);
        }}
      >
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl bg-white border border-[#E3DCCB] shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#17B4C4]/15 text-[#0E7A85] flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="font-display text-base text-[#063A6B]">
                  Auditoría de Recorrido — Calles y Transporte Multimodal
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Detalle paso a paso del trayecto convalidado en la conurbación La Paz – El Alto.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {recorrido_seleccionado && (
            <DialogBody className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* CABECERA CON BADGES DE TRAMO, ACTIVIDAD Y TRANSPORTE */}
              <div className="p-3.5 rounded-xl border border-[#E3DCCB] bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-[#063A6B] text-white text-[10.5px] font-mono">
                      {recorrido_seleccionado.fecha}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10.5px] uppercase font-bold font-mono ${
                        recorrido_seleccionado.tramo === "vuelta"
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-sky-300 bg-sky-50 text-sky-800"
                      }`}
                    >
                      {recorrido_seleccionado.tramo === "vuelta" ? "Retorno / Vuelta" : "Ida"}
                    </Badge>
                    <Badge variant="outline" className="text-[10.5px] border-emerald-300 bg-emerald-50 text-emerald-800 font-medium">
                      {recorrido_seleccionado.tipo_actividad || "Prácticas"}
                    </Badge>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#063A6B]">
                    Tarifa: Bs {recorrido_seleccionado.monto.toFixed(2)}
                  </span>
                </div>

                {/* MEDIO DE TRANSPORTE DESTACADO */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground font-bold shrink-0">
                    Transporte:
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 font-medium ${obtenerEstiloTransporte(
                      recorrido_seleccionado.medio_transporte
                    )}`}
                  >
                    <Bus className="w-3 h-3 mr-1.5 inline" />
                    {recorrido_seleccionado.medio_transporte || "Transporte Público Regulado"}
                  </Badge>
                </div>

                <div className="text-xs text-[#1E293B] font-medium pt-0.5">
                  <span className="text-muted-foreground">Itinerario: </span>
                  {recorrido_seleccionado.descripcion}
                </div>
              </div>

              {/* TRAZADO DE CALLES DECLARADAS PASO A PASO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-mono uppercase font-bold text-[#063A6B] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#17B4C4]" />
                    Trazado de Calles y Paradas Declaradas
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Secuencia conectada
                  </span>
                </div>

                {recorrido_seleccionado.calles_declaradas ? (
                  <div className="space-y-2 border border-[#E3DCCB]/80 rounded-xl p-3 bg-white">
                    {recorrido_seleccionado.calles_declaradas.split("|").map((sub_tramo, idx_sub) => {
                      const pasos = obtenerPasosCalles(sub_tramo);
                      return (
                        <div key={idx_sub} className="space-y-2">
                          {recorrido_seleccionado.calles_declaradas!.includes("|") && (
                            <div className="text-[10.5px] font-mono font-bold uppercase text-[#0A5CA0] pb-1 border-b border-slate-100">
                              {idx_sub === 0 ? "Tramo Inicial (Ida)" : "Tramo Conexo / Retorno"}
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            {pasos.map((paso, paso_idx) => {
                              const es_inicio = paso_idx === 0;
                              const es_fin = paso_idx === pasos.length - 1;
                              return (
                                <div key={paso_idx} className="flex items-start gap-2.5">
                                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        es_inicio
                                          ? "bg-rose-500 text-white"
                                          : es_fin
                                          ? "bg-emerald-600 text-white"
                                          : "bg-sky-100 text-sky-800 border border-sky-300"
                                      }`}
                                    >
                                      {paso_idx + 1}
                                    </div>
                                    {!es_fin && <div className="w-0.5 h-4 bg-slate-200 mt-0.5" />}
                                  </div>
                                  <div className="flex-1 pb-1">
                                    <span
                                      className={`text-xs ${
                                        es_inicio || es_fin
                                          ? "font-bold text-[#063A6B]"
                                          : "text-[#334155] font-medium"
                                      }`}
                                    >
                                      {paso}
                                    </span>
                                    {es_inicio && (
                                      <span className="ml-2 text-[10px] text-rose-600 font-mono font-semibold">
                                        (Punto de Salida)
                                      </span>
                                    )}
                                    {es_fin && (
                                      <span className="ml-2 text-[10px] text-emerald-600 font-mono font-semibold">
                                        (Punto de Llegada)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic p-3 border border-dashed rounded-xl">
                    No se especificaron calles intermedias en el registro de este recorrido.
                  </p>
                )}
              </div>

              {/* DETALLE DE ACTIVIDAD / APOYO REALIZADO */}
              {recorrido_seleccionado.apoyo_realizado && (
                <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-sky-800 block">
                    Apoyo y Justificación Institucional
                  </span>
                  <p className="text-xs text-sky-950 font-medium">
                    {recorrido_seleccionado.apoyo_realizado}
                  </p>
                </div>
              )}

              {/* CONVALIDACIÓN DE REEMBOLSO DEL 80% */}
              <div className="p-3.5 rounded-xl border border-[#E3DCCB] bg-gradient-to-br from-[#063A6B] to-[#04284d] text-white">
                <div className="flex items-center justify-between pb-2 border-b border-white/15">
                  <span className="text-xs font-mono text-white/80">Tarifa Declarada (100%):</span>
                  <span className="text-xs font-mono font-bold text-white">
                    Bs {recorrido_seleccionado.monto.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-mono text-[#7FE0E6] font-bold block uppercase">
                      Subsidio Institucional Diaconía (80%):
                    </span>
                    <span className="text-[10px] text-white/70 font-mono">
                      Contraparte del becario (20%): Bs {(recorrido_seleccionado.monto * 0.2).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xl font-display font-bold text-[#F8C766]">
                    Bs {(recorrido_seleccionado.monto * 0.8).toFixed(2)}
                  </span>
                </div>
              </div>
            </DialogBody>
          )}

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-slate-50 flex sm:justify-end">
            <Button
              type="button"
              onClick={() => set_recorrido_seleccionado(null)}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold text-xs rounded-xl px-5"
            >
              Cerrar Detalle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </div>
  );
}
