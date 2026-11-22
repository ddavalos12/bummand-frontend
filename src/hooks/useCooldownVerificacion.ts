"use client";

import { useEffect, useCallback } from "react";

const CLAVE_LOCALSTORAGE_FECHA_SOLICITUD = "bumand_fecha_ultima_solicitud_verificacion";

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
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD);
    }
  }, []);

  const registrarSolicitud = useCallback((_fecha_iso?: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD);
    }
  }, []);

  const sincronizarConServidor = useCallback((_fecha_iso: string | null) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CLAVE_LOCALSTORAGE_FECHA_SOLICITUD);
    }
  }, []);

  return {
    esta_en_cooldown: false,
    dias_restantes: 0,
    horas_restantes: 0,
    texto_reactivacion: "",
    fecha_reactivacion: null,
    registrarSolicitud,
    sincronizarConServidor,
  };
}
