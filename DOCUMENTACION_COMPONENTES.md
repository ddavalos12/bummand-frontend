# Tratado de Ingeniería y Catálogo Arquitectónico de Componentes UI (BUMAND Frontend)

## 1. Fundamentos Teóricos y Filosofía del Sistema de Diseño

El subsistema de interfaz de usuario de la plataforma BUMAND (*Becarios Universitarios en Acción con Diaconía*) constituye el punto de convergencia entre la rigurosidad operativa de la institución Diaconía FRIF-IFD y la ingeniería de software moderna basada en **Next.js 14+ con App Router**, **Tailwind CSS v4** y primitivas no estilizadas de última generación (**Base UI** y **Radix UI**).

Lejos de concebirse como un repositorio estático de fragmentos visuales, la biblioteca de componentes responde a una filosofía de arquitectura atómica, precisión geométrica extrema y semántica estricta. Todo elemento visible u operable ha sido modelado para garantizar accesibilidad universal (cumpliendo con la especificación WAI-ARIA), neutralidad tipográfica, aislamiento de estados y coherencia cromática institucional.

### 1.1. Memoria de Diseño y Cumplimiento Normativo (`.antigravity-design/system.md`)

El diseño de la interfaz se rige de manera incondicional por los principios documentados en la memoria de diseño del proyecto:

1. **Escala de Espaciado Modular (Grilla Base de 4px):**
   Queda terminantemente vetado el uso de dimensiones arbitrarias o empíricas (tales como 7px, 11px, 14px, 17px o 22px). Todas las magnitudes espaciales —incluyendo rellenos (`padding`), márgenes (`margin`), separaciones inter-elementos (`gap`) y delimitaciones estructurales— se expresan matemáticamente como múltiplos de la unidad base de 4px:
   - `4px` (`p-1`, `gap-1`, `size-1`): Microespaciado de alta densidad; separación entre glifos vectoriales y etiquetas compactas.
   - `8px` (`p-2`, `gap-2`, `size-2`): Separador de elementos atómicos en controles cerrados (chips, insignias, botones de icono).
   - `12px` (`p-3`, `gap-3`, `size-3`): Altura de línea compacta, rellenos internos de celdas en rejillas tabulares e intercalado de subformularios.
   - `16px` (`p-4`, `gap-4`, `size-4`): Módulo estándar de separación entre campos de entrada, encabezados y cuerpos de tarjeta.
   - `20px` (`p-5`, `gap-5`): Relleno perimetral de tarjetas secundarias y paneles de métricas.
   - `24px` (`p-6`, `gap-6`): Relleno canónico de contenedores principales, tarjetas ejecutivas y márgenes de sección.
   - `32px` (`p-8`, `gap-8`): Separación macroscópica entre agrupaciones funcionales o transiciones de flujo dentro del layout.

2. **Alturas Estandarizadas de Controles Interactivos:**
   Para asegurar predictibilidad ergonómica en entornos de escritorio y táctiles, las alturas verticales de los elementos de interacción se encuentran calibradas con tolerancias estrictas:
   - **36px (`h-9` o `h-[36px]`):** Botones compactos, acciones contextuales en filas tabulares y barras de herramientas densas.
   - **40px (`h-10` o `h-[40px]`):** Altura estándar para campos de entrada (`Input`), listas desplegables (`SelectTrigger`) y botones primarios de formulario.
   - **44px (`h-11` o `h-[44px]`):** Controles prominentes de pantalla táctil o disparadores de selectores compuestos (tales como el `SeleccionadorFecha` y `SeleccionadorFechaHora`).

3. **Tokens Cromáticos Institucionales y Representación HSL:**
   La paleta de color traslada la herencia corporativa de Diaconía FRIF-IFD a variables CSS semánticas gestionadas bajo el motor Tailwind CSS v4, asegurando compatibilidad biyectiva entre temas diurno y nocturno (*Dark Mode*):

| Token Semántico | Notación Hexadecimal | Equivalencia HSL / Canal | Aplicación Arquitectónica |
| :--- | :--- | :--- | :--- |
| `azul-diaconia` | `#063A6B` | `hsl(209, 89%, 22%)` | Cabeceras principales, barras de navegación lateral, identidad institucional y botones de máximo nivel jerárquico. |
| `turquesa-bumand`| `#17B4C4` | `hsl(186, 79%, 43%)` | Acento primario de interacción, botones de confirmación, geocercas satelitales activas, anillos de foco y glifos destacados. |
| `dorado-sol` | `#F8C766` | `hsl(40, 91%, 68%)` | Acentos cálidos, estados monetarios destacados, advertencias de aprobación y balances presupuestarios clave. |
| `naranja-alerta` | `#E2694B` | `hsl(12, 73%, 59%)` | Estados observados, disconformidad en rendiciones de pasajes, discrepancias de tolerancia métrica y errores semánticos. |
| `arena-borde` | `#E3DCCB` | `hsl(43, 27%, 84%)` | Fronteras perimetrales de tarjetas (1px solid), divisores tenues y rejillas tabulares. |
| `fondo-neutro` | `#F8F9FA` / `#F6F2E9` | `hsl(42, 38%, 94%)` | Superficie de lienzo inferior en paneles administrativos y fondos de página. |
| `blanco-puro` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Superficie elevada de tarjetas, modales flotantes y paneles de control. |
| `texto-primario` | `#1E293B` / `#122029`| `hsl(203, 38%, 12%)` | Tipografía principal, títulos secundarios y texto de entrada. |
| `texto-mutado` | `#64748B` / `#5B6D77`| `hsl(202, 13%, 41%)` | Leyendas secundarias, marcas de tiempo, metadatos y marcadores de posición (*placeholders*). |

---

## 2. Capa de Utilidades Fundacionales: `src/lib/utils.ts`

### 2.1. Propósito y Razonamiento de Ingeniería
En aplicaciones basadas en Tailwind CSS, la combinación dinámica de clases de utilidad puede derivar en conflictos de especificidad en la cascada CSS cuando múltiples reglas apuntan a la misma propiedad computada (por ejemplo, combinar una clase base `p-2` con una propiedad condicional `p-4` o un color de fondo dinámico).

