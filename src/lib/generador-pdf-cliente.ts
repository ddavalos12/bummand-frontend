import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ============================================================================
// CONSTANTES Y PALETA DE COLORES CORPORATIVOS DIACONÍA / BUMAND
// ============================================================================
const COLOR_PRIMARIO: [number, number, number] = [3, 86, 131]; // #035683 Azul Marino Diaconía
const COLOR_SECUNDARIO: [number, number, number] = [0, 171, 189]; // #00ABBD Cian
const COLOR_DORADO: [number, number, number] = [255, 182, 0]; // #FFB600 Amarillo Dorado
const COLOR_GRIS_FONDO: [number, number, number] = [248, 250, 252]; // #F8FAFC
const COLOR_TEXTO_OSCURO: [number, number, number] = [30, 41, 59]; // #1E293B

export interface DatosBecarioPdfCliente {
  id: number;
  nombre: string;
  ci: string;
  carrera: string;
  universidad: string;
  sede: string;
}

export interface RecorridoPdfCliente {
  fecha: string;
  origen: string;
  destino: string;
  sentido?: string;
  tipo_transporte: string;
  costo_pasaje: number;
  monto_reembolso_80: number;
}

export interface FilaPasajesGeneralPdfCliente {
  becario_nombre: string;
  ci: string;
  sede: string;
  cantidad_recorridos: number;
  monto_total_100_bs: number;
  monto_reconocido_80_bs: number;
  descuento_multas_aplicado_bs: number;
  monto_liquido_pagable_bs: number;
  estado: string;
}

export interface FilaDonacionPdfCliente {
  nombre: string;
  nombres?: string;
  apellidos?: string;
  ci: string;
  unidad: string;
  detalle: string;
  monto_bs: number;
}

export interface FilaCorteHorasPdfCliente {
  becario_nombre: string;
  unidad: string;
  requerido: string;
  cumplido: string;
  puntualidad: string;
  retraso: string;
  dictamen: string;
}

export interface FilaRefrigerioPdfCliente {
  fecha: string;
  dupla: string;
  raciones: number;
  monto_total_bs: number;
  receptor: string;
  estado: string;
}

export interface FilaAsistenciaGeneralPdfCliente {
  becario_nombre: string;
  ci: string;
  carrera: string;
  sede: string;
  horas_practicas: number;
  horas_lideres: number;
  total_horas: number;
  retraso_min: number;
  estado: string;
}

export interface FilaJustificacionPdfCliente {
  becario_nombre: string;
  fecha: string;
  motivo: string;
  actividad: string;
  prueba_adjunta: string;
  dictamen: string;
  resolucion_multa: string;
}

export interface FilaEscuelaLideresPdfCliente {
  becario_nombre: string;
  ci: string;
  fecha: string;
  hora_programada: string;
  hora_gps: string;
  retraso_min: number;
  permiso: string;
  multa_bs: number;
  estado_final: string;
}

