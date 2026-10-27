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
import { EvaluacionesVista } from "@/components/evaluaciones/evaluaciones-vista";
import { VisorReportesPdf } from "@/components/reportes/visor-reportes-pdf";
import { CentroNotificaciones } from "@/components/notificaciones/centro-notificaciones";
import { RadarGeocerca } from "@/components/recorridos/radar-geocerca";
import { RegistroRecorrido } from "@/components/recorridos/registro-recorrido";
import { FormularioF03 } from "@/components/evaluaciones/formulario-f03";
import { GestionEventos } from "@/components/eventos/gestion-eventos";
import { BandejaJustificaciones } from "@/components/justificaciones/bandeja-justificaciones";
import { ControlRefrigerios } from "@/components/refrigerios/control-refrigerios";
import {
  ContadorRodilloAnimado,
  BotonJuicy,
  FondoAguasReposo,
} from "@/components/animaciones";
import { GloboNotificaciones } from "@/components/notificaciones/globo-notificaciones";

import { AcercaDeNosotros } from "@/components/institucional/acerca-de-nosotros";
import { ModalVersiculoDiario } from "@/components/devocionales/modal-versiculo-diario";
import { DialogoDocumentosBecario } from "@/components/becarios/dialogo-documentos-becario";
import { 
  Bus, 
  FileText, 
  ShieldCheck,
  ShieldAlert,
  FileCheck, 
  Menu, 
  ChevronRight,
  BookOpen,
  Clock,
  HeartHandshake,
  Award,
  Building2
} from "lucide-react";

