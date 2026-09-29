"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usarAutenticacion } from "@/context/AutenticacionContexto";

/**
 * @component RegistroRecorrido
 * @description Formulario para registrar un viaje (Pasajes) con flujo Ida/Vuelta y cálculo de devolución del 80%.
 */
export function RegistroRecorrido() {
  const { token, usuario } = usarAutenticacion();
  const [paso, set_paso] = useState<"ida" | "vuelta">("ida");
  const [origen, set_origen] = useState("");
  const [destino, set_destino] = useState("");
  const [monto, set_monto] = useState("");
  
  const [ida_monto, set_ida_monto] = useState(0);
  const [cargando, set_cargando] = useState(false);

  const total = paso === "ida" ? parseFloat(monto || "0") : ida_monto + parseFloat(monto || "0");
  const devolucion = total * 0.8;

  const manejarSiguientePaso = () => {
    set_ida_monto(parseFloat(monto));
    set_origen(destino); // Destino de ida es el origen de vuelta
    set_destino("");
    set_monto("");
    set_paso("vuelta");
  };

  const manejarGuardado = async () => {
    set_cargando(true);
    try {
      const carga_util = {
        becario_id: usuario?.becario_id || 1, // backend property becario_id must remain camelCase if entity requires it
        ida_monto: ida_monto,
        vuelta_monto: parseFloat(monto || "0"),
        total,
        devolucion,
        fecha: new Date().toISOString()
      };
      
      // Simular POST a /pasajes/recorridos
      await new Promise(r => setTimeout(r, 800));
      
      alert(`Recorrido completo guardado. Total a devolver: Bs ${devolucion.toFixed(2)}`);
      set_paso("ida");
      set_origen("");
      set_destino("");
      set_monto("");
      set_ida_monto(0);
    } catch (error) {
      alert("Error al guardar recorrido");
    } finally {
      set_cargando(false);
    }
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm">
      <CardContent className="pt-6 space-y-4">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${paso === "ida" ? "bg-[#17B4C4]" : "bg-[#F8C766]"}`} />
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#122029]">
              NUEVO RECORRIDO ({paso.toUpperCase()})
            </span>
          </div>
          {paso === "vuelta" && (
            <button 
              onClick={() => set_paso("ida")} 
              className="text-[11px] text-[#0A5CA0] font-mono hover:underline"
            >
              ← Volver a Ida
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white border-1.5 border-[#E3DCCB] rounded-xl focus-within:border-[#17B4C4] transition-colors">
            <span className="text-[#E2694B] text-[15px]">📍</span>
            <Input 
              placeholder="Origen"
              value={origen}
              onChange={(e) => set_origen(e.target.value)}
              className="border-none shadow-none h-auto p-0 focus-visible:ring-0 text-[14px]"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border-1.5 border-[#E3DCCB] rounded-xl focus-within:border-[#17B4C4] transition-colors">
            <span className="text-[#0A5CA0] text-[15px]">📍</span>
            <Input 
              placeholder="Destino"
              value={destino}
              onChange={(e) => set_destino(e.target.value)}
              className="border-none shadow-none h-auto p-0 focus-visible:ring-0 text-[14px]"
            />
          </div>
        </div>

        <div className="bg-[#E3F9FA] rounded-xl p-3 mt-4">
          <p className="font-mono text-[9.5px] font-bold tracking-wider text-[#0A5CA0] mb-2">TARIFA</p>
          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="flex-1 bg-white border-[#C9E5E4] h-9 text-[12px]">
                <SelectValue placeholder="Tipo Transporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bus">Bus / Corredor</SelectItem>
                <SelectItem value="tren">Metro / Tren</SelectItem>
                <SelectItem value="taxi">Taxi / Aplicación</SelectItem>
              </SelectContent>
            </Select>
            <span className="font-mono text-[#8A9BA4]">-</span>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={monto}
              onChange={(e) => set_monto(e.target.value)}
              className="w-20 bg-white border-[#C9E5E4] h-9 text-[12px] font-mono"
            />
          </div>
        </div>

        {/* CÁLCULO DE DEVOLUCIÓN (NUEVO) */}
        <div className="mt-4 p-4 border border-[#E3DCCB] rounded-xl bg-white space-y-2">
          <div className="flex justify-between text-[13px] text-muted-foreground">
            <span>Monto total del pasaje</span>
            <span className="font-bold text-[#122029]">Bs {total.toFixed(2)}</span>
          </div>
          <div className="h-[1px] bg-[#E3DCCB]/50 w-full" />
          <div className="flex justify-between text-[14px] font-bold text-[#0A5CA0]">
            <span>Devolución del 80%</span>
            <span className="text-[#F5A623]">Bs {devolucion.toFixed(2)}</span>
          </div>
        </div>

        {paso === "ida" ? (
          <Button 
            onClick={manejarSiguientePaso}
            disabled={!origen || !destino || !monto}
            className="w-full h-11 rounded-xl bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold mt-2"
          >
            Continuar a Vuelta
          </Button>
        ) : (
          <Button 
            onClick={manejarGuardado}
            disabled={cargando || !origen || !destino || !monto}
            className="w-full h-11 rounded-xl bg-[#3FA66B] hover:bg-[#3FA66B]/90 text-white font-bold mt-2"
          >
            {cargando ? "Registrando..." : "Confirmar Recorrido Completo"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

