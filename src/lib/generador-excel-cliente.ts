import {
  calcularSegundosEntreHoras,
  formatearDuracionAsistencia,
  formatearHorasDecimalAHhmmss,
  formatearSegundosAHhmmss,
  obtenerMesActualLaPaz,
} from "./fechas-institucionales";

export interface ConfiguracionDescargaExcel {
  nombre_archivo: string;
  titulo_reporte: string;
  subtitulo?: string;
  nombre_hoja?: string;
  columnas: string[];
  filas: Array<Array<string | number>>;
  fila_totales?: Array<string | number>;
}

type RegistroExcel = Record<string, unknown>;

const COLOR_AZUL_OSCURO = "FF035683";
const COLOR_AZUL_PRIMARIO = "FF007BBE";
const COLOR_GRIS_CLARO = "FFF1F5F9";
const COLOR_FILA_ALTERNA = "FFF8FAFC";
const COLOR_TOTALES_FONDO = "FFE0F2FE";
const COLOR_BORDE_GRIS = "FFCBD5E1";
const COLOR_TEXTO_OSCURO = "FF1E293B";
const COLOR_TEXTO_SUBTITULO = "FF334155";
const COLOR_BLANCO = "FFFFFFFF";

function comoRegistro(valor: unknown): RegistroExcel {
  if (valor && typeof valor === "object") {
    return valor as RegistroExcel;
  }
  return {};
}

function normalizarNombreArchivoExcel(nombre_archivo: string): string {
  const limpio = nombre_archivo.trim() || "Reporte_BUMAND.xlsx";
  if (limpio.toLowerCase().endsWith(".xlsx")) return limpio;
  if (limpio.toLowerCase().endsWith(".xls")) return limpio.replace(/\.xls$/i, ".xlsx");
  return `${limpio}.xlsx`;
}

function normalizarNombreHojaExcel(nombre_hoja?: string): string {
  const limpio = (nombre_hoja || "Reporte BUMAND")
    .replace(/[:\\/?*\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (limpio || "Reporte BUMAND").slice(0, 31);
}

function calcularLetraColumna(indice_columna_1_based: number): string {
  let dividendo = indice_columna_1_based;
  let nombre_columna = "";
  while (dividendo > 0) {
    const modulo = (dividendo - 1) % 26;
    nombre_columna = String.fromCharCode(65 + modulo) + nombre_columna;
    dividendo = Math.floor((dividendo - modulo) / 26);
  }
  return nombre_columna || "A";
}

function estimarAnchoTextoCelda(valor: string | number | null | undefined): number {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).length;
  }
  const lineas = String(valor ?? "").split(/\r?\n/);
  return lineas.reduce((max, linea) => Math.max(max, linea.length), 0);
}

