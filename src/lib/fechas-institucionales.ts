export const ZONA_HORARIA_INSTITUCIONAL = "America/La_Paz";

export const NOMBRES_MESES_LARGO = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const NOMBRES_MESES_CORTO = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export interface PartesFechaInstitucional {
  ano: number;
  mes: number;
  dia: number;
  mes_iso: string;
  fecha_iso: string;
}

export interface RangoMesInstitucional {
  mes_iso: string;
  inicio: string;
  fin: string;
}

export interface RangoFechasInstitucional {
  inicio: string;
  fin: string;
  etiqueta?: string;
}

export interface OpcionMesGestion {
  clave: string;
  valor: string;
  etiqueta: string;
  mes_nombre: string;
  etiqueta_corta: string;
  etiqueta_larga: string;
  etiqueta_con_actual: string;
  es_actual: boolean;
}

function formatearDosDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

function obtenerUltimoDiaMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

function parsearMesIso(mes_iso?: string): { ano: number; mes: number } | null {
  const coincidencia = /^(\d{4})-(\d{2})$/.exec((mes_iso || "").trim());
  if (!coincidencia) return null;
  const ano = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  if (mes < 1 || mes > 12) return null;
  return { ano, mes };
}

export function obtenerPartesFechaLaPaz(fecha: Date = new Date()): PartesFechaInstitucional {
  const formateador = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_INSTITUCIONAL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const partes = formateador.formatToParts(fecha);
  const mapa: Record<string, string> = {};
  for (const parte of partes) {
    if (parte.type !== "literal") {
      mapa[parte.type] = parte.value;
    }
  }
  const ano = Number(mapa.year);
  const mes = Number(mapa.month);
  const dia = Number(mapa.day);
  const mes_pad = formatearDosDigitos(mes);
  const dia_pad = formatearDosDigitos(dia);
  const mes_iso = `${ano}-${mes_pad}`;
  return {
    ano,
    mes,
    dia,
    mes_iso,
    fecha_iso: `${mes_iso}-${dia_pad}`,
  };
}

export function obtenerHoyLaPaz(): string {
  return obtenerPartesFechaLaPaz().fecha_iso;
}

export function obtenerDiaActualLaPaz(): number {
  return obtenerPartesFechaLaPaz().dia;
}

export function obtenerMesActualLaPaz(): string {
  return obtenerPartesFechaLaPaz().mes_iso;
}

export function esDiaCorteHabilitadoLaPaz(dia_corte = 24): boolean {
  return obtenerDiaActualLaPaz() >= dia_corte;
}

export function obtenerRangoMes(mes_iso?: string): RangoMesInstitucional {
  const parsed = parsearMesIso(mes_iso);
  const actual = obtenerPartesFechaLaPaz();
  const ano = parsed ? parsed.ano : actual.ano;
  const mes = parsed ? parsed.mes : actual.mes;
  const mes_pad = formatearDosDigitos(mes);
  const mes_norm = `${ano}-${mes_pad}`;
  const ultimo_dia = obtenerUltimoDiaMes(ano, mes);
  return {
    mes_iso: mes_norm,
    inicio: `${mes_norm}-01`,
    fin: `${mes_norm}-${formatearDosDigitos(ultimo_dia)}`,
  };
}

export function obtenerRangoMesActualLaPaz(): RangoMesInstitucional {
  return obtenerRangoMes(obtenerMesActualLaPaz());
}

export function obtenerRangoMesAnteriorLaPaz(mes_referencia?: string): RangoMesInstitucional {
  const parsed = parsearMesIso(mes_referencia) || obtenerPartesFechaLaPaz();
  const d = new Date(Date.UTC(parsed.ano, parsed.mes - 2, 1));
  const mes_iso = `${d.getUTCFullYear()}-${formatearDosDigitos(d.getUTCMonth() + 1)}`;
  return obtenerRangoMes(mes_iso);
}

export function obtenerRangoSemestreActualLaPaz(): RangoFechasInstitucional & { etiqueta: string } {
  const { ano, mes } = obtenerPartesFechaLaPaz();
  if (mes <= 6) {
    return {
      inicio: `${ano}-01-01`,
      fin: `${ano}-06-30`,
      etiqueta: `Semestre I-${ano}`,
    };
  }
  return {
    inicio: `${ano}-07-01`,
    fin: `${ano}-12-31`,
    etiqueta: `Semestre II-${ano}`,
  };
}

