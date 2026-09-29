# Librería de Componentes BUMAND

Esta carpeta contiene los componentes de negocio específicos extraídos del prototipo legacy, reconstruidos utilizando la arquitectura de **Next.js + Shadcn UI + Tailwind CSS v4**. 

## Directorios de Dominios

### `evaluaciones/`
Maneja la lógica visual del Módulo 2 (Digitalización F-03 y Autoevaluaciones).
- **`EvaluacionList.tsx`**: Componente de lista que obtiene las evaluaciones pendientes y completadas desde la API de NestJS (`/evaluaciones/becario/:id`). Muestra el estado (Aprobado, Borrador, etc.) mediante badges estilizados.
- **`FormularioF03.tsx`**: Componente de formulario basado en `Card` que implementa el checklist interactivo ("Siempre", "Casi Siempre", etc.) usando un `RadioGroup` modificado visualmente como "pills". Se comunica directamente con `POST /evaluaciones`.
- **`FirmaDigital.tsx`**: Componente con un `canvas` nativo de HTML5 para capturar la firma biométrica/táctil del supervisor, guardando el trazo suavizado en Base64 para adjuntar al PDF de aprobación (F-03).

### `recorridos/`
Maneja la lógica visual del Módulo 1 (Sistema de Pasajes y Geocercas).
- **`RadarGeofence.tsx`**: Componente visual que simula la lectura GPS para confirmar si el becario está en la zona permitida. Implementa animaciones CSS de *ping* sobre bordes y gradientes translúcidos.
- **`RegistroRecorrido.tsx`**: Formulario dinámico con un **wizard de 2 pasos** (Ida y Vuelta). Calcula automáticamente en tiempo real el monto de **Devolución del 80%** según el total acumulado y permite confirmar el viaje completo.

### `ui/`
Componentes base (primitivos) generados por Shadcn UI (`button`, `card`, `badge`, `tabs`, `input`, `select`, `dialog`, `radio-group`, `checkbox`). Estos componentes usan las variables de diseño definidas en `globals.css` mediante la directiva `@theme inline` de Tailwind v4.

> **Nota:** Todos estos componentes están listos para ser reusados en cualquier vista (`page.tsx`) importándolos directamente desde `@/components/...`.
