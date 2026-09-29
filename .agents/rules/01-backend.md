# Reglas de Backend (Nest.js & TypeScript)

## 1. Rol y Comportamiento
- Priorizar la arquitectura escalable, la inyecciÃ³n de dependencias limpia y el tipado estricto con TypeScript.
- **Cero Comentarios BÃ¡sicos:** PROHIBIDO generar cÃ³digo con comentarios obvios. El cÃ³digo debe autodocumentarse. Solo aÃ±adir 1-3 lÃ­neas si la lÃ³gica es criptogrÃ¡fica, compleja o de integraciones opacas.
- **Idioma EspaÃ±ol Absoluto:** Todo el cÃ³digo (clases, variables, mÃ©todos, decoradores personalizados) y TODOS los nombres de archivos (`.ts`) y carpetas DEBEN estar ESTRICTAMENTE en espaÃ±ol. (Ej: `src/modulos/pacientes/paciente.servicio.ts`). 
- *ExcepciÃ³n:* Decoradores nativos (`@Controller`), dependencias de `npm`, configuraciones raÃ­z y mÃ©todos nativos. NUNCA crear carpetas `modules`, `controllers`, etc.

## 2. EstÃ¡ndar de CÃ³digo y Nombrado
- **camelCase:** Variables, instancias, mÃ©todos y funciones.
- **PascalCase (ESPAÃ‘OL):** Clases, Interfaces, DTOs, Entidades.
- **UPPER_SNAKE_CASE:** Constantes.
- **kebab-case:** Nombres de carpetas y archivos (ej. `factura.controlador.ts`), y rutas de red REST (`@Get('nuevo-registro')`).

## 3. Manejo de Errores y Seguridad
- Usar `try-catch` para operaciones asÃ­ncronas falibles.
- Lanzar SIEMPRE excepciones integradas de Nest.js (`NotFoundException`). No lanzar `Error()` genÃ©ricos en la capa de red.
- Validar TODA entrada con `class-validator` y `class-transformer` en DTOs. PROHIBIDO procesar `Body` sin DTO.
- Proteger endpoints con Guards.

## 4. PrÃ¡cticas de Nest.js
- InyecciÃ³n de Dependencias vÃ­a constructor exclusivamente.
- Tipado estricto: evitar `any` a toda costa. Usar `unknown` o genÃ©ricos si es dinÃ¡mico.

## 5. Comandos y Flujos de Trabajo
- InstalaciÃ³n de nuevas librerÃ­as (investigando siempre 2-3 opciones antes): `npm install <nombre>`
- Formateo y Linter: `npm run format` y `npm run lint`.
- CompilaciÃ³n exhaustiva: `npm run compilar` (o `npm run build`), el cual debe verificar tipado y sintaxis.
- Compilaciones especÃ­ficas o parciales: `npm run compilar:formax` (para verificaciones rÃ¡pidas durante desarrollo).
- Modos de ejecuciÃ³n: Iniciar siempre con `npm run start:dev` (Debug/Desarrollo) o `npm run start:prod` (ProducciÃ³n).

## 6. LÃ­mites
- NUNCA borrar archivos automÃ¡ticamente sin orden explÃ­cita. Consultar para refactorizaciones masivas.

## 7. Base de Datos (TypeORM)
- **ORM Exclusivo:** Utiliza estrictamente TypeORM para todas las operaciones de base de datos. PROHIBIDO usar Prisma u otro ORM.
