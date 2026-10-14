"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { MenuLateral } from "@/components/navegacion/menu-lateral";
import { toast } from "sonner";

// Módulos integrados por Sprint
import { PanelAdministrativo } from "@/components/panel-control/panel-administrativo";
import { PanelControlVista } from "@/components/panel-control/panel-control-vista";
import { GestionBecarios } from "@/components/becarios/gestion-becarios";
import { MapaLugaresPractica } from "@/components/lugares-practica/mapa-lugares-practica";
import { DialogoMarcacionAsistencia } from "@/components/asistencia/dialogo-marcacion-asistencia";
import { HistorialAsistenciaBecario } from "@/components/asistencia/historial-asistencia-becario";
import { AuditoriaAsistencia } from "@/components/asistencia/auditoria-asistencia";
import { AprobacionPasajes } from "@/components/pasajes/aprobacion-pasajes";
import { PasajesVista } from "@/components/pasajes/pasajes-vista";
import { MatrizEvaluacion360 } from "@/components/evaluaciones/matriz-evaluacion-360";
import { EvaluacionesVista } from "@/components/evaluaciones/evaluaciones-vista";
import { VisorReportesPdf } from "@/components/reportes/visor-reportes-pdf";
import { CentroNotificaciones } from "@/components/notificaciones/centro-notificaciones";
import { RadarGeocerca } from "@/components/recorridos/radar-geocerca";
import { RegistroRecorrido } from "@/components/recorridos/registro-recorrido";
import { FormularioF03 } from "@/components/evaluaciones/formulario-f03";
import { FirmaDigital } from "@/components/evaluaciones/firma-digital";
import { RegistroDevocionales } from "@/components/devocionales/registro-devocionales";
import { GestionEventos } from "@/components/eventos/gestion-eventos";
import { BandejaJustificaciones } from "@/components/justificaciones/bandeja-justificaciones";
import { ControlRefrigerios } from "@/components/refrigerios/control-refrigerios";
import {
  ContadorRodilloAnimado,
  BotonJuicy,
  FondoAguasReposo,
} from "@/components/animaciones";
import { GloboNotificaciones } from "@/components/notificaciones/globo-notificaciones";

import { ModalVersiculoDiario } from "@/components/devocionales/modal-versiculo-diario";
import { 
  Bus, 
  FileText, 
  ShieldCheck, 
  Menu, 
  ChevronRight,
  BookOpen,
  Clock
} from "lucide-react";