El archivo `src/lib/utils.ts` provee la función canónica `cn`:

```typescript
export { cn } from "cn";
```

### 2.2. Anatomía de `cn`, `clsx` y `tailwind-merge`
Bajo la abstracción unificada de `cn`, confluyen dos bibliotecas críticas del ecosistema moderno de desarrollo web:

1. **`clsx` (o evaluación condicional de clases):**
   Permite recibir cadenas, arreglos, booleanos, nulos y mapas clave-valor de clases condicionales:
   ```typescript
   clsx("btn", esActivo && "btn-activo", { "opacity-50": estaDeshabilitado });
   ```
2. **`tailwind-merge` (`twMerge`):**
   Analiza el árbol de utilidades de Tailwind y resuelve de forma determinista la precedencia de utilidades en conflicto, garantizando que la última clase declarada en orden de llamada sobreescriba a las previas respetando el modelo de cajas y la jerarquía de propiedades CSS.

```typescript
// Demostración conceptual de resolución determinista:
cn("px-4 py-2 bg-primary text-white", "px-6 bg-secondary");
// Resultado resuelto: "py-2 text-white px-6 bg-secondary"
```

Esta utilidad es el pilar sobre el cual se montan todos los componentes del sistema, permitiendo que cualquier desarrollador o módulo extienda la clase base de un componente UI sin romper las variantes definidas internamente por CVA (*Class Variance Authority*).

---

## 3. Catálogo Exhaustivo de Componentes UI (`src/components/ui/`)

---

### 3.1. `alert.tsx` (Componente de Alertas Contextuales)

- **Propósito Funcional y Jerarquía Visual:**
  Diseñado para comunicar mensajes de estado de alta prioridad, avisos de cierre de periodo administrativo, notificaciones normativas o advertencias de tolerancia geográfica. Su jerarquía visual se sitúa inmediatamente debajo de los encabezados de sección o como banner perimetral.
- **Anatomía Interna y Dependencias:**
  Construido con elementos semánticos nativos de HTML y slots de datos (`data-slot`). No requiere primitivas externas de control de foco.
  Subcomponentes exportados:
  - `Alert`: Contenedor principal con rol de accesibilidad `role="alert"`.
  - `AlertTitle`: Título del aviso con peso semibold y anclaje tipográfico.
  - `AlertDescription`: Contenedor de texto detallado con tipografía balanceada (`text-balance`) y soporte de enlaces estilizados.
  - `AlertAction`: Slot posicional para botones o controles de acción inmediata.
- **Tipos TypeScript y Variantes CVA:**
  ```typescript
  const alertVariants = cva(
    "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm ...",
    {
      variants: {
        variant: {
          default: "bg-card text-card-foreground",
          destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );
  ```
- **Estados Interactivos:**
  - `default`: Fondo neutro de tarjeta con borde sutil.
  - `destructive`: Colorimetría de advertencia en contraste de alerta (#E2694B).
  - Enlaces internos (`[&_a]`): Subrayado con offset de 3px y transición al color de primer plano en hover.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
  import { AlertTriangle } from "lucide-react";

  <Alert variant="destructive">
    <AlertTriangle />
    <AlertTitle>Plazo de Rendición de Pasajes Próximo a Vencer</AlertTitle>
    <AlertDescription>
      Recuerde que a partir del día 24 se habilita el envío formal del informe mensual del 80%.
    </AlertDescription>
  </Alert>
  ```

---

### 3.2. `avatar.tsx` (Identificador Visual de Usuario y Becario)

- **Propósito Funcional y Jerarquía Visual:**
  Representación visual gráfica o textual de becarios, supervisores pastorales y tutores en listados, tablas de asistencia y feeds de auditoría. Permite una rápida identificación humana reduciendo la carga cognitiva.
- **Anatomía Interna y Dependencias:**
  Basado en la primitiva `@base-ui/react/avatar`.
  Subcomponentes exportados:
  - `Avatar`: Contenedor circular con borde y mezcla de color (`mix-blend-darken` / `lighten`).
  - `AvatarImage`: Imagen remota optimizada con preservación de relación de aspecto 1:1 (`object-cover`).
  - `AvatarFallback`: Contenedor de iniciales que se renderiza automáticamente si la imagen falla o está cargando.
  - `AvatarBadge`: Insignia de estado operativo (conectado, observado) posicionada en la esquina inferior derecha.
  - `AvatarGroup`: Contenedor flexible con espaciado negativo para apilar múltiples avatares concurrentes.
  - `AvatarGroupCount`: Indicador numérico de usuarios adicionales no visibles (`+N`).
- **Tipos TypeScript y Variantes:**
  Propiedad `size`: `"default"` (32px / `size-8`), `"sm"` (24px / `size-6`), `"lg"` (40px / `size-10`).
- **Estados Interactivos:**
  Manejo transparente del ciclo de carga de imagen provisto por `@base-ui/react/avatar`: transición instantánea entre fallback de texto e imagen cargada sin parpadeos de diseño.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";

  <Avatar size="lg">
    <AvatarImage src="/fotos/becario-102.webp" alt="Juan Carlos Pérez" />
    <AvatarFallback>JP</AvatarFallback>
    <AvatarBadge className="bg-success" />
  </Avatar>
  ```

---

### 3.3. `badge.tsx` (Insignias de Estado Semántico)

- **Propósito Funcional y Jerarquía Visual:**
  Elemento compacto para categorización y etiquetado rápido de registros: estados de becarios (*Activo*, *En Observación*), estados de rendición de pasajes (*Aprobado*, *Pendiente*, *Observado*) o marcas de cumplimiento horario.
- **Anatomía Interna y Dependencias:**
  Utiliza `@base-ui/react/merge-props` y el hook `@base-ui/react/use-render` para permitir polimorfismo completo (renderizarse como `<span>`, enlace `<a>`, etc.) sin perder accesibilidad.
- **Tipos TypeScript y Variantes CVA:**
  ```typescript
  const badgeVariants = cva(
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all ...",
    {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
          secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
          destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 ...",
          outline: "border-border text-foreground [a]:hover:bg-muted ...",
          ghost: "hover:bg-muted hover:text-muted-foreground ...",
          link: "text-primary underline-offset-4 hover:underline",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );
  ```
- **Estados Interactivos:**
  - `focus-visible`: Anillo de foco de 3px (`ring-[3px] ring-ring/50`).
  - `aria-invalid`: Borde y anillo en tono destructivo.
  - Hover dinámico en variantes interactivas (`[a]:hover`).
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Badge } from "@/components/ui/badge";

  <Badge variant="secondary">80% Pasajes Calculado</Badge>
  <Badge variant="destructive">Observación Pendiente</Badge>
  ```

---

### 3.4. `button.tsx` (Controles de Acción Primaria y Secundaria)

- **Propósito Funcional y Jerarquía Visual:**
  El control de comando nuclear de toda la aplicación. Gobierna formularios, confirmaciones transaccionales, descargas de reportes y navegaciones.
- **Anatomía Interna y Dependencias:**
  Basado en la primitiva `@base-ui/react/button`. Incorpora optimizaciones de interacción para prevenir desplazamientos involuntarios durante pulsaciones y soporte integrado para glifos SVG (`lucide-react`).
- **Tipos TypeScript y Variantes CVA:**
  Variantes estéticas (`variant`):
  - `default`: `#17B4C4` con texto `#063A6B`.
  - `secondary`: `#0A5CA0` con texto blanco.
  - `outline`: Borde institucional `#E3DCCB` con fondo transparente.
  - `ghost`: Fondo transparente con realce sutil en hover.
  - `destructive`: Tono `#E2694B` atenuado al 10% con texto de advertencia.
  - `link`: Enlace textual con subrayado interactivo.
  
  Escala de dimensiones (`size`):
  - `default`: Altura de 32px (`h-8`), padding horizontal de 10px (`px-2.5`).
  - `sm`: Altura de 28px (`h-7`), tipografía de 0.8rem.
  - `xs`: Altura de 24px (`h-6`), padding horizontal de 8px (`px-2`).
  - `lg`: Altura de 36px (`h-9`), padding horizontal de 10px (`px-2.5`).
  - Formatos de icono cuadrado: `icon` (`size-8`), `icon-xs` (`size-6`), `icon-sm` (`size-7`), `icon-lg` (`size-9`).
