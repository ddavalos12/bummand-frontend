export interface ConfiguracionDescargaExcel {
  nombre_archivo: string;
  titulo_reporte: string;
  subtitulo?: string;
  columnas: string[];
  filas: Array<Array<string | number>>;
  fila_totales?: Array<string | number>;
}

function escaparHtml(valor: string | number | null | undefined): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizarNombreArchivoExcel(nombre_archivo: string): string {
  const limpio = nombre_archivo.trim() || "Reporte_BUMAND.xls";
  if (limpio.toLowerCase().endsWith(".xls")) return limpio;
  if (limpio.toLowerCase().endsWith(".xlsx")) return limpio.replace(/\.xlsx$/i, ".xls");
  return `${limpio}.xls`;
}

export function descargarExcelInstitucional({
  nombre_archivo,
  titulo_reporte,
  subtitulo,
  columnas,
  filas,
  fila_totales,
}: ConfiguracionDescargaExcel): void {
  const fecha_emision = new Date().toLocaleString("es-BO");
  const total_columnas = Math.max(1, columnas.length);

  const cabeceras_html = columnas
    .map(
      (col) =>
        `<th style="background-color:#007BBE;color:#FFFFFF;font-weight:bold;padding:8px 10px;border:1px solid #035683;text-align:center;font-size:11px;">${escaparHtml(
          col
        )}</th>`
    )
    .join("");

  const filas_html = filas
    .map((fila, indice_fila) => {
      const fondo = indice_fila % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
      const celdas = fila
        .map((celda) => {
          const es_numero = typeof celda === "number";
          const formato = es_numero ? "mso-number-format:'#,##0.00';text-align:right;" : "text-align:left;";
          const contenido = es_numero ? celda.toFixed(2) : escaparHtml(celda);
          return `<td style="background-color:${fondo};color:#1E293B;padding:6px 10px;border:1px solid #CBD5E1;font-size:11px;${formato}">${contenido}</td>`;
        })
        .join("");
      return `<tr>${celdas}</tr>`;
    })
    .join("");

  const totales_html = fila_totales
    ? `<tr>${fila_totales
        .map((celda) => {
          const es_numero = typeof celda === "number";
          const formato = es_numero ? "mso-number-format:'#,##0.00';text-align:right;" : "text-align:left;";
          const contenido = es_numero ? celda.toFixed(2) : escaparHtml(celda);
          return `<td style="background-color:#E0F2FE;color:#035683;font-weight:bold;padding:7px 10px;border:1px solid #035683;font-size:11px;${formato}">${contenido}</td>`;
        })
        .join("")}</tr>`
    : "";

  const contenido_excel = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook>
  <x:ExcelWorksheets>
    <x:ExcelWorksheet>
      <x:Name>Reporte BUMAND</x:Name>
      <x:WorksheetOptions>
        <x:DisplayGridlines/>
      </x:WorksheetOptions>
    </x:ExcelWorksheet>
  </x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml><![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${total_columnas}" style="background-color:#035683;color:#FFFFFF;font-weight:bold;font-size:14px;padding:10px;border:1px solid #035683;">
        FUNDACIÓN DIACONÍA FRIF-IFD · SISTEMA BUMAND
      </td>
    </tr>
    <tr>
      <td colspan="${total_columnas}" style="background-color:#007BBE;color:#FFFFFF;font-weight:bold;font-size:13px;padding:8px 10px;border:1px solid #035683;">
        ${escaparHtml(titulo_reporte)}
      </td>
    </tr>
    <tr>
      <td colspan="${total_columnas}" style="background-color:#F1F5F9;color:#334155;font-size:11px;padding:6px 10px;border:1px solid #CBD5E1;">
        ${escaparHtml(subtitulo || "Reporte institucional oficial")} · Emitido: ${escaparHtml(fecha_emision)}
      </td>
    </tr>
    <tr><td colspan="${total_columnas}" style="height:6px;"></td></tr>
    <thead>
      <tr>${cabeceras_html}</tr>
    </thead>
    <tbody>
      ${filas_html}
      ${totales_html}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(["\uFEFF" + contenido_excel], {
    type: "application/vnd.ms-excel;charset=utf-8;",
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

export function exportarFormularioContabilidadSrdExcel(
  solicitudes: Array<Record<string, any>>,
  periodo = "2026-10",
  descontar_multas = true
): void {
  let suma_total_100 = 0;
  let suma_reconocido_80 = 0;
  let suma_multas = 0;
  let suma_liquido = 0;

  const filas: Array<Array<string | number>> = solicitudes.map((sol, idx) => {
    const monto_total_bs =
      sol.monto_total_centavos !== undefined
        ? Number(sol.monto_total_centavos) / 100
        : Number(sol.total_declarado ?? sol.monto_total ?? 0);
    const monto_80_bs =
      sol.monto_devolucion_centavos !== undefined
        ? Number(sol.monto_devolucion_centavos) / 100
        : Number(sol.total_reembolso_80 ?? sol.monto_devolucion ?? monto_total_bs * 0.8);
    const multa_original_bs =
      sol.multas_asistencia_centavos !== undefined
        ? Number(sol.multas_asistencia_centavos) / 100
        : Number(sol.multas_asistencia_bs ?? 0);
    const multa_aplicada = descontar_multas ? multa_original_bs : 0;
    const liquido_pagable = Math.max(0, Number((monto_80_bs - multa_aplicada).toFixed(2)));

    suma_total_100 += monto_total_bs;
    suma_reconocido_80 += monto_80_bs;
    suma_multas += multa_aplicada;
    suma_liquido += liquido_pagable;

    const nombre_becario =
      sol.becario_nombre ||
      sol.becario?.usuario?.nombre ||
      sol.becario?.nombre ||
      `Becario ${idx + 1}`;
    const unidad = sol.unidad || sol.lugar_practicas || "Unidad Diaconía";
    const actividad = sol.tipo_actividad || "Prácticas";
    const cantidad_recorridos = Array.isArray(sol.recorridos) ? sol.recorridos.length : Number(sol.cantidad_recorridos || 0);
    const estado = String(sol.estado || "pendiente").toUpperCase();

    return [
      String(idx + 1),
      nombre_becario,
      unidad,
      actividad,
      String(cantidad_recorridos),
      Number(monto_total_bs.toFixed(2)),
      Number(monto_80_bs.toFixed(2)),
      Number(multa_aplicada.toFixed(2)),
      liquido_pagable,
      estado,
    ];
  });

  descargarExcelInstitucional({
    nombre_archivo: `Formulario_Contabilidad_SRD_Pasajes_${periodo.replace(/\s+/g, "_")}.xls`,
    titulo_reporte: "FORMULARIO PARA CONTABILIDAD Y SRD — LIQUIDACIÓN DE PASAJES",
    subtitulo: `Liquidación mensual del 80% de pasajes y cálculo líquido ${
      descontar_multas ? "descontando multas de asistencia" : "sin descuento de multas"
    } · Periodo: ${periodo}`,
    columnas: [
      "N°",
      "Becario",
      "Unidad / Agencia",
      "Actividad",
      "Recorridos",
      "TOTAL (100%) Bs",
      "80% RECONOCIDO Bs",
      "(-) MULTAS ASISTENCIA Bs",
      "LÍQUIDO PAGABLE (NETO SRD) Bs",
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
      Number(suma_multas.toFixed(2)),
      Number(suma_liquido.toFixed(2)),
      "",
    ],
  });
}

export function exportarSabanaEvaluacionesExcel(
  becarios: Array<Record<string, any>>,
  periodo = "Semestre II - 2026"
): void {
  const filas: Array<Array<string | number>> = becarios.map((b, idx) => [
    String(idx + 1),
    b.nombre_completo || b.nombre || `Becario ${idx + 1}`,
    b.ci || "-",
    b.universidad || "-",
    b.carrera || "-",
    `Bs ${b.tipo_beca || 650}`,
    Number(b.liderazgo_iglesia ?? b.m1 ?? 0),
    Number(b.academica ?? b.m2 ?? 0),
    Number(b.practicas_preprofesionales ?? b.m3 ?? 0),
    Number(b.escuela_lideres ?? b.m4 ?? 0),
    Number(b.socioeconomico ?? b.m5 ?? 0),
    Number(b.total ?? 0),
    b.total_calificacion || "CONFORME",
  ]);

  const promedio_total =
    becarios.length > 0
      ? Number(
          (
            becarios.reduce((acc, b) => acc + Number(b.total ?? 0), 0) / becarios.length
          ).toFixed(2)
        )
      : 0;

  descargarExcelInstitucional({
    nombre_archivo: `Sabana_Evaluaciones_${periodo.replace(/\s+/g, "_")}.xls`,
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

export function exportarAuditoriaAsistenciaExcel(
  registros: Array<Record<string, any>>,
  periodo = "2026-10"
): void {
  const es_extracto_movimientos =
    registros.length > 0 &&
    registros[0].fecha_corta !== undefined &&
    registros[0].horas_dia !== undefined;

  if (es_extracto_movimientos) {
    const total_horas = registros.reduce((acc, r) => acc + Number(r.horas_dia ?? 0), 0);
    const filas = registros.map((r, idx) => [
      String(idx + 1),
      r.fecha || "-",
      r.dia_semana || "-",
      r.tipo_etiqueta || r.tipo || "Prácticas",
      r.sede || "-",
      r.hora_entrada || "-",
      r.hora_salida || "-",
      Number(r.horas_dia ?? 0),
      Number(r.saldo_acumulado ?? 0),
      r.permiso_aprobado ? "Permiso Compensado 100%" : String(r.estado || "acreditado").toUpperCase(),
    ]);

    descargarExcelInstitucional({
      nombre_archivo: `Extracto_Asistencia_${periodo.replace(/\s+/g, "_")}.xls`,
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
        "Horas Día",
        "Saldo Acumulado",
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
        Number(total_horas.toFixed(2)),
        Number(total_horas.toFixed(2)),
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
    const total_horas = registros.reduce((acc, r) => acc + Number(r.horas_realizadas ?? 0), 0);
    const total_multas = registros.reduce((acc, r) => acc + Number(r.multas_acumuladas_bs ?? 0), 0);
    const filas = registros.map((r, idx) => [
      String(idx + 1),
      r.nombre || r.becario_nombre || `Becario ${idx + 1}`,
      r.ci || "-",
      r.carrera || "-",
      r.sede || "-",
      Number(r.horas_realizadas ?? 0),
      Number(r.meta_horas ?? 36),
      String(r.dias_asistidos ?? 0),
      Number(r.multas_acumuladas_bs ?? 0),
      String(r.estado_meta || "en_progreso").toUpperCase(),
    ]);

    descargarExcelInstitucional({
      nombre_archivo: `Corte_Mensual_Asistencia_${periodo.replace(/\s+/g, "_")}.xls`,
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
        Number(total_horas.toFixed(2)),
        "",
        "",
        Number(total_multas.toFixed(2)),
        "",
      ],
    });
    return;
  }

  const total_multas = registros.reduce((acc, r) => acc + Number(r.monto_multa_bs ?? 0), 0);
  const filas = registros.map((r, idx) => [
    String(idx + 1),
    r.becario_nombre || r.nombre || `Becario ${idx + 1}`,
    r.carrera || "-",
    r.sede_nombre || r.sede || "-",
    r.fecha || periodo,
    r.hora_ingreso || "-",
    r.hora_salida || "-",
    Number(r.horas_trabajadas ?? 0),
    Number(r.monto_multa_bs ?? 0),
    String(r.estado || "conforme").toUpperCase(),
  ]);

  descargarExcelInstitucional({
    nombre_archivo: `Auditoria_Asistencia_${periodo.replace(/\s+/g, "_")}.xls`,
    titulo_reporte: "AUDITORÍA OFICIAL DE ASISTENCIA Y GEOCERCAS WGS84",
    subtitulo: `Periodo: ${periodo} · Fundación Diaconía FRIF-IFD`,
    columnas: [
      "N°",
      "Becario",
      "Carrera",
      "Sede",
      "Fecha",
      "Ingreso",
      "Salida",
      "Horas",
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
      Number(total_multas.toFixed(2)),
      "",
    ],
  });
}
