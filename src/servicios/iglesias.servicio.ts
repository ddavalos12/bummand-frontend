/**
 * Servicio de Gestión de Congregaciones e Iglesias para Frontend
 * Integración con /iglesias del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export interface Iglesia {
  id: number;
  nombre: string;
  denominacion?: string | null;
  pastor?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
  creado_en?: string;
  actualizado_en?: string;
}

export interface PeticionCrearIglesia {
  nombre: string;
  denominacion?: string;
  pastor?: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
}

export interface PeticionActualizarIglesia {
  nombre?: string;
  denominacion?: string;
  pastor?: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
}

/**
 * Listar congregaciones e iglesias del catálogo institucional.
 */
export async function listarIglesias(): Promise<Iglesia[]> {
  return clienteApi.get<Iglesia[]>(RUTAS_API.IGLESIAS.BASE);
}

/**
 * Obtener los detalles de una iglesia por su ID.
 */
export async function obtenerIglesiaPorId(id: number): Promise<Iglesia> {
  return clienteApi.get<Iglesia>(RUTAS_API.IGLESIAS.POR_ID(id));
}

/**
 * Registrar una nueva iglesia (Solo Administradores).
 */
export async function crearIglesia(
  datos: PeticionCrearIglesia
): Promise<Iglesia> {
  return clienteApi.post<Iglesia>(RUTAS_API.IGLESIAS.BASE, datos);
}

/**
 * Actualizar los datos de una iglesia existente.
 */
export async function actualizarIglesia(
  id: number,
  datos: PeticionActualizarIglesia
): Promise<Iglesia> {
  return clienteApi.put<Iglesia>(RUTAS_API.IGLESIAS.POR_ID(id), datos);
}

/**
 * Eliminar una iglesia del catálogo (si no cuenta con becarios vinculados).
 */
export async function eliminarIglesia(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(RUTAS_API.IGLESIAS.POR_ID(id));
}
