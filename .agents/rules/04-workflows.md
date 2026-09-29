# Flujos de Trabajo Automáticos y Comandos (Frontend & Backend)

## 1. Comandos de Inicialización y Dependencias
- Instalación de librerías: `npm install <paquete>`
- Integración de Shadcn UI: `npx shadcn@latest add <componente>`

## 2. Validación y Construcción (Build)
- **Backend y Frontend:** Al finalizar de escribir código, ejecutar `npm run build` (o su equivalente configurado `npm run compilar`).
- Si falla por tipado, debes analizar la salida, corregir el código en `.ts` o `.tsx` y reintentar (máx. 3 intentos).
- **Compilaciones específicas:** Usar comandos definidos en `package.json` para validaciones enfocadas durante el desarrollo, como `npm run compilar:formax` (si se requiere una verificación más laxa o diferente).
- **Modos de ejecución:**
  - `npm run start:dev` / `npm run dev`: Para correr el entorno local en modo depuración.
  - `npm run start:prod` / `npm run start`: Para verificar la construcción final o producción.

## 3. Linter y Formateo
- Siempre correr `npm run format` (si está habilitado) para limpiar el código, seguido de `npm run lint` para análisis estático antes del build final.

## 4. Limpieza de Iteración
- Tras cada ciclo de trabajo, el agente DEBE eliminar archivos temporales, logs residuales (como `.log`, `.aux` de LaTeX, o scripts temporales) y mantener limpio el directorio.