- **Estados Interactivos:**
  - `hover`: Transición de color de fondo al 80% o mezcla de canales `oklch`.
  - `active`: Microtraslación vertical de 1px (`translate-y-px`) para retroalimentación táctil física.
  - `focus-visible`: Anillo concéntrico de 3px (`ring-3 ring-ring/50`).
  - `disabled`: Supresión de eventos de puntero (`pointer-events-none`) y atenuación de opacidad al 50%.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Button } from "@/components/ui/button";
  import { CheckCircle2 } from "lucide-react";

  <Button variant="default" onClick={aprobarRendicion}>
    <CheckCircle2 className="size-4 mr-1.5" />
    Aprobar Pasajes (80%)
  </Button>
  ```

---

### 3.5. `calendar.tsx` (Selector Matricial de Calendario y Fechas)

- **Propósito Funcional y Jerarquía Visual:**
  Permite la navegación cronológica por meses, selección de días específicos para registro de asistencia o intervalos temporales para auditorías de supervisión.
- **Anatomía Interna y Dependencias:**
  Integración avanzada con la biblioteca especializada `react-day-picker` (versión 10+), `date-fns` y glifos vectoriales de `lucide-react` (`ChevronLeftIcon`, `ChevronRightIcon`, `ChevronDownIcon`). Reutiliza internamente el componente `Button` del sistema.
- **Tipos TypeScript y Props:**
  Extiende `React.ComponentProps<typeof DayPicker>`.
  Soporta `buttonVariant`, localización i18n (`Locale`), formateadores personalizados (`formatMonthDropdown`), selección de rangos (`range_start`, `range_middle`, `range_end`) y numeración de semanas.
- **Estados Interactivos:**
  - `today`: Resaltado con fondo mutado y tipografía destacada.
  - `selected`: Aplicación del color institucional primario (`bg-primary text-primary-foreground`).
  - `range_start` / `range_end`: Esquinas redondeadas personalizadas que forman una franja visual continua.
  - `disabled` / `outside`: Días fuera del mes o no laborables con opacidad del 50%.
  - Soporte bidireccional (RTL) para rotación automática de iconos de navegación.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Calendar } from "@/components/ui/calendar";
  import { es } from "date-fns/locale";

  <Calendar
    mode="single"
    selected={fechaSeleccionada}
    onSelect={setFechaSeleccionada}
    locale={es}
  />
  ```

---

### 3.6. `card.tsx` (Contenedor Estructural y Superficie de Elevación)

- **Propósito Funcional y Jerarquía Visual:**
  Constituye la unidad atómica de agrupamiento espacial en BUMAND. Encapsula KPIs de analítica, formularios de registro, mapas de geocercas y módulos de evaluación ministerial.
- **Anatomía Interna y Dependencias:**
  Arquitectura modular sin dependencias externas de librerías. Diseñado con soporte de consultas de contenedor (`@container/card-header`) y variables CSS de espaciado dinámico (`--card-spacing`).
  Subcomponentes exportados:
  - `Card`: Contenedor con esquinas `rounded-xl` (12px), borde perimetral `ring-1 ring-foreground/10` y fondo blanco `#FFFFFF`.
  - `CardHeader`: Cabecera organizada mediante CSS Grid que conmuta a dos columnas al detectar un `CardAction`.
  - `CardTitle`: Título jerárquico con interlineado ceñido (`leading-snug`) y tipografía mediana.
  - `CardDescription`: Texto secundario atenuado para contexto.
  - `CardAction`: Slot posicional en la esquina superior derecha para botones o menús de opciones.
  - `CardContent`: Cuerpo central con relleno modular estandarizado.
  - `CardFooter`: Pie de tarjeta con fondo contrastado `bg-muted/50` y borde superior divisorio.
