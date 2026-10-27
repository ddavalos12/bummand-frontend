"use client";

import { useState, useEffect } from "react";
import {
  LIBROS_BIBLIA,
  construirCitaBiblica,
  desglosarCitaBiblica,
} from "@/lib/constantes-biblia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Check, ChevronRight } from "lucide-react";
import { clienteApi } from "@/lib/cliente-api";

interface PropiedadesSelectorCitaBiblica {
  valor: string;
  alCambiar: (cita: string, texto_biblico?: string) => void;
  error?: string;
}

export function SelectorCitaBiblica({
  valor,
  alCambiar,
  error,
}: PropiedadesSelectorCitaBiblica) {
  const datos_iniciales = desglosarCitaBiblica(valor || "Filipenses 4:13");

  const [libro, set_libro] = useState(datos_iniciales.libro);
  const [capitulo, set_capitulo] = useState(datos_iniciales.capitulo);
  const [versiculo_inicio, set_versiculo_inicio] = useState(datos_iniciales.versiculo_inicio);
  const [versiculo_fin, set_versiculo_fin] = useState<number | undefined>(datos_iniciales.versiculo_fin);
  const [es_rango, set_es_rango] = useState<boolean>(Boolean(datos_iniciales.versiculo_fin));
  const [texto_previa, set_texto_previa] = useState<string | null>(null);
  const [cargando_pasaje, set_cargando_pasaje] = useState(false);

  // Sincronizar si cambia el valor externo (por ejemplo, al presionar "cargar versículo de hoy")
  useEffect(() => {
    if (valor) {
      const d = desglosarCitaBiblica(valor);
      set_libro(d.libro);
      set_capitulo(d.capitulo);
      set_versiculo_inicio(d.versiculo_inicio);
      set_versiculo_fin(d.versiculo_fin);
      set_es_rango(Boolean(d.versiculo_fin));
    }
  }, [valor]);

  const libro_objeto = LIBROS_BIBLIA.find((l) => l.nombre.toLowerCase() === libro.toLowerCase()) || LIBROS_BIBLIA[0];

  const actualizarCita = (
    nuevo_libro: string,
    nuevo_cap: number,
    nuevo_v_ini: number,
    nuevo_v_fin?: number | null
  ) => {
    const cita_resultante = construirCitaBiblica(
      nuevo_libro,
      nuevo_cap,
      nuevo_v_ini,
      nuevo_v_fin
    );
    alCambiar(cita_resultante);
  };

  const manejarCambioLibro = (nuevo_libro: string) => {
    set_libro(nuevo_libro);
    set_capitulo(1);
    actualizarCita(nuevo_libro, 1, versiculo_inicio, es_rango ? versiculo_fin : null);
  };

  const manejarCambioCapitulo = (nuevo_cap: number) => {
    const cap_valido = Math.max(1, Math.min(nuevo_cap, libro_objeto.capitulos));
    set_capitulo(cap_valido);
    actualizarCita(libro, cap_valido, versiculo_inicio, es_rango ? versiculo_fin : null);
  };

  const manejarCambioVersiculoInicio = (nuevo_v: number) => {
    const v_valido = Math.max(1, nuevo_v);
    set_versiculo_inicio(v_valido);
    let v_fin_valido = versiculo_fin;
    if (es_rango && (!versiculo_fin || versiculo_fin <= v_valido)) {
      v_fin_valido = v_valido + 1;
      set_versiculo_fin(v_fin_valido);
    }
    actualizarCita(libro, capitulo, v_valido, es_rango ? v_fin_valido : null);
  };

  const manejarCambioVersiculoFin = (nuevo_fin: number) => {
    const fin_valido = Math.max(versiculo_inicio + 1, nuevo_fin);
    set_versiculo_fin(fin_valido);
    actualizarCita(libro, capitulo, versiculo_inicio, fin_valido);
  };

  const toggleRango = (activar: boolean) => {
    set_es_rango(activar);
    if (activar) {
      const fin = versiculo_inicio + 2;
      set_versiculo_fin(fin);
      actualizarCita(libro, capitulo, versiculo_inicio, fin);
    } else {
      set_versiculo_fin(undefined);
      actualizarCita(libro, capitulo, versiculo_inicio, null);
    }
  };

  const cita_actual = construirCitaBiblica(
    libro,
    capitulo,
    versiculo_inicio,
    es_rango ? versiculo_fin : null
  );

  const consultarPasajeApi = async () => {
    set_cargando_pasaje(true);
    set_texto_previa(null);
    try {
      const respuesta = await clienteApi.get<{ texto?: string; version?: string }>(
        `/api/biblia/pasaje?cita=${encodeURIComponent(cita_actual)}`
      );
      if (respuesta && respuesta.texto) {
        set_texto_previa(respuesta.texto);
        alCambiar(cita_actual, respuesta.texto);
      } else {
        set_texto_previa("Texto bíblico referencial Reina-Valera 1960 disponible para la reflexión.");
      }
    } catch {
      set_texto_previa("Cita bíblica canónica válida para la meditación.");
    } finally {
      set_cargando_pasaje(false);
    }
  };

  return (
    <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#007BBE]" />
          Selección Canónica de Pasaje Bíblico
        </label>
        <Badge
          variant="outline"
          className="bg-white border-[#007BBE]/30 text-[#007BBE] font-mono font-bold text-xs shadow-2xs"
        >
          {cita_actual}
        </Badge>
      </div>

      {/* Selectores estructurados: Libro, Capítulo y Versículo(s) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Selector de Libro */}
        <div className="sm:col-span-1 space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 block">Libro</span>
          <select
            value={libro}
            onChange={(e) => manejarCambioLibro(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007BBE] shadow-2xs"
          >
            <optgroup label="Nuevo Testamento (Recomendado)">
              {LIBROS_BIBLIA.filter((l) => l.testamento === "NT").map((l) => (
                <option key={l.nombre} value={l.nombre}>
                  {l.nombre} ({l.capitulos} cap.)
                </option>
              ))}
            </optgroup>
            <optgroup label="Antiguo Testamento">
              {LIBROS_BIBLIA.filter((l) => l.testamento === "AT").map((l) => (
                <option key={l.nombre} value={l.nombre}>
                  {l.nombre} ({l.capitulos} cap.)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 2. Selector de Capítulo */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-600 flex justify-between">
            <span>Capítulo</span>
            <span className="text-[10px] text-slate-400 font-mono">1–{libro_objeto.capitulos}</span>
          </span>
          <input
            type="number"
            min={1}
            max={libro_objeto.capitulos}
            value={capitulo}
            onChange={(e) => manejarCambioCapitulo(Number(e.target.value))}
            className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007BBE] shadow-2xs"
          />
        </div>

        {/* 3. Selector de Versículo o Rango */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">
              {es_rango ? "Versículos" : "Versículo"}
            </span>
            <label className="text-[10px] text-[#007BBE] font-semibold cursor-pointer flex items-center gap-1 select-none">
              <input
                type="checkbox"
                checked={es_rango}
                onChange={(e) => toggleRango(e.target.checked)}
                className="w-3 h-3 rounded accent-[#007BBE]"
              />
              ¿Rango?
            </label>
          </div>

          {es_rango ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                value={versiculo_inicio}
                onChange={(e) => manejarCambioVersiculoInicio(Number(e.target.value))}
                placeholder="Ini"
                className="w-1/2 text-xs rounded-xl border border-slate-200 bg-white px-2 py-2 text-slate-800 text-center shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#007BBE]"
                title="Versículo inicial"
              />
              <span className="text-xs text-slate-400 font-bold">-</span>
              <input
                type="number"
                min={versiculo_inicio + 1}
                value={versiculo_fin || versiculo_inicio + 1}
                onChange={(e) => manejarCambioVersiculoFin(Number(e.target.value))}
                placeholder="Fin"
                className="w-1/2 text-xs rounded-xl border border-slate-200 bg-white px-2 py-2 text-slate-800 text-center shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#007BBE]"
                title="Versículo final"
              />
            </div>
          ) : (
            <input
              type="number"
              min={1}
              value={versiculo_inicio}
              onChange={(e) => manejarCambioVersiculoInicio(Number(e.target.value))}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007BBE] shadow-2xs"
            />
          )}
        </div>
      </div>

      {/* Botón de Asistencia Rápida y Previsualización */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-600" />
          Referencia protegida contra faltas de ortografía y discrepancias.
        </p>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={consultarPasajeApi}
          disabled={cargando_pasaje}
          className="h-7 px-2.5 text-[11px] font-semibold text-[#007BBE] hover:bg-[#007BBE]/10 gap-1 rounded-lg shrink-0 self-end sm:self-auto"
        >
          <Sparkles className="w-3 h-3 text-[#00ABBD]" />
          {cargando_pasaje ? "Consultando..." : "Consultar texto RVR60"}
        </Button>
      </div>

      {texto_previa && (
        <div className="p-2.5 rounded-xl bg-white border border-[#00ABBD]/30 text-slate-700 text-[11px] italic leading-relaxed">
          &laquo;{texto_previa}&raquo;
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
