"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import {
  FileCheck2,
  Building2,
  FolderArchive,
  Users,
  Sparkles,
  Coffee,
  Bus,
  Loader2,
  Calendar,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  FIRMANTES_OFICIALES_DONACION,
  descargarPdfDonacionRefrigerio,
  descargarPdfDonacionTransporte,
  type ClaveFirmanteDonacion,
} from "@/servicios/pdf.servicio";

export interface SelectorPlanillaDonacionProps {
  tipo_disponible?: "ambos" | "refrigerio" | "transporte";
  fecha_inicio?: string;
  fecha_fin?: string;
  mes_inicial?: string;
  al_cambiar_fechas?: (fecha_inicio: string, fecha_fin: string) => void;
  mostrar_selector_periodo?: boolean;
  titulo?: string;
  subtitulo?: string;
  etiqueta_insignia?: string;
  className?: string;
}

interface CombinacionPresetFirmantes {
  etiqueta: string;
  firmante_1: ClaveFirmanteDonacion;
  firmante_2: ClaveFirmanteDonacion;
}

const PRESETS_FIRMANTES: readonly CombinacionPresetFirmantes[] = [
  { etiqueta: "Pamela + Samuel", firmante_1: "pamela", firmante_2: "samuel" },
  { etiqueta: "Ruth + Samuel", firmante_1: "ruth", firmante_2: "samuel" },
  { etiqueta: "Ruth + Pamela", firmante_1: "ruth", firmante_2: "pamela" },
] as const;

function calcularRangoDeMes(mes_iso: string): { inicio: string; fin: string } | null {
  const coincidencia = /^(\d{4})-(\d{2})$/.exec(mes_iso.trim());
  if (!coincidencia) return null;
  const ano = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  if (mes < 1 || mes > 12) return null;
  const ultimo_dia = new Date(ano, mes, 0).getDate();
  return {
    inicio: `${coincidencia[1]}-${coincidencia[2]}-01`,
    fin: `${coincidencia[1]}-${coincidencia[2]}-${String(ultimo_dia).padStart(2, "0")}`,
  };
}

