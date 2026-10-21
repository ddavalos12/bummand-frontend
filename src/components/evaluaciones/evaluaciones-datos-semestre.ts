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
  id: string;
  nombre: string;
  pastor_nombre: string;
  pastor_email: string;
  pastor_celular: string;
  direccion: string;
  ciudad: string;
  denominacion: string;
}

export const CATALOGO_IGLESIAS_INSTITUCIONALES: IglesiaInstitucional[] = [
  {
    id: "iglesia_bautista_el_alto",
    nombre: "Iglesia Bautista Central El Alto",
    pastor_nombre: "Pastor Juan Ramos Mamani",
    pastor_email: "pastor.ramos@iglesiabautista.bo",
    pastor_celular: "71249823",
    direccion: "Av. 6 de Marzo #420, El Alto",
    ciudad: "El Alto",
    denominacion: "Bautista",
  },
  {
    id: "iglesia_metodista_la_paz",
    nombre: "Iglesia Evangélica Metodista Central La Paz",
    pastor_nombre: "Pastor David Quispe Huanca",
    pastor_email: "david.quispe@metodista.bo",
    pastor_celular: "72091834",
    direccion: "Calle Colombia #150, Zona San Pedro",
    ciudad: "La Paz",
    denominacion: "Metodista",
  },
  {
    id: "iglesia_pentecostal_satelite",
    nombre: "Iglesia Evangélica Pentecostal Ciudad Satélite",
    pastor_nombre: "Pastor Marcos Condori Choque",
    pastor_email: "marcos.condori@pentecostal.bo",
    pastor_celular: "73582910",
    direccion: "Plaza Bolivia #88, Plan 405, Ciudad Satélite",
    ciudad: "El Alto",
    denominacion: "Asambleas de Dios",
  },
  {
    id: "iglesia_alianza_cristiana_villa_adela",
    nombre: "Iglesia Alianza Cristiana y Misionera Villa Adela",
    pastor_nombre: "Pastor Carlos Mendoza Vargas",
    pastor_email: "carlos.mendoza@alianza.bo",
    pastor_celular: "76512398",
    direccion: "Av. Ladislao Cabrera #1234, Villa Adela",
    ciudad: "El Alto",
    denominacion: "Alianza Cristiana y Misionera",
  },
  {
    id: "iglesia_presbiteriana_central",
    nombre: "Iglesia Presbiteriana Central",
    pastor_nombre: "Pastor Samuel Ticona Morales",
    pastor_email: "samuel.ticona@presbiteriana.bo",
    pastor_celular: "71934850",
    direccion: "Av. Busch #890, Miraflores",
    ciudad: "La Paz",
    denominacion: "Presbiteriana",
  },
  {
    id: "iglesia_centro_cristiano_viacha",
    nombre: "Centro Cristiano de Restauración Familiar Viacha",
    pastor_nombre: "Pastora Ruth Laura Quisbert",
    pastor_email: "ruth.laura@centrofe.bo",
    pastor_celular: "74019283",
    direccion: "Plaza Principal Mariscal Santa Cruz #50",
    ciudad: "Viacha",
    denominacion: "Comunidad Cristiana Independiente",
  },
];

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
      { condicion: "% Evaluación del Tutor / Supervisor (sobre 20 pts)", puntos: 20 },
    ],
    nota: "Evaluación del Mentor y Supervisor con las 18 preguntas en escala 1-10 y 3 abiertas.",
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

