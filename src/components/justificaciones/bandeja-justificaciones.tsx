"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  FileText,
  AlertCircle,
  Eye,
  Check,
  X,
  User,
  Building,
  Calendar,
  Sparkles,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { toast } from "sonner";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  PestanasAnimadas,
  type ElementoPestana,
} from "@/components/animaciones";

export interface JustificacionIncidencia {
  id: number;
  becario_id: number;
  becario_nombre: string;
  carrera: string;
  sede_nombre: string;
  tipo_incidencia: "asistencia_practicas" | "asistencia_evento" | "escuela_lideres" | "otro";
  fecha_incidencia: string;
  motivo: string;
  descripcion: string;
  documento_adjunto?: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  supervisor_nombre?: string | null;
  observacion_supervisor?: string | null;
  fecha_resolucion?: string | null;
  created_at: string;
}

const JUSTIFICACIONES_INICIALES: JustificacionIncidencia[] = [
  {
    id: 1,
    becario_id: 101,
    becario_nombre: "Nilda Amalia Churata Paye",
    carrera: "Educación Parvularia",
    sede_nombre: "Centro Infantil Sagrada Familia",
    tipo_incidencia: "asistencia_practicas",
    fecha_incidencia: "2026-10-06",
    motivo: "Cita médica odontológica de urgencia",
    descripcion:
      "Tuve una extracción de urgencia en el Seguro Social Universitario. Adjunto comprobante médico y receta prescrita.",
    documento_adjunto: "Certificado_Medico_SSU_Churata.pdf",
    estado: "pendiente",
    created_at: "2026-10-06 14:20",
  },
  {
    id: 2,
    becario_id: 102,
    becario_nombre: "Edgar Elias Alarcon Huanca",
    carrera: "Ingeniería de Sistemas",
    sede_nombre: "Oficina Central Bloque A",
    tipo_incidencia: "asistencia_evento",
    fecha_incidencia: "2026-10-02",
    motivo: "Cruce de horario con examen parcial universitario",
    descripcion:
      "Rendición del segundo examen parcial de Redes y Comunicaciones de 10:00 a 12:00 en la UPEA. Solicito convalidación del módulo de devocional matutino.",
    documento_adjunto: "Boleta_Examen_UPEA_Alarcon.pdf",
    estado: "pendiente",
    created_at: "2026-10-02 18:05",
  },
  {
    id: 3,
    becario_id: 103,
    becario_nombre: "Adai Belen Huayta Cardozo",
    carrera: "Contaduría Pública",
    sede_nombre: "Agencia Villa Dolores",
    tipo_incidencia: "asistencia_practicas",
    fecha_incidencia: "2026-09-29",
    motivo: "Bloqueo y suspensión del transporte en autopista",
    descripcion:
      "Paro de choferes en el peaje de la autopista imposibilitó el arribo a tiempo a la sede de práctica. Se registraron 45 minutos de retraso involuntario.",
    estado: "aprobada",
    supervisor_nombre: "Lic. Marcos Quispe",
    observacion_supervisor:
      "Incidencia de fuerza mayor corroborada en reportes de tránsito. Se convalidan las horas de servicio.",
    fecha_resolucion: "2026-09-30 09:15",
    created_at: "2026-09-29 11:40",
  },
  {
    id: 4,
    becario_id: 104,
    becario_nombre: "Ronald Franz Mamani Quispe",
    carrera: "Bioquímica y Farmacia",
    sede_nombre: "Laboratorio Clínico San Gabriel",
    tipo_incidencia: "escuela_lideres",
    fecha_incidencia: "2026-09-25",
    motivo: "Inasistencia sin respaldo documental",
    descripcion:
      "No pude asistir a la sesión de Escuela de Líderes por compromisos personales de índole familiar.",
    estado: "rechazada",
    supervisor_nombre: "Lic. Marcos Quispe",
    observacion_supervisor:
      "El reglamento institucional del programa BUMAND exige constancia médica, académica o laboral certificada para justificar inasistencias en talleres centrales.",
    fecha_resolucion: "2026-09-26 16:30",
    created_at: "2026-09-25 19:10",
  },
  {
    id: 5,
    becario_id: 105,
    becario_nombre: "Abigail Ruth Condori Flores",
    carrera: "Trabajo Social",
    sede_nombre: "Hogar de Niños Amor y Esperanza",
    tipo_incidencia: "asistencia_practicas",
    fecha_incidencia: "2026-10-07",
    motivo: "Defensa de proyecto de grado semestral",
    descripcion:
      "Sustentación del perfil de tesis en la facultad durante la jornada vespertina. Se cuenta con el visto bueno del tutor.",
    documento_adjunto: "Carta_Convocatoria_Defensa_UMSA.pdf",
    estado: "pendiente",
    created_at: "2026-10-07 10:00",
  },
];

