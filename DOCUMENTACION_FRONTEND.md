# Manual de Arquitectura y Componentes del Frontend (BUMAND Web)

## 1. Visión General del Sistema Web

El panel web de BUMAND constituye el centro neurálgico de supervisión, aprobación y evaluación del Programa de Becarios Universitarios de Diaconía FRIF-IFD. Diseñado para funcionar como una aplicación web progresiva y moderna basada en **Next.js 14+ con App Router**, su propósito fundamental es erradicar la gestión en papel y brindar trazabilidad en tiempo real sobre la asistencia, las rutas de transporte declaradas y las evaluaciones del desempeño formativo y ministerial.

A diferencia de las interfaces administrativas genéricas, este panel ha sido concebido desde sus cimientos siguiendo los lineamientos de la institución:
- **Español Absoluto:** Todo el vocabulario operativo, rutas, nombres de componentes y estados se encuentran redactados en español formal sin anglicismos.
- **Memoria de Diseño Antigravity:** Respeto irrestricto a los tokens cromáticos institucionales, escala modular base de 4px y alturas estandarizadas de controles (36px para acciones compactas y 40px para controles de formulario).
- **Diseño Desacoplado y Reactivo:** Componentes de servidor (RSC) para estructura y renderizado óptimo, combinados con componentes cliente interactivos (`'use client'`) donde la experiencia de usuario requiere reactividad instantánea, animaciones sutiles y gráficos dinámicos.

---

## 2. Estructura de Directorios del Código Fuente (`src/`)

```
bumand-frontend/src/
├── app/                                 # Enrutamiento App Router de Next.js
│   ├── favicon.ico                      # Identificador visual del navegador
│   ├── globals.css                      # Estilos globales y tokens Tailwind CSS v4
│   ├── layout.tsx                       # Estructura raíz y configuración tipográfica
│   ├── page.tsx                         # Vista principal unificada con pestañas por Sprint
│   └── inicio-sesion/
│       └── page.tsx                     # Portal de acceso seguro para becarios y supervisores
├── contextos/
│   └── autenticacion-contexto.tsx       # Proveedor global de autenticación, JWT y sesión
├── lib/
│   └── utils.ts                         # Utilidad canónica para concatenación de clases (clsx, twMerge)
└── components/
    ├── proveedores.tsx                  # Envoltorio de contexto global y TooltipProvider
    ├── panel-control/
    │   └── panel-administrativo.tsx     # Dashboard de KPIs analíticos, Recharts y auditoría
    ├── becarios/
    │   └── gestion-becarios.tsx         # Directorio, búsqueda en vivo y alta de estudiantes
    ├── lugares-practica/
    │   └── mapa-lugares-practica.tsx    # HUD de geocercas satelitales y ajuste métrico
    ├── asistencia/
    │   └── registro-horas.tsx           # Declaración y supervisión de horas de práctica
    ├── pasajes/
    │   └── aprobacion-pasajes.tsx       # Flujo del 80% en centavos y observación obligatoria
    ├── evaluaciones/
    │   ├── matriz-evaluacion-360.tsx    # Matriz de 5 ejes ponderados y cálculo de nota final
    │   ├── formulario-f03.tsx           # Formulario ministerial pastoral de la congregación
    │   ├── firma-digital.tsx            # Lienzo HTML5 Canvas para captura de rúbrica manuscrita
    │   └── lista-evaluaciones.tsx       # Historial de evaluaciones registradas
    ├── recorridos/
    │   ├── radar-geocerca.tsx           # Animación de pulso concéntrico y radar de proximidad
    │   └── registro-recorrido.tsx       # Asistente en dos etapas para registro de tramos ida/vuelta
    ├── reportes/
    │   └── visor-reportes-pdf.tsx       # Emisión de informes oficiales equivalentes a formularios físicos
    ├── notificaciones/
    │   └── centro-notificaciones.tsx    # Bandeja de alertas push sincronizada con FCM
    └── ui/                              # Biblioteca de componentes estandarizados Shadcn UI
```

---

## 3. Módulos y Componentes Detallados

### 3.1. Enrutamiento y Autenticación (`src/app/` y `src/contextos/`)
- **`layout.tsx`:** Define el layout global de la aplicación. Configura tres familias tipográficas de Google Fonts mediante variables CSS nativas: Bricolage Grotesque para titulares y cifras destacadas, Inter para textos de lectura e interfaces, e IBM Plex Mono para marcas temporales, coordenadas geográficas y montos monetarios. Envuelve el árbol DOM con el componente `Proveedores`.
- **`inicio-sesion/page.tsx`:** Pantalla de autenticación perimetral. Incorpora validación local de campos, prevención de estados inconsistentes mediante loaders visuales, despacho asíncrono al endpoint `/autenticacion/inicio-sesion` del backend NestJS y almacenamiento seguro de la sesión antes de redirigir al panel principal.
- **`autenticacion-contexto.tsx`:** Mantiene el estado global del usuario activo (identificador, nombre completo, correo institucional, rol operativo y becario\_id). Permite cerrar sesión y provee el hook `usarAutenticacion()` para consumo en cualquier vista hija.

