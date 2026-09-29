"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  fecha: Date | undefined
  alCambiar: (fecha: Date | undefined) => void
  etiqueta_boton?: string
}

export function SeleccionadorFecha({ fecha, alCambiar, etiqueta_boton = "Seleccionar fecha" }: DatePickerProps) {
  return (
    <Popover>
      {/* @ts-ignore */}
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-[#E3DCCB] h-11 rounded-xl",
            !fecha && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#17B4C4]" />
          {fecha ? format(fecha, "PPP", { locale: es }) : <span>{etiqueta_boton}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={fecha}
          onSelect={alCambiar}
          
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps extends DatePickerProps {
  hora?: string
  alCambiarHora?: (hora: string) => void
}

export function SeleccionadorFechaHora({ fecha, alCambiar, hora, alCambiarHora, etiqueta_boton = "Seleccionar fecha y hora" }: DateTimePickerProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Popover>
          {/* @ts-ignore */}
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal border-[#E3DCCB] h-11 rounded-xl",
                !fecha && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-[#17B4C4]" />
              {fecha ? format(fecha, "PPP", { locale: es }) : <span>{etiqueta_boton}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={alCambiar}
              
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
      {alCambiarHora && (
        <div className="w-[130px] relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#17B4C4]" />
          <Input 
            type="time" 
            value={hora || ""} 
            onChange={(e) => alCambiarHora(e.target.value)} 
            className="pl-9 h-11 rounded-xl border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
          />
        </div>
      )}
    </div>
  )
}
