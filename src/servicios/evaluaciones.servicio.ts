/**
 * Servicio de Evaluaciones Semestrales 360°, Módulos, Cuestionarios y Casos Pastorales
 * Integración con /evaluaciones del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type EstadoEvaluacion =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "convalidada"
  | "anulada";

export interface PeriodoEvaluacion {
  id: number;
  nombre: string;
  ano: number;
  semestre: number;
  activo: boolean;
  peso_modulo_1?: number;
  peso_modulo_2?: number;
  peso_modulo_3?: number;
  peso_modulo_4?: number;
  peso_modulo_5?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ModuloEvaluativo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ponderacion_defecto: number;
}

export interface PreguntaCuestionario {
  id: number;
  cuestionario_id: number;
  enunciado: string;
  tipo_respuesta: "escala_1_5" | "texto" | "booleano" | "seleccion";
  peso?: number;
  orden: number;
  activo?: boolean;
}

export interface CuestionarioEvaluativo {
  id: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  modulo_id?: number;
  preguntas?: PreguntaCuestionario[];
}

export interface EvaluacionModulo {
  id: number;
  becario_id: number;
  periodo_id: number;
  modulo_id: number;
  evaluador_id?: number | null;
  puntaje?: number | null;
  estado: EstadoEvaluacion;
  observaciones?: string | null;
  detalle_pastor?: unknown;
  modulo?: ModuloEvaluativo;
  periodo?: PeriodoEvaluacion;
  evaluador?: {
    id: number;
    nombre: string;
    tipo?: string;
  };
  becario?: {
    id: number;
    ci: string;
    usuario?: {
      nombre: string;
    };
  };
}

export interface EvaluacionF03 {
  evaluacion_id: number;
  becario_id: number;
  periodo_id: number;
  respuestas: Record<string, unknown>;
  observaciones_pastorales?: string;
  recomendacion_continuidad?: boolean;
}

export interface CasoPastoral {
  id: number;
  becario_id: number;
  supervisor_id?: number;
  titulo: string;
  descripcion: string;
  plan_accion?: string | null;
  estado: "abierto" | "en_seguimiento" | "resuelto";
  creado_en?: string;
  becario?: {
    id: number;
    usuario?: {
      nombre: string;
    };
  };
}

export interface TareaEscuelaLideres {
  id: number;
  numero: number;
  titulo: string;
  descripcion: string;
  estado_entrega?: "pendiente" | "entregado" | "aprobado" | "observado";
  archivo_url?: string;
  calificacion?: number;
}

// ==========================================
// Autorización y Código OTP Tutor
// ==========================================

export async function solicitarCodigoTutor(datos: {
  becario_id: number;
  supervisor_id: number;
}): Promise<{ mensaje: string; temporal_token?: string }> {
  return clienteApi.post<{ mensaje: string; temporal_token?: string }>(
    RUTAS_API.EVALUACIONES.TUTOR_SOLICITAR_CODIGO,
    datos
  );
}

export async function verificarCodigoTutor(datos: {
  becario_id: number;
  codigo_otp: string;
}): Promise<{ valido: boolean; token_autorizacion?: string }> {
  return clienteApi.post<{ valido: boolean; token_autorizacion?: string }>(
    RUTAS_API.EVALUACIONES.TUTOR_VERIFICAR_CODIGO,
    datos
  );
}

// ==========================================
// Cuestionarios e Instrumentos
// ==========================================

export async function listarCuestionarios(): Promise<CuestionarioEvaluativo[]> {
  return clienteApi.get<CuestionarioEvaluativo[]>(
    RUTAS_API.EVALUACIONES.CUESTIONARIOS
  );
}

export async function obtenerCuestionarioPorId(
  id: number
): Promise<CuestionarioEvaluativo> {
  return clienteApi.get<CuestionarioEvaluativo>(
    RUTAS_API.EVALUACIONES.CUESTIONARIO_POR_ID(id)
  );
}

export async function crearCuestionario(
  datos: Partial<CuestionarioEvaluativo>
): Promise<CuestionarioEvaluativo> {
  return clienteApi.post<CuestionarioEvaluativo>(
    RUTAS_API.EVALUACIONES.CUESTIONARIOS,
    datos
  );
}

export async function actualizarCuestionario(
  id: number,
  datos: Partial<CuestionarioEvaluativo>
): Promise<CuestionarioEvaluativo> {
  return clienteApi.put<CuestionarioEvaluativo>(
    RUTAS_API.EVALUACIONES.CUESTIONARIO_POR_ID(id),
    datos
  );
}

export async function eliminarCuestionario(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.EVALUACIONES.CUESTIONARIO_POR_ID(id)
  );
}

export async function agregarPreguntaCuestionario(
  cuestionario_id: number,
  pregunta: Partial<PreguntaCuestionario>
): Promise<PreguntaCuestionario> {
  return clienteApi.post<PreguntaCuestionario>(
    RUTAS_API.EVALUACIONES.CUESTIONARIO_PREGUNTAS(cuestionario_id),
    pregunta
  );
}

export async function actualizarPregunta(
  id: number,
  pregunta: Partial<PreguntaCuestionario>
): Promise<PreguntaCuestionario> {
  return clienteApi.put<PreguntaCuestionario>(
    RUTAS_API.EVALUACIONES.PREGUNTA_POR_ID(id),
    pregunta
  );
}

export async function eliminarPregunta(
  id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.EVALUACIONES.PREGUNTA_POR_ID(id)
  );
}

export async function sembrarCuestionariosBase(): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.EVALUACIONES.SEMBRAR_CUESTIONARIOS
  );
}

// ==========================================
// Evaluaciones Académicas (Módulo 2)
// ==========================================

export async function registrarAutoevaluacionAcademica(
  datos: unknown
): Promise<EvaluacionModulo> {
  return clienteApi.post<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.RECEPTOR_ACADEMICA,
    datos
  );
}

export async function registrarCalificacionesEstudiante(
  datos: unknown
): Promise<EvaluacionModulo> {
  return clienteApi.post<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.ACADEMICA_ESTUDIANTE,
    datos
  );
}

export async function preEvaluarAcademicaSupervisor(
  id: number,
  datos: unknown
): Promise<EvaluacionModulo> {
  return clienteApi.put<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.ACADEMICA_PRE_EVALUACION(id),
    datos
  );
}

export async function convalidarAcademicaAdmin(
  id: number,
  datos: unknown
): Promise<EvaluacionModulo> {
  return clienteApi.put<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.ACADEMICA_CONVALIDAR(id),
    datos
  );
}

export async function obtenerAcademicaBecarioPeriodo(
  becario_id: number,
  periodo_id: number
): Promise<unknown> {
  return clienteApi.get<unknown>(
    RUTAS_API.EVALUACIONES.ACADEMICA_POR_BECARIO_PERIODO(becario_id, periodo_id)
  );
}

export async function listarAcademicasPendientesSupervisor(): Promise<EvaluacionModulo[]> {
  return clienteApi.get<EvaluacionModulo[]>(
    RUTAS_API.EVALUACIONES.ACADEMICA_PENDIENTES_SUPERVISOR
  );
}

export async function listarAcademicasPendientesAdmin(): Promise<EvaluacionModulo[]> {
  return clienteApi.get<EvaluacionModulo[]>(
    RUTAS_API.EVALUACIONES.ACADEMICA_PENDIENTES_ADMINISTRACION
  );
}

export async function subirDocumentoAcademico(
  archivo: File
): Promise<{ url_documento: string }> {
  const form = new FormData();
  form.append("archivo", archivo);
  return clienteApi.post<{ url_documento: string }>(
    RUTAS_API.EVALUACIONES.ACADEMICA_SUBIR_DOCUMENTO,
    form
  );
}

// ==========================================
// Rúbrica Mentor / Prácticas (Módulo 3)
// ==========================================

export async function listarBecariosAsignadosModulo3(): Promise<unknown[]> {
  return clienteApi.get<unknown[]>(
    RUTAS_API.EVALUACIONES.MODULO_3_BECARIOS_ASIGNADOS
  );
}

export async function obtenerEvaluacionModulo3Becario(
  becario_id: number
): Promise<unknown> {
  return clienteApi.get<unknown>(
    RUTAS_API.EVALUACIONES.MODULO_3_BECARIO(becario_id)
  );
}

export async function registrarEvaluacionMentorQR(
  datos: unknown
): Promise<EvaluacionModulo> {
  return clienteApi.post<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.RECEPTOR_MENTOR_QR,
    datos
  );
}

// ==========================================
// Socioeconómica y Bienestar (Módulo 5)
// ==========================================

export async function registrarEvaluacionSocioeconomica(
  datos: unknown
): Promise<EvaluacionModulo> {
  return clienteApi.post<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.RECEPTOR_SOCIOECONOMICA,
    datos
  );
}

export async function obtenerCuestionarioBienestar(): Promise<unknown> {
  return clienteApi.get<unknown>(
    RUTAS_API.EVALUACIONES.CUESTIONARIO_BIENESTAR
  );
}

export async function actualizarCuestionarioBienestar(
  datos: unknown
): Promise<unknown> {
  return clienteApi.put<unknown>(
    RUTAS_API.EVALUACIONES.CUESTIONARIO_BIENESTAR,
    datos
  );
}

// ==========================================
// Escuela de Líderes CETI (Módulo 4)
// ==========================================

export async function listarTareasEscuelaLideres(
  becario_id?: number
): Promise<TareaEscuelaLideres[]> {
  const ruta = becario_id
    ? `${RUTAS_API.EVALUACIONES.ESCUELA_LIDERES_TAREAS}?becario_id=${becario_id}`
    : RUTAS_API.EVALUACIONES.ESCUELA_LIDERES_TAREAS;
  return clienteApi.get<TareaEscuelaLideres[]>(ruta);
}

export async function subirEvidenciaEscuelaLideres(
  archivo: File
): Promise<{ url_evidencia: string }> {
  const form = new FormData();
  form.append("archivo", archivo);
  return clienteApi.post<{ url_evidencia: string }>(
    RUTAS_API.EVALUACIONES.ESCUELA_LIDERES_SUBIR_EVIDENCIA,
    form
  );
}

export async function entregarTareaEscuelaLideres(datos: {
  tarea_id: number;
  archivo_url: string;
  comentarios?: string;
}): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.EVALUACIONES.ESCUELA_LIDERES_ENTREGAR,
    datos
  );
}

export async function revisarEntregaEscuelaLideres(
  entrega_id: number,
  datos: { calificacion: number; observaciones?: string }
): Promise<{ mensaje: string }> {
  return clienteApi.patch<{ mensaje: string }>(
    RUTAS_API.EVALUACIONES.ESCUELA_LIDERES_REVISAR_ENTREGA(entrega_id),
    datos
  );
}

// ==========================================
// Casos Pastorales y Formulario F-03
// ==========================================

export async function listarCasosPastorales(
  becario_id?: number
): Promise<CasoPastoral[]> {
  const ruta = becario_id
    ? `${RUTAS_API.EVALUACIONES.CASOS_PASTORALES}?becario_id=${becario_id}`
    : RUTAS_API.EVALUACIONES.CASOS_PASTORALES;
  return clienteApi.get<CasoPastoral[]>(ruta);
}

export async function crearCasoPastoral(
  datos: Partial<CasoPastoral>
): Promise<CasoPastoral> {
  return clienteApi.post<CasoPastoral>(
    RUTAS_API.EVALUACIONES.CASOS_PASTORALES,
    datos
  );
}

export async function gestionarCasoPastoral(
  id: number,
  datos: { plan_accion?: string; estado?: string; avance?: string }
): Promise<CasoPastoral> {
  return clienteApi.put<CasoPastoral>(
    RUTAS_API.EVALUACIONES.CASO_PASTORAL_GESTIONAR(id),
    datos
  );
}

export async function resolverCasoPastoral(
  id: number,
  datos: { conclusiones: string }
): Promise<CasoPastoral> {
  return clienteApi.post<CasoPastoral>(
    RUTAS_API.EVALUACIONES.CASO_PASTORAL_RESOLVER(id),
    datos
  );
}

export async function registrarFormularioF03(
  evaluacion_id: number,
  datos: unknown
): Promise<unknown> {
  return clienteApi.post<unknown>(
    RUTAS_API.EVALUACIONES.FORMULARIO_F03(evaluacion_id),
    datos
  );
}

export async function obtenerFormularioF03(
  evaluacion_id: number
): Promise<unknown> {
  return clienteApi.get<unknown>(
    RUTAS_API.EVALUACIONES.FORMULARIO_F03(evaluacion_id)
  );
}

export async function obtenerNominaF03(): Promise<unknown[]> {
  return clienteApi.get<unknown[]>(RUTAS_API.EVALUACIONES.F03_NOMINA);
}

export async function obtenerF03PorBecario(
  becario_id: number
): Promise<unknown> {
  return clienteApi.get<unknown>(
    RUTAS_API.EVALUACIONES.F03_BECARIO(becario_id)
  );
}

// ==========================================
// Periodos, Catálogos y Matriz Semestral
// ==========================================

export async function listarPeriodos(): Promise<PeriodoEvaluacion[]> {
  return clienteApi.get<PeriodoEvaluacion[]>(
    RUTAS_API.EVALUACIONES.PERIODOS
  );
}

export async function crearPeriodo(
  datos: Partial<PeriodoEvaluacion>
): Promise<PeriodoEvaluacion> {
  return clienteApi.post<PeriodoEvaluacion>(
    RUTAS_API.EVALUACIONES.PERIODOS,
    datos
  );
}

export async function actualizarPeriodo(
  id: number,
  datos: Partial<PeriodoEvaluacion>
): Promise<PeriodoEvaluacion> {
  return clienteApi.put<PeriodoEvaluacion>(
    RUTAS_API.EVALUACIONES.PERIODO_POR_ID(id),
    datos
  );
}

export async function cambiarEstadoPeriodo(
  id: number,
  activo: boolean
): Promise<PeriodoEvaluacion> {
  return clienteApi.patch<PeriodoEvaluacion>(
    RUTAS_API.EVALUACIONES.PERIODO_ESTADO(id),
    { activo }
  );
}

export async function listarCatalogoModulos(): Promise<ModuloEvaluativo[]> {
  return clienteApi.get<ModuloEvaluativo[]>(
    RUTAS_API.EVALUACIONES.CATALOGO_MODULOS
  );
}

export async function listarCatalogoEvaluadores(): Promise<unknown[]> {
  return clienteApi.get<unknown[]>(
    RUTAS_API.EVALUACIONES.CATALOGO_EVALUADORES
  );
}

export async function obtenerConsolidadoSemestral(periodo_id?: number): Promise<unknown> {
  const ruta = periodo_id
    ? `${RUTAS_API.EVALUACIONES.CONSOLIDADO_SEMESTRAL}?periodo_id=${periodo_id}`
    : RUTAS_API.EVALUACIONES.CONSOLIDADO_SEMESTRAL;
  return clienteApi.get<unknown>(ruta);
}

export async function calcularCalificacionTotal360(
  becario_id: number,
  periodo_id: number
): Promise<{
  becario_id: number;
  periodo_id: number;
  calificacion_final_ponderada: number;
  modulos: Record<string, number>;
}> {
  return clienteApi.get<{
    becario_id: number;
    periodo_id: number;
    calificacion_final_ponderada: number;
    modulos: Record<string, number>;
  }>(RUTAS_API.EVALUACIONES.CALIFICACION_TOTAL(becario_id, periodo_id));
}

export async function obtenerSeguimientoEvaluativo(
  becario_id: number,
  periodo_id: number
): Promise<{
  evaluaciones: EvaluacionModulo[];
  cita_biblica_inspiracional?: string;
}> {
  return clienteApi.get<{
    evaluaciones: EvaluacionModulo[];
    cita_biblica_inspiracional?: string;
  }>(RUTAS_API.EVALUACIONES.SEGUIMIENTO(becario_id, periodo_id));
}

export async function listarEvaluaciones(filtros?: {
  becario_id?: number;
  periodo_id?: number;
  modulo_id?: number;
}): Promise<EvaluacionModulo[]> {
  const params = new URLSearchParams();
  if (filtros?.becario_id) params.append("becario_id", String(filtros.becario_id));
  if (filtros?.periodo_id) params.append("periodo_id", String(filtros.periodo_id));
  if (filtros?.modulo_id) params.append("modulo_id", String(filtros.modulo_id));

  const query = params.toString();
  const ruta = query ? `${RUTAS_API.EVALUACIONES.BASE}?${query}` : RUTAS_API.EVALUACIONES.BASE;
  return clienteApi.get<EvaluacionModulo[]>(ruta);
}

export async function obtenerEvaluacionPorId(
  id: number
): Promise<EvaluacionModulo> {
  return clienteApi.get<EvaluacionModulo>(RUTAS_API.EVALUACIONES.POR_ID(id));
}

export async function registrarEvaluacionModulo(
  datos: Partial<EvaluacionModulo>
): Promise<EvaluacionModulo> {
  return clienteApi.post<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.BASE,
    datos
  );
}

export async function cambiarEstadoEvaluacion(
  id: number,
  estado: EstadoEvaluacion
): Promise<EvaluacionModulo> {
  return clienteApi.patch<EvaluacionModulo>(
    RUTAS_API.EVALUACIONES.ESTADO(id),
    { estado }
  );
}
