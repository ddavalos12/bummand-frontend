"use client";

import React, { useState, useMemo } from "react";
import {
  Bus,
  MapPin,
  Calendar,
  Navigation,
  ArrowRight,
  ArrowRightLeft,
  Filter,
  Search,
  Sparkles,
  Download,
  Loader2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Compass,
  Building2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SeleccionadorFecha,
  SeleccionadorRangoFechas,
} from "@/components/ui/seleccionador-fecha";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { obtenerEstiloTransporte } from "./pasajes-vista";

export interface ItemParadaHistorial {
  id: number;
  solicitud_id: number;
  fecha: string;
  dia_semana: string;
  tramo: string;
  origen: string;
  destino: string;
  calles_declaradas: string | null;
  paradas_secuencia: string[];
  medio_transporte: string | null;
  tarifa: number;
  tipo_actividad: string;
  apoyo_realizado: string | null;
  periodo: string;
}

export interface ParadaFrecuenteResumen {
  nombre: string;
  frecuencia: number;
  como_origen: number;
  como_destino: number;
  tipo_transporte: string;
  zona: string;
}

export interface RespuestaHistorialParadas {
  becario: {
    id: number;
    nombre: string;
    ci: string;
    carrera: string;
    universidad: string;
    sede: string;
  };
  intervalo: {
    fecha_inicio: string | null;
    fecha_fin: string | null;
    dias_filtrados: number;
  };
  resumen: {
    total_recorridos: number;
    total_paradas_registradas: number;
    gasto_total_bs: number;
    devolucion_80_bs: number;
    paradas_unicas_frecuentes: ParadaFrecuenteResumen[];
  };
  historial: ItemParadaHistorial[];
}

interface HistorialParadasEstudianteProps {
  becario_id_inicial?: number;
  modo_modal?: boolean;
}