// 5. LOS 21 BECARIOS OFICIALES (EVALUACIÓN SEMESTRE II)
export const BECARIOS_SEMESTRE_II: BecarioEvaluacionSemestral[] = [
  {
    id: 1,
    nombre_completo: "Jose Marcos Suñagua Quispe",
    ci: "14378720",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    modalidad_carrera: "Semestral",
    promedio: 56.0,
    academica: 0.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 19.0,
    escuela_lideres: 18.4,
    socioeconomico: 11.0,
    total: 68.0,
    total_calificacion: "aprobación condicionada",
    tipo_beca: 650,
    comentario_academico: "reprobo 2 materias",
    comentario_iglesia: "Comentarios Positivos",
  },
  {
    id: 2,
    nombre_completo: "Mayherli Alejandra Loza Villalobos",
    ci: "9925727",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Contaduría Pública",
    modalidad_carrera: "Anual",
    promedio: 61.0,
    academica: 15.0,
    liderazgo_iglesia: 18.0,
    practicas_preprofesionales: 19.0,
    escuela_lideres: 18.0,
    socioeconomico: 6.0,
    total: 76.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 250,
    comentario_academico: "Aprobado",
    comentario_iglesia: "no puede administrar bien su tiempo, no desarrolla nuevos líderes",
  },
  {
    id: 3,
    nombre_completo: "Fernando Rene Yujra Quispe",
    ci: "12423846",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Ingeniería Civil",
    modalidad_carrera: "Semestral",
    promedio: null,
    academica: 0.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 13.0,
    escuela_lideres: 18.4,
    socioeconomico: 17.0,
    total: 50.0,
    total_calificacion: "Abandonar el programa",
    tipo_beca: 650,
    comentario_academico: "reprobo 2 materias, materia de maquinarias aun no hay notas",
    comentario_iglesia: "Comentarios positivos",
  },
  {
    id: 4,
    nombre_completo: "Luis Santiago Enrriquez Conde",
    ci: "9927657",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Ciencias de la Comunicación Social",
    modalidad_carrera: "Anual",
    promedio: 61.0,
    academica: 15.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 18.0,
    escuela_lideres: 18.0,
    socioeconomico: 10.0,
    total: 81.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Debilidad, falta de tiempo persona muy proactiva con comentarios muy positivos",
  },
  {
    id: 5,
    nombre_completo: "Mariela Dayana Jimenez Chambi",
    ci: "12959656",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Contaduría Pública",
    modalidad_carrera: "Anual",
    promedio: 66.0,
    academica: 15.0,
    liderazgo_iglesia: 15.0,
    practicas_preprofesionales: 20.0,
    escuela_lideres: 20.0,
    socioeconomico: 11.0,
    total: 81.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "No ocupa algun cargo, no desarrolla nuevos lideres",
  },
  {
    id: 6,
    nombre_completo: "Mario Catunta Laime",
    ci: "7077936",
    universidad: "Universidad Pública de El Alto",
    carrera: "Economía",
    modalidad_carrera: "Mixta",
    promedio: 77.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 18.0,
    escuela_lideres: 18.3,
    socioeconomico: 7.0,
    total: 83.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 250,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Tiende a postergar responsabilidades y descuida otras áreas",
  },
  {
    id: 7,
    nombre_completo: "Ronald Mauricio Quiquijana Mayta",
    ci: "6172054",
    universidad: "Escuela Militar de Ingeniería",
    carrera: "Ingeniería en Telecomunicaciones",
    modalidad_carrera: "Semestral",
    promedio: 80.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 14.0,
    escuela_lideres: 20.0,
    socioeconomico: 13.0,
    total: 87.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 250,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Introvertido y reservado",
  },
  {
    id: 8,
    nombre_completo: "Edgar Elias Alarcon Huanca",
    ci: "9160054",
    universidad: "Universidad de Aquino Bolivia",
    carrera: "Medicina",
    modalidad_carrera: "Semestral",
    promedio: 73.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 20.0,
    escuela_lideres: 18.0,
    socioeconomico: 8.0,
    total: 86.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios Positivos",
  },
  {
    id: 9,
    nombre_completo: "Adai Belen Huayta Cardozo",
    ci: "13696496",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Estadística",
    modalidad_carrera: "Semestral",
    promedio: null,
    academica: 15.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 19.0,
    escuela_lideres: 16.4,
    socioeconomico: 13.0,
    total: 83.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "materia con abandono nota 38, consultar.",
    comentario_iglesia: "Falta de tiempo en sus deberes",
  },
  {
    id: 10,
    nombre_completo: "Carlos Oscar Luna Lizarraga",
    ci: "9943280",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Economía",
    modalidad_carrera: "Semestral",
    promedio: 69.0,
    academica: 15.0,
    liderazgo_iglesia: 18.0,
    practicas_preprofesionales: 17.0,
    escuela_lideres: 15.3,
    socioeconomico: 19.0,
    total: 84.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios Positivos, es candidato a cargo, no desarrolla nuevos lideres",
  },
  {
    id: 11,
    nombre_completo: "Jhoselin Quispe Morales",
    ci: "6950093",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Comunicación Social",
    modalidad_carrera: "Anual",
    promedio: 70.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 19.0,
    escuela_lideres: 16.3,
    socioeconomico: 9.0,
    total: 84.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios Positivos",
  },
  {
    id: 12,
    nombre_completo: "Nilda Amalia Churata Paye",
    ci: "10028341",
    universidad: "Universidad Pública de El Alto",
    carrera: "Educación Parvularia",
    modalidad_carrera: "Semestral",
    promedio: 84.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 20.0,
    escuela_lideres: 19.3,
    socioeconomico: 11.0,
    total: 90.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios Positivos",
  },
  {
    id: 13,
    nombre_completo: "Isaias Daniel Herrera Mamani",
    ci: "10920862",
    universidad: "Universidad Pública de El Alto",
    carrera: "Arquitectura",
    modalidad_carrera: "Semestral",
    promedio: 65.0,
    academica: 15.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 15.0,
    escuela_lideres: 17.7,
    socioeconomico: 20.0,
    total: 88.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Un poco impuntual",
  },
  {
    id: 14,
    nombre_completo: "Noemi Callisaya Alvarez",
    ci: "7093658",
    universidad: "Universidad Pública de El Alto",
    carrera: "Psicomotricidad y Deportes",
    modalidad_carrera: "Semestral",
    promedio: 71.0,
    academica: 0.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 18.0,
    escuela_lideres: 17.3,
    socioeconomico: 14.0,
    total: 69.0,
    total_calificacion: "aprobación condicionada",
    tipo_beca: 650,
    comentario_academico: "reprobo 1 materia",
    comentario_iglesia: "Necesita ser guiada en el desarrollo de sus dones",
  },
  {
    id: 15,
    nombre_completo: "Alejandro Roberth Paredes Tarquino",
    ci: "10064956",
    universidad: "Universidad Pública de El Alto",
    carrera: "Ciencias de la Comunicación social",
    modalidad_carrera: "Anual",
    promedio: 82.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 17.0,
    escuela_lideres: 18.7,
    socioeconomico: 16.0,
    total: 92.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios Positivos",
  },
  {
    id: 16,
    nombre_completo: "Aydee Ruth Ali Condori",
    ci: "9952878",
    universidad: "Universidad Pública de El Alto",
    carrera: "Contaduría Pública",
    modalidad_carrera: "Anual",
    promedio: 60.5,
    academica: 0.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 17.0,
    escuela_lideres: 19.1,
    socioeconomico: 12.0,
    total: 68.0,
    total_calificacion: "aprobación condicionada",
    tipo_beca: 250,
    comentario_academico: "reprobo 1 materia",
    comentario_iglesia: "Desarrolla sus dones.",
  },
  {
    id: 17,
    nombre_completo: "Monica Mamani Mamani",
    ci: "10369104",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Lingüística e Idiomas",
    modalidad_carrera: "Semestral",
    promedio: 78.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 19.0,
    escuela_lideres: 19.6,
    socioeconomico: 10.0,
    total: 89.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios muy positivos",
  },
  {
    id: 18,
    nombre_completo: "Cristhian Alejandro Soto Apaza",
    ci: "10930509",
    universidad: "Universidad Pública de El Alto",
    carrera: "Administración de Empresas",
    modalidad_carrera: "Anual",
    promedio: null,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 19.0,
    escuela_lideres: 15.0,
    socioeconomico: 15.0,
    total: 89.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Egresado",
    comentario_iglesia: "Trabajar paciencia",
  },
  {
    id: 19,
    nombre_completo: "Ruddy Flores Tapia",
    ci: "9974211",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    modalidad_carrera: "Semestral",
    promedio: 67.0,
    academica: 15.0,
    liderazgo_iglesia: 17.0,
    practicas_preprofesionales: 20.0,
    escuela_lideres: 19.2,
    socioeconomico: 13.0,
    total: 84.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 250,
    comentario_academico: "Aprobado",
    comentario_iglesia: "le falta conocer a los hermanos mayores, y ha llegado de manera impuntual a las clases que imparte.",
  },
  {
    id: 20,
    nombre_completo: "Ruth Alesandra Choque Huanca",
    ci: "10915872",
    universidad: "Universidad Central Sede La Paz",
    carrera: "Ingeniería comercial",
    modalidad_carrera: "Semestral",
    promedio: 94.0,
    academica: 20.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 18.0,
    escuela_lideres: 20.0,
    socioeconomico: 17.0,
    total: 95.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 250,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios positivos",
  },
  {
    id: 21,
    nombre_completo: "Daniel Davalos Quiñonez",
    ci: "9107373",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    modalidad_carrera: "Semestral",
    promedio: 65.0,
    academica: 15.0,
    liderazgo_iglesia: 20.0,
    practicas_preprofesionales: 20.0,
    escuela_lideres: 20.0,
    socioeconomico: 16.0,
    total: 91.0,
    total_calificacion: "Aprobacion Optima",
    tipo_beca: 650,
    comentario_academico: "Aprobado",
    comentario_iglesia: "Comentarios Positivos.",
  },
];

