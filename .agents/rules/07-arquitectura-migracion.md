# 07 - Flujo de Migración y Estética Profesional

## 1. Obligatoriedad de Brainstorming
ANTES de escribir cualquier línea de código para migrar un módulo legacy hacia los nuevos repositorios (backend, frontend o móvil), **DEBES OBLIGATORIAMENTE** ejecutar un análisis previo (brainstorm). Esto garantiza un análisis profundo de requerimientos, diseño y arquitectura antes de la ejecución. No saltes directamente a programar sin pensar la estructura.

## 2. Componentes Frontend (Shadcn UI)
Para el desarrollo frontend (React/Next.js), está **ESTRICTAMENTE PROHIBIDO** crear componentes de interfaz base desde cero si existen en la librería estándar.
- **DEBES** usar siempre el CLI para instalar componentes: 
px shadcn-ui@latest add <nombre-componente> (o 
px shadcn@latest add ...).
- Construye las interfaces apoyándote completamente en estos componentes.

## 3. Estilo Profesional por Defecto
- El diseño visual por defecto **NO DEBE SER BÁSICO ni rudimentario**. Usa un estilo altamente profesional, minimalista y pulido (márgenes consistentes en múltiplos de 4px, paletas armoniosas, tipografías modernas).
- Debes asegurar un acabado premium, animaciones sutiles (framer-motion o transiciones de Tailwind) y un UX de primer nivel desde el día uno, basándote en las paletas y directrices del prototipo.
