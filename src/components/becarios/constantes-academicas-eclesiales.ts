import { OpcionCombobox } from "@/components/ui/combobox";

// =========================================================================
// 1. CATÁLOGO COMPLETO DE CARRERAS UNIVERSITARIAS EN BOLIVIA
// =========================================================================
export const CARRERAS_POR_UNIVERSIDAD: Record<string, string[]> = {
  UMSA: [
    "Ingeniería de Sistemas",
    "Informática",
    "Contaduría Pública",
    "Administración de Empresas",
    "Economía",
    "Derecho",
    "Ciencias de la Comunicación Social",
    "Trabajo Social",
    "Psicología",
    "Ciencias de la Educación",
    "Lingüística e Idiomas",
    "Medicina",
    "Enfermería",
    "Odontología",
    "Nutrición y Dietética",
    "Fisioterapia y Kinesiología",
    "Bioquímica y Farmacia",
    "Arquitectura",
    "Artes Plásticas",
    "Ingeniería Civil",
    "Ingeniería Industrial",
    "Ingeniería Química",
    "Ingeniería Electrónica",
    "Ingeniería Mecánica",
    "Ingeniería Petrolera",
    "Agronomía",
    "Estadística",
    "Matemática",
    "Física",
    "Química",
    "Turismo",
    "Sociología",
    "Antropología / Arqueología",
  ],
  UPEA: [
    "Ingeniería de Sistemas",
    "Ingeniería Electrónica",
    "Ingeniería Civil",
    "Ingeniería de Gas y Petroquímica",
    "Ingeniería Ambiental",
    "Ingeniería Textil",
    "Contaduría Pública",
    "Administración de Empresas",
    "Economía",
    "Comercio Internacional",
    "Gestión Turística y Hotelera",
    "Derecho",
    "Ciencias de la Comunicación Social",
    "Trabajo Social",
    "Psicología",
    "Ciencias de la Educación",
    "Educación Parvularia",
    "Lingüística e Idiomas",
    "Sociología",
    "Historia",
    "Medicina",
    "Enfermería",
    "Odontología",
    "Nutrición y Dietética",
    "Medicina Veterinaria y Zootecnia",
    "Arquitectura",
    "Artes Plásticas",
    "Música",
    "Ciencias Políticas",
  ],
  UCB: [
    "Ingeniería de Sistemas",
    "Ingeniería Mecatrónica",
    "Ingeniería Biomédica",
    "Ingeniería Ambiental",
    "Ingeniería Civil",
    "Ingeniería Industrial",
    "Ingeniería Comercial",
    "Ingeniería Química",
    "Ingeniería en Telecomunicaciones",
    "Administración de Empresas",
    "Contaduría Pública",
    "Economía",
    "Marketing y Negocios Digitales",
    "Derecho",
    "Ciencias Políticas",
    "Comunicación Social",
    "Psicología",
    "Psicopedagogía",
    "Arquitectura",
    "Diseño Gráfico y Comunicación Visual",
    "Medicina",
    "Odontología",
    "Enfermería",
    "Teología",
    "Filosofía y Letras",
  ],
  UNIVALLE: [
    "Medicina",
    "Odontología",
    "Fisioterapia y Kinesiología",
    "Bioquímica y Farmacia",
    "Enfermería",
    "Ingeniería Biomédica",
    "Ingeniería de Sistemas Informáticos",
    "Ingeniería Civil",
    "Ingeniería Industrial y de Sistemas",
    "Ingeniería Electromecánica",
    "Ingeniería en Petróleo, Gas y Energías",
    "Ingeniería Comercial",
    "Administración de Empresas",
    "Contaduría Pública",
    "Comercio Internacional",
    "Derecho",
    "Gastronomía",
    "Arquitectura y Urbanismo",
    "Comunicación y Medios Digitales",
    "Psicología",
  ],
  UNIFRANZ: [
    "Medicina",
    "Odontología",
    "Bioquímica y Farmacia",
    "Enfermería",
    "Psicología",
    "Derecho",
    "Periodismo",
    "Publicidad y Marketing",
    "Administración de Empresas",
    "Contaduría Pública",
    "Ingeniería Comercial",
    "Administración de Hotelería y Turismo",
    "Ingeniería de Sistemas",
    "Diseño Gráfico y Producción Crossmedia",
    "Arquitectura",
  ],
  EMI: [
    "Ingeniería de Sistemas",
    "Ingeniería en Telecomunicaciones",
    "Ingeniería Mecatrónica",
    "Ingeniería Civil",
    "Ingeniería Industrial",
    "Ingeniería Comercial",
    "Ingeniería Agroindustrial",
    "Ingeniería Ambiental",
    "Ingeniería Petrolera",
    "Ingeniería Geográfica",
  ],
  UTB: [
    "Ingeniería de Sistemas",
    "Ingeniería Comercial",
    "Ingeniería Civil",
    "Ingeniería Electrónica",
    "Contaduría Pública",
    "Administración de Empresas",
    "Comercio Internacional",
    "Derecho",
    "Ciencias de la Comunicación Social",
    "Psicología",
    "Turismo y Hotelería",
    "Educación Parvularia",
    "Comercio Exterior y Aduanas",
  ],
  OTRA: [
    "Ingeniería de Sistemas",
    "Informática",
    "Contaduría Pública",
    "Administración de Empresas",
    "Economía",
    "Derecho",
    "Medicina",
    "Enfermería",
    "Odontología",
    "Bioquímica y Farmacia",
    "Psicología",
    "Trabajo Social",
    "Ciencias de la Educación",
    "Arquitectura",
    "Ingeniería Civil",
    "Ingeniería Comercial",
    "Ingeniería Industrial",
    "Teología",
  ],
};