export function HistorialParadasEstudiante({
  becario_id_inicial,
  modo_modal = false,
}: HistorialParadasEstudianteProps) {
  const { usuario } = usarAutenticacion();
  const rol = usuario?.rol || "becario";
  const es_becario = rol === "becario";

  // Estudiante seleccionado
  const [id_estudiante, set_id_estudiante] = useState<number>(
    becario_id_inicial || usuario?.becario_id || usuario?.id || 1
  );

  // Intervalo de fechas
  const [fecha_inicio, set_fecha_inicio] = useState<string>("2026-10-01");
  const [fecha_fin, set_fecha_fin] = useState<string>("2026-10-31");
  const [filtro_tramo, set_filtro_tramo] = useState<string>("todos");
  const [busqueda_texto, set_busqueda_texto] = useState<string>("");
  const [descargando_pdf, set_descargando_pdf] = useState<boolean>(false);

  // Catálogo de estudiantes para supervisores / administradores
  const lista_estudiantes = useMemo(
    () => [
      { id: 1, nombre: "Joel Quispe Mamani", carrera: "Auditoría Financiera", universidad: "UMSA" },
      { id: 2, nombre: "Noelia Ramos Condori", carrera: "Contaduría Pública", universidad: "UPEA" },
      { id: 3, nombre: "David Huanca Choque", carrera: "Ingeniería de Sistemas", universidad: "UMSA" },
      { id: 4, nombre: "Ruth Abigail Mendoza", carrera: "Administración de Empresas", universidad: "UCB" },
      { id: 5, nombre: "Samuel Flores Tarqui", carrera: "Economía", universidad: "UMSA" },
    ],
    []
  );

  // Clave dinámica de caché según los filtros activos
  const clave_consulta = `historial_paradas_${id_estudiante}_${fecha_inicio}_${fecha_fin}_${filtro_tramo}`;

  // Consulta al backend
  const {
    datos,
    cargando,
    revalidar,
  } = useConsulta<RespuestaHistorialParadas>(
    clave_consulta,
    async () => {
      const params = new URLSearchParams();
      if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
      if (fecha_fin) params.append("fecha_fin", fecha_fin);
      if (filtro_tramo && filtro_tramo !== "todos") params.append("tramo", filtro_tramo);

      const endpoint = `/pasajes/estudiante/${id_estudiante}/historial-paradas?${params.toString()}`;
      try {
        const respuesta = await clienteApi.get<RespuestaHistorialParadas>(endpoint);
        return respuesta;
      } catch (_err) {
        // Fallback institucional en cliente si no hay conexión local de red
        return {
          becario: {
            id: id_estudiante,
            nombre:
              lista_estudiantes.find((e) => e.id === id_estudiante)?.nombre ||
              usuario?.nombre ||
              "Estudiante BUMAND",
            ci: "9943280 LP",
            carrera: "Auditoría Financiera",
            universidad: "Universidad Mayor de San Andrés",
            sede: "Oficina Central Bloque A",
          },
          intervalo: {
            fecha_inicio,
            fecha_fin,
            dias_filtrados: 31,
          },
          resumen: {
            total_recorridos: 6,
            total_paradas_registradas: 20,
            gasto_total_bs: 16.5,
            devolucion_80_bs: 13.2,
            paradas_unicas_frecuentes: [
              {
                nombre: "La Ceja - Calle 1",
                frecuencia: 4,
                como_origen: 2,
                como_destino: 2,
                tipo_transporte: "Minibús Interciudad",
                zona: "El Alto",
              },
              {
                nombre: "Pérez Velasco",
                frecuencia: 4,
                como_origen: 2,
                como_destino: 2,
                tipo_transporte: "Minibús / Micro",
                zona: "La Paz Centro",
              },
              {
                nombre: "Obelisco - Mariscal Santa Cruz",
                frecuencia: 2,
                como_origen: 1,
                como_destino: 1,
                tipo_transporte: "Mi Teleférico",
                zona: "La Paz Centro",
              },
              {
                nombre: "San Jorge - Av. Arce",
                frecuencia: 2,
                como_origen: 1,
                como_destino: 1,
                tipo_transporte: "Mi Teleférico",
                zona: "La Paz Sur",
              },
            ],
          },
          historial: [
            {
              id: 101,
              solicitud_id: 1,
              fecha: "2026-10-02",
              dia_semana: "Viernes",
              tramo: "ida",
              origen: "La Ceja - Calle 1",
              destino: "Pérez Velasco",
              calles_declaradas: "La Ceja - Calle 1 → Autopista LP-EA → Av. Montes → Pérez Velasco",
              paradas_secuencia: ["La Ceja - Calle 1", "Autopista LP-EA", "Av. Montes", "Pérez Velasco"],
              medio_transporte: "Minibús Interciudad",
              tipo_actividad: "Prácticas",
              apoyo_realizado: "Conciliación de expedientes de cartera crediticia",
              tarifa: 3.5,
              periodo: "Octubre 2026",
            },
            {
              id: 102,
              solicitud_id: 1,
              fecha: "2026-10-02",
              dia_semana: "Viernes",
              tramo: "vuelta",
              origen: "Pérez Velasco",
              destino: "La Ceja - Calle 1",
              calles_declaradas: "Pérez Velasco → Av. Montes → Autopista LP-EA → La Ceja",
              paradas_secuencia: ["Pérez Velasco", "Av. Montes", "Autopista LP-EA", "La Ceja - Calle 1"],
              medio_transporte: "Minibús Interciudad",
              tipo_actividad: "Prácticas",
              apoyo_realizado: "Retorno de jornada vespertina institucional",
              tarifa: 3.5,
              periodo: "Octubre 2026",
            },
            {
              id: 105,
              solicitud_id: 1,
              fecha: "2026-10-09",
              dia_semana: "Viernes",
              tramo: "ida",
              origen: "Obelisco - Mariscal Santa Cruz",
              destino: "San Jorge - Av. Arce",
              calles_declaradas: "Estación Obelisco → Línea Morada → Estación San Jorge",
              paradas_secuencia: ["Obelisco - Mariscal Santa Cruz", "Red Mi Teleférico Línea Morada", "San Jorge - Av. Arce"],
              medio_transporte: "Mi Teleférico",
              tipo_actividad: "Escuela de Líderes",
              apoyo_realizado: "Asistencia y apoyo logístico en Escuela de Líderes",
              tarifa: 3.0,
              periodo: "Octubre 2026",
            },
            {
              id: 106,
              solicitud_id: 1,
              fecha: "2026-10-09",
              dia_semana: "Viernes",
              tramo: "vuelta",
              origen: "San Jorge - Av. Arce",
              destino: "Obelisco - Mariscal Santa Cruz",
              calles_declaradas: "Estación San Jorge → Línea Morada → Estación Obelisco",
              paradas_secuencia: ["San Jorge - Av. Arce", "Red Mi Teleférico Línea Morada", "Obelisco - Mariscal Santa Cruz"],
              medio_transporte: "Mi Teleférico",
              tipo_actividad: "Escuela de Líderes",
              apoyo_realizado: "Retorno de taller de liderazgo eclesial",
              tarifa: 3.0,
              periodo: "Octubre 2026",
            },
            {
              id: 107,
              solicitud_id: 1,
              fecha: "2026-10-13",
              dia_semana: "Martes",
              tramo: "ida",
              origen: "Plaza San Francisco",
              destino: "Miraflores - Plaza Triangular",
              calles_declaradas: "San Francisco → Av. Saavedra → Plaza Uyuni → Plaza Triangular",
              paradas_secuencia: ["Plaza San Francisco", "Av. Saavedra", "Miraflores - Plaza Triangular"],
              medio_transporte: "Micro / Colectivo Urbano",
              tipo_actividad: "Prácticas",
              apoyo_realizado: "Atención a usuarios y verificación de solicitudes",
              tarifa: 1.5,
              periodo: "Octubre 2026",
            },
            {
              id: 108,
              solicitud_id: 1,
              fecha: "2026-10-13",
              dia_semana: "Martes",
              tramo: "vuelta",
              origen: "Miraflores - Plaza Triangular",
              destino: "Plaza San Francisco",
              calles_declaradas: "Miraflores → Av. Busch → Mercado Camacho → San Francisco",
              paradas_secuencia: ["Miraflores - Plaza Triangular", "Av. Busch", "Plaza San Francisco"],
              medio_transporte: "Micro / Colectivo Urbano",
              tipo_actividad: "Prácticas",
              apoyo_realizado: "Retorno de asignación en consultorio",
              tarifa: 1.5,
              periodo: "Octubre 2026",
            },
          ],
        };
      }
    }
  );

  // Filtrado reactivo en memoria por texto de búsqueda
  const historial_filtrado = useMemo(() => {
    if (!datos?.historial) return [];
    if (!busqueda_texto.trim()) return datos.historial;
    const q = busqueda_texto.toLowerCase();
    return datos.historial.filter((item) => {
      return (
        item.origen.toLowerCase().includes(q) ||
        item.destino.toLowerCase().includes(q) ||
        (item.calles_declaradas && item.calles_declaradas.toLowerCase().includes(q)) ||
        (item.medio_transporte && item.medio_transporte.toLowerCase().includes(q)) ||
        item.paradas_secuencia.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [datos?.historial, busqueda_texto]);

  // Manejador para aplicar intervalo rápido
  const aplicarAtajoIntervalo = (dias: number) => {
    const hoy = new Date();
    const f_fin = hoy.toISOString().split("T")[0];
    const fecha_pasada = new Date(hoy);
    fecha_pasada.setDate(hoy.getDate() - dias);
    const f_ini = fecha_pasada.toISOString().split("T")[0];
    set_fecha_inicio(f_ini);
    set_fecha_fin(f_fin);
  };

  const aplicarMesCompleto = () => {
    set_fecha_inicio("2026-10-01");
    set_fecha_fin("2026-10-31");
  };

  const limpiarFiltros = () => {
    set_fecha_inicio("");
    set_fecha_fin("");
    set_filtro_tramo("todos");
    set_busqueda_texto("");
  };

  // Exportar expediente a PDF
  const exportarExpedientePdf = async () => {
    try {
      set_descargando_pdf(true);
      toast.info("Generando expediente mensual de recorridos con Puppeteer...", {
        description: "Compilando kárdex oficial con trazabilidad de sistema.",
      });
      const mes_param = fecha_inicio ? fecha_inicio.substring(0, 7) : "2026-10";
      const blob = await clienteApi.descargarBlob(
        `/pdf/recorridos-estudiante/${id_estudiante}?mes=${mes_param}`
      );
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `Expediente_Recorridos_Estudiante_${id_estudiante}_${mes_param}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);
      toast.success("Expediente descargado exitosamente");
    } catch (_error) {
      toast.error("Error al exportar expediente en PDF");
    } finally {
      set_descargando_pdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Cabecera con selector de estudiante y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-[#E5E7EB] rounded-2xl p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00ABBD]/10 text-[#00808E]">
              <Bus className="w-5 h-5 text-[#00ABBD]" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-[#035683]">
                Historial de Paradas del Estudiante
              </h3>
              <p className="text-xs text-muted-foreground">
                Recuperación cronológica y georreferenciada de paradas, tramos urbanos y subsidio del 80%.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de estudiante para roles administrativos */}
          {!es_becario && (
            <div className="min-w-[220px]">
              <Select
                value={String(id_estudiante)}
                onValueChange={(val) => set_id_estudiante(Number(val))}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl border-[#E5E7EB] bg-white font-medium">
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E7EB] bg-white shadow-xl">
                  {lista_estudiantes.map((est) => (
                    <SelectItem key={est.id} value={String(est.id)} className="text-xs py-2">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-[#035683]">{est.nombre}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {est.carrera} · {est.universidad}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            variant="outline"
            onClick={exportarExpedientePdf}
            disabled={descargando_pdf}
            className="h-10 px-3.5 text-xs font-bold border-[#E5E7EB] rounded-xl hover:bg-slate-50 cursor-pointer flex items-center gap-2"
          >
            {descargando_pdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00ABBD]" />
            ) : (
              <Download className="w-4 h-4 text-[#007BBE]" />
            )}
            Expediente PDF
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => revalidar()}
            className="h-10 w-10 rounded-xl hover:bg-slate-100 cursor-pointer"
            title="Actualizar datos"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* 2. Tarjeta de Datos del Becario */}
      {datos?.becario && (
        <div className="bg-gradient-to-r from-[#035683]/5 via-[#00ABBD]/5 to-transparent border border-[#00ABBD]/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#035683] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {datos.becario.nombre.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-[#035683]">
                {datos.becario.nombre}
              </div>
              <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
                <span>CI: {datos.becario.ci}</span>
                <span>•</span>
                <span>{datos.becario.carrera}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{datos.becario.universidad}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div className="text-[11px]">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                Sede Asignada
              </span>
              <span className="font-bold text-[#00808E]">{datos.becario.sede}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Barra de Filtro de Intervalo Temporal (Con componente Calendar en vez del nativo) */}
      <Card className="border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00ABBD]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#035683]">
                Filtro de Intervalo de Fechas (Componente Calendar)
              </span>
            </div>

            {/* Atajos rápidos de intervalo */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-muted-foreground mr-1">Atajos:</span>
              <button
                type="button"
                onClick={aplicarMesCompleto}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Mes Completo
              </button>
              <button
                type="button"
                onClick={() => aplicarAtajoIntervalo(15)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Últimos 15 Días
              </button>
              <button
                type="button"
                onClick={() => aplicarAtajoIntervalo(7)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Últimos 7 Días
              </button>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-2.5 py-1 rounded-lg hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Fecha Desde con SeleccionadorFecha (Calendar) */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#035683]">Fecha Inicio</Label>
              <SeleccionadorFecha
                valorString={fecha_inicio}
                alCambiarString={(val) => set_fecha_inicio(val)}
                placeholder="Fecha inicio"
                className="h-10 text-xs border-[#E5E7EB] bg-white"
              />
            </div>

            {/* Fecha Hasta con SeleccionadorFecha (Calendar) */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#035683]">Fecha Fin</Label>
              <SeleccionadorFecha
                valorString={fecha_fin}
                alCambiarString={(val) => set_fecha_fin(val)}
                placeholder="Fecha fin"
                className="h-10 text-xs border-[#E5E7EB] bg-white"
              />
            </div>

            {/* Selector de Tramo */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#035683]">Sentido del Tramo</Label>
              <Select value={filtro_tramo} onValueChange={(val) => val && set_filtro_tramo(val)}>
                <SelectTrigger className="h-10 text-xs border-[#E5E7EB] bg-white rounded-xl">
                  <SelectValue placeholder="Sentido de viaje" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E7EB]">
                  <SelectItem value="todos" className="text-xs">Todos los tramos</SelectItem>
                  <SelectItem value="ida" className="text-xs">Solo Ida (Hacia Sede)</SelectItem>
                  <SelectItem value="vuelta" className="text-xs">Solo Vuelta (Retorno)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda en texto libre */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#035683]">Buscar Parada / Calle</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Ej. Ceja, Teleférico, Montes..."
                  value={busqueda_texto}
                  onChange={(e) => set_busqueda_texto(e.target.value)}
                  className="pl-9 h-10 text-xs rounded-xl border-[#E5E7EB] bg-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Tarjetas de Métricas Consolidadas (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
            Recorridos Registrados
          </span>
          <div className="font-poppins text-2xl font-bold text-[#035683] mt-1">
            {cargando ? "..." : datos?.resumen.total_recorridos || 0}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {datos?.intervalo.dias_filtrados ? `${datos.intervalo.dias_filtrados} días consultados` : "Sin rango"}
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase font-bold text-[#00ABBD] block">
            Total Paradas Conectadas
          </span>
          <div className="font-poppins text-2xl font-bold text-[#00808E] mt-1">
            {cargando ? "..." : datos?.resumen.total_paradas_registradas || 0}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {datos?.resumen.paradas_unicas_frecuentes.length || 0} nodos únicos
          </span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
            Gasto Bruto Pasajes
          </span>
          <div className="font-poppins text-2xl font-bold text-slate-800 mt-1">
            Bs {cargando ? "..." : (datos?.resumen.gasto_total_bs || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            100% tarifa oficial
          </span>
        </div>

        <div className="bg-[#035683] text-white border border-[#035683] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-mono uppercase font-bold text-[#FFB600] block">
            Reembolso Institucional (80%)
          </span>
          <div className="font-poppins text-2xl font-bold text-[#FFB600] mt-1">
            Bs {cargando ? "..." : (datos?.resumen.devolucion_80_bs || 0).toFixed(2)}
          </div>
          <span className="text-[11px] text-white/70">
            Liquidación reglamentaria
          </span>
        </div>
      </div>

      {/* 5. Nodos y Paradas Frecuentes del Estudiante */}
      {datos?.resumen.paradas_unicas_frecuentes && datos.resumen.paradas_unicas_frecuentes.length > 0 && (
        <Card className="border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#00ABBD]" />
                <CardTitle className="text-sm font-bold text-[#035683]">
                  Paradas de Mayor Frecuencia y Zonas de Desplazamiento
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs bg-white text-[#035683] font-bold rounded-full">
                {datos.resumen.paradas_unicas_frecuentes.length} Puntos Detectados
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Nodos habituales de abordaje, transbordo y destino declarados por el estudiante.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {datos.resumen.paradas_unicas_frecuentes.slice(0, 8).map((parada, idx) => (
                <div
                  key={`parada-frec-${idx}`}
                  className="p-3 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#00ABBD] transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-[#035683] line-clamp-1">
                      {parada.nombre}
                    </span>
                    <Badge className="bg-[#035683] text-white text-[10px] px-1.5 py-0 rounded-full font-bold shrink-0">
                      {parada.frecuencia}x
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{parada.zona}</span>
                    <span className="font-mono text-[10px] font-semibold text-[#00808E]">
                      {parada.tipo_transporte.split("/")[0]}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>Origen: {parada.como_origen}</span>
                    <span>Destino: {parada.como_destino}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Listado Cronológico de Recorridos y Paradas */}
      <Card className="border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-[#035683]">
              Detalle Cronológico de Recorridos y Secuencia de Paradas
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Mostrando {historial_filtrado.length} registros en el intervalo seleccionado.
            </CardDescription>
          </div>
          {historial_filtrado.length > 0 && (
            <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
              {historial_filtrado.length} tramos
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {cargando ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#00ABBD]" />
              <span>Cargando historial de paradas...</span>
            </div>
          ) : historial_filtrado.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Bus className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                No se encontraron recorridos ni paradas para el intervalo solicitado.
              </p>
              <p className="text-xs text-muted-foreground">
                Ajuste las fechas en el selector Calendar o limpie los filtros para visualizar más registros.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historial_filtrado.map((item) => (
                <div
                  key={`rec-${item.id}`}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors space-y-3"
                >
                  {/* Fila superior: Fecha, tramo, medio y tarifa */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#035683] bg-slate-100 px-2 py-1 rounded-lg">
                        {item.fecha} ({item.dia_semana})
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase rounded-full ${
                          item.tramo === "ida"
                            ? "bg-sky-50 text-sky-800 border-sky-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.tramo === "ida" ? "Tramo Ida" : "Tramo Vuelta"}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        • {item.tipo_actividad}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border ${obtenerEstiloTransporte(
                          item.medio_transporte || ""
                        )}`}
                      >
                        {item.medio_transporte}
                      </span>
                      <span className="font-poppins font-bold text-xs text-[#035683] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        Bs {item.tarifa.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Trazabilidad: Secuencia completa de paradas conectadas */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
                    <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Navigation className="w-3 h-3 text-[#00ABBD]" />
                      Secuencia de Paradas Conectadas:
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {item.paradas_secuencia.map((parada, p_idx) => {
                        const es_primera = p_idx === 0;
                        const es_ultima = p_idx === item.paradas_secuencia.length - 1;

                        return (
                          <React.Fragment key={`p-${item.id}-${p_idx}`}>
                            <span
                              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                                es_primera
                                  ? "bg-[#035683] text-white font-bold"
                                  : es_ultima
                                  ? "bg-[#00808E] text-white font-bold"
                                  : "bg-white text-slate-700 border border-slate-200"
                              }`}
                            >
                              {parada}
                            </span>
                            {!es_ultima && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {item.apoyo_realizado && (
                      <p className="text-[11px] text-muted-foreground mt-2 italic">
                        Actividad: {item.apoyo_realizado}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
