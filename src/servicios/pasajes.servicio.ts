/**
 * Servicio de Gestión de Pasajes y Viáticos de Transporte para Frontend
 * Integración con /pasajes del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type SentidoTramo = "ida" | "vuelta";
export type EstadoSolicitudPasaje =
  | "borrador"
  | "pendiente"
  | "revisado_supervisor"
  | "aprobado_administracion"
  | "rechazado"
  | "observado";

export interface TarifaTransporte {
  id: number;
  tipo_transporte: string;
  tarifa_estudiante: number;
  tarifa_regular: number;
  descripcion?: string;
  vigente_desde?: string;
  vigente_hasta?: string | null;
  activa: boolean;
}

export interface ParadaTransporte {
  id: number;
  nombre: string;
  ciudad: "La Paz" | "El Alto";
  zona?: string;
  latitud: number;
  longitud: number;
  distancia_metros?: number;
}

export interface RecorridoItem {
  id?: number;
  fecha: string;
  sentido: SentidoTramo;
  origen: string;
  destino: string;
  tipo_transporte: string;
  costo_pasaje: number;
  monto_reembolso_80: number;
  latitud_origen?: number;
  longitud_origen?: number;
  latitud_destino?: number;
  longitud_destino?: number;
  actividad_descripcion?: string;
  becario_id?: number;
}

export interface SolicitudPasajes {
  id: number;
  becario_id: number;
  mes: number;
  ano: number;
  periodo: string;
  total_declarado: number;
  total_reembolso_80: number;
  estado: EstadoSolicitudPasaje;
  observaciones?: string | null;
  fecha_envio?: string | null;
  recorridos?: RecorridoItem[];
  becario?: {
    id: number;
    ci: string;
    usuario?: {
      id: number;
      nombre: string;
      correo: string;
    };
  };
}

export interface HistorialParadaResumen {
  fecha: string;
  parada_origen: string;
  parada_destino: string;
  sentido: SentidoTramo;
  tipo_transporte: string;
  costo: number;
  reembolso: number;
  becario_id?: number;
}

export interface FiltrosHistorialParadas {
  becario_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  tramo?: "todos" | "ida" | "vuelta";
  tipo_actividad?: string;
  ciudad?: "La Paz" | "El Alto";
}

/**
 * Obtener tarifas oficiales de transporte vigentes.
 */
export async function obtenerTarifas(fecha?: string): Promise<TarifaTransporte[]> {
  const ruta = fecha
    ? `${RUTAS_API.PASAJES.TARIFAS}?fecha=${encodeURIComponent(fecha)}`
    : RUTAS_API.PASAJES.TARIFAS;
  return clienteApi.get<TarifaTransporte[]>(ruta);
}

/**
 * Listar catálogo completo de tarifas históricas y vigentes (Admin/Supervisor).
 */
export async function listarTodasLasTarifas(): Promise<TarifaTransporte[]> {
  return clienteApi.get<TarifaTransporte[]>(RUTAS_API.PASAJES.TARIFAS_TODAS);
}

/**
 * Listar paradas frecuentes con ordenamiento opcional por Haversine satelital.
 */
export async function obtenerParadas(filtros?: {
  ciudad?: string;
  latitud?: number;
  longitud?: number;
}): Promise<ParadaTransporte[]> {
  const params = new URLSearchParams();
  if (filtros?.ciudad) params.append("ciudad", filtros.ciudad);
  if (filtros?.latitud !== undefined) params.append("latitud", String(filtros.latitud));
  if (filtros?.longitud !== undefined) params.append("longitud", String(filtros.longitud));

  const query = params.toString();
  const ruta = query ? `${RUTAS_API.PASAJES.PARADAS}?${query}` : RUTAS_API.PASAJES.PARADAS;
  return clienteApi.get<ParadaTransporte[]>(ruta);
}

/**
 * Listar solicitudes de pasajes declaradas por el becario autenticado.
 */
export async function obtenerMisSolicitudesPasajes(): Promise<SolicitudPasajes[]> {
  return clienteApi.get<SolicitudPasajes[]>(RUTAS_API.PASAJES.MIS_SOLICITUDES);
}

/**
 * Confirmar datos del becario para apertura de planilla mensual de pasajes.
 */
export async function confirmarDatosPasajes(
  periodo: string
): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.PASAJES.CONFIRMAR_DATOS,
    { periodo }
  );
}

/**
 * Crear un nuevo borrador mensual de solicitud de pasajes.
 */
export async function crearSolicitudPasajes(datos: {
  mes: number;
  ano: number;
  periodo?: string;
}): Promise<SolicitudPasajes> {
  return clienteApi.post<SolicitudPasajes>(RUTAS_API.PASAJES.BASE, datos);
}

/**
 * Registrar tramo o conjunto de tramos diarios de transporte.
 */
export async function agregarRecorrido(
  datos: RecorridoItem | RecorridoItem[]
): Promise<SolicitudPasajes> {
  return clienteApi.post<SolicitudPasajes>(RUTAS_API.PASAJES.RECORRIDOS, datos);
}