// =========================================================================
// 2. CATÁLOGO OFICIAL DE IGLESIAS ASOCIADAS A DIACONÍA Y BUMAND
// =========================================================================
export interface IglesiaDiaconia {
  nombre: string;
  zona: string;
  pastor: string;
  denominacion: string;
}

export const IGLESIAS_DIACONIA_BUMAND: IglesiaDiaconia[] = [
  {
    nombre: "Iglesia Evangélica Amigos Central de Bolivia Bautista Saavedra",
    zona: "Bautista Saavedra / Villa Adela, El Alto",
    pastor: "Pr. Luis Álvaro Quispe Condori",
    denominacion: "Amigos Evangélica",
  },
  {
    nombre: "Iglesia Metodista Monte de Horeb",
    zona: "Zona 16 de Julio, El Alto",
    pastor: "Pr. Julio Llanquichoque",
    denominacion: "Metodista en Bolivia",
  },
  {
    nombre: "Iglesia del Nazareno El Progreso",
    zona: "Zona El Progreso, El Alto",
    pastor: "Pr. René Max Condori Quispe",
    denominacion: "Iglesia del Nazareno",
  },
  {
    nombre: "Iglesia del Nazareno Río Seco",
    zona: "Ex-Tranca Río Seco, El Alto",
    pastor: "Pr. Rubén Flores Villa",
    denominacion: "Iglesia del Nazareno",
  },
  {
    nombre: "Iglesia Nazareno 6 de Junio",
    zona: "Zona 6 de Junio, El Alto",
    pastor: "Pr. Abdias Espinoza Aleluya",
    denominacion: "Iglesia del Nazareno",
  },
  {
    nombre: "Iglesia Bautista Emanuel - Sopocachi",
    zona: "Calle Sánchez Lima, Sopocachi, La Paz",
    pastor: "Pr. Marcos Gutierrez",
    denominacion: "Convención Bautista",
  },
  {
    nombre: "Iglesia Evangélica de Dios Boliviana Pampahasi",
    zona: "Pampahasi Alto, La Paz",
    pastor: "Pr. Andrés Alarcón",
    denominacion: "Asamblea de Dios",
  },
  {
    nombre: "Centro Evangelístico Caluyo",
    zona: "Zona Caluyo, El Alto",
    pastor: "Pr. David Felix Quispe Quispe",
    denominacion: "Evangélica Pentecostal",
  },
  {
    nombre: "Iglesia Bautista para la Familia",
    zona: "Zona Villa Dolores, El Alto",
    pastor: "Pr. Alfredo Valencia Vela",
    denominacion: "Convención Bautista",
  },
  {
    nombre: "Iglesia Central El Alto",
    zona: "Av. Juan Pablo II, El Alto",
    pastor: "Pr. David Mamani",
    denominacion: "Alianza Evangélica",
  },
  {
    nombre: "Iglesia Metodista El Salvador",
    zona: "Calle 12 de Calacoto, La Paz",
    pastor: "Pr. Esteban Choque",
    denominacion: "Metodista en Bolivia",
  },
  {
    nombre: "Iglesia Presbiteriana Maranata",
    zona: "Av. Perú, La Paz",
    pastor: "Pr. Samuel Miranda",
    denominacion: "Presbiteriana",
  },
  {
    nombre: "Iglesia Cristiana Eli - Ezer",
    zona: "Zona Central / Villa Adela, El Alto",
    pastor: "Pr. Antonio Ali Mayta",
    denominacion: "Comunidad Cristiana",
  },
  {
    nombre: "Iglesia Sinaí Los Andes",
    zona: "Zona Los Andes, El Alto",
    pastor: "Pr. Pedro Pablo Callisaya",
    denominacion: "Evangélica",
  },
  {
    nombre: "Iglesia Arca de Dios",
    zona: "Zona Senkata, El Alto",
    pastor: "Pr. Abraham Mollo Quenaya",
    denominacion: "Evangélica",
  },
  {
    nombre: "Iglesia Bet-el",
    zona: "Zona Villa Adela, El Alto",
    pastor: "Pr. Santiago Aparicio Salinas",
    denominacion: "Evangélica",
  },
  {
    nombre: "Iglesia El Buen Pastor",
    zona: "Zona Villa Bolívar D, El Alto",
    pastor: "Pr. Manuel Mamani Mamani",
    denominacion: "Evangélica",
  },
  {
    nombre: "Iglesia La Hermosa",
    zona: "Zona 12 de Octubre, El Alto",
    pastor: "Pr. Héctor Sergio Choque",
    denominacion: "Evangélica",
  },
  {
    nombre: "Iglesia Canaán",
    zona: "Zona Villa Mercedes, El Alto",
    pastor: "Pr. Mario Pacohuanca Cruz",
    denominacion: "Evangélica",
  },
  {
    nombre: "Iglesia Alianza Cristiana y Misionera La Paz",
    zona: "Sopocachi / Miraflores, La Paz",
    pastor: "Pr. Comunidad Alianza",
    denominacion: "Alianza Cristiana y Misionera",
  },
  {
    nombre: "Iglesia Evangélica Pacajes",
    zona: "Pacajes Caluyo, El Alto",
    pastor: "Pr. Ramiro Zárate García",
    denominacion: "Evangélica",
  },
  {
    nombre: "Ministerio Misión Boliviana",
    zona: "Zona Central, El Alto",
    pastor: "Cra. Cristina Elizabeth López",
    denominacion: "Misión Boliviana",
  },
];

