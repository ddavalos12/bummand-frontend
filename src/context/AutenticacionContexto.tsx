"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  becario_id?: number; // Asociado si es becario
}

interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

const AutenticacionContexto = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const enrutador = useRouter();

  useEffect(() => {
    // Restaurar sesión desde localStorage (si existe)
    const tokenGuardado = localStorage.getItem("bumand_token");
    const usuarioGuardado = localStorage.getItem("bumand_usuario");
    
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    } else {
      // Si no hay sesión, protegemos la ruta principal
      if (window.location.pathname !== "/inicio-sesion") {
        enrutador.push("/inicio-sesion");
      }
    }
  }, [enrutador]);

  const iniciarSesion = (nuevoToken: string, nuevoUsuario: Usuario) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    localStorage.setItem("bumand_token", nuevoToken);
    localStorage.setItem("bumand_usuario", JSON.stringify(nuevoUsuario));
    enrutador.push("/"); // Redirigir al panel
  };

  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
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

