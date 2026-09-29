# Bumand Frontend (Next.js)

Este es el cliente web oficial del ecosistema Bumand, desarrollado con **Next.js 14+** (App Router), **React Server Components**, y estilizado mediante **Tailwind CSS** junto con el sistema de diseño **Shadcn UI**.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular enfocada en componentes reutilizables y en estricto idioma español (reglas idiomáticas declaradas en `.agents/`):
- `src/app/`: Define el enrutador de la aplicación (App Router) y las vistas principales (`page.tsx`, `layout.tsx`).
- `src/contextos/`: Contextos reactivos globales (`autenticacion-contexto.tsx`).
- `src/components/`: Almacena todos los componentes modulares clasificados por dominios:
  - `asistencia/`: Componentes de registro de horas (`registro-horas.tsx`).
  - `panel-control/`: Paneles administrativos y analíticas (`panel-administrativo.tsx`, `recharts`).
  - `evaluaciones/`: Formularios interactivos F-03, lista de evaluaciones y firma digital (`formulario-f03.tsx`, `lista-evaluaciones.tsx`, `firma-digital.tsx`).
  - `recorridos/`: Visualizaciones de mapas y geocercas (`radar-geocerca.tsx`, `registro-recorrido.tsx`).
  - `ui/`: Componentes base reutilizables de Shadcn UI (botones, inputs, select, date-picker).
- `src/lib/`: Utilidades compartidas (`utils.ts`).

## Convenciones y Estándares (Sprints Completados)

El código obedece estrictas normativas definidas por el sistema Agéntico BUMAND:
- **`snake_case`:** Se utiliza exclusivamente para props, variables de estado y atributos del dominio (ej. `becario_id`, `set_carga_util`).
- **`camelCase`:** Exclusivo para manejadores de eventos o funciones lógicas (ej. `manejarEnvio()`).
- **`PascalCase`:** Reservado para Componentes de React (ej. `PanelAdministrativo`, `RegistroHoras`).

## Comandos

- `npm run dev` o `npm run iniciar:desarrollo`: Inicia el servidor de desarrollo local de Next.js (con Turbopack).
- `npm run compilar`: Crea la compilación estandarizada de producción (strict type-check y build). Reemplaza al comando original `build`.
- `npm run iniciar:produccion`: Ejecuta el servidor en producción utilizando la carpeta compilada (`.next`).
- `npm run lint` o `npm run revisar`: Ejecuta el linter (ESLint) en busca de problemas de código.

## Ecosistema de UI

Este frontend está potenciado por:
- **Shadcn UI / Radix Primitives:** Componentes accesibles.
- **Recharts:** Para la generación de métricas y gráficos en el Panel Administrativo (Sprint 7).
- **React Day Picker & date-fns:** Para los módulos de `SeleccionadorFecha` y `RegistroHoras` (Sprint 5).
- **React Signature Canvas:** Para el firmado fluido y táctil de evaluaciones (Sprint 3).
