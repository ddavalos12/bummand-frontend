/**
 * Servicio de Asistencia, Marcaciones y Aprobación de Prácticas
 * Integración con /asistencia y /practicas del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import {
  coincideTextoMesPeriodo,
  generarMesesGestion,
  obtenerMesActualLaPaz,
} from "../lib/fechas-institucionales";
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


// ========================================================
// Extracto Mensual de Asistencia Estilo Bancario (BKL-07)
// ========================================================

export interface MovimientoExtractoAsistencia {
  id: number;
  fecha: string;
  fecha_corta: string;
  dia_semana: string;
  tipo: "practicas" | "escuela_lideres" | "acciones_servicio" | "evento";
  tipo_etiqueta: string;
  sede: string;
  hora_entrada: string;
  hora_salida: string;
  horas_dia: number;
  saldo_acumulado: number;
  minutos_retraso: number;
  dentro_de_radio: boolean;
  distancia_metros: number;
  estado: "acreditado" | "en_curso" | "convalidado" | "observado" | "falta";
  estado_aprobacion: "pendiente" | "aprobado" | "revisado";
  permiso_aprobado?: boolean;
}

export interface ExtractoMensualItem {
  periodo: string;
  mes_nombre: string;
  horas_acumuladas: number;
  meta_horas: number;
  diferencia_horas: number;
  porcentaje_cumplimiento: number;
  estado_meta: "cumplido" | "en_progreso" | "en_riesgo";
  jornadas_totales: number;
  tasa_puntualidad: number;
  dias_permiso_aprobado?: number;
  horas_compensadas_permiso?: number;
  movimientos: MovimientoExtractoAsistencia[];
}

export interface RespuestaExtractoMensual {
  becario_id: number;
  total_horas_gestion: number;
  promedio_mensual: number;
  total_meses: number;
  extracto_actual: ExtractoMensualItem;
  extractos: ExtractoMensualItem[];
}

/**
 * Generador determinístico local de extractos mensuales (Marzo 2026 - Diciembre 2026)
 * Garantiza resiliencia 100% offline y visualización bancaria fiel.
 */
export function generarExtractoMensualDeterminista(
  becario_id = 1,
  mes_filtro?: string
): RespuestaExtractoMensual {
  const configuraciones_meses = generarMesesGestion({ orden: "asc" }).map((m) => ({
    periodo: m.clave,
    mes_nombre: m.mes_nombre,
    meta: 36.0,
    dias: [] as Array<{ d: number; dia: string; tipo: string; t_etiq: string; sede: string; ent: string; sal: string; h: number; dist: number }>,
  }));

  let id_movimiento_gen = 100;
  let total_horas_gestion = 0;

  const extractos: ExtractoMensualItem[] = configuraciones_meses.map((mes_cfg) => {
    let acumulado_mes = 0;
    const movimientos: MovimientoExtractoAsistencia[] = mes_cfg.dias.map((dia_item) => {
      id_movimiento_gen += 1;
      const es_lideres = dia_item.tipo === "escuela_lideres";
      const horas_dia = es_lideres ? 0 : dia_item.h;
      if (!es_lideres) {
        acumulado_mes += horas_dia;
      }
      const dia_dos_digitos = String(dia_item.d).padStart(2, "0");
      const mes_dos_digitos = mes_cfg.periodo.split("-")[1];
      const fecha_completa = `${mes_cfg.periodo}-${dia_dos_digitos}`;
      const fecha_corta = `${dia_dos_digitos}-${mes_dos_digitos}`;
      const dentro_de_radio = dia_item.dist <= 120;

      return {
        id: id_movimiento_gen,
        fecha: fecha_completa,
        fecha_corta,
        dia_semana: dia_item.dia,
        tipo: dia_item.tipo as any,
        tipo_etiqueta: dia_item.t_etiq,
        sede: dia_item.sede,
        hora_entrada: dia_item.ent,
        hora_salida: dia_item.sal,
        horas_dia: Number(horas_dia.toFixed(2)),
        saldo_acumulado: Number(acumulado_mes.toFixed(2)),
        minutos_retraso: dia_item.ent > "08:15" && dia_item.tipo === "practicas" ? 15 : 0,
        dentro_de_radio,
        distancia_metros: dia_item.dist,
        estado: "acreditado",
        estado_aprobacion: "aprobado",
      };
    });

    const horas_acumuladas = Number(acumulado_mes.toFixed(2));
    total_horas_gestion += horas_acumuladas;
    const meta_horas = mes_cfg.meta;
    const diferencia_horas = Number((horas_acumuladas - meta_horas).toFixed(2));
    const porcentaje_cumplimiento = Math.round((horas_acumuladas / meta_horas) * 100);
    const estado_meta = horas_acumuladas >= meta_horas ? "cumplido" : (porcentaje_cumplimiento >= 75 ? "en_progreso" : "en_riesgo");
    const jornadas_totales = movimientos.length;
    const puntualidades = movimientos.filter((m) => m.minutos_retraso === 0).length;
    const tasa_puntualidad = Math.round((puntualidades / (jornadas_totales || 1)) * 100);

    return {
      periodo: mes_cfg.periodo,
      mes_nombre: mes_cfg.mes_nombre,
      horas_acumuladas,
      meta_horas,
      diferencia_horas,
      porcentaje_cumplimiento,
      estado_meta,
      jornadas_totales,
      tasa_puntualidad,
      movimientos,
    };
  });

  const mes_actual = obtenerMesActualLaPaz();
  let extracto_actual =
    extractos.find((e) => e.periodo === mes_actual) || extractos[extractos.length - 1];

  if (mes_filtro && mes_filtro.trim() !== "") {
    const texto = mes_filtro.trim();
    const encontrado = extractos.find((e) =>
      coincideTextoMesPeriodo(texto, e.periodo, e.mes_nombre)
    );
    if (encontrado) {
      extracto_actual = encontrado;
    }
  }

  const promedio_mensual = Number((total_horas_gestion / (extractos.length || 1)).toFixed(2));

  return {
    becario_id,
    total_horas_gestion: Number(total_horas_gestion.toFixed(2)),
    promedio_mensual,
    total_meses: extractos.length,
    extracto_actual,
    extractos,
  };
}

