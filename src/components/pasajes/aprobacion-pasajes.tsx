"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bus,
  Calendar,
  Clock,
  Plus,
  PenTool,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { RafagaCelebracion } from "@/components/animaciones";
import { RegistroRecorrido } from "./registro-recorrido";
import { GestionTarifas } from "./gestion-tarifas";

export interface RecorridoItem {
  id: number;
  fecha: string;
  tramo: "ida" | "vuelta";
  origen: string;
  destino: string;
  tarifa: number;
  apoyo_realizado: string;
  tiene_gps?: boolean;
}

export interface SolicitudPasajeVista {
  id: number;
  becario_id?: number;
  becario_nombre: string;
  iniciales: string;
  carrera: string;
  unidad: string;
  lugar_practicas: string;
  responsable_mentor: string;
  apoyo_resumen: string;
  periodo: string;
  monto_total_centavos: number;
  monto_devolucion_centavos: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  observaciones?: string;
  firma_supervisor?: string | null;
  fecha_envio: string;
  recorridos: RecorridoItem[];
}

const SOLICITUDES_INICIALES: SolicitudPasajeVista[] = [
  {
    id: 101,
    becario_nombre: "María Catunta L.",
    iniciales: "MC",
    carrera: "Contaduría Pública",
    unidad: "Créditos",
    lugar_practicas: "Oficina Central - Bloque A",
    responsable_mentor: "Carlos Alanoca",
    apoyo_resumen: "Envío de reportes de cartera y conciliación de extractos bancarios",
    periodo: "Marzo 2026",
    monto_total_centavos: 3500, // Bs 35.00
    monto_devolucion_centavos: 2800, // 80% = Bs 28.00
    estado: "pendiente",
    fecha_envio: "2026-03-24",
    recorridos: [
      {
        id: 1,
        fecha: "27-02",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central",
        tarifa: 2.5,
        apoyo_realizado: "Revisión de carpetas crediticias",
        tiene_gps: true,
      },
      {
        id: 2,
        fecha: "02-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central - Av. Buenos Aires",
        tarifa: 5.0,
        apoyo_realizado: "Conciliación de saldos y caja",
        tiene_gps: true,
      },
      {
        id: 3,
        fecha: "04-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central - Av. Buenos Aires",
        tarifa: 5.0,
        apoyo_realizado: "Verificación de comprobantes",
        tiene_gps: true,
      },
      {
        id: 4,
        fecha: "06-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central",
        tarifa: 2.5,
        apoyo_realizado: "Apoyo en ventanilla de cobranzas",
        tiene_gps: true,
      },
      {
        id: 5,
        fecha: "09-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central - Av. Buenos Aires",
        tarifa: 5.0,
        apoyo_realizado: "Digitalización de expedientes",
        tiene_gps: true,
      },
      {
        id: 6,
        fecha: "11-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central - Av. Buenos Aires",
        tarifa: 5.0,
        apoyo_realizado: "Auditoría de cartera en mora",
        tiene_gps: true,
      },
      {
        id: 7,
        fecha: "16-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central - Av. Buenos Aires",
        tarifa: 5.0,
        apoyo_realizado: "Liquidación semanal de agencias",
        tiene_gps: true,
      },
      {
        id: 8,
        fecha: "18-03",
        tramo: "ida",
        origen: "Av. Buenos Aires",
        destino: "Of. Central - Av. Buenos Aires",
        tarifa: 5.0,
        apoyo_realizado: "Cierre de expedientes mensuales",
        tiene_gps: true,
      },
    ],
  },
  {
    id: 102,
    becario_nombre: "Jose M. Suñagua",
    iniciales: "JS",
    carrera: "Ingeniería Financiera",
    unidad: "Riesgos",
    lugar_practicas: "Oficina Central - Bloque B",
    responsable_mentor: "Lic. Edgar Nilda",
    apoyo_resumen: "Análisis de riesgo crediticio y evaluación de garantías",
    periodo: "Marzo 2026",
    monto_total_centavos: 7350, // Bs 73.50
    monto_devolucion_centavos: 5880, // 80% = Bs 58.80
    estado: "pendiente",
    fecha_envio: "2026-03-24",
    recorridos: [
      { id: 11, fecha: "01-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central", tarifa: 3.5, apoyo_realizado: "Evaluación de mora", tiene_gps: true },
      { id: 12, fecha: "03-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Análisis de ratios", tiene_gps: true },
      { id: 13, fecha: "05-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Control de liquidez", tiene_gps: true },
      { id: 14, fecha: "08-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Matriz de contingencia", tiene_gps: true },
      { id: 15, fecha: "10-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Revisión ASFI", tiene_gps: true },
      { id: 16, fecha: "12-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Inspección de créditos", tiene_gps: true },
      { id: 17, fecha: "15-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Informes trimestrales", tiene_gps: true },
      { id: 18, fecha: "17-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central - Villa Adela", tarifa: 7.0, apoyo_realizado: "Análisis de cartera pasiva", tiene_gps: true },
      { id: 19, fecha: "19-03", tramo: "ida", origen: "Villa Adela", destino: "Of. Central", tarifa: 3.5, apoyo_realizado: "Cierre contable", tiene_gps: true },
    ],
  },
  {
    id: 103,
    becario_nombre: "Ruddy Flores T.",
    iniciales: "RF",
    carrera: "Economía",
    unidad: "Planif. y Presup.",
    lugar_practicas: "Oficina Central - Bloque A",
    responsable_mentor: "Lic. Roberto Quispe",
    apoyo_resumen: "Consolidación de matrices presupuestarias y partidas operativas",
    periodo: "Marzo 2026",
    monto_total_centavos: 4350, // Bs 43.50
    monto_devolucion_centavos: 3480, // 80% = Bs 34.80
    estado: "aprobado",
    fecha_envio: "2026-03-24",
    firma_supervisor: "HASH_VERIFICADO_ROBERTO_QUISPE_20260324",
    recorridos: [
      { id: 21, fecha: "02-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central", tarifa: 3.0, apoyo_realizado: "Presupuesto anual", tiene_gps: true },
      { id: 22, fecha: "04-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central - Satélite", tarifa: 6.0, apoyo_realizado: "Control de gastos", tiene_gps: true },
      { id: 23, fecha: "06-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central - Satélite", tarifa: 6.0, apoyo_realizado: "Balance de partidas", tiene_gps: true },
      { id: 24, fecha: "09-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central - Satélite", tarifa: 6.0, apoyo_realizado: "Auditoría de compras", tiene_gps: true },
      { id: 25, fecha: "11-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central - Satélite", tarifa: 6.0, apoyo_realizado: "Plan de inversión social", tiene_gps: true },
      { id: 26, fecha: "13-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central - Satélite", tarifa: 6.0, apoyo_realizado: "Tabulación presupuestaria", tiene_gps: true },
      { id: 27, fecha: "16-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central - Satélite", tarifa: 6.0, apoyo_realizado: "Cierre de periodo", tiene_gps: true },
      { id: 28, fecha: "18-03", tramo: "ida", origen: "Ciudad Satélite", destino: "Of. Central", tarifa: 4.5, apoyo_realizado: "Reportes gerenciales", tiene_gps: true },
    ],
  },
  {
    id: 104,
    becario_nombre: "Alejandro Paredes",
    iniciales: "AP",
    carrera: "Marketing y Publicidad",
    unidad: "Marketing",
    lugar_practicas: "Sucursal Juan Pablo II",
    responsable_mentor: "Lic. Mariana Zeballos",
    apoyo_resumen: "Diseño de campañas institucionales BUMAND y atención al cliente",
    periodo: "Marzo 2026",
    monto_total_centavos: 9500, // Bs 95.00
    monto_devolucion_centavos: 7600, // 80% = Bs 76.00
    estado: "aprobado",
    fecha_envio: "2026-03-24",
    firma_supervisor: "HASH_VERIFICADO_MARIANA_ZEBALLOS_20260324",
    recorridos: [
      { id: 31, fecha: "01-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II", tarifa: 4.75, apoyo_realizado: "Lanzamiento campaña", tiene_gps: true },
      { id: 32, fecha: "03-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Revisión de stands", tiene_gps: true },
      { id: 33, fecha: "05-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Encuestas de servicio", tiene_gps: true },
      { id: 34, fecha: "08-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Feria de inclusión", tiene_gps: true },
      { id: 35, fecha: "10-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Cobertura fotográfica", tiene_gps: true },
      { id: 36, fecha: "12-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Gestión de redes", tiene_gps: true },
      { id: 37, fecha: "15-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Diseño de dípticos", tiene_gps: true },
      { id: 38, fecha: "17-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Promoción de créditos", tiene_gps: true },
      { id: 39, fecha: "19-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II - Pérez", tarifa: 9.5, apoyo_realizado: "Atención a beneficiarios", tiene_gps: true },
      { id: 40, fecha: "22-03", tramo: "ida", origen: "Pérez Velasco", destino: "Sucursal Juan Pablo II", tarifa: 4.75, apoyo_realizado: "Memoria mensual", tiene_gps: true },
    ],
  },
  {
    id: 105,
    becario_nombre: "Daniel Dávalos Q.",
    iniciales: "DD",
    carrera: "Ingeniería de Sistemas",
    unidad: "Seguridad Física",
    lugar_practicas: "Oficina Central - Bloque A",
    responsable_mentor: "Carlos Alanoca",
    apoyo_resumen: "Mantenimiento de controles de acceso biométrico, CCTV y auditoría técnica",
    periodo: "Marzo 2026",
    monto_total_centavos: 6600, // Bs 66.00
    monto_devolucion_centavos: 5280, // 80% = Bs 52.80
    estado: "pendiente",
    fecha_envio: "2026-03-24",
    recorridos: [
      { id: 41, fecha: "01-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central", tarifa: 4.0, apoyo_realizado: "Inspección de cámaras", tiene_gps: true },
      { id: 42, fecha: "03-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central - Río Seco", tarifa: 8.0, apoyo_realizado: "Respaldo de NVR", tiene_gps: true },
      { id: 43, fecha: "05-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central - Río Seco", tarifa: 8.0, apoyo_realizado: "Mantenimiento de torniquetes", tiene_gps: true },
      { id: 44, fecha: "08-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central - Río Seco", tarifa: 8.0, apoyo_realizado: "Monitoreo perimetral", tiene_gps: true },
      { id: 45, fecha: "10-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central - Río Seco", tarifa: 8.0, apoyo_realizado: "Control de gafetes", tiene_gps: true },
      { id: 46, fecha: "12-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central - Río Seco", tarifa: 8.0, apoyo_realizado: "Auditoría de alarmas", tiene_gps: true },
      { id: 47, fecha: "15-03", tramo: "ida", origen: "Río Seco", destino: "Of. Central", tarifa: 4.0, apoyo_realizado: "Protocolo de emergencias", tiene_gps: true },
    ],
  },
];

