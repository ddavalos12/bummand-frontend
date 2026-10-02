# Tratado de Ingeniería de Software: Arquitectura de Vistas, Módulos de Negocio y Experiencia de Usuario de BUMAND Web

**Sistema de Gestión Integral de Asistencia, Pasajes y Seguimiento del Desempeño**  
*Diaconía FRIF-IFD — Programa de Becarios Universitarios de Diaconía (BUMAND)*  
*Gestión Académica y Operativa 2026*

---

## 1. Fundamentos y Arquitectura de la Interfaz Web

El ecosistema digital BUMAND (*Becarios Universitarios de Diaconía*) constituye una plataforma de misión crítica concebida para la gestión, seguimiento, liquidación de viáticos y evaluación holística del programa formativo y ministerial de la institución financiera de desarrollo Diaconía FRIF-IFD en el Estado Plurinacional de Bolivia.

La aplicación de interfaz de usuario de escritorio y tabletas (`bumand-frontend`) ha sido desarrollada como una Aplicación Web Progresiva de alto rendimiento implementada sobre **Next.js 14+ con App Router**, React 19 y Tailwind CSS v4. La ingeniería del frontend prioriza la reactividad perimetral, la predictibilidad del estado, la accesibilidad estandarizada bajo lineamientos WAI-ARIA y la convergencia plena con los servicios desacoplados del backend NestJS.

### 1.1. Principios Rectores del Diseño de Software
La concepción arquitectónica de la interfaz obedece a cuatro principios inquebrantables:

1. **Español Absoluto:** Todo identificador de componentes, nombres de propiedades (`props`), métodos controladores, hooks de ciclo de vida, rutas de navegación, etiquetas de interfaz y mensajes del sistema están expresados en idioma español formal, eliminando anglicismos superficiales en favor de claridad semántica compartida con los actores operativos de la institución.
2. **Memoria de Diseño Antigravity:** Respeto estricto a los tokens cromáticos normativos y a la retícula geométrica modular basada en múltiplos de 4 píxeles (4px, 8px, 12px, 16px, 20px, 24px, 32px), evitando cualquier espaciado arbitrario. Las alturas de controles se encuentran estandarizadas en 36 píxeles para botones de acción compacta y 40 píxeles para campos de entrada de datos y botones principales.
3. **Desacoplamiento Funcional y Renderizado Híbrido:** Segmentación deliberada entre componentes de estructura de servidor (*React Server Components - RSC*) encargados del diseño esquelético, metadatos y layouts, y componentes interactivos de cliente (`'use client'`) donde intervienen suscripciones a eventos de usuario, gráficos vectoriales dinámicos, canvas de firmas y persistencia reactiva.
4. **Seguridad y Precisión Aritmética:** Cero tolerancia al error de precisión de punto flotante en la liquidación presupuestaria, manipulando internamente las partidas monetarias en centavos enteros ($1\,\text{BOB} = 100\,\text{centavos}$) y validando matemáticamente cada regla institucional antes de la emisión de firmas.

### 1.2. Sistema Tipográfico y Tokens Cromáticos Institucionales
La jerarquía visual se sustenta en tres familias tipográficas integradas a través de variables CSS nativas en `layout.tsx`:
- **Bricolage Grotesque (`--font-display`):** Diseñada para impartir carácter y solidez en titulares institucionales, logotipos y cifras de alto impacto cuantitativo.
- **Inter (`--font-sans`):** Empleada en cuerpos de texto, tablas de datos, etiquetas de formulario y descripciones operativas, garantizando legibilidad en densidades de pantalla estándar y retina.
- **IBM Plex Mono (`--font-mono`):** Asignada con exclusividad a marcas de tiempo, coordenadas geográficas (latitud/longitud), valores de radián/geocerca, montos financieros en bolivianos y estados de liquidación.

La paleta de colores institucional, codificada en `globals.css` mediante especificaciones Tailwind CSS v4, articula los siguientes significados semánticos:

| Token Semántico | Código Hexadecimal | Propósito Institucional y Aplicación |
| :--- | :--- | :--- |
| **Azul Diaconía** | `#063A6B` | Color primario de autoridad corporativa. Cabeceras, barras de navegación, botones principales y bordes estructurales activos. |
| **Turquesa BUMAND** | `#17B4C4` | Color de acento e interactividad. Geocercas dinámicas, estados aprobados, gráficos de tendencia y botones de acción afirmativa. |
| **Dorado Sol** | `#F8C766` | Distintivo visual secundario. Emblema BUMAND, balance reembolsado en tarjetas destacadas y contrastes de acento. |
| **Naranja Alerta** | `#E2694B` | Indicador de peligro y advertencia. Formularios observados, rechazo de solicitudes y badges de discrepancia. |
| **Arena Borde** | `#E3DCCB` | Tonalidad neutra para divisiones sutiles, bordes de tarjeta de 1px y contornos de tablas analíticas. |
| **Fondo Crema** | `#F6F2E9` | Superficie general de fondo para suavizar el contraste y reducir la fatiga visual de los supervisores. |

---

## 2. Enrutamiento, Sesión y Seguridad Perimetral

