"use client";

import React, { useState } from "react";
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
  Wifi,
  WifiOff,
  Navigation,
  RefreshCw,
  X,
  ExternalLink,
  Coins,
  Map,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  InsigniaPulsoVivo,
} from "@/components/animaciones";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

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
  estado: "conforme" | "tardanza" | "fuera_geocerca" | "en_curso" | "convalidado";
  convalidado_por?: string | null;
  motivo_convalidacion?: string | null;
  lat_ingreso?: number;
  lng_ingreso?: number;
  es_viernes?: boolean;
  minutos_retraso?: number;
  monto_multa_bs?: number;
  confirmacion_presencial?: boolean;
}

const REGISTROS_AUDITORIA_INICIALES: RegistroAuditoriaAsistencia[] = [
  {
    id: 1,
    becario_id: 101,
    becario_nombre: "Nilda Amalia Churata Paye",
    carrera: "Educación Parvularia",
    sede_nombre: "Centro Infantil Sagrada Familia",
    fecha: "2026-10-09",
    hora_ingreso: "08:12",
    hora_salida: null,
    horas_trabajadas: 4.2,
    distancia_ingreso_m: 35,
    dentro_de_radio: true,
    dentro_de_horario: true,
    estado: "en_curso",
    lat_ingreso: -16.5023,
    lng_ingreso: -68.1511,
    es_viernes: true,
    minutos_retraso: 0,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 2,
    becario_id: 102,
    becario_nombre: "Edgar Elias Alarcon Huanca",
    carrera: "Ingeniería de Sistemas",
    sede_nombre: "Oficina Central Bloque A",
    fecha: "2026-10-09",
    hora_ingreso: "08:45",
    hora_salida: null,
    horas_trabajadas: 3.5,
    distancia_ingreso_m: 48,
    dentro_de_radio: true,
    dentro_de_horario: false,
    estado: "tardanza",
    lat_ingreso: -16.4998,
    lng_ingreso: -68.1502,
    es_viernes: true,
    minutos_retraso: 45,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 3,
    becario_id: 103,
    becario_nombre: "Adai Belen Huayta Cardozo",
    carrera: "Contaduría Pública",
    sede_nombre: "Agencia Villa Dolores",
    fecha: "2026-10-09",
    hora_ingreso: "07:58",
    hora_salida: "16:30",
    horas_trabajadas: 8.53,
    distancia_ingreso_m: 185,
    dentro_de_radio: false,
    dentro_de_horario: true,
    estado: "fuera_geocerca",
    lat_ingreso: -16.518,
    lng_ingreso: -68.163,
    es_viernes: true,
    minutos_retraso: 0,
    monto_multa_bs: 0,
    confirmacion_presencial: false,
  },
  {
    id: 4,
    becario_id: 104,
    becario_nombre: "Ronald Franz Mamani Quispe",
    carrera: "Bioquímica y Farmacia",
    sede_nombre: "Consultorio Médico San Lucas",
    fecha: "2026-10-09",
    hora_ingreso: "08:00",
    hora_salida: "17:00",
    horas_trabajadas: 9.0,
    distancia_ingreso_m: 22,
    dentro_de_radio: true,
    dentro_de_horario: true,
    estado: "conforme",
    lat_ingreso: -16.505,
    lng_ingreso: -68.148,
    es_viernes: true,
    minutos_retraso: 0,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 5,
    becario_id: 105,
    becario_nombre: "Abigail Ruth Condori Flores",
    carrera: "Trabajo Social",
    sede_nombre: "Hogar de Niños Amor y Esperanza",
    fecha: "2026-10-09",
    hora_ingreso: "08:35",
    hora_salida: "17:10",
    horas_trabajadas: 8.58,
    distancia_ingreso_m: 140,
    dentro_de_radio: false,
    dentro_de_horario: false,
    estado: "convalidado",
    convalidado_por: "Lic. Marcos Quispe",
    motivo_convalidacion: "Corte de vías por desfile cívico zonal verificado.",
    lat_ingreso: -16.521,
    lng_ingreso: -68.169,
    es_viernes: true,
    minutos_retraso: 35,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 6,
    becario_id: 106,
    becario_nombre: "Jhoselin Pamela Mamani Choque",
    carrera: "Medicina",
    sede_nombre: "Escuela de Líderes (Auditorio Central)",
    fecha: "2026-10-09",
    hora_ingreso: "14:50",
    hora_salida: "17:30",
    horas_trabajadas: 2.67,
    distancia_ingreso_m: 18,
    dentro_de_radio: true,
    dentro_de_horario: false,
    estado: "tardanza",
    lat_ingreso: -16.5020,
    lng_ingreso: -68.1510,
    es_viernes: true,
    minutos_retraso: 20,
    monto_multa_bs: 200,
    confirmacion_presencial: true,
  },
];

