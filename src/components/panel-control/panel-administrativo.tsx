"use client";

import { PanelControlVista } from "./panel-control-vista";

/**
 * @component PanelAdministrativo
 * @description Panel general de supervisión y administración institucional,
 * que renderiza la vista consolidada PanelControlVista con seguimiento semanal,
 * matriz de horarios 2026, analítica y kardex.
 */
export function PanelAdministrativo() {
  return <PanelControlVista />;
}

export { PanelControlVista };
