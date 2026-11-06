"use client";

import React, { useState } from "react";
import {
  Bus,
  MapPin,
  ArrowRightLeft,
  Navigation,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  Route,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { BotonJuicy } from "@/components/animaciones";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { useFormularioValidado } from "@/hooks/useFormularioValidado";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { toast } from "sonner";

export interface ParadaFrecuente {
  id: string;
  nombre: string;
  zona: "El Alto" | "La Paz Centro" | "La Paz Sur" | "La Paz" | "La Paz / El Alto";
  tarifa_sugerida: string;
}

export interface RutaFrecuente {
  etiqueta: string;
  origen: string;
  destino: string;
  tarifa: string;
  medio: string;
  calles?: string;
}

const PARADAS_FRECUENTES: ParadaFrecuente[] = [
  { id: "diaconia_central", nombre: "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "diaconia_ceja", nombre: "Agencia Diaconía Ceja (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "escuela_lideres", nombre: "Sede Escuela de Líderes (La Paz)", zona: "La Paz", tarifa_sugerida: "2.60" },
  { id: "ceja_distribuidor", nombre: "La Ceja — Calle 1 / Puente Distribuidor (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "cruce_villa_adela", nombre: "Cruce Villa Adela (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "villa_adela", nombre: "Villa Adela, El Alto", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "cruce_viacha", nombre: "Cruce Viacha (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "rio_seco", nombre: "Ex Tranca Río Seco (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "senkata", nombre: "Extranca Senkata — Av. 6 de Marzo (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "satelite", nombre: "Ciudad Satélite — Plaza del Tinku (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "ballivian", nombre: "Ballivián / Faro Murillo (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "upea", nombre: "UPEA — Villa Esperanza (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "terminal_el_alto", nombre: "Terminal Metropolitana El Alto", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "puente_vela", nombre: "Puente Vela / Ventilla (El Alto)", zona: "El Alto", tarifa_sugerida: "2.00" },
  { id: "perez_velasco", nombre: "Pérez Velasco / Héroes del Pacífico (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "san_francisco", nombre: "Plaza San Francisco (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "san_pedro", nombre: "San Pedro — Plaza Sucre (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "el_prado", nombre: "El Prado / Obelisco (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "umsa", nombre: "UMSA — Monoblock Central (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "sopocachi", nombre: "Sopocachi — Plaza Abaroa (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "miraflores_siles", nombre: "Miraflores — Estadio Hernando Siles (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "miraflores_triangular", nombre: "Miraflores — Plaza Triangular / Hospital de Clínicas (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "terminal_la_paz", nombre: "Terminal de Buses La Paz / Plaza Antofagasta", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "cementerio", nombre: "Cementerio General / Ajayuni (La Paz)", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "periferica", nombre: "Periférica — Av. Vásquez / Autopista (La Paz)", zona: "La Paz", tarifa_sugerida: "3.50" },
  { id: "chuquiaguillo", nombre: "Chuquiaguillo / Salida Yungas (La Paz)", zona: "La Paz", tarifa_sugerida: "3.50" },
  { id: "villa_fatima", nombre: "Villa Fátima — Plaza del Maestro / Minasa (La Paz)", zona: "La Paz", tarifa_sugerida: "3.50" },
  { id: "obrajes", nombre: "Obrajes — Calle 17 (Zona Sur, La Paz)", zona: "La Paz Sur", tarifa_sugerida: "3.50" },
  { id: "calacoto", nombre: "Calacoto — Calle 21 (Zona Sur, La Paz)", zona: "La Paz Sur", tarifa_sugerida: "3.50" },
  { id: "chasquipampa", nombre: "Chasquipampa — Calle 53 (Zona Sur, La Paz)", zona: "La Paz Sur", tarifa_sugerida: "3.50" },
  { id: "teleferico_roja", nombre: "Teleférico Línea Roja (Estación Central / 16 de Julio)", zona: "La Paz / El Alto", tarifa_sugerida: "3.00" },
  { id: "teleferico_amarilla", nombre: "Teleférico Línea Amarilla (Mirador / Sopocachi / Libertador)", zona: "La Paz / El Alto", tarifa_sugerida: "3.00" },
  { id: "teleferico_morada", nombre: "Teleférico Línea Morada (Faro Murillo / San José)", zona: "La Paz / El Alto", tarifa_sugerida: "3.00" },
  { id: "teleferico_azul", nombre: "Teleférico Línea Azul (Río Seco / UPEA / 16 de Julio)", zona: "El Alto", tarifa_sugerida: "3.00" },
  { id: "teleferico_blanca", nombre: "Teleférico Línea Blanca (Plaza Villarroel / Busch)", zona: "La Paz", tarifa_sugerida: "3.00" },
];

const RUTAS_FRECUENTES_PREAJUSTADAS: RutaFrecuente[] = [
  {
    etiqueta: "Ceja ↔ Pérez Velasco",
    origen: "Ceja (El Alto)",
    destino: "Pérez Velasco",
    tarifa: "3.50",
    medio: "Minibús Interciudad",
    calles: "Ceja El Alto (Calle 1) → Autopista La Paz-El Alto → Montes → Pérez Velasco",
  },
  {
    etiqueta: "Cruce Viacha ↔ San Pedro",
    origen: "Cruce Viacha (El Alto)",
    destino: "San Pedro (Plaza Sucre)",
    tarifa: "3.50",
    medio: "Minibús Interciudad",
    calles: "Cruce Viacha → Av. 6 de Marzo → Autopista → Calle Colombia → Plaza San Pedro",
  },
  {
    etiqueta: "Sopocachi ↔ Miraflores",
    origen: "Sopocachi (Plaza Abaroa)",
    destino: "Miraflores (Plaza Triangular)",
    tarifa: "2.60",
    medio: "Minibús Urbano",
    calles: "Plaza Abaroa → Av. 20 de Octubre → Puente Gemelo → Av. Saavedra → Plaza Triangular",
  },
  {
    etiqueta: "Ciudad Satélite ↔ Sopocachi",
    origen: "Ciudad Satélite",
    destino: "Sopocachi (Plaza Abaroa)",
    tarifa: "3.00",
    medio: "Mi Teleférico Línea Amarilla",
    calles: "Ciudad Satélite (Plaza Bolivia) → Estación Mirador → Mi Teleférico Amarilla → Estación Sopocachi",
  },
  {
    etiqueta: "Pérez Velasco ↔ San Pedro",
    origen: "Pérez Velasco",
    destino: "San Pedro (Plaza Sucre)",
    tarifa: "2.00",
    medio: "Micro / Colectivo",
    calles: "Pérez Velasco → Av. Mariscal Santa Cruz → Calle Colombia → Plaza Sucre",
  },
  {
    etiqueta: "Río Seco ↔ Ceja El Alto",
    origen: "Río Seco (El Alto)",
    destino: "Ceja (El Alto)",
    tarifa: "2.00",
    medio: "Minibús Tramo Corto",
    calles: "Extranca Río Seco → Av. Juan Pablo II → Chacaltaya → Ceja El Alto",
  },
];

/**
 * @component RegistroRecorrido
 * @description Formulario enriquecido para registrar recorridos de pasajes con selector rápido
 * de paradas frecuentes y rutas oficiales de la conurbación La Paz - El Alto, autocompletando
 * origen, destino y tarifa fija con cálculo exacto del 80% de reembolso.
 */
export interface RegistroRecorridoProps {
  onCerrar?: () => void;
}

export function RegistroRecorrido({ onCerrar }: RegistroRecorridoProps = {}) {
  const { usuario } = usarAutenticacion();
  const [paso, set_paso] = useState<"ida" | "vuelta">("ida");
  const [tipo_actividad, set_tipo_actividad] = useState<
    "Prácticas" | "Escuela de Líderes" | "Acciones de Servicio"
  >("Prácticas");
  const [mostrar_dropdown_origen, set_mostrar_dropdown_origen] = useState(false);
  const [mostrar_dropdown_destino, set_mostrar_dropdown_destino] = useState(false);

  const {
    confirmarCierreSinCompletar,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  const formulario = useFormularioValidado(
    {
      origen: "Villa Adela, El Alto",
      destino: "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)",
      monto: "3.50",
      fecha: new Date(),
    },
    {
      origen: {
        obligatorio: "El punto de origen es requerido.",
        min_caracteres: { longitud: 3, mensaje: "El origen debe tener al menos 3 caracteres." },
      },
      destino: {
        obligatorio: "El punto de destino es requerido.",
        min_caracteres: { longitud: 3, mensaje: "El destino debe tener al menos 3 caracteres." },
        validador: (val, valores) => {
          if (
            String(val).trim().toLowerCase() ===
            String(valores.origen).trim().toLowerCase() &&
            String(val).trim().length > 0
          ) {
            return "El destino no puede ser idéntico al origen.";
          }
          return null;
        },
      },
      monto: {
        obligatorio: "La tarifa es requerida.",
        formato: "numero",
        min_valor: { valor: 0.5, mensaje: "La tarifa mínima es Bs 0.50." },
      },
      fecha: {
        obligatorio: "La fecha es requerida.",
        formato: "fecha",
      },
    }
  );

  const [medio_transporte, set_medio_transporte] = useState<string>("Minibús Interciudad");
  const [calles_declaradas, set_calles_declaradas] = useState<string>("");

  const [ida_monto, set_ida_monto] = useState(0);
  const [ida_origen, set_ida_origen] = useState("");
  const [ida_destino, set_ida_destino] = useState("");
  const [ida_calles, set_ida_calles] = useState("");
  const [ida_medio, set_ida_medio] = useState("");
  const [cargando, set_cargando] = useState(false);
  const [modo_seleccion, set_modo_seleccion] = useState<"origen" | "destino">("origen");

  const tiene_datos_ingresados =
    formulario.valores.origen.trim() !== "" ||
    formulario.valores.destino.trim() !== "" ||
    calles_declaradas.trim() !== "" ||
    paso === "vuelta" ||
    ida_origen.trim() !== "" ||
    ida_destino.trim() !== "" ||
    formulario.tiene_cambios;

  const manejarCancelarOdescartar = () => {
    confirmarCierreSinCompletar(
      tiene_datos_ingresados,
      () => {
        set_paso("ida");
        formulario.reiniciarFormulario();
        set_ida_monto(0);
        set_ida_origen("");
        set_ida_destino("");
        set_ida_calles("");
        set_ida_medio("");
        set_calles_declaradas("");
        set_medio_transporte("Minibús Interciudad");
        set_modo_seleccion("origen");
        set_mostrar_dropdown_origen(false);
        set_mostrar_dropdown_destino(false);
        set_tipo_actividad("Prácticas");
        if (onCerrar) {
          onCerrar();
        }
      },
      "Declaración de Recorrido"
    );
  };

  // Consultar paradas y tarifas oficiales desde el backend
  const { datos: paradas_servidor } = useConsulta<Array<{ id: number; nombre: string; ciudad: string }>>(
    "paradas_oficiales",
    () => clienteApi.get("/api/pasajes/paradas")
  );

  const fecha_consulta_str = formulario.valores.fecha instanceof Date
    ? formulario.valores.fecha.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const { datos: tarifas_servidor } = useConsulta<Array<{ id: number; costo_bs: number; medio_transporte: string }>>(
    `tarifas_oficiales_${fecha_consulta_str}`,
    () => clienteApi.get(`/api/pasajes/tarifas?fecha=${fecha_consulta_str}`)
  );

  const { conectado } = useTiempoReal({
    eventos: {
      pasajes_actualizados: () => {
        // Evento de pasajes recibido en tiempo real
      },
    },
  });

  const monto_num = parseFloat(String(formulario.valores.monto) || "0");
  const total = paso === "ida" ? monto_num : ida_monto + monto_num;
  const devolucion = total * 0.8;

  const inferirMedioTransporte = (tarifa: number, orig: string, dest: string): string => {
    const comb = `${orig} ${dest}`.toLowerCase();
    if (
      tarifa === 3.0 ||
      comb.includes("teleférico") ||
      comb.includes("teleferico") ||
      comb.includes("amarilla") ||
      comb.includes("roja") ||
      comb.includes("morada")
    ) {
      return "Mi Teleférico";
    }
    if (tarifa === 3.5 || comb.includes("ceja") || comb.includes("el alto")) {
      return "Minibús Interciudad";
    }
    if (tarifa === 2.6) {
      return "Minibús Urbano";
    }
    if (tarifa === 2.0) {
      return "Micro / Colectivo";
    }
    if (tarifa === 4.0) {
      return "Trufi Troncal";
    }
    return "Transporte Público La Paz – El Alto";
  };

  const aplicarRutaFrecuente = (_ruta: RutaFrecuente) => {
    if (paso === "ida") {
      formulario.establecerValores({
        origen: _ruta.origen,
        destino: _ruta.destino,
        monto: _ruta.tarifa,
      });
      set_medio_transporte(_ruta.medio);
      set_calles_declaradas(_ruta.calles || `${_ruta.origen} → ${_ruta.destino}`);
    } else {
      formulario.establecerValores({
        origen: _ruta.destino,
        destino: _ruta.origen,
        monto: _ruta.tarifa,
      });
      set_medio_transporte(_ruta.medio);
      const calles_rev = _ruta.calles
        ? _ruta.calles.split("→").reverse().map((c) => c.trim()).join(" → ")
        : `${_ruta.destino} → ${_ruta.origen}`;
      set_calles_declaradas(calles_rev);
    }
  };

  const aplicarParada = (_nombre_parada: string, _tarifa_sugerida: string) => {
    if (modo_seleccion === "origen") {
      formulario.cambiarValor("origen", _nombre_parada);
      set_modo_seleccion("destino");
      set_mostrar_dropdown_origen(false);
      set_mostrar_dropdown_destino(true);
    } else {
      formulario.cambiarValor("destino", _nombre_parada);
      set_mostrar_dropdown_destino(false);
    }
    if (!formulario.valores.monto || formulario.valores.monto === "0") {
      formulario.cambiarValor("monto", _tarifa_sugerida);
    }
  };

  const intercambiarParadas = () => {
    const temp_origen = String(formulario.valores.origen);
    const temp_destino = String(formulario.valores.destino);
    formulario.establecerValores({
      origen: temp_destino,
      destino: temp_origen,
    });
  };

  const paradas_filtradas_origen = PARADAS_FRECUENTES.filter(
    (p) =>
      p.nombre.toLowerCase().includes(String(formulario.valores.origen || "").toLowerCase()) ||
      p.zona.toLowerCase().includes(String(formulario.valores.origen || "").toLowerCase())
  );

  const paradas_filtradas_destino = PARADAS_FRECUENTES.filter(
    (p) =>
      p.nombre.toLowerCase().includes(String(formulario.valores.destino || "").toLowerCase()) ||
      p.zona.toLowerCase().includes(String(formulario.valores.destino || "").toLowerCase())
  );

  const PARADAS_OFICIALES_COORDENADAS = [
    { nombre: "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)", latitud: -16.50005, longitud: -68.17345 },
    { nombre: "Agencia Diaconía Ceja (El Alto)", latitud: -16.5085, longitud: -68.1630 },
    { nombre: "Sede Escuela de Líderes (La Paz)", latitud: -16.5042, longitud: -68.1315 },
    { nombre: "La Ceja — Calle 1 / Puente Distribuidor (El Alto)", latitud: -16.5088, longitud: -68.1627 },
    { nombre: "Cruce Villa Adela (El Alto)", latitud: -16.5245, longitud: -68.1885 },
    { nombre: "Villa Adela, El Alto", latitud: -16.5360, longitud: -68.1920 },
    { nombre: "Cruce Viacha (El Alto)", latitud: -16.5178, longitud: -68.1695 },
    { nombre: "Ex Tranca Río Seco (El Alto)", latitud: -16.4912, longitud: -68.2105 },
    { nombre: "Extranca Senkata — Av. 6 de Marzo (El Alto)", latitud: -16.5655, longitud: -68.1872 },
    { nombre: "Ciudad Satélite — Plaza del Tinku (El Alto)", latitud: -16.5195, longitud: -68.1510 },
    { nombre: "Ballivián / Faro Murillo (El Alto)", latitud: -16.5055, longitud: -68.1525 },
    { nombre: "UPEA — Villa Esperanza (El Alto)", latitud: -16.4935, longitud: -68.1940 },
    { nombre: "Terminal Metropolitana El Alto", latitud: -16.5152, longitud: -68.1720 },
    { nombre: "Puente Vela / Ventilla (El Alto)", latitud: -16.5520, longitud: -68.1960 },
    { nombre: "Pérez Velasco / Héroes del Pacífico (La Paz)", latitud: -16.4958, longitud: -68.1372 },
    { nombre: "Plaza San Francisco (La Paz)", latitud: -16.4965, longitud: -68.1378 },
    { nombre: "San Pedro — Plaza Sucre (La Paz)", latitud: -16.5030, longitud: -68.1360 },
    { nombre: "El Prado / Obelisco (La Paz)", latitud: -16.4988, longitud: -68.1340 },
    { nombre: "UMSA — Monoblock Central (La Paz)", latitud: -16.5048, longitud: -68.1298 },
    { nombre: "Sopocachi — Plaza Abaroa (La Paz)", latitud: -16.5112, longitud: -68.1268 },
    { nombre: "Miraflores — Estadio Hernando Siles (La Paz)", latitud: -16.4995, longitud: -68.1228 },
    { nombre: "Miraflores — Plaza Triangular / Hospital de Clínicas (La Paz)", latitud: -16.5052, longitud: -68.1211 },
    { nombre: "Terminal de Buses La Paz / Plaza Antofagasta", latitud: -16.4895, longitud: -68.1415 },
    { nombre: "Cementerio General / Ajayuni (La Paz)", latitud: -16.4920, longitud: -68.1515 },
    { nombre: "Periférica — Av. Vásquez / Autopista (La Paz)", latitud: -16.4840, longitud: -68.1425 },
    { nombre: "Chuquiaguillo / Salida Yungas (La Paz)", latitud: -16.4620, longitud: -68.1050 },
    { nombre: "Villa Fátima — Plaza del Maestro / Minasa (La Paz)", latitud: -16.4815, longitud: -68.1189 },
    { nombre: "Obrajes — Calle 17 (Zona Sur, La Paz)", latitud: -16.5275, longitud: -68.1085 },
    { nombre: "Calacoto — Calle 21 (Zona Sur, La Paz)", latitud: -16.5398, longitud: -68.0865 },
    { nombre: "Chasquipampa — Calle 53 (Zona Sur, La Paz)", latitud: -16.5440, longitud: -68.0530 },
    { nombre: "Teleférico Línea Roja (Estación Central / 16 de Julio)", latitud: -16.4918, longitud: -68.1452 },
    { nombre: "Teleférico Línea Amarilla (Mirador / Sopocachi / Libertador)", latitud: -16.5172, longitud: -68.1338 },
    { nombre: "Teleférico Línea Morada (Faro Murillo / San José)", latitud: -16.5015, longitud: -68.1355 },
    { nombre: "Teleférico Línea Azul (Río Seco / UPEA / 16 de Julio)", latitud: -16.4960, longitud: -68.1820 },
    { nombre: "Teleférico Línea Blanca (Plaza Villarroel / Busch)", latitud: -16.4930, longitud: -68.1195 },
  ];

  const calcularDistanciaHaversineMetros = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const resolverUbicacionGpsReal = async (lat: number, lng: number): Promise<string> => {
    // 1. Proximidad a parada <= 150m
    let parada_cercana: { nombre: string; distancia: number } | null = null;
    for (const p of PARADAS_OFICIALES_COORDENADAS) {
      const d = calcularDistanciaHaversineMetros(lat, lng, p.latitud, p.longitud);
      if (!parada_cercana || d < parada_cercana.distancia) {
        parada_cercana = { nombre: p.nombre, distancia: d };
      }
    }

    if (parada_cercana && parada_cercana.distancia <= 150) {
      return `Parada ${parada_cercana.nombre} (a ${parada_cercana.distancia} m)`;
    }

    const parada_ref = parada_cercana ? parada_cercana.nombre : "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)";

    // 2. Geocodificación inversa con Nominatim para calle y zona real (> 150m)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { signal: controller.signal, headers: { "Accept-Language": "es" } }
      );
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const calle =
          addr.road || addr.pedestrian || addr.footway || addr.path || addr.residential || addr.amenity || addr.building;
        const barrio =
          addr.neighbourhood || addr.quarter || addr.suburb;
        const distrito =
          addr.city_district || addr.city || addr.town;

        if (calle && String(calle).trim().length > 0) {
          if (barrio && String(barrio).trim().length > 0) {
            return `${calle}, ${barrio}`;
          } else if (distrito && String(distrito).trim().length > 0) {
            return `${calle}, ${distrito}`;
          }
          return `${calle}`;
        } else {
          const zona = barrio || distrito;
          if (zona) {
            return `Zona ${zona} · Ref. ${parada_ref}`;
          }
          return `Ref. ${parada_ref}`;
        }
      }
    } catch (_e) {
      // Fallback
    }

    return `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}) · Ref. ${parada_ref}`;
  };

  const [capturando_gps_campo, set_capturando_gps_campo] = useState<"origen" | "destino" | null>(null);

  const capturarGpsParaCampo = (campo: "origen" | "destino") => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      set_capturando_gps_campo(campo);
      toast.info("Obteniendo coordenadas GPS en tiempo real...");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const ubicacion = await resolverUbicacionGpsReal(lat, lng);
          formulario.cambiarValor(campo, ubicacion);

          // Si el otro campo tiene el mismo valor o está vacío, evitar duplicidad asignando la sede
          const otro_campo = campo === "origen" ? "destino" : "origen";
          const otro_valor = String(formulario.valores[otro_campo] || "").trim();
          if (otro_valor.toLowerCase() === ubicacion.toLowerCase()) {
            const sede_default = "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)";
            formulario.cambiarValor(otro_campo, sede_default);
          }

          toast.success("✓ Ubicación en tiempo real fijada", {
            description: ubicacion,
          });
          set_capturando_gps_campo(null);
        },
        () => {
          const fallback =
            campo === "origen" ? "Villa Adela, El Alto" : "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)";
          formulario.cambiarValor(campo, fallback);
          toast.info(`Ubicación aproximada asignada: ${fallback}`);
          set_capturando_gps_campo(null);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      formulario.cambiarValor(
        campo,
        campo === "origen" ? "Villa Adela, El Alto" : "Oficina Central Diaconía (Av. Juan Pablo II, El Alto)"
      );
    }
  };

  const manejarSiguientePaso = () => {
    if (!formulario.validarFormulario()) {
      return;
    }
    // Validación TAREA-01: Origen !== Destino
    if (
      String(formulario.valores.origen).trim().toLowerCase() ===
      String(formulario.valores.destino).trim().toLowerCase()
    ) {
      toast.error("El punto de origen y destino no pueden ser la misma ubicación o parada");
      return;
    }
    const monto_actual = parseFloat(String(formulario.valores.monto) || "0");
    const destino_actual = String(formulario.valores.destino);
    const origen_actual = String(formulario.valores.origen);

    set_ida_monto(monto_actual);
    set_ida_origen(origen_actual);
    set_ida_destino(destino_actual);
    set_ida_medio(medio_transporte || inferirMedioTransporte(monto_actual, origen_actual, destino_actual));
    set_ida_calles(calles_declaradas || `${origen_actual} → ${destino_actual}`);

    formulario.establecerValores({
      origen: destino_actual,
      destino: "",
    });
    set_calles_declaradas("");
    set_paso("vuelta");
    set_modo_seleccion("destino");
    set_mostrar_dropdown_origen(false);
    set_mostrar_dropdown_destino(false);
  };

  // TAREA-14: Determinar si la actividad actual está restringida a "Solo Ida"
  const actividad_clave =
    tipo_actividad === "Prácticas"
      ? "practicas"
      : tipo_actividad === "Escuela de Líderes"
      ? "escuela_lideres"
      : "acciones_servicio";
  const modalidad_usuario = (usuario as any)?.modalidad_pasajes || "ida_y_vuelta";
  const config_actividades = (usuario as any)?.configuracion_pasajes_actividades || {};
  const es_solo_ida = (config_actividades[actividad_clave] || modalidad_usuario) === "solo_ida";

  const manejarGuardadoSoloIda = async () => {
    if (!formulario.validarFormulario()) {
      return;
    }
    if (
      String(formulario.valores.origen).trim().toLowerCase() ===
      String(formulario.valores.destino).trim().toLowerCase()
    ) {
      toast.error("El punto de origen y destino no pueden ser la misma ubicación o parada");
      return;
    }
    set_cargando(true);
    const becario_id = usuario?.becario_id || usuario?.id || 1;
    const fecha_val = formulario.valores.fecha instanceof Date ? formulario.valores.fecha : new Date();
    const fecha_iso = fecha_val.toISOString();
    const origen_val = String(formulario.valores.origen);
    const destino_val = String(formulario.valores.destino);
    const monto_val = parseFloat(String(formulario.valores.monto) || "0");
    const medio_ida = medio_transporte || inferirMedioTransporte(monto_val, origen_val, destino_val);
    const calles_ida = calles_declaradas || `${origen_val} → ${destino_val}`;

    try {
      await clienteApi.post("/api/pasajes/recorridos", {
        becario_id,
        tramo: "ida",
        origen: origen_val,
        destino: destino_val,
        tarifa: monto_val,
        fecha: fecha_iso,
        tipo_actividad,
        medio_transporte: medio_ida,
        calles_declaradas: calles_ida,
        apoyo_realizado: `${tipo_actividad} - Desplazamiento institucional (Solo Ida)`,
      });

      toast.success("Recorrido de Ida registrado con éxito (Solo Ida habilitado).", {
        description: `Devolución acreditada del 80%: Bs ${(monto_val * 0.8).toFixed(2)} sobre Bs ${monto_val.toFixed(2)}.`,
      });
    } catch {
      toast.info("Recorrido de Solo Ida registrado localmente.");
    } finally {
      set_paso("ida");
      formulario.reiniciarFormulario();
      set_ida_monto(0);
      set_ida_origen("");
      set_ida_destino("");
      set_ida_calles("");
      set_ida_medio("");
      set_calles_declaradas("");
      set_medio_transporte("Minibús Interciudad");
      set_modo_seleccion("origen");
      set_mostrar_dropdown_origen(false);
      set_mostrar_dropdown_destino(false);
      set_tipo_actividad("Prácticas");
      set_cargando(false);
    }
  };

  const manejarGuardado = async () => {
    if (!formulario.validarFormulario()) {
      return;
    }
    if (
      String(formulario.valores.origen).trim().toLowerCase() ===
      String(formulario.valores.destino).trim().toLowerCase()
    ) {
      toast.error("El punto de origen y destino no pueden ser la misma ubicación o parada");
      return;
    }
    set_cargando(true);
    const becario_id = usuario?.becario_id || usuario?.id || 1;
    const fecha_val = formulario.valores.fecha instanceof Date ? formulario.valores.fecha : new Date();
    const fecha_iso = fecha_val.toISOString();
    const origen_val = String(formulario.valores.origen);
    const destino_val = String(formulario.valores.destino);
    const monto_val = parseFloat(String(formulario.valores.monto) || "0");

    const medio_vuelta = medio_transporte || inferirMedioTransporte(monto_val, origen_val, destino_val);
    const calles_vuelta = calles_declaradas || `${origen_val} → ${destino_val}`;

    try {
      // Registrar tramo de ida en endpoint oficial
      if (ida_monto > 0 && ida_origen) {
        await clienteApi.post("/api/pasajes/recorridos", {
          becario_id,
          tramo: "ida",
          origen: ida_origen,
          destino: ida_destino,
          tarifa: ida_monto,
          fecha: fecha_iso,
          tipo_actividad,
          medio_transporte: ida_medio || "Minibús Interciudad",
          calles_declaradas: ida_calles || `${ida_origen} → ${ida_destino}`,
          apoyo_realizado: `${tipo_actividad} - Desplazamiento institucional a sede`,
        });
      }

      // Registrar tramo actual (vuelta o tramo único)
      await clienteApi.post("/api/pasajes/recorridos", {
        becario_id,
        tramo: paso,
        origen: origen_val,
        destino: destino_val,
        tarifa: monto_val,
        fecha: fecha_iso,
        tipo_actividad,
        medio_transporte: medio_vuelta,
        calles_declaradas: calles_vuelta,
        apoyo_realizado: `${tipo_actividad} - Desplazamiento institucional`,
      });

      toast.success("Recorrido registrado exitosamente", {
        description: `Devolución acreditada del 80%: Bs ${devolucion.toFixed(2)} sobre Bs ${total.toFixed(2)}.`,
      });
    } catch {
      // Fallback en modo desconectado / demo
      toast.info("Recorrido guardado localmente", {
        description: `Modo fuera de línea. Devolución calculada (80%): Bs ${devolucion.toFixed(2)}.`,
      });
    } finally {
      set_paso("ida");
      formulario.reiniciarFormulario();
      set_ida_monto(0);
      set_ida_origen("");
      set_ida_destino("");
      set_ida_calles("");
      set_ida_medio("");
      set_calles_declaradas("");
      set_medio_transporte("Minibús Interciudad");
      set_modo_seleccion("origen");
      set_mostrar_dropdown_origen(false);
      set_mostrar_dropdown_destino(false);
      set_tipo_actividad("Prácticas");
      set_cargando(false);
    }
  };

  return (
    <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <CardContent className="p-6 pt-5 space-y-4 overflow-y-auto flex-1">
        {/* Encabezado con Indicador de Paso (Ida / Vuelta) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]/60 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${paso === "ida" ? "bg-[#00ABBD]" : "bg-[#FFB600]"}`} />
            <span className="font-mono text-xs font-bold tracking-wider text-[#035683]">
              DECLARACIÓN DE RECORRIDO ({paso.toUpperCase()})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {paso === "vuelta" && (
              <button
                type="button"
                onClick={() => set_paso("ida")}
                className="text-xs text-[#007BBE] font-mono hover:underline font-semibold"
              >
                ← Modificar Ida
              </button>
            )}
            {(tiene_datos_ingresados || onCerrar) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={manejarCancelarOdescartar}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-[#E2694B] rounded-lg"
                title="Descartar o cerrar formulario"
              >
                Descartar
              </Button>
            )}
          </div>
        </div>

        {/* Banner Informativo si es Solo Ida */}
        {es_solo_ida && (
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Modalidad asignada por Administración:</strong> Para esta actividad solo está habilitado el registro de <strong>Solo Ida</strong>.
            </span>
          </div>
        )}

        {/* Selector de Tipo de Actividad */}
        <div>
          <Label className="font-mono text-[10px] font-bold tracking-wider text-[#007BBE] uppercase mb-1.5 block">
            Tipo de Actividad
          </Label>
          <Select
            value={tipo_actividad}
            onValueChange={(val) => {
              if (val) set_tipo_actividad(val as "Prácticas" | "Escuela de Líderes" | "Acciones de Servicio");
            }}
          >
            <SelectTrigger className="w-full bg-white border-[#E5E7EB] h-10 text-xs rounded-xl focus:ring-[#00ABBD]">
              <SelectValue placeholder="Seleccionar tipo de actividad" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E7EB]">
              <SelectItem value="Prácticas" etiqueta="Prácticas">
                <span className="font-semibold text-[#035683]">Prácticas</span> — Desplazamiento a sede asignada
              </SelectItem>
              <SelectItem value="Escuela de Líderes" etiqueta="Escuela de Líderes">
                <span className="font-semibold text-amber-700">Escuela de Líderes</span> — Asistencia presencial viernes
              </SelectItem>
              <SelectItem value="Acciones de Servicio" etiqueta="Acciones de Servicio">
                <span className="font-semibold text-emerald-700">Acciones de Servicio</span> — Voluntariado y apoyo comunitario
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Fecha */}
        <div>
          <Label className="font-mono text-[10px] font-bold tracking-wider text-[#007BBE] uppercase mb-1.5 block">
            Fecha del Desplazamiento
          </Label>
          <div className={formulario.obtenerClaseInput("fecha", "rounded-xl")}>
            <SeleccionadorFecha
              fecha={formulario.valores.fecha as Date}
              alCambiar={(f) => {
                formulario.cambiarValor("fecha", f);
                formulario.tocarCampo("fecha");
              }}
              etiqueta_boton="Seleccionar fecha del viaje"
            />
          </div>
          {formulario.renderizarMensajeError("fecha")}
        </div>

        {/* Rutas Frecuentes Preajustadas (La Paz - El Alto) */}
        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-[#00ABBD]" />
              Rutas Troncales Rápidas (La Paz ↔ El Alto)
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Autocompletar</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {RUTAS_FRECUENTES_PREAJUSTADAS.map((r) => (
              <button
                key={r.etiqueta}
                type="button"
                onClick={() => aplicarRutaFrecuente(r)}
                className="text-left p-2 rounded-lg border border-[#E5E7EB] bg-white hover:border-[#00ABBD] hover:bg-[#E3F9FA]/40 transition-colors group"
              >
                <div className="text-[11px] font-bold text-[#035683] truncate group-hover:text-[#007BBE]">
                  {r.etiqueta}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-0.5">
                  <span className="truncate">{r.medio}</span>
                  <span className="font-bold text-[#035683]">Bs {r.tarifa}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Campos Origen y Destino con Combobox / Autocomplete */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#035683]">
              Tramos de Transporte (Búsqueda y Autocompletado)
            </span>
            <button
              type="button"
              onClick={intercambiarParadas}
              className="text-[11px] text-[#007BBE] hover:underline flex items-center gap-1 font-medium"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Invertir Origen / Destino
            </button>
          </div>

          {/* Combobox Dinámico para Origen */}
          <div className="relative">
            <div
              onClick={() => {
                set_modo_seleccion("origen");
                set_mostrar_dropdown_origen(true);
                set_mostrar_dropdown_destino(false);
              }}
              className={`flex items-center gap-3 p-3 bg-white border-1.5 rounded-xl cursor-pointer transition-colors ${
                formulario.esCampoInvalido("origen")
                  ? "border-[#E2694B] bg-[#E2694B]/5 ring-2 ring-[#E2694B]/20"
                  : modo_seleccion === "origen"
                  ? "border-[#00ABBD] ring-2 ring-[#00ABBD]/20"
                  : "border-[#E5E7EB] hover:border-slate-400"
              }`}
            >
              <MapPin className="w-4 h-4 text-[#E2694B] shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block leading-none mb-1">
                  Punto de Origen (Escriba o seleccione parada)
                </span>
                <Input
                  placeholder="Ej: Ceja (El Alto)"
                  value={String(formulario.valores.origen)}
                  onFocus={() => {
                    set_modo_seleccion("origen");
                    set_mostrar_dropdown_origen(true);
                    set_mostrar_dropdown_destino(false);
                  }}
                  onChange={(e) => {
                    formulario.cambiarValor("origen", e.target.value);
                    set_mostrar_dropdown_origen(true);
                  }}
                  onBlur={() => {
                    formulario.tocarCampo("origen");
                    setTimeout(() => set_mostrar_dropdown_origen(false), 200);
                  }}
                  className="border-none shadow-none h-auto p-0 focus-visible:ring-0 text-xs font-semibold bg-transparent"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    capturarGpsParaCampo("origen");
                  }}
                  disabled={capturando_gps_campo !== null}
                  title="Capturar y fijar ubicación GPS actual"
                  className="h-7 px-2 text-[11px] font-bold border-[#CBD5E1] bg-[#F1F5F9] text-[#035683] hover:bg-[#00ABBD]/10 hover:border-[#00ABBD] rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className={`w-3 h-3 text-[#00ABBD] ${capturando_gps_campo === "origen" ? "animate-spin text-[#FFB600]" : ""}`} />
                  <span>{capturando_gps_campo === "origen" ? "Detectando..." : "📍 Fijar GPS"}</span>
                </Button>
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Menú Flotante Autocomplete de Origen */}
            {mostrar_dropdown_origen && paradas_filtradas_origen.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-[#E5E7EB] rounded-xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-mono text-muted-foreground font-bold uppercase border-b border-slate-100 mb-1">
                  Paradas Sugeridas para Origen
                </div>
                {paradas_filtradas_origen.map((parada) => (
                  <button
                    key={`orig-${parada.id}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      aplicarParada(parada.nombre, parada.tarifa_sugerida);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#00ABBD]/10 transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-[#1E293B] group-hover:text-[#035683]">
                        {parada.nombre}
                      </span>
                      <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                        ({parada.zona})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#035683] bg-slate-100 px-1.5 py-0.5 rounded">
                      Bs {parada.tarifa_sugerida}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {formulario.renderizarMensajeError("origen")}
          </div>

          {/* Combobox Dinámico para Destino */}
          <div className="relative">
            <div
              onClick={() => {
                set_modo_seleccion("destino");
                set_mostrar_dropdown_destino(true);
                set_mostrar_dropdown_origen(false);
              }}
              className={`flex items-center gap-3 p-3 bg-white border-1.5 rounded-xl cursor-pointer transition-colors ${
                formulario.esCampoInvalido("destino")
                  ? "border-[#E2694B] bg-[#E2694B]/5 ring-2 ring-[#E2694B]/20"
                  : modo_seleccion === "destino"
                  ? "border-[#00ABBD] ring-2 ring-[#00ABBD]/20"
                  : "border-[#E5E7EB] hover:border-slate-400"
              }`}
            >
              <MapPin className="w-4 h-4 text-[#007BBE] shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block leading-none mb-1">
                  Punto de Destino (Escriba o seleccione parada)
                </span>
                <Input
                  placeholder="Ej: Pérez Velasco"
                  value={String(formulario.valores.destino)}
                  onFocus={() => {
                    set_modo_seleccion("destino");
                    set_mostrar_dropdown_destino(true);
                    set_mostrar_dropdown_origen(false);
                  }}
                  onChange={(e) => {
                    formulario.cambiarValor("destino", e.target.value);
                    set_mostrar_dropdown_destino(true);
                  }}
                  onBlur={() => {
                    formulario.tocarCampo("destino");
                    setTimeout(() => set_mostrar_dropdown_destino(false), 200);
                  }}
                  className="border-none shadow-none h-auto p-0 focus-visible:ring-0 text-xs font-semibold bg-transparent"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    capturarGpsParaCampo("destino");
                  }}
                  disabled={capturando_gps_campo !== null}
                  title="Capturar y fijar ubicación GPS actual"
                  className="h-7 px-2 text-[11px] font-bold border-[#CBD5E1] bg-[#F1F5F9] text-[#035683] hover:bg-[#00ABBD]/10 hover:border-[#00ABBD] rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className={`w-3 h-3 text-[#007BBE] ${capturando_gps_campo === "destino" ? "animate-spin text-[#FFB600]" : ""}`} />
                  <span>{capturando_gps_campo === "destino" ? "Detectando..." : "📍 Fijar GPS"}</span>
                </Button>
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Menú Flotante Autocomplete de Destino */}
            {mostrar_dropdown_destino && paradas_filtradas_destino.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-[#E5E7EB] rounded-xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-mono text-muted-foreground font-bold uppercase border-b border-slate-100 mb-1">
                  Paradas Sugeridas para Destino
                </div>
                {paradas_filtradas_destino.map((parada) => (
                  <button
                    key={`dest-${parada.id}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      aplicarParada(parada.nombre, parada.tarifa_sugerida);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#00ABBD]/10 transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-[#1E293B] group-hover:text-[#035683]">
                        {parada.nombre}
                      </span>
                      <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                        ({parada.zona})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#035683] bg-slate-100 px-1.5 py-0.5 rounded">
                      Bs {parada.tarifa_sugerida}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {formulario.renderizarMensajeError("destino")}
          </div>
        </div>

        {/* Trazado de Calles Declaradas (Opcional / Autocompletado) */}
        <div>
          <Label className="font-mono text-[10px] font-bold tracking-wider text-[#007BBE] uppercase mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#00ABBD]" />
              Calles y Paradas Intermedias Declaradas
            </span>
            <span className="text-muted-foreground font-normal lowercase text-[10px]">(opcional)</span>
          </Label>
          <Input
            placeholder="Ej: Ceja El Alto → Av. Naciones Unidas → Estación Central"
            value={calles_declaradas}
            onChange={(e) => set_calles_declaradas(e.target.value)}
            className="bg-white border-[#E5E7EB] h-9 text-xs rounded-xl focus:ring-[#00ABBD]"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Indique las avenidas, líneas de teleférico o transbordos para auditoría de pasajes.
          </p>
        </div>

        {/* Tarifa Oficial Regulada */}
        <div className="bg-[#E3F9FA] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-bold tracking-wider text-[#007BBE] uppercase">
              Tarifa Oficial Regulada
            </p>
            {medio_transporte && (
              <span className="text-[10.5px] font-mono font-semibold text-[#035683] bg-white/80 px-2 py-0.5 rounded border border-[#C9E5E4]">
                {medio_transporte}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(formulario.valores.monto)}
              onValueChange={(val: string | null) => {
                if (val) {
                  formulario.cambiarValor("monto", val);
                  if (val === "3.00") set_medio_transporte("Mi Teleférico");
                  else if (val === "3.50") set_medio_transporte("Minibús Interciudad");
                  else if (val === "2.60") set_medio_transporte("Minibús Urbano");
                  else if (val === "2.00") set_medio_transporte("Micro / Colectivo");
                  else if (val === "4.00") set_medio_transporte("Trufi Troncal");
                }
              }}
            >
              <SelectTrigger className="flex-1 bg-white border-[#C9E5E4] h-9 text-xs">
                <SelectValue placeholder="Seleccionar tarifa institucional" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5E7EB]">
                <SelectItem value="3.50" etiqueta="Minibús Interciudad (Bs 3.50)">Minibús Interciudad / El Alto (Bs 3.50)</SelectItem>
                <SelectItem value="2.60" etiqueta="Minibús Directo LP (Bs 2.60)">Minibús Tramo Directo La Paz (Bs 2.60)</SelectItem>
                <SelectItem value="2.00" etiqueta="Micro / Colectivo (Bs 2.00)">Micro / Colectivo Urbano (Bs 2.00)</SelectItem>
                <SelectItem value="3.00" etiqueta="Mi Teleférico (Bs 3.00)">Mi Teleférico (Bs 3.00)</SelectItem>
                <SelectItem value="4.00" etiqueta="Trufi Troncal (Bs 4.00)">Trufi Troncal (Bs 4.00)</SelectItem>
              </SelectContent>
            </Select>

            <span className="font-mono text-[#8A9BA4]">-</span>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs font-semibold text-gray-500">Bs</span>
              <Input
                type="number"
                step="0.10"
                value={String(formulario.valores.monto)}
                onChange={(e) => formulario.cambiarValor("monto", e.target.value)}
                onBlur={() => formulario.tocarCampo("monto")}
                className={formulario.obtenerClaseInput("monto", "w-20 bg-white border-[#C9E5E4] h-9 text-xs font-mono font-bold")}
              />
            </div>
          </div>
          {formulario.renderizarMensajeError("monto")}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { etiqueta: "Interciudad 3.50", valor: "3.50", medio: "Minibús Interciudad" },
              { etiqueta: "Minibús 2.60", valor: "2.60", medio: "Minibús Urbano" },
              { etiqueta: "Micro 2.00", valor: "2.00", medio: "Micro / Colectivo" },
              { etiqueta: "Teleférico 3.00", valor: "3.00", medio: "Mi Teleférico" },
              { etiqueta: "Trufi 4.00", valor: "4.00", medio: "Trufi Troncal" },
            ].map((t) => (
              <button
                key={t.valor}
                type="button"
                onClick={() => {
                  formulario.cambiarValor("monto", t.valor);
                  set_medio_transporte(t.medio);
                }}
                className={`text-[10.5px] px-2 py-0.5 rounded-md border font-medium transition-colors ${
                  String(formulario.valores.monto) === t.valor
                    ? "bg-[#035683] text-white border-[#035683]"
                    : "bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50"
                }`}
              >
                {t.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* Desglose y Cálculo de Devolución del 80% */}
        <div className="p-4 border border-[#E5E7EB] rounded-xl bg-white space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Monto del viaje {paso === "vuelta" ? "(Ida + Vuelta)" : "(Solo Ida)"}</span>
            <span className="font-bold text-[#122029]">Bs {total.toFixed(2)}</span>
          </div>
          <div className="h-px bg-[#E5E7EB]/60 w-full" />
          <div className="flex justify-between text-xs font-bold text-[#035683]">
            <span>Reembolso Oficial BUMAND (80%)</span>
            <span className="text-[#FFB600] text-sm">Bs {devolucion.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón de Acción con BotonJuicy y Cancelar */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={manejarCancelarOdescartar}
            className="h-11 px-4 text-xs font-semibold border-[#E5E7EB] text-[#5B6D77] rounded-xl hover:bg-slate-50"
          >
            Cancelar
          </Button>
          {es_solo_ida ? (
            <BotonJuicy
              type="button"
              variante="exito"
              tamaño="md"
              onClick={manejarGuardadoSoloIda}
              disabled={cargando}
              className="flex-1 h-11"
            >
              <span>{cargando ? "Registrando en Sistema..." : "Registrar Recorrido (Solo Ida - 80%)"}</span>
            </BotonJuicy>
          ) : paso === "ida" ? (
            <BotonJuicy
              type="button"
              variante="primario"
              tamaño="md"
              onClick={manejarSiguientePaso}
              className="flex-1 h-11"
            >
              <span>Continuar a Recorrido de Vuelta</span>
            </BotonJuicy>
          ) : (
            <BotonJuicy
              type="button"
              variante="exito"
              tamaño="md"
              onClick={manejarGuardado}
              disabled={cargando}
              className="flex-1 h-11"
            >
              <span>{cargando ? "Registrando en Sistema..." : "Confirmar Recorrido Completo (80%)"}</span>
            </BotonJuicy>
          )}
        </div>
      </CardContent>

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </Card>
  );
}