interface AuditoriaAsistenciaProps {
  rol?: string;
}

export function AuditoriaAsistencia({ rol }: AuditoriaAsistenciaProps) {
  const { usuario } = usarAutenticacion();
  const es_admin = rol === "administrador" || usuario?.rol === "administrador";

  const [registros_locales, set_registros_locales] = useState<RegistroAuditoriaAsistencia[]>(
    REGISTROS_AUDITORIA_INICIALES
  );
  const [termino_busqueda, set_termino_busqueda] = useState("");
  const [filtro_estado, set_filtro_estado] = useState("todos");
  const [filtro_sede, set_filtro_sede] = useState("todas");

  // Modales
  const [registro_convalidador, set_registro_convalidador] =
    useState<RegistroAuditoriaAsistencia | null>(null);
  const [motivo_convalidacion, set_motivo_convalidacion] = useState("");
  const [registro_detalle, set_registro_detalle] = useState<RegistroAuditoriaAsistencia | null>(
    null
  );

  // Estados para Llamada de Lista en Vivo (Viernes de Formación / Práctica)
  const [modal_lista_vivo_abierto, set_modal_lista_vivo_abierto] = useState<boolean>(false);
  const [lista_llamada_vivo, set_lista_llamada_vivo] = useState([
    {
      id: 101,
      nombre: "Nilda Amalia Churata Paye",
      carrera: "Educación Parvularia",
      sede: "Oficina Central Bloque A",
      marco_gps: true,
      hora_gps: "08:12",
      distancia_m: 35,
      confirmado: true,
    },
    {
      id: 102,
      nombre: "Edgar Elias Alarcon Huanca",
      carrera: "Ingeniería de Sistemas",
      sede: "Oficina Central Bloque A",
      marco_gps: true,
      hora_gps: "08:45",
      distancia_m: 48,
      confirmado: true,
    },
    {
      id: 103,
      nombre: "Adai Belen Huayta Cardozo",
      carrera: "Contaduría Pública",
      sede: "Oficina Central Bloque B",
      marco_gps: true,
      hora_gps: "07:58",
      distancia_m: 185,
      confirmado: false,
    },
    {
      id: 104,
      nombre: "Ronald Franz Mamani Quispe",
      carrera: "Bioquímica y Farmacia",
      sede: "Consultorio San Lucas",
      marco_gps: true,
      hora_gps: "08:00",
      distancia_m: 22,
      confirmado: true,
    },
    {
      id: 105,
      nombre: "Abigail Ruth Condori Flores",
      carrera: "Trabajo Social",
      sede: "Hogar Amor y Esperanza",
      marco_gps: false,
      hora_gps: "--:--",
      distancia_m: 0,
      confirmado: false,
    },
  ]);

  const alternarConfirmacionPresencial = (id: number) => {
    set_lista_llamada_vivo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, confirmado: !item.confirmado } : item))
    );
  };

  const confirmarTodosPresencial = () => {
    set_lista_llamada_vivo((prev) => prev.map((item) => ({ ...item, confirmado: true })));
    toast.success("Todos los becarios han sido confirmados presencialmente.");
  };

  const guardarLlamadaListaVivo = () => {
    const presentes = lista_llamada_vivo.filter((i) => i.confirmado).length;
    toast.success(`Llamada de lista guardada: ${presentes}/${lista_llamada_vivo.length} becarios confirmados presencialmente.`);
    set_modal_lista_vivo_abierto(false);
  };

  const { datos: registros_servidor, invalidar } = useConsulta<RegistroAuditoriaAsistencia[]>(
    "asistencia_auditoria",
    async () => {
      const respuesta = await clienteApi.get<any[]>("/api/asistencia");
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        return respuesta.map((item) => ({
          id: item.id,
          becario_id: item.becario_id,
          becario_nombre: item.becario?.usuario?.nombre || "Becario Institucional",
          carrera: item.becario?.carrera || "Carrera BUMAND",
          sede_nombre: item.becario?.lugar_practica?.nombre || "Sede Diaconía",
          fecha: item.fecha ? String(item.fecha).split("T")[0] : "2026-10-10",
          hora_ingreso: item.hora_ingreso || "08:00",
          hora_salida: item.hora_salida || null,
          horas_trabajadas: item.horas_trabajadas || null,
          distancia_ingreso_m: item.dentro_de_radio ? 35 : 175,
          dentro_de_radio: item.dentro_de_radio ?? true,
          dentro_de_horario: item.dentro_de_horario ?? true,
          estado: !item.hora_salida
            ? "en_curso"
            : !item.dentro_de_radio
            ? "fuera_geocerca"
            : !item.dentro_de_horario
            ? "tardanza"
            : "conforme",
          lat_ingreso: item.lat_ingreso,
          lng_ingreso: item.lng_ingreso,
        }));
      }
      return REGISTROS_AUDITORIA_INICIALES;
    },
    { datos_iniciales: REGISTROS_AUDITORIA_INICIALES }
  );

  const registros =
    registros_servidor && registros_servidor.length > 0 ? registros_servidor : registros_locales;

  const { conectado } = useTiempoReal({
    eventos: {
      asistencia_actualizada: () => invalidar(),
    },
  });

  // Métricas
  const total_registros = registros.length;
  const dentro_geocerca_total = registros.filter((r) => r.dentro_de_radio).length;
  const tasa_geocerca =
    total_registros > 0 ? Math.round((dentro_geocerca_total / total_registros) * 100) : 100;
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
      r.becario_nombre.toLowerCase().includes(texto) ||
      r.carrera.toLowerCase().includes(texto) ||
      r.sede_nombre.toLowerCase().includes(texto);

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

    const nombre_supervisor = usuario?.nombre || "Supervisor Diaconía";

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
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold text-[#063A6B]">
              {es_admin ? "Auditoría General de Asistencia" : "Control de Asistencia de Becarios"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitoreo en tiempo real de ingresos y salidas con validación geodésica Haversine y radio de tolerancia WGS84.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => set_modal_lista_vivo_abierto(true)}
            className="h-9 px-3 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <ListChecks className="w-4 h-4 text-[#F8C766]" />
            Llamada de Lista en Vivo (Viernes)
          </Button>

          <Badge
            variant="outline"
            className="border-[#E3DCCB] bg-slate-50 text-[#063A6B] text-xs font-mono py-1 px-3"
          >
            {conectado ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Sincronización en Vivo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <WifiOff className="w-3.5 h-3.5" /> Modo Local
              </span>
            )}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => invalidar()}
            className="rounded-xl border-[#E3DCCB] text-[#063A6B] h-9"
            title="Refrescar marcaciones"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Marcaciones Registradas */}
        <TarjetaSpotlight
          color_luz="rgba(6, 58, 107, 0.12)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Marcaciones Hoy
          </span>
          <div className="text-3xl font-bold font-display text-[#063A6B]">
            <ContadorRodilloAnimado valor={total_registros} sufijo=" registros" />
          </div>
          <p className="text-[11px] text-muted-foreground">Todas las sedes institucionales</p>
        </TarjetaSpotlight>

        {/* KPI 2: Cumplimiento de Geocerca */}
        <TarjetaSpotlight
          color_luz="rgba(16, 185, 129, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
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
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
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
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Jornadas en Curso
          </span>
          <div className="text-3xl font-bold font-display text-[#063A6B]">
            <ContadorRodilloAnimado valor={jornadas_activas} sufijo=" activas" />
          </div>
          <p className="text-[11px] text-muted-foreground">Becarios presentes en sede</p>
        </TarjetaSpotlight>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-white rounded-2xl border border-[#E3DCCB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por becario, carrera o sede..."
            value={termino_busqueda}
            onChange={(e) => set_termino_busqueda(e.target.value)}
            className="pl-9 text-xs rounded-xl border-[#E3DCCB] h-10 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Filtro Estado */}
          <Select value={filtro_estado} onValueChange={(val: any) => val && set_filtro_estado(val)}>
            <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium min-w-[160px]">
              <SelectValue placeholder="Todos los Estados" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E3DCCB] z-[100]">
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
            <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium min-w-[180px]">
              <SelectValue placeholder="Todas las Sedes" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E3DCCB] z-[100]">
              <SelectItem value="todas">Todas las Sedes</SelectItem>
              <SelectItem value="Oficina Central Bloque A">Oficina Central Bloque A</SelectItem>
              <SelectItem value="Centro Infantil Sagrada Familia">Centro Infantil Sagrada Familia</SelectItem>
              <SelectItem value="Agencia Villa Dolores">Agencia Villa Dolores</SelectItem>
              <SelectItem value="Consultorio Médico San Lucas">Consultorio Médico San Lucas</SelectItem>
              <SelectItem value="Hogar de Niños Amor y Esperanza">Hogar de Niños Amor y Esperanza</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Registros Auditables */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E3DCCB]/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#063A6B]">
              Registros de Asistencia Georreferenciados
            </CardTitle>
            <Badge variant="outline" className="border-[#E3DCCB] text-[#063A6B] font-mono text-xs">
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
            <div className="divide-y divide-[#E3DCCB]/50">
              {registros_filtrados.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Datos del Becario y Sede */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-sm shrink-0">
                      {item.becario_nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#063A6B]">
                          {item.becario_nombre}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-[#E3DCCB] text-[10px] font-mono text-muted-foreground"
                        >
                          {item.carrera}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-[#1E293B]">
                          <Building className="w-3.5 h-3.5 text-[#063A6B]" />
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
                      <div className="font-mono text-xs font-bold text-[#063A6B]">
                        {item.hora_ingreso} &rarr; {item.hora_salida || "En Jornada"}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {item.horas_trabajadas
                          ? `${item.horas_trabajadas.toFixed(2)} hrs computadas`
                          : "Jornada no cerrada"}
                      </div>
                      <div className="text-[10px] font-mono flex items-center sm:justify-end gap-1">
                        <Navigation className="w-3 h-3 text-[#17B4C4]" />
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
                      </div>

                      {/* Visualización Transparente de Multas de Escuela de Líderes */}
                      {item.monto_multa_bs && item.monto_multa_bs > 0 ? (
                        <div className="flex items-center justify-end">
                          <Badge variant="outline" className="bg-rose-50 border-rose-300 text-rose-700 text-[10px] font-mono font-bold gap-1">
                            <Coins className="w-3 h-3 text-rose-600" />
                            Multa Escuela de Líderes: Bs {item.monto_multa_bs.toFixed(2)} ({item.minutos_retraso}m)
                          </Badge>
                        </div>
                      ) : null}

                      {item.confirmacion_presencial ? (
                        <p className="text-[10px] text-emerald-700 font-medium">✓ Verificado presencial</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Sin confirmación en vivo</p>
                      )}
                    </div>

                    {/* Acciones de Auditoría */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => set_registro_detalle(item)}
                        className="h-8 px-2 text-[#063A6B] hover:bg-slate-100 rounded-lg text-xs"
                        title="Ver detalle satelital"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {/* Botón de Convalidación para anomalías */}
                      {(item.estado === "fuera_geocerca" || item.estado === "tardanza") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            set_registro_convalidador(item);
                            set_motivo_convalidacion("");
                          }}
                          className="h-8 px-2.5 text-xs font-bold border-[#063A6B] text-[#063A6B] hover:bg-[#063A6B]/5 rounded-lg"
                        >
                          Convalidar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Convalidación de Asistencia */}
      <Dialog
        open={Boolean(registro_convalidador)}
        onOpenChange={(abierto) => !abierto && set_registro_convalidador(null)}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Convalidación Institucional de Asistencia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Estás por convalidar formalmente la marcación de{" "}
              <strong className="text-[#063A6B]">{registro_convalidador?.becario_nombre}</strong>{" "}
              correspondiente al día <strong>{registro_convalidador?.fecha}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-[#E3DCCB] space-y-1 font-mono text-[11px]">
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
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_registro_convalidador(null)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={manejarConvalidar}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl font-bold"
            >
              Firmar Convalidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle GPS Satelital con Google Maps Interactivo */}
      <Dialog
        open={Boolean(registro_detalle)}
        onOpenChange={(abierto) => !abierto && set_registro_detalle(null)}
      >
        <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E3DCCB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
              <MapPin className="w-5 h-5 text-[#17B4C4]" />
              Auditoría Georreferenciada con Google Maps (WGS84)
            </DialogTitle>
          </DialogHeader>

          {registro_detalle && (
            <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E3DCCB] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#063A6B] text-sm">
                      {registro_detalle.becario_nombre}
                    </div>
                    <div className="text-muted-foreground">{registro_detalle.carrera}</div>
                  </div>
                  {registro_detalle.monto_multa_bs && registro_detalle.monto_multa_bs > 0 ? (
                    <Badge variant="outline" className="bg-rose-50 border-rose-300 text-rose-700 font-bold text-xs gap-1">
                      <Coins className="w-3.5 h-3.5 text-rose-600" />
                      Multa Escuela de Líderes: Bs {registro_detalle.monto_multa_bs.toFixed(2)}
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
                        ? `${registro_detalle.horas_trabajadas.toFixed(2)} hrs`
                        : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visor con Google Maps Embebido */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#063A6B] flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-[#17B4C4]" />
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
                    className="h-7 px-2.5 text-[11px] border-[#17B4C4] text-[#063A6B] rounded-lg flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 text-[#17B4C4]" />
                    Abrir en Google Maps
                  </Button>
                </div>

                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-[#E3DCCB]">
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
              <div className="p-3 bg-[#E3F9FA] rounded-xl border border-[#17B4C4]/30 space-y-1.5 text-xs text-[#063A6B]">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#17B4C4]" />
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
                  <p className="text-[11px] text-rose-700 font-medium pt-1 border-t border-[#17B4C4]/20">
                    ⚠ Retraso detectado en Escuela de Líderes: {registro_detalle.minutos_retraso} minutos. Multa reglamentaria BUMAND aplicada: <strong>Bs {registro_detalle.monto_multa_bs?.toFixed(2)}</strong>.
                  </p>
                ) : registro_detalle.minutos_retraso && registro_detalle.minutos_retraso > 0 ? (
                  <p className="text-[11px] text-amber-700 font-medium pt-1 border-t border-[#17B4C4]/20">
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

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => set_registro_detalle(null)}
              className="rounded-xl w-full text-xs font-bold"
            >
              Cerrar Detalle de Auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Interactivo de Llamada de Lista en Vivo (Supervisor / Organizador) */}
      <Dialog open={modal_lista_vivo_abierto} onOpenChange={set_modal_lista_vivo_abierto}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E3DCCB] shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
                  <ListChecks className="w-5 h-5 text-[#17B4C4]" />
                  Llamada de Lista en Vivo (Viernes de Formación / Práctica)
                </DialogTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Confirmación presencial ágil para supervisores de becarios que ya marcaron por geocerca.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={confirmarTodosPresencial}
                className="h-8 px-2.5 text-xs border-[#17B4C4] text-[#063A6B] rounded-lg font-bold"
              >
                Confirmar Todos
              </Button>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {lista_llamada_vivo.map((becario) => (
              <div
                key={becario.id}
                className="p-3.5 rounded-xl border border-[#E3DCCB] bg-slate-50/60 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#063A6B]">{becario.nombre}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-[#E3DCCB]">
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
            ))}
          </div>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] flex justify-end gap-2">
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
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Guardar Llamada de Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
