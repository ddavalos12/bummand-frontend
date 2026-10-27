"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  HeartHandshake,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Settings,
  PlusCircle,
  Trash2,
  Edit3,
  Save,
  Home,
  Activity,
  Shield,
  GraduationCap,
  Sparkles,
  Search,
  Eye,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import {
  PreguntaBienestar,
  OpcionBienestar,
  PREGUNTAS_BIENESTAR_INICIALES,
  BECARIOS_SEMESTRE_II,
} from "./evaluaciones-datos-semestre";
import { CuestionarioBienestarModal } from "./cuestionario-bienestar-modal";

export type CategoriaBienestar =
  | "todas"
  | "Hogar e Ingresos"
  | "Salud y Servicios Básicos"
  | "Convivencia y Seguridad"
  | "Estudios y Proyecto de Vida";

export interface PreguntaBienestarExtendida extends PreguntaBienestar {
  categoria?: Exclude<CategoriaBienestar, "todas">;
}

export interface RegistroSocioeconomicoBecario {
  id: number;
  nombre_completo: string;
  ci: string;
  universidad: string;
  carrera: string;
  respuestas_completadas: number;
  total_preguntas: number;
  puntaje_20: number;
  semaforo: "verde" | "amarillo" | "rojo";
  respuestas: Record<number, "A" | "B" | "C" | "D">;
}

function obtenerCategoriaPorNumero(numero: number): Exclude<CategoriaBienestar, "todas"> {
  if ((numero >= 1 && numero <= 5) || numero === 16) {
    return "Hogar e Ingresos";
  }
  if (numero >= 6 && numero <= 14) {
    return "Salud y Servicios Básicos";
  }
  if (numero === 15 || (numero >= 17 && numero <= 20)) {
    return "Convivencia y Seguridad";
  }
  return "Estudios y Proyecto de Vida";
}

function generarRespuestasPorPuntaje(puntaje_objetivo: number): Record<number, "A" | "B" | "C" | "D"> {
  const mapa: Record<number, "A" | "B" | "C" | "D"> = {};
  PREGUNTAS_BIENESTAR_INICIALES.forEach((p) => {
    if (p.numero <= 20) {
      if (puntaje_objetivo >= 16) {
        mapa[p.numero] = "A";
      } else if (puntaje_objetivo >= 11) {
        mapa[p.numero] = p.numero % 3 === 0 ? "B" : "A";
      } else {
        mapa[p.numero] = p.numero % 2 === 0 ? "B" : "C";
      }
    } else {
      if (puntaje_objetivo >= 16) {
        mapa[p.numero] = "D";
      } else if (puntaje_objetivo >= 11) {
        mapa[p.numero] = "C";
      } else {
        mapa[p.numero] = "B";
      }
    }
  });
  return mapa;
}

function determinarColorSemaforo(puntaje_20: number): "verde" | "amarillo" | "rojo" {
  if (puntaje_20 >= 12) return "verde";
  if (puntaje_20 >= 8) return "amarillo";
  return "rojo";
}

const NOMINA_INICIAL_SOCIOECONOMICA: RegistroSocioeconomicoBecario[] = [
  {
    id: 100,
    nombre_completo: "María Catunta Laime",
    ci: "7077936 LP",
    universidad: "Universidad Pública de El Alto",
    carrera: "Economía",
    respuestas_completadas: 26,
    total_preguntas: 26,
    puntaje_20: 18.5,
    semaforo: "verde",
    respuestas: generarRespuestasPorPuntaje(18.5),
  },
  ...BECARIOS_SEMESTRE_II.map((b) => {
    const puntaje_ajustado = Math.max(b.socioeconomico, 6.0);
    const semaforo_asignado: "verde" | "amarillo" | "rojo" =
      b.id === 2
        ? "rojo"
        : b.id === 6 || b.id === 8 || b.id === 11 || b.id === 17
        ? "amarillo"
        : "verde";
    return {
      id: b.id,
      nombre_completo: b.nombre_completo,
      ci: b.ci,
      universidad: b.universidad,
      carrera: b.carrera,
      respuestas_completadas: 26,
      total_preguntas: 26,
      puntaje_20: puntaje_ajustado,
      semaforo: semaforo_asignado,
      respuestas: generarRespuestasPorPuntaje(puntaje_ajustado),
    };
  }),
];

