"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export type EventoTiempoReal =
  | "asistencia_actualizada"
  | "pasajes_actualizados"
  | "justificacion_actualizada"
  | "devocional_actualizado"
  | "evento_actualizado"
  | "codigo_verificacion_tutor"
  | string;

export type ManejadorEvento<T = unknown> = (datos: T) => void;

export interface OpcionesTiempoReal {
  auto_conectar?: boolean;
  eventos?: Record<string, ManejadorEvento>;
}

let socket_global: Socket | null = null;

function obtenerSocketGlobal(): Socket {
  if (!socket_global) {
    const url_servidor =
      (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) ||
      (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
      "http://localhost:3000";

    socket_global = io(url_servidor, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket_global;
}

export function useTiempoReal(opciones: OpcionesTiempoReal = {}) {
  const [conectado, set_conectado] = useState(false);
  const [ultimo_evento, set_ultimo_evento] = useState<{ nombre: string; datos: unknown } | null>(null);
  const manejadores_ref = useRef<Record<string, ManejadorEvento>>(opciones.eventos || {});

  useEffect(() => {
    manejadores_ref.current = opciones.eventos || {};
  }, [opciones.eventos]);

  useEffect(() => {
    if (opciones.auto_conectar === false) return;

    const socket = obtenerSocketGlobal();

    const alConectar = () => set_conectado(true);
    const alDesconectar = () => set_conectado(false);

    if (socket.connected) {
      set_conectado(true);
    }

    socket.on("connect", alConectar);
    socket.on("disconnect", alDesconectar);

    const eventos_estandar: EventoTiempoReal[] = [
      "asistencia_actualizada",
      "pasajes_actualizados",
      "justificacion_actualizada",
      "devocional_actualizado",
      "evento_actualizado",
      "codigo_verificacion_tutor",
    ];

    const escuchadores_registrados: Array<{ evento: string; fn: (datos: unknown) => void }> = [];

    eventos_estandar.forEach((evento) => {
      const fn = (datos: unknown) => {
        set_ultimo_evento({ nombre: evento, datos });
        if (manejadores_ref.current[evento]) {
          manejadores_ref.current[evento](datos);
        }
      };
      socket.on(evento, fn);
      escuchadores_registrados.push({ evento, fn });
    });

    // Registrar otros eventos personalizados en opciones.eventos
    if (opciones.eventos) {
      Object.keys(opciones.eventos).forEach((evento_personalizado) => {
        if (!eventos_estandar.includes(evento_personalizado)) {
          const fn = (datos: unknown) => {
            set_ultimo_evento({ nombre: evento_personalizado, datos });
            if (manejadores_ref.current[evento_personalizado]) {
              manejadores_ref.current[evento_personalizado](datos);
            }
          };
          socket.on(evento_personalizado, fn);
          escuchadores_registrados.push({ evento: evento_personalizado, fn });
        }
      });
    }

    return () => {
      socket.off("connect", alConectar);
      socket.off("disconnect", alDesconectar);
      escuchadores_registrados.forEach(({ evento, fn }) => {
        socket.off(evento, fn);
      });
    };
  }, [opciones.auto_conectar]);

  const suscribir = useCallback((evento: string, manejador: ManejadorEvento) => {
    const socket = obtenerSocketGlobal();
    socket.on(evento, manejador as (...args: unknown[]) => void);
    return () => {
      socket.off(evento, manejador as (...args: unknown[]) => void);
    };
  }, []);

  const emitir = useCallback((evento: string, datos?: unknown) => {
    const socket = obtenerSocketGlobal();
    socket.emit(evento, datos);
  }, []);

  return {
    conectado,
    ultimo_evento,
    suscribir,
    emitir,
  };
}