export function obtenerRangoUltimoTrimestreLaPaz(): RangoFechasInstitucional {
  const { ano, mes } = obtenerPartesFechaLaPaz();
  const inicio_dt = new Date(Date.UTC(ano, mes - 3, 1));
  const inicio = `${inicio_dt.getUTCFullYear()}-${formatearDosDigitos(inicio_dt.getUTCMonth() + 1)}-01`;
  const fin = obtenerRangoMesActualLaPaz().fin;
  return { inicio, fin };
}

export function obtenerRangoAnioActualLaPaz(): RangoFechasInstitucional {
  const { ano } = obtenerPartesFechaLaPaz();
  return {
    inicio: `${ano}-01-01`,
    fin: `${ano}-12-31`,
  };
}

export function obtenerFechaHaceDiasLaPaz(dias: number): string {
  const { ano, mes, dia } = obtenerPartesFechaLaPaz();
  const d = new Date(Date.UTC(ano, mes - 1, dia - dias));
  return `${d.getUTCFullYear()}-${formatearDosDigitos(d.getUTCMonth() + 1)}-${formatearDosDigitos(d.getUTCDate())}`;
}

export function formatearMesInstitucional(
  mes_iso: string,
  opciones?: { corto?: boolean; marcar_actual?: boolean }
): string {
  const parsed = parsearMesIso(mes_iso);
  if (!parsed) return mes_iso;
  const nombres = opciones?.corto ? NOMBRES_MESES_CORTO : NOMBRES_MESES_LARGO;
  const base = `${nombres[parsed.mes - 1]} ${parsed.ano}`;
  if (opciones?.marcar_actual && mes_iso === obtenerMesActualLaPaz()) {
    return `${base} (Actual)`;
  }
  return base;
}

export function generarMesesGestion(opciones?: {
  desde_mes?: string;
  hasta_mes?: string;
  orden?: "desc" | "asc";
}): OpcionMesGestion[] {
  const mes_actual = obtenerMesActualLaPaz();
  const ano_actual = Number(mes_actual.slice(0, 4));
  const desde_defecto = ano_actual === 2026 ? "2026-03" : `${ano_actual}-01`;
  const hasta_defecto = mes_actual > "2026-12" ? mes_actual : "2026-12";

  const desde = parsearMesIso(opciones?.desde_mes) || parsearMesIso(desde_defecto)!;
  const hasta = parsearMesIso(opciones?.hasta_mes) || parsearMesIso(hasta_defecto)!;
  const orden = opciones?.orden || "desc";

  const inicio_indice = desde.ano * 12 + (desde.mes - 1);
  const fin_indice = hasta.ano * 12 + (hasta.mes - 1);
  const lista: OpcionMesGestion[] = [];

  for (let idx = inicio_indice; idx <= fin_indice; idx += 1) {
    const ano = Math.floor(idx / 12);
    const mes = (idx % 12) + 1;
    const clave = `${ano}-${formatearDosDigitos(mes)}`;
    const nombre_largo = NOMBRES_MESES_LARGO[mes - 1];
    const nombre_corto = NOMBRES_MESES_CORTO[mes - 1];
    const es_actual = clave === mes_actual;
    const etiqueta_larga = `${nombre_largo} ${ano}`;
    const etiqueta_corta = `${nombre_corto} ${ano}`;
    lista.push({
      clave,
      valor: clave,
      etiqueta: etiqueta_corta,
      mes_nombre: etiqueta_larga,
      etiqueta_corta,
      etiqueta_larga,
      etiqueta_con_actual: es_actual ? `${etiqueta_larga} (Actual)` : etiqueta_larga,
      es_actual,
    });
  }

  return orden === "desc" ? lista.reverse() : lista;
}

export function coincideTextoMesPeriodo(
  texto_busqueda: string,
  periodo: string,
  mes_nombre: string
): boolean {
  const texto = texto_busqueda.trim().toLowerCase();
  if (!texto) return false;
  if (
    periodo.toLowerCase().includes(texto) ||
    mes_nombre.toLowerCase().includes(texto)
  ) {
    return true;
  }

  const parsed = parsearMesIso(periodo);
  if (!parsed) return false;
  const largo = NOMBRES_MESES_LARGO[parsed.mes - 1].toLowerCase();
  const corto = NOMBRES_MESES_CORTO[parsed.mes - 1].toLowerCase();
  return texto === largo || texto === corto;
}
