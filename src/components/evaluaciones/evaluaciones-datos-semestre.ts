// Constantes y tipos oficiales del Semestre II - BUMAND (Fundación Diaconía FRIF-IFD)

export interface BecarioEvaluacionSemestral {
  id: number;
  nombre_completo: string;
  ci: string;
  universidad: string;
  carrera: string;
  modalidad_carrera: string;
  promedio: number | null;
  academica: number;
  liderazgo_iglesia: number;
  practicas_preprofesionales: number;
  escuela_lideres: number;
  socioeconomico: number;
  total: number;
  total_calificacion: string;
  tipo_beca: number;
  comentario_academico: string;
  comentario_iglesia: string;
}

export interface NotaCetiBecario {
  id: number;
  nombre_completo: string;
  ci: string;
  tareas: number[]; // 12 tareas
  promedio: number;
  puntaje_20: number;
  observaciones: string;
}

export interface EvaluacionMentorRegistro {
  id: number;
  mentor_nombre: string;
  becario_nombre: string;
  unidad_agencia: string;
  calificaciones_1_18: number[]; // 18 notas (1 a 10)
  respuesta_19: string;
  respuesta_20: string;
  respuesta_21: string;
  promedio_10: number;
  puntaje_20: number;
}

export interface OpcionBienestar {
  inciso: "A" | "B" | "C" | "D";
  texto: string;
  puntaje: number;
  color_semaforo: "verde" | "amarillo" | "rojo";
}

export interface PreguntaBienestar {
  id: number;
  numero: number;
  titulo: string;
  enunciado: string;
  opciones: OpcionBienestar[];
}

export interface PreguntaMentor {
  numero: number;
  enunciado: string;
}

export interface PreguntaAbiertaMentor {
  numero: number;
  enunciado: string;
  puntaje_maximo: number;
}

export interface IglesiaInstitucional {
  id: string | number;
  nombre: string;
  pastor_nombre: string;
  pastor_email: string;
  pastor_celular: string;
  direccion: string;
  ciudad: string;
  denominacion: string;
}

export const CATALOGO_IGLESIAS_INSTITUCIONALES: IglesiaInstitucional[] = [];
export interface CampoConfigurableFormulario {
  id: string;
  etiqueta: string;
  tipo: "texto" | "numero" | "combobox" | "fecha" | "booleano" | "escala";
  conectado_catalogo: boolean;
  catalogo_nombre?: "iglesias" | "pastores" | "sedes" | "universidades" | "mentores";
  obligatorio: boolean;
  descripcion_ayuda?: string;
}

// 1. RANGOS OFICIALES DE APROBACIÓN
export const RANGOS_APROBACION_OFICIALES = [
  {
    calificacion: "Aprobación óptima",
    rango: "70 - 100",
    color: "emerald",
    descripcion: "El becario cumple plenamente con los estándares y renueva su beca automáticamente.",
  },
  {
    calificacion: "Aprobación Condicionada",
    rango: "51 - 69",
    color: "amber",
    descripcion: "El becario entra en plan de mejora y acompañamiento tutorial durante el siguiente semestre.",
  },
  {
    calificacion: "Reprobó y debe abandonar el programa",
    rango: "0 - 50",
    color: "rose",
    descripcion: "El becario no alcanza el umbral de continuidad y pierde el beneficio de la beca BUMAND.",
  },
] as const;