export async function descargarExcelInstitucional({
  nombre_archivo,
  titulo_reporte,
  subtitulo,
  nombre_hoja,
  columnas,
  filas,
  fila_totales,
}: ConfiguracionDescargaExcel): Promise<void> {
  if (typeof window === "undefined") return;

  const modulo_excel = await import("exceljs");
  const ExcelJS = modulo_excel.default ?? modulo_excel;

  const libro = new ExcelJS.Workbook();
  libro.creator = "Sistema BUMAND · Fundación Diaconía FRIF-IFD";
  libro.created = new Date();

  const hoja = libro.addWorksheet(normalizarNombreHojaExcel(nombre_hoja), {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  const total_columnas = Math.max(1, columnas.length);
  const letra_final = calcularLetraColumna(total_columnas);
  const fecha_emision = new Date().toLocaleString("es-BO");

  const borde_institucional = {
    top: { style: "thin" as const, color: { argb: COLOR_AZUL_OSCURO } },
    left: { style: "thin" as const, color: { argb: COLOR_AZUL_OSCURO } },
    bottom: { style: "thin" as const, color: { argb: COLOR_AZUL_OSCURO } },
    right: { style: "thin" as const, color: { argb: COLOR_AZUL_OSCURO } },
  };

  const borde_celda = {
    top: { style: "thin" as const, color: { argb: COLOR_BORDE_GRIS } },
    left: { style: "thin" as const, color: { argb: COLOR_BORDE_GRIS } },
    bottom: { style: "thin" as const, color: { argb: COLOR_BORDE_GRIS } },
    right: { style: "thin" as const, color: { argb: COLOR_BORDE_GRIS } },
  };

  hoja.mergeCells(`A1:${letra_final}1`);
  const celda_membrete = hoja.getCell("A1");
  celda_membrete.value = "FUNDACIÓN DIACONÍA FRIF-IFD · SISTEMA BUMAND";
  celda_membrete.font = { name: "Calibri", size: 13, bold: true, color: { argb: COLOR_BLANCO } };
  celda_membrete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_AZUL_OSCURO } };
  celda_membrete.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  celda_membrete.border = borde_institucional;
  hoja.getRow(1).height = 26;

  hoja.mergeCells(`A2:${letra_final}2`);
  const celda_titulo = hoja.getCell("A2");
  celda_titulo.value = titulo_reporte;
  celda_titulo.font = { name: "Calibri", size: 11.5, bold: true, color: { argb: COLOR_BLANCO } };
  celda_titulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_AZUL_PRIMARIO } };
  celda_titulo.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  celda_titulo.border = borde_institucional;
  hoja.getRow(2).height = 22;

  hoja.mergeCells(`A3:${letra_final}3`);
  const celda_subtitulo = hoja.getCell("A3");
  celda_subtitulo.value = `${subtitulo || "Reporte institucional oficial"} · Emitido: ${fecha_emision}`;
  celda_subtitulo.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXTO_SUBTITULO } };
  celda_subtitulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_GRIS_CLARO } };
  celda_subtitulo.alignment = { horizontal: "left", vertical: "middle", indent: 1, wrapText: true };
  celda_subtitulo.border = borde_celda;
  hoja.getRow(3).height = 20;

  hoja.getRow(4).height = 8;

  const fila_cabecera = hoja.getRow(5);
  fila_cabecera.height = 26;
  columnas.forEach((col, indice) => {
    const celda = fila_cabecera.getCell(indice + 1);
    celda.value = col;
    celda.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: COLOR_BLANCO } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_AZUL_PRIMARIO } };
    celda.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    celda.border = borde_institucional;
  });

  const anchos_maximos = columnas.map((col) => estimarAnchoTextoCelda(col));

  filas.forEach((fila_datos, indice_fila) => {
    const numero_fila = 6 + indice_fila;
    const fila_hoja = hoja.getRow(numero_fila);
    const fondo = indice_fila % 2 === 0 ? COLOR_BLANCO : COLOR_FILA_ALTERNA;

    for (let col_idx = 0; col_idx < total_columnas; col_idx++) {
      const valor = fila_datos[col_idx] ?? "";
      const celda = fila_hoja.getCell(col_idx + 1);
      const es_numero = typeof valor === "number" && Number.isFinite(valor);

      celda.value = es_numero ? valor : String(valor);
      celda.font = { name: "Calibri", size: 10, color: { argb: COLOR_TEXTO_OSCURO } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fondo } };
      celda.border = borde_celda;

      if (es_numero) {
        celda.numFmt = "#,##0.00";
        celda.alignment = { horizontal: "right", vertical: "middle" };
      } else {
        celda.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }

      anchos_maximos[col_idx] = Math.max(
        anchos_maximos[col_idx] ?? 8,
        estimarAnchoTextoCelda(valor)
      );
    }
  });

  if (fila_totales && fila_totales.length > 0) {
    const numero_fila_totales = 6 + filas.length;
    const fila_hoja_totales = hoja.getRow(numero_fila_totales);
    fila_hoja_totales.height = 22;

    for (let col_idx = 0; col_idx < total_columnas; col_idx++) {
      const valor = fila_totales[col_idx] ?? "";
      const celda = fila_hoja_totales.getCell(col_idx + 1);
      const es_numero = typeof valor === "number" && Number.isFinite(valor);

      celda.value = es_numero ? valor : String(valor);
      celda.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: COLOR_AZUL_OSCURO } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_TOTALES_FONDO } };
      celda.border = borde_institucional;

      if (es_numero) {
        celda.numFmt = "#,##0.00";
        celda.alignment = { horizontal: "right", vertical: "middle" };
      } else {
        celda.alignment = { horizontal: "left", vertical: "middle" };
      }

      anchos_maximos[col_idx] = Math.max(
        anchos_maximos[col_idx] ?? 8,
        estimarAnchoTextoCelda(valor)
      );
    }
  }

  columnas.forEach((col, col_idx) => {
    const ancho_minimo = col.trim() === "N°" ? 6 : 11;
    const ancho_calculado = Math.min(44, Math.max(ancho_minimo, (anchos_maximos[col_idx] ?? 8) + 4));
    hoja.getColumn(col_idx + 1).width = ancho_calculado;
  });

  const buffer = await libro.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = normalizarNombreArchivoExcel(nombre_archivo);
  document.body.appendChild(enlace);
  enlace.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(enlace);
}