function obtenerDetallesSeccion(seccion: string, rol: string, subpestaña?: string) {
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
        titulo: rol === "becario" ? "Marcación de Horas de Práctica" : "Control de Asistencia",
      };
    case "pasajes":
      return {
        titulo: rol === "becario" ? "Declaración Mensual de Pasajes (80%)" : "Supervisión y Aprobación de Pasajes",
      };
    case "evaluaciones":
    case "evaluacion_360":
      return {
        titulo: subpestaña === "socioeconomica"
          ? "Evaluación Socioeconómica · Bienestar Universitario (26 Preguntas)"
          : (rol === "becario" ? "Mis Evaluaciones y Matriz" : "Matriz de Evaluación"),
      };
    case "evaluacion_socioeconomica":
      return {
        titulo: "Evaluación Socioeconómica · Bienestar Universitario (26 Preguntas)",
      };
    case "eventos":
      return {
        titulo: "Acciones de Servicio",
        subtitulo: "Convocatorias a actividades de servicio comunitario, voluntariado y registro de participación",
      };
    case "justificaciones":
      return {
        titulo: rol === "becario" ? "Mis Permisos y Justificaciones" : "Permisos y Justificaciones",
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
    case "acerca_de":
    case "acerca-de":
    case "acerca-de-nosotros":
      return {
        titulo: "Acerca de Nosotros · Diaconía BUMAND",
        subtitulo: "Información institucional, principios diaconales, historia y balance corporativo al 24 de octubre de 2026",
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
  const [dialogo_documentos_abierto, set_dialogo_documentos_abierto] = useState<boolean>(false);
  const [subpestaña_evaluaciones, set_subpestaña_evaluaciones] = useState<"matriz" | "socioeconomica">("matriz");

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
          <div className="w-12 h-12 rounded-2xl bg-[#035683] flex items-center justify-center text-white font-bold text-xl shadow-md animate-pulse">
            <span className="text-[#FFB600] font-display">B</span>
          </div>
          <p className="text-xs text-[#5B6D77] font-semibold">Validando credenciales institucionales...</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado || !usuario) {
    return null;
  }

  const detalles_seccion = obtenerDetallesSeccion(pestaña_activa, rol, subpestaña_evaluaciones);

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
        <header className="bg-white/20 backdrop-blur-md border-b border-[#E5E7EB]/40 py-3.5 shadow-2xs sticky top-0 z-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Botón hamburguesa para móvil */}
              <button
                type="button"
                onClick={() => set_menu_movil_abierto(true)}
                className="lg:hidden w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#035683] hover:bg-slate-50 transition-colors shrink-0"
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
                    src="/logos/ALTA1.svg"
                    alt="Diaconía IFD"
                    className="h-4 sm:h-5 w-auto object-contain opacity-85"
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <span className="text-base sm:text-lg font-bold text-[#035683] tracking-tight truncate">
                  {detalles_seccion.titulo}
                </span>
              </nav>
            </div>

            {/* Espacio derecho con campana interactiva universal y estado en línea */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#035683]/5 border border-[#035683]/10 text-[11px] font-mono font-medium text-[#035683]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>BUMAND · En Línea</span>
              </span>

              {/* Botón rápido Acerca de Nosotros (Universal para todos los roles) */}
              <button
                type="button"
                onClick={() => set_pestaña_activa("acerca_de")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                  pestaña_activa === "acerca_de"
                    ? "bg-[#035683] text-white border-[#035683] shadow-xs"
                    : "bg-[#035683]/10 hover:bg-[#035683]/20 border-[#035683]/20 text-[#035683]"
                }`}
                title="Acerca de Nosotros · Diaconía BUMAND"
                aria-label="Acerca de Nosotros"
              >
                <Building2 className={`w-3.5 h-3.5 ${pestaña_activa === "acerca_de" ? "text-[#FFB600]" : "text-[#007BBE]"}`} />
                <span className="hidden md:inline">Acerca de Nosotros</span>
              </button>

              {/* Botón rápido Versículo del Día RVR60 */}
              <button
                type="button"
                onClick={() => set_modal_versiculo_abierto(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ABBD]/10 hover:bg-[#00ABBD]/20 border border-[#00ABBD]/20 text-[11px] font-medium text-[#00808E] transition-colors"
                title="Ver Versículo del Día (RVR60)"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#00ABBD]" />
                <span className="hidden sm:inline">Versículo Diario</span>
              </button>

              {/* Botón rápido Marcar Asistencia GPS para el becario */}
              {es_becario && (
                <button
                  type="button"
                  onClick={() => set_dialogo_asistencia_abierto(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#035683] hover:bg-[#035683]/90 border border-[#035683] text-[11px] font-bold text-white shadow-xs transition-colors cursor-pointer"
                  title="Marcar Asistencia GPS (Entrada / Salida)"
                >
                  <Clock className="w-3.5 h-3.5 text-[#FFB600]" />
                  <span className="hidden sm:inline">Marcar Asistencia</span>
                </button>
              )}

              {/* Campana accesible universalmente con Globo de Notificaciones (Mini Diálogo) */}
              <GloboNotificaciones
                alAbrirHistorialCompleto={() => set_pestaña_activa("notificaciones")}
                alNavegarASeccion={(sec) => set_pestaña_activa(sec)}
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
                {/* Banner de Expediente y Documentación para el Becario */}
                <div className="bg-gradient-to-r from-[#035683]/10 via-[#00ABBD]/10 to-transparent border border-[#00ABBD]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#035683] text-[#00ABBD] flex items-center justify-center shrink-0 shadow-xs">
                      <FileCheck className="w-5 h-5 text-[#00ABBD]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#035683]">
                        Expediente Oficial BUMAND (Cédula de Identidad y Kárdex)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Verifica que tu carnet SEGIP y certificado de matrícula universitaria estén actualizados para habilitación de beneficios.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => set_dialogo_documentos_abierto(true)}
                    className="h-8 px-3 text-xs bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl shrink-0 cursor-pointer shadow-2xs"
                  >
                    Ver / Subir Documentos
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tarjeta 1: Pasajes Liquidados */}
                  <div
                    className="flex flex-col justify-between h-full bg-[#035683] text-white border border-[#035683] rounded-2xl shadow-xs p-5 min-h-[155px]"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-[#00ABBD] uppercase font-bold tracking-wider block">
                        Pasajes Liquidados (Mes Actual)
                      </span>
                      <div className="font-display text-3xl font-bold text-[#FFB600] mt-2 mb-1 flex items-baseline">
                        <ContadorRodilloAnimado valor={276} prefijo="Bs " decimales={2} clase_personalizada="text-[#FFB600]" />
                      </div>
                    </div>
                    <p className="font-mono text-[11px] text-white/70">
                      Reembolso exacto del 80% (Bs 345.00 total)
                    </p>
                  </div>

                  {/* Tarjeta 2: Horas Acreditadas */}
                  <div
                    className="flex flex-col justify-between h-full bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-5 min-h-[155px]"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Horas Acreditadas
                      </span>
                      <div className="font-display text-3xl font-bold text-[#035683] mt-2 mb-1 flex items-baseline">
                        <ContadorRodilloAnimado valor={64.5} sufijo=" hrs" decimales={1} clase_personalizada="text-[#035683]" />
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
                    className="flex flex-col justify-between h-full bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-5 min-h-[155px]"
                  >
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">
                        Sede Asignada
                      </span>
                      <div className="font-bold text-sm text-[#035683] mt-2 mb-0.5 leading-snug">
                        Oficina Central - Bloque A
                      </div>
                      <p className="text-xs text-muted-foreground">Av. Juan Pablo II #2540, El Alto</p>
                    </div>
                    <div className="text-[11px] font-mono text-[#00ABBD] font-semibold flex items-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ABBD] animate-pulse" />
                      <span>Radio Geodésico: 120m</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RadarGeocerca />

                  <div className="flex flex-col gap-3 justify-center">
                    <div className="border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-xs space-y-4">
                      <h3 className="font-bold text-[#035683] text-base">Acciones Operativas</h3>
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
                              className="h-11 w-full border border-[#E5E7EB] text-[#035683] font-bold rounded-xl text-xs justify-center hover:bg-slate-50"
                            >
                              <FileText className="w-4 h-4 mr-2 text-amber-600" />
                              Llenar Formulario Pastoral F-03
                            </BotonJuicy>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 border-none bg-transparent shadow-none">
                            <FormularioF03 becario_id={usuario.becario_id || 1} />
                          </DialogContent>
                        </Dialog>

                        <BotonJuicy
                          onClick={() => { set_pestaña_activa("evaluaciones"); set_subpestaña_evaluaciones("socioeconomica"); }}
                          variante="fantasma"
                          className="h-11 w-full border border-[#00ABBD] bg-[#00ABBD]/10 text-[#035683] font-bold rounded-xl text-xs justify-center hover:bg-[#00ABBD]/20"
                        >
                          <HeartHandshake className="w-4 h-4 mr-2 text-[#00ABBD]" />
                          Responder Evaluación Socioeconómica (26 Preguntas)
                        </BotonJuicy>
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

            {/* SPRINT 5: Matriz de Evaluación Semestral, Módulos y Socioeconómica */}
            <TabsContent value="evaluaciones" className="space-y-6">
              <EvaluacionesVista pestaña_inicial={subpestaña_evaluaciones === "socioeconomica" ? "socioeconomica" : "consolidado"} />
            </TabsContent>

            <TabsContent value="evaluacion_360" className="space-y-6">
              <EvaluacionesVista pestaña_inicial="consolidado" />
            </TabsContent>

            {/* SPRINT 5.5: Evaluación Socioeconómica (26 Preguntas Canónicas) */}
            <TabsContent value="evaluacion_socioeconomica" className="space-y-6">
              <EvaluacionesVista pestaña_inicial="socioeconomica" />
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
              <CentroNotificaciones alNavegarASeccion={(sec) => set_pestaña_activa(sec)} />
            </TabsContent>

            {/* Módulo de Refrigerios Institucionales */}
            <TabsContent value="refrigerios" className="space-y-6">
              <ControlRefrigerios />
            </TabsContent>

            {/* Módulo Institucional: Acerca de Nosotros (Universal para todos los roles) */}
            <TabsContent value="acerca_de" className="space-y-6">
              <AcercaDeNosotros rol_usuario={rol} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Pie de página institucional traslúcido con fondo de aguas Three.js continuo */}
        <footer className="w-full bg-white/20 backdrop-blur-md border-t border-[#E5E7EB]/40 py-3.5 px-4 sm:px-6 lg:px-8 xl:px-10 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => set_pestaña_activa("acerca_de")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                title="Ver acerca de nosotros e información institucional"
              >
                <img
                  src="/logos/ALTA1.svg"
                  alt="Diaconía IFD"
                  className="h-4 w-auto object-contain opacity-75"
                />
                <span className="font-semibold text-[#035683] hover:underline">
                  BUMAND · Fundación Diaconía FRIF-IFD
                </span>
              </button>
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
      />

      {/* Diálogo Universal de Marcación de Asistencia para Becarios */}
      <DialogoMarcacionAsistencia
        abierto={dialogo_asistencia_abierto}
        alCambiarAbierto={set_dialogo_asistencia_abierto}
      />
      {es_becario && (
        <DialogoDocumentosBecario
          abierto={dialogo_documentos_abierto}
          alCerrar={() => set_dialogo_documentos_abierto(false)}
          becario={{
            id: usuario?.becario_id || 1,
            nombre: usuario?.nombre || "Estudiante Becario",
            ci: "13696496",
            expedicion: "LP",
            carrera: "Estadística",
            universidad: "Universidad Mayor de San Andrés",
            ceti: 3,
          }}
        />
      )}
    </div>
  );
}
