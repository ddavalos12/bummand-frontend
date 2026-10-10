"use client";

import { useState, useEffect } from "react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import {
  TarjetaSpotlight,
  BordeLuminoso,
  ContadorAnimado,
  ContenedorEscalonado,
  ElementoEscalonado,
} from "@/components/animaciones";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Info,
  CalendarDays,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  Area, 
  AreaChart, 
  Pie, 
  PieChart, 
  Cell, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Datos de horas acumuladas mensuales
const DATOS_HORAS_MENSUALES = [
  { mes: "Ene", horas: 520, meta: 600 },
  { mes: "Feb", horas: 680, meta: 650 },
  { mes: "Mar", horas: 850, meta: 800 },
  { mes: "Abr", horas: 790, meta: 800 },
  { mes: "May", horas: 920, meta: 850 },
  { mes: "Jun", horas: 880, meta: 850 },
  { mes: "Jul", horas: 940, meta: 900 },
  { mes: "Ago", horas: 980, meta: 900 },
  { mes: "Sep", horas: 1040, meta: 950 },
];

// Distribución de presupuesto de pasajes (80%)
const DATOS_PRESUPUESTO = [
  { nombre: "80% Reembolsado", valor: 5240, color: "#17B4C4" },
  { nombre: "Pendiente de Aprobación", valor: 1820, color: "#F8C766" },
  { nombre: "Saldo Presupuestario", valor: 2940, color: "#063A6B" },
];

// Horas por Unidad Operativa
const DATOS_UNIDADES = [
  { unidad: "Seguridad Física", horas: 340 },
  { unidad: "Consultorio Médico", horas: 410 },
  { unidad: "Productos y Canales", horas: 290 },
  { unidad: "Agencia Central El Alto", horas: 480 },
  { unidad: "Escuela de Líderes", horas: 320 },
];

const CONFIGURACION_GRAFICO = {
  horas: {
    label: "Horas Reales",
    color: "#17B4C4",
  },
  meta: {
    label: "Meta Planificada",
    color: "#063A6B",
  },
};

const ACTIVIDADES_RECIENTES = [
  { id: 1, usuario: "Nilda Amalia Churata", accion: "Marcó asistencia en Bloque A (dentro de geocerca)", tiempo: "Hace 15m", estado: "completado" },
  { id: 2, usuario: "Edgar Elias Alarcon", accion: "Declaró tramos ida y vuelta con coordenadas GPS", tiempo: "Hace 1h", estado: "pendiente" },
  { id: 3, usuario: "Pastor Juan Ramos", accion: "Completó formulario ministerial F-03", tiempo: "Hace 3h", estado: "completado" },
  { id: 4, usuario: "Adai Belen Huayta", accion: "Solicitó devolución del 80% (Día 24 cumplido)", tiempo: "Ayer", estado: "pendiente" },
];

