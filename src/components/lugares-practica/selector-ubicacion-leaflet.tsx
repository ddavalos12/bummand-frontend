"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Compass, Crosshair } from "lucide-react";
import { toast } from "sonner";

interface PropsSelectorUbicacionLeaflet {
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

export function SelectorUbicacionLeaflet({
  latitud,
  longitud,
  radio_tolerancia_m,
  alCambiarUbicacion,
}: PropsSelectorUbicacionLeaflet) {
  const contenedor_ref = useRef<HTMLDivElement | null>(null);
  const mapa_ref = useRef<any>(null);
  const marcador_ref = useRef<any>(null);
  const circulo_ref = useRef<any>(null);
  const leaflet_ref = useRef<any>(null);

  const [obteniendo_gps, set_obteniendo_gps] = useState(false);
  const [cargando, set_cargando] = useState(true);

  // Inicializar Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !contenedor_ref.current) return;

    let cancelado = false;

    import("leaflet").then((L) => {
      if (cancelado || !contenedor_ref.current) return;
      leaflet_ref.current = L;

      const centro: [number, number] = [
        !isNaN(latitud) && latitud !== 0 ? latitud : -16.500053,
        !isNaN(longitud) && longitud !== 0 ? longitud : -68.173455,
      ];

      if (!mapa_ref.current) {
        const mapa = L.map(contenedor_ref.current, {
          center: centro,
          zoom: 16,
          zoomControl: true,
          attributionControl: false,
        });
        mapa_ref.current = mapa;

        // Capa de calles estándar OpenStreetMap (sin marcas de agua)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapa);

        // Marcador arrastrable personalizado
        const icono_marcador = L.divIcon({
          className: "custom-pin-selector",
          html: `
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50% 50% 50% 0;
              background: #063A6B;
              transform: rotate(-45deg);
              border: 2px solid #FFFFFF;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #17B4C4;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        const marcador = L.marker(centro, {
          draggable: true,
          icon: icono_marcador,
        }).addTo(mapa);
        marcador_ref.current = marcador;

        // Círculo de geocerca
        const circulo = L.circle(centro, {
          radius: radio_tolerancia_m > 0 ? radio_tolerancia_m : 80,
          color: "#063A6B",
          weight: 2,
          fillColor: "#17B4C4",
          fillOpacity: 0.25,
        }).addTo(mapa);
        circulo_ref.current = circulo;

        // Evento arrastre
        marcador.on("dragend", () => {
          const pos = marcador.getLatLng();
          const nueva_lat = parseFloat(pos.lat.toFixed(6));
          const nueva_lng = parseFloat(pos.lng.toFixed(6));
          circulo.setLatLng(pos);
          alCambiarUbicacion(nueva_lat, nueva_lng);
        });

        // Evento clic en el mapa
        mapa.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          const nueva_lat = parseFloat(lat.toFixed(6));
          const nueva_lng = parseFloat(lng.toFixed(6));
          marcador.setLatLng([nueva_lat, nueva_lng]);
          circulo.setLatLng([nueva_lat, nueva_lng]);
          mapa.panTo([nueva_lat, nueva_lng]);
          alCambiarUbicacion(nueva_lat, nueva_lng);
        });

        set_cargando(false);
      }
    });

    return () => {
      cancelado = true;
    };
  }, []);

  // Actualizar marcador y círculo cuando cambian latitud / longitud externamente
  useEffect(() => {
    const mapa = mapa_ref.current;
    const marcador = marcador_ref.current;
    const circulo = circulo_ref.current;
    if (!mapa || !marcador || !circulo) return;
    if (isNaN(latitud) || isNaN(longitud)) return;

    marcador.setLatLng([latitud, longitud]);
    circulo.setLatLng([latitud, longitud]);
    mapa.panTo([latitud, longitud]);
  }, [latitud, longitud]);

  // Actualizar radio
  useEffect(() => {
    const circulo = circulo_ref.current;
    if (!circulo) return;
    circulo.setRadius(radio_tolerancia_m > 0 ? radio_tolerancia_m : 80);
  }, [radio_tolerancia_m]);

  // Captura de GPS del navegador
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
        <span className="font-semibold text-[#063A6B] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#17B4C4]" />
          Ubicación Geodésica de la Sede
        </span>
        <Badge variant="outline" className="text-[10px] text-muted-foreground border-[#E3DCCB]">
          Arrastra el marcador o haz clic
        </Badge>
      </div>

      <div className="relative w-full h-52 rounded-xl border border-[#E3DCCB] overflow-hidden bg-slate-100 shadow-2xs">
        {cargando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 text-xs text-[#063A6B] gap-2">
            <Compass className="w-6 h-6 text-[#17B4C4] animate-spin" />
            <span className="font-semibold">Cargando mapa interactivo...</span>
          </div>
        )}

        <div ref={contenedor_ref} className="w-full h-full z-0" />

        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E3DCCB] text-[11px] font-mono text-[#063A6B] shadow-xs flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-[#17B4C4]" />
          <span>
            {latitud.toFixed(6)}, {longitud.toFixed(6)} · Geocerca: {radio_tolerancia_m}m
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-muted-foreground mr-1">Preajustes:</span>
        {PRESETS_GEOGRAFICOS.map((pre) => (
          <Button
            key={pre.nombre}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => alCambiarUbicacion(pre.lat, pre.lng)}
            className="h-6 px-2 text-[10px] border-[#E3DCCB] hover:border-[#17B4C4] hover:bg-[#17B4C4]/10 rounded-md font-medium text-[#063A6B]"
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
          className="h-6 px-2 text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md font-medium flex items-center gap-1 ml-auto"
        >
          <Navigation className={`w-3 h-3 ${obteniendo_gps ? "animate-spin" : ""}`} />
          <span>{obteniendo_gps ? "Localizando..." : "Mi GPS Actual"}</span>
        </Button>
      </div>
    </div>
  );
}
