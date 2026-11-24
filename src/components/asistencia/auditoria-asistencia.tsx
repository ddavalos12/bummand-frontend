"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Eye,
  Check,
  Building,
  User,
  Calendar,
  Sparkles,
  Navigation,
  X,
  ExternalLink,
  Coins,
  Map,
  ListChecks,
  Plus,
  Trash2,
  ClipboardCheck,
  Printer,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import {
  DialogoJustificarFalta,
  type IncidenciaAsistenciaInicial,
} from "./dialogo-justificar-falta";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
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
  InsigniaPulsoVivo,
} from "@/components/animaciones";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import {
  esAdministradorAutenticado,
  esMentorAutenticado,
  usarBecariosDesignadosMentor,
} from "@/lib/filtro-mentor";
import { InsigniaBecariosDesignados } from "@/components/ui/insignia-becarios-designados";
import { toast } from "sonner";
import { descargarPdfConResiliencia } from "@/lib/generador-pdf-cliente";
import { exportarAuditoriaAsistenciaExcel } from "@/lib/generador-excel-cliente";
import {
  generarMesesGestion,
  obtenerMesActualLaPaz,
  obtenerRangoMesActualLaPaz,
} from "@/lib/fechas-institucionales";

export interface RegistroAuditoriaAsistencia {
  id: number;
  becario_id: number;
  becario_nombre: string;
  carrera: string;
  sede_nombre: string;
  fecha: string;
  hora_ingreso: string;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  distancia_ingreso_m: number;
  dentro_de_radio: boolean;
  dentro_de_horario: boolean;
  estado: "conforme" | "tardanza" | "fuera_geocerca" | "en_curso" | "convalidado" | "revisado_supervisor" | "aprobado_administracion";
  convalidado_por?: string | null;
  motivo_convalidacion?: string | null;
  lat_ingreso?: number;
  lng_ingreso?: number;
  es_viernes?: boolean;
  minutos_retraso?: number;
  monto_multa_bs?: number;
  confirmacion_presencial?: boolean;
  tipo_actividad?: "practicas" | "escuela_lideres" | "acciones_servicio";
  motivo_contingencia?: string;
  es_registro_manual?: boolean;
  revisado_por_supervisor?: boolean;
  fecha_revision_supervisor?: string | null;
  supervisor_revisor?: string | null;
  administrador_revisor?: string | null;
  fecha_aprobacion_admin?: string | null;
  exime_multa?: boolean;
  ci?: string;
  supervisor_id?: number | null;
  supervisor_nombre?: string | null;
}

export interface BecarioOficial {
  id: number;
  nombre: string;
  ci: string;
  carrera: string;
  unidad: string;
  iglesia: string;
}

export const LISTA_23_BECARIOS_OFICIALES: BecarioOficial[] = [
  { id: 1, nombre: "Adai Belen Huayta Cardozo", ci: "13696496", carrera: "Estadística", unidad: "Productos y Canales", iglesia: "Sinai Los Andes" },
  { id: 2, nombre: "Daniel Davalos Quiñonez", ci: "9107373", carrera: "Informática", unidad: "Seguridad Física", iglesia: "IGLESIA METODISTA MONTE DE HOREB" },
  { id: 3, nombre: "Edgar Elías Alarcon Huanca", ci: "9160054", carrera: "Medicina", unidad: "Consultorio Médico", iglesia: "Eli - Ezer" },
  { id: 4, nombre: "Nilda Amalia Churata Paye", ci: "10028341", carrera: "Educación Parvularia", unidad: "Seguridad Física", iglesia: "Iglesia Evangélica Amigos Central de Bolivia" },
  { id: 5, nombre: "Alejandro Roberth Paredes Tarquino", ci: "10064956", carrera: "Comunicación Social", unidad: "Marketing y Comunicación", iglesia: "Centró Evangelistico Caluyo" },
  { id: 6, nombre: "Aydee Ruth Ali Condori", ci: "9952878", carrera: "Contaduría Pública", unidad: "Finanzas y Tesorería", iglesia: "Iglesia del Nazareno El Progreso" },
  { id: 7, nombre: "Carlos Oscar Luna Lizarraga", ci: "9943280", carrera: "Economía", unidad: "Auditoría Interna", iglesia: "Nazareno 6 de junio" },
  { id: 8, nombre: "Isaías Daniel Herrera Mamani", ci: "10920862", carrera: "Arquitectura", unidad: "Subgerencia Nacional de Administración", iglesia: "Bautista para la familia" },
  { id: 9, nombre: "José Marcos Suñagua Quispe", ci: "14378720", carrera: "Informática", unidad: "Riesgos", iglesia: "6 de Junio" },
  { id: 10, nombre: "Mariela Dayana Jimenez Chambi", ci: "12959656", carrera: "Contaduría Pública", unidad: "Seguros", iglesia: "Ministerio misión Boliviana" },
  { id: 11, nombre: "Mayherli Alejandra Loza Villalobos", ci: "9925727", carrera: "Contaduría Pública", unidad: "Finanzas y Tesorería", iglesia: "CANAAN" },
  { id: 12, nombre: "Noemi Callisaya Alvarez", ci: "7093658", carrera: "Psicomotricidad y Deportes", unidad: "Consultorio Médico", iglesia: "\"El Progreso\"" },
  { id: 13, nombre: "Ronald Mauricio Quiquijana Mayta", ci: "6172054", carrera: "Ingeniería en Telecomunicaciones", unidad: "Seguridad de la Información", iglesia: "Centro Evangelistico Caluyo" },
  { id: 14, nombre: "Ruddy Flores Tapia", ci: "9974211", carrera: "Informática", unidad: "Planificación, Control y Presupuesto", iglesia: "Iglesia del Nazareno Río Seco" },
  { id: 15, nombre: "Gonzalo Valencia Laura", ci: "8416501", carrera: "Contaduría Pública", unidad: "Contabilidad e Impuestos", iglesia: "Iglesia Central El Alto" },
  { id: 16, nombre: "Gustavo Ariel Condori Montaño", ci: "13088041", carrera: "Contaduría Pública", unidad: "Captaciones y Canales", iglesia: "Iglesia Central El Alto" },
  { id: 17, nombre: "Lisbeth Pacasi Machaca", ci: "13603536", carrera: "Bioquímica y Farmacia", unidad: "Consultorio Médico", iglesia: "Iglesia Central El Alto" },
  { id: 18, nombre: "Selena Fernanda Pillco Mamani", ci: "13693151", carrera: "Economía", unidad: "Captaciones y Canales", iglesia: "Iglesia Central El Alto" },
  { id: 19, nombre: "Milenka Quispe Coarite", ci: "14155448", carrera: "Administración de Empresas", unidad: "Procesos y Normas", iglesia: "Iglesia Central El Alto" },
  { id: 20, nombre: "Joselin Wara Huanca Paucara", ci: "12604724", carrera: "Contaduría Pública", unidad: "Cumplimiento", iglesia: "Iglesia Central El Alto" },
  { id: 21, nombre: "Johan Ludving Misme Flores", ci: "9208456", carrera: "Informática", unidad: "Seguridad de la Información", iglesia: "Iglesia Central El Alto" },
  { id: 22, nombre: "Matias Jose Uri Flores", ci: "13627440", carrera: "Lingüística e Idiomas", unidad: "Sostenibilidad y Responsabilidad Diaconal", iglesia: "Iglesia Central El Alto" },
  { id: 23, nombre: "Mateo Miguel Cussi Flores", ci: "8411610", carrera: "Informática", unidad: "Seguros", iglesia: "Iglesia Central El Alto" },
];

export const SEDES_POR_ACTIVIDAD = {
  practicas: [
    "Oficina Central Bloque A",
  ],
  escuela_lideres: [
    "Sede Central (Auditorio Central Diaconía)",
  ],
  acciones_servicio: [
    "Sede Central Bloque A (Diaconía)",
  ],
};

export const MOTIVOS_CONTINGENCIA = [
  "Sin megas / sin conexión a internet en el celular",
  "Olvido involuntario de marcación en app",
  "Batería agotada / falla del dispositivo",
  "Problemas de cobertura satelital GPS en sede",
];

export function calcularHorasTranscurridas(ingreso: string, salida: string): number {
  if (!ingreso || !salida) return 0;
  const [h_ing, m_ing] = ingreso.split(":").map(Number);
  const [h_sal, m_sal] = salida.split(":").map(Number);
  if (isNaN(h_ing) || isNaN(m_ing) || isNaN(h_sal) || isNaN(m_sal)) return 0;
  const minutos = (h_sal * 60 + m_sal) - (h_ing * 60 + m_ing);
  if (minutos <= 0) return 0;
  return Math.round((minutos / 60) * 100) / 100;
}

const REGISTROS_AUDITORIA_INICIALES: RegistroAuditoriaAsistencia[] = [];

export function calcularMultaEscuelaLideres(minutos: number): number {
  if (minutos <= 0) return 0;
  if (minutos <= 10) return 10;
  if (minutos <= 30) return 20;
  if (minutos <= 60) return 30;
  return 50;
}

export interface HorasMensualesBecario {
  id: number;
  becario_id: number;
  nombre: string;
  ci: string;
  carrera: string;
  sede: string;
  mes: string;
  horas_realizadas: number;
  meta_horas: number;
  dias_asistidos: number;
  tardanzas_viernes: number;
  multas_acumuladas_bs: number;
  estado_meta: "cumplido" | "en_progreso" | "en_riesgo";
}

export const REGISTROS_HORAS_MENSUALES_INICIALES: HorasMensualesBecario[] = [];

interface AuditoriaAsistenciaProps {
  rol?: string;
}

