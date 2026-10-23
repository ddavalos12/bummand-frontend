export interface LibroBiblia {
  nombre: string;
  testamento: "AT" | "NT";
  capitulos: number;
}

export const LIBROS_BIBLIA: LibroBiblia[] = [
  // Antiguo Testamento (39 libros)
  { nombre: "Génesis", testamento: "AT", capitulos: 50 },
  { nombre: "Éxodo", testamento: "AT", capitulos: 40 },
  { nombre: "Levítico", testamento: "AT", capitulos: 27 },
  { nombre: "Números", testamento: "AT", capitulos: 36 },
  { nombre: "Deuteronomio", testamento: "AT", capitulos: 34 },
  { nombre: "Josué", testamento: "AT", capitulos: 24 },
  { nombre: "Jueces", testamento: "AT", capitulos: 21 },
  { nombre: "Rut", testamento: "AT", capitulos: 4 },
  { nombre: "1 Samuel", testamento: "AT", capitulos: 31 },
  { nombre: "2 Samuel", testamento: "AT", capitulos: 24 },
  { nombre: "1 Reyes", testamento: "AT", capitulos: 22 },
  { nombre: "2 Reyes", testamento: "AT", capitulos: 25 },
  { nombre: "1 Crónicas", testamento: "AT", capitulos: 29 },
  { nombre: "2 Crónicas", testamento: "AT", capitulos: 36 },
  { nombre: "Esdras", testamento: "AT", capitulos: 10 },
  { nombre: "Nehemías", testamento: "AT", capitulos: 13 },
  { nombre: "Ester", testamento: "AT", capitulos: 10 },
  { nombre: "Job", testamento: "AT", capitulos: 42 },
  { nombre: "Salmos", testamento: "AT", capitulos: 150 },
  { nombre: "Proverbios", testamento: "AT", capitulos: 31 },
  { nombre: "Eclesiastés", testamento: "AT", capitulos: 12 },
  { nombre: "Cantares", testamento: "AT", capitulos: 8 },
  { nombre: "Isaías", testamento: "AT", capitulos: 66 },
  { nombre: "Jeremías", testamento: "AT", capitulos: 52 },
  { nombre: "Lamentaciones", testamento: "AT", capitulos: 5 },
  { nombre: "Ezequiel", testamento: "AT", capitulos: 48 },
  { nombre: "Daniel", testamento: "AT", capitulos: 12 },
  { nombre: "Oseas", testamento: "AT", capitulos: 14 },
  { nombre: "Joel", testamento: "AT", capitulos: 3 },
  { nombre: "Amós", testamento: "AT", capitulos: 9 },
  { nombre: "Abdías", testamento: "AT", capitulos: 1 },
  { nombre: "Jonás", testamento: "AT", capitulos: 4 },
  { nombre: "Miqueas", testamento: "AT", capitulos: 7 },
  { nombre: "Nahúm", testamento: "AT", capitulos: 3 },
  { nombre: "Habacuc", testamento: "AT", capitulos: 3 },
  { nombre: "Sofonías", testamento: "AT", capitulos: 3 },
  { nombre: "Hageo", testamento: "AT", capitulos: 2 },
  { nombre: "Zacarías", testamento: "AT", capitulos: 14 },
  { nombre: "Malaquías", testamento: "AT", capitulos: 4 },

  // Nuevo Testamento (27 libros)
  { nombre: "Mateo", testamento: "NT", capitulos: 28 },
  { nombre: "Marcos", testamento: "NT", capitulos: 16 },
  { nombre: "Lucas", testamento: "NT", capitulos: 24 },
  { nombre: "Juan", testamento: "NT", capitulos: 21 },
  { nombre: "Hechos", testamento: "NT", capitulos: 28 },
  { nombre: "Romanos", testamento: "NT", capitulos: 16 },
  { nombre: "1 Corintios", testamento: "NT", capitulos: 16 },
  { nombre: "2 Corintios", testamento: "NT", capitulos: 13 },
  { nombre: "Gálatas", testamento: "NT", capitulos: 6 },
  { nombre: "Efesios", testamento: "NT", capitulos: 6 },
  { nombre: "Filipenses", testamento: "NT", capitulos: 4 },
  { nombre: "Colosenses", testamento: "NT", capitulos: 4 },
  { nombre: "1 Tesalonicenses", testamento: "NT", capitulos: 5 },
  { nombre: "2 Tesalonicenses", testamento: "NT", capitulos: 3 },
  { nombre: "1 Timoteo", testamento: "NT", capitulos: 6 },
  { nombre: "2 Timoteo", testamento: "NT", capitulos: 4 },
  { nombre: "Tito", testamento: "NT", capitulos: 3 },
  { nombre: "Filemón", testamento: "NT", capitulos: 1 },
  { nombre: "Hebreos", testamento: "NT", capitulos: 13 },
  { nombre: "Santiago", testamento: "NT", capitulos: 5 },
  { nombre: "1 Pedro", testamento: "NT", capitulos: 5 },
  { nombre: "2 Pedro", testamento: "NT", capitulos: 3 },
  { nombre: "1 Juan", testamento: "NT", capitulos: 5 },
  { nombre: "2 Juan", testamento: "NT", capitulos: 1 },
  { nombre: "3 Juan", testamento: "NT", capitulos: 1 },
  { nombre: "Judas", testamento: "NT", capitulos: 1 },
  { nombre: "Apocalipsis", testamento: "NT", capitulos: 22 },
];

export function construirCitaBiblica(
  libro: string,
  capitulo: number | string,
  versiculo_inicio: number | string,
  versiculo_fin?: number | string | null
): string {
  const cap = Number(capitulo) || 1;
  const v_ini = Number(versiculo_inicio) || 1;
  const v_fin = versiculo_fin ? Number(versiculo_fin) : null;

  if (v_fin && v_fin > v_ini) {
    return `${libro} ${cap}:${v_ini}-${v_fin}`;
  }
  return `${libro} ${cap}:${v_ini}`;
}

export function desglosarCitaBiblica(cita: string): {
  libro: string;
  capitulo: number;
  versiculo_inicio: number;
  versiculo_fin?: number;
} {
  const patron = /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const coincidencias = cita.trim().match(patron);

  if (coincidencias) {
    const [, libro, cap, v_ini, v_fin] = coincidencias;
    return {
      libro: libro.trim(),
      capitulo: Number(cap),
      versiculo_inicio: Number(v_ini),
      versiculo_fin: v_fin ? Number(v_fin) : undefined,
    };
  }

  return {
    libro: "Filipenses",
    capitulo: 4,
    versiculo_inicio: 13,
  };
}
