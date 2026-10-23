"use client";

import { useState, useEffect, useCallback } from "react";

const ID_SCRIPT_GOOGLE_MAPS = "google-maps-sdk-script";
const CLAVE_ALMACENAMIENTO_LOCAL = "bumand_google_maps_api_key";

export function useGoogleMaps() {
  const [esta_cargado, set_esta_cargado] = useState<boolean>(false);
  const [cargando, set_cargando] = useState<boolean>(true);
  const [error_carga, set_error_carga] = useState<string | null>(null);
  const [fallo_autenticacion, set_fallo_autenticacion] = useState<boolean>(false);

  const [clave_api, set_clave_api] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const guardada = localStorage.getItem(CLAVE_ALMACENAMIENTO_LOCAL);
      if (guardada) return guardada;
    }
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  });

  const cargarScriptGoogleMaps = useCallback((clave?: string) => {
    if (typeof window === "undefined") return;

    const clave_actual = clave !== undefined ? clave : clave_api;

    // Si no hay clave configurada, no inyectar script para evitar el modal de error de Google
    if (!clave_actual.trim()) {
      set_cargando(false);
      set_esta_cargado(false);
      set_fallo_autenticacion(false);
      return;
    }

    // Registrar interceptor de error de autenticación de Google Maps
    (window as any).gm_authFailure = () => {
      set_fallo_autenticacion(true);
      set_esta_cargado(false);
      set_cargando(false);
      set_error_carga(
        "Google Maps no tiene una clave API autorizada o el proyecto no tiene facturación activa."
      );
    };

    if (typeof window !== "undefined" && window.google?.maps?.Map) {
      set_esta_cargado(true);
      set_cargando(false);
      return;
    }

    set_cargando(true);
    set_error_carga(null);
    set_fallo_autenticacion(false);

    const verificarDisponibilidad = (reintentos = 0) => {
      if (typeof window !== "undefined" && window.google?.maps?.Map) {
        set_esta_cargado(true);
        set_cargando(false);
      } else if (reintentos < 25) {
        setTimeout(() => verificarDisponibilidad(reintentos + 1), 100);
      } else {
        set_fallo_autenticacion(true);
        set_error_carga("No se pudo inicializar la API de Google Maps.");
        set_esta_cargado(false);
        set_cargando(false);
      }
    };

    const script_existente = document.getElementById(ID_SCRIPT_GOOGLE_MAPS) as HTMLScriptElement | null;

    if (script_existente) {
      if (typeof window !== "undefined" && window.google?.maps?.Map) {
        set_esta_cargado(true);
        set_cargando(false);
        return;
      }

      const alCargar = () => {
        verificarDisponibilidad(0);
      };
      const alFallar = () => {
        set_error_carga("No se pudo cargar la librería de Google Maps. Verifique su conexión de red.");
        set_esta_cargado(false);
        set_cargando(false);
      };

      script_existente.addEventListener("load", alCargar);
      script_existente.addEventListener("error", alFallar);
      return;
    }

    const script = document.createElement("script");
    script.id = ID_SCRIPT_GOOGLE_MAPS;
    script.type = "text/javascript";
    script.async = true;
    script.defer = true;

    const parametro_clave = clave_actual.trim() ? `&key=${encodeURIComponent(clave_actual.trim())}` : "";
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry${parametro_clave}`;

    script.onload = () => {
      verificarDisponibilidad(0);
    };

    script.onerror = () => {
      set_error_carga("Error de red al conectar con Google Maps API.");
      set_esta_cargado(false);
      set_cargando(false);
    };

    document.head.appendChild(script);
  }, [clave_api]);

  useEffect(() => {
    cargarScriptGoogleMaps();
  }, [cargarScriptGoogleMaps]);

  const guardarClaveApi = useCallback((nueva_clave: string) => {
    const clave_limpia = nueva_clave.trim();
    if (typeof window !== "undefined") {
      if (clave_limpia) {
        localStorage.setItem(CLAVE_ALMACENAMIENTO_LOCAL, clave_limpia);
      } else {
        localStorage.removeItem(CLAVE_ALMACENAMIENTO_LOCAL);
      }
    }
    set_clave_api(clave_limpia);

    const script_existente = document.getElementById(ID_SCRIPT_GOOGLE_MAPS);
    if (script_existente) {
      script_existente.remove();
    }
    // @ts-ignore
    delete window.google;

    set_esta_cargado(false);
    cargarScriptGoogleMaps(clave_limpia);
  }, [cargarScriptGoogleMaps]);

  return {
    esta_cargado: esta_cargado && !fallo_autenticacion && !error_carga,
    cargando,
    error_carga,
    fallo_autenticacion,
    tiene_clave_valida: Boolean(clave_api.trim() && !fallo_autenticacion && !error_carga),
    clave_api,
    guardarClaveApi,
    reintentarCarga: () => cargarScriptGoogleMaps(),
  };
}