### 2.1. Arquitectura de Layout y Configuración Base (`src/app/layout.tsx`)
El archivo `layout.tsx` constituye la raíz del árbol DOM para la totalidad de rutas del sistema. Sus responsabilidades técnicas abarcan:
1. **Inyección Tipográfica Optimizada:** Configura las fuentes de Google Fonts (`Bricolage_Grotesque`, `Inter`, `IBM_Plex_Mono`) aplicando la propiedad `subsets: ["latin"]` y mapeando variables CSS (`--font-display`, `--font-sans`, `--font-mono`) en el elemento raíz `<html>`.
2. **Normalización del Viewport:** Establece `h-full antialiased` en la etiqueta `<html>` y `min-h-full flex flex-col font-sans bg-background` en `<body>`, garantizando que la aplicación ocupe la totalidad de la ventana sin saltos de scroll indeseados.
3. **Encapsulamiento de Proveedores Globales:** Envuelve a los componentes descendientes (`children`) en el envoltorio `<Proveedores>`, garantizando que el árbol de componentes disponga de acceso inmediato al contexto de autenticación y al gestor unificado de tooltips accesibles.

### 2.2. Portal de Acceso y Autenticación Perimetral (`src/app/inicio-sesion/page.tsx`)
El portal de inicio de sesión gestiona el desafío de credenciales de usuarios institucionales (becarios y supervisores):
- **Estado Local y Control de Formulario:** Gestiona variables de estado para el correo electrónico (`correo`), la contraseña institucional (`contrasena`), el indicador de transacción asíncrona (`cargando`) y los mensajes de excepción técnica (`error_form`).
- **Despacho HTTP y Conexión con NestJS:** Al interceptar el evento `onSubmit`, despacha una petición asíncrona mediante `fetch` al endpoint perimetral `${process.env.NEXT_PUBLIC_API_URL}/autenticacion/inicio-sesion` con método `POST` y cuerpo codificado en JSON.
- **Resolución de Token y Fallback de Resiliencia:** Si la respuesta HTTP es exitosa (`respuesta.ok`), extrae el token portador (`access_token`) y el objeto de perfil del usuario. En caso de operar en entornos aislados o de desarrollo sin backend en ejecución, la lógica provee una contingencia con un perfil demo preconfigurado para evitar el bloqueo del flujo de pruebas.
- **Transición de Estado:** Invoca el método `iniciarSesion(token, usuario)` del contexto global y redirige de manera imperativa a la ruta raíz `/` mediante el enrutador de Next.js (`useRouter`).
- **Retroalimentación Visual:** En caso de credenciales inválidas o falla de enlace de red, renderiza una alerta con fondo suave `#E2694B`/10, tipografía en rojo ladrillo y bordes con opacidad del 20%, conservando la estructura del formulario intacta.

### 2.3. Proveedor Global de Autenticación (`src/contextos/autenticacion-contexto.tsx`)
El contexto `AutenticacionContexto` actúa como la única fuente de verdad sobre la sesión del operador en el navegador web:
- **Estructura de Datos de Usuario (`Usuario`):** Modela de forma fuertemente tipada la identidad del operador:
  ```typescript
  export interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    rol: string; // "becario" | "supervisor" | "administrador"
    becario_id?: number;
  }
  ```
- **Persistencia en Almacenamiento Local (`localStorage`):** Durante la fase de montaje en cliente (`useEffect`), el contexto examina la existencia de las claves `bumand_token` y `bumand_usuario`. En caso de estar presentes, hidrata el estado reactivo sin necesidad de reautenticación; en caso contrario, si la ruta activa difiere de `/inicio-sesion`, ejecuta una redirección automática para blindar las vistas internas contra accesos no autorizados.
- **Acciones Expuestas (`iniciarSesion` y `cerrarSesion`):** 
  - `iniciarSesion`: Sincroniza la memoria reactiva con `localStorage` y enruta al panel central `/`.
  - `cerrarSesion`: Purga las credenciales persistidas, restablece las referencias a `null` y expulsa al usuario al portal de login.
- **Hook Personalizado `usarAutenticacion()`:** Encapsula el consumo mediante `useContext(AutenticacionContexto)` y genera una excepción en tiempo de desarrollo si algún desarrollador intenta instanciarlo fuera de un nodo descendiente de `ProveedorAutenticacion`.

### 2.4. Envoltorio de Proveedores Globales (`src/components/proveedores.tsx`)
Este componente cliente modular unifica la arquitectura de inyección de dependencias visuales y de contexto en el frontend:
- Encapsula en un primer nivel al `ProveedorAutenticacion`, otorgando reactividad de sesión a todo el árbol.
- Integra de forma contigua al `TooltipProvider` de Radix UI / Shadcn UI con un retardo de activación configurado a cero milisegundos (`delayDuration={0}`), garantizando que los globos de ayuda emergente sobre coordenadas GPS, fórmulas de pasajes y estados de asistencia se desplieguen instantáneamente al posar el cursor.

---

## 3. Navegación Unificada por Sprints y Control de Roles

La vista central del sistema web reside en `src/app/page.tsx`. A diferencia de arquitecturas tradicionales dispersas en múltiples rutas monolíticas, este portal unifica la experiencia en un panel modular orquestado por pestañas jerárquicas vinculadas directamente al cronograma de entrega del sistema (Sprints 1 al 9).

### 3.1. Conmutador de Roles Dinámico (Supervisor vs. Becario)
En la esquina superior derecha de la cabecera institucional, la vista dispone de un control conmutador que permite alternar instantáneamente la perspectiva operativa:
- **Rol Supervisor (`supervisor`):** Identificado en el encabezado como *Tutor: Angel Javier Ali Paz*. Otorga visibilidad total sobre la administración global, permitiéndole auditar la totalidad de becarios, ajustar las geocercas satelitales, visar las declaraciones de pasajes del 80% y suscribir evaluaciones 360° mediante firma digital.
- **Rol Becario (`becario`):** Identificado como *Becaria: Nilda Churata Paye*. Restringe la interfaz a la perspectiva de autogestión: bitácora de asistencia, declaración de recorridos en dos etapas (ida y vuelta), visualización del radar de geocerca personal y consulta de calificaciones pastorales.
- **Sincronización Automática de Pestaña:** Si el usuario activo conmuta al rol de becario mientras se encuentra examinando la pestaña de *Administración (S6)*, el controlador interno reubica de inmediato la selección activa a la pestaña de *Resumen (S1)*, previniendo visualizaciones anómalas de vistas restringidas.

