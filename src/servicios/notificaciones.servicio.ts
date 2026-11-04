/**
 * Servicio de Notificaciones y Avisos Push para Frontend
 * Integración con /notificaciones del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type TipoNotificacion =
  | "asistencia"
  | "pasajes"
  | "evaluacion"
  | "refrigerio"
  | "justificacion"
  | "devocional"
  | "sistema";

export interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  leida: boolean;
  enlace_accion?: string | null;
  datos_extra?: Record<string, unknown>;
  creado_en: string;
}

export interface PeticionCrearNotificacion {
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  enlace_accion?: string;
  datos_extra?: Record<string, unknown>;
}

export interface PeticionRegistrarTokenFcm {
  token_fcm: string;
  plataforma?: "web" | "android" | "ios";
}

/**
 * Listar la bandeja de notificaciones y alertas del usuario autenticado.
 */
export async function listarMisNotificaciones(): Promise<Notificacion[]> {
  return clienteApi.get<Notificacion[]>(
    RUTAS_API.NOTIFICACIONES.MIS_NOTIFICACIONES
  );
}

/**
 * Obtener el conteo numérico de notificaciones no leídas para badge UI.
 */
export async function contarNotificacionesNoLeidas(): Promise<{ total: number }> {
  return clienteApi.get<{ total: number }>(
    RUTAS_API.NOTIFICACIONES.NO_LEIDAS_CONTEO
  );
}

/**
 * Marcar una notificación individual como leída.
 */
export async function marcarNotificacionLeida(
  id: number
): Promise<Notificacion> {
  return clienteApi.patch<Notificacion>(
    RUTAS_API.NOTIFICACIONES.MARCAR_LEIDA(id)
  );
}

/**
 * Marcar todas las notificaciones del usuario como leídas en bloque.
 */
export async function marcarTodasNotificacionesLeidas(): Promise<{ mensaje: string }> {
  return clienteApi.patch<{ mensaje: string }>(
    RUTAS_API.NOTIFICACIONES.MARCAR_TODAS_LEIDAS
  );
}

/**
 * Registrar token de dispositivo FCM para recepción de notificaciones Push.
 */
export async function registrarTokenFcm(
  datos: PeticionRegistrarTokenFcm
): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.NOTIFICACIONES.REGISTRAR_FCM,
    datos
  );
}

/**
 * Emitir una nueva notificación institucional.
 */
export async function crearNotificacion(
  datos: PeticionCrearNotificacion
): Promise<Notificacion> {
  return clienteApi.post<Notificacion>(
    RUTAS_API.NOTIFICACIONES.BASE,
    datos
  );
}