// 2. CRITERIOS OFICIALES DE EVALUACIÓN SEMESTRAL (23.jpeg)
export const CRITERIOS_EVALUACION_OFICIALES = [
  {
    modulo: "Académico",
    puntaje_maximo: 20,
    reglas: [
      { condicion: "Materias aprobadas y promedio ≥ 70", puntos: 20 },
      { condicion: "Materias aprobadas y promedio < 70", puntos: 15 },
      { condicion: "Una materia Reprobada y promedio > 51", puntos: 10 },
      { condicion: "Más de una materia Reprobada", puntos: 0 },
    ],
    nota: "Se requiere récord y certificado de notas oficial legalizado por la universidad.",
  },
  {
    modulo: "Liderazgo en la Iglesia",
    puntaje_maximo: 20,
    reglas: [
      { condicion: "Evaluación de la Iglesia Buena", puntos: 20 },
      { condicion: "Evaluación Regular", puntos: 15 },
      { condicion: "No presenta evaluación o no cumple", puntos: 0 },
    ],
    nota: "Certificado pastoral suscrito por el pastor de la congregación con sello eclesiástico.",
  },
  {
    modulo: "PP² (Prácticas Preprofesionales)",
    puntaje_maximo: 20,
    reglas: [
      { condicion: "% Evaluación del Tutor / Mentor (sobre 20 pts)", puntos: 20 },
    ],
    nota: "Evaluación del Mentor con las 18 preguntas en escala 1-10 y 3 abiertas.",
  },
  {
    modulo: "Escuela de Líderes",
    puntaje_maximo: 20,
    reglas: [
      { condicion: "% de evaluación ≥ 51 + asistencias cumplidas", puntos: 20 },
      { condicion: "% de evaluación < 50 + asistencias cumplidas", puntos: 15 },
      { condicion: "Más de una Falta sin justificación", puntos: 0 },
    ],
    nota: "Cálculo Classroom/CETI de las 12 tareas y encuentros, y control de asistencia de viernes.",
  },
  {
    modulo: "Evaluación Socioeconómica",
    puntaje_maximo: 20,
    reglas: [
      { condicion: "Encuesta Familia / Cuestionario de Bienestar Universitario", puntos: 20 },
    ],
    nota: "Aplicación de las 26 preguntas de bienestar personal, social y universitario.",
  },
] as const;