/**
 * Eliminar un tramo de transporte de la solicitud borrador.
 */
export async function eliminarRecorrido(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.PASAJES.RECORRIDO_POR_ID(id)
  );
}

/**
 * Listar solicitudes mensuales pertenecientes a un becario específico.
 */
export async function obtenerSolicitudesPorBecario(
  becario_id: number
): Promise<SolicitudPasajes[]> {
  return clienteApi.get<SolicitudPasajes[]>(
    RUTAS_API.PASAJES.POR_BECARIO(becario_id)
  );
}

/**
 * Listar todas las solicitudes para auditoría central (Admin / Supervisor).
 */
export async function listarTodasLasSolicitudes(): Promise<SolicitudPasajes[]> {
  return clienteApi.get<SolicitudPasajes[]>(RUTAS_API.PASAJES.BASE);
}

/**
 * Consultar historial consolidado de paradas y trazabilidad con filtros.
 */
export async function obtenerHistorialParadas(
  filtros?: FiltrosHistorialParadas
): Promise<HistorialParadaResumen[]> {
  const params = new URLSearchParams();
  if (filtros?.becario_id) params.append("becario_id", String(filtros.becario_id));
  if (filtros?.fecha_inicio) params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros?.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);
  if (filtros?.tramo) params.append("tramo", filtros.tramo);
  if (filtros?.tipo_actividad) params.append("tipo_actividad", filtros.tipo_actividad);
  if (filtros?.ciudad) params.append("ciudad", filtros.ciudad);

  const query = params.toString();
  const ruta = query
    ? `${RUTAS_API.PASAJES.HISTORIAL_PARADAS}?${query}`
    : RUTAS_API.PASAJES.HISTORIAL_PARADAS;
  return clienteApi.get<HistorialParadaResumen[]>(ruta);
}

/**
 * Obtener historial de paradas de un estudiante determinado en un intervalo.
 */
export async function obtenerHistorialParadasEstudiante(
  id: number,
  filtros?: { fecha_inicio?: string; fecha_fin?: string; tramo?: string }
): Promise<HistorialParadaResumen[]> {
  const params = new URLSearchParams();
  if (filtros?.fecha_inicio) params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros?.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);
  if (filtros?.tramo) params.append("tramo", filtros.tramo);

  const query = params.toString();
  const ruta = query
    ? `${RUTAS_API.PASAJES.ESTUDIANTE_HISTORIAL_PARADAS(id)}?${query}`
    : RUTAS_API.PASAJES.ESTUDIANTE_HISTORIAL_PARADAS(id);
  return clienteApi.get<HistorialParadaResumen[]>(ruta);
}

/**
 * Consultar mi propio historial de paradas como becario en sesión.
 */
export async function obtenerMiHistorialParadas(filtros?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  tramo?: string;
}): Promise<HistorialParadaResumen[]> {
  const params = new URLSearchParams();
  if (filtros?.fecha_inicio) params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros?.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);
  if (filtros?.tramo) params.append("tramo", filtros.tramo);

  const query = params.toString();
  const ruta = query
    ? `${RUTAS_API.PASAJES.MIS_PARADAS_HISTORIAL}?${query}`
    : RUTAS_API.PASAJES.MIS_PARADAS_HISTORIAL;
  return clienteApi.get<HistorialParadaResumen[]>(ruta);
}

/**
 * Obtener detalle completo de solicitud de pasajes por ID.
 */
export async function obtenerSolicitudPasajesPorId(
  id: number
): Promise<SolicitudPasajes> {
  return clienteApi.get<SolicitudPasajes>(RUTAS_API.PASAJES.POR_ID(id));
}

/**
 * Enviar solicitud formal a revisión aplicando la Regla del Día 24.
 */
export async function enviarSolicitudPasajes(
  id: number
): Promise<SolicitudPasajes> {
  return clienteApi.post<SolicitudPasajes>(RUTAS_API.PASAJES.ENVIAR(id));
}

/**
 * Revisión técnica de viáticos por el supervisor (Flujo de 2 Pasos).
 */
export async function revisarSupervisorPasajes(
  id: number,
  datos: { observaciones?: string }
): Promise<SolicitudPasajes> {
  return clienteApi.patch<SolicitudPasajes>(
    RUTAS_API.PASAJES.REVISAR_SUPERVISOR(id),
    datos
  );
}

/**
 * Aprobación definitiva de planilla de viáticos por administración (Flujo de 2 Pasos).
 */
export async function aprobarAdministracionPasajes(
  id: number,
  datos: { observaciones?: string }
): Promise<SolicitudPasajes> {
  return clienteApi.patch<SolicitudPasajes>(
    RUTAS_API.PASAJES.APROBAR_ADMINISTRACION(id),
    datos
  );
}

/**
 * Rechazar u observar formalmente la planilla exigiendo justificación técnica.
 */
export async function rechazarSolicitudPasajes(
  id: number,
  observaciones: string
): Promise<SolicitudPasajes> {
  return clienteApi.patch<SolicitudPasajes>(
    RUTAS_API.PASAJES.RECHAZAR(id),
    { observaciones }
  );
}
