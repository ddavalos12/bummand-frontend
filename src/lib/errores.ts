export const CODIGOS_ERROR = {
  ERR_1001: "ERR-1001",
  ERR_1002: "ERR-1002",
  ERR_1003: "ERR-1003",
  ERR_1004: "ERR-1004",

  ERR_2001: "ERR-2001",
  ERR_2002: "ERR-2002",
  ERR_2003: "ERR-2003",
  ERR_2004: "ERR-2004",

  ERR_3001: "ERR-3001",
  ERR_3002: "ERR-3002",
  ERR_3003: "ERR-3003",
  ERR_3004: "ERR-3004",

  ERR_4001: "ERR-4001",
  ERR_4002: "ERR-4002",
  ERR_4003: "ERR-4003",
  ERR_4004: "ERR-4004",

  ERR_5001: "ERR-5001",
  ERR_5002: "ERR-5002",
  ERR_5003: "ERR-5003",

  ERR_9001: "ERR-9001",
  ERR_9002: "ERR-9002",
} as const;

export type CodigoError = (typeof CODIGOS_ERROR)[keyof typeof CODIGOS_ERROR];

export interface InformacionErrorAmigable {
  titulo: string;
  descripcion: string;
  sugerencia: string;
}

export const MENSAJES_AMIGABLES_ERROR: Record<CodigoError, InformacionErrorAmigable> = {
  [CODIGOS_ERROR.ERR_1001]: {
    titulo: "Credenciales Incorrectas",
    descripcion: "El correo o la contraseña ingresados no coinciden con nuestros registros.",
    sugerencia: "Verifique que su correo institucional y su contraseña estén bien escritos e intente de nuevo.",
  },
  [CODIGOS_ERROR.ERR_1002]: {
    titulo: "Sesión Caducada",
    descripcion: "Su sesión de acceso ha expirado por inactividad o el pase de seguridad ya no es válido.",
    sugerencia: "Por favor, inicie sesión nuevamente para continuar trabajando de forma segura.",
  },
  [CODIGOS_ERROR.ERR_1003]: {
    titulo: "Acceso Restringido",
    descripcion: "Su cuenta institucional no cuenta con los permisos requeridos para esta sección.",
    sugerencia: "Si considera que debería tener acceso, solicite autorización a su supervisor de Diaconía.",
  },
  [CODIGOS_ERROR.ERR_1004]: {
    titulo: "Cuenta Deshabilitada",
    descripcion: "Su perfil institucional se encuentra inactivo o suspendido temporalmente.",
    sugerencia: "Póngase en contacto con el equipo de soporte o administración para reactivar su cuenta.",
  },
  [CODIGOS_ERROR.ERR_2001]: {
    titulo: "Fuera de la Geocerca",
    descripcion: "Su posición satelital GPS se encuentra fuera del rango permitido del lugar asignado.",
    sugerencia: "Acérquese a la iglesia o centro de práctica y compruebe que la precisión GPS de su equipo esté activa.",
  },
  [CODIGOS_ERROR.ERR_2002]: {
    titulo: "Horario No Habilitado",
    descripcion: "El registro de asistencia se intentó fuera de la franja horaria autorizada para la jornada.",
    sugerencia: "Realice la marcación dentro del horario establecido para su turno de servicio.",
  },
  [CODIGOS_ERROR.ERR_2003]: {
    titulo: "Ingreso ya Registrado",
    descripcion: "Ya existe una marcación de entrada para esta fecha y lugar en el sistema.",
    sugerencia: "No es necesario marcar ingreso de nuevo. Al finalizar sus labores, marque su salida.",
  },
  [CODIGOS_ERROR.ERR_2004]: {
    titulo: "Falta Marcación de Ingreso",
    descripcion: "No se puede registrar la salida porque no existe una entrada previa válida en esta jornada.",
    sugerencia: "Revise su historial de marcaciones o informe a su tutor pastoral si omitió el ingreso.",
  },
  [CODIGOS_ERROR.ERR_3001]: {
    titulo: "Envío No Permitido Aún",
    descripcion: "La entrega formal de la declaración mensual de pasajes solo se habilita a partir del día 24.",
    sugerencia: "Guarde sus recorridos como borrador. Podrá remitir la declaración a partir del día 24 de este mes.",
  },
  [CODIGOS_ERROR.ERR_3002]: {
    titulo: "Tarifa o Centavos Inválidos",
    descripcion: "El desglose financiero de viáticos o tarifas de pasaje no coincide con el tarifario oficial.",
    sugerencia: "Revise los trayectos ingresados y asegúrese de que las tarifas coincidan con las oficiales.",
  },
  [CODIGOS_ERROR.ERR_3003]: {
    titulo: "Solicitud Duplicada",
    descripcion: "Ya existe una declaración de pasajes enviada o en trámite para este periodo mensual.",
    sugerencia: "Revise el estado de su solicitud actual en el listado de pasajes antes de crear otra.",
  },
  [CODIGOS_ERROR.ERR_3004]: {
    titulo: "Observación Obligatoria",
    descripcion: "Para devolver o rechazar una solicitud de viáticos es indispensable fundamentar el motivo.",
    sugerencia: "Escriba una explicación clara en el campo de observaciones para orientar al becario.",
  },
  [CODIGOS_ERROR.ERR_4001]: {
    titulo: "Evento No Disponible",
    descripcion: "El evento institucional seleccionado ya ha concluido, fue cancelado o no existe.",
    sugerencia: "Actualice la lista de eventos activos desde la aplicación para ver actividades vigentes.",
  },
  [CODIGOS_ERROR.ERR_4002]: {
    titulo: "Fuera del Recinto del Evento",
    descripcion: "Su ubicación actual dista del punto geográfico fijado para la reunión o evento.",
    sugerencia: "Confirme su asistencia una vez que se encuentre físicamente dentro del recinto oficial.",
  },
  [CODIGOS_ERROR.ERR_4003]: {
    titulo: "Reflexión Demasiado Breve",
    descripcion: "El contenido redactado para el devocional no cumple con la longitud mínima requerida.",
    sugerencia: "Escriba una reflexión espiritual más completa con sus propias palabras.",
  },
  [CODIGOS_ERROR.ERR_4004]: {
    titulo: "Justificación Requerida",
    descripcion: "La solicitud de dispensa debe contener una justificación clara y detallada.",
    sugerencia: "Explique detalladamente la causa de fuerza mayor y adjunte los justificativos pertinentes.",
  },
  [CODIGOS_ERROR.ERR_5001]: {
    titulo: "Problemas de Conexión",
    descripcion: "No pudimos conectar con los servicios de BUMAND. Verifique su acceso a internet.",
    sugerencia: "Compruebe si su conexión Wi-Fi o datos móviles están funcionando y vuelva a intentarlo.",
  },
  [CODIGOS_ERROR.ERR_5002]: {
    titulo: "Datos Incompletos o Inválidos",
    descripcion: "Algunos de los campos completados no cumplen con las validaciones requeridas.",
    sugerencia: "Revise los campos señalados en rojo en el formulario y corrija la información ingresada.",
  },
  [CODIGOS_ERROR.ERR_5003]: {
    titulo: "Modo Fuera de Línea",
    descripcion: "El servidor no respondió a tiempo; su solicitud quedó en cola local de sincronización.",
    sugerencia: "Sus datos están seguros. La sincronización se completará automáticamente cuando vuelva la conexión.",
  },
  [CODIGOS_ERROR.ERR_9001]: {
    titulo: "Incidencia en el Servidor",
    descripcion: "Ocurrió una interrupción inesperada en nuestros sistemas durante el procesamiento.",
    sugerencia: "Intente nuevamente en unos instantes. Si persiste, comparta el código ERR-9001 con soporte.",
  },
  [CODIGOS_ERROR.ERR_9002]: {
    titulo: "Registro No Encontrado",
    descripcion: "El elemento o información solicitada no existe o ha sido dada de baja del sistema.",
    sugerencia: "Verifique que el enlace sea correcto o regrese al panel principal para buscar el registro.",
  },
};

