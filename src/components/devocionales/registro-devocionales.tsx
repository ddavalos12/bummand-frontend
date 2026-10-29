"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import {
  BookOpen,
  Church,
  Heart,
  Plus,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Video,
  ClipboardCheck,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CalendarCheck,
  FileText,
  Users,
  Check,
} from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { RafagaCelebracion, BotonJuicy, TarjetaSpotlight } from "@/components/animaciones";
import { useFormularioValidado } from "@/hooks/useFormularioValidado";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { toast } from "sonner";
import { VersiculoBiblicoWeb } from "./modal-versiculo-diario";
import { SelectorCitaBiblica } from "./selector-cita-biblica";
import { useConsulta } from "@/hooks/useConsulta";
import { clienteApi } from "@/lib/cliente-api";
import { peticionAutenticada } from "@/lib/autenticacion-fetch";

export type EstadoCitaSeguimiento = "programada" | "realizada" | "reprogramada" | "cancelada";
export type ModalidadCitaSeguimiento = "presencial" | "virtual";

export interface CitaSeguimiento {
  id: number;
  supervisor_id?: number;
  nombre_supervisor?: string;
  becario_id: number;
  nombre_becario: string;
  carrera_becario?: string;
  fecha_cita: string;
  hora_cita: string;
  modalidad: ModalidadCitaSeguimiento;
  lugar_o_enlace: string;
  motivo_retroalimentacion: string;
  cita_biblica?: string;
  texto_biblico?: string;
  acuerdos_retroalimentacion?: string | null;
  estado: EstadoCitaSeguimiento;
  creado_en?: string;
}

export interface BecarioSupervisado {
  id: number;
  nombre: string;
  carrera: string;
  universidad?: string;
  sede?: string;
  horas_acumuladas?: number;
  correo?: string;
  telefono?: string;
}

export interface DevocionalItem {
  id: number;
  becario_id: number;
  nombre_becario: string;
  fecha: string;
  cita_biblica: string;
  titulo: string;
  reflexion: string;
  oracion_peticion: string;
  comentario_pastoral?: string | null;
  revisado_por_pastor: boolean;
}

const BECARIOS_SUPERVISADOS_SEMILLA: BecarioSupervisado[] = [
  {
    id: 1,
    nombre: "Nilda Amalia Churata Paye",
    carrera: "Estadística e Informática",
    universidad: "UMSA",
    sede: "Oficina Nacional Diaconía",
    horas_acumuladas: 92,
    correo: "nilda.churata@bumand.edu.bo",
    telefono: "+591 76543210",
  },
  {
    id: 2,
    nombre: "Edgar Elias Alarcon Huanca",
    carrera: "Medicina y Salud Comunitaria",
    universidad: "UPEA",
    sede: "Consultorio Médico Diaconía",
    horas_acumuladas: 74,
    correo: "edgar.alarcon@bumand.edu.bo",
    telefono: "+591 77123456",
  },
  {
    id: 3,
    nombre: "Adai Belen Huayta Cardozo",
    carrera: "Administración y Gestión de Proyectos",
    universidad: "UCB",
    sede: "Sede Central Diaconía",
    horas_acumuladas: 85,
    correo: "adai.huayta@bumand.edu.bo",
    telefono: "+591 78901234",
  },
];

const CITAS_SEGUIMIENTO_SEMILLA: CitaSeguimiento[] = [
  {
    id: 1,
    supervisor_id: 10,
    nombre_supervisor: "Pastor David Mendoza (Supervisor)",
    becario_id: 1,
    nombre_becario: "Nilda Amalia Churata Paye",
    carrera_becario: "Estadística e Informática",
    fecha_cita: "2026-11-05",
    hora_cita: "10:30",
    modalidad: "presencial",
    lugar_o_enlace: "Oficina Diaconía - Sala de Supervisión Pastoral",
    motivo_retroalimentacion: "Evaluación de medio término de horas de servicio, equilibrio académico y salud familiar.",
    cita_biblica: "Josué 1:9",
    texto_biblico: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.",
    acuerdos_retroalimentacion: null,
    estado: "programada",
  },
  {
    id: 2,
    supervisor_id: 10,
    nombre_supervisor: "Pastor David Mendoza (Supervisor)",
    becario_id: 2,
    nombre_becario: "Edgar Elias Alarcon Huanca",
    carrera_becario: "Medicina y Salud Comunitaria",
    fecha_cita: "2026-10-24",
    hora_cita: "15:00",
    modalidad: "virtual",
    lugar_o_enlace: "https://meet.google.com/dia-bumand-sup",
    motivo_retroalimentacion: "Acompañamiento en prácticas clínicas del Consultorio Médico y gestión del tiempo en rotaciones hospitalarias.",
    cita_biblica: "Proverbios 3:5-6",
    texto_biblico: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.",
    acuerdos_retroalimentacion: "Se acordó readecuar su horario de servicio los días martes para no coincidir con sus prácticas de anatomía clínica. Mantendrá lectura semanal de Proverbios.",
    estado: "realizada",
  },
  {
    id: 3,
    supervisor_id: 10,
    nombre_supervisor: "Pastor David Mendoza (Supervisor)",
    becario_id: 3,
    nombre_becario: "Adai Belen Huayta Cardozo",
    carrera_becario: "Administración y Gestión de Proyectos",
    fecha_cita: "2026-11-08",
    hora_cita: "09:00",
    modalidad: "presencial",
    lugar_o_enlace: "Oficina Diaconía - Sala de Mentoría",
    motivo_retroalimentacion: "Revisión del proyecto de liderazgo comunitario y seguimiento a sus peticiones de oración familiares.",
    cita_biblica: "Colosenses 3:23-24",
    texto_biblico: "Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.",
    acuerdos_retroalimentacion: null,
    estado: "programada",
  },
];

const DEVOCIONALES_INICIALES: DevocionalItem[] = [
  {
    id: 1,
    becario_id: 1,
    nombre_becario: "Nilda Amalia Churata Paye",
    fecha: "2026-10-07",
    cita_biblica: "Filipenses 4:13",
    titulo: "Fortaleza en el Servicio Diario",
    reflexion:
      "Hoy medité sobre cómo el Señor renueva las fuerzas en el servicio a la comunidad. En las tareas asignadas en Seguridad Física de Diaconía, pude experimentar Su gracia y paciencia.",
    oracion_peticion: "Sabiduría en los exámenes universitarios y salud para mi familia.",
    comentario_pastoral: null,
    revisado_por_pastor: false,
  },
  {
    id: 2,
    becario_id: 2,
    nombre_becario: "Edgar Elias Alarcon Huanca",
    fecha: "2026-10-06",
    cita_biblica: "Proverbios 3:5-6",
    titulo: "Confianza Plena en el Señor",
    reflexion:
      "Reconozco que no debo apoyarme en mi propia prudencia en las prácticas del Consultorio Médico, sino pedir dirección a Dios en cada atención.",
    oracion_peticion: "Por los pacientes de escasos recursos y provisión para mis estudios de Medicina.",
    comentario_pastoral: null,
    revisado_por_pastor: false,
  },
  {
    id: 3,
    becario_id: 3,
    nombre_becario: "Adai Belen Huayta Cardozo",
    fecha: "2026-10-04",
    cita_biblica: "Colosenses 3:23-24",
    titulo: "Trabajar con Excelencia para Cristo",
    reflexion:
      "Todo lo que hagamos en el procesamiento estadístico y en la formación de la Escuela de Líderes debe honrar el nombre de Dios.",
    oracion_peticion: "Por la unidad de los becarios y el retiro espiritual de fin de semestre.",
    comentario_pastoral: null,
    revisado_por_pastor: false,
  },
];