- **Tipos TypeScript y Variantes:**
  Propiedad `size`: `"default"` (`--card-spacing: 16px`) y `"sm"` (`--card-spacing: 12px`).
- **Estados Interactivos:**
  Superficie pasiva con elevación sutil `shadow-sm`. Cuando se envuelve en enlaces, soporta transiciones de escala y sombra.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

  <Card>
    <CardHeader>
      <CardTitle>Horas Registradas en Consultorio</CardTitle>
      <CardDescription>Jornada académica del ciclo actual</CardDescription>
    </CardHeader>
    <CardContent>
      <span className="text-3xl font-bold text-[#063A6B]">128 h</span>
    </CardContent>
    <CardFooter>Meta mínima mensual: 120 horas</CardFooter>
  </Card>
  ```

---

### 3.7. `chart.tsx` (Infraestructura Gráfica y Analítica con Recharts)

- **Propósito Funcional y Jerarquía Visual:**
  Pilar analítico del sistema. Encapsula y estiliza la biblioteca gráfica **Recharts**, inyectando temas CSS institucionales, tooltips con diseño de alta fidelidad, cursores magnéticos y leyendas reactivas.
- **Anatomía Interna y Dependencias:**
  Integración con `recharts` (`ResponsiveContainer`, `Tooltip`, `Legend`).
  Subcomponentes y utilidades exportadas:
  - `ChartContainer`: Proveedor de contexto (`ChartContext`) que calcula identificadores únicos mediante `React.useId()` y monta el contenedor responsivo con relación de aspecto predeterminada (`aspect-video`).
  - `ChartStyle`: Inyector dinámico de reglas CSS que genera variables de color `--color-{key}` para temas claro y oscuro (`.dark`).
  - `ChartTooltip` y `ChartTooltipContent`: Ventana emergente con cálculo automático de indicadores visuales (`dot`, `line`, `dashed`), formateo numérico tabular (`tabular-nums`) e iconos tipados.
  - `ChartLegend` y `ChartLegendContent`: Leyenda inferior o superior sincronizada con la configuración cromática del gráfico.
  - `useChart`: Hook de contexto para consumo de la configuración interna.
- **Tipos TypeScript:**
  ```typescript
  export type ChartConfig = Record<
    string,
    {
      label?: React.ReactNode;
      icon?: React.ComponentType;
    } & (
      | { color?: string; theme?: never }
      | { color?: never; theme: Record<"light" | "dark", string> }
    )
  >;
  ```
- **Estados Interactivos:**
  Animaciones fluidas en `hover` sobre sectores de pastel, barras o áreas cartesianas, con sincronización de opacidades y desenfoques.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
  import { AreaChart, Area, XAxis, YAxis } from "recharts";

  const config = {
    horas: { label: "Horas Reales", color: "#17B4C4" },
    meta: { label: "Meta Planificada", color: "#063A6B" }
  };

  <ChartContainer config={config} className="h-64">
    <AreaChart data={datosHoras}>
      <XAxis dataKey="mes" />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
      <Area dataKey="horas" fill="var(--color-horas)" stroke="var(--color-horas)" />
    </AreaChart>
  </ChartContainer>
  ```

---

### 3.8. `checkbox.tsx` (Control de Verificación Booleana)

- **Propósito Funcional y Jerarquía Visual:**
  Permite la selección múltiple en listas de verificación, confirmaciones de términos institucionales y selección masiva de registros en tablas de becarios.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/checkbox` y glifo vectorial `CheckIcon` de `lucide-react`. Incorpora un área de toque expandida invisible (`after:absolute after:-inset-x-3 after:-inset-y-2`) que cumple con directrices de ergonomía táctil en pantallas móviles.
- **Tipos TypeScript y Props:**
  Extiende `CheckboxPrimitive.Root.Props`.
- **Estados Interactivos:**
  - `data-checked`: Transición instantánea a fondo turquesa `#17B4C4` con glifo blanco.
  - `focus-visible`: Anillo de foco de 3px (`ring-3 ring-ring/50`).
  - `disabled`: Cursor no permitido (`cursor-not-allowed`) y opacidad del 50%.
  - `aria-invalid`: Anillo y borde perimetral en color destructivo `#E2694B`.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Checkbox } from "@/components/ui/checkbox";
  import { Label } from "@/components/ui/label";

  <div className="flex items-center gap-2">
    <Checkbox id="cumplimiento-regla-24" />
    <Label htmlFor="cumplimiento-regla-24">Declaración verificada a partir del día 24</Label>
  </div>
  ```

---

### 3.9. `dialog.tsx` (Ventanas Modales y Diálogos de Interrupción)

- **Propósito Funcional y Jerarquía Visual:**
  Capa modal de máxima elevación (`z-50`) que interrumpe el flujo de trabajo principal para tareas críticas: captura de firmas digitales manuscritas, confirmación de rechazos con justificación o alta de nuevos becarios.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/dialog` con icono de cierre `XIcon` de `lucide-react` y botón auxiliar estandarizado.
  Subcomponentes exportados:
  - `Dialog`: Raíz de control del estado abierto/cerrado.
  - `DialogTrigger`: Disparador accesible.
  - `DialogPortal`: Inyección en el nodo DOM raíz (`document.body`).
  - `DialogOverlay`: Capa de fondo oscuro translúcido con desenfoque de fondo (`backdrop-blur-xs`).
  - `DialogContent`: Contenedor centrado con animación elástica de escala (`zoom-in-95`).
  - `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`.
  - `DialogClose`: Botón de escape accesible con soporte de atajo `Escape`.
- **Tipos TypeScript y Props:**
  Extiende `DialogPrimitive.Popup.Props` agregando la propiedad booleana `showCloseButton`.