export interface DesgloseError {
  codigo_error: string;
  titulo: string;
  descripcion: string;
  sugerencia: string;
  detalles: string[];
  marca_tiempo?: string;
  ruta?: string;
}

export function esCodigoErrorValido(codigo: unknown): codigo is CodigoError {
  return typeof codigo === "string" && Object.values(CODIGOS_ERROR).includes(codigo as CodigoError);
}

export function obtenerDetallesError(error: unknown): DesgloseError {
  let codigo_extraido = "ERR-9001";
  let mensaje_extraido = "Ocurrió un error inesperado al procesar la solicitud.";
  let detalles_extraidos: string[] = [];
  let marca_tiempo: string | undefined;
  let ruta: string | undefined;

  if (typeof error === "object" && error !== null) {
    const objeto = error as Record<string, unknown>;

    if (typeof objeto.codigo_error === "string") {
      codigo_extraido = objeto.codigo_error;
    }

    if (typeof objeto.mensaje === "string") {
      mensaje_extraido = objeto.mensaje;
    } else if (typeof objeto.message === "string") {
      mensaje_extraido = objeto.message;
    }

    if (Array.isArray(objeto.detalles)) {
      detalles_extraidos = objeto.detalles.map((d) => String(d));
    }

    if (typeof objeto.marca_tiempo === "string") {
      marca_tiempo = objeto.marca_tiempo;
    }

    if (typeof objeto.ruta === "string") {
      ruta = objeto.ruta;
    }
  } else if (typeof error === "string") {
    mensaje_extraido = error;
  }

  const clave_valida = esCodigoErrorValido(codigo_extraido)
    ? (codigo_extraido as CodigoError)
    : CODIGOS_ERROR.ERR_9001;
  const amigable = MENSAJES_AMIGABLES_ERROR[clave_valida];

  return {
    codigo_error: codigo_extraido,
    titulo: amigable?.titulo || "Error en el Sistema",
    descripcion: mensaje_extraido || amigable?.descripcion || "Se ha producido un error durante la ejecución.",
    sugerencia: amigable?.sugerencia || "Intente nuevamente o comuníquese con el soporte institucional.",
    detalles: detalles_extraidos,
    marca_tiempo,
    ruta,
  };
}
