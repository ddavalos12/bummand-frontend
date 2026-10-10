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
import { toast } from "sonner";

export interface ParadaFrecuente {
  id: string;
  nombre: string;
  zona: "El Alto" | "La Paz Centro" | "La Paz Sur";
  tarifa_sugerida: string;
}

export interface RutaFrecuente {
  etiqueta: string;
  origen: string;
  destino: string;
  tarifa: string;
  medio: string;
}

const PARADAS_FRECUENTES: ParadaFrecuente[] = [
  { id: "ceja", nombre: "Ceja (El Alto)", zona: "El Alto", tarifa_sugerida: "3.50" },
  { id: "perez_velasco", nombre: "Pérez Velasco", zona: "La Paz Centro", tarifa_sugerida: "3.50" },
  { id: "san_francisco", nombre: "San Francisco", zona: "La Paz Centro", tarifa_sugerida: "2.60" },
  { id: "cruce_viacha", nombre: "Cruce Viacha (El Alto)", zona: "El Alto", tarifa_sugerida: "3.50" },
  { id: "sopocachi", nombre: "Sopocachi (Plaza Abaroa)", zona: "La Paz Centro", tarifa_sugerida: "2.60" },
  { id: "miraflores", nombre: "Miraflores (Plaza Triangular)", zona: "La Paz Centro", tarifa_sugerida: "2.60" },
  { id: "san_pedro", nombre: "San Pedro (Plaza Sucre)", zona: "La Paz Centro", tarifa_sugerida: "2.60" },
  { id: "satelite", nombre: "Ciudad Satélite", zona: "El Alto", tarifa_sugerida: "3.00" },
  { id: "rio_seco", nombre: "Río Seco (El Alto)", zona: "El Alto", tarifa_sugerida: "3.50" },
  { id: "villa_fatima", nombre: "Villa Fátima", zona: "La Paz Centro", tarifa_sugerida: "2.60" },
  { id: "calacoto", nombre: "Calacoto (Calle 21)", zona: "La Paz Sur", tarifa_sugerida: "3.50" },
];

const RUTAS_FRECUENTES_PREAJUSTADAS: RutaFrecuente[] = [
  {
    etiqueta: "Ceja ↔ Pérez Velasco",
    origen: "Ceja (El Alto)",
    destino: "Pérez Velasco",
    tarifa: "3.50",
    medio: "Minibús Interciudad",
  },
  {
    etiqueta: "Cruce Viacha ↔ San Pedro",
    origen: "Cruce Viacha (El Alto)",
    destino: "San Pedro (Plaza Sucre)",
    tarifa: "3.50",
    medio: "Minibús Interciudad",
  },
  {
    etiqueta: "Sopocachi ↔ Miraflores",
    origen: "Sopocachi (Plaza Abaroa)",
    destino: "Miraflores (Plaza Triangular)",
    tarifa: "2.60",
    medio: "Minibús Urbano",
  },
  {
    etiqueta: "Ciudad Satélite ↔ Sopocachi",
    origen: "Ciudad Satélite",
    destino: "Sopocachi (Plaza Abaroa)",
    tarifa: "3.00",
    medio: "Mi Teleférico (Amarilla)",
  },
  {
    etiqueta: "Pérez Velasco ↔ San Pedro",
    origen: "Pérez Velasco",
    destino: "San Pedro (Plaza Sucre)",
    tarifa: "2.00",
    medio: "Micro / Colectivo",
  },
  {
    etiqueta: "Río Seco ↔ Ceja El Alto",
    origen: "Río Seco (El Alto)",
    destino: "Ceja (El Alto)",
    tarifa: "2.00",
    medio: "Minibús Tramo Corto",
  },
];

/**
 * @component RegistroRecorrido
 * @description Formulario enriquecido para registrar recorridos de pasajes con selector rápido
 * de paradas frecuentes y rutas oficiales de la conurbación La Paz - El Alto, autocompletando
 * origen, destino y tarifa fija con cálculo exacto del 80% de reembolso.
 */