### 3.2. Panel Administrativo y Analítica (`src/components/panel-control/`)
- **`panel-administrativo.tsx`:** Provee una visión panorámica de la operación del programa mediante tres niveles de información:
  1. *Tarjetas de Métricas Ejecutivas:* Conteo de becarios activos (25 becarios al 100%), horas acumuladas frente a la meta (1,040 h), avance de evaluaciones 360° (80% completado) y ejecución presupuestaria de pasajes (Bs 5,240 sobre el límite de Bs 10,000) con barras de progreso reactivas.
  2. *Gráficos Recharts Integrados:* 
     - **Gráfico de Área con Degradado (`AreaChart`):** Muestra la serie temporal de horas reales registradas por mes frente a la meta planificada con curvas suavizadas y tooltip flotante.
     - **Gráfico de Donut (`PieChart` con `Cell`):** Desglosa la partida de viáticos en tres categorías claras: 80% Reembolsado (#17B4C4), Pendiente de Aprobación (#F8C766) y Saldo Presupuestario (#063A6B).
     - **Barras de Distribución por Dependencia:** Visualiza el volumen de horas aportadas por los becarios en cada unidad de Diaconía (Seguridad Física, Consultorio Médico, Productos y Canales, etc.).
  3. *Feed de Auditoría:* Registro cronológico de las últimas transacciones (marcaciones dentro de radio, envíos de pasajes y evaluaciones pastorales).

### 3.3. Gestión de Becarios y Sedes (`src/components/becarios/` y `src/components/lugares-practica/`)
- **`gestion-becarios.tsx`:** Directorio institucional completo. Dispone de un buscador en vivo insensible a mayúsculas que filtra por nombre, número de cédula de identidad o carrera universitaria. Dispone de una ventana modal con formulario tipado para registrar nuevos estudiantes vinculándolos a su universidad, iglesia y lugar de práctica asignado.
- **`mapa-lugares-practica.tsx`:** Gestión geoespacial de las sedes de Diaconía FRIF-IFD. Presenta una interfaz de dos columnas: listado de sucursales con coordenadas exactas (`-16.500053, -68.173455`) a la izquierda, y a la derecha un radar visual interactivo que dibuja el perímetro concéntrico de la geocerca. Permite calibrar en tiempo real el radio de tolerancia (de 20 a 200 metros) mediante un control deslizante sincronizado con un input numérico.

### 3.4. Horas de Práctica y Aprobación de Pasajes (`src/components/asistencia/` y `src/components/pasajes/`)
- **`registro-horas.tsx`:** Interfaz para que supervisores y becarios examinen las horas cronometradas de ingreso y salida, corroborando el estatus de puntualidad y cumplimiento de tareas.
- **`aprobacion-pasajes.tsx`:** Respalda la política institucional de reintegro de viáticos. Aplica el cálculo matemático exacto en centavos enteros ($80\%$) para evitar distorsiones de redondeo decimal. Muestra el estado de cumplimiento de la regla del día 24 (habilitación de envíos formales) y desglosa cada tramo de ida y vuelta con coordenadas GPS. En caso de rechazo, abre forzosamente un diálogo que exige una justificación escrita antes de consolidar el cambio de estado.

### 3.5. Evaluación Integral 360° y Firma Digital (`src/components/evaluaciones/`)
- **`matriz-evaluacion-360.tsx`:** Digitaliza los cinco ejes de evaluación formal del proyecto de grado:
  1. *Liderazgo en la Iglesia (Formulario F-03):* Ponderación del 25%, evaluado por el pastor de la congregación.
  2. *Autoevaluación Académica:* Ponderación del 20%, cumplimentada por el becario.
  3. *Evaluación del Mentor / Prácticas:* Ponderación del 25%, valorada por el tutor institucional.
  4. *Evaluación Escuela de Líderes:* Ponderación del 15%, emitida por el facilitador pastoral.
  5. *Evaluación Socioeconómica:* Ponderación del 15%, respaldada por trabajo social.
  Calcula matemáticamente la calificación ponderada sobre 100 puntos y sobre la escala vigesimal (0 a 20 puntos), clasificando el rendimiento del estudiante de forma automática.
- **`formulario-f03.tsx`:** Formulario eclesiástico estructurado que recoge criterios cualitativos sobre testimonio cristiano, servicio comunitario y liderazgo juvenil.
- **`firma-digital.tsx`:** Componente de captura de firma manuscrita sobre lienzo HTML5 Canvas con funciones de trazo suave, botón para limpiar el trazo y botón para consolidar y exportar la rúbrica en formato Base64 para su almacenamiento criptográfico.

### 3.6. Reportes y Notificaciones (`src/components/reportes/` y `src/components/notificaciones/`)
- **`visor-reportes-pdf.tsx`:** Emisor de informes mensuales certificados. Permite descargar o imprimir planillas de asistencia, declaraciones del 80% de pasajes, certificados 360° y formularios pastorales F-03.
- **`centro-notificaciones.tsx`:** Bandeja de comunicaciones automatizadas. Presenta alertas clasificadas por naturaleza (recordatorios de salida pendiente, pasajes observados y avisos institucionales), con badges reactivos para elementos no leídos y marcado interactivo.

---

## 4. Biblioteca de Componentes Shadcn UI Integrados (`src/components/ui/`)

Para asegurar la coherencia estética y evitar la reinvención de patrones de interfaz, se han integrado y adaptado los siguientes componentes de la biblioteca oficial Shadcn UI:

| Componente | Archivo Fuente | Propósito y Aplicación en BUMAND |
| :--- | :--- | :--- |
| `Alert` | `ui/alert.tsx` | Alertas contextuales prominentes (avisos de cierre de periodo, recordatorios normativos). |
| `Avatar` | `ui/avatar.tsx` | Representación fotográfica o inicial del becario y del tutor en listas y feeds de auditoría. |
| `Badge` | `ui/badge.tsx` | Etiquetas de estado operativo (Activo, En Observación, Aprobado, Pendiente, 80% Pasajes). |
| `Button` | `ui/button.tsx` | Controles primarios (#063A6B), de acento (#17B4C4), neutros y de peligro con alturas de 36px/40px. |
| `Calendar` | `ui/calendar.tsx` | Calendario interactivo para selección y filtrado de jornadas de asistencia. |
| `Card` | `ui/card.tsx` | Contenedores estructurales con borde tenue (#E3DCCB), fondo blanco y esquinas redondeadas (12px). |
| `Chart` | `ui/chart.tsx` | Contenedor responsivo y tooltips personalizados para librerías gráficas Recharts. |
| `Checkbox` | `ui/checkbox.tsx` | Selección múltiple en tablas de becarios y listas de verificación de requisitos. |
| `Dialog` | `ui/dialog.tsx` | Ventanas modales centradas con desenfoque de fondo para captura de firmas y nuevos registros. |
| `Input` | `ui/input.tsx` | Campos de captura de texto numérico y alfanumérico con altura estandarizada de 40px. |
| `Label` | `ui/label.tsx` | Etiquetas accesibles vinculadas semánticamente a campos de entrada mediante identificadores únicos. |
| `Popover` | `ui/popover.tsx` | Desplegables flotantes ligeros para selectores de fecha y filtros compactos. |
| `Progress` | `ui/progress.tsx` | Barras de avance porcentual para consumo presupuestario y metas de horas trabajadas. |
| `RadioGroup` | `ui/radio-group.tsx` | Selección unívoca de alternativas en cuestionarios evaluativos y tipos de tramo (Ida / Vuelta). |
| `ScrollArea` | `ui/scroll-area.tsx` | Barras de desplazamiento estilizadas y delgadas para listados largos sin alterar el ancho de la página. |
| `Select` | `ui/select.tsx` | Menús desplegables estilizados para elección de sedes, periodos académicos y universidades. |
| `Separator` | `ui/separator.tsx` | Líneas divisorias sutiles (#E3DCCB) para segmentar bloques lógicos sin recargar la interfaz. |
| `Skeleton` | `ui/skeleton.tsx` | Indicadores de carga con animación de pulso que preservan la estructura visual durante peticiones HTTP. |
| `Switch` | `ui/switch.tsx` | Conmutadores binarios para alternar vistas (Mensual vs. Anual, Becario vs. Supervisor). |
| `Table` | `ui/table.tsx` | Tablas de datos de alto rendimiento para el directorio de becarios y el historial de reportes. |
| `Tabs` | `ui/tabs.tsx` | Pestañas de navegación de nivel superior que organizan el sistema según los Sprints del proyecto. |
| `Textarea` | `ui/textarea.tsx` | Área de texto multilinea para el ingreso obligatorio de justificaciones de rechazo y observaciones. |
| `Tooltip` | `ui/tooltip.tsx` | Textos de ayuda emergente sobre iconos de estado, pines GPS y métricas operativas. |

---

## 5. Memoria de Diseño e Identidad Visual

Las elecciones estéticas registradas en `.antigravity-design/system.md` aseguran que la plataforma mantenga una identidad sobria, corporativa y legible:

- **Paleta Cromática:**
  - `Azul Diaconía (#063A6B):` Autoridad institucional, barras de navegación y encabezados principales.
  - `Turquesa BUMAND (#17B4C4):` Energía, acento de interacción clave, geocercas activas y estados aprobados.
  - `Dorado Sol (#F8C766):` Logotipo BUMAND, contrastes cálidos y valores monetarios destacados.
  - `Naranja Alerta (#E2694B):` Formularios observados y advertencias de discrepancia GPS.
  - `Arena Borde (#E3DCCB):` Separadores, bordes de tarjeta de 1px y contornos de tabla.
- **Geometría y Ritmo:** El sistema rechaza cualquier espaciado arbitrario (7px, 11px, 17px). Todo margen interno (`padding`), separación entre bloques (`gap`) o margen externo (`margin`) pertenece estrictamente a la escala de múltiplos de 4px (4px, 8px, 12px, 16px, 20px, 24px, 32px).
