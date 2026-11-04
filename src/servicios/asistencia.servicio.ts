/**
 * Servicio de Asistencia, Marcaciones y Aprobación de Prácticas
 * Integración con /asistencia y /practicas del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type EstadoAsistencia =
  | "presente"
  | "retraso"
  | "falta"
  | "justificado"
  | "revisado_supervisor"
  | "aprobado_administracion";

export interface RegistroAsistencia {
  id: number;
  becario_id: number;
  fecha: string;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
  minutos_retraso?: number;
  horas_efectivas?: number;
  estado: EstadoAsistencia;
  latitud_ingreso?: number | null;
  longitud_ingreso?: number | null;
  latitud_salida?: number | null;
  longitud_salida?: number | null;
  distancia_ingreso_metros?: number | null;
  es_manual?: boolean;
  observaciones?: string | null;
  becario?: {
    id: number;
    ci: string;
    usuario?: {
      id: number;
      nombre: string;
    };
  };
}

export interface Multa {
  id: number;
  becario_id: number;
  fecha: string;
  monto: number;
  minutos_retraso: number;
  motivo?: string;
  estado: "pendiente" | "pagada" | "condonada";
  becario?: {
    id: number;
    usuario?: {
      nombre: string;
    };
  };
}

export interface PeticionCoordenadas {
  latitud: number;
  longitud: number;
  precision_metros?: number;
  es_simulado?: boolean;
  becario_id?: number;
}

export interface PeticionConfirmarOrganizador {
  becarios_ids: number[];
  fecha?: string;
  observaciones?: string;
}

export interface PeticionAsistenciaManual {
  becario_id: number;
  fecha: string;
  hora_ingreso: string;
  hora_salida?: string;
  motivo: string;
}

export interface PeticionRectificarHora {
  hora_llegada_corregida: string;
  motivo_rectificacion: string;
}

export interface PeticionRevisarAsistencia {
  estado: "aprobado" | "observado" | "rechazado";
  observaciones?: string;
}

export interface AprobacionPracticas {
  id: number;
  becario_id: number;
  mes: number;
  ano: number;
  horas_totales_validadas: number;
  estado: "borrador" | "revisado_supervisor" | "aprobado_administracion" | "observado";
  observaciones?: string | null;
  supervisor_id?: number;
  creado_en?: string;
}

export interface PeticionCrearAprobacionPracticas {
  becario_id: number;
  mes: number;
  ano: number;
  horas_totales_validadas: number;
  observaciones?: string;
}

/**
 * Registrar marcación de ingreso satelital.
 */
export async function registrarIngreso(
  datos: PeticionCoordenadas
): Promise<RegistroAsistencia> {
  return clienteApi.post<RegistroAsistencia>(
    RUTAS_API.ASISTENCIA.INGRESO,
    datos
  );
}

/**
 * Registrar marcación de salida satelital y cómputo de horas.
 */
export async function registrarSalida(
  datos: PeticionCoordenadas
): Promise<RegistroAsistencia> {
  return clienteApi.post<RegistroAsistencia>(
    RUTAS_API.ASISTENCIA.SALIDA,
    datos
  );
}

/**
 * Confirmación de presencia física en lote por organizador o supervisor.
 */
export async function confirmarOrganizador(
  datos: PeticionConfirmarOrganizador
): Promise<{ mensaje: string; registros: RegistroAsistencia[] }> {
  return clienteApi.post<{ mensaje: string; registros: RegistroAsistencia[] }>(
    RUTAS_API.ASISTENCIA.CONFIRMAR_ORGANIZADOR,
    datos
  );
}

/**
 * Registrar marcación manual por contingencia técnica.
 */
export async function registrarAsistenciaManual(
  datos: PeticionAsistenciaManual
): Promise<RegistroAsistencia> {
  return clienteApi.post<RegistroAsistencia>(
    RUTAS_API.ASISTENCIA.MANUAL,
    datos
  );
}

/**
 * Rectificar hora de llegada y anular retrasos/multas (Solo Administrador).
 */
export async function rectificarHoraAsistencia(
  id: number,
  datos: PeticionRectificarHora
): Promise<RegistroAsistencia> {
  return clienteApi.patch<RegistroAsistencia>(
    RUTAS_API.ASISTENCIA.RECTIFICAR_HORA(id),
    datos
  );
}

/**
 * Revisión y visado de asistencia por supervisor.
 */
export async function revisarSupervisorAsistencia(
  id: number,
  datos: PeticionRevisarAsistencia
): Promise<RegistroAsistencia> {
  return clienteApi.patch<RegistroAsistencia>(
    RUTAS_API.ASISTENCIA.REVISAR_SUPERVISOR(id),
    datos
  );
}

/**
 * Aprobación definitiva de asistencia por administración central.
 */
