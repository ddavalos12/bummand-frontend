import { PuntoGpsPrueba } from "@/servicios/recorridos-gps-prueba.servicio";

export const VELOCIDAD_ANOMALA_KMH = 160;

export interface TramoRecorridoGps {
  indice: number;
  punto_origen: PuntoGpsPrueba;
  punto_destino: PuntoGpsPrueba;
  distancia_metros: number;
  delta_monotonico_seg: number;
  velocidad_kmh: number;
  es_velocidad_anomala: boolean;
}

// Cálculo geodésico de distancia sobre esfera terrestre (fórmula de Haversine)
export function calcularDistanciaHaversineMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const RADIO_TIERRA_METROS = 6371e3;
  const rad = Math.PI / 180;
  const d_lat = (lat2 - lat1) * rad;
  const d_lon = (lon2 - lon1) * rad;
  const a =
    Math.sin(d_lat / 2) * Math.sin(d_lat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(d_lon / 2) * Math.sin(d_lon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIO_TIERRA_METROS * c;
}

export function obtenerVelocidadPuntoKmh(punto: PuntoGpsPrueba): number {
  if (typeof punto.velocidad_kmh === "number" && Number.isFinite(punto.velocidad_kmh)) {
    return punto.velocidad_kmh;
  }
  if (typeof punto.velocidad_mps === "number" && Number.isFinite(punto.velocidad_mps)) {
    return punto.velocidad_mps * 3.6;
  }
  return 0;
}

export function calcularTramosRecorrido(puntos: PuntoGpsPrueba[]): TramoRecorridoGps[] {
  if (!Array.isArray(puntos) || puntos.length < 2) return [];

  const tramos: TramoRecorridoGps[] = [];
  for (let i = 0; i < puntos.length - 1; i++) {
    const punto_origen = puntos[i];
    const punto_destino = puntos[i + 1];

    const distancia_calculada = calcularDistanciaHaversineMetros(
      Number(punto_origen.latitud),
      Number(punto_origen.longitud),
      Number(punto_destino.latitud),
      Number(punto_destino.longitud)
    );
    const distancia_metros = Math.round(distancia_calculada * 10) / 10;

    let delta_monotonico_seg =
      Number(punto_destino.tiempo_monotonico_seg ?? 0) -
      Number(punto_origen.tiempo_monotonico_seg ?? 0);

    if (!Number.isFinite(delta_monotonico_seg) || delta_monotonico_seg <= 0) {
      const t1 = Date.parse(punto_origen.hora_dispositivo);
      const t2 = Date.parse(punto_destino.hora_dispositivo);
      if (Number.isFinite(t1) && Number.isFinite(t2) && t2 > t1) {
        delta_monotonico_seg = (t2 - t1) / 1000;
      } else {
        delta_monotonico_seg = 0;
      }
    }

    let velocidad_kmh = 0;
    if (delta_monotonico_seg > 0) {
      velocidad_kmh = (distancia_metros / 1000) / (delta_monotonico_seg / 3600);
    } else {
      velocidad_kmh = obtenerVelocidadPuntoKmh(punto_destino);
    }

    const velocidad_redondeada = Math.round(velocidad_kmh * 10) / 10;
    const velocidad_sensor = obtenerVelocidadPuntoKmh(punto_destino);

    tramos.push({
      indice: i,
      punto_origen,
      punto_destino,
      distancia_metros,
      delta_monotonico_seg: Math.round(delta_monotonico_seg * 10) / 10,
      velocidad_kmh: velocidad_redondeada,
      es_velocidad_anomala:
        velocidad_redondeada > VELOCIDAD_ANOMALA_KMH ||
        velocidad_sensor > VELOCIDAD_ANOMALA_KMH,
    });
  }

  return tramos;
}

export function formatearDistanciaMetros(metros: number): string {
  if (!Number.isFinite(metros)) return "0 m";
  if (metros >= 1000) {
    return `${(metros / 1000).toFixed(2)} km`;
  }
  return `${Math.round(metros)} m`;
}

export function formatearDuracionSegundos(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "0s";
  const total = Math.round(segundos);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segs = total % 60;
  if (horas > 0) {
    return `${horas}h ${minutos}m ${segs}s`;
  }
  if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  }
  return `${segs}s`;
}

export function formatearFechaHoraCorta(iso?: string | null): string {
  if (!iso) return "No disponible";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatearHoraCorta(iso?: string | null): string {
  if (!iso) return "N/D";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function obtenerResumenDispositivo(
  dispositivo_info: string | Record<string, unknown> | null | undefined
): string {
  if (!dispositivo_info) return "Dispositivo no especificado";
  if (typeof dispositivo_info === "string") {
    try {
      const parseado = JSON.parse(dispositivo_info) as Record<string, unknown>;
      if (parseado && typeof parseado === "object") {
        const modelo = parseado.modelo || parseado.model || "";
        const marca = parseado.marca || parseado.brand || "";
        const os = parseado.sistema || parseado.os || "";
        const texto = [marca, modelo, os].filter(Boolean).join(" · ");
        return texto || dispositivo_info;
      }
    } catch {
      return dispositivo_info;
    }
    return dispositivo_info;
  }
  const modelo = dispositivo_info.modelo || dispositivo_info.model || "";
  const marca = dispositivo_info.marca || dispositivo_info.brand || "";
  const os = dispositivo_info.sistema || dispositivo_info.os || "";
  const texto = [marca, modelo, os].filter(Boolean).join(" · ");
  return texto || JSON.stringify(dispositivo_info);
}

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
