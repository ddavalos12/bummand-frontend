"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export interface PropiedadesContadorRodilloAnimado {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  decimales?: number;
  retraso_segundos?: number;
  clase_personalizada?: string;
}

/**
 * Watermelon UI — Contador de Dígitos en Cascada / Rodillo Animado (Number Ticker)
 * Proyecta una animación continua de números ascendentes para KPIs, puntualidad y asistentes.
 */
export const ContadorRodilloAnimado: React.FC<PropiedadesContadorRodilloAnimado> = ({
  valor,
  prefijo = "",
  sufijo = "",
  decimales = 0,
  retraso_segundos = 0,
  clase_personalizada = "",
}) => {
  const referencia_elemento = useRef<HTMLSpanElement>(null);
  const esta_en_vista = useInView(referencia_elemento, { once: true, margin: "0px" });
  const valor_movimiento = useMotionValue(0);
  const resorte_valor = useSpring(valor_movimiento, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    if (!esta_en_vista) return;

    const temporizador = setTimeout(() => {
      valor_movimiento.set(valor);
    }, retraso_segundos * 1000);

    return () => clearTimeout(temporizador);
  }, [esta_en_vista, valor, retraso_segundos, valor_movimiento]);

  useEffect(() => {
    const cancelar_suscripcion = resorte_valor.on("change", (_ultimo_valor: number) => {
      if (referencia_elemento.current) {
        const formateado = Intl.NumberFormat("es-BO", {
          minimumFractionDigits: decimales,
          maximumFractionDigits: decimales,
        }).format(_ultimo_valor);
        referencia_elemento.current.textContent = `${prefijo}${formateado}${sufijo}`;
      }
    });

    return () => cancelar_suscripcion();
  }, [resorte_valor, decimales, prefijo, sufijo]);

  return (
    <span
      ref={referencia_elemento}
      className={cn(
        "inline-block tabular-nums font-bold tracking-tight text-neutral-900 dark:text-neutral-100",
        clase_personalizada
      )}
    >
      {prefijo}0{sufijo}
    </span>
  );
};