export async function exportarFormularioContabilidadRsdExcel(
  solicitudes_entrada: readonly object[],
  periodo = obtenerMesActualLaPaz(),
  descontar_multas = false
): Promise<void> {
  let suma_total_100 = 0;
  let suma_reconocido_80 = 0;
  let suma_liquido = 0;

  const filas: Array<Array<string | number>> = solicitudes_entrada.map((item, idx) => {
    const sol = comoRegistro(item);
    const becario = comoRegistro(sol.becario);
    const becario_usuario = comoRegistro(becario.usuario);
    const becario_lugar = comoRegistro(becario.lugar_practica);

    const monto_total_bs =
      sol.monto_total_100_bs !== undefined
        ? Number(sol.monto_total_100_bs)
        : sol.monto_total_centavos !== undefined
        ? Number(sol.monto_total_centavos) / 100
        : Number(sol.total_declarado ?? sol.monto_total ?? 0);
    const monto_80_bs =
      sol.monto_reconocido_80_bs !== undefined
        ? Number(sol.monto_reconocido_80_bs)
        : sol.monto_devolucion_centavos !== undefined
        ? Number(sol.monto_devolucion_centavos) / 100
        : Number(sol.total_reembolso_80 ?? sol.monto_devolucion ?? monto_total_bs * 0.8);
    void descontar_multas;
    const liquido_pagable = Number(monto_80_bs.toFixed(2));

    suma_total_100 += monto_total_bs;
    suma_reconocido_80 += monto_80_bs;
    suma_liquido += liquido_pagable;

    const nombre_becario = String(
      sol.becario_nombre ||
        sol.nombre ||
        becario_usuario.nombre ||
        becario.nombre ||
        `Becario ${idx + 1}`
    );
    const unidad = String(
      sol.unidad ||
        sol.lugar_practicas ||
        becario.unidad ||
        becario_lugar.nombre ||
        "Unidad Diaconía"
    );
    const actividad = String(sol.tipo_actividad || "Prácticas");
    const cantidad_recorridos = Array.isArray(sol.recorridos)
      ? sol.recorridos.length
      : Number(sol.cantidad_recorridos ?? sol.total_recorridos ?? 0);
    const estado = String(sol.estado || "pendiente").toUpperCase();

    return [
      String(idx + 1),
      nombre_becario,
      unidad,
      actividad,
      String(cantidad_recorridos),
      Number(monto_total_bs.toFixed(2)),
      Number(monto_80_bs.toFixed(2)),
      liquido_pagable,
      estado,
    ];
  });

  await descargarExcelInstitucional({
    nombre_archivo: `Formulario_Contabilidad_RSD_Pasajes_${periodo.replace(/\s+/g, "_")}.xlsx`,
    nombre_hoja: "Pasajes Contabilidad RSD",
    titulo_reporte: "FORMULARIO PARA CONTABILIDAD Y RSD — LIQUIDACIÓN DE PASAJES",
    subtitulo: `Liquidación mensual del 80% de pasajes sin descuento de multas · Periodo: ${periodo}`,
    columnas: [
      "N°",
      "Becario",
      "Unidad / Agencia",
      "Actividad",
      "Recorridos",
      "TOTAL (100%) Bs",
      "80% RECONOCIDO Bs",
      "LÍQUIDO PAGABLE (NETO RSD) Bs",
      "Estado",
    ],
    filas,
    fila_totales: [
      "",
      "TOTALES GENERALES",
      "",
      "",
      "",
      Number(suma_total_100.toFixed(2)),
      Number(suma_reconocido_80.toFixed(2)),
      Number(suma_liquido.toFixed(2)),
      "",
    ],
  });
}