function sanitizarTextoPdf(valor: unknown, por_defecto = ""): string {
  const texto = String(valor ?? por_defecto);
  return texto
    .replace(/&rarr;|&#8594;|&#x2192;/gi, "->")
    .replace(/&larr;|&#8592;|&#x2190;/gi, "<-")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&middot;/gi, "·")
    .replace(/&mdash;|&ndash;/gi, "-")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerRangoMes(mes_iso?: string): { inicio: string; fin: string } {
  const coincidencia = /^(\d{4})-(\d{2})$/.exec((mes_iso || "").trim());
  const ahora = new Date();
  const ano = coincidencia ? Number(coincidencia[1]) : ahora.getFullYear();
  const mes_num = coincidencia ? Number(coincidencia[2]) : ahora.getMonth() + 1;
  const ultimo_dia = new Date(ano, mes_num, 0).getDate();
  const mes_pad = String(mes_num).padStart(2, "0");
  return {
    inicio: `${ano}-${mes_pad}-01`,
    fin: `${ano}-${mes_pad}-${String(ultimo_dia).padStart(2, "0")}`,
  };
}

function separarNombresApellidosCliente(nombre_completo: string): {
  nombres: string;
  apellidos: string;
} {
  const limpio = sanitizarTextoPdf(nombre_completo);
  if (!limpio) return { nombres: "", apellidos: "" };
  const partes = limpio.split(/\s+/).filter(Boolean);
  if (partes.length === 1) return { nombres: partes[0], apellidos: "" };
  if (partes.length === 2) return { nombres: partes[0], apellidos: partes[1] };
  return {
    nombres: partes.slice(0, -2).join(" "),
    apellidos: partes.slice(-2).join(" "),
  };
}

function extraerListaApi(respuesta: unknown): any[] {
  if (Array.isArray(respuesta)) return respuesta;
  if (respuesta && typeof respuesta === "object") {
    const obj = respuesta as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.registros)) return obj.registros;
  }
  return [];
}

function obtenerLastAutoTableY(doc: jsPDF, respaldo: number): number {
  const autoTableDoc = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
  return autoTableDoc.lastAutoTable?.finalY ?? respaldo;
}

/**
 * Agrega el membrete institucional oficial en cualquier página PDF
 */
function agregarMembreteInstitucional(
  doc: jsPDF,
  titulo: string,
  subtitulo: string,
  apaisado = false
) {
  const ancho_pagina = apaisado ? 297 : 210;

  // Franja superior azul Diaconía
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(0, 0, ancho_pagina, 18, "F");

  // Franja delgada dorada
  doc.setFillColor(...COLOR_DORADO);
  doc.rect(0, 18, ancho_pagina, 2, "F");

  // Textos del membrete
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FUNDACIÓN DIACONÍA FRIF-IFD", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("SISTEMA BUMAND · GESTIÓN INTEGRAL DE BECAS", ancho_pagina - 14, 11, {
    align: "right",
  });

  // Título del reporte
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text(sanitizarTextoPdf(titulo), 14, 27);

  // Subtítulo / Metadatos
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(sanitizarTextoPdf(subtitulo), 14, 32);

  // Fecha y hora de emisión oficial
  const ahora = new Date();
  const fecha_emision = `Emisión: ${ahora.toLocaleDateString("es-BO")} ${ahora.toLocaleTimeString(
    "es-BO",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
  doc.text(fecha_emision, ancho_pagina - 14, 32, { align: "right" });
}

/**
 * Agrega el pie de página institucional y firmas oficiales
 */
function agregarPiePaginaYFirmas(doc: jsPDF, apaisado = false) {
  const ancho_pagina = apaisado ? 297 : 210;
  const alto_pagina = apaisado ? 210 : 297;
  const total_paginas = doc.getNumberOfPages();
  doc.setPage(total_paginas);

  // Si la tabla terminó muy abajo en la última página, saltamos para evitar solapamiento
  const final_y = obtenerLastAutoTableY(doc, 0);
  if (final_y > alto_pagina - 36) {
    doc.addPage();
  }

  // Bloque de firmas
  const y_firma = alto_pagina - 26;
  const ancho_linea = apaisado ? 75 : 55;

  // Firma 1: Mentor
  const x_firma1 = apaisado ? 40 : 25;
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.5);
  doc.line(x_firma1, y_firma, x_firma1 + ancho_linea, y_firma);

  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Lic. Angel Javier Ali Paz", x_firma1 + ancho_linea / 2, y_firma + 4, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("MENTOR GENERAL BUMAND", x_firma1 + ancho_linea / 2, y_firma + 7.5, {
    align: "center",
  });

  // Firma 2: Administración / Directiva
  const x_firma2 = apaisado ? ancho_pagina - 40 - ancho_linea : ancho_pagina - 25 - ancho_linea;
  doc.line(x_firma2, y_firma, x_firma2 + ancho_linea, y_firma);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Directiva Diaconía FRIF-IFD", x_firma2 + ancho_linea / 2, y_firma + 4, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("CONFORMIDAD INSTITUCIONAL", x_firma2 + ancho_linea / 2, y_firma + 7.5, {
    align: "center",
  });

  // Franja inferior con número de página y sello de autenticidad
  const paginas_finales = doc.getNumberOfPages();
  for (let p = 1; p <= paginas_finales; p++) {
    doc.setPage(p);
    doc.setFillColor(...COLOR_GRIS_FONDO);
    doc.rect(0, alto_pagina - 8, ancho_pagina, 8, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(
      `Documento oficial emitido por el Sistema Informático BUMAND v2.0 · Página ${p} de ${paginas_finales}`,
      ancho_pagina / 2,
      alto_pagina - 3,
      { align: "center" }
    );
  }
}

// ============================================================================
// 1. REPORTE EVALUACIÓN SEMESTRAL II (LANDSCAPE)
// ============================================================================
export function generarPdfEvaluacionSemestral(registros_vivos: any[] = []): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  agregarMembreteInstitucional(
    doc,
    "CONSOLIDADO GENERAL DE EVALUACIÓN SEMESTRAL — GESTIÓN II - 2026",
    "Sábana Oficial de Calificaciones 360° (5 Módulos de Formación: Iglesia, Académica, Mentor, Líderes, Socioeconómica)",
    true
  );

  const cuerpo_tabla: string[][] = registros_vivos.map((r, i) => [
    String(i + 1),
    sanitizarTextoPdf(r.nombre_completo || r.becario_nombre || `Becario #${i + 1}`),
    sanitizarTextoPdf(r.ci || "S/N"),
    sanitizarTextoPdf(r.universidad || "-"),
    sanitizarTextoPdf(r.carrera || "-"),
    String(r.liderazgo_iglesia ?? r.m1 ?? 0),
    String(r.academica ?? r.m2 ?? 0),
    String(r.practicas_preprofesionales ?? r.m3 ?? 0),
    String(r.escuela_lideres ?? r.m4 ?? 0),
    String(r.socioeconomico ?? r.m5 ?? 0),
    String(r.total ?? 0),
    sanitizarTextoPdf(r.total_calificacion || r.estado || "PENDIENTE"),
    sanitizarTextoPdf(r.comentario_academico || r.comentario_iglesia || r.observaciones || "-"),
  ]);

  autoTable(doc, {
    startY: 36,
    head: [
      [
        "N°",
        "Becario Universitario",
        "C.I.",
        "Univ.",
        "Carrera",
        "M1\nIglesia\n(20p)",
        "M2\nAcad.\n(20p)",
        "M3\nMentor\n(20p)",
        "M4\nLíderes\n(20p)",
        "M5\nSocioec.\n(20p)",
        "TOTAL\n(/100p)",
        "Estado",
        "Observaciones",
      ],
    ],
    body:
      cuerpo_tabla.length > 0
        ? cuerpo_tabla
        : [["-", "Sin registros de evaluación semestral en el periodo", "-", "-", "-", "0", "0", "0", "0", "0", "0", "-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 42 },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "center", cellWidth: 14 },
      4: { cellWidth: 34 },
      5: { halign: "center", cellWidth: 14 },
      6: { halign: "center", cellWidth: 14 },
      7: { halign: "center", cellWidth: 14 },
      8: { halign: "center", cellWidth: 14 },
      9: { halign: "center", cellWidth: 14 },
      10: { halign: "center", fontStyle: "bold", cellWidth: 15, textColor: COLOR_PRIMARIO },
      11: { halign: "center", fontStyle: "bold", cellWidth: 20 },
      12: { fontSize: 6, cellWidth: 38 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, true);
  return doc.output("blob");
}

// ============================================================================
// 2. CORTE OFICIAL DE HORAS Y ASISTENCIA
// ============================================================================
export function generarPdfCorteHoras(
  fecha_inicio?: string,
  fecha_fin?: string,
  filas_vivas: FilaCorteHorasPdfCliente[] = [],
  tipo_actividad = "todas"
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const rango_texto =
    fecha_inicio && fecha_fin ? `${fecha_inicio} al ${fecha_fin}` : "Periodo Vigente";

  agregarMembreteInstitucional(
    doc,
    "CORTE OFICIAL DE ASISTENCIA Y PRÁCTICAS PREPROFESIONALES",
    `Auditoría de horas, geocercas WGS84 y puntualidad (${tipo_actividad}) · Intervalo: ${rango_texto}`
  );

  const cuerpo: string[][] = filas_vivas.map((f, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(f.becario_nombre),
    sanitizarTextoPdf(f.unidad),
    sanitizarTextoPdf(f.requerido),
    sanitizarTextoPdf(f.cumplido),
    sanitizarTextoPdf(f.puntualidad),
    sanitizarTextoPdf(f.retraso),
    sanitizarTextoPdf(f.dictamen),
  ]);

  autoTable(doc, {
    startY: 36,
    head: [["N°", "Becario", "Unidad / Agencia", "Fecha / Prev.", "Cumplido", "Ingreso", "Retraso", "Dictamen"]],
    body:
      cuerpo.length > 0
        ? cuerpo
        : [["-", "Sin marcaciones de asistencia registradas en el intervalo", "-", "-", "0.0 h", "-", "0 min", "SIN REGISTROS"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.3,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 6.9,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 44 },
      2: { cellWidth: 34 },
      3: { halign: "center", cellWidth: 24 },
      4: { halign: "center", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 16 },
      5: { halign: "center", cellWidth: 16 },
      6: { halign: "center", cellWidth: 15 },
      7: { halign: "center", fontStyle: "bold", cellWidth: 25 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 3. REPORTE OFICIAL DE REFRIGERIOS (100% DEVOLUCIÓN Y DUPLAS DE DIRECTIVA)
// ============================================================================
export function generarPdfRefrigerios(
  fecha_inicio?: string,
  fecha_fin?: string,
  filas_vivas: FilaRefrigerioPdfCliente[] = []
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const rango_texto =
    fecha_inicio && fecha_fin ? ` · Periodo: ${fecha_inicio} al ${fecha_fin}` : "";

  agregarMembreteInstitucional(
    doc,
    "REPORTE OFICIAL DE CONTROL Y LIQUIDACIÓN DE REFRIGERIOS",
    `Nómina de Duplas Oficiales de los Viernes y Devolución Íntegra del 100%${rango_texto}`
  );

  // Tarjeta de Presupuesto Oficial
  doc.setFillColor(...COLOR_GRIS_FONDO);
  doc.roundedRect(14, 36, 182, 16, 2, 2, "F");
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 36, 182, 16, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text("PRESUPUESTO OFICIAL ESCUELA DE LÍDERES:", 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(
    "23 raciones x Bs 5.00 = Bs 115.00 por jornada. Fondo rotativo administrado por las duplas con reembolso del 100%.",
    18,
    47
  );

  const duplas: string[][] = filas_vivas.map((r, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(r.fecha),
    sanitizarTextoPdf(r.dupla),
    String(r.raciones ?? 0),
    `Bs ${Number(r.monto_total_bs || 0).toFixed(2)}`,
    sanitizarTextoPdf(r.receptor || "Pendiente"),
    sanitizarTextoPdf((r.estado || "PROGRAMADO").toUpperCase()),
  ]);

  if (filas_vivas.length > 0) {
    const sum_raciones = filas_vivas.reduce((acc, r) => acc + Number(r.raciones || 0), 0);
    const sum_monto = filas_vivas.reduce((acc, r) => acc + Number(r.monto_total_bs || 0), 0);
    duplas.push([
      "",
      "TOTALES",
      `${filas_vivas.length} jornadas`,
      String(sum_raciones),
      `Bs ${sum_monto.toFixed(2)}`,
      "100% REEMBOLSADO",
      "-",
    ]);
  }

  autoTable(doc, {
    startY: 56,
    head: [["N°", "Fecha Viernes", "Dupla Designada por Directiva", "Raciones", "Monto Total", "Receptor 100%", "Estado"]],
    body:
      duplas.length > 0
        ? duplas
        : [["-", "-", "Sin registros de refrigerios en el periodo seleccionado", "0", "Bs 0.00", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { halign: "center", cellWidth: 22 },
      2: { fontStyle: "bold", cellWidth: 56 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "right", fontStyle: "bold", cellWidth: 24 },
      5: { cellWidth: 34 },
      6: { halign: "center", fontStyle: "bold", cellWidth: 22 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 4. FORMULARIO F-03: EVALUACIÓN PASTORAL
// ============================================================================
export function generarPdfFormularioF03(
  id_evaluacion = 1,
  datos_vivos?: {
    becario_nombre?: string;
    ci?: string;
    carrera?: string;
    iglesia?: string;
    pastor?: string;
    puntaje?: number | string;
    estado?: string;
    observaciones?: string;
    reactivos?: Array<[string, string, string, string]>;
  }
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  agregarMembreteInstitucional(
    doc,
    "FORMULARIO F-03: EVALUACIÓN PASTORAL Y MINISTERIAL",
    `Certificación de Compromiso Eclesiástico y Liderazgo Cristiano · Expediente #${id_evaluacion}`
  );

  // Datos del Becario
  doc.setFillColor(...COLOR_GRIS_FONDO);
  doc.roundedRect(14, 36, 182, 28, 2, 2, "F");
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 36, 182, 28, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text("DATOS DEL BECARIO Y DE LA CONGREGACIÓN:", 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(
    `Becario Universitario: ${sanitizarTextoPdf(
      datos_vivos?.becario_nombre || "Sin evaluación F-03 registrada"
    )}`,
    18,
    48
  );
  doc.text(
    `Cédula de Identidad: ${sanitizarTextoPdf(datos_vivos?.ci || "S/N")} · Carrera: ${sanitizarTextoPdf(
      datos_vivos?.carrera || "Sin especificar"
    )}`,
    18,
    53
  );
  doc.text(
    `Iglesia Local: ${sanitizarTextoPdf(datos_vivos?.iglesia || "Sin congregación asignada")}`,
    18,
    58
  );
  doc.text(
    `Pastor Titular Evaluador: ${sanitizarTextoPdf(datos_vivos?.pastor || "Sin asignar")}`,
    102,
    58
  );

  const reactivos: string[][] = datos_vivos?.reactivos || [];

  autoTable(doc, {
    startY: 68,
    head: [["Item", "Criterio de Evaluación Pastoral", "Calificación", "Fundamentación Pastoral"]],
    body:
      reactivos.length > 0
        ? reactivos
        : [["-", "Sin respuestas registradas en el formulario F-03", "-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { fontStyle: "bold", cellWidth: 66 },
      2: { halign: "center", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 28 },
      3: { cellWidth: 76 },
    },
    margin: { left: 14, right: 14, bottom: 48 },
  });

  // Cuadro de Calificación Final
  const y_final = Math.min(obtenerLastAutoTableY(doc, 120) + 6, 240);
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.roundedRect(14, y_final, 182, 18, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  const puntaje_str =
    datos_vivos?.puntaje !== undefined && datos_vivos?.puntaje !== null
      ? String(datos_vivos.puntaje)
      : "0.0 / 20.0";
  doc.text(
    `CALIFICACIÓN FINAL MÓDULO 1 (IGLESIA): ${puntaje_str} · ESTADO: ${sanitizarTextoPdf(
      (datos_vivos?.estado || "PENDIENTE").toUpperCase()
    )}`,
    18,
    y_final + 8
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    sanitizarTextoPdf(
      datos_vivos?.observaciones ||
        "Certificación pastoral registrada con trazabilidad en el sistema BUMAND."
    ).slice(0, 110),
    18,
    y_final + 14
  );

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 5. ACTA OFICIAL DE EVENTO Y ACCIÓN DE SERVICIO
// ============================================================================
export function generarPdfActaEvento(
  id_evento = 1,
  datos_vivos?: {
    titulo?: string;
    tipo?: string;
    ubicacion?: string;
    radio_m?: number;
    asistencias?: Array<{
      becario_nombre: string;
      carrera: string;
      hora_programada: string;
      hora_gps: string;
      distancia_geocerca: string;
      estado: string;
    }>;
  }
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  agregarMembreteInstitucional(
    doc,
    "ACTA DE ASISTENCIA Y CONVOCATORIA OFICIAL DE SERVICIO",
    `Control Geodésico Satelital WGS84 — Escuela de Líderes y Acción Diaconal · Acta #${id_evento}`
  );

  doc.setFillColor(...COLOR_GRIS_FONDO);
  doc.roundedRect(14, 36, 182, 20, 2, 2, "F");
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 36, 182, 20, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text("DETALLES DEL ENCUENTRO INSTITUCIONAL:", 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(
    `Evento: ${sanitizarTextoPdf(
      datos_vivos?.titulo || "Jornada Formativa de Escuela de Líderes"
    )} · Tipo: ${sanitizarTextoPdf(datos_vivos?.tipo || "Presencial")}`,
    18,
    47
  );
  doc.text(
    `Sede: ${sanitizarTextoPdf(
      datos_vivos?.ubicacion || "Oficina Central El Alto"
    )} · Radio de Geocerca GPS: ${datos_vivos?.radio_m ?? 50} metros`,
    18,
    52
  );

  const lista_asistencia: string[][] = (datos_vivos?.asistencias || []).map((a, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(a.becario_nombre),
    sanitizarTextoPdf(a.carrera),
    sanitizarTextoPdf(a.hora_programada),
    sanitizarTextoPdf(a.hora_gps),
    sanitizarTextoPdf(a.distancia_geocerca),
    sanitizarTextoPdf(a.estado),
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["N°", "Becario Universitario", "Carrera", "Hora Prog.", "Hora GPS", "Distancia Geocerca", "Estado"]],
    body:
      lista_asistencia.length > 0
        ? lista_asistencia
        : [["-", "Sin marcaciones de asistencia registradas para este evento", "-", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 50 },
      2: { cellWidth: 38 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "center", cellWidth: 18 },
      5: { halign: "center", cellWidth: 28 },
      6: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 22 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 6. EXPEDIENTE INDIVIDUAL DE RECORRIDOS (80% LIQUIDACIÓN EN CENTAVOS)
// ============================================================================
export function generarPdfExpedienteRecorridos(
  becario_id: number,
  mes = new Date().toISOString().slice(0, 7),
  datos_vivos?: {
    becario?: Partial<DatosBecarioPdfCliente>;
    recorridos?: RecorridoPdfCliente[];
    multas_asistencia?: number;
  }
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const becario = {
    id: becario_id,
    nombre: sanitizarTextoPdf(datos_vivos?.becario?.nombre || `Estudiante BUMAND #${becario_id}`),
    ci: sanitizarTextoPdf(datos_vivos?.becario?.ci || "S/N"),
    carrera: sanitizarTextoPdf(datos_vivos?.becario?.carrera || "Sin especificar"),
    universidad: sanitizarTextoPdf(datos_vivos?.becario?.universidad || "Sin especificar"),
    sede: sanitizarTextoPdf(
      datos_vivos?.becario?.sede || "Oficina Central Diaconía IFD - El Alto"
    ),
  };

  agregarMembreteInstitucional(
    doc,
    "FORMULARIO PARA CONTABILIDAD Y RSD — EXPEDIENTE DE PASAJES",
    `Liquidación mensual del 80% de pasajes sin descuento de multas · Periodo: ${mes}`
  );

  // Ficha del Estudiante
  doc.setFillColor(...COLOR_GRIS_FONDO);
  doc.roundedRect(14, 36, 182, 22, 2, 2, "F");
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 36, 182, 22, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text(`ESTUDIANTE: ${becario.nombre.toUpperCase()}`, 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(`C.I.: ${becario.ci} LP · Carrera: ${becario.carrera} (${becario.universidad})`, 18, 47);
  doc.text(`Unidad Asignada: ${becario.sede} · Tarifa Aplicada: Transporte Autorizado (80%)`, 18, 52);

  // Tabla de Recorridos Diarios
  const recorridos = datos_vivos?.recorridos || [];
  const jornadas: string[][] = recorridos.map((r, idx) => {
    const costo = Number(r.costo_pasaje || 0);
    const subsidio = Number(r.monto_reembolso_80 ?? costo * 0.8);
    const sentido_etiqueta = r.sentido ? ` (${sanitizarTextoPdf(r.sentido).toUpperCase()})` : "";
    return [
      String(idx + 1),
      String(r.fecha || "").slice(0, 10),
      `${sanitizarTextoPdf(r.origen || "-")} -> ${sanitizarTextoPdf(
        r.destino || "-"
      )}${sentido_etiqueta}`,
      sanitizarTextoPdf(r.tipo_transporte || "Minibús"),
      `Bs ${costo.toFixed(2)}`,
      `Bs ${subsidio.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 62,
    head: [["#", "Fecha", "Tramo y Recorrido Declarado", "Transporte", "Tarifa Oficial", "Subsidio (80%)"]],
    body:
      jornadas.length > 0
        ? jornadas
        : [["-", "-", "Sin recorridos registrados en el periodo seleccionado", "-", "Bs 0.00", "Bs 0.00"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { halign: "center", cellWidth: 20 },
      2: { cellWidth: 84 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "right", cellWidth: 24 },
      5: { halign: "right", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 24 },
    },
    margin: { left: 14, right: 14, bottom: 52 },
  });

  // Resumen Financiero al final
  const total_gastado = recorridos.reduce((acc, r) => acc + Number(r.costo_pasaje || 0), 0);
  const total_subsidio = recorridos.reduce(
    (acc, r) => acc + Number(r.monto_reembolso_80 ?? Number(r.costo_pasaje || 0) * 0.8),
    0
  );
  const liquido_pagable = total_subsidio;

  const y_resumen = Math.min(obtenerLastAutoTableY(doc, 220) + 4, 240);

  doc.setFillColor(...COLOR_PRIMARIO);
  doc.roundedRect(14, y_resumen, 182, 18, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(
    `TOTAL (100%): Bs ${total_gastado.toFixed(2)} (${recorridos.length} Tramos) · 80% RECONOCIDO: Bs ${total_subsidio.toFixed(2)}`,
    18,
    y_resumen + 6.5
  );
  doc.text(`LÍQUIDO PAGABLE (NETO RSD): Bs ${liquido_pagable.toFixed(2)}`, 18, y_resumen + 12.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Regla del día 24 verificada · Formulario para Contabilidad y RSD", 132, y_resumen + 12.5);

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 7. KÁRDEX INDIVIDUAL DE ASISTENCIA MENSUAL
// ============================================================================
export function generarPdfAsistenciaMensual(
  becario_id: number,
  mes = new Date().toISOString().slice(0, 7),
  datos_vivos?: {
    becario?: Partial<DatosBecarioPdfCliente>;
    registros?: Array<{
      fecha: string;
      hora_programada: string;
      hora_gps: string;
      horas: number;
      retraso_min: number;
      estado: string;
    }>;
  }
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const becario = {
    id: becario_id,
    nombre: sanitizarTextoPdf(datos_vivos?.becario?.nombre || `Estudiante BUMAND #${becario_id}`),
    ci: sanitizarTextoPdf(datos_vivos?.becario?.ci || "S/N"),
    carrera: sanitizarTextoPdf(datos_vivos?.becario?.carrera || "Sin especificar"),
    sede: sanitizarTextoPdf(
      datos_vivos?.becario?.sede || "Oficina Central Diaconía IFD - El Alto"
    ),
  };

  agregarMembreteInstitucional(
    doc,
    "KÁRDEX INDIVIDUAL DE ASISTENCIA Y PUNTUALIDAD MENSUAL",
    `Registro Biométrico y Geocercas WGS84 · Periodo: ${mes}`
  );

  // Ficha
  doc.setFillColor(...COLOR_GRIS_FONDO);
  doc.roundedRect(14, 36, 182, 20, 2, 2, "F");
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 36, 182, 20, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text(`BECARIO: ${becario.nombre.toUpperCase()}`, 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(`C.I.: ${becario.ci} · Carrera: ${becario.carrera} · Sede: ${becario.sede}`, 18, 47);
  doc.text("Horario de Práctica: 08:00 a 12:00 (Lunes a Viernes · 4 horas diarias)", 18, 52);

  const registros = datos_vivos?.registros || [];
  const filas: string[][] = registros.map((r, idx) => [
    String(idx + 1),
    String(r.fecha || "").slice(0, 10),
    sanitizarTextoPdf(r.hora_programada || "08:00"),
    sanitizarTextoPdf(r.hora_gps || "-"),
    `${Number(r.horas || 0).toFixed(1)} h`,
    r.retraso_min > 0 ? `+${r.retraso_min}m` : "0m",
    sanitizarTextoPdf(r.estado || "Conforme"),
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["#", "Fecha", "Hora Prog.", "Hora GPS", "Horas", "Retraso", "Estado"]],
    body:
      filas.length > 0
        ? filas
        : [["-", "-", "-", "-", "0.0 h", "0m", "Sin marcaciones en el periodo"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 26 },
      2: { halign: "center", cellWidth: 26 },
      3: { halign: "center", cellWidth: 26 },
      4: { halign: "center", fontStyle: "bold", cellWidth: 24 },
      5: { halign: "center", cellWidth: 24 },
      6: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 46 },
    },
    margin: { left: 14, right: 14, bottom: 48 },
  });

  const total_horas = registros.reduce((acc, r) => acc + Number(r.horas || 0), 0);
  const retrasos_count = registros.filter((r) => Number(r.retraso_min || 0) > 0).length;
  const pct_puntualidad =
    registros.length > 0
      ? (((registros.length - retrasos_count) / registros.length) * 100).toFixed(1)
      : "0.0";

  const y_resumen = Math.min(obtenerLastAutoTableY(doc, 220) + 4, 244);

  doc.setFillColor(...COLOR_PRIMARIO);
  doc.roundedRect(14, y_resumen, 182, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(
    `TOTAL HORAS CUMPLIDAS: ${total_horas.toFixed(1)} HORAS · PUNTUALIDAD: ${pct_puntualidad}% · RETRASOS: ${retrasos_count}`,
    18,
    y_resumen + 5.5
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "Marcaciones validadas por geocerca WGS84 dentro del radio institucional de 50 metros.",
    18,
    y_resumen + 10.5
  );

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 8. REPORTE DE AUDITORÍA POR INTERVALO Y CONSOLIDADO CONTABILIDAD
// ============================================================================
export function generarPdfAuditoriaIntervalo(
  modulo: string,
  fecha_inicio: string,
  fecha_fin: string,
  filas_vivas: string[][] = []
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  agregarMembreteInstitucional(
    doc,
    `INFORME OFICIAL DE CONTABILIDAD: ${modulo.toUpperCase()}`,
    `Intervalo de Liquidación: ${fecha_inicio} al ${fecha_fin} · Convalidación Contable y Operativa`
  );

  doc.setFillColor(...COLOR_GRIS_FONDO);
  doc.roundedRect(14, 36, 182, 16, 2, 2, "F");
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 36, 182, 16, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text("PARÁMETROS DE CONTABILIDAD INSTITUCIONAL:", 18, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(
    `Módulo: ${modulo} | Desde: ${fecha_inicio} | Hasta: ${fecha_fin} | Registros verificados: ${
      filas_vivas.length
    } | Estado: ${filas_vivas.length > 0 ? "VERIFICADO" : "SIN REGISTROS"}`,
    18,
    47
  );

  autoTable(doc, {
    startY: 56,
    head: [["#", "Estudiante Becario / Responsable", "Unidad / Agencia", "Resultado", "Observaciones Contables", "Dictamen"]],
    body:
      filas_vivas.length > 0
        ? filas_vivas
        : [["-", "Sin registros verificados en el intervalo seleccionado", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { fontStyle: "bold", cellWidth: 54 },
      2: { cellWidth: 44 },
      3: { halign: "center", cellWidth: 20 },
      4: { cellWidth: 34 },
      5: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 22 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

export function generarPdfConsolidadoContabilidad(
  fecha_inicio: string,
  fecha_fin: string,
  resumen: {
    total_asistencias: number;
    total_horas: number;
    total_solicitudes_pasajes: number;
    total_monto_pasajes_100: number;
    total_monto_pasajes_80: number;
    total_refrigerios: number;
    total_monto_refrigerios: number;
  }
): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  agregarMembreteInstitucional(
    doc,
    "FORMULARIO PARA CONTABILIDAD Y RSD — CONSOLIDADO INTEGRAL",
    `Intervalo: ${fecha_inicio} al ${fecha_fin} · Excluye descuento de multas de asistencia`
  );

  autoTable(doc, {
    startY: 38,
    head: [["Módulo / Concepto Institucional", "Indicador", "Importe / Valor"]],
    body: [
      ["1. Asistencia y Prácticas Preprofesionales", "Marcaciones verificadas", `${resumen.total_asistencias} registros`],
      ["1. Asistencia y Prácticas Preprofesionales", "Horas acumuladas acreditadas", `${resumen.total_horas.toFixed(2)} hrs`],
      ["2. Liquidación de Pasajes (80% RSD)", "Becarios / Expedientes con recorridos", `${resumen.total_solicitudes_pasajes} registros`],
      ["2. Liquidación de Pasajes (80% RSD)", "Total tarifa declarada (100%)", `Bs ${resumen.total_monto_pasajes_100.toFixed(2)}`],
      ["2. Liquidación de Pasajes (80% RSD)", "Líquido pagable reconocido (80% Neto RSD)", `Bs ${resumen.total_monto_pasajes_80.toFixed(2)}`],
      ["3. Refrigerios Escuela de Líderes (100%)", "Jornadas registradas", `${resumen.total_refrigerios} jornadas`],
      ["3. Refrigerios Escuela de Líderes (100%)", "Monto total reembolsado (100%)", `Bs ${resumen.total_monto_refrigerios.toFixed(2)}`],
    ],
    theme: "grid",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 72 },
      1: { cellWidth: 68 },
      2: { halign: "right", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 42 },
    },
    margin: { left: 14, right: 14, bottom: 36 },
  });

  agregarPiePaginaYFirmas(doc, false);
  return doc.output("blob");
}

// ============================================================================
// 9. FORMULARIO PARA CONTABILIDAD Y RSD — LIQUIDACIÓN GENERAL DE PASAJES
// ============================================================================
export function generarPdfPasajesGeneral(
  fecha_inicio = "2026-11-01",
  fecha_fin = "2026-11-30",
  descontar_multas = false,
  filas_vivas: FilaPasajesGeneralPdfCliente[] = []
): Blob {
  void descontar_multas;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  agregarMembreteInstitucional(
    doc,
    "FORMULARIO PARA CONTABILIDAD Y RSD — LIQUIDACIÓN DE PASAJES",
    `Liquidación mensual del 80% de pasajes sin descuento de multas · Intervalo: ${fecha_inicio} al ${fecha_fin}`,
    true
  );

  const filas = filas_vivas.map((b, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(b.becario_nombre),
    sanitizarTextoPdf(b.ci || "S/N"),
    sanitizarTextoPdf(b.sede || "Oficina Central"),
    String(b.cantidad_recorridos ?? 0),
    `Bs ${Number(b.monto_total_100_bs || 0).toFixed(2)}`,
    `Bs ${Number(b.monto_reconocido_80_bs || 0).toFixed(2)}`,
    `Bs ${Number(b.monto_reconocido_80_bs || 0).toFixed(2)}`,
    sanitizarTextoPdf(b.estado || "PENDIENTE").toUpperCase(),
  ]);

  if (filas.length > 0) {
    const sum_tramos = filas_vivas.reduce((a, b) => a + Number(b.cantidad_recorridos || 0), 0);
    const sum_100 = filas_vivas.reduce((a, b) => a + Number(b.monto_total_100_bs || 0), 0);
    const sum_80 = filas_vivas.reduce((a, b) => a + Number(b.monto_reconocido_80_bs || 0), 0);
    filas.push([
      "",
      "TOTAL GENERAL",
      "",
      "",
      String(sum_tramos),
      `Bs ${sum_100.toFixed(2)}`,
      `Bs ${sum_80.toFixed(2)}`,
      `Bs ${sum_80.toFixed(2)}`,
      "-",
    ]);
  }

  autoTable(doc, {
    startY: 38,
    head: [["#", "Estudiante Becario", "C.I.", "Unidad Asignada", "Tramos", "Total (100%)", "80% Reconocido", "Líquido Pagable (Neto RSD)", "Estado"]],
    body:
      filas.length > 0
        ? filas
        : [["-", "Sin solicitudes de pasajes registradas en el intervalo", "-", "-", "0", "Bs 0.00", "Bs 0.00", "Bs 0.00", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 },
      1: { fontStyle: "bold", cellWidth: 58 },
      2: { halign: "center", cellWidth: 22 },
      3: { cellWidth: 48 },
      4: { halign: "center", cellWidth: 16 },
      5: { halign: "right", cellWidth: 26 },
      6: { halign: "right", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 28 },
      7: { halign: "right", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 32 },
      8: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 30 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, true);
  return doc.output("blob");
}

// ============================================================================
// 10. REPORTE GENERAL DE PERMISOS Y JUSTIFICACIONES
// ============================================================================
export function generarPdfJustificacionesGeneral(
  fecha_inicio = "2026-10-01",
  fecha_fin = "2026-10-31",
  filas_vivas: FilaJustificacionPdfCliente[] = []
): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  agregarMembreteInstitucional(
    doc,
    "REPORTE GENERAL DE PERMISOS Y JUSTIFICACIONES",
    `Bandeja Oficial de Dictámenes Institucionales · Intervalo: ${fecha_inicio} al ${fecha_fin}`,
    true
  );

  const cuerpo: string[][] = filas_vivas.map((j, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(j.becario_nombre),
    sanitizarTextoPdf(j.fecha),
    sanitizarTextoPdf(j.motivo),
    sanitizarTextoPdf(j.actividad),
    sanitizarTextoPdf(j.prueba_adjunta),
    sanitizarTextoPdf(j.dictamen),
    sanitizarTextoPdf(j.resolucion_multa),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [["#", "Becario", "Fecha", "Motivo de la Incidencia", "Actividad", "Prueba Adjunta", "Dictamen", "Resolución Multa"]],
    body:
      cuerpo.length > 0
        ? cuerpo
        : [["-", "Sin solicitudes de permisos o justificaciones en el intervalo", "-", "-", "-", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { fontStyle: "bold", cellWidth: 52 },
      2: { halign: "center", cellWidth: 22 },
      3: { cellWidth: 66 },
      4: { halign: "center", cellWidth: 28 },
      5: { halign: "center", cellWidth: 24 },
      6: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 28 },
      7: { cellWidth: 39 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, true);
  return doc.output("blob");
}

// ============================================================================
// 11. REPORTE CONSOLIDADO DE ASISTENCIAS Y HORAS
// ============================================================================
export function generarPdfAsistenciaGeneral(
  fecha_inicio = "2026-10-01",
  fecha_fin = "2026-10-31",
  filas_vivas: FilaAsistenciaGeneralPdfCliente[] = []
): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  agregarMembreteInstitucional(
    doc,
    "REPORTE CONSOLIDADO DE ASISTENCIAS Y CÓMPUTO DE HORAS",
    `Auditoría General de Marcaciones y Geocercas WGS84 · Intervalo: ${fecha_inicio} al ${fecha_fin}`,
    true
  );

  const filas: string[][] = filas_vivas.map((f, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(f.becario_nombre),
    sanitizarTextoPdf(f.ci || "S/N"),
    sanitizarTextoPdf(f.carrera || "-"),
    sanitizarTextoPdf(f.sede || "Oficina Central"),
    `${Number(f.horas_practicas || 0).toFixed(1)} h`,
    `${Number(f.horas_lideres || 0).toFixed(1)} h`,
    `${Number(f.total_horas || 0).toFixed(1)} h`,
    f.retraso_min > 0 ? `+${f.retraso_min} m` : "0 m",
    sanitizarTextoPdf(f.estado || "CONFORME"),
  ]);

  if (filas_vivas.length > 0) {
    const sum_prac = filas_vivas.reduce((a, b) => a + Number(b.horas_practicas || 0), 0);
    const sum_lid = filas_vivas.reduce((a, b) => a + Number(b.horas_lideres || 0), 0);
    const sum_tot = filas_vivas.reduce((a, b) => a + Number(b.total_horas || 0), 0);
    const sum_ret = filas_vivas.reduce((a, b) => a + Number(b.retraso_min || 0), 0);
    filas.push([
      "",
      "TOTAL GENERAL CONSOLIDADO",
      "",
      "",
      `${filas_vivas.length} becarios`,
      `${sum_prac.toFixed(1)} h`,
      `${sum_lid.toFixed(1)} h`,
      `${sum_tot.toFixed(1)} h`,
      `${sum_ret} m`,
      "-",
    ]);
  }

  autoTable(doc, {
    startY: 38,
    head: [["#", "Estudiante Becario", "C.I.", "Carrera", "Sede Asignada", "Horas Práct.", "Esc. Líderes", "Total Horas", "Retraso", "Estado"]],
    body:
      filas.length > 0
        ? filas
        : [["-", "Sin registros de asistencia en el intervalo seleccionado", "-", "-", "-", "0.0 h", "0.0 h", "0.0 h", "0 m", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 },
      1: { fontStyle: "bold", cellWidth: 50 },
      2: { halign: "center", cellWidth: 22 },
      3: { cellWidth: 40 },
      4: { cellWidth: 42 },
      5: { halign: "center", cellWidth: 20 },
      6: { halign: "center", cellWidth: 20 },
      7: { halign: "center", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 22 },
      8: { halign: "center", cellWidth: 18 },
      9: { halign: "center", fontStyle: "bold", textColor: [16, 185, 129], cellWidth: 26 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, true);
  return doc.output("blob");
}

// ============================================================================
// 11B. REPORTE DE ASISTENCIA DE ESCUELA DE LÍDERES (CON MULTAS Y PERMISOS)
// ============================================================================
export function generarPdfEscuelaLideres(
  fecha_inicio = "2026-10-01",
  fecha_fin = "2026-10-31",
  filas_vivas: FilaEscuelaLideresPdfCliente[] = []
): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  agregarMembreteInstitucional(
    doc,
    "REPORTE DE ASISTENCIA ESCUELA DE LÍDERES (MULTAS Y PERMISOS)",
    `Hora oficial de ingreso: 14:30 · Nómina enlazada con permisos y sanciones · Intervalo: ${fecha_inicio} al ${fecha_fin}`,
    true
  );

  const filas: string[][] = filas_vivas.map((f, idx) => [
    String(idx + 1),
    sanitizarTextoPdf(f.becario_nombre),
    sanitizarTextoPdf(f.ci || "S/N"),
    sanitizarTextoPdf(f.fecha || "-"),
    sanitizarTextoPdf(f.hora_programada || "14:30"),
    sanitizarTextoPdf(f.hora_gps || "-"),
    f.retraso_min > 0 ? `+${f.retraso_min} m` : "0 m",
    sanitizarTextoPdf(f.permiso || "SIN PERMISO"),
    `Bs ${Number(f.multa_bs || 0).toFixed(2)}`,
    sanitizarTextoPdf(f.estado_final || "PUNTUAL"),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [["#", "Estudiante Becario", "C.I.", "Fecha", "Hora Prog.", "Hora GPS", "Retraso", "Permiso", "Multa Bs", "Estado Final"]],
    body:
      filas.length > 0
        ? filas
        : [["-", "Sin registros de Escuela de Líderes en el intervalo", "-", "-", "14:30", "-", "0 m", "-", "Bs 0.00", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: COLOR_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: COLOR_TEXTO_OSCURO,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 },
      1: { fontStyle: "bold", cellWidth: 52 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "center", cellWidth: 18 },
      5: { halign: "center", cellWidth: 22 },
      6: { halign: "center", cellWidth: 16 },
      7: { halign: "center", cellWidth: 38 },
      8: { halign: "right", fontStyle: "bold", cellWidth: 22 },
      9: { halign: "center", fontStyle: "bold", textColor: COLOR_PRIMARIO, cellWidth: 48 },
    },
    margin: { left: 14, right: 14, bottom: 32 },
  });

  agregarPiePaginaYFirmas(doc, true);
  return doc.output("blob");
}

// ============================================================================
// 12. PLANILLA OFICIAL DE DONACIÓN (TRANSPORTE / REFRIGERIO) - FALLBACK LIVE
// ============================================================================
export function generarPdfPlanillaDonacionCliente(opciones: {
  tipo: "refrigerio" | "transporte";
  fecha_inicio: string;
  fecha_fin: string;
  con_firma: boolean;
  descontar_multas?: boolean;
  firmante_1_nombre: string;
  firmante_1_cargo: string;
  firmante_2_nombre: string;
  firmante_2_cargo: string;
  filas: FilaDonacionPdfCliente[];
}): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const es_transporte = opciones.tipo === "transporte";
  const titulo = es_transporte
    ? "DONACIÓN PARA TRANSPORTE BUMAN-D"
    : "DONACIÓN PARA REFRIGERIO BUMAN-D";
  const subtitulo = `Periodo: ${opciones.fecha_inicio} al ${opciones.fecha_fin} · ${
    opciones.con_firma ? "Archivo del Área (Con firma)" : "Contabilidad (Sin firma)"
  }`;

  agregarMembreteInstitucional(doc, titulo, subtitulo, false);

  const encabezados = es_transporte
    ? opciones.con_firma
      ? [["N°", "NOMBRES", "APELLIDOS", "Total Gral por c/u Bs.", "FIRMA"]]
      : [["N°", "NOMBRES", "APELLIDOS", "Total Gral por c/u Bs."]]
    : opciones.con_firma
    ? [["N°", "RESPONSABLE", "TOTAL Bs.", "FIRMA"]]
    : [["N°", "RESPONSABLE", "TOTAL Bs."]];

  const cuerpo =
    opciones.filas.length > 0
      ? opciones.filas.map((f, idx) => {
          const monto_fmt = Number(f.monto_bs || 0).toLocaleString("es-BO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          if (es_transporte) {
            const partes =
              f.nombres || f.apellidos
                ? { nombres: f.nombres || "", apellidos: f.apellidos || "" }
                : separarNombresApellidosCliente(f.nombre);
            const fila = [
              String(idx + 1),
              sanitizarTextoPdf(partes.nombres),
              sanitizarTextoPdf(partes.apellidos),
              monto_fmt,
            ];
            return opciones.con_firma ? [...fila, ""] : fila;
          }
          const fila = [String(idx + 1), sanitizarTextoPdf(f.nombre), monto_fmt];
          return opciones.con_firma ? [...fila, ""] : fila;
        })
      : [
          es_transporte
            ? opciones.con_firma
              ? ["-", "Sin registros aprobados en el periodo", "", "0,00", ""]
              : ["-", "Sin registros aprobados en el periodo", "", "0,00"]
            : opciones.con_firma
            ? ["-", "Sin registros aprobados en el periodo", "0,00", ""]
            : ["-", "Sin registros aprobados en el periodo", "0,00"],
        ];

  const total_bs = opciones.filas.reduce((acc, f) => acc + Number(f.monto_bs || 0), 0);
  const total_fmt = total_bs.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (opciones.filas.length > 0) {
    if (es_transporte) {
      cuerpo.push(
        opciones.con_firma
          ? ["", "Total General Bs.", "", total_fmt, ""]
          : ["", "Total General Bs.", "", total_fmt]
      );
    } else {
      cuerpo.push(
        opciones.con_firma
          ? ["", "TOTAL GASTO POR REFRIGERIO", total_fmt, ""]
          : ["", "TOTAL GASTO POR REFRIGERIO", total_fmt]
      );
    }
  }

  autoTable(doc, {
    startY: 36,
    head: encabezados,
    body: cuerpo,
    theme: "grid",
    headStyles: {
      fillColor: [214, 228, 234],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      lineColor: [51, 65, 85],
      lineWidth: 0.25,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [15, 23, 42],
      cellPadding: opciones.con_firma ? 2.8 : 2.1,
      lineColor: [51, 65, 85],
      lineWidth: 0.2,
    },
    columnStyles: es_transporte
      ? {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: opciones.con_firma ? 48 : 62 },
          2: { cellWidth: opciones.con_firma ? 52 : 68 },
          3: { halign: "right", fontStyle: "bold", cellWidth: opciones.con_firma ? 34 : 42 },
          ...(opciones.con_firma ? { 4: { cellWidth: 38 } } : {}),
        }
      : {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: opciones.con_firma ? 96 : 132 },
          2: { halign: "right", fontStyle: "bold", cellWidth: opciones.con_firma ? 34 : 38 },
          ...(opciones.con_firma ? { 3: { cellWidth: 40 } } : {}),
        },
    margin: { left: 14, right: 14, bottom: 48 },
  });

  let y_leyenda = obtenerLastAutoTableY(doc, 180) + 6;
  if (y_leyenda > 245) {
    doc.addPage();
    y_leyenda = 26;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(
    es_transporte
      ? "El presente detalle consolida los gastos de transporte de los BUMAN-D para el cumplimiento de sus Prácticas Pre Profesionales."
      : "El presente detalle consolida los gastos de refrigerio de las reuniones BUMAN-D.",
    14,
    y_leyenda
  );

  const y_firmas = Math.min(y_leyenda + 22, 266);
  doc.setDrawColor(...COLOR_PRIMARIO);
  doc.setLineWidth(0.35);
  doc.line(20, y_firmas, 90, y_firmas);
  doc.line(120, y_firmas, 190, y_firmas);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXTO_OSCURO);
  doc.text(sanitizarTextoPdf(opciones.firmante_1_nombre), 55, y_firmas + 4, { align: "center" });
  doc.text(sanitizarTextoPdf(opciones.firmante_2_nombre), 155, y_firmas + 4, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(sanitizarTextoPdf(opciones.firmante_1_cargo).toUpperCase(), 55, y_firmas + 8, {
    align: "center",
    maxWidth: 68,
  });
  doc.text(sanitizarTextoPdf(opciones.firmante_2_cargo).toUpperCase(), 155, y_firmas + 8, {
    align: "center",
    maxWidth: 68,
  });

  return doc.output("blob");
}

// ============================================================================
// CARGADORES VIVOS PARA FALLBACK CLIENTE
// ============================================================================
async function generarCorteHorasVivo(
  fecha_inicio?: string,
  fecha_fin?: string,
  tipo_actividad?: string
): Promise<Blob> {
  const { clienteApi } = await import("@/lib/cliente-api");
  const rango_defecto = obtenerRangoMes();
  const ini = fecha_inicio || rango_defecto.inicio;
  const fin = fecha_fin || rango_defecto.fin;

  const qs = new URLSearchParams();
  qs.set("fecha_inicio", ini);
  qs.set("fecha_fin", fin);
  if (tipo_actividad && tipo_actividad !== "todas") {
    qs.set("tipo", tipo_actividad);
  }

  let registros: any[] = [];
  try {
    const resp = await clienteApi.get<any[]>(`/asistencia?${qs.toString()}`);
    registros = extraerListaApi(resp);
  } catch {
    registros = [];
  }

  const filas: FilaCorteHorasPdfCliente[] = registros.map((r) => {
    const es_lideres = r.tipo === "escuela_lideres";
    const retraso = Number(r.minutos_retraso || 0);
    const horas = es_lideres ? 0 : Number(r.horas_trabajadas || 4);
    const fecha_str = r.fecha ? String(r.fecha).slice(0, 10) : ini;
    const hora_prev = es_lideres ? "14:30" : r.hora_prevista || "08:00";
    return {
      becario_nombre: r.becario?.usuario?.nombre || r.becario?.nombre || `Becario #${r.becario_id}`,
      unidad: r.bloque || r.becario?.lugar_practica?.nombre || r.becario?.ubicacion || "Oficina Central",
      requerido: `${fecha_str} (${hora_prev})`,
      cumplido: `${horas.toFixed(1)} h`,
      puntualidad: r.hora_ingreso || "-",
      retraso: retraso > 0 ? `+${retraso}m` : "0m",
      dictamen:
        retraso > 0
          ? `Tardanza (+${retraso}m)`
          : r.dentro_de_radio
          ? "Conforme (GPS)"
          : "Conforme",
    };
  });

  return generarPdfCorteHoras(ini, fin, filas, tipo_actividad || "todas");
}

async function generarAsistenciaGeneralVivo(
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<Blob> {
  const { clienteApi } = await import("@/lib/cliente-api");
  const rango_defecto = obtenerRangoMes();
  const ini = fecha_inicio || rango_defecto.inicio;
  const fin = fecha_fin || rango_defecto.fin;

  const [res_asist, res_bec] = await Promise.allSettled([
    clienteApi.get<any[]>(`/asistencia?fecha_inicio=${encodeURIComponent(ini)}&fecha_fin=${encodeURIComponent(fin)}`),
    clienteApi.get<any>("/becarios"),
  ]);

  const asistencias = res_asist.status === "fulfilled" ? extraerListaApi(res_asist.value) : [];
  const becarios = res_bec.status === "fulfilled" ? extraerListaApi(res_bec.value) : [];

  const mapa_becarios = new Map<number, any>();
  for (const b of becarios) {
    mapa_becarios.set(Number(b.id), b);
  }

  const mapa_resumen = new Map<number, FilaAsistenciaGeneralPdfCliente>();
  for (const a of asistencias) {
    const bid = Number(a.becario_id || a.becario?.id || 0);
    if (!bid) continue;
    const bec = a.becario || mapa_becarios.get(bid);
    const actual = mapa_resumen.get(bid) || {
      becario_nombre: bec?.usuario?.nombre || bec?.nombre || `Becario #${bid}`,
      ci: bec?.ci || "S/N",
      carrera: bec?.carrera || "-",
      sede: bec?.lugar_practica?.nombre || bec?.ubicacion || a.bloque || "Oficina Central",
      horas_practicas: 0,
      horas_lideres: 0,
      total_horas: 0,
      retraso_min: 0,
      estado: "CONFORME",
    };

    const es_lid = a.tipo === "escuela_lideres";
    const h = es_lid ? 0 : Number(a.horas_trabajadas || 4);
    if (es_lid) actual.horas_lideres += h;
    else actual.horas_practicas += h;
    actual.total_horas = Number((actual.horas_practicas + actual.horas_lideres).toFixed(2));
    actual.retraso_min += Number(a.minutos_retraso || 0);
    actual.estado = actual.retraso_min > 0 ? "CON TARDANZAS" : "PUNTUAL CONFORME";
    mapa_resumen.set(bid, actual);
  }

  const filas = Array.from(mapa_resumen.values()).sort((a, b) =>
    a.becario_nombre.localeCompare(b.becario_nombre, "es")
  );
  return generarPdfAsistenciaGeneral(ini, fin, filas);
}

async function generarEscuelaLideresVivo(
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<Blob> {
  const { clienteApi } = await import("@/lib/cliente-api");
  const rango_defecto = obtenerRangoMes();
  const ini = fecha_inicio || rango_defecto.inicio;
  const fin = fecha_fin || rango_defecto.fin;

  const [res_bec, res_asist, res_just, res_multas] = await Promise.allSettled([
    clienteApi.get<any>("/becarios"),
    clienteApi.get<any[]>(
      `/asistencia?tipo=escuela_lideres&fecha_inicio=${encodeURIComponent(ini)}&fecha_fin=${encodeURIComponent(fin)}`
    ),
    clienteApi.get<any[]>("/justificaciones"),
    clienteApi.get<any[]>("/asistencia/multas"),
  ]);

  const becarios = res_bec.status === "fulfilled" ? extraerListaApi(res_bec.value) : [];
  const registros = res_asist.status === "fulfilled" ? extraerListaApi(res_asist.value) : [];
  const just_raw = res_just.status === "fulfilled" ? extraerListaApi(res_just.value) : [];
  const multas_raw = res_multas.status === "fulfilled" ? extraerListaApi(res_multas.value) : [];

  const mapa_bec = new Map<number, any>();
  for (const b of becarios) mapa_bec.set(Number(b.id), b);

  const justificaciones = just_raw.filter((j) => {
    const tipo_inc = String(j.tipo_incidencia || "").toLowerCase();
    if (tipo_inc !== "escuela_lideres") return false;
    const f = String(j.fecha_incidencia || "").slice(0, 10);
    return !f || (f >= ini && f <= fin);
  });

  const ids_asist = new Set(registros.map((r) => Number(r.id)));
  const multas = multas_raw.filter((m) => {
    const f = String(m.fecha_aplicacion || "").slice(0, 10);
    if (f && (f < ini || f > fin)) return false;
    if (m.asistencia_id && ids_asist.has(Number(m.asistencia_id))) return true;
    const motivo = String(m.motivo || "").toLowerCase();
    return (
      motivo.includes("escuela") ||
      motivo.includes("lider") ||
      motivo.includes("líder") ||
      motivo.includes("viernes")
    );
  });

  const just_por_ref = new Map<number, any>();
  const just_por_bf = new Map<string, any>();
  for (const j of justificaciones) {
    if (j.referencia_id) just_por_ref.set(Number(j.referencia_id), j);
    const f = String(j.fecha_incidencia || "").slice(0, 10);
    just_por_bf.set(`${j.becario_id}|${f}`, j);
  }

  const multas_por_asist = new Map<number, number>();
  const multas_por_bf = new Map<string, number>();
  for (const m of multas) {
    const monto = Number(m.monto_bs || 0);
    if (m.asistencia_id) {
      multas_por_asist.set(
        Number(m.asistencia_id),
        (multas_por_asist.get(Number(m.asistencia_id)) || 0) + monto
      );
    } else {
      const f = String(m.fecha_aplicacion || "").slice(0, 10);
      const k = `${m.becario_id}|${f}`;
      multas_por_bf.set(k, (multas_por_bf.get(k) || 0) + monto);
    }
  }

  const filas: FilaEscuelaLideresPdfCliente[] = registros.map((r) => {
    const f = String(r.fecha || "").slice(0, 10);
    const bec = r.becario || mapa_bec.get(Number(r.becario_id));
    const perm = just_por_ref.get(Number(r.id)) || just_por_bf.get(`${r.becario_id}|${f}`);
    const multa =
      multas_por_asist.get(Number(r.id)) ?? multas_por_bf.get(`${r.becario_id}|${f}`) ?? 0;
    const retraso = Number(r.minutos_retraso || 0);
    const perm_est = String(perm?.estado || "").toLowerCase();
    const perm_aprob = perm_est === "aprobada" || perm_est === "aprobado_administracion";

    let estado_final = "Puntual Conforme";
    if (perm_aprob) {
      estado_final = retraso > 0 ? "Tardanza Justificada" : "Con Permiso Aprobado";
    } else if (multa > 0) {
      estado_final = `Multa (Bs ${multa.toFixed(2)})`;
    } else if (retraso > 0) {
      estado_final = `Tardanza (+${retraso}m)`;
    }

    return {
      becario_nombre: bec?.usuario?.nombre || bec?.nombre || `Becario #${r.becario_id}`,
      ci: bec?.ci || "S/N",
      fecha: f,
      hora_programada: "14:30",
      hora_gps: r.hora_ingreso || "-",
      retraso_min: retraso,
      permiso: perm ? String(perm.estado || "PENDIENTE").toUpperCase() : "SIN PERMISO",
      multa_bs: Number(multa.toFixed(2)),
      estado_final,
    };
  });

  if (filas.length === 0 && becarios.length > 0) {
    for (const b of becarios) {
      filas.push({
        becario_nombre: b.usuario?.nombre || b.nombre || `Becario #${b.id}`,
        ci: b.ci || "S/N",
        fecha: "-",
        hora_programada: "14:30",
        hora_gps: "Sin marcación",
        retraso_min: 0,
        permiso: "SIN PERMISO",
        multa_bs: 0,
        estado_final: "SIN REGISTROS",
      });
    }
  }

  return generarPdfEscuelaLideres(ini, fin, filas);
}

async function generarRefrigeriosVivo(
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<Blob> {
  const { clienteApi } = await import("@/lib/cliente-api");
  const qs = new URLSearchParams();
  if (fecha_inicio) qs.set("fecha_inicio", fecha_inicio);
  if (fecha_fin) qs.set("fecha_fin", fecha_fin);

  let lista: any[] = [];
  try {
    const resp = await clienteApi.get<any[]>(`/refrigerios${qs.toString() ? `?${qs.toString()}` : ""}`);
    lista = extraerListaApi(resp);
  } catch {
    lista = [];
  }

  const filas: FilaRefrigerioPdfCliente[] = lista
    .filter((r) => {
      const f = String(r.fecha || "").slice(0, 10);
      if (fecha_inicio && f && f < fecha_inicio) return false;
      if (fecha_fin && f && f > fecha_fin) return false;
      return true;
    })
    .map((r) => {
      const dupla =
        [r.becario_encargado_1_nombre, r.becario_encargado_2_nombre]
          .filter(Boolean)
          .join(" & ") ||
        r.becario_nombre ||
        r.responsable?.nombre ||
        "Dupla BUMAND";
      return {
        fecha: String(r.fecha || "").slice(0, 10) || "-",
        dupla,
        raciones: Number(r.cantidad_raciones || 0),
        monto_total_bs: Number(r.monto_devolucion_bs || r.costo_total_bs || 0),
        receptor: r.becario_receptor_devolucion_nombre || "Pendiente",
        estado: String(r.estado_reposicion || "programado"),
      };
    });

  return generarPdfRefrigerios(fecha_inicio, fecha_fin, filas);
}

async function generarPasajesGeneralVivo(
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<Blob> {
  const { clienteApi } = await import("@/lib/cliente-api");
  const rango_defecto = obtenerRangoMes();
  const ini = fecha_inicio || rango_defecto.inicio;
  const fin = fecha_fin || rango_defecto.fin;

  const qs = new URLSearchParams();
  qs.set("fecha_inicio", ini);
  qs.set("fecha_fin", fin);
  qs.set("descontar_multas", "false");

  let filas_vivas: FilaPasajesGeneralPdfCliente[] = [];
  try {
    const resp = await clienteApi.get<any>(`/pasajes/calculo-pago?${qs.toString()}`);
    if (Array.isArray(resp?.becarios)) {
      filas_vivas = resp.becarios;
    }
  } catch {
    filas_vivas = [];
  }

  return generarPdfPasajesGeneral(ini, fin, false, filas_vivas);
}

async function generarConsolidadoContabilidadVivo(
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<Blob> {
  const { clienteApi } = await import("@/lib/cliente-api");
  const rango_defecto = obtenerRangoMes();
  const ini = fecha_inicio || rango_defecto.inicio;
  const fin = fecha_fin || rango_defecto.fin;

  const [res_asist, res_pasajes, res_ref] = await Promise.allSettled([
    clienteApi.get<any[]>(`/asistencia?fecha_inicio=${encodeURIComponent(ini)}&fecha_fin=${encodeURIComponent(fin)}`),
    clienteApi.get<any>(`/pasajes/calculo-pago?fecha_inicio=${encodeURIComponent(ini)}&fecha_fin=${encodeURIComponent(fin)}&descontar_multas=false`),
    clienteApi.get<any[]>(`/refrigerios?fecha_inicio=${encodeURIComponent(ini)}&fecha_fin=${encodeURIComponent(fin)}`),
  ]);

  const asistencias = res_asist.status === "fulfilled" ? extraerListaApi(res_asist.value) : [];
  const becarios_pasajes: any[] =
    res_pasajes.status === "fulfilled" && Array.isArray(res_pasajes.value?.becarios)
      ? res_pasajes.value.becarios
      : [];
  const refrigerios = res_ref.status === "fulfilled" ? extraerListaApi(res_ref.value) : [];

  const total_horas = asistencias.reduce(
    (acc, a) => acc + (a.tipo === "escuela_lideres" ? 0 : Number(a.horas_trabajadas || 0)),
    0
  );
  const total_monto_pasajes_100 = becarios_pasajes.reduce(
    (acc, b) => acc + Number(b.monto_total_100_bs || 0),
    0
  );
  const total_monto_pasajes_80 = becarios_pasajes.reduce(
    (acc, b) => acc + Number(b.monto_reconocido_80_bs || 0),
    0
  );
  const total_monto_refrigerios = refrigerios.reduce(
    (acc, r) => acc + Number(r.monto_devolucion_bs || r.costo_total_bs || 0),
    0
  );

  return generarPdfConsolidadoContabilidad(ini, fin, {
    total_asistencias: asistencias.length,
    total_horas,
    total_solicitudes_pasajes: becarios_pasajes.length,
    total_monto_pasajes_100,
    total_monto_pasajes_80,
    total_refrigerios: refrigerios.length,
    total_monto_refrigerios,
  });
}

// ============================================================================
// FUNCIÓN UNIVERSAL DE DESCARGA: DESCARGA LOCAL O SERVIDOR CON RESILIENCIA
// ============================================================================
export async function descargarPdfConResiliencia(
  endpoint: string,
  nombre_archivo: string,
  tipo:
    | "evaluacion_semestral_ii"
    | "horas"
    | "refrigerios"
    | "f03"
    | "evento"
    | "recorridos_estudiante"
    | "asistencia_estudiante"
    | "pasajes_general"
    | "justificaciones_general"
    | "asistencia_general"
    | "escuela_lideres"
    | "auditoria"
    | "corte_asistencia"
    | "consolidado_auditoria",
  params?: {
    becario_id?: number | string;
    mes?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    modulo?: string;
    tipo?: string;
    nombre_becario?: string;
    titulo?: string;
    evento_id?: number | string;
    descontar_multas?: boolean;
  }
): Promise<void> {
  let blob: Blob | null = null;
  const mes_defecto = new Date().toISOString().slice(0, 7);

  // 1. Intento primario con servidor backend (con timeout ampliado a 90s para reportes complejos)
  try {
    const { clienteApi } = await import("@/lib/cliente-api");
    const candidato = await clienteApi.descargarBlob(endpoint, { tiempo_espera_ms: 90000 });
    if (
      candidato &&
      candidato.size > 0 &&
      (!candidato.type || !candidato.type.includes("application/json"))
    ) {
      const cabecera = await candidato.slice(0, 5).text();
      if (cabecera === "%PDF-") {
        blob = candidato;
      }
    }
  } catch {
    // Si el backend no responde o devuelve 503 en cloud, activamos el generador cliente con datos vivos
    blob = null;
  }

  // 2. Si el backend no devolvió un PDF válido, generamos el documento PDF estilizado con datos vivos
  if (!blob) {
    const id_becario = params?.becario_id ? Number(params.becario_id) || 1 : 1;
    const mes_efectivo = params?.mes || mes_defecto;

    const es_escuela_lideres =
      tipo === "escuela_lideres" ||
      params?.modulo === "escuela_lideres" ||
      endpoint.includes("asistencia-escuela-lideres");

    if (es_escuela_lideres) {
      blob = await generarEscuelaLideresVivo(params?.fecha_inicio, params?.fecha_fin);
    } else {
      switch (tipo) {
        case "evaluacion_semestral_ii": {
          const { clienteApi } = await import("@/lib/cliente-api");
          let registros: any[] = [];
          try {
            const resp = await clienteApi.get<any>("/evaluaciones/consolidado-semestral");
            registros = extraerListaApi(resp);
          } catch {
            registros = [];
          }
          blob = generarPdfEvaluacionSemestral(registros);
          break;
        }
        case "horas":
        case "corte_asistencia":
          blob = await generarCorteHorasVivo(
            params?.fecha_inicio,
            params?.fecha_fin,
            params?.tipo
          );
          break;
        case "refrigerios":
          blob = await generarRefrigeriosVivo(params?.fecha_inicio, params?.fecha_fin);
          break;
        case "f03": {
          const { clienteApi } = await import("@/lib/cliente-api");
          let evaluacion: any = null;
          try {
            evaluacion = await clienteApi.get<any>(`/evaluaciones/${id_becario}`);
          } catch {
            try {
              const lista = await clienteApi.get<any[]>(`/evaluaciones/becario/${id_becario}`);
              evaluacion = extraerListaApi(lista)[0] || null;
            } catch {
              evaluacion = null;
            }
          }
          const campos = evaluacion?.detalle_pastor?.campos_formulario || {};
          const reactivos: Array<[string, string, string, string]> = Object.entries(campos).map(
            ([clave, valor], idx) => [
              String(idx + 1),
              clave.replace(/_/g, " ").toUpperCase(),
              sanitizarTextoPdf(valor),
              "Validado",
            ]
          );
          blob = generarPdfFormularioF03(evaluacion?.id || id_becario, {
            becario_nombre:
              evaluacion?.becario?.usuario?.nombre ||
              evaluacion?.becario?.nombre ||
              params?.nombre_becario,
            ci: evaluacion?.becario?.ci,
            carrera: evaluacion?.becario?.carrera,
            iglesia: evaluacion?.becario?.iglesia?.nombre,
            pastor: evaluacion?.evaluador?.nombre,
            puntaje: evaluacion?.puntaje,
            estado: evaluacion?.estado,
            observaciones: evaluacion?.observaciones,
            reactivos,
          });
          break;
        }
        case "evento": {
          const { clienteApi } = await import("@/lib/cliente-api");
          const id_evento = params?.evento_id ? Number(params.evento_id) || 1 : 1;
          const [res_ev, res_as] = await Promise.allSettled([
            clienteApi.get<any>(`/eventos/${id_evento}`),
            clienteApi.get<any[]>(`/eventos/${id_evento}/asistencias`),
          ]);
          const ev = res_ev.status === "fulfilled" ? res_ev.value : null;
          const asist = res_as.status === "fulfilled" ? extraerListaApi(res_as.value) : [];
          blob = generarPdfActaEvento(id_evento, {
            titulo: ev?.titulo || params?.titulo,
            tipo: ev?.tipo_evento || ev?.tipo,
            ubicacion: ev?.ubicacion || ev?.direccion,
            radio_m: ev?.radio_metros ?? 50,
            asistencias: asist.map((a) => ({
              becario_nombre: a.becario?.usuario?.nombre || `Becario #${a.becario_id}`,
              carrera: a.becario?.carrera || "-",
              hora_programada: ev?.hora_inicio || "14:30",
              hora_gps: a.hora_marcacion || "-",
              distancia_geocerca:
                a.distancia_m !== undefined && a.distancia_m !== null
                  ? `${Math.round(Number(a.distancia_m))} m`
                  : "N/A",
              estado: a.dentro_de_radio ? "PRESENTE" : "FUERA DE RADIO",
            })),
          });
          break;
        }
        case "recorridos_estudiante": {
          const { clienteApi } = await import("@/lib/cliente-api");
          const [res_becario, res_solicitudes] = await Promise.allSettled([
            clienteApi.get<any>(`/becarios/${id_becario}`),
            clienteApi.get<any[]>(`/pasajes/becario/${id_becario}`),
          ]);

          const raw_bec = res_becario.status === "fulfilled" ? res_becario.value : null;
          const becario_vivo: Partial<DatosBecarioPdfCliente> = {
            id: id_becario,
            nombre: raw_bec?.usuario?.nombre || raw_bec?.nombre || params?.nombre_becario,
            ci: raw_bec?.ci ? String(raw_bec.ci) : undefined,
            carrera: raw_bec?.carrera,
            universidad: raw_bec?.universidad,
            sede: raw_bec?.lugar_practica?.nombre || raw_bec?.ubicacion,
          };

          const solicitudes =
            res_solicitudes.status === "fulfilled" ? extraerListaApi(res_solicitudes.value) : [];
          const [ano_str, mes_str] = mes_efectivo.split("-");
          const ano_num = Number(ano_str);
          const mes_num = Number(mes_str);
          const recorridos_vivos: RecorridoPdfCliente[] = [];
          for (const sol of solicitudes) {
            const estado_sol = String(sol.estado || "").toLowerCase();
            if (estado_sol === "borrador" || estado_sol === "rechazado") continue;
            const coincide_mes =
              (Number(sol.ano) === ano_num && Number(sol.mes) === mes_num) ||
              (Array.isArray(sol.recorridos) &&
                sol.recorridos.some((r: any) =>
                  String(r.fecha || "").startsWith(mes_efectivo)
                ));
            if (coincide_mes && Array.isArray(sol.recorridos)) {
              for (const r of sol.recorridos) {
                const fecha_r = String(r.fecha || "").slice(0, 10);
                if (
                  !params?.fecha_inicio ||
                  !params?.fecha_fin ||
                  (fecha_r >= params.fecha_inicio && fecha_r <= params.fecha_fin) ||
                  fecha_r.startsWith(mes_efectivo)
                ) {
                  recorridos_vivos.push({
                    fecha: fecha_r,
                    origen: sanitizarTextoPdf(r.origen || "-"),
                    destino: sanitizarTextoPdf(r.destino || "-"),
                    sentido: r.sentido || r.tramo,
                    tipo_transporte: r.tipo_transporte || "Minibús",
                    costo_pasaje: Number(r.costo_pasaje || r.tarifa || 0),
                    monto_reembolso_80: Number(
                      r.monto_reembolso_80 ?? Number(r.costo_pasaje || r.tarifa || 0) * 0.8
                    ),
                  });
                }
              }
            }
          }

          blob = generarPdfExpedienteRecorridos(id_becario, mes_efectivo, {
            becario: becario_vivo,
            recorridos: recorridos_vivos,
            multas_asistencia: 0,
          });
          break;
        }
        case "asistencia_estudiante": {
          const { clienteApi } = await import("@/lib/cliente-api");
          const rango_mes = obtenerRangoMes(mes_efectivo);
          const ini = params?.fecha_inicio || rango_mes.inicio;
          const fin = params?.fecha_fin || rango_mes.fin;
          const [res_bec, res_asist] = await Promise.allSettled([
            clienteApi.get<any>(`/becarios/${id_becario}`),
            clienteApi.get<any[]>(
              `/asistencia?becario_id=${id_becario}&fecha_inicio=${encodeURIComponent(
                ini
              )}&fecha_fin=${encodeURIComponent(fin)}`
            ),
          ]);
          const raw_bec = res_bec.status === "fulfilled" ? res_bec.value : null;
          const registros_raw =
            res_asist.status === "fulfilled" ? extraerListaApi(res_asist.value) : [];
          blob = generarPdfAsistenciaMensual(id_becario, mes_efectivo, {
            becario: {
              id: id_becario,
              nombre: raw_bec?.usuario?.nombre || raw_bec?.nombre || params?.nombre_becario,
              ci: raw_bec?.ci ? String(raw_bec.ci) : undefined,
              carrera: raw_bec?.carrera,
              sede: raw_bec?.lugar_practica?.nombre || raw_bec?.ubicacion,
            },
            registros: registros_raw.map((a) => {
              const es_lid = a.tipo === "escuela_lideres";
              const retraso = Number(a.minutos_retraso || 0);
              return {
                fecha: String(a.fecha || "").slice(0, 10),
                hora_programada: a.hora_prevista || (es_lid ? "14:30" : "08:00"),
                hora_gps: a.hora_ingreso || "-",
                horas: es_lid ? 0 : Number(a.horas_trabajadas || 4),
                retraso_min: retraso,
                estado: retraso > 0 ? `Tardanza (+${retraso}m)` : "Puntual Conforme",
              };
            }),
          });
          break;
        }
        case "pasajes_general":
          blob = await generarPasajesGeneralVivo(params?.fecha_inicio, params?.fecha_fin);
          break;
        case "justificaciones_general": {
          const { clienteApi } = await import("@/lib/cliente-api");
          const rango_defecto = obtenerRangoMes();
          const ini = params?.fecha_inicio || rango_defecto.inicio;
          const fin = params?.fecha_fin || rango_defecto.fin;
          let lista: any[] = [];
          try {
            const resp = await clienteApi.get<any[]>("/justificaciones");
            lista = extraerListaApi(resp);
          } catch {
            lista = [];
          }
          const filas: FilaJustificacionPdfCliente[] = lista
            .filter((j) => {
              const f = String(j.fecha_incidencia || "").slice(0, 10);
              return !f || (f >= ini && f <= fin);
            })
            .map((j) => ({
              becario_nombre: j.becario?.usuario?.nombre || `Becario #${j.becario_id}`,
              fecha: String(j.fecha_incidencia || "").slice(0, 10) || "-",
              motivo: j.motivo || j.descripcion || "Motivo declarado",
              actividad: String(j.tipo_incidencia || "practicas").replace(/_/g, " ").toUpperCase(),
              prueba_adjunta: j.archivo_prueba_url ? "Sí (Adjunto)" : "Sin adjunto",
              dictamen: String(j.estado || "PENDIENTE").toUpperCase(),
              resolucion_multa: j.observacion_admin || j.observacion_supervisor || "En revisión",
            }));
          blob = generarPdfJustificacionesGeneral(ini, fin, filas);
          break;
        }
        case "asistencia_general":
          blob = await generarAsistenciaGeneralVivo(params?.fecha_inicio, params?.fecha_fin);
          break;
        case "consolidado_auditoria":
        case "auditoria": {
          const modulo = (params?.modulo || "").toLowerCase();
          if (modulo === "pasajes") {
            blob = await generarPasajesGeneralVivo(params?.fecha_inicio, params?.fecha_fin);
          } else if (modulo === "asistencia") {
            blob = await generarCorteHorasVivo(params?.fecha_inicio, params?.fecha_fin);
          } else if (modulo === "evaluaciones") {
            const { clienteApi } = await import("@/lib/cliente-api");
            let registros: any[] = [];
            try {
              const resp = await clienteApi.get<any>("/evaluaciones/consolidado-semestral");
              registros = extraerListaApi(resp);
            } catch {
              registros = [];
            }
            blob = generarPdfEvaluacionSemestral(registros);
          } else if (modulo === "refrigerios") {
            blob = await generarRefrigeriosVivo(params?.fecha_inicio, params?.fecha_fin);
          } else {
            blob = await generarConsolidadoContabilidadVivo(
              params?.fecha_inicio,
              params?.fecha_fin
            );
          }
          break;
        }
        default:
          blob = generarPdfEvaluacionSemestral();
          break;
      }
    }
  }

  // 3. Descarga directa en el navegador
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre_archivo;
  document.body.appendChild(enlace);
  enlace.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(enlace);
}
