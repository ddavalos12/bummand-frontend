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

export interface ParametrosConsultaPdfPasajes {
  fecha_inicio?: string;
  fecha_fin?: string;
  descontar_multas?: boolean;
  descargar_inmediatamente?: boolean;
}

function construirRutaPdfConMultas(
  ruta_base: string,
  opciones?: boolean | ParametrosConsultaPdfPasajes,
  descontar_multas?: boolean
): { ruta: string; descargar_inmediatamente: boolean } {
  const es_objeto = typeof opciones === "object" && opciones !== null;
  const descargar = es_objeto
    ? opciones.descargar_inmediatamente ?? true
    : opciones ?? true;
  const descuento = es_objeto ? opciones.descontar_multas : descontar_multas;

  const params = new URLSearchParams();
  if (es_objeto && opciones.fecha_inicio) {
    params.append("fecha_inicio", opciones.fecha_inicio);
  }
  if (es_objeto && opciones.fecha_fin) {
    params.append("fecha_fin", opciones.fecha_fin);
  }
  if (descuento !== undefined) {
    params.append("descontar_multas", descuento ? "true" : "false");
  }

  const query = params.toString();
  return {
    ruta: query ? `${ruta_base}?${query}` : ruta_base,
    descargar_inmediatamente: descargar,
  };
}

/**
 * Descargar consolidado general de auditoría institucional.
 */
export async function descargarPdfConsolidadoAuditoria(
  opciones: boolean | ParametrosConsultaPdfPasajes = true,
  descontar_multas?: boolean
): Promise<Blob> {
  const { ruta, descargar_inmediatamente } = construirRutaPdfConMultas(
    RUTAS_API.PDF.CONSOLIDADO_AUDITORIA,
    opciones,
    descontar_multas
  );
  const blob = await clienteApi.descargarBlob(ruta);
  if (descargar_inmediatamente) {
    activarDescargaNavegador(blob, `Consolidado_Contabilidad_BUMAND.pdf`);
  }
  return blob;
}

/**
 * Descargar reporte general de pasajes.
 */