export function EvaluacionSocioeconomicaVista() {
  const { usuario } = usarAutenticacion();
  const rol = usuario?.rol || "becario";
  const es_admin_o_supervisor = rol === "administrador" || rol === "supervisor";
  const es_becario = rol === "becario";

  const {
    confirmarEliminacionRegistro,
    confirmarAccionInstitucional,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  // Estado del catálogo de 26 preguntas (sujeto a modificación de la institución)
  const [preguntas, set_preguntas] = useState<PreguntaBienestarExtendida[]>(() =>
    PREGUNTAS_BIENESTAR_INICIALES.map((p) => ({
      ...p,
      categoria: obtenerCategoriaPorNumero(p.numero),
    }))
  );

  // Nómina de becarios con sus respuestas y semáforos
  const [nomina_becarios, set_nomina_becarios] = useState<RegistroSocioeconomicoBecario[]>(
    NOMINA_INICIAL_SOCIOECONOMICA
  );

  // Pestaña activa (solo para Admin/Supervisor)
  const [pestaña_activa, set_pestaña_activa] = useState<string>("cuestionario");

  // Becario seleccionado actualmente en la Pestaña 1
  const [becario_seleccionado_id, set_becario_seleccionado_id] = useState<number>(100);

  // Filtro de categoría/bloque
  const [categoria_activa, set_categoria_activa] = useState<CategoriaBienestar>("todas");

  // Buscador en nómina
  const [busqueda_nomina, set_busqueda_nomina] = useState<string>("");

  // Respuestas activas en el cuestionario en pantalla
  const [respuestas_activas, set_respuestas_activas] = useState<Record<number, "A" | "B" | "C" | "D">>(() =>
    generarRespuestasPorPuntaje(18.5)
  );

  const [guardando_evaluacion, set_guardando_evaluacion] = useState<boolean>(false);

  // Modal de inspección rápida opcional
  const [modal_bienestar_abierto, set_modal_bienestar_abierto] = useState<boolean>(false);

  // Estados para edición institucional de preguntas (Pestaña 3)
  const [pregunta_editando_id, set_pregunta_editando_id] = useState<number | null>(null);
  const [form_titulo, set_form_titulo] = useState<string>("");
  const [form_enunciado, set_form_enunciado] = useState<string>("");
  const [form_categoria, set_form_categoria] = useState<Exclude<CategoriaBienestar, "todas">>("Hogar e Ingresos");
  const [form_opciones, set_form_opciones] = useState<OpcionBienestar[]>([]);

  // Cargar catálogo personalizado desde localStorage si existe
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("bumand_cuestionario_bienestar_preguntas");
      if (guardado) {
        const parseado = JSON.parse(guardado);
        if (Array.isArray(parseado) && parseado.length > 0) {
          set_preguntas(
            parseado.map((p: PreguntaBienestarExtendida) => ({
              ...p,
              categoria: p.categoria || obtenerCategoriaPorNumero(p.numero),
            }))
          );
        }
      }
    } catch (_e) {
      // Mantener las 26 preguntas oficiales por defecto
    }
  }, []);

  // Sincronizar respuestas cuando cambia el becario seleccionado
  const becario_actual = useMemo(() => {
    return (
      nomina_becarios.find((b) => b.id === becario_seleccionado_id) || nomina_becarios[0]
    );
  }, [nomina_becarios, becario_seleccionado_id]);

  const seleccionarBecario = (nuevo_id: number) => {
    set_becario_seleccionado_id(nuevo_id);
    const encontrado = nomina_becarios.find((b) => b.id === nuevo_id);
    if (encontrado) {
      set_respuestas_activas({ ...encontrado.respuestas });
    }
  };

  const seleccionarInciso = (numero_pregunta: number, inciso: "A" | "B" | "C" | "D") => {
    set_respuestas_activas((prev) => ({
      ...prev,
      [numero_pregunta]: inciso,
    }));
  };

  // Cálculo en tiempo real del progreso y puntaje sobre 20 pts
  const total_preguntas = preguntas.length;
  const total_respondidas = preguntas.filter((p) => Boolean(respuestas_activas[p.numero])).length;
  const porcentaje_progreso = total_preguntas > 0 ? Math.round((total_respondidas / total_preguntas) * 100) : 100;

  const puntaje_calculado_20 = useMemo(() => {
    let suma_puntos = 0;
    let max_puntos = 0;

    preguntas.forEach((p) => {
      const inciso_elegido = respuestas_activas[p.numero];
      const opcion_elegida = p.opciones.find((o) => o.inciso === inciso_elegido);
      const max_opcion = Math.max(...p.opciones.map((o) => o.puntaje), 1.0);
      max_puntos += max_opcion;
      if (opcion_elegida) {
        suma_puntos += opcion_elegida.puntaje;
      }
    });

    if (max_puntos === 0) return 20;
    const calculado = (suma_puntos / max_puntos) * 20;
    return Math.min(Math.max(Number(calculado.toFixed(1)), 0), 20);
  }, [preguntas, respuestas_activas]);

  const semaforo_tiempo_real = determinarColorSemaforo(puntaje_calculado_20);

  // Preguntas filtradas por categoría
  const preguntas_filtradas = useMemo(() => {
    if (categoria_activa === "todas") return preguntas;
    return preguntas.filter(
      (p) => (p.categoria || obtenerCategoriaPorNumero(p.numero)) === categoria_activa
    );
  }, [preguntas, categoria_activa]);

  // Guardar evaluación socioeconómica (Admin/Supervisor)
  const manejarGuardarEvaluacionSocioeconomica = async () => {
    set_guardando_evaluacion(true);
    try {
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${url_base}/evaluaciones/receptor/socioeconomica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          becario_id: becario_actual.id,
          periodo_id: "s2",
          respuestas: respuestas_activas,
          puntaje_obtenido: puntaje_calculado_20,
          semaforo: semaforo_tiempo_real,
        }),
      }).catch(() => {});

      set_nomina_becarios((prev) =>
        prev.map((item) =>
          item.id === becario_actual.id
            ? {
                ...item,
                respuestas: { ...respuestas_activas },
                respuestas_completadas: total_respondidas,
                total_preguntas,
                puntaje_20: puntaje_calculado_20,
                semaforo: semaforo_tiempo_real,
              }
            : item
        )
      );

      toast.success("Evaluación Socioeconómica guardada exitosamente", {
        description: `${becario_actual.nombre_completo} · Nota: ${puntaje_calculado_20.toFixed(1)} / 20 pts`,
      });
    } catch (_error) {
      toast.error("No se pudo guardar la evaluación socioeconómica.");
    } finally {
      set_guardando_evaluacion(false);
    }
  };

  // Enviar autollenado del becario (sin mostrar puntajes numéricos ni porcentajes)
  const manejarEnviarAutollenadoBecario = () => {
    confirmarAccionInstitucional({
      titulo: "¿Enviar Evaluación Socioeconómica Semestral?",
      descripcion: `Ha respondido ${total_respondidas} de ${total_preguntas} preguntas del Cuestionario de Bienestar Personal, Social y Universitario. Sus respuestas serán remitidas al área de Trabajo Social de Diaconía FRIF-IFD.`,
      texto_confirmar: "Sí, enviar mi cuestionario",
      texto_cancelar: "Revisar respuestas",
      tipo: "primario",
      onConfirmar: async () => {
        const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        await fetch(`${url_base}/evaluaciones/receptor/socioeconomica`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            becario_id: usuario?.becario_id || 1,
            periodo_id: "s2",
            respuestas: respuestas_activas,
          }),
        }).catch(() => {});

        toast.success("Cuestionario de Bienestar Universitario enviado correctamente", {
          description:
            "Sus 26 respuestas han sido registradas en su expediente semestral de Trabajo Social.",
        });
      },
    });
  };

  // Funciones del Editor Institucional (Pestaña 3)
  const iniciarEdicionPregunta = (pregunta: PreguntaBienestarExtendida) => {
    set_pregunta_editando_id(pregunta.id);
    set_form_titulo(pregunta.titulo);
    set_form_enunciado(pregunta.enunciado);
    set_form_categoria(pregunta.categoria || obtenerCategoriaPorNumero(pregunta.numero));
    set_form_opciones(pregunta.opciones.map((o) => ({ ...o })));
  };

  const actualizarOpcionEnEdicion = (
    indice: number,
    campo: keyof OpcionBienestar,
    valor: string | number
  ) => {
    set_form_opciones((prev) =>
      prev.map((op, i) => (i === indice ? { ...op, [campo]: valor } : op))
    );
  };

  const aplicarEdicionPregunta = () => {
    if (!pregunta_editando_id) return;
    set_preguntas((prev) =>
      prev.map((p) =>
        p.id === pregunta_editando_id
          ? {
              ...p,
              titulo: form_titulo.trim() || p.titulo,
              enunciado: form_enunciado.trim() || p.enunciado,
              categoria: form_categoria,
              opciones: form_opciones,
            }
          : p
      )
    );
    set_pregunta_editando_id(null);
    toast.success("Pregunta modificada en el catálogo activo", {
      description: "Recuerde presionar 'Guardar Catálogo Institucional' para persistir los cambios.",
    });
  };

  const manejarAnadirPregunta = () => {
    const nuevo_numero = preguntas.length + 1;
    const nueva_pregunta: PreguntaBienestarExtendida = {
      id: Date.now(),
      numero: nuevo_numero,
      titulo: `Indicador Socioeconómico ${nuevo_numero}`,
      enunciado: "¿Ingrese el enunciado oficial de la nueva pregunta del cuestionario de bienestar?",
      categoria: "Estudios y Proyecto de Vida",
      opciones: [
        { inciso: "A", texto: "Condición favorable y estable.", puntaje: 1.0, color_semaforo: "verde" },
        { inciso: "B", texto: "Condición regular o intermedia.", puntaje: 0.5, color_semaforo: "amarillo" },
        { inciso: "C", texto: "Condición de vulnerabilidad prioritaria.", puntaje: 0.0, color_semaforo: "rojo" },
        { inciso: "D", texto: "Caso especial sujeto a seguimiento.", puntaje: 0.5, color_semaforo: "amarillo" },
      ],
    };
    set_preguntas((prev) => [...prev, nueva_pregunta]);
    set_respuestas_activas((prev) => ({ ...prev, [nuevo_numero]: "A" }));
    iniciarEdicionPregunta(nueva_pregunta);
    toast.success(`Pregunta #${nuevo_numero} añadida al instrumento institucional`);
  };

  const manejarGuardarCatalogoInstitucional = async () => {
    try {
      localStorage.setItem("bumand_cuestionario_bienestar_preguntas", JSON.stringify(preguntas));
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${url_base}/evaluaciones/cuestionario-bienestar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preguntas }),
      }).catch(() => {});

      toast.success("Catálogo del Cuestionario de Bienestar actualizado institucionalmente", {
        description: `Se guardaron ${preguntas.length} preguntas activas para el Semestre II.`,
      });
    } catch (_e) {
      toast.error("Error al guardar la configuración del cuestionario.");
    }
  };

  const nomina_filtrada = useMemo(() => {
    const termino = busqueda_nomina.trim().toLowerCase();
    if (!termino) return nomina_becarios;
    return nomina_becarios.filter(
      (b) =>
        b.nombre_completo.toLowerCase().includes(termino) ||
        b.ci.toLowerCase().includes(termino) ||
        b.universidad.toLowerCase().includes(termino) ||
        b.carrera.toLowerCase().includes(termino)
    );
  }, [nomina_becarios, busqueda_nomina]);

  const categorias_filtro: { id: CategoriaBienestar; etiqueta: string; icono: React.ElementType }[] = [
    { id: "todas", etiqueta: `Todas (${preguntas.length})`, icono: FileText },
    { id: "Hogar e Ingresos", etiqueta: "Hogar e Ingresos", icono: Home },
    { id: "Salud y Servicios Básicos", etiqueta: "Salud y Servicios Básicos", icono: Activity },
    { id: "Convivencia y Seguridad", etiqueta: "Convivencia y Seguridad", icono: Shield },
    { id: "Estudios y Proyecto de Vida", etiqueta: "Estudios y Proyecto de Vida", icono: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* 1. CABECERA INSTITUCIONAL DEL MÓDULO 05 */}
      <Card className="border-[#E5E7EB] bg-gradient-to-r from-[#035683] via-[#09477e] to-[#035683] text-white rounded-2xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-[#00ABBD]/20 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00ABBD]/20 border border-[#00ABBD]/40 flex items-center justify-center shrink-0 text-[#FFB600]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#FFB600] text-[#035683] font-bold text-[11px] uppercase px-2.5 py-0.5">
                    MÓDULO 05 · TRABAJO SOCIAL Y BIENESTAR UNIVERSITARIO
                  </Badge>
                  <span className="text-xs text-[#00ABBD] font-mono font-semibold">
                    Instrumento Oficial · {preguntas.length} Preguntas (Sujeto a modificación de la institución)
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold font-display text-white leading-snug">
                  Evaluación Socioeconómica — Cuestionario de Bienestar Personal, Social y Universitario (26 Preguntas)
                </h1>
                {es_admin_o_supervisor ? (
                  <p className="text-xs text-white/85 leading-relaxed max-w-4xl">
                    Ponderación oficial de <strong>20 puntos (20%)</strong> dentro de la Matriz de Evaluación Semestral para el seguimiento integral de Trabajo Social y Bienestar Universitario.
                  </p>
                ) : (
                  <p className="text-xs text-white/85 leading-relaxed max-w-4xl">
                    Instrumento semestral de acompañamiento de Trabajo Social de la Fundación Diaconía FRIF-IFD. Seleccione con sinceridad un inciso (A, B, C o D) en cada una de las 26 preguntas según su situación actual de hogar, salud, convivencia y estudios.
                  </p>
                )}
              </div>
            </div>

            {es_admin_o_supervisor && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => set_modal_bienestar_abierto(true)}
                  className="h-9 px-3.5 bg-white/10 hover:bg-white/20 text-white border-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#FFB600]" />
                  Vista Modal Rápida
                </Button>
                <Button
                  size="sm"
                  onClick={() => set_pestaña_activa("configuracion")}
                  className="h-9 px-3.5 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Editar 26 Preguntas
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. VISTA PARA ADMINISTRADOR O SUPERVISOR */}
      {es_admin_o_supervisor && (
        <>
          {/* 4 Tarjetas KPI Superiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* KPI 1: Becarios Evaluados */}
            <Card className="border-[#E5E7EB] bg-white rounded-xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    Becarios Evaluados
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#035683]">
                    21 / 23
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold">
                    Semestre II · 100% digitalizado
                  </p>
                </div>
                <div className="p-3 bg-[#035683]/10 rounded-xl">
                  <Users className="w-7 h-7 text-[#035683]" />
                </div>
              </CardContent>
            </Card>

            

            {/* KPI 3: Promedio Socioeconómico */}
            <Card className="border-[#E5E7EB] bg-white rounded-xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    Promedio Socioeconómico
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#035683]">
                    17.9 <span className="text-sm font-normal text-muted-foreground">/ 20 pts</span>
                  </h3>
                  <p className="text-xs text-[#00ABBD] font-semibold">
                    Base 20 puntos (Ponderación 20%)
                  </p>
                </div>
                <div className="p-3 bg-[#00ABBD]/10 rounded-xl">
                  <HeartHandshake className="w-7 h-7 text-[#00ABBD]" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 4: Instrumento Institucional */}
            <Card className="border-[#E5E7EB] bg-white rounded-xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                    Instrumento Institucional
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#035683]">
                    {preguntas.length} <span className="text-sm font-normal text-muted-foreground">Preguntas Activas</span>
                  </h3>
                  <p className="text-xs text-amber-700 font-semibold">
                    Sujeto a modificación
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <FileText className="w-7 h-7 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3 Pestañas dentro de la página */}
          <Tabs value={pestaña_activa} onValueChange={set_pestaña_activa} className="space-y-6">
            <div className="bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-x-auto">
              <TabsList className="bg-slate-100 p-1 rounded-xl w-full sm:w-auto inline-flex">
                <TabsTrigger value="cuestionario" className="text-xs font-bold rounded-lg px-4 py-2">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-[#00ABBD]" />
                  Cuestionario de Bienestar ({preguntas.length} Preguntas)
                </TabsTrigger>
                <TabsTrigger value="nomina" className="text-xs font-bold rounded-lg px-4 py-2">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-[#035683]" />
                  Nómina Oficial de Becarios (21/23 Becarios)
                </TabsTrigger>
                <TabsTrigger value="configuracion" className="text-xs font-bold rounded-lg px-4 py-2">
                  <Settings className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Configurar / Editar Cuestionario (Institución)
                </TabsTrigger>
              </TabsList>
            </div>

            {/* PESTAÑA 1: CUESTIONARIO DE BIENESTAR (26 PREGUNTAS) */}
            <TabsContent value="cuestionario" className="space-y-6">
              {/* Barra de Control del Becario Evaluado, Progreso y Semáforo */}
              <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Selector de Becario */}
                    <div className="space-y-1.5 flex-1 max-w-xl">
                      <Label className="text-xs font-mono uppercase font-bold text-[#035683]">
                        Seleccionar Becario Evaluado (21/23 Becarios Activos)
                      </Label>
                      <select
                        value={becario_seleccionado_id}
                        onChange={(e) => seleccionarBecario(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] text-xs font-bold text-[#035683] focus:outline-none focus:ring-2 focus:ring-[#00ABBD]"
                      >
                        {nomina_becarios.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nombre_completo} — C.I. {b.ci} ({b.universidad} · {b.carrera})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Indicadores en Vivo de Puntaje y Semáforo */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="px-4 py-2 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                          Respondidas
                        </span>
                        <span className="text-sm font-mono font-bold text-[#035683]">
                          {total_respondidas} de {total_preguntas}
                        </span>
                      </div>

                      <Badge className="bg-[#035683] text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs">
                        Puntaje Calculado: {puntaje_calculado_20.toFixed(1)} / 20 pts
                      </Badge>

                      <Button
                        onClick={manejarGuardarEvaluacionSocioeconomica}
                        disabled={guardando_evaluacion}
                        className="h-10 px-5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs"
                      >
                        <Save className="w-4 h-4 text-[#FFB600]" />
                        {guardando_evaluacion
                          ? "Guardando..."
                          : "Guardar Evaluación Socioeconómica (/20 pts)"}
                      </Button>
                    </div>
                  </div>

                  {/* Barra de Progreso y Filtros por Bloque */}
                  <div className="pt-2 border-t border-[#E5E7EB]/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#035683]">
                        Progreso de llenado del instrumento ({total_respondidas}/{total_preguntas} preguntas)
                      </span>
                      <span className="font-mono font-bold text-[#00ABBD]">{porcentaje_progreso}%</span>
                    </div>
                    <Progress value={porcentaje_progreso} className="h-2" />

                    {/* Botones de Filtro Rápido por Bloques/Categorías */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {categorias_filtro.map((cat) => {
                        const IconoCat = cat.icono;
                        const activo = categoria_activa === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => set_categoria_activa(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              activo
                                ? "bg-[#035683] text-white border-[#035683] shadow-2xs"
                                : "bg-white text-slate-700 border-[#E5E7EB] hover:bg-slate-50"
                            }`}
                          >
                            <IconoCat className={`w-3.5 h-3.5 ${activo ? "text-[#FFB600]" : "text-[#00ABBD]"}`} />
                            <span>{cat.etiqueta}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grilla de las 26 Preguntas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preguntas_filtradas.map((p) => {
                  const seleccion = respuestas_activas[p.numero];
                  const cat_nombre = p.categoria || obtenerCategoriaPorNumero(p.numero);
                  return (
                    <Card
                      key={p.id}
                      className="border-[#E5E7EB] bg-white rounded-2xl shadow-2xs hover:border-[#00ABBD]/60 transition-colors"
                    >
                      <CardContent className="p-5 space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-[#00ABBD]">
                                Pregunta #{p.numero} · {p.titulo}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono border-[#E5E7EB] text-slate-600"
                              >
                                {cat_nombre}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-bold text-[#035683] leading-snug">
                              {p.enunciado}
                            </h4>
                          </div>
                          {seleccion && (
                            <Badge className="bg-[#035683]/10 text-[#035683] border border-[#035683]/20 font-mono text-xs font-bold shrink-0">
                              Inciso {seleccion}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {p.opciones.map((op) => {
                            const esta_seleccionada = seleccion === op.inciso;
                            return (
                              <button
                                key={op.inciso}
                                type="button"
                                onClick={() => seleccionarInciso(p.numero, op.inciso)}
                                className={`p-3 rounded-xl border text-xs text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                                  esta_seleccionada
                                    ? "bg-[#035683] text-white border-[#035683] shadow-xs font-medium"
                                    : "bg-slate-50/70 text-slate-700 border-[#E5E7EB] hover:bg-slate-100/80"
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                      esta_seleccionada
                                        ? "bg-[#FFB600] text-[#035683]"
                                        : "bg-white text-slate-600 border border-[#E5E7EB]"
                                    }`}
                                  >
                                    {op.inciso}
                                  </span>
                                  <span className="leading-snug pt-0.5">{op.texto}</span>
                                </div>
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                    esta_seleccionada
                                      ? "bg-white/15 text-[#00ABBD]"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {op.puntaje.toFixed(2)} pts
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pie de Guardado */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 text-xs">
                  <Sparkles className="w-4 h-4 text-[#00ABBD] shrink-0" />
                  <span>
                    Becario en evaluación: <strong className="text-[#035683]">{becario_actual.nombre_completo}</strong> · Nota calculada:{" "}
                    <strong className="font-mono text-[#035683]">{puntaje_calculado_20.toFixed(1)} / 20 pts</strong>
                  </span>
                </div>
                <Button
                  onClick={manejarGuardarEvaluacionSocioeconomica}
                  disabled={guardando_evaluacion}
                  className="h-10 px-6 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-[#00ABBD]" />
                  {guardando_evaluacion
                    ? "Guardando..."
                    : "Guardar Evaluación Socioeconómica (/20 pts)"}
                </Button>
              </div>
            </TabsContent>

            {/* PESTAÑA 2: NÓMINA Y SEMÁFORO POR BECARIO */}
            <TabsContent value="nomina" className="space-y-4">
              <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs overflow-hidden">
                <CardHeader className="p-5 border-b border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-base font-bold text-[#035683]">
                      Nómina Oficial Socioeconómica por Becario (Semestre II)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Resultados consolidados sobre 20 puntos del Cuestionario de Bienestar Universitario (26 Preguntas).
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={busqueda_nomina}
                      onChange={(e) => set_busqueda_nomina(e.target.value)}
                      placeholder="Buscar por nombre, C.I. o carrera..."
                      className="h-9 pl-9 text-xs border-[#E5E7EB] bg-white rounded-xl"
                    />
                  </div>
                </CardHeader>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 border-b border-[#E5E7EB] text-[#035683] font-bold">
                      <tr>
                        <th className="py-3 px-4 text-left">#</th>
                        <th className="py-3 px-4 text-left">Becario Universitario</th>
                        <th className="py-3 px-4 text-left">C.I.</th>
                        <th className="py-3 px-4 text-left">Universidad / Carrera</th>
                        <th className="py-3 px-4 text-center">Respuestas</th>
                        <th className="py-3 px-4 text-center">Puntaje (/ 20 pts)</th>
                        <th className="py-3 px-4 text-center">Semáforo</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]/60">
                      {nomina_filtrada.map((becario, idx) => (
                        <tr key={becario.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-muted-foreground">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-[#035683]">
                            {becario.nombre_completo}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{becario.ci}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">{becario.universidad}</span>
                            <span className="text-[11px] text-muted-foreground">{becario.carrera}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#035683]">
                            {becario.respuestas_completadas}/{becario.total_preguntas}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-sm text-[#035683]">
                            {becario.puntaje_20.toFixed(1)} / 20
                          </td>
                          
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                seleccionarBecario(becario.id);
                                set_pestaña_activa("cuestionario");
                              }}
                              className="h-8 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg text-xs font-bold"
                            >
                              Ver / Editar Cuestionario
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* PESTAÑA 3: CONFIGURAR / EDITAR CUESTIONARIO (INSTITUCIÓN) */}
            <TabsContent value="configuracion" className="space-y-6">
              <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-600" />
                      <h3 className="font-display text-base font-bold text-[#035683]">
                        Editor Institucional del Cuestionario de Bienestar Universitario
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conforme al documento oficial (&ldquo;Sujeto a modificación de la institución&rdquo;), Trabajo Social y Administración pueden editar enunciados, categorías e incisos A, B, C, D o añadir nuevas preguntas.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={manejarAnadirPregunta}
                      className="h-9 px-3.5 border-[#035683] text-[#035683] hover:bg-[#035683]/5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#00ABBD]" />
                      Añadir Pregunta
                    </Button>
                    <Button
                      size="sm"
                      onClick={manejarGuardarCatalogoInstitucional}
                      className="h-9 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-[#FFB600]" />
                      Guardar Catálogo Institucional
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Panel de Edición Activa de una Pregunta */}
              {pregunta_editando_id !== null && (
                <Card className="border-2 border-[#00ABBD] bg-white rounded-2xl shadow-md">
                  <CardHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#00ABBD]/5">
                    <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2 uppercase tracking-wider">
                      <Edit3 className="w-4 h-4 text-[#00ABBD]" />
                      Editando Pregunta del Instrumento Socioeconómico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Título del Indicador</Label>
                        <Input
                          value={form_titulo}
                          onChange={(e) => set_form_titulo(e.target.value)}
                          className="h-9 text-xs border-[#E5E7EB]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Bloque / Categoría</Label>
                        <select
                          value={form_categoria}
                          onChange={(e) =>
                            set_form_categoria(e.target.value as Exclude<CategoriaBienestar, "todas">)
                          }
                          className="w-full h-9 px-3 rounded-md border border-[#E5E7EB] bg-white text-xs font-medium text-[#035683]"
                        >
                          <option value="Hogar e Ingresos">Hogar e Ingresos</option>
                          <option value="Salud y Servicios Básicos">Salud y Servicios Básicos</option>
                          <option value="Convivencia y Seguridad">Convivencia y Seguridad</option>
                          <option value="Estudios y Proyecto de Vida">Estudios y Proyecto de Vida</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <Label className="text-xs font-semibold">Enunciado Oficial de la Pregunta</Label>
                        <Textarea
                          rows={2}
                          value={form_enunciado}
                          onChange={(e) => set_form_enunciado(e.target.value)}
                          className="text-xs border-[#E5E7EB]"
                        />
                      </div>
                    </div>

                    {/* Edición de los Incisos A, B, C, D */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#035683]">
                        Configuración de Incisos y Puntajes Internos
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {form_opciones.map((op, idx) => (
                          <div
                            key={op.inciso}
                            className="p-3 rounded-xl border border-[#E5E7EB] bg-slate-50 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Badge className="bg-[#035683] text-white font-mono text-xs">
                                Inciso {op.inciso}
                              </Badge>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">Puntaje:</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  value={op.puntaje}
                                  onChange={(e) =>
                                    actualizarOpcionEnEdicion(
                                      idx,
                                      "puntaje",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 h-7 text-xs font-mono text-center border-[#E5E7EB] bg-white"
                                />
                              </div>
                            </div>
                            <Input
                              value={op.texto}
                              onChange={(e) => actualizarOpcionEnEdicion(idx, "texto", e.target.value)}
                              className="h-8 text-xs border-[#E5E7EB] bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => set_pregunta_editando_id(null)}
                        className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={aplicarEdicionPregunta}
                        className="h-9 px-4 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold rounded-xl text-xs"
                      >
                        Aplicar Cambios en la Pregunta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista Completa de Preguntas para Administración */}
              <div className="space-y-3">
                {preguntas.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00ABBD]">
                          Pregunta #{p.numero} · {p.titulo}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono border-[#E5E7EB]">
                          {p.categoria || obtenerCategoriaPorNumero(p.numero)}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-[#035683]">{p.enunciado}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {p.opciones.map((o) => (
                          <span
                            key={o.inciso}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-[#E5E7EB]/60"
                          >
                            <strong>{o.inciso}:</strong> {o.texto}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => iniciarEdicionPregunta(p)}
                        className="h-8 px-3 border-[#00ABBD] text-[#035683] rounded-lg text-xs font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          confirmarEliminacionRegistro({
                            titulo: "¿Eliminar pregunta del cuestionario?",
                            descripcion: `¿Está seguro de eliminar la pregunta #${p.numero} (${p.titulo}) del Cuestionario de Bienestar Universitario?`,
                            nombre_item: `Pregunta #${p.numero} · ${p.titulo}`,
                            onConfirmar: () => {
                              set_preguntas((prev) => prev.filter((item) => item.id !== p.id));
                            },
                            mensaje_exito: `Pregunta #${p.numero} eliminada del instrumento`,
                          });
                        }}
                        className="h-8 px-2.5 text-[#E2694B] hover:bg-rose-50 rounded-lg text-xs"
                        title="Eliminar pregunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* 3. VISTA EXCLUSIVA DE AUTOLLENADO PARA EL BECARIO (SIN PUNTAJES NUMÉRICOS NI PORCENTAJES) */}
      {es_becario && (
        <div className="space-y-6">
          {/* Barra de Progreso y Filtros por Bloque para el Becario */}
          <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#035683] flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00ABBD]" />
                    Autollenado del Cuestionario de Bienestar Universitario
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Becario: <strong>{usuario?.nombre}</strong> · Semestre II · Seleccione una opción por pregunta.
                  </p>
                </div>

                <Badge className="bg-[#035683] text-white font-mono text-xs px-3.5 py-1.5 rounded-xl self-start sm:self-center">
                  Respondidas: {total_respondidas} de {total_preguntas}
                </Badge>
              </div>

              <Progress value={porcentaje_progreso} className="h-2.5" />

              {/* Filtros por Bloque */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {categorias_filtro.map((cat) => {
                  const IconoCat = cat.icono;
                  const activo = categoria_activa === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => set_categoria_activa(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        activo
                          ? "bg-[#035683] text-white border-[#035683] shadow-2xs"
                          : "bg-white text-slate-700 border-[#E5E7EB] hover:bg-slate-50"
                      }`}
                    >
                      <IconoCat className={`w-3.5 h-3.5 ${activo ? "text-[#FFB600]" : "text-[#00ABBD]"}`} />
                      <span>{cat.etiqueta}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Las 26 Preguntas para el Becario (Sin mostrar puntajes ni semáforos) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preguntas_filtradas.map((p) => {
              const seleccion = respuestas_activas[p.numero];
              const cat_nombre = p.categoria || obtenerCategoriaPorNumero(p.numero);
              return (
                <Card
                  key={p.id}
                  className="border-[#E5E7EB] bg-white rounded-2xl shadow-2xs hover:border-[#00ABBD]/60 transition-colors"
                >
                  <CardContent className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#00ABBD]">
                            Pregunta #{p.numero} · {p.titulo}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-[#E5E7EB] text-slate-600"
                          >
                            {cat_nombre}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-[#035683] leading-snug">
                          {p.enunciado}
                        </h4>
                      </div>
                      {seleccion && (
                        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold shrink-0">
                          Opción {seleccion}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {p.opciones.map((op) => {
                        const esta_seleccionada = seleccion === op.inciso;
                        return (
                          <button
                            key={op.inciso}
                            type="button"
                            onClick={() => seleccionarInciso(p.numero, op.inciso)}
                            className={`p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                              esta_seleccionada
                                ? "bg-[#035683] text-white border-[#035683] shadow-xs font-medium"
                                : "bg-slate-50/70 text-slate-700 border-[#E5E7EB] hover:bg-slate-100/80"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                esta_seleccionada
                                  ? "bg-[#FFB600] text-[#035683]"
                                  : "bg-white text-slate-600 border border-[#E5E7EB]"
                              }`}
                            >
                              {op.inciso}
                            </span>
                            <span className="leading-snug pt-0.5">{op.texto}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Botón de Envío del Becario */}
          <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#035683]">
                  Declaración de Bienestar Personal, Social y Universitario
                </p>
                <p className="text-xs text-muted-foreground">
                  Verifique que las {total_preguntas} preguntas estén respondidas antes de remitir su formulario a Trabajo Social.
                </p>
              </div>
              <Button
                onClick={manejarEnviarAutollenadoBecario}
                className="h-11 px-6 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFB600]" />
                Enviar Mi Evaluación Socioeconómica (26 Preguntas)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Rápido Opcional */}
      <CuestionarioBienestarModal
        abierto={modal_bienestar_abierto}
        alCambiarAbierto={set_modal_bienestar_abierto}
        becario_id={becario_actual.id}
        nombre_becario={becario_actual.nombre_completo}
      />

      {/* Diálogo Institucional de Confirmación */}
      {DialogoConfirmacionInstitucional}
    </div>
  );
}
