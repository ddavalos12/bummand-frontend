"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "cn"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

// Contexto para sincronización de etiquetas legibles entre SelectItem y SelectValue
interface ContextoSelectValor {
  mapaOpciones: Record<string, string>
  registrarOpcion: (valor: string, etiqueta: string) => void
  obtenerEtiqueta: (valor: string) => string | undefined
}

const ContextoSelect = React.createContext<ContextoSelectValor | null>(null)

// Extraer texto plano legible desde cualquier árbol de nodos React
function extraerTextoPlano(nodo: React.ReactNode): string {
  if (nodo === null || nodo === undefined || typeof nodo === "boolean") {
    return ""
  }
  if (typeof nodo === "string" || typeof nodo === "number") {
    return String(nodo).trim()
  }
  if (Array.isArray(nodo)) {
    return nodo.map(extraerTextoPlano).filter(Boolean).join(" ").trim()
  }
  if (React.isValidElement(nodo)) {
    const props = nodo.props as Record<string, any>
    if (props && props.children) {
      return extraerTextoPlano(props.children)
    }
  }
  return ""
}

// Analizar recursivamente los componentes hijos para registrar opciones estáticas o pre-renderizadas
function extraerOpcionesDeChildren(
  nodo: React.ReactNode,
  mapa: Record<string, string> = {}
): Record<string, string> {
  React.Children.forEach(nodo, (hijo) => {
    if (!React.isValidElement(hijo)) return

    const props = hijo.props as Record<string, any>
    if (props && props.value !== undefined && props.value !== null) {
      const valorClave = String(props.value)
      if (props.etiqueta && typeof props.etiqueta === "string") {
        mapa[valorClave] = props.etiqueta
      } else if (typeof props.children === "string") {
        mapa[valorClave] = props.children
      } else {
        const textoPlano = extraerTextoPlano(props.children)
        if (textoPlano) {
          mapa[valorClave] = textoPlano
        }
      }
    }

    if (props && props.children) {
      extraerOpcionesDeChildren(props.children, mapa)
    }
  })
  return mapa
}

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  const { children, items: itemsProp, ...restoProps } = props
  const [mapaDinamico, setMapaDinamico] = React.useState<Record<string, string>>({})

  // Extraer opciones estáticas de los hijos en cada render
  const mapaExtraido = React.useMemo(() => {
    const mapa: Record<string, string> = {}
    if (itemsProp && typeof itemsProp === "object" && !Array.isArray(itemsProp)) {
      Object.assign(mapa, itemsProp as Record<string, string>)
    }
    extraerOpcionesDeChildren(children, mapa)
    return mapa
  }, [children, itemsProp])

  const mapaFinal = React.useMemo(() => {
    return { ...mapaExtraido, ...mapaDinamico }
  }, [mapaExtraido, mapaDinamico])

  const registrarOpcion = React.useCallback((valor: string, etiqueta: string) => {
    if (!valor || !etiqueta) return
    setMapaDinamico((prev) => {
      if (prev[valor] === etiqueta) return prev
      return { ...prev, [valor]: etiqueta }
    })
  }, [])

  const obtenerEtiqueta = React.useCallback(
    (valor: string) => {
      return mapaFinal[valor] || mapaExtraido[valor] || mapaDinamico[valor]
    },
    [mapaFinal, mapaExtraido, mapaDinamico]
  )

  const contextoValor = React.useMemo(
    () => ({
      mapaOpciones: mapaFinal,
      registrarOpcion,
      obtenerEtiqueta,
    }),
    [mapaFinal, registrarOpcion, obtenerEtiqueta]
  )

  return (
    <ContextoSelect.Provider value={contextoValor}>
      <SelectPrimitive.Root
        items={itemsProp ?? (mapaFinal as any)}
        {...(restoProps as any)}
      >
        {children}
      </SelectPrimitive.Root>
    </ContextoSelect.Provider>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

// Diccionario exhaustivo institucional de valores en snake_case / enumeraciones a etiquetas formales
const DICCIONARIO_ETIQUETAS: Record<string, string> = {
  // Estados de Becarios y Expedientes
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente_validacion: "Pendiente de Validación",
  egresado: "Egresado",
  suspendido: "Suspendido",
  baja: "Baja Institucional",
  observado: "Observado",

  // Filtros Globales
  todos: "Todos los Estados",
  todas: "Todas las Sedes",
  todas_areas: "Todas las Áreas",
  todos_supervisores: "Todos los Supervisores",
  todos_meses: "Todos los Meses",

  // Refrigerios y Servicios de Comedor
  refrigerio_tarde: "Refrigerio de Tarde",
  desayuno: "Desayuno Nutritivo",
  almuerzo_taller: "Almuerzo de Taller",
  especial_diaconal: "Especial Diaconal",
  refrigerio_normal: "Refrigerio Normal",
  entregado: "Entregado",
  no_entregado: "No Entregado",

  // Eventos / Actividades Formativas
  programado: "Programado",
  en_curso: "En Curso / Jornada",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  escuela_lideres_especial: "Escuela de Líderes Especial",
  escuela_lideres: "Escuela de Líderes",
  asistencia_practicas: "Prácticas Preprofesionales",
  asistencia_evento: "Evento Geolocalizado Convocado",
  servicio_diaconal: "Servicio Diaconal",
  retiro: "Retiro Espiritual",
  reunion: "Reunión Ordinaria",
  taller: "Taller de Formación",

  // Justificaciones, Permisos e Incidencias
  fuera_geocerca: "Fuera de Geocerca",
  salud_enfermedad: "Salud / Enfermedad",
  emergencia_familiar: "Emergencia Familiar",
  academico_examen: "Académico / Examen",
  fuerza_mayor: "Fuerza Mayor",
  otro_motivo: "Otro Motivo",
  otro: "Otra Actividad Formativa",
  pendiente_aprobacion: "Pendiente de Aprobación",
  aprobado_supervisor: "Aprobado por Supervisor",
  rechazado_supervisor: "Rechazado",
  justificacion_general: "Justificación General",
  permiso_previo: "Permiso Previo",
  falta_injustificada: "Falta Injustificada",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  pendiente: "Pendiente",
  en_revision: "En Revisión",

  // Asistencia y Monitoreo Biométrico/WGS84
  conforme: "Conforme WGS84",
  tardanza: "Tardanza",
  convalidado: "Convalidado",
  alertas: "Solo Alertas y Observados",
  cumplido: "Meta Cumplida (≥40 hrs)",
  en_progreso: "En Progreso (80% - 99%)",
  en_riesgo: "En Riesgo (<80%)",
  no_iniciado: "No Iniciado",

  // Pasajes y Tarifas
  urbano: "Urbano",
  interciudad: "Interciudad",
  recorrido_oficial: "Recorrido Oficial",

  // Roles y Actores
  becario: "Estudiante / Becario",
  pastor: "Pastor de la Iglesia",
  supervisor: "Supervisor / Mentor",
  social: "Trabajo Social",
  administrador: "Administrador",

  // Extensiones Departamentales de Bolivia (SEGIP)
  LP: "LP (La Paz)",
  SC: "SC (Santa Cruz)",
  CB: "CB (Cochabamba)",
  OR: "OR (Oruro)",
  PT: "PT (Potosí)",
  TJ: "TJ (Tarija)",
  CH: "CH (Chuquisaca)",
  BN: "BN (Beni)",
  PA: "PA (Pando)",
  QR: "QR (Extranjero / Naturalizado)",
}

function limpiarTextoSnakeCase(
  texto: string,
  mapaContexto?: Record<string, string>
): string {
  if (mapaContexto && mapaContexto[texto]) {
    return mapaContexto[texto]
  }
  if (DICCIONARIO_ETIQUETAS[texto]) {
    return DICCIONARIO_ETIQUETAS[texto]
  }
  if (texto.includes("_") || texto.includes("-")) {
    return texto
      .split(/[_-]+/)
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(" ")
  }
  // Si es una sola palabra en minúsculas (ej: 'activo', 'pendiente') capitalizarla con elegancia
  if (/^[a-záéíóúñ]+$/i.test(texto)) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
  }
  return texto
}

