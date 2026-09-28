---
name: executing-plans
description: Úsalo cuando tengas un plan de implementación escrito para ejecutarlo con puntos de revisión.
---

# Ejecución de Planes (Executing Plans)

## Resumen
Carga el plan, revísalo críticamente, ejecuta todas las tareas y reporta al terminar.

Anuncia al inicio: "Estoy usando la skill de ejecución de planes para implementar esto."

## El Proceso

### Paso 1: Cargar y Revisar Plan
1. Lee el archivo del plan.
2. Revisa si hay algo preocupante. Si lo hay, consúltalo con el humano antes de empezar.

### Paso 2: Ejecutar Tareas
Por cada tarea:
1. Márcala como en progreso.
2. **Verifica Skills de Dominio** - lee la skill adecuada (`frontend-developer`, `mobile-developer`) antes de codificar.
3. Sigue cada paso exactamente.
4. Ejecuta las verificaciones especificadas.
5. Márcala como completada.

### Paso 3: Terminar el Desarrollo
Al completar: Anuncia que estás usando la skill de cierre (`finishing-a-development-branch`) para terminar, verificar tests y ofrecer opciones (merge/PR).

## Cuándo Parar y Pedir Ayuda
**DETENTE INMEDIATAMENTE SI:**
- Encuentras un bloqueo (falla un test, falta dependencia, instrucción ambigua).
- El plan tiene huecos críticos.
- La verificación falla repetidamente.
PIDE CLARIFICACIÓN en lugar de adivinar.

## Reglas Obligatorias antes de dar por completada una tarea
<HARD-GATE>
- [ ] **Idioma**: ¿Estoy respondiendo en el idioma del usuario (Español)?
- [ ] **Simplicidad**: ¿Pudo ser escrito en menos líneas sin perder claridad?
- [ ] **Cirugía**: ¿Toqué SOLO lo necesario o me puse a 'mejorar' cosas que no eran parte de la tarea?
- [ ] **Evidencia**: ¿De verdad ejecuté la verificación antes de declarar el éxito?
</HARD-GATE>