// 6. NOTAS CETI (12 TAREAS CLASSROOM)
export const NOTAS_CETI_SEMESTRE_II: NotaCetiBecario[] = [
  {
    id: 1,
    nombre_completo: "Jose Marcos Suñagua Quispe",
    ci: "14378720",
    tareas: [100, 100, 100, 100, 100, 90, 80, 80, 80, 95, 95, 95],
    promedio: 92.1,
    puntaje_20: 18.4,
    observaciones: "Cumplió tareas con regularidad",
  },
  {
    id: 2,
    nombre_completo: "Mayherli Alejandra Loza Villalobos",
    ci: "9925727",
    tareas: [95, 90, 90, 90, 90, 90, 90, 90, 90, 90, 95, 90],
    promedio: 90.0,
    puntaje_20: 18.0,
    observaciones: "Participación activa",
  },
  {
    id: 3,
    nombre_completo: "Fernando Rene Yujra Quispe",
    ci: "12423846",
    tareas: [100, 100, 100, 95, 90, 90, 80, 95, 90, 95, 90, 90],
    promedio: 92.1,
    puntaje_20: 18.4,
    observaciones: "Encuentros completos",
  },
  {
    id: 4,
    nombre_completo: "Luis Santiago Enrriquez Conde",
    ci: "9927657",
    tareas: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
    promedio: 90.0,
    puntaje_20: 18.0,
    observaciones: "Entrega constante",
  },
  {
    id: 5,
    nombre_completo: "Mariela Dayana Jimenez Chambi",
    ci: "12959656",
    tareas: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    promedio: 100.0,
    puntaje_20: 20.0,
    observaciones: "Rendimiento perfecto en plataforma",
  },
  {
    id: 6,
    nombre_completo: "Mario Catunta Laime",
    ci: "7077936",
    tareas: [100, 100, 95, 90, 90, 85, 90, 90, 90, 90, 90, 90],
    promedio: 91.5,
    puntaje_20: 18.3,
    observaciones: "Buen seguimiento",
  },
  {
    id: 7,
    nombre_completo: "Ronald Mauricio Quiquijana Mayta",
    ci: "6172054",
    tareas: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    promedio: 100.0,
    puntaje_20: 20.0,
    observaciones: "Excelente cumplimiento",
  },
  {
    id: 8,
    nombre_completo: "Edgar Elias Alarcon Huanca",
    ci: "9160054",
    tareas: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
    promedio: 90.0,
    puntaje_20: 18.0,
    observaciones: "Asistencia continua",
  },
  {
    id: 9,
    nombre_completo: "Adai Belen Huayta Cardozo",
    ci: "13696496",
    tareas: [90, 90, 80, 80, 80, 80, 80, 85, 85, 85, 85, 85],
    promedio: 82.0,
    puntaje_20: 16.4,
    observaciones: "Dificultad de tiempo en entregas",
  },
  {
    id: 10,
    nombre_completo: "Carlos Oscar Luna Lizarraga",
    ci: "9943280",
    tareas: [80, 80, 80, 80, 75, 75, 75, 75, 75, 80, 80, 80],
    promedio: 76.5,
    puntaje_20: 15.3,
    observaciones: "Entregas rezagadas",
  },
  {
    id: 11,
    nombre_completo: "Jhoselin Quispe Morales",
    ci: "6950093",
    tareas: [85, 85, 80, 80, 80, 80, 80, 80, 80, 85, 85, 85],
    promedio: 81.5,
    puntaje_20: 16.3,
    observaciones: "Participación regular",
  },
  {
    id: 12,
    nombre_completo: "Nilda Amalia Churata Paye",
    ci: "10028341",
    tareas: [100, 100, 100, 95, 95, 95, 95, 95, 95, 95, 95, 95],
    promedio: 96.5,
    puntaje_20: 19.3,
    observaciones: "Sobresaliente en tareas y foros",
  },
  {
    id: 13,
    nombre_completo: "Isaias Daniel Herrera Mamani",
    ci: "10920862",
    tareas: [90, 90, 90, 90, 90, 85, 85, 85, 85, 90, 90, 90],
    promedio: 88.5,
    puntaje_20: 17.7,
    observaciones: "Buen nivel de análisis",
  },
  {
    id: 14,
    nombre_completo: "Noemi Callisaya Alvarez",
    ci: "7093658",
    tareas: [90, 85, 85, 85, 85, 85, 85, 85, 85, 90, 90, 90],
    promedio: 86.5,
    puntaje_20: 17.3,
    observaciones: "Encuentros al día",
  },
  {
    id: 15,
    nombre_completo: "Alejandro Roberth Paredes Tarquino",
    ci: "10064956",
    tareas: [95, 95, 95, 90, 90, 90, 95, 95, 95, 95, 95, 95],
    promedio: 93.5,
    puntaje_20: 18.7,
    observaciones: "Excelente compromiso",
  },
  {
    id: 16,
    nombre_completo: "Aydee Ruth Ali Condori",
    ci: "9952878",
    tareas: [100, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95],
    promedio: 95.5,
    puntaje_20: 19.1,
    observaciones: "Gran disciplina en entregas",
  },
  {
    id: 17,
    nombre_completo: "Monica Mamani Mamani",
    ci: "10369104",
    tareas: [100, 100, 100, 95, 95, 95, 100, 100, 95, 95, 95, 100],
    promedio: 98.0,
    puntaje_20: 19.6,
    observaciones: "Destacada participación",
  },
  {
    id: 18,
    nombre_completo: "Cristhian Alejandro Soto Apaza",
    ci: "10930509",
    tareas: [80, 80, 75, 75, 75, 75, 70, 70, 75, 75, 75, 75],
    promedio: 75.0,
    puntaje_20: 15.0,
    observaciones: "Concluyó compromisos de egreso",
  },
  {
    id: 19,
    nombre_completo: "Ruddy Flores Tapia",
    ci: "9974211",
    tareas: [100, 100, 95, 95, 95, 95, 95, 95, 95, 95, 95, 100],
    promedio: 96.0,
    puntaje_20: 19.2,
    observaciones: "Aportes constructivos en clase",
  },
  {
    id: 20,
    nombre_completo: "Ruth Alesandra Choque Huanca",
    ci: "10915872",
    tareas: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    promedio: 100.0,
    puntaje_20: 20.0,
    observaciones: "100% de cumplimiento",
  },
  {
    id: 21,
    nombre_completo: "Daniel Davalos Quiñonez",
    ci: "9107373",
    tareas: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    promedio: 100.0,
    puntaje_20: 20.0,
    observaciones: "Excelente desempeño",
  },
];

