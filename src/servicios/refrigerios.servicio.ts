/**
 * Servicio de Refrigerios y Planilla de Reposición para Frontend
 * Integración con /refrigerios del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type EstadoRefrigerio =
  | "programado"
  | "rendido"
  | "revisado_supervisor"
  | "aprobado_administracion"
  | "observado";

export type ModalidadPreparacion = "casera" | "adquisicion_directa";

export interface DuplaRefrigerio {
  id: number;
  nombre: string;
  ci?: string;
  correo?: string;
}

export interface Refrigerio {
  id: number;
  fecha: string;
  costo_total: number;
  raciones_planificadas: number;
  raciones_entregadas?: number;
  estado: EstadoRefrigerio;
  modalidad_preparacion?: ModalidadPreparacion;
  menu_detalle?: string | null;
  ingredientes_detalle?: string | null;
  becario_encargado_1_id: number;
  becario_encargado_2_id: number;
  becario_receptor_reembolso_id?: number | null;
  becario_encargado_1?: DuplaRefrigerio;
  becario_encargado_2?: DuplaRefrigerio;
  becario_receptor_reembolso?: DuplaRefrigerio | null;
  observaciones?: string | null;
  creado_en?: string;
}

export interface RespuestaMiTurno {
  es_mi_turno: boolean;
  refrigerio?: Refrigerio | null;
  companero?: DuplaRefrigerio | null;
  fecha?: string;
  presupuesto_referencial?: number;
}

export interface PlanillaReposicionRefrigerio {
  refrigerio_id: number;
  fecha: string;
  menu: string;
  costo_total_devolucion: number;
  modalidad: ModalidadPreparacion;
  dupla: string[];
  becario_receptor: string;
  estado: EstadoRefrigerio;
  desglose_ingredientes?: unknown[];
}

export interface PeticionSortearDupla {
  fecha: string;
  becario_1_id?: number;
  becario_2_id?: number;
  presupuesto?: number;
  observaciones?: string;
}

export interface PeticionRendirRefrigerio {
  costo_total: number;
  modalidad_preparacion: ModalidadPreparacion;
  menu_detalle: string;
  ingredientes_detalle?: string;
  raciones_entregadas?: number;
  observaciones?: string;
}

export interface PeticionRevisarSupervisorRefrigerio {
  observaciones?: string;
}

export interface PeticionAprobarAdminRefrigerio {
  becario_receptor_reembolso_id: number;
  observaciones?: string;
}

/**
 * Asignar o programar la dupla de dos becarios para el refrigerio del viernes.
 */
export async function asignarDuplaRefrigerio(
  datos: PeticionSortearDupla
): Promise<Refrigerio> {
  return clienteApi.post<Refrigerio>(
    RUTAS_API.REFRIGERIOS.ASIGNAR_DUPLA,
    datos
  );
}

/**
 * Consultar si el becario autenticado tiene turno activo de refrigerio.
 */
export async function obtenerMiTurnoRefrigerio(): Promise<RespuestaMiTurno> {
  return clienteApi.get<RespuestaMiTurno>(RUTAS_API.REFRIGERIOS.MI_TURNO);
}

/**
 * Listar catálogo de refrigerios programados y rendidos con filtro temporal opcional.
 */
export async function listarRefrigerios(filtros?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<Refrigerio[]> {
  const params = new URLSearchParams();
  if (filtros?.fecha_inicio) params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros?.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);

  const query = params.toString();
  const ruta = query ? `${RUTAS_API.REFRIGERIOS.BASE}?${query}` : RUTAS_API.REFRIGERIOS.BASE;
  return clienteApi.get<Refrigerio[]>(ruta);
}

/**
 * Emitir la planilla institucional de reposición de fondos de refrigerio al 100%.
 */
export async function generarPlanillaReposicion(
  id: number
): Promise<PlanillaReposicionRefrigerio> {
  return clienteApi.get<PlanillaReposicionRefrigerio>(
    RUTAS_API.REFRIGERIOS.PLANILLA_REPOSICION(id)
  );
}

/**
 * Rendir gastos e ingredientes del refrigerio por la dupla asignada.
 */
export async function rendirRefrigerio(
  id: number,
  datos: PeticionRendirRefrigerio
): Promise<Refrigerio> {
  return clienteApi.patch<Refrigerio>(
    RUTAS_API.REFRIGERIOS.RENDIR(id),
    datos
  );
}

/**
 * Marcar rendición de refrigerio como revisada por Supervisor.
 */
export async function revisarSupervisorRefrigerio(
  id: number,
  datos: PeticionRevisarSupervisorRefrigerio
): Promise<Refrigerio> {
  return clienteApi.patch<Refrigerio>(
    RUTAS_API.REFRIGERIOS.REVISAR_SUPERVISOR(id),
    datos
  );
}

/**
 * Aprobar reembolso institucional del 100% y asentar al receptor único del dinero.
 */
export async function aprobarAdministracionRefrigerio(
  id: number,
  datos: PeticionAprobarAdminRefrigerio
): Promise<Refrigerio> {
  return clienteApi.patch<Refrigerio>(
    RUTAS_API.REFRIGERIOS.APROBAR_ADMINISTRACION(id),
    datos
  );
}

/**
 * Obtener detalle completo de un registro de refrigerio por ID.
 */
export async function obtenerRefrigerioPorId(id: number): Promise<Refrigerio> {
  return clienteApi.get<Refrigerio>(RUTAS_API.REFRIGERIOS.POR_ID(id));
}

/**
 * Modificar un refrigerio institucional.
 */
export async function actualizarRefrigerio(
  id: number,
  datos: Partial<Refrigerio>
): Promise<Refrigerio> {
  return clienteApi.put<Refrigerio>(RUTAS_API.REFRIGERIOS.POR_ID(id), datos);
}

/**
 * Eliminar un registro de refrigerio (Solo Administradores).
 */
export async function eliminarRefrigerio(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.REFRIGERIOS.POR_ID(id)
  );
}


export const refrigeriosServicio = {
  obtenerTodos: listarRefrigerios,
  obtenerPorId: obtenerRefrigerioPorId,
  asignarDupla: asignarDuplaRefrigerio,
  obtenerMiTurno: obtenerMiTurnoRefrigerio,
  generarPlanillaReposicion,
  rendir: rendirRefrigerio,
  revisarSupervisor: revisarSupervisorRefrigerio,
  aprobarAdministracion: aprobarAdministracionRefrigerio,
  actualizar: actualizarRefrigerio,
  eliminar: eliminarRefrigerio,
};
