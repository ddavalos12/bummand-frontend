"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, UserCheck, FileText, ShieldCheck, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATALOGO_IGLESIAS_INSTITUCIONALES } from "./evaluaciones-datos-semestre";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";

/**
 * @component FormularioF03
 * @description Formulario ministerial F-03 del Pastor de la congregación con sus 3 secciones
 * canónicas completas (Datos pastor/iglesia, Preguntas 1 a 13 con pills y textareas, Declaración jurada
 * con C.I. y exportación a PDF oficial firmado).
 */
export function FormularioF03({
  becario_id,
  nombre_becario_inicial = "María Catunta Laime",
  alEnviarExito,
}: {
  becario_id?: number;
  nombre_becario_inicial?: string;
  alEnviarExito?: () => void;
}) {
  const [cargando, set_cargando] = useState(false);
  const [error_formulario, set_error_formulario] = useState<string | null>(null);

  // Sección I: Datos Pastor e Iglesia con soporte de Catálogo Institucional
  const [origen_datos_iglesia, set_origen_datos_iglesia] = useState<"catalogo" | "manual">("catalogo");
  const [iglesia_seleccionada_id, set_iglesia_seleccionada_id] = useState<string>("iglesia_bautista_el_alto");

  const manejarSeleccionIglesia = (id: string) => {
    set_iglesia_seleccionada_id(id);
    if (id === "manual") {
      set_origen_datos_iglesia("manual");
      return;
    }
    const encontrada = CATALOGO_IGLESIAS_INSTITUCIONALES.find((i) => i.id === id);
    if (encontrada) {
      set_iglesia_nombre(encontrada.nombre);
      set_pastor_nombre(encontrada.pastor_nombre);
      set_pastor_correo(encontrada.pastor_email);
      set_pastor_celular(encontrada.pastor_celular);
      set_iglesia_direccion(encontrada.direccion);
      toast.info(`Datos cargados desde catálogo institucional: ${encontrada.nombre}`);
    }
  };

  const [pastor_nombre, set_pastor_nombre] = useState("Pastor Juan Ramos Mamani");
  const [pastor_correo, set_pastor_correo] = useState("pastor.ramos@iglesiabautista.bo");
  const [pastor_celular, set_pastor_celular] = useState("71249823");
  const [iglesia_nombre, set_iglesia_nombre] = useState("Iglesia Bautista Central El Alto");
  const [iglesia_direccion, set_iglesia_direccion] = useState("Av. 6 de Marzo #420, El Alto");
  const [lider_nombre, set_lider_nombre] = useState("Hno. David Mendoza");
  const [lider_cargo, set_lider_cargo] = useState("Líder de Diaconía");

  // Sección II: Preguntas 1 a 13
  const [becario_nombre, set_becario_nombre] = useState(nombre_becario_inicial);
  const [frecuencia_asistencia, set_frecuencia_asistencia] = useState("Es miembro en plena comunión");
  const [demuestra_compromiso, set_demuestra_compromiso] = useState("Sí");
  const [ocupa_cargo, set_ocupa_cargo] = useState("Sí");
  const [cargo_actual, set_cargo_actual] = useState("Líder de Jóvenes");
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
    "El aporte del programa BUMAND en la vida del becario ha sido un testimonio palpable de edificación para toda la iglesia."
  );

  // Sección III: Declaración Jurada
  const [declara_nombre, set_declara_nombre] = useState("Pastor Juan Ramos Mamani");
  const [declara_ci, set_declara_ci] = useState("3498214 LP");
  const [declara_aceptada, set_declara_aceptada] = useState(true);

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
    set_cargando(true);
    toast.info("Generando formulario F-03 en PDF oficial con Puppeteer...", {
      description: "Compilando rúbrica ministerial y firma de conformidad.",
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
      set_cargando(false);
    }
  };

  return (
    <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <CardHeader className="border-b border-[#E5E7EB] p-5 pb-4 shrink-0 bg-[#F8F9FA]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display font-bold text-base text-[#035683]">
              Formulario F-03 · Evaluación Ministerial del Becario
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Escuela de Líderes BUMAN-D — a llenar por el Pastor de la iglesia local.
            </CardDescription>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00ABBD]/15 text-[#00808E] font-bold">
            Módulo 01
          </span>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto p-5 flex-1 space-y-6">
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
                Catálogo Institucional
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
                  Seleccionar Congregación / Sede del Catálogo BUMAND:
                </Label>
                <Badge variant="outline" className="text-[10px] bg-white border-[#00ABBD] text-[#035683]">
                  Autocompletado Activo
                </Badge>
              </div>
              <select
                value={iglesia_seleccionada_id}
                onChange={(e) => manejarSeleccionIglesia(e.target.value)}
                className="w-full h-8 text-xs font-medium rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00ABBD]"
              >
                {CATALOGO_IGLESIAS_INSTITUCIONALES.map((ig) => (
                  <option key={ig.id} value={ig.id}>
                    {ig.nombre} · {ig.pastor_nombre} ({ig.ciudad})
                  </option>
                ))}
                <option value="manual">Otra congregación no listada (Ingreso manual)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <Label className="text-xs">Nombre del pastor *</Label>
              <Input
                value={pastor_nombre}
                onChange={(e) => set_pastor_nombre(e.target.value)}
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

        {/* SECCIÓN II */}
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
            <Label className="text-xs">3. ¿Demuestra compromiso con el Señor y la Iglesia?</Label>
            <div className="flex gap-2 mt-1.5">
              {["Sí", "No"].map((opc) => (
                <button
                  key={opc}
                  type="button"
                  onClick={() => set_demuestra_compromiso(opc)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    demuestra_compromiso === opc
                      ? "bg-[#035683] border-[#035683] text-white font-bold"
                      : "border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">4. ¿Ocupa actualmente algún cargo en la iglesia?</Label>
            <div className="flex gap-2 mt-1.5">
              {["Sí", "No"].map((opc) => (
                <button
                  key={opc}
                  type="button"
                  onClick={() => set_ocupa_cargo(opc)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    ocupa_cargo === opc
                      ? "bg-[#035683] border-[#035683] text-white font-bold"
                      : "border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opc}
                </button>
              ))}
            </div>
            {ocupa_cargo === "Sí" && (
              <Input
                value={cargo_actual}
                onChange={(e) => set_cargo_actual(e.target.value)}
                placeholder="Cargo que ocupa este año"
                className="h-8 text-xs border-[#E5E7EB] mt-2"
              />
            )}
          </div>

          <div>
            <Label className="text-xs">5. ¿Cómo ha cumplido con sus cargos?</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {["Muy bien", "Bien", "Necesita Apoyo", "No cumple"].map((opc) => (
                <button
                  key={opc}
                  type="button"
                  onClick={() => set_cumplimiento_cargos(opc)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    cumplimiento_cargos === opc
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
            <Label className="text-xs">6. Convicción al llamado de Dios</Label>
            <Textarea
              rows={2}
              value={pregunta_conviccion}
              onChange={(e) => set_pregunta_conviccion(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">7. Áreas de ejemplo en la congregación</Label>
            <Textarea
              rows={2}
              value={pregunta_ejemplo}
              onChange={(e) => set_pregunta_ejemplo(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">8. Compromiso con capacitaciones</Label>
            <Textarea
              rows={2}
              value={pregunta_capacitaciones}
              onChange={(e) => set_pregunta_capacitaciones(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">9. Testimonio cristiano</Label>
            <Textarea
              rows={2}
              value={pregunta_testimonio}
              onChange={(e) => set_pregunta_testimonio(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">10. Relación con los demás miembros</Label>
            <Textarea
              rows={2}
              value={pregunta_relacion}
              onChange={(e) => set_pregunta_relacion(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">11. Desarrollo de nuevos líderes</Label>
            <Textarea
              rows={2}
              value={pregunta_nuevos_lideres}
              onChange={(e) => set_pregunta_nuevos_lideres(e.target.value)}
              className="text-xs border-[#E5E7EB] mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">12. a) Fortalezas</Label>
              <Textarea
                rows={2}
                value={pregunta_fortalezas}
                onChange={(e) => set_pregunta_fortalezas(e.target.value)}
                className="text-xs border-[#E5E7EB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">12. b) Debilidades</Label>
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

        {/* SECCIÓN III */}
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

      <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex justify-end">
        <Button
          type="button"
          onClick={exportarPdfF03}
          className="bg-[#FFB600] hover:bg-[#FFB600] text-[#3A2400] font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" />
          Exportar PDF (F-03 firmado)
        </Button>
      </div>
    </Card>
  );
}