- **Estados Interactivos:**
  - `data-open`: Animación `animate-in fade-in-0 zoom-in-95 duration-100`.
  - `data-closed`: Animación de salida `animate-out fade-out-0 zoom-out-95`.
  - Bloqueo completo del scroll del documento subyacente y captura de foco (*focus trap*).
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";

  <Dialog>
    <DialogTrigger render={<Button variant="destructive">Observar Pasajes</Button>} />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Registro de Observación</DialogTitle>
        <DialogDescription>Indique el motivo por el cual no se valida la ruta declarada.</DialogDescription>
      </DialogHeader>
      {/* Formulario de observación */}
      <DialogFooter showCloseButton>
        <Button variant="default">Confirmar Observación</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ```

---

### 3.10. `input.tsx` (Campo de Entrada Alfanumérico Unilínea)

- **Propósito Funcional y Jerarquía Visual:**
  Componente elemental de captura de datos: números de cédula, nombres completos, montos de pasajes, coordenadas latitud/longitud y términos de búsqueda.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/input`. Cumple rigurosamente con la altura estándar de control de **40px** (`md:text-sm`, `h-8` en versión compacta / `h-10` en formularios estándar).
- **Tipos TypeScript y Props:**
  Extiende `React.ComponentProps<"input">`.
- **Estados Interactivos:**
  - `placeholder`: Color mutado `#64748B`.
  - `focus-visible`: Anillo perimetral institucional de 3px (`ring-3 ring-ring/50`).
  - `disabled`: Fondo atenuado `#E3DCCB/50` y cursor no permitido.
  - `aria-invalid`: Borde y anillo en tono de alerta `#E2694B`.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Input } from "@/components/ui/input";

  <Input
    type="text"
    placeholder="Buscar becario por C.I. o nombre..."
    className="h-10 rounded-xl border-[#E3DCCB]"
  />
  ```

---

### 3.11. `label.tsx` (Etiquetado Tipográfico Accesible)

- **Propósito Funcional y Jerarquía Visual:**
  Asocia títulos semánticos y descriptivos a los campos de formulario (`Input`, `Select`, `Textarea`, `Checkbox`).
- **Anatomía Interna y Dependencias:**
  Elemento `<label>` nativo optimizado con clases de utilidad y prevención de selección accidental de texto (`select-none`).
- **Tipos TypeScript y Props:**
  Extiende `React.ComponentProps<"label">`.
- **Estados Interactivos:**
  - `peer-disabled`: Sincronización automática de opacidad al 50% y cursor de bloqueo cuando el control adyacente está inhabilitado.
  - `group-data-[disabled=true]`: Manejo consistente en grupos de campo.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";

  <div className="grid gap-1.5">
    <Label htmlFor="monto-declarado">Monto Declarado (Bs)</Label>
    <Input id="monto-declarado" type="number" step="0.50" />
  </div>
  ```

---

### 3.12. `popover.tsx` (Paneles Flotantes Contextuales y Desplegables)

- **Propósito Funcional y Jerarquía Visual:**
  Superficie flotante no modal para interfaces contextuales densas: paletas de selección de color, selectores de fecha en línea y filtros avanzados.
- **Anatomía Interna y Dependencias:**
  Construido sobre `@base-ui/react/popover`. Incorpora posicionador dinámico (`Positioner`) con evasión inteligente de colisiones con los bordes de la ventana (*viewport*).
  Subcomponentes exportados: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`.
- **Tipos TypeScript y Props:**
  Configuración posicional: `align` (`"center" | "start" | "end"`), `side` (`"top" | "bottom" | "left" | "right"`), `sideOffset`, `alignOffset`.
- **Estados Interactivos:**
  Animaciones guiadas por atributos de datos: `data-[side=bottom]:slide-in-from-top-2`, `data-open:fade-in-0`, `data-closed:fade-out-0`.
- **Ejemplo de Uso en BUMAND:**
  Utilizado como contenedor base en el componente `SeleccionadorFecha` para desplegar el calendario interactivo sin desmaquetar la vista.

---

### 3.13. `progress.tsx` (Barras Lineales de Avance Porcentual)

- **Propósito Funcional y Jerarquía Visual:**
  Representación métrica de cumplimiento cuantitativo: acumulación de horas de servicio respecto a la meta, porcentaje de ejecución del presupuesto de pasajes y avance de la matriz 360°.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/progress`.
  Subcomponentes exportados:
  - `Progress`: Raíz contenedora con cálculo reactivo de valores.
  - `ProgressTrack`: Riel de fondo con esquinas redondeadas (`rounded-full`) y color `#EFE9DA`.
  - `ProgressIndicator`: Barra activa rellena en color primario `#17B4C4` con transición CSS fluida (`transition-all`).
  - `ProgressLabel` y `ProgressValue`: Etiquetas auxiliares con tipografía monoespaciada para cifras numéricas (`tabular-nums`).
- **Tipos TypeScript y Props:**
  Extiende `ProgressPrimitive.Root.Props` recibiendo la propiedad numérica `value` (0 a 100).
- **Estados Interactivos:**
  Animación suave de interpolación en el ancho cuando el valor cuantitativo se actualiza en tiempo real.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

  <div className="space-y-1">
    <div className="flex justify-between text-xs font-medium">
      <span>Horas Acumuladas</span>
      <span>80%</span>
    </div>
    <Progress value={80}>
      <ProgressTrack className="h-2">
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  </div>
  ```

---

### 3.14. `radio-group.tsx` (Grupos de Selección Excluyente)

- **Propósito Funcional y Jerarquía Visual:**
  Permite al usuario escoger una única alternativa dentro de un conjunto cerrado: tipos de tramo de transporte (*Solo Ida*, *Solo Vuelta*, *Ida y Vuelta*) o escalas de calificación en formularios pastorales.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/radio` y `@base-ui/react/radio-group`.
  Subcomponentes exportados: `RadioGroup` y `RadioGroupItem`.
- **Tipos TypeScript y Props:**
  Extiende las interfaces nativas de Base UI asegurando vinculación con lectores de pantalla mediante roles de grupo `radiogroup` y `radio`.
