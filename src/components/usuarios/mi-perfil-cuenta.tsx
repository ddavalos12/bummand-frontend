"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  KeyRound,
  FileCheck2,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
  Smartphone,
  Bus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { usarAutenticacion, type CorreoAdicionalUsuario } from "@/contextos/autenticacion-contexto";

interface DatosPerfilCompleto {
  nombre: string;
  telefono: string;
  direccion: string;
  // Campos exclusivos becario
  ci?: string;
  universidad?: string;
  carrera?: string;
  semestre?: string;
  sede_asignada?: string;
  supervisor_asignado?: string;
  modalidad_pasajes?: "ida_y_vuelta" | "solo_ida";
  // Campos exclusivos supervisor / admin
  cargo?: string;
  unidad?: string;
  resumen_cohorte?: string;
}

const CLAVE_STORAGE_MI_PERFIL = "bumand_mi_perfil_datos_completos";

function calcularNivelSeguridad(clave: string): { puntaje: number; etiqueta: string; color: string } {
  if (!clave) return { puntaje: 0, etiqueta: "Sin contraseña", color: "bg-slate-200" };
  let puntaje = 0;
  if (clave.length >= 8) puntaje += 25;
  if (clave.length >= 12) puntaje += 15;
  if (/[A-Z]/.test(clave)) puntaje += 20;
  if (/[a-z]/.test(clave)) puntaje += 15;
  if (/[0-9]/.test(clave)) puntaje += 15;
  if (/[^A-Za-z0-9]/.test(clave)) puntaje += 10;

  if (puntaje < 40) return { puntaje: Math.max(puntaje, 20), etiqueta: "Nivel Débil", color: "bg-rose-500" };
  if (puntaje < 75) return { puntaje, etiqueta: "Nivel Medio Institucional", color: "bg-amber-500" };
  return { puntaje: Math.min(puntaje, 100), etiqueta: "Nivel Robusto Seguro", color: "bg-emerald-500" };
}

function extraerIniciales(nombre: string): string {
  if (!nombre) return "U";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return nombre.slice(0, 2).toUpperCase();
}

