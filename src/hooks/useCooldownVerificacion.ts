"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const CLAVE_LOCALSTORAGE_FECHA_SOLICITUD = "bumand_fecha_ultima_solicitud_verificacion";
const DURACION_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export interface EstadoCooldownVerificacion {
  esta_en_cooldown: boolean;
  dias_restantes: number;
  horas_restantes: number;
  texto_reactivacion: string;
  fecha_reactivacion: Date | null;
  registrarSolicitud: (fecha_iso?: string) => void;
  sincronizarConServidor: (fecha_iso: string | null) => void;
}

export function useCooldownVerificacion(): EstadoCooldownVerificacion {
  const [marca_tiempo_solicitud, set_marca_tiempo_solicitud] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const valor_guardado = localStorage.getItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD);
    if (valor_guardado) {
      const tiempo = Number(valor_guardado);
      if (!isNaN(tiempo) && tiempo > 0) {
        set_marca_tiempo_solicitud(tiempo);
      }
    }
  }, []);

  useEffect(() => {
    if (!marca_tiempo_solicitud) return;

    const verificarExpiracion = () => {
      const tiempo_transcurrido = Date.now() - marca_tiempo_solicitud;
      if (tiempo_transcurrido >= DURACION_COOLDOWN_MS) {
        set_marca_tiempo_solicitud(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD);
        }
      }
    };

    verificarExpiracion();
    const intervalo = setInterval(verificarExpiracion, 60000);
    return () => clearInterval(intervalo);
  }, [marca_tiempo_solicitud]);

  const registrarSolicitud = useCallback((fecha_iso?: string) => {
    const tiempo = fecha_iso ? new Date(fecha_iso).getTime() : Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD, tiempo.toString());
    }
    set_marca_tiempo_solicitud(tiempo);
  }, []);

  const sincronizarConServidor = useCallback((fecha_iso: string | null) => {
    if (!fecha_iso) return;
    const tiempo_servidor = new Date(fecha_iso).getTime();
    if (!isNaN(tiempo_servidor)) {
      const ahora = Date.now();
      if (ahora - tiempo_servidor < DURACION_COOLDOWN_MS) {
        set_marca_tiempo_solicitud((prev) => {
          if (!prev || tiempo_servidor > prev) {
            if (typeof window !== "undefined") {
              localStorage.setItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD, tiempo_servidor.toString());
            }
            return tiempo_servidor;
          }
          return prev;
        });
      }
    }
  }, []);

  const calculo_cooldown = useMemo(() => {
    if (!marca_tiempo_solicitud) {
      return {
        esta_en_cooldown: false,
        dias_restantes: 0,
        horas_restantes: 0,
        texto_reactivacion: "",
        fecha_reactivacion: null,
      };
    }

    const tiempo_transcurrido = Date.now() - marca_tiempo_solicitud;
    const tiempo_restante_ms = DURACION_COOLDOWN_MS - tiempo_transcurrido;

    if (tiempo_restante_ms <= 0) {
      return {
        esta_en_cooldown: false,
        dias_restantes: 0,
        horas_restantes: 0,
        texto_reactivacion: "",
        fecha_reactivacion: null,
      };
    }

    const dias = Math.floor(tiempo_restante_ms / (24 * 60 * 60 * 1000));
    const horas = Math.floor((tiempo_restante_ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const fecha_reactivacion = new Date(marca_tiempo_solicitud + DURACION_COOLDOWN_MS);

    const texto_reactivacion =
      dias > 0 ? `${dias}d ${horas}h` : `${horas}h restantes`;

    return {
      esta_en_cooldown: true,
      dias_restantes: dias,
      horas_restantes: horas,
      texto_reactivacion,
      fecha_reactivacion,
    };
  }, [marca_tiempo_solicitud]);

  return {
    ...calculo_cooldown,
    registrarSolicitud,
    sincronizarConServidor,
  };
}
