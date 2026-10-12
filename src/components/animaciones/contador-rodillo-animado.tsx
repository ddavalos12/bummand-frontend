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
 * Proyecta una animación ágil y amortiguada de números ascendentes para KPIs, puntualidad y finanzas.
 * Formatea decimales limpios con punto institucional y asegura el valor exacto final.
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
    damping: 24,
    stiffness: 200,
  });

  const formatearNumero = (num: number) => {
    return Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(num);
  };

  useEffect(() => {
    if (!esta_en_vista) return;

    const temporizador = setTimeout(() => {
      valor_movimiento.set(valor);
    }, retraso_segundos * 1000);

    // Salvaguarda: fijar el valor exacto tras completar la animación
    const temporizador_exacto = setTimeout(() => {
      if (referencia_elemento.current) {
        referencia_elemento.current.textContent = `${prefijo}${formatearNumero(valor)}${sufijo}`;
      }
    }, (retraso_segundos + 0.8) * 1000);

    return () => {
      clearTimeout(temporizador);
      clearTimeout(temporizador_exacto);
    };
  }, [esta_en_vista, valor, retraso_segundos, valor_movimiento]);

  useEffect(() => {
    const cancelar_suscripcion = resorte_valor.on("change", (_ultimo_valor: number) => {
      if (referencia_elemento.current) {
        const valor_renderizado = Math.abs(_ultimo_valor - valor) < 0.05 ? valor : _ultimo_valor;
        referencia_elemento.current.textContent = `${prefijo}${formatearNumero(valor_renderizado)}${sufijo}`;
      }
    });

    return () => cancelar_suscripcion();
  }, [resorte_valor, decimales, prefijo, sufijo, valor]);

  return (
    <span
      ref={referencia_elemento}
      className={cn(
        "inline-block tabular-nums font-bold tracking-tight text-neutral-900 dark:text-neutral-100",
        clase_personalizada
      )}
    >
      {prefijo}{formatearNumero(valor)}{sufijo}
    </span>
  );
};