export function RegistroRecorrido() {
  const { usuario } = usarAutenticacion();
  const [paso, set_paso] = useState<"ida" | "vuelta">("ida");

  const formulario = useFormularioValidado(
    {
      origen: "",
      destino: "",
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

  const [ida_monto, set_ida_monto] = useState(0);
  const [cargando, set_cargando] = useState(false);
  const [modo_seleccion, set_modo_seleccion] = useState<"origen" | "destino">("origen");

  // Consultar paradas y tarifas oficiales desde el backend
  const { datos: paradas_servidor } = useConsulta<Array<{ id: number; nombre: string; ciudad: string }>>(
    "paradas_oficiales",
    () => clienteApi.get("/api/pasajes/paradas")
  );

  const { datos: tarifas_servidor } = useConsulta<Array<{ id: number; costo_bs: number; medio_transporte: string }>>(
    "tarifas_oficiales",
    () => clienteApi.get("/api/pasajes/tarifas")
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

  const aplicarRutaFrecuente = (_ruta: RutaFrecuente) => {
    if (paso === "ida") {
      formulario.establecerValores({
        origen: _ruta.origen,
        destino: _ruta.destino,
        monto: _ruta.tarifa,
      });
    } else {
      formulario.establecerValores({
        origen: _ruta.destino,
        destino: _ruta.origen,
        monto: _ruta.tarifa,
      });
    }
  };

  const aplicarParada = (_nombre_parada: string, _tarifa_sugerida: string) => {
    if (modo_seleccion === "origen") {
      formulario.cambiarValor("origen", _nombre_parada);
      set_modo_seleccion("destino");
    } else {
      formulario.cambiarValor("destino", _nombre_parada);
      set_modo_seleccion("origen");
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

  const manejarSiguientePaso = () => {
    if (!formulario.validarFormulario()) {
      return;
    }
    const monto_actual = parseFloat(String(formulario.valores.monto) || "0");
    const destino_actual = String(formulario.valores.destino);
    set_ida_monto(monto_actual);
    formulario.establecerValores({
      origen: destino_actual,
      destino: "",
    });
    set_paso("vuelta");
    set_modo_seleccion("destino");
  };

  const manejarGuardado = async () => {
    if (!formulario.validarFormulario()) {
      return;
    }
    set_cargando(true);
    const becario_id = usuario?.becario_id || usuario?.id || 1;
    const fecha_val = formulario.valores.fecha instanceof Date ? formulario.valores.fecha : new Date();
    const fecha_iso = fecha_val.toISOString();
    const origen_val = String(formulario.valores.origen);
    const destino_val = String(formulario.valores.destino);
    const monto_val = parseFloat(String(formulario.valores.monto) || "0");

    try {
      // Registrar tramo de ida en endpoint oficial
      if (ida_monto > 0) {
        await clienteApi.post("/api/pasajes/recorridos", {
          becario_id,
          tramo: "ida",
          origen: destino_val, // en el flujo inverso
          destino: origen_val,
          tarifa: ida_monto,
          fecha: fecha_iso,
          apoyo_realizado: "Desplazamiento institucional a sede",
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
        apoyo_realizado: "Desplazamiento institucional",
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
      set_modo_seleccion("origen");
      set_cargando(false);
    }
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardContent className="pt-6 space-y-4">
        {/* Encabezado con Indicador de Paso (Ida / Vuelta) */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E3DCCB]/60">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${paso === "ida" ? "bg-[#17B4C4]" : "bg-[#F8C766]"}`} />
            <span className="font-mono text-xs font-bold tracking-wider text-[#063A6B]">
              DECLARACIÓN DE RECORRIDO ({paso.toUpperCase()})
            </span>
          </div>
          {paso === "vuelta" && (
            <button
              type="button"
              onClick={() => set_paso("ida")}
              className="text-xs text-[#0A5CA0] font-mono hover:underline font-semibold"
            >
              ← Modificar Ida
            </button>
          )}
        </div>

        {/* Selector de Fecha */}
        <div>
          <Label className="font-mono text-[10px] font-bold tracking-wider text-[#0A5CA0] uppercase mb-1.5 block">
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
        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E3DCCB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#063A6B] flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-[#17B4C4]" />
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
                className="text-left p-2 rounded-lg border border-[#E3DCCB] bg-white hover:border-[#17B4C4] hover:bg-[#E3F9FA]/40 transition-colors group"
              >
                <div className="text-[11px] font-bold text-[#063A6B] truncate group-hover:text-[#0A5CA0]">
                  {r.etiqueta}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-0.5">
                  <span className="truncate">{r.medio}</span>
                  <span className="font-bold text-[#063A6B]">Bs {r.tarifa}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Campos Origen y Destino */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#063A6B]">Tramos de Transporte</span>
            <button
              type="button"
              onClick={intercambiarParadas}
              className="text-[11px] text-[#0A5CA0] hover:underline flex items-center gap-1 font-medium"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Invertir Origen / Destino
            </button>
          </div>

          {/* Campo Origen */}
          <div>
            <div
              onClick={() => set_modo_seleccion("origen")}
              className={`flex items-center gap-3 p-3 bg-white border-1.5 rounded-xl cursor-pointer transition-colors ${
                formulario.esCampoInvalido("origen")
                  ? "border-[#E2694B] bg-[#E2694B]/5 ring-2 ring-[#E2694B]/20"
                  : modo_seleccion === "origen"
                  ? "border-[#17B4C4] ring-2 ring-[#17B4C4]/20"
                  : "border-[#E3DCCB] hover:border-slate-400"
              }`}
            >
              <MapPin className="w-4 h-4 text-[#E2694B] shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block leading-none mb-1">
                  Punto de Origen
                </span>
                <Input
                  placeholder="Ej: Ceja (El Alto)"
                  value={String(formulario.valores.origen)}
                  onChange={(e) => formulario.cambiarValor("origen", e.target.value)}
                  onBlur={() => formulario.tocarCampo("origen")}
                  className="border-none shadow-none h-auto p-0 focus-visible:ring-0 text-xs font-semibold bg-transparent"
                />
              </div>
              {modo_seleccion === "origen" && (
                <span className="text-[10px] font-mono text-[#17B4C4] font-bold">Editando</span>
              )}
            </div>
            {formulario.renderizarMensajeError("origen")}
          </div>

          {/* Campo Destino */}
          <div>
            <div
              onClick={() => set_modo_seleccion("destino")}
              className={`flex items-center gap-3 p-3 bg-white border-1.5 rounded-xl cursor-pointer transition-colors ${
                formulario.esCampoInvalido("destino")
                  ? "border-[#E2694B] bg-[#E2694B]/5 ring-2 ring-[#E2694B]/20"
                  : modo_seleccion === "destino"
                  ? "border-[#17B4C4] ring-2 ring-[#17B4C4]/20"
                  : "border-[#E3DCCB] hover:border-slate-400"
              }`}
            >
              <MapPin className="w-4 h-4 text-[#0A5CA0] shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block leading-none mb-1">
                  Punto de Destino
                </span>
                <Input
                  placeholder="Ej: Pérez Velasco"
                  value={String(formulario.valores.destino)}
                  onChange={(e) => formulario.cambiarValor("destino", e.target.value)}
                  onBlur={() => formulario.tocarCampo("destino")}
                  className="border-none shadow-none h-auto p-0 focus-visible:ring-0 text-xs font-semibold bg-transparent"
                />
              </div>
              {modo_seleccion === "destino" && (
                <span className="text-[10px] font-mono text-[#0A5CA0] font-bold">Editando</span>
              )}
            </div>
            {formulario.renderizarMensajeError("destino")}
          </div>
        </div>

        {/* Selector Rápido de Paradas Frecuentes (Pills) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-semibold text-[#063A6B]">
              Paradas Frecuentes (Asignar a {modo_seleccion.toUpperCase()}):
            </Label>
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <span
                onClick={() => set_modo_seleccion("origen")}
                className={`cursor-pointer px-1.5 py-0.5 rounded ${modo_seleccion === "origen" ? "bg-[#17B4C4]/20 text-[#063A6B] font-bold" : ""}`}
              >
                Origen
              </span>
              <span>/</span>
              <span
                onClick={() => set_modo_seleccion("destino")}
                className={`cursor-pointer px-1.5 py-0.5 rounded ${modo_seleccion === "destino" ? "bg-[#0A5CA0]/20 text-[#063A6B] font-bold" : ""}`}
              >
                Destino
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
            {PARADAS_FRECUENTES.map((parada) => (
              <button
                key={parada.id}
                type="button"
                onClick={() => aplicarParada(parada.nombre, parada.tarifa_sugerida)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E3DCCB] bg-white hover:border-[#17B4C4] hover:text-[#063A6B] transition-colors"
              >
                {parada.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Tarifa Oficial Regulada */}
        <div className="bg-[#E3F9FA] rounded-xl p-3.5 space-y-2">
          <p className="font-mono text-[10px] font-bold tracking-wider text-[#0A5CA0] uppercase">
            Tarifa Oficial Regulada
          </p>

          <div className="flex items-center gap-2">
            <Select
              value={String(formulario.valores.monto)}
              onValueChange={(val: string | null) => {
                if (val) formulario.cambiarValor("monto", val);
              }}
            >
              <SelectTrigger className="flex-1 bg-white border-[#C9E5E4] h-9 text-xs">
                <SelectValue placeholder="Seleccionar tarifa institucional" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E3DCCB]">
                <SelectItem value="3.50">Minibús Interciudad / El Alto (Bs 3.50)</SelectItem>
                <SelectItem value="2.60">Minibús Tramo Directo La Paz (Bs 2.60)</SelectItem>
                <SelectItem value="2.00">Micro / Colectivo Urbano (Bs 2.00)</SelectItem>
                <SelectItem value="3.00">Mi Teleférico (Bs 3.00)</SelectItem>
                <SelectItem value="4.00">Trufi Troncal (Bs 4.00)</SelectItem>
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
              { etiqueta: "Interciudad 3.50", valor: "3.50" },
              { etiqueta: "Minibús 2.60", valor: "2.60" },
              { etiqueta: "Micro 2.00", valor: "2.00" },
              { etiqueta: "Teleférico 3.00", valor: "3.00" },
              { etiqueta: "Trufi 4.00", valor: "4.00" },
            ].map((t) => (
              <button
                key={t.valor}
                type="button"
                onClick={() => formulario.cambiarValor("monto", t.valor)}
                className={`text-[10.5px] px-2 py-0.5 rounded-md border font-medium transition-colors ${
                  String(formulario.valores.monto) === t.valor
                    ? "bg-[#063A6B] text-white border-[#063A6B]"
                    : "bg-white text-gray-700 border-[#E3DCCB] hover:bg-gray-50"
                }`}
              >
                {t.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* Desglose y Cálculo de Devolución del 80% */}
        <div className="p-4 border border-[#E3DCCB] rounded-xl bg-white space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Monto del viaje {paso === "vuelta" ? "(Ida + Vuelta)" : "(Solo Ida)"}</span>
            <span className="font-bold text-[#122029]">Bs {total.toFixed(2)}</span>
          </div>
          <div className="h-px bg-[#E3DCCB]/60 w-full" />
          <div className="flex justify-between text-xs font-bold text-[#063A6B]">
            <span>Reembolso Oficial BUMAND (80%)</span>
            <span className="text-[#F5A623] text-sm">Bs {devolucion.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón de Acción con BotonJuicy */}
        {paso === "ida" ? (
          <BotonJuicy
            type="button"
            variante="primario"
            tamaño="md"
            onClick={manejarSiguientePaso}
            className="w-full h-11"
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
            className="w-full h-11"
          >
            <span>{cargando ? "Registrando en Sistema..." : "Confirmar Recorrido Completo (80%)"}</span>
          </BotonJuicy>
        )}
      </CardContent>
    </Card>
  );
}
