"use client";

import React, { useEffect, useRef } from "react";

interface RafagaCelebracionProps {
  activo: boolean;
  alTerminar?: () => void;
  duracion_ms?: number;
  cantidad_particulas?: number;
}

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ancho: number;
  alto: number;
  color: string;
  rotacion: number;
  velocidad_rotacion: number;
  opacidad: number;
}

const COLORES_BUMAND = [
  "#F8C766", // Dorado Diaconía
  "#17B4C4", // Turquesa BUMAND
  "#063A6B", // Azul Marino Institucional
  "#10B981", // Esmeralda Aprobado
  "#E2694B", // Coral Energético
  "#7FE0E6", // Cian Suave
];

/**
 * Watermelon UI — Ráfaga de Confeti y Celebración (Juicy UI)
 * Dispara una explosión física de partículas multicolores al completar
 * con éxito marcaciones de asistencia, aprobación de viáticos o reflexiones devocionales.
 */
export function RafagaCelebracion({
  activo,
  alTerminar,
  duracion_ms = 2200,
  cantidad_particulas = 70,
}: RafagaCelebracionProps) {
  const ref_canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!activo) return;

    const canvas = ref_canvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particulas: Particula[] = [];
    const centro_x = canvas.width / 2;
    const centro_y = canvas.height * 0.45;

    for (let i = 0; i < cantidad_particulas; i++) {
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = 4 + Math.random() * 8;
      particulas.push({
        x: centro_x,
        y: centro_y,
        vx: Math.cos(angulo) * velocidad + (Math.random() - 0.5) * 2,
        vy: Math.sin(angulo) * velocidad - 3,
        ancho: 6 + Math.random() * 6,
        alto: 8 + Math.random() * 8,
        color: COLORES_BUMAND[Math.floor(Math.random() * COLORES_BUMAND.length)],
        rotacion: Math.random() * 360,
        velocidad_rotacion: (Math.random() - 0.5) * 12,
        opacidad: 1,
      });
    }

    let id_animacion: number;
    const tiempo_inicio = performance.now();

    const animar = (tiempo_actual: number) => {
      const tiempo_transcurrido = tiempo_actual - tiempo_inicio;
      const progreso = Math.min(tiempo_transcurrido / duracion_ms, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravedad
        p.vx *= 0.985; // Fricción del aire
        p.rotacion += p.velocidad_rotacion;
        p.opacidad = Math.max(0, 1 - progreso * 1.2);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotacion * Math.PI) / 180);
        ctx.globalAlpha = p.opacidad;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
        ctx.restore();
      }

      if (progreso < 1) {
        id_animacion = requestAnimationFrame(animar);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (alTerminar) alTerminar();
      }
    };

    id_animacion = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(id_animacion);
    };
  }, [activo, alTerminar, duracion_ms, cantidad_particulas]);

  if (!activo) return null;

  return (
    <canvas
      ref={ref_canvas}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
