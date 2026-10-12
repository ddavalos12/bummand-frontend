"use client";

import { useState } from "react";
import { Plus, Edit2, Bus, Calendar, DollarSign, CheckCircle2, History, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

export interface TarifaItem {
  id: number;
  medio_transporte: string;
  descripcion: string;
  costo_bs: number | string;
  tramo_tipo: string;
  activo: boolean;
  vigente_desde: string;
  vigente_hasta?: string | null;
  created_at?: string;
}

const TARIFAS_FALLBACK: TarifaItem[] = [
  { id: 1, medio_transporte: "Micro / Colectivo Urbano", descripcion: "Ruta regular La Paz / El Alto", costo_bs: 2.00, tramo_tipo: "urbano", activo: true, vigente_desde: "2026-01-01", vigente_hasta: null },
  { id: 2, medio_transporte: "Minibús Tramo Corto", descripcion: "Parada intermedia o tramo corto", costo_bs: 2.00, tramo_tipo: "urbano", activo: true, vigente_desde: "2026-01-01", vigente_hasta: null },
  { id: 3, medio_transporte: "Minibús Tramo Directo", descripcion: "Ruta directa troncal urbana", costo_bs: 2.60, tramo_tipo: "urbano", activo: true, vigente_desde: "2026-01-01", vigente_hasta: null },
  { id: 4, medio_transporte: "Mi Teleférico", descripcion: "Línea de red por tramo", costo_bs: 3.00, tramo_tipo: "interciudad", activo: true, vigente_desde: "2026-01-01", vigente_hasta: null },
  { id: 5, medio_transporte: "Minibús Interciudad / El Alto", descripcion: "Tramo La Paz - El Alto o extralargo", costo_bs: 3.50, tramo_tipo: "interciudad", activo: true, vigente_desde: "2026-01-01", vigente_hasta: null },
  { id: 6, medio_transporte: "Trufi Troncal", descripcion: "Ruta fija troncal", costo_bs: 4.00, tramo_tipo: "urbano", activo: true, vigente_desde: "2026-01-01", vigente_hasta: null },
];

export function GestionTarifas() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const { datos: tarifas_servidor, invalidar, cargando } = useConsulta<TarifaItem[]>(
    "todas_las_tarifas",
    async () => {
      try {
        const respuesta = await clienteApi.get<TarifaItem[]>("/api/pasajes/tarifas/todas");
        return Array.isArray(respuesta) && respuesta.length > 0 ? respuesta : TARIFAS_FALLBACK;
      } catch {
        return TARIFAS_FALLBACK;
      }
    }
  );

  const lista_tarifas = tarifas_servidor || TARIFAS_FALLBACK;

  const [dialogo_abierto, set_dialogo_abierto] = useState(false);
  const [tarifa_editar, set_tarifa_editar] = useState<TarifaItem | null>(null);
  const [guardando, set_guardando] = useState(false);

  // Formulario
  const [medio_transporte, set_medio_transporte] = useState("");
  const [descripcion, set_descripcion] = useState("");
  const [costo_bs, set_costo_bs] = useState("2.60");
  const [tramo_tipo, set_tramo_tipo] = useState("urbano");
  const [vigente_desde, set_vigente_desde] = useState(new Date().toISOString().split("T")[0]);
  const [vigente_hasta, set_vigente_hasta] = useState("");

  const abrirCreacion = () => {
    set_tarifa_editar(null);
    set_medio_transporte("Minibús Tramo Directo");
    set_descripcion("Ruta directa troncal La Paz / El Alto");
    set_costo_bs("2.60");
    set_tramo_tipo("urbano");
    set_vigente_desde(new Date().toISOString().split("T")[0]);
    set_vigente_hasta("");
    set_dialogo_abierto(true);
  };

  const abrirEdicion = (item: TarifaItem) => {
    set_tarifa_editar(item);
    set_medio_transporte(item.medio_transporte);
    set_descripcion(item.descripcion);
    set_costo_bs(String(item.costo_bs));
    set_tramo_tipo(item.tramo_tipo || "urbano");
    set_vigente_desde(item.vigente_desde ? String(item.vigente_desde).split("T")[0] : "");
    set_vigente_hasta(item.vigente_hasta ? String(item.vigente_hasta).split("T")[0] : "");
    set_dialogo_abierto(true);
  };

  const guardarTarifa = async () => {
    if (!medio_transporte.trim()) {
      toast.error("El medio de transporte es obligatorio.");
      return;
    }
    const monto = parseFloat(costo_bs);
    if (isNaN(monto) || monto <= 0) {
      toast.error("El costo debe ser mayor a 0 Bs.");
      return;
    }
    if (!vigente_desde) {
      toast.error("La fecha de vigencia es obligatoria.");
      return;
    }

    set_guardando(true);
    try {
      if (tarifa_editar) {
        await clienteApi.patch(`/api/pasajes/tarifas/${tarifa_editar.id}`, {
          medio_transporte,
          descripcion,
          costo_bs: monto,
          tramo_tipo,
          vigente_desde,
          vigente_hasta: vigente_hasta.trim() || null,
        });
        toast.success("Tarifa actualizada exitosamente.");
      } else {
        await clienteApi.post("/api/pasajes/tarifas", {
          medio_transporte,
          descripcion,
          costo_bs: monto,
          tramo_tipo,
          vigente_desde,
          vigente_hasta: vigente_hasta.trim() || null,
          activo: true,
        });
        toast.success("Nueva tarifa oficial promulgada exitosamente.");
      }
      set_dialogo_abierto(false);
      invalidar();
    } catch (error: any) {
      toast.error(error?.message || "Error al procesar la tarifa.");
    } finally {
      set_guardando(false);
    }
  };

  const hoy_str = new Date().toISOString().split("T")[0];

  const resolverEstadoVigencia = (t: TarifaItem) => {
    const desde = t.vigente_desde ? String(t.vigente_desde).split("T")[0] : "";
    const hasta = t.vigente_hasta ? String(t.vigente_hasta).split("T")[0] : null;

    if (desde > hoy_str) {
      return {
        etiqueta: "Programada a futuro",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icono: Clock,
      };
    }
    if (hasta && hasta < hoy_str) {
      return {
        etiqueta: "Histórica / Cerrada",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icono: History,
      };
    }
    return {
      etiqueta: "Vigente Actual",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icono: CheckCircle2,
    };
  };

  return (
    <Card className="border border-border shadow-xs bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#063A6B]">
            <Bus className="h-5 w-5 text-[#0A5CA0]" />
            Tarifario Institucional Oficial (La Paz – El Alto)
          </CardTitle>
          <CardDescription>
            Configuración y vigencia temporal de tarifas para liquidación del 80% de viáticos.
          </CardDescription>
        </div>
        {es_admin && (
          <Button
            onClick={abrirCreacion}
            className="bg-[#0A5CA0] hover:bg-[#063A6B] text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarifa Oficial
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground uppercase text-[11px] font-mono tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3">Medio de Transporte</th>
                <th className="px-4 py-3">Costo Oficial</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3">Estado</th>
                {es_admin && <th className="px-4 py-3 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista_tarifas.map((t) => {
                const estado = resolverEstadoVigencia(t);
                const IconoEstado = estado.icono;
                const costo_formateado = Number(t.costo_bs).toFixed(2);

                return (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{t.medio_transporte}</div>
                      <div className="text-xs text-muted-foreground">{t.descripcion}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold font-mono text-base text-[#0A5CA0]">
                        Bs {costo_formateado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t.tramo_tipo || "urbano"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Desde: {String(t.vigente_desde).split("T")[0]}</span>
                      </div>
                      {t.vigente_hasta && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Hasta: {String(t.vigente_hasta).split("T")[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs gap-1 py-0.5 ${estado.color}`}>
                        <IconoEstado className="h-3.5 w-3.5" />
                        {estado.etiqueta}
                      </Badge>
                    </td>
                    {es_admin && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirEdicion(t)}
                          className="h-8 w-8 p-0"
                          title="Editar tarifa o vigencia"
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Modal de Creación / Edición */}
      <Dialog open={dialogo_abierto} onOpenChange={set_dialogo_abierto}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[#063A6B]">
              {tarifa_editar ? "Modificar Tarifa Oficial" : "Promulgar Nueva Tarifa Oficial"}
            </DialogTitle>
            <DialogDescription>
              {tarifa_editar
                ? "Ajusta los valores o la fecha de cierre de la tarifa seleccionada."
                : "Registra una nueva tarifa oficial con fecha de inicio (admite fechas retroactivas)."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Medio de Transporte</Label>
              <Input
                value={medio_transporte}
                onChange={(e) => set_medio_transporte(e.target.value)}
                placeholder="Ej. Minibús Tramo Directo"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Descripción o Cobertura</Label>
              <Input
                value={descripcion}
                onChange={(e) => set_descripcion(e.target.value)}
                placeholder="Ej. Ruta troncal Centro La Paz – El Alto"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Costo Oficial (Bs)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">Bs</span>
                  <Input
                    type="number"
                    step="0.10"
                    min="0.50"
                    value={costo_bs}
                    onChange={(e) => set_costo_bs(e.target.value)}
                    className="pl-9 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Tipo de Tramo</Label>
                <Select value={tramo_tipo} onValueChange={(val) => set_tramo_tipo(val || "urbano")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urbano">Urbano</SelectItem>
                    <SelectItem value="interciudad">Interciudad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Vigente Desde (Fecha)</Label>
                <Input
                  type="date"
                  value={vigente_desde}
                  onChange={(e) => set_vigente_desde(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  Puede ser fecha pasada para reajuste retroactivo.
                </span>
              </div>

              <div>
                <Label className="text-xs font-semibold">Vigente Hasta (Opcional)</Label>
                <Input
                  type="date"
                  value={vigente_hasta}
                  onChange={(e) => set_vigente_hasta(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  En blanco si sigue vigente indefinidamente.
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => set_dialogo_abierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              onClick={guardarTarifa}
              disabled={guardando}
              className="bg-[#0A5CA0] hover:bg-[#063A6B] text-white"
            >
              {guardando ? "Guardando..." : tarifa_editar ? "Actualizar Tarifa" : "Promulgar Tarifa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
