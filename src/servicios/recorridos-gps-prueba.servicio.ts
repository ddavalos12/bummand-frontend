import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export interface PuntoGpsPrueba {
  secuencia: number;
  latitud: number;
  longitud: number;
  precision_metros: number;
  altitud_metros?: number | null;
  velocidad_mps?: number | null;
  velocidad_kmh?: number | null;
  rumbo_grados?: number | null;
  hora_dispositivo: string;
  hora_gps?: string | null;
  tiempo_monotonico_seg: number;
  modo_captura: string;
  es_ubicacion_simulada?: boolean;
  proveedor?: string | null;
  distancia_previa_metros?: number | null;
}

export interface AlertaAntifraudeGps {
  tipo: string;
  severidad: string;
  descripcion: string;
  secuencia_punto?: number | null;
  marca_tiempo?: string | null;
  valor_detectado?: string | number | null;
}

export interface RecorridoGpsPruebaRegistro {
  id: number;
  uuid_sesion: string;
  etiqueta_prueba: string;
  dispositivo_info: string | Record<string, unknown>;
  hora_inicio_dispositivo: string;
  hora_fin_dispositivo: string;
  hora_inicio_gps?: string | null;
  hora_fin_gps?: string | null;
  hora_recepcion_servidor: string;
  zona_horaria_offset_min: number;
  duracion_monotonica_seg: number;
  intervalo_minutos: number;
  total_puntos: number;
  distancia_total_metros: number;
  puntos_json: PuntoGpsPrueba[];
  hash_integridad_cliente: string;
  integridad_verificada: boolean;
  tiene_alerta_fraude: boolean;
  alertas_antifraude_json: AlertaAntifraudeGps[];
  estado: string;
  creado_en: string;
}

export async function listarRecorridosGpsPrueba(): Promise<RecorridoGpsPruebaRegistro[]> {
  return clienteApi.get<RecorridoGpsPruebaRegistro[]>(RUTAS_API.RECORRIDOS_GPS_PRUEBA.BASE);
}

export async function obtenerRecorridoGpsPrueba(
  id: number
): Promise<RecorridoGpsPruebaRegistro> {
  return clienteApi.get<RecorridoGpsPruebaRegistro>(RUTAS_API.RECORRIDOS_GPS_PRUEBA.POR_ID(id));
}

export async function eliminarRecorridoGpsPrueba(
  id: number
): Promise<{ mensaje?: string }> {
  return clienteApi.delete<{ mensaje?: string }>(RUTAS_API.RECORRIDOS_GPS_PRUEBA.POR_ID(id));
}
