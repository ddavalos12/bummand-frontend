/**
 * Servicio de Gestión de Becarios para Frontend
 * Integración con /becarios del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type ModalidadPasajes = "solo_ida" | "ida_vuelta" | "libre";

export interface HorarioDia {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  horas_diarias?: number;
  turno?: string;
  activo?: boolean;
}

export interface GrillaHorarioBecario {
  lugar_practica_id?: number;
  dias: HorarioDia[];
}

export interface BecarioInstitucional {
  id: number;
  ci: string;
  carrera: string;
  universidad: string;
  institucion?: string | null;
  unidad?: string | null;
  datos_validados: boolean;
  modalidad_pasajes?: ModalidadPasajes;
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    estado?: string;
  };
  supervisor?: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  lugar_practica?: {
    id: number;
    nombre: string;
    direccion?: string;
    latitud?: number;
    longitud?: number;
  } | null;
  iglesia?: {
    id: number;
    nombre: string;
    pastor?: string;
  } | null;
  horarios?: HorarioDia[];
}

export interface PeticionCrearBecario {
  nombre: string;
  correo: string;
  contrasena: string;
  ci: string;
  carrera: string;
  universidad: string;
  institucion?: string;
  unidad?: string;
  supervisor_id?: number;
  lugar_practica_id?: number;
  iglesia_id?: number;
}

export interface PeticionActualizarBecario {
  nombre?: string;
  carrera?: string;
  universidad?: string;
  institucion?: string;
  unidad?: string;
  supervisor_id?: number;
  lugar_practica_id?: number;
  iglesia_id?: number;
}

export interface EstadoOrdenConfirmacion {
  disponible: boolean;
  activa: boolean;
  dias_restantes?: number;
  ultima_emision?: string | null;
}

export interface PeticionConfiguracionPasajes {
  modalidad: ModalidadPasajes;
  observaciones?: string;
}

/**
 * Listar becarios institucionales (según rol, supervisor solo ve sus becarios).
 */
export async function listarBecarios(): Promise<BecarioInstitucional[]> {
  return clienteApi.get<BecarioInstitucional[]>(RUTAS_API.BECARIOS.BASE);
}

/**
 * Registrar un nuevo becario y su usuario institucional.
 */
export async function crearBecario(
  datos: PeticionCrearBecario
): Promise<BecarioInstitucional> {
  return clienteApi.post<BecarioInstitucional>(RUTAS_API.BECARIOS.BASE, datos);
}

/**
 * Obtener expediente completo del becario autenticado en sesión.
 */
export async function obtenerMiPerfilBecario(): Promise<BecarioInstitucional> {
  return clienteApi.get<BecarioInstitucional>(RUTAS_API.BECARIOS.ME);
}

/**
 * Actualizar datos propios permitidos por el becario (universidad, contacto).
 */
export async function actualizarMiPerfilBecario(
  universidad: string
): Promise<BecarioInstitucional> {
  return clienteApi.put<BecarioInstitucional>(RUTAS_API.BECARIOS.ME, {
    universidad,
  });
}

/**
 * Consultar si el botón global de orden de confirmación está en enfriamiento (7 días).
 */
export async function obtenerEstadoOrdenGlobal(): Promise<EstadoOrdenConfirmacion> {
  return clienteApi.get<EstadoOrdenConfirmacion>(
    RUTAS_API.BECARIOS.ESTADO_ORDEN_GLOBAL
  );
}

/**
 * Emitir la orden global de confirmación de datos con enfriamiento institucional.
 */
export async function emitirOrdenConfirmacionDatos(
  confirmacion_datos_requerida: boolean = true
): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.BECARIOS.ORDEN_CONFIRMACION_DATOS,
    { confirmacion_datos_requerida }
  );
}

/**
 * Consultar si el becario autenticado tiene pendiente confirmar sus datos.
 */
export async function obtenerEstadoConfirmacionDatos(): Promise<{
  pendiente: boolean;
  confirmacion_datos_requerida: boolean;
}> {
  return clienteApi.get<{
    pendiente: boolean;
    confirmacion_datos_requerida: boolean;
  }>(RUTAS_API.BECARIOS.ESTADO_CONFIRMACION_DATOS);
}

/**
 * Confirmar formalmente los datos de expediente por el propio becario.
 */
export async function confirmarDatosPropios(): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.BECARIOS.CONFIRMAR_DATOS
  );
}

/**
 * Obtener el detalle de un becario por su identificador.
 */
export async function obtenerBecarioPorId(
  id: number
): Promise<BecarioInstitucional> {
  return clienteApi.get<BecarioInstitucional>(RUTAS_API.BECARIOS.POR_ID(id));
}

/**
 * Asignar supervisor a un becario.
 */
export async function asignarSupervisorBecario(
  id: number,
  supervisor_id: number
): Promise<BecarioInstitucional> {
  return clienteApi.put<BecarioInstitucional>(
    RUTAS_API.BECARIOS.ASIGNAR_SUPERVISOR(id),
    { supervisor_id }
  );
}

/**
 * Validar oficialmente el expediente del becario por administración.
 */
export async function validarDatosBecario(
  id: number
): Promise<BecarioInstitucional> {
  return clienteApi.put<BecarioInstitucional>(
    RUTAS_API.BECARIOS.VALIDAR_DATOS(id)
  );
}

/**
 * Configurar modalidad de registro de pasajes para un becario (Solo Ida / Ida y Vuelta).
 */
export async function configurarPasajesBecario(
  id: number,
  datos: PeticionConfiguracionPasajes
): Promise<BecarioInstitucional> {
  return clienteApi.patch<BecarioInstitucional>(
    RUTAS_API.BECARIOS.CONFIGURACION_PASAJES(id),
    datos
  );
}

/**
 * Actualizar expediente institucional de un becario.
 */
export async function actualizarBecario(
  id: number,
  datos: PeticionActualizarBecario
): Promise<BecarioInstitucional> {
  return clienteApi.put<BecarioInstitucional>(
    RUTAS_API.BECARIOS.POR_ID(id),
    datos
  );
}

/**
 * Dar de baja lógicamente a un becario.
 */
export async function eliminarBecario(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.BECARIOS.POR_ID(id)
  );
}

/**
 * Obtener grilla horaria asignada a un becario.
 */
export async function obtenerHorariosBecario(
  id: number
): Promise<GrillaHorarioBecario | HorarioDia[]> {
  return clienteApi.get<GrillaHorarioBecario | HorarioDia[]>(
    RUTAS_API.BECARIOS.HORARIOS(id)
  );
}

/**
 * Guardar o actualizar la grilla horaria semanal del becario.
 */
export async function guardarHorariosBecario(
  id: number,
  datos: GrillaHorarioBecario
): Promise<GrillaHorarioBecario> {
  return clienteApi.put<GrillaHorarioBecario>(
    RUTAS_API.BECARIOS.HORARIOS(id),
    datos
  );
}