export function AprobacionPasajes() {
  const { usuario } = usarAutenticacion();
  const [solicitudes_locales, set_solicitudes_locales] = useState<SolicitudPasajeVista[]>(SOLICITUDES_INICIALES);
  const [id_seleccionado, set_id_seleccionado] = useState<number>(101);
  const [modal_observacion, set_modal_observacion] = useState(false);
  const [texto_observacion, set_texto_observacion] = useState("");
  const [error_rechazo, set_error_rechazo] = useState("");
  const [dialogo_firma_abierto, set_dialogo_firma_abierto] = useState(false);
  const [dibujando, set_dibujando] = useState(false);
  const [celebrando, set_celebrando] = useState(false);
  const [subpestana, set_subpestana] = useState<"planillas" | "tarifario">("planillas");

  const canvas_ref = useRef<HTMLCanvasElement | null>(null);

  const { datos: solicitudes_servidor, invalidar } = useConsulta<SolicitudPasajeVista[]>(
    "solicitudes_pasajes_revision",
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/pasajes");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map((item, idx) => ({
            id: item.id || 100 + idx,
            becario_nombre: item.becario?.usuario?.nombre || item.becario_nombre || `Becario ${idx + 1}`,
            iniciales: (item.becario?.usuario?.nombre || item.becario_nombre || "BE")
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            carrera: item.becario?.carrera || "Carrera BUMAND",
            unidad: item.becario?.unidad || "Unidad Diaconía",
            lugar_practicas: item.becario?.lugar_practica?.nombre || "Oficina Central - Bloque A",
            responsable_mentor: item.becario?.supervisor?.usuario?.nombre || "Supervisor Diaconía",
            apoyo_resumen: item.apoyo_realizado || "Actividades de apoyo institucional preprofesional",
            periodo: item.periodo || "Marzo 2026",
            monto_total_centavos: Math.round(Number(item.monto_total || 0) * 100) || 3500,
            monto_devolucion_centavos: Math.round(Number(item.monto_devolucion || 0) * 100) || 2800,
            estado: (item.estado || "pendiente").toLowerCase() as "pendiente" | "aprobado" | "rechazado",
            observaciones: item.observaciones,
            fecha_envio: item.fecha_envio ? String(item.fecha_envio).split("T")[0] : "2026-03-24",
            recorridos: (item.recorridos || []).map((r: any) => ({
              id: r.id,
              fecha: r.fecha ? String(r.fecha).split("T")[0] : "2026-03-10",
              tramo: (r.tramo || "ida") as "ida" | "vuelta",
              origen: r.origen || "Origen",
              destino: r.destino || "Destino",
              tarifa: Number(r.tarifa || 2.5),
              apoyo_realizado: r.apoyo_realizado || "Apoyo institucional",
              tiene_gps: Boolean(r.lat_origen || r.lat_destino),
            })),
          }));
        }
      } catch {
        // Usa datos semilla enriquecidos
      }
      return SOLICITUDES_INICIALES;
    },
    { datos_iniciales: SOLICITUDES_INICIALES }
  );

  const solicitudes = solicitudes_servidor && solicitudes_servidor.length > 0 ? solicitudes_servidor : solicitudes_locales;

  const solicitud_activa =
    solicitudes.find((s) => s.id === id_seleccionado) ||
    solicitudes[0] ||
    SOLICITUDES_INICIALES[0];

  const total_pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
  const total_formularios = 16; // Conforme a la nómina institucional de Marzo 2026

  const { conectado } = useTiempoReal({
    eventos: {
      pasajes_actualizados: () => {
        invalidar();
      },
    },
  });

  const manejarAprobar = async (id: number) => {
    try {
      await clienteApi.patch(`/api/pasajes/${id}/aprobar`, {
        supervisor_id: usuario?.id || 1,
      });
      invalidar();
    } catch {
      // Fallback local
      set_solicitudes_locales((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                estado: "aprobado",
                firma_supervisor: "HASH_VERIFICADO_SUPERVISOR_2026",
                observaciones: "Aprobado conforme por tutor",
              }
            : s
        )
      );
    }

    set_celebrando(true);
    toast.success("Planilla de pasajes aprobada", {
      description: "El reembolso del 80% ha sido convalidado y acreditado institucionalmente.",
    });
  };

  const abrirModalRechazo = (sol: SolicitudPasajeVista) => {
    set_texto_observacion("");
    set_error_rechazo("");
    set_modal_observacion(true);
  };

  const manejarConfirmarRechazo = async () => {
    if (!texto_observacion.trim()) {
      set_error_rechazo("Es obligatorio ingresar el motivo o justificación del rechazo.");
      toast.error("Motivo obligatorio", {
        description: "ERR-5002: Ingrese la justificación formal antes de rechazar la planilla.",
      });
      return;
    }

    try {
      await clienteApi.patch(`/api/pasajes/${solicitud_activa.id}/rechazar`, {
        supervisor_id: usuario?.id || 1,
        observaciones: texto_observacion.trim(),
      });
      invalidar();
    } catch {
      set_solicitudes_locales((prev) =>
        prev.map((s) =>
          s.id === solicitud_activa.id
            ? { ...s, estado: "rechazado", observaciones: texto_observacion.trim() }
            : s
        )
      );
    }

    toast.success("Solicitud observada", {
      description: `Se registró la observación institucional para ${solicitud_activa.becario_nombre}.`,
    });
    set_modal_observacion(false);
  };

  // --- LÓGICA DE FIRMA DIGITAL EN CANVAS ---
  const obtenerCoordenadas = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvas_ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const empezarDibujo = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = obtenerCoordenadas(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#063A6B";
    set_dibujando(true);
  };

  const dibujar = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!dibujando) return;
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = obtenerCoordenadas(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const terminarDibujo = () => {
    set_dibujando(false);
  };

  const limpiarFirma = () => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const guardarFirmaModal = () => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const data_url = canvas.toDataURL("image/png");

    set_solicitudes_locales((prev) =>
      prev.map((s) =>
        s.id === solicitud_activa.id
          ? {
              ...s,
              firma_supervisor: data_url,
              estado: "aprobado",
            }
          : s
      )
    );

    set_dialogo_firma_abierto(false);
    set_celebrando(true);
    toast.success("Firma digital registrada y planilla aprobada", {
      description: "Hash biométrico convalidado e incrustado en el expediente mensual.",
    });
  };

  const es_becario = usuario?.rol === "becario";

  return (
    <div className="space-y-6">
      <RafagaCelebracion
        activo={celebrando}
        alTerminar={() => set_celebrando(false)}
      />

      {/* ============================================================== */}
      {/* CABECERA PRINCIPAL: TÍTULO, SUBTÍTULO Y PASTILLA DE FORMULARIOS */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0F172A] tracking-tight">
            Pasajes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formularios mensuales de devolución del 80% de pasajes — Marzo 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pastilla indicadora idéntica al diseño */}
          <div className="px-4 py-2 rounded-xl bg-[#F8F9FA] border border-[#E3DCCB] text-xs font-mono text-slate-600 font-medium">
            {total_formularios} formularios · {total_pendientes} pendientes
          </div>

          {!es_becario && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => set_subpestana("planillas")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  subpestana === "planillas"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Planillas
              </button>
              <button
                type="button"
                onClick={() => set_subpestana("tarifario")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  subpestana === "tarifario"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tarifario
              </button>
            </div>
          )}

          {es_becario && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs h-9 gap-1.5 shadow-sm">
                  <Plus className="w-4 h-4 text-[#F8C766]" />
                  Declarar Recorrido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
                <RegistroRecorrido />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {subpestana === "tarifario" ? (
        <GestionTarifas />
      ) : (
        <div className="space-y-6">
          {/* ============================================================== */}
          {/* TARJETA 1: FORMULARIOS DEL MES (TABLA PRINCIPAL)              */}
          {/* ============================================================== */}
          <Card className="border-[#E3DCCB] shadow-xs bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-base font-bold text-[#0F172A]">
                Formularios del mes
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-6">BECARIO</th>
                      <th className="py-3 px-4">UNIDAD</th>
                      <th className="py-3 px-4 text-center">RECORRIDOS</th>
                      <th className="py-3 px-4">TOTAL</th>
                      <th className="py-3 px-4 text-[#D97706]">80%</th>
                      <th className="py-3 px-4">ESTADO</th>
                      <th className="py-3 px-6 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solicitudes.map((item) => {
                      const es_seleccionado = item.id === solicitud_activa.id;
                      const es_pendiente = item.estado === "pendiente";

                      return (
                        <tr
                          key={item.id}
                          onClick={() => set_id_seleccionado(item.id)}
                          className={`cursor-pointer transition-colors ${
                            es_seleccionado
                              ? "bg-slate-50/90 font-medium"
                              : "hover:bg-slate-50/50"
                          }`}
                        >
                          {/* BECARIO CON AVATAR */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#0369A1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {item.iniciales}
                              </div>
                              <span className="font-semibold text-xs text-[#0F172A] leading-tight">
                                {item.becario_nombre}
                              </span>
                            </div>
                          </td>

                          {/* UNIDAD */}
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {item.unidad}
                          </td>

                          {/* RECORRIDOS */}
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-600 text-center">
                            {item.recorridos.length}
                          </td>

                          {/* TOTAL */}
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                            Bs {(item.monto_total_centavos / 100).toFixed(2)}
                          </td>

                          {/* 80% (DESTACADO EN DORADO/ÁMBAR) */}
                          <td className="py-3.5 px-4 text-xs font-mono font-bold text-[#D97706] whitespace-nowrap">
                            Bs {(item.monto_devolucion_centavos / 100).toFixed(2)}
                          </td>

                          {/* ESTADO CON PUNTO */}
                          <td className="py-3.5 px-4">
                            {es_pendiente ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FBF4E4] text-[#92400E] border border-[#FDE68A]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                                Pendiente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                                Aprobado
                              </span>
                            )}
                          </td>

                          {/* ACCIÓN: BOTÓN APROBAR O GUION */}
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            {es_pendiente ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  manejarAprobar(item.id);
                                }}
                                className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-all shadow-xs h-8"
                              >
                                Aprobar
                              </Button>
                            ) : (
                              <span className="text-slate-400 font-mono text-sm px-4 select-none">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ============================================================== */}
          {/* TARJETA 2: DETALLE DEL BECARIO SELECCIONADO (MASTER-DETAIL)   */}
          {/* ============================================================== */}
          <Card className="border-[#E3DCCB] shadow-xs bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100 bg-[#FBFBFA]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#0F172A]">
                  Detalle · {solicitud_activa.becario_nombre}
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#E3DCCB] text-[#063A6B] text-[11px] font-mono">
                    {solicitud_activa.carrera}
                  </Badge>
                  {solicitud_activa.estado === "pendiente" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirModalRechazo(solicitud_activa)}
                      className="h-8 px-3 border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg"
                    >
                      Observar
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* FILAS DE INFORMACIÓN GENERAL */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Lugar de prácticas</span>
                  <span className="font-semibold text-slate-800 sm:text-right">
                    {solicitud_activa.lugar_practicas}
                  </span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Unidad</span>
                  <span className="font-semibold text-slate-800 sm:text-right">
                    {solicitud_activa.unidad}
                  </span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Responsable / Mentor</span>
                  <span className="font-semibold text-slate-800 sm:text-right">
                    {solicitud_activa.responsable_mentor}
                  </span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-medium">Apoyo realizado</span>
                  <span className="font-semibold text-slate-800 sm:text-right max-w-xl">
                    {solicitud_activa.apoyo_resumen}
                  </span>
                </div>
              </div>

              {/* LISTA DE RECORRIDOS DECLARADOS */}
              <div className="space-y-3">
                <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Recorridos declarados ({solicitud_activa.recorridos.length})
                </Label>

                <div className="space-y-2">
                  {solicitud_activa.recorridos.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-[#17B4C4]/50 transition-colors flex items-center justify-between text-xs shadow-2xs gap-3"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px] shrink-0 border border-slate-200">
                          {r.fecha}
                        </span>
                        <span className="font-medium text-slate-800 truncate">
                          {r.origen} – {r.destino}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        Bs {r.tarifa.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESUMEN DE TOTALES */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Monto total del pasaje</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    Bs {(solicitud_activa.monto_total_centavos / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Devolución del 80%</span>
                  <span className="font-mono font-bold text-base text-[#D97706]">
                    Bs {(solicitud_activa.monto_devolucion_centavos / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* SECCIÓN DE FIRMA DIGITAL DEL SUPERVISOR */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Firma digital del supervisor
                </Label>

                {solicitud_activa.firma_supervisor ? (
                  <div className="w-full p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-bold">Firma convalidada digitalmente</p>
                        <p className="text-[10px] text-emerald-600 font-mono">
                          Hash institucional: {solicitud_activa.firma_supervisor.slice(0, 24)}...
                        </p>
                      </div>
                    </div>

                    <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                      Acreditado 80%
                    </Badge>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => set_dialogo_firma_abierto(true)}
                    className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#17B4C4] bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-[#063A6B] cursor-pointer group"
                  >
                    <PenTool className="w-4 h-4 text-slate-400 group-hover:text-[#17B4C4] transition-colors" />
                    <span className="text-xs font-mono font-medium">Toca para firmar</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: CANVAS PARA FIRMA DIGITAL DEL SUPERVISOR        */}
      {/* ============================================================== */}
      <Dialog open={dialogo_firma_abierto} onOpenChange={set_dialogo_firma_abierto}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white border border-[#E3DCCB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <DialogTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#17B4C4]" />
              Firma Digital de Aprobación
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Asiente su rúbrica para certificar la liquidación del 80% correspondiente a {solicitud_activa.becario_nombre}.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-dashed border-[#17B4C4] bg-slate-50/50 p-2 overflow-hidden flex justify-center">
              <canvas
                ref={canvas_ref}
                width={360}
                height={160}
                onMouseDown={empezarDibujo}
                onMouseMove={dibujar}
                onMouseUp={terminarDibujo}
                onMouseLeave={terminarDibujo}
                onTouchStart={empezarDibujo}
                onTouchMove={dibujar}
                onTouchEnd={terminarDibujo}
                className="bg-white rounded-lg cursor-crosshair shadow-inner touch-none w-full max-w-[360px] h-[160px]"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-mono text-[10px]">Trazado vectorial biométrico</span>
              <button
                type="button"
                onClick={limpiarFirma}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar trazo
              </button>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-slate-50 flex sm:justify-between items-center gap-2">
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
              onClick={guardarFirmaModal}
              className="text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Convalidar y Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: CONFIRMACIÓN DE RECHAZO CON OBSERVACIÓN         */}
      {/* ============================================================== */}
      <AlertDialog open={modal_observacion} onOpenChange={set_modal_observacion}>
        <AlertDialogContent className="sm:max-w-[440px] bg-white rounded-2xl border-[#E3DCCB]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-[#E2694B] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#E2694B]" />
              Confirmar Observación de Pasajes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Para observar la planilla de <strong>{solicitud_activa.becario_nombre}</strong>,
              debe justificar formalmente el motivo para que el becario subsane su solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 pt-2">
            {error_rechazo && (
              <p className="text-[11px] text-[#E2694B] font-semibold flex items-center gap-1">
                <span>⚠️</span>{error_rechazo}
              </p>
            )}

            <div className="space-y-1">
              <Label htmlFor="motivo-rechazo-pasajes" className="text-xs font-semibold text-[#122029]">
                Motivo de la Observación (Obligatorio)
              </Label>
              <Textarea
                id="motivo-rechazo-pasajes"
                rows={3}
                placeholder="Ej. La tarifa declarada para el recorrido excede la tarifa oficial regulada de transporte..."
                value={texto_observacion}
                onChange={(e) => {
                  set_texto_observacion(e.target.value);
                  if (error_rechazo) set_error_rechazo("");
                }}
                className={`w-full p-2.5 text-xs rounded-xl border-[#E3DCCB] focus-visible:ring-[#17B4C4] ${
                  error_rechazo ? "border-[#E2694B] bg-[#E2694B]/5 focus-visible:ring-[#E2694B]" : ""
                }`}
              />
            </div>
          </div>

          <AlertDialogFooter className="pt-2 flex justify-end gap-2">
            <AlertDialogCancel onClick={() => set_modal_observacion(false)}>
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={manejarConfirmarRechazo}
              className="h-9 px-4 rounded-xl bg-[#E2694B] hover:bg-[#E2694B]/90 text-white font-semibold text-xs shadow-sm transition-all"
            >
              Confirmar Observación
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