export function RegistroDevocionales() {
  const { usuario } = usarAutenticacion();

  const es_supervisor = usuario?.rol === "supervisor";
  const es_becario = usuario?.rol === "becario";
  const es_admin = usuario?.rol === "administrador";

  // Estados de Citas y Supervisados
  const [citas_seguimiento, set_citas_seguimiento] = useState<CitaSeguimiento[]>(CITAS_SEGUIMIENTO_SEMILLA);
  const [becarios_supervisados, set_becarios_supervisados] = useState<BecarioSupervisado[]>(BECARIOS_SUPERVISADOS_SEMILLA);
  const [cargando_citas, set_cargando_citas] = useState<boolean>(false);

  // Estados de Modales de Citas
  const [modal_dar_cita_abierto, set_modal_dar_cita_abierto] = useState<boolean>(false);
  const [modal_acuerdos_abierto, set_modal_acuerdos_abierto] = useState<boolean>(false);
  const [cita_seleccionada_acuerdos, set_cita_seleccionada_acuerdos] = useState<CitaSeguimiento | null>(null);

  // Formulario Dar Cita
  const [formulario_becario_id, set_formulario_becario_id] = useState<string>("1");
  const [formulario_fecha_cita, set_formulario_fecha_cita] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [formulario_hora_cita, set_formulario_hora_cita] = useState<string>("10:00");
  const [formulario_modalidad, set_formulario_modalidad] = useState<ModalidadCitaSeguimiento>("presencial");
  const [formulario_lugar_o_enlace, set_formulario_lugar_o_enlace] = useState<string>(
    "Oficina Diaconía - Sala de Supervisión Pastoral"
  );
  const [formulario_motivo, set_formulario_motivo] = useState<string>("");
  const [formulario_cita_biblica, set_formulario_cita_biblica] = useState<string>("Josué 1:9");
  const [formulario_texto_biblico, set_formulario_texto_biblico] = useState<string>(
    "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas."
  );
  const [guardando_cita, set_guardando_cita] = useState<boolean>(false);

  // Formulario Registrar Acuerdos
  const [acuerdos_formulario_texto, set_acuerdos_formulario_texto] = useState<string>("");
  const [estado_cita_formulario, set_estado_cita_formulario] = useState<EstadoCitaSeguimiento>("realizada");
  const [guardando_acuerdos, set_guardando_acuerdos] = useState<boolean>(false);

  // Filtros de Citas
  const [filtro_estado_citas, set_filtro_estado_citas] = useState<"todas" | "programada" | "realizada">("todas");
  const [filtro_texto_citas, set_filtro_texto_citas] = useState<string>("");

  // Estados de Devocionales
  const [devocionales_locales, set_devocionales_locales] = useState<DevocionalItem[]>(DEVOCIONALES_INICIALES);
  const [filtro_texto, set_filtro_texto] = useState<string>("");
  const [filtro_estado, set_filtro_estado] = useState<"todos" | "pendientes" | "revisados">("todos");
  const [dialogo_abierto, set_dialogo_abierto] = useState<boolean>(false);
  const [dialogo_pastoral_abierto, set_dialogo_pastoral_abierto] = useState<boolean>(false);
  const [devocional_seleccionado, set_devocional_seleccionado] = useState<DevocionalItem | null>(null);
  const [comentario_pastoral_texto, set_comentario_pastoral_texto] = useState<string>("");
  const [guardando_retroalimentacion, set_guardando_retroalimentacion] = useState<boolean>(false);
  const [mostrar_celebracion, set_mostrar_celebracion] = useState<boolean>(false);
  const [versiculo_diario, set_versiculo_diario] = useState<VersiculoBiblicoWeb | null>(null);

  // Carga reactiva de citas y cohorte mediante peticionAutenticada
  useEffect(() => {
    let cancelado = false;
    const cargarDatosSeguimiento = async () => {
      set_cargando_citas(true);
      try {
        const respuesta_citas = await peticionAutenticada<CitaSeguimiento[]>("/api/devocionales/citas");
        if (!cancelado && Array.isArray(respuesta_citas) && respuesta_citas.length > 0) {
          set_citas_seguimiento(respuesta_citas);
        } else if (!cancelado) {
          set_citas_seguimiento(CITAS_SEGUIMIENTO_SEMILLA);
        }
      } catch {
        if (!cancelado) set_citas_seguimiento(CITAS_SEGUIMIENTO_SEMILLA);
      }

      if (es_supervisor) {
        try {
          const respuesta_supervisados = await peticionAutenticada<BecarioSupervisado[]>(
            "/api/devocionales/mis-supervisados"
          );
          if (!cancelado && Array.isArray(respuesta_supervisados) && respuesta_supervisados.length > 0) {
            set_becarios_supervisados(respuesta_supervisados);
          } else if (!cancelado) {
            set_becarios_supervisados(BECARIOS_SUPERVISADOS_SEMILLA);
          }
        } catch {
          if (!cancelado) set_becarios_supervisados(BECARIOS_SUPERVISADOS_SEMILLA);
        }
      }
      if (!cancelado) set_cargando_citas(false);
    };

    cargarDatosSeguimiento();
    return () => {
      cancelado = true;
    };
  }, [es_supervisor]);

  // Carga reactiva de devocionales
  const { datos: devocionales_servidor, invalidar } = useConsulta<DevocionalItem[]>(
    "devocionales_todos",
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/devocionales");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map((item, idx) => ({
            id: item.id || idx + 1,
            becario_id: item.becario_id || idx + 1,
            nombre_becario:
              item.becario?.nombre ||
              item.becario?.usuario?.nombre ||
              item.nombre_becario ||
              `Becario ${idx + 1}`,
            fecha: item.fecha ? String(item.fecha).split("T")[0] : new Date().toISOString().split("T")[0],
            cita_biblica: item.cita_biblica || "Filipenses 4:13",
            titulo: item.titulo || "Reflexión Personal",
            reflexion: item.reflexion || "",
            oracion_peticion: item.oracion_peticion || "",
            comentario_pastoral: item.comentario_pastoral || null,
            revisado_por_pastor: Boolean(item.revisado_por_pastor && item.comentario_pastoral),
          }));
        }
        return DEVOCIONALES_INICIALES;
      } catch {
        return DEVOCIONALES_INICIALES;
      }
    },
    { datos_iniciales: DEVOCIONALES_INICIALES }
  );

  const lista_devocionales =
    devocionales_servidor && devocionales_servidor.length > 0
      ? devocionales_servidor
      : devocionales_locales;

  // Cargar versículo bíblico del día
  useEffect(() => {
    const cargarVersiculoDiario = async () => {
      try {
        const respuesta = await clienteApi.get<VersiculoBiblicoWeb>("/api/biblia/versiculo-diario");
        if (respuesta && respuesta.cita) {
          set_versiculo_diario(respuesta);
        }
      } catch {
        set_versiculo_diario({
          cita: "Filipenses 4:13",
          libro: "Filipenses",
          capitulo: 4,
          versiculo: 13,
          texto: "Todo lo puedo en Cristo que me fortalece.",
          version: "Reina-Valera 1960 (RVR60)",
          tema: "Fortaleza y Servicio",
          reflexion_diaconal:
            "En cada labor y apoyo formativo dentro de Diaconía, Cristo es quien renueva nuestras capacidades para servir con excelencia.",
        });
      }
    };
    cargarVersiculoDiario();
  }, []);

  // Formulario nuevo devocional
  const formulario_devocional = useFormularioValidado(
    {
      fecha: new Date().toISOString().split("T")[0],
      cita_biblica: "Filipenses 4:13",
      titulo: "",
      reflexion: "",
      oracion_peticion: "",
    },
    {
      fecha: { obligatorio: "La fecha del devocional es obligatoria.", formato: "fecha" },
      cita_biblica: { obligatorio: "Seleccione el pasaje bíblico.", min_caracteres: 3 },
      titulo: { obligatorio: "Ingrese el título o tema del devocional.", min_caracteres: 4 },
      reflexion: { obligatorio: "La meditación personal es obligatoria.", min_caracteres: 10 },
      oracion_peticion: { obligatorio: "Ingrese sus motivos de oración.", min_caracteres: 5 },
    }
  );

  const aplicarVersiculoAlFormulario = (v?: VersiculoBiblicoWeb) => {
    const datos_v = v || versiculo_diario;
    if (!datos_v) return;
    formulario_devocional.cambiarValor("cita_biblica", datos_v.cita);
    formulario_devocional.cambiarValor("titulo", datos_v.tema || "Reflexión del Día");
    formulario_devocional.cambiarValor(
      "reflexion",
      `«${datos_v.texto}» (${datos_v.version})\n\nReflexión personal: `
    );
    set_dialogo_abierto(true);
    toast.info("Versículo diario cargado", {
      description: `Se completó la cita ${datos_v.cita} para tu reflexión.`,
    });
  };

  const manejarCrearDevocional = async () => {
    if (!formulario_devocional.validarFormulario()) {
      return;
    }

    const { fecha, cita_biblica, titulo, reflexion, oracion_peticion } = formulario_devocional.valores;

    const payload = {
      fecha: String(fecha),
      cita_biblica: String(cita_biblica).trim(),
      titulo: String(titulo).trim(),
      reflexion: String(reflexion).trim(),
      oracion_peticion: String(oracion_peticion).trim(),
    };

    try {
      await clienteApi.post("/api/devocionales", payload);
      invalidar();
    } catch {
      const nuevo: DevocionalItem = {
        id: lista_devocionales.length + 1,
        becario_id: usuario?.becario_id || 1,
        nombre_becario: usuario?.nombre || "Becario Institucional",
        ...payload,
        comentario_pastoral: null,
        revisado_por_pastor: false,
      };
      set_devocionales_locales([nuevo, ...lista_devocionales]);
    }

    formulario_devocional.reiniciarFormulario();
    set_dialogo_abierto(false);
    set_mostrar_celebracion(true);
    toast.success("Devocional registrado con bendición", {
      description: "Tu reflexión espiritual ha sido registrada y notificada a tu supervisor.",
    });
  };

  const manejarGuardarRetroalimentacionDevocional = async () => {
    if (!devocional_seleccionado || !comentario_pastoral_texto.trim()) return;

    set_guardando_retroalimentacion(true);
    try {
      await clienteApi.patch(`/api/devocionales/${devocional_seleccionado.id}/retroalimentar`, {
        comentario_pastoral: comentario_pastoral_texto.trim(),
      });
      invalidar();
    } catch {
      // Fallback reactivo
    } finally {
      set_guardando_retroalimentacion(false);
    }

    set_devocionales_locales((prev) =>
      prev.map((d) =>
        d.id === devocional_seleccionado.id
          ? {
              ...d,
              comentario_pastoral: comentario_pastoral_texto.trim(),
              revisado_por_pastor: true,
            }
          : d
      )
    );

    set_dialogo_pastoral_abierto(false);
    set_devocional_seleccionado(null);
    set_comentario_pastoral_texto("");
    toast.success("Retroalimentación pastoral guardada", {
      description: "El acompañamiento pastoral ha sido asentado en la reflexión del becario.",
    });
  };

  // Abrir modal de cita rápida para un becario específico
  const abrirModalCitaParaBecario = (becario_id: number) => {
    set_formulario_becario_id(String(becario_id));
    set_formulario_motivo("");
    set_modal_dar_cita_abierto(true);
  };

  // Guardar cita de seguimiento programada
  const manejarAgendarCita = async () => {
    const becario_id_num = Number(formulario_becario_id);
    const becario_encontrado = becarios_supervisados.find((b) => b.id === becario_id_num);

    if (!formulario_fecha_cita || !formulario_hora_cita) {
      toast.error("Datos incompletos", {
        description: "Por favor define la fecha y hora de la cita de seguimiento.",
      });
      return;
    }

    if (!formulario_motivo.trim()) {
      toast.error("Motivo obligatorio", {
        description: "Ingresa el motivo o temario del seguimiento pastoral.",
      });
      return;
    }

    set_guardando_cita(true);

    const nueva_cita_payload: CitaSeguimiento = {
      id: Date.now(),
      supervisor_id: usuario?.id || 10,
      nombre_supervisor: usuario?.nombre || "Supervisor Pastoral",
      becario_id: becario_id_num,
      nombre_becario: becario_encontrado?.nombre || "Becario Supervisado",
      carrera_becario: becario_encontrado?.carrera || "Carrera Institucional",
      fecha_cita: formulario_fecha_cita,
      hora_cita: formulario_hora_cita,
      modalidad: formulario_modalidad,
      lugar_o_enlace: formulario_lugar_o_enlace.trim(),
      motivo_retroalimentacion: formulario_motivo.trim(),
      cita_biblica: formulario_cita_biblica.trim(),
      texto_biblico: formulario_texto_biblico.trim(),
      acuerdos_retroalimentacion: null,
      estado: "programada",
      creado_en: new Date().toISOString(),
    };

    try {
      await peticionAutenticada("/api/devocionales/citas", {
        method: "POST",
        body: JSON.stringify(nueva_cita_payload),
      });
    } catch {
      // Fallback reactivo optimista local
    } finally {
      set_guardando_cita(false);
    }

    set_citas_seguimiento((prev) => [nueva_cita_payload, ...prev]);
    set_modal_dar_cita_abierto(false);
    set_formulario_motivo("");
    set_mostrar_celebracion(true);

    toast.success("Cita de seguimiento agendada exitosamente", {
      description: `Se agendó la cita con ${nueva_cita_payload.nombre_becario} para el ${formulario_fecha_cita} a las ${formulario_hora_cita}.`,
    });
  };

  // Guardar acuerdos de retroalimentación de cita
  const manejarGuardarAcuerdos = async () => {
    if (!cita_seleccionada_acuerdos) return;
    if (!acuerdos_formulario_texto.trim()) {
      toast.error("Acuerdos obligatorios", {
        description: "Escriba los compromisos y acuerdos conversados en la cita.",
      });
      return;
    }

    set_guardando_acuerdos(true);
    const acuerdos_limpios = acuerdos_formulario_texto.trim();

    try {
      await peticionAutenticada(`/api/devocionales/citas/${cita_seleccionada_acuerdos.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          acuerdos_retroalimentacion: acuerdos_limpios,
          estado: estado_cita_formulario,
        }),
      });
    } catch {
      // Fallback local
    } finally {
      set_guardando_acuerdos(false);
    }

    set_citas_seguimiento((prev) =>
      prev.map((c) =>
        c.id === cita_seleccionada_acuerdos.id
          ? {
              ...c,
              acuerdos_retroalimentacion: acuerdos_limpios,
              estado: estado_cita_formulario,
            }
          : c
      )
    );

    set_modal_acuerdos_abierto(false);
    set_cita_seleccionada_acuerdos(null);
    set_acuerdos_formulario_texto("");

    toast.success("Acuerdos de retroalimentación asentados", {
      description: "Los acuerdos y el estado de la cita se han guardado con bendición.",
    });
  };

  // Citas filtradas para el supervisor
  const citas_filtradas_supervisor = useMemo(() => {
    return citas_seguimiento.filter((cita) => {
      const coincide_texto =
        cita.nombre_becario.toLowerCase().includes(filtro_texto_citas.toLowerCase()) ||
        cita.motivo_retroalimentacion.toLowerCase().includes(filtro_texto_citas.toLowerCase()) ||
        (cita.cita_biblica && cita.cita_biblica.toLowerCase().includes(filtro_texto_citas.toLowerCase()));

      if (!coincide_texto) return false;

      if (filtro_estado_citas === "programada") return cita.estado === "programada" || cita.estado === "reprogramada";
      if (filtro_estado_citas === "realizada") return cita.estado === "realizada";
      return true;
    });
  }, [citas_seguimiento, filtro_texto_citas, filtro_estado_citas]);

  // Citas exclusivas para el becario en sesión
  const citas_del_becario = useMemo(() => {
    const id_becario_activo = usuario?.becario_id || 1;
    return citas_seguimiento.filter((c) => c.becario_id === id_becario_activo);
  }, [citas_seguimiento, usuario?.becario_id]);

  const citas_proximas_becario = useMemo(() => {
    return citas_del_becario.filter((c) => c.estado === "programada" || c.estado === "reprogramada");
  }, [citas_del_becario]);

  const citas_acuerdos_becario = useMemo(() => {
    return citas_del_becario.filter((c) => c.estado === "realizada" || Boolean(c.acuerdos_retroalimentacion));
  }, [citas_del_becario]);

  // Devocionales filtrados
  const total_pendientes = lista_devocionales.filter((d) => !d.revisado_por_pastor).length;
  const total_revisados = lista_devocionales.filter((d) => d.revisado_por_pastor).length;

  const devocionales_filtrados = useMemo(() => {
    return lista_devocionales.filter((d) => {
      const coincide_texto =
        d.cita_biblica.toLowerCase().includes(filtro_texto.toLowerCase()) ||
        d.titulo.toLowerCase().includes(filtro_texto.toLowerCase()) ||
        d.nombre_becario.toLowerCase().includes(filtro_texto.toLowerCase()) ||
        d.reflexion.toLowerCase().includes(filtro_texto.toLowerCase());

      if (!coincide_texto) return false;

      if (filtro_estado === "pendientes") return !d.revisado_por_pastor;
      if (filtro_estado === "revisados") return d.revisado_por_pastor;
      return true;
    });
  }, [lista_devocionales, filtro_texto, filtro_estado]);

  // ==========================================
  // EXCLUSIÓN ESTRICTA DE ADMINISTRADOR
  // ==========================================
  if (es_admin) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white/90 backdrop-blur-md shadow-xs p-8 text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center mx-auto mb-4 border border-[#007BBE]/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#122029] mb-2">
          Módulo Confidencial de Seguimiento y Retroalimentación
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          Este espacio de acompañamiento pastoral, consejería y retroalimentación personalizada es un ámbito estrictamente
          confidencial reservado para la interacción directa entre cada <strong>Supervisor pastoral</strong> y sus{" "}
          <strong>Becarios supervisados</strong>.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
          <HeartHandshake className="w-4 h-4 text-[#007BBE]" />
          <span>Fundación Diaconía FRIF-IFD · Acompañamiento Integral y Espiritual</span>
        </div>
      </Card>
    );
  }

  // ==========================================
  // RENDERIZADO PRINCIPAL (SUPERVISOR / BECARIO)
  // ==========================================
  return (
    <div className="space-y-8 pb-10">
      {/* Ráfaga de Celebración Watermelon UI */}
      <RafagaCelebracion activo={mostrar_celebracion} alTerminar={() => set_mostrar_celebracion(false)} />

      {/* ========================================================= */}
      {/* 1. VISTA EXCLUSIVA PARA EL SUPERVISOR (es_supervisor) */}
      {/* ========================================================= */}
      {es_supervisor && (
        <div className="space-y-8">
          {/* Cabecera Principal del Supervisor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#007BBE]/10 flex items-center justify-center text-[#007BBE]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#122029]">
                    Seguimiento y Retroalimentación de mis Supervisados
                  </h2>
                  <span className="text-[11px] font-semibold text-[#00808E] uppercase tracking-wider">
                    Pastoral y Mentoría Diaconal BUMAND
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                Acompañamiento integral a tu cohorte de becarios asignados: programa citas periódicas presenciales o
                virtuales, asienta acuerdos formativos y brinda retroalimentación espiritual diaconal.
              </p>
            </div>

            {/* Botón Principal Destacado: Dar Cita a Supervisado */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => {
                  set_formulario_motivo("");
                  set_modal_dar_cita_abierto(true);
                }}
                className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl shadow-xs px-4 h-10 text-xs font-semibold gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>📅 Dar Cita a Supervisado</span>
              </Button>
            </div>
          </div>

          {/* Sección: Mis Becarios Supervisados (Cohorte) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#007BBE]" />
                <h3 className="text-sm font-bold text-[#122029]">Mis Becarios Supervisados</h3>
                <Badge className="bg-[#007BBE]/10 text-[#007BBE] border-[#007BBE]/20 font-bold text-[11px] px-2 py-0.5">
                  {becarios_supervisados.length} Asignados
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Haz clic en "Dar Cita" para agendar una sesión personalizada
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {becarios_supervisados.map((becario) => (
                <div
                  key={becario.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007BBE] to-[#00ABBD] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                        {becario.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#122029] group-hover:text-[#007BBE] transition-colors line-clamp-1">
                          {becario.nombre}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#00ABBD]" />
                          <span className="truncate max-w-[160px]">{becario.carrera}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{becario.horas_acumuladas ?? 80} hrs acumuladas</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => abrirModalCitaParaBecario(becario.id)}
                      className="bg-[#00ABBD]/10 hover:bg-[#00ABBD]/20 text-[#00808E] border border-[#00ABBD]/30 rounded-xl text-xs font-bold h-7 px-3 gap-1 shadow-2xs"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Dar Cita</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección: Citas de Seguimiento Programadas e Historial */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#007BBE]" />
                <h3 className="text-sm font-bold text-[#122029]">
                  Citas de Seguimiento Programadas e Historial
                </h3>
                <Badge className="bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {citas_seguimiento.length}
                </Badge>
              </div>

              {/* Controles de Filtro de Citas */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => set_filtro_estado_citas("todas")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado_citas === "todas"
                        ? "bg-white text-[#007BBE] shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Todas ({citas_seguimiento.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado_citas("programada")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      filtro_estado_citas === "programada"
                        ? "bg-white text-amber-800 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Programadas
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado_citas("realizada")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      filtro_estado_citas === "realizada"
                        ? "bg-white text-emerald-800 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Realizadas
                  </button>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    placeholder="Buscar en citas..."
                    value={filtro_texto_citas}
                    onChange={(e) => set_filtro_texto_citas(e.target.value)}
                    className="bg-white border-[#E5E7EB] text-xs h-8 rounded-xl pl-8 pr-2 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Lista de Citas Programadas e Historial */}
            {citas_filtradas_supervisor.length === 0 ? (
              <EstadoVacio
                icono={Calendar}
                titulo="Sin citas de seguimiento"
                descripcion="No hay citas agendadas con los criterios seleccionados. Puedes agendar una nueva cita con el botón superior."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citas_filtradas_supervisor.map((cita) => {
                  const es_programada = cita.estado === "programada" || cita.estado === "reprogramada";
                  const es_realizada = cita.estado === "realizada";

                  return (
                    <div
                      key={cita.id}
                      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#122029]">{cita.nombre_becario}</span>
                              {cita.carrera_becario && (
                                <span className="text-[11px] text-muted-foreground">· {cita.carrera_becario}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                              <span className="flex items-center gap-1 font-semibold text-[#007BBE]">
                                <Calendar className="w-3.5 h-3.5" />
                                {cita.fecha_cita}
                              </span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-3.5 h-3.5" />
                                {cita.hora_cita}
                              </span>
                              <span className="flex items-center gap-1">
                                {cita.modalidad === "virtual" ? (
                                  <Video className="w-3.5 h-3.5 text-[#00ABBD]" />
                                ) : (
                                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                )}
                                <span className="capitalize">{cita.modalidad}</span>
                              </span>
                            </div>
                          </div>

                          <Badge
                            className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                              es_realizada
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : cita.estado === "cancelada"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {cita.estado}
                          </Badge>
                        </div>

                        {/* Lugar o Enlace */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                          {cita.modalidad === "virtual" ? (
                            <ExternalLink className="w-3 h-3 text-[#00ABBD] shrink-0" />
                          ) : (
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{cita.lugar_o_enlace}</span>
                        </div>

                        {/* Motivo */}
                        <div className="text-xs text-slate-700">
                          <strong className="text-slate-900 block mb-0.5">Motivo de Seguimiento:</strong>
                          <p className="line-clamp-2 italic text-slate-600">"{cita.motivo_retroalimentacion}"</p>
                        </div>

                        {/* Cita Bíblica de Acompañamiento */}
                        {cita.cita_biblica && (
                          <div className="bg-[#007BBE]/5 border border-[#007BBE]/20 rounded-xl p-2.5 text-xs text-[#035683]">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#007BBE]">
                              <BookOpen className="w-3 h-3" />
                              <span>{cita.cita_biblica}</span>
                            </div>
                            {cita.texto_biblico && (
                              <p className="text-[11px] italic mt-1 text-slate-600">«{cita.texto_biblico}»</p>
                            )}
                          </div>
                        )}

                        {/* Acuerdos si está realizada */}
                        {cita.acuerdos_retroalimentacion && (
                          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900">
                            <strong className="flex items-center gap-1 text-[11px] text-emerald-800 mb-1">
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              Acuerdos de Retroalimentación Asentados:
                            </strong>
                            <p className="leading-relaxed text-[11px] text-emerald-950">
                              {cita.acuerdos_retroalimentacion}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botón de Acción en la Cita */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        {es_programada ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              set_cita_seleccionada_acuerdos(cita);
                              set_acuerdos_formulario_texto(cita.acuerdos_retroalimentacion || "");
                              set_estado_cita_formulario("realizada");
                              set_modal_acuerdos_abierto(true);
                            }}
                            className="bg-[#007BBE] hover:bg-[#035683] text-white text-xs rounded-xl shadow-xs font-semibold gap-1.5 h-8 px-3.5"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Registrar Acuerdos / Marcar Realizada</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              set_cita_seleccionada_acuerdos(cita);
                              set_acuerdos_formulario_texto(cita.acuerdos_retroalimentacion || "");
                              set_estado_cita_formulario(cita.estado);
                              set_modal_acuerdos_abierto(true);
                            }}
                            className="text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-8"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            <span>Editar Acuerdos</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sección: Reflexiones y Devocionales de Supervisados */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#007BBE]" />
                  <h3 className="text-sm font-bold text-[#122029]">
                    Reflexiones y Devocionales de Supervisados
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lecturas bíblicas y peticiones de oración registradas por los becarios para retroalimentación pastoral.
                </p>
              </div>

              {/* Métricas y Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{total_pendientes} Pendientes</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <Church className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{total_revisados} Acompañados</span>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    placeholder="Buscar por cita, becario..."
                    value={filtro_texto}
                    onChange={(e) => set_filtro_texto(e.target.value)}
                    className="bg-white border-[#E5E7EB] text-xs h-8 rounded-xl pl-8 pr-2 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Cuadrícula de Devocionales de Supervisados */}
            {devocionales_filtrados.length === 0 ? (
              <EstadoVacio
                icono={BookOpen}
                titulo="Sin reflexiones espirituales"
                descripcion="No se encontraron reflexiones bíblicas registradas con los criterios seleccionados."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {devocionales_filtrados.map((item) => (
                  <TarjetaSpotlight
                    key={item.id}
                    color_luz="rgba(0, 123, 190, 0.12)"
                    className="border-[#E5E7EB] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full bg-white rounded-2xl"
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-[#007BBE]/10 text-[#007BBE] border-[#007BBE]/20 font-bold text-[11px] px-2.5 py-0.5 shadow-2xs">
                          {item.cita_biblica}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.fecha}</span>
                        </div>
                      </div>
                      <CardTitle className="text-sm font-bold text-[#122029] mt-2.5 line-clamp-1">
                        {item.titulo}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <User className="w-3 h-3" />
                        <span className="font-medium text-slate-700">{item.nombre_becario}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 pb-5 space-y-3.5 text-xs text-gray-700 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="line-clamp-4 italic text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 leading-relaxed shadow-2xs">
                          "{item.reflexion}"
                        </p>

                        <div className="flex items-start gap-1.5 text-xs text-[#E2694B] px-0.5">
                          <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">
                            <strong>Oración:</strong> {item.oracion_peticion}
                          </span>
                        </div>
                      </div>

                      {/* Bloque de Retroalimentación Pastoral */}
                      {item.comentario_pastoral ? (
                        <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#86EFAC] text-xs mt-2 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[#15803D] font-bold text-[11px]">
                              <Church className="w-3.5 h-3.5" />
                              <span>Retroalimentación Pastoral:</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                set_devocional_seleccionado(item);
                                set_comentario_pastoral_texto(item.comentario_pastoral || "");
                                set_dialogo_pastoral_abierto(true);
                              }}
                              className="text-[10px] text-[#15803D] hover:underline font-semibold"
                            >
                              Editar
                            </button>
                          </div>
                          <p className="text-[#166534] leading-relaxed">{item.comentario_pastoral}</p>
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 text-xs flex items-center justify-between gap-2 mt-2 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pendiente de retroalimentar</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              set_devocional_seleccionado(item);
                              set_comentario_pastoral_texto("");
                              set_dialogo_pastoral_abierto(true);
                            }}
                            className="text-[11px] h-7 px-2.5 text-[#007BBE] border-[#007BBE]/30 hover:bg-[#007BBE]/10 rounded-lg font-bold shadow-2xs gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Retroalimentar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </TarjetaSpotlight>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VISTA EXCLUSIVA PARA EL BECARIO (es_becario) */}
      {/* ========================================================= */}
      {es_becario && (
        <div className="space-y-8">
          {/* Cabecera del Becario */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#007BBE]/10 flex items-center justify-center text-[#007BBE]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#122029]">Seguimiento y Retroalimentación Espiritual</h2>
                  <span className="text-[11px] font-semibold text-[#00808E] uppercase tracking-wider">
                    Mi Acompañamiento y Vida Devocional · Diaconía FRIF-IFD
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                Espacio de mentoría diaconal con tu supervisor: consulta tus citas programadas de seguimiento, revisa
                los acuerdos orientadores y registra tus meditaciones devocionales diarias.
              </p>
            </div>

            <Button
              onClick={() => set_dialogo_abierto(true)}
              className="bg-[#007BBE] hover:bg-[#035683] text-white gap-2 rounded-xl text-xs h-10 px-4 shadow-xs font-semibold shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Devocional
            </Button>
          </div>

          {/* SECCIÓN DESTACADA: Mis Citas de Seguimiento con mi Supervisor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#007BBE]" />
                <h3 className="text-base font-bold text-[#035683]">
                  📅 Mis Citas de Seguimiento con mi Supervisor
                </h3>
              </div>
              <Badge className="bg-[#00ABBD]/10 text-[#00808E] border-[#00ABBD]/20 font-bold text-xs px-2.5 py-0.5">
                {citas_del_becario.length} Registradas
              </Badge>
            </div>

            {/* Próximas Citas Programadas Destacadas */}
            {citas_proximas_becario.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citas_proximas_becario.map((cita) => (
                  <div
                    key={cita.id}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[#007BBE]/5 rounded-2xl border-2 border-[#007BBE]/30 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#007BBE] text-white flex items-center justify-center font-bold shadow-xs">
                          <Church className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00808E] block">
                            Próxima Cita Programada
                          </span>
                          <h4 className="text-sm font-bold text-[#122029]">
                            {cita.nombre_supervisor || "Supervisor Pastoral"}
                          </h4>
                        </div>
                      </div>

                      <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold animate-pulse">
                        {cita.estado}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Fecha:</span>
                        <span className="font-bold text-[#035683] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[#007BBE]" />
                          {cita.fecha_cita}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Hora:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                          {cita.hora_cita}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        {cita.modalidad === "virtual" ? (
                          <Video className="w-3.5 h-3.5 text-[#00ABBD] mt-0.5 shrink-0" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <strong className="capitalize">{cita.modalidad}: </strong>
                          <span className="text-slate-600">{cita.lugar_o_enlace}</span>
                        </div>
                      </div>

                      <div className="text-slate-700 pt-1">
                        <strong>Motivo: </strong>
                        <span className="italic text-slate-600">"{cita.motivo_retroalimentacion}"</span>
                      </div>
                    </div>

                    {cita.cita_biblica && (
                      <div className="bg-[#007BBE]/10 border border-[#007BBE]/20 rounded-xl p-3 text-xs text-[#035683]">
                        <span className="font-bold text-[#007BBE] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Pasaje Bíblico Compartido: {cita.cita_biblica}
                        </span>
                        {cita.texto_biblico && (
                          <p className="mt-1 text-[11px] italic text-slate-700">«{cita.texto_biblico}»</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-[#007BBE]/50 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No tienes citas pendientes programadas</h4>
                <p className="text-[11px] text-muted-foreground max-w-md mx-auto mt-1">
                  Tu supervisor pastoral agendará periódicamente tus sesiones de acompañamiento individual. Si
                  requieres consejería prioritaria, contacta con tu sede o supervisor.
                </p>
              </div>
            )}

            {/* Acuerdos de Retroalimentación de Citas Realizadas */}
            {citas_acuerdos_becario.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                  Acuerdos y Orientaciones Recibidas en Citas de Seguimiento
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {citas_acuerdos_becario.map((cita) => (
                    <div
                      key={cita.id}
                      className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-4 shadow-2xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#15803D] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Cita del {cita.fecha_cita}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                          Concluida
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-600">
                        <strong>Supervisor:</strong> {cita.nombre_supervisor}
                      </div>

                      {cita.acuerdos_retroalimentacion && (
                        <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                          <strong className="block text-[11px] text-[#166534] mb-0.5">
                            Acuerdos y Compromisos Acordados:
                          </strong>
                          <p className="text-slate-800 leading-relaxed text-[11px]">
                            {cita.acuerdos_retroalimentacion}
                          </p>
                        </div>
                      )}

                      {cita.cita_biblica && (
                        <div className="text-[11px] text-[#166534] italic">
                          Palabra de bendición: <strong>{cita.cita_biblica}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN: Mi Bitácora Personal de Reflexiones y Devocionales */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#035683] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#007BBE]" />
                  Mi Bitácora Personal de Devocionales
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tus reflexiones personales de fe, pasajes bíblicos y oraciones durante tu periodo de beca.
                </p>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("todos")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "todos"
                        ? "bg-white text-[#007BBE] shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("revisados")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "revisados"
                        ? "bg-white text-emerald-800 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Acompañados
                  </button>
                  <button
                    type="button"
                    onClick={() => set_filtro_estado("pendientes")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      filtro_estado === "pendientes"
                        ? "bg-white text-amber-800 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pendientes
                  </button>
                </div>
              </div>
            </div>

            {/* Cuadrícula de Devocionales del Becario */}
            {devocionales_filtrados.length === 0 ? (
              <EstadoVacio
                icono={BookOpen}
                titulo="Sin devocionales registrados"
                descripcion="Empieza tu día registrando tu primera reflexión bíblica con el botón superior."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {devocionales_filtrados.map((item) => (
                  <TarjetaSpotlight
                    key={item.id}
                    color_luz="rgba(0, 171, 189, 0.12)"
                    className="border-[#E5E7EB] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full bg-white rounded-2xl"
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-[#007BBE]/10 text-[#007BBE] border-[#007BBE]/20 font-bold text-[11px] px-2.5 py-0.5 shadow-2xs">
                          {item.cita_biblica}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.fecha}</span>
                        </div>
                      </div>
                      <CardTitle className="text-sm font-bold text-[#122029] mt-2.5 line-clamp-1">
                        {item.titulo}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 pb-5 space-y-3.5 text-xs text-gray-700 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="line-clamp-4 italic text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 leading-relaxed shadow-2xs">
                          "{item.reflexion}"
                        </p>

                        <div className="flex items-start gap-1.5 text-xs text-[#E2694B] px-0.5">
                          <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">
                            <strong>Oración:</strong> {item.oracion_peticion}
                          </span>
                        </div>
                      </div>

                      {/* Bloque de Retroalimentación Pastoral */}
                      {item.comentario_pastoral ? (
                        <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#86EFAC] text-xs mt-2 space-y-1 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-[#15803D] font-bold text-[11px]">
                            <Church className="w-3.5 h-3.5" />
                            <span>Acompañamiento de tu Supervisor:</span>
                          </div>
                          <p className="text-[#166534] leading-relaxed">{item.comentario_pastoral}</p>
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 text-xs flex items-center gap-1.5 text-amber-700 font-medium text-[11px] mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Pendiente de lectura y retroalimentación pastoral</span>
                        </div>
                      )}
                    </CardContent>
                  </TarjetaSpotlight>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODALES INSTITUCIONALES (showCloseButton={false}) */}
      {/* ========================================================= */}

      {/* MODAL 1: DAR CITA A SUPERVISADO (Exclusivo Supervisor) */}
      <Dialog open={modal_dar_cita_abierto} onOpenChange={set_modal_dar_cita_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E5E7EB] bg-white shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#007BBE] text-base sm:text-lg font-bold">
              <Calendar className="w-5 h-5 text-[#007BBE]" />
              📅 Dar Cita de Seguimiento a Supervisado
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
            {/* Selector de Becario Supervisado */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Becario Supervisado Asignado *
              </label>
              <Select value={formulario_becario_id} onValueChange={(val) => val && set_formulario_becario_id(val)}>
                <SelectTrigger className="w-full text-xs h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[#035683] font-medium">
                  <SelectValue placeholder="Seleccionar becario supervisado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] z-[120]">
                  {becarios_supervisados.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.nombre} ({b.carrera})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Fecha de la Cita *</label>
                <Input
                  type="date"
                  value={formulario_fecha_cita}
                  onChange={(e) => set_formulario_fecha_cita(e.target.value)}
                  className="text-xs rounded-xl border-slate-200 h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Hora de la Cita *</label>
                <Input
                  type="time"
                  value={formulario_hora_cita}
                  onChange={(e) => set_formulario_hora_cita(e.target.value)}
                  className="text-xs rounded-xl border-slate-200 h-9"
                />
              </div>
            </div>

            {/* Modalidad y Lugar/Enlace */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Modalidad *</label>
                <Select
                  value={formulario_modalidad}
                  onValueChange={(val) => val && set_formulario_modalidad(val as ModalidadCitaSeguimiento)}
                >
                  <SelectTrigger className="w-full text-xs h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white text-slate-700 font-medium">
                    <SelectValue placeholder="Seleccionar modalidad" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E7EB] z-[120]">
                    <SelectItem value="presencial">Presencial (Sede Diaconía)</SelectItem>
                    <SelectItem value="virtual">Virtual (Videollamada Meet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  {formulario_modalidad === "virtual" ? "Enlace de Reunión *" : "Lugar o Sala *"}
                </label>
                <Input
                  placeholder={
                    formulario_modalidad === "virtual"
                      ? "https://meet.google.com/..."
                      : "Oficina Diaconía - Sala de Supervisión"
                  }
                  value={formulario_lugar_o_enlace}
                  onChange={(e) => set_formulario_lugar_o_enlace(e.target.value)}
                  className="text-xs rounded-xl border-slate-200 h-9"
                />
              </div>
            </div>

            {/* Motivo de Retroalimentación */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Motivo / Temario de Seguimiento y Retroalimentación *
              </label>
              <Textarea
                rows={3}
                placeholder="Ej. Revisión de avance de horas semestrales, equilibrio académico, acompañamiento vocacional y motivos de oración..."
                value={formulario_motivo}
                onChange={(e) => set_formulario_motivo(e.target.value)}
                className="text-xs rounded-xl border-slate-200"
              />
            </div>

            {/* Selector de Cita Bíblica de Acompañamiento */}
            <div className="pt-1">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Pasaje Bíblico de Acompañamiento
              </label>
              <SelectorCitaBiblica
                valor={formulario_cita_biblica}
                alCambiar={(cita, texto) => {
                  set_formulario_cita_biblica(cita);
                  if (texto) {
                    set_formulario_texto_biblico(texto);
                  }
                }}
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => set_modal_dar_cita_abierto(false)}
              className="rounded-xl text-xs"
              disabled={guardando_cita}
            >
              Cancelar
            </Button>
            <Button
              onClick={manejarAgendarCita}
              disabled={guardando_cita}
              className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl shadow-xs text-xs font-bold"
            >
              {guardando_cita ? "Agendando..." : "Confirmar y Notificar Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: REGISTRAR ACUERDOS Y CONCLUIR CITA (Exclusivo Supervisor) */}
      <Dialog open={modal_acuerdos_abierto} onOpenChange={set_modal_acuerdos_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E5E7EB] bg-white shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#007BBE] text-base sm:text-lg font-bold">
              <ClipboardCheck className="w-5 h-5 text-[#007BBE]" />
              Registrar Acuerdos y Concluir Cita
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-[#035683] block text-xs">
                Cita con {cita_seleccionada_acuerdos?.nombre_becario}
              </span>
              <div className="flex items-center gap-3 text-muted-foreground text-[11px] mt-1">
                <span>Fecha: {cita_seleccionada_acuerdos?.fecha_cita}</span>
                <span>Hora: {cita_seleccionada_acuerdos?.hora_cita}</span>
                <span className="capitalize">Modalidad: {cita_seleccionada_acuerdos?.modalidad}</span>
              </div>
              <p className="mt-1.5 italic text-slate-600 text-[11px]">
                Motivo: "{cita_seleccionada_acuerdos?.motivo_retroalimentacion}"
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Estado de la Cita *</label>
              <Select
                value={estado_cita_formulario}
                onValueChange={(val) => val && set_estado_cita_formulario(val as EstadoCitaSeguimiento)}
              >
                <SelectTrigger className="w-full text-xs h-9 px-3 rounded-xl border border-[#E5E7EB] bg-white text-slate-800 font-medium">
                  <SelectValue placeholder="Estado de la cita" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] z-[120]">
                  <SelectItem value="realizada">Realizada (Concluida con Acuerdos)</SelectItem>
                  <SelectItem value="reprogramada">Reprogramada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Acuerdos y Compromisos de Retroalimentación *
              </label>
              <Textarea
                rows={5}
                placeholder="Escribe los acuerdos formativos, orientaciones pastorales, metas pactadas para las próximas semanas y compromisos de oración..."
                value={acuerdos_formulario_texto}
                onChange={(e) => set_acuerdos_formulario_texto(e.target.value)}
                className="text-xs rounded-xl border-slate-200"
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => set_modal_acuerdos_abierto(false)}
              className="rounded-xl text-xs"
              disabled={guardando_acuerdos}
            >
              Cancelar
            </Button>
            <Button
              onClick={manejarGuardarAcuerdos}
              disabled={guardando_acuerdos || !acuerdos_formulario_texto.trim()}
              className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl shadow-xs text-xs font-bold"
            >
              {guardando_acuerdos ? "Guardando..." : "Asentar Acuerdos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: REGISTRAR DEVOCIONAL PERSONAL (Exclusivo Becario) */}
      <Dialog open={dialogo_abierto} onOpenChange={set_dialogo_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E5E7EB] bg-white shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#007BBE] text-base font-bold">
              <BookOpen className="w-5 h-5" />
              Registrar Devocional Personal
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
            {versiculo_diario && (
              <button
                type="button"
                onClick={() => aplicarVersiculoAlFormulario()}
                className="w-full text-left text-xs bg-[#00ABBD]/10 hover:bg-[#00ABBD]/15 border border-[#00ABBD]/20 rounded-xl p-2.5 flex items-center justify-between text-[#00808E] transition-colors"
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00ABBD]" />
                  Cargar versículo de hoy ({versiculo_diario.cita})
                </span>
                <span className="text-[11px] font-bold text-[#00ABBD]">Auto-llenar</span>
              </button>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Fecha de reflexión</label>
              <SeleccionadorFecha
                valorString={String(formulario_devocional.valores.fecha)}
                alCambiarString={(val) => formulario_devocional.cambiarValor("fecha", val)}
                onBlur={() => formulario_devocional.tocarCampo("fecha")}
                className={formulario_devocional.obtenerClaseInput("fecha", "mt-1 text-xs")}
              />
              {formulario_devocional.renderizarMensajeError("fecha")}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Cita Bíblica</label>
              <SelectorCitaBiblica
                valor={String(formulario_devocional.valores.cita_biblica || "Filipenses 4:13")}
                alCambiar={(cita, texto_biblico) => {
                  formulario_devocional.cambiarValor("cita_biblica", cita);
                  if (texto_biblico && !formulario_devocional.valores.reflexion) {
                    formulario_devocional.cambiarValor(
                      "reflexion",
                      `«${texto_biblico}»\n\nReflexión personal: `
                    );
                  }
                }}
                error={formulario_devocional.errores.cita_biblica}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Título / Tema de la meditación</label>
              <Input
                placeholder="Ej. Fortaleza en el servicio, Confianza en la prueba..."
                value={String(formulario_devocional.valores.titulo)}
                onChange={(e) => formulario_devocional.cambiarValor("titulo", e.target.value)}
                onBlur={() => formulario_devocional.tocarCampo("titulo")}
                className={formulario_devocional.obtenerClaseInput("titulo", "mt-1 text-xs")}
              />
              {formulario_devocional.renderizarMensajeError("titulo")}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Reflexión Personal</label>
              <Textarea
                placeholder="Escribe lo que Dios habló a tu vida a través del texto bíblico y tu jornada..."
                rows={4}
                value={String(formulario_devocional.valores.reflexion)}
                onChange={(e) => formulario_devocional.cambiarValor("reflexion", e.target.value)}
                onBlur={() => formulario_devocional.tocarCampo("reflexion")}
                className={formulario_devocional.obtenerClaseInput("reflexion", "mt-1 text-xs")}
              />
              {formulario_devocional.renderizarMensajeError("reflexion")}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Petición de Oración</label>
              <Textarea
                placeholder="Motivos de oración por tus estudios, familia, salud o servicio en Diaconía..."
                rows={2}
                value={String(formulario_devocional.valores.oracion_peticion)}
                onChange={(e) => formulario_devocional.cambiarValor("oracion_peticion", e.target.value)}
                onBlur={() => formulario_devocional.tocarCampo("oracion_peticion")}
                className={formulario_devocional.obtenerClaseInput("oracion_peticion", "mt-1 text-xs")}
              />
              {formulario_devocional.renderizarMensajeError("oracion_peticion")}
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button variant="outline" onClick={() => set_dialogo_abierto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              onClick={manejarCrearDevocional}
              className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl shadow-xs text-xs font-bold"
            >
              Guardar Devocional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: RETROALIMENTACIÓN PASTORAL A DEVOCIONAL (Exclusivo Supervisor) */}
      <Dialog open={dialogo_pastoral_abierto} onOpenChange={set_dialogo_pastoral_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E5E7EB] bg-white shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#007BBE] text-base font-bold">
              <Church className="w-5 h-5" />
              Acompañamiento y Consejo Pastoral
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0 text-xs">
            <p className="text-gray-600">
              Devocional del becario <strong>{devocional_seleccionado?.nombre_becario}</strong>:
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-[#007BBE] block mb-0.5">
                {devocional_seleccionado?.cita_biblica} · {devocional_seleccionado?.titulo}
              </span>
              <p className="text-slate-600 italic">"{devocional_seleccionado?.reflexion}"</p>
              {devocional_seleccionado?.oracion_peticion && (
                <p className="mt-1.5 text-[#E2694B] font-medium">
                  Motivo de oración: {devocional_seleccionado.oracion_peticion}
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Orientación, bendición o consejo pastoral:
              </label>
              <Textarea
                rows={4}
                placeholder="Escribe palabras personalizadas de bendición, aliento, consejo bíblico o respuesta a sus motivos de oración..."
                value={comentario_pastoral_texto}
                onChange={(e) => set_comentario_pastoral_texto(e.target.value)}
                className="text-xs rounded-xl border-slate-200"
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => set_dialogo_pastoral_abierto(false)}
              className="rounded-xl text-xs"
              disabled={guardando_retroalimentacion}
            >
              Cancelar
            </Button>
            <Button
              onClick={manejarGuardarRetroalimentacionDevocional}
              disabled={guardando_retroalimentacion || !comentario_pastoral_texto.trim()}
              className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl shadow-xs text-xs font-bold"
            >
              {guardando_retroalimentacion ? "Guardando..." : "Asentar Acompañamiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