export function SelectorPlanillaDonacion({
  tipo_disponible = "ambos",
  fecha_inicio = "2026-10-01",
  fecha_fin = "2026-10-31",
  mes_inicial = "",
  al_cambiar_fechas,
  mostrar_selector_periodo = true,
  titulo = "Planillas Oficiales de Donación (Contabilidad y Archivo del Área)",
  subtitulo = "Emisión oficial en PDF con selección de destino documental y autoridades firmantes.",
  etiqueta_insignia = "FORMATO OFICIAL DIACONÍA",
  className = "",
}: SelectorPlanillaDonacionProps) {
  const [con_firma, set_con_firma] = useState<boolean>(false);
  const [firmante_1, set_firmante_1] = useState<ClaveFirmanteDonacion>("pamela");
  const [firmante_2, set_firmante_2] = useState<ClaveFirmanteDonacion>("samuel");
  const [fecha_inicio_estado, set_fecha_inicio_estado] = useState<string>(fecha_inicio);
  const [fecha_fin_estado, set_fecha_fin_estado] = useState<string>(fecha_fin);
  const [mes_seleccionado, set_mes_seleccionado] = useState<string>(mes_inicial);
  const [descargando_tipo, set_descargando_tipo] = useState<"refrigerio" | "transporte" | null>(null);

  useEffect(() => {
    set_fecha_inicio_estado(fecha_inicio);
  }, [fecha_inicio]);

  useEffect(() => {
    set_fecha_fin_estado(fecha_fin);
  }, [fecha_fin]);

  const info_firmante_1 = FIRMANTES_OFICIALES_DONACION.find((f) => f.clave === firmante_1);
  const info_firmante_2 = FIRMANTES_OFICIALES_DONACION.find((f) => f.clave === firmante_2);

  const manejarCambioMes = (nuevo_mes: string) => {
    set_mes_seleccionado(nuevo_mes);
    const rango = calcularRangoDeMes(nuevo_mes);
    if (rango) {
      set_fecha_inicio_estado(rango.inicio);
      set_fecha_fin_estado(rango.fin);
      al_cambiar_fechas?.(rango.inicio, rango.fin);
    }
  };

  const manejarCambioFechaInicio = (nueva_fecha: string) => {
    set_mes_seleccionado("");
    set_fecha_inicio_estado(nueva_fecha);
    al_cambiar_fechas?.(nueva_fecha, fecha_fin_estado);
  };

  const manejarCambioFechaFin = (nueva_fecha: string) => {
    set_mes_seleccionado("");
    set_fecha_fin_estado(nueva_fecha);
    al_cambiar_fechas?.(fecha_inicio_estado, nueva_fecha);
  };

  const manejarSeleccionFirmante1 = (nueva_clave: ClaveFirmanteDonacion) => {
    if (nueva_clave === firmante_2) {
      set_firmante_2(firmante_1);
    }
    set_firmante_1(nueva_clave);
  };

  const manejarSeleccionFirmante2 = (nueva_clave: ClaveFirmanteDonacion) => {
    if (nueva_clave === firmante_1) {
      set_firmante_1(firmante_2);
    }
    set_firmante_2(nueva_clave);
  };

  const aplicarPreset = (preset: CombinacionPresetFirmantes) => {
    set_firmante_1(preset.firmante_1);
    set_firmante_2(preset.firmante_2);
  };

  const manejarDescarga = async (tipo: "refrigerio" | "transporte") => {
    if (firmante_1 === firmante_2) {
      toast.error("Seleccione dos firmantes distintos para emitir la planilla.");
      return;
    }

    const nombre_planilla =
      tipo === "refrigerio" ? "Donación para Refrigerio BUMAN-D" : "Donación para Transporte BUMAN-D";
    const destino_texto = con_firma
      ? "Para Archivo del Área (Con firma de becarios)"
      : "Para Contabilidad (Sin firma de becarios)";

    try {
      set_descargando_tipo(tipo);
      toast.info(`Generando ${nombre_planilla}...`, {
        description: `${destino_texto} · ${fecha_inicio_estado} al ${fecha_fin_estado}`,
      });

      const parametros = {
        fecha_inicio: fecha_inicio_estado || undefined,
        fecha_fin: fecha_fin_estado || undefined,
        mes: mes_seleccionado || undefined,
        con_firma,
        firmante_1,
        firmante_2,
        descargar_inmediatamente: true,
      };

      if (tipo === "refrigerio") {
        await descargarPdfDonacionRefrigerio(parametros);
      } else {
        await descargarPdfDonacionTransporte(parametros);
      }

      toast.success(`${nombre_planilla} descargada exitosamente`, {
        description: destino_texto,
      });
    } catch (error) {
      const mensaje_real =
        error instanceof Error && error.message
          ? error.message
          : "No se pudo generar la planilla solicitada en el servidor.";
      toast.error(`Error al emitir ${nombre_planilla}`, {
        description: mensaje_real,
      });
    } finally {
      set_descargando_tipo(null);
    }
  };

  return (
    <Card
      className={`border-[#00ABBD]/35 shadow-sm bg-gradient-to-br from-white via-[#F8FAFC] to-[#00ABBD]/5 rounded-2xl overflow-hidden ring-1 ring-[#00ABBD]/15 ${className}`}
    >
      <CardHeader className="pb-3 border-b border-[#E5E7EB] bg-[#035683]/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <CardTitle className="text-base font-bold font-display text-[#035683] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#00ABBD] shrink-0" />
              <span>{titulo}</span>
            </CardTitle>
            <CardDescription className="text-xs text-[#808080] mt-0.5">
              {subtitulo}
            </CardDescription>
          </div>
          <Badge className="bg-[#035683] text-[#FFB600] border-none text-[11px] font-poppins font-semibold rounded-full px-3 py-1 self-start sm:self-center shrink-0">
            {etiqueta_insignia}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Paso 1: Destino del Documento */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#00ABBD]" />
              <span>1. Destino del Documento</span>
            </Label>
            <span className="text-[11px] text-[#808080]">
              Ambas versiones llevan las 2 firmas institucionales al pie; solo cambia la columna FIRMA de becarios.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={!con_firma}
              onClick={() => set_con_firma(false)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                !con_firma
                  ? "bg-[#035683]/5 border-[#035683] ring-2 ring-[#035683]/20 shadow-xs"
                  : "bg-white border-[#E5E7EB] hover:border-[#00ABBD]/60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !con_firma
                    ? "bg-[#035683] text-[#FFB600]"
                    : "bg-slate-100 text-[#035683]"
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#035683]">
                    Para Contabilidad (Sin firma de becarios)
                  </span>
                  {!con_firma && (
                    <CheckCircle2 className="w-4 h-4 text-[#00ABBD] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#808080] leading-relaxed">
                  Incluye las 2 firmas institucionales al pie. Omite la columna FIRMA individual para trámite contable y desembolso.
                </p>
              </div>
            </button>

            <button
              type="button"
              aria-pressed={con_firma}
              onClick={() => set_con_firma(true)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                con_firma
                  ? "bg-[#00ABBD]/10 border-[#00ABBD] ring-2 ring-[#00ABBD]/25 shadow-xs"
                  : "bg-white border-[#E5E7EB] hover:border-[#00ABBD]/60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  con_firma
                    ? "bg-[#00ABBD] text-white"
                    : "bg-slate-100 text-[#00808E]"
                }`}
              >
                <FolderArchive className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#035683]">
                    Para Archivo del Área (Con firma de becarios)
                  </span>
                  {con_firma && (
                    <CheckCircle2 className="w-4 h-4 text-[#00ABBD] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#808080] leading-relaxed">
                  Incluye las 2 firmas institucionales al pie más la columna FIRMA individual para recabar rúbrica de cada becario.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Paso 2: Periodo (opcional o informativo) */}
        {mostrar_selector_periodo ? (
          <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00ABBD]" />
              <span>2. Periodo o Rango de Fechas</span>
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="selector-mes-donacion" className="text-[11px] font-semibold text-[#1A1A1A]">
                  Mes rápido (opcional)
                </Label>
                <input
                  id="selector-mes-donacion"
                  type="month"
                  value={mes_seleccionado}
                  onChange={(e) => manejarCambioMes(e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#1A1A1A] shadow-2xs transition-colors focus-visible:outline-none focus-visible:border-[#00ABBD] focus-visible:ring-2 focus-visible:ring-[#00ABBD]/20"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#1A1A1A]">Fecha Inicio</Label>
                <SeleccionadorFecha
                  valorString={fecha_inicio_estado}
                  alCambiarString={manejarCambioFechaInicio}
                  className="h-9 text-xs border-[#E5E7EB] bg-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-[#1A1A1A]">Fecha Fin</Label>
                <SeleccionadorFecha
                  valorString={fecha_fin_estado}
                  alCambiarString={manejarCambioFechaFin}
                  className="h-9 text-xs border-[#E5E7EB] bg-white rounded-xl"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs">
            <span className="font-semibold text-[#035683] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00ABBD]" />
              Rango de fechas activo:
            </span>
            <Badge
              variant="outline"
              className="rounded-full border-[#00ABBD]/40 bg-[#00ABBD]/5 text-[#035683] font-poppins font-semibold text-[11px]"
            >
              {fecha_inicio_estado} al {fecha_fin_estado}
            </Badge>
          </div>
        )}

        {/* Paso 3: Firmantes Institucionales */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00ABBD]" />
              <span>{mostrar_selector_periodo ? "3." : "2."} Firmantes Institucionales al Pie</span>
            </Label>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-[#808080] flex items-center gap-1 mr-0.5">
                <Sparkles className="w-3 h-3 text-[#FFB600]" />
                Combinaciones rápidas:
              </span>
              {PRESETS_FIRMANTES.map((preset) => {
                const activo =
                  firmante_1 === preset.firmante_1 && firmante_2 === preset.firmante_2;
                return (
                  <button
                    key={preset.etiqueta}
                    type="button"
                    onClick={() => aplicarPreset(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-poppins font-semibold border transition-all cursor-pointer ${
                      activo
                        ? "bg-[#035683] text-white border-[#035683] shadow-2xs"
                        : "bg-[#F8FAFC] text-[#035683] border-[#E5E7EB] hover:border-[#00ABBD] hover:bg-[#00ABBD]/10"
                    }`}
                  >
                    {preset.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-[#1A1A1A]">
                Firmante 1 · Solicita / Elabora
              </Label>
              <Select
                value={firmante_1}
                onValueChange={(val) =>
                  val && manejarSeleccionFirmante1(val as ClaveFirmanteDonacion)
                }
              >
                <SelectTrigger className="h-10 text-xs font-semibold border-[#E5E7EB] bg-[#F8FAFC] rounded-xl">
                  <SelectValue placeholder="Seleccione firmante 1" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {FIRMANTES_OFICIALES_DONACION.map((firmante) => (
                    <SelectItem
                      key={firmante.clave}
                      value={firmante.clave}
                      disabled={firmante.clave === firmante_2}
                      etiqueta={firmante.nombre}
                    >
                      <div className="flex flex-col py-0.5 text-left">
                        <span className="font-semibold text-[#1A1A1A] text-xs">
                          {firmante.nombre}
                        </span>
                        <span className="text-[10px] text-[#808080]">
                          {firmante.cargo}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {info_firmante_1 && (
                <p className="text-[11px] text-[#808080] pl-1">{info_firmante_1.cargo}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-[#1A1A1A]">
                Firmante 2 · Aprueba
              </Label>
              <Select
                value={firmante_2}
                onValueChange={(val) =>
                  val && manejarSeleccionFirmante2(val as ClaveFirmanteDonacion)
                }
              >
                <SelectTrigger className="h-10 text-xs font-semibold border-[#E5E7EB] bg-[#F8FAFC] rounded-xl">
                  <SelectValue placeholder="Seleccione firmante 2" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {FIRMANTES_OFICIALES_DONACION.map((firmante) => (
                    <SelectItem
                      key={firmante.clave}
                      value={firmante.clave}
                      disabled={firmante.clave === firmante_1}
                      etiqueta={firmante.nombre}
                    >
                      <div className="flex flex-col py-0.5 text-left">
                        <span className="font-semibold text-[#1A1A1A] text-xs">
                          {firmante.nombre}
                        </span>
                        <span className="text-[10px] text-[#808080]">
                          {firmante.cargo}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {info_firmante_2 && (
                <p className="text-[11px] text-[#808080] pl-1">{info_firmante_2.cargo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Acciones de Emisión PDF */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-[#808080]">
            Versión seleccionada:{" "}
            <span className="font-bold text-[#035683]">
              {con_firma
                ? "Archivo del Área (Con columna FIRMA)"
                : "Contabilidad (Sin firma de becarios)"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(tipo_disponible === "ambos" || tipo_disponible === "refrigerio") && (
              <Button
                type="button"
                disabled={descargando_tipo !== null}
                onClick={() => manejarDescarga("refrigerio")}
                className="h-10 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-poppins font-bold text-xs rounded-xl shadow-sm gap-2 cursor-pointer"
              >
                {descargando_tipo === "refrigerio" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFB600]" />
                ) : (
                  <Coffee className="w-4 h-4 text-[#FFB600]" />
                )}
                <span>Donación para Refrigerio BUMAN-D</span>
              </Button>
            )}

            {(tipo_disponible === "ambos" || tipo_disponible === "transporte") && (
              <Button
                type="button"
                disabled={descargando_tipo !== null}
                onClick={() => manejarDescarga("transporte")}
                className="h-10 px-4 bg-[#007BBE] hover:bg-[#035683] text-white font-poppins font-bold text-xs rounded-xl shadow-sm gap-2 cursor-pointer"
              >
                {descargando_tipo === "transporte" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFB600]" />
                ) : (
                  <Bus className="w-4 h-4 text-[#FFB600]" />
                )}
                <span>Donación para Transporte BUMAN-D</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