### 3.2. Estructura Jerárquica de Pestañas (`Tabs`)
La barra de navegación (`TabsList`) agrupa los módulos en botones tabulares estandarizados con altura de 36px, esquinas redondeadas de 12px y renderizado condicional de acuerdo al rol vigente:

```
[Cabecera BUMAND] -> Indicador de Sprints 1-9 Activos + Selector de Rol
       │
       ▼
 ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
 │ Dashboard   │ Resumen     │ Becarios    │ Sedes       │ Asistencia  │ Pasajes 80% │ Eval. 360°  │ Reportes    │ Notificaciones │
 │ (Sprint 6)* │ (Sprint 1)  │ (Sprint 2)* │ (Sprint 2)  │ (Sprint 3)  │ (Sprint 4)  │ (Sprint 5)  │ (Sprint 7)  │ (Sprint 8)     │
 └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
  * Vistas reservadas para el perfil de Supervisor institucional.
```

### 3.3. Pestaña de Resumen y Acciones Rápidas (Sprint 1)
La pestaña `resumen` funciona como el portal de inicio rápido para el estudiante becario:
- **Trío de Métricas Inmediatas:** Presenta tres tarjetas ejecutivas que sintetizan:
  1. *Pasajes Liquidados en el Mes Actual:* Resalta el reembolso exacto de Bs 276.00 sobre un acumulado declarado de Bs 345.00 con tipografía destacada `#F8C766`.
  2. *Horas Acreditadas:* Exhibe 64.5 horas acumuladas con badge de puntualidad certificada al 96%.
  3. *Sede Asignada:* Sede física activa (*Oficina Central - Bloque A*) con su dirección georreferenciada en la urbe alteña.
- **Consola de Acciones Inmediatas:** En el panel lateral, el becario cuenta con disparadores en ventana modal (`Dialog`) para:
  - Declarar un nuevo tramo de viaje (`RegistroRecorrido`).
  - Completar o revisar el Formulario Pastoral F-03 (`FormularioF03`).
  - Registrar rúbrica manuscrita (`FirmaDigital`).
- **Radar de Proximidad en Vivo:** Renderiza el componente `RadarGeocerca` indicando la cercanía respecto al perímetro de tolerancia de 150 metros.

---

## 4. Módulo de Analítica y Control de Gestión (`panel-administrativo.tsx`)

Ubicado en `src/components/panel-control/panel-administrativo.tsx` (Sprint 6), este módulo conforma el cuadro de mando gerencial utilizado por los coordinadores del programa y la Dirección Nacional de Diaconía FRIF-IFD para monitorear el desempeño operativo, formativo y financiero.

### 4.1. Alerta Institucional de Liquidación Mensual
La vista encabeza con un componente `Alert` estructurado con borde `#17B4C4`/40 y fondo translúcido, notificando la apertura del ciclo de liquidación de pasajes de Septiembre 2026 y la plena vigencia de la verificación satelital geodésica.

