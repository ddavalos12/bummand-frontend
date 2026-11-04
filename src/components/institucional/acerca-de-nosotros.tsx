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
  Coffee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ContadorRodilloAnimado } from "@/components/animaciones/contador-rodillo-animado";

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
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. HERO INSTITUCIONAL PRINCIPAL                                */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#035683] via-[#007BBE] to-[#00808E] p-6 sm:p-10 text-white shadow-xl border border-[#00ABBD]/30">
        {/* Marca de agua institucional al 20% */}
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
                Actualizado al Semestre II - 2026
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

        {/* LEMA BÍBLICO INSTITUCIONAL OFICIAL */}
        <div className="mt-8 pt-5 border-t border-white/15 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/15 ring-1 ring-white/10">
            <Quote className="w-5 h-5 text-[#FFB600] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold italic text-white/95 leading-relaxed">
                «Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres; sabiendo que del Señor recibiréis la recompensa de la herencia, porque a Cristo el Señor servís.»
              </p>
              <span className="text-[11px] font-poppins font-extrabold text-[#FFB600] mt-1.5 block tracking-wide uppercase">
                Colosenses 3:23 · Lema Institucional BUMAND
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/15 ring-1 ring-white/10">
            <Quote className="w-5 h-5 text-[#00ABBD] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold italic text-white/95 leading-relaxed">
                «Junto a aguas de reposo me pastoreará. Confortará mi alma; me guiará por sendas de justicia por amor de su nombre.»
              </p>
              <span className="text-[11px] font-poppins font-extrabold text-[#00ABBD] mt-1.5 block tracking-wide uppercase">
                Salmos 23:2-3 · Lema Fundacional Diaconía FRIF-IFD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CIFRAS Y MÉTRICAS DE IMPACTO INSTITUCIONAL                 */}
      {/* ============================================================== */}
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
            Nómina Semestre II-2026
          </p>
        </div>

        {/* KPI 3: Becarios Históricos */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#007BBE]/40 transition-colors">
          <span className="text-[11px] font-poppins font-bold text-muted-foreground uppercase tracking-wider block">
            Graduados BUMAND
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
            Iglesias Registradas
          </span>
          <div className="font-poppins text-2xl sm:text-3xl font-extrabold text-[#FFB600] my-1">
            <ContadorRodilloAnimado valor={17} sufijo="" clase_personalizada="text-[#FFB600]" />
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            Congregaciones F-03
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

      {/* ============================================================== */}
      {/* 3. HISTORIA Y ORÍGENES FUNDACIONALES FIDEDIGNOS (1981 – 2026)  */}
      {/* ============================================================== */}
      <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 sm:p-8">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#035683]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#035683] font-sans">
              Historia y Orígenes Fundacionales del Programa BUMAND (1981 – 2026)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Más de cuatro décadas forjando profesionales cristianos de excelencia al servicio de Dios y la comunidad boliviana.
          </p>
        </div>

        <div className="relative border-l-2 border-[#00ABBD]/30 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
          {/* Hito 1: 1981-1982 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#035683] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#035683]/10 text-[#035683] font-poppins font-bold text-[11px]">
                1981 – 1982 · Fundación Misionera Pionera
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Iniciativa de la Misionera Berit Helgøy Kloster y la Iglesia Luterana de Noruega (NMS)
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                El programa nace en las ciudades de La Paz y El Alto gracias a la visión diaconal de la misionera noruega <strong>Berit Helgøy Kloster</strong>, respaldada por la Sociedad Misionera de la Iglesia Luterana de Noruega (NMS). Su propósito fundamental fue brindar una oportunidad real de formación superior a jóvenes bachilleres de escasos recursos económicos pertenecientes a congregaciones cristianas locales, promoviendo la equidad social y el testimonio cristiano.
              </p>
            </div>
          </div>

          {/* Hito 2: 1983-1984 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#007BBE] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#007BBE]/10 text-[#007BBE] font-poppins font-bold text-[11px]">
                1983 – 1984 · Consolidación Institucional
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Estructuración Directiva bajo el Liderazgo del Lic. Carlos Tamayo
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                El programa se consolida formalmente en Bolivia bajo la dirección del <strong>Lic. Carlos Tamayo</strong>, estableciendo los reglamentos de selección, el acompañamiento pastoral continuo, los criterios de excelencia académica y el compromiso de retribución de los becarios a través de su testimonio y servicio comunitario.
              </p>
            </div>
          </div>

          {/* Hito 3: 2019 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-[#00ABBD] shadow-xs" />
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00ABBD]/10 text-[#00808E] font-poppins font-bold text-[11px]">
                2019 · Alianza Estratégica Institucional
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A] font-sans">
                Integración Plena como Programa Insignia de Diaconía FRIF-IFD
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                En el año 2019, BUMAND se integra oficialmente como el programa insignia de responsabilidad social y mayordomía cristiana de la <strong>Fundación Diaconía Fondo Rotativo de Inversión y Fomento (Diaconía FRIF-IFD)</strong>, ampliando su red de prácticas preprofesionales a más de 72 sedes en todo el país y fortaleciendo el patrocinio financiero para jóvenes universitarios.
              </p>
            </div>
          </div>

          {/* Hito 4: 2024-2026 */}
          <div className="relative group">
            <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-[#FFB600] border-4 border-white shadow-md ring-2 ring-[#FFB600]" />
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-amber-50 border border-[#00ABBD]/40 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#035683] text-[#FFB600] font-poppins font-bold text-[11px]">
                  Gestión 2026 · Modernización y Trazabilidad Integral
                </span>
                <span className="text-xs font-poppins font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operatividad Certificada
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#035683] font-sans">
                Consolidación del Ecosistema Digital BUMAND 2.0
              </h4>
              <p className="text-xs text-slate-700 font-sans leading-relaxed">
                A través de la digitalización multiplataforma, se alcanza la erradicación total de formularios en papel carbónico, implementando control de asistencia con radar geodésico Haversine (120m), liquidación transparente de pasajes al 80%, certificación pastoral con Formulario F-03 y seguimiento de 23 becarios en convenio con la Universidad Mayor de San Andrés (UMSA).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 4. MISIÓN, VISIÓN Y MARCO TEOLÓGICO DE LA MISIÓN INTEGRAL      */}
      {/* ============================================================== */}
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

        {/* Marco Teológico: Misión Integral y Mayordomía Cristiana */}
        <Card className="rounded-3xl border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Church className="w-5 h-5 text-[#035683]" />
              <h3 className="text-lg font-bold text-[#035683] font-sans">
                Fundamentación Teológica: Misión Integral y Mayordomía Bíblica
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-sans mb-4 leading-relaxed">
              El programa BUMAND se fundamenta teológicamente en el paradigma de la <strong>Misión Integral</strong> y la mayordomía bíblica inspirada en la eclesiología de teólogos contemporáneos como <strong>Howard Snyder</strong> en su influyente obra <em>«La Comunidad del Rey»</em>.
            </p>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <span className="font-bold text-[#035683] block">
                  1. El Reino de Dios y la Vida Cotidiana
                </span>
                <p className="leading-relaxed text-[11px]">
                  Como postula Snyder, el Reino de Dios abarca todas las dimensiones de la vida humana. La fe cristiana no puede limitarse al ámbito privado o cultual, sino que se manifiesta activamente en la excelencia profesional, la justicia social y el servicio al prójimo.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <span className="font-bold text-[#007BBE] block">
                  2. La Mayordomía de Talentos y Saberes
                </span>
                <p className="leading-relaxed text-[11px]">
                  Cada disciplina universitaria (Ingeniería, Contaduría, Psicología, Medicina, Educación) es considerada una vocación sagrada recibida por gracia. El becario es administrador y mayordomo de sus competencias para transformar su entorno comunitario con honestidad y amor.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">
                  3. La Iglesia Local como Núcleo de Vida Comunitaria
                </span>
                <p className="leading-relaxed text-[11px]">
                  El becario no es un individuo aislado, sino parte viva del cuerpo de Cristo en su congregación local, donde rinde cuentas, testifica con su conducta y apoya al pastor en el discipulado.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 5. LOS 4 PILARES FUNDAMENTALES DEL PROGRAMA BUMAND             */}
      {/* ============================================================== */}
      <Card className="rounded-3xl border-[#035683]/20 bg-gradient-to-br from-white via-slate-50 to-sky-50/30 shadow-sm p-6 sm:p-8 ring-1 ring-[#035683]/10">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFB600]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#035683] font-sans">
              Los Cuatro Pilares Fundamentales del Programa BUMAND
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Estructura formativa integral que articula la vida espiritual, académica, profesional y el bienestar social de cada becario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pilar 1 */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-[#035683] transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold">
                <Church className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="border-[#035683]/30 text-[#035683] bg-[#035683]/5 text-[10px] font-bold">
                Pilar 1 · Espiritual
              </Badge>
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                Acompañamiento Espiritual y Eclesiástico (F-03)
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Conexión viva con la congregación local y el pastor evaluador mediante el <strong>Formulario F-03</strong>. Certifica comunión, servicio en cargos eclesiales, testimonio ético y formación ministerial continua (20% del total de la beca).
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold block pt-2 border-t border-slate-100">
              Evaluador: Pastor de Iglesia Local
            </span>
          </div>

          {/* Pilar 2 */}
          <div className="p-5 rounded-2xl border border-sky-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-[#007BBE] transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="border-[#007BBE]/30 text-[#007BBE] bg-[#007BBE]/5 text-[10px] font-bold">
                Pilar 2 · Laboral
              </Badge>
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                Excelencia Académica y Prácticas Preprofesionales
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Asignación económica mensual para estudios superiores, convalidación semestral de kárdex de notas y prácticas supervisadas en gerencias y agencias de <strong>Diaconía FRIF-IFD</strong> con rúbrica Likert 18+3 evaluada por jefes de unidad.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold block pt-2 border-t border-slate-100">
              Evaluador: Universidad y Tutor Mentor
            </span>
          </div>

          {/* Pilar 3 */}
          <div className="p-5 rounded-2xl border border-amber-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-[#FFB600] transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[10px] font-bold">
                Pilar 3 · Teológico
              </Badge>
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                Escuela de Líderes y Formación Teológica (CETI)
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Encuentros formativos presenciales de los viernes por la tarde y plataforma virtual con 12 módulos de mayordomía, ética profesional en el ámbito financiero y liderazgo servidor en alianza con el <strong>CETI</strong>.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold block pt-2 border-t border-slate-100">
              Evaluador: Facilitador Teológico CETI
            </span>
          </div>

          {/* Pilar 4 */}
          <div className="p-5 rounded-2xl border border-teal-200 bg-white shadow-xs flex flex-col justify-between space-y-3 hover:border-[#00808E] transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-[#00808E] flex items-center justify-center font-bold">
                <Coffee className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="border-teal-300 text-[#00808E] bg-teal-50 text-[10px] font-bold">
                Pilar 4 · Social
              </Badge>
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                Bienestar Integral y Mayordomía Social
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Diagnóstico socioeconómico de bienestar estudiantil, subsidio de refrigerios de duplas los viernes (tarifa institucional de <strong>Bs 5.00</strong> por persona con 100% de devolución), reembolso del 80% de pasajes y acompañamiento familiar.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold block pt-2 border-t border-slate-100">
              Evaluador: Trabajo Social y Administración
            </span>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 6. SEDE CENTRAL, AGAVERAS Y DATOS DE CONTACTO                  */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* 7. PREGUNTAS FRECUENTES INSTITUCIONALES (FAQ)                 */}
      {/* ============================================================== */}
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
              pregunta: "¿Quiénes fundaron el programa y cuál es su trasfondo histórico?",
              respuesta:
                "Fue fundado en 1981–1982 por la misionera noruega Berit Helgøy Kloster con el apoyo de la Iglesia Luterana de Noruega (NMS). En 1983–1984 fue consolidado bajo la dirección del Lic. Carlos Tamayo, y en 2019 se integró formalmente como programa insignia de Diaconía FRIF-IFD.",
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
              pregunta: "¿Cuál es el presupuesto oficial de refrigerios para las duplas del viernes?",
              respuesta:
                "El presupuesto oficial es de Bs 5.00 por persona (23 raciones × Bs 5.00 = Bs 115.00). Al rendir la entrega del refrigerio institucional en la Escuela de Líderes, Administración procesa la devolución íntegra del 100%.",
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
