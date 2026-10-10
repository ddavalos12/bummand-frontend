"use client";

import React, { useEffect, useState } from "react";

interface ContadorAnimadoProps {
  valor: number;
  duracion_ms?: number;
  prefijo?: string;
  sufijo?: string;
  decimales?: number;
  className?: string;
}

/**
 * Watermelon UI — Contador Numérico Elástico (Bouncy Number Ticker)
 * Transición fluida de números ascendentes para KPIs, viáticos y horas acreditadas.
 */
export function ContadorAnimado({
  valor,
  duracion_ms = 1200,
  prefijo = "",
  sufijo = "",
  decimales = 0,
  className = "",
}: ContadorAnimadoProps) {
  const [valor_mostrado, set_valor_mostrado] = useState(0);

  useEffect(() => {
    let inicio = 0;
    const tiempo_inicio = performance.now();

    const actualizar = (tiempo_actual: number) => {
      const transcurrido = tiempo_actual - tiempo_inicio;
      const progreso = Math.min(transcurrido / duracion_ms, 1);
      // Curva easeOutExpo
      const factor = progreso === 1 ? 1 : 1 - Math.pow(2, -10 * progreso);
      const actual = inicio + (valor - inicio) * factor;

      set_valor_mostrado(actual);

      if (progreso < 1) {
        requestAnimationFrame(actualizar);
      } else {
        set_valor_mostrado(valor);
      }
    };

    const id = requestAnimationFrame(actualizar);
    return () => cancelAnimationFrame(id);
  }, [valor, duracion_ms]);

  const texto_formateado = valor_mostrado.toLocaleString("es-BO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  return (
    <span className={className}>
      {prefijo}
      {texto_formateado}
      {sufijo}
    </span>
  );
}