export function PanelAdministrativo() {
  const { usuario } = usarAutenticacion();
  const [vista_anual, set_vista_anual] = useState(false);

  const es_supervisor = usuario?.rol === "supervisor";
  const nombre_usuario = usuario?.nombre || "Supervisor";

  // Métricas adaptativas según rol (Admin vs Supervisor)
  const metricas = es_supervisor
    ? {
        becarios_activos: 8,
        becarios_etiqueta: "Becarios Asignados",
        horas_acumuladas: "348 h",
        horas_porcentaje: "+98%",
        evaluaciones: "3 / 8",
        presupuesto_80: "Bs 1,840",
        presupuesto_limite: "Bs 3,200.00 límite de cohorte",
        alerta_titulo: `Panel de Supervisión Institucional — Cohorte ${nombre_usuario}`,
        alerta_desc: `Seguimiento de prácticas y devocionales para 8 becarios bajo su tutoría.`,
      }
    : {
        becarios_activos: 23,
        becarios_etiqueta: "Becarios BUMAND 2026",
        horas_acumuladas: "1,040 h",
        horas_porcentaje: "+109%",
        evaluaciones: "21 / 23",
        presupuesto_80: "Bs 5,240",
        presupuesto_limite: "Bs 10,000.00 límite mensual institucional",
        alerta_titulo: "Periodo de Liquidación Activo — BUMAND Gestión 2026",
        alerta_desc: "Verificación de geocercas satelitales en 11 agencias Diaconía y liquidación del 80% de pasajes.",
      };

  return (
    <div className="space-y-6">
      {/* Alerta Institucional */}
      <Alert className="border-[#17B4C4]/40 bg-[#17B4C4]/5 text-[#063A6B]">
        <CheckCircle2 className="h-4 w-4 text-[#17B4C4]" />
        <AlertTitle className="font-bold text-sm">{metricas.alerta_titulo}</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-0.5">
          {metricas.alerta_desc}
        </AlertDescription>
      </Alert>

      {/* Tarjetas de Métricas Ejecutivas Superiores con Cult UI, Watermelon UI y Motion Primitives */}
      <ContenedorEscalonado className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Becarios */}
        <ElementoEscalonado>
          <TarjetaSpotlight color_luz="rgba(248, 199, 102, 0.22)" className="h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#F8C766]/20 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                    {metricas.becarios_etiqueta}
                  </p>
                  <p className="text-3xl font-display font-bold text-[#063A6B]">
                    <ContadorAnimado valor={metricas.becarios_activos} />
                  </p>
                </div>
                <div className="p-2.5 bg-[#063A6B]/5 rounded-xl">
                  <Users className="w-5 h-5 text-[#063A6B]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-bold">100% activos</span>
                <span className="text-muted-foreground ml-1">en gestión 2026</span>
              </div>
              <Progress value={100} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </TarjetaSpotlight>
        </ElementoEscalonado>

        {/* Métrica 2: Horas */}
        <ElementoEscalonado>
          <TarjetaSpotlight color_luz="rgba(23, 180, 196, 0.22)" className="h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#17B4C4]/20 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                    Horas Acumuladas
                  </p>
                  <p className="text-3xl font-display font-bold text-[#063A6B]">
                    <ContadorAnimado valor={es_supervisor ? 348 : 1040} sufijo=" h" />
                  </p>
                </div>
                <div className="p-2.5 bg-[#17B4C4]/10 rounded-xl">
                  <Clock className="w-5 h-5 text-[#17B4C4]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <span className="text-emerald-600 font-bold">{metricas.horas_porcentaje}</span>
                <span className="text-muted-foreground ml-1">sobre meta planificada</span>
              </div>
              <Progress value={92} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </TarjetaSpotlight>
        </ElementoEscalonado>

        {/* Métrica 3: Evaluaciones */}
        <ElementoEscalonado>
          <TarjetaSpotlight color_luz="rgba(226, 105, 75, 0.22)" className="h-full">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#E2694B]/20 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                    Evaluaciones 360°
                  </p>
                  <p className="text-3xl font-display font-bold text-[#063A6B]">{metricas.evaluaciones}</p>
                </div>
                <div className="p-2.5 bg-[#E2694B]/10 rounded-xl">
                  <FileCheck className="w-5 h-5 text-[#E2694B]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                <span>Vigente al semestre actual</span>
              </div>
              <Progress value={85} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </TarjetaSpotlight>
        </ElementoEscalonado>

        {/* Métrica 4: Presupuesto Viáticos con Borde Luminoso Cult UI */}
        <ElementoEscalonado>
          <TarjetaSpotlight
            color_luz="rgba(255, 255, 255, 0.18)"
            className="h-full bg-[#063A6B] text-white border-transparent relative overflow-hidden"
          >
            <BordeLuminoso color_desde="#F8C766" color_hacia="#17B4C4" duracion={6} />
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#7FE0E6] uppercase font-mono">
                    Presupuesto 80% Pasajes
                  </p>
                  <p className="text-3xl font-display font-bold text-[#F8C766]">
                    <ContadorAnimado valor={es_supervisor ? 1840 : 5240} prefijo="Bs " />
                  </p>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <DollarSign className="w-5 h-5 text-[#F8C766]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-white/80">
                <span>{metricas.presupuesto_limite}</span>
              </div>
              <Progress value={52.4} className="h-1.5 mt-2 bg-white/20" />
            </CardContent>
          </TarjetaSpotlight>
        </ElementoEscalonado>
      </ContenedorEscalonado>

      {/* Fila 2: Gráficos Interactivos de Tendencia y Presupuesto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Área y Barras de Horas */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-lg text-[#063A6B] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#17B4C4]" />
                  Tendencia de Horas de Práctica y Cumplimiento
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Horas efectivas registradas con geolocalización frente a la meta académica programada.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">Vista Semestral</span>
                <Switch 
                  checked={vista_anual} 
                  onCheckedChange={set_vista_anual}
                  className="data-[state=checked]:bg-[#17B4C4]"
                />
                <span className="text-xs font-bold text-[#063A6B] font-mono">Anual</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 min-h-[320px]">
            <ChartContainer config={CONFIGURACION_GRAFICO} className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATOS_HORAS_MENSUALES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="degradadoHoras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#17B4C4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#17B4C4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E3DCCB" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748B", fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748B", fontSize: 12 }} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="horas" 
                    stroke="#17B4C4" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#degradadoHoras)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Donut Chart de Presupuesto 80% */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl flex flex-col">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <CardTitle className="font-display text-lg text-[#063A6B] flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#F8C766]" />
              Ejecución del 80% de Viáticos
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Desglose de la partida presupuestaria mensual
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DATOS_PRESUPUESTO}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="valor"
                  >
                    {DATOS_PRESUPUESTO.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val: any) => [`Bs ${val}.00`, "Monto"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <Separator className="my-2 bg-[#E3DCCB]/60" />

            <div className="space-y-2 text-xs">
              {DATOS_PRESUPUESTO.map((item) => (
                <div key={item.nombre} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-muted-foreground">{item.nombre}</span>
                  </div>
                  <span className="font-mono font-bold text-[#063A6B]">
                    Bs {item.valor.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fila 3: Horas por Unidad y Feed de Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 3: Barras Horizontales por Unidad */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl lg:col-span-2">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <CardTitle className="font-display text-lg text-[#063A6B] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Distribución de Prácticas por Unidad Operativa
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Horas registradas en cada dependencia de Diaconía FRIF-IFD
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {DATOS_UNIDADES.map((u) => (
                <div key={u.unidad} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#1E293B]">{u.unidad}</span>
                    <span className="font-mono text-[#063A6B]">{u.horas} hrs</span>
                  </div>
                  <Progress 
                    value={(u.horas / 500) * 100} 
                    className="h-2 bg-slate-100" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <CardTitle className="font-display text-lg text-[#063A6B] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#17B4C4]" />
              Auditoría Reciente
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Últimas transacciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {ACTIVIDADES_RECIENTES.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 text-xs">
                <Avatar className="w-8 h-8 border border-[#E3DCCB]">
                  <AvatarFallback className="bg-[#063A6B] text-[#F8C766] font-bold text-xs">
                    {act.usuario.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-0.5">
                  <p className="font-bold text-[#063A6B] leading-tight">{act.usuario}</p>
                  <p className="text-muted-foreground text-[11px] leading-snug">{act.accion}</p>
                  <span className="text-[10px] font-mono text-muted-foreground">{act.tiempo}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    act.estado === "completado"
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                      : "border-amber-300 text-amber-700 bg-amber-50"
                  }`}
                >
                  {act.estado}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