- **Estados Interactivos:**
  - `data-checked`: Despliega un círculo concéntrico interior blanco sobre fondo turquesa `#17B4C4`.
  - `focus-visible`: Anillo concéntrico exterior de 3px.
  - `disabled`: Opacidad atenuada al 50%.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
  import { Label } from "@/components/ui/label";

  <RadioGroup defaultValue="ida_vuelta" className="flex gap-4">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="ida" id="r-ida" />
      <Label htmlFor="r-ida">Solo Ida</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="ida_vuelta" id="r-ambos" />
      <Label htmlFor="r-ambos">Ida y Vuelta</Label>
    </div>
  </RadioGroup>
  ```

---

### 3.15. `scroll-area.tsx` (Áreas de Desplazamiento Personalizadas)

- **Propósito Funcional y Jerarquía Visual:**
  Reemplaza las barras de desplazamiento nativas del sistema operativo por barras delgadas, estéticas y desvanecibles, evitando saltos de diseño (*layout shifts*) en listados largos (como el feed de notificaciones o el historial de transacciones).
- **Anatomía Interna y Dependencias:**
  Construido sobre `@base-ui/react/scroll-area`.
  Subcomponentes exportados: `ScrollArea` y `ScrollBar`.
- **Tipos TypeScript y Props:**
  Propiedad `orientation`: `"vertical"` (ancho 10px / `w-2.5`) o `"horizontal"` (alto 10px / `h-2.5`).
- **Estados Interactivos:**
  El pulgar de desplazamiento (`ScrollAreaPrimitive.Thumb`) responde a eventos de arrastre táctil y ratón, aplicando color `#E3DCCB` con transición de opacidad al perder foco.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { ScrollArea } from "@/components/ui/scroll-area";

  <ScrollArea className="h-72 w-full rounded-xl border border-[#E3DCCB] p-4">
    {/* Lista extensa de 100 registros de asistencia */}
  </ScrollArea>
  ```

---

### 3.16. `select.tsx` (Listas Desplegables de Selección Tipada)

- **Propósito Funcional y Jerarquía Visual:**
  Control de formulario para elegir una opción entre listas extensas: selección de sede pastoral de práctica, carrera universitaria, periodo semestral o estado de rendición.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/select` y glifos vectoriales de `lucide-react` (`ChevronDownIcon`, `ChevronUpIcon`, `CheckIcon`).
  Subcomponentes exportados: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`.
- **Tipos TypeScript y Props:**
  Trigger con opción de dimensión `size`: `"default"` (altura estándar) y `"sm"` (compacto).
  Contenido (`SelectContent`) con cálculo dinámico de posición y autoalineación con el ancho del disparador (`alignItemWithTrigger`).
- **Estados Interactivos:**
  - `SelectItem` enfocado: Fondo destacado `bg-accent text-accent-foreground`.
  - Icono de verificación visible exclusivamente en el elemento seleccionado activo.
  - Botones de desplazamiento superior/inferior cuando la lista supera el alto del viewport.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

  <Select defaultValue="central">
    <SelectTrigger className="w-full h-10 rounded-xl border-[#E3DCCB]">
      <SelectValue placeholder="Seleccione Sede" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="central">Sede Central - San Pedro</SelectItem>
      <SelectItem value="el_alto">Sucursal El Alto - Ceja</SelectItem>
    </SelectContent>
  </Select>
  ```

---

### 3.17. `seleccionador-fecha.tsx` (Selectores Compuestos de Fecha y Hora Institucionales)

- **Propósito Funcional y Jerarquía Visual:**
  Componente de dominio especializado de BUMAND. Encapsula la lógica combinada de fecha y hora para el registro de jornadas de práctica, auditorías de pasajes y emisión de certificados.
- **Anatomía Interna y Dependencias:**
  Compuesto internamente por `Popover`, `Button`, `Calendar` (configurado en idioma español mediante `date-fns/locale/es`), `Input` de tipo `"time"` e iconos `CalendarIcon` y `Clock` de `lucide-react`.
  Componentes exportados:
  - `SeleccionadorFecha`: Selector exclusivo de fecha formateado institucionalmente en formato largo (`PPP`).
  - `SeleccionadorFechaHora`: Selector compuesto de dos columnas que sincroniza la fecha con un campo horario numérico.
- **Tipos TypeScript:**
  ```typescript
  interface DatePickerProps {
    fecha: Date | undefined;
    alCambiar: (fecha: Date | undefined) => void;
    etiqueta_boton?: string;
  }

  interface DateTimePickerProps extends DatePickerProps {
    hora?: string;
    alCambiarHora?: (hora: string) => void;
  }
  ```
- **Estados Interactivos:**
  Botón de activación estilizado con borde tenue `#E3DCCB`, altura de 44px (`h-11`), icono turquesa `#17B4C4` y apertura de calendario emergente sin desalineación.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { SeleccionadorFechaHora } from "@/components/ui/seleccionador-fecha";

  <SeleccionadorFechaHora
    fecha={fechaMarcacion}
    alCambiar={setFechaMarcacion}
    hora={horaMarcacion}
    alCambiarHora={setHoraMarcacion}
  />
  ```

---

### 3.18. `separator.tsx` (Divisores Estructurales de Contenido)

- **Propósito Funcional y Jerarquía Visual:**
  Segmenta bloques lógicos y agrupaciones de campos sin generar ruido visual innecesario, utilizando el token de borde corporativo `#E3DCCB`.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/separator`.
- **Tipos TypeScript y Props:**
  Propiedad `orientation`: `"horizontal"` (grosor 1px, ancho completo) o `"vertical"` (ancho 1px, autoestiramiento vertical `self-stretch`).
