"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, FileCheck, TrendingUp, AlertCircle } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Datos simulados (mock)
const datos_asistencia = [
  { mes: "Ene", horas: 120 },
  { mes: "Feb", horas: 180 },
  { mes: "Mar", horas: 250 },
  { mes: "Abr", horas: 200 },
  { mes: "May", horas: 320 },
  { mes: "Jun", horas: 280 },
]

const configuracion_grafico = {
  horas: {
    label: "Horas Acumuladas",
    color: "#17B4C4",
  }
}

const actividades_recientes = [
  { id: 1, usuario: "Carlos M.", accion: "Subió evaluación F-03", tiempo: "Hace 2h", estado: "pendiente" },
  { id: 2, usuario: "Ana G.", accion: "Registró asistencia", tiempo: "Hace 5h", estado: "completado" },
  { id: 3, usuario: "Luis R.", accion: "Solicitó pasajes", tiempo: "Ayer", estado: "pendiente" },
  { id: 4, usuario: "Sofía T.", accion: "Completó prácticas", tiempo: "Hace 2 días", estado: "completado" },
]

export function PanelAdministrativo() {
  return (
    <div className="space-y-6">
      {/* Tarjetas Estadísticas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E3DCCB] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#F8C766]/20 rounded-bl-full transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Becarios Activos</p>
                <p className="text-3xl font-display font-bold text-[#063A6B]">124</p>
              </div>
              <div className="p-3 bg-[#063A6B]/5 rounded-xl">
                <Users className="w-5 h-5 text-[#063A6B]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">+12%</span>
              <span className="text-muted-foreground ml-2">este mes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3DCCB] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#17B4C4]/20 rounded-bl-full transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Horas Acumuladas</p>
                <p className="text-3xl font-display font-bold text-[#063A6B]">4,520</p>
              </div>
              <div className="p-3 bg-[#17B4C4]/10 rounded-xl">
                <Clock className="w-5 h-5 text-[#17B4C4]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">+340h</span>
              <span className="text-muted-foreground ml-2">esta semana</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3DCCB] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#E2694B]/20 rounded-bl-full transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Eval. Pendientes</p>
                <p className="text-3xl font-display font-bold text-[#063A6B]">18</p>
              </div>
              <div className="p-3 bg-[#E2694B]/10 rounded-xl">
                <FileCheck className="w-5 h-5 text-[#E2694B]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-amber-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Requieren revisión</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3DCCB] shadow-sm relative overflow-hidden group bg-[#063A6B] text-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full transition-transform group-hover:scale-110" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">Presupuesto Pasajes</p>
                <p className="text-3xl font-display font-bold text-[#F8C766]">$1,250</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-white/20 rounded-full h-2">
              <div className="bg-[#17B4C4] h-2 rounded-full" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-white/60 mt-2">45% consumido del límite mensual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Interactivo */}
        <Card className="border-[#E3DCCB] shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="font-display text-[#063A6B]">Tendencia de Horas Prácticas</CardTitle>
            <CardDescription>Horas reportadas por todos los becarios en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ChartContainer config={configuracion_grafico} className="h-full w-full min-h-[300px]">
              <BarChart data={datos_asistencia} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3DCCB" strokeDasharray="4 4" />
                <XAxis 
                  dataKey="mes" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#5B6D77' }} 
                  dy={10} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="horas" 
                  fill="var(--color-horas)" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="border-[#E3DCCB] shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="font-display text-[#063A6B]">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {actividades_recientes.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 border border-[#E3DCCB]">
                    <AvatarFallback className="bg-[#F8C766] text-[#063A6B] font-bold">
                      {actividad.usuario.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-[#122029] leading-none">
                      {actividad.usuario}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {actividad.accion}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">{actividad.tiempo}</p>
                    {actividad.estado === 'pendiente' ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        Pendiente
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                        Revisado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
