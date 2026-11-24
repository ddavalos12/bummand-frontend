"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Eye,
  MapPin,
  Route,
  Navigation,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Columns,
  FileText,
  FileSpreadsheet,
  Printer,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { descargarPdfConResiliencia } from "@/lib/generador-pdf-cliente";
import { exportarFormularioContabilidadRsdExcel } from "@/lib/generador-excel-cliente";
import {
  obtenerMesActualLaPaz,
  obtenerRangoMesActualLaPaz,
} from "@/lib/fechas-institucionales";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import {
  esAdministradorAutenticado,
  esMentorAutenticado,
  usarBecariosDesignadosMentor,
} from "@/lib/filtro-mentor";
import { InsigniaBecariosDesignados } from "@/components/ui/insignia-becarios-designados";
import { RafagaCelebracion } from "@/components/animaciones";
import { RegistroRecorrido } from "./registro-recorrido";
import { GestionTarifas } from "./gestion-tarifas";
import { HistorialParadasEstudiante } from "./historial-paradas-estudiante";
import { esRecorridoEscuelaLideres } from "./pasajes-vista";
import { RUTAS_API } from "@/servicios/rutas-api.constantes";
import { SelectorPlanillaDonacion } from "@/components/reportes/selector-planilla-donacion";

export interface RecorridoItem {
  id: number;
  fecha: string;
  tramo: "ida" | "vuelta";
  origen: string;
  destino: string;
  tarifa: number;
  apoyo_realizado: string;
  tiene_gps?: boolean;
  calles_declaradas?: string;
  medio_transporte?: string;
  tipo_actividad?: string;
  detalle_tramos_json?: string;
}

export interface SolicitudPasajeVista {
  id: number;
  becario_id?: number;
  ci?: string;
  becario_nombre: string;
  iniciales: string;
  carrera: string;
  unidad: string;
  lugar_practicas: string;
  responsable_mentor: string;
  supervisor_id?: number | null;
  supervisor_correo?: string | null;
  apoyo_resumen: string;
  periodo: string;
  tipo_actividad?: "Prácticas" | "Escuela de Líderes" | "Acciones de Servicio";
  monto_total_centavos: number;
  monto_devolucion_centavos: number;
  multas_asistencia_bs?: number;
  multas_asistencia_centavos?: number;
  monto_liquido_pagable?: number;
  monto_liquido_pagable_centavos?: number;
  estado: "borrador" | "pendiente" | "revisado_supervisor" | "aprobado_administracion" | "aprobado" | "rechazado";
  observaciones?: string;
  fecha_envio: string;
  revisado_por_supervisor?: boolean;
  supervisor_revisor?: string | null;
  fecha_revision_supervisor?: string | null;
  administrador_nombre?: string | null;
  fecha_aprobacion_admin?: string | null;
  recorridos: RecorridoItem[];
}

const SOLICITUDES_INICIALES: SolicitudPasajeVista[] = [];

