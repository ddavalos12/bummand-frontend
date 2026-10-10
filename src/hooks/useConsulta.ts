"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface OpcionesConsulta<T> {
  habilitado?: boolean;
  revalidar_al_montar?: boolean;
  tiempo_vida_cache_ms?: number;
  datos_iniciales?: T;
  alExito?: (datos: T) => void;
  alError?: (error: Error) => void;
}

interface EntradaCache<T> {
  datos: T;
  timestamp: number;
}

const cache_memoria = new Map<string, EntradaCache<unknown>>();

export function limpiarTodaCache(): void {
  cache_memoria.clear();
}

export function invalidarCachePorClave(clave: string): void {
  cache_memoria.delete(clave);
}

export function useConsulta<T>(
  clave: string | null,
  funcion_consulta: () => Promise<T>,
  opciones: OpcionesConsulta<T> = {}
) {
  const {
    habilitado = true,
    revalidar_al_montar = true,
    tiempo_vida_cache_ms = 30000,
    datos_iniciales,
    alExito,
    alError,
  } = opciones;

  const [datos, set_datos] = useState<T | null>(() => {
    if (clave && cache_memoria.has(clave)) {
      const entrada = cache_memoria.get(clave) as EntradaCache<T>;
      const es_vigente = Date.now() - entrada.timestamp < tiempo_vida_cache_ms;
      if (es_vigente) {
        return entrada.datos;
      }
    }
    return datos_iniciales !== undefined ? datos_iniciales : null;
  });

  const [cargando, set_cargando] = useState<boolean>(() => {
    if (!habilitado || !clave) return false;
    if (cache_memoria.has(clave)) {
      const entrada = cache_memoria.get(clave);
      const es_vigente = Date.now() - (entrada?.timestamp || 0) < tiempo_vida_cache_ms;
      return !es_vigente;
    }
    return true;
  });

  const [error, set_error] = useState<Error | null>(null);

  const funcion_ref = useRef(funcion_consulta);
  useEffect(() => {
    funcion_ref.current = funcion_consulta;
  }, [funcion_consulta]);

  const al_exito_ref = useRef(alExito);
  useEffect(() => {
    al_exito_ref.current = alExito;
  }, [alExito]);

  const al_error_ref = useRef(alError);
  useEffect(() => {
    al_error_ref.current = alError;
  }, [alError]);

  const ejecutarConsulta = useCallback(
    async (ignorar_cache: boolean = false): Promise<T | null> => {
      if (!clave || !habilitado) return null;

      if (!ignorar_cache && cache_memoria.has(clave)) {
        const entrada = cache_memoria.get(clave) as EntradaCache<T>;
        const es_vigente = Date.now() - entrada.timestamp < tiempo_vida_cache_ms;
        if (es_vigente) {
          set_datos(entrada.datos);
          set_cargando(false);
          return entrada.datos;
        }
      }

      set_cargando(true);
      set_error(null);

      try {
        const resultado = await funcion_ref.current();
        cache_memoria.set(clave, {
          datos: resultado,
          timestamp: Date.now(),
        });
        set_datos(resultado);
        if (al_exito_ref.current) {
          al_exito_ref.current(resultado);
        }
        return resultado;
      } catch (err) {
        const instancia_error = err instanceof Error ? err : new Error(String(err));
        set_error(instancia_error);
        if (al_error_ref.current) {
          al_error_ref.current(instancia_error);
        }
        return null;
      } finally {
        set_cargando(false);
      }
    },
    [clave, habilitado, tiempo_vida_cache_ms]
  );

  useEffect(() => {
    if (habilitado && clave) {
      if (revalidar_al_montar) {
        ejecutarConsulta(false);
      }
    }
  }, [clave, habilitado, revalidar_al_montar, ejecutarConsulta]);

  const invalidar = useCallback(() => {
    if (clave) {
      cache_memoria.delete(clave);
    }
    return ejecutarConsulta(true);
  }, [clave, ejecutarConsulta]);

  const revalidar = useCallback(() => {
    return ejecutarConsulta(true);
  }, [ejecutarConsulta]);

  const mutar = useCallback(
    (nuevos_datos: T | ((previo: T | null) => T), revalidar_despues: boolean = false) => {
      set_datos((previo) => {
        const datos_resueltos =
          typeof nuevos_datos === "function"
            ? (nuevos_datos as (previo: T | null) => T)(previo)
            : nuevos_datos;

        if (clave) {
          cache_memoria.set(clave, {
            datos: datos_resueltos,
            timestamp: Date.now(),
          });
        }
        return datos_resueltos;
      });

      if (revalidar_despues) {
        ejecutarConsulta(true);
      }
    },
    [clave, ejecutarConsulta]
  );

  return {
    datos,
    cargando,
    error,
    invalidar,
    revalidar,
    mutar,
  };
}