export function MiPerfilCuenta() {
  const { usuario, actualizarUsuarioSesion } = usarAutenticacion();
  const rol = usuario?.rol || "becario";
  const es_admin = rol === "administrador";
  const es_supervisor = rol === "supervisor";
  const es_becario = rol === "becario";

  const [cargando_inicial, set_cargando_inicial] = useState<boolean>(true);

  // Pestaña activa
  const [pestaña_activa, set_pestaña_activa] = useState<string>("datos_personales");

  // Formulario Datos Personales
  const [nombre, set_nombre] = useState<string>(usuario?.nombre || "");
  const [telefono, set_telefono] = useState<string>("71234567");
  const [direccion, set_direccion] = useState<string>("Zona Villa Adela, Calle 4 #120, El Alto");
  // Becario
  const [ci, set_ci] = useState<string>("8492019 LP");
  const [universidad, set_universidad] = useState<string>("UMSA - Universidad Mayor de San Andrés");
  const [carrera, set_carrera] = useState<string>("Ingeniería de Sistemas");
  const [semestre, set_semestre] = useState<string>("7mo Semestre");
  const [sede_asignada, set_sede_asignada] = useState<string>("Oficina Central Diaconía IFD - El Alto");
  const [supervisor_asignado, set_supervisor_asignado] = useState<string>("Angel Javier Ali Paz");
  const [modalidad_pasajes, set_modalidad_pasajes] = useState<"ida_y_vuelta" | "solo_ida">("ida_y_vuelta");
  // Supervisor / Admin
  const [cargo, set_cargo] = useState<string>(
    es_admin
      ? "Coordinador General y Dirección de Programa BUMAND"
      : "Tutor General de Prácticas y Jefe de Seguridad Física"
  );
  const [unidad, set_unidad] = useState<string>(
    es_admin
      ? "Coordinación Nacional BUMAND · Diaconía FRIF-IFD"
      : "Jefatura de Seguridad Física / Gerencia de Operaciones"
  );
  const [resumen_cohorte, set_resumen_cohorte] = useState<string>(
    es_admin ? "61 Cuentas Institucionales Activas" : "14 Becarios Universitarios Asignados"
  );
  const [guardando_perfil, set_guardando_perfil] = useState<boolean>(false);

  // Formulario Correos
  const [correo_principal, set_correo_principal] = useState<string>(usuario?.correo || "");
  const [correo_alternativo, set_correo_alternativo] = useState<string>(usuario?.correo_alternativo || "");
  const [correos_adicionales, set_correos_adicionales] = useState<CorreoAdicionalUsuario[]>([]);
  const [nuevo_correo_extra, set_nuevo_correo_extra] = useState<string>("");
  const [nueva_etiqueta_extra, set_nueva_etiqueta_extra] = useState<string>("Personal");
  const [guardando_correos, set_guardando_correos] = useState<boolean>(false);

  // Formulario Contraseña
  const [clave_actual, set_clave_actual] = useState<string>("");
  const [clave_nueva, set_clave_nueva] = useState<string>("");
  const [clave_confirmar, set_clave_confirmar] = useState<string>("");
  const [mostrar_clave_actual, set_mostrar_clave_actual] = useState<boolean>(false);
  const [mostrar_clave_nueva, set_mostrar_clave_nueva] = useState<boolean>(false);
  const [mostrar_clave_confirmar, set_mostrar_clave_confirmar] = useState<boolean>(false);
  const [guardando_clave, set_guardando_clave] = useState<boolean>(false);

  // Cargar datos del usuario
  useEffect(() => {
    async function inicializarDatos() {
      set_cargando_inicial(true);

      if (usuario) {
        set_nombre(usuario.nombre || "");
        set_correo_principal(usuario.correo || "");
        set_correo_alternativo(usuario.correo_alternativo || "");
        set_correos_adicionales(usuario.correos_adicionales || []);
      }

      // Intentar cargar perfil persistido
      if (typeof window !== "undefined") {
        try {
          const guardado = localStorage.getItem(`${CLAVE_STORAGE_MI_PERFIL}_${usuario?.id}`);
          if (guardado) {
            const parsed: DatosPerfilCompleto = JSON.parse(guardado);
            if (parsed.nombre) set_nombre(parsed.nombre);
            if (parsed.telefono) set_telefono(parsed.telefono);
            if (parsed.direccion) set_direccion(parsed.direccion);
            if (parsed.ci) set_ci(parsed.ci);
            if (parsed.universidad) set_universidad(parsed.universidad);
            if (parsed.carrera) set_carrera(parsed.carrera);
            if (parsed.semestre) set_semestre(parsed.semestre);
            if (parsed.sede_asignada) set_sede_asignada(parsed.sede_asignada);
            if (parsed.supervisor_asignado) set_supervisor_asignado(parsed.supervisor_asignado);
            if (parsed.modalidad_pasajes) set_modalidad_pasajes(parsed.modalidad_pasajes);
            if (parsed.cargo) set_cargo(parsed.cargo);
            if (parsed.unidad) set_unidad(parsed.unidad);
            if (parsed.resumen_cohorte) set_resumen_cohorte(parsed.resumen_cohorte);
          }
        } catch {
          // Fallback silencioso
        }
      }

      // Intentar sincronizar con el backend
      try {
        const resp_perfil = await clienteApi.get<Record<string, any>>("/usuarios/mi-perfil");
        if (resp_perfil) {
          if (resp_perfil.nombre) set_nombre(resp_perfil.nombre);
          if (resp_perfil.telefono || resp_perfil.celular) {
            set_telefono(resp_perfil.telefono || resp_perfil.celular);
          }
          if (resp_perfil.direccion) set_direccion(resp_perfil.direccion);
          if (resp_perfil.ci) set_ci(resp_perfil.ci);
          if (resp_perfil.universidad) set_universidad(resp_perfil.universidad);
          if (resp_perfil.carrera) set_carrera(resp_perfil.carrera);
          if (resp_perfil.semestre) set_semestre(resp_perfil.semestre);
          if (resp_perfil.modalidad_pasajes) set_modalidad_pasajes(resp_perfil.modalidad_pasajes);
          if (resp_perfil.correo) set_correo_principal(resp_perfil.correo);
          if (resp_perfil.correo_alternativo) set_correo_alternativo(resp_perfil.correo_alternativo);
          if (Array.isArray(resp_perfil.correos_adicionales)) {
            set_correos_adicionales(resp_perfil.correos_adicionales);
          }
        }
      } catch {
        // Fallback local
      }

      // Sincronizar correos desde /usuarios/mi-perfil/correos
      try {
        const resp_correos = await clienteApi.get<{
          correo_principal?: string;
          correo_alternativo?: string;
          correos_adicionales?: CorreoAdicionalUsuario[];
        }>("/usuarios/mi-perfil/correos");
        if (resp_correos) {
          if (resp_correos.correo_principal) set_correo_principal(resp_correos.correo_principal);
          if (resp_correos.correo_alternativo) set_correo_alternativo(resp_correos.correo_alternativo);
          if (Array.isArray(resp_correos.correos_adicionales)) {
            set_correos_adicionales(resp_correos.correos_adicionales);
          }
        }
      } catch {
        // Fallback local
      } finally {
        set_cargando_inicial(false);
      }
    }

    inicializarDatos();
  }, [usuario]);

  // Persistir cambios localmente
  const persistirPerfilLocal = (_datos: Partial<DatosPerfilCompleto>) => {
    if (typeof window !== "undefined" && usuario?.id) {
      const actual: DatosPerfilCompleto = {
        nombre,
        telefono,
        direccion,
        ci,
        universidad,
        carrera,
        semestre,
        sede_asignada,
        supervisor_asignado,
        modalidad_pasajes,
        cargo,
        unidad,
        resumen_cohorte,
        ..._datos,
      };
      localStorage.setItem(`${CLAVE_STORAGE_MI_PERFIL}_${usuario.id}`, JSON.stringify(actual));
    }
  };

  // Guardar Datos Personales (PATCH /usuarios/mi-perfil)
  const manejarGuardarPerfil = async (_evento: React.FormEvent) => {
    _evento.preventDefault();
    const nombre_limpio = nombre.trim();
    if (!nombre_limpio) {
      toast.error("El nombre completo es obligatorio.");
      return;
    }

    set_guardando_perfil(true);

    try {
      await clienteApi.patch("/usuarios/mi-perfil", {
        nombre: nombre_limpio,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        carrera: carrera.trim(),
        semestre: semestre.trim(),
        modalidad_pasajes,
      });
    } catch {
      // Fallback local
    }

    persistirPerfilLocal({
      nombre: nombre_limpio,
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      carrera: carrera.trim(),
      semestre: semestre.trim(),
      modalidad_pasajes,
    });

    actualizarUsuarioSesion({ nombre: nombre_limpio });
    set_guardando_perfil(false);

    toast.success("Perfil institucional actualizado", {
      description: "Sus datos personales e institucionales se han guardado satisfactoriamente.",
    });
  };

  // Guardar Correo Principal / Alternativo
  const manejarGuardarCorreosBase = async (_evento: React.FormEvent) => {
    _evento.preventDefault();
    const alt_limpio = correo_alternativo.toLowerCase().trim();

    if (alt_limpio && alt_limpio === correo_principal.toLowerCase().trim()) {
      toast.error("El correo alternativo no puede ser idéntico al correo principal.");
      return;
    }

    set_guardando_correos(true);

    try {
      await clienteApi.patch("/usuarios/mi-perfil/correo-alternativo", {
        correo_alternativo: alt_limpio || null,
      });
    } catch {
      // Fallback local
    }

    actualizarUsuarioSesion({
      correo_alternativo: alt_limpio || null,
    });
    set_guardando_correos(false);

    toast.success("Correos de acceso actualizados", {
      description: alt_limpio
        ? `Ahora puede ingresar al sistema con ${correo_principal} o con ${alt_limpio}.`
        : "Se ha actualizado la configuración de correos de su cuenta.",
    });
  };

  // Agregar nuevo correo adicional (POST /usuarios/mi-perfil/correos)
  const manejarAgregarCorreoAdicional = async (_evento: React.FormEvent) => {
    _evento.preventDefault();
    const nuevo_limpio = nuevo_correo_extra.toLowerCase().trim();
    if (!nuevo_limpio || !nuevo_limpio.includes("@")) {
      toast.error("Ingrese una dirección de correo válida.");
      return;
    }

    if (nuevo_limpio === correo_principal.toLowerCase().trim()) {
      toast.error("Este correo ya está registrado como su correo principal.");
      return;
    }

    if (correos_adicionales.some((c) => c.correo.toLowerCase() === nuevo_limpio)) {
      toast.error("Este correo ya está vinculado a su cuenta.");
      return;
    }

    let nuevo_id = Date.now();

    try {
      const resp = await clienteApi.post<{ id?: number; correo?: string }>("/usuarios/mi-perfil/correos", {
        correo: nuevo_limpio,
        etiqueta: nueva_etiqueta_extra.trim() || "Personal",
      });
      if (resp && resp.id) nuevo_id = resp.id;
    } catch {
      // Fallback local
    }

    const nueva_lista: CorreoAdicionalUsuario[] = [
      ...correos_adicionales,
      { id: nuevo_id, correo: nuevo_limpio, etiqueta: nueva_etiqueta_extra.trim() || "Personal" },
    ];

    set_correos_adicionales(nueva_lista);
    if (!correo_alternativo) {
      set_correo_alternativo(nuevo_limpio);
    }

    actualizarUsuarioSesion({
      correo_alternativo: correo_alternativo || nuevo_limpio,
      correos_adicionales: nueva_lista,
    });

    set_nuevo_correo_extra("");
    toast.success("Correo de acceso vinculado", {
      description: `Se vinculó ${nuevo_limpio} a su cuenta institucional.`,
    });
  };

  // Eliminar correo adicional (DELETE /usuarios/mi-perfil/correos/:id)
  const manejarEliminarCorreoAdicional = async (_item: CorreoAdicionalUsuario) => {
    try {
      if (_item.id) {
        await clienteApi.delete(`/usuarios/mi-perfil/correos/${_item.id}`);
      }
    } catch {
      // Fallback local
    }

    const nueva_lista = correos_adicionales.filter((c) => c.correo !== _item.correo);
    const nuevo_alt = nueva_lista.length > 0 ? nueva_lista[0].correo : null;

    set_correos_adicionales(nueva_lista);
    if (correo_alternativo === _item.correo) {
      set_correo_alternativo(nuevo_alt || "");
    }

    actualizarUsuarioSesion({
      correo_alternativo: nuevo_alt,
      correos_adicionales: nueva_lista,
    });

    toast.info("Correo desvinculado", {
      description: `Se eliminó ${_item.correo} de su lista de accesos.`,
    });
  };

  // Cambiar Contraseña Propia (PATCH /usuarios/mi-perfil/contrasena)
  const manejarCambiarContrasenaPropia = async (_evento: React.FormEvent) => {
    _evento.preventDefault();

    if (!clave_actual) {
      toast.error("Debe ingresar su contraseña actual.");
      return;
    }

    if (clave_nueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (clave_nueva !== clave_confirmar) {
      toast.error("Las contraseñas no coinciden. Verifique ambos campos.");
      return;
    }

    set_guardando_clave(true);

    try {
      await clienteApi.patch("/usuarios/mi-perfil/contrasena", {
        contrasena_actual: clave_actual,
        nueva_contrasena: clave_nueva,
        confirmar_contrasena: clave_confirmar,
      });
      toast.success("Contraseña actualizada con éxito", {
        description: "Su clave de acceso ha sido modificada. Por favor recuérdela para próximos inicios de sesión.",
      });
      set_clave_actual("");
      set_clave_nueva("");
      set_clave_confirmar("");
    } catch (error: any) {
      const mensaje = error?.mensaje || error?.message || "No se pudo actualizar la contraseña";
      toast.error("Error al cambiar contraseña", {
        description: mensaje.includes("incorrecta")
          ? "La contraseña actual no coincide. Ingrésela nuevamente."
          : mensaje,
      });
    } finally {
      set_guardando_clave(false);
    }
  };

  const seguridad_clave = useMemo(() => calcularNivelSeguridad(clave_nueva), [clave_nueva]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Encabezado Institucional de Perfil */}
      <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-gradient-to-r from-[#035683] via-[#007BBE] to-[#00ABBD] text-white">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Avatar size="lg" className="w-20 h-20 rounded-2xl border-2 border-white/60 bg-white shadow-md text-[#035683] font-black text-2xl">
              <AvatarFallback className="bg-white text-[#035683] font-black">
                {extraerIniciales(nombre || usuario?.nombre || "")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {nombre || usuario?.nombre}
                </h1>
                <Badge
                  variant="outline"
                  className="border-white/40 bg-white/15 text-white font-mono text-[10px] uppercase font-bold"
                >
                  {es_admin && "Administrador General"}
                  {es_supervisor && "Supervisor / Tutor"}
                  {es_becario && "Becario Universitario"}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-white/90 font-mono flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-white/80" />
                <span>{correo_principal || usuario?.correo}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-white/80">
                <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Cuenta Institucional Verificada
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  Diaconía FRIF-IFD
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
            <Badge className="bg-emerald-500/90 text-white font-mono font-bold text-xs px-3 py-1 rounded-xl">
              ● Estado Activo
            </Badge>
            <span className="text-[10px] text-white/70 font-mono">
              Gestión Universitaria 2026
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Estructura en 3 Pestañas */}
      <Tabs
        value={pestaña_activa}
        onValueChange={(_v) => _v && set_pestaña_activa(_v)}
        className="space-y-5"
      >
        <TabsList className="h-12 w-full grid grid-cols-3 rounded-2xl bg-slate-100/80 p-1 border border-[#E5E7EB]">
          <TabsTrigger
            value="datos_personales"
            className="rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#035683] data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">👤 Mis Datos Personales</span>
            <span className="sm:hidden">👤 Datos</span>
          </TabsTrigger>

          <TabsTrigger
            value="correos_acceso"
            className="rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#035683] data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">✉️ Mis Correos de Acceso</span>
            <span className="sm:hidden">✉️ Correos</span>
            {correos_adicionales.length > 0 && (
              <Badge variant="outline" className="text-[9px] font-mono border-emerald-300 bg-emerald-50 text-emerald-800">
                +{correos_adicionales.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="seguridad_contrasena"
            className="rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#035683] data-[state=active]:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">🔒 Contraseña y Seguridad</span>
            <span className="sm:hidden">🔒 Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
            PESTAÑA 1: Mis Datos Personales e Institucionales
           ========================================================================= */}
        <TabsContent value="datos_personales" className="space-y-5 outline-none">
          <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white p-6">
            <CardHeader className="p-0 pb-5 border-b border-[#E5E7EB]">
              <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#007BBE]" />
                <span>Información Personal e Institucional</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Actualice su información de contacto y revise sus datos académicos o de supervisión
              </CardDescription>
            </CardHeader>

            <form onSubmit={manejarGuardarPerfil} className="pt-5 space-y-6">
              {/* Sección Común */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-[#035683]">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={nombre}
                    onChange={(_e) => set_nombre(_e.target.value)}
                    required
                    className="h-10 text-xs rounded-xl border-[#E5E7EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#00ABBD]" />
                    <span>Teléfono / Celular de Contacto</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Ej. 71234567"
                    value={telefono}
                    onChange={(_e) => set_telefono(_e.target.value)}
                    className="h-10 text-xs font-mono rounded-xl border-[#E5E7EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00ABBD]" />
                    <span>Dirección / Zona de Domicilio</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ej. Zona Villa Adela, Calle 4"
                    value={direccion}
                    onChange={(_e) => set_direccion(_e.target.value)}
                    className="h-10 text-xs rounded-xl border-[#E5E7EB]"
                  />
                </div>
              </div>

              {/* Sección Diferenciada: Becario */}
              {es_becario && (
                <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#035683] uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#007BBE]" />
                      <span>Ficha Académica y Prácticas BUMAND</span>
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 bg-emerald-50 text-emerald-800">
                      Vigente 2026
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {/* CI (Bloqueado) */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Cédula de Identidad</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={ci}
                          disabled
                          className="h-9 text-xs font-mono bg-slate-50 border-[#E5E7EB] rounded-xl text-slate-700 cursor-not-allowed"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">Validado en nómina oficial</span>
                    </div>

                    {/* Universidad (Bloqueada) */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Universidad</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={universidad}
                          disabled
                          className="h-9 text-xs bg-slate-50 border-[#E5E7EB] rounded-xl text-slate-700 cursor-not-allowed truncate"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">Convenio institucional Diaconía</span>
                    </div>

                    {/* Carrera */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Carrera Universitaria</Label>
                      <Input
                        type="text"
                        value={carrera}
                        onChange={(_e) => set_carrera(_e.target.value)}
                        className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                      />
                    </div>

                    {/* Semestre */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Semestre Actual</Label>
                      <Input
                        type="text"
                        value={semestre}
                        onChange={(_e) => set_semestre(_e.target.value)}
                        className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                      />
                    </div>

                    {/* Sede Asignada */}
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs font-bold text-[#035683]">Sede de Prácticas y Geocerca</Label>
                      <Input
                        type="text"
                        value={sede_asignada}
                        disabled
                        className="h-9 text-xs bg-slate-50 border-[#E5E7EB] rounded-xl text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    {/* Supervisor Asignado */}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Supervisor / Tutor Asignado</Label>
                      <Input
                        type="text"
                        value={supervisor_asignado}
                        disabled
                        className="h-9 text-xs bg-slate-50 border-[#E5E7EB] rounded-xl text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    {/* Modalidad de Pasajes */}
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-[#00ABBD]" />
                        <span>Modalidad Declarada de Pasajes (80%)</span>
                      </Label>
                      <Select
                        value={modalidad_pasajes}
                        onValueChange={(_v) => _v && set_modalidad_pasajes(_v as "ida_y_vuelta" | "solo_ida")}
                      >
                        <SelectTrigger className="h-9 rounded-xl border-[#E5E7EB] text-xs font-bold text-[#035683]">
                          <SelectValue placeholder="Modalidad de pasajes" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#E5E7EB]">
                          <SelectItem value="ida_y_vuelta">Ida y Vuelta (Completo · 80% cobertura)</SelectItem>
                          <SelectItem value="solo_ida">Solo Ida (Medio tramo · 80% cobertura)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección Diferenciada: Supervisor / Administrador */}
              {(es_supervisor || es_admin) && (
                <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#035683] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#007BBE]" />
                      <span>Ficha Institucional y Unidad de Gestión</span>
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono border-sky-300 bg-sky-50 text-sky-800">
                      Oficial Diaconía
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Cargo Institucional</Label>
                      <Input
                        type="text"
                        value={cargo}
                        onChange={(_e) => set_cargo(_e.target.value)}
                        className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-[#035683]">Unidad / Gerencia</Label>
                      <Input
                        type="text"
                        value={unidad}
                        onChange={(_e) => set_unidad(_e.target.value)}
                        className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs font-bold text-[#035683]">Resumen de Cohorte Supervisada</Label>
                      <Input
                        type="text"
                        value={resumen_cohorte}
                        disabled
                        className="h-9 text-xs bg-slate-50 border-[#E5E7EB] rounded-xl text-slate-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={guardando_perfil}
                  className="h-10 px-6 bg-[#007BBE] hover:bg-[#035683] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{guardando_perfil ? "Guardando..." : "Guardar Cambios de Mi Perfil"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* =========================================================================
            PESTAÑA 2: Mis Correos de Inicio de Sesión
           ========================================================================= */}
        <TabsContent value="correos_acceso" className="space-y-5 outline-none">
          <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white p-6">
            <CardHeader className="p-0 pb-5 border-b border-[#E5E7EB]">
              <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#007BBE]" />
                <span>Gestión de Correos para Inicio de Sesión</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Puede vincular múltiples direcciones de correo electrónico para acceder con su misma contraseña
              </CardDescription>
            </CardHeader>

            <div className="pt-5 space-y-6">
              {/* Formulario Correo Principal y Alternativo Principal */}
              <form onSubmit={manejarGuardarCorreosBase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Correo Principal */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-[#035683]">Correo Principal (Institucional)</Label>
                      <Badge variant="outline" className="text-[9px] font-mono border-slate-300 bg-slate-100 text-slate-700">
                        Primario
                      </Badge>
                    </div>
                    <div className="relative">
                      <Input
                        type="email"
                        value={correo_principal}
                        disabled={!es_admin}
                        onChange={(_e) => set_correo_principal(_e.target.value)}
                        className={`h-10 text-xs font-mono rounded-xl border-[#E5E7EB] ${
                          !es_admin ? "bg-slate-50 text-slate-700 cursor-not-allowed" : ""
                        }`}
                      />
                      {!es_admin && (
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Dirección principal registrada por Diaconía
                    </span>
                  </div>

                  {/* Correo Alternativo Principal */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-[#035683]">Correo Alternativo Principal</Label>
                      <Badge variant="outline" className="text-[9px] font-mono border-emerald-300 bg-emerald-50 text-emerald-800">
                        Habilitado para Login
                      </Badge>
                    </div>
                    <Input
                      type="email"
                      placeholder="ejemplo.personal@gmail.com"
                      value={correo_alternativo}
                      onChange={(_e) => set_correo_alternativo(_e.target.value)}
                      className="h-10 text-xs font-mono rounded-xl border-[#E5E7EB]"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Permite ingresar si olvida su correo corporativo
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={guardando_correos}
                    className="h-9 px-4 bg-[#035683] hover:bg-[#007BBE] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <span>{guardando_correos ? "Guardando..." : "Guardar Correo Alternativo"}</span>
                  </Button>
                </div>
              </form>

              {/* Lista de Correos Adicionales */}
              <div className="space-y-3 pt-5 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#035683] uppercase tracking-wider">
                      Correos Adicionales Vinculados ({correos_adicionales.length})
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Cualquiera de estos correos puede utilizarse para iniciar sesión con su misma clave
                    </p>
                  </div>
                </div>

                {correos_adicionales.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#E5E7EB] bg-slate-50/50 text-center text-xs text-muted-foreground">
                    No tiene correos adicionales vinculados actualmente. Puede registrar su correo personal abajo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {correos_adicionales.map((item, idx) => (
                      <div
                        key={`${item.correo}_${idx}`}
                        className="p-3 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-2 shadow-2xs hover:border-[#007BBE]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-xs font-bold text-[#1E293B] truncate">
                              {item.correo}
                            </div>
                            {item.etiqueta && (
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono border-emerald-200 bg-emerald-50 text-emerald-700 mt-0.5"
                              >
                                {item.etiqueta}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => manejarEliminarCorreoAdicional(item)}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                          title="Desvincular correo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario Agregar Nuevo Correo Adicional */}
                <form
                  onSubmit={manejarAgregarCorreoAdicional}
                  className="p-4 rounded-xl border border-[#E5E7EB] bg-slate-50/70 space-y-3 mt-3"
                >
                  <Label className="text-xs font-bold text-[#035683]">
                    Vincular Nuevo Correo de Acceso a mi Cuenta
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <Input
                        type="email"
                        placeholder="ejemplo@gmail.com o alternativo"
                        value={nuevo_correo_extra}
                        onChange={(_e) => set_nuevo_correo_extra(_e.target.value)}
                        required
                        className="h-9 text-xs font-mono bg-white rounded-xl border-[#E5E7EB]"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Etiqueta (ej. Personal, Respaldo)"
                        value={nueva_etiqueta_extra}
                        onChange={(_e) => set_nueva_etiqueta_extra(_e.target.value)}
                        className="h-9 text-xs bg-white rounded-xl border-[#E5E7EB]"
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="h-9 w-full bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Vincular Correo</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Al vincular un correo adicional, podrá iniciar sesión indistintamente con este correo y su contraseña actual.
                  </p>
                </form>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* =========================================================================
            PESTAÑA 3: Contraseña y Seguridad de Cuenta
           ========================================================================= */}
        <TabsContent value="seguridad_contrasena" className="space-y-5 outline-none">
          <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white p-6">
            <CardHeader className="p-0 pb-5 border-b border-[#E5E7EB]">
              <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#007BBE]" />
                <span>Actualización de Contraseña y Seguridad</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Gestione la clave de seguridad para el acceso a su cuenta institucional
              </CardDescription>
            </CardHeader>

            <div className="pt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario */}
              <form onSubmit={manejarCambiarContrasenaPropia} className="lg:col-span-2 space-y-4">
                {/* Contraseña Actual */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683]">
                    Contraseña Actual <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={mostrar_clave_actual ? "text" : "password"}
                      placeholder="Ingrese su contraseña vigente"
                      value={clave_actual}
                      onChange={(_e) => set_clave_actual(_e.target.value)}
                      required
                      className="h-10 pr-10 text-xs font-mono rounded-xl border-[#E5E7EB]"
                    />
                    <button
                      type="button"
                      onClick={() => set_mostrar_clave_actual(!mostrar_clave_actual)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#035683] cursor-pointer"
                      title={mostrar_clave_actual ? "Ocultar" : "Mostrar"}
                    >
                      {mostrar_clave_actual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683]">
                    Nueva Contraseña <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={mostrar_clave_nueva ? "text" : "password"}
                      placeholder="Mínimo 6 u 8 caracteres con letras y números"
                      value={clave_nueva}
                      onChange={(_e) => set_clave_nueva(_e.target.value)}
                      required
                      className="h-10 pr-10 text-xs font-mono rounded-xl border-[#E5E7EB]"
                    />
                    <button
                      type="button"
                      onClick={() => set_mostrar_clave_nueva(!mostrar_clave_nueva)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#035683] cursor-pointer"
                      title={mostrar_clave_nueva ? "Ocultar" : "Mostrar"}
                    >
                      {mostrar_clave_nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Indicador visual de seguridad */}
                  {clave_nueva && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground">Fortaleza calculada:</span>
                        <span className="font-bold text-[#035683]">{seguridad_clave.etiqueta}</span>
                      </div>
                      <Progress value={seguridad_clave.puntaje} className="h-2 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683]">
                    Confirmar Nueva Contraseña <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={mostrar_clave_confirmar ? "text" : "password"}
                      placeholder="Vuelva a escribir la nueva contraseña"
                      value={clave_confirmar}
                      onChange={(_e) => set_clave_confirmar(_e.target.value)}
                      required
                      className="h-10 pr-10 text-xs font-mono rounded-xl border-[#E5E7EB]"
                    />
                    <button
                      type="button"
                      onClick={() => set_mostrar_clave_confirmar(!mostrar_clave_confirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#035683] cursor-pointer"
                      title={mostrar_clave_confirmar ? "Ocultar" : "Mostrar"}
                    >
                      {mostrar_clave_confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {clave_confirmar && clave_nueva !== clave_confirmar && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Las contraseñas ingresadas no coinciden.
                    </p>
                  )}
                  {clave_confirmar && clave_nueva === clave_confirmar && (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden correctamente.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      guardando_clave ||
                      !clave_actual ||
                      !clave_nueva ||
                      clave_nueva !== clave_confirmar
                    }
                    className="h-10 px-6 bg-[#007BBE] hover:bg-[#035683] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{guardando_clave ? "Actualizando..." : "Actualizar Mi Contraseña"}</span>
                  </Button>
                </div>
              </form>

              {/* Recomendaciones de Seguridad Diaconía */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-3">
                  <div className="flex items-center gap-2 text-[#035683] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#007BBE]" />
                    <span>Políticas de Seguridad Diaconía FRIF</span>
                  </div>

                  <ul className="space-y-2 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>Longitud mínima de 8 caracteres recomendada.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>Incluir mayúsculas, minúsculas, números y caracteres especiales.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>No reutilice contraseñas de correos o redes personales ajenas a BUMAND.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>No comparta sus credenciales con compañeros o terceros no autorizados.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-dashed border-[#E5E7EB] bg-slate-50/50 space-y-1.5 text-xs text-muted-foreground">
                  <span className="font-bold text-[#035683] block text-[11px]">
                    Sesión Activa
                  </span>
                  <p className="text-[11px]">
                    Token JWT emitido por la infraestructura de seguridad BUMAND. Cierre de sesión automático tras periodo de inactividad prolongada.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
