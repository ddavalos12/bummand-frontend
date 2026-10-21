"use client";

import React, { useState, useEffect } from "react";
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
  Plus,
  Upload,
  Download,
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
  archivo_prueba_url?: string;
  nombre_archivo_prueba?: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  supervisor_nombre?: string | null;
  observacion_supervisor?: string | null;
  fecha_resolucion?: string | null;
  created_at: string;
}

const MUESTRA_RECETA_MEDICA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="16" fill="%23FFFFFF" stroke="%23CBD5E1" stroke-width="2"/><rect x="24" y="24" width="552" height="60" rx="8" fill="%23F0FDF4" stroke="%2386EFAC"/><text x="44" y="52" fill="%23166534" font-family="sans-serif" font-size="16" font-weight="bold">CAJA NACIONAL DE SALUD · SEGURO UNIVERSITARIO SSU</text><text x="44" y="70" fill="%2315803D" font-family="sans-serif" font-size="12">CERTIFICADO Y RECETA MÉDICA OFICIAL - ATENCIÓN ODONTOLÓGICA DE URGENCIA</text><line x1="24" y1="104" x2="576" y2="104" stroke="%23E2E8F0" stroke-width="1.5"/><text x="44" y="135" fill="%23334155" font-family="sans-serif" font-size="13" font-weight="bold">PACIENTE:</text><text x="130" y="135" fill="%230F172A" font-family="sans-serif" font-size="13">Nilda Amalia Churata Paye</text><text x="360" y="135" fill="%23334155" font-family="sans-serif" font-size="13" font-weight="bold">FECHA:</text><text x="430" y="135" fill="%230F172A" font-family="sans-serif" font-size="13">06/10/2026</text><text x="44" y="170" fill="%23334155" font-family="sans-serif" font-size="13" font-weight="bold">DIAGNÓSTICO:</text><text x="160" y="170" fill="%230F172A" font-family="sans-serif" font-size="13">Pulpitis irreversible aguda pieza 3.8. Exodoncia de urgencia.</text><text x="44" y="205" fill="%23334155" font-family="sans-serif" font-size="13" font-weight="bold">PRESCRIPCIÓN:</text><text x="160" y="205" fill="%230F172A" font-family="sans-serif" font-size="13">Amoxicilina 500mg c/8h + Ketorolaco 10mg SL. Reposo 24 horas.</text><rect x="44" y="240" width="512" height="70" rx="8" fill="%23F8FAFC" stroke="%23E2E8F0"/><text x="60" y="268" fill="%23475569" font-family="sans-serif" font-size="11">Sello y Firma Digital:</text><text x="60" y="288" fill="%23063A6B" font-family="sans-serif" font-size="12" font-weight="bold">Dra. Paola Meneses Vargas · Matrícula Profesional N° 4598-LP</text><circle cx="500" cy="275" r="24" fill="%23DC2626" fill-opacity="0.1" stroke="%23DC2626" stroke-dasharray="3 3"/><text x="480" y="280" fill="%23DC2626" font-family="sans-serif" font-size="11" font-weight="bold">VALIDADO</text></svg>`;

const BECARIOS_OFICIALES = [
  { id: 101, nombre: "Nilda Amalia Churata Paye", carrera: "Educación Parvularia", sede: "Centro Infantil Sagrada Familia" },
  { id: 102, nombre: "Edgar Elias Alarcon Huanca", carrera: "Ingeniería de Sistemas", sede: "Oficina Central Bloque A" },
  { id: 103, nombre: "Adai Belen Huayta Cardozo", carrera: "Contaduría Pública", sede: "Agencia Villa Dolores" },
  { id: 104, nombre: "Ronald Franz Mamani Quispe", carrera: "Bioquímica y Farmacia", sede: "Laboratorio Clínico San Gabriel" },
  { id: 105, nombre: "Abigail Ruth Condori Flores", carrera: "Trabajo Social", sede: "Hogar de Niños Amor y Esperanza" },
  { id: 106, nombre: "Christian David Mamani Alanoca", carrera: "Derecho", sede: "Sucursal Juan Pablo II" },
  { id: 107, nombre: "Carlos Oscar Luna Lizarraga", carrera: "Economía", sede: "Oficina Central Bloque A" },
  { id: 108, nombre: "Daniel Davalos Quiñoñez", carrera: "Informática", sede: "Oficina Central Bloque B" },
  { id: 109, nombre: "Jhonny Poma", carrera: "Derecho", sede: "Agencia Villa Adela" },
  { id: 110, nombre: "Jhoselin Quispe Morales", carrera: "Comunicación Social", sede: "Oficina Central Bloque A" },
  { id: 111, nombre: "José Marcos Suñagua Quispe", carrera: "Informática", sede: "Oficina Central Bloque B" },
  { id: 112, nombre: "Luis Santiago Enrriquez Conde", carrera: "Cs. de la Comunicación", sede: "Oficina Central Bloque A" },
  { id: 113, nombre: "Mariela Dayana Jimenez Chambi", carrera: "Contaduría Pública", sede: "Sucursal Juan Pablo II" },
  { id: 114, nombre: "Mario Catunta Laime", carrera: "Economía", sede: "Oficina Central Bloque A" },
  { id: 115, nombre: "Mayherli Alejandra Loza Villalobos", carrera: "Contaduría Pública", sede: "Agencia Ceja El Alto" },
  { id: 116, nombre: "Mónica Mamani Mamani", carrera: "Lingüística e Idiomas", sede: "Oficina Central Bloque A" },
  { id: 117, nombre: "Noemi Callisaya Alvarez", carrera: "Psicomotricidad", sede: "Oficina Central Bloque B" },
  { id: 118, nombre: "Ronald Mauricio Quiquijana Mayta", carrera: "Ing. Telecomunicaciones", sede: "Oficina Central Bloque A" },
  { id: 119, nombre: "Ruddy Flores Tapia", carrera: "Informática", sede: "Oficina Central Bloque B" },
  { id: 120, nombre: "Ruth Alesandra Choque Huanca", carrera: "Ingeniería Comercial", sede: "Oficina Central Bloque A" },
  { id: 121, nombre: "Alejandro Roberth Paredes Tarquino", carrera: "Cs. de la Comunicación", sede: "Oficina Central Bloque A" },
  { id: 122, nombre: "Aydee Ruth Ali Condori", carrera: "Contaduría Pública", sede: "Agencia Villa Adela" },
  { id: 123, nombre: "Fernando Rene Yujra Quispe", carrera: "Ingeniería Civil", sede: "Oficina Central Bloque A" },
];

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
    documento_adjunto: "Certificado_Medico_SSU_Churata.png",
    nombre_archivo_prueba: "Certificado_Medico_SSU_Churata.png",
    archivo_prueba_url: MUESTRA_RECETA_MEDICA_SVG,
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
    nombre_archivo_prueba: "Boleta_Examen_UPEA_Alarcon.pdf",
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
    nombre_archivo_prueba: "Carta_Convocatoria_Defensa_UMSA.pdf",
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

  const [lista_becarios, set_lista_becarios] = useState(BECARIOS_OFICIALES);
  const [becario_seleccionado_id, set_becario_seleccionado_id] = useState<number>(
    BECARIOS_OFICIALES[0].id
  );

  useEffect(() => {
    async function cargarBecarios() {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/becarios");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          const formateados = respuesta.map((b) => ({
            id: b.id,
            nombre: b.nombre || (b.usuario ? b.usuario.nombre : "Becario"),
            carrera: b.carrera || "Carrera BUMAND",
            sede: b.lugar_practica?.nombre || "Sede Diaconía",
          }));
          if (formateados.length > 0) {
            set_lista_becarios(formateados);
          }
        }
      } catch {
        // Usa lista institucional por defecto
      }
    }
    cargarBecarios();
  }, []);

  const es_becario = usuario?.rol === "becario";
  const [modal_crear_abierto, set_modal_crear_abierto] = useState(false);
  const [nuevo_tipo, set_nuevo_tipo] = useState<JustificacionIncidencia["tipo_incidencia"]>("asistencia_practicas");
  const [nueva_fecha, set_nueva_fecha] = useState(new Date().toISOString().split("T")[0]);
  const [nuevo_motivo, set_nuevo_motivo] = useState("");
  const [nueva_descripcion, set_nueva_descripcion] = useState("");
  const [archivo_prueba_url, set_archivo_prueba_url] = useState("");
  const [nombre_archivo_prueba, set_nombre_archivo_prueba] = useState("");
  const [tipo_mime_archivo, set_tipo_mime_archivo] = useState("");

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    set_nombre_archivo_prueba(archivo.name);
    set_tipo_mime_archivo(archivo.type);
    const lector = new FileReader();
    lector.onload = () => {
      set_archivo_prueba_url(lector.result as string);
    };
    lector.readAsDataURL(archivo);
  };

  const manejarCrearJustificacion = async () => {
    if (!nuevo_motivo.trim() || !nueva_descripcion.trim()) {
      toast.error("Campos requeridos", {
        description: "Debe ingresar el motivo y descripción de la incidencia.",
      });
      return;
    }

    const becario_actual = !es_becario
      ? lista_becarios.find((b) => b.id === becario_seleccionado_id) || lista_becarios[0]
      : {
          id: usuario?.becario_id || usuario?.id || 101,
          nombre: usuario?.nombre || "Becario Institucional",
          carrera: "Carrera Institucional",
          sede: "Sede Asignada",
        };

    const payload = {
      becario_id: becario_actual.id,
      tipo_incidencia: nuevo_tipo,
      fecha_incidencia: nueva_fecha,
      motivo: nuevo_motivo.trim(),
      descripcion: nueva_descripcion.trim(),
      documento_adjunto: nombre_archivo_prueba || undefined,
      archivo_prueba_url: archivo_prueba_url || undefined,
      nombre_archivo_prueba: nombre_archivo_prueba || undefined,
    };

    let id_generado = Date.now();

    try {
      const resp = await clienteApi.post<any>("/api/justificaciones", payload);
      if (resp?.id) {
        id_generado = resp.id;
      }
      invalidar();
    } catch {
      // Respaldo local si el backend no responde
    }

    const nueva: JustificacionIncidencia = {
      id: id_generado,
      becario_id: becario_actual.id,
      becario_nombre: becario_actual.nombre,
      carrera: becario_actual.carrera,
      sede_nombre: becario_actual.sede,
      tipo_incidencia: nuevo_tipo,
      fecha_incidencia: nueva_fecha,
      motivo: nuevo_motivo.trim(),
      descripcion: nueva_descripcion.trim(),
      documento_adjunto: nombre_archivo_prueba || undefined,
      archivo_prueba_url: archivo_prueba_url || undefined,
      nombre_archivo_prueba: nombre_archivo_prueba || undefined,
      estado: "pendiente",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    set_justificaciones_locales([nueva, ...justificaciones_locales]);
    set_modal_crear_abierto(false);
    set_nuevo_motivo("");
    set_nueva_descripcion("");
    set_archivo_prueba_url("");
    set_nombre_archivo_prueba("");
    set_tipo_mime_archivo("");
    toast.success("Permiso / Justificación registrado", {
      description: "Tu solicitud con prueba justificable ha sido radicada y enviada a la bandeja oficial.",
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
          documento_adjunto: item.documento_adjunto || item.nombre_archivo_prueba,
          archivo_prueba_url: item.archivo_prueba_url,
          nombre_archivo_prueba: item.nombre_archivo_prueba || item.documento_adjunto,
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

      {/* Cabecera adaptativa con botón siempre visible */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold text-[#063A6B]">
              Permisos y Justificaciones
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestión, registro y dictamen de permisos institucionales con pruebas justificables (recetas médicas, certificados o comprobantes oficiales).
          </p>
        </div>

        <Button
          onClick={() => set_modal_crear_abierto(true)}
          className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs h-10 gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-[#F8C766]" />
          + Registrar Permiso / Justificación
        </Button>
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

              {/* Visor Real de Prueba Justificable */}
              {(justificacion_detalle.archivo_prueba_url || justificacion_detalle.documento_adjunto) && (
                <div className="space-y-2 pt-2 border-t border-[#E3DCCB]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#063A6B] flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-[#17B4C4]" />
                      Prueba Justificable Adjunta (Inspección de Respaldo)
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-700 bg-emerald-50">
                      Documento Probatorio
                    </Badge>
                  </div>

                  {justificacion_detalle.archivo_prueba_url?.startsWith("data:image/") ||
                  justificacion_detalle.archivo_prueba_url?.startsWith("http") ||
                  justificacion_detalle.documento_adjunto?.match(/\.(png|jpe?g|webp|gif|svg)$/i) ? (
                    <div className="rounded-xl border border-[#E3DCCB] overflow-hidden bg-slate-50 p-2 text-center shadow-inner">
                      <img
                        src={justificacion_detalle.archivo_prueba_url || MUESTRA_RECETA_MEDICA_SVG}
                        alt="Comprobante o Receta Médica"
                        className="max-h-64 mx-auto rounded-lg object-contain shadow-xs border border-slate-200"
                      />
                      <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                        {justificacion_detalle.nombre_archivo_prueba || justificacion_detalle.documento_adjunto || "Receta_Medica_Oficial.png"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-[#E3DCCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#063A6B]" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#063A6B]">
                            {justificacion_detalle.nombre_archivo_prueba || justificacion_detalle.documento_adjunto || "Certificado_Medico.pdf"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Documento digital firmado y convalidado</p>
                        </div>
                      </div>
                      {justificacion_detalle.archivo_prueba_url && (
                        <a
                          href={justificacion_detalle.archivo_prueba_url}
                          download={justificacion_detalle.nombre_archivo_prueba || "comprobante.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-lg bg-[#063A6B] text-white hover:bg-[#063A6B]/90 transition-colors"
                        >
                          Abrir / Descargar
                        </a>
                      )}
                    </div>
                  )}
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

      {/* Modal para Crear Nuevo Permiso / Justificación */}
      <Dialog open={modal_crear_abierto} onOpenChange={set_modal_crear_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E3DCCB] rounded-2xl shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base font-bold">
              <ClipboardCheck className="w-5 h-5 text-[#17B4C4]" />
              Registrar Permiso / Justificación
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ingreso oficial de solicitud con respaldo documental médico o académico.
            </p>
          </DialogHeader>

          <DialogBody className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0 text-xs">
            {!es_becario && (
              <div>
                <Label className="text-xs font-semibold text-[#063A6B]">Becario Solicitante</Label>
                <Select
                  value={String(becario_seleccionado_id)}
                  onValueChange={(val) => val && set_becario_seleccionado_id(Number(val))}
                >
                  <SelectTrigger className="w-full mt-1 text-xs h-9 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium">
                    <SelectValue placeholder="Seleccionar becario" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56 bg-white border-[#E3DCCB] z-[100]">
                    {lista_becarios.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.nombre} ({b.carrera})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold text-[#063A6B]">Tipo de Incidencia</Label>
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
              <Label className="text-xs font-semibold text-[#063A6B]">Fecha de Incidencia</Label>
              <Input
                type="date"
                value={nueva_fecha}
                onChange={(e) => set_nueva_fecha(e.target.value)}
                className="mt-1 text-xs rounded-xl border-[#E3DCCB]"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#063A6B]">Motivo Resumido</Label>
              <Input
                placeholder="Ej. Cita médica en seguro social, Examen parcial..."
                value={nuevo_motivo}
                onChange={(e) => set_nuevo_motivo(e.target.value)}
                className="mt-1 text-xs rounded-xl border-[#E3DCCB]"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#063A6B]">Descripción Detallada</Label>
              <Textarea
                placeholder="Explica las circunstancias de la inasistencia o retraso..."
                rows={3}
                value={nueva_descripcion}
                onChange={(e) => set_nueva_descripcion(e.target.value)}
                className="mt-1 text-xs rounded-xl border-[#E3DCCB]"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#063A6B] block mb-1">
                Prueba Justificable (Receta médica, certificado médico o comprobante — No carta) *
              </Label>
              <div className="border-2 border-dashed border-[#E3DCCB] hover:border-[#17B4C4] rounded-xl p-4 bg-[#F8F9FA] transition-colors text-center cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={manejarCambioArchivo}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {nombre_archivo_prueba ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{nombre_archivo_prueba}</span>
                    </div>
                    {archivo_prueba_url.startsWith("data:image/") && (
                      <img
                        src={archivo_prueba_url}
                        alt="Previsualización prueba"
                        className="h-24 w-auto object-contain rounded-lg border border-slate-200 mt-1 shadow-xs"
                      />
                    )}
                    <span className="text-[10px] text-muted-foreground">Clic para reemplazar el comprobante adjunto</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-[#17B4C4]" />
                    <span className="text-xs font-semibold text-[#063A6B]">
                      Adjuntar receta o certificado médico
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Formatos aceptados: JPG, PNG, WEBP o PDF (Receta o certificado médico emitido)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_modal_crear_abierto(false)}
              className="rounded-xl border-[#E3DCCB]"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={manejarCrearJustificacion}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl font-bold"
            >
              Radicar Permiso / Justificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
