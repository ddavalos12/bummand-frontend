"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

// Módulos integrados por Sprint
import { PanelAdministrativo } from "@/components/panel-control/panel-administrativo";
import { GestionBecarios } from "@/components/becarios/gestion-becarios";
import { MapaLugaresPractica } from "@/components/lugares-practica/mapa-lugares-practica";
import { RegistroHoras } from "@/components/asistencia/registro-horas";
import { AprobacionPasajes } from "@/components/pasajes/aprobacion-pasajes";
import { MatrizEvaluacion360 } from "@/components/evaluaciones/matriz-evaluacion-360";
import { VisorReportesPdf } from "@/components/reportes/visor-reportes-pdf";
import { CentroNotificaciones } from "@/components/notificaciones/centro-notificaciones";
import { RadarGeocerca } from "@/components/recorridos/radar-geocerca";
import { RegistroRecorrido } from "@/components/recorridos/registro-recorrido";
import { FormularioF03 } from "@/components/evaluaciones/formulario-f03";
import { FirmaDigital } from "@/components/evaluaciones/firma-digital";

import { 
  Users, 
  MapPin, 
  Clock, 
  Bus, 
  Award, 
  FileText, 
  Bell, 
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  UserCheck,
  GraduationCap
} from "lucide-react";

export default function PaginaInicio() {
  const { usuario, cerrarSesion, cargando, estaAutenticado } = usarAutenticacion();
  
  const rol = usuario?.rol || "becario";
  const es_admin = rol === "administrador";
  const es_supervisor = rol === "supervisor";
  const es_becario = rol === "becario";

  const [pestaña_activa, set_pestaña_activa] = useState<string>(
    es_becario ? "resumen" : "administracion"
  );

  useEffect(() => {
    if (usuario) {
      if (usuario.rol === "becario") {
        set_pestaña_activa("resumen");
      } else {
        set_pestaña_activa("administracion");
      }
    }
  }, [usuario?.rol]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#063A6B] flex items-center justify-center text-white font-bold text-xl shadow-md animate-pulse">
            <span className="text-[#F8C766] font-display">B</span>
          </div>
          <p className="text-xs text-[#5B6D77] font-semibold">Validando credenciales institucionales...</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado || !usuario) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1E293B] pb-20">
      {/* Cabecera Principal Institucional BUMAND */}
      <header className="bg-white border-b border-[#E3DCCB] px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#063A6B] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <span className="text-[#F8C766] font-display">B</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-[#063A6B]">
                  BUMAND <span className="text-[#17B4C4] font-normal">| Diaconía FRIF-IFD</span>
                </h1>
                <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B] bg-[#17B4C4]/10 text-[10px] font-mono">
                  Producción Institucional
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Sistema Corporativo de Asistencia Georreferenciada, Pasajes y Evaluación de Desempeño
              </p>
            </div>
          </div>

          {/* Información del Usuario Autenticado y Salida Segura */}
          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                {es_admin && <ShieldCheck className="w-4 h-4 text-[#063A6B]" />}
                {es_supervisor && <UserCheck className="w-4 h-4 text-[#17B4C4]" />}
                {es_becario && <GraduationCap className="w-4 h-4 text-emerald-600" />}
                <p className="text-xs font-bold text-[#063A6B]">
                  {usuario.nombre}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {usuario.correo}
                </span>
                {es_admin && (
                  <Badge className="bg-[#063A6B] text-[#F8C766] border border-[#F8C766]/30 uppercase text-[9px] font-bold px-1.5 py-0">
                    ADMINISTRADOR
                  </Badge>
                )}
                {es_supervisor && (
                  <Badge className="bg-[#17B4C4]/15 text-[#063A6B] border border-[#17B4C4] uppercase text-[9px] font-bold px-1.5 py-0">
                    SUPERVISOR
                  </Badge>
                )}
                {es_becario && (
                  <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase text-[9px] font-bold px-1.5 py-0">
                    BECARIO
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={cerrarSesion}
              title="Cerrar sesión corporativa"
              className="h-9 px-3 border-[#E3DCCB] text-[#E2694B] hover:bg-[#E2694B]/10 hover:text-[#E2694B] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal con Pestañas de Navegación Condicionadas por Rol */}
      <main className="flex-1 px-4 sm:px-6 max-w-7xl mx-auto w-full pt-6">
        <Tabs value={pestaña_activa} onValueChange={set_pestaña_activa} className="w-full">
          {/* Barra de Pestañas RBAC */}
          <TabsList className="mb-6 h-auto flex flex-wrap bg-white border border-[#E3DCCB] p-1.5 rounded-2xl gap-1 shadow-sm">
            {/* Dashboard para Administradores y Supervisores */}
            {(es_admin || es_supervisor) && (
              <TabsTrigger
                value="administracion"
                className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {es_admin ? "Dashboard General" : "Panel Supervisor"}
              </TabsTrigger>
            )}

            {/* Resumen Operativo para Becarios */}
            {es_becario && (
              <TabsTrigger
                value="resumen"
                className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                Mi Panel
              </TabsTrigger>
            )}

            {/* Becarios: visible para Administradores y Supervisores */}
            {(es_admin || es_supervisor) && (
              <TabsTrigger
                value="becarios"
                className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                {es_admin ? "Directorio Becarios" : "Becarios Asignados"}
              </TabsTrigger>
            )}

            {/* Sedes y Geocercas */}
            <TabsTrigger
              value="sedes"
              className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              {es_becario ? "Mi Sede Asignada" : "Sedes y Geocercas"}
            </TabsTrigger>

            {/* Asistencia y Horas */}
            <TabsTrigger
              value="asistencia"
              className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              {es_becario ? "Marcación de Horas" : "Control de Asistencia"}
            </TabsTrigger>

            {/* Pasajes y Viáticos 80% */}
            <TabsTrigger
              value="pasajes"
              className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
            >
              <Bus className="w-3.5 h-3.5" />
              {es_becario ? "Mis Pasajes (80%)" : "Aprobación Pasajes"}
            </TabsTrigger>

            {/* Evaluaciones 360° */}
            <TabsTrigger
              value="evaluacion_360"
              className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              {es_becario ? "Mis Evaluaciones" : "Evaluación 360°"}
            </TabsTrigger>

            {/* Reportes PDF: para Admin y Supervisor */}
            {(es_admin || es_supervisor) && (
              <TabsTrigger
                value="reportes"
                className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Reportes PDF
              </TabsTrigger>
            )}

            {/* Notificaciones */}
            <TabsTrigger
              value="notificaciones"
              className="h-9 px-3.5 rounded-xl text-xs font-bold data-[state=active]:bg-[#063A6B] data-[state=active]:text-white flex items-center gap-1.5 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              Notificaciones
            </TabsTrigger>
          </TabsList>

          {/* SPRINT 6: Panel Administrativo y de Supervisión */}
          {(es_admin || es_supervisor) && (
            <TabsContent value="administracion" className="space-y-6">
              <PanelAdministrativo />
            </TabsContent>
          )}

          {/* SPRINT 1: Resumen y Acciones del Becario */}
          {es_becario && (
            <TabsContent value="resumen" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#063A6B] text-white border-none rounded-xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-mono text-[11px] text-[#7FE0E6] uppercase font-normal">
                      Pasajes Liquidados (Mes Actual)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-display text-3xl font-bold text-[#F8C766] mb-1">
                      Bs 276.00
                    </div>
                    <p className="font-mono text-[11px] text-white/70">
                      Reembolso exacto del 80% (Bs 345.00 total)
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#E3DCCB] rounded-xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-mono text-[11px] text-muted-foreground uppercase font-bold">
                      Horas Acreditadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-[#063A6B] mb-1">
                      64.5 hrs
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                      Puntualidad: 96%
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#E3DCCB] rounded-xl shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-mono text-[11px] text-muted-foreground uppercase font-bold">
                      Sede Asignada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-sm text-[#063A6B] mb-1">
                      Oficina Central - Bloque A
                    </div>
                    <p className="text-xs text-muted-foreground">Av. Juan Pablo II #2540, El Alto</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RadarGeocerca />

                <div className="flex flex-col gap-3 justify-center">
                  <Card className="border-[#E3DCCB] bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-[#063A6B] text-base">Acciones Operativas</h3>
                    <div className="space-y-2.5">
                      <Dialog>
                        {/* @ts-ignore */}
                        <DialogTrigger asChild>
                          <Button className="h-11 w-full bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl text-xs justify-center">
                            <Bus className="w-4 h-4 mr-2" />
                            Declarar Recorrido (Ida / Vuelta)
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                          <RegistroRecorrido />
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        {/* @ts-ignore */}
                        <DialogTrigger asChild>
                          <Button variant="outline" className="h-11 w-full border-[#E3DCCB] text-[#063A6B] font-bold rounded-xl text-xs justify-center hover:bg-slate-50">
                            <FileText className="w-4 h-4 mr-2 text-amber-600" />
                            Llenar Formulario Pastoral F-03
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
                          <FormularioF03 becario_id={usuario.becario_id || 1} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* SPRINT 2: Becarios (Admin y Supervisor) */}
          {(es_admin || es_supervisor) && (
            <TabsContent value="becarios" className="space-y-6">
              <GestionBecarios />
            </TabsContent>
          )}

          {/* SPRINT 2: Sedes y Geocercas */}
          <TabsContent value="sedes" className="space-y-6">
            <MapaLugaresPractica />
          </TabsContent>

          {/* SPRINT 3: Horas de Práctica */}
          <TabsContent value="asistencia" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <RegistroHoras />
            </div>
          </TabsContent>

          {/* SPRINT 4: Aprobación de Pasajes */}
          <TabsContent value="pasajes" className="space-y-6">
            <AprobacionPasajes />
          </TabsContent>

          {/* SPRINT 5: Evaluación 360° y Validación */}
          <TabsContent value="evaluacion_360" className="space-y-6">
            <MatrizEvaluacion360 />
            {(es_admin || es_supervisor) && (
              <div className="mt-6 flex justify-end">
                <Dialog>
                  {/* @ts-ignore */}
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-10 border-[#063A6B] text-[#063A6B] font-bold rounded-xl text-xs hover:bg-[#063A6B]/5">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Convalidar con Firma Digital Canvas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
                    <FirmaDigital alFirmar={(_b64) => alert("Firma convalidada correctamente.")} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>

          {/* SPRINT 7: Reportes PDF (Admin y Supervisor) */}
          {(es_admin || es_supervisor) && (
            <TabsContent value="reportes" className="space-y-6">
              <VisorReportesPdf />
            </TabsContent>
          )}

          {/* SPRINT 8: Notificaciones */}
          <TabsContent value="notificaciones" className="space-y-6">
            <CentroNotificaciones />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