- **Estados Interactivos:**
  Elemento pasivo puramente presentacional o accesible con rol `separator`.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Separator } from "@/components/ui/separator";

  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-[#063A6B]">Datos Académicos</h3>
    <Separator />
    <div className="grid grid-cols-2 gap-4">{/* Campos */}</div>
  </div>
  ```

---

### 3.19. `skeleton.tsx` (Marcadores de Posición en Carga Asíncrona)

- **Propósito Funcional y Jerarquía Visual:**
  Garantiza fluidez percibida durante la obtención de datos desde la API NestJS, simulando la geometría exacta de tarjetas, tablas y métricas antes de que la respuesta HTTP se consolide.
- **Anatomía Interna y Dependencias:**
  Elemento semántico simple animado mediante Tailwind CSS (`animate-pulse`).
- **Tipos TypeScript y Props:**
  Extiende `React.ComponentProps<"div">`.
- **Estados Interactivos:**
  Animación continua de pulsación de opacidad entre 100% y 50% con fondo mutado `#EFE9DA`.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Skeleton } from "@/components/ui/skeleton";

  <div className="space-y-3">
    <Skeleton className="h-4 w-3/4 rounded" />
    <Skeleton className="h-8 w-full rounded-xl" />
  </div>
  ```

---

### 3.20. `switch.tsx` (Conmutadores Binarios de Activación Instantánea)

- **Propósito Funcional y Jerarquía Visual:**
  Control de conmutación de dos estados para opciones que surten efecto inmediato sin requerir pulsar un botón de guardar (ejemplo: alternar entre vista mensual y anual en gráficos, o activar modo satelital en el mapa de geocercas).
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/switch`.
  Subcomponentes exportados: `Switch` (incluyendo su conmutador móvil `SwitchPrimitive.Thumb`).
- **Tipos TypeScript y Props:**
  Propiedad `size`: `"default"` (ancho 32px por alto 18.4px) o `"sm"` (ancho 24px por alto 14px).
- **Estados Interactivos:**
  - `data-checked`: Fondo turquesa primario `#17B4C4` con traslación animada del thumb a la derecha (`translate-x-[calc(100%-2px)]`).
  - `data-unchecked`: Fondo neutro de input `#E3DCCB`.
  - `focus-visible`: Anillo de foco de 3px.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Switch } from "@/components/ui/switch";
  import { Label } from "@/components/ui/label";

  <div className="flex items-center gap-2">
    <Switch id="vista-satelital" checked={satelital} onCheckedChange={setSatelital} />
    <Label htmlFor="vista-satelital">Visualizar Capa Satelital</Label>
  </div>
  ```

---

### 3.21. `table.tsx` (Tabulación Estructurada de Datos Masivos)

- **Propósito Funcional y Jerarquía Visual:**
  Módulo de presentación de datos bidimensionales de alta densidad: nómina general de becarios, historial de marcaciones de asistencia y balance contable de reembolsos del 80%.
- **Anatomía Interna y Dependencias:**
  Construido con elementos de tabla HTML nativos envueltos en un contenedor con desplazamiento horizontal automático (`overflow-x-auto`).
  Subcomponentes exportados: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.
- **Tipos TypeScript y Props:**
  Extiende las interfaces tipadas estándar de React para elementos de tabla (`HTMLTableElement`, `HTMLTableRowElement`, etc.).
- **Estados Interactivos:**
  - `TableRow hover`: Resaltado de fondo tenue `hover:bg-muted/50` para facilitar el seguimiento visual horizontal.
  - `data-[state=selected]`: Fondo destacado en filas marcadas mediante casilla de verificación.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Becario</TableHead>
        <TableHead>Carrera</TableHead>
        <TableHead>Horas</TableHead>
        <TableHead className="text-right">Reembolso (80%)</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">Ana Gómez</TableCell>
        <TableCell>Ingeniería de Sistemas</TableCell>
        <TableCell>124 h</TableCell>
        <TableCell className="text-right font-mono font-bold">Bs 180.00</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  ```

---

### 3.22. `tabs.tsx` (Pestañas de Navegación Modular y Vistas de Sprint)

- **Propósito Funcional y Jerarquía Visual:**
  Organiza el espacio visual en vistas alternantes de nivel superior. En BUMAND, gobierna la conmutación entre los distintos Sprints del proyecto en la página de demostración y segmenta los ejes de la matriz 360°.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/tabs` y CVA para personalización visual.
  Subcomponentes exportados: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- **Tipos TypeScript y Variantes CVA:**
  Variante de lista (`tabsListVariants`):
  - `default`: Caja contenedora rellena con fondo atenuado `bg-muted` y esquinas redondeadas.
  - `line`: Estilo sobrio y minimalista sin fondo, con línea indicadora activa inferior de 2px.
  Soporte para orientación `horizontal` y `vertical`.
- **Estados Interactivos:**
  - `data-active`: Resalte con fondo blanco y sombra suave (`shadow-sm`) o activación de la línea subrayada en color de primer plano.
  - Transiciones inmediatas sin recarga de página (*zero flicker*).
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

  <Tabs defaultValue="sprint1" className="w-full">
    <TabsList>
      <TabsTrigger value="sprint1">Panel de Control</TabsTrigger>
      <TabsTrigger value="sprint2">Geocercas</TabsTrigger>
      <TabsTrigger value="sprint3">Asistencia</TabsTrigger>
    </TabsList>
    <TabsContent value="sprint1">{/* Panel Administrativo */}</TabsContent>
  </Tabs>
  ```

---

### 3.23. `textarea.tsx` (Entrada de Texto Multilínea Expandible)

- **Propósito Funcional y Jerarquía Visual:**
  Captura descripciones extensas, justificaciones obligatorias en rechazos de rendiciones de pasajes y testimonios cualitativos en formularios de evaluación ministerial F-03.
- **Anatomía Interna y Dependencias:**
  Elemento `<textarea>` nativo optimizado con la directiva CSS moderna `field-sizing-content`, permitiendo autoexpansión vertical dinámica según el contenido tipiado sin necesidad de scripts externos.
- **Tipos TypeScript y Props:**
  Extiende `React.ComponentProps<"textarea">`.
