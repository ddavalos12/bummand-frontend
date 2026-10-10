"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clienteApi } from "@/lib/cliente-api";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: "administrador" | "supervisor" | "becario" | string;
  becario_id?: number | null;
}

export interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (nuevo_token: string, nuevo_usuario: Usuario) => void;
  cerrarSesion: () => void;
  renovarSesion: () => Promise<boolean>;
  estaAutenticado: boolean;
}

const INTERVALO_RENOVACION_MS = 20 * 60 * 1000; // 20 minutos

const AutenticacionContexto = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, set_usuario] = useState<Usuario | null>(null);
  const [token, set_token] = useState<string | null>(null);
  const [cargando, set_cargando] = useState<boolean>(true);
  const enrutador = useRouter();

  const cerrarSesion = useCallback(() => {
    set_token(null);
    set_usuario(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("bumand_token");
      localStorage.removeItem("bumand_usuario");
    }
    enrutador.push("/inicio-sesion");
  }, [enrutador]);

  const renovarSesion = useCallback(async (): Promise<boolean> => {
    try {
      const token_actual = typeof window !== "undefined" ? localStorage.getItem("bumand_token") : null;
      if (!token_actual) return false;

      const respuesta = await clienteApi.post<{
        mensaje: string;
        token: string;
        usuario: Usuario;
      }>("/autenticacion/renovar-sesion");

      if (respuesta && respuesta.token) {
        set_token(respuesta.token);
        set_usuario(respuesta.usuario);
        if (typeof window !== "undefined") {
          localStorage.setItem("bumand_token", respuesta.token);
          localStorage.setItem("bumand_usuario", JSON.stringify(respuesta.usuario));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    try {
      const token_guardado = localStorage.getItem("bumand_token");
      const usuario_guardado = localStorage.getItem("bumand_usuario");

      if (token_guardado && usuario_guardado) {
        set_token(token_guardado);
        set_usuario(JSON.parse(usuario_guardado));
      } else {
        if (typeof window !== "undefined" && window.location.pathname !== "/inicio-sesion") {
          enrutador.push("/inicio-sesion");
        }
      }
    } catch {
      localStorage.removeItem("bumand_token");
      localStorage.removeItem("bumand_usuario");
      if (typeof window !== "undefined" && window.location.pathname !== "/inicio-sesion") {
        enrutador.push("/inicio-sesion");
      }
    } finally {
      set_cargando(false);
    }
  }, [enrutador]);

  // Escuchar eventos de sesión expirada disparados por clienteApi
  useEffect(() => {
    const alExpirarSesion = () => {
      set_token(null);
      set_usuario(null);
    };

    window.addEventListener("sesion_expirada", alExpirarSesion);
    return () => {
      window.removeEventListener("sesion_expirada", alExpirarSesion);
    };
  }, []);

  // Temporizador de renovación silenciosa periódica
  useEffect(() => {
    if (!token) return;

    const temporizador = setInterval(() => {
      renovarSesion();
    }, INTERVALO_RENOVACION_MS);

    return () => {
      clearInterval(temporizador);
    };
  }, [token, renovarSesion]);

  const iniciarSesion = (nuevo_token: string, nuevo_usuario: Usuario) => {
    set_token(nuevo_token);
    set_usuario(nuevo_usuario);
    if (typeof window !== "undefined") {
      localStorage.setItem("bumand_token", nuevo_token);
      localStorage.setItem("bumand_usuario", JSON.stringify(nuevo_usuario));
    }
    enrutador.push("/");
  };

  return (
    <AutenticacionContexto.Provider
      value={{
        usuario,
        token,
        cargando,
        iniciarSesion,
        cerrarSesion,
        renovarSesion,
        estaAutenticado: !!token,
      }}
    >
      {children}
    </AutenticacionContexto.Provider>
  );
}

export function usarAutenticacion() {
  const contexto = useContext(AutenticacionContexto);
  if (contexto === undefined) {
    throw new Error("usarAutenticacion debe usarse dentro de ProveedorAutenticacion");
  }
  return contexto;
}