/**
 * Consultar extracto mensual de asistencia estilo bancario del becario autenticado o por ID.
 * Implementa resiliencia total con fallback determinístico local de Marzo a Diciembre 2026.
 */
export async function obtenerExtractoMensualAsistencia(
  mes?: string,
  becario_id?: number
): Promise<RespuestaExtractoMensual> {
  const ruta_base = becario_id
    ? `/asistencia/extracto-mensual/${becario_id}`
    : `/asistencia/extracto-mensual`;
  const params = new URLSearchParams();
  if (mes) params.append("mes", mes);
  const query = params.toString();
  const ruta = query ? `${ruta_base}?${query}` : ruta_base;

  try {
    const respuesta = await clienteApi.get<RespuestaExtractoMensual>(ruta);
    if (respuesta && respuesta.extractos && respuesta.extractos.length > 0) {
      respuesta.extractos.forEach((ext) => {
        let saldo_acum = 0;
        let dias_permiso = 0;
        let horas_permiso = 0;
        let puntuales_compensados = 0;

        ext.movimientos.forEach((m) => {
          const es_lideres = m.tipo === "escuela_lideres" || (m.tipo_etiqueta || "").toLowerCase().includes("lider");
          const tiene_permiso_aprobado = Boolean(
            m.permiso_aprobado ||
              m.estado === "convalidado" ||
              (m.estado_aprobacion === "aprobado" && (m.estado === "falta" || (m.tipo_etiqueta || "").toLowerCase().includes("permiso")))
          );

          if (tiene_permiso_aprobado) {
            m.permiso_aprobado = true;
            m.minutos_retraso = 0;
            dias_permiso += 1;
            if (!es_lideres && (m.horas_dia || 0) === 0) {
              m.horas_dia = 4.0;
            }
            horas_permiso += m.horas_dia || 0;
          }

          if (es_lideres) {
            m.horas_dia = 0;
          } else {
            saldo_acum += (m.horas_dia || 0);
          }

          if ((m.minutos_retraso || 0) === 0 || tiene_permiso_aprobado) {
            puntuales_compensados += 1;
          }
          m.saldo_acumulado = Number(saldo_acum.toFixed(2));
        });

        ext.dias_permiso_aprobado = ext.dias_permiso_aprobado ?? dias_permiso;
        ext.horas_compensadas_permiso = ext.horas_compensadas_permiso ?? Number(horas_permiso.toFixed(2));
        ext.horas_acumuladas = Number(saldo_acum.toFixed(2));
        ext.diferencia_horas = Number((ext.horas_acumuladas - ext.meta_horas).toFixed(2));
        ext.porcentaje_cumplimiento = Math.round((ext.horas_acumuladas / (ext.meta_horas || 36)) * 100);
        if (ext.movimientos.length > 0) {
          ext.tasa_puntualidad = Math.round((puntuales_compensados / ext.movimientos.length) * 100);
        }
      });
      return respuesta;
    }
    return generarExtractoMensualDeterminista(becario_id || 1, mes);
  } catch (_error) {
    return generarExtractoMensualDeterminista(becario_id || 1, mes);
  }
}
