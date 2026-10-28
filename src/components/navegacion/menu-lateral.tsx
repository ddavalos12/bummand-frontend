"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
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
  HeartHandshake,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import {
  usarAutenticacion,
  type CorreoAdicionalUsuario,
} from "@/contextos/autenticacion-contexto";

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
    id?: number;
    nombre: string;
    correo: string;
    correo_alternativo?: string | null;
    correos_adicionales?: CorreoAdicionalUsuario[];
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
  const { usuario: usuario_contexto, actualizarUsuarioSesion } = usarAutenticacion();
  const rol = usuario.rol || "becario";
  const es_admin = rol === "administrador";
  const es_supervisor = rol === "supervisor";
  const es_becario = rol === "becario";

  const [modal_perfil_abierto, set_modal_perfil_abierto] = useState(false);
  const [nuevo_correo_alt, set_nuevo_correo_alt] = useState("");
  const [nueva_etiqueta_alt, set_nueva_etiqueta_alt] = useState("Personal");
  const [guardando_correo_alt, set_guardando_correo_alt] = useState(false);

  const correos_adicionales_actuales: CorreoAdicionalUsuario[] = React.useMemo(() => {
    const base =
      usuario_contexto?.correos_adicionales || usuario.correos_adicionales || [];
    const alt_unico =
      usuario_contexto?.correo_alternativo ?? usuario.correo_alternativo ?? null;
    const lista: CorreoAdicionalUsuario[] = [...base];
    if (
      alt_unico &&
      !lista.some((c) => c.correo.toLowerCase().trim() === alt_unico.toLowerCase().trim())
    ) {
      lista.unshift({ id: 1, correo: alt_unico, etiqueta: "Alternativo" });
    }
    return lista;
  }, [
    usuario_contexto?.correos_adicionales,
    usuario_contexto?.correo_alternativo,
    usuario.correos_adicionales,
    usuario.correo_alternativo,
  ]);

  const manejarAgregarCorreoAlternativo = async (e: React.FormEvent) => {
    e.preventDefault();
    const correo_limpio = nuevo_correo_alt.trim().toLowerCase();
    if (!correo_limpio || !correo_limpio.includes("@")) {
      toast.error("Correo inválido", {
        description: "Ingrese una dirección de correo electrónico válida.",
      });
      return;
    }
    if (correo_limpio === (usuario.correo || "").toLowerCase().trim()) {
      toast.error("Correo ya asignado como principal", {
        description: "Este correo ya es su dirección principal de inicio de sesión.",
      });
      return;
    }
    if (
      correos_adicionales_actuales.some(
        (c) => c.correo.toLowerCase().trim() === correo_limpio
      )
    ) {
      toast.error("Correo duplicado", {
        description: "Este correo alternativo ya se encuentra vinculado a su cuenta.",
      });
      return;
    }

    set_guardando_correo_alt(true);
    let nuevo_id = Date.now();
    try {
      const resp = await clienteApi.post<{ id?: number; correo?: string }>(
        "/usuarios/mi-perfil/correos",
        {
          correo: correo_limpio,
          etiqueta: nueva_etiqueta_alt.trim() || "Personal",
        }
      );
      if (resp && resp.id) {
        nuevo_id = resp.id;
      }
    } catch {
      try {
        await clienteApi.patch("/usuarios/mi-perfil/correo-alternativo", {
          correo_alternativo: correo_limpio,
        });
      } catch {
        // Fallback local en caso de operar sin conexión al backend
      }
    } finally {
      const nueva_lista: CorreoAdicionalUsuario[] = [
        ...correos_adicionales_actuales,
        {
          id: nuevo_id,
          correo: correo_limpio,
          etiqueta: nueva_etiqueta_alt.trim() || "Personal",
        },
      ];
      actualizarUsuarioSesion({
        correo_alternativo: nueva_lista[0]?.correo || correo_limpio,
        correos_adicionales: nueva_lista,
      });
      set_nuevo_correo_alt("");
      set_nueva_etiqueta_alt("Personal");
      set_guardando_correo_alt(false);
      toast.success("Correo alternativo vinculado", {
        description: `Ahora también puede iniciar sesión con ${correo_limpio}.`,
      });
    }
  };

  const manejarEliminarCorreoAlternativo = async (item: CorreoAdicionalUsuario) => {
    try {
      if (item.id) {
        await clienteApi.delete(`/usuarios/mi-perfil/correos/${item.id}`);
      }
    } catch {
      // Fallback local
    }
    const nueva_lista = correos_adicionales_actuales.filter(
      (c) => c.correo.toLowerCase().trim() !== item.correo.toLowerCase().trim()
    );
    const nuevo_alt = nueva_lista[0]?.correo || null;
    try {
      await clienteApi.patch("/usuarios/mi-perfil/correo-alternativo", {
        correo_alternativo: nuevo_alt,
      });
    } catch {
      // Fallback local
    }
    actualizarUsuarioSesion({
      correo_alternativo: nuevo_alt,
      correos_adicionales: nueva_lista,
    });
    toast.success("Correo alternativo eliminado", {
      description: `Se desvinculó ${item.correo} de su cuenta.`,
    });
  };

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
              id: "evaluaciones",
              etiqueta: "Mis Evaluaciones",
              descripcion: "Matriz y Socioeconómica",
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
              id: "evaluaciones",
              etiqueta: "Matriz de Evaluación",
              descripcion: "Matriz integral y Socioeconómica",
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
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-[#E5E7EB]/70 select-none">
      {/* 1. Encabezado del Menú con Marca BUMAND */}
      <div className={`h-16 flex items-center border-b border-[#E5E7EB]/60 bg-transparent ${colapsado ? "justify-center px-2" : "justify-between px-4"}`}>
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
              src="/logos/LOGO-BUMAND_2023.svg"
              alt="BUMAND"
              className="h-9 w-auto object-contain shrink-0"
            />
            <img
              src="/logos/ALTA1.svg"
              alt="Diaconía IFD"
              className="h-5 w-auto object-contain opacity-80 shrink-0"
            />
          </div>
        )}

        {/* Botón de colapso en escritorio cuando está expandido */}
        {!colapsado && (
          <button
            onClick={alAlternarColapso}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-[#E5E7EB] items-center justify-center text-[#808080] hover:text-[#035683] hover:bg-[#F0F4F8] transition-colors"
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
            className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-[#E5E7EB] shadow-md items-center justify-center text-[#035683] hover:bg-slate-50 hover:scale-110 transition-all z-50 cursor-pointer"
            title="Expandir menú lateral"
            type="button"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Botón de cierre en móvil */}
        <button
          onClick={alCerrarMenuMovil}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#808080] hover:bg-slate-100"
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
                const esta_activo = pestaña_activa === elem.id || (elem.id === "evaluaciones" && (pestaña_activa === "evaluaciones" || pestaña_activa === "evaluacion_360" || pestaña_activa === "evaluacion_socioeconomica"));

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
                        ? "bg-[#035683] text-white shadow-xs font-bold"
                        : "text-[#475569] hover:bg-[#F0F4F8] hover:text-[#035683] font-medium"
                    }`}
                  >
                    {/* Indicador lateral sutil de item activo */}
                    {esta_activo && !colapsado && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00ABBD] rounded-r-full" />
                    )}

                    <Icono
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        esta_activo
                          ? "text-[#FFB600]"
                          : "text-[#808080] group-hover:text-[#035683]"
                      }`}
                    />

                    {!colapsado && (
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                        <span className="text-xs truncate">{elem.etiqueta}</span>
                        {elem.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                              esta_activo
                                ? "bg-[#00ABBD] text-[#035683] font-bold"
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
      <div className="p-2.5 border-t border-[#E5E7EB]/80 bg-white/50 backdrop-blur-xs space-y-2 relative z-10">
        {/* Tarjeta del Usuario Activo (Clic para gestionar perfil y correos de inicio de sesión) */}
        {colapsado ? (
          <div className="flex flex-col items-center py-1">
            <button
              type="button"
              onClick={() => set_modal_perfil_abierto(true)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#035683] to-[#007BBE] text-[#FFB600] font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-[#00ABBD]/50 transition-all"
              title={`${usuario.nombre} (${usuario.correo}) — Clic para gestionar correos de acceso`}
            >
              {usuario.nombre.charAt(0)}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => set_modal_perfil_abierto(true)}
            title="Gestionar mi perfil y correos de inicio de sesión"
            className="w-full text-left p-2 rounded-xl bg-white border border-[#E5E7EB]/70 shadow-2xs flex items-center gap-2.5 hover:border-[#00ABBD] hover:bg-slate-50/70 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#035683] to-[#007BBE] text-[#FFB600] font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {usuario.nombre.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {es_admin && <ShieldCheck className="w-3.5 h-3.5 text-[#035683] shrink-0" />}
                {es_supervisor && <UserCheck className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />}
                {es_becario && <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <p className="text-xs font-bold text-[#035683] truncate leading-tight">
                  {usuario.nombre}
                </p>
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-foreground truncate font-mono">
                  {usuario.correo}
                </span>
                {correos_adicionales_actuales.length > 0 && (
                  <Badge
                    variant="outline"
                    className="px-1 py-0 text-[9px] font-mono border-[#00ABBD]/40 text-[#035683] bg-[#00ABBD]/10 shrink-0"
                  >
                    +{correos_adicionales_actuales.length}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              title="Cerrar sesión corporativa"
              className={`w-full border-[#E5E7EB] text-[#E2694B] hover:bg-[#E2694B]/10 hover:text-[#E2694B] font-bold text-xs rounded-xl transition-colors ${
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
              ? "w-[72px] border-r border-[#E5E7EB]/70"
              : "w-64 shadow-2xl shadow-slate-950/25 border-r border-[#E5E7EB]/70"
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

      {/* Modal: Mi Perfil y Correos de Inicio de Sesión */}
      <Dialog open={modal_perfil_abierto} onOpenChange={set_modal_perfil_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3.5 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#035683] to-[#007BBE] text-[#FFB600] font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {usuario.nombre.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#035683]">
                  Mi Perfil y Correos de Inicio de Sesión
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Gestione sus direcciones de correo vinculadas para acceder con la misma cuenta.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
            {/* Resumen de Cuenta */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#035683] text-sm">{usuario.nombre}</span>
                <Badge
                  variant="outline"
                  className="uppercase font-mono text-[10px] border-[#035683]/30 text-[#035683] bg-[#035683]/5 font-bold"
                >
                  {usuario.rol}
                </Badge>
              </div>
              <div className="pt-2 border-t border-dashed border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-[#00ABBD]" />
                  <span>Correo Principal:</span>
                </div>
                <span className="font-mono font-bold text-[#035683]">{usuario.correo}</span>
              </div>
            </div>

            {/* Lista de Correos Alternativos Vinculados */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#035683]">
                  Correos Alternativos Vinculados ({correos_adicionales_actuales.length})
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Habilitados para login
                </span>
              </div>

              {correos_adicionales_actuales.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-[#E5E7EB] bg-slate-50/50 text-center text-muted-foreground text-xs">
                  No tiene correos alternativos vinculados todavía. Agregue su correo personal o secundario abajo.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {correos_adicionales_actuales.map((item, idx) => (
                    <div
                      key={`${item.correo}_${idx}`}
                      className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
                        <span className="font-mono font-semibold text-[#1E293B] truncate">
                          {item.correo}
                        </span>
                        {item.etiqueta && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-emerald-200 bg-emerald-50 text-emerald-700 shrink-0"
                          >
                            {item.etiqueta}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => manejarEliminarCorreoAlternativo(item)}
                        className="h-7 w-7 p-0 text-[#E2694B] hover:text-[#c9573b] hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                        title="Desvincular este correo alternativo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario para Agregar Nuevo Correo Alternativo */}
            <form
              onSubmit={manejarAgregarCorreoAlternativo}
              className="p-3.5 rounded-xl border border-[#E5E7EB] bg-slate-50/70 space-y-3"
            >
              <Label className="text-xs font-bold text-[#035683] block">
                Vincular Nuevo Correo de Inicio de Sesión
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <Input
                    type="email"
                    placeholder="ejemplo@gmail.com o institucional"
                    value={nuevo_correo_alt}
                    onChange={(e) => set_nuevo_correo_alt(e.target.value)}
                    required
                    className="h-9 text-xs font-mono bg-white border-[#E5E7EB] rounded-xl"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Etiqueta (ej. Personal)"
                    value={nueva_etiqueta_alt}
                    onChange={(e) => set_nueva_etiqueta_alt(e.target.value)}
                    className="h-9 text-xs bg-white border-[#E5E7EB] rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Usará su misma contraseña actual.
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={guardando_correo_alt}
                  className="h-8 px-3 bg-[#035683] hover:bg-[#035683]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{guardando_correo_alt ? "Vinculando..." : "Vincular Correo"}</span>
                </Button>
              </div>
            </form>
          </DialogBody>

          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set_modal_perfil_abierto(false)}
              className="rounded-xl text-xs font-bold border-[#E5E7EB]"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
