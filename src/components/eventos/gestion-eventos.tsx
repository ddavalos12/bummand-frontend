"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Download,
  Plus,
  Navigation,
  Sparkles,
  ShieldCheck,
  Check,
  Building2,
  Compass,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import {
  TarjetaSpotlight,
  BordeLuminoso,
  BotonJuicy,
  ContadorRodilloAnimado,
  PestanasAnimadas,
  type ElementoPestana,
} from "@/components/animaciones";

export interface AsistenciaBecarioEvento {
  id: number;
  becario_id: number;
  nombre: string;
  carrera: string;
  hora_marcacion: string;
  distancia_m: number;
  dentro_de_radio: boolean;
  estado: "presente" | "retraso" | "ausente" | "justificado";
  observaciones?: string;
}

export interface EventoGeolocalizado {
  id: number;
  titulo: string;
  descripcion: string;
  tipo_evento: "taller" | "retiro" | "servicio_diaconal" | "reunion" | "escuela_lideres_especial";
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  latitud: number;
  longitud: number;
  radio_tolerancia_m: number;
  direccion_referencia: string;
  estado: "en_curso" | "programado" | "finalizado" | "cancelado";
  total_convocados: number;
  asistencias: AsistenciaBecarioEvento[];
}

const EVENTOS_INICIALES: EventoGeolocalizado[] = [
  {
    id: 1,
    titulo: "Encuentro de Liderazgo y Acción Diaconal 2026",
    descripcion:
      "Jornada intensiva de formación ética, confraternización y servicio comunitario con la cohorte activa de becarios de El Alto y La Paz.",
    tipo_evento: "escuela_lideres_especial",
    fecha: "2026-10-09",
    hora_inicio: "08:30",
    hora_fin: "13:30",
    latitud: -16.500054,
    longitud: -68.173455,
    radio_tolerancia_m: 120,
    direccion_referencia: "Auditorio Central Diaconía, Av. Juan Pablo II #2540, El Alto",
    estado: "en_curso",
    total_convocados: 32,
    asistencias: [
      {
        id: 1,
        becario_id: 101,
        nombre: "Nilda Amalia Churata Paye",
        carrera: "Educación Parvularia",
        hora_marcacion: "08:24:15",
        distancia_m: 18.2,
        dentro_de_radio: true,
        estado: "presente",
        observaciones: "Ingreso puntual verificado en geocerca central.",
      },
      {
        id: 2,
        becario_id: 102,
        nombre: "Edgar Elias Alarcon Huanca",
        carrera: "Ingeniería de Sistemas",
        hora_marcacion: "08:28:40",
        distancia_m: 25.4,
        dentro_de_radio: true,
        estado: "presente",
        observaciones: "Ubicación GPS confirmada a 25m del epicentro.",
      },
      {
        id: 3,
        becario_id: 103,
        nombre: "Adai Belen Huayta Cardozo",
        carrera: "Contaduría Pública",
        hora_marcacion: "08:42:10",
        distancia_m: 34.1,
        dentro_de_radio: true,
        estado: "retraso",
        observaciones: "Retraso de 12 minutos por congestión en autopista La Paz-El Alto.",
      },
      {
        id: 4,
        becario_id: 104,
        nombre: "Ronald Franz Mamani Quispe",
        carrera: "Bioquímica y Farmacia",
        hora_marcacion: "--:--:--",
        distancia_m: 0,
        dentro_de_radio: false,
        estado: "ausente",
        observaciones: "Sin marcación en el perímetro geodésico fijado.",
      },
      {
        id: 5,
        becario_id: 105,
        nombre: "Abigail Ruth Condori Flores",
        carrera: "Trabajo Social",
        hora_marcacion: "08:19:50",
        distancia_m: 12.0,
        dentro_de_radio: true,
        estado: "presente",
        observaciones: "Llegada anticipada al recinto.",
      },
      {
        id: 6,
        becario_id: 106,
        nombre: "Christian David Mamani Alanoca",
        carrera: "Derecho",
        hora_marcacion: "--:--:--",
        distancia_m: 0,
        dentro_de_radio: false,
        estado: "justificado",
        observaciones: "Permiso institucional concedido por examen de grado universitario.",
      },
    ],
  },
  {
    id: 2,
    titulo: "Taller Práctico de Formulario Pastoral F-03",
    descripcion:
      "Instrucción metodológica sobre los 5 ejes canónicos diaconales y convalidación semestral de horas con firma digital.",
    tipo_evento: "taller",
    fecha: "2026-10-18",
    hora_inicio: "09:00",
    hora_fin: "12:00",
    latitud: -16.505412,
    longitud: -68.129845,
    radio_tolerancia_m: 100,
    direccion_referencia: "Sede Sopocachi, Calle Fernando Guachalla esq. Sánchez Lima #480, La Paz",
    estado: "programado",
    total_convocados: 45,
    asistencias: [],
  },
  {
    id: 3,
    titulo: "Servicio Comunitario Diaconal en Centro Infantil",
    descripcion:
      "Acompañamiento pedagógico y voluntariado formativo en centros de estimulación temprana en la zona Ballivián.",
    tipo_evento: "servicio_diaconal",
    fecha: "2026-09-28",
    hora_inicio: "08:00",
    hora_fin: "14:00",
    latitud: -16.48912,
    longitud: -68.18231,
    radio_tolerancia_m: 150,
    direccion_referencia: "Centro Infantil Arcoíris, Av. Ballivián entre calles 3 y 4, El Alto",
    estado: "finalizado",
    total_convocados: 25,
    asistencias: [
      {
        id: 21,
        becario_id: 101,
        nombre: "Nilda Amalia Churata Paye",
        carrera: "Educación Parvularia",
        hora_marcacion: "07:55:00",
        distancia_m: 21.0,
        dentro_de_radio: true,
        estado: "presente",
        observaciones: "Apoyo en actividades lúdicas infantiles.",
      },
      {
        id: 22,
        becario_id: 102,
        nombre: "Edgar Elias Alarcon Huanca",
        carrera: "Ingeniería de Sistemas",
        hora_marcacion: "07:58:20",
        distancia_m: 19.5,
        dentro_de_radio: true,
        estado: "presente",
        observaciones: "Coordinación logística y sonido.",
      },
      {
        id: 23,
        becario_id: 103,
        nombre: "Adai Belen Huayta Cardozo",
        carrera: "Contaduría Pública",
        hora_marcacion: "08:02:11",
        distancia_m: 15.8,
        dentro_de_radio: true,
        estado: "presente",
        observaciones: "Puntual en sala de recepción.",
      },
    ],
  },
];

