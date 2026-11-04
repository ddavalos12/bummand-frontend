/**
 * Servicio de Biblia, Versículos Diarios y Devocionales con Acompañamiento Pastoral
 * Integración con /biblia y /devocionales del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export interface VersiculoBiblico {
  cita: string;
  libro: string;
  capitulo: number;
  versiculo: string;
  texto: string;
  version?: string;
  reflexion_diaconal?: string;
}

export interface Devocional {
  id: number;
  becario_id: number;
  fecha: string;
  cita_biblica: string;
  pasaje_texto?: string | null;
  reflexion_personal: string;
  peticion_oracion?: string | null;
  retroalimentacion_pastoral?: string | null;
  pastor_id?: number | null;
  creado_en?: string;
  actualizado_en?: string;
  becario?: {
    id: number;
    ci: string;
    usuario?: {
      nombre: string;
    };
  };
}

export interface CitaSeguimientoPastoral {
  id: number;
  becario_id: number;
  supervisor_id: number;
  fecha_programada: string;
  modalidad: "presencial" | "virtual";
  lugar_o_enlace?: string | null;
  motivo?: string | null;
  acuerdos_conclusiones?: string | null;
  estado: "programada" | "completada" | "cancelada" | "reprogramada";
  becario?: {
    id: number;
    usuario?: {
      nombre: string;
    };
  };
}

export interface PeticionCrearDevocional {
  cita_biblica: string;
  pasaje_texto?: string;
  reflexion_personal: string;
  peticion_oracion?: string;
  fecha?: string;
}

export interface PeticionRetroalimentarDevocional {
  retroalimentacion_pastoral: string;
}

export interface PeticionCrearCitaSeguimiento {
  becario_id: number;
  fecha_programada: string;
  modalidad: "presencial" | "virtual";
  lugar_o_enlace?: string;
  motivo?: string;
}

export interface PeticionActualizarCitaSeguimiento {
  fecha_programada?: string;
  modalidad?: "presencial" | "virtual";
  lugar_o_enlace?: string;
  acuerdos_conclusiones?: string;
  estado?: "programada" | "completada" | "cancelada" | "reprogramada";
}

// ==========================================
// Módulo Bíblico
// ==========================================

/**
 * Obtener versículo bíblico del día asignado (Reina-Valera 1960).
 */
export async function obtenerVersiculoDiario(
  fecha?: string
): Promise<VersiculoBiblico> {
  const ruta = fecha
    ? `${RUTAS_API.BIBLIA.VERSICULO_DIARIO}?fecha=${encodeURIComponent(fecha)}`
    : RUTAS_API.BIBLIA.VERSICULO_DIARIO;
  return clienteApi.get<VersiculoBiblico>(ruta);
}

/**
 * Descargar paquete de versículos devocionales para almacenamiento offline local.
 */
export async function obtenerPaqueteOfflineBiblia(): Promise<VersiculoBiblico[]> {
  return clienteApi.get<VersiculoBiblico[]>(RUTAS_API.BIBLIA.PAQUETE_OFFLINE);
}

/**
 * Buscar texto bíblico por cita o referencia (ej: "Filipenses 4:13").
 */
export async function buscarPasajeBiblico(
  cita: string
): Promise<VersiculoBiblico> {
  const ruta = `${RUTAS_API.BIBLIA.PASAJE}?cita=${encodeURIComponent(cita)}`;
  return clienteApi.get<VersiculoBiblico>(ruta);
}

// ==========================================
// Módulo de Devocionales
// ==========================================

/**
 * Registrar un nuevo devocional o meditación bíblica diaria.
 */
export async function crearDevocional(
  datos: PeticionCrearDevocional
): Promise<Devocional> {
  return clienteApi.post<Devocional>(RUTAS_API.DEVOCIONALES.BASE, datos);
}

/**
 * Listar devocionales (según rol, supervisor ve su cohorte, becario los suyos).
 */
export async function listarDevocionales(): Promise<Devocional[]> {
  return clienteApi.get<Devocional[]>(RUTAS_API.DEVOCIONALES.BASE);
}

/**
 * Listar el historial de devocionales de un becario determinado.
 */
export async function obtenerDevocionalesPorBecario(
  becario_id: number
): Promise<Devocional[]> {
  return clienteApi.get<Devocional[]>(
    RUTAS_API.DEVOCIONALES.POR_BECARIO(becario_id)
  );
}

/**
 * Obtener los detalles de un devocional por su ID.
 */
export async function obtenerDevocionalPorId(
  id: number
): Promise<Devocional> {
  return clienteApi.get<Devocional>(RUTAS_API.DEVOCIONALES.POR_ID(id));
}

/**
 * Retroalimentar pastoralmente un devocional de un becario.
 */
export async function retroalimentarDevocional(
  id: number,
  datos: PeticionRetroalimentarDevocional
): Promise<Devocional> {
  return clienteApi.patch<Devocional>(
    RUTAS_API.DEVOCIONALES.RETROALIMENTAR(id),
    datos
  );
}

/**
 * Eliminar un registro de devocional propio.
 */
export async function eliminarDevocional(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.DEVOCIONALES.POR_ID(id)
  );
}

// ==========================================
// Citas de Acompañamiento y Mentoría Pastoral
// ==========================================

/**
 * Listar becarios asignados al supervisor para agendar citas.
 */
export async function listarMisSupervisadosCitas(): Promise<unknown[]> {
  return clienteApi.get<unknown[]>(RUTAS_API.DEVOCIONALES.MIS_SUPERVISADOS);
}

/**
 * Agendar una cita de seguimiento pastoral con un becario.
 */
export async function agendarCitaSeguimiento(
  datos: PeticionCrearCitaSeguimiento
): Promise<CitaSeguimientoPastoral> {
  return clienteApi.post<CitaSeguimientoPastoral>(
    RUTAS_API.DEVOCIONALES.CITAS,
    datos
  );
}

/**
 * Listar citas de seguimiento pastoral asociadas al usuario autenticado.
 */
export async function listarCitasSeguimiento(): Promise<CitaSeguimientoPastoral[]> {
  return clienteApi.get<CitaSeguimientoPastoral[]>(
    RUTAS_API.DEVOCIONALES.CITAS
  );
}

/**
 * Actualizar una cita de seguimiento, reprogramar o asentar acuerdos y reflexiones.
 */
export async function actualizarCitaSeguimiento(
  id: number,
  datos: PeticionActualizarCitaSeguimiento
): Promise<CitaSeguimientoPastoral> {
  return clienteApi.patch<CitaSeguimientoPastoral>(
    RUTAS_API.DEVOCIONALES.CITA_POR_ID(id),
    datos
  );
}
