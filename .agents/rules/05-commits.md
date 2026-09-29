# Estándar de Commits y Documentación

## 1. Commits Convencionales (en Español)
Todos los commits deben seguir el estándar de https://conventional-commit-generator.vercel.app/ traducido y adaptado al español, y **DEBEN** incluir el `scope` (ámbito) indicando el subproyecto del monorepo que se está modificando.

Formato: `<tipo>(<scope>): <descripción>`

**Tipos:**
- `feat:` (Nueva característica o funcionalidad)
- `fix:` (Solución de error o bug)
- `docs:` (Cambios en la documentación)
- `style:` (Formato, comas, espacios - sin impacto en la lógica)
- `refactor:` (Refactorización del código que no arregla un bug ni añade característica)
- `perf:` (Mejora de rendimiento)
- `test:` (Agregado o arreglo de pruebas)
- `chore:` (Actualización de tareas de compilación, gestor de paquetes)

**Scopes (Ámbitos):**
- `backend`: Modificaciones en `bumand-backend`
- `frontend`: Modificaciones en `bumand-frontend`
- `movil`: Modificaciones en `bumand-movil`
- `root`: Modificaciones globales, flujos o CI/CD.

Ejemplos válidos:
- `feat(backend): agregar validación JWT para panel de becarios`
- `fix(movil): resolver desbordamiento de widget en formulario de pasajes`
- `docs(root): actualizar backlog temporal`

## 2. Documentación Activa (Post-Iteración)
- Al finalizar un cambio significativo (por ejemplo, implementar JWT, un algoritmo clave como Haversine, o lógica asíncrona pesada), el agente **DEBE** documentar estas líneas de código exactas.
- La explicación se escribirá dentro del `README.md` maestro o en la documentación respectiva (ej. `docs/arquitectura.md`), incluyendo las dificultades sorteadas y el por qué de la implementación técnica.
