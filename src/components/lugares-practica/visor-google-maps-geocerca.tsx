"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { BloqueSede, SedePractica } from "./mapa-lugares-practica";
import { VisorLeafletGeocerca } from "./visor-leaflet-geocerca";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Layers,
  MapPin,
  Crosshair,
  Satellite,
  Map as MapIcon,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Sparkles,
  KeyRound,
  AlertTriangle,
} from "lucide-react";

interface PropsVisorGoogleMaps {
  sede: SedePractica;
  bloque_activo: BloqueSede;
  radio_tolerancia_m: number;
  alSeleccionarBloque: (bloque: BloqueSede) => void;
  alAbrirAjusteClave?: () => void;
}

// Cálculo geodésico Haversine exacto en metros
function calcularDistanciaHaversineMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const rad = Math.PI / 180;
  const d_lat = (lat2 - lat1) * rad;
  const d_lon = (lon2 - lon1) * rad;
  const a =
    Math.sin(d_lat / 2) * Math.sin(d_lat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(d_lon / 2) * Math.sin(d_lon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function VisorGoogleMapsGeocerca({
  sede,
  bloque_activo,
  radio_tolerancia_m,
  alSeleccionarBloque,
  alAbrirAjusteClave,
}: PropsVisorGoogleMaps) {
  const { esta_cargado, cargando, error_carga, fallo_autenticacion, tiene_clave_valida } = useGoogleMaps();

  // Si no hay clave API configurada o falló la autenticación con Google Cloud, usar el visor satelital y urbano libre
  if (!tiene_clave_valida || fallo_autenticacion || Boolean(error_carga)) {
    return (
      <VisorLeafletGeocerca
        sede={sede}
        bloque_activo={bloque_activo}
        radio_tolerancia_m={radio_tolerancia_m}
        alSeleccionarBloque={alSeleccionarBloque}
        alAbrirAjusteClave={alAbrirAjusteClave}
      />
    );
  }

  const contenedor_mapa_ref = useRef<HTMLDivElement | null>(null);

  const instancia_mapa_ref = useRef<google.maps.Map | null>(null);
  const marcadores_bloques_ref = useRef<google.maps.Marker[]>([]);
  const circulo_geocerca_ref = useRef<google.maps.Circle | null>(null);
  const marcador_becario_ref = useRef<google.maps.Marker | null>(null);
  const ventana_info_ref = useRef<google.maps.InfoWindow | null>(null);

  const [tipo_mapa, set_tipo_mapa] = useState<"roadmap" | "hybrid">("roadmap");
  const [modo_radar, set_modo_radar] = useState<boolean>(false);

  // Simulación del becario: posición relativa con desplazamiento en metros
  const [offset_becario, set_offset_becario] = useState<{ d_lat: number; d_lng: number }>({
    d_lat: 0.00028,
    d_lng: 0.00032,
  });

  const becario_lat = bloque_activo.latitud + offset_becario.d_lat;
  const becario_lng = bloque_activo.longitud + offset_becario.d_lng;

  const distancia_al_bloque_m = calcularDistanciaHaversineMetros(
    bloque_activo.latitud,
    bloque_activo.longitud,
    becario_lat,
    becario_lng
  );

  const becario_en_rango = distancia_al_bloque_m <= radio_tolerancia_m;

  // Inicializar Google Maps
  useEffect(() => {
    if (
      !esta_cargado ||
      !contenedor_mapa_ref.current ||
      modo_radar ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    try {
      const centro = { lat: bloque_activo.latitud, lng: bloque_activo.longitud };

      if (!instancia_mapa_ref.current) {
        const opciones: google.maps.MapOptions = {
          center: centro,
          zoom: 17,
          mapTypeId: tipo_mapa,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }],
            },
          ],
        };

        const mapa = new window.google.maps.Map(contenedor_mapa_ref.current, opciones);
        instancia_mapa_ref.current = mapa;
        ventana_info_ref.current = new window.google.maps.InfoWindow();

        // Círculo concéntrico de geocerca
        const circulo = new window.google.maps.Circle({
          map: mapa,
          center: centro,
          radius: radio_tolerancia_m,
          fillColor: "#00ABBD",
          fillOpacity: 0.22,
          strokeColor: "#035683",
          strokeOpacity: 0.9,
          strokeWeight: 2.5,
        });
        circulo_geocerca_ref.current = circulo;

        // Marcador del Becario GPS (Punto verde / ámbar)
        const marcador_becario = new window.google.maps.Marker({
          position: { lat: becario_lat, lng: becario_lng },
          map: mapa,
          title: "GPS Becario en Tiempo Real",
          icon: {
            path: window.google.maps.SymbolPath?.CIRCLE ?? 0,
            scale: 9,
            fillColor: becario_en_rango ? "#10B981" : "#F59E0B",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2.5,
          },
        });
        marcador_becario_ref.current = marcador_becario;
      }
    } catch (e) {
      console.warn("[VisorGoogleMapsGeocerca] Error al instanciar Google Maps:", e);
    }
  }, [esta_cargado, modo_radar]);

  // Actualizar marcadores de los bloques de la sede activa
  useEffect(() => {
    if (
      !instancia_mapa_ref.current ||
      !esta_cargado ||
      modo_radar ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    try {
      // Limpiar marcadores anteriores
      marcadores_bloques_ref.current.forEach((m) => m.setMap(null));
      marcadores_bloques_ref.current = [];

      const mapa = instancia_mapa_ref.current;

      sede.bloques.forEach((bloque) => {
        const es_activo = bloque.id === bloque_activo.id;

        const marcador = new window.google.maps.Marker({
          position: { lat: bloque.latitud, lng: bloque.longitud },
          map: mapa,
          title: `${bloque.nombre} - ${sede.nombre}`,
          label: {
            text: bloque.nombre.includes("Bloque A") ? "A" : "B",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: "12px",
          },
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            fillColor: es_activo ? "#035683" : "#00ABBD",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 1.8,
            anchor: new window.google.maps.Point(12, 22),
            labelOrigin: new window.google.maps.Point(12, 9),
          },
          zIndex: es_activo ? 100 : 50,
        });

        marcador.addListener("click", () => {
          alSeleccionarBloque(bloque);
          if (ventana_info_ref.current) {
            ventana_info_ref.current.setContent(`
              <div style="padding: 6px; font-family: sans-serif; font-size: 12px; color: #1E293B; max-width: 220px;">
                <strong style="color: #035683; font-size: 13px; display: block; margin-bottom: 2px;">
                  ${bloque.nombre}
                </strong>
                <span style="font-size: 11px; color: #64748B; display: block; margin-bottom: 4px;">
                  ${sede.nombre}
                </span>
                <p style="margin: 0 0 6px 0; font-size: 11px; line-height: 1.3;">
                  ${bloque.descripcion || "Punto geodésico institucional"}
                </p>
                <div style="font-family: monospace; font-size: 10px; background: #F1F5F9; padding: 2px 4px; border-radius: 4px;">
                  ${bloque.latitud.toFixed(6)}, ${bloque.longitud.toFixed(6)}
                </div>
              </div>
            `);
            ventana_info_ref.current.open(mapa, marcador);
          }
        });

        marcadores_bloques_ref.current.push(marcador);
      });
    } catch (e) {
      console.warn("[VisorGoogleMapsGeocerca] Error al pintar bloques:", e);
    }
  }, [sede, bloque_activo, esta_cargado, alSeleccionarBloque, modo_radar]);

  // Actualizar círculo de geocerca y centro cuando cambia bloque_activo o radio
  useEffect(() => {
    if (
      !instancia_mapa_ref.current ||
      !circulo_geocerca_ref.current ||
      modo_radar ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    try {
      const centro = new window.google.maps.LatLng(bloque_activo.latitud, bloque_activo.longitud);
      circulo_geocerca_ref.current.setCenter(centro);
      circulo_geocerca_ref.current.setRadius(radio_tolerancia_m);
      instancia_mapa_ref.current.panTo(centro);
    } catch (e) {
      console.warn("[VisorGoogleMapsGeocerca] Error al recentrar geocerca:", e);
    }
  }, [bloque_activo, radio_tolerancia_m, modo_radar]);

  // Actualizar posición y color del marcador del becario
  useEffect(() => {
    if (
      !marcador_becario_ref.current ||
      modo_radar ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    try {
      const pos = new window.google.maps.LatLng(becario_lat, becario_lng);
      marcador_becario_ref.current.setPosition(pos);
      marcador_becario_ref.current.setIcon({
        path: window.google.maps.SymbolPath?.CIRCLE ?? 0,
        scale: 9,
        fillColor: becario_en_rango ? "#10B981" : "#EF4444",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2.5,
      });
    } catch (e) {
      console.warn("[VisorGoogleMapsGeocerca] Error al actualizar becario:", e);
    }
  }, [becario_lat, becario_lng, becario_en_rango, modo_radar]);

  // Alternar tipo de mapa (Roadmap / Hybrid)
  const alternarTipoMapa = (tipo: "roadmap" | "hybrid") => {
    set_tipo_mapa(tipo);
    if (instancia_mapa_ref.current) {
      instancia_mapa_ref.current.setMapTypeId(tipo);
    }
  };

  // Recentrar vista en el bloque activo
  const recentrarEnBloque = () => {
    if (instancia_mapa_ref.current && typeof window !== "undefined" && window.google?.maps) {
      const centro = new window.google.maps.LatLng(bloque_activo.latitud, bloque_activo.longitud);
      instancia_mapa_ref.current.panTo(centro);
      instancia_mapa_ref.current.setZoom(17);
    }
  };

  // Simular movimiento del becario adentro / afuera
  const simularAlternarRango = () => {
    if (becario_en_rango) {
      // Mover afuera de la geocerca (+140m)
      set_offset_becario({ d_lat: 0.0011, d_lng: 0.0012 });
    } else {
      // Mover adentro de la geocerca (+35m)
      set_offset_becario({ d_lat: 0.00028, d_lng: 0.00032 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm bg-slate-900 flex flex-col min-h-[360px]">
      {/* Barra superior de controles del visor geodésico */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <Badge
            variant="outline"
            className="text-[11px] font-bold border-[#035683] text-[#035683] flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>{bloque_activo.nombre}</span>
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">
            {bloque_activo.latitud.toFixed(5)}, {bloque_activo.longitud.toFixed(5)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Alternador Roadmap / Satélite */}
          {!modo_radar && esta_cargado && (
            <div className="flex items-center p-0.5 bg-white/95 backdrop-blur-sm rounded-xl border border-[#E5E7EB] shadow-xs">
              <Button
                type="button"
                size="sm"
                variant={tipo_mapa === "roadmap" ? "default" : "ghost"}
                onClick={() => alternarTipoMapa("roadmap")}
                className={`h-7 px-2.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${
                  tipo_mapa === "roadmap" ? "bg-[#035683] text-white" : "text-[#035683]"
                }`}
                title="Vista de calles y avenidas"
              >
                <MapIcon className="w-3 h-3" />
                <span>Calles</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipo_mapa === "hybrid" ? "default" : "ghost"}
                onClick={() => alternarTipoMapa("hybrid")}
                className={`h-7 px-2.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${
                  tipo_mapa === "hybrid" ? "bg-[#035683] text-white" : "text-[#035683]"
                }`}
                title="Vista satelital híbrida"
              >
                <Satellite className="w-3 h-3" />
                <span>Satélite</span>
              </Button>
            </div>
          )}

          {/* Botón recentrar */}
          {!modo_radar && esta_cargado && (
            <Button
              type="button"
              size="sm"
              onClick={recentrarEnBloque}
              className="h-8 w-8 p-0 bg-white/95 hover:bg-slate-100 text-[#035683] rounded-xl border border-[#E5E7EB] shadow-xs pointer-events-auto"
              title="Recentrar en Bloque Activo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Botón alternar Radar / Google Maps */}
          <Button
            type="button"
            size="sm"
            onClick={() => set_modo_radar(!modo_radar)}
            className="h-8 px-2.5 bg-white/95 hover:bg-slate-100 text-[#035683] rounded-xl border border-[#E5E7EB] shadow-xs text-[11px] font-bold flex items-center gap-1 pointer-events-auto"
            title="Alternar entre Google Maps y visualizador Radar"
          >
            <Radio className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>{modo_radar ? "Ver Google Maps" : "Ver Radar"}</span>
          </Button>
        </div>
      </div>

      {/* VISTA 1: RADAR CLÁSICO (Si el usuario lo selecciona o en modo offline) */}
      {modo_radar ? (
        <div className="relative w-full h-80 bg-slate-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#00ABBD_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <div
            className="absolute rounded-full border-2 border-[#00ABBD] bg-[#00ABBD]/15 transition-all duration-300 animate-pulse"
            style={{
              width: `${Math.min(radio_tolerancia_m * 2.2, 250)}px`,
              height: `${Math.min(radio_tolerancia_m * 2.2, 250)}px`,
            }}
          />
          <div
            className="absolute rounded-full border border-dashed border-[#FFB600]/60"
            style={{
              width: `${Math.min(radio_tolerancia_m * 1.4, 160)}px`,
              height: `${Math.min(radio_tolerancia_m * 1.4, 160)}px`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#035683] border-2 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin className="w-5 h-5 text-[#FFB600]" />
            </div>
            <span className="mt-1 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded backdrop-blur-sm">
              {bloque_activo.nombre}: {bloque_activo.latitud.toFixed(6)}, {bloque_activo.longitud.toFixed(6)}
            </span>
          </div>
          <div className="absolute top-14 right-6 flex items-center gap-1 z-10">
            <div className={`w-3 h-3 rounded-full ${becario_en_rango ? "bg-emerald-400 ring-4 ring-emerald-400/30" : "bg-rose-500 ring-4 ring-rose-500/30"}`} />
            <span className="text-[10px] font-mono text-emerald-300 bg-black/70 px-2 py-0.5 rounded border border-white/10">
              GPS Becario ({distancia_al_bloque_m}m · {becario_en_rango ? "En rango" : "Fuera de geocerca"})
            </span>
          </div>
        </div>
      ) : (
        /* VISTA 2: GOOGLE MAPS API OFICIAL */
        <div className="relative w-full h-80 flex-1">
          {cargando && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-2">
              <Compass className="w-8 h-8 text-[#00ABBD] animate-spin" />
              <p className="font-semibold text-sm">Inicializando Google Maps API...</p>
              <span className="text-xs text-white/70">Cargando geocerca satelital de {sede.nombre}</span>
            </div>
          )}

          {error_carga && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center text-white gap-3">
              <AlertTriangle className="w-8 h-8 text-[#FFB600]" />
              <p className="font-bold text-sm">Aviso de Conexión de Google Maps</p>
              <p className="text-xs text-white/80 max-w-md">
                {error_carga}. Puede alternar a la "Vista Radar" en la esquina superior o configurar su clave de API de Google Maps.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  onClick={() => set_modo_radar(true)}
                  className="h-8 px-3 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold text-xs rounded-xl"
                >
                  <Radio className="w-3.5 h-3.5 mr-1" />
                  Activar Vista Radar
                </Button>
                {alAbrirAjusteClave && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={alAbrirAjusteClave}
                    className="h-8 px-3 border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1" />
                    Configurar API Key
                  </Button>
                )}
              </div>
            </div>
          )}

          <div ref={contenedor_mapa_ref} className="w-full h-full min-h-[320px]" />
        </div>
      )}

      {/* Barra de estado inferior geodésica */}
      <div className="p-3 bg-white border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {becario_en_rango ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Becario en Rango Biométrico ({distancia_al_bloque_m}m &le; {radio_tolerancia_m}m)</span>
            </Badge>
          ) : (
            <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Becario Fuera de Geocerca ({distancia_al_bloque_m}m &gt; {radio_tolerancia_m}m)</span>
            </Badge>
          )}

          <span className="hidden md:inline text-muted-foreground text-[11px]">
            Cálculo geodésico Haversine en tiempo real
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={simularAlternarRango}
            className="h-7 px-2.5 text-[11px] border-[#E5E7EB] hover:border-[#00ABBD] text-[#035683] rounded-lg font-medium flex items-center gap-1"
            title="Simular desplazamiento del estudiante dentro o fuera del radio"
          >
            <Sparkles className="w-3 h-3 text-[#00ABBD]" />
            <span>Simular {becario_en_rango ? "Salida" : "Entrada"}</span>
          </Button>

          {alAbrirAjusteClave && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={alAbrirAjusteClave}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-[#035683] rounded-lg flex items-center gap-1"
              title="Ajustes de Google Maps API"
            >
              <KeyRound className="w-3 h-3" />
              <span className="hidden sm:inline">API Key</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