export async function descargarPdfPasajesGeneral(
  opciones: boolean | ParametrosConsultaPdfPasajes = true,
  descontar_multas?: boolean
): Promise<Blob> {
  const { ruta, descargar_inmediatamente } = construirRutaPdfConMultas(
    RUTAS_API.PDF.PASAJES_GENERAL,
    opciones,
    descontar_multas
  );
  const blob = await clienteApi.descargarBlob(ruta);
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

export type ClaveFirmanteDonacion = "ruth" | "pamela" | "samuel";

export interface InformacionFirmanteDonacion {
  clave: ClaveFirmanteDonacion;
  nombre: string;
  cargo: string;
}

export const FIRMANTES_OFICIALES_DONACION: readonly InformacionFirmanteDonacion[] = [
  {
    clave: "pamela",
    nombre: "Pamela Sanchez Cachi",
    cargo: "Encargado de Responsabilidad Social Diaconal",
  },
  {
    clave: "ruth",
    nombre: "Ruth Alesandra Choque Huanca",
    cargo: "Asistente de Sostenibilidad y Responsabilidad Diaconal",
  },
  {
    clave: "samuel",
    nombre: "Samuel Martín Durán Baspineiro",
    cargo: "Subgerente Nacional de Sostenibilidad y Responsabilidad Diaconal",
  },
] as const;

export interface ParametrosPlanillaDonacion {
  fecha_inicio?: string;
  fecha_fin?: string;
  mes?: string;
  con_firma?: boolean;
  firmante_1?: ClaveFirmanteDonacion;
  firmante_2?: ClaveFirmanteDonacion;
  descontar_multas?: boolean;
  descargar_inmediatamente?: boolean;
}

function construirConsultaPlanillaDonacion(
  parametros: ParametrosPlanillaDonacion
): string {
  const consulta = new URLSearchParams();
  if (parametros.fecha_inicio) {
    consulta.append("fecha_inicio", parametros.fecha_inicio);
  }
  if (parametros.fecha_fin) {
    consulta.append("fecha_fin", parametros.fecha_fin);
  }
  if (parametros.mes) {
    consulta.append("mes", parametros.mes);
  }
  if (parametros.con_firma !== undefined) {
    consulta.append("con_firma", parametros.con_firma ? "true" : "false");
  }
  if (parametros.firmante_1) {
    consulta.append("firmante_1", parametros.firmante_1);
  }
  if (parametros.firmante_2) {
    consulta.append("firmante_2", parametros.firmante_2);
  }
  if (parametros.descontar_multas !== undefined) {
    consulta.append("descontar_multas", parametros.descontar_multas ? "true" : "false");
  }
  const texto_consulta = consulta.toString();
  return texto_consulta ? `?${texto_consulta}` : "";
}

async function descargarPlanillaDonacion(
  ruta_base: string,
  prefijo_archivo: string,
  parametros: ParametrosPlanillaDonacion = {}
): Promise<Blob> {
  const {
    con_firma = false,
    firmante_1 = "pamela",
    firmante_2 = "samuel",
    descargar_inmediatamente = true,
  } = parametros;

  const consulta = construirConsultaPlanillaDonacion({
    ...parametros,
    con_firma,
    firmante_1,
    firmante_2,
  });
  const ruta = `${ruta_base}${consulta}`;

  try {
    const blob = await clienteApi.descargarBlob(ruta);
    if (!blob || blob.size === 0) {
      throw new Error("El servidor devolvió un documento PDF vacío.");
    }
    if (blob.type && blob.type.includes("application/json")) {
      const texto_error = await blob.text();
      let mensaje_error = "No se pudo generar la planilla oficial en PDF.";
      try {
        const datos = JSON.parse(texto_error);
        mensaje_error = datos.mensaje || datos.message || mensaje_error;
      } catch {
        // Mantiene mensaje predeterminado
      }
      throw new Error(mensaje_error);
    }
    const cabecera_pdf = await blob.slice(0, 5).text();
    if (cabecera_pdf !== "%PDF-") {
      throw new Error("La respuesta del servidor no corresponde a un archivo PDF válido.");
    }

    if (descargar_inmediatamente) {
      const sufijo_firma = con_firma ? "Archivo_Con_Firma" : "Contabilidad_Sin_Firma";
      const sufijo_multas = parametros.descontar_multas ? "_ConDescuentoMultas" : "";
      const sufijo_periodo =
        parametros.mes ||
        (parametros.fecha_inicio && parametros.fecha_fin
          ? `${parametros.fecha_inicio}_al_${parametros.fecha_fin}`
          : "Vigente");
      activarDescargaNavegador(
        blob,
        `${prefijo_archivo}_${sufijo_firma}${sufijo_multas}_${sufijo_periodo}.pdf`
      );
    }

    return blob;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "No se pudo conectar con el servidor para generar el PDF oficial."
        );
      }
      throw error;
    }
    throw new Error(
      "Ocurrió un error inesperado al descargar la planilla oficial en PDF."
    );
  }
}

/**
 * Descargar planilla oficial de donación de refrigerio en PDF.
 */
export async function descargarPdfDonacionRefrigerio(
  parametros: ParametrosPlanillaDonacion = {}
): Promise<Blob> {
  const parametros_refrigerio: ParametrosPlanillaDonacion = { ...parametros };
  delete parametros_refrigerio.descontar_multas;
  return descargarPlanillaDonacion(
    RUTAS_API.PDF.DONACION_REFRIGERIO,
    "Planilla_Donacion_Refrigerio_BUMAND",
    parametros_refrigerio
  );
}

/**
 * Descargar planilla oficial de donación de transporte en PDF.
 */
export async function descargarPdfDonacionTransporte(
  parametros: ParametrosPlanillaDonacion = {}
): Promise<Blob> {
  return descargarPlanillaDonacion(
    RUTAS_API.PDF.DONACION_TRANSPORTE,
    "Planilla_Donacion_Transporte_BUMAND",
    parametros
  );
}
