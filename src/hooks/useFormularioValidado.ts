"use client";

import React, { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

export interface ReglaCampo<TValores> {
  obligatorio?: boolean | string;
  min_caracteres?: number | { longitud: number; mensaje?: string };
  formato?: "numero" | "fecha" | "hora" | "correo" | "texto";
  min_valor?: number | { valor: number; mensaje?: string };
  max_valor?: number | { valor: number; mensaje?: string };
  validador?: (valor: unknown, valores: TValores) => string | null | undefined;
}

export type EsquemaReglas<TValores> = {
  [K in keyof TValores]?: ReglaCampo<TValores>;
};

export function useFormularioValidado<TValores extends Record<string, unknown>>(
  valores_iniciales: TValores,
  reglas: EsquemaReglas<TValores>
) {
  const [valores, set_valores] = useState<TValores>(valores_iniciales);
  const [errores, set_errores] = useState<Partial<Record<keyof TValores, string>>>({});
  const [tocados, set_tocados] = useState<Partial<Record<keyof TValores, boolean>>>({});
  const [intento_envio, set_intento_envio] = useState<boolean>(false);

  const evaluarRegla = useCallback(
    (campo: keyof TValores, valor_a_evaluar: unknown, estado_valores: TValores): string | null => {
      const regla = reglas[campo];
      if (!regla) return null;

      // Validación de campo obligatorio
      if (regla.obligatorio) {
        const mensaje_obligatorio =
          typeof regla.obligatorio === "string"
            ? regla.obligatorio
            : "Este campo es requerido.";

        if (
          valor_a_evaluar === undefined ||
          valor_a_evaluar === null ||
          (typeof valor_a_evaluar === "string" && valor_a_evaluar.trim() === "") ||
          (Array.isArray(valor_a_evaluar) && valor_a_evaluar.length === 0)
        ) {
          return mensaje_obligatorio;
        }
      }

      // Si el campo está vacío y no era obligatorio, no evaluar formato o longitud
      if (
        valor_a_evaluar === undefined ||
        valor_a_evaluar === null ||
        (typeof valor_a_evaluar === "string" && valor_a_evaluar.trim() === "")
      ) {
        return null;
      }

      // Validación de mínimo de caracteres
      if (regla.min_caracteres) {
        const longitud_min =
          typeof regla.min_caracteres === "number"
            ? regla.min_caracteres
            : regla.min_caracteres.longitud;
        const mensaje_min =
          typeof regla.min_caracteres === "object" && regla.min_caracteres.mensaje
            ? regla.min_caracteres.mensaje
            : `Debe contener al menos ${longitud_min} caracteres.`;

        if (String(valor_a_evaluar).trim().length < longitud_min) {
          return mensaje_min;
        }
      }

      // Validación de formato
      if (regla.formato) {
        if (regla.formato === "numero") {
          const num = Number(valor_a_evaluar);
          if (isNaN(num)) {
            return "Debe ingresar un número válido.";
          }
          if (regla.min_valor !== undefined) {
            const min = typeof regla.min_valor === "number" ? regla.min_valor : regla.min_valor.valor;
            const msg = typeof regla.min_valor === "object" && regla.min_valor.mensaje
              ? regla.min_valor.mensaje
              : `El valor no puede ser menor a ${min}.`;
            if (num < min) return msg;
          }
          if (regla.max_valor !== undefined) {
            const max = typeof regla.max_valor === "number" ? regla.max_valor : regla.max_valor.valor;
            const msg = typeof regla.max_valor === "object" && regla.max_valor.mensaje
              ? regla.max_valor.mensaje
              : `El valor no puede ser mayor a ${max}.`;
            if (num > max) return msg;
          }
        } else if (regla.formato === "hora") {
          const regex_hora = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!regex_hora.test(String(valor_a_evaluar).trim())) {
            return "Formato de hora inválido (HH:mm).";
          }
        } else if (regla.formato === "fecha") {
          if (
            !(valor_a_evaluar instanceof Date && !isNaN(valor_a_evaluar.getTime())) &&
            isNaN(Date.parse(String(valor_a_evaluar)))
          ) {
            return "Fecha institucional inválida.";
          }
        } else if (regla.formato === "correo") {
          const regex_correo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!regex_correo.test(String(valor_a_evaluar).trim())) {
            return "Dirección de correo electrónico inválida.";
          }
        }
      }

      // Validador personalizado
      if (regla.validador) {
        const error_personalizado = regla.validador(valor_a_evaluar, estado_valores);
        if (error_personalizado) return error_personalizado;
      }

      return null;
    },
    [reglas]
  );

  const cambiarValor = useCallback(
    (campo: keyof TValores, nuevo_valor: unknown) => {
      set_valores((prev) => {
        const nuevos = { ...prev, [campo]: nuevo_valor };
        const error_actualizado = evaluarRegla(campo, nuevo_valor, nuevos);
        set_errores((prev_err) => {
          const copia = { ...prev_err };
          if (error_actualizado) {
            copia[campo] = error_actualizado;
          } else {
            delete copia[campo];
          }
          return copia;
        });
        return nuevos;
      });
    },
    [evaluarRegla]
  );

  const tocarCampo = useCallback((campo: keyof TValores) => {
    set_tocados((prev) => ({ ...prev, [campo]: true }));
  }, []);

  const establecerValores = useCallback((parcial: Partial<TValores>) => {
    set_valores((prev) => ({ ...prev, ...parcial }));
  }, []);

  const reiniciarFormulario = useCallback(
    (valores_nuevos?: Partial<TValores>) => {
      set_valores({ ...valores_iniciales, ...(valores_nuevos || {}) });
      set_errores({});
      set_tocados({});
      set_intento_envio(false);
    },
    [valores_iniciales]
  );

  const validarCampo = useCallback(
    (campo: keyof TValores): string | null => {
      const error_calculado = evaluarRegla(campo, valores[campo], valores);
      set_errores((prev) => {
        const copia = { ...prev };
        if (error_calculado) {
          copia[campo] = error_calculado;
        } else {
          delete copia[campo];
        }
        return copia;
      });
      return error_calculado;
    },
    [evaluarRegla, valores]
  );

  const validarFormulario = useCallback((): boolean => {
    set_intento_envio(true);
    const nuevos_errores: Partial<Record<keyof TValores, string>> = {};
    let formulario_valido = true;

    for (const clave in reglas) {
      const campo = clave as keyof TValores;
      const error = evaluarRegla(campo, valores[campo], valores);
      if (error) {
        nuevos_errores[campo] = error;
        formulario_valido = false;
      }
    }

    set_errores(nuevos_errores);

    if (!formulario_valido) {
      toast.error("Formulario incompleto", {
        description:
          "ERR-5002: Verifique los campos obligatorios señalados en advertencia.",
      });
      return false;
    }

    return true;
  }, [evaluarRegla, reglas, valores]);

  const esCampoInvalido = useCallback(
    (campo: keyof TValores): boolean => {
      const debe_mostrar = Boolean(intento_envio || tocados[campo]);
      return debe_mostrar && Boolean(errores[campo]);
    },
    [intento_envio, tocados, errores]
  );

  const obtenerClaseInput = useCallback(
    (campo: keyof TValores, clases_base: string = ""): string => {
      if (esCampoInvalido(campo)) {
        return `${clases_base} border-[#E2694B] bg-[#E2694B]/5 focus-visible:ring-[#E2694B]`.trim();
      }
      return clases_base;
    },
    [esCampoInvalido]
  );

  const obtenerMensajeError = useCallback(
    (campo: keyof TValores): string | null => {
      if (esCampoInvalido(campo)) {
        return errores[campo] || null;
      }
      return null;
    },
    [esCampoInvalido, errores]
  );

  const renderizarMensajeError = useCallback(
    (campo: keyof TValores): React.ReactNode => {
      const mensaje = obtenerMensajeError(campo);
      if (!mensaje) return null;
      return React.createElement(
        "p",
        {
          className:
            "text-[11px] text-[#E2694B] font-semibold mt-1 flex items-center gap-1",
        },
        React.createElement("span", null, "⚠️"),
        mensaje
      );
    },
    [obtenerMensajeError]
  );

  const tiene_cambios = useMemo<boolean>(() => {
    const algun_tocado = Object.values(tocados).some(Boolean);
    if (algun_tocado) return true;

    for (const clave in valores_iniciales) {
      const val_actual = valores[clave];
      const val_inicial = valores_iniciales[clave];

      if (val_actual instanceof Date && val_inicial instanceof Date) {
        if (val_actual.getTime() !== val_inicial.getTime()) return true;
      } else if (val_actual !== val_inicial) {
        return true;
      }
    }
    return false;
  }, [tocados, valores, valores_iniciales]);

  const notificarExito = useCallback(
    (titulo: string, descripcion?: string) => {
      toast.success(titulo, { description: descripcion });
    },
    []
  );

  return {
    valores,
    errores,
    tocados,
    intento_envio,
    tiene_cambios,
    notificarExito,
    cambiarValor,
    tocarCampo,
    establecerValores,
    reiniciarFormulario,
    validarCampo,
    validarFormulario,
    esCampoInvalido,
    obtenerClaseInput,
    obtenerMensajeError,
    renderizarMensajeError,
  };
}

