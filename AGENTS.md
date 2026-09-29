<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Reglas de Frontend (Next.js App Router Estricto)

## 1. Rol y Arquitectura Base
- Este proyecto usa exclusivamente **Next.js 14+ con App Router (`app/`)**. Todo componente es un **Server Component** por defecto para maximizar el SEO y rendimiento.
- Solo debes usar `'use client'` al principio del archivo cuando necesites reactividad (ej. `useState`, `useEffect`, `onClick`).
- **Directorio `src/` Obligatorio**: Toda la aplicación debe vivir dentro de la carpeta `src/` para separar el código fuente de los archivos de configuración (`next.config.ts`, `tailwind.config.ts`).

## 2. Estructura de Carpetas (Mezcla de Estándar y Español)
Dado que el framework obliga ciertas convenciones en inglés, la estructura convivirá así:

- `public/` (Estándar Next.js: Imágenes, fuentes, íconos).
- `src/app/` (Estándar Next.js: El enrutador).
  - Las subcarpetas para rutas DEBEN estar en español y en kebab-case (ej. `src/app/panel-control/`).
  - Las agrupaciones lógicas de rutas usarán paréntesis (ej. `src/app/(autenticacion)/`).
  - Los archivos de renderizado nativos **DEBEN** conservar su nombre en inglés por convención de Next.js: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`.
- `src/componentes/` (UI y Módulos). Shadcn UI se instalará aquí (ej. `src/componentes/ui/button.tsx`).
- `src/contextos/` (Providers y estado global).
- `src/hooks/` (Deben obligatoriamente iniciar con la palabra `use` para respetar React, ej. `useAutenticacion.ts`).
- `src/lib/` (Estándar Shadcn/Next: Utilidades compartidas, validadores, utilidades de Tailwind `utils.ts`).
- `src/tipos/` (Tipados globales, DTOs e Interfaces en TypeScript).

## 3. Estándar de Código y Nombrado
- **snake_case:** Variables y Atributos.
- **camelCase:** Métodos y funciones.
- **PascalCase (ESPAÑOL):** Clases, Interfaces, DTOs, Entidades y Componentes UI (ej. `BotonSecundario`, `TablaPacientes`).
- **UPPER_SNAKE_CASE:** Constantes.
- **kebab-case:** Nombres de carpetas y archivos (ej. `factura.controlador.ts`, `panel-administrativo.tsx`, `autenticacion-contexto.tsx`), y rutas de red REST.
- **Excepción Nativa:** En `src/app/`, el archivo principal siempre se llamará `page.tsx`, `layout.tsx`, etc., por convención obligatoria del App Router de Next.js.

## 4. Estilos y Componentes UI
- Estilos exclusivamente a través de **Tailwind CSS**. 
- Todo componente reutilizable (Botones, Tablas, Formularios) debe generarse usando CLI de **Shadcn UI** (`npx shadcn@latest add <componente>`) adaptándolo al esquema de colores institucional definido en las skills de diseño.

## 5. Cero Comentarios Básicos
- PROHIBIDO generar código con comentarios obvios (ej. "Esta es la función para loguear"). El código debe ser autodocumentado. Solo agrega comentarios si hay mutaciones complejas de estado o uso oscuro de APIs web.