- **Estados Interactivos:**
  - Altura mínima garantizada de 64px (`min-h-16`).
  - `focus-visible`: Anillo perimetral de foco de 3px (`ring-3 ring-ring/50`).
  - `aria-invalid`: Borde y anillo en tono de alerta `#E2694B`.
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Textarea } from "@/components/ui/textarea";

  <Textarea
    placeholder="Describa detalladamente el motivo de la observación..."
    className="rounded-xl border-[#E3DCCB]"
    rows={4}
  />
  ```

---

### 3.24. `tooltip.tsx` (Ayudas Emergentes Flotantes)

- **Propósito Funcional y Jerarquía Visual:**
  Provee información explicativa complementaria al posar el cursor sobre pines GPS en el mapa de sedes, cifras monetarias abreviadas o botones de icono sin etiqueta textual visible.
- **Anatomía Interna y Dependencias:**
  Basado en `@base-ui/react/tooltip`.
  Subcomponentes exportados:
  - `TooltipProvider`: Envoltorio global con control del retraso temporal de activación (`delay={0}`).
  - `Tooltip`: Raíz de estado.
  - `TooltipTrigger`: Disparador sobre el cual interactúa el cursor.
  - `TooltipContent`: Globo emergente con flecha direccional integrada (`TooltipPrimitive.Arrow`) y soporte para atajos de teclado (`kbd`).
- **Tipos TypeScript y Props:**
  Extiende las propiedades posicionales de Base UI (`side`, `align`, `sideOffset`, `alignOffset`).
- **Estados Interactivos:**
  Animaciones guiadas por estado temporal: `data-[state=delayed-open]:animate-in`, desvanecimiento con microescala (`zoom-in-95`).
- **Ejemplo de Uso en BUMAND:**
  ```tsx
  import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
  import { Button } from "@/components/ui/button";
  import { Info } from "lucide-react";

  <Tooltip>
    <TooltipTrigger render={<Button size="icon-sm" variant="ghost"><Info className="size-4" /></Button>} />
    <TooltipContent side="top">
      El cálculo del 80% excluye tramos fuera de geocerca no justificados.
    </TooltipContent>
  </Tooltip>
  ```

---

## 4. Matriz de Cobertura y Trazabilidad en los Módulos de BUMAND

Para asegurar que ningún componente constituya código muerto (*dead code*), la siguiente matriz correlaciona cada elemento con los módulos operativos de la plataforma:

| Componente | Archivo Fuente | Módulos Principales de Aplicación en BUMAND |
| :--- | :--- | :--- |
| `Alert` | `ui/alert.tsx` | `aprobacion-pasajes.tsx`, `registro-horas.tsx`, `centro-notificaciones.tsx` |
| `Avatar` | `ui/avatar.tsx` | `gestion-becarios.tsx`, `panel-administrativo.tsx`, `lista-evaluaciones.tsx` |
| `Badge` | `ui/badge.tsx` | `aprobacion-pasajes.tsx`, `gestion-becarios.tsx`, `centro-notificaciones.tsx` |
| `Button` | `ui/button.tsx` | Empleado transversalmente en todos los módulos de interacción y formularios. |
| `Calendar` | `ui/calendar.tsx` | `registro-horas.tsx`, `seleccionador-fecha.tsx`, `visor-reportes-pdf.tsx` |
| `Card` | `ui/card.tsx` | Estructura base en `panel-administrativo.tsx`, `matriz-evaluacion-360.tsx`, etc. |
| `Chart` | `ui/chart.tsx` | `panel-administrativo.tsx` (análisis de horas y distribución presupuestaria). |
| `Checkbox` | `ui/checkbox.tsx` | `gestion-becarios.tsx` (selección masiva), `formulario-f03.tsx` |
| `Dialog` | `ui/dialog.tsx` | `firma-digital.tsx`, `aprobacion-pasajes.tsx` (modal de observación), altas. |
| `Input` | `ui/input.tsx` | `gestion-becarios.tsx`, `inicio-sesion/page.tsx`, `mapa-lugares-practica.tsx` |
| `Label` | `ui/label.tsx` | Vinculación semántica en todos los subformularios de captura. |
| `Popover` | `ui/popover.tsx` | `seleccionador-fecha.tsx`, filtros rápidos de búsqueda en tablas. |
| `Progress` | `ui/progress.tsx` | `panel-administrativo.tsx`, `matriz-evaluacion-360.tsx` (barras de meta). |
| `RadioGroup` | `ui/radio-group.tsx` | `registro-recorrido.tsx` (tipo de tramo), `formulario-f03.tsx` |
| `ScrollArea` | `ui/scroll-area.tsx` | `centro-notificaciones.tsx`, listas de auditoría y árboles de navegación. |
| `Select` | `ui/select.tsx` | `gestion-becarios.tsx` (selección de iglesia, universidad y sede). |
| `SeleccionadorFecha` | `ui/seleccionador-fecha.tsx` | `registro-horas.tsx`, `registro-recorrido.tsx`, `visor-reportes-pdf.tsx` |
| `Separator` | `ui/separator.tsx` | Delimitador de secciones en formularios y encabezados de tarjeta. |
| `Skeleton` | `ui/skeleton.tsx` | Vistas de carga en transiciones de datos asíncronos y autenticación. |
| `Switch` | `ui/switch.tsx` | `mapa-lugares-practica.tsx` (conmutador satelital), filtros de visualización. |
| `Table` | `ui/table.tsx` | `gestion-becarios.tsx`, `aprobacion-pasajes.tsx`, `registro-horas.tsx` |
| `Tabs` | `ui/tabs.tsx` | `app/page.tsx` (navegación por Sprints), `matriz-evaluacion-360.tsx` |
| `Textarea` | `ui/textarea.tsx` | `aprobacion-pasajes.tsx` (justificación de rechazo), `formulario-f03.tsx` |
| `Tooltip` | `ui/tooltip.tsx` | `proveedores.tsx` (envoltorio raíz), pines de geocerca y botones compactos. |
| `cn` / `utils.ts` | `lib/utils.ts` | Utilidad universal de concatenación y resolución condicional en toda la app. |

---

## 5. Conclusiones Arquitectónicas y Mantenibilidad

La arquitectura de componentes de BUMAND garantiza:
1. **Aislamiento Total de Responsabilidades:** Ningún componente UI contiene lógica de negocio acoplada ni peticiones de red directas; operan como funciones puras orientadas a la presentación.
2. **Resiliencia Tipográfica y Geométrica:** El cumplimiento de la grilla de 4px y las alturas normalizadas evitan inconsistencias ópticas al integrar componentes en vistas compuestas.
3. **Accesibilidad Nativa:** La delegación de la gestión de teclado, roles ARIA y focos a las primitivas Base UI y Radix UI asegura compatibilidad con lectores de pantalla y directrices WCAG 2.1 AA.