export async function aprobarAdministracionAsistencia(
  id: number,
  datos: PeticionRevisarAsistencia
): Promise<RegistroAsistencia> {
  return clienteApi.patch<RegistroAsistencia>(
    RUTAS_API.ASISTENCIA.APROBAR_ADMINISTRACION(id),
    datos
  );
}

/**
 * Listar catálogo general de multas por retrasos.
 */
export async function listarMultas(): Promise<Multa[]> {
  return clienteApi.get<Multa[]>(RUTAS_API.ASISTENCIA.MULTAS);
}

/**
 * Consultar multas del becario autenticado en sesión.
 */
export async function obtenerMisMultas(): Promise<Multa[]> {
  return clienteApi.get<Multa[]>(RUTAS_API.ASISTENCIA.MIS_MULTAS);
}

/**
 * Consultar historial de asistencias del becario autenticado.
 */
export async function obtenerMisAsistencias(
  becario_id?: number
): Promise<RegistroAsistencia[]> {
  const ruta = becario_id
    ? `${RUTAS_API.ASISTENCIA.MIS_ASISTENCIAS}?becario_id=${becario_id}`
    : RUTAS_API.ASISTENCIA.MIS_ASISTENCIAS;
  return clienteApi.get<RegistroAsistencia[]>(ruta);
}

/**
 * Obtener consolidado mensual de horas trabajadas por becario.
 */
export async function obtenerHorasMensuales(): Promise<
  Array<{
    becario_id: number;
    nombre: string;
    mes: number;
    ano: number;
    horas_totales: number;
  }>
> {
  return clienteApi.get<
    Array<{
      becario_id: number;
      nombre: string;
      mes: number;
      ano: number;
      horas_totales: number;
    }>
  >(RUTAS_API.ASISTENCIA.HORAS_MENSUALES);
}

/**
 * Listar registros de asistencia consolidados con filtros opcionales.
 */
export async function listarAsistencias(filtros?: {
  becario_id?: number;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<RegistroAsistencia[]> {
  const params = new URLSearchParams();
  if (filtros?.becario_id) params.append("becario_id", String(filtros.becario_id));
  if (filtros?.tipo) params.append("tipo", filtros.tipo);
  if (filtros?.fecha_inicio) params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros?.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);

  const query = params.toString();
  const ruta = query ? `${RUTAS_API.ASISTENCIA.BASE}?${query}` : RUTAS_API.ASISTENCIA.BASE;
  return clienteApi.get<RegistroAsistencia[]>(ruta);
}

// ==========================================
// Aprobaciones y Certificaciones de Prácticas
// ==========================================

/**
 * Convalidar y emitir certificación mensual de horas de práctica.
 */
export async function crearAprobacionPracticas(
  datos: PeticionCrearAprobacionPracticas
): Promise<AprobacionPracticas> {
  return clienteApi.post<AprobacionPracticas>(
    RUTAS_API.PRACTICAS.APROBACIONES,
    datos
  );
}

/**
 * Listar aprobaciones de prácticas emitidas en sistema.
 */
export async function listarAprobacionesPracticas(): Promise<AprobacionPracticas[]> {
  return clienteApi.get<AprobacionPracticas[]>(RUTAS_API.PRACTICAS.APROBACIONES);
}

/**
 * Consultar aprobaciones de un becario en particular.
 */
export async function obtenerAprobacionesPracticasPorBecario(
  becario_id: number
): Promise<AprobacionPracticas[]> {
  return clienteApi.get<AprobacionPracticas[]>(
    RUTAS_API.PRACTICAS.APROBACIONES_BECARIO(becario_id)
  );
}

/**
 * Obtener detalle de aprobación de práctica por ID.
 */
export async function obtenerAprobacionPracticasPorId(
  id: number
): Promise<AprobacionPracticas> {
  return clienteApi.get<AprobacionPracticas>(
    RUTAS_API.PRACTICAS.APROBACION_POR_ID(id)
  );
}

/**
 * Revisión de horas de práctica por supervisor (Paso 1).
 */
export async function revisarSupervisorPracticas(
  id: number,
  datos: { observaciones?: string }
): Promise<AprobacionPracticas> {
  return clienteApi.patch<AprobacionPracticas>(
    RUTAS_API.PRACTICAS.REVISAR_SUPERVISOR(id),
    datos
  );
}

/**
 * Aprobación definitiva de horas de práctica por administración (Paso 2).
 */
export async function aprobarAdministracionPracticas(
  id: number,
  datos: { observaciones?: string }
): Promise<AprobacionPracticas> {
  return clienteApi.patch<AprobacionPracticas>(
    RUTAS_API.PRACTICAS.APROBAR_ADMINISTRACION(id),
    datos
  );
}