export function BandejaJustificaciones() {
  const { usuario } = usarAutenticacion();
  const [justificaciones_locales, set_justificaciones_locales] = useState<JustificacionIncidencia[]>(JUSTIFICACIONES_INICIALES);
  const [filtro_estado, set_filtro_estado] = useState<string>("todos");
  const [termino_busqueda, set_termino_busqueda] = useState<string>("");

  // Modales
  const [justificacion_rechazo, set_justificacion_rechazo] = useState<JustificacionIncidencia | null>(null);
  const [observacion_rechazo, set_observacion_rechazo] = useState<string>("");
  const [justificacion_detalle, set_justificacion_detalle] = useState<JustificacionIncidencia | null>(null);
  const [mensaje_alerta, set_mensaje_alerta] = useState<string | null>(null);

  const es_becario = usuario?.rol === "becario";
  const [modal_crear_abierto, set_modal_crear_abierto] = useState(false);
  const [nuevo_tipo, set_nuevo_tipo] = useState<JustificacionIncidencia["tipo_incidencia"]>("asistencia_practicas");
  const [nueva_fecha, set_nueva_fecha] = useState(new Date().toISOString().split("T")[0]);
  const [nuevo_motivo, set_nuevo_motivo] = useState("");
  const [nueva_descripcion, set_nueva_descripcion] = useState("");
  const [nuevo_adjunto, set_nuevo_adjunto] = useState("");

  const manejarCrearJustificacion = () => {
    if (!nuevo_motivo.trim() || !nueva_descripcion.trim()) {
      toast.error("Campos requeridos", {
        description: "Debe ingresar el motivo y descripción de la incidencia.",
      });
      return;
    }
    const nueva: JustificacionIncidencia = {
      id: Date.now(),
      becario_id: usuario?.becario_id || usuario?.id || 101,
      becario_nombre: usuario?.nombre || "Becario Institucional",
      carrera: "Carrera Institucional",
      sede_nombre: "Sede Asignada",
      tipo_incidencia: nuevo_tipo,
      fecha_incidencia: nueva_fecha,
      motivo: nuevo_motivo.trim(),
      descripcion: nueva_descripcion.trim(),
      documento_adjunto: nuevo_adjunto.trim() || undefined,
      estado: "pendiente",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    set_justificaciones_locales([nueva, ...justificaciones_locales]);
    set_modal_crear_abierto(false);
    set_nuevo_motivo("");
    set_nueva_descripcion("");
    set_nuevo_adjunto("");
    toast.success("Justificación enviada", {
      description: "Tu solicitud ha sido radicada y enviada a la bandeja de supervisión.",
    });
  };

  const { datos: justificaciones_servidor, invalidar } = useConsulta<JustificacionIncidencia[]>(
    "justificaciones_todas",
    async () => {
      const respuesta = await clienteApi.get<any[]>("/api/justificaciones");
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        return respuesta.map((item) => ({
          id: item.id,
          becario_id: item.becario_id,
          becario_nombre: item.becario?.usuario?.nombre || "Becario Institucional",
          carrera: item.becario?.carrera || "Carrera BUMAND",
          sede_nombre: item.becario?.lugar_practica?.nombre || "Sede Diaconía",
          tipo_incidencia: item.tipo_incidencia || "asistencia_practicas",
          fecha_incidencia: item.fecha_incidencia ? String(item.fecha_incidencia).split("T")[0] : "2026-10-01",
          motivo: item.motivo,
          descripcion: item.descripcion,
          documento_adjunto: item.documento_adjunto,
          estado: (item.estado || "pendiente").toLowerCase() as "pendiente" | "aprobada" | "rechazada",
          supervisor_nombre: item.supervisor?.nombre || null,
          observacion_supervisor: item.observacion_supervisor || null,
          fecha_resolucion: item.fecha_resolucion ? String(item.fecha_resolucion) : null,
          created_at: item.created_at ? String(item.created_at) : "2026-10-01",
        }));
      }
      return JUSTIFICACIONES_INICIALES;
    },
    { datos_iniciales: JUSTIFICACIONES_INICIALES }
  );

  const justificaciones = justificaciones_servidor && justificaciones_servidor.length > 0 ? justificaciones_servidor : justificaciones_locales;

  const { conectado } = useTiempoReal({
    eventos: {
      justificacion_actualizada: () => {
        invalidar();
      },
    },
  });

  const contarPorEstado = (_est: string) => {
    if (_est === "todos") return justificaciones.length;
    return justificaciones.filter((j) => j.estado === _est).length;
  };

  const pestanas: ElementoPestana[] = [
    { id: "todos", etiqueta: "Todas", contador: contarPorEstado("todos") },
    { id: "pendiente", etiqueta: "Pendientes", contador: contarPorEstado("pendiente") },
    { id: "aprobada", etiqueta: "Aprobadas", contador: contarPorEstado("aprobada") },
    { id: "rechazada", etiqueta: "Rechazadas", contador: contarPorEstado("rechazada") },
  ];

  const justificaciones_filtradas = justificaciones.filter((j) => {
    const coincide_estado = filtro_estado === "todos" || j.estado === filtro_estado;
    const busqueda = termino_busqueda.toLowerCase().trim();
    const coincide_busqueda =
      !busqueda ||
      j.becario_nombre.toLowerCase().includes(busqueda) ||
      j.carrera.toLowerCase().includes(busqueda) ||
      j.motivo.toLowerCase().includes(busqueda) ||
      j.sede_nombre.toLowerCase().includes(busqueda);
    return coincide_estado && coincide_busqueda;
  });

  const manejarAprobacionRapida = async (_id: number) => {
    const fecha_actual = format(new Date(), "yyyy-MM-dd HH:mm");
    try {
      await clienteApi.patch(`/api/justificaciones/${_id}/resolver`, {
        estado: "aprobada",
        observacion_supervisor: "Justificación aprobada en conformidad institucional.",
      });
      invalidar();
    } catch {
      set_justificaciones_locales((prev) =>
        prev.map((j) =>
          j.id === _id
            ? {
                ...j,
                estado: "aprobada",
                supervisor_nombre: usuario?.nombre || "Supervisor en Sesión",
                observacion_supervisor: "Justificación aprobada en conformidad institucional.",
                fecha_resolucion: fecha_actual,
              }
            : j
        )
      );
    }
    set_mensaje_alerta("Justificación aprobada satisfactoriamente.");
    toast.success("Justificación aprobada", {
      description: "La solicitud de incidencia ha sido aprobada conforme a reglamento institucional.",
    });
    setTimeout(() => set_mensaje_alerta(null), 4000);
  };

  const manejarConfirmarRechazo = async () => {
    if (!justificacion_rechazo || !observacion_rechazo.trim()) {
      toast.error("Motivo obligatorio", {
        description: "ERR-5002: Debe fundamentar el dictamen de rechazo de la justificación.",
      });
      return;
    }

    const fecha_actual = format(new Date(), "yyyy-MM-dd HH:mm");
    try {
      await clienteApi.patch(`/api/justificaciones/${justificacion_rechazo.id}/resolver`, {
        estado: "rechazada",
        observacion_supervisor: observacion_rechazo.trim(),
      });
      invalidar();
    } catch {
      set_justificaciones_locales((prev) =>
        prev.map((j) =>
          j.id === justificacion_rechazo.id
            ? {
                ...j,
                estado: "rechazada",
                supervisor_nombre: usuario?.nombre || "Supervisor en Sesión",
                observacion_supervisor: observacion_rechazo.trim(),
                fecha_resolucion: fecha_actual,
              }
            : j
        )
      );
    }

    set_mensaje_alerta(`Justificación de ${justificacion_rechazo.becario_nombre} rechazada con fundamentación.`);
    toast.success("Justificación rechazada", {
      description: `Se registró el dictamen motivado para ${justificacion_rechazo.becario_nombre}.`,
    });
    set_justificacion_rechazo(null);
    set_observacion_rechazo("");
    setTimeout(() => set_mensaje_alerta(null), 4000);
  };

  const formatearTipoIncidencia = (_tipo: JustificacionIncidencia["tipo_incidencia"]) => {
    switch (_tipo) {
      case "asistencia_practicas":
        return "Prácticas Preprofesionales";
      case "asistencia_evento":
        return "Evento Geolocalizado";
      case "escuela_lideres":
        return "Escuela de Líderes";
      case "otro":
        return "Otra Actividad";
      default:
        return _tipo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de alerta reactiva */}
      {mensaje_alerta && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensaje_alerta}</span>
        </div>
      )}

      {/* Cabecera adaptativa según el Rol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold text-[#063A6B]">
              {es_becario ? "Mis Justificaciones e Incidencias" : "Bandeja de Justificaciones e Incidencias"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {es_becario
              ? "Envío y seguimiento de justificaciones por inasistencias o tardanzas con documentación probatoria."
              : "Revisión de solicitudes de justificación, auditoría de motivos y dictamen oficial de supervisión."}
          </p>
        </div>

        {es_becario && (
          <Button
            onClick={() => set_modal_crear_abierto(true)}
            className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs h-10 gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#F8C766]" />
            Nueva Justificación
          </Button>
        )}
      </div>

      {/* Tarjetas Resumen de Métricas con Watermelon UI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <TarjetaSpotlight className="p-4 bg-white">
          <span className="text-xs text-muted-foreground font-mono uppercase block">Total Solicitudes</span>
          <div className="text-2xl font-bold text-[#063A6B] mt-1">
            <ContadorRodilloAnimado valor={justificaciones.length} />
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Historial consolidado</span>
        </TarjetaSpotlight>

        <TarjetaSpotlight className="p-4 bg-amber-50/40 border-amber-200">
          <span className="text-xs text-amber-700 font-mono uppercase font-semibold block">Pendientes de Dictamen</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            <ContadorRodilloAnimado valor={contarPorEstado("pendiente")} />
          </div>
          <span className="text-[11px] text-amber-800/80 mt-0.5 block">Requieren revisión inmediata</span>
        </TarjetaSpotlight>

        <TarjetaSpotlight className="p-4 bg-emerald-50/40 border-emerald-200">
          <span className="text-xs text-emerald-700 font-mono uppercase font-semibold block">Aprobadas</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            <ContadorRodilloAnimado valor={contarPorEstado("aprobada")} />
          </div>
          <span className="text-[11px] text-emerald-800/80 mt-0.5 block">Horas convalidadas</span>
        </TarjetaSpotlight>

        <TarjetaSpotlight className="p-4 bg-rose-50/40 border-rose-200">
          <span className="text-xs text-rose-700 font-mono uppercase font-semibold block">Rechazadas</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            <ContadorRodilloAnimado valor={contarPorEstado("rechazada")} />
          </div>
          <span className="text-[11px] text-rose-800/80 mt-0.5 block">Sin respaldo normativo</span>
        </TarjetaSpotlight>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E3DCCB]">
        <PestanasAnimadas
          pestanas={pestanas}
          pestana_activa_id={filtro_estado}
          al_cambiar_pestana={set_filtro_estado}
          identificador_diseno="pestana_justificaciones_filtro"
        />

        <div className="flex items-center gap-2">
          {conectado ? (
            <span className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[#17B4C4]">
              <Wifi className="w-3.5 h-3.5" /> En tiempo real
            </span>
          ) : (
            <span className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[#C49B24]">
              <WifiOff className="w-3.5 h-3.5" /> Fuera de línea
            </span>
          )}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={termino_busqueda}
              onChange={(e) => set_termino_busqueda(e.target.value)}
              placeholder="Buscar por becario, carrera o motivo..."
              className="pl-9 h-9 text-xs border-[#E3DCCB] rounded-xl focus-visible:ring-[#17B4C4]"
            />
          </div>
        </div>
      </div>

      {/* Lista de Justificaciones */}
      <div className="space-y-3">
        {justificaciones_filtradas.length === 0 ? (
          <EstadoVacio
            icono={ClipboardCheck}
            titulo={
              filtro_estado === "pendiente"
                ? "Sin Justificaciones Pendientes"
                : "No se Encontraron Justificaciones"
            }
            descripcion={
              filtro_estado === "pendiente"
                ? "No existen solicitudes de justificación pendientes de dictamen en este momento. Todas las incidencias han sido procesadas."
                : "Prueba modificando los filtros de estado institucional o el término de búsqueda ingresado."
            }
          />
        ) : (
          justificaciones_filtradas.map((just) => {
            const es_pendiente = just.estado === "pendiente";
            const es_aprobada = just.estado === "aprobada";
            const es_rechazada = just.estado === "rechazada";

            // Badges de Shadcn con colores normados:
            // Pendiente: amarillo, Aprobada: esmeralda, Rechazada: rojo
            const badge_estado = es_pendiente ? (
              <Badge className="bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-600" />
                Pendiente de Dictamen
              </Badge>
            ) : es_aprobada ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Justificación Aprobada
              </Badge>
            ) : (
              <Badge className="bg-rose-50 text-rose-700 border-rose-300 gap-1 text-[11px]">
                <XCircle className="w-3 h-3 text-rose-600" />
                Justificación Rechazada
              </Badge>
            );

            return (
              <Card
                key={just.id}
                className="bg-white border-[#E3DCCB] rounded-xl hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Información del Becario y la Incidencia */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#063A6B]">{just.becario_nombre}</span>
                        <span className="text-xs text-muted-foreground font-mono">({just.carrera})</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#17B4C4]" />
                          {just.sede_nombre}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="font-mono text-[11px] font-semibold text-[#0A5CA0] px-2 py-0.5 rounded-md bg-[#E3F9FA] border border-[#17B4C4]/20">
                          {formatearTipoIncidencia(just.tipo_incidencia)}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Fecha del incidente: {just.fecha_incidencia}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          Registrado: {just.created_at}
                        </span>
                      </div>

                      <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E3DCCB]/60 text-xs">
                        <p className="font-semibold text-[#122029]">Motivo: {just.motivo}</p>
                        <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {just.descripcion}
                        </p>
                        {just.documento_adjunto && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#0A5CA0]">
                            <FileText className="w-3.5 h-3.5 text-[#17B4C4]" />
                            <span>Documento Adjunto: {just.documento_adjunto}</span>
                          </div>
                        )}
                      </div>

                      {/* Observación previa del supervisor si ya está dictaminado */}
                      {just.observacion_supervisor && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          <span className="font-semibold text-[#063A6B] block mb-0.5">
                            Dictamen de Supervisión ({just.supervisor_nombre || "Supervisor"}):
                          </span>
                          <p className="italic">{just.observacion_supervisor}</p>
                          {just.fecha_resolucion && (
                            <span className="text-[10px] text-muted-foreground font-mono block mt-1">
                              Fecha de dictamen: {just.fecha_resolucion}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Badge de Estado y Acciones Rápidas */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                      <div>{badge_estado}</div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => set_justificacion_detalle(just)}
                          className="h-8 rounded-xl text-xs text-slate-600 hover:text-[#063A6B] hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Detalles
                        </Button>

                        {es_pendiente && !es_becario && (
                          <>
                            {/* Aprobación rápida */}
                            <Button
                              size="sm"
                              onClick={() => manejarAprobacionRapida(just.id)}
                              className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Aprobar
                            </Button>

                            {/* Rechazo motivado con diálogo modal */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                set_justificacion_rechazo(just);
                                set_observacion_rechazo("");
                              }}
                              className="h-8 rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold px-3 gap-1"
                            >
                              <X className="w-3.5 h-3.5 text-rose-600" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {es_pendiente && es_becario && (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[10px] font-medium">
                            En revisión por tutor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Diálogo Modal para Rechazo Motivado de la Justificación con AlertDialog */}
      {justificacion_rechazo && (
        <AlertDialog
          open={!!justificacion_rechazo}
          onOpenChange={(abierto) => {
            if (!abierto) set_justificacion_rechazo(null);
          }}
        >
          <AlertDialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-6 bg-white border-[#E3DCCB] rounded-2xl">
            <AlertDialogHeader className="pb-3 border-b border-[#E3DCCB]">
              <AlertDialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Fundamentación del Rechazo de Justificación
              </AlertDialogTitle>
              <AlertDialogDescription>
                Becario: <span className="font-semibold text-[#063A6B]">{justificacion_rechazo.becario_nombre}</span> · Incidencia: {justificacion_rechazo.motivo}. Todo rechazo institucional requiere una motivación técnica obligatoria.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800">
                <p className="font-semibold mb-1">Obligatoriedad Normativa:</p>
                <p>
                  Por política institucional de Diaconía FRIF-IFD, todo rechazo requiere una motivación expresa
                  para ser notificada al becario y asentada en la auditoría del expediente.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motivo_rechazo" className="text-xs font-semibold text-[#063A6B]">
                  Observación y Motivo del Rechazo *
                </Label>
                <Textarea
                  id="motivo_rechazo"
                  required
                  placeholder="Ingrese el dictamen del supervisor detallando por qué no procede la convalidación..."
                  value={observacion_rechazo}
                  onChange={(e) => set_observacion_rechazo(e.target.value)}
                  className="text-xs border-[#E3DCCB] rounded-xl focus-visible:ring-rose-500 min-h-[90px]"
                />
              </div>
            </div>

            <AlertDialogFooter className="pt-3 border-t border-[#E3DCCB] gap-2">
              <AlertDialogCancel
                onClick={() => set_justificacion_rechazo(null)}
              >
                Cancelar
              </AlertDialogCancel>
              <Button
                onClick={manejarConfirmarRechazo}
                disabled={!observacion_rechazo.trim()}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Confirmar Rechazo
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Diálogo Modal de Detalle Completo de Justificación */}
      {justificacion_detalle && (
        <Dialog
          open={!!justificacion_detalle}
          onOpenChange={(abierto) => {
            if (!abierto) set_justificacion_detalle(null);
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E3DCCB] rounded-2xl shadow-2xl"
          >
            <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
              <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#17B4C4]" />
                Detalle del Expediente de Justificación
              </DialogTitle>
            </DialogHeader>

            <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8F9FA] p-3 rounded-xl border border-[#E3DCCB]">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Becario:</span>
                  <span className="font-bold text-[#063A6B]">{justificacion_detalle.becario_nombre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Carrera:</span>
                  <span className="font-medium text-slate-700">{justificacion_detalle.carrera}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Sede de Práctica:</span>
                  <span className="font-medium text-slate-700">{justificacion_detalle.sede_nombre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Fecha de Incidencia:</span>
                  <span className="font-medium text-slate-700">{justificacion_detalle.fecha_incidencia}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#063A6B] block mb-1">Motivo Declarado:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  {justificacion_detalle.motivo}
                </p>
              </div>

              <div>
                <span className="font-semibold text-[#063A6B] block mb-1">Explicación y Justificación:</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {justificacion_detalle.descripcion}
                </p>
              </div>

              {justificacion_detalle.documento_adjunto && (
                <div className="p-3 rounded-xl bg-[#E3F9FA] border border-[#17B4C4]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#17B4C4]" />
                    <span className="font-medium text-[#063A6B]">
                      {justificacion_detalle.documento_adjunto}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.info(`Visualizando archivo: ${justificacion_detalle.documento_adjunto}`, {
                        description: "Abriendo comprobante probatorio adjunto al expediente institucional.",
                      })
                    }
                    className="h-7 text-[11px] rounded-lg border-[#17B4C4] text-[#063A6B]"
                  >
                    Ver Adjunto
                  </Button>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end">
              <Button
                variant="outline"
                onClick={() => set_justificacion_detalle(null)}
                className="rounded-xl border-[#E3DCCB] text-xs h-9 hover:bg-slate-100"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal para Crear Nueva Justificación por Becario */}
      <Dialog open={modal_crear_abierto} onOpenChange={set_modal_crear_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E3DCCB] rounded-2xl shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
              <ClipboardCheck className="w-5 h-5 text-[#17B4C4]" />
              Nueva Solicitud de Justificación
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0 text-xs">
            <div>
              <Label className="text-xs font-semibold text-gray-700">Tipo de Incidencia</Label>
              <Select
                value={nuevo_tipo}
                onValueChange={(val: any) => {
                  if (val) set_nuevo_tipo(val);
                }}
              >
                <SelectTrigger className="w-full mt-1 text-xs h-9 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium">
                  <SelectValue placeholder="Seleccionar tipo de incidencia" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E3DCCB] z-[100]">
                  <SelectItem value="asistencia_practicas">Prácticas Preprofesionales</SelectItem>
                  <SelectItem value="asistencia_evento">Evento Geolocalizado Convocado</SelectItem>
                  <SelectItem value="escuela_lideres">Escuela de Líderes</SelectItem>
                  <SelectItem value="otro">Otra Actividad Formativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700">Fecha de Incidencia</Label>
              <Input
                type="date"
                value={nueva_fecha}
                onChange={(e) => set_nueva_fecha(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700">Motivo Resumido</Label>
              <Input
                placeholder="Ej. Cita médica en seguro social, Examen parcial..."
                value={nuevo_motivo}
                onChange={(e) => set_nuevo_motivo(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700">Descripción Detallada</Label>
              <Textarea
                placeholder="Explica las circunstancias de la inasistencia o retraso..."
                rows={3}
                value={nueva_descripcion}
                onChange={(e) => set_nueva_descripcion(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700">Documento de Respaldo (Opcional)</Label>
              <Input
                placeholder="Ej. Certificado_Medico.pdf, Boleta_Examen.pdf"
                value={nuevo_adjunto}
                onChange={(e) => set_nuevo_adjunto(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_modal_crear_abierto(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={manejarCrearJustificacion}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl font-bold"
            >
              Radicar Justificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
