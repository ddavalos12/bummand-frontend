"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { MenuLateral } from "@/components/navegacion/menu-lateral";

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
  Bus, 
  FileText, 
  ShieldCheck, 
  Menu, 
  ChevronRight 
} from "lucide-react";

function obtenerDetallesSeccion(seccion: string, rol: string) {
  switch (seccion) {
    case "administracion":
      return {
        titulo: rol === "administrador" ? "Dashboard General Analítico" : "Panel de Supervisión",
        subtitulo: "Métricas consolidadas de horas de práctica, presupuesto 80% y distribución institucional",
      };
    case "resumen":
      return {
        titulo: "Mi Panel Operativo",
        subtitulo: "Seguimiento en tiempo real de horas acreditadas, viáticos liquidados y geocerca activa",
      };
    case "becarios":
      return {
        titulo: rol === "administrador" ? "Directorio General de Becarios" : "Becarios Asignados a Supervisión",
        subtitulo: "Expedientes académicos, carreras, asignaciones de sedes y datos institucionales",
      };
    case "sedes":
      return {
        titulo: rol === "becario" ? "Mi Sede Asignada y Geocerca" : "Catálogo de Sedes y Geocercas Institucionales",
        subtitulo: "Georreferenciación WGS84, coordenadas GPS y radio geodésico de tolerancia métrica",
      };
    case "asistencia":
      return {
        titulo: rol === "becario" ? "Marcación de Horas de Práctica" : "Auditoría y Control de Asistencia",
        subtitulo: "Cálculo geodésico Haversine en tiempo real con validación anti-spoofing",
      };
    case "pasajes":
      return {
        titulo: rol === "becario" ? "Declaración Mensual de Pasajes (80%)" : "Supervisión y Aprobación de Pasajes",
        subtitulo: "Tramos de transporte público, verificación GPS y liquidación en centavos enteros",
      };
    case "evaluacion_360":
      return {
        titulo: "Matriz de Evaluación 360°",
        subtitulo: "Evaluación integral en los 5 ejes canónicos diaconales y Formulario Pastoral F-03",
      };
    case "reportes":
      return {
        titulo: "Emisión y Descarga de Reportes PDF Oficiales",
        subtitulo: "Generación certificada con firmas digitales y constancias de horas institucionales",
      };
    case "notificaciones":
      return {
        titulo: "Centro Corporativo de Notificaciones",
        subtitulo: "Historial de alertas reactivas, recordatorios de salida y convalidaciones",
      };
    default:
      return {
        titulo: "Panel Institucional",
        subtitulo: "Sistema BUMAND — Fundación Diaconía FRIF-IFD",
      };
  }
}

export default function PaginaInicio() {
  const { usuario, cerrarSesion, cargando, estaAutenticado } = usarAutenticacion();
  
  const rol = usuario?.rol || "becario";
  const es_admin = rol === "administrador";
  const es_supervisor = rol === "supervisor";
  const es_becario = rol === "becario";

  const [pestaña_activa, set_pestaña_activa] = useState<string>(
    es_becario ? "resumen" : "administracion"
  );
  const [colapsado, set_colapsado] = useState<boolean>(false);
  const [menu_movil_abierto, set_menu_movil_abierto] = useState<boolean>(false);

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

  const detalles_seccion = obtenerDetallesSeccion(pestaña_activa, rol);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1E293B]">
      {/* Menú Lateral Institucional BUMAND */}
      <MenuLateral
        pestaña_activa={pestaña_activa}
        alSeleccionarPestaña={set_pestaña_activa}
        usuario={usuario}
        cerrarSesion={cerrarSesion}
        colapsado={colapsado}
        alAlternarColapso={() => set_colapsado(!colapsado)}
        menu_movil_abierto={menu_movil_abierto}
        alCerrarMenuMovil={() => set_menu_movil_abierto(false)}
      />

      {/* Contenedor Principal Derecho */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior con botón para móvil, breadcrumbs y perfil */}
        <header className="bg-white border-b border-[#E3DCCB] px-4 sm:px-6 py-3.5 shadow-xs sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Botón hamburguesa para móvil */}
            <button
              type="button"
              onClick={() => set_menu_movil_abierto(true)}
              className="lg:hidden w-9 h-9 rounded-xl border border-[#E3DCCB] flex items-center justify-center text-[#063A6B] hover:bg-slate-50 transition-colors shrink-0"
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Logo BUMAND en móvil */}
            <img
              src="/logos/logo-bumand-icono.svg"
              alt="BUMAND"
              className="lg:hidden w-7 h-7 object-contain shrink-0"
            />

            {/* Breadcrumb y Título de Sección */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <img src="/logos/logo-diaconia.svg" alt="Diaconía" className="h-3.5 w-auto inline object-contain opacity-80" />
                </span>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="font-semibold text-[#063A6B] truncate">
                  {detalles_seccion.titulo}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[#063A6B] truncate">
                {detalles_seccion.titulo}
              </h1>
            </div>
          </div>

          {/* Espacio derecho limpio sin duplicidad de perfil */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063A6B]/5 border border-[#063A6B]/10 text-[11px] font-mono font-medium text-[#063A6B]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>BUMAND · En Línea</span>
            </span>
          </div>
        </header>

        {/* Subencabezado de Contexto */}
        <div className="bg-white/60 border-b border-[#E3DCCB]/60 px-4 sm:px-6 py-2.5">
          <p className="text-xs text-muted-foreground">
            {detalles_seccion.subtitulo}
          </p>
        </div>

        {/* Área de Contenido de los Módulos */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-16">
          <Tabs value={pestaña_activa} onValueChange={set_pestaña_activa} className="w-full">
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
    </div>
  );
}
