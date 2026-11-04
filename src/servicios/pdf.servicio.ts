/**
 * Servicio de Generación y Descarga de Reportes Oficiales en PDF
 * Integración con /pdf del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

/**
 * Helper utilitario para descargar un Blob como archivo en el navegador del cliente.
 */
export function activarDescargaNavegador(blob: Blob, nombre_archivo: string): void {
  if (typeof window === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre_archivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  window.URL.revokeObjectURL(url);
}

/**
 * Descargar informe oficial de evaluación (F-03) en PDF.
 */
export async function descargarPdfEvaluacion(
  id: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(RUTAS_API.PDF.EVALUACION(id));
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Evaluacion_${id}.pdf`);
  }
  return blob;
}

/**
 * Descargar acta de asistencia a evento en PDF.
 */
export async function descargarPdfEvento(
  id: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(RUTAS_API.PDF.EVENTO(id));
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Acta_Evento_${id}.pdf`);
  }
  return blob;
}

/**
 * Descargar matriz consolidada semestral de evaluaciones en PDF.
 */
export async function descargarPdfEvaluacionSemestral(
  periodo_id?: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const ruta = periodo_id
    ? `${RUTAS_API.PDF.EVALUACION_SEMESTRAL}?periodo_id=${periodo_id}`
    : RUTAS_API.PDF.EVALUACION_SEMESTRAL;
  const blob = await clienteApi.descargarBlob(ruta);
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Evaluacion_Semestral_${periodo_id || "Actual"}.pdf`);
  }
  return blob;
}

/**
 * Descargar acta de corte de asistencia mensual.
 */
export async function descargarPdfCorteAsistencia(
  mes?: number,
  ano?: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const params = new URLSearchParams();
  if (mes) params.append("mes", String(mes));
  if (ano) params.append("ano", String(ano));
  const query = params.toString();
  const ruta = query ? `${RUTAS_API.PDF.CORTE_ASISTENCIA}?${query}` : RUTAS_API.PDF.CORTE_ASISTENCIA;

  const blob = await clienteApi.descargarBlob(ruta);
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Corte_Asistencia_${mes || "Mes"}_${ano || "Ano"}.pdf`);
  }
  return blob;
}

/**
 * Descargar historial de recorridos y viáticos de un estudiante específico en PDF.
 */
export async function descargarPdfRecorridosEstudiante(
  becario_id: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(
    RUTAS_API.PDF.RECORRIDOS_ESTUDIANTE(becario_id)
  );
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Recorridos_Estudiante_${becario_id}.pdf`);
  }
  return blob;
}

/**
 * Descargar historial de asistencias de un estudiante en PDF.
 */
export async function descargarPdfAsistenciaEstudiante(
  becario_id: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(
    RUTAS_API.PDF.ASISTENCIA_ESTUDIANTE(becario_id)
  );
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Asistencia_Estudiante_${becario_id}.pdf`);
  }
  return blob;
}

/**
 * Descargar planilla oficial de reposición de refrigerio individual en PDF.
 */
export async function descargarPdfRefrigerio(
  id: number,
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(RUTAS_API.PDF.REFRIGERIOS_ID(id));
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Reposicion_Refrigerio_${id}.pdf`);
  }
  return blob;
}

/**
 * Descargar informe consolidado de refrigerios en PDF.
 */
export async function descargarPdfRefrigeriosConsolidado(
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(
    RUTAS_API.PDF.REFRIGERIOS_CONSOLIDADO
  );
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Consolidado_Refrigerios.pdf`);
  }
  return blob;
}

/**
 * Descargar consolidado general de auditoría institucional.
 */
export async function descargarPdfConsolidadoAuditoria(
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(
    RUTAS_API.PDF.CONSOLIDADO_AUDITORIA
  );
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Consolidado_Auditoria_BUMAND.pdf`);
  }
  return blob;
}

/**
 * Descargar reporte general de pasajes.
 */
export async function descargarPdfPasajesGeneral(
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(RUTAS_API.PDF.PASAJES_GENERAL);
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Reporte_General_Pasajes.pdf`);
  }
  return blob;
}

/**
 * Descargar reporte general de justificaciones.
 */
export async function descargarPdfJustificacionesGeneral(
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(
    RUTAS_API.PDF.JUSTIFICACIONES_GENERAL
  );
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Reporte_General_Justificaciones.pdf`);
  }
  return blob;
}

/**
 * Descargar reporte general de asistencias.
 */
export async function descargarPdfAsistenciaGeneral(
  descargar_inmediatamente: boolean = true
): Promise<Blob> {
  const blob = await clienteApi.descargarBlob(
    RUTAS_API.PDF.ASISTENCIA_GENERAL
  );
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Reporte_General_Asistencias.pdf`);
  }
  return blob;
}
