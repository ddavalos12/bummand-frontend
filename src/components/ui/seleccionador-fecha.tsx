"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function parsearFechaString(str?: string | Date | null): Date | undefined {
  if (!str) return undefined;
  if (str instanceof Date) return isNaN(str.getTime()) ? undefined : str;
  if (typeof str === "string") {
    const limpia = str.trim();
    if (!limpia) return undefined;
    if (limpia.includes("T")) {
      const d = new Date(limpia);
      return isNaN(d.getTime()) ? undefined : d;
    }
    // Formato YYYY-MM-DD sin desvío de zona horaria UTC
    const partes = limpia.split("-").map(Number);
    if (partes.length === 3 && !partes.some(isNaN)) {
      return new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0);
    }
    const d = new Date(limpia);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

export function formatearFechaAString(date?: Date | null): string {
  if (!date || isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

export interface DatePickerProps {
  fecha?: Date | undefined;
  alCambiar?: (fecha: Date | undefined) => void;
  valorString?: string;
  alCambiarString?: (fechaString: string) => void;
  // Compatibilidad con props estándar de formularios React / Shadcn
  value?: string | Date;
  onChange?: ((valor: string) => void) | ((e: { target: { value: string } }) => void);
  onBlur?: () => void;
  etiqueta_boton?: string;
  placeholder?: string;
  className?: string;
  formato?: string;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  mostrar_boton_limpiar?: boolean;
}

export function SeleccionadorFecha({
  fecha,
  alCambiar,
  valorString,
  alCambiarString,
  value,
  onChange,
  onBlur,
  etiqueta_boton,
  placeholder = "Seleccionar fecha",
  className,
  formato = "PPP",
  disabled = false,
  id,
  mostrar_boton_limpiar = false,
}: DatePickerProps) {
  const [abierto, set_abierto] = React.useState<boolean>(false);

  // Resolver la fecha seleccionada considerando props string o Date
  const fecha_activa = React.useMemo(() => {
    if (fecha !== undefined) return fecha;
    if (valorString !== undefined) return parsearFechaString(valorString);
    if (value !== undefined) return parsearFechaString(value);
    return undefined;
  }, [fecha, valorString, value]);

  const manejarSeleccion = (nueva_fecha: Date | undefined) => {
    if (alCambiar) {
      alCambiar(nueva_fecha);
    }
    const str_fmt = formatearFechaAString(nueva_fecha);
    if (alCambiarString) {
      alCambiarString(str_fmt);
    }
    if (onChange) {
      // @ts-ignore
      onChange(str_fmt);
      // @ts-ignore
      onChange({ target: { value: str_fmt } });
    }
    if (onBlur) {
      onBlur();
    }
    set_abierto(false);
  };

  const texto_mostrar = etiqueta_boton || placeholder;

  return (
    <Popover open={abierto} onOpenChange={set_abierto}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-[#E5E7EB] h-10 rounded-xl px-3 transition-colors bg-white hover:bg-slate-50",
            !fecha_activa && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed bg-slate-100",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#00ABBD] shrink-0" />
          <span className="truncate flex-1">
            {fecha_activa ? (
              format(fecha_activa, formato, { locale: es })
            ) : (
              <span>{texto_mostrar}</span>
            )}
          </span>
          {mostrar_boton_limpiar && fecha_activa && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                manejarSeleccion(undefined);
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-white shadow-xl rounded-2xl border border-[#E5E7EB]" align="start">
        <Calendar
          mode="single"
          selected={fecha_activa}
          onSelect={manejarSeleccion}
          locale={es}
          className="rounded-2xl"
        />
      </PopoverContent>
    </Popover>
  );
}

export interface SeleccionadorRangoFechasProps {
  desde?: string | Date;
  hasta?: string | Date;
  alCambiar: (rango: { desde: string; hasta: string }) => void;
  etiqueta?: string;
  className?: string;
  disabled?: boolean;
}

export function SeleccionadorRangoFechas({
  desde,
  hasta,
  alCambiar,
  etiqueta = "Filtrar por intervalo de fechas",
  className,
  disabled = false,
}: SeleccionadorRangoFechasProps) {
  const [abierto, set_abierto] = React.useState<boolean>(false);

  const rango_seleccionado: DateRange | undefined = React.useMemo(() => {
    const f_desde = parsearFechaString(desde);
    const f_hasta = parsearFechaString(hasta);
    if (!f_desde && !f_hasta) return undefined;
    return {
      from: f_desde,
      to: f_hasta,
    };
  }, [desde, hasta]);

  const manejarSeleccionRango = (range: DateRange | undefined) => {
    if (!range) {
      alCambiar({ desde: "", hasta: "" });
      return;
    }
    const str_desde = formatearFechaAString(range.from);
    const str_hasta = formatearFechaAString(range.to || range.from);
    alCambiar({ desde: str_desde, hasta: str_hasta });
    if (range.from && range.to) {
      set_abierto(false);
    }
  };

  const formatearTextoRango = () => {
    if (rango_seleccionado?.from) {
      if (rango_seleccionado.to) {
        return `${format(rango_seleccionado.from, "d MMM yyyy", { locale: es })} – ${format(
          rango_seleccionado.to,
          "d MMM yyyy",
          { locale: es }
        )}`;
      }
      return `Desde ${format(rango_seleccionado.from, "d MMM yyyy", { locale: es })}`;
    }
    return etiqueta;
  };

  return (
    <Popover open={abierto} onOpenChange={set_abierto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full sm:w-auto justify-start text-left font-normal border-[#E5E7EB] h-10 rounded-xl px-3 bg-white hover:bg-slate-50 transition-colors",
            !rango_seleccionado?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#00ABBD] shrink-0" />
          <span className="truncate">{formatearTextoRango()}</span>
          {rango_seleccionado?.from && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                alCambiar({ desde: "", hasta: "" });
              }}
              className="ml-2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-white shadow-xl rounded-2xl border border-[#E5E7EB]" align="start">
        <Calendar
          mode="range"
          selected={rango_seleccionado}
          onSelect={manejarSeleccionRango}
          numberOfMonths={2}
          locale={es}
          className="rounded-2xl p-3"
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateTimePickerProps extends DatePickerProps {
  hora?: string;
  alCambiarHora?: (hora: string) => void;
}

export function SeleccionadorFechaHora({
  fecha,
  alCambiar,
  valorString,
  alCambiarString,
  value,
  onChange,
  hora,
  alCambiarHora,
  etiqueta_boton = "Seleccionar fecha y hora",
  className,
}: DateTimePickerProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <SeleccionadorFecha
          fecha={fecha}
          alCambiar={alCambiar}
          valorString={valorString}
          alCambiarString={alCambiarString}
          value={value}
          onChange={onChange}
          etiqueta_boton={etiqueta_boton}
          className={className}
        />
      </div>
      {alCambiarHora && (
        <div className="w-[130px] relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00ABBD]" />
          <Input
            type="time"
            value={hora || ""}
            onChange={(e) => alCambiarHora(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[#E5E7EB] focus-visible:ring-[#00ABBD]"
          />
        </div>
      )}
    </div>
  );
}

interface TimePickerProps {
  hora: string | undefined;
  alCambiar: (hora: string) => void;
  etiqueta_placeholder?: string;
  className?: string;
}

export function SeleccionadorHora({
  hora,
  alCambiar,
  etiqueta_placeholder = "Seleccionar hora",
  className,
}: TimePickerProps) {
  return (
    <div className="relative w-full">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00ABBD]" />
      <Input
        type="time"
        value={hora || ""}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder={etiqueta_placeholder}
        className={cn(
          "pl-9 h-10 rounded-xl border-[#E5E7EB] focus-visible:ring-[#00ABBD] w-full",
          className
        )}
      />
    </div>
  );
}
