"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BloqueSede, SedePractica } from "./mapa-lugares-practica";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  MapPin,
  Satellite,
  Map as MapIcon,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  KeyRound,
  Radio,
} from "lucide-react";

interface PropsVisorLeaflet {
  sede: SedePractica;
  bloque_activo: BloqueSede;
  radio_tolerancia_m: number;
  alSeleccionarBloque: (bloque: BloqueSede) => void;
  alAbrirAjusteClave?: () => void;
  alAlternarGoogleMaps?: () => void;
}

function calcularDistanciaHaversineMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const d_lat = (lat2 - lat1) * rad;
  const d_lon = (lon2 - lon1) * rad;
  const a =
    Math.sin(d_lat / 2) * Math.sin(d_lat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(d_lon / 2) * Math.sin(d_lon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function VisorLeafletGeocerca({
  sede,
  bloque_activo,
  radio_tolerancia_m,
  alSeleccionarBloque,
  alAbrirAjusteClave,
  alAlternarGoogleMaps,
}: PropsVisorLeaflet) {
  const contenedor_ref = useRef<HTMLDivElement | null>(null);
  const mapa_ref = useRef<any>(null);
  const capa_azulejos_ref = useRef<any>(null);
  const marcadores_ref = useRef<any[]>([]);
  const circulo_ref = useRef<any>(null);
  const marcador_becario_ref = useRef<any>(null);
  const leaflet_modulo_ref = useRef<any>(null);

  const [tipo_mapa, set_tipo_mapa] = useState<"calles" | "satelite">("calles");
  const [modo_radar, set_modo_radar] = useState<boolean>(false);
  const [cargando_libreria, set_cargando_libreria] = useState(true);

  // Simulación del becario (+35m dentro o +140m fuera)
  const [offset_becario, set_offset_becario] = useState<{ d_lat: number; d_lng: number }>({
    d_lat: 0.00028,
    d_lng: 0.00032,
  });

  const becario_lat = bloque_activo.latitud + offset_becario.d_lat;
  const becario_lng = bloque_activo.longitud + offset_becario.d_lng;

  const distancia_m = calcularDistanciaHaversineMetros(
    bloque_activo.latitud,
    bloque_activo.longitud,
    becario_lat,
    becario_lng
  );
  const becario_en_rango = distancia_m <= radio_tolerancia_m;

  // Carga e inicialización de Leaflet
  useEffect(() => {
    if (typeof window === "undefined" || !contenedor_ref.current || modo_radar) return;

    let cancelado = false;

    import("leaflet").then((L) => {
      if (cancelado || !contenedor_ref.current) return;
      leaflet_modulo_ref.current = L;

      if (!mapa_ref.current) {
        const mapa = L.map(contenedor_ref.current, {
          center: [bloque_activo.latitud, bloque_activo.longitud],
          zoom: 17,
          zoomControl: true,
          attributionControl: false,
        });
        mapa_ref.current = mapa;

        // Capa de calles por defecto (OpenStreetMap estándar limpio y sin marcas de agua)
        const capa = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapa);
        capa_azulejos_ref.current = capa;

        // Círculo de geocerca
        const circulo = L.circle([bloque_activo.latitud, bloque_activo.longitud], {
          radius: radio_tolerancia_m,
          color: "#063A6B",
          weight: 2,
          fillColor: "#17B4C4",
          fillOpacity: 0.25,
        }).addTo(mapa);
        circulo_ref.current = circulo;

        // Marcador del becario
        const icono_becario = L.divIcon({
          className: "custom-becario-pin",
          html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: #10B981; border: 2.5px solid #FFFFFF; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marcador_becario = L.marker([becario_lat, becario_lng], {
          icon: icono_becario,
        }).addTo(mapa);
        marcador_becario_ref.current = marcador_becario;

        set_cargando_libreria(false);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [modo_radar]);

  // Actualizar marcadores de bloques de la sede
  useEffect(() => {
    const L = leaflet_modulo_ref.current;
    const mapa = mapa_ref.current;
    if (!L || !mapa || modo_radar) return;

    marcadores_ref.current.forEach((m) => m.remove());
    marcadores_ref.current = [];

    sede.bloques.forEach((bloque) => {
      const es_activo = bloque.id === bloque_activo.id;
      const letra = bloque.nombre.includes("Bloque A") ? "A" : "B";
      const color_fondo = es_activo ? "#063A6B" : "#17B4C4";

      const icono_bloque = L.divIcon({
        className: "custom-bloque-pin",
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${color_fondo};
            color: #FFFFFF;
            font-weight: bold;
            font-size: 13px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            ${letra}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marcador = L.marker([bloque.latitud, bloque.longitud], {
        icon: icono_bloque,
        zIndexOffset: es_activo ? 1000 : 500,
      }).addTo(mapa);

      marcador.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1E293B;">
          <strong style="color: #063A6B; font-size: 13px; display: block;">${bloque.nombre}</strong>
          <span style="color: #64748B; font-size: 11px;">${sede.nombre}</span>
          <p style="margin: 4px 0; font-size: 11px;">${bloque.descripcion || "Bloque institucional"}</p>
          <code style="font-size: 10px; background: #F1F5F9; padding: 2px 4px; border-radius: 4px;">
            ${bloque.latitud.toFixed(6)}, ${bloque.longitud.toFixed(6)}
          </code>
        </div>
      `);

      marcador.on("click", () => {
        alSeleccionarBloque(bloque);
      });

      marcadores_ref.current.push(marcador);
    });
  }, [sede, bloque_activo, modo_radar, alSeleccionarBloque]);

  // Actualizar centro y radio del círculo geodésico
  useEffect(() => {
    const mapa = mapa_ref.current;
    const circulo = circulo_ref.current;
    if (!mapa || !circulo || modo_radar) return;

    circulo.setLatLng([bloque_activo.latitud, bloque_activo.longitud]);
    circulo.setRadius(radio_tolerancia_m);
    mapa.panTo([bloque_activo.latitud, bloque_activo.longitud]);
  }, [bloque_activo, radio_tolerancia_m, modo_radar]);

  // Actualizar marcador del becario
  useEffect(() => {
    const marcador = marcador_becario_ref.current;
    const L = leaflet_modulo_ref.current;
    if (!marcador || !L || modo_radar) return;

    marcador.setLatLng([becario_lat, becario_lng]);

    const color = becario_en_rango ? "#10B981" : "#EF4444";
    const nuevo_icono = L.divIcon({
      className: "custom-becario-pin",
      html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2.5px solid #FFFFFF; box-shadow: 0 0 8px ${color};"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    marcador.setIcon(nuevo_icono);
  }, [becario_lat, becario_lng, becario_en_rango, modo_radar]);

  // Alternar entre Calles y Satélite de alta definición
  const alternarTipoMapa = (tipo: "calles" | "satelite") => {
    set_tipo_mapa(tipo);
    const L = leaflet_modulo_ref.current;
    const mapa = mapa_ref.current;
    if (!L || !mapa) return;

    if (capa_azulejos_ref.current) {
      mapa.removeLayer(capa_azulejos_ref.current);
    }

    if (tipo === "satelite") {
      // Satélite Esri World Imagery (alta resolución)
      const capa_satelite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      ).addTo(mapa);
      capa_azulejos_ref.current = capa_satelite;
    } else {
      // Calles estándar OpenStreetMap (sin marcas de agua)
      const capa_calles = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19 }
      ).addTo(mapa);
      capa_azulejos_ref.current = capa_calles;
    }
  };

  const recentrar = () => {
    if (mapa_ref.current) {
      mapa_ref.current.setView([bloque_activo.latitud, bloque_activo.longitud], 17);
    }
  };

  const simularAlternarRango = () => {
    if (becario_en_rango) {
      set_offset_becario({ d_lat: 0.0011, d_lng: 0.0012 });
    } else {
      set_offset_becario({ d_lat: 0.00028, d_lng: 0.00032 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E3DCCB] shadow-sm bg-slate-900 flex flex-col min-h-[360px]">
      {/* Controles superiores */}
      <div className="absolute top-3 left-3 right-3 z-50 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-[#E3DCCB] shadow-xs">
          <Badge
            variant="outline"
            className="text-[11px] font-bold border-[#063A6B] text-[#063A6B] flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>{bloque_activo.nombre}</span>
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">
            {bloque_activo.latitud.toFixed(5)}, {bloque_activo.longitud.toFixed(5)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {!modo_radar && (
            <div className="flex items-center p-0.5 bg-white/95 backdrop-blur-sm rounded-xl border border-[#E3DCCB] shadow-xs">
              <Button
                type="button"
                size="sm"
                variant={tipo_mapa === "calles" ? "default" : "ghost"}
                onClick={() => alternarTipoMapa("calles")}
                className={`h-7 px-2.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${
                  tipo_mapa === "calles" ? "bg-[#063A6B] text-white" : "text-[#063A6B]"
                }`}
                title="Vista de calles y avenidas"
              >
                <MapIcon className="w-3 h-3" />
                <span>Calles</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tipo_mapa === "satelite" ? "default" : "ghost"}
                onClick={() => alternarTipoMapa("satelite")}
                className={`h-7 px-2.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${
                  tipo_mapa === "satelite" ? "bg-[#063A6B] text-white" : "text-[#063A6B]"
                }`}
                title="Vista satelital de alta resolución"
              >
                <Satellite className="w-3 h-3" />
                <span>Satélite</span>
              </Button>
            </div>
          )}

          {!modo_radar && (
            <Button
              type="button"
              size="sm"
              onClick={recentrar}
              className="h-8 w-8 p-0 bg-white/95 hover:bg-slate-100 text-[#063A6B] rounded-xl border border-[#E3DCCB] shadow-xs pointer-events-auto"
              title="Recentrar en Bloque Activo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => set_modo_radar(!modo_radar)}
            className="h-8 px-2.5 bg-white/95 hover:bg-slate-100 text-[#063A6B] rounded-xl border border-[#E3DCCB] shadow-xs text-[11px] font-bold flex items-center gap-1 pointer-events-auto"
            title="Alternar entre mapa y radar"
          >
            <Radio className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>{modo_radar ? "Ver Mapa" : "Ver Radar"}</span>
          </Button>
        </div>
      </div>

      {modo_radar ? (
        <div className="relative w-full h-80 bg-slate-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#17B4C4_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          <div
            className="absolute rounded-full border-2 border-[#17B4C4] bg-[#17B4C4]/15 transition-all duration-300 animate-pulse"
            style={{
              width: `${Math.min(radio_tolerancia_m * 2.2, 250)}px`,
              height: `${Math.min(radio_tolerancia_m * 2.2, 250)}px`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#063A6B] border-2 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin className="w-5 h-5 text-[#F8C766]" />
            </div>
            <span className="mt-1 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded backdrop-blur-sm">
              {bloque_activo.nombre}: {bloque_activo.latitud.toFixed(6)}, {bloque_activo.longitud.toFixed(6)}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-80 flex-1">
          {cargando_libreria && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-2">
              <Compass className="w-8 h-8 text-[#17B4C4] animate-spin" />
              <p className="font-semibold text-sm">Cargando mapa interactivo...</p>
            </div>
          )}
          <div ref={contenedor_ref} className="w-full h-full min-h-[320px] z-0" />
        </div>
      )}

      {/* Pie de estado geodésico */}
      <div className="p-3 bg-white border-t border-[#E3DCCB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs z-10">
        <div className="flex items-center gap-2">
          {becario_en_rango ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Becario en Rango Biométrico ({distancia_m}m &le; {radio_tolerancia_m}m)</span>
            </Badge>
          ) : (
            <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Becario Fuera de Geocerca ({distancia_m}m &gt; {radio_tolerancia_m}m)</span>
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
            className="h-7 px-2.5 text-[11px] border-[#E3DCCB] hover:border-[#17B4C4] text-[#063A6B] rounded-lg font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#17B4C4]" />
            <span>Simular {becario_en_rango ? "Salida" : "Entrada"}</span>
          </Button>

          {alAbrirAjusteClave && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={alAbrirAjusteClave}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-[#063A6B] rounded-lg flex items-center gap-1"
              title="Configurar Google Maps API Key"
            >
              <KeyRound className="w-3 h-3 text-[#17B4C4]" />
              <span className="hidden sm:inline">Google Maps API</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
