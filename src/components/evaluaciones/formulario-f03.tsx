"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Printer,
  UserCheck,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  Save,
  Loader2,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATALOGO_IGLESIAS_INSTITUCIONALES, IglesiaInstitucional } from "./evaluaciones-datos-semestre";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";

export interface FormularioF03Props {
  becario_id?: number;
  nombre_becario_inicial?: string;
  iglesia_actual?: string;
  pastor_actual?: string;
  celular_actual?: string;
  datos_f03?: Record<string, unknown> | null;
  puntaje_inicial?: number | null;
  catalogo_iglesias?: Array<{
    id: number | string;
    nombre: string;
    pastor_nombre?: string;
    pastor_telefono?: string;
    pastor_correo?: string;
    direccion?: string;
  }>;
  alGuardar?: (resultado: { becario_id: number; puntaje: number; estado: string }) => void;
  alEnviarExito?: () => void;
  alCerrar?: () => void;
}

/**
 * @component FormularioF03
 * @description Formulario ministerial F-03 del Pastor de la congregación con sus 3 secciones
 * canónicas completas (Datos pastor/iglesia, Preguntas 1 a 13 con pills y textareas, Declaración jurada
 * con C.I., calificación oficial sobre 20 puntos y exportación a PDF oficial convalidado).
 */