// 3. LAS 26 PREGUNTAS OFICIALES DEL CUESTIONARIO DE BIENESTAR UNIVERSITARIO
export const PREGUNTAS_BIENESTAR_INICIALES: PreguntaBienestar[] = [
  {
    id: 1,
    numero: 1,
    titulo: "Ingresos del hogar",
    enunciado: "¿Los ingresos de su hogar alcanzan para cubrir las necesidades básicas?",
    opciones: [
      { inciso: "A", texto: "Alcanzan y permiten ahorrar.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Alcanzan con dificultad.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No alcanzan.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 2,
    numero: 2,
    titulo: "Ahorros familiares",
    enunciado: "¿Su familia cuenta con ahorros para emergencias?",
    opciones: [
      { inciso: "A", texto: "Sí, suficientes.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, pero son insuficientes.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No tiene ahorros.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 3,
    numero: 3,
    titulo: "Fuentes de ingreso",
    enunciado: "¿Cuántas fuentes de ingreso tiene su hogar?",
    opciones: [
      { inciso: "A", texto: "Dos o más fuentes estables.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Una fuente estable.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Solo ingresos ocasionales o ninguno.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 4,
    numero: 4,
    titulo: "Capacidad para generar ingresos",
    enunciado: "¿Qué capacidad tiene para generar ingresos?",
    opciones: [
      { inciso: "A", texto: "Puedo generar ingresos de manera constante.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Puedo generarlos, pero de manera irregular.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Actualmente tengo muchas dificultades para generarlos.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 5,
    numero: 5,
    titulo: "Documentación de identidad",
    enunciado: "¿Los integrantes de su hogar cuentan con cédula de identidad vigente?",
    opciones: [
      { inciso: "A", texto: "Todos.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Solo algunos.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Ninguno.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 6,
    numero: 6,
    titulo: "Acceso a agua potable",
    enunciado: "¿Su hogar tiene acceso a agua potable?",
    opciones: [
      { inciso: "A", texto: "Sí, todos los días.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, pero con interrupciones.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No tiene acceso.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 7,
    numero: 7,
    titulo: "Atención médica",
    enunciado: "¿Puede recibir atención médica cuando la necesita?",
    opciones: [
      { inciso: "A", texto: "Sí, oportunamente.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, pero con dificultades.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No puedo recibirla.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 8,
    numero: 8,
    titulo: "Alimentación",
    enunciado: "¿Con qué frecuencia su familia consume alimentos variados y nutritivos?",
    opciones: [
      { inciso: "A", texto: "Todos los días.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Algunos días.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Casi nunca.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 9,
    numero: 9,
    titulo: "Salud dental",
    enunciado: "¿En qué estado se encuentra su salud dental?",
    opciones: [
      { inciso: "A", texto: "Sin molestias ni problemas conocidos.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Con molestias ocasionales o tratamientos pendientes.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Con dolor frecuente o problemas sin atender.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 10,
    numero: 10,
    titulo: "Vacunación",
    enunciado: "¿Los integrantes de su hogar tienen las vacunas que les corresponden según su edad?",
    opciones: [
      { inciso: "A", texto: "Todos tienen sus vacunas al día.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Algunos tienen vacunas pendientes.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Ninguno tiene sus vacunas al día.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 11,
    numero: 11,
    titulo: "Seguridad de la vivienda",
    enunciado: "¿Su vivienda ofrece condiciones de seguridad para vivir?",
    opciones: [
      { inciso: "A", texto: "Sí, se encuentra en buen estado.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Presenta daños menores que necesitan reparación.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Presenta daños que ponen en riesgo a sus habitantes.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 12,
    numero: 12,
    titulo: "Servicios sanitarios",
    enunciado: "¿Su hogar dispone de baño y un sistema adecuado para eliminar las aguas residuales?",
    opciones: [
      { inciso: "A", texto: "Sí, ambos funcionan adecuadamente.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, pero presentan problemas.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No dispone de condiciones adecuadas.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 13,
    numero: 13,
    titulo: "Electricidad",
    enunciado: "¿Su hogar cuenta con electricidad?",
    opciones: [
      { inciso: "A", texto: "Sí, de manera constante.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, pero con cortes frecuentes.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No cuenta con electricidad.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 14,
    numero: 14,
    titulo: "Transporte público",
    enunciado: "¿Puede acceder al transporte público cuando lo necesita?",
    opciones: [
      { inciso: "A", texto: "Sí, fácilmente.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, pero con dificultades de distancia, horario o costo.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No puedo acceder.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 15,
    numero: 15,
    titulo: "Lectura y comprensión",
    enunciado: "¿Puede leer y comprender un texto cotidiano, como un aviso o una instrucción?",
    opciones: [
      { inciso: "A", texto: "Sí, sin dificultad.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Sí, con alguna dificultad.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No puedo hacerlo.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 16,
    numero: 16,
    titulo: "Organización económica",
    enunciado: "¿Cómo organiza los ingresos y gastos de su hogar?",
    opciones: [
      { inciso: "A", texto: "Elaboro un presupuesto y llevo un control.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Los organizo parcialmente.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "No llevo un control.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 17,
    numero: 17,
    titulo: "Seguridad personal",
    enunciado: "¿Qué tan seguro se siente en su vida cotidiana?",
    opciones: [
      { inciso: "A", texto: "Seguro la mayor parte del tiempo.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Inseguro en algunas situaciones.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Inseguro con frecuencia.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 18,
    numero: 18,
    titulo: "Resolución de conflictos familiares",
    enunciado: "¿Cómo suelen resolver los conflictos en su familia?",
    opciones: [
      { inciso: "A", texto: "Mediante el diálogo y acuerdos.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Con discusiones y dificultad para llegar a acuerdos.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Los conflictos suelen quedar sin resolver.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 19,
    numero: 19,
    titulo: "Violencia intrafamiliar",
    enunciado: "¿En su hogar se presentan situaciones de violencia física, psicológica o sexual?",
    opciones: [
      { inciso: "A", texto: "No se presentan.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Se han presentado en alguna ocasión.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Se presentan de manera frecuente.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "D", texto: "Prefiero no responder.", puntaje: 0.5, color_semaforo: "amarillo" },
    ],
  },
  {
    id: 20,
    numero: 20,
    titulo: "Autonomía personal",
    enunciado: "¿Puede tomar decisiones sobre su vida y sus actividades?",
    opciones: [
      { inciso: "A", texto: "Sí, con autonomía.", puntaje: 1.0, color_semaforo: "verde" },
      { inciso: "B", texto: "Solo en algunos aspectos.", puntaje: 0.5, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Otras personas deciden por mí.", puntaje: 0.0, color_semaforo: "rojo" },
    ],
  },
  {
    id: 21,
    numero: 21,
    titulo: "Motivación y satisfacción con los estudios",
    enunciado: "¿Qué tan satisfecho se siente con lo que está estudiando?",
    opciones: [
      { inciso: "A", texto: "No me gusta lo que estudio y considero abandonarlo.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "B", texto: "Tengo dudas y encuentro poco interés en los contenidos.", puntaje: 0.33, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Me gusta lo que estudio y deseo continuar.", puntaje: 0.66, color_semaforo: "verde" },
      { inciso: "D", texto: "Me entusiasma lo que estudio y lo relaciono con mis metas personales.", puntaje: 1.0, color_semaforo: "verde" },
    ],
  },
  {
    id: 22,
    numero: 22,
    titulo: "Condiciones y recursos para estudiar",
    enunciado: "¿Cuenta con un espacio y los materiales necesarios para estudiar?",
    opciones: [
      { inciso: "A", texto: "No cuento con un espacio adecuado ni con los materiales básicos.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "B", texto: "Tengo algunas condiciones, pero las limitaciones dificultan mis estudios.", puntaje: 0.33, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Cuento con lo necesario, aunque ocasionalmente me falta algún recurso.", puntaje: 0.66, color_semaforo: "verde" },
      { inciso: "D", texto: "Dispongo de un espacio adecuado y de todos los recursos que necesito.", puntaje: 1.0, color_semaforo: "verde" },
    ],
  },
  {
    id: 23,
    numero: 23,
    titulo: "Libertad para expresar opiniones",
    enunciado: "¿Qué tan cómodo se siente al expresar sus ideas o inquietudes en clases?",
    opciones: [
      { inciso: "A", texto: "Evito expresarme por temor a burlas o reacciones negativas.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "B", texto: "Me expreso pocas veces porque no siento suficiente confianza.", puntaje: 0.33, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Generalmente puedo expresar mis opiniones con confianza.", puntaje: 0.66, color_semaforo: "verde" },
      { inciso: "D", texto: "Me expreso con libertad y siento que mis aportes son escuchados.", puntaje: 1.0, color_semaforo: "verde" },
    ],
  },
  {
    id: 24,
    numero: 24,
    titulo: "Metas durante la carrera — Corto plazo",
    enunciado: "¿Qué tan definidas tiene sus metas de estudio actualmente?",
    opciones: [
      { inciso: "A", texto: "Me siento desorientado; necesito consejería o apoyo académico.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "B", texto: "Avanzo materia a materia, pero me cuesta planificar a futuro.", puntaje: 0.33, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Tengo metas claras para aprobar y mejorar mis habilidades.", puntaje: 0.66, color_semaforo: "verde" },
      { inciso: "D", texto: "Tengo un plan bien definido con cursos y proyectos clave.", puntaje: 1.0, color_semaforo: "verde" },
    ],
  },
  {
    id: 25,
    numero: 25,
    titulo: "Transición al mundo laboral — Mediano plazo",
    enunciado: "¿Tiene un plan para cuando termine la universidad?",
    opciones: [
      { inciso: "A", texto: "No sé qué hacer al salir; requiero orientación laboral.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "B", texto: "Tengo una idea general, pero no sé cómo empezar a buscar empleo.", puntaje: 0.33, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Conozco los pasos básicos —titulación y pasantías— para empezar.", puntaje: 0.66, color_semaforo: "verde" },
      { inciso: "D", texto: "Cuento con una estrategia clara y metas profesionales definidas.", puntaje: 1.0, color_semaforo: "verde" },
    ],
  },
  {
    id: 26,
    numero: 26,
    titulo: "Visión de desarrollo profesional — Largo plazo",
    enunciado: "¿Cómo ve su futuro profesional tras graduarse?",
    opciones: [
      { inciso: "A", texto: "Siento incertidumbre; necesito asesoría de perfil profesional.", puntaje: 0.0, color_semaforo: "rojo" },
      { inciso: "B", texto: "Buscaré cualquier empleo disponible para ganar estabilidad.", puntaje: 0.33, color_semaforo: "amarillo" },
      { inciso: "C", texto: "Planeo trabajar un tiempo y luego evaluar un posgrado.", puntaje: 0.66, color_semaforo: "verde" },
      { inciso: "D", texto: "Tengo un plan claro que combina trabajo y especialización.", puntaje: 1.0, color_semaforo: "verde" },
    ],
  },
];

// 4. PREGUNTAS OFICIALES DEL MENTOR (18 ESCALA 1-10 + 3 ABIERTAS)
export const PREGUNTAS_MENTOR_ESCALA: PreguntaMentor[] = [
  { numero: 1, enunciado: "¿Cumplió el becario con los plazos establecidos para sus tareas?" },
  { numero: 2, enunciado: "Califique la calidad general del trabajo del becario" },
  { numero: 3, enunciado: "¿El becario mostró atención al detalle en sus entregables?" },
  { numero: 4, enunciado: "¿Se adapta a situaciones de trabajo bajo presión?" },
  { numero: 5, enunciado: "¿Aplica correctamente sus conocimientos técnicos en el desarrollo de sus actividades?" },
  { numero: 6, enunciado: "¿El becario tomó iniciativa para resolver problemas o mejorar procesos sin que se lo pidiera?" },
  { numero: 7, enunciado: "¿Se comunicó el becario de manera clara y empática con el equipo?" },
  { numero: 8, enunciado: "¿Contribuyó de manera efectiva en las actividades de equipo?" },
  { numero: 9, enunciado: "¿Cuál es la actitud del becario hacia su responsable directo?" },
  { numero: 10, enunciado: "¿Muestra respeto hacia los colaboradores (cliente interno)?" },
  { numero: 11, enunciado: "¿Muestra respeto hacia proveedores, visitas o clientes (cliente externo)?" },
  { numero: 12, enunciado: "¿Aceptó la retroalimentación constructiva de forma positiva?" },
  { numero: 13, enunciado: "Califica la actitud del becario para colaborar con otros miembros del equipo." },
  { numero: 14, enunciado: "¿El becario se adaptó bien a los cambios inesperados en las tareas encomendadas?" },
  { numero: 15, enunciado: "¿El becario asiste regularmente a sus prácticas pre profesionales (al menos 9 horas semanales)?" },
  { numero: 16, enunciado: "¿El Becario fue puntual y consistente en su asistencia?" },
  { numero: 17, enunciado: "¿El becario entiende y comparte la misión, visión, principios y valores de Diaconía IFD?" },
  { numero: 18, enunciado: "¿Mostró un claro compromiso con la misión y los objetivos de la unidad o área?" },
];

export const PREGUNTAS_ABIERTAS_MENTOR: PreguntaAbiertaMentor[] = [
  {
    numero: 19,
    enunciado: "¿Cómo describiría el apoyo que ha recibido del becario durante este semestre?",
    puntaje_maximo: 3.33,
  },
  {
    numero: 20,
    enunciado: "¿Hubo alguna tarea o proyecto en particular en el que el becario haya destacado positivamente?",
    puntaje_maximo: 3.33,
  },
  {
    numero: 21,
    enunciado: "¿Qué sugerencias tiene respecto al programa BUMAND?",
    puntaje_maximo: 3.34,
  },
];