function formatearValorSelect(
  valor: unknown,
  mapaContexto?: Record<string, string>
): React.ReactNode {
  if (valor === null || valor === undefined || valor === "") {
    return null
  }
  if (Array.isArray(valor)) {
    return valor.map((item) => formatearValorSelect(item, mapaContexto)).join(", ")
  }
  if (typeof valor === "string") {
    return limpiarTextoSnakeCase(valor, mapaContexto)
  }
  if (typeof valor === "number") {
    const valorStr = String(valor)
    if (mapaContexto && mapaContexto[valorStr]) {
      return mapaContexto[valorStr]
    }
    return valorStr
  }
  return valor as React.ReactNode
}

function SelectValue({
  className,
  children,
  placeholder,
  ...props
}: SelectPrimitive.Value.Props) {
  const contexto = React.useContext(ContextoSelect)

  const formatearSalida = (valor: any) => {
    if (typeof children === "function") {
      const resultado = children(valor)
      return typeof resultado === "string"
        ? limpiarTextoSnakeCase(resultado, contexto?.mapaOpciones)
        : resultado
    }
    if (children != null) {
      return children
    }
    if (valor === null || valor === undefined || valor === "") {
      return placeholder ?? null
    }
    return formatearValorSelect(valor, contexto?.mapaOpciones)
  }

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      placeholder={placeholder}
      {...props}
    >
      {formatearSalida}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none hover:border-[#00ABBD]/60 focus-visible:border-[#00ABBD] focus-visible:ring-2 focus-visible:ring-[#00ABBD]/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground transition-transform duration-200" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 p-1",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider", className)}
      {...props}
    />
  )
}

export interface SelectItemProps extends SelectPrimitive.Item.Props {
  etiqueta?: string
}

function SelectItem({
  className,
  children,
  etiqueta,
  ...props
}: SelectItemProps) {
  const contexto = React.useContext(ContextoSelect)
  const valorProp = props.value

  React.useEffect(() => {
    if (contexto && valorProp !== undefined && valorProp !== null) {
      const valorStr = String(valorProp)
      const textoFinal =
        etiqueta ||
        (typeof children === "string"
          ? children
          : extraerTextoPlano(children))
      if (textoFinal) {
        contexto.registrarOpcion(valorStr, textoFinal)
      }
    }
  }, [contexto, valorProp, etiqueta, children])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2.5 text-sm text-slate-800 outline-none select-none transition-colors",
        "hover:bg-[#00ABBD]/10 hover:text-[#035683]",
        "focus:bg-[#00ABBD]/10 focus:text-[#035683]",
        "data-highlighted:bg-[#00ABBD]/10 data-highlighted:text-[#035683]",
        "data-selected:bg-[#035683]/5 data-selected:text-[#035683] data-selected:font-semibold",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-[#00ABBD]">
            <CheckIcon className="size-4 text-[#00ABBD]" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