export async function exportarSabanaEvaluacionesExcel(
  becarios_entrada: readonly object[],
  periodo = "Semestre II - 2026"
): Promise<void> {
  const becarios = becarios_entrada.map(comoRegistro);
  const filas: Array<Array<string | number>> = becarios.map((b, idx) => [
    String(idx + 1),
    String(b.nombre_completo || b.nombre || `Becario ${idx + 1}`),
    String(b.ci || "-"),
    String(b.universidad || "-"),
    String(b.carrera || "-"),
    `Bs ${String(b.tipo_beca || 650)}`,
    Number(b.liderazgo_iglesia ?? b.m1 ?? 0),
    Number(b.academica ?? b.m2 ?? 0),
    Number(b.practicas_preprofesionales ?? b.m3 ?? 0),
    Number(b.escuela_lideres ?? b.m4 ?? 0),
    Number(b.socioeconomico ?? b.m5 ?? 0),
    Number(b.total ?? 0),
    String(b.total_calificacion || "CONFORME"),
  ]);

  const promedio_total =
    becarios.length > 0
      ? Number(
          (
            becarios.reduce((acc, b) => acc + Number(b.total ?? 0), 0) / becarios.length
          ).toFixed(2)
        )
      : 0;

  await descargarExcelInstitucional({
    nombre_archivo: `Sabana_Evaluaciones_${periodo.replace(/\s+/g, "_")}.xlsx`,
    nombre_hoja: "Evaluaciones 360",
    titulo_reporte: `SÁBANA CONSOLIDADA DE EVALUACIONES 360° — ${periodo.toUpperCase()}`,
    subtitulo: "Matriz Oficial de Calificaciones (Iglesia, Académica, Mentor, Escuela de Líderes y Socioeconómica)",
    columnas: [
      "N°",
      "Becario Universitario",
      "C.I.",
      "Universidad",
      "Carrera",
      "Tipo Beca",
      "M1 Iglesia (20p)",
      "M2 Académica (20p)",
      "M3 Mentor (20p)",
      "M4 Líderes (20p)",
      "M5 Socioec. (20p)",
      "Total (/100p)",
      "Dictamen",
    ],
    filas,
    fila_totales: [
      "",
      `PROMEDIO GENERAL (${becarios.length} becarios)`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      promedio_total,
      "",
    ],
  });
}

