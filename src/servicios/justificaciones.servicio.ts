/**
 * Servicio de Justificaciones de Inasistencia y Permisos para Frontend
 * Integración con /justificaciones del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type TipoJustificacion =
  | "inasistencia"
  | "retraso"
  | "salida_temprana"
  | "escuela_lideres"
  | "evento";

export type EstadoJustificacion =
  | "pendiente"
  | "revisado_supervisor"
  | "aprobada"
  | "rechazada"
  | "observada";

export interface Justificacion {
  id: number;
  becario_id: number;
  tipo: TipoJustificacion;
  fecha_inicio: string;
  fecha_fin?: string;
  motivo: string;
  estado: EstadoJustificacion;
  archivo_prueba_url?: string | null;
  nombre_archivo_prueba?: string | null;
  observaciones_resolucion?: string | null;
  creado_en?: string;
  becario?: {
    id: number;
    ci: string;
    usuario?: {
      id: number;
      nombre: string;
    };
  };
}

export interface PeticionCrearJustificacion {
  tipo: TipoJustificacion;
  fecha_inicio: string;
  fecha_fin?: string;
  motivo: string;
  archivo_prueba_url?: string;
  nombre_archivo_prueba?: string;
}

export interface RespuestaSubidaComprobante {
  archivo_prueba_url: string;
  nombre_archivo_prueba: string;
  tamano: number;
}

export interface PeticionRevisarSupervisorJustificacion {
  estado: "aprobada" | "rechazada" | "observada";
  observaciones?: string;
}

export interface PeticionAprobarAdminJustificacion {
  estado: "aprobada" | "rechazada";
  observaciones?: string;
  condonar_multas?: boolean;
}

/**
 * Subir documento probatorio (PDF, imagen) a almacenamiento del backend.
 */
export async function subirComprobanteJustificacion(
  archivo: File
): Promise<RespuestaSubidaComprobante> {
  const formulario = new FormData();
  formulario.append("archivo", archivo);

  return clienteApi.post<RespuestaSubidaComprobante>(
    RUTAS_API.JUSTIFICACIONES.SUBIR_COMPROBANTE,
    formulario
  );
}

/**
 * Radicar una nueva solicitud formal de justificación de inasistencia.
 */
export async function crearJustificacion(
  datos: PeticionCrearJustificacion
): Promise<Justificacion> {
  return clienteApi.post<Justificacion>(
    RUTAS_API.JUSTIFICACIONES.BASE,
    datos
  );
}

/**
 * Listar todas las justificaciones institucionales (Admin / Supervisor).
 */
export async function listarJustificaciones(): Promise<Justificacion[]> {
  return clienteApi.get<Justificacion[]>(RUTAS_API.JUSTIFICACIONES.BASE);
}

/**
 * Consultar las justificaciones radicadas por el becario autenticado.
 */
export async function obtenerMisJustificaciones(): Promise<Justificacion[]> {
  return clienteApi.get<Justificacion[]>(
    RUTAS_API.JUSTIFICACIONES.MIS_JUSTIFICACIONES
  );
}

/**
 * Obtener el detalle de una justificación por ID.
 */
export async function obtenerJustificacionPorId(
  id: number
): Promise<Justificacion> {
  return clienteApi.get<Justificacion>(RUTAS_API.JUSTIFICACIONES.POR_ID(id));
}

/**
 * Revisión técnica de justificación por Supervisor (Flujo de 2 Pasos).
 */
export async function revisarSupervisorJustificacion(
  id: number,
  datos: PeticionRevisarSupervisorJustificacion
): Promise<Justificacion> {
  return clienteApi.patch<Justificacion>(
    RUTAS_API.JUSTIFICACIONES.REVISAR_SUPERVISOR(id),
    datos
  );
}

/**
 * Aprobación definitiva por Administración Central y condonación automática de multas.
 */
export async function aprobarAdministracionJustificacion(
  id: number,
  datos: PeticionAprobarAdminJustificacion
): Promise<Justificacion> {
  return clienteApi.patch<Justificacion>(
    RUTAS_API.JUSTIFICACIONES.APROBAR_ADMINISTRACION(id),
    datos
  );
}

/**
 * Resolver o dictaminar una justificación directamente de forma motivada.
 */
export async function resolverJustificacion(
  id: number,
  datos: { estado: "aprobada" | "rechazada"; observaciones: string }
): Promise<Justificacion> {
  return clienteApi.patch<Justificacion>(
    RUTAS_API.JUSTIFICACIONES.RESOLVER(id),
    datos
  );
}
