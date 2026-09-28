---
name: interface-design
description: Skill de Antigravity IDE para mantener consistencia visual, memoria de diseño y jerarquía en proyectos UI (dashboards, paneles admin).
---

# Diseño de Interfaces (Consistencia y Memoria)

Esta skill asegura que las decisiones de diseño en Antigravity IDE no se desvíen entre sesiones. Cada decisión sobre espaciado, colores, profundidad y elevación debe mantenerse consistente.

## Cómo funciona:

1. **Memoria de Diseño:** 
   Si no existe, pregunta al usuario y define las reglas iniciales de diseño (ej. "usaremos bordes sutiles y botones de 36px"). Luego guarda esas decisiones en un archivo de configuración (ej. `.antigravity-design/system.md`) para futuras iteraciones.
2. **Consistencia Visual:**
   - Altura de botones estandarizada (ej. siempre 36px o 40px).
   - Valores de espaciado constantes (nunca valores arbitrarios como 14px o 17px, usar escala base de 4px: 8, 12, 16, 24).
   - Tratamiento de superficies y profundidad idéntico en todo el proyecto.
3. **Flujo de Trabajo:**
   - Lee los principios y el contexto del proyecto.
   - Si no hay sistema definido, sugiere uno y pide confirmación.
   - Aplica los patrones consistentemente y documenta las elecciones.