const PREDETERMINADOS_GPS = [
  {
    etiqueta: "Oficina Central Diaconía (El Alto)",
    latitud: -16.500054,
    longitud: -68.173455,
    referencia: "Av. Juan Pablo II #2540, El Alto",
  },
  {
    etiqueta: "Sede Sopocachi (La Paz)",
    latitud: -16.505412,
    longitud: -68.129845,
    referencia: "Calle Fernando Guachalla esq. Sánchez Lima #480, La Paz",
  },
  {
    etiqueta: "Iglesia Central El Alto (Cruce Viacha)",
    latitud: -16.52134,
    longitud: -68.18921,
    referencia: "Av. 6 de Marzo frente al Cruce Viacha, El Alto",
  },
  {
    etiqueta: "Auditorio Miraflores (La Paz)",
    latitud: -16.49652,
    longitud: -68.11874,
    referencia: "Av. Busch esq. Villalobos, Miraflores, La Paz",
  },
];

export function GestionEventos() {
  const [eventos, set_eventos] = useState<EventoGeolocalizado[]>(EVENTOS_INICIALES);
  const [filtro_estado, set_filtro_estado] = useState<string>("todos");
  const [dialogo_nuevo_abierto, set_dialogo_nuevo_abierto] = useState(false);
  const [evento_seleccionado_acta, set_evento_seleccionado_acta] = useState<EventoGeolocalizado | null>(null);
  const [descargando_pdf, set_descargando_pdf] = useState(false);
  const [mensaje_exito, set_mensaje_exito] = useState<string | null>(null);

  // Formulario nuevo evento
  const [nuevo_titulo, set_nuevo_titulo] = useState("");
  const [nueva_descripcion, set_nueva_descripcion] = useState("");
  const [nuevo_tipo, set_nuevo_tipo] = useState<EventoGeolocalizado["tipo_evento"]>("escuela_lideres_especial");
  const [nueva_fecha, set_nueva_fecha] = useState<Date | undefined>(new Date());
  const [nueva_hora_inicio, set_nueva_hora_inicio] = useState("08:30");
  const [nueva_hora_fin, set_nueva_hora_fin] = useState("13:00");
  const [nueva_latitud, set_nueva_latitud] = useState("-16.500054");
  const [nueva_longitud, set_nueva_longitud] = useState("-68.173455");
  const [nuevo_radio, set_nuevo_radio] = useState("100");
  const [nueva_referencia, set_nueva_referencia] = useState("Av. Juan Pablo II #2540, El Alto");

  // Filtros computados
  const eventos_filtrados = eventos.filter((ev) => {
    if (filtro_estado === "todos") return true;
    return ev.estado === filtro_estado;
  });

  const contarPorEstado = (_est: string) => {
    if (_est === "todos") return eventos.length;
    return eventos.filter((e) => e.estado === _est).length;
  };

  const pestanas: ElementoPestana[] = [
    { id: "todos", etiqueta: "Todos los Eventos", contador: contarPorEstado("todos") },
    { id: "en_curso", etiqueta: "En Curso", contador: contarPorEstado("en_curso") },
    { id: "programado", etiqueta: "Programados", contador: contarPorEstado("programado") },
    { id: "finalizado", etiqueta: "Finalizados", contador: contarPorEstado("finalizado") },
  ];

  const aplicarPredeterminadoGps = (_indice: number) => {
    const p = PREDETERMINADOS_GPS[_indice];
    if (p) {
      set_nueva_latitud(p.latitud.toString());
      set_nueva_longitud(p.longitud.toString());
      set_nueva_referencia(p.referencia);
    }
  };

  const manejarCrearEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo_titulo.trim()) return;

    const nuevo: EventoGeolocalizado = {
      id: Date.now(),
      titulo: nuevo_titulo.trim(),
      descripcion: nueva_descripcion.trim(),
      tipo_evento: nuevo_tipo,
      fecha: nueva_fecha ? format(nueva_fecha, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      hora_inicio: nueva_hora_inicio,
      hora_fin: nueva_hora_fin,
      latitud: parseFloat(nueva_latitud) || -16.500054,
      longitud: parseFloat(nueva_longitud) || -68.173455,
      radio_tolerancia_m: parseInt(nuevo_radio, 10) || 100,
      direccion_referencia: nueva_referencia.trim(),
      estado: "programado",
      total_convocados: 35,
      asistencias: [],
    };

    set_eventos([nuevo, ...eventos]);
    set_dialogo_nuevo_abierto(false);
    set_mensaje_exito(`Evento "${nuevo.titulo}" convocado y programado exitosamente.`);
    setTimeout(() => set_mensaje_exito(null), 5000);

    // Resetear formulario
    set_nuevo_titulo("");
    set_nueva_descripcion("");
  };

  const manejarDescargarActaPdf = async (_evento: EventoGeolocalizado) => {
    set_descargando_pdf(true);
    try {
      // Simulación de generación y render Puppeteer headless institucional
      await new Promise((resolver) => setTimeout(resolver, 1400));

      const contenido_html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Acta Oficial de Asistencia - ${_evento.titulo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #063A6B; }
            .header { border-bottom: 2px solid #063A6B; padding-bottom: 12px; margin-bottom: 20px; }
            .titulo { font-size: 20px; font-weight: bold; color: #063A6B; }
            .subtitulo { font-size: 13px; color: #5B6D77; margin-top: 4px; }
            .resumen { display: flex; gap: 20px; margin: 15px 0; background: #F8F9FA; padding: 12px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: #063A6B; color: white; padding: 8px; text-align: left; }
            td { border-bottom: 1px solid #E3DCCB; padding: 8px; }
            .badge-presente { color: #10B981; font-weight: bold; }
            .badge-retraso { color: #F59E0B; font-weight: bold; }
            .badge-ausente { color: #EF4444; font-weight: bold; }
            .badge-justificado { color: #3B82F6; font-weight: bold; }
            .firma { margin-top: 50px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="titulo">ACTA OFICIAL DE ASISTENCIA GEOLOCALIZADA</div>
            <div class="subtitulo">Fundación Diaconía FRIF-IFD · Programa BUMAND</div>
          </div>
          <p><strong>Evento:</strong> ${_evento.titulo}</p>
          <p><strong>Fecha y Horario:</strong> ${_evento.fecha} (${_evento.hora_inicio} - ${_evento.hora_fin})</p>
          <p><strong>Recinto / Referencia:</strong> ${_evento.direccion_referencia}</p>
          <p><strong>Epicentro WGS84:</strong> ${_evento.latitud}, ${_evento.longitud} (Radio: ${_evento.radio_tolerancia_m} m)</p>
          
          <div class="resumen">
            <div><strong>Convocados:</strong> ${_evento.total_convocados}</div>
            <div><strong>Asistentes:</strong> ${_evento.asistencias.filter((a) => a.estado === "presente" || a.estado === "retraso").length}</div>
            <div><strong>Puntualidad:</strong> ${Math.round((_evento.asistencias.filter((a) => a.estado === "presente").length / Math.max(_evento.asistencias.length, 1)) * 100)}%</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Becario</th>
                <th>Carrera</th>
                <th>Hora Marcación</th>
                <th>Distancia</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              ${_evento.asistencias
                .map(
                  (a, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${a.nombre}</strong></td>
                  <td>${a.carrera}</td>
                  <td>${a.hora_marcacion}</td>
                  <td>${a.distancia_m > 0 ? `${a.distancia_m} m` : "--"}</td>
                  <td class="badge-${a.estado}">${a.estado.toUpperCase()}</td>
                  <td>${a.observaciones || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="firma">
            <p>___________________________________<br/>
            <strong>Supervisión Diaconal FRIF-IFD</strong><br/>
            Firma y Sello de Convalidador</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([contenido_html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `Acta_Asistencia_Evento_${_evento.id}.html`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
      toast.success("Acta emitida correctamente", {
        description: `Se ha descargado el acta oficial de asistencia para el evento ${_evento.id}.`,
      });
    } catch (_error) {
      toast.error("Error al emitir el acta PDF", {
        description: "Hubo una incidencia al procesar el acta de asistencia.",
      });
    } finally {
      set_descargando_pdf(false);
    }
  };

  const formatearTipo = (_tipo: EventoGeolocalizado["tipo_evento"]) => {
    switch (_tipo) {
      case "escuela_lideres_especial":
        return "Escuela de Líderes Especial";
      case "servicio_diaconal":
        return "Servicio Diaconal";
      case "taller":
        return "Taller de Formación";
      case "retiro":
        return "Retiro Espiritual";
      case "reunion":
        return "Reunión Convocada";
      default:
        return _tipo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de notificación contextual */}
      {mensaje_exito && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensaje_exito}</span>
        </div>
      )}

      {/* Cabecera y Barra de Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Pestañas animadas con layoutId */}
        <PestanasAnimadas
          pestanas={pestanas}
          pestana_activa_id={filtro_estado}
          al_cambiar_pestana={set_filtro_estado}
          identificador_diseno="pestana_eventos_filtro"
        />

        {/* Botón Juicy para Nuevo Evento */}
        <Dialog open={dialogo_nuevo_abierto} onOpenChange={set_dialogo_nuevo_abierto}>
          <DialogTrigger asChild>
            <div>
              <BotonJuicy
                variante="primario"
                tamaño="md"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Evento Geolocalizado</span>
              </BotonJuicy>
            </div>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-6 bg-white border-[#E3DCCB] rounded-2xl">
            <DialogHeader className="pb-3 border-b border-[#E3DCCB]">
              <DialogTitle className="text-lg font-bold text-[#063A6B] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#17B4C4]" />
                Convocatoria de Nuevo Evento Geolocalizado
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Define el epicentro geodésico WGS84 y el radio perimetral de tolerancia métrica para la marcación obligatoria.
              </p>
            </DialogHeader>

            <form onSubmit={manejarCrearEvento} className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="titulo" className="text-xs font-semibold text-[#063A6B]">
                  Título del Evento *
                </Label>
                <Input
                  id="titulo"
                  required
                  placeholder="Ej: Jornada Anual de Voluntariado y Acción Social"
                  value={nuevo_titulo}
                  onChange={(e) => set_nuevo_titulo(e.target.value)}
                  className="h-10 text-xs border-[#E3DCCB] rounded-xl focus-visible:ring-[#17B4C4]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descripcion" className="text-xs font-semibold text-[#063A6B]">
                  Descripción y Objetivos
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalla las actividades formativas, requerimientos y propósito de la convocatoria..."
                  value={nueva_descripcion}
                  onChange={(e) => set_nueva_descripcion(e.target.value)}
                  className="text-xs border-[#E3DCCB] rounded-xl focus-visible:ring-[#17B4C4] min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#063A6B]">Tipo de Evento</Label>
                  <Select
                    value={nuevo_tipo}
                    onValueChange={(val: any) => {
                      if (val) set_nuevo_tipo(val);
                    }}
                  >
                    <SelectTrigger className="w-full h-10 text-xs border-[#E3DCCB] rounded-xl bg-white">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E3DCCB]">
                      <SelectItem value="escuela_lideres_especial">Escuela de Líderes Especial</SelectItem>
                      <SelectItem value="taller">Taller de Formación</SelectItem>
                      <SelectItem value="servicio_diaconal">Servicio Diaconal</SelectItem>
                      <SelectItem value="retiro">Retiro Espiritual</SelectItem>
                      <SelectItem value="reunion">Reunión Ordinaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#063A6B]">Fecha del Evento</Label>
                  <SeleccionadorFecha
                    fecha={nueva_fecha}
                    alCambiar={set_nueva_fecha}
                    etiqueta_boton="Seleccionar fecha del evento"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#063A6B]">Hora de Inicio</Label>
                  <Input
                    type="time"
                    value={nueva_hora_inicio}
                    onChange={(e) => set_nueva_hora_inicio(e.target.value)}
                    className="h-10 text-xs border-[#E3DCCB] rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#063A6B]">Hora de Conclusión</Label>
                  <Input
                    type="time"
                    value={nueva_hora_fin}
                    onChange={(e) => set_nueva_hora_fin(e.target.value)}
                    className="h-10 text-xs border-[#E3DCCB] rounded-xl"
                  />
                </div>
              </div>

              {/* Parámetros de Geolocalización y Geocerca */}
              <div className="p-3.5 bg-[#F8F9FA] border border-[#E3DCCB] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#063A6B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#17B4C4]" />
                    Parámetros de Geocerca (La Paz - El Alto)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">WGS84 EPSG:4326</span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground font-medium">
                    Atajo a recintos institucionales frecuentes:
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PREDETERMINADOS_GPS.map((p, idx) => (
                      <button
                        key={p.etiqueta}
                        type="button"
                        onClick={() => aplicarPredeterminadoGps(idx)}
                        className="text-[10.5px] px-2.5 py-1 rounded-lg border border-[#E3DCCB] bg-white hover:border-[#17B4C4] hover:text-[#063A6B] transition-colors"
                      >
                        {p.etiqueta.split("(")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Latitud</Label>
                    <Input
                      value={nueva_latitud}
                      onChange={(e) => set_nueva_latitud(e.target.value)}
                      placeholder="-16.500054"
                      className="h-9 text-xs border-[#E3DCCB] font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Longitud</Label>
                    <Input
                      value={nueva_longitud}
                      onChange={(e) => set_nueva_longitud(e.target.value)}
                      placeholder="-68.173455"
                      className="h-9 text-xs border-[#E3DCCB] font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Radio (Metros)</Label>
                    <Input
                      type="number"
                      value={nuevo_radio}
                      onChange={(e) => set_nuevo_radio(e.target.value)}
                      placeholder="100"
                      className="h-9 text-xs border-[#E3DCCB] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Dirección y Referencia Urbana</Label>
                  <Input
                    value={nueva_referencia}
                    onChange={(e) => set_nueva_referencia(e.target.value)}
                    placeholder="Ej: Av. Juan Pablo II #2540, a pasos de la UPEA"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-[#E3DCCB] gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => set_dialogo_nuevo_abierto(false)}
                  className="rounded-xl border-[#E3DCCB] text-xs h-10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#063A6B] hover:bg-[#084885] text-white rounded-xl text-xs h-10 px-5 font-semibold"
                >
                  Publicar y Convocar Evento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cuadrícula de Tarjetas de Eventos con Cult UI (TarjetaSpotlight + BordeLuminoso) */}
      {eventos_filtrados.length === 0 ? (
        <EstadoVacio
          icono={CalendarIcon}
          titulo="Sin eventos convocados"
          descripcion="No existen eventos o encuentros geolocalizados que coincidan con los filtros de búsqueda o estado seleccionados."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {eventos_filtrados.map((ev) => {
          const es_evento_activo_dia = ev.estado === "en_curso";
          const total_asistencias = ev.asistencias.length;
          const presentes = ev.asistencias.filter((a) => a.estado === "presente").length;
          const retrasos = ev.asistencias.filter((a) => a.estado === "retraso").length;
          const pct_puntualidad =
            total_asistencias > 0
              ? Math.round((presentes / total_asistencias) * 100)
              : 0;

          return (
            <TarjetaSpotlight
              key={ev.id}
              color_luz={es_evento_activo_dia ? "rgba(23, 180, 196, 0.25)" : "rgba(6, 58, 107, 0.12)"}
              className={`p-5 flex flex-col justify-between transition-all duration-300 ${
                es_evento_activo_dia ? "ring-2 ring-[#17B4C4]/50 shadow-lg" : ""
              }`}
            >
              {/* Cult UI: Borde Luminoso en el evento activo del día */}
              {es_evento_activo_dia && (
                <BordeLuminoso
                  tamaño={140}
                  duracion={6}
                  color_desde="#17B4C4"
                  color_hacia="#F8C766"
                />
              )}

              <div className="space-y-3.5">
                {/* Cabecera de Estado y Tipo */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-md bg-[#063A6B]/5 text-[#063A6B] font-semibold border border-[#063A6B]/10">
                    {formatearTipo(ev.tipo_evento)}
                  </span>

                  {es_evento_activo_dia ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1.5 py-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      EN CURSO HOY
                    </Badge>
                  ) : ev.estado === "programado" ? (
                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                      PROGRAMADO
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">
                      FINALIZADO
                    </Badge>
                  )}
                </div>

                {/* Título y Descripción */}
                <div>
                  <h3 className="font-bold text-sm text-[#063A6B] line-clamp-1">{ev.titulo}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {ev.descripcion}
                  </p>
                </div>

                {/* Datos de Horario y Lugar */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-[#F8F9FA] p-3 rounded-xl border border-[#E3DCCB]/70">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#17B4C4] shrink-0" />
                    <span className="font-semibold text-[#063A6B]">{ev.fecha}</span>
                    <span className="text-muted-foreground">·</span>
                    <Clock className="w-3.5 h-3.5 text-[#17B4C4] shrink-0" />
                    <span>
                      {ev.hora_inicio} - {ev.hora_fin}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-[#E3DCCB]/40">
                    <MapPin className="w-3.5 h-3.5 text-[#E2694B] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-[#122029] truncate">{ev.direccion_referencia}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Radio GPS: ±{ev.radio_tolerancia_m}m · ({ev.latitud.toFixed(4)}, {ev.longitud.toFixed(4)})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de Asistencia con Watermelon UI */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-white border border-[#E3DCCB]">
                    <span className="text-[10px] uppercase text-muted-foreground font-medium block">Convocados</span>
                    <span className="font-bold text-xs text-[#063A6B]">{ev.total_convocados}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E3DCCB]">
                    <span className="text-[10px] uppercase text-muted-foreground font-medium block">Marcaciones</span>
                    <span className="font-bold text-xs text-emerald-600">
                      <ContadorRodilloAnimado valor={presentes + retrasos} />
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#E3DCCB]">
                    <span className="text-[10px] uppercase text-muted-foreground font-medium block">Puntualidad</span>
                    <span className="font-bold text-xs text-[#17B4C4]">
                      <ContadorRodilloAnimado valor={pct_puntualidad} sufijo="%" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón para Abrir Acta de Asistencia */}
              <div className="pt-4 mt-2 border-t border-[#E3DCCB]/60">
                <Button
                  onClick={() => set_evento_seleccionado_acta(ev)}
                  variant="outline"
                  className="w-full h-9 rounded-xl border-[#063A6B] text-[#063A6B] hover:bg-[#063A6B]/5 text-xs font-semibold gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#17B4C4]" />
                  <span>Ver Acta de Asistencia</span>
                </Button>
              </div>
            </TarjetaSpotlight>
          );
        })}
      </div>
      )}

      {/* Diálogo de "Acta de Asistencia" con Watermelon UI y Puppeteer */}
      {evento_seleccionado_acta && (
        <Dialog
          open={!!evento_seleccionado_acta}
          onOpenChange={(abierto) => {
            if (!abierto) set_evento_seleccionado_acta(null);
          }}
        >
          <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto p-6 bg-white border-[#E3DCCB] rounded-2xl">
            <DialogHeader className="pb-3 border-b border-[#E3DCCB]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Acta Oficial de Asistencia Geolocalizada
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {evento_seleccionado_acta.titulo} · {evento_seleccionado_acta.fecha}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => manejarDescargarActaPdf(evento_seleccionado_acta)}
                    disabled={descargando_pdf}
                    size="sm"
                    className="h-8 rounded-xl bg-[#063A6B] hover:bg-[#084885] text-white text-xs gap-1.5 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F8C766]" />
                    <span>{descargando_pdf ? "Generando PDF..." : "Descargar Acta PDF (Puppeteer)"}</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Cuadro de Métricas con Watermelon UI ContadorRodilloAnimado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
              <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E3DCCB] text-center">
                <span className="text-[11px] text-muted-foreground uppercase font-mono block">Convocados</span>
                <span className="text-2xl font-bold text-[#063A6B]">
                  {evento_seleccionado_acta.total_convocados}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-700 uppercase font-mono block">Total Asistentes</span>
                <span className="text-2xl font-bold text-emerald-700">
                  <ContadorRodilloAnimado
                    valor={
                      evento_seleccionado_acta.asistencias.filter(
                        (a) => a.estado === "presente" || a.estado === "retraso"
                      ).length
                    }
                  />
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#E3F9FA] border border-[#17B4C4]/30 text-center">
                <span className="text-[11px] text-[#0A5CA0] uppercase font-mono block">Puntualidad</span>
                <span className="text-2xl font-bold text-[#0A5CA0]">
                  <ContadorRodilloAnimado
                    valor={
                      evento_seleccionado_acta.asistencias.length > 0
                        ? Math.round(
                            (evento_seleccionado_acta.asistencias.filter((a) => a.estado === "presente").length /
                              evento_seleccionado_acta.asistencias.length) *
                              100
                          )
                        : 0
                    }
                    sufijo="%"
                  />
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                <span className="text-[11px] text-amber-700 uppercase font-mono block">Retraso / Permiso</span>
                <span className="text-2xl font-bold text-amber-700">
                  <ContadorRodilloAnimado
                    valor={
                      evento_seleccionado_acta.asistencias.filter(
                        (a) => a.estado === "retraso" || a.estado === "justificado"
                      ).length
                    }
                  />
                </span>
              </div>
            </div>

            {/* Lista y Tabla de Becarios Convocados */}
            <div className="border border-[#E3DCCB] rounded-xl overflow-hidden">
              <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#E3DCCB] flex items-center justify-between text-xs font-semibold text-[#063A6B]">
                <span>Nómina de Becarios y Registro Geodésico</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Radio de Geocerca: {evento_seleccionado_acta.radio_tolerancia_m}m
                </span>
              </div>

              {evento_seleccionado_acta.asistencias.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No existen marcaciones registradas aún para este evento programado.
                </div>
              ) : (
                <div className="divide-y divide-[#E3DCCB]/60 max-h-[360px] overflow-y-auto">
                  {evento_seleccionado_acta.asistencias.map((asist) => {
                    const badge_estado =
                      asist.estado === "presente" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          <Check className="w-3 h-3 mr-1" /> Presente
                        </Badge>
                      ) : asist.estado === "retraso" ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
                          <Clock className="w-3 h-3 mr-1" /> Retraso
                        </Badge>
                      ) : asist.estado === "justificado" ? (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-300 text-[10px]">
                          <FileText className="w-3 h-3 mr-1" /> Justificado
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-300 text-[10px]">
                          <XCircle className="w-3 h-3 mr-1" /> Ausente
                        </Badge>
                      );

                    return (
                      <div
                        key={asist.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#063A6B]">{asist.nombre}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">({asist.carrera})</span>
                          </div>
                          {asist.observaciones && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{asist.observaciones}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right font-mono text-xs">
                            <div className="font-semibold text-slate-700">{asist.hora_marcacion}</div>
                            <div className="text-[10.5px] text-muted-foreground flex items-center justify-end gap-1">
                              <Navigation className="w-2.5 h-2.5 text-[#17B4C4]" />
                              <span>{asist.distancia_m > 0 ? `${asist.distancia_m} m` : "Sin señal"}</span>
                            </div>
                          </div>

                          <div className="w-24 text-right">{badge_estado}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-[#E3DCCB]">
              <Button
                variant="outline"
                onClick={() => set_evento_seleccionado_acta(null)}
                className="rounded-xl border-[#E3DCCB] text-xs h-9"
              >
                Cerrar Acta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
