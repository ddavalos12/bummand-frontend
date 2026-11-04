/**
 * Servicio de Gestión de Lugares y Sedes de Práctica para Frontend
 * Integración con /lugares-practica del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export interface LugarPractica {
  id: number;
  nombre: string;
  direccion?: string | null;
  latitud: number;
  longitud: number;
  radio_tolerancia_metros: number;
  ciudad?: string | null;
  activo?: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface PeticionCrearLugarPractica {
  nombre: string;
  direccion?: string;
  latitud: number;
  longitud: number;
  radio_tolerancia_metros: number;
  ciudad?: string;
}

export interface PeticionActualizarLugarPractica {
  nombre?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  radio_tolerancia_metros?: number;
  ciudad?: string;
  activo?: boolean;
}

/**
 * Listar todas las agencias, sucursales y sedes de práctica con sus parámetros satelitales.
 */
export async function listarLugaresPractica(): Promise<LugarPractica[]> {
  return clienteApi.get<LugarPractica[]>(RUTAS_API.LUGARES_PRACTICA.BASE);
}

/**
 * Obtener detalle de una sede de práctica por su identificador.
 */
export async function obtenerLugarPracticaPorId(
  id: number
): Promise<LugarPractica> {
  return clienteApi.get<LugarPractica>(RUTAS_API.LUGARES_PRACTICA.POR_ID(id));
}

/**
 * Registrar una nueva sede de práctica (Solo Administradores).
 */
export async function crearLugarPractica(
  datos: PeticionCrearLugarPractica
): Promise<LugarPractica> {
  return clienteApi.post<LugarPractica>(RUTAS_API.LUGARES_PRACTICA.BASE, datos);
}

/**
 * Actualizar los parámetros geodésicos o dirección de una sede de práctica.
 */
export async function actualizarLugarPractica(
  id: number,
  datos: PeticionActualizarLugarPractica
): Promise<LugarPractica> {
  return clienteApi.put<LugarPractica>(
    RUTAS_API.LUGARES_PRACTICA.POR_ID(id),
    datos
  );
}

/**
 * Eliminar una sede de práctica del catálogo institucional.
 */
export async function eliminarLugarPractica(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.LUGARES_PRACTICA.POR_ID(id)
  );
}
