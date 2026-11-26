"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type * as LeafletTipo from "leaflet";
import { PuntoGpsPrueba } from "@/servicios/recorridos-gps-prueba.servicio";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Map as MapIcon,
  Satellite,
  Route,
  Maximize2,
} from "lucide-react";
import {
  calcularTramosRecorrido,
  escaparHtml,
  formatearDistanciaMetros,
  formatearDuracionSegundos,
  formatearHoraCorta,
  obtenerVelocidadPuntoKmh,
} from "./utilidades-gps-prueba";

interface PropiedadesMapaRecorridoLeaflet {
  puntos: PuntoGpsPrueba[];
  tramo_seleccionado_indice: number | null;
  punto_seleccionado_secuencia: number | null;
  alSeleccionarTramo: (indice: number | null) => void;
  alSeleccionarPunto: (secuencia: number | null) => void;
}

const CENTRO_POR_DEFECTO: [number, number] = [-16.5, -68.15];

export function MapaRecorridoLeaflet({
  puntos,
  tramo_seleccionado_indice,
  punto_seleccionado_secuencia,
  alSeleccionarTramo,
  alSeleccionarPunto,
}: PropiedadesMapaRecorridoLeaflet) {
  const contenedor_ref = useRef<HTMLDivElement | null>(null);
  const leaflet_ref = useRef<typeof LeafletTipo | null>(null);
  const mapa_ref = useRef<LeafletTipo.Map | null>(null);
  const capa_azulejos_ref = useRef<LeafletTipo.TileLayer | null>(null);
  const capa_tramos_ref = useRef<LeafletTipo.LayerGroup | null>(null);
  const capa_marcadores_ref = useRef<LeafletTipo.LayerGroup | null>(null);
  const marcadores_por_secuencia_ref = useRef<Map<number, LeafletTipo.Marker>>(new Map());
  const clave_ajuste_inicial_ref = useRef<string>("");

  const [tipo_mapa, set_tipo_mapa] = useState<"calles" | "satelite">("calles");
  const [mostrar_linea, set_mostrar_linea] = useState<boolean>(true);
  const [cargando_libreria, set_cargando_libreria] = useState<boolean>(true);

  const ajustarRecorrido = useCallback(() => {
    const L = leaflet_ref.current;
    const mapa = mapa_ref.current;
    if (!L || !mapa || puntos.length === 0) return;

    if (puntos.length === 1) {
      mapa.flyTo([puntos[0].latitud, puntos[0].longitud], 17, { duration: 0.5 });
      return;
    }

    const limites = L.latLngBounds(
      puntos.map((p) => [p.latitud, p.longitud] as [number, number])
    );
    mapa.fitBounds(limites, { padding: [44, 44], maxZoom: 18 });
  }, [puntos]);

  useEffect(() => {
    if (typeof window === "undefined" || !contenedor_ref.current) return;
    let cancelado = false;

    import("leaflet").then((modulo_leaflet) => {
      if (cancelado || !contenedor_ref.current) return;
      const L = (modulo_leaflet.default || modulo_leaflet) as typeof LeafletTipo;
      leaflet_ref.current = L;

      if (!mapa_ref.current) {
        const centro_inicial: [number, number] =
          puntos.length > 0
            ? [puntos[0].latitud, puntos[0].longitud]
            : CENTRO_POR_DEFECTO;

        const mapa = L.map(contenedor_ref.current, {
          center: centro_inicial,
          zoom: 16,
          zoomControl: true,
          attributionControl: false,
        });

        const capa_calles = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { maxZoom: 19 }
        ).addTo(mapa);

        capa_azulejos_ref.current = capa_calles;
        capa_tramos_ref.current = L.layerGroup().addTo(mapa);
        capa_marcadores_ref.current = L.layerGroup().addTo(mapa);
        mapa_ref.current = mapa;
        set_cargando_libreria(false);
      }
    });

    return () => {
      cancelado = true;
      if (mapa_ref.current) {
        mapa_ref.current.remove();
        mapa_ref.current = null;
        capa_azulejos_ref.current = null;
        capa_tramos_ref.current = null;
        capa_marcadores_ref.current = null;
        marcadores_por_secuencia_ref.current.clear();
      }
    };
  }, []);

  useEffect(() => {
    const L = leaflet_ref.current;
    const mapa = mapa_ref.current;
    const capa_tramos = capa_tramos_ref.current;
    const capa_marcadores = capa_marcadores_ref.current;
    if (!L || !mapa || !capa_tramos || !capa_marcadores || cargando_libreria) return;

    capa_tramos.clearLayers();
    capa_marcadores.clearLayers();
    marcadores_por_secuencia_ref.current.clear();

    if (puntos.length === 0) return;

    if (mostrar_linea && puntos.length >= 2) {
      const tramos = calcularTramosRecorrido(puntos);
      tramos.forEach((tramo) => {
        const esta_seleccionado = tramo_seleccionado_indice === tramo.indice;
        const color_base = tramo.indice % 2 === 0 ? "#007BBE" : "#00ABBD";
        const color_tramo = esta_seleccionado
          ? "#FFB600"
          : tramo.es_velocidad_anomala
          ? "#EF4444"
          : color_base;

        const polilinea = L.polyline(
          [
            [tramo.punto_origen.latitud, tramo.punto_origen.longitud],
            [tramo.punto_destino.latitud, tramo.punto_destino.longitud],
          ],
          {
            color: color_tramo,
            weight: esta_seleccionado ? 7 : 4.5,
            opacity: esta_seleccionado ? 1 : 0.9,
            dashArray: tramo.es_velocidad_anomala ? "8, 8" : undefined,
          }
        );

        polilinea.bindTooltip(
          `Tramo #${tramo.indice + 1} (#${tramo.punto_origen.secuencia} → #${tramo.punto_destino.secuencia}) · ${formatearDistanciaMetros(tramo.distancia_metros)} · ${tramo.velocidad_kmh.toFixed(1)} km/h${
            tramo.es_velocidad_anomala ? " (Velocidad anómala)" : ""
          }`,
          { sticky: true }
        );

        polilinea.on("click", () => {
          alSeleccionarPunto(null);
          alSeleccionarTramo(tramo.indice);
        });

        polilinea.addTo(capa_tramos);
        if (esta_seleccionado) {
          polilinea.bringToFront();
        }
      });
    }

    puntos.forEach((punto, indice) => {
      const es_inicio = indice === 0;
      const es_ultimo = indice === puntos.length - 1 && puntos.length > 1;
      const es_simulado = Boolean(punto.es_ubicacion_simulada);
      const esta_seleccionado = punto_seleccionado_secuencia === punto.secuencia;

      let fondo = "#007BBE";
      let borde = "2px solid #FFFFFF";

      if (es_simulado) {
        fondo = "#EF4444";
      } else if (es_inicio) {
        fondo = "#10B981";
      } else if (es_ultimo) {
        fondo = "#035683";
        borde = "2.5px solid #FFB600";
      }

      const tamano = esta_seleccionado ? 32 : 26;
      const sombra = esta_seleccionado
        ? "0 0 0 4px rgba(255, 182, 0, 0.55), 0 4px 12px rgba(26,26,26,0.35)"
        : "0 2px 8px rgba(26,26,26,0.28)";

      const icono = L.divIcon({
        className: "marcador-gps-prueba",
        html: `<div style="
          width: ${tamano}px;
          height: ${tamano}px;
          border-radius: 9999px;
          background: ${fondo};
          color: #FFFFFF;
          border: ${esta_seleccionado ? "3px solid #FFB600" : borde};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-montserrat), sans-serif;
          font-size: ${esta_seleccionado ? "11px" : "10px"};
          font-weight: 700;
          box-shadow: ${sombra};
          cursor: pointer;
        ">#${punto.secuencia}</div>`,
        iconSize: [tamano, tamano],
        iconAnchor: [tamano / 2, tamano / 2],
      });

      const velocidad_kmh = obtenerVelocidadPuntoKmh(punto);
      const altitud_texto =
        typeof punto.altitud_metros === "number"
          ? `${punto.altitud_metros.toFixed(1)} m`
          : "N/D";
      const modo_texto = escaparHtml(String(punto.modo_captura || "offline").toUpperCase());
      const estado_fraude_texto = es_simulado
        ? `<span style="color:#EF4444;font-weight:700;">Ubicación simulada detectada</span>`
        : `<span style="color:#16A34A;font-weight:700;">Sensor nativo verificado</span>`;

      const html_popup = `
        <div style="font-family: var(--font-poppins), sans-serif; font-size: 11px; color: #1A1A1A; min-width: 210px; line-height: 1.45;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;border-bottom:1px solid #E5E7EB;padding-bottom:4px;">
            <strong style="color:#035683;font-size:12px;">Punto #${punto.secuencia}</strong>
            <span style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:6px;padding:1px 6px;font-size:10px;font-weight:600;color:#00808E;">${modo_texto}</span>
          </div>
          <div><strong>Hora dispositivo:</strong> ${escaparHtml(formatearHoraCorta(punto.hora_dispositivo))}</div>
          <div><strong>Hora satelital GPS:</strong> ${escaparHtml(formatearHoraCorta(punto.hora_gps))}</div>
          <div><strong>Reloj monótono:</strong> ${escaparHtml(formatearDuracionSegundos(punto.tiempo_monotonico_seg))}</div>
          <div><strong>Coordenadas:</strong> <code>${Number(punto.latitud).toFixed(6)}, ${Number(punto.longitud).toFixed(6)}</code></div>
          <div><strong>Precisión:</strong> &plusmn;${Math.round(Number(punto.precision_metros ?? 0))} m · <strong>Altitud:</strong> ${escaparHtml(altitud_texto)}</div>
          <div><strong>Velocidad:</strong> ${velocidad_kmh.toFixed(1)} km/h</div>
          <div style="margin-top:4px;padding-top:4px;border-top:1px dashed #E5E7EB;">${estado_fraude_texto}</div>
        </div>
      `;

      const marcador = L.marker([punto.latitud, punto.longitud], {
        icon: icono,
        zIndexOffset: esta_seleccionado ? 1200 : es_inicio || es_ultimo ? 900 : 500,
      }).bindPopup(html_popup);

      marcador.on("click", () => {
        alSeleccionarTramo(null);
        alSeleccionarPunto(punto.secuencia);
      });

      marcador.addTo(capa_marcadores);
      marcadores_por_secuencia_ref.current.set(punto.secuencia, marcador);
    });

    const clave_puntos = puntos
      .map((p) => `${p.secuencia}:${p.latitud}:${p.longitud}`)
      .join("|");
    if (clave_ajuste_inicial_ref.current !== clave_puntos) {
      clave_ajuste_inicial_ref.current = clave_puntos;
      ajustarRecorrido();
    }
  }, [
    puntos,
    mostrar_linea,
    tramo_seleccionado_indice,
    punto_seleccionado_secuencia,
    cargando_libreria,
    alSeleccionarTramo,
    alSeleccionarPunto,
    ajustarRecorrido,
  ]);

  useEffect(() => {
    const L = leaflet_ref.current;
    const mapa = mapa_ref.current;
    if (!L || !mapa || cargando_libreria) return;

    if (punto_seleccionado_secuencia !== null) {
      const punto = puntos.find((p) => p.secuencia === punto_seleccionado_secuencia);
      if (punto) {
        mapa.flyTo([punto.latitud, punto.longitud], Math.max(mapa.getZoom(), 17), {
          duration: 0.5,
        });
        const marcador = marcadores_por_secuencia_ref.current.get(punto.secuencia);
        if (marcador) {
          marcador.openPopup();
        }
      }
      return;
    }

    if (
      tramo_seleccionado_indice !== null &&
      tramo_seleccionado_indice >= 0 &&
      tramo_seleccionado_indice < puntos.length - 1
    ) {
      const p1 = puntos[tramo_seleccionado_indice];
      const p2 = puntos[tramo_seleccionado_indice + 1];
      const limites = L.latLngBounds([
        [p1.latitud, p1.longitud],
        [p2.latitud, p2.longitud],
      ]);
      mapa.fitBounds(limites, { padding: [56, 56], maxZoom: 18 });
    }
  }, [
    punto_seleccionado_secuencia,
    tramo_seleccionado_indice,
    puntos,
    cargando_libreria,
  ]);

  const alternarTipoMapa = (tipo: "calles" | "satelite") => {
    set_tipo_mapa(tipo);
    const L = leaflet_ref.current;
    const mapa = mapa_ref.current;
    if (!L || !mapa) return;

    if (capa_azulejos_ref.current) {
      mapa.removeLayer(capa_azulejos_ref.current);
    }

    const url_capa =
      tipo === "satelite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    capa_azulejos_ref.current = L.tileLayer(url_capa, { maxZoom: 19 }).addTo(mapa);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs bg-[#F8FAFC] flex flex-col">
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center p-0.5 bg-white/95 backdrop-blur-sm rounded-xl border border-[#E5E7EB] shadow-xs pointer-events-auto">
          <Button
            type="button"
            size="sm"
            variant={tipo_mapa === "calles" ? "default" : "ghost"}
            onClick={() => alternarTipoMapa("calles")}
            className={`h-7 px-2.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${
              tipo_mapa === "calles" ? "bg-[#035683] text-white" : "text-[#035683]"
            }`}
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
              tipo_mapa === "satelite" ? "bg-[#035683] text-white" : "text-[#035683]"
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>Satélite</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => set_mostrar_linea((prev) => !prev)}
            className={`h-8 px-2.5 text-[11px] rounded-xl border shadow-xs font-semibold flex items-center gap-1.5 ${
              mostrar_linea
                ? "bg-[#007BBE] text-white border-[#007BBE] hover:bg-[#035683]"
                : "bg-white/95 text-[#035683] border-[#E5E7EB] hover:bg-[#F8FAFC]"
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Conectar puntos con línea</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={ajustarRecorrido}
            disabled={puntos.length === 0}
            className="h-8 px-2.5 bg-white/95 hover:bg-[#F8FAFC] text-[#035683] rounded-xl border border-[#E5E7EB] shadow-xs text-[11px] font-semibold flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>Ajustar recorrido</span>
          </Button>
        </div>
      </div>

      <div className="relative w-full h-[410px]">
        {cargando_libreria && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1A1A1A]/85 text-white gap-2">
            <Compass className="w-8 h-8 text-[#00ABBD] animate-spin" />
            <p className="font-semibold text-xs font-poppins">Cargando mapa de recorrido...</p>
          </div>
        )}
        {!cargando_libreria && puntos.length === 0 && (
          <div className="absolute inset-0 z-[350] flex items-center justify-center bg-[#F8FAFC]/85 text-[#808080] text-xs font-medium pointer-events-none">
            Sin coordenadas registradas en este recorrido.
          </div>
        )}
        <div ref={contenedor_ref} className="w-full h-full z-0" />
      </div>

      <div className="px-3 py-2 bg-white border-t border-[#E5E7EB] flex flex-wrap items-center gap-3 text-[11px] text-[#808080]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Inicio (#1)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#007BBE]" />
          <span>Intermedio</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#035683] ring-2 ring-[#FFB600]" />
          <span>Fin</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Simulado / Anómalo (&gt;160 km/h)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-1 rounded-full bg-[#FFB600]" />
          <span>Tramo seleccionado</span>
        </span>
      </div>
    </div>
  );
}