export function RecorridoEnriquecidoCard({
  recorrido,
  alEliminar,
}: {
  recorrido: RecorridoItem;
  alEliminar?: () => void;
}) {
  const calles = (recorrido.calles_declaradas || `${recorrido.origen} → ${recorrido.destino}`)
    .split(/→|->/)
    .map((s) => s.trim())
    .filter(Boolean);

  const medio = recorrido.medio_transporte || "Minibús Urbano";
  const medio_lower = medio.toLowerCase();
  const es_teleferico = medio_lower.includes("teleférico") || medio_lower.includes("teleferico");
  const es_roja = medio_lower.includes("roja");
  const es_morada = medio_lower.includes("morada");
  const es_amarilla = medio_lower.includes("amarilla");
  const es_plateada = medio_lower.includes("plateada");
  const es_azul = medio_lower.includes("azul");

  return (
    <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-[#00ABBD]/50 hover:shadow-xs transition-all space-y-2.5">
      {/* Fila 1: Badges de Tramo, Tipo de Actividad, Fecha y Tarifa */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Badge Tramo */}
          <Badge
            variant="outline"
            className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
              recorrido.tramo === "ida"
                ? "bg-sky-50 text-sky-800 border-sky-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
          >
            {recorrido.tramo === "ida" ? "→ Tramo IDA" : "← Tramo VUELTA"}
          </Badge>

          {/* Badge Tipo de Actividad */}
          <Badge
            variant="outline"
            className="text-[10px] font-semibold border-slate-200 text-slate-700 bg-slate-50"
          >
            {recorrido.tipo_actividad || "Prácticas"}
          </Badge>

          {/* Badge Medio de Transporte / Teleférico */}
          <Badge
            variant="outline"
            className={`text-[10px] font-medium flex items-center gap-1 ${
              es_roja
                ? "bg-rose-50 text-rose-700 border-rose-300 font-bold"
                : es_morada
                ? "bg-purple-50 text-purple-700 border-purple-300 font-bold"
                : es_amarilla
                ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                : es_plateada
                ? "bg-slate-100 text-slate-700 border-slate-400 font-bold"
                : es_azul
                ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                : es_teleferico
                ? "bg-[#00ABBD]/10 text-[#00808E] border-[#00ABBD]/30 font-bold"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <Bus className="w-3 h-3" />
            {medio}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {recorrido.fecha}
          </span>
          <span className="font-mono font-bold text-xs text-[#035683] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
            Bs {recorrido.tarifa.toFixed(2)}
          </span>
          {alEliminar && (
            <button
              type="button"
              onClick={alEliminar}
              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Eliminar este tramo erróneo de la solicitud (Web + APK)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fila 2: Secuencia visual de calles y paradas declaradas */}
      <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 space-y-1.5">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Route className="w-3 h-3 text-[#00ABBD]" />
          Recorrido de Calles y Paradas Declaradas en la App:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {calles.map((calle, idx) => (
            <React.Fragment key={idx}>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-slate-800 text-[11px] font-medium border border-slate-200 shadow-2xs">
                <MapPin className="w-2.5 h-2.5 text-[#035683] shrink-0" />
                {calle}
              </span>
              {idx < calles.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Fila 3: Apoyo realizado */}
      {recorrido.apoyo_realizado && (
        <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pl-1">
          <span className="font-bold text-slate-700 shrink-0">Apoyo realizado:</span>
          <span className="italic">{recorrido.apoyo_realizado}</span>
        </div>
      )}
    </div>
  );
}

export function AprobacionPasajes() {
  const { usuario } = usarAutenticacion();
  const [solicitudes_locales, set_solicitudes_locales] = useState<SolicitudPasajeVista[]>(SOLICITUDES_INICIALES);
  const [id_seleccionado, set_id_seleccionado] = useState<number>(101);
  const [solicitud_seleccionada, set_solicitud_seleccionada] = useState<SolicitudPasajeVista | null>(null);
  const [modal_observacion, set_modal_observacion] = useState(false);
  const [modal_declarar_abierto, set_modal_declarar_abierto] = useState(false);
  const [texto_observacion, set_texto_observacion] = useState("");
  const [error_rechazo, set_error_rechazo] = useState("");
  const [celebrando, set_celebrando] = useState(false);
  const [subpestana, set_subpestana] = useState<"planillas" | "detalle" | "tarifario" | "historial_paradas">("planillas");
  const [filtro_estado, set_filtro_estado] = useState<"todos" | "pendientes" | "revisado_supervisor" | "aprobados">("todos");
  const [subpestaña_detalle, set_subpestaña_detalle] = useState<"recorridos" | "firma">("recorridos");
  const [vista_dividida, set_vista_dividida] = useState<boolean>(false);
  const [descargando_pdf, set_descargando_pdf] = useState<boolean>(false);
  const [fecha_inicio_auditoria, set_fecha_inicio_auditoria] = useState<string>(
    () => obtenerRangoMesActualLaPaz().inicio
  );
  const [fecha_fin_auditoria, set_fecha_fin_auditoria] = useState<string>(
    () => obtenerRangoMesActualLaPaz().fin
  );
  const [descargando_pdf_auditoria, set_descargando_pdf_auditoria] = useState<boolean>(false);
  const [descargando_pdf_consolidado, set_descargando_pdf_consolidado] = useState<boolean>(false);

  const manejarDescargarPdfAuditoria = async () => {
    try {
      set_descargando_pdf_auditoria(true);
      toast.info("Generando Formulario Consolidado de Pasajes en PDF para Contabilidad...", {
        description: `Intervalo: Desde ${fecha_inicio_auditoria} hasta ${fecha_fin_auditoria} (sin descuento de multas).`,
      });

      const endpoint = `${RUTAS_API.PDF.PASAJES_GENERAL}?fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}&descontar_multas=false`;
      const nombre_archivo = `Formulario_Contabilidad_RSD_Pasajes_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      await descargarPdfConResiliencia(
        endpoint,
        nombre_archivo,
        "pasajes_general",
        {
          fecha_inicio: fecha_inicio_auditoria,
          fecha_fin: fecha_fin_auditoria,
          descontar_multas: false,
        }
      );

      toast.success("Formulario de pasajes para Contabilidad descargado exitosamente");
    } catch {
      toast.error("Error al extraer reporte PDF para Contabilidad de pasajes", {
        description: "Verifique el servicio PDF institucional.",
      });
    } finally {
      set_descargando_pdf_auditoria(false);
    }
  };

  const manejarDescargarPdfConsolidadoContabilidad = async () => {
    try {
      set_descargando_pdf_consolidado(true);
      toast.info("Generando Consolidado Integral para Contabilidad en PDF...", {
        description: `Intervalo: ${fecha_inicio_auditoria} al ${fecha_fin_auditoria} (sin descuento de multas).`,
      });

      const endpoint = `/pdf/consolidado-contabilidad?fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}&descontar_multas=false`;
      const nombre_archivo = `Consolidado_Contabilidad_BUMAND_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      await descargarPdfConResiliencia(
        endpoint,
        nombre_archivo,
        "consolidado_auditoria",
        {
          modulo: "consolidado-contabilidad",
          fecha_inicio: fecha_inicio_auditoria,
          fecha_fin: fecha_fin_auditoria,
          descontar_multas: false,
        }
      );

      toast.success("Consolidado integral de Contabilidad descargado exitosamente");
    } catch {
      toast.error("Error al descargar el consolidado integral de Contabilidad");
    } finally {
      set_descargando_pdf_consolidado(false);
    }
  };

  const descargarExpedientePdf = async (item: SolicitudPasajeVista) => {
    try {
      set_descargando_pdf(true);
      toast.info("Generando expediente oficial de recorridos en PDF...", {
        description: `Becario: ${item.becario_nombre} · Periodo: ${item.periodo}`,
      });
      const id_becario = item.becario_id || item.id || 1;
      const endpoint = `/pdf/recorridos-estudiante/${id_becario}?solicitud_id=${item.id}&mes=${encodeURIComponent(item.periodo)}`;
      const nombre_archivo = `Expediente_Recorridos_${item.becario_nombre.replace(/\s+/g, '_')}_${item.periodo.replace(/\s+/g, '_')}.pdf`;

      await descargarPdfConResiliencia(
        endpoint,
        nombre_archivo,
        "recorridos_estudiante",
        {
          becario_id: String(id_becario),
          mes: item.periodo,
          nombre_becario: item.becario_nombre,
        }
      );

      toast.success("Expediente de recorridos descargado exitosamente");
    } catch (_error) {
      toast.error("Error al exportar el expediente de recorridos en PDF");
    } finally {
      set_descargando_pdf(false);
    }
  };

  const { datos: solicitudes_servidor, invalidar } = useConsulta<SolicitudPasajeVista[]>(
    "solicitudes_pasajes_revision",
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/pasajes");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map((item, idx) => {
            const id_becario = Number(item.becario_id || item.becario?.id || 0);
            const recorridos_mapeados: RecorridoItem[] = (item.recorridos || []).map((r: any) => ({
              id: r.id,
              fecha: r.fecha ? String(r.fecha).split("T")[0] : "2026-03-10",
              tramo: (r.tramo || "ida") as "ida" | "vuelta",
              origen: r.origen || "Origen",
              destino: r.destino || "Destino",
              tarifa: Number(r.tarifa || 2.5),
              apoyo_realizado: r.apoyo_realizado || "Apoyo institucional",
              tiene_gps: Boolean(r.lat_origen || r.lat_destino),
              calles_declaradas:
                r.calles_declaradas ||
                `${r.origen || "Origen"} → Av. Troncal → Parada Central → ${r.destino || "Destino"}`,
              medio_transporte: r.medio_transporte || "Minibús Urbano",
              tipo_actividad: r.tipo_actividad || item.tipo_actividad || "Prácticas",
              detalle_tramos_json: r.detalle_tramos_json,
            }));

            const tiene_escuela_lideres =
              esRecorridoEscuelaLideres(item.tipo_actividad) ||
              recorridos_mapeados.some((r) => esRecorridoEscuelaLideres(r.tipo_actividad));
            const recorridos_reembolsables = recorridos_mapeados.filter(
              (r) => !esRecorridoEscuelaLideres(r.tipo_actividad)
            );
            const total_reembolsable_centavos = Math.round(
              recorridos_reembolsables.reduce((acc, r) => acc + Number(r.tarifa || 0), 0) * 100
            );

            const total_centavos =
              recorridos_mapeados.length > 0 && tiene_escuela_lideres
                ? total_reembolsable_centavos
                : item.monto_total !== undefined && item.monto_total !== null
                ? Math.round(Number(item.monto_total) * 100)
                : total_reembolsable_centavos;

            const devolucion_centavos =
              recorridos_mapeados.length > 0
                ? tiene_escuela_lideres
                  ? Math.round(total_reembolsable_centavos * 0.8)
                  : item.monto_devolucion !== undefined && item.monto_devolucion !== null
                  ? Math.round(Number(item.monto_devolucion) * 100)
                  : Math.round(total_reembolsable_centavos * 0.8)
                : esRecorridoEscuelaLideres(item.tipo_actividad)
                ? 0
                : item.monto_devolucion !== undefined && item.monto_devolucion !== null
                ? Math.round(Number(item.monto_devolucion) * 100)
                : Math.round(total_centavos * 0.8);

            const liquido_centavos = devolucion_centavos;
            const liquido_bs = Number((liquido_centavos / 100).toFixed(2));

            return {
              id: item.id || 100 + idx,
              becario_id: id_becario || undefined,
              ci: item.becario?.ci ? String(item.becario.ci) : undefined,
              becario_nombre: item.becario?.nombre || item.becario?.usuario?.nombre || item.becario_nombre || `Becario ${idx + 1}`,
              iniciales: (item.becario?.nombre || item.becario?.usuario?.nombre || item.becario_nombre || "BE")
                .split(" ")
                .map((p: string) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              carrera: item.becario?.carrera || "Carrera BUMAND",
              unidad: item.becario?.unidad || "Unidad Diaconía",
              lugar_practicas: item.becario?.lugar_practica?.nombre || "Oficina Central - Bloque A",
              responsable_mentor: item.becario?.supervisor?.nombre || item.becario?.supervisor?.usuario?.nombre || "Mentor Diaconía",
              supervisor_id: item.becario?.supervisor_id ?? item.becario?.supervisor?.id ?? item.supervisor_id ?? null,
              supervisor_correo: item.becario?.supervisor?.correo ?? item.becario?.supervisor?.usuario?.correo ?? null,
              apoyo_resumen: item.apoyo_realizado || "Actividades de apoyo institucional preprofesional",
              periodo: item.periodo || "Marzo 2026",
              tipo_actividad: item.tipo_actividad || "Prácticas",
              monto_total_centavos: total_centavos,
              monto_devolucion_centavos: devolucion_centavos,
              monto_liquido_pagable: liquido_bs,
              monto_liquido_pagable_centavos: liquido_centavos,
              estado: (item.estado || "pendiente").toLowerCase() as SolicitudPasajeVista["estado"],
              observaciones: item.observaciones,
              fecha_envio: item.fecha_envio ? String(item.fecha_envio).split("T")[0] : "2026-03-24",
              revisado_por_supervisor: Boolean(item.revisado_por_supervisor || item.estado === "revisado_supervisor"),
              supervisor_revisor: item.supervisor_revisor || item.supervisor?.nombre || null,
              fecha_revision_supervisor: item.fecha_revision_supervisor ? String(item.fecha_revision_supervisor).split("T")[0] : null,
              administrador_nombre: item.administrador_nombre || item.administrador?.nombre || null,
              fecha_aprobacion_admin: item.fecha_aprobacion_admin ? String(item.fecha_aprobacion_admin).split("T")[0] : null,
              recorridos: recorridos_mapeados,
            };
          });
        }
      } catch {
        // Usa datos semilla enriquecidos
      }
      return SOLICITUDES_INICIALES;
    },
    { datos_iniciales: SOLICITUDES_INICIALES }
  );

  useEffect(() => {
    if (solicitudes_servidor && solicitudes_servidor.length > 0) {
      set_solicitudes_locales(solicitudes_servidor);
      if (id_seleccionado) {
        const encontrada = solicitudes_servidor.find((s) => s.id === id_seleccionado);
        if (encontrada) {
          set_solicitud_seleccionada(encontrada);
        }
      }
    }
  }, [solicitudes_servidor, id_seleccionado]);

  useEffect(() => {
    invalidar();
  }, [subpestana, invalidar]);

  const { es_mentor, filtrarPorMentor } = usarBecariosDesignadosMentor();

  const solicitudes = useMemo(
    () => filtrarPorMentor(solicitudes_locales),
    [solicitudes_locales, filtrarPorMentor]
  );

  const solicitud_activa: SolicitudPasajeVista | undefined =
    solicitudes.find((s) => s.id === id_seleccionado) ||
    solicitudes[0];

  const es_admin = esAdministradorAutenticado(usuario);
  const es_supervisor = esMentorAutenticado(usuario) || (!es_admin && usuario?.rol !== "becario" && Boolean(usuario));

  const total_pendientes = solicitudes.filter((s) => s.estado === "pendiente" || s.estado === "borrador").length;
  const total_revisados_supervisor = solicitudes.filter((s) => s.estado === "revisado_supervisor").length;
  const total_aprobados = solicitudes.filter((s) => s.estado === "aprobado" || s.estado === "aprobado_administracion").length;
  const total_formularios = es_mentor ? solicitudes.length : (solicitudes.length > 0 ? solicitudes.length : 16);

  const solicitudes_filtradas = solicitudes.filter((s) => {
    if (filtro_estado === "pendientes") return s.estado === "pendiente" || s.estado === "borrador";
    if (filtro_estado === "revisado_supervisor") return s.estado === "revisado_supervisor";
    if (filtro_estado === "aprobados") return s.estado === "aprobado" || s.estado === "aprobado_administracion";
    return true;
  });

  const resumen_financiero_rsd = useMemo(() => {
    return solicitudes_filtradas.reduce(
      (acc, item) => {
        const total_100 = (item.monto_total_centavos || 0) / 100;
        const reconocido_80 = (item.monto_devolucion_centavos || 0) / 100;
        return {
          total_100: acc.total_100 + total_100,
          reconocido_80: acc.reconocido_80 + reconocido_80,
          liquido_pagable: acc.liquido_pagable + reconocido_80,
        };
      },
      { total_100: 0, reconocido_80: 0, liquido_pagable: 0 }
    );
  }, [solicitudes_filtradas]);

  const indice_actual = solicitud_activa ? solicitudes.findIndex((s) => s.id === solicitud_activa.id) : -1;
  const irAnteriorBecario = () => {
    if (indice_actual > 0) {
      set_id_seleccionado(solicitudes[indice_actual - 1].id);
    }
  };
  const irSiguienteBecario = () => {
    if (indice_actual < solicitudes.length - 1) {
      set_id_seleccionado(solicitudes[indice_actual + 1].id);
    }
  };

  const { conectado } = useTiempoReal({
    eventos: {
      pasajes_actualizados: () => {
        invalidar();
      },
    },
  });

  const manejarRevisarSupervisor = async (id: number) => {
    const nombre_supervisor = usuario?.nombre || "Mentor Diaconía";
    const fecha_actual = new Date().toISOString().split("T")[0];
    try {
      await clienteApi.patch(`/api/pasajes/${id}/revisar-supervisor`, {
        supervisor_id: usuario?.id || 1,
        observaciones: "Revisado conforme en campo por mentor",
      });
      invalidar();
    } catch {
      try {
        await clienteApi.patch(`/api/pasajes/${id}`, {
          estado: "revisado_supervisor",
        });
        invalidar();
      } catch {
        // Fallback local
      }
    }

    set_solicitudes_locales((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: "revisado_supervisor",
              revisado_por_supervisor: true,
              supervisor_revisor: nombre_supervisor,
              fecha_revision_supervisor: fecha_actual,
              observaciones: "Revisado conforme por mentor · Remitido a Administración",
            }
          : s
      )
    );

    toast.success("Planilla marcada como Revisada por Mentor", {
      description: "Nivel 1 completado. La planilla fue elevada para dictamen de Administración.",
    });
    await invalidar();
  };

  const manejarAprobarAdministracion = async (id: number) => {
    const nombre_admin = usuario?.nombre || "Administración Central";
    const fecha_actual = new Date().toISOString().split("T")[0];
    try {
      await clienteApi.patch(`/api/pasajes/${id}/aprobar-administracion`, {
        administrador_id: usuario?.id || 1,
        observaciones: "Aprobado oficialmente por Administración",
      });
      invalidar();
    } catch {
      try {
        await clienteApi.patch(`/api/pasajes/${id}/aprobar`, {
          supervisor_id: usuario?.id || 1,
        });
        invalidar();
      } catch {
        // Fallback local
      }
    }

    set_solicitudes_locales((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: "aprobado_administracion",
              administrador_nombre: nombre_admin,
              fecha_aprobacion_admin: fecha_actual,
              observaciones: "Aprobado definitivamente por Administración · Acreditado 80%",
            }
          : s
      )
    );

    set_celebrando(true);
    toast.success("Planilla aprobada por Administración", {
      description: "El reembolso del 80% ha sido convalidado y acreditado institucionalmente.",
    });
    await invalidar();
  };

  const manejarAprobar = async (id: number) => {
    if (es_admin) {
      await manejarAprobarAdministracion(id);
    } else {
      await manejarRevisarSupervisor(id);
    }
  };

  const abrirModalRechazo = (sol: SolicitudPasajeVista) => {
    set_texto_observacion("");
    set_error_rechazo("");
    set_modal_observacion(true);
  };

  const manejarConfirmarRechazo = async () => {
    if (!solicitud_activa) return;
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
      description: `Se registró la observación institucional para ${solicitud_activa?.becario_nombre || ""}.`,
    });
    set_modal_observacion(false);
    await invalidar();
  };

  const [solicitud_para_eliminar, set_solicitud_para_eliminar] = useState<SolicitudPasajeVista | null>(null);
  const [recorrido_para_eliminar, set_recorrido_para_eliminar] = useState<RecorridoItem | null>(null);
  const [eliminando_pasaje, set_eliminando_pasaje] = useState(false);

  const manejarConfirmarEliminacionPasajes = async () => {
    if (!solicitud_para_eliminar && !recorrido_para_eliminar) return;
    set_eliminando_pasaje(true);
    try {
      if (recorrido_para_eliminar) {
        await clienteApi.delete(`/api/pasajes/recorridos/${recorrido_para_eliminar.id}`);
        toast.success("Tramo eliminado", {
          description: `El tramo #${recorrido_para_eliminar.id} se quitó de la base de datos y la APK.`,
        });
        set_recorrido_para_eliminar(null);
      } else if (solicitud_para_eliminar) {
        await clienteApi.delete(`/api/pasajes/${solicitud_para_eliminar.id}`);
        set_solicitudes_locales((prev) =>
          prev.filter((s) => s.id !== solicitud_para_eliminar.id)
        );
        if (solicitud_seleccionada?.id === solicitud_para_eliminar.id) {
          set_solicitud_seleccionada(null);
        }
        toast.success("Solicitud de pasajes eliminada", {
          description: `La solicitud de ${solicitud_para_eliminar.becario_nombre} fue eliminada (Web + APK).`,
        });
        set_solicitud_para_eliminar(null);
      }
      await invalidar();
    } catch (error) {
      toast.error("No se pudo eliminar el registro de pasajes", {
        description: error instanceof Error ? error.message : "Verifica tus permisos.",
      });
    } finally {
      set_eliminando_pasaje(false);
    }
  };

  const renderizarDetalleCard = (con_boton_volver = true) => !solicitud_activa ? (
    <Card className="border-[#E5E7EB] shadow-xs bg-white rounded-2xl p-10 text-center text-slate-500">
      <p className="text-sm font-medium">No hay ninguna declaración de pasajes registrada en el periodo actual.</p>
    </Card>
  ) : (
    <Card className="border-[#E5E7EB] shadow-xs bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-6 border-b border-slate-100 bg-[#FBFBFA]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {con_boton_volver && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => set_subpestana("planillas")}
                className="h-8 px-2.5 text-xs font-bold border-[#E5E7EB] text-[#035683] hover:bg-slate-100 rounded-xl gap-1 shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            )}

            <div className="w-9 h-9 rounded-full bg-[#0369A1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {solicitud_activa.iniciales}
            </div>

            <div>
              <CardTitle className="text-base font-bold text-[#0F172A] leading-tight">
                Detalle · {solicitud_activa.becario_nombre}
              </CardTitle>
              <p className="text-[11px] text-slate-500">
                {solicitud_activa.carrera} · {solicitud_activa.unidad}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Navegador secuencial de becarios */}
            <div className="flex items-center gap-1 bg-slate-100/90 px-1.5 py-1 rounded-xl border border-slate-200">
              <Button
                size="icon"
                variant="ghost"
                disabled={indice_actual <= 0}
                onClick={irAnteriorBecario}
                className="h-6 w-6 rounded-lg text-slate-600 hover:bg-white"
                title="Becario anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[11px] font-mono font-semibold text-slate-600 px-1 select-none">
                {indice_actual + 1} de {solicitudes.length}
              </span>
              <Button
                size="icon"
                variant="ghost"
                disabled={indice_actual >= solicitudes.length - 1}
                onClick={irSiguienteBecario}
                className="h-6 w-6 rounded-lg text-slate-600 hover:bg-white"
                title="Siguiente becario"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <Badge variant="outline" className="border-[#E5E7EB] text-[#035683] text-[11px] font-mono">
              {solicitud_activa.periodo}
            </Badge>

            {/* Botón de Exportación de Expediente a PDF mediante Puppeteer */}
            <Button
              size="sm"
              variant="outline"
              disabled={descargando_pdf}
              onClick={() => descargarExpedientePdf(solicitud_activa)}
              className="h-8 px-2.5 text-xs font-bold border-[#035683] text-[#035683] hover:bg-slate-100 rounded-xl gap-1.5 shadow-2xs"
              title="Descargar expediente oficial mensual de recorridos en PDF con Puppeteer"
            >
              {descargando_pdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-[#00ABBD]" />
              )}
              <span>Expediente PDF</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await exportarFormularioContabilidadRsdExcel([solicitud_activa], solicitud_activa.periodo, false);
                toast.success("Excel de Contabilidad y RSD exportado (.xlsx)");
              }}
              className="h-8 px-2.5 text-xs font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-1.5 shadow-2xs"
              title="Exportar liquidación individual a Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Excel</span>
            </Button>

            {/* Acceso directo a Historial de Paradas e Intervalo */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => set_subpestana("historial_paradas")}
              className="h-8 px-2.5 text-xs font-bold border-[#00ABBD] text-[#00808E] hover:bg-[#00ABBD]/10 rounded-xl gap-1.5 shadow-2xs"
              title="Ver el historial cronológico de paradas del estudiante en intervalos de tiempo"
            >
              <Bus className="w-3.5 h-3.5 text-[#00ABBD]" />
              <span>Ver Paradas</span>
            </Button>

            {solicitud_activa.estado === "borrador" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#007BBE] border border-[#00ABBD]/30 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007BBE] animate-pulse" />
                En Curso (APK)
              </span>
            ) : solicitud_activa.estado === "pendiente" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FBF4E4] text-[#92400E] border border-[#FDE68A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                Pendiente
              </span>
            ) : solicitud_activa.estado === "revisado_supervisor" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Revisado Ment.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Aprobado
              </span>
            )}

            {solicitud_activa.estado === "pendiente" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => abrirModalRechazo(solicitud_activa)}
                className="h-8 px-3 border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl"
              >
                Observar
              </Button>
            )}

            {(es_admin || (es_supervisor && solicitud_activa.estado !== "aprobado" && solicitud_activa.estado !== "aprobado_administracion")) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => set_solicitud_para_eliminar(solicitud_activa)}
                className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl gap-1 cursor-pointer"
                title="Eliminar solicitud completa de pasajes (Web + APK)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Tira compacta de métricas y datos clave */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Tipo Actividad</span>
            <span className="font-semibold text-slate-800 mt-0.5 inline-block">
              {solicitud_activa.tipo_actividad || "Prácticas"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Sede Asignada</span>
            <span className="font-semibold text-slate-800 mt-0.5 inline-block truncate max-w-full" title={solicitud_activa.lugar_practicas}>
              {solicitud_activa.lugar_practicas}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Mentor / Tutor</span>
            <span className="font-semibold text-slate-800 mt-0.5 inline-block truncate max-w-full" title={solicitud_activa.responsable_mentor}>
              {solicitud_activa.responsable_mentor}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#D97706] block">Devolución 80%</span>
            <span className="font-mono font-bold text-sm text-[#D97706] mt-0.5 inline-block">
              Bs {(solicitud_activa.monto_devolucion_centavos / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pestañas internas del Detalle */}
        <div className="flex border-b border-slate-200 gap-3">
          <button
            type="button"
            onClick={() => set_subpestaña_detalle("recorridos")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              subpestaña_detalle === "recorridos"
                ? "border-[#035683] text-[#035683]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Route className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>Recorridos Declarados</span>
            <Badge variant="outline" className="font-mono text-[10px] ml-1 bg-slate-50">
              {solicitud_activa.recorridos.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => set_subpestaña_detalle("firma")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              subpestaña_detalle === "firma"
                ? "border-[#035683] text-[#035683]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>Ficha de Revisión</span>
            {solicitud_activa.estado === "aprobado" ? (
              <Badge className="bg-emerald-100 text-emerald-800 font-mono text-[10px] ml-1">
                Convalidado
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 font-mono text-[10px] ml-1">
                Pendiente
              </Badge>
            )}
          </button>
        </div>

        {subpestaña_detalle === "recorridos" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Trazabilidad GPS y Paradas ({solicitud_activa.recorridos.length} tramos)
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => set_solicitud_seleccionada(solicitud_activa)}
                className="h-7 px-2.5 text-[11px] font-bold border-[#00ABBD]/60 text-[#035683] rounded-lg gap-1 hover:bg-[#00ABBD]/10"
              >
                <Eye className="w-3.5 h-3.5 text-[#00ABBD]" />
                Ver en Modal de Contabilidad
              </Button>
            </div>

            <div className="space-y-2.5">
              {solicitud_activa.recorridos.map((r) => (
                <RecorridoEnriquecidoCard
                  key={r.id}
                  recorrido={r}
                  alEliminar={
                    es_admin ||
                    (es_supervisor &&
                      solicitud_activa.estado !== "aprobado" &&
                      solicitud_activa.estado !== "aprobado_administracion")
                      ? () => set_recorrido_para_eliminar(r)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Información y Apoyo */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Resumen del Apoyo Realizado:</span>
                <p className="text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/80">
                  &ldquo;{solicitud_activa.apoyo_resumen}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 font-medium block">Total (100%):</span>
                  <span className="font-mono font-bold text-slate-800">
                    Bs {(solicitud_activa.monto_total_centavos / 100).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">80% Reconocido:</span>
                  <span className="font-mono font-bold text-[#D97706]">
                    Bs {(solicitud_activa.monto_devolucion_centavos / 100).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Líquido Pagable (Neto RSD):</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    Bs {(solicitud_activa.monto_devolucion_centavos / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trazabilidad de Revisión y Aprobación en Sistema (Flujo de 2 Niveles) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#035683]">
                  Flujo de Aprobación Institucional (2 Niveles)
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {solicitud_activa.estado === "aprobado" || solicitud_activa.estado === "aprobado_administracion"
                    ? "Aprobado Oficial por Administración (80% Acreditado)"
                    : solicitud_activa.estado === "revisado_supervisor"
                    ? "Nivel 1 Completo · En espera de dictamen de Administración"
                    : solicitud_activa.estado === "rechazado"
                    ? "Planilla Observada / Rechazada"
                    : "En espera de revisión por Mentor (Nivel 1)"}
                </span>
              </div>

              {/* Barra de progreso de 2 pasos */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Radicado Becario</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                  solicitud_activa.estado === "revisado_supervisor" || solicitud_activa.estado === "aprobado" || solicitud_activa.estado === "aprobado_administracion"
                    ? "bg-sky-50 border-sky-300 text-sky-800 font-bold"
                    : solicitud_activa.estado === "rechazado"
                    ? "bg-slate-100 border-slate-200 text-slate-400"
                    : "bg-amber-50 border-amber-200 text-amber-700 font-medium"
                }`}>
                  {(solicitud_activa.estado === "revisado_supervisor" || solicitud_activa.estado === "aprobado" || solicitud_activa.estado === "aprobado_administracion")
                    ? <Check className="w-3.5 h-3.5 text-sky-600" />
                    : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                  <span>2. Mentor</span>
                </div>
                <div className={`p-2 rounded-xl border flex items-center justify-center gap-1 ${
                  solicitud_activa.estado === "aprobado" || solicitud_activa.estado === "aprobado_administracion"
                    ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                    : solicitud_activa.estado === "rechazado"
                    ? "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                    : "bg-slate-100 border-slate-200 text-slate-400 font-medium"
                }`}>
                  {(solicitud_activa.estado === "aprobado" || solicitud_activa.estado === "aprobado_administracion")
                    ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    : <Clock className="w-3.5 h-3.5 text-slate-400" />}
                  <span>3. Administración</span>
                </div>
              </div>

              {/* Cuadros de acción / estado */}
              {solicitud_activa.estado === "aprobado" || solicitud_activa.estado === "aprobado_administracion" ? (
                <div className="w-full p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Planilla Aprobada por Administración</p>
                      <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                        Tutor: {solicitud_activa.supervisor_revisor || solicitud_activa.responsable_mentor} · Admin: {solicitud_activa.administrador_nombre || "Administración Central"} · Devolución 80% Acreditada
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono text-[11px] px-3 py-1">
                    Acreditado 80% (Bs {(solicitud_activa.monto_devolucion_centavos / 100).toFixed(2)})
                  </Badge>
                </div>
              ) : solicitud_activa.estado === "revisado_supervisor" ? (
                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-[#035683] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      Revisado por Mentor ({solicitud_activa.supervisor_revisor || solicitud_activa.responsable_mentor})
                    </p>
                    <p className="text-slate-600">
                      Nivel 1 completado. En espera de la aprobación formal por parte de Administración.
                    </p>
                  </div>
                  {es_admin && (
                    <Button
                      size="sm"
                      onClick={() => manejarAprobarAdministracion(solicitud_activa.id)}
                      className="bg-[#035683] hover:bg-[#084885] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs shrink-0 gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#FFB600]" />
                      <span>Aprobar por Administración (80%)</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">Pendiente de revisión en Nivel 1</p>
                    <p className="text-slate-500">
                      El mentor verifica los tramos y tarifas urbanas para elevar la solicitud a Administración.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!es_admin ? (
                      <Button
                        size="sm"
                        onClick={() => manejarRevisarSupervisor(solicitud_activa.id)}
                        className="bg-[#007BBE] hover:bg-[#035683] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs shrink-0 gap-1.5"
                      >
                        <Check className="w-4 h-4 text-[#FFB600]" />
                        <span>Marcar Revisado por Mentor</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => manejarAprobarAdministracion(solicitud_activa.id)}
                        className="bg-[#035683] hover:bg-[#084885] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs shrink-0 gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#FFB600]" />
                        <span>Aprobar por Administración</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
            Pasajes — Contabilidad y RSD
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Liquidación mensual del 80% de pasajes de Prácticas y Acciones de Servicio para Contabilidad y RSD
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {es_mentor && (
            <InsigniaBecariosDesignados cantidad={solicitudes.length} />
          )}
          {/* Pastilla indicadora idéntica al diseño */}
          <div className="px-4 py-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-mono text-slate-600 font-medium">
            {total_formularios} formularios · {total_pendientes} pendientes
          </div>

          {es_becario && (
            <Dialog open={modal_declarar_abierto} onOpenChange={set_modal_declarar_abierto}>
              <DialogTrigger asChild>
                <Button className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs h-9 gap-1.5 shadow-sm">
                  <Plus className="w-4 h-4 text-[#FFB600]" />
                  Declarar Recorrido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
                <RegistroRecorrido onCerrar={() => set_modal_declarar_abierto(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Barra de Formulario para Contabilidad de Pasajes por Intervalo de Fechas */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00ABBD]" />
            <span className="text-xs font-bold text-[#035683] uppercase tracking-wider">
              Formulario para Contabilidad y RSD (Expediente PDF):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Desde:</span>
            <SeleccionadorFecha
              valorString={fecha_inicio_auditoria}
              alCambiarString={(val) => set_fecha_inicio_auditoria(val)}
              className="h-8 text-xs border-[#E5E7EB] w-36"
            />
            <span className="text-[11px] text-muted-foreground font-medium">Hasta:</span>
            <SeleccionadorFecha
              valorString={fecha_fin_auditoria}
              alCambiarString={(val) => set_fecha_fin_auditoria(val)}
              className="h-8 text-xs border-[#E5E7EB] w-36"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await exportarFormularioContabilidadRsdExcel(
                solicitudes_filtradas,
                `${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}`,
                false
              );
              toast.success("Formulario para Contabilidad y RSD exportado en Excel (.xlsx)");
            }}
            className="h-8 px-3 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={descargando_pdf_consolidado}
            onClick={manejarDescargarPdfConsolidadoContabilidad}
            className="h-8 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            {descargando_pdf_consolidado ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-[#00ABBD]" />
            )}
            <span>Consolidado Contabilidad PDF</span>
          </Button>

          <Button
            size="sm"
            disabled={descargando_pdf_auditoria}
            onClick={manejarDescargarPdfAuditoria}
            className="h-8 px-3.5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            {descargando_pdf_auditoria ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB600]" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-[#FFB600]" />
            )}
            <span>Extraer Reporte PDF para Contabilidad</span>
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑAS PRINCIPALES DEL MÓDULO DE PASAJES                      */}
      {/* ============================================================== */}
      {!es_becario && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => set_subpestana("planillas")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subpestana === "planillas"
                  ? "bg-[#035683] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Formulario para Contabilidad y RSD</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                subpestana === "planillas" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {total_formularios}
              </span>
              {total_pendientes > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`${total_pendientes} pendientes`} />
              )}
            </button>

            {solicitud_activa && (
              <button
                type="button"
                onClick={() => set_subpestana("detalle")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  subpestana === "detalle"
                    ? "bg-[#035683] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detalle · {solicitud_activa.becario_nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  solicitud_activa.estado === "pendiente"
                    ? (subpestana === "detalle" ? "bg-amber-400/30 text-amber-100" : "bg-amber-100 text-amber-800")
                    : (subpestana === "detalle" ? "bg-emerald-400/30 text-emerald-100" : "bg-emerald-100 text-emerald-800")
                }`}>
                  {solicitud_activa.estado === "pendiente" ? "Pendiente" : "Aprobado"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => set_subpestana("tarifario")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subpestana === "tarifario"
                  ? "bg-[#035683] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Tarifario Regulado</span>
            </button>

            <button
              type="button"
              onClick={() => set_subpestana("historial_paradas")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                subpestana === "historial_paradas"
                  ? "bg-[#035683] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Historial de Paradas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#00ABBD]/20 text-[#00808E]">
                Intervalo
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {subpestana === "planillas" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => set_vista_dividida(!vista_dividida)}
                className="h-8 text-xs text-slate-600 hover:text-[#035683] border border-slate-200 bg-white shadow-2xs rounded-lg"
                title="Alternar vista combinada de tabla y detalle al pie"
              >
                <Columns className="w-3.5 h-3.5 mr-1.5 text-[#00ABBD]" />
                {vista_dividida ? "Ocultar Detalle al Pie" : "Ver Detalle al Pie"}
              </Button>
            )}
          </div>
        </div>
      )}

      {subpestana === "historial_paradas" ? (
        <HistorialParadasEstudiante becario_id_inicial={solicitud_activa?.becario_id || 1} />
      ) : subpestana === "tarifario" ? (
        <GestionTarifas />
      ) : subpestana === "detalle" ? (
        renderizarDetalleCard(true)
      ) : (
        <div className="space-y-6">
          <SelectorPlanillaDonacion
            tipo_disponible="transporte"
            fecha_inicio={fecha_inicio_auditoria}
            fecha_fin={fecha_fin_auditoria}
            al_cambiar_fechas={(ini, fin) => {
              set_fecha_inicio_auditoria(ini);
              set_fecha_fin_auditoria(fin);
            }}
            mostrar_selector_periodo={false}
            titulo="Planilla Donación Transporte BUMAN-D (80%)"
            subtitulo="Emite la planilla oficial consolidada de transporte al 80% para Contabilidad (Sin firma de becarios) o Archivo del Área (Con firma de becarios)."
            etiqueta_insignia="PLANILLA OFICIAL · TRANSPORTE 80%"
          />

          {/* ============================================================== */}
          {/* TARJETA 1: FORMULARIOS DEL MES (TABLA PRINCIPAL)              */}
          {/* ============================================================== */}
          <Card className="border-[#E5E7EB] shadow-xs bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    Formulario para Contabilidad y RSD
                    <Badge variant="outline" className="text-xs font-mono border-slate-200 text-slate-500">
                      {solicitudes_filtradas.length} de {solicitudes.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Liquidación mensual del 80% de pasajes de Prácticas y Acciones de Servicio para Contabilidad y RSD
                  </CardDescription>
                </div>

                {/* Pestañas de Filtrado por Estado */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("todos")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "todos"
                        ? "bg-white text-[#035683] shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Todos ({solicitudes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("pendientes")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "pendientes"
                        ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Pendientes ({total_pendientes})
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("revisado_supervisor")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "revisado_supervisor"
                        ? "bg-sky-50 text-sky-900 border border-sky-200 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Revisados ({total_revisados_supervisor})
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("aprobados")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "aprobados"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Aprobados ({total_aprobados})
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs text-slate-600 font-medium">
                  Reembolso institucional al 80% sobre Prácticas y Acciones de Servicio (las multas aplican únicamente a Escuela de Líderes).
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await exportarFormularioContabilidadRsdExcel(
                        solicitudes_filtradas,
                        solicitudes_filtradas[0]?.periodo || obtenerMesActualLaPaz(),
                        false
                      );
                      toast.success("Planilla para Contabilidad y RSD exportada a Excel (.xlsx)");
                    }}
                    className="h-8 px-3 text-xs font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exportar Excel</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#035683]/5 via-white to-emerald-50/50 border border-[#035683]/15">
                <div className="px-3 py-2 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Total 100%
                  </span>
                  <span className="font-mono font-bold text-sm text-[#035683]">
                    Bs {resumen_financiero_rsd.total_100.toFixed(2)}
                  </span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white border border-amber-200/80">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#D97706] block">
                    80% Reconocido
                  </span>
                  <span className="font-mono font-bold text-sm text-[#D97706]">
                    Bs {resumen_financiero_rsd.reconocido_80.toFixed(2)}
                  </span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-300/80">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 block">
                    Líquido Pagable Neto
                  </span>
                  <span className="font-mono font-extrabold text-base text-emerald-700">
                    Bs {resumen_financiero_rsd.liquido_pagable.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-6">BECARIO</th>
                      <th className="py-3 px-4">UNIDAD</th>
                      <th className="py-3 px-4">ACTIVIDAD</th>
                      <th className="py-3 px-4 text-center">RECORRIDOS</th>
                      <th className="py-3 px-4">TOTAL (100%)</th>
                      <th className="py-3 px-4 text-[#D97706]">80% RECONOCIDO</th>
                      <th className="py-3 px-4 text-emerald-700">LÍQUIDO PAGABLE (NETO RSD)</th>
                      <th className="py-3 px-4">ESTADO</th>
                      <th className="py-3 px-6 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solicitudes_filtradas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-xs text-slate-500">
                          No se encontraron formularios con el estado seleccionado ({filtro_estado}).
                        </td>
                      </tr>
                    ) : (
                      solicitudes_filtradas.map((item) => {
                        const es_seleccionado = Boolean(solicitud_activa && item.id === solicitud_activa.id);
                        const es_borrador = item.estado === "borrador";
                        const es_pendiente = item.estado === "pendiente";
                        const es_revisado = item.estado === "revisado_supervisor";
                        const es_aprobado = item.estado === "aprobado" || item.estado === "aprobado_administracion";
                        const monto_80_bs = item.monto_devolucion_centavos / 100;
                        const liquido_pagable = monto_80_bs;

                        return (
                          <tr
                            key={item.id}
                            onClick={() => {
                              set_id_seleccionado(item.id);
                              if (!vista_dividida) {
                                set_subpestana("detalle");
                              }
                            }}
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

                            {/* ACTIVIDAD */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  item.tipo_actividad === "Escuela de Líderes"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : item.tipo_actividad === "Acciones de Servicio"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-sky-50 text-sky-800 border-sky-200"
                                }`}
                              >
                                {item.tipo_actividad || "Prácticas"}
                              </span>
                            </td>

                            {/* RECORRIDOS */}
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-600 text-center">
                              {item.recorridos.length}
                            </td>

                            {/* TOTAL (100%) */}
                            <td className="py-3.5 px-4 text-xs font-mono text-slate-700 whitespace-nowrap">
                              Bs {(item.monto_total_centavos / 100).toFixed(2)}
                            </td>

                            {/* 80% RECONOCIDO */}
                            <td className="py-3.5 px-4 text-xs font-mono font-bold text-[#D97706] whitespace-nowrap">
                              Bs {monto_80_bs.toFixed(2)}
                            </td>

                            {/* LÍQUIDO PAGABLE (NETO RSD) */}
                            <td className="py-3.5 px-4 text-xs font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                              Bs {liquido_pagable.toFixed(2)}
                            </td>

                            {/* ESTADO CON PUNTO */}
                            <td className="py-3.5 px-4">
                              {es_borrador ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#007BBE] border border-[#00ABBD]/30 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#007BBE] animate-pulse" />
                                  En Curso (APK)
                                </span>
                              ) : es_pendiente ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FBF4E4] text-[#92400E] border border-[#FDE68A]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                                  Pendiente
                                </span>
                              ) : es_revisado ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                  Revisado Ment.
                                </span>
                              ) : es_aprobado ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                                  Aprobado Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Observado
                                </span>
                              )}
                            </td>

                            {/* ACCIÓN: BOTÓN VER DETALLE + REVISIÓN / APROBACIÓN */}
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    set_id_seleccionado(item.id);
                                    set_solicitud_seleccionada(item);
                                    set_subpestana("detalle");
                                  }}
                                  className="h-8 px-2.5 text-xs font-bold border-[#00ABBD]/60 text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg flex items-center gap-1.5 shadow-2xs"
                                  title="Ver detalles y trazabilidad de calles declaradas"
                                >
                                  <Eye className="h-4 w-4 text-[#035683]" />
                                  <span className="hidden sm:inline">Ver</span>
                                </Button>
                                {es_pendiente ? (
                                  !es_admin ? (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        manejarRevisarSupervisor(item.id);
                                      }}
                                      className="bg-[#007BBE] hover:bg-[#035683] text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-all shadow-xs h-8 gap-1"
                                      title="Marcar Revisado por Mentor"
                                    >
                                      <Check className="w-3.5 h-3.5 text-[#FFB600]" />
                                      <span>Revisar</span>
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        manejarAprobarAdministracion(item.id);
                                      }}
                                      className="bg-[#035683] hover:bg-[#084885] text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-all shadow-xs h-8 gap-1"
                                      title="Aprobar por Administración"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#FFB600]" />
                                      <span>Aprobar Admin</span>
                                    </Button>
                                  )
                                ) : es_revisado ? (
                                  es_admin ? (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        manejarAprobarAdministracion(item.id);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-all shadow-xs h-8 gap-1"
                                      title="Aprobar definitivamente por Administración"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                      <span>Aprobar Admin</span>
                                    </Button>
                                  ) : (
                                    <span className="text-[10px] font-mono text-sky-700 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200">
                                      En Admin
                                    </span>
                                  )
                                ) : (
                                  <span className="text-emerald-600 font-mono text-xs px-2 select-none font-bold">
                                    ✓ Aprobado
                                  </span>
                                )}
                                {(es_admin || (es_supervisor && !es_aprobado)) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      set_solicitud_para_eliminar(item);
                                    }}
                                    className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                    title="Eliminar solicitud de pasajes (Web + APK)"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* VISTA DIVIDIDA OPCIONAL AL PIE */}
          {vista_dividida && renderizarDetalleCard(false)}
        </div>
      )}

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: CONFIRMACIÓN DE RECHAZO CON OBSERVACIÓN         */}
      {/* ============================================================== */}
      <AlertDialog open={modal_observacion} onOpenChange={set_modal_observacion}>
        <AlertDialogContent className="sm:max-w-[440px] bg-white rounded-2xl border-[#E5E7EB]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-[#E2694B] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#E2694B]" />
              Confirmar Observación de Pasajes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Para observar la planilla de <strong>{solicitud_activa?.becario_nombre || ""}</strong>,
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
                className={`w-full p-2.5 text-xs rounded-xl border-[#E5E7EB] focus-visible:ring-[#00ABBD] ${
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

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: EXPEDIENTE DETALLADO DE RECORRIDOS (OJITO)      */}
      {/* ============================================================== */}
      <Dialog
        open={!!solicitud_seleccionada}
        onOpenChange={(abierto) => !abierto && set_solicitud_seleccionada(null)}
      >
        <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E5E7EB] shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-sm shrink-0">
                  <Bus className="w-5 h-5 text-[#035683]" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-[#035683]">
                    Expediente de Recorridos Declarados · {solicitud_seleccionada?.becario_nombre}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {solicitud_seleccionada?.carrera} · {solicitud_seleccionada?.unidad} · Periodo: {solicitud_seleccionada?.periodo}
                  </DialogDescription>
                </div>
              </div>

              <Badge variant="outline" className="border-[#E5E7EB] text-[#035683] font-mono text-xs">
                {solicitud_seleccionada?.recorridos.length} Recorridos Declarados
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            {/* Resumen General de la Solicitud */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">Mentor Asignado</span>
                <span className="font-bold text-slate-800 text-xs">{solicitud_seleccionada?.responsable_mentor}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">Sede de Prácticas</span>
                <span className="font-bold text-slate-800 text-xs">{solicitud_seleccionada?.lugar_practicas}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">Actividad Declarada</span>
                <span className="font-bold text-[#035683] text-xs">{solicitud_seleccionada?.tipo_actividad || "Prácticas"}</span>
              </div>
            </div>

            {/* Lista enriquecida con calles declaradas y teleférico paso a paso */}
            <div className="space-y-3">
              <Label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Trazabilidad de Calles, Paradas y Medios de Transporte
              </Label>

              <div className="space-y-2.5">
                {solicitud_seleccionada?.recorridos.map((r) => (
                  <RecorridoEnriquecidoCard key={r.id} recorrido={r} />
                ))}
              </div>
            </div>

            {/* Liquidación institucional del 80% y Neto RSD */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#035683] to-[#035683] text-white grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <span className="text-[11px] font-mono text-white/80 block">Total Declarado (100%):</span>
                <span className="text-lg font-mono font-bold text-white">
                  Bs {((solicitud_seleccionada?.monto_total_centavos || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#00ABBD] font-bold uppercase block">
                  80% Reconocido:
                </span>
                <span className="text-xl font-display font-bold text-[#FFB600]">
                  Bs {((solicitud_seleccionada?.monto_devolucion_centavos || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase block">
                  Líquido Pagable (Neto RSD):
                </span>
                <span className="text-2xl font-display font-bold text-emerald-300">
                  Bs {((solicitud_seleccionada?.monto_devolucion_centavos || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set_solicitud_seleccionada(null)}
              className="rounded-xl text-xs font-bold"
            >
              Cerrar Expediente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Confirmación de Eliminación (Solicitud o Tramo de Pasajes) */}
      <AlertDialog
        open={Boolean(solicitud_para_eliminar || recorrido_para_eliminar)}
        onOpenChange={(abierto) => {
          if (!abierto && !eliminando_pasaje) {
            set_solicitud_para_eliminar(null);
            set_recorrido_para_eliminar(null);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-[460px] p-6 bg-white rounded-2xl border-[#E5E7EB]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              {recorrido_para_eliminar
                ? "¿Eliminar tramo declarado?"
                : "¿Eliminar solicitud de pasajes?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              {recorrido_para_eliminar ? (
                <>
                  Se eliminará el tramo{" "}
                  <strong>
                    {recorrido_para_eliminar.origen} → {recorrido_para_eliminar.destino}
                  </strong>{" "}
                  (Bs {recorrido_para_eliminar.tarifa.toFixed(2)}) de la base de datos y se recalcularán los montos automáticamente en Web y APK.
                </>
              ) : (
                <>
                  Se eliminará la planilla de pasajes de{" "}
                  <strong className="text-[#035683]">
                    {solicitud_para_eliminar?.becario_nombre || ""}
                  </strong>{" "}
                  ({solicitud_para_eliminar?.periodo || ""}) junto con todos sus tramos en Web y APK.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel disabled={eliminando_pasaje}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              disabled={eliminando_pasaje}
              onClick={manejarConfirmarEliminacionPasajes}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
            >
              {eliminando_pasaje ? "Eliminando..." : "Sí, eliminar definitivamente"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
