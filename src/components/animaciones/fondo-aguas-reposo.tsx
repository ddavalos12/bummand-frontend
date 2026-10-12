"use client";

import React from "react";
import { FondoOndasLiquidas, PropiedadesFondoOndasLiquidas } from "./fondo-ondas-liquidas";

export interface PropiedadesFondoAguasReposo extends Omit<PropiedadesFondoOndasLiquidas, "modo"> {
  className?: string;
}

/**
 * Fondo Animado "Aguas de Reposo" con Three.js (Salmo 23:2)
 *
 * Utiliza el motor canónico de Three.js (simulación física de fluidos FBO Ping-Pong)
 * del inicio de sesión, calibrado específicamente para la interfaz interior:
 * - Muchísimo más claro: Blanco perla puro (#FFFFFF) a celeste ultra-suave diáfano (#EAF4FB).
 * - Muchísimo más suave: Refracción óptica atenuada (0.08), iluminación satinada sin deslumbramientos (0.12).
 * - Ondulación autónoma continua: El agua respira suavemente sin requerir movimiento del mouse.
 * - Cobertura integral: Se posiciona en fixed inset-0 para cubrir toda la interfaz.
 */
export function FondoAguasReposo({
  className = "",
  ...props
}: PropiedadesFondoAguasReposo) {
  return (
    <div className={`fixed inset-0 z-0 pointer-events-none ${className}`} aria-hidden="true">
      <FondoOndasLiquidas
        modo="dashboard"
        color_fondo_centro="#FFFFFF"
        color_fondo_borde="#E4F2FA"
        intensidad_distorsion={0.10}
        fuerza_especular={0.16}
        fuerza_raton={0.5}
        ondulacion_autonoma={true}
        {...props}
      />
    </div>
  );
}
