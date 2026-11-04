/**
 * Servicio de Gestión de Eventos y Marcación Geodésica para Frontend
 * Integración con /eventos del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type EstadoEvento = "programado" | "en_curso" | "finalizado" | "cancelado";

export interface Evento {
  id: number;
  titulo: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  latitud: number;
  longitud: number;
  radio_tolerancia_metros: number;
  direccion_referencia?: string | null;
  estado: EstadoEvento;
  organizador_id?: number;
  creado_en?: string;
  actualizado_en?: string;
}

export interface AsistenciaEvento {
  id: number;
  evento_id: number;
  becario_id: number;
  fecha_marcacion: string;
  distancia_metros: number;
  es_valida: boolean;
  becario?: {
    id: number;
    ci: string;
    usuario?: {
      nombre: string;
    };
  };
}

export interface PeticionCrearEvento {
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  latitud: number;
  longitud: number;
  radio_tolerancia_metros: number;
  direccion_referencia?: string;
}

export interface PeticionActualizarEvento {
  titulo?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EstadoEvento;
  latitud?: number;
  longitud?: number;
  radio_tolerancia_metros?: number;
  direccion_referencia?: string;
}

export interface PeticionCambiarLugarEvento {
  latitud: number;
  longitud: number;
  radio_tolerancia_metros: number;
  direccion_referencia?: string;
}

export interface PeticionMarcarAsistenciaEvento {
  latitud: number;
  longitud: number;
  precision_metros?: number;
}

/**
 * Listar la agenda de eventos institucionales.
 */
export async function listarEventos(): Promise<Evento[]> {
  return clienteApi.get<Evento[]>(RUTAS_API.EVENTOS.BASE);
}

/**
 * Listar eventos activos o en curso.
 */
export async function listarEventosActivos(): Promise<Evento[]> {
  return clienteApi.get<Evento[]>(RUTAS_API.EVENTOS.ACTIVOS);
}

/**
 * Convocar o programar un nuevo evento institucional (Admin / Supervisor).
 */
export async function crearEvento(
  datos: PeticionCrearEvento
): Promise<Evento> {
  return clienteApi.post<Evento>(RUTAS_API.EVENTOS.BASE, datos);
}

/**
 * Obtener los detalles de un evento por ID.
 */
export async function obtenerEventoPorId(id: number): Promise<Evento> {
  return clienteApi.get<Evento>(RUTAS_API.EVENTOS.POR_ID(id));
}

/**
 * Actualizar datos de un evento existente.
 */
export async function actualizarEvento(
  id: number,
  datos: PeticionActualizarEvento
): Promise<Evento> {
  return clienteApi.patch<Evento>(RUTAS_API.EVENTOS.POR_ID(id), datos);
}

/**
 * Modificar dinámicamente las coordenadas y perímetro de un evento en tiempo real.
 */
export async function cambiarLugarEvento(
  id: number,
  datos: PeticionCambiarLugarEvento
): Promise<Evento> {
  return clienteApi.patch<Evento>(RUTAS_API.EVENTOS.CAMBIAR_LUGAR(id), datos);
}

/**
 * Eliminar una convocatoria de evento.
 */
export async function eliminarEvento(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(RUTAS_API.EVENTOS.POR_ID(id));
}

/**
 * Marcar asistencia presencial a un evento validando geocerca Haversine.
 */
export async function marcarAsistenciaEvento(
  id: number,
  coordenadas: PeticionMarcarAsistenciaEvento
): Promise<AsistenciaEvento> {
  return clienteApi.post<AsistenciaEvento>(
    RUTAS_API.EVENTOS.MARCAR_ASISTENCIA(id),
    coordenadas
  );
}

/**
 * Consultar la nómina de becarios que asistieron a un evento.
 */
export async function obtenerAsistenciasEvento(
  id: number
): Promise<AsistenciaEvento[]> {
  return clienteApi.get<AsistenciaEvento[]>(RUTAS_API.EVENTOS.ASISTENCIAS(id));
}
