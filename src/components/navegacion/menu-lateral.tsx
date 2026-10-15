"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Clock,
  Bus,
  Award,
  FileText,
  Bell,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Utensils,
} from "lucide-react";

interface ElementoNavegacion {
  id: string;
  etiqueta: string;
  descripcion?: string;
  icono: React.ElementType;
  badge?: string;
}

interface GrupoNavegacion {
  titulo: string;
  elementos: ElementoNavegacion[];
}

interface MenuLateralProps {
  pestaña_activa: string;
  alSeleccionarPestaña: (id: string) => void;
  usuario: {
    nombre: string;
    correo: string;
    rol: string;
    becario_id?: number | null;
  };
  cerrarSesion: () => void;
  colapsado: boolean;
  alAlternarColapso: () => void;
  menu_movil_abierto: boolean;
  alCerrarMenuMovil: () => void;
}

export function MenuLateral({
  pestaña_activa,
  alSeleccionarPestaña,
  usuario,
  cerrarSesion,
  colapsado,
  alAlternarColapso,
  menu_movil_abierto,
  alCerrarMenuMovil,
}: MenuLateralProps) {
  const rol = usuario.rol || "becario";
  const es_admin = rol === "administrador";
  const es_supervisor = rol === "supervisor";
  const es_becario = rol === "becario";

  // Cierre automático con tecla Escape si está descolapsado o abierto en móvil
  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (!colapsado) alAlternarColapso();
        if (menu_movil_abierto) alCerrarMenuMovil();
      }
    }
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [colapsado, menu_movil_abierto, alAlternarColapso, alCerrarMenuMovil]);

  // Grupos de navegación diferenciados según el rol institucional (RBAC)
  const grupos: GrupoNavegacion[] = es_becario
    ? [
        {
          titulo: "Mi Espacio",
          elementos: [
            {
              id: "resumen",
              etiqueta: "Mi Panel",
              descripcion: "Horas, viáticos y geocerca",
              icono: LayoutDashboard,
            },
            {
              id: "sedes",
              etiqueta: "Mi Sede",
              descripcion: "Ubicación y radio geodésico",
              icono: MapPin,
            },
          ],
        },
        {
          titulo: "Registros Diarios",
          elementos: [
            {
              id: "eventos",
              etiqueta: "Acciones de Servicio",
              descripcion: "Encuentros y geocercas",
              icono: CalendarDays,
              badge: "En Vivo",
            },
            {
              id: "asistencia",
              etiqueta: "Mis Horas y Asistencia",
              descripcion: "Historial y cómputo de horas",
              icono: Clock,
            },
            {
              id: "pasajes",
              etiqueta: "Mis Pasajes (80%)",
              descripcion: "Tramos urbanos e intermedios",
              icono: Bus,
              badge: "80%",
            },
            {
              id: "justificaciones",
              etiqueta: "Mis Justificaciones",
              descripcion: "Incidencias y permisos",
              icono: ClipboardCheck,
            },
            {
              id: "devocionales",
              etiqueta: "Mis Devocionales",
              descripcion: "Lectura bíblica y pastoral",
              icono: BookOpen,
            },
            {
              id: "evaluacion_360",
              etiqueta: "Mis Evaluaciones",
              descripcion: "5 módulos semestrales",
              icono: Award,
            },
          ],
        },
      ]
    : [
        {
          titulo: "Panel Principal",
          elementos: [
            {
              id: "administracion",
              etiqueta: es_admin ? "Dashboard General" : "Panel Supervisor",
              descripcion: es_admin ? "Métricas analíticas globales" : "Becarios asignados y horas",
              icono: LayoutDashboard,
            },
            {
              id: "becarios",
              etiqueta: es_admin ? "Directorio Becarios" : "Becarios Asignados",
              descripcion: "Expedientes y asignaciones",
              icono: Users,
            },
            {
              id: "sedes",
              etiqueta: "Sedes y Geocercas",
              descripcion: "72 sedes georreferenciadas",
              icono: MapPin,
            },
          ],
        },
        {
          titulo: "Seguimiento y Control",
          elementos: [
            {
              id: "eventos",
              etiqueta: "Acciones de Servicio",
              descripcion: "Convocatorias y geocercas WGS84",
              icono: CalendarDays,
              badge: "En Vivo",
            },
            {
              id: "justificaciones",
              etiqueta: "Bandeja Justificaciones",
              descripcion: "Incidencias, permisos y dictamen",
              icono: ClipboardCheck,
              badge: "Pendientes",
            },
            {
              id: "asistencia",
              etiqueta: "Control de Asistencia",
              descripcion: "Validación geodésica Haversine",
              icono: Clock,
            },
            {
              id: "pasajes",
              etiqueta: "Aprobación Pasajes",
              descripcion: "Liquidación exacta en centavos",
              icono: Bus,
              badge: "Reembolso",
            },
            {
              id: "devocionales",
              etiqueta: "Devocionales y Pastoral",
              descripcion: "Acompañamiento y retroalimentación",
              icono: BookOpen,
            },
            {
              id: "evaluacion_360",
              etiqueta: "Evaluación 360°",
              descripcion: "Mentor, F-03 y firma digital",
              icono: Award,
            },
            {
              id: "refrigerios",
              etiqueta: "Refrigerios Institucionales",
              descripcion: "Raciones y reposición",
              icono: Utensils,
              badge: "Diaconía",
            },
          ],
        },
        {
          titulo: "Informes y Documentos",
          elementos: [
            {
              id: "reportes",
              etiqueta: "Reportes PDF",
              descripcion: "Constancias e informes oficiales",
              icono: FileText,
            },
          ],
        },
      ];

  const contenido_menu = (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-[#E3DCCB]/70 select-none">
      {/* 1. Encabezado del Menú con Marca BUMAND */}
      <div className={`h-16 flex items-center border-b border-[#E3DCCB]/60 bg-transparent ${colapsado ? "justify-center px-2" : "justify-between px-4"}`}>
        {colapsado ? (
          <div className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={alAlternarColapso}
              className="p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group flex items-center justify-center"
              title="Expandir menú lateral"
            >
              <img
                src="/logos/logo-bumand-icono.svg"
                alt="BUMAND"
                className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
              />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/logos/logo-bumand.svg"
              alt="BUMAND"
              className="h-9 w-auto object-contain shrink-0"
            />
            <img
              src="/logos/logo-diaconia.svg"
              alt="Diaconía IFD"
              className="h-5 w-auto object-contain opacity-80 shrink-0"
            />
          </div>
        )}

        {/* Botón de colapso en escritorio cuando está expandido */}
        {!colapsado && (
          <button
            onClick={alAlternarColapso}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-[#E3DCCB] items-center justify-center text-[#5B6D77] hover:text-[#063A6B] hover:bg-[#F0F4F8] transition-colors"
            title="Colapsar menú lateral"
            type="button"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Botón flotante circular en el borde cuando está colapsado (evita colisiones al 100%) */}
        {colapsado && (
          <button
            onClick={alAlternarColapso}
            className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-[#E3DCCB] shadow-md items-center justify-center text-[#063A6B] hover:bg-slate-50 hover:scale-110 transition-all z-50 cursor-pointer"
            title="Expandir menú lateral"
            type="button"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Botón de cierre en móvil */}
        <button
          onClick={alCerrarMenuMovil}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#5B6D77] hover:bg-slate-100"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Lista de Grupos y Enlaces */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 relative z-10">
        {grupos.map((grupo, indice_grupo) => (
          <div key={indice_grupo} className="space-y-1">
            {!colapsado && (
              <p className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                {grupo.titulo}
              </p>
            )}
            <div className="space-y-0.5">
              {grupo.elementos.map((elem) => {
                const Icono = elem.icono;
                const esta_activo = pestaña_activa === elem.id;

                return (
                  <button
                    key={elem.id}
                    type="button"
                    onClick={() => {
                      alSeleccionarPestaña(elem.id);
                      alCerrarMenuMovil();
                      if (!colapsado) {
                        alAlternarColapso();
                      }
                    }}
                    title={colapsado ? elem.etiqueta : undefined}
                    className={`group relative w-full flex items-center gap-2.5 rounded-xl transition-all duration-150 ${
                      colapsado ? "justify-center p-2.5" : "px-3 py-2 text-left"
                    } ${
                      esta_activo
                        ? "bg-[#063A6B] text-white shadow-xs font-bold"
                        : "text-[#475569] hover:bg-[#F0F4F8] hover:text-[#063A6B] font-medium"
                    }`}
                  >
                    {/* Indicador lateral sutil de item activo */}
                    {esta_activo && !colapsado && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#17B4C4] rounded-r-full" />
                    )}

                    <Icono
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        esta_activo
                          ? "text-[#F8C766]"
                          : "text-[#5B6D77] group-hover:text-[#063A6B]"
                      }`}
                    />

                    {!colapsado && (
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                        <span className="text-xs truncate">{elem.etiqueta}</span>
                        {elem.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                              esta_activo
                                ? "bg-[#17B4C4] text-[#063A6B] font-bold"
                                : "bg-slate-100 text-slate-600 font-semibold"
                            }`}
                          >
                            {elem.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Pie del Menú Lateral (Perfil, Cerrar Sesión y Estado) */}
      <div className="p-2.5 border-t border-[#E3DCCB]/80 bg-white/50 backdrop-blur-xs space-y-2 relative z-10">
        {/* Tarjeta del Usuario Activo */}
        {colapsado ? (
          <div className="flex flex-col items-center py-1">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#063A6B] to-[#0A4F8F] text-[#F8C766] font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-[#17B4C4]/50 transition-all"
              title={`${usuario.nombre} (${usuario.correo})`}
            >
              {usuario.nombre.charAt(0)}
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-white border border-[#E3DCCB]/70 shadow-2xs flex items-center gap-2.5 hover:border-[#17B4C4]/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#063A6B] to-[#0A4F8F] text-[#F8C766] font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {usuario.nombre.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {es_admin && <ShieldCheck className="w-3.5 h-3.5 text-[#063A6B] shrink-0" />}
                {es_supervisor && <UserCheck className="w-3.5 h-3.5 text-[#17B4C4] shrink-0" />}
                {es_becario && <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <p className="text-xs font-bold text-[#063A6B] truncate leading-tight">
                  {usuario.nombre}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-foreground truncate font-mono">
                  {usuario.correo}
                </span>
              </div>
            </div>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              title="Cerrar sesión corporativa"
              className={`w-full border-[#E3DCCB] text-[#E2694B] hover:bg-[#E2694B]/10 hover:text-[#E2694B] font-bold text-xs rounded-xl transition-colors ${
                colapsado ? "px-0 justify-center h-9" : "justify-center gap-2 h-9"
              }`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!colapsado && <span>Cerrar Sesión</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-[#E2694B]" />
                ¿Cerrar sesión institucional?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Se finalizará la sesión de <strong>{usuario.nombre}</strong> ({usuario.rol}). Deberá autenticarse nuevamente con sus credenciales de Diaconía para acceder.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Permanecer</AlertDialogCancel>
              <AlertDialogAction
                onClick={cerrarSesion}
                className="bg-[#E2694B] hover:bg-[#E2694B]/90 text-white font-bold"
              >
                Cerrar Sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!colapsado && (
          <div className="flex items-center justify-between px-1.5 pt-0.5 text-[10px] font-mono text-muted-foreground/80">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-600">API Conectada</span>
            </div>
            <span>v1.0.0</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Contenedor Base Fijo para Escritorio (lg+): siempre reserva exactamente 72px para no alterar el layout */}
      <div className="hidden lg:block relative shrink-0 w-[72px] h-screen select-none">
        {/* Oscurecimiento ligero en la parte trasera cuando está descolapsado */}
        {!colapsado && (
          <div
            className="fixed inset-0 bg-slate-900/25 backdrop-blur-[1px] z-40 transition-opacity animate-in fade-in duration-200"
            onClick={alAlternarColapso}
            aria-label="Cerrar menú lateral expandido"
          />
        )}

        {/* Menú Lateral que se expande por encima sin desplazar el layout */}
        <aside
          className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50 bg-transparent ${
            colapsado
              ? "w-[72px] border-r border-[#E3DCCB]/70"
              : "w-64 shadow-2xl shadow-slate-950/25 border-r border-[#E3DCCB]/70"
          }`}
        >
          {contenido_menu}
        </aside>
      </div>

      {/* Menú Desplegable Tipo Drawer para Móvil y Tablet */}
      {menu_movil_abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fondo semitransparente */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={alCerrarMenuMovil}
          />
          {/* Panel Lateral */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {contenido_menu}
          </div>
        </div>
      )}
    </>
  );
}