// 7. REGISTROS DE EVALUACIÓN DE MENTORES (EV.MENTORES II)
export const EVALUACIONES_MENTORES_SEMESTRE_II: EvaluacionMentorRegistro[] = [
  {
    id: 1,
    mentor_nombre: "Mildrette Rojas Soliz",
    becario_nombre: "Ruddy Flores Tapia",
    unidad_agencia: "Jefatura de Planificación, Control y Presupuesto",
    calificaciones_1_18: [10, 10, 10, 10, 10, 10, 10, 9, 10, 10, 10, 10, 10, 9, 9, 9, 10, 10],
    respuesta_19: "Excelente apoyo muy agradecida",
    respuesta_20: "En todas cumplió con lo encomendado",
    respuesta_21: "Que exista la opción de apoyo en vacaciones",
    promedio_10: 9.8,
    puntaje_20: 20.0,
  },
  {
    id: 2,
    mentor_nombre: "Lic. Andrea Morales",
    becario_nombre: "Nilda Amalia Churata Paye",
    unidad_agencia: "Agencia Sopocachi",
    calificaciones_1_18: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    respuesta_19: "Invaluable asistencia en atención y organización de archivos",
    respuesta_20: "Organización de eventos de capacitación",
    respuesta_21: "Continuar fortaleciendo el programa en agencias",
    promedio_10: 10.0,
    puntaje_20: 20.0,
  },
  {
    id: 3,
    mentor_nombre: "Ing. Carlos Mendoza",
    becario_nombre: "Jose Marcos Suñagua Quispe",
    unidad_agencia: "Gerencia de Sistemas",
    calificaciones_1_18: [10, 9, 9, 9, 10, 10, 9, 9, 10, 10, 10, 9, 10, 9, 9, 9, 10, 10],
    respuesta_19: "Buen soporte en mantenimiento y digitalización de datos",
    respuesta_20: "Automatización de reportes internos",
    respuesta_21: "Aumentar horas de práctica en proyectos complejos",
    promedio_10: 9.5,
    puntaje_20: 19.0,
  },
  {
    id: 4,
    mentor_nombre: "Lic. Miriam Condori",
    becario_nombre: "Mayherli Alejandra Loza Villalobos",
    unidad_agencia: "Jefatura de Contabilidad",
    calificaciones_1_18: [9, 10, 9, 9, 10, 9, 10, 9, 10, 10, 10, 10, 10, 9, 9, 9, 10, 10],
    respuesta_19: "Apoyo eficiente en conciliaciones bancarias",
    respuesta_20: "Cierre contable mensual",
    respuesta_21: "Mayor inducción previa al inicio de semestre",
    promedio_10: 9.5,
    puntaje_20: 19.0,
  },
  {
    id: 5,
    mentor_nombre: "Ing. Roberto Blanco",
    becario_nombre: "Fernando Rene Yujra Quispe",
    unidad_agencia: "Infraestructura y Servicios Generales",
    calificaciones_1_18: [7, 7, 6, 6, 7, 6, 7, 7, 7, 7, 7, 6, 7, 6, 6, 6, 7, 7],
    respuesta_19: "Apoyo básico en inventarios de materiales",
    respuesta_20: "Levantamiento de especificaciones técnicas",
    respuesta_21: "Reforzar el seguimiento a la puntualidad y horas de sede",
    promedio_10: 6.5,
    puntaje_20: 13.0,
  },
];
