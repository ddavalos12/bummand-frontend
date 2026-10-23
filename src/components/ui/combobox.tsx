"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OpcionCombobox {
  valor: string;
  etiqueta: string;
  descripcion?: string;
  colorPunto?: string;
  icono?: React.ComponentType<{ className?: string }>;
  badge?: string;
  deshabilitado?: boolean;
}

export interface ComboboxProps {
  valor: string;
  alCambiar: (valor: string) => void;
  opciones: OpcionCombobox[];
  placeholder?: string;
  buscable?: boolean;
  placeholderBusqueda?: string;
  textoVacio?: string;
  className?: string;
  classNameContenido?: string;
  deshabilitado?: boolean;
  tamaño?: "sm" | "default";
  alineacion?: "start" | "end";
  iconoPrincipal?: React.ComponentType<{ className?: string }>;
}

export function Combobox({
  valor,
  alCambiar,
  opciones,
  placeholder = "Seleccionar opción...",
  buscable = false,
  placeholderBusqueda = "Buscar opción...",
  textoVacio = "No se encontraron opciones.",
  className,
  classNameContenido,
  deshabilitado = false,
  tamaño = "default",
  alineacion = "start",
  iconoPrincipal: IconoPrincipal,
}: ComboboxProps) {
  const [abierto, set_abierto] = React.useState(false);
  const [busqueda, set_busqueda] = React.useState("");
  const contenedor_ref = React.useRef<HTMLDivElement>(null);
  const input_busqueda_ref = React.useRef<HTMLInputElement>(null);

  // Cerrar al hacer clic fuera del componente
  React.useEffect(() => {
    function manejarClicFuera(evento: MouseEvent) {
      if (
        contenedor_ref.current &&
        !contenedor_ref.current.contains(evento.target as Node)
      ) {
        set_abierto(false);
      }
    }

    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        set_abierto(false);
      }
    }

    if (abierto) {
      document.addEventListener("mousedown", manejarClicFuera);
      document.addEventListener("keydown", manejarTecla);
    }

    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, [abierto]);

  // Enfocar input de búsqueda al abrir
  React.useEffect(() => {
    if (abierto && buscable) {
      setTimeout(() => {
        input_busqueda_ref.current?.focus();
      }, 50);
    } else {
      set_busqueda("");
    }
  }, [abierto, buscable]);

  const opcion_seleccionada = React.useMemo(
    () => opciones.find((o) => o.valor === valor),
    [opciones, valor],
  );

  const opciones_filtradas = React.useMemo(() => {
    if (!buscable || !busqueda.trim()) return opciones;
    const termino = busqueda.toLowerCase().trim();
    return opciones.filter(
      (o) =>
        o.etiqueta.toLowerCase().includes(termino) ||
        o.descripcion?.toLowerCase().includes(termino),
    );
  }, [opciones, busqueda, buscable]);

  const IconoOpcion = opcion_seleccionada?.icono;

  return (
    <div ref={contenedor_ref} className={cn("relative inline-block text-left", className)}>
      {/* Botón Disparador (Trigger) */}
      <button
        type="button"
        disabled={deshabilitado}
        onClick={() => set_abierto((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={cn(
          "w-full flex items-center justify-between gap-2 bg-white text-slate-800 border border-[#E3DCCB] rounded-xl font-medium transition-all outline-none",
          "hover:border-[#17B4C4] hover:bg-slate-50/60 focus-visible:ring-2 focus-visible:ring-[#17B4C4]/30 focus-visible:border-[#17B4C4]",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs",
          tamaño === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
          abierto && "border-[#17B4C4] ring-2 ring-[#17B4C4]/20",
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {IconoPrincipal && (
            <IconoPrincipal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          {opcion_seleccionada?.colorPunto && (
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                opcion_seleccionada.colorPunto,
              )}
            />
          )}
          {IconoOpcion && (
            <IconoOpcion className="w-3.5 h-3.5 text-[#063A6B] shrink-0" />
          )}
          <span className="truncate">
            {opcion_seleccionada ? opcion_seleccionada.etiqueta : placeholder}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            abierto && "rotate-180 text-[#063A6B]",
          )}
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {abierto && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 min-w-[200px] w-full rounded-xl border border-[#E3DCCB] bg-white p-1 text-slate-800 shadow-lg shadow-black/5 animate-in fade-in-0 zoom-in-95 duration-100",
            alineacion === "end" ? "right-0" : "left-0",
            classNameContenido,
          )}
        >
          {/* Campo de Búsqueda Integrado */}
          {buscable && (
            <div className="p-1 pb-1.5 border-b border-[#E3DCCB]/60 mb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 pointer-events-none" />
                <input
                  ref={input_busqueda_ref}
                  type="text"
                  value={busqueda}
                  onChange={(e) => set_busqueda(e.target.value)}
                  placeholder={placeholderBusqueda}
                  className="w-full h-7 pl-7 pr-6 text-xs bg-slate-50 border border-[#E3DCCB]/80 rounded-lg outline-none focus:border-[#17B4C4] focus:bg-white transition-colors"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => set_busqueda("")}
                    className="absolute right-1.5 text-muted-foreground hover:text-slate-800 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lista de Opciones */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain">
            {opciones_filtradas.length === 0 ? (
              <div className="py-3 px-2 text-center text-xs text-muted-foreground">
                {textoVacio}
              </div>
            ) : (
              opciones_filtradas.map((opcion) => {
                const seleccionada = opcion.valor === valor;
                const IconoItem = opcion.icono;

                return (
                  <button
                    key={opcion.valor}
                    type="button"
                    role="option"
                    aria-selected={seleccionada}
                    disabled={opcion.deshabilitado}
                    onClick={() => {
                      if (!opcion.deshabilitado) {
                        alCambiar(opcion.valor);
                        set_abierto(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer outline-none",
                      "hover:bg-slate-100 hover:text-[#063A6B]",
                      "focus-visible:bg-slate-100 focus-visible:text-[#063A6B]",
                      seleccionada
                        ? "bg-[#063A6B]/10 font-bold text-[#063A6B]"
                        : "text-slate-700",
                      opcion.deshabilitado &&
                        "opacity-40 cursor-not-allowed hover:bg-transparent",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opcion.colorPunto && (
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            opcion.colorPunto,
                          )}
                        />
                      )}
                      {IconoItem && (
                        <IconoItem
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            seleccionada ? "text-[#063A6B]" : "text-slate-400",
                          )}
                        />
                      )}
                      <span className="truncate">{opcion.etiqueta}</span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0">
                      {opcion.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-slate-100 font-mono text-slate-600 border border-slate-200">
                          {opcion.badge}
                        </span>
                      )}
                      <Check
                        className={cn(
                          "w-3.5 h-3.5 text-[#17B4C4] transition-opacity",
                          seleccionada ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
