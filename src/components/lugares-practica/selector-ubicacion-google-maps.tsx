"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { SelectorUbicacionLeaflet } from "./selector-ubicacion-leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Compass, Crosshair, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PropsSelectorUbicacion {
  latitud: number;
  longitud: number;
  radio_tolerancia_m: number;
  alCambiarUbicacion: (lat: number, lng: number) => void;
}

const PRESETS_GEOGRAFICOS = [
  { nombre: "El Alto Central", lat: -16.500053, lng: -68.173455 },
  { nombre: "Ceja El Alto", lat: -16.50231, lng: -68.16892 },
  { nombre: "La Paz Centro", lat: -16.49652, lng: -68.13421 },
  { nombre: "Villa Adela", lat: -16.52512, lng: -68.18954 },
];

export function SelectorUbicacionGoogleMaps({
  latitud,
  longitud,
  radio_tolerancia_m,
  alCambiarUbicacion,
}: PropsSelectorUbicacion) {
  const { esta_cargado, cargando, error_carga, fallo_autenticacion, tiene_clave_valida } = useGoogleMaps();
  const contenedor_mapa_ref = useRef<HTMLDivElement | null>(null);

  const instancia_mapa_ref = useRef<google.maps.Map | null>(null);
  const marcador_ref = useRef<google.maps.Marker | null>(null);
  const circulo_ref = useRef<google.maps.Circle | null>(null);

  const [obteniendo_gps, set_obteniendo_gps] = useState(false);

  // Si no hay una clave API válida configurada o falló, usar el selector libre sin popups ni marcas de agua
  if (!tiene_clave_valida || fallo_autenticacion || Boolean(error_carga)) {
    return (
      <SelectorUbicacionLeaflet
        latitud={latitud}
        longitud={longitud}
        radio_tolerancia_m={radio_tolerancia_m}
        alCambiarUbicacion={alCambiarUbicacion}
      />
    );
  }

  // Inicializar Google Maps cuando el SDK esté disponible
  useEffect(() => {
    if (
      !esta_cargado ||
      !contenedor_mapa_ref.current ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    try {
      const centro_inicial = {
        lat: !isNaN(latitud) && latitud !== 0 ? latitud : -16.500053,
        lng: !isNaN(longitud) && longitud !== 0 ? longitud : -68.173455,
      };

      if (!instancia_mapa_ref.current) {
        const opciones: google.maps.MapOptions = {
          center: centro_inicial,
          zoom: 16,
          mapTypeId: "roadmap",
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        };

        const mapa = new window.google.maps.Map(contenedor_mapa_ref.current, opciones);
        instancia_mapa_ref.current = mapa;

        // Marcador arrastrable para fijar la sede
        const marcador = new window.google.maps.Marker({
          position: centro_inicial,
          map: mapa,
          draggable: true,
          animation: window.google.maps.Animation?.DROP,
          title: "Ubicación Geodésica de la Sede",
        });
        marcador_ref.current = marcador;

        // Círculo de tolerancia de geocerca
        const circulo = new window.google.maps.Circle({
          map: mapa,
          center: centro_inicial,
          radius: radio_tolerancia_m > 0 ? radio_tolerancia_m : 80,
          fillColor: "#00ABBD",
          fillOpacity: 0.22,
          strokeColor: "#035683",
          strokeOpacity: 0.85,
          strokeWeight: 2,
        });
        circulo_ref.current = circulo;

        // Evento de arrastre del marcador
        marcador.addListener("dragend", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const nueva_lat = parseFloat(e.latLng.lat().toFixed(6));
            const nueva_lng = parseFloat(e.latLng.lng().toFixed(6));
            circulo.setCenter(e.latLng);
            alCambiarUbicacion(nueva_lat, nueva_lng);
          }
        });

        // Evento de clic en el mapa para reposicionar
        mapa.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const nueva_lat = parseFloat(e.latLng.lat().toFixed(6));
            const nueva_lng = parseFloat(e.latLng.lng().toFixed(6));
            marcador.setPosition(e.latLng);
            circulo.setCenter(e.latLng);
            mapa.panTo(e.latLng);
            alCambiarUbicacion(nueva_lat, nueva_lng);
          }
        });
      }
    } catch (e) {
      console.warn("[SelectorUbicacionGoogleMaps] Error al instanciar Google Maps:", e);
    }
  }, [esta_cargado]);

  // Actualizar la posición cuando las coordenadas cambian externamente
  useEffect(() => {
    if (
      !instancia_mapa_ref.current ||
      !marcador_ref.current ||
      !circulo_ref.current ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }
    if (isNaN(latitud) || isNaN(longitud)) return;

    try {
      const nueva_pos = new window.google.maps.LatLng(latitud, longitud);
      marcador_ref.current.setPosition(nueva_pos);
      circulo_ref.current.setCenter(nueva_pos);
      instancia_mapa_ref.current.panTo(nueva_pos);
    } catch (e) {
      console.warn("[SelectorUbicacionGoogleMaps] Error al reposicionar:", e);
    }
  }, [latitud, longitud]);

  // Actualizar el radio cuando cambia el input numérico
  useEffect(() => {
    if (!circulo_ref.current) return;
    const radio_seguro = radio_tolerancia_m > 0 ? radio_tolerancia_m : 80;
    circulo_ref.current.setRadius(radio_seguro);
  }, [radio_tolerancia_m]);

  // Obtener ubicación GPS real del navegador
  const manejarObtenerUbicacionActual = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("La geolocalización no está soportada por su navegador.");
      return;
    }

    set_obteniendo_gps(true);
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        set_obteniendo_gps(false);
        const lat = parseFloat(posicion.coords.latitude.toFixed(6));
        const lng = parseFloat(posicion.coords.longitude.toFixed(6));
        alCambiarUbicacion(lat, lng);
        toast.success(`Ubicación GPS capturada con precisión de ±${Math.round(posicion.coords.accuracy)}m.`);
      },
      (error) => {
        set_obteniendo_gps(false);
        toast.error(`Error al obtener GPS: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [alCambiarUbicacion]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#035683] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#00ABBD]" />
          Ubicación Geodésica en Google Maps
        </span>
        <Badge variant="outline" className="text-[10px] text-muted-foreground border-[#E5E7EB]">
          Arrastra el marcador o haz clic
        </Badge>
      </div>

      {/* Contenedor del Mapa Interactivo */}
      <div className="relative w-full h-52 rounded-xl border border-[#E5E7EB] overflow-hidden bg-slate-100 shadow-2xs">
        {cargando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 text-xs text-[#035683] gap-2">
            <Compass className="w-6 h-6 text-[#00ABBD] animate-spin" />
            <span className="font-semibold">Cargando Google Maps API...</span>
          </div>
        )}

        {error_carga && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-amber-50/95 p-4 text-center text-xs text-amber-900 gap-1.5">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <p className="font-bold">Google Maps en modo fuera de línea</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {error_carga}. Puede continuar ingresando las coordenadas manualmente en los campos inferiores.
            </p>
          </div>
        )}

        <div ref={contenedor_mapa_ref} className="w-full h-full" />

        {/* Coordenadas superpuestas en el pie del mapa */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E5E7EB] text-[11px] font-mono text-[#035683] shadow-xs flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-[#00ABBD]" />
          <span>
            {latitud.toFixed(6)}, {longitud.toFixed(6)} · Geocerca: {radio_tolerancia_m}m
          </span>
        </div>
      </div>

      {/* Presets rápidos y botón de GPS actual */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-muted-foreground mr-1">Preajustes:</span>
        {PRESETS_GEOGRAFICOS.map((pre) => (
          <Button
            key={pre.nombre}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alCambiarUbicacion(pre.lat, pre.lng)}
            className="h-6 px-2 text-[10px] border-[#E5E7EB] hover:border-[#00ABBD] hover:bg-[#00ABBD]/10 rounded-md font-medium text-[#035683]"
          >
            {pre.nombre}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={obteniendo_gps}
          onClick={manejarObtenerUbicacionActual}
          className="h-6 px-2 text-[10px] border-[#00ABBD] bg-[#00ABBD]/10 text-[#035683] hover:bg-[#00ABBD]/20 rounded-md font-medium flex items-center gap-1 ml-auto"
        >
          <Navigation className={`w-3 h-3 ${obteniendo_gps ? "animate-spin" : ""}`} />
          <span>{obteniendo_gps ? "Localizando..." : "Mi GPS Actual"}</span>
        </Button>
      </div>
    </div>
  );
}
