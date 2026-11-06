"use client";

import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  HeartHandshake,
  BookOpen,
  Users,
  Clock,
  Quote,
  Briefcase,
  Church,
  Layers,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Target,
  Eye,
  Flag,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AcercaDeNosotrosProps {
  rol_usuario?: string;
}

export function AcercaDeNosotros({ rol_usuario = "becario" }: AcercaDeNosotrosProps) {
  const [pregunta_abierta, set_pregunta_abierta] = useState<number | null>(null);
  const [correo_copiado, set_correo_copiado] = useState<boolean>(false);

  const alternarPregunta = (indice: number) => {
    set_pregunta_abierta(pregunta_abierta === indice ? null : indice);
  };

  const copiarContacto = (texto: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(texto);
      set_correo_copiado(true);
      toast.success("Contacto copiado al portapapeles", {
        description: texto,
      });
      setTimeout(() => set_correo_copiado(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. ENCABEZADO SUPERIOR INSTITUCIONAL (Barra + Logos)           */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#035683] tracking-tight">
            Acerca de Nosotros
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#007BBE]">
            Diaconía FRIF-IFD · BUMAND
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <img
            src="/logos/LOGO-BUMAND-2_2023.svg"
            alt="Logo BUMAND"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <div className="h-6 w-px bg-slate-200" />
          <img
            src="/logos/ALTA2.svg"
            alt="Logo Diaconía IFD"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. HERO INSTITUCIONAL PRINCIPAL (Gradiente Oficial Diaconía)   */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#035683] via-[#007BBE] to-[#00ABBD] p-6 sm:p-8 text-white shadow-xl border border-[#00ABBD]/30">
        {/* Marca de agua institucional al 20% */}
        <div className="absolute -right-10 -bottom-14 w-72 h-72 opacity-20 pointer-events-none select-none">
          <img
            src="/logos/ALTA2.svg"
            alt="Marca de agua Diaconía"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Badges superiores */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB600]" />
              Inversión Social · Diaconía FRIF-IFD
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB600]/20 border border-[#FFB600]/40 text-xs font-bold text-[#FFB600]">
              Desde 1981
            </span>
          </div>

          {/* Título y subtítulo oficial */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              BUMAND
            </h2>
            <p className="text-sm sm:text-base font-bold text-[#FFB600] mt-0.5">
              Becarios Universitarios Misión Alianza Noruega de Diaconía
            </p>
          </div>

          {/* Párrafo descriptivo institucional */}
          <p className="text-xs sm:text-sm text-white/95 leading-relaxed max-w-4xl">
            Programa de inversión social de Diaconía FRIF-IFD integrado desde 2019. Empodera a estudiantes universitarios de escasos recursos mediante formación integral en liderazgo diaconal, combinando fe, competencias técnicas y vocación de servicio.
          </p>

          {/* Chips de impacto institucional idénticos a móvil */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="px-4 py-2.5 rounded-xl bg-white/12 border border-white/20 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">25 becarios activos</span>
              <span className="text-[11px] text-[#FFB600] font-medium">La Paz y El Alto</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/12 border border-white/20 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">+65 beneficiados</span>
              <span className="text-[11px] text-[#FFB600] font-medium">47% mujeres</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/12 border border-white/20 backdrop-blur-xs">
              <span className="text-xs font-bold text-white block">Sede Diaconía</span>
              <span className="text-[11px] text-[#FFB600] font-medium">Desde 2019</span>
            </div>
          </div>

          {/* Versículo lema bíblico oficial: Colosenses 3:23 */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/20 flex items-start gap-3">
              <Quote className="w-5 h-5 text-[#FFB600] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium italic text-white/95 leading-relaxed">
                  «Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.»
                </p>
                <p className="text-[11px] font-bold text-[#FFB600] uppercase tracking-wide">
                  Colosenses 3:23 · Lema Institucional BUMAND
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TARJETA: ¿QUIÉNES SOMOS?                                    */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-7">
        <div className="flex items-center gap-2.5 text-[#035683] font-bold text-base mb-3">
          <Users className="w-5 h-5 text-[#007BBE]" />
          <h3 className="font-sans">¿Quiénes somos?</h3>
        </div>
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700">
          <p>
            BUMAND es un programa de capacitación en liderazgo de servicio, dirigido a estudiantes universitarios cristianos evangélicos, de escasos recursos, que tienen gran potencial de formarse como líderes diaconales, para ser agentes de cambio en la familia, la iglesia y la comunidad.
          </p>
          <p className="text-slate-600">
            Inició sus reuniones y actividades de formación en las instalaciones de la Misión Alianza de Noruega (ex fábrica de vidrios); posteriormente, tras su integración en 2019 a Diaconía FRIF-IFD, las reuniones y talleres pasaron a realizarse en las oficinas de la institución.
          </p>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 4. OBJETIVO, VISIÓN Y MISIÓN INSTITUCIONAL                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Objetivo del Programa */}
        <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between hover:border-[#FFB600]/60 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-[#D97706]" />
              </div>
              <h4 className="text-sm font-bold text-[#035683]">Objetivo del Programa</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              «La escuela de liderazgo Diaconal busca formar líderes cristianos comprometidos con el Reino de Dios, desde una fuerte espiritualidad, para que desde su testimonio de vida y el ejercicio de su liderazgo, transformen positivamente su entorno en la perspectiva del reino.»
            </p>
          </div>
        </Card>

        {/* Visión */}
        <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between hover:border-[#00ABBD]/60 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00ABBD]/10 text-[#00ABBD] border border-[#00ABBD]/20 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-[#00ABBD]" />
              </div>
              <h4 className="text-sm font-bold text-[#035683]">Visión</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              «Líderes graduados con vocación de servicio, involucrados plenamente en su contexto social, haciendo uso inteligente y relevante de su entrenamiento, su profesión y liderazgo para la gloria de Dios.»
            </p>
          </div>
        </Card>

        {/* Misión */}
        <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between hover:border-[#007BBE]/60 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#007BBE]/10 text-[#007BBE] border border-[#007BBE]/20 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-[#007BBE]" />
              </div>
              <h4 className="text-sm font-bold text-[#035683]">Misión</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              «Los becarios capacitados, comprometidos y motivados por la Palabra de Dios y el Espíritu Santo a un liderazgo de servicio en su contexto social e iglesia local.»
            </p>
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 5. LOS 4 COMPONENTES DEL PROGRAMA                             */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-7">
        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-2 text-[#035683] font-bold text-base">
            <Layers className="w-5 h-5 text-[#007BBE]" />
            <h3>Los 4 Componentes del Programa</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Ejes formativos integrales definidos en el marco fundacional de BUMAND:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Componente 1 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-start gap-3.5 hover:border-[#007BBE]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#007BBE]">
                1. Escuela de Líderes
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ciclo formativo basado en el módulo CETI-Iglesia y el estudio del libro de Howard Snyder: «La Comunidad del Rey», generando un cambio en la visión de la iglesia como agente de transformación del Reino con hechos de misericordia e impacto social.
              </p>
            </div>
          </div>

          {/* Componente 2 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-start gap-3.5 hover:border-[#00ABBD]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#00ABBD]/10 text-[#00ABBD] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#00ABBD]">
                2. Prácticas Pre-Profesionales
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apoyo en la cualificación profesional y técnica de los becarios dentro de la institución y el mercado laboral, generando impacto positivo en su persona, familia, iglesia y comunidad sobre la plataforma del servicio.
              </p>
            </div>
          </div>

          {/* Componente 3 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-start gap-3.5 hover:border-[#D97706]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
              <Church className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#D97706]">
                3. Liderazgo en la Iglesia
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eje central enfocado en potenciar el liderazgo y compromiso cristiano para servir en su congregación local y en todo el entorno comunitario donde se desenvuelve el estudiante.
              </p>
            </div>
          </div>

          {/* Componente 4 */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-start gap-3.5 hover:border-[#00808E]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#00808E]/10 text-[#00808E] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#00808E]">
                4. Acciones de Servicio
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                «Si no te cuesta, no lo valoras». El programa no se limita al aporte económico; fomenta una actitud de esfuerzo, trabajo pre-profesional y servicio activo y solidario en favor de la comunidad.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 6. LOS TRES PRINCIPIOS DIACONALES                              */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-7">
        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-2 text-[#035683] font-bold text-base">
            <Sparkles className="w-5 h-5 text-[#FFB600]" />
            <h3>Los Tres Principios Diaconales</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Pilares fundacionales que rigen el actuar de Diaconía FRIF-IFD y la formación del becario:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Principio 1 */}
          <div className="p-4 rounded-xl bg-[#FFFBEB] border-l-4 border-l-[#FFB600] border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-[#D97706]">
                1. Compartir la Fe
              </h4>
              <span className="text-base">🕊️</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Comunión cristiana en congregaciones locales, devocionales y testimonio vivo.
            </p>
          </div>

          {/* Principio 2 */}
          <div className="p-4 rounded-xl bg-[#F0F9FF] border-l-4 border-l-[#035683] border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-[#035683]">
                2. Combatir la Pobreza
              </h4>
              <span className="text-base">🌱</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Inclusión social, becas universitarias y oportunidades formativas integrales.
            </p>
          </div>

          {/* Principio 3 */}
          <div className="p-4 rounded-xl bg-[#F0FDFA] border-l-4 border-l-[#00808E] border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-[#00808E]">
                3. Promover la Justicia
              </h4>
              <span className="text-base">⚖️</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Equidad, trato digno, ética transparente y servicio activo al prójimo.
            </p>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 7. HISTORIA Y TRAYECTORIA INSTITUCIONAL (1981 – PRESENTE)      */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-7">
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 text-[#035683] font-bold text-base">
            <Clock className="w-5 h-5 text-[#035683]" />
            <h3>Historia y Trayectoria Institucional (1981 – Presente)</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Evolución y consolidación del programa desde su fundación misionera hasta la actualidad:
          </p>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-7">
          {/* Hito 1 */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[35px] top-0.5 w-4 h-4 rounded-full bg-[#035683] border-2 border-white shadow-xs" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                1981 – 1982 · Origen del Programa con Berit Helgøy Kloster
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nace en la Misión Alianza de Noruega para apoyar a jóvenes universitarios desde el proyecto de patrocinio.
              </p>
            </div>
          </div>

          {/* Hito 2 */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[35px] top-0.5 w-4 h-4 rounded-full bg-[#007BBE] border-2 border-white shadow-xs" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                1983 – 1984 · Reafirmación de Becas Universitarias con Carlos Tamayo
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidado por Carlos Tamayo para fortalecer las iglesias con profesionales cristianos y brindar apoyo sociofinanciero.
              </p>
            </div>
          </div>

          {/* Hito 3 */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[35px] top-0.5 w-4 h-4 rounded-full bg-[#00ABBD] border-2 border-white shadow-xs" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                2019 · Integración a Diaconía FRIF-IFD
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adopción institucional como programa de inversión social, trasladando encuentros a las oficinas de Diaconía.
              </p>
            </div>
          </div>

          {/* Hito 4 */}
          <div className="relative">
            <div className="absolute -left-[31px] sm:-left-[35px] top-0.5 w-4 h-4 rounded-full bg-[#FFB600] border-2 border-white shadow-xs ring-2 ring-[#FFB600]/40" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#035683]">
                Presente · Impacto Activo y Consolidación
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                25 becarios en La Paz y El Alto, +65 egresados (47% mujeres) y plataforma digital institucional.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 8. SEDE CENTRAL DIACONÍA FRIF-IFD Y CONTACTO                   */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-[#035683] font-bold text-base">
              <Building2 className="w-5 h-5 text-[#007BBE]" />
              <h3>Sede Central Diaconía FRIF-IFD</h3>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">
                Av. Juan Pablo II N° 2540 (Bloques A y B), El Alto, La Paz, Bolivia.
              </p>
              <p className="text-slate-600 font-mono text-xs">
                Coordenadas: -16.50005, -68.17345 (Tolerancia: 120m)
              </p>
              <p className="text-slate-600">
                Contacto Oficial: <span className="font-mono font-medium text-[#007BBE]">coordinacion@bumand.bo</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              onClick={() => copiarContacto("coordinacion@bumand.bo")}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs font-bold border-[#E5E7EB] text-[#035683] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              {correo_copiado ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Correo</span>
                </>
              )}
            </Button>

            <a
              href="https://maps.google.com/?q=-16.50005,-68.17345"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#007BBE] hover:bg-[#035683] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Ver en Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 9. PREGUNTAS FRECUENTES INSTITUCIONALES (FAQ)                 */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-7">
        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-2 text-[#035683] font-bold text-base">
            <BookOpen className="w-5 h-5 text-[#007BBE]" />
            <h3>Preguntas Frecuentes Institucionales (FAQ)</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Aclaraciones normativas sobre el funcionamiento de la beca, regulaciones ASFI y evaluación:
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              pregunta: "¿Qué es BUMAND y quién lo financia?",
              respuesta:
                "BUMAND (Becarios Universitarios Misión Alianza Noruega de Diaconía) es el programa de becas y responsabilidad social financiado íntegramente por la Fundación Diaconía Fondo Rotativo de Inversión y Fomento - IFD. Cubre apoyo económico mensual, reintegro del 80% de gastos de transporte urbano, seguro médico institucional y formación en liderazgo diaconal.",
            },
            {
              pregunta: "¿Quiénes fundaron el programa y cuál es su trasfondo histórico?",
              respuesta:
                "Fue fundado en 1981–1982 por la misionera noruega Berit Helgøy Kloster con el apoyo de la Misión Alianza de Noruega. En 1983–1984 fue consolidado bajo la dirección de Carlos Tamayo, y en 2019 se integró formalmente como programa de inversión social de Diaconía FRIF-IFD.",
            },
            {
              pregunta: "¿Por qué la marcación de asistencia se valida con GPS Haversine?",
              respuesta:
                "Para garantizar certeza geográfica y transparencia ante auditorías de Recursos Humanos y la ASFI, la marcación de entrada y salida se valida satelitalmente con un radio de tolerancia geodésico de 120 metros. Esto suprime la necesidad de registros en papel y previene cualquier fraude de presencia.",
            },
            {
              pregunta: "¿Cómo funciona la política del 80% de devolución de pasajes?",
              respuesta:
                "Los becarios declaran sus tramos de ida y vuelta en la app móvil (minibús, micro y Mi Teleférico). A partir del día 24 de cada mes, se habilita el envío de la planilla mensual. El sistema calcula en centavos exactos el 80% del gasto total, el cual es revisado y aprobado digitalmente por el mentor.",
            },
            {
              pregunta: "¿Cuál es el presupuesto oficial de refrigerios para las duplas del viernes?",
              respuesta:
                "El presupuesto oficial es de Bs 5.00 por persona. Al rendir la entrega del refrigerio institucional en la Escuela de Líderes, Administración procesa la devolución íntegra del 100%.",
            },
          ].map((item, index) => {
            const esta_abierta = pregunta_abierta === index;
            return (
              <div
                key={index}
                className="border border-[#E5E7EB] rounded-xl overflow-hidden transition-all bg-white"
              >
                <button
                  type="button"
                  onClick={() => alternarPregunta(index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-[#035683] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{item.pregunta}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2 ${
                      esta_abierta ? "rotate-180 text-[#007BBE]" : ""
                    }`}
                  />
                </button>
                {esta_abierta && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-[#F8FAFC]/50">
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