### 4.2. Tarjetas de Indicadores Clave de Desempeño (KPIs)
El tablero organiza cuatro tarjetas estructuradas en una cuadrícula responsiva (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`):
1. **Becarios Activos:** Cifra de 25 estudiantes beneficiarios (100% de la cohorte 2026) con barra de progreso consolidada al 100% e icono institucional `Users`.
2. **Horas Efectivas Acumuladas:** Registro de 1,040 horas acumuladas frente a una meta planificada de 950 horas (+109% de cumplimiento global) con barra de avance al 92% de la meta semestral final.
3. **Avance de Evaluaciones 360°:** Proporción de 4 de 5 instrumentos completados (80%), exhibiendo un indicador en alerta cálida que recuerda que la *Evaluación de Escuela de Líderes* continúa en estado pendiente.
4. **Presupuesto Ejecutado de Pasajes:** Monto de Bs 5,240.00 liquidados sobre un techo presupuestario mensual de Bs 10,000.00 (52.4% de ejecución financiera) presentado sobre fondo Azul Diaconía (`#063A6B`) con cifras en Dorado Sol (`#F8C766`).

### 4.3. Visualización Gráfica Interactiva con Recharts
El dashboard integra tres modelos de visualización vectorial de alta precisión mediante la biblioteca Recharts:

```
┌──────────────────────────────────────────────────────────────┬──────────────────────────────┐
│ Gráfico de Área Suavizada: Horas Reales vs. Meta             │ Donut: Partida Presupuesto   │
│ [AreaChart con linearGradient #17B4C4 + Switch Semestral/Anual]│ [PieChart con Cell]          │
│ - Enero: 520h / Meta: 600h       - Mayo: 920h / Meta: 850h   │ ■ 80% Reembolsado: Bs 5,240  │
│ - Marzo: 850h / Meta: 800h       - Sept: 1040h / Meta: 950h  │ ■ Pendiente:       Bs 1,820  │
│                                                              │ ■ Saldo:           Bs 2,940  │
├──────────────────────────────────────────────────────────────┴──────────────────────────────┤
│ Gráfico de Barras Horizontales por Dependencia de Diaconía FRIF-IFD                         │
│ - Consultorio Médico:    410 hrs [=================================>]                       │
│ - Agencia El Alto:       480 hrs [=======================================>]                 │
│ - Seguridad Física:      340 hrs [============================>]                            │
│ - Escuela de Líderes:    320 hrs [========================>]                                │
│ - Productos y Canales:   290 hrs [=====================>]                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Serie Temporal de Horas Efectivas (`AreaChart`)
- **Degradado Vectorial:** Define un elemento `<linearGradient id="degradadoHoras">` con parada al 5% con opacidad 0.4 de `#17B4C4` y desvanecimiento al 95% con opacidad nula.
- **Conmutador de Rango Temporal:** Un interruptor interactivo (`Switch`) permite alternar la escala de análisis entre la proyección semestral (meses 1 a 6) y la proyección anual consolidada (Enero a Septiembre).
- **Tooltips Contextuales:** Implementa `ChartTooltip` y `ChartTooltipContent` adaptados para desplegar las cifras exactas al posar el cursor sobre los vértices de la curva.

#### B. Composición del Presupuesto del 80% (`PieChart` en Donut)
- **Geometría Circular:** Diámetro interior de 55px (`innerRadius`) y diámetro exterior de 80px (`outerRadius`) con separación de 4 grados entre segmentos (`paddingAngle={4}`).
- **Asignación Cromática por Partida:**
  - `80% Reembolsado:` `#17B4C4` (Bs 5,240.00 — 52.4%).
  - `Pendiente de Aprobación:` `#F8C766` (Bs 1,820.00 — 18.2%).
  - `Saldo Presupuestario Disponible:` `#063A6B` (Bs 2,940.00 — 29.4%).
- **Formateador Numérico:** El tooltip de Recharts procesa cada cuota monetaria imprimiendo el sufijo formal `Bs [valor].00`.

#### C. Carga Horaria por Unidad Operativa
Visualiza mediante barras horizontales la distribución de horas de práctica en las distintas unidades de Diaconía:
- Agencia Central El Alto: 480 horas.
- Consultorio Médico Comunitario: 410 horas.
- Seguridad Física e Infraestructura: 340 horas.
- Escuela de Líderes Juveniles: 320 horas.
- Productos y Canales Financieros: 290 horas.

### 4.4. Bitácora de Auditoría en Tiempo Real
Un feed cronológico detalla los últimos cuatro eventos transaccionales del sistema, incorporando avatares con iniciales (`AvatarFallback`), marcas de tiempo relativas ("Hace 15m", "Ayer") y badges de estado tipados (`completado` en verde esmeralda y `pendiente` en ámbar).

---

## 5. Directorio de Becarios y Alta Institucional (`gestion-becarios.tsx`)

Ubicado en `src/components/becarios/gestion-becarios.tsx` (Sprint 2), este módulo centraliza el padrón de estudiantes becarios beneficiarios de la gestión 2026.

### 5.1. Motor de Filtrado Reactivo en Memoria
El componente implementa una barra de búsqueda en tiempo real insensible a mayúsculas y minúsculas:
```typescript
const becarios_filtrados = lista_becarios.filter(
  (b) =>
    b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    b.ci.includes(busqueda) ||
    b.carrera.toLowerCase().includes(busqueda.toLowerCase())
);
```
Esta lógica evalúa concurrentemente el nombre completo, el documento de identidad y la disciplina universitaria sin latencia de red, actualizando al instante el contador del total de registros encontrados.

### 5.2. Modal de Registro de Nuevo Becario (`Dialog`)
El botón primario *Nuevo Becario* activa una ventana modal que recopila la información formativa y operativa del postulante:
- **Nombre Completo:** Campo de texto obligatorio con placeholder normativo.
- **Cédula de Identidad (C.I.):** Campo numérico validado.
- **Universidad de Procedencia:** Menú desplegable (`Select`) poblado con las universidades bajo convenio institucional:
  - Universidad Mayor de San Andrés (UMSA).
  - Universidad Pública de El Alto (UPEA).
  - Universidad Católica Boliviana "San Pablo" (UCB).
  - Universidad Privada del Valle (UNIVALLE).
- **Carrera Universitaria:** Campo de texto libre (e.g. Educación Parvularia, Medicina, Estadística, Ingeniería de Sistemas).
- **Sede de Práctica Asignada:** Asignación de la geocerca inicial (Bloque A, Bloque B, Sucursal Juan Pablo II o Sucursal Villa Adela).
- **Persistencia en Lista:** Al someter el formulario, el controlador agrega al nuevo becario al inicio del arreglo reactivo (`[nuevo, ...lista_becarios]`), resetea los campos del formulario y cierra automáticamente la modal.

### 5.3. Tabla de Datos Institucional
Estructurada con las etiquetas semánticas de Shadcn UI (`Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`):
- Columna 1: Nombre del becario con avatar circular en Azul Diaconía.
- Columna 2: Cédula de identidad en fuente tipográfica monoespaciada (`font-mono`).
- Columna 3: Carrera y sigla de la universidad con icono `GraduationCap` en Turquesa BUMAND.
- Columna 4: Lugar de práctica con icono `Building2`.
- Columna 5: Tutor institucional responsable y enlace de correo electrónico directo con icono `Mail`.
- Columna 6: Badge de estado en verde esmeralda (`ACTIVO`) con icono `UserCheck`.

---

## 6. Geocercas Satelitales y Calibración Métrica (`mapa-lugares-practica.tsx`)

Ubicado en `src/components/lugares-practica/mapa-lugares-practica.tsx` (Sprint 2), este módulo administra las 72 sedes eclesiásticas y operativas de Diaconía FRIF-IFD distribuidas en el eje La Paz - El Alto y provincias circundantes.

### 6.1. Directorio de Sedes Georreferenciadas
La columna izquierda del módulo lista las sucursales institucionales con sus metadatos geoespaciales:
- **Oficina Central - Bloque A:** Latitud `-16.500053`, Longitud `-68.173455`, Radio base de 80 metros, 12 becarios asignados.
- **Oficina Central - Bloque B:** Latitud `-16.499912`, Longitud `-68.173204`, Radio base de 60 metros, 8 becarios asignados.
- **Agencia Juan Pablo II:** Latitud `-16.502310`, Longitud `-68.168920`, Radio base de 100 metros, 5 becarios asignados.
- **Agencia La Paz Central:** Latitud `-16.496520`, Longitud `-68.134210`, Radio base de 100 metros, 4 becarios asignados.

Un diálogo modal complementario permite agregar nuevas sedes ingresando nombre, dirección física, coordenadas en grados decimales con precisión de seis decimales y radio de tolerancia inicial.

### 6.2. Radar Táctico de Simulación Geodésica
En el panel derecho, el sistema dibuja un visualizador táctico con estética de instrumentación aeronáutica y radar geográfico:
- **Fondo con Retícula Radial:** Capa de gradiente radial con puntos turquesa de 1px cada 24px sobre fondo azul noche `#063A6B`.
- **Anillo de Geocerca Exterior Activo:** Círculo concéntrico de borde turquesa con relleno del 15% que escala su tamaño dinámicamente según la fórmula matemática:
  $$\text{Diámetro Visual (px)} = \min(\text{radio\_editado} \times 2.2,\, 230\,\text{px})$$
  Este elemento incorpora la animación CSS `animate-pulse` para denotar vigilancia satelital activa.
- **Anillo Interior de Referencia:** Círculo concéntrico con línea discontinua en Dorado Sol (`#F8C766`/60) dimensionado a $\text{radio} \times 1.4$.
- **Marcador Geodésico Central:** Icono de pin con coordenadas decimales exactas en una caja flotante de cristal oscuro con desenfoque de fondo (`backdrop-blur-sm`).
- **Simulador de Posición de Becario:** Punto esmeralda parpadeante (`ring-4 ring-emerald-400/30`) que representa la ubicación captada por el receptor GNSS del dispositivo móvil del estudiante en relación al perímetro.

### 6.3. Calibrador de Tolerancia Métrica (20m - 200m)
Para amortiguar las distorsiones de rebote multicamino (*multipath*) y la atenuación de señal ocasionada por construcciones de hormigón y condiciones meteorológicas en el altiplano andino, el módulo proporciona un control deslizante sincronizado con un campo numérico:
- **Rango Operativo:** Permite calibrar el radio de tolerancia desde un mínimo estricto de 20 metros hasta un máximo permisible de 200 metros (paso de calibración: 5 metros).
- **Sincronización Bidireccional:** El desplazamiento del slider actualiza al instante la escala visual de los círculos concéntricos del radar y el valor numérico del input, permitiendo guardar el ajuste mediante el botón *Guardar Ajuste* para impactar las validaciones de Haversine del backend.

---

## 7. Control de Asistencia y Bitácora de Horas (`registro-horas.tsx`)

Ubicado en `src/components/asistencia/registro-horas.tsx` (Sprint 3), este componente digitaliza la hoja física tradicional de registro de ingreso y retiro de prácticas.

### 7.1. Selector Compuesto de Fecha y Hora (`SeleccionadorFechaHora`)
El componente prescinde de selectores nativos inconsistentes entre navegadores, implementando el componente `SeleccionadorFechaHora` estructurado en dos secciones:
1. **Selector de Calendario (`Popover` + `Calendar`):** Despliega un calendario flotante para la elección de la jornada de práctica, formateando la fecha en formato localizado en español.
2. **Selector de Hora Estandarizada (`Select`):** Provee una lista desplegable con intervalos de tiempo estandarizados (e.g. 08:00, 08:30, 09:00, 17:00, 17:30, 18:00) para garantizar consistencia horaria en las bases de datos.

### 7.2. Trazabilidad de Geolocalización Activa
Una tarjeta informativa con borde `#17B4C4`/20 notifica al estudiante que cada marcación capturará la posición satelital del dispositivo, la cual será validada contra la geocerca de la sede asignada mediante la fórmula geodésica del semiverseno:
$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
Donde $r = 6,371\,\text{km}$ y $\Delta\varphi, \Delta\lambda$ corresponden a las diferencias de latitud y longitud en radianes.

### 7.3. Flujo Asíncrono y Estado de Éxito
Al pulsar *Registrar Asistencia*, el botón entra en estado deshabilitado con mensaje *Procesando...*. Tras completar la transacción con el backend, la vista conmuta a un estado de éxito con el icono `CheckCircle2` de 64px en Turquesa BUMAND, confirmación explícita de almacenamiento y un botón para registrar una nueva jornada si fuera pertinente.

---

## 8. Liquidación y Aprobación de Pasajes al 80% (`aprobacion-pasajes.tsx`)

Ubicado en `src/components/pasajes/aprobacion-pasajes.tsx` (Sprint 4), este módulo materializa uno de los procesos de negocio de mayor sensibilidad institucional: la devolución de viáticos de transporte.

### 8.1. Reglas Institucionales de Negocio y Cómputo Financiero
- **Aritmética Exacta en Centavos:** A fin de prevenir inconsistencias contables por redondeo de números con decimales en JavaScript, los montos se computan y almacenan en centavos enteros:
  $$\text{monto\_devolucion\_centavos} = \left\lfloor \frac{\text{monto\_total\_centavos} \times 80}{100} \right\rfloor$$
  Ejemplo en código: Para un acumulado mensual de $\text{Bs } 345.00$ ($34,500\,\text{centavos}$), la devolución corresponde exactamente a $\text{Bs } 276.00$ ($27,600\,\text{centavos}$).
- **Regla Normativa del Día 24:** El sistema exhibe una alerta permanente recordando que los becarios tienen habilitada la transmisión formal de sus declaraciones de pasajes únicamente a partir del día 24 de cada mes.

### 8.2. Desglose de Tramos de Ida y Vuelta
Cada tarjeta de solicitud desglosa la serie de viajes realizados por el becario en el periodo evaluado:
- **Identificador de Tramo:** Badge con distinción cromática: turquesa para tramos de *IDA* y ámbar para tramos de *VUELTA*.
- **Ruta Declarada:** Origen y destino formal (e.g. *Zona 16 de Julio &rarr; Oficina Central Diaconía Bloque A*).
- **Comprobación Telemática:** Etiqueta *GPS Verificado* con icono `MapPin` esmeralda que certifica que el recorrido cuenta con registro de coordenadas registradas al momento del embarque.
- **Justificación Formativa:** Glosa del trabajo ministerial o apoyo institucional ejecutado en el destino (e.g. *Revisión de carpetas parvularias*, *Taller Escuela de Líderes*).
- **Tarifa Oficial:** Monto unitario del pasaje en bolivianos.

### 8.3. Flujo de Aprobación vs. Rechazo Observado
El supervisor cuenta con dos vías de acción:
1. **Aprobación Directa:** Al presionar el botón *Aprobar*, la solicitud muta inmediatamente a estado `aprobado`, sellando la orden de liquidación con el badge verde esmeralda `APROBADO`.
2. **Rechazo / Observación Obligatoria:** Si el supervisor detecta irregularidades (e.g. tarifas declaradas por encima del arancel de transporte municipal), el sistema abre obligatoriamente una ventana modal de diálogo (`Dialog`). La interfaz prohíbe el envío del rechazo si el área de texto (`textarea`) se encuentra vacía, exigiendo asentar formalmente el justificativo para que el estudiante pueda rectificar sus datos. La observación queda fijada en una caja ámbar visible para auditoría posterior.

---

## 9. Evaluación Integral 360° y Firma Digital (`matriz-evaluacion-360.tsx`, `formulario-f03.tsx`, `firma-digital.tsx`)

El subsistema de evaluación integral digitaliza el modelo de acreditación formativa y ministerial de BUMAND (Sprint 5).

### 9.1. Matriz de los Cinco Ejes Ponderados (`matriz-evaluacion-360.tsx`)
La calificación semestral no responde a una nota subjetiva aislada, sino a la conjunción ponderada de cinco actores institucionales:

| Identificador de Eje | Nombre del Módulo Evaluativo | Actor Evaluador | Ponderación (%) |
| :--- | :--- | :--- | :--- |
| **Eje 1** | Liderazgo en la Iglesia (Formulario F-03) | Pastor de la Congregación | 25% |
| **Eje 2** | Autoevaluación Académica | Estudiante Becario | 20% |
| **Eje 3** | Evaluación del Mentor / Prácticas | Supervisor Diaconía | 25% |
| **Eje 4** | Evaluación Escuela de Líderes | Facilitador Pastoral | 15% |
| **Eje 5** | Evaluación Socioeconómica | Trabajador Social | 15% |

#### Algoritmo de Calificación Dinámica
El cálculo de la nota global acumulada sobre 100 puntos se evalúa reactivamente:
$$\text{Nota 360°} = \sum_{i=1}^{5} \left( \frac{\text{Puntaje}_i \times \text{Ponderación}_i}{100} \right)$$
El sistema restringe las notas numéricas al intervalo estricto $[0, 100]$ y reclasifica automáticamente al estudiante en los rangos cualitativos institucionales:
- $\ge 90.0\,\text{pts}$: *Rendimiento Sobresaliente*.
- $\ge 80.0\,\text{pts} \text{ y } < 90.0\,\text{pts}$: *Rendimiento Muy Bueno*.
- $< 80.0\,\text{pts}$: *En Observación Académica*.

### 9.2. Formulario Ministerial Eclesiástico F-03 (`formulario-f03.tsx`)
Este componente digitaliza el instrumento pastoral oficial completado por los pastores de las iglesias locales:
- **Cuestionario de Competencias:** Lista estructurada de preguntas sobre puntualidad, responsabilidad, espíritu de servicio y trabajo en equipo eclesial.
- **Selectores de Tipo "Pills" Semánticas:** Las cuatro opciones cualitativas (*Siempre*, *Casi Siempre*, *A veces*, *Nunca*) se presentan en botones redondeados interactivos (`RadioGroupItem` oculto vinculado a un `Label` con bordes estilizados). Al seleccionarse, adoptan el fondo `#E3F9FA`, borde turquesa y tipografía resaltada.
- **Bloque Cualitativo:** Área para observaciones sobre el crecimiento espiritual y liderazgo juvenil del becario.
- **Envío Protegido:** El botón de envío permanece inhabilitado hasta que la totalidad de las preguntas hayan sido respondidas, despachando la carga útil a `/evaluaciones` en el backend.

### 9.3. Captura de Firma Digital sobre HTML5 Canvas (`firma-digital.tsx`)
Provee un lienzo interactivo de captura de rúbricas manuscritas tanto en dispositivos móviles (soporte táctil `onTouchStart`, `onTouchMove`, `onTouchEnd`) como en estaciones de escritorio con ratón (`onMouseDown`, `onMouseMove`, `onMouseUp`):
- **Suavizado de Trazo:** Configura el contexto 2D del canvas con `lineCap = "round"`, `lineJoin = "round"`, grosor de línea de 2.5 píxeles y color Azul Diaconía (`#063A6B`).
- **Control de Coordenadas Relativas:** La función `obtenerCoordenadas` deduce la posición exacta del cursor sustrayendo las fronteras devueltas por `getBoundingClientRect()`.
- **Serialización Criptográfica Base64:** Tras validar que el lienzo no se encuentra en blanco (`tiene_firma`), el método `manejarGuardado` invoca `toDataURL("image/png")` generando una cadena Base64 inmutable que es transmitida al componente padre o al backend para su incrustación en documentos PDF certificados.

### 9.4. Historial de Evaluaciones del Becario (`lista-evaluaciones.tsx`)
Componente auxiliar que efectúa una petición autenticada `GET /evaluaciones/becario/:id` con token JWT en cabecera `Authorization: Bearer [token]`, renderizando una grilla con las evaluaciones emitidas por semestre, sus notas sobre 10 puntos y badges de estado (`APROBADO`, `BORRADOR` o `PENDIENTE`).

---

## 10. Telemetría de Recorridos y Geocerca en Campo (`radar-geocerca.tsx`, `registro-recorrido.tsx`)

Ubicados en `src/components/recorridos/`, estos módulos simulan y procesan la experiencia móvil del estudiante al trasladarse entre su domicilio, su universidad y las dependencias de Diaconía FRIF-IFD.

### 10.1. Radar Geocerca de Proximidad (`radar-geocerca.tsx`)
- **Escaneo Perimetral:** Al montarse el componente, activa una simulación temporal de escaneo satelital de 3 segundos con la etiqueta monoespaciada `ESCANEANDO PERÍMETRO...`.
- **Animación Radar Concéntrica:** Renderiza tres capas concéntricas con animación `animate-ping` con desfases controlados de retardo (0.0s, 0.7s y 1.4s) y duración de ciclo de 2.6 segundos.
- **Fijación de Coordenadas:** Concluida la simulación, despliega un pin ámbar rotado a 45 grados (`#F5A623`), fija la etiqueta `COORDENADAS FIJADAS` y habilita los botones para *Marcar Llegada* o *Marcar Salida* en la sede detectada.

### 10.2. Asistente de Recorridos en Dos Etapas (`registro-recorrido.tsx`)
Facilita la rendición de cuentas de transporte evitando inconsistencias en los puntos geográficos:
- **Flujo Guiado (Ida y Vuelta):** En la primera fase (`paso === "ida"`), el estudiante ingresa su origen, destino, medio de transporte (Bus, Tren o Taxi) y tarifa en bolivianos.
- **Traspaso Automático de Coordenadas:** Al presionar *Continuar a Vuelta*, el sistema guarda el importe de ida y asigna automáticamente el destino previo como el nuevo punto de partida para el retorno, requiriendo únicamente el destino final y la tarifa del tramo inverso.
- **Liquidación en Pantalla:** Calcula y proyecta en tiempo real la sumatoria de ambos tramos y la devolución exacta del 80% antes de someter la información a la base de datos.

---

## 11. Emisión de Reportes Certificados en PDF (`visor-reportes-pdf.tsx`)

Ubicado en `src/components/reportes/visor-reportes-pdf.tsx` (Sprint 7), este módulo permite generar, visualizar y descargar constancias institucionales oficiales homologadas con las planillas físicas originales.

### 11.1. Catálogo de Documentos Oficiales Emitidos
1. **Informe Mensual de Horas y Prácticas Preprofesionales:** Detalle cronológico de asistencias, cómputo total de horas validadas y ratio de puntualidad.
2. **Formulario Oficial de Devolución del 80% de Pasajes:** Declaración jurada de tramos con coordenadas GPS, montos en bolivianos y cálculo de liquidación presupuestaria.
3. **Formulario F-03: Evaluación Pastoral y Eclesiástica:** Copia certificada del dictamen pastoral sobre el testimonio cristiano y liderazgo ministerial del estudiante.
4. **Certificado Integral de Desempeño y Liderazgo 360°:** Documento conclusivo con el promedio ponderado de los cinco ejes evaluativos, clasificación de rendimiento y firmas digitales integradas.

### 11.2. Tabla de Auditoría de Documentos Archivados
Estructura un historial con las columnas: documento oficial, periodo académico, nombre del becario, fecha de emisión y botón para descarga de archivos con peso en kilobytes especificado.

---

## 12. Centro de Notificaciones y Comunicaciones Push (`centro-notificaciones.tsx`)

Ubicado en `src/components/notificaciones/centro-notificaciones.tsx` (Sprint 8), este módulo sirve como centro de avisos operativos sincronizado con Firebase Cloud Messaging (FCM).

### 12.1. Tipología y Codificación Cromática de Eventos
Las alertas se dividen en cuatro categorías con insignias visuales distintivas:
- **Asistencia (`asistencia`):** Recordatorios de marcación de salida pendiente. Icono `Clock` en azul.
- **Pasajes (`pasajes`):** Solicitudes observadas o con requerimiento de corrección. Icono `AlertTriangle` en ámbar.
- **Evaluación (`evaluacion`):** Avisos de formularios pastorales F-03 cargados por los ministros. Icono `FileCheck` en verde esmeralda.
- **General (`general`):** Comunicados institucionales sobre apertura del periodo de pasajes del 24 al 30 de cada mes. Icono `Send` en gris corporativo.

### 12.2. Gestión de Estados de Lectura
- **Indicador de No Leídos:** Insignia destacada en rojo ladrillo (`#E2694B`) en la cabecera que computa las alertas pendientes.
- **Punto de Pulso Reactivo:** Cada notificación no leída exhibe un punto turquesa con animación de pulso suave.
- **Acciones Rápidas:** Botón para marcar individualmente una alerta como leída (`marcarComoLeida`) o purgar la bandeja completa mediante *Marcar todo leído* (`marcarTodasComoLeidas`).

---

## 13. Mapeo Arquitectónico de Componentes Shadcn UI (`src/components/ui/`)

El frontend de BUMAND integra y personaliza los componentes fundamentales de Shadcn UI, adaptando sus estilos a la paleta institucional de Diaconía FRIF-IFD:

| Componente | Archivo Fuente | Rol en la Arquitectura de BUMAND |
| :--- | :--- | :--- |
| `Alert`, `AlertTitle`, `AlertDescription` | `ui/alert.tsx` | Notificaciones normativas superiores (periodo de pasajes activo, cierres contables). |
| `Avatar`, `AvatarFallback` | `ui/avatar.tsx` | Representación iconográfica con iniciales en feeds de auditoría y listas de becarios. |
| `Badge` | `ui/badge.tsx` | Etiquetas de estado operativo (`ACTIVO`, `APROBADO`, `OBSERVADO`, `80% Pasajes`). |
| `Button` | `ui/button.tsx` | Controles de acción primaria (`#063A6B`), acento (`#17B4C4`) y peligro (`#E2694B`). |
| `Calendar` | `ui/calendar.tsx` | Selector de fechas localizado en español para jornadas de asistencia preprofesional. |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | `ui/card.tsx` | Contenedores estructurales con borde tenue `#E3DCCB` y esquinas redondeadas de 12px. |
| `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` | `ui/chart.tsx` | Envoltorio responsivo para gráficos vectoriales Recharts con tooltips personalizados. |
| `Checkbox` | `ui/checkbox.tsx` | Listas de verificación de requisitos de admisión y selección múltiple de reportes. |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`, `DialogFooter` | `ui/dialog.tsx` | Modales flotantes con desenfoque de fondo para firmas digitales, altas y rechazos. |
| `Input` | `ui/input.tsx` | Campos de entrada de datos alfanuméricos con altura estandarizada de 40px. |
| `Label` | `ui/label.tsx` | Etiquetas semánticas asociadas por identificador único a los controles de formulario. |
| `Popover`, `PopoverTrigger`, `PopoverContent` | `ui/popover.tsx` | Contenedores flotantes ligeros para el calendario y filtros de búsqueda. |
| `Progress` | `ui/progress.tsx` | Barras de progreso para metas de horas trabajadas y ejecución del presupuesto mensual. |
| `RadioGroup`, `RadioGroupItem` | `ui/radio-group.tsx` | Selección de alternativas cualitativas en el Formulario Pastoral F-03. |
| `ScrollArea` | `ui/scroll-area.tsx` | Barras de desplazamiento estilizadas para listas de sedes y notificaciones. |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `ui/select.tsx` | Menús desplegables para universidades, sedes y medios de transporte. |
| `Separator` | `ui/separator.tsx` | Líneas divisorias en color Arena Borde (`#E3DCCB`) para segmentar bloques lógicos. |
| `Skeleton` | `ui/skeleton.tsx` | Marcadores de posición animados mientras se resuelven peticiones HTTP asíncronas. |
| `Switch` | `ui/switch.tsx` | Conmutador interactivo para alternar entre vista semestral y anual en gráficos. |
| `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` | `ui/table.tsx` | Tablas de datos de alta densidad para directorios de becarios y reportes emitidos. |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `ui/tabs.tsx` | Pestañas de navegación de nivel superior organizadas por Sprints del proyecto. |
| `Textarea` | `ui/textarea.tsx` | Campo multilínea obligatorio para ingresar justificaciones en rechazos de viáticos. |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `ui/tooltip.tsx` | Textos de ayuda emergente sobre coordenadas, estados y fórmulas de cálculo. |

---

## 14. Conclusiones de Ingeniería y Cumplimiento Normativo

La arquitectura de la interfaz web de BUMAND (`bumand-frontend`) resuelve de forma integral y definitiva los desafíos de gestión operativa que históricamente afectaban al programa de becarios de Diaconía FRIF-IFD.

1. **Digitalización Integral y Eliminación del Papel:** Al reemplazar planillas impresas por interfaces reactivas protegidas mediante coordenadas geodésicas y firmas en canvas digital, la plataforma garantiza transparencia, inalterabilidad y auditoría permanente.
2. **Equilibrio entre Rigor Contable y Usabilidad:** La implementación de cómputo en centavos enteros y la rigurosa regla del día 24 blindan a la institución contra desvíos presupuestarios, mientras que la interfaz basada en componentes Shadcn UI asegura una curva de aprendizaje mínima para supervisores y estudiantes.
3. **Escalabilidad y Mantenibilidad:** La estricta separación de responsabilidades entre componentes de servidor y de cliente, aunada al cumplimiento estricto de las directrices de codificación en español y la grilla geométrica modular de 4px, sienta las bases para la evolución continua del sistema en futuras gestiones académicas.
