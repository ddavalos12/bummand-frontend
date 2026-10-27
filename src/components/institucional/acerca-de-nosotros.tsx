"use client";

import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Users,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  Clock,
  Bus,
  CheckCircle2,
  Quote,
  Phone,
  Mail,
  Globe,
  FileCheck,
  Compass,
  Briefcase,
  Church,
  Activity,
  Layers,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Landmark,
  Scale,
  Cross
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ContadorRodilloAnimado } from "@/components/animaciones/contador-rodillo-animado";
import { BordeLuminoso } from "@/components/animaciones/borde-luminoso";

interface AcercaDeNosotrosProps {
  rol_usuario?: string;
}

export function AcercaDeNosotros({ rol_usuario = "becario" }: AcercaDeNosotrosProps) {
  const [perspectiva_activa, set_perspectiva_activa] = useState<string>(
    rol_usuario === "administrador"
      ? "administrador"
      : rol_usuario === "supervisor"
      ? "supervisor"
      : "becario"
  );

  const [pregunta_abierta, set_pregunta_abierta] = useState<number | null>(null);
  const [correo_copiado, set_correo_copiado] = useState<boolean>(false);

  const alternarPregunta = (indice: number) => {
    set_pregunta_abierta(pregunta_abierta === indice ? null : indice);
  };

  const copiarContacto = (texto: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto);
      set_correo_copiado(true);
      toast.success("Contacto copiado al portapapeles", {
        description: texto,
      });
      setTimeout(() => set_correo_copiado(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO INSTITUCIONAL PRINCIPAL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#035683] via-[#007BBE] to-[#00808E] p-6 sm:p-10 text-white shadow-xl border border-[#00ABBD]/30">
        {/* Marca de agua institucional al 20% (Regla Manual de Marca) */}
        <div className="absolute -right-12 -bottom-16 w-80 h-80 opacity-20 pointer-events-none select-none">
          <img
            src="/logos/ALTA2.svg"
            alt="Marca de agua Diaconía"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Malla poligonal sutil al 10% */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-poppins font-semibold text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFB600]" />
                Institución Financiera de Desarrollo · Regulada por ASFI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB600]/20 border border-[#FFB600]/40 text-xs font-poppins font-bold text-[#FFB600]">
                <Sparkles className="w-3.5 h-3.5" />
                Actualizado al 24 de Octubre de 2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans text-white leading-tight">
              BUMAND · Becas Universitarias con Misión y Acción Diaconal
            </h1>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans font-normal">
              Programa social de excelencia y responsabilidad diaconal impulsado por la{" "}
              <strong className="text-white font-semibold">
                Fundación Diaconía Fondo Rotativo de Inversión y Fomento (Diaconía FRIF-IFD)
              </strong>
              , forjando a la nueva generación de profesionales íntegros con principios cristianos,
              competencia técnica de vanguardia y vocación de servicio a Bolivia.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <img
              src="/logos/LOGO-BUMAND-2_2023.svg"
              alt="Logo BUMAND"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="h-6 w-px md:w-16 md:h-px bg-white/20 my-1" />
            <img
              src="/logos/ALTA2.svg"
              alt="Logo Diaconía IFD"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
        </div>

        {/* Lema Bíblico Institucional */}
        <div className="mt-8 pt-5 border-t border-white/15 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-black/15 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <Quote className="w-5 h-5 text-[#FFB600] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium italic text-white/95">
                «Junto a aguas de reposo me pastoreará. Confortará mi alma; me guiará por sendas de justicia por amor de su nombre.»
              </p>
              <span className="text-[11px] font-poppins font-bold text-[#FFB600] mt-1 block">
                Salmos 23:2-3 · Lema Fundacional Diaconía
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-black/15 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <Quote className="w-5 h-5 text-[#00ABBD] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-medium italic text-white/95">
                «Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres; sabiendo que del Señor recibiréis la recompensa...»
              </p>
              <span className="text-[11px] font-poppins font-bold text-[#00ABBD] mt-1 block">
                Colosenses 3:23-24 · Principio de Excelencia BUMAND
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CIFRAS Y MÉTRICAS DE IMPACTO INSTITUCIONAL (Al 24 de Octubre de 2026) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Sedes */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#007BBE]/40 transition-colors">
          <span className="text-[11px] font-poppins font-bold text-muted-foreground uppercase tracking-wider block">
            Sedes y Agencias
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-[#035683] my-1">
            <ContadorRodilloAnimado valor={72} sufijo="" clase_personalizada="text-[#035683]" />
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            WGS84 en todo el país
          </p>
        </div>

        {/* KPI 2: Becarios Activos */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#007BBE]/40 transition-colors">
          <span className="text-[11px] font-poppins font-bold text-muted-foreground uppercase tracking-wider block">
            Becarios Activos
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-[#007BBE] my-1">
            <ContadorRodilloAnimado valor={23} sufijo="" clase_personalizada="text-[#007BBE]" />
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            Gestión II-2026 oficial
          </p>
        </div>

        {/* KPI 3: Becarios Históricos */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#007BBE]/40 transition-colors">
          <span className="text-[11px] font-poppins font-bold text-muted-foreground uppercase tracking-wider block">
            Histórico Graduados
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-[#00808E] my-1">
            <ContadorRodilloAnimado valor={65} prefijo="+" clase_personalizada="text-[#00808E]" />
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            Profesionales formados
          </p>
        </div>

        {/* KPI 4: Iglesias Aliadas */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#007BBE]/40 transition-colors">
          <span className="text-[11px] font-poppins font-bold text-muted-foreground uppercase tracking-wider block">
            Iglesias Aliadas
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-[#FFB600] my-1">
            <ContadorRodilloAnimado valor={17} sufijo="" clase_personalizada="text-[#FFB600]" />
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            Pastores con Formulario F-03
          </p>
        </div>

        {/* KPI 5: Tutores y Mentores */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#007BBE]/40 transition-colors">
          <span className="text-[11px] font-poppins font-bold text-muted-foreground uppercase tracking-wider block">
            Tutores Mentores
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-[#035683] my-1">
            <ContadorRodilloAnimado valor={29} sufijo="" clase_personalizada="text-[#035683]" />
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            Jefaturas en Diaconía IFD
          </p>
        </div>

        {/* KPI 6: Cero Papel */}
        <div className="bg-[#035683] text-white border border-[#035683] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-poppins font-bold text-[#FFB600] uppercase tracking-wider block">
            Digitalización Total
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-white my-1">
            100%
          </div>
          <p className="text-[11px] text-white/80 font-sans">
            +250 hojas/mes erradicadas
          </p>
        </div>
      </div>

      {/* 3. SELECTOR INTERACTIVO DE PERSPECTIVA SEGÚN ROL */}
      <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
        <CardHeader className="bg-[#F8FAFC] border-b border-[#E5E7EB] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-[#035683] font-sans flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#00ABBD]" />
                Perspectiva Institucional Adaptada por Rol
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-sans">
                Explore cómo impacta el ecosistema BUMAND según el perfil de cada miembro de la organización
              </CardDescription>
            </div>

            {/* Selector de Tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-200/70 border border-[#E5E7EB] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => set_perspectiva_activa("becario")}
                className={`px-3 py-1.5 rounded-xl text-xs font-poppins font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  perspectiva_activa === "becario"
                    ? "bg-[#035683] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Estudiante (Becario)</span>
              </button>
              <button
                type="button"
                onClick={() => set_perspectiva_activa("supervisor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-poppins font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  perspectiva_activa === "supervisor"
                    ? "bg-[#007BBE] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Mentor (Supervisor)</span>
              </button>
              <button
                type="button"
                onClick={() => set_perspectiva_activa("administrador")}
                className={`px-3 py-1.5 rounded-xl text-xs font-poppins font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  perspectiva_activa === "administrador"
                    ? "bg-[#00808E] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dirección y Auditoría</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {perspectiva_activa === "becario" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold">
                  🎓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#035683] font-sans">
                    El Compromiso y los Beneficios del Becario BUMAND
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans">
                    Formación integral 360°: Excelencia académica, espiritual, laboral y comunitaria
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#007BBE] block">
                    1. Apoyo Económico Mensual
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Asignación directa mensual de <strong>Bs. 650</strong> para nivel universitario y <strong>Bs. 250</strong> para nivel técnico, abonada puntualmente tras el cumplimiento de horas de práctica.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#00ABBD] block">
                    2. Reembolso del 80% de Pasajes
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Devolución exacta del 80% de los gastos efectivos de locomoción (minibús, micro y teleférico) registrados con el botón inteligente «↺ Usar ida en reversa».
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#FFB600] block">
                    3. Escuela de Líderes y CETI
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Talleres teológicos y liderazgo diaconal los viernes a las 14:30 con 12 tareas en Classroom y seguimiento psicoemocional con el Cuestionario de Bienestar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {perspectiva_activa === "supervisor" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center font-bold">
                  👔
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#007BBE] font-sans">
                    La Misión del Tutor y Mentor Diaconal
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans">
                    Acompañamiento profesional, modelado de valores y evaluación objetiva en unidades operativas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#035683] block">
                    1. Rúbrica Estructurada Likert (18+3)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Evaluación de desempeño sobre 20 pts reglamentarios: 18 preguntas de escala 1–10 (normalizadas a 10 pts) + 3 preguntas abiertas de fortalezas, mejoras y compromiso.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#007BBE] block">
                    2. Auditoría Conectada de Pasajes
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Revisión de recorridos con trazabilidad de calles declaradas, paradas y líneas de Mi Teleférico mediante el botón ojito (👁️) con aprobación en un clic.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#00808E] block">
                    3. Firma Digital y Actas Oficiales
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Validación formal de horas con firma digital en canvas HTML5 para convalidación inmediata ante Recursos Humanos y la Autoridad de Supervisión (ASFI).
                  </p>
                </div>
              </div>
            </div>
          )}

          {perspectiva_activa === "administrador" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00808E]/10 text-[#00808E] flex items-center justify-center font-bold">
                  👑
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#00808E] font-sans">
                    Gobernanza Institucional, Control ASFI y Trazabilidad
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans">
                    Supervisión global de 72 sedes, parametrización de geocercas satelitales y generación de sábanas oficiales
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#035683] block">
                    1. Radar Geodésico Haversine
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Verificación de coordenadas GPS con margen submétrico de 50m a 120m en la Oficina Central y agencias departamentales, impidiendo suplantaciones y fraudes de marcación.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#00ABBD] block">
                    2. Sábana Consolidada Semestral
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Matriz canónica de 14 columnas con los 5 módulos integrados (100 pts), cálculo automático de dictamen (Aprobación Óptima, Condicionada o Pérdida de Beca) y exportación a Excel y PDF.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                  <span className="text-xs font-poppins font-bold text-[#FFB600] block">
                    3. Parámetros de Bienestar (26 Preguntas)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    Configuración en tiempo real del cuestionario psicoemocional, umbrales de semáforo (Verde, Amarillo, Rojo) y derivación inmediata a Trabajo Social.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. MISIÓN, VISIÓN Y LOS TRES PRINCIPIOS DIACONALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Misión y Visión */}
        <div className="space-y-4">
          <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center shrink-0">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#035683] font-sans">
                  Nuestra Misión
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  «Entidad financiera con principios cristianos que aporta al progreso integral de nuestros clientes y desarrolla la inclusión de la población vulnerable a través de soluciones financieras integrales en áreas urbanas y rurales.»
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className="border-[#007BBE]/30 text-[#007BBE] bg-[#007BBE]/5 text-[11px] font-poppins">
                    Progreso Integral e Inclusión Social
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00ABBD]/10 text-[#00ABBD] flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#035683] font-sans">
                  Nuestra Visión
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  «Ser una institución líder en la inclusión financiera, prestando soluciones financieras integrales de calidad con trato digno al cliente y respeto a los valores culturales, con una visión diaconal.»
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className="border-[#00ABBD]/30 text-[#00808E] bg-[#00ABBD]/5 text-[11px] font-poppins">
                    Liderazgo Diaconal y Trato Digno
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Los 3 Principios Diaconales (Regla cromática: Amarillo, Azul Marino, Azul Cielo) */}
        <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#FFB600]" />
              <h3 className="text-lg font-bold text-[#035683] font-sans">
                Los Tres Principios Diaconales Inquebrantables
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-sans mb-5">
              Pilares fundacionales que rigen el actuar de Diaconía FRIF-IFD y la formación de cada becario en el programa BUMAND:
            </p>

            <div className="space-y-4">
              {/* Principio 1: Amarillo Radiante */}
              <div className="p-4 rounded-2xl border-l-4 border-l-[#FFB600] border border-[#E5E7EB] bg-amber-50/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-poppins font-bold text-[#B45309] uppercase tracking-wide">
                    1. Compartir la Fe
                  </span>
                  <span className="text-xs">🕊️</span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  Vivencia cotidiana del Evangelio, comunión en congregaciones cristianas locales, devocionales y formación ministerial permanente.
                </p>
              </div>

              {/* Principio 2: Azul Marino Profundo */}
              <div className="p-4 rounded-2xl border-l-4 border-l-[#007BBE] border border-[#E5E7EB] bg-sky-50/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-poppins font-bold text-[#007BBE] uppercase tracking-wide">
                    2. Combatir la Pobreza
                  </span>
                  <span className="text-xs">🌱</span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  Generación de oportunidades socioeconómicas para jóvenes vulnerables, rompiendo barreras económicas a través de la educación superior.
                </p>
              </div>

              {/* Principio 3: Azul Cielo Suave */}
              <div className="p-4 rounded-2xl border-l-4 border-l-[#00ABBD] border border-[#E5E7EB] bg-teal-50/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-poppins font-bold text-[#00808E] uppercase tracking-wide">
                    3. Promover la Justicia
                  </span>
                  <span className="text-xs">⚖️</span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  Fomento de la equidad, transparencia institucional, respeto irrestricto a los derechos humanos y vocación activa por el bien común.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. HISTORIA Y CRONOLOGÍA DE BUMAND (Hasta el 24 de Octubre de 2026) */}
      <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-8">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#035683]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#035683] font-sans">
              Trayectoria Histórica y Evolución Tecnológica (2015 – 2026)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            De la gestión manual en papel carbónico a un ecosistema multiplataforma geodésico de alta precisión
          </p>
        </div>

        <div className="relative border-l-2 border-[#00ABBD]/30 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
          {/* Hito 1: 2015-2018 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#035683] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#035683]/10 text-[#035683] font-poppins font-bold text-[11px]">
                2015 – 2018 · Orígenes Diaconales
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Creación del Fondo BUMAND en Diaconía FRIF-IFD
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Nace el programa <em>Becas Universitarias con Misión y Acción Diaconal</em> para financiar matrículas y viáticos de jóvenes miembros de congregaciones cristianas con vocación social. Se consolidan las primeras promociones de becarios.
              </p>
            </div>
          </div>

          {/* Hito 2: 2019-2023 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#007BBE] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#007BBE]/10 text-[#007BBE] font-poppins font-bold text-[11px]">
                2019 – 2023 · Expansión Formativa y Alianza CETI
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Consolidación de Prácticas y Escuela de Líderes
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                El programa supera los 50 becarios históricos. Se formalizan las prácticas preprofesionales en agencias de Diaconía y se establece la alianza con el Centro de Estudios Teológicos Interdisciplinarios (CETI) para talleres semanales.
              </p>
            </div>
          </div>

          {/* Hito 3: 2024-2025 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#00ABBD] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00ABBD]/10 text-[#00808E] font-poppins font-bold text-[11px]">
                2024 – 2025 · Proyecto de Grado UMSA
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Convenio de Innovación Tecnológica Diaconía – Informática UMSA
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Ante la sobrecarga de más de 250 formularios analógicos mensuales, se inicia el desarrollo formal del ecosistema digital bajo la autoría de Daniel Davalos Quiñonez y la tutoría del M.Sc. Reynaldo Zeballos Daza, modelando la base relacional de 15 tablas en PostgreSQL.
              </p>
            </div>
          </div>

          {/* Hito 4: 2026 (Semestre I) */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#FFB600] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-poppins font-bold text-[11px]">
                Enero – Junio 2026 · Despliegue Multiplataforma
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Lanzamiento de App Móvil Flutter y Web Next.js con Radar Haversine
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Puesta en producción de la geocerca satelital WGS84 para marcación inviolable, trazabilidad de recorridos y teleférico al 80%, y digitalización de la evaluación pastoral F-03.
              </p>
            </div>
          </div>

          {/* Hito 5: Hoy 24 de Octubre de 2026 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-[#FFB600] border-4 border-white shadow-md ring-2 ring-[#FFB600]" />
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-amber-50 border border-[#00ABBD]/40 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#035683] text-[#FFB600] font-poppins font-bold text-[11px]">
                  Hito Actual · 24 de Octubre de 2026
                </span>
                <span className="text-xs font-poppins font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operatividad Plena Gestión II-2026
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#035683] font-sans">
                Consolidación Institucional BUMAND y Auditoría de Gestión
              </h4>
              <p className="text-xs text-slate-700 font-sans leading-relaxed">
                A la fecha presente, el ecosistema gestiona con éxito a los <strong>23 becarios oficiales</strong>, <strong>29 mentores</strong> y <strong>17 iglesias asociadas</strong>. Cero pérdidas de registros de horas, liquidación exacta de viáticos en centavos, reporte oficial de dos páginas con firma digital para ASFI y convalidación del Cuestionario de Bienestar Universitario de 26 preguntas.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 6. LOS CINCO PILARES DE LA MATRIZ DE EVALUACIÓN 360° (100 Puntos) */}
      <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-8">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFB600]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#035683] font-sans">
              La Matriz Formativa 360° (Evaluación Semestral sobre 100 Pts)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Cinco módulos de 20 puntos que evalúan el crecimiento integral de cada estudiante de Diaconía IFD
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Módulo 1 */}
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between space-y-2 hover:border-[#007BBE] transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-poppins font-bold text-[#007BBE]">
                  Módulo 1
                </span>
                <Badge variant="outline" className="font-poppins text-[10px] font-bold text-[#007BBE] border-[#007BBE]/30">
                  20 pts
                </Badge>
              </div>
              <h5 className="text-xs font-bold text-slate-900 mt-1 font-sans">
                Desempeño Académico
              </h5>
              <p className="text-[11px] text-muted-foreground mt-1 font-sans leading-relaxed">
                Promedio universitario oficial y convalidación de materias cursadas en UMSA, UPEA, UDABOL y afines.
              </p>
            </div>
            <span className="text-[10px] font-poppins font-semibold text-slate-500">
              Evaluador: Universidad / Kardex
            </span>
          </div>

          {/* Módulo 2 */}
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between space-y-2 hover:border-[#00ABBD] transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-poppins font-bold text-[#00ABBD]">
                  Módulo 2
                </span>
                <Badge variant="outline" className="font-poppins text-[10px] font-bold text-[#00808E] border-[#00ABBD]/30">
                  20 pts
                </Badge>
              </div>
              <h5 className="text-xs font-bold text-slate-900 mt-1 font-sans">
                Liderazgo Eclesial
              </h5>
              <p className="text-[11px] text-muted-foreground mt-1 font-sans leading-relaxed">
                Formulario Pastoral F-03: Asistencia dominical, testimonio cristiano y discipulado en su iglesia local.
              </p>
            </div>
            <span className="text-[10px] font-poppins font-semibold text-slate-500">
              Evaluador: Pastor Congregacional
            </span>
          </div>

          {/* Módulo 3 */}
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between space-y-2 hover:border-[#035683] transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-poppins font-bold text-[#035683]">
                  Módulo 3
                </span>
                <Badge variant="outline" className="font-poppins text-[10px] font-bold text-[#035683] border-[#035683]/30">
                  20 pts
                </Badge>
              </div>
              <h5 className="text-xs font-bold text-slate-900 mt-1 font-sans">
                Prácticas Diaconía (PP²)
              </h5>
              <p className="text-[11px] text-muted-foreground mt-1 font-sans leading-relaxed">
                Rúbrica Likert 18+3 evaluada por el jefe de unidad: Puntualidad, proactividad, ética y cumplimiento técnico.
              </p>
            </div>
            <span className="text-[10px] font-poppins font-semibold text-slate-500">
              Evaluador: Tutor / Mentor
            </span>
          </div>

          {/* Módulo 4 */}
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between space-y-2 hover:border-[#FFB600] transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-poppins font-bold text-[#B45309]">
                  Módulo 4
                </span>
                <Badge variant="outline" className="font-poppins text-[10px] font-bold text-amber-700 border-amber-300">
                  20 pts
                </Badge>
              </div>
              <h5 className="text-xs font-bold text-slate-900 mt-1 font-sans">
                Escuela CETI
              </h5>
              <p className="text-[11px] text-muted-foreground mt-1 font-sans leading-relaxed">
                Aprovechamiento en los talleres de viernes por la tarde y entrega de 12 tareas en la plataforma formativa.
              </p>
            </div>
            <span className="text-[10px] font-poppins font-semibold text-slate-500">
              Evaluador: Facilitador CETI
            </span>
          </div>

          {/* Módulo 5 */}
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col justify-between space-y-2 hover:border-[#00808E] transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-poppins font-bold text-[#00808E]">
                  Módulo 5
                </span>
                <Badge variant="outline" className="font-poppins text-[10px] font-bold text-[#00808E] border-[#00808E]/30">
                  20 pts
                </Badge>
              </div>
              <h5 className="text-xs font-bold text-slate-900 mt-1 font-sans">
                Bienestar Socioeconómico
              </h5>
              <p className="text-[11px] text-muted-foreground mt-1 font-sans leading-relaxed">
                Cuestionario de Bienestar de 26 preguntas, diagnóstico sociofamiliar y acompañamiento psicológico continuo.
              </p>
            </div>
            <span className="text-[10px] font-poppins font-semibold text-slate-500">
              Evaluador: Trabajo Social
            </span>
          </div>
        </div>

        {/* Dictamen Reglamentario */}
        <div className="mt-6 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-poppins font-bold text-emerald-800 block">
              70 a 100 puntos
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">
              Aprobación Óptima (Renueva Beca)
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-poppins font-bold text-amber-800 block">
              51 a 69 puntos
            </span>
            <span className="text-[11px] font-semibold text-amber-700">
              Condicionado (Firma de Compromiso)
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-xs font-poppins font-bold text-rose-800 block">
              0 a 50 puntos
            </span>
            <span className="text-[11px] font-semibold text-rose-700">
              Pérdida Irrevocable de Beca
            </span>
          </div>
        </div>
      </Card>

      {/* 7. SEDE CENTRAL, AGAVERAS Y DATOS DE CONTACTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta Sede Central Diaconía */}
        <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-[#035683]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#035683] font-sans">
                  Oficina Central Diaconía FRIF-IFD
                </h4>
                <p className="text-xs text-muted-foreground font-sans">
                  Sede Administrativa Nacional y Bloques de Prácticas BUMAND
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <span className="font-poppins font-bold text-[#007BBE] block">
                  Dirección Institucional:
                </span>
                <p className="font-sans">
                  Av. Juan Pablo II N° 2540 (y Bloque B N° 125), Ciudad de El Alto, La Paz – Bolivia.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <span className="font-poppins font-bold text-[#00ABBD] block">
                  Coordenadas Geodésicas WGS84:
                </span>
                <p className="font-mono text-[11px]">
                  Latitud: -16.5000535924045<br />
                  Longitud: -68.17345520393889
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between gap-3">
              <div className="text-xs text-[#035683]">
                <strong className="font-semibold">Radio de Tolerancia Geodésica:</strong> 120 metros para registro de asistencia mediante algoritmo de Haversine.
              </div>
              <a
                href="https://maps.google.com/?q=-16.5000535924045,-68.17345520393889"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#007BBE] text-white font-poppins text-xs font-bold hover:bg-[#035683] transition-colors shrink-0"
              >
                <span>Ver en Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Red Nacional: 5 Sucursales · 4 Oficinas Feriales · 62 Agencias</span>
            <span className="font-poppins font-bold text-[#007BBE]">Diaconía FRIF-IFD · Bolivia</span>
          </div>
        </Card>

        {/* Tarjeta de Contacto Directo BUMAND */}
        <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#035683] font-sans flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00ABBD]" />
              Canales de Coordinación
            </h4>
            <p className="text-xs text-muted-foreground font-sans">
              Para consultas de convenios, actas de compromiso y soporte al becario:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-poppins uppercase text-muted-foreground block font-bold">
                    Correo Coordinación
                  </span>
                  <p className="text-xs font-mono font-semibold text-[#035683] truncate">
                    coordinacion@bumand.bo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copiarContacto("coordinacion@bumand.bo")}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Copiar correo"
                >
                  {correo_copiado ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-poppins uppercase text-muted-foreground block font-bold">
                    Portal Institucional
                  </span>
                  <p className="text-xs font-mono font-semibold text-[#007BBE] truncate">
                    https://www.diaconia.bo
                  </p>
                </div>
                <a
                  href="https://www.diaconia.bo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Visitar portal oficial"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-0.5">
                <span className="text-[10px] font-poppins uppercase text-muted-foreground block font-bold">
                  Soporte Técnico Informática UMSA
                </span>
                <p className="text-xs font-mono font-semibold text-slate-800">
                  daniel234.davalos@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] mt-4 text-[11px] font-poppins text-center text-muted-foreground">
            Horario de Prácticas: Lun a Vie 08:30 – 16:30
          </div>
        </Card>
      </div>

      {/* 8. PREGUNTAS FRECUENTES INSTITUCIONALES (FAQ) */}
      <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-8">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#007BBE]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#035683] font-sans">
              Preguntas Frecuentes Institucionales (FAQ)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Aclaraciones normativas sobre el funcionamiento de la beca, regulaciones ASFI y evaluación
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              pregunta: "¿Qué es BUMAND y quién lo financia?",
              respuesta:
                "BUMAND (Becas Universitarias con Misión y Acción Diaconal) es el programa de becas y responsabilidad social financiado íntegramente por la Fundación Diaconía Fondo Rotativo de Inversión y Fomento - IFD. Cubre apoyo económico mensual (Bs. 650 universitarios / Bs. 250 técnicos), el 80% de gastos de transporte urbano, seguro médico institucional y formación teológica.",
            },
            {
              pregunta: "¿Por qué la marcación de asistencia se valida con GPS Haversine?",
              respuesta:
                "Para garantizar certeza geográfica y transparencia ante auditorías de Recursos Humanos y la ASFI, la marcación de entrada y salida se valida satelitalmente con un radio de tolerancia geodésico (50m a 120m). Esto suprime la necesidad de registros en papel y previene cualquier fraude de presencia.",
            },
            {
              pregunta: "¿Cómo funciona la política del 80% de devolución de pasajes?",
              respuesta:
                "Los becarios declaran sus tramos de ida y vuelta en la app móvil (minibús, micro y Mi Teleférico). A partir del día 24 de cada mes, se habilita el envío de la planilla mensual. El sistema calcula en centavos exactos el 80% del gasto total, el cual es revisado y aprobado digitalmente por el mentor.",
            },
            {
              pregunta: "¿Qué sucede si el becario obtiene menos de 70 puntos en el semestre?",
              respuesta:
                "Si la calificación se ubica entre 51 y 69 puntos, el estudiante suscribe un acta formal de compromiso condicionada con su tutor y pastor para nivelar su promedio en el siguiente ciclo. Si obtiene 50 puntos o menos, pierde de forma irrevocable el beneficio de la beca.",
            },
            {
              pregunta: "¿Qué es el Cuestionario de Bienestar de 26 Preguntas?",
              respuesta:
                "Es un instrumento psicoemocional digitalizado que evalúa salud mental, hábitos de sueño, entorno familiar, estrés académico y vida de fe. Permite a Trabajo Social de Diaconía detectar alertas tempranas (semáforo amarillo o rojo) para brindar contención oportuna a los jóvenes.",
            },
          ].map((item, index) => {
            const esta_abierta = pregunta_abierta === index;
            return (
              <div
                key={index}
                className="border border-[#E5E7EB] rounded-2xl overflow-hidden transition-all bg-white"
              >
                <button
                  type="button"
                  onClick={() => alternarPregunta(index)}
                  className="w-full flex items-center justify-between p-4 text-left font-sans text-xs sm:text-sm font-bold text-[#035683] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{item.pregunta}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${
                      esta_abierta ? "rotate-180 text-[#007BBE]" : ""
                    }`}
                  />
                </button>
                {esta_abierta && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed font-sans border-t border-slate-100 bg-[#F8FAFC]/50">
                    {item.respuesta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