export async function exportarAuditoriaAsistenciaExcel(
  registros_entrada: readonly object[],
  periodo = obtenerMesActualLaPaz()
): Promise<void> {
  const registros = registros_entrada.map(comoRegistro);
  const es_extracto_movimientos =
    registros.length > 0 &&
    registros[0].fecha_corta !== undefined &&
    registros[0].horas_dia !== undefined;

  if (es_extracto_movimientos) {
    const total_segs = registros.reduce((acc, r) => {
      if (typeof r.segundos_dia === "number" && r.segundos_dia >= 0) return acc + r.segundos_dia;
      const calc = calcularSegundosEntreHoras(String(r.hora_entrada || ""), r.hora_salida ? String(r.hora_salida) : null);
      return acc + (calc > 0 ? calc : Math.round(Number(r.horas_dia ?? 0) * 3600));
    }, 0);
    const total_hms = formatearSegundosAHhmmss(total_segs);
    const filas = registros.map((r, idx) => {
      const h_dia =
        typeof r.horas_dia_hms === "string" && r.horas_dia_hms
          ? r.horas_dia_hms
          : !r.hora_salida && Number(r.horas_dia ?? 0) === 0
          ? "En curso"
          : formatearDuracionAsistencia(
              String(r.hora_entrada || ""),
              r.hora_salida ? String(r.hora_salida) : null,
              Number(r.horas_dia ?? 0)
            );
      const saldo_hms =
        typeof r.saldo_acumulado_hms === "string" && r.saldo_acumulado_hms
          ? r.saldo_acumulado_hms
          : formatearHorasDecimalAHhmmss(Number(r.saldo_acumulado ?? 0));
      return [
        String(idx + 1),
        String(r.fecha || "-"),
        String(r.dia_semana || "-"),
        String(r.tipo_etiqueta || r.tipo || "Prácticas"),
        String(r.sede || "-"),
        String(r.hora_entrada || "-"),
        String(r.hora_salida || "En curso"),
        h_dia,
        saldo_hms,
        r.permiso_aprobado ? "Permiso Compensado 100%" : String(r.estado || "acreditado").toUpperCase(),
      ];
    });

    await descargarExcelInstitucional({
      nombre_archivo: `Extracto_Asistencia_${periodo.replace(/\s+/g, "_")}.xlsx`,
      nombre_hoja: "Extracto Asistencia",
      titulo_reporte: "EXTRACTO MENSUAL DE ASISTENCIA Y HORAS DE PRÁCTICA",
      subtitulo: `Periodo: ${periodo} · Incluye días con permiso compensados al 100%`,
      columnas: [
        "N°",
        "Fecha",
        "Día",
        "Actividad",
        "Sede",
        "Entrada",
        "Salida",
        "Duración (hh:mm:ss)",
        "Saldo Acumulado (hh:mm:ss)",
        "Estado",
      ],
      filas,
      fila_totales: [
        "",
        "TOTAL HORAS ACUMULADAS",
        "",
        "",
        "",
        "",
        "",
        total_hms,
        total_hms,
        "",
      ],
    });
    return;
  }

  const es_resumen_mensual =
    registros.length > 0 &&
    registros[0].horas_realizadas !== undefined &&
    registros[0].meta_horas !== undefined;

  if (es_resumen_mensual) {
    const total_segs = registros.reduce((acc, r) => {
      if (typeof r.segundos_mes_actual === "number") return acc + r.segundos_mes_actual;
      return acc + Math.round(Number(r.horas_realizadas ?? 0) * 3600);
    }, 0);
    const total_hms = formatearSegundosAHhmmss(total_segs);
    const total_multas = registros.reduce((acc, r) => acc + Number(r.multas_acumuladas_bs ?? 0), 0);
    const filas = registros.map((r, idx) => [
      String(idx + 1),
      String(r.nombre || r.becario_nombre || `Becario ${idx + 1}`),
      String(r.ci || "-"),
      String(r.carrera || "-"),
      String(r.sede || "-"),
      typeof r.horas_realizadas_hms === "string" && r.horas_realizadas_hms
        ? r.horas_realizadas_hms
        : formatearHorasDecimalAHhmmss(Number(r.horas_realizadas ?? 0)),
      formatearHorasDecimalAHhmmss(Number(r.meta_horas ?? 36)),
      String(r.dias_asistidos ?? 0),
      Number(r.multas_acumuladas_bs ?? 0),
      String(r.estado_meta || "en_progreso").toUpperCase(),
    ]);

    await descargarExcelInstitucional({
      nombre_archivo: `Corte_Mensual_Asistencia_${periodo.replace(/\s+/g, "_")}.xlsx`,
      nombre_hoja: "Corte Mensual",
      titulo_reporte: "CORTE MENSUAL DE ASISTENCIA Y CUMPLIMIENTO DE HORAS",
      subtitulo: `Periodo: ${periodo} · Contabilidad Institucional BUMAND`,
      columnas: [
        "N°",
        "Becario",
        "C.I.",
        "Carrera",
        "Sede",
        "Horas Realizadas",
        "Meta Horas",
        "Días Asistidos",
        "Multas Viernes Bs",
        "Estado Meta",
      ],
      filas,
      fila_totales: [
        "",
        "TOTALES",
        "",
        "",
        "",
        total_hms,
        "",
        "",
        Number(total_multas.toFixed(2)),
        "",
      ],
    });
    return;
  }

  const total_segs_auditoria = registros.reduce((acc, r) => {
    const calc = calcularSegundosEntreHoras(
      r.hora_ingreso ? String(r.hora_ingreso) : null,
      r.hora_salida ? String(r.hora_salida) : null
    );
    return acc + (calc > 0 ? calc : Math.round(Number(r.horas_trabajadas ?? 0) * 3600));
  }, 0);
  const total_multas = registros.reduce((acc, r) => acc + Number(r.monto_multa_bs ?? 0), 0);
  const filas = registros.map((r, idx) => {
    const becario = comoRegistro(r.becario);
    const becario_usuario = comoRegistro(becario.usuario);
    const becario_lugar = comoRegistro(becario.lugar_practica);
    const fecha_texto = r.fecha ? String(r.fecha).split("T")[0] : periodo;
    const estado_texto =
      r.estado ||
      r.estado_aprobacion ||
      (r.dentro_de_radio === false ? "fuera_geocerca" : r.dentro_de_horario === false ? "tardanza" : "conforme");
    const tipo_crudo = String(r.tipo || r.tipo_actividad || "practicas");
    const actividad_texto =
      tipo_crudo === "escuela_lideres"
        ? "Escuela de Líderes"
        : tipo_crudo === "acciones_servicio"
        ? "Acciones de Servicio"
        : "Prácticas";
    const horas_fila_hms =
      tipo_crudo === "escuela_lideres"
        ? "00:00:00"
        : !r.hora_salida && !r.horas_trabajadas
        ? "En curso"
        : formatearDuracionAsistencia(
            r.hora_ingreso ? String(r.hora_ingreso) : null,
            r.hora_salida ? String(r.hora_salida) : null,
            Number(r.horas_trabajadas ?? 0)
          );

    return [
      String(idx + 1),
      String(r.becario_nombre || r.nombre || becario_usuario.nombre || becario.nombre || `Becario ${idx + 1}`),
      String(r.carrera || becario.carrera || "-"),
      actividad_texto,
      String(r.sede_nombre || r.sede || becario_lugar.nombre || "-"),
      fecha_texto,
      String(r.hora_ingreso || "-"),
      String(r.hora_salida || "En curso"),
      horas_fila_hms,
      Number(r.monto_multa_bs ?? 0),
      String(estado_texto).toUpperCase(),
    ];
  });

  await descargarExcelInstitucional({
    nombre_archivo: `Auditoria_Asistencia_${periodo.replace(/\s+/g, "_")}.xlsx`,
    nombre_hoja: "Auditoría Asistencia",
    titulo_reporte: "AUDITORÍA OFICIAL DE ASISTENCIA Y GEOCERCAS WGS84",
    subtitulo: `Periodo: ${periodo} · Fundación Diaconía FRIF-IFD`,
    columnas: [
      "N°",
      "Becario",
      "Carrera",
      "Actividad",
      "Sede",
      "Fecha",
      "Ingreso",
      "Salida",
      "Duración (hh:mm:ss)",
      "Multa Bs",
      "Estado",
    ],
    filas,
    fila_totales: [
      "",
      "TOTALES",
      "",
      "",
      "",
      "",
      "",
      "",
      formatearSegundosAHhmmss(total_segs_auditoria),
      Number(total_multas.toFixed(2)),
      "",
    ],
  });
}
