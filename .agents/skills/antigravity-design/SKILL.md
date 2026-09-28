---
name: antigravity-design
description: Patrones de diseño de interfaces minimalistas, interactividad y precisión extrema (estilo Jony Ive) para Antigravity IDE.
---

# Principios de Diseño de Antigravity

Esta skill impone un diseño preciso y elaborado para software empresarial, paneles de control (dashboards) y aplicaciones web. La filosofía se basa en precisión extrema: interfaces pulidas, limpias, modernas y minimalistas, diseñadas para su contexto específico. Cada píxel importa.

## Dirección de Diseño (OBLIGATORIO)

Antes de escribir código UI, comprométete con una dirección:
- **Precisión y Densidad:** Para usuarios avanzados (estilo Linear). Espaciado ajustado, mucha información.
- **Calidez y Accesibilidad:** Para trabajo colaborativo (estilo Notion). Espaciado generoso, sombras suaves.
- **Sofisticación y Confianza:** Tonos fríos, profundidad estratificada (estilo Stripe). Ideal para finanzas o sistemas críticos.

## Principios Centrales de Fabricación

1. **La Cuadrícula de 4px:**
   Todo espaciado debe ser múltiplo de 4: `4px` (micro), `8px` (ajustado), `12px` (estándar), `16px` (cómodo), `24px` (generoso), `32px` (separación mayor).
2. **Padding Simétrico:**
   Arriba, abajo, izquierda y derecha deben coincidir, a menos que el contenido exija lo contrario visualmente.
3. **Consistencia en Border Radius:**
   Elige un sistema y respétalo: Afilado (4, 6, 8px), Suave (8, 12px) o Minimalista (2, 4px). No mezcles sistemas.
4. **Estrategia de Profundidad (Elevation):**
   Elige una y úsala siempre:
   - Solo bordes (plano y técnico).
   - Sombras únicas sutiles.
   - Sombras estratificadas (para objetos que deben parecer físicos).
5. **Controles Aislados (No Nativos):**
   NUNCA uses elementos de formulario nativos feos (`<select>`, `<input type="date">`). Construye componentes personalizados (ej. en Shadcn UI).
6. **Jerarquía Tipográfica y Monospace:**
   - Títulos: Peso 600, espaciado ajustado (-0.02em).
   - Datos/Números: Usar tipografía Monoespaciada (Monospace) con `tabular-nums` para alinear columnas.
7. **Color con Propósito:**
   El color solo se usa para comunicar (estado, acción, error). El diseño base debe sostenerse casi en escala de grises.
8. **Reactividad:** Los componentes deben responder sin delays (150ms micro-interacciones, 200-250ms transiciones grandes).

NUNCA usar animaciones de "rebote" (spring) en UI empresarial, ni mezclar múltiples colores de acento.