// =========================================================================
// 3. GENERADORES DE OPCIONES PARA COMBOBOX
// =========================================================================

/**
 * Obtiene las opciones de carreras para el Combobox.
 * Si se especifica una universidad, lista sus carreras primero con badge de la universidad,
 * seguido del resto de carreras oficiales registradas en Bolivia.
 */
export function generarOpcionesCarreras(universidadSeleccionada?: string): OpcionCombobox[] {
  const clave_univ = (universidadSeleccionada || "UMSA").toUpperCase();
  const carreras_univ_actual = new Set(CARRERAS_POR_UNIVERSIDAD[clave_univ] || CARRERAS_POR_UNIVERSIDAD.UMSA);

  const opciones_prioritarias: OpcionCombobox[] = Array.from(carreras_univ_actual).map((carrera) => ({
    valor: carrera,
    etiqueta: carrera,
    descripcion: `Facultad / Oferta académica ${clave_univ}`,
    badge: clave_univ,
  }));

  // Obtener carreras adicionales de otras universidades
  const otras_carreras: OpcionCombobox[] = [];
  const todas = new Set<string>();

  Object.entries(CARRERAS_POR_UNIVERSIDAD).forEach(([univ, lista]) => {
    if (univ === clave_univ) return;
    lista.forEach((c) => {
      if (!carreras_univ_actual.has(c) && !todas.has(c)) {
        todas.add(c);
        otras_carreras.push({
          valor: c,
          etiqueta: c,
          descripcion: `Carrera universitaria (${univ})`,
          badge: "Bolivia",
        });
      }
    });
  });

  otras_carreras.sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));

  return [...opciones_prioritarias, ...otras_carreras];
}

/**
 * Obtiene las opciones de iglesias para el Combobox asociadas a BUMAND y Diaconía.
 */
export function generarOpcionesIglesias(): OpcionCombobox[] {
  return IGLESIAS_DIACONIA_BUMAND.map((iglesia) => ({
    valor: iglesia.nombre,
    etiqueta: iglesia.nombre,
    descripcion: `${iglesia.zona} · ${iglesia.pastor}`,
    badge: iglesia.denominacion,
  }));
}