export function FormularioF03({
  becario_id = 1,
  nombre_becario_inicial = "María Catunta Laime",
  iglesia_actual,
  pastor_actual,
  celular_actual,
  datos_f03,
  puntaje_inicial,
  catalogo_iglesias,
  alGuardar,
  alEnviarExito,
  alCerrar,
}: FormularioF03Props) {
  const [cargando_pdf, set_cargando_pdf] = useState(false);
  const [guardando, set_guardando] = useState(false);
  const [error_formulario, set_error_formulario] = useState<string | null>(null);

  const lista_iglesias =
    catalogo_iglesias && catalogo_iglesias.length > 0
      ? catalogo_iglesias
      : CATALOGO_IGLESIAS_INSTITUCIONALES;

  // Sección I: Datos Pastor e Iglesia con soporte de Catálogo Institucional
  const [origen_datos_iglesia, set_origen_datos_iglesia] = useState<"catalogo" | "manual">("catalogo");
  const [iglesia_seleccionada_id, set_iglesia_seleccionada_id] = useState<string>(
    String(lista_iglesias[0]?.id || "1")
  );

  const [pastor_nombre, set_pastor_nombre] = useState(
    pastor_actual || (lista_iglesias[0] as any)?.pastor_nombre || "Luis Álvaro Quispe Condori"
  );
  const [pastor_correo, set_pastor_correo] = useState(
    (lista_iglesias[0] as any)?.pastor_correo || (lista_iglesias[0] as any)?.pastor_email || "pastor.luis.quispe@diaconia.bo"
  );
  const [pastor_celular, set_pastor_celular] = useState(
    celular_actual || (lista_iglesias[0] as any)?.pastor_telefono || (lista_iglesias[0] as any)?.pastor_celular || "73236864"
  );
  const [iglesia_nombre, set_iglesia_nombre] = useState(
    iglesia_actual || lista_iglesias[0]?.nombre || "Iglesia Evangélica Amigos Central de Bolivia Bautista Saavedra Más que Vencedores"
  );
  const [iglesia_direccion, set_iglesia_direccion] = useState(
    (lista_iglesias[0] as any)?.direccion || "Zona Bautista Saavedra / Villa Adela, El Alto"
  );
  const [lider_nombre, set_lider_nombre] = useState("Hno. David Mendoza");
  const [lider_cargo, set_lider_cargo] = useState("Líder de Diaconía");

  // Calificación Módulo 1 (Sobre 20 puntos)
  const [puntaje_f03, set_puntaje_f03] = useState<number>(
    puntaje_inicial !== undefined && puntaje_inicial !== null ? Number(puntaje_inicial) : 19.0
  );

  // Sección II: Preguntas 1 a 13
  const [becario_nombre, set_becario_nombre] = useState(nombre_becario_inicial);
  const [frecuencia_asistencia, set_frecuencia_asistencia] = useState(
    (datos_f03?.frecuencia_asistencia as string) || "Es miembro en plena comunión"
  );
  const [demuestra_compromiso, set_demuestra_compromiso] = useState(
    (datos_f03?.demuestra_compromiso as string) || "Sí"
  );
  const [ocupa_cargo, set_ocupa_cargo] = useState(
    (datos_f03?.ocupa_cargo as string) || "Sí"
  );
  const [cargo_actual, set_cargo_actual] = useState(
    (datos_f03?.cargo_actual as string) || (datos_f03?.cargo_2025 as string) || "Líder de Jóvenes"
  );
  const [cumplimiento_cargos, set_cumplimiento_cargos] = useState(
    (datos_f03?.cumplimiento_cargos as string) || "Muy bien"
  );

  const [pregunta_conviccion, set_pregunta_conviccion] = useState(
    (datos_f03?.conviccion_llamado as string) ||
    "Muestra sincera vocación y disposición de servicio constante en las actividades de la congregación."
  );
  const [pregunta_ejemplo, set_pregunta_ejemplo] = useState(
    (datos_f03?.ejemplo_congregacion as string) ||
    "En la puntualidad a los cultos, fidelidad en el servicio y respeto hacia los líderes espirituales."
  );
  const [pregunta_capacitaciones, set_pregunta_capacitaciones] = useState(
    (datos_f03?.compromiso_capacitaciones as string) ||
    "Asiste a todos los talleres juveniles y participa activamente en los estudios bíblicos semanales."
  );
  const [pregunta_testimonio, set_pregunta_testimonio] = useState(
    (datos_f03?.testimonio_cristiano as string) ||
    "Excelente testimonio tanto dentro de la comunidad de fe como en su entorno universitario y familiar."
  );
  const [pregunta_relacion, set_pregunta_relacion] = useState(
    (datos_f03?.relacion_miembros as string) ||
    "Trato fraternal, humilde y siempre presto a colaborar en las necesidades de los hermanos."
  );
  const [pregunta_nuevos_lideres, set_pregunta_nuevos_lideres] = useState(
    (datos_f03?.desarrollo_nuevos_lideres as string) ||
    "Se encuentra mentoreando a dos señoritas del grupo de adolescentes en el área de alabanza."
  );
  const [pregunta_fortalezas, set_pregunta_fortalezas] = useState(
    (datos_f03?.fortalezas as string) ||
    "Compromiso, empatía, responsabilidad y facilidad de comunicación."
  );
  const [pregunta_debilidades, set_pregunta_debilidades] = useState(
    (datos_f03?.debilidades as string) ||
    "A veces sobrecarga sus horarios universitarios con compromisos extraordinarios."
  );
  const [pregunta_opinion, set_pregunta_opinion] = useState(
    (datos_f03?.opinion_general as string) ||
    "El aporte del programa BUMAND en la vida del becario ha sido un testimonio palpable de edificación para toda la iglesia."
  );

  // Sección III: Declaración Jurada
  const [declara_nombre, set_declara_nombre] = useState(
    pastor_actual || "Luis Álvaro Quispe Condori"
  );
  const [declara_ci, set_declara_ci] = useState("3498214 LP");
  const [declara_aceptada, set_declara_aceptada] = useState(true);

  // Sincronizar cuando cambian las props iniciales
  useEffect(() => {
    if (nombre_becario_inicial) set_becario_nombre(nombre_becario_inicial);
    if (iglesia_actual) set_iglesia_nombre(iglesia_actual);
    if (pastor_actual) {
      set_pastor_nombre(pastor_actual);
      set_declara_nombre(pastor_actual);
    }
    if (celular_actual) set_pastor_celular(celular_actual);
    if (puntaje_inicial !== undefined && puntaje_inicial !== null) {
      set_puntaje_f03(Number(puntaje_inicial));
    }
  }, [nombre_becario_inicial, iglesia_actual, pastor_actual, celular_actual, puntaje_inicial]);

  const manejarSeleccionIglesia = (id: string) => {
    set_iglesia_seleccionada_id(id);
    if (id === "manual") {
      set_origen_datos_iglesia("manual");
      return;
    }
    const encontrada = lista_iglesias.find((i) => String(i.id) === id);
    if (encontrada) {
      set_iglesia_nombre(encontrada.nombre);
      const nombreP = (encontrada as any).pastor_nombre || (encontrada as any).pastor || "";
      const correoP = (encontrada as any).pastor_correo || (encontrada as any).pastor_email || "";
      const celP = (encontrada as any).pastor_celular || (encontrada as any).pastor_telefono || (encontrada as any).telefono || "";
      const dirP = (encontrada as any).direccion || "";

      set_pastor_nombre(nombreP);
      set_declara_nombre(nombreP);
      set_pastor_correo(correoP);
      set_pastor_celular(celP);
      set_iglesia_direccion(dirP);
      toast.info(`Datos cargados desde catálogo: ${encontrada.nombre}`);
    }
  };

  const guardarEvaluacionF03 = async () => {
    if (!pastor_nombre.trim()) {
      set_error_formulario("Debe completar el nombre del pastor evaluador.");
      return;
    }
    if (!declara_aceptada) {
      set_error_formulario("Debe marcar la casilla de declaración jurada antes de guardar.");
      return;
    }

    set_error_formulario(null);
    set_guardando(true);

    try {
      const cuerpo = {
        becario_id: becario_id || 1,
        pastor_nombre,
        pastor_correo,
        pastor_celular,
        iglesia_nombre,
        iglesia_direccion,
        puntaje: Number(puntaje_f03),
        observaciones: pregunta_opinion,
        campos_formulario: {
          lider_nombre,
          lider_cargo,
          frecuencia_asistencia,
          demuestra_compromiso,
          ocupa_cargo,
          cargo_actual,
          cumplimiento_cargos,
          conviccion_llamado: pregunta_conviccion,
          ejemplo_congregacion: pregunta_ejemplo,
          compromiso_capacitaciones: pregunta_capacitaciones,
          testimonio_cristiano: pregunta_testimonio,
          relacion_miembros: pregunta_relacion,
          desarrollo_nuevos_lideres: pregunta_nuevos_lideres,
          fortalezas: pregunta_fortalezas,
          debilidades: pregunta_debilidades,
          opinion_general: pregunta_opinion,
          declara_nombre,
          declara_ci,
          declara_aceptada,
        },
      };

      try {
        await clienteApi.post(`/evaluaciones/f03/becario/${becario_id || 1}`, cuerpo);
      } catch {
        // Fallback endpoint alternativo
        await clienteApi.post(`/evaluaciones/${becario_id || 1}/formulario-f03`, cuerpo);
      }

      toast.success("Evaluación F-03 guardada con éxito", {
        description: `Calificación oficial de ${puntaje_f03} / 20 pts registrada para ${becario_nombre}.`,
      });

      if (alGuardar) {
        alGuardar({
          becario_id: becario_id || 1,
          puntaje: Number(puntaje_f03),
          estado: "Evaluado",
        });
      }
      if (alEnviarExito) alEnviarExito();
    } catch (_error) {
      toast.error("Error al registrar la evaluación pastoral en el servidor.");
    } finally {
      set_guardando(false);
    }
  };

  const exportarPdfF03 = async () => {
    if (!pastor_nombre.trim() || !pastor_correo.trim()) {
      set_error_formulario("Debe completar el nombre y correo del pastor.");
      return;
    }
    if (!declara_aceptada) {
      set_error_formulario("Debe marcar la casilla de declaración jurada antes de exportar.");
      return;
    }

    set_error_formulario(null);
    set_cargando_pdf(true);
    toast.info("Generando formulario F-03 en PDF oficial con Puppeteer...", {
      description: "Compilando rúbrica ministerial y acreditación en sistema.",
    });

    try {
      const blob = await clienteApi.descargarBlob(`/pdf/evaluacion/${becario_id || 1}`);
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `Formulario_F03_${becario_nombre.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);

      toast.success("Formulario F-03 descargado en PDF oficial.");
      if (alEnviarExito) alEnviarExito();
    } catch (_e) {
      toast.error("Error al descargar el PDF generado por Puppeteer desde el servidor.");
    } finally {
      set_cargando_pdf(false);
    }
  };

  return (
    <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden max-h-[85vh] flex flex-col">
      <CardHeader className="border-b border-[#E5E7EB] p-5 pb-4 shrink-0 bg-[#F8F9FA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display font-bold text-base text-[#035683] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FFB600]" />
              Formulario F-03 · Evaluación Ministerial del Becario
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Escuela de Líderes BUMAND — a certificar por el Pastor de la iglesia local.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-bold text-[10px]">
              Módulo 01 · 20% Oficial
            </Badge>
            <span className="text-xs font-mono font-bold text-[#035683] bg-[#00ABBD]/10 px-2.5 py-1 rounded-lg">
              Nota: {puntaje_f03.toFixed(1)} / 20 pts
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto p-5 flex-1 space-y-6">
        {/* BANNER CALIFICACIÓN MINISTERIAL */}
        <div className="p-4 bg-gradient-to-r from-[#035683]/10 via-[#00ABBD]/10 to-amber-50 rounded-xl border border-[#00ABBD]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#035683] flex items-center gap-1.5 uppercase tracking-wide">
              <Award className="w-4 h-4 text-[#FFB600]" />
              Calificación Pastoral Asignada (Módulo 1)
            </span>
            <p className="text-[11px] text-muted-foreground">
              Define el puntaje sobre 20.00 puntos que impactará directamente en la Sábana Consolidada Semestral.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={puntaje_f03}
                onChange={(e) => set_puntaje_f03(Math.min(20, Math.max(0, Number(e.target.value) || 0)))}
                className="w-24 h-9 text-center font-bold text-base text-[#035683] bg-white border-[#00ABBD] rounded-xl"
              />
              <span className="text-xs font-bold text-slate-500">/ 20 pts</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN I: Datos Pastor e Iglesia con Combobox Institucional */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#035683]" />
              <h4 className="font-display text-xs font-bold text-[#035683] uppercase">
                I. Datos del pastor y de la iglesia local
              </h4>
            </div>

            <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => set_origen_datos_iglesia("catalogo")}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                  origen_datos_iglesia === "catalogo"
                    ? "bg-[#035683] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Catálogo Institucional ({lista_iglesias.length})
              </button>
              <button
                type="button"
                onClick={() => set_origen_datos_iglesia("manual")}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                  origen_datos_iglesia === "manual"
                    ? "bg-[#035683] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Texto Libre (Manual)
              </button>
            </div>
          </div>

          {origen_datos_iglesia === "catalogo" && (
            <div className="p-3 bg-[#035683]/5 border border-[#00ABBD]/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                  Seleccionar Congregación / Sede del Directorio Oficial:
                </Label>
                <Badge variant="outline" className="text-[10px] bg-white border-[#00ABBD] text-[#035683]">
                  Autocompletado Activo
                </Badge>
              </div>
              <select
                value={iglesia_seleccionada_id}
                onChange={(e) => manejarSeleccionIglesia(e.target.value)}
                className="w-full h-9 text-xs font-medium rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00ABBD]"
              >
                {lista_iglesias.map((ig) => {
                  const pastor = (ig as any).pastor_nombre || (ig as any).pastor || "";
                  return (
                    <option key={ig.id} value={String(ig.id)}>
                      {ig.nombre} {pastor ? `· ${pastor}` : ""}
                    </option>
                  );
                })}
                <option value="manual">Otra congregación no listada (Ingreso manual)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <Label className="text-xs">Nombre del pastor *</Label>
              <Input
                value={pastor_nombre}
                onChange={(e) => {
                  set_pastor_nombre(e.target.value);
                  set_declara_nombre(e.target.value);
                }}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Correo del pastor *</Label>
              <Input
                type="email"
                value={pastor_correo}
                onChange={(e) => set_pastor_correo(e.target.value)}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">N.º celular del pastor</Label>
              <Input
                value={pastor_celular}
                onChange={(e) => set_pastor_celular(e.target.value)}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Nombre de la iglesia</Label>
              <Input
                value={iglesia_nombre}
                onChange={(e) => set_iglesia_nombre(e.target.value)}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Dirección de la iglesia</Label>
              <Input
                value={iglesia_direccion}
                onChange={(e) => set_iglesia_direccion(e.target.value)}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN II: Preguntas 1 a 13 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E5E7EB]">
            <FileText className="w-4 h-4 text-[#00ABBD]" />
            <h4 className="font-display text-xs font-bold text-[#035683] uppercase">
              II. Referencias acerca del becario universitario
            </h4>
          </div>

          <div>
            <Label className="text-xs">1. Nombre del becario</Label>
            <Input
              value={becario_nombre}
              onChange={(e) => set_becario_nombre(e.target.value)}
              className="h-8 text-xs border-[#E5E7EB] mt-1 font-semibold text-[#035683]"
            />
          </div>

          <div>
            <Label className="text-xs">2. ¿Con qué frecuencia el becario asiste a la iglesia?</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
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
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    frecuencia_asistencia === opc
                      ? "bg-[#00ABBD]/15 border-[#00ABBD] text-[#00808E] font-bold"
                      : "border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">3. ¿Demuestra compromiso en las reuniones?</Label>
            <div className="flex gap-2 mt-1.5">
              {["Sí", "Parcialmente", "No"].map((opc) => (
                <button
                  key={opc}
                  type="button"
                  onClick={() => set_demuestra_compromiso(opc)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    demuestra_compromiso === opc
                      ? "bg-[#00ABBD]/15 border-[#00ABBD] text-[#00808E] font-bold"
                      : "border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">4. ¿Ocupa algún cargo en la congregación?</Label>
            <div className="flex gap-2 mt-1.5 mb-2">
              {["Sí", "No"].map((opc) => (
                <button
                  key={opc}
                  type="button"
                  onClick={() => set_ocupa_cargo(opc)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    ocupa_cargo === opc
                      ? "bg-[#00ABBD]/15 border-[#00ABBD] text-[#00808E] font-bold"
                      : "border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opc}
                </button>
              ))}
            </div>

            {ocupa_cargo === "Sí" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-[#E5E7EB]">
                <div>
                  <Label className="text-xs">Cargo actual</Label>
                  <Input
                    value={cargo_actual}
                    onChange={(e) => set_cargo_actual(e.target.value)}
                    className="h-8 text-xs border-[#E5E7EB] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cumplimiento de cargos</Label>
                  <Input
                    value={cumplimiento_cargos}
                    onChange={(e) => set_cumplimiento_cargos(e.target.value)}
                    className="h-8 text-xs border-[#E5E7EB] mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">5. ¿Cómo describiría su convicción de llamado?</Label>
            <Textarea
              rows={2}
              value={pregunta_conviccion}
              onChange={(e) => set_pregunta_conviccion(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">6. ¿En qué áreas es ejemplo para la congregación?</Label>
            <Textarea
              rows={2}
              value={pregunta_ejemplo}
              onChange={(e) => set_pregunta_ejemplo(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">7. ¿Asiste a capacitaciones y estudios bíblicos?</Label>
            <Textarea
              rows={2}
              value={pregunta_capacitaciones}
              onChange={(e) => set_pregunta_capacitaciones(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">8. Testimonio cristiano dentro y fuera de la iglesia</Label>
            <Textarea
              rows={2}
              value={pregunta_testimonio}
              onChange={(e) => set_pregunta_testimonio(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">9. Relaciones interpersonales con líderes y miembros</Label>
            <Textarea
              rows={2}
              value={pregunta_relacion}
              onChange={(e) => set_pregunta_relacion(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">10. ¿Desarrolla o mentorea a nuevos líderes?</Label>
            <Textarea
              rows={2}
              value={pregunta_nuevos_lideres}
              onChange={(e) => set_pregunta_nuevos_lideres(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <Label className="text-xs">11. Principales fortalezas</Label>
              <Textarea
                rows={2}
                value={pregunta_fortalezas}
                onChange={(e) => set_pregunta_fortalezas(e.target.value)}
                className="text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">12. Áreas por mejorar o debilidades</Label>
              <Textarea
                rows={2}
                value={pregunta_debilidades}
                onChange={(e) => set_pregunta_debilidades(e.target.value)}
                className="text-xs border-[#E5E7EB] mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">13. Opinión general acerca del becario</Label>
            <Textarea
              rows={2}
              value={pregunta_opinion}
              onChange={(e) => set_pregunta_opinion(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>
        </div>

        {/* SECCIÓN III: Declaración Jurada */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E5E7EB]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-display text-xs font-bold text-[#035683] uppercase">
              III. Declaración
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nombre del pastor (declaración)</Label>
              <Input
                value={declara_nombre}
                onChange={(e) => set_declara_nombre(e.target.value)}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">C.I. del pastor</Label>
              <Input
                value={declara_ci}
                onChange={(e) => set_declara_ci(e.target.value)}
                className="h-8 text-xs border-[#E5E7EB] mt-1"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg border border-[#E5E7EB] bg-slate-50 text-xs">
            <Checkbox
              id="f03-check"
              checked={declara_aceptada}
              onCheckedChange={(c) => set_declara_aceptada(Boolean(c))}
              className="mt-0.5"
            />
            <Label htmlFor="f03-check" className="text-[11px] leading-tight cursor-pointer">
              Como pastor de la congregación del/la becario, declaro que todos los datos proporcionados son verídicos.
            </Label>
          </div>

          {error_formulario && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error_formulario}</span>
            </div>
          )}
        </div>
      </CardContent>

      <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex flex-wrap items-center justify-between gap-2">
        {alCerrar && (
          <Button
            type="button"
            variant="outline"
            onClick={alCerrar}
            className="h-10 px-4 text-xs font-bold rounded-xl border-slate-300"
          >
            Cerrar
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            disabled={cargando_pdf || guardando}
            onClick={exportarPdfF03}
            className="border-slate-300 hover:bg-slate-100 text-[#035683] font-bold text-xs rounded-xl h-10 px-4 shadow-xs gap-1.5"
          >
            {cargando_pdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00ABBD]" />
            ) : (
              <Printer className="w-4 h-4 text-[#00ABBD]" />
            )}
            <span>Exportar PDF</span>
          </Button>

          <Button
            type="button"
            disabled={guardando}
            onClick={guardarEvaluacionF03}
            className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-sm gap-2"
          >
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FFB600]" />
            ) : (
              <Save className="w-4 h-4 text-[#FFB600]" />
            )}
            <span>Guardar Evaluación F-03 (Módulo 1)</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
