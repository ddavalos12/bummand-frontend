"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle,
  FileText,
  Lock,
  Unlock,
  Upload,
  Trash2,
  Printer,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  File,
  Eye,
  BookOpen,
  HeartHandshake,
  CalendarPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

// --- TIPOS DE EVALUACIÓN ---

export interface PeriodoSemestral {
  id: "s2" | "s1";
  titulo: string;
  subtitulo: string;
  rango: string;
  habilitado: boolean;
}

export interface ModuloSemestral {
  numero: string;
  titulo: string;
  evaluador: string;
  puntaje: number;
  maximo: number;
  estado: "completado" | "pendiente" | "incompleto";
  archivo_adjunto?: string;
  fecha_envio?: string;
  comentario?: string;
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tamaño: string;
  fecha: string;
}

/**
 * @component EvaluacionesVista
 * @description Módulo de Evaluación de Desempeño 360° semestral, incorporando control
 * de apertura de periodos (Semestre II / Semestre I), modal interactivo completo del Formulario
 * F-03 del Pastor con sus 3 secciones y exportación PDF, y subida multi-archivo para Autoevaluación.
 */
export function EvaluacionesVista() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  // Control de periodos semestrales
  const [periodos, set_periodos] = useState<PeriodoSemestral[]>([
    {
      id: "s2",
      titulo: "Semestre II · 2026",
      subtitulo: "Periodo actual — julio a diciembre",
      rango: "Julio – Diciembre 2026",
      habilitado: true,
    },
    {
      id: "s1",
      titulo: "Semestre I · 2026",
      subtitulo: "Cerrado — enero a junio",
      rango: "Enero – Junio 2026",
      habilitado: false,
    },
  ]);

  const [periodo_activo, set_periodo_activo] = useState<"s2" | "s1">("s2");
  const [modal_nuevo_semestre_abierto, set_modal_nuevo_semestre_abierto] = useState(false);
  const [nuevo_titulo, set_nuevo_titulo] = useState("Semestre I · 2027");
  const [nuevo_subtitulo, set_nuevo_subtitulo] = useState("Apertura institucional 2027");
  const [nuevo_rango, set_nuevo_rango] = useState("Enero – Junio 2027");

  // Módulos para Semestre II (Periodo actual)
  const modulos_s2: ModuloSemestral[] = [
    {
      numero: "01",
      titulo: "Liderazgo en la Iglesia (F-03)",
      evaluador: "Evaluador: Pastor de la Congregación",
      puntaje: 18,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Formulario_F03_firmado.pdf",
      fecha_envio: "04 ago · 2026",
      comentario: "Excelente compromiso pastoral. Participación activa en el ministerio juvenil.",
    },
    {
      numero: "02",
      titulo: "Autoevaluación Académica",
      evaluador: "Evaluador: Estudiante Becario",
      puntaje: 20,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Record_academico_s2.pdf",
      fecha_envio: "06 ago · 2026",
      comentario: "Rendimiento académico sobresaliente durante el semestre, mantiene el promedio.",
    },
    {
      numero: "03",
      titulo: "Evaluación del Mentor",
      evaluador: "Evaluador: Supervisor Diaconía",
      puntaje: 14,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Evaluacion_mentor_s2.pdf",
      fecha_envio: "09 ago · 2026",
      comentario: "Cumple con las tareas asignadas, aunque se sugiere mejorar la comunicación de avances.",
    },
    {
      numero: "04",
      titulo: "Evaluación Escuela de Líderes",
      evaluador: "Evaluador: Facilitador BUMAND",
      puntaje: 17,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Tareas_modulo6_liderazgo.zip",
      fecha_envio: "10 ago · 2026",
      comentario: "Participación activa en los módulos de formación diaconal.",
    },
    {
      numero: "05",
      titulo: "Evaluación Socioeconómica",
      evaluador: "Evaluador: Trabajo Social",
      puntaje: 0,
      maximo: 20,
      estado: "pendiente",
      comentario: "Pendiente de visita y revisión de boletas de servicios básicos.",
    },
  ];

  // Módulos para Semestre I (Histórico)
  const modulos_s1: ModuloSemestral[] = [
    {
      numero: "01",
      titulo: "Liderazgo en la Iglesia (F-03)",
      evaluador: "Evaluador: Pastor",
      puntaje: 16,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "F03_semestre1.pdf",
      fecha_envio: "12 feb · 2026",
      comentario: "Participación constante en las actividades de la congregación.",
    },
    {
      numero: "02",
      titulo: "Autoevaluación Académica",
      evaluador: "Evaluador: Becario",
      puntaje: 19,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Historial_academico_s1.pdf",
      fecha_envio: "14 feb · 2026",
      comentario: "Buen desempeño académico general en el primer semestre.",
    },
    {
      numero: "03",
      titulo: "Evaluación del Mentor",
      evaluador: "Evaluador: Supervisor",
      puntaje: 18,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Informe_mentor_s1.pdf",
      fecha_envio: "20 feb · 2026",
      comentario: "Cumplimiento adecuado de las actividades encomendadas.",
    },
    {
      numero: "04",
      titulo: "Evaluación Escuela de Líderes",
      evaluador: "Evaluador: Facilitador",
      puntaje: 15,
      maximo: 20,
      estado: "completado",
      archivo_adjunto: "Modulo3_lideres.zip",
      fecha_envio: "22 feb · 2026",
      comentario: "Entrega parcial de tareas del módulo.",
    },
    {
      numero: "05",
      titulo: "Evaluación Socioeconómica",
      evaluador: "Evaluador: Trabajo Social",
      puntaje: 0,
      maximo: 20,
      estado: "incompleto",
      comentario: "No se recibió el documento antes del cierre del periodo en Kardex.",
    },
  ];

  const periodo_actual_info = periodos.find((p) => p.id === periodo_activo)!;
  const modulos_visibles = periodo_activo === "s2" ? modulos_s2 : modulos_s1;

  // Toggle de habilitar/cerrar periodo
  const alternarEstadoPeriodo = (id_periodo: "s2" | "s1", e: React.MouseEvent) => {
    e.stopPropagation();
    set_periodos((prev) =>
      prev.map((p) => {
        if (p.id === id_periodo) {
          const nuevo_estado = !p.habilitado;
          toast.success(
            nuevo_estado
              ? `Periodo ${p.titulo} habilitado exitosamente.`
              : `Periodo ${p.titulo} cerrado para nuevas cargas.`
          );
          return { ...p, habilitado: nuevo_estado };
        }
        return p;
      })
    );
  };

  const manejarCrearNuevoSemestre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!es_admin) {
      toast.error("Solo el Administrador puede habilitar nuevos semestres.");
      return;
    }

    const nuevo_id = `s${periodos.length + 1}` as "s2" | "s1";
    const nuevo_obj: PeriodoSemestral = {
      id: nuevo_id,
      titulo: nuevo_titulo,
      subtitulo: nuevo_subtitulo,
      rango: nuevo_rango,
      habilitado: true,
    };

    set_periodos([nuevo_obj, ...periodos]);
    set_periodo_activo(nuevo_id);
    set_modal_nuevo_semestre_abierto(false);
    toast.success(`Nuevo período "${nuevo_titulo}" habilitado exitosamente.`);
  };

  // --- ESTADOS Y MANEJADORES DEL FORMULARIO F-03 DEL PASTOR ---
  const [modal_f03_abierto, set_modal_f03_abierto] = useState<boolean>(false);
  const [f03_error, set_f03_error] = useState<string | null>(null);

  // Sección I: Datos Pastor e Iglesia
  const [pastor_nombre, set_pastor_nombre] = useState("Pastor Juan Ramos Mamani");
  const [pastor_correo, set_pastor_correo] = useState("pastor.ramos@iglesiabautista.bo");
  const [pastor_celular, set_pastor_celular] = useState("71249823");
  const [iglesia_nombre, set_iglesia_nombre] = useState("Iglesia Bautista Central El Alto");
  const [iglesia_direccion, set_iglesia_direccion] = useState("Av. 6 de Marzo #420, El Alto");
  const [lider_nombre, set_lider_nombre] = useState("Hno. David Mendoza");
  const [lider_cargo, set_lider_cargo] = useState("Líder de Diaconía y Misiones");

  // Sección II: Preguntas 1 a 13
  const [becario_nombre, set_becario_nombre] = useState("María Catunta Laime");
  const [frecuencia_asistencia, set_frecuencia_asistencia] = useState("Es miembro en plena comunión");
  const [demuestra_compromiso, set_demuestra_compromiso] = useState("Sí");
  const [ocupa_cargo, set_ocupa_cargo] = useState("Sí");
  const [cargo_actual, set_cargo_actual] = useState("Líder de Jóvenes y Escuela Dominical");
  const [cumplimiento_cargos, set_cumplimiento_cargos] = useState("Muy bien");

  const [pregunta_conviccion, set_pregunta_conviccion] = useState(
    "Muestra sincera vocación y disposición de servicio constante en las actividades de la congregación."
  );
  const [pregunta_ejemplo, set_pregunta_ejemplo] = useState(
    "En la puntualidad a los cultos, fidelidad en el servicio y respeto hacia los líderes espirituales."
  );
  const [pregunta_capacitaciones, set_pregunta_capacitaciones] = useState(
    "Asiste a todos los talleres juveniles y participa activamente en los estudios bíblicos semanales."
  );
  const [pregunta_testimonio, set_pregunta_testimonio] = useState(
    "Excelente testimonio tanto dentro de la comunidad de fe como en su entorno universitario y familiar."
  );
  const [pregunta_relacion, set_pregunta_relacion] = useState(
    "Trato fraternal, humilde y siempre presto a colaborar en las necesidades de los hermanos."
  );
  const [pregunta_nuevos_lideres, set_pregunta_nuevos_lideres] = useState(
    "Se encuentra mentoreando a dos señoritas del grupo de adolescentes en el área de alabanza."
  );
  const [pregunta_fortalezas, set_pregunta_fortalezas] = useState(
    "Compromiso, empatía, responsabilidad y facilidad de comunicación."
  );
  const [pregunta_debilidades, set_pregunta_debilidades] = useState(
    "A veces sobrecarga sus horarios universitarios con compromisos extraordinarios."
  );
  const [pregunta_opinion, set_pregunta_opinion] = useState(
    "El aporte del programa BUMAND en la vida de María ha sido un testimonio palpable de edificación para toda la iglesia."
  );

  // Sección III: Declaración Jurada
  const [declara_nombre, set_declara_nombre] = useState("Pastor Juan Ramos Mamani");
  const [declara_ci, set_declara_ci] = useState("3498214 LP");
  const [declara_aceptada, set_declara_aceptada] = useState(true);

  // Función de exportación PDF F-03
  const exportarPdfF03 = () => {
    if (!pastor_nombre.trim() || !pastor_correo.trim()) {
      set_f03_error("Debe ingresar el nombre y correo del pastor.");
      return;
    }
    if (!declara_aceptada) {
      set_f03_error("Debe marcar la casilla de declaración jurada antes de exportar.");
      return;
    }

    set_f03_error(null);
    const fecha_actual = new Date().toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html_pdf = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>F-03 · Formulario de Evaluación del Becario - ${becario_nombre}</title>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 800px; margin: 30px auto; padding: 0 25px; line-height: 1.5; font-size: 12px; }
          .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #063A6B; padding-bottom: 8px; margin-bottom: 12px; }
          .hdr b { font-size: 22px; color: #063A6B; }
          .hdr small { display: block; font-size: 9px; color: #17B4C4; font-weight: bold; }
          h1 { font-size: 18px; text-align: center; margin: 6px 0 2px; color: #063A6B; }
          h2 { font-size: 13px; text-align: center; margin: 0 0 10px; color: #5B6D77; font-weight: normal; }
          p.lead { font-size: 11px; font-style: italic; background: #F8F9FA; padding: 8px 12px; border-left: 3px solid #17B4C4; margin: 10px 0; }
          h3 { font-size: 13px; margin: 16px 0 8px; color: #063A6B; border-bottom: 1px solid #E3DCCB; padding-bottom: 3px; }
          .row { margin: 6px 0; display: flex; }
          .row b { min-width: 240px; color: #1E293B; }
          .q { margin: 10px 0 3px; font-weight: bold; color: #063A6B; }
          .a { border-bottom: 1px dotted #888; padding-bottom: 3px; margin-bottom: 6px; color: #333; }
          .foot { margin-top: 35px; border-top: 1px solid #ccc; padding-top: 15px; }
          @media print { .noprint { display: none; } }
        </style>
      </head>
      <body>
        <div class="hdr">
          <div>
            <b>Diaconía FRIF-IFD</b>
            <small>PROGRAMA DE BECAS UNIVERSITARIAS BUMAND</small>
          </div>
          <div style="text-align:right; font-family:monospace; font-size:11px;">
            Código: <b>F-03 PASTORAL</b><br>
            Emisión: ${fecha_actual}
          </div>
        </div>

        <h1>FORMULARIO F-03 DE EVALUACIÓN DEL BECARIO</h1>
        <h2>Programa de Becas · Escuela de Líderes BUMAN-D — Evaluación Ministerial</h2>

        <p class="lead">
          Se solicita al Pastor y líderes principales evaluar con objetividad y fidelidad espiritual el aporte a su congregación del becario universitario que forma parte del programa BUMAND.
        </p>

        <h3>I. Datos del Pastor y de la Iglesia Local</h3>
        <div class="row"><b>Nombre del Pastor:</b> <span>${pastor_nombre}</span></div>
        <div class="row"><b>Correo electrónico:</b> <span>${pastor_correo}</span></div>
        <div class="row"><b>N.º Celular:</b> <span>${pastor_celular}</span></div>
        <div class="row"><b>Nombre de la Iglesia:</b> <span>${iglesia_nombre}</span></div>
        <div class="row"><b>Dirección de la Iglesia:</b> <span>${iglesia_direccion}</span></div>
        <div class="row"><b>Líder de la Congregación:</b> <span>${lider_nombre} (${lider_cargo})</span></div>

        <h3>II. Referencias acerca del Becario Universitario</h3>
        <div class="row"><b>1. Nombre del Becario:</b> <span>${becario_nombre}</span></div>
        <div class="row"><b>2. Frecuencia de asistencia:</b> <span>${frecuencia_asistencia}</span></div>
        <div class="row"><b>3. ¿Demuestra compromiso con el Señor y la Iglesia?:</b> <span>${demuestra_compromiso}</span></div>
        <div class="row"><b>4. ¿Ocupa algún cargo en la iglesia?:</b> <span>${ocupa_cargo} — Cargo: ${cargo_actual}</span></div>
        <div class="row"><b>5. ¿Cómo ha cumplido con sus cargos?:</b> <span>${cumplimiento_cargos}</span></div>

        <div class="q">6. ¿Demuestra convicción al llamado de Dios?</div>
        <div class="a">${pregunta_conviccion}</div>

        <div class="q">7. ¿En qué áreas demuestra ejemplo en la congregación?</div>
        <div class="a">${pregunta_ejemplo}</div>

        <div class="q">8. ¿Demuestra compromiso con las capacitaciones?</div>
        <div class="a">${pregunta_capacitaciones}</div>

        <div class="q">9. ¿Cómo es su testimonio como cristiano?</div>
        <div class="a">${pregunta_testimonio}</div>

        <div class="q">10. ¿Cómo se relaciona con los demás miembros?</div>
        <div class="a">${pregunta_relacion}</div>

        <div class="q">11. ¿Se encuentra desarrollando a nuevos líderes?</div>
        <div class="a">${pregunta_nuevos_lideres}</div>

        <div class="q">12. Fortalezas y debilidades observadas:</div>
        <div class="a"><b>Fortalezas:</b> ${pregunta_fortalezas} | <b>Debilidades:</b> ${pregunta_debilidades}</div>

        <div class="q">13. Opinión general acerca del becario:</div>
        <div class="a">${pregunta_opinion}</div>

        <h3>III. Declaración Jurada y Firma Pastoral</h3>
        <p>Como pastor de la congregación del/la becario, declaro solemnemente que todos los datos consignados en este formulario son verídicos y fidedignos.</p>
        
        <div class="foot">
          <div class="row"><b>Pastor Declarante:</b> <span>${declara_nombre}</span></div>
          <div class="row"><b>Cédula de Identidad:</b> <span>${declara_ci}</span></div>
          <div class="row"><b>Firma Electrónica Verificada:</b> <span>${pastor_correo} (Certificado BUMAND)</span></div>
          <div class="row" style="margin-top:15px;"><b>Lugar y Fecha:</b> <span>El Alto / La Paz, ${fecha_actual}</span></div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    const ventana_impresion = window.open("", "_blank");
    if (ventana_impresion) {
      ventana_impresion.document.open();
      ventana_impresion.document.write(html_pdf);
      ventana_impresion.document.close();
      toast.success("Documento F-03 generado con éxito", {
        description: "Se ha abierto el diálogo oficial de impresión y exportación a PDF.",
      });
    } else {
      toast.warning("Habilite las ventanas emergentes del navegador para exportar el PDF.");
    }
  };

  // --- ESTADOS Y MANEJADORES DE SUBIDA MÚLTIPLE DE ARCHIVOS ---
  const [modal_subida_abierto, set_modal_subida_abierto] = useState<boolean>(false);
  const [archivos_seleccionados, set_archivos_seleccionados] = useState<File[]>([]);
  const [archivos_acreditados, set_archivos_acreditados] = useState<ArchivoAdjunto[]>([
    { id: "1", nombre: "Record_Academico_Oficial_2026.pdf", tamaño: "1.4 MB", fecha: "06/08/2026" },
    { id: "2", nombre: "Matricula_Inscripcion_Semestre2.pdf", tamaño: "850 KB", fecha: "06/08/2026" },
  ]);

  const manejarSeleccionArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevos = Array.from(e.target.files);
      set_archivos_seleccionados((prev) => [...prev, ...nuevos]);
      e.target.value = "";
    }
  };

  const eliminarArchivoSeleccionado = (indice: number) => {
    set_archivos_seleccionados((prev) => prev.filter((_, i) => i !== indice));
  };

  const confirmarSubidaArchivos = () => {
    if (archivos_seleccionados.length === 0) {
      toast.error("Debe elegir al menos un archivo antes de confirmar.");
      return;
    }

    const nuevos_acreditados: ArchivoAdjunto[] = archivos_seleccionados.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      nombre: f.name,
      tamaño: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      fecha: new Date().toLocaleDateString("es-BO"),
    }));

    set_archivos_acreditados((prev) => [...nuevos_acreditados, ...prev]);
    toast.success(`✓ ${archivos_seleccionados.length} documento(s) subido(s) correctamente`, {
      description: "Los archivos han sido agregados a su expediente de Autoevaluación Académica.",
    });

    set_archivos_seleccionados([]);
    set_modal_subida_abierto(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. CABECERA CON CITA BÍBLICA INSTITUCIONAL DESTACADA (Tarjeta Devocional Diaconal) */}
      <Card className="border-[#E3DCCB] bg-gradient-to-r from-[#063A6B] via-[#09477e] to-[#063A6B] text-white rounded-2xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#17B4C4]/20 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F8C766]/20 border border-[#F8C766]/30 flex items-center justify-center shrink-0 text-[#F8C766]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#F8C766] text-[#063A6B] font-bold text-xs uppercase px-2.5 py-0.5">
                    Cita Bíblica Institucional
                  </Badge>
                  <span className="text-xs text-[#7FE0E6] font-mono font-semibold">
                    Colosenses 3:23-24 (RVR1960)
                  </span>
                </div>
                <blockquote className="text-sm md:text-base font-serif italic text-white/95 leading-relaxed pt-1">
                  &ldquo;Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres; sabiendo que del Señor recibiréis la recompensa de la herencia, porque a Cristo el Señor servís.&rdquo;
                </blockquote>
                <p className="text-xs text-[#7FE0E6] font-medium flex items-center gap-1.5 pt-0.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  La evaluación semestral 360° en BUMAND mide el carácter, la puntualidad, el testimonio eclesial y el compromiso universitario.
                </p>
              </div>
            </div>

            {/* Botón exclusivo para Administrador: Habilitar Nuevo Semestre */}
            {es_admin && (
              <Dialog open={modal_nuevo_semestre_abierto} onOpenChange={set_modal_nuevo_semestre_abierto}>
                {/* @ts-ignore */}
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-10 px-4 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Habilitar Nuevo Semestre
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="sm:max-w-[460px] p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
                >
                  <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA]">
                    <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                      <CalendarPlus className="w-5 h-5 text-[#17B4C4]" />
                      Habilitar Nuevo Semestre Académico
                    </DialogTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Apertura de nuevo período semestral de evaluación con los 5 módulos institucionales.
                    </CardDescription>
                  </DialogHeader>

                  <form onSubmit={manejarCrearNuevoSemestre} className="p-6 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Título del Semestre</Label>
                      <Input
                        value={nuevo_titulo}
                        onChange={(e) => set_nuevo_titulo(e.target.value)}
                        required
                        className="h-9 text-xs border-[#E3DCCB]"
                        placeholder="Ej. Semestre I · 2027"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Subtítulo Descriptivo</Label>
                      <Input
                        value={nuevo_subtitulo}
                        onChange={(e) => set_nuevo_subtitulo(e.target.value)}
                        required
                        className="h-9 text-xs border-[#E3DCCB]"
                        placeholder="Ej. Apertura institucional 2027"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Rango Temporal de Vigencia</Label>
                      <Input
                        value={nuevo_rango}
                        onChange={(e) => set_nuevo_rango(e.target.value)}
                        required
                        className="h-9 text-xs border-[#E3DCCB]"
                        placeholder="Ej. Enero – Junio 2027"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs space-y-1">
                      <p className="font-bold text-[#063A6B]">Ponderaciones Asignadas (Base 20%):</p>
                      <p className="text-muted-foreground">
                        Liderazgo (20%), Académica (20%), Mentor (20%), Prácticas/Escuela Líderes (20%), Socioeconómica (20%).
                      </p>
                    </div>

                    <DialogFooter className="pt-2 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => set_modal_nuevo_semestre_abierto(false)}
                        className="h-9 text-xs rounded-xl"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs"
                      >
                        Habilitar Período
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cabecera y Rango de Evaluación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#063A6B] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#17B4C4]" />
            Evaluación Integral de Desempeño 360°
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            5 módulos semestrales · Base 20% cada uno · Formulario F-03 ministerial y autoevaluación.
          </p>
        </div>

        <Badge variant="outline" className="font-mono text-xs border-[#E3DCCB] text-[#063A6B] self-start sm:self-center">
          {periodo_actual_info.rango}
        </Badge>
      </div>

      {/* ============================================================== */}
      {/* 1. SELECTOR Y CONTROL DE PERIODOS SEMESTRALES                  */}
      {/* ============================================================== */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 bg-[#F8F9FA]/80">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#063A6B]" />
              Control de Periodos Semestrales
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono border-[#17B4C4] text-[#063A6B]">
              Total: {periodos.length} períodos
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Habilite o cierre periodos de evaluación para permitir la carga y validación de expedientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {periodos.map((periodo) => (
            <div
              key={periodo.id}
              onClick={() => set_periodo_activo(periodo.id)}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                periodo_activo === periodo.id
                  ? "border-[#063A6B] bg-[#063A6B]/5 shadow-xs"
                  : "border-[#E3DCCB] hover:border-slate-400 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                    periodo_activo === periodo.id
                      ? "bg-[#063A6B] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {periodo.id.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#063A6B]">{periodo.titulo}</span>
                    {periodo_activo === periodo.id && (
                      <span className="text-[10px] bg-[#17B4C4] text-white font-mono px-2 py-0.2 rounded-full font-semibold">
                        Viendo ahora
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{periodo.subtitulo}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Badge Habilitado / Inhabilitado */}
                {periodo.habilitado ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-xs flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Habilitado
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 border-slate-300 font-bold text-xs flex items-center gap-1.5 py-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Inhabilitado
                  </Badge>
                )}

                {/* Botón Toggle Habilitar / Cerrar periodo */}
                <Button
                  type="button"
                  size="sm"
                  variant={periodo.habilitado ? "destructive" : "outline"}
                  onClick={(e) => alternarEstadoPeriodo(periodo.id, e)}
                  className={`h-8 px-3 text-xs font-bold rounded-lg ${
                    periodo.habilitado
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                      : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {periodo.habilitado ? "Cerrar periodo" : "Habilitar periodo"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* BANNER DE ESTADO CUANDO EL PERIODO ESTÁ INHABILITADO */}
      {!periodo_actual_info.habilitado && (
        <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-2 text-xs text-slate-700 font-medium">
          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            Periodo cerrado — Este registro se encuentra en modo histórico de solo lectura.
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TARJETAS DE LOS 5 MÓDULOS DE EVALUACIÓN SEMESTRAL           */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-display text-[#063A6B] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F8C766]" />
          Módulos de Evaluación · {periodo_actual_info.titulo}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {modulos_visibles.map((mod) => (
            <Card
              key={mod.numero}
              className={`border-[#E3DCCB] shadow-xs bg-white rounded-xl flex flex-col justify-between hover:border-[#17B4C4] transition-all cursor-pointer ${
                mod.numero === "01" ? "ring-2 ring-[#063A6B]/20" : ""
              }`}
              onClick={() => {
                if (mod.numero === "01") {
                  set_modal_f03_abierto(true);
                } else if (mod.numero === "02") {
                  set_modal_subida_abierto(true);
                } else {
                  toast.info(`${mod.titulo}`, {
                    description: `${mod.evaluador} · Puntaje registrado: ${mod.puntaje}/${mod.maximo}`,
                  });
                }
              }}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#063A6B] text-white flex items-center justify-center font-mono font-bold text-xs">
                    {mod.numero}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono font-bold ${
                      mod.estado === "completado"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : mod.estado === "pendiente"
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-rose-50 text-rose-700 border-rose-300"
                    }`}
                  >
                    {mod.estado === "completado" ? `${mod.puntaje}/${mod.maximo}` : mod.estado}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#063A6B] leading-tight line-clamp-2">
                    {mod.titulo}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {mod.evaluador}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E3DCCB]/60 text-[11px] text-[#17B4C4] font-bold flex items-center justify-between">
                  <span>{mod.numero === "01" ? "Ver Formulario F-03" : mod.numero === "02" ? "Ver/Subir Archivos" : "Ver Detalle"}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODAL COMPLETO DEL FORMULARIO F-03 DEL PASTOR (3 SECCIONES)  */}
      {/* ============================================================== */}
      <Dialog open={modal_f03_abierto} onOpenChange={set_modal_f03_abierto}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E3DCCB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA] shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#17B4C4] font-bold block">
                  Módulo 01 · Formulario Oficial F-03
                </span>
                <DialogTitle className="font-display text-lg text-[#063A6B]">
                  Formulario de Evaluación del Becario (Pastor / Iglesia)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Programa de Becas · Escuela de Líderes BUMAN-D — a ser completado por el Pastor Local.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* SECCIÓN I: DATOS DEL PASTOR Y DE LA IGLESIA LOCAL */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E3DCCB]">
                <UserCheck className="w-4 h-4 text-[#063A6B]" />
                <h4 className="font-display text-sm font-bold text-[#063A6B] uppercase tracking-wide">
                  I. Datos del pastor y de la iglesia local
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">Nombre del pastor *</Label>
                  <Input
                    value={pastor_nombre}
                    onChange={(e) => set_pastor_nombre(e.target.value)}
                    placeholder="Nombre completo del pastor"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">Correo del pastor *</Label>
                  <Input
                    type="email"
                    value={pastor_correo}
                    onChange={(e) => set_pastor_correo(e.target.value)}
                    placeholder="pastor@correo.com"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">N.º celular del pastor</Label>
                  <Input
                    value={pastor_celular}
                    onChange={(e) => set_pastor_celular(e.target.value)}
                    placeholder="Ej. 71234567"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">Nombre de la iglesia</Label>
                  <Input
                    value={iglesia_nombre}
                    onChange={(e) => set_iglesia_nombre(e.target.value)}
                    placeholder="Nombre de la congregación"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#1E293B]">Dirección de la iglesia</Label>
                  <Input
                    value={iglesia_direccion}
                    onChange={(e) => set_iglesia_direccion(e.target.value)}
                    placeholder="Dirección de la congregación"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">Líder de la congregación</Label>
                  <Input
                    value={lider_nombre}
                    onChange={(e) => set_lider_nombre(e.target.value)}
                    placeholder="Nombre de un líder principal"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">Cargo del líder</Label>
                  <Input
                    value={lider_cargo}
                    onChange={(e) => set_lider_cargo(e.target.value)}
                    placeholder="Cargo que ocupa"
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN II: REFERENCIAS ACERCA DEL BECARIO (PREGUNTAS 1 A 13) */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E3DCCB]">
                <FileText className="w-4 h-4 text-[#17B4C4]" />
                <h4 className="font-display text-sm font-bold text-[#063A6B] uppercase tracking-wide">
                  II. Referencias acerca del becario universitario
                </h4>
              </div>

              {/* 1. Nombre del becario */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">1. Nombre del becario</Label>
                <Input
                  value={becario_nombre}
                  onChange={(e) => set_becario_nombre(e.target.value)}
                  className="h-9 text-xs border-[#E3DCCB] font-bold text-[#063A6B]"
                />
              </div>

              {/* 2. Frecuencia de asistencia */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  2. ¿Con qué frecuencia el becario asiste a la iglesia?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Es miembro en plena comunión",
                    "Asiste sólo domingos",
                    "Viene como visita",
                    "No asiste",
                  ].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => set_frecuencia_asistencia(opc)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        frecuencia_asistencia === opc
                          ? "bg-[#17B4C4]/15 border-[#17B4C4] text-[#0E7A85] font-bold shadow-xs"
                          : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Compromiso */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  3. ¿Demuestra compromiso con el Señor y la Iglesia?
                </Label>
                <div className="flex gap-2">
                  {["Sí", "No"].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => set_demuestra_compromiso(opc)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        demuestra_compromiso === opc
                          ? "bg-[#063A6B] border-[#063A6B] text-white font-bold"
                          : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Ocupa cargo y Cargo 2026 */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  4. ¿Ocupa actualmente algún cargo en la iglesia?
                </Label>
                <div className="flex gap-2">
                  {["Sí", "No"].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => set_ocupa_cargo(opc)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        ocupa_cargo === opc
                          ? "bg-[#063A6B] border-[#063A6B] text-white font-bold"
                          : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
                {ocupa_cargo === "Sí" && (
                  <div className="pt-1">
                    <Label className="text-[11px] text-muted-foreground">Cargo que desempeña actualmente</Label>
                    <Input
                      value={cargo_actual}
                      onChange={(e) => set_cargo_actual(e.target.value)}
                      placeholder="Ej. Líder de jóvenes, Alabanza, Diaconía"
                      className="h-8 text-xs border-[#E3DCCB] mt-1"
                    />
                  </div>
                )}
              </div>

              {/* 5. Cumplimiento con cargos */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  5. ¿Hasta el momento cómo ha cumplido con sus cargos?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["Muy bien", "Bien", "Necesita Apoyo", "No cumple"].map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => set_cumplimiento_cargos(opc)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        cumplimiento_cargos === opc
                          ? "bg-[#17B4C4]/15 border-[#17B4C4] text-[#0E7A85] font-bold shadow-xs"
                          : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Convicción */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  6. ¿Demuestra convicción al llamado de Dios? Favor de explicar
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_conviccion}
                  onChange={(e) => set_pregunta_conviccion(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>

              {/* 7. Áreas de ejemplo */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  7. ¿En qué áreas demuestra ejemplo en la congregación?
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_ejemplo}
                  onChange={(e) => set_pregunta_ejemplo(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>

              {/* 8. Compromiso capacitaciones */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  8. ¿Demuestra compromiso con las capacitaciones (talleres, cursos, estudios)?
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_capacitaciones}
                  onChange={(e) => set_pregunta_capacitaciones(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>

              {/* 9. Testimonio cristiano */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  9. ¿Cómo es su testimonio como cristiano?
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_testimonio}
                  onChange={(e) => set_pregunta_testimonio(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>

              {/* 10. Relación con miembros */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  10. ¿Cómo se relaciona con los demás miembros?
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_relacion}
                  onChange={(e) => set_pregunta_relacion(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>

              {/* 11. Nuevos líderes */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  11. ¿Se encuentra desarrollando a nuevos líderes? ¿A quiénes?
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_nuevos_lideres}
                  onChange={(e) => set_pregunta_nuevos_lideres(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>

              {/* 12. Fortalezas y Debilidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">12. a) Fortalezas del becario</Label>
                  <Textarea
                    rows={2}
                    value={pregunta_fortalezas}
                    onChange={(e) => set_pregunta_fortalezas(e.target.value)}
                    className="text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">12. b) Debilidades del becario</Label>
                  <Textarea
                    rows={2}
                    value={pregunta_debilidades}
                    onChange={(e) => set_pregunta_debilidades(e.target.value)}
                    className="text-xs border-[#E3DCCB]"
                  />
                </div>
              </div>

              {/* 13. Opinión general */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#1E293B]">
                  13. ¿Cuál es su opinión general del becario?
                </Label>
                <Textarea
                  rows={2}
                  value={pregunta_opinion}
                  onChange={(e) => set_pregunta_opinion(e.target.value)}
                  className="text-xs border-[#E3DCCB]"
                />
              </div>
            </div>

            {/* SECCIÓN III: DECLARACIÓN JURADA Y FIRMA */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-[#E3DCCB]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-display text-sm font-bold text-[#063A6B] uppercase tracking-wide">
                  III. Declaración Jurada Pastoral
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">Nombre del pastor (declaración)</Label>
                  <Input
                    value={declara_nombre}
                    onChange={(e) => set_declara_nombre(e.target.value)}
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#1E293B]">C.I. del pastor</Label>
                  <Input
                    value={declara_ci}
                    onChange={(e) => set_declara_ci(e.target.value)}
                    placeholder="Número de C.I."
                    className="h-9 text-xs border-[#E3DCCB]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E3DCCB] bg-slate-50">
                <Checkbox
                  id="check-declaracion"
                  checked={declara_aceptada}
                  onCheckedChange={(checked) => set_declara_aceptada(Boolean(checked))}
                  className="mt-0.5 data-[state=checked]:bg-[#063A6B]"
                />
                <Label
                  htmlFor="check-declaracion"
                  className="text-xs text-[#1E293B] leading-relaxed cursor-pointer font-medium"
                >
                  Como pastor de la congregación del/la becario, declaro que todos los datos proporcionados
                  en este formulario F-03 son verídicos y fidedignos.
                </Label>
              </div>

              {f03_error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{f03_error}</span>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-slate-50 flex sm:justify-between items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_f03_abierto(false)}
              className="text-xs border-[#E3DCCB]"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={exportarPdfF03}
              className="bg-[#F8C766] hover:bg-[#F5A623] text-[#3A2400] font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Exportar PDF (F-03 firmado)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* 4. MODAL DE SUBIDA MULTI-ARCHIVO: AUTOEVALUACIÓN ACADÉMICA      */}
      {/* ============================================================== */}
      <Dialog open={modal_subida_abierto} onOpenChange={set_modal_subida_abierto}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E3DCCB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA] shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#17B4C4] font-bold block">
              Módulo 02 · Autoevaluación Académica
            </span>
            <DialogTitle className="font-display text-base text-[#063A6B]">
              Subida de Archivos y Acreditación Académica
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjunte récord de calificaciones, boleta de inscripción o certificados en formato PDF/imagen.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="p-5 space-y-5 flex-1 overflow-y-auto">
            {/* ZONA DE CARGA MÚLTIPLE */}
            <div className="p-4 rounded-xl border-2 border-dashed border-[#17B4C4]/50 bg-[#17B4C4]/5 text-center space-y-3">
              <Upload className="w-8 h-8 text-[#17B4C4] mx-auto" />
              <div>
                <p className="text-xs font-bold text-[#063A6B]">Seleccione uno o varios archivos</p>
                <p className="text-[11px] text-muted-foreground">
                  Formatos permitidos: PDF, JPG, PNG, ZIP · Máx. 15 MB por archivo
                </p>
              </div>

              <div className="flex justify-center">
                <label
                  htmlFor="input-archivos-multiples"
                  className="px-4 py-2 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Elegir archivos
                </label>
                <input
                  id="input-archivos-multiples"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.zip"
                  onChange={manejarSeleccionArchivos}
                  className="hidden"
                />
              </div>
            </div>

            {/* LISTA DE ARCHIVOS RECIÉN SELECCIONADOS PENDIENTES DE SUBIR */}
            {archivos_seleccionados.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-mono font-bold text-[#063A6B] uppercase">
                  Archivos Listos para Subir ({archivos_seleccionados.length})
                </Label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {archivos_seleccionados.map((archivo, index) => (
                    <div
                      key={`${archivo.name}-${index}`}
                      className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <File className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-medium text-[#1E293B] truncate">{archivo.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          ({(archivo.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarArchivoSeleccionado(index)}
                        className="p-1 text-rose-500 hover:text-rose-700 shrink-0 font-bold text-xs"
                        title="Eliminar archivo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LISTA DE ARCHIVOS YA ACREDITADOS EN EL EXPEDIENTE */}
            <div className="space-y-2">
              <Label className="text-xs font-mono font-bold text-muted-foreground uppercase">
                Documentos ya Acreditados en el Semestre ({archivos_acreditados.length})
              </Label>
              <div className="space-y-1.5">
                {archivos_acreditados.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-[#E3DCCB] bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-[#063A6B] truncate">{item.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground shrink-0">
                      <span>{item.tamaño}</span>
                      <span>·</span>
                      <span>{item.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-slate-50 flex sm:justify-between items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_subida_abierto(false)}
              className="text-xs border-[#E3DCCB]"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={confirmarSubidaArchivos}
              disabled={archivos_seleccionados.length === 0}
              className={`text-xs font-bold rounded-xl h-10 px-5 shadow-sm ${
                archivos_seleccionados.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Subir {archivos_seleccionados.length} Archivo(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