export function AuditoriaAsistencia({ rol }: AuditoriaAsistenciaProps) {
  const { usuario } = usarAutenticacion();
  const { es_mentor: es_mentor_hook, becarios_designados, filtrarPorMentor } =
    usarBecariosDesignadosMentor();
  const es_admin = esAdministradorAutenticado(rol) || esAdministradorAutenticado(usuario);
  const es_mentor = !es_admin && (esMentorAutenticado(rol) || es_mentor_hook);
  const es_supervisor = es_mentor || (!es_admin && !usuario?.rol);
  const es_admin_o_supervisor =
    es_admin ||
    es_mentor ||
    !usuario?.rol;

  // Estados para Cambio Dinámico de Lugar en Acciones de Servicio (Viernes) - TAREA-01
  const [modal_cambiar_lugar_abierto, set_modal_cambiar_lugar_abierto] = useState<boolean>(false);
  const [cambio_evento_id, set_cambio_evento_id] = useState<string>("1");
  const [cambio_sede, set_cambio_sede] = useState<string>(SEDES_POR_ACTIVIDAD.acciones_servicio[0]);
  const [cambio_latitud, set_cambio_latitud] = useState<string>("-16.500054");
  const [cambio_longitud, set_cambio_longitud] = useState<string>("-68.173455");
  const [cambio_radio, set_cambio_radio] = useState<string>("120");
  const [cambio_referencia, set_cambio_referencia] = useState<string>(SEDES_POR_ACTIVIDAD.acciones_servicio[0]);
  const [cambio_motivo, set_cambio_motivo] = useState<string>("");
  const [cambio_guardando, set_cambio_guardando] = useState<boolean>(false);

  // Estados para Registro Manual de Asistencia (Contingencia sin Megas / Olvido)
  const [modal_manual_abierto, set_modal_manual_abierto] = useState<boolean>(false);
  const [manual_becario_id, set_manual_becario_id] = useState<number>(1);
  const [manual_tipo_actividad, set_manual_tipo_actividad] = useState<
    "practicas" | "escuela_lideres" | "acciones_servicio"
  >("practicas");
  const [manual_fecha, set_manual_fecha] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );
  const [manual_hora_ingreso, set_manual_hora_ingreso] = useState<string>("08:30");
  const [manual_hora_salida, set_manual_hora_salida] = useState<string>("12:30");
  const [manual_sede, set_manual_sede] = useState<string>(SEDES_POR_ACTIVIDAD.practicas[0]);
  const [manual_motivo, set_manual_motivo] = useState<string>(MOTIVOS_CONTINGENCIA[0]);
  const [manual_motivo_personalizado, set_manual_motivo_personalizado] = useState<string>("");
  const [manual_guardando, set_manual_guardando] = useState<boolean>(false);

  const {
    confirmarCierreSinCompletar,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  const tiene_cambios_manual =
    manual_becario_id !== 1 ||
    manual_tipo_actividad !== "practicas" ||
    manual_motivo !== MOTIVOS_CONTINGENCIA[0] ||
    manual_motivo_personalizado.trim() !== "" ||
    manual_hora_ingreso !== "08:30" ||
    manual_hora_salida !== "12:30";

  const intentarCerrarModalManual = () => {
    confirmarCierreSinCompletar(
      tiene_cambios_manual,
      () => {
        set_modal_manual_abierto(false);
      },
      "Asistencia Manual"
    );
  };

  const [registros_locales, set_registros_locales] = useState<RegistroAuditoriaAsistencia[]>(
    REGISTROS_AUDITORIA_INICIALES
  );
  const [termino_busqueda, set_termino_busqueda] = useState("");
  const [filtro_estado, set_filtro_estado] = useState("todos");
  const [filtro_sede, set_filtro_sede] = useState("todas");

  // Sub-vista de Control de Asistencia: En Vivo vs Consolidado Mensual
  const [vista_activa, set_vista_activa] = useState<"en_vivo" | "mensual">("en_vivo");
  const [mes_seleccionado, set_mes_seleccionado] = useState<string>(() => obtenerMesActualLaPaz());
  const opciones_meses_gestion = React.useMemo(() => generarMesesGestion(), []);
  const [filtro_estado_mensual, set_filtro_estado_mensual] = useState<string>("todos");
  const [becario_detalle_mensual, set_becario_detalle_mensual] =
    useState<HorasMensualesBecario | null>(null);

  const { datos: horas_mensuales_servidor, invalidar: invalidarHorasMensuales } = useConsulta<HorasMensualesBecario[]>(
    `horas_mensuales_${mes_seleccionado}`,
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>(
          `/asistencia/horas-mensuales?mes=${mes_seleccionado}`
        );
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map((item, idx) => ({
            id: item.id || idx + 1,
            becario_id: item.becario_id || idx + 1,
            nombre: item.becario?.nombre || item.becario?.usuario?.nombre || item.nombre || `Becario ${idx + 1}`,
            ci: item.becario?.ci || item.ci || "—",
            carrera: item.becario?.carrera || item.carrera || "Carrera BUMAND",
            sede: item.becario?.lugar_practica?.nombre || item.sede || "Sede Diaconía",
            mes: mes_seleccionado,
            horas_realizadas: Number(item.horas_realizadas || item.total_horas || 0),
            meta_horas: Number(item.meta_horas || 36.0),
            dias_asistidos: Number(item.dias_asistidos || 10),
            tardanzas_viernes: Number(item.tardanzas_viernes || 0),
            multas_acumuladas_bs: Number(item.multas_acumuladas_bs || 0),
            estado_meta: (item.estado_meta ||
              (Number(item.horas_realizadas || 0) >= Number(item.meta_horas || 36)
                ? "cumplido"
                : Number(item.horas_realizadas || 0) >= 27
                ? "en_progreso"
                : "en_riesgo")) as any,
          }));
        }
      } catch {
        // Sin registros simulados ante error o vacío
      }
      return [];
    },
    { datos_iniciales: REGISTROS_HORAS_MENSUALES_INICIALES }
  );

  const [horas_mensuales_locales, set_horas_mensuales_locales] = useState<HorasMensualesBecario[]>(
    REGISTROS_HORAS_MENSUALES_INICIALES
  );

  useEffect(() => {
    if (Array.isArray(horas_mensuales_servidor)) {
      set_horas_mensuales_locales(horas_mensuales_servidor);
    }
  }, [horas_mensuales_servidor]);

  const lista_horas_mensuales = useMemo(
    () => filtrarPorMentor(horas_mensuales_locales),
    [horas_mensuales_locales, filtrarPorMentor]
  );

  const becarios_manual_disponibles = useMemo(
    () => filtrarPorMentor(LISTA_23_BECARIOS_OFICIALES),
    [filtrarPorMentor]
  );

  useEffect(() => {
    if (
      becarios_manual_disponibles.length > 0 &&
      !becarios_manual_disponibles.some((b) => b.id === Number(manual_becario_id))
    ) {
      set_manual_becario_id(becarios_manual_disponibles[0].id);
    }
  }, [becarios_manual_disponibles, manual_becario_id]);

  const manejarGuardarAsistenciaManual = async () => {
    const becario_encontrado =
      becarios_manual_disponibles.find((b) => b.id === Number(manual_becario_id)) ||
      becarios_manual_disponibles[0] ||
      LISTA_23_BECARIOS_OFICIALES[0];
    const motivo_final =
      manual_motivo === "otro"
        ? manual_motivo_personalizado.trim() || "Contingencia de marcación autorizada"
        : manual_motivo;
    const horas_efectivas = calcularHorasTranscurridas(manual_hora_ingreso, manual_hora_salida);

    if (horas_efectivas <= 0) {
      toast.error("Horas inválidas", {
        description: "La hora de salida debe ser posterior a la hora de ingreso.",
      });
      return;
    }

    set_manual_guardando(true);

    const payload = {
      becario_id: becario_encontrado.id,
      tipo: manual_tipo_actividad,
      fecha: manual_fecha,
      hora_ingreso: manual_hora_ingreso,
      hora_salida: manual_hora_salida,
      lugar_nombre: manual_sede,
      motivo_contingencia: motivo_final,
      horas_trabajadas: horas_efectivas,
      registrado_por: usuario?.nombre || "Administrador",
    };

    try {
      await clienteApi.post("/asistencia/manual", payload);
    } catch (err) {
      console.warn("Aviso de sincronización remota (modo local/offline habilitado):", err);
    }

    // 1. Añadir el registro a registros_locales
    const nuevo_registro: RegistroAuditoriaAsistencia = {
      id: Date.now(),
      becario_id: becario_encontrado.id,
      becario_nombre: becario_encontrado.nombre,
      carrera: becario_encontrado.carrera,
      sede_nombre: manual_sede,
      fecha: manual_fecha,
      hora_ingreso: manual_hora_ingreso,
      hora_salida: manual_hora_salida,
      horas_trabajadas: horas_efectivas,
      distancia_ingreso_m: 0,
      dentro_de_radio: true,
      dentro_de_horario: true,
      estado: "conforme",
      convalidado_por: usuario?.nombre || "Administrador",
      motivo_convalidacion: `Registro Manual (Contingencia: ${motivo_final})`,
      tipo_actividad: manual_tipo_actividad,
      motivo_contingencia: motivo_final,
      es_registro_manual: true,
    };

    set_registros_locales((prev) => [nuevo_registro, ...prev]);

    // 2. Actualizar las horas acumuladas mensuales del becario en el estado de la vista
    set_horas_mensuales_locales((prev) =>
      prev.map((item) =>
        item.becario_id === becario_encontrado.id
          ? {
              ...item,
              horas_realizadas: Math.round((item.horas_realizadas + horas_efectivas) * 10) / 10,
              dias_asistidos: item.dias_asistidos + 1,
              estado_meta:
                item.horas_realizadas + horas_efectivas >= item.meta_horas
                  ? "cumplido"
                  : "en_progreso",
            }
          : item
      )
    );

    set_manual_guardando(false);
    set_modal_manual_abierto(false);

    const etiqueta_actividad =
      manual_tipo_actividad === "practicas"
        ? "Prácticas Preprofesionales"
        : manual_tipo_actividad === "escuela_lideres"
        ? "Escuela de Líderes"
        : "Acciones de Servicio";

    toast.success("Asistencia manual registrada", {
      description: `${becario_encontrado.nombre}: ${horas_efectivas} hrs en ${etiqueta_actividad} (${manual_sede}). Motivo: ${motivo_final}.`,
    });
  };

  // Modales
  const [registro_convalidador, set_registro_convalidador] =
    useState<RegistroAuditoriaAsistencia | null>(null);
  const [motivo_convalidacion, set_motivo_convalidacion] = useState("");
  const [registro_detalle, set_registro_detalle] = useState<RegistroAuditoriaAsistencia | null>(
    null
  );
  const [dialogo_justificar_abierto, set_dialogo_justificar_abierto] = useState<boolean>(false);
  const [incidencia_a_justificar, set_incidencia_a_justificar] =
    useState<IncidenciaAsistenciaInicial | null>(null);
  const [registro_eliminar, set_registro_eliminar] = useState<RegistroAuditoriaAsistencia | null>(null);
  const [eliminando_registro, set_eliminando_registro] = useState<boolean>(false);

  const abrirJustificacionParaRegistro = (item: RegistroAuditoriaAsistencia) => {
    let tipo_incidencia: IncidenciaAsistenciaInicial["tipo_incidencia"] = "asistencia_practicas";
    if (item.tipo_actividad === "escuela_lideres") tipo_incidencia = "escuela_lideres";
    else if (item.tipo_actividad === "acciones_servicio") tipo_incidencia = "asistencia_evento";

    set_incidencia_a_justificar({
      id: item.id,
      fecha: item.fecha,
      tipo_incidencia,
      hora: item.hora_ingreso,
      sede: item.sede_nombre,
      referencia_id: item.id,
      becario_id: item.becario_id,
      becario_nombre: item.becario_nombre,
      motivo_sugerido:
        item.motivo_convalidacion ||
        (item.minutos_retraso
          ? `Retraso de ${item.minutos_retraso} min registrado en marcación`
          : undefined),
    });
    set_dialogo_justificar_abierto(true);
  };

  const manejarConfirmarEliminarAsistencia = async () => {
    if (!registro_eliminar) return;
    set_eliminando_registro(true);
    try {
      await clienteApi.delete(`/asistencia/${registro_eliminar.id}`);
      set_registros_locales((prev) =>
        prev.filter((r) => r.id !== registro_eliminar.id)
      );
      if (registro_eliminar.horas_trabajadas) {
        set_horas_mensuales_locales((prev) =>
          prev.map((h) =>
            h.becario_id === registro_eliminar.becario_id
              ? {
                  ...h,
                  horas_realizadas: Math.max(
                    0,
                    Math.round(
                      (h.horas_realizadas - registro_eliminar.horas_trabajadas!) * 10
                    ) / 10
                  ),
                  dias_asistidos: Math.max(0, h.dias_asistidos - 1),
                }
              : h
          )
        );
      }
      toast.success("Registro de asistencia eliminado", {
        description: `Marcación de ${registro_eliminar.becario_nombre} (${registro_eliminar.fecha}) eliminada permanentemente (Web + APK).`,
      });
      set_registro_eliminar(null);
      await Promise.all([invalidar(), invalidarHorasMensuales()]);
    } catch (error) {
      toast.error("No se pudo eliminar el registro de asistencia", {
        description: error instanceof Error ? error.message : "Verifica tus permisos.",
      });
    } finally {
      set_eliminando_registro(false);
    }
  };

  // Estados para Auditoría de Asistencia por Intervalo de Fechas
  const [fecha_inicio_auditoria, set_fecha_inicio_auditoria] = useState<string>(
    () => obtenerRangoMesActualLaPaz().inicio
  );
  const [fecha_fin_auditoria, set_fecha_fin_auditoria] = useState<string>(
    () => obtenerRangoMesActualLaPaz().fin
  );
  const [descargando_pdf_auditoria, set_descargando_pdf_auditoria] = useState<boolean>(false);

  const manejarDescargarPdfAuditoria = async () => {
    try {
      set_descargando_pdf_auditoria(true);
      toast.info("Generando Corte Oficial de Asistencia en PDF...", {
        description: `Intervalo: Desde ${fecha_inicio_auditoria} hasta ${fecha_fin_auditoria}.`,
      });

      const endpoint = `/api/pdf/corte-asistencia?fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}`;
      const nombre_archivo = `Corte_Asistencia_Auditoria_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      await descargarPdfConResiliencia(endpoint, nombre_archivo, "horas", {
        modulo: "asistencia",
        fecha_inicio: fecha_inicio_auditoria,
        fecha_fin: fecha_fin_auditoria,
      });

      toast.success("Corte de Asistencia en PDF descargado exitosamente");
    } catch {
      toast.error("Error al extraer reporte PDF de auditoría de asistencia", {
        description: "Ocurrió un inconveniente al generar el documento.",
      });
    } finally {
      set_descargando_pdf_auditoria(false);
    }
  };

  const manejarDescargarPdfEscuelaLideres = async () => {
    try {
      set_descargando_pdf_auditoria(true);
      toast.info("Generando Reporte de Asistencia de Escuela de Líderes...", {
        description: `Todos los becarios · Entrada 14:30 · Enlazado con multas y permisos (${fecha_inicio_auditoria} a ${fecha_fin_auditoria}).`,
      });

      const endpoint = `/pdf/asistencia-escuela-lideres?fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}`;
      const nombre_archivo = `Asistencia_Escuela_Lideres_Multas_Permisos_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      await descargarPdfConResiliencia(endpoint, nombre_archivo, "asistencia_general", {
        modulo: "escuela_lideres",
        fecha_inicio: fecha_inicio_auditoria,
        fecha_fin: fecha_fin_auditoria,
      });

      toast.success("Reporte de Asistencia de Escuela de Líderes descargado");
    } catch {
      toast.error("Error al extraer reporte PDF de Escuela de Líderes");
    } finally {
      set_descargando_pdf_auditoria(false);
    }
  };

  // Estados para Llamada de Lista en Vivo (Viernes de Formación / Práctica)
  const [modal_lista_vivo_abierto, set_modal_lista_vivo_abierto] = useState<boolean>(false);
  const [sedes_bd, set_sedes_bd] = useState<string[]>([]);
  const [lista_llamada_vivo, set_lista_llamada_vivo] = useState<
    Array<{
      id: number;
      nombre: string;
      carrera: string;
      sede: string;
      marco_gps: boolean;
      hora_gps: string;
      distancia_m: number;
      confirmado: boolean;
    }>
  >([]);

  useEffect(() => {
    clienteApi
      .get<any[]>("/api/lugares-practica")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          set_sedes_bd(res.map((l) => l.nombre).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  const alternarConfirmacionPresencial = (id: number) => {
    set_lista_llamada_vivo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, confirmado: !item.confirmado } : item))
    );
  };

  const confirmarTodosPresencial = () => {
    set_lista_llamada_vivo((prev) => prev.map((item) => ({ ...item, confirmado: true })));
    toast.success("Todos los becarios han sido confirmados presencialmente.");
  };

  const lista_llamada_vivo_filtrada = useMemo(
    () => filtrarPorMentor(lista_llamada_vivo),
    [lista_llamada_vivo, filtrarPorMentor]
  );

  const guardarLlamadaListaVivo = () => {
    const presentes = lista_llamada_vivo_filtrada.filter((i) => i.confirmado).length;
    toast.success(`Llamada de lista guardada: ${presentes}/${lista_llamada_vivo_filtrada.length} becarios confirmados presencialmente.`);
    set_modal_lista_vivo_abierto(false);
  };

  const { datos: registros_servidor, invalidar } = useConsulta<RegistroAuditoriaAsistencia[]>(
    "asistencia_auditoria",
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/asistencia?limite=100");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          const mapeados = respuesta.map((item) => {
            const becario_match = LISTA_23_BECARIOS_OFICIALES.find(
              (b) => b.id === item.becario_id || b.id === item.becario?.id
            );
            const estado_calculado = (
              item.estado_aprobacion === "revisado_supervisor"
                ? "revisado_supervisor"
                : item.estado_aprobacion === "aprobado_administracion" || item.estado === "convalidado"
                ? "convalidado"
                : !item.hora_salida
                ? "en_curso"
                : !item.dentro_de_radio
                ? "fuera_geocerca"
                : !item.dentro_de_horario
                ? "tardanza"
                : "conforme"
            ) as RegistroAuditoriaAsistencia["estado"];

            const nombre_sede =
              item.becario?.lugar_practica?.nombre ||
              item.lugar_practica?.nombre ||
              item.sede_nombre ||
              item.lugar_practica ||
              "Oficina Central Diaconía IFD - El Alto";

            return {
              id: item.id,
              becario_id: item.becario_id,
              becario_nombre:
                item.becario?.nombre ||
                item.becario?.usuario?.nombre ||
                item.becario_nombre ||
                becario_match?.nombre ||
                "Becario Institucional",
              carrera: item.becario?.carrera || becario_match?.carrera || "Carrera BUMAND",
              sede_nombre: nombre_sede,
              fecha: item.fecha ? String(item.fecha).split("T")[0] : new Date().toISOString().split("T")[0],
              hora_ingreso: item.hora_ingreso || "08:00",
              hora_salida: item.hora_salida || null,
              horas_trabajadas: item.horas_trabajadas || null,
              distancia_ingreso_m: item.distancia_ingreso_m ?? (item.dentro_de_radio ? 35 : 175),
              dentro_de_radio: item.dentro_de_radio ?? true,
              dentro_de_horario: item.dentro_de_horario ?? true,
              estado: estado_calculado,
              revisado_por_supervisor: Boolean(item.revisado_por_supervisor || item.estado_aprobacion === "revisado_supervisor"),
              supervisor_revisor: item.supervisor_revisor || item.supervisor_nombre || null,
              fecha_revision_supervisor: item.fecha_revision_supervisor ? String(item.fecha_revision_supervisor) : null,
              convalidado_por: item.convalidado_por || item.administrador_nombre || null,
              motivo_convalidacion: item.motivo_convalidacion || null,
              lat_ingreso: item.lat_ingreso,
              lng_ingreso: item.lng_ingreso,
              minutos_retraso: item.minutos_retraso ?? 0,
              monto_multa_bs: item.monto_multa_bs ?? 0,
              es_viernes: item.es_viernes ?? false,
              es_registro_manual: Boolean(item.es_registro_manual),
              exime_multa: Boolean(item.exime_multa),
              tipo_actividad: item.tipo_actividad || "practicas",
              ci: item.becario?.ci ? String(item.becario.ci) : becario_match?.ci,
              supervisor_id: item.becario?.supervisor_id ?? item.becario?.supervisor?.id ?? item.supervisor_id ?? null,
              supervisor_nombre: item.becario?.supervisor?.nombre ?? item.becario?.supervisor?.usuario?.nombre ?? null,
            };
          });
          return mapeados;
        }
      } catch {
        // En caso de error de red
      }
      return [];
    },
    { datos_iniciales: REGISTROS_AUDITORIA_INICIALES, revalidar_al_montar: true, tiempo_vida_cache_ms: 0 }
  );

  useEffect(() => {
    if (Array.isArray(registros_servidor)) {
      set_registros_locales(registros_servidor);
    }
  }, [registros_servidor]);

  const [limite_visible, set_limite_visible] = useState(30);
  const primer_render_vista_ref = useRef(true);

  useEffect(() => {
    if (primer_render_vista_ref.current) {
      primer_render_vista_ref.current = false;
      return;
    }
    invalidar();
  }, [vista_activa, invalidar]);

  const registros = useMemo(
    () => filtrarPorMentor(registros_locales),
    [registros_locales, filtrarPorMentor]
  );

  useTiempoReal({
    eventos: {
      asistencia_actualizada: () => invalidar(),
    },
  });

  // Métricas
  const total_registros = registros.length;
  const dentro_geocerca_total = registros.filter((r) => r.dentro_de_radio).length;
  const tasa_geocerca =
    total_registros > 0 ? Math.round((dentro_geocerca_total / total_registros) * 100) : 0;
  const alertas_geocerca = registros.filter(
    (r) => !r.dentro_de_radio && r.estado !== "convalidado"
  ).length;
  const jornadas_activas = registros.filter((r) => !r.hora_salida).length;

  // Filtrado
  const registros_filtrados = registros.filter((r) => {
    const coincide_estado =
      filtro_estado === "todos"
        ? true
        : filtro_estado === "alertas"
        ? !r.dentro_de_radio || r.estado === "tardanza"
        : r.estado === filtro_estado;

    const coincide_sede = filtro_sede === "todas" ? true : r.sede_nombre === filtro_sede;

    const texto = termino_busqueda.toLowerCase().trim();
    const coincide_busqueda =
      !texto ||
      (r.becario_nombre || "").toLowerCase().includes(texto) ||
      (r.carrera || "").toLowerCase().includes(texto) ||
      (r.sede_nombre || "").toLowerCase().includes(texto);

    return coincide_estado && coincide_sede && coincide_busqueda;
  });

  const manejarConvalidar = async () => {
    if (!registro_convalidador) return;
    if (!motivo_convalidacion.trim()) {
      toast.error("Motivo obligatorio", {
        description: "Debe ingresar una justificación institucional para convalidar la marcación.",
      });
      return;
    }

    const nombre_supervisor = usuario?.nombre || "Mentor Diaconía";

    set_registros_locales((prev) =>
      prev.map((r) =>
        r.id === registro_convalidador.id
          ? {
              ...r,
              estado: "convalidado",
              convalidado_por: nombre_supervisor,
              motivo_convalidacion: motivo_convalidacion.trim(),
            }
          : r
      )
    );

    toast.success("Asistencia Convalidada", {
      description: `Se convalidó la jornada de ${registro_convalidador.becario_nombre} satisfactoriamente.`,
    });

    set_registro_convalidador(null);
    set_motivo_convalidacion("");
    await invalidar();
  };

  const manejarRevisarSupervisor = async (item: RegistroAuditoriaAsistencia) => {
    const nombre_supervisor = usuario?.nombre || "Mentor Diaconía";
    const fecha_actual = new Date().toISOString().split("T")[0];
    try {
      await clienteApi.patch(`/api/asistencia/${item.id}/revisar-supervisor`, {
        supervisor_id: usuario?.id || 1,
        supervisor_nombre: nombre_supervisor,
      });
    } catch {
      // Fallback reactivo
    }
    set_registros_locales((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? {
              ...r,
              estado: "revisado_supervisor",
              revisado_por_supervisor: true,
              supervisor_revisor: nombre_supervisor,
              fecha_revision_supervisor: fecha_actual,
            }
          : r
      )
    );
    toast.success("Marcación revisada por Mentor", {
      description: `Se registró la verificación técnica de ${item.becario_nombre} y se elevó a Administración.`,
    });
    await invalidar();
  };

  const manejarAprobarAdministracion = async (item: RegistroAuditoriaAsistencia) => {
    const nombre_admin = usuario?.nombre || "Administración Central";
    const fecha_actual = new Date().toISOString().split("T")[0];
    const observacion_admin = "Convalidado y aprobado por Administración (exento de multa)";
    try {
      await clienteApi.patch(`/api/asistencia/${item.id}/aprobar-administracion`, {
        estado: "aprobado_administracion",
        observacion_admin,
      });
    } catch (error) {
      const codigo_estado = (error as { codigo_estado?: number })?.codigo_estado ?? 0;
      // Los registros semilla institucionales no existen en BD (404): se convalidan solo en la interfaz.
      if (codigo_estado !== 404) {
        toast.error("No se pudo aprobar la asistencia en el servidor", {
          description:
            (error as { mensaje?: string; message?: string })?.mensaje ||
            (error as { message?: string })?.message ||
            "Intente nuevamente.",
        });
        return;
      }
    }
    set_registros_locales((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? {
              ...r,
              estado: "convalidado",
              convalidado_por: nombre_admin,
              administrador_revisor: nombre_admin,
              fecha_aprobacion_admin: fecha_actual,
              monto_multa_bs: 0,
              exime_multa: true,
            }
          : r
      )
    );
    toast.success("Asistencia Aprobada por Administración", {
      description: `Se convalidó oficialmente la asistencia de ${item.becario_nombre} (Sin multa).`,
    });
    await invalidar();
  };

  const manejarGuardarCambioLugarAsistencia = async () => {
    set_cambio_guardando(true);
    const payload = {
      latitud: parseFloat(cambio_latitud) || -16.500054,
      longitud: parseFloat(cambio_longitud) || -68.173455,
      radio_tolerancia_m: parseInt(cambio_radio, 10) || 120,
      direccion_referencia: cambio_referencia || cambio_sede,
      motivo_cambio: cambio_motivo.trim() || "Cambio de sede de acción de servicio de viernes",
    };

    try {
      await clienteApi.patch(`/api/eventos/${cambio_evento_id}/cambiar-lugar`, payload);
    } catch {
      try {
        await clienteApi.patch(`/api/eventos/${cambio_evento_id}`, payload);
      } catch {
        // Fallback reactivo
      }
    }

    set_cambio_guardando(false);
    set_modal_cambiar_lugar_abierto(false);
    toast.success("Lugar de Acción de Servicio actualizado", {
      description: `Nueva sede: ${payload.direccion_referencia}. Radio de tolerancia: ${payload.radio_tolerancia_m}m.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra Unificada de Vistas y Acciones Operativas */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => set_vista_activa("en_vivo")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              vista_activa === "en_vivo"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Marcaciones en Vivo (WGS84)
          </button>
          <button
            type="button"
            onClick={() => set_vista_activa("mensual")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              vista_activa === "mensual"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#FFB600]" />
            Registro Mensual de Horas por Becario
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {es_mentor && (
            <InsigniaBecariosDesignados cantidad={becarios_designados.length} />
          )}
          {vista_activa === "mensual" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#035683]">Periodo:</span>
              <Select value={mes_seleccionado} onValueChange={(val) => val && set_mes_seleccionado(val)}>
                <SelectTrigger className="text-xs h-9 px-3 rounded-xl border-[#E5E7EB] bg-slate-50 font-bold min-w-[170px]">
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {opciones_meses_gestion.map((opcion) => (
                    <SelectItem key={opcion.valor} value={opcion.valor}>
                      {opcion.etiqueta_con_actual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {es_admin_o_supervisor && (
            <Button
              size="sm"
              onClick={() => set_modal_manual_abierto(true)}
              className="h-9 px-3.5 bg-[#007BBE] hover:bg-[#035683] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Registrar Asistencia Manual (Contingencia sin megas u olvido)"
            >
              <Plus className="w-4 h-4 text-[#FFB600]" />
              <span>Añadir Asistencia Manual</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => set_modal_lista_vivo_abierto(true)}
            className="h-9 px-3 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ListChecks className="w-4 h-4 text-[#FFB600]" />
            <span>Llamada de Lista en Vivo (Viernes)</span>
          </Button>

          <Button
            size="sm"
            onClick={() => set_modal_cambiar_lugar_abierto(true)}
            className="h-9 px-3.5 bg-[#007BBE] hover:bg-[#035683] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Cambiar la sede geográfica y geocerca para las acciones de servicio de los viernes"
          >
            <MapPin className="w-4 h-4 text-[#FFB600]" />
            <span>Cambio de Lugar, Escuela de Líderes</span>
          </Button>
        </div>
      </div>

      {/* Barra de Auditoría de Asistencia por Intervalo de Fechas */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00ABBD]" />
            <span className="text-xs font-bold text-[#035683] uppercase tracking-wider">
              Auditoría de Asistencia (Corte PDF):
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
              const fuente = vista_activa === "mensual" ? lista_horas_mensuales : registros_filtrados;
              const periodo = vista_activa === "mensual" ? mes_seleccionado : `${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}`;
              await exportarAuditoriaAsistenciaExcel(fuente, periodo);
              toast.success("Auditoría de asistencia exportada a Excel (.xlsx)");
            }}
            className="h-8 px-3 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={descargando_pdf_auditoria}
            onClick={manejarDescargarPdfEscuelaLideres}
            className="h-8 px-3 border-indigo-400 text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
            title="Descargar Asistencia de Escuela de Líderes (todos los becarios, entrada 14:30) enlazado con multas y permisos"
          >
            {descargando_pdf_auditoria ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>Asistencia Escuela de Líderes</span>
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

      {vista_activa === "en_vivo" ? (
        <>
          {/* Tarjetas KPI de Auditoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Marcaciones Registradas */}
            <TarjetaSpotlight
              color_luz="rgba(6, 58, 107, 0.12)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Marcaciones Hoy
              </span>
              <div className="text-3xl font-bold font-display text-[#035683]">
                <ContadorRodilloAnimado valor={total_registros} sufijo=" registros" />
              </div>
              <p className="text-[11px] text-muted-foreground">Todas las sedes institucionales</p>
            </TarjetaSpotlight>

            {/* KPI 2: Cumplimiento de Geocerca */}
            <TarjetaSpotlight
              color_luz="rgba(16, 185, 129, 0.15)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Cumplimiento Geocerca
              </span>
              <div className="text-3xl font-bold font-display text-emerald-600">
                <ContadorRodilloAnimado valor={tasa_geocerca} sufijo="%" />
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Dentro del radio de tolerancia</p>
            </TarjetaSpotlight>

            {/* KPI 3: Alertas / Fuera de Rango */}
            <TarjetaSpotlight
              color_luz="rgba(226, 105, 75, 0.15)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Alertas Geodésicas
              </span>
              <div className="text-3xl font-bold font-display text-[#E2694B]">
                <ContadorRodilloAnimado valor={alertas_geocerca} />
              </div>
              <p className="text-[11px] text-[#E2694B] font-medium">Marcaciones fuera de tolerancia</p>
            </TarjetaSpotlight>

            {/* KPI 4: Jornadas Activas */}
            <TarjetaSpotlight
              color_luz="rgba(248, 199, 102, 0.2)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Jornadas en Curso
              </span>
              <div className="text-3xl font-bold font-display text-[#035683]">
                <ContadorRodilloAnimado valor={jornadas_activas} sufijo=" activas" />
              </div>
              <p className="text-[11px] text-muted-foreground">Becarios presentes en sede</p>
            </TarjetaSpotlight>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por becario, carrera o sede..."
                value={termino_busqueda}
                onChange={(e) => set_termino_busqueda(e.target.value)}
                className="pl-9 text-xs rounded-xl border-[#E5E7EB] h-10 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {/* Filtro Estado */}
              <Select value={filtro_estado} onValueChange={(val: any) => val && set_filtro_estado(val)}>
                <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[#035683] font-medium min-w-[160px]">
                  <SelectValue placeholder="Todos los Estados" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] z-[100]">
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="conforme">Conforme WGS84</SelectItem>
                  <SelectItem value="en_curso">En Jornada</SelectItem>
                  <SelectItem value="tardanza">Tardanzas</SelectItem>
                  <SelectItem value="fuera_geocerca">Fuera de Geocerca</SelectItem>
                  <SelectItem value="convalidado">Convalidados</SelectItem>
                  <SelectItem value="alertas">Solo Alertas y Observados</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro Sede */}
              <Select value={filtro_sede} onValueChange={(val: any) => val && set_filtro_sede(val)}>
                <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[#035683] font-medium min-w-[180px]">
                  <SelectValue placeholder="Todas las Sedes" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] z-[100]">
                  <SelectItem value="todas">Todas las Sedes</SelectItem>
                  {(sedes_bd.length > 0
                    ? sedes_bd
                    : ["Oficina Central Diaconía IFD - El Alto"]
                  ).map((nombre_sede) => (
                    <SelectItem key={nombre_sede} value={nombre_sede}>
                      {nombre_sede}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Registros Auditables */}
          <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E5E7EB]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#035683]">
                  Registros de Asistencia Georreferenciados
                </CardTitle>
                <Badge variant="outline" className="border-[#E5E7EB] text-[#035683] font-mono text-xs">
                  {registros_filtrados.length} Resultados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {registros_filtrados.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No se encontraron marcaciones que coincidan con los filtros seleccionados.
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]/50">
                  {registros_filtrados.slice(0, limite_visible).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Datos del Becario y Sede */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-sm shrink-0">
                          {item.becario_nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#035683]">
                              {item.becario_nombre}
                            </span>
                            <Badge
                              variant="outline"
                              className="border-[#E5E7EB] text-[10px] font-mono text-muted-foreground"
                            >
                              {item.carrera}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium text-[#1E293B]">
                              <Building className="w-3.5 h-3.5 text-[#035683]" />
                              {item.sede_nombre}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Calendar className="w-3 h-3" /> {item.fecha}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estado Geodésico y Horario */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                        <div className="text-left sm:text-right space-y-0.5">
                          <div className="font-mono text-xs font-bold text-[#035683]">
                            {item.hora_ingreso} &rarr; {item.hora_salida || "En Jornada"}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {item.horas_trabajadas
                              ? `${Number(item.horas_trabajadas).toFixed(2)} hrs computadas`
                              : "Jornada no cerrada"}
                          </div>
                          <div className="text-[10px] font-mono flex items-center sm:justify-end gap-1">
                            <Navigation className="w-3 h-3 text-[#00ABBD]" />
                            <span>Distancia: </span>
                            <strong
                              className={
                                item.dentro_de_radio ? "text-emerald-700" : "text-[#E2694B]"
                              }
                            >
                              {item.distancia_ingreso_m}m
                            </strong>
                          </div>
                        </div>

                        {/* Insignia de Estado y Multas Transparentes */}
                        <div className="min-w-[150px] text-right space-y-1">
                          <div>
                            {item.estado === "conforme" && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Conforme WGS84
                              </Badge>
                            )}
                            {item.estado === "en_curso" && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                En Curso
                              </Badge>
                            )}
                            {item.estado === "tardanza" && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Tardanza
                              </Badge>
                            )}
                            {item.estado === "fuera_geocerca" && (
                              <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Fuera de Geocerca
                              </Badge>
                            )}
                            {item.estado === "convalidado" && (
                              <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-bold text-xs gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Convalidado
                              </Badge>
                            )}
                            {item.estado === "revisado_supervisor" && (
                              <Badge className="bg-sky-50 text-sky-800 border-sky-300 font-bold text-xs gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                                Revisado por Mentor
                              </Badge>
                            )}
                          </div>

                          {item.es_registro_manual && (
                            <div className="flex items-center justify-end">
                              <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold">
                                Manual · Contingencia
                              </Badge>
                            </div>
                          )}

                          {item.tipo_actividad && (
                            <div className="flex items-center justify-end">
                              <Badge variant="outline" className="border-slate-200 text-slate-700 text-[10px] font-mono">
                                {item.tipo_actividad === "practicas"
                                  ? "Prácticas"
                                  : item.tipo_actividad === "escuela_lideres"
                                  ? "Escuela Líderes"
                                  : "Acciones de Servicio"}
                              </Badge>
                            </div>
                          )}

                          {/* Visualización de Exención de Multa de los Viernes / Escuela de Líderes */}
                          {((item.es_viernes || item.tipo_actividad === "escuela_lideres" || item.tipo_actividad === "acciones_servicio") &&
                            (item.estado === "convalidado" || item.exime_multa || ((item.monto_multa_bs === 0 || !item.monto_multa_bs) && item.minutos_retraso && item.minutos_retraso > 0))) ? (
                            <div className="flex items-center justify-end">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold gap-1 shadow-2xs">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Sin Multa (Permiso Aprobado)
                              </Badge>
                            </div>
                          ) : null}

                          {/* Visualización Transparente de Multas de Escuela de Líderes */}
                          {item.tipo_actividad === "escuela_lideres" && item.monto_multa_bs && item.monto_multa_bs > 0 && !item.exime_multa && item.estado !== "convalidado" ? (
                            <div className="flex items-center justify-end">
                              <Badge variant="outline" className="bg-rose-50 border-rose-300 text-rose-700 text-[10px] font-mono font-bold gap-1">
                                <Coins className="w-3 h-3 text-rose-600" />
                                Multa Escuela de Líderes: Bs {Number(item.monto_multa_bs || 0).toFixed(2)} ({item.minutos_retraso}m)
                              </Badge>
                            </div>
                          ) : null}

                          {item.confirmacion_presencial ? (
                            <p className="text-[10px] text-emerald-700 font-medium">✓ Verificado presencial</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground">Sin confirmación en vivo</p>
                          )}
                        </div>

                        {/* Acciones de Auditoría y Flujo de 2 Pasos */}
                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => set_registro_detalle(item)}
                            className="h-8 px-2 text-[#035683] hover:bg-slate-100 rounded-lg text-xs"
                            title="Ver detalle satelital"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Acciones de Flujo 2 Pasos para anomalías */}
                          {(item.estado === "fuera_geocerca" || item.estado === "tardanza") && (
                            <>
                              {!es_admin ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => manejarRevisarSupervisor(item)}
                                  className="h-8 px-2.5 text-xs font-bold border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg gap-1"
                                  title="Marcar Revisado por Mentor"
                                >
                                  <Check className="w-3.5 h-3.5 text-[#00ABBD]" />
                                  <span>Marcar Revisado por Mentor</span>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => manejarAprobarAdministracion(item)}
                                  className="h-8 px-2.5 text-xs font-bold bg-[#035683] hover:bg-[#035683]/90 text-white rounded-lg gap-1 shadow-2xs"
                                  title="Aprobar por Administración"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFB600]" />
                                  <span>Aprobar por Administración</span>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirJustificacionParaRegistro(item)}
                                className="h-8 px-2.5 text-xs font-bold border-[#FFB600] text-[#035683] bg-[#FFB600]/10 hover:bg-[#FFB600]/20 rounded-xl gap-1"
                                title="Subir o radicar justificación con comprobante en PDF/imagen"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5 text-[#035683]" />
                                <span className="hidden sm:inline">Justificar</span>
                              </Button>
                            </>
                          )}

                          {item.estado === "revisado_supervisor" && (
                            <>
                              {es_admin ? (
                                <Button
                                  size="sm"
                                  onClick={() => manejarAprobarAdministracion(item)}
                                  className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1 shadow-2xs"
                                  title="Aprobar por Administración"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                  <span>Aprobar por Administración</span>
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-sky-700 border-sky-300 bg-sky-50 text-[10px] font-mono">
                                  Elevado a Admin
                                </Badge>
                              )}
                            </>
                          )}

                          {es_admin_o_supervisor && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => set_registro_eliminar(item)}
                              className="h-8 px-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold gap-1 cursor-pointer"
                              title="Eliminar registro de asistencia de la base de datos y APK"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quitar</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {registros_filtrados.length > limite_visible && (
                    <div className="p-4 flex justify-center bg-slate-50/40">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => set_limite_visible((prev) => prev + 30)}
                        className="border-[#E5E7EB] text-[#035683] hover:bg-slate-100 font-semibold text-xs rounded-xl"
                      >
                        Mostrar más registros ({registros_filtrados.length - limite_visible} restantes)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* VISTA MENSUAL: REGISTRO CONSOLIDADO DE HORAS POR BECARIO */
        <div className="space-y-6">
          {/* Banner Informativo Escala de Multas de los Viernes de Escuela de Líderes */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Coins className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#035683]">
                  Reglamento Oficial de Multas — Viernes de Escuela de Líderes
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Escala por tramos de retraso:{" "}
                  <strong>1-10 min = 10 Bs</strong> · <strong>11-30 min = 20 Bs</strong> ·{" "}
                  <strong>31-60 min = 30 Bs</strong> · <strong>&gt;60 min = 50 Bs</strong>.
                  (Las multas se retienen o liquidan en la acreditación mensual).
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-amber-300 text-amber-800 font-mono text-[11px] self-start md:self-center shrink-0">
              Escala Oficial BUMAND
            </Badge>
          </div>

          {/* Tarjetas KPI del Mes Seleccionado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TarjetaSpotlight
              color_luz="rgba(6, 58, 107, 0.12)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Nómina Oficial
              </span>
              <div className="text-3xl font-bold font-display text-[#035683]">
                <ContadorRodilloAnimado valor={lista_horas_mensuales.length} sufijo=" becarios" />
              </div>
              <p className="text-[11px] text-muted-foreground">Estudiantes activos registrados</p>
            </TarjetaSpotlight>

            <TarjetaSpotlight
              color_luz="rgba(16, 185, 129, 0.15)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Promedio Horas / Becario
              </span>
              <div className="text-3xl font-bold font-display text-emerald-600">
                <ContadorRodilloAnimado
                  valor={
                    lista_horas_mensuales.length > 0
                      ? Math.round(
                          (lista_horas_mensuales.reduce((acc, b) => acc + b.horas_realizadas, 0) /
                            lista_horas_mensuales.length) *
                            10
                        ) / 10
                      : 0
                  }
                  sufijo=" hrs"
                  decimales={1}
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Meta estándar: 36.0 hrs/mes (9h/sem flexibles)</p>
            </TarjetaSpotlight>

            <TarjetaSpotlight
              color_luz="rgba(23, 180, 196, 0.15)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Cumplimiento de Meta
              </span>
              <div className="text-3xl font-bold font-display text-[#035683]">
                <ContadorRodilloAnimado
                  valor={
                    lista_horas_mensuales.length > 0
                      ? Math.round(
                          (lista_horas_mensuales.filter((b) => b.horas_realizadas >= b.meta_horas).length /
                            lista_horas_mensuales.length) *
                            100
                        )
                      : 0
                  }
                  sufijo="%"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Becarios con meta alcanzada</p>
            </TarjetaSpotlight>

            <TarjetaSpotlight
              color_luz="rgba(226, 105, 75, 0.15)"
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Multas Viernes (Total)
              </span>
              <div className="text-3xl font-bold font-display text-[#E2694B]">
                <ContadorRodilloAnimado
                  valor={lista_horas_mensuales.reduce((acc, b) => acc + b.multas_acumuladas_bs, 0)}
                  prefijo="Bs "
                  decimales={2}
                />
              </div>
              <p className="text-[11px] text-[#E2694B] font-medium">Retenciones acumuladas del mes</p>
            </TarjetaSpotlight>
          </div>

          {/* Barra de Filtros y Búsqueda Mensual */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por becario, CI, carrera o sede..."
                value={termino_busqueda}
                onChange={(e) => set_termino_busqueda(e.target.value)}
                className="pl-9 text-xs rounded-xl border-[#E5E7EB] h-10 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={filtro_estado_mensual}
                onValueChange={(val) => val && set_filtro_estado_mensual(val)}
              >
                <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[#035683] font-medium min-w-[200px]">
                  <SelectValue placeholder="Estado de Meta Mensual" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] z-[100]">
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="cumplido">Meta Cumplida (≥36 hrs)</SelectItem>
                  <SelectItem value="en_progreso">En Progreso (27 a 35.9 hrs)</SelectItem>
                  <SelectItem value="en_riesgo">En Riesgo (&lt;27 hrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla Consolidada de Horas Mensuales por Becario */}
          <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E5E7EB]/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#035683]">
                    Registro Mensual de Horas por Becario — {mes_seleccionado}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Cómputo acumulado de horas efectivas frente a la meta mensual y seguimiento de puntualidad.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#E5E7EB] text-[#035683] font-mono text-xs">
                  {lista_horas_mensuales.filter((b) => {
                    const texto = termino_busqueda.toLowerCase().trim();
                    const coincide = !texto || (b.nombre || "").toLowerCase().includes(texto) || (b.carrera || "").toLowerCase().includes(texto) || String(b.ci || "").includes(texto);
                    const estado = filtro_estado_mensual === "todos" ? true : b.estado_meta === filtro_estado_mensual;
                    return coincide && estado;
                  }).length} Becarios
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-[#035683] font-mono text-[11px] uppercase">
                      <th className="py-3 px-4 font-bold">Becario</th>
                      <th className="py-3 px-3 font-bold">C.I.</th>
                      <th className="py-3 px-4 font-bold">Carrera / Sede</th>
                      <th className="py-3 px-4 font-bold min-w-[180px]">Horas Realizadas vs Meta</th>
                      <th className="py-3 px-3 font-bold text-center">Días</th>
                      <th className="py-3 px-4 font-bold">Multas Viernes</th>
                      <th className="py-3 px-3 font-bold text-center">Estado</th>
                      <th className="py-3 px-4 text-right font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]/50">
                    {lista_horas_mensuales
                      .filter((b) => {
                        const texto = termino_busqueda.toLowerCase().trim();
                        const coincide =
                          !texto ||
                          (b.nombre || "").toLowerCase().includes(texto) ||
                          (b.carrera || "").toLowerCase().includes(texto) ||
                          String(b.ci || "").includes(texto);
                        const estado =
                          filtro_estado_mensual === "todos" ? true : b.estado_meta === filtro_estado_mensual;
                        return coincide && estado;
                      })
                      .map((item) => {
                        const porcentaje_real = Math.round(
                          (item.horas_realizadas / item.meta_horas) * 100
                        );
                        const porcentaje_barra = Math.min(100, porcentaje_real);
                        const excedente_horas = item.horas_realizadas - item.meta_horas;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#035683]/10 text-[#035683] font-bold text-xs flex items-center justify-center shrink-0">
                                  {item.nombre.charAt(0)}
                                </div>
                                <span className="font-bold text-[#035683] leading-tight">
                                  {item.nombre}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-muted-foreground font-semibold">
                              {item.ci}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <p className="font-medium text-[#1E293B]">{item.carrera}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Building className="w-3 h-3 text-[#00ABBD]" />
                                  {item.sede}
                                </p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="font-bold text-[#035683]">
                                    {item.horas_realizadas.toFixed(1)} hrs
                                  </span>
                                  <span className="text-muted-foreground">
                                    / {item.meta_horas.toFixed(1)} hrs ({porcentaje_real}%)
                                  </span>
                                </div>
                                <Progress value={porcentaje_barra} className="h-2 bg-slate-100" />
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-center text-[#035683]">
                              {item.dias_asistidos}
                            </td>
                            <td className="py-3.5 px-4">
                              {item.multas_acumuladas_bs > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="bg-rose-50 border-rose-300 text-rose-700 text-[10px] font-mono font-bold gap-1"
                                >
                                  <Coins className="w-3 h-3 text-rose-600" />
                                  Bs {item.multas_acumuladas_bs.toFixed(2)} ({item.tardanzas_viernes} tardanza)
                                </Badge>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                                  ✓ Sin sanciones
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {excedente_horas > 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                                  Meta Superada (+{excedente_horas.toFixed(1)} hrs)
                                </Badge>
                              ) : item.horas_realizadas === item.meta_horas ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                                  Meta Cumplida (36.0 hrs)
                                </Badge>
                              ) : item.horas_realizadas >= 27 ? (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">
                                  En Progreso
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[10px]">
                                  En Riesgo (&lt;27 hrs)
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => set_becario_detalle_mensual(item)}
                                className="h-8 px-2.5 text-xs font-bold border-[#035683] text-[#035683] hover:bg-[#035683]/5 rounded-lg flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Jornadas</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Canónico de Detalle Mensual de Horas por Becario */}
      <Dialog
        open={Boolean(becario_detalle_mensual)}
        onOpenChange={(abierto) => !abierto && set_becario_detalle_mensual(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-[#F8F9FA]">
            <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00ABBD]" />
              Detalle Mensual de Horas · {becario_detalle_mensual?.nombre}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {becario_detalle_mensual && (
              <>
                <div className="p-3.5 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#035683] text-sm">
                        {becario_detalle_mensual.nombre}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        C.I. {becario_detalle_mensual.ci} · {becario_detalle_mensual.carrera}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-[#035683] text-[#035683] font-mono text-xs">
                      {becario_detalle_mensual.sede}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-[#E5E7EB] text-[11px] font-mono">
                    <div>
                      <span className="text-muted-foreground block">Horas Realizadas:</span>
                      <strong className="text-[#035683] text-sm">
                        {becario_detalle_mensual.horas_realizadas.toFixed(1)} hrs (
                        {Math.round(
                          (becario_detalle_mensual.horas_realizadas /
                            becario_detalle_mensual.meta_horas) *
                            100
                        )}
                        %)
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Meta Mensual:</span>
                      <strong className="text-slate-700 text-sm">
                        {becario_detalle_mensual.meta_horas.toFixed(1)} hrs
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Multas Viernes:</span>
                      <strong className={becario_detalle_mensual.multas_acumuladas_bs > 0 ? "text-rose-600 text-sm" : "text-emerald-700 text-sm"}>
                        Bs {becario_detalle_mensual.multas_acumuladas_bs.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Cumplimiento de Meta (9h/sem flexibles):</span>
                      {becario_detalle_mensual.horas_realizadas > becario_detalle_mensual.meta_horas ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                          Meta Superada (+{(becario_detalle_mensual.horas_realizadas - becario_detalle_mensual.meta_horas).toFixed(1)} hrs)
                        </Badge>
                      ) : becario_detalle_mensual.horas_realizadas === becario_detalle_mensual.meta_horas ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                          Meta Cumplida (36.0 hrs)
                        </Badge>
                      ) : becario_detalle_mensual.horas_realizadas >= 27 ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">
                          En Progreso
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[10px]">
                          En Riesgo (&lt;27 hrs)
                        </Badge>
                      )}
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        Math.round(
                          (becario_detalle_mensual.horas_realizadas /
                            becario_detalle_mensual.meta_horas) *
                            100
                        )
                      )}
                      className="h-2 bg-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#035683]">
                    Jornadas Acreditadas en {becario_detalle_mensual.mes}:
                  </Label>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {[
                      { dia: "Viernes 09/10", horas: "4.0 hrs", tipo: "Escuela de Líderes", estado: "Acreditado" },
                      { dia: "Miércoles 07/10", horas: "4.5 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                      { dia: "Lunes 05/10", horas: "4.0 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                      { dia: "Viernes 02/10", horas: "3.5 hrs", tipo: "Escuela de Líderes", estado: "Acreditado" },
                      { dia: "Miércoles 30/09", horas: "4.0 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                      { dia: "Lunes 28/09", horas: "4.5 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                    ].map((j, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                          <span className="font-semibold text-slate-800">{j.dia}</span>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            ({j.tipo})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span className="text-[#035683]">{j.horas}</span>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                            {j.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_becario_detalle_mensual(null)}
              className="h-9 px-4 border-[#E5E7EB] rounded-xl text-xs font-bold text-[#035683] hover:bg-slate-100"
            >
              Cerrar Expediente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Convalidación de Asistencia */}
      <Dialog
        open={Boolean(registro_convalidador)}
        onOpenChange={(abierto) => !abierto && set_registro_convalidador(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-2xl flex flex-col p-0 overflow-hidden bg-white border border-[#E5E7EB]"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] shrink-0 bg-[#F8F9FA]">
            <DialogTitle className="flex items-center gap-2 text-[#035683] text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Convalidación Institucional de Asistencia
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3 p-5 text-xs overflow-y-auto flex-1 min-h-0">
            <p className="text-muted-foreground">
              Estás por convalidar formalmente la marcación de{" "}
              <strong className="text-[#035683]">{registro_convalidador?.becario_nombre}</strong>{" "}
              correspondiente al día <strong>{registro_convalidador?.fecha}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-[#E5E7EB] space-y-1 font-mono text-[11px]">
              <div>
                Hora Registrada: <strong>{registro_convalidador?.hora_ingreso}</strong>
              </div>
              <div>
                Distancia Geodésica:{" "}
                <strong className="text-[#E2694B]">
                  {registro_convalidador?.distancia_ingreso_m} metros
                </strong>{" "}
                (Radio permitido: 120m)
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#1E293B]">
                Dictamen o Motivo de Convalidación:
              </Label>
              <Textarea
                placeholder="Ej. Incidencia de transporte acreditada / Comisión externa autorizada..."
                value={motivo_convalidacion}
                onChange={(e) => set_motivo_convalidacion(e.target.value)}
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>
          </DialogBody>
          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_registro_convalidador(null)}
              className="rounded-xl text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={manejarConvalidar}
              className="bg-[#035683] hover:bg-[#035683]/90 text-white rounded-xl font-bold text-xs shadow-sm"
            >
              Confirmar Convalidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle GPS Satelital con Google Maps Interactivo */}
      <Dialog
        open={Boolean(registro_detalle)}
        onOpenChange={(abierto) => !abierto && set_registro_detalle(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E5E7EB]"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <DialogTitle className="flex items-center gap-2 text-[#035683] text-base">
              <MapPin className="w-5 h-5 text-[#00ABBD]" />
              Auditoría Georreferenciada con Google Maps (WGS84)
            </DialogTitle>
          </DialogHeader>

          {registro_detalle && (
            <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#035683] text-sm">
                      {registro_detalle.becario_nombre}
                    </div>
                    <div className="text-muted-foreground">{registro_detalle.carrera}</div>
                  </div>
                  {registro_detalle.tipo_actividad === "escuela_lideres" && registro_detalle.monto_multa_bs && registro_detalle.monto_multa_bs > 0 ? (
                    <Badge variant="outline" className="bg-rose-50 border-rose-300 text-rose-700 font-bold text-xs gap-1">
                      <Coins className="w-3.5 h-3.5 text-rose-600" />
                      Multa Escuela de Líderes: Bs {Number(registro_detalle.monto_multa_bs || 0).toFixed(2)}
                    </Badge>
                  ) : null}
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-muted-foreground block">Sede / Bloque:</span>
                    <span className="font-semibold">{registro_detalle.sede_nombre}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Fecha:</span>
                    <span className="font-semibold">{registro_detalle.fecha}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Ingreso / Salida:</span>
                    <span className="font-semibold">
                      {registro_detalle.hora_ingreso} - {registro_detalle.hora_salida || "En curso"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Horas Efectivas:</span>
                    <span className="font-semibold">
                      {registro_detalle.horas_trabajadas
                        ? `${Number(registro_detalle.horas_trabajadas).toFixed(2)} hrs`
                        : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visor con Google Maps Embebido */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#035683] flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-[#00ABBD]" />
                    Punto de Marcación y Perímetro Geodésico
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const lat = registro_detalle.lat_ingreso || -16.500053;
                      const lng = registro_detalle.lng_ingreso || -68.173455;
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                    }}
                    className="h-7 px-2.5 text-[11px] border-[#00ABBD] text-[#035683] rounded-lg flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 text-[#00ABBD]" />
                    Abrir en Google Maps
                  </Button>
                </div>

                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-[#E5E7EB]">
                  <iframe
                    title="Vista Satelital Google Maps"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${registro_detalle.lat_ingreso || -16.500053},${registro_detalle.lng_ingreso || -68.173455}&z=16&output=embed`}
                  />
                </div>
              </div>

              {/* Desglose de Cálculo Haversine y Multa */}
              <div className="p-3 bg-[#E3F9FA] rounded-xl border border-[#00ABBD]/30 space-y-1.5 text-xs text-[#035683]">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#00ABBD]" />
                    Validación Haversine & Multa
                  </span>
                  <span className="font-mono text-[11px]">
                    Lat: {registro_detalle.lat_ingreso || "-16.5000"} | Lng: {registro_detalle.lng_ingreso || "-68.1500"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Distancia registrada: <strong>{registro_detalle.distancia_ingreso_m} metros</strong>.
                  Tolerancia máxima permitida: 120 metros.
                </p>
                {registro_detalle.monto_multa_bs && registro_detalle.monto_multa_bs > 0 ? (
                  <p className="text-[11px] text-rose-700 font-medium pt-1 border-t border-[#00ABBD]/20">
                    ⚠ Retraso detectado en Escuela de Líderes: {registro_detalle.minutos_retraso} minutos. Multa reglamentaria BUMAND aplicada: <strong>Bs {Number(registro_detalle.monto_multa_bs || 0).toFixed(2)}</strong>.
                  </p>
                ) : registro_detalle.minutos_retraso && registro_detalle.minutos_retraso > 0 ? (
                  <p className="text-[11px] text-amber-700 font-medium pt-1 border-t border-[#00ABBD]/20">
                    ℹ Retraso registrado: {registro_detalle.minutos_retraso} minutos. Las prácticas formativas no contemplan sanciones económicas.
                  </p>
                ) : null}
              </div>

              {registro_detalle.convalidado_por && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-700" />
                    Convalidado por {registro_detalle.convalidado_por}
                  </div>
                  <p className="text-[11px] italic">"{registro_detalle.motivo_convalidacion}"</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row gap-2">
            {registro_detalle &&
              (registro_detalle.estado === "fuera_geocerca" ||
                registro_detalle.estado === "tardanza") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const reg = registro_detalle;
                    set_registro_detalle(null);
                    if (reg) {
                      abrirJustificacionParaRegistro(reg);
                    }
                  }}
                  className="rounded-xl text-xs font-bold border-[#FFB600] text-[#035683] bg-[#FFB600]/10 hover:bg-[#FFB600]/20 gap-1.5 w-full sm:w-auto"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-[#035683]" />
                  <span>Justificar con Comprobante (PDF/Foto)</span>
                </Button>
              )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => set_registro_detalle(null)}
              className="rounded-xl w-full sm:w-auto text-xs font-bold ml-auto"
            >
              Cerrar Detalle de Auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Interactivo de Llamada de Lista en Vivo (Supervisor / Organizador) */}
      <Dialog open={modal_lista_vivo_abierto} onOpenChange={set_modal_lista_vivo_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-[#035683] text-base">
                  <ListChecks className="w-5 h-5 text-[#00ABBD]" />
                  Llamada de Lista en Vivo (Viernes de Formación / Práctica)
                </DialogTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Confirmación presencial ágil para mentores de becarios que ya marcaron por geocerca.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={confirmarTodosPresencial}
                className="h-8 px-2.5 text-xs border-[#00ABBD] text-[#035683] rounded-lg font-bold"
              >
                Confirmar Todos
              </Button>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {lista_llamada_vivo_filtrada.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No tienes becarios designados pendientes en la llamada de lista actual.
              </div>
            ) : (
              lista_llamada_vivo_filtrada.map((becario) => (
              <div
                key={becario.id}
                className="p-3.5 rounded-xl border border-[#E5E7EB] bg-slate-50/60 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#035683]">{becario.nombre}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-[#E5E7EB]">
                      {becario.carrera}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <span>{becario.sede}</span>
                    <span>·</span>
                    {becario.marco_gps ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        GPS: {becario.hora_gps} ({becario.distancia_m}m)
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Sin marcación GPS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label
                    htmlFor={`switch-lista-${becario.id}`}
                    className={`text-xs font-bold cursor-pointer ${
                      becario.confirmado ? "text-emerald-700" : "text-muted-foreground"
                    }`}
                  >
                    {becario.confirmado ? "Presente" : "Pendiente"}
                  </Label>
                  <Switch
                    id={`switch-lista-${becario.id}`}
                    checked={becario.confirmado}
                    onCheckedChange={() => alternarConfirmacionPresencial(becario.id)}
                  />
                </div>
              </div>
              ))
            )}
          </div>

          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set_modal_lista_vivo_abierto(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={guardarLlamadaListaVivo}
              className="bg-[#035683] hover:bg-[#035683]/90 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Guardar Llamada de Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Institucional: Registro Manual de Asistencia (Contingencia sin Megas / Olvido) */}
      <Dialog
        open={modal_manual_abierto}
        onOpenChange={(abierto) => {
          if (!abierto) intentarCerrarModalManual();
          else set_modal_manual_abierto(true);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xl max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden bg-white border border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#035683]">
                  Registrar Asistencia Manual — Contingencia sin Megas / Olvido
                </DialogTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Habilitado exclusivamente en plataforma web para Administradores y Mentores.
                </CardDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4 text-xs">
            {/* Aviso institucional */}
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[11px] block">Cómputo Oficial de Contingencia</span>
                <span className="text-[11px] text-amber-800/90 leading-relaxed block">
                  Utilice este formulario si el becario no contaba con megas/saldo, olvidó marcar en la app móvil o tuvo fallas de batería. El registro se validará institucionalmente y sumará de inmediato a sus horas acumuladas del mes.
                </span>
              </div>
            </div>

            {/* 1. Selector de Becario (23 oficiales) */}
            <div className="space-y-1.5">
              <Label htmlFor="manual-becario" className="font-bold text-[#035683] text-xs flex items-center justify-between">
                <span>
                  {es_mentor
                    ? `Becario Asignado (${becarios_manual_disponibles.length} designados)`
                    : "Becario Asignado (23 Oficiales BUMAND)"}
                </span>
                <span className="text-[10px] font-mono font-normal text-muted-foreground">
                  C.I. y Unidad institucional
                </span>
              </Label>
              <Select
                value={String(manual_becario_id)}
                onValueChange={(val) => set_manual_becario_id(Number(val))}
              >
                <SelectTrigger id="manual-becario" className="h-10 text-xs rounded-xl border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="Seleccione un becario" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border-[#E5E7EB]">
                  {becarios_manual_disponibles.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)} etiqueta={`${b.nombre} (${b.unidad})`} className="text-xs py-2">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-800">{b.nombre}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          CI: {b.ci} · {b.unidad} ({b.iglesia})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Tipo de Actividad (3 Obligatorias) */}
            <div className="space-y-1.5">
              <Label className="font-bold text-[#035683] text-xs">
                Tipo de Actividad Obligatoria
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    set_manual_tipo_actividad("practicas");
                    set_manual_sede(SEDES_POR_ACTIVIDAD.practicas[0]);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    manual_tipo_actividad === "practicas"
                      ? "bg-[#035683] text-white border-[#035683] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="block font-bold">Prácticas</span>
                  <span className="text-[10px] opacity-80 block">Preprofesionales</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    set_manual_tipo_actividad("escuela_lideres");
                    set_manual_sede(SEDES_POR_ACTIVIDAD.escuela_lideres[0]);
                    set_manual_hora_ingreso("14:30");
                    set_manual_hora_salida("17:30");
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    manual_tipo_actividad === "escuela_lideres"
                      ? "bg-[#D97706] text-white border-[#D97706] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="block font-bold">Escuela de</span>
                  <span className="text-[10px] opacity-80 block">Líderes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    set_manual_tipo_actividad("acciones_servicio");
                    set_manual_sede(SEDES_POR_ACTIVIDAD.acciones_servicio[0]);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    manual_tipo_actividad === "acciones_servicio"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="block font-bold">Acciones de</span>
                  <span className="text-[10px] opacity-80 block">Servicio</span>
                </button>
              </div>
            </div>

            {/* 3. Sede / Lugar / Evento / Iglesia (Contextual) */}
            <div className="space-y-1.5">
              <Label htmlFor="manual-sede" className="font-bold text-[#035683] text-xs">
                {manual_tipo_actividad === "practicas"
                  ? "Agencia Diaconía para Prácticas"
                  : manual_tipo_actividad === "escuela_lideres"
                  ? "Sede Central de Escuela de Líderes"
                  : "Evento / Iglesia para Acciones de Servicio"}
              </Label>
              <Select
                value={manual_sede}
                onValueChange={(val: string | null) => {
                  if (val) set_manual_sede(val);
                }}
              >
                <SelectTrigger id="manual-sede" className="h-10 text-xs rounded-xl border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="Seleccione lugar / sede" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {SEDES_POR_ACTIVIDAD[manual_tipo_actividad].map((sede) => (
                    <SelectItem key={sede} value={sede} className="text-xs">
                      {sede}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Fecha y Horarios (Ingreso / Salida) con cálculo en vivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="manual-fecha" className="font-bold text-[#035683] text-xs">
                  Fecha
                </Label>
                <SeleccionadorFecha
                  id="manual-fecha"
                  valorString={manual_fecha}
                  alCambiarString={(val) => set_manual_fecha(val)}
                  className="h-10 text-xs rounded-xl border-[#E5E7EB]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-ingreso" className="font-bold text-[#035683] text-xs">
                  Hora Ingreso
                </Label>
                <Input
                  id="manual-ingreso"
                  type="time"
                  value={manual_hora_ingreso}
                  onChange={(e) => set_manual_hora_ingreso(e.target.value)}
                  className="h-10 text-xs rounded-xl border-[#E5E7EB] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-salida" className="font-bold text-[#035683] text-xs">
                  Hora Salida
                </Label>
                <Input
                  id="manual-salida"
                  type="time"
                  value={manual_hora_salida}
                  onChange={(e) => set_manual_hora_salida(e.target.value)}
                  className="h-10 text-xs rounded-xl border-[#E5E7EB] font-mono"
                />
              </div>
            </div>

            {/* Cómputo de horas en vivo */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#035683]" />
                Tiempo computado en vivo:
              </span>
              <span className="font-mono font-bold text-sm text-[#035683]">
                {calcularHorasTranscurridas(manual_hora_ingreso, manual_hora_salida).toFixed(2)} horas
              </span>
            </div>

            {/* 5. Motivo de Contingencia */}
            <div className="space-y-1.5">
              <Label htmlFor="manual-motivo" className="font-bold text-[#035683] text-xs">
                Motivo de Contingencia
              </Label>
              <Select
                value={manual_motivo}
                onValueChange={(val: string | null) => {
                  if (val) set_manual_motivo(val);
                }}
              >
                <SelectTrigger id="manual-motivo" className="h-10 text-xs rounded-xl border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="Seleccione motivo de contingencia" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {MOTIVOS_CONTINGENCIA.map((motivo) => (
                    <SelectItem key={motivo} value={motivo} className="text-xs">
                      {motivo}
                    </SelectItem>
                  ))}
                  <SelectItem value="otro" className="text-xs">
                    Otro motivo específico...
                  </SelectItem>
                </SelectContent>
              </Select>

              {manual_motivo === "otro" && (
                <Input
                  placeholder="Especifique la causa justificada de contingencia..."
                  value={manual_motivo_personalizado}
                  onChange={(e) => set_manual_motivo_personalizado(e.target.value)}
                  className="h-9 text-xs rounded-xl border-[#E5E7EB] mt-2"
                />
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={manual_guardando}
              onClick={intentarCerrarModalManual}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={manual_guardando}
              onClick={manejarGuardarAsistenciaManual}
              className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {manual_guardando ? "Registrando..." : "Guardar Asistencia Manual"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Modal Canónico: Cambiar Lugar de Acción de Servicio (Viernes) - TAREA-01 */}
      <Dialog open={modal_cambiar_lugar_abierto} onOpenChange={set_modal_cambiar_lugar_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E5E7EB] rounded-2xl shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
            <DialogTitle className="text-lg font-bold text-[#035683] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00ABBD]" />
              Cambio de Lugar, Escuela de Líderes
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Define la nueva sede o coordenadas geodésicas WGS84 para el control de asistencia de las acciones diaconales de este viernes.
            </p>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* 1. Selector de Sede Oficial de Acciones de Servicio */}
            <div className="space-y-1.5">
              <Label className="font-bold text-[#035683] text-xs">
                Sede o Iglesia Institucional de Acción Diaconal *
              </Label>
              <Select
                value={cambio_sede}
                onValueChange={(val: string | null) => {
                  if (val) {
                    set_cambio_sede(val);
                    set_cambio_referencia(val);
                  }
                }}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl border-[#E5E7EB] bg-white">
                  <SelectValue placeholder="Seleccione iglesia o centro diaconal" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] z-[120]">
                  {SEDES_POR_ACTIVIDAD.acciones_servicio.map((sede) => (
                    <SelectItem key={sede} value={sede} className="text-xs">
                      {sede}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Parámetros Geodésicos EPSG:4326 */}
            <div className="p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl space-y-3">
              <span className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#00ABBD]" />
                Geocerca y Coordenadas GPS de Marcación
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Latitud *</Label>
                  <Input
                    required
                    value={cambio_latitud}
                    onChange={(e) => set_cambio_latitud(e.target.value)}
                    placeholder="-16.500054"
                    className="h-9 text-xs border-[#E5E7EB] font-mono rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Longitud *</Label>
                  <Input
                    required
                    value={cambio_longitud}
                    onChange={(e) => set_cambio_longitud(e.target.value)}
                    placeholder="-68.173455"
                    className="h-9 text-xs border-[#E5E7EB] font-mono rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Radio (m) *</Label>
                  <Input
                    type="number"
                    required
                    min={10}
                    max={1000}
                    value={cambio_radio}
                    onChange={(e) => set_cambio_radio(e.target.value)}
                    placeholder="120"
                    className="h-9 text-xs border-[#E5E7EB] font-mono rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Dirección / Referencia de Ubicación *</Label>
                <Input
                  required
                  value={cambio_referencia}
                  onChange={(e) => set_cambio_referencia(e.target.value)}
                  placeholder="Ej: Av. 6 de Marzo frente al Cruce Viacha, El Alto"
                  className="h-9 text-xs border-[#E5E7EB] rounded-xl"
                />
              </div>
            </div>

            {/* 3. Motivo institucional */}
            <div className="space-y-1.5">
              <Label className="font-bold text-[#035683] text-xs">
                Motivo del Cambio de Lugar (Opcional)
              </Label>
              <Textarea
                value={cambio_motivo}
                onChange={(e) => set_cambio_motivo(e.target.value)}
                placeholder="Indique el motivo del cambio de recinto para este viernes..."
                className="text-xs border-[#E5E7EB] rounded-xl focus-visible:ring-[#00ABBD] min-h-[60px]"
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={cambio_guardando}
              onClick={() => set_modal_cambiar_lugar_abierto(false)}
              className="rounded-xl border-[#E5E7EB] text-xs h-10 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={cambio_guardando}
              onClick={manejarGuardarCambioLugarAsistencia}
              className="rounded-xl bg-[#007BBE] hover:bg-[#035683] text-white text-xs h-10 px-4 font-semibold gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4 text-[#FFB600]" />
              <span>{cambio_guardando ? "Reubicando..." : "Confirmar Cambio de Lugar"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Confirmación de Eliminación de Registro de Asistencia */}
      {registro_eliminar && (
        <AlertDialog
          open={!!registro_eliminar}
          onOpenChange={(abierto) => {
            if (!abierto && !eliminando_registro) set_registro_eliminar(null);
          }}
        >
          <AlertDialogContent className="sm:max-w-[460px] p-6 bg-white border-[#E5E7EB] rounded-2xl">
            <AlertDialogHeader className="pb-2">
              <AlertDialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                ¿Eliminar registro de asistencia?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600">
                Se eliminará permanentemente la marcación de{" "}
                <strong className="text-[#035683]">{registro_eliminar.becario_nombre}</strong>{" "}
                ({registro_eliminar.fecha} · {registro_eliminar.hora_ingreso}
                {registro_eliminar.hora_salida ? ` - ${registro_eliminar.hora_salida}` : ""}) tanto del sistema web como de la aplicación móvil.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-3">
              <AlertDialogCancel disabled={eliminando_registro}>Cancelar</AlertDialogCancel>
              <Button
                type="button"
                disabled={eliminando_registro}
                onClick={manejarConfirmarEliminarAsistencia}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                {eliminando_registro ? "Eliminando..." : "Sí, quitar registro"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Diálogo de Confirmación Institucional Unificado */}
      {DialogoConfirmacionInstitucional}

      {/* Diálogo Modal de Justificación con Carga de Comprobante PDF / Imagen */}
      <DialogoJustificarFalta
        abierto={dialogo_justificar_abierto}
        alCambiarAbierto={set_dialogo_justificar_abierto}
        incidencia={incidencia_a_justificar}
        alCompletar={() => {
          if (incidencia_a_justificar?.id) {
            set_registros_locales((prev) =>
              prev.map((r) =>
                r.id === incidencia_a_justificar.id
                  ? {
                      ...r,
                      estado: "convalidado",
                      convalidado_por: usuario?.nombre || "Mentor Diaconía",
                      motivo_convalidacion: "Justificación radicada con respaldo documental probatorio",
                    }
                  : r
              )
            );
          }
        }}
      />
    </div>
  );
}