function obtenerDetallesSeccion(seccion: string, rol: string) {
  switch (seccion) {
    case "administracion":
      return {
        titulo: rol === "administrador" ? "Dashboard General Analítico" : "Panel de Supervisión",
      };
    case "resumen":
      return {
        titulo: "Mi Panel Operativo",
      };
    case "becarios":
      return {
        titulo: rol === "administrador" ? "Directorio General de Becarios" : "Becarios Asignados a Supervisión",
      };
    case "sedes":
      return {
        titulo: rol === "becario" ? "Mi Sede Asignada y Geocerca" : "Catálogo de Sedes y Geocercas Institucionales",
      };
    case "asistencia":
      return {
        titulo: rol === "becario" ? "Marcación de Horas de Práctica" : "Auditoría y Control de Asistencia",
      };
    case "pasajes":
      return {
        titulo: rol === "becario" ? "Declaración Mensual de Pasajes (80%)" : "Supervisión y Aprobación de Pasajes",
      };
    case "devocionales":
      return {
        titulo: rol === "becario" ? "Mis Devocionales y Crecimiento Espiritual" : "Seguimiento y Retroalimentación",
      };
    case "evaluacion_360":
      return {
        titulo: "Matriz de Evaluación 360°",
      };
    case "eventos":
      return {
        titulo: rol === "becario" ? "Mis Eventos y Encuentros Convocados" : "Gestión de Eventos y Encuentros",
      };
    case "justificaciones":
      return {
        titulo: rol === "becario" ? "Mis Justificaciones e Incidencias" : "Bandeja de Justificaciones e Incidencias",
      };
    case "reportes":
      return {
        titulo: "Emisión de Reportes PDF Oficiales",
      };
    case "notificaciones":
      return {
        titulo: "Centro Corporativo de Notificaciones",
      };
    case "refrigerios":
      return {
        titulo: "Control y Liquidación de Refrigerios Institucionales",
      };
    default:
      return {
        titulo: "Panel Institucional",
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
  const [colapsado, set_colapsado] = useState<boolean>(true);
  const [menu_movil_abierto, set_menu_movil_abierto] = useState<boolean>(false);
  const [modal_versiculo_abierto, set_modal_versiculo_abierto] = useState<boolean>(false);
  const [dialogo_asistencia_abierto, set_dialogo_asistencia_abierto] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const debe_mostrar = sessionStorage.getItem("bumand_mostrar_versiculo_inicio");
      if (debe_mostrar === "true") {
        set_modal_versiculo_abierto(true);
        sessionStorage.removeItem("bumand_mostrar_versiculo_inicio");
      }
    }
  }, []);

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
    <div className="relative flex min-h-screen text-[#1E293B]">
      {/* Fondo Canónico Diaconal con Three.js: Aguas de Reposo (Salmo 23:2) */}
      <FondoAguasReposo />

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
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Barra Superior con botón para móvil, breadcrumbs y perfil */}
        <header className="bg-white/20 backdrop-blur-md border-b border-[#E3DCCB]/40 py-3.5 shadow-2xs sticky top-0 z-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4">
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

              {/* Breadcrumb Principal Prominente (sin redundancias ni subtextos) */}
              <nav aria-label="Ruta de navegación" className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <img
                    src="/logos/logo-diaconia.svg"
                    alt="Diaconía IFD"
                    className="h-4 sm:h-5 w-auto object-contain opacity-85"
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <span className="text-base sm:text-lg font-bold text-[#063A6B] tracking-tight truncate">
                  {detalles_seccion.titulo}
                </span>
              </nav>
            </div>

            {/* Espacio derecho con campana interactiva universal y estado en línea */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063A6B]/5 border border-[#063A6B]/10 text-[11px] font-mono font-medium text-[#063A6B]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>BUMAND · En Línea</span>
              </span>

              {/* Botón rápido Versículo del Día RVR60 */}
              <button
                type="button"
                onClick={() => set_modal_versiculo_abierto(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17B4C4]/10 hover:bg-[#17B4C4]/20 border border-[#17B4C4]/20 text-[11px] font-medium text-[#0E7A85] transition-colors"
                title="Ver Versículo del Día (RVR60)"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#17B4C4]" />
                <span className="hidden sm:inline">Versículo Diario</span>
              </button>

              {/* Botón rápido Marcar Asistencia GPS para el becario */}
              {es_becario && (
                <button
                  type="button"
                  onClick={() => set_dialogo_asistencia_abierto(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063A6B] hover:bg-[#063A6B]/90 border border-[#063A6B] text-[11px] font-bold text-white shadow-xs transition-colors cursor-pointer"
                  title="Marcar Asistencia GPS (Entrada / Salida)"
                >
                  <Clock className="w-3.5 h-3.5 text-[#F8C766]" />
                  <span className="hidden sm:inline">Marcar Asistencia</span>
                </button>
              )}

              {/* Campana accesible universalmente con Globo de Notificaciones (Mini Diálogo) */}
              <GloboNotificaciones
                alAbrirHistorialCompleto={() => set_pestaña_activa("notificaciones")}
              />
            </div>
          </div>
        </header>

        {/* Área de Contenido de los Módulos - 100% ancho disponible con márgenes invisibles */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 pb-12">
          <Tabs value={pestaña_activa} onValueChange={set_pestaña_activa} className="w-full">
            {/* SPRINT 6: Panel Administrativo y de Supervisión */}
            {(es_admin || es_supervisor) && (
              <TabsContent value="administracion" className="space-y-6">
                <PanelControlVista />
              </TabsContent>
            )}

            {/* SPRINT 1: Resumen y Acciones del Becario */}
            {es_becario && (
              <TabsContent value="resumen" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tarjeta 1: Pasajes Liquidados */}
                  <div
                    className="flex flex-col justify-between h-full bg-[#063A6B] text-white border border-[#063A6B] rounded-2xl shadow-xs p-5 min-h-[155px]"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-[#7FE0E6] uppercase font-bold tracking-wider block">
                        Pasajes Liquidados (Mes Actual)
                      </span>
                      <div className="font-display text-3xl font-bold text-[#F8C766] mt-2 mb-1 flex items-baseline">
                        <ContadorRodilloAnimado valor={276} prefijo="Bs " decimales={2} clase_personalizada="text-[#F8C766]" />
                      </div>
                    </div>
                    <p className="font-mono text-[11px] text-white/70">
                      Reembolso exacto del 80% (Bs 345.00 total)
                    </p>
                  </div>

                  {/* Tarjeta 2: Horas Acreditadas */}
                  <div
                    className="flex flex-col justify-between h-full bg-white border border-[#E3DCCB] rounded-2xl shadow-xs p-5 min-h-[155px]"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Horas Acreditadas
                      </span>
                      <div className="font-display text-3xl font-bold text-[#063A6B] mt-2 mb-1 flex items-baseline">
                        <ContadorRodilloAnimado valor={64.5} sufijo=" hrs" decimales={1} clase_personalizada="text-[#063A6B]" />
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                        Puntualidad: 96%
                      </Badge>
                    </div>
                  </div>

                  {/* Tarjeta 3: Sede Asignada */}
                  <div
                    className="flex flex-col justify-between h-full bg-white border border-[#E3DCCB] rounded-2xl shadow-xs p-5 min-h-[155px]"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Sede Asignada
                      </span>
                      <div className="font-bold text-sm text-[#063A6B] mt-2 mb-0.5 leading-snug">
                        Oficina Central - Bloque A
                      </div>
                      <p className="text-xs text-muted-foreground">Av. Juan Pablo II #2540, El Alto</p>
                    </div>
                    <div className="text-[11px] font-mono text-[#17B4C4] font-semibold flex items-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#17B4C4] animate-pulse" />
                      <span>Radio Geodésico: 120m</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RadarGeocerca />

                  <div className="flex flex-col gap-3 justify-center">
                    <div className="border border-[#E3DCCB] bg-white rounded-2xl p-6 shadow-xs space-y-4">
                      <h3 className="font-bold text-[#063A6B] text-base">Acciones Operativas</h3>
                      <div className="space-y-2.5">
                        <BotonJuicy
                          onClick={() => set_dialogo_asistencia_abierto(true)}
                          variante="primario"
                          className="h-11 w-full text-xs font-bold justify-center"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Marcar Entrada / Salida GPS
                        </BotonJuicy>

                        <Dialog>
                          <DialogTrigger asChild>
                            <BotonJuicy
                              variante="secundario"
                              className="h-11 w-full text-xs font-bold justify-center"
                            >
                              <Bus className="w-4 h-4 mr-2" />
                              Declarar Recorrido (Ida / Vuelta)
                            </BotonJuicy>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-4xl max-h-[90vh] p-4 bg-white rounded-2xl overflow-y-auto">
                            <PasajesVista />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <BotonJuicy
                              variante="fantasma"
                              className="h-11 w-full border border-[#E3DCCB] text-[#063A6B] font-bold rounded-xl text-xs justify-center hover:bg-slate-50"
                            >
                              <FileText className="w-4 h-4 mr-2 text-amber-600" />
                              Llenar Formulario Pastoral F-03
                            </BotonJuicy>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 border-none bg-transparent shadow-none">
                            <FormularioF03 becario_id={usuario.becario_id || 1} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
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

            {/* SPRINT 3: Asistencia y Horas de Práctica segregadas por Rol */}
            <TabsContent value="asistencia" className="space-y-6">
              {es_becario ? (
                <HistorialAsistenciaBecario alAbrirMarcacion={() => set_dialogo_asistencia_abierto(true)} />
              ) : (
                <AuditoriaAsistencia rol={rol} />
              )}
            </TabsContent>

            {/* SPRINT 4: Declaración y Aprobación de Pasajes (80%) */}
            <TabsContent value="pasajes" className="space-y-6">
              {es_becario ? (
                <PasajesVista />
              ) : (
                <AprobacionPasajes />
              )}
            </TabsContent>

            {/* Módulo de Devocionales y Crecimiento Espiritual */}
            <TabsContent value="devocionales" className="space-y-6">
              <RegistroDevocionales />
            </TabsContent>

            {/* SPRINT 5: Evaluación 360° Semestral y Validación */}
            <TabsContent value="evaluacion_360" className="space-y-6">
              <EvaluacionesVista />
              <div className="mt-8 pt-8 border-t border-[#E3DCCB]">
                <MatrizEvaluacion360 />
              </div>
              {(es_admin || es_supervisor) && (
                <div className="mt-6 flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 border-[#063A6B] text-[#063A6B] font-bold rounded-xl text-xs hover:bg-[#063A6B]/5">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Convalidar con Firma Digital Canvas
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
                      <FirmaDigital alFirmar={(_b64) => toast.success("Firma digital convalidada correctamente", { description: "La acreditación ha sido registrada en el expediente institucional." })} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>

            {/* Módulo de Gestión de Eventos y Encuentros Geolocalizados */}
            <TabsContent value="eventos" className="space-y-6">
              <GestionEventos />
            </TabsContent>

            {/* Módulo de Bandeja de Justificaciones */}
            <TabsContent value="justificaciones" className="space-y-6">
              <BandejaJustificaciones />
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

            {/* Módulo de Refrigerios Institucionales */}
            <TabsContent value="refrigerios" className="space-y-6">
              <ControlRefrigerios />
            </TabsContent>
          </Tabs>
        </main>

        {/* Pie de página institucional traslúcido con fondo de aguas Three.js continuo */}
        <footer className="w-full bg-white/20 backdrop-blur-md border-t border-[#E3DCCB]/40 py-3.5 px-4 sm:px-6 lg:px-8 xl:px-10 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <img
                src="/logos/logo-diaconia.svg"
                alt="Diaconía IFD"
                className="h-4 w-auto object-contain opacity-75"
              />
              <span className="font-semibold text-[#063A6B]">
                BUMAND · Fundación Diaconía FRIF-IFD
              </span>
              <span className="hidden md:inline text-muted-foreground/40">•</span>
              <span className="hidden md:inline italic text-[11px] text-[#5B6D77]">
                «Junto a aguas de reposo me pastoreará» (Salmo 23:2)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sistema Institucional Activo
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Diaconal de Versículo del Día al Iniciar Sesión */}
      <ModalVersiculoDiario
        abierto={modal_versiculo_abierto}
        alCambiarAbierto={set_modal_versiculo_abierto}
        alIrADevocionales={(_cita, _texto) => set_pestaña_activa("devocionales")}
      />

      {/* Diálogo Universal de Marcación de Asistencia para Becarios */}
      <DialogoMarcacionAsistencia
        abierto={dialogo_asistencia_abierto}
        alCambiarAbierto={set_dialogo_asistencia_abierto}
      />
    </div>
  );
}
