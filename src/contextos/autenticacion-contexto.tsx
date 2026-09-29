"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  becario_id?: number;
}

export interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  iniciarSesion: (nuevo_token: string, nuevo_usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

const AutenticacionContexto = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, set_usuario] = useState<Usuario | null>(null);
  const [token, set_token] = useState<string | null>(null);
  const enrutador = useRouter();

  useEffect(() => {
    const token_guardado = localStorage.getItem("bumand_token");
    const usuario_guardado = localStorage.getItem("bumand_usuario");
    
    if (token_guardado && usuario_guardado) {
      set_token(token_guardado);
      set_usuario(JSON.parse(usuario_guardado));
    } else {
      if (window.location.pathname !== "/inicio-sesion") {
        enrutador.push("/inicio-sesion");
      }
    }
  }, [enrutador]);

  const iniciarSesion = (nuevo_token: string, nuevo_usuario: Usuario) => {
    set_token(nuevo_token);
    set_usuario(nuevo_usuario);
    localStorage.setItem("bumand_token", nuevo_token);
    localStorage.setItem("bumand_usuario", JSON.stringify(nuevo_usuario));
    enrutador.push("/");
  };

  const cerrarSesion = () => {
    set_token(null);
    set_usuario(null);
    localStorage.removeItem("bumand_token");
    localStorage.removeItem("bumand_usuario");
    enrutador.push("/inicio-sesion");
  };

  return (
    <AutenticacionContexto.Provider value={{ usuario, token, iniciarSesion, cerrarSesion, estaAutenticado: !!token }}>
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
