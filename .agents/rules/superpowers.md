---
description: Reglas del workflow Superpoderes - aplica esto cuando construyas, debugees o planees código
alwaysApply: true
---

# Integración de Skills de Superpoderes (Antigravity)

> **Regla Base:** Antes de cualquier acción de implementación/planeamiento, verifica si una skill aplica y lee su SKILL.md. Solo omite esta regla si la pregunta es teórica y no requiere código.

## Las Skills Disponibles

### Flujo de Desarrollo
- `brainstorming`: Antes de cualquier trabajo creativo o modificación importante.
- `writing-plans`: Después de aprobar un diseño, para separar tareas de 2-5 min.
- `executing-plans`: Al momento de ejecutar las tareas con pausas de revisión (checkpoints).
- `test-driven-development`: Rojo → Verde → Refactor.
- `systematic-debugging`: Cuando intentes buscar un error/bug.
- `verification-before-completion`: Antes de decir "tarea finalizada".
- `requesting-code-review`: Antes de hacer un merge o PR.

### Roles Técnicos
- `frontend-developer`: Para Next.js, React, UI.
- `mobile-developer`: Para Flutter, React Native, nativo.
- `frontend-design`: UI/UX, interfaces pulidas.

## Cómo usar estas Skills (Antigravity)
Debes usar `view_file` en el `SKILL.md` de la skill respectiva. Por ejemplo: `.agents/skills/brainstorming/SKILL.md`.

## Prioridad
1. **Tus instrucciones estrictas como agente**
2. **Las skills (sobrescriben tu comportamiento default)**
3. **Tu comportamiento default LLM**

- **YAGNI**: No programes lo que no se necesite todavía.
- **Sistemático vs Caos**: Sigue el proceso, no adivines código al aire.
