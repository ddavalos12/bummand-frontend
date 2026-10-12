"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, UserCheck, FileText, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

  // Sección I: Datos Pastor e Iglesia
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

  const exportarPdfF03 = () => {
    if (!pastor_nombre.trim() || !pastor_correo.trim()) {
      set_error_formulario("Debe completar el nombre y correo del pastor.");
      return;
    }
    if (!declara_aceptada) {
      set_error_formulario("Debe marcar la casilla de declaración jurada antes de exportar.");
      return;
    }

    set_error_formulario(null);
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
        <title>F-03 · ${becario_nombre}</title>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 780px; margin: 30px auto; padding: 0 20px; line-height: 1.5; font-size: 12px; }
          .hdr { display: flex; justify-content: space-between; border-bottom: 2px solid #063A6B; padding-bottom: 6px; margin-bottom: 12px; }
          .hdr b { font-size: 20px; color: #063A6B; }
          .hdr small { display: block; font-size: 9px; color: #17B4C4; font-weight: bold; }
          h1 { font-size: 16px; text-align: center; margin: 4px 0 2px; color: #063A6B; }
          h2 { font-size: 12px; text-align: center; margin: 0 0 8px; color: #5B6D77; font-weight: normal; }
          p.lead { font-size: 11px; background: #F8F9FA; padding: 8px 12px; border-left: 3px solid #17B4C4; margin: 10px 0; }
          h3 { font-size: 12.5px; margin: 16px 0 6px; color: #063A6B; border-bottom: 1px solid #E3DCCB; padding-bottom: 2px; }
          .row { margin: 6px 0; display: flex; }
          .row b { min-width: 230px; color: #1E293B; }
          .q { margin: 10px 0 2px; font-weight: bold; color: #063A6B; }
          .a { border-bottom: 1px dotted #888; padding-bottom: 2px; margin-bottom: 4px; color: #333; }
          .foot { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; }
          @media print { .noprint { display: none; } }
        </style>
      </head>
      <body>
        <div class="hdr">
          <div><b>Diaconía FRIF-IFD</b><small>PROGRAMA DE BECAS UNIVERSITARIAS BUMAND</small></div>
          <div style="text-align:right; font-family:monospace; font-size:11px;">Código: F-03<br>Fecha: ${fecha_actual}</div>
        </div>
        <h1>F-03 · FORMULARIO DE EVALUACIÓN DEL BECARIO</h1>
        <h2>Programa de Becas · Escuela de Líderes BUMAN-D — a llenar por el Pastor</h2>
        <p class="lead">Se sugiere al Pastor y Líderes principales evaluar el aporte a su Iglesia del Programa BUMAN-D a través del líder que es parte del programa. Las respuestas comprometen el testimonio e integridad de toda la iglesia.</p>

        <h3>I. Datos del pastor y de la iglesia local</h3>
        <div class="row"><b>Nombre del pastor:</b> <span>${pastor_nombre}</span></div>
        <div class="row"><b>Correo electrónico:</b> <span>${pastor_correo}</span></div>
        <div class="row"><b>N.º celular:</b> <span>${pastor_celular}</span></div>
        <div class="row"><b>Nombre de la iglesia:</b> <span>${iglesia_nombre}</span></div>
        <div class="row"><b>Dirección de la iglesia:</b> <span>${iglesia_direccion}</span></div>
        <div class="row"><b>Líder de la congregación:</b> <span>${lider_nombre} (${lider_cargo})</span></div>

        <h3>II. Referencias acerca del becario universitario</h3>
        <div class="row"><b>1. Nombre del becario:</b> <span>${becario_nombre}</span></div>
        <div class="row"><b>2. Frecuencia de asistencia:</b> <span>${frecuencia_asistencia}</span></div>
        <div class="row"><b>3. Compromiso con el Señor y la Iglesia:</b> <span>${demuestra_compromiso}</span></div>
        <div class="row"><b>4. Cargo actual:</b> <span>${ocupa_cargo} — ${cargo_actual}</span></div>
        <div class="row"><b>5. Cumplimiento con sus cargos:</b> <span>${cumplimiento_cargos}</span></div>

        <div class="q">6. ¿Demuestra convicción al llamado de Dios?</div><div class="a">${pregunta_conviccion}</div>
        <div class="q">7. ¿En qué áreas demuestra ejemplo en la congregación?</div><div class="a">${pregunta_ejemplo}</div>
        <div class="q">8. ¿Demuestra compromiso con las capacitaciones?</div><div class="a">${pregunta_capacitaciones}</div>
        <div class="q">9. ¿Cómo es su testimonio como cristiano?</div><div class="a">${pregunta_testimonio}</div>
        <div class="q">10. ¿Cómo se relaciona con los demás miembros?</div><div class="a">${pregunta_relacion}</div>
        <div class="q">11. ¿Se encuentra desarrollando a nuevos líderes?</div><div class="a">${pregunta_nuevos_lideres}</div>
        <div class="q">12. Fortalezas y Debilidades:</div><div class="a">Fortalezas: ${pregunta_fortalezas} | Debilidades: ${pregunta_debilidades}</div>
        <div class="q">13. Opinión general:</div><div class="a">${pregunta_opinion}</div>

        <h3>III. Declaración</h3>
        <p>Como pastor de la congregación del/la becario, declaro que todos los datos proporcionados son verídicos.</p>
        <div class="foot">
          <div class="row"><b>Pastor declarante:</b> <span>${declara_nombre}</span></div>
          <div class="row"><b>C.I.:</b> <span>${declara_ci}</span></div>
          <div class="row"><b>Verificación digital:</b> <span>${pastor_correo}</span></div>
          <div class="row" style="margin-top:15px;"><b>El Alto / La Paz, ${fecha_actual}</b></div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank");
    if (ventana) {
      ventana.document.open();
      ventana.document.write(html_pdf);
      ventana.document.close();
      toast.success("Documento F-03 generado para exportación a PDF");
      if (alEnviarExito) alEnviarExito();
    } else {
      toast.warning("Habilite las ventanas emergentes para descargar el PDF.");
    }
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <CardHeader className="border-b border-[#E3DCCB] p-5 pb-4 shrink-0 bg-[#F8F9FA]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display font-bold text-base text-[#063A6B]">
              Formulario F-03 · Evaluación Ministerial del Becario
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Escuela de Líderes BUMAN-D — a llenar por el Pastor de la iglesia local.
            </CardDescription>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#17B4C4]/15 text-[#0E7A85] font-bold">
            Módulo 01
          </span>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto p-5 flex-1 space-y-6">
        {/* SECCIÓN I */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E3DCCB]">
            <UserCheck className="w-4 h-4 text-[#063A6B]" />
            <h4 className="font-display text-xs font-bold text-[#063A6B] uppercase">
              I. Datos del pastor y de la iglesia local
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <Label className="text-xs">Nombre del pastor *</Label>
              <Input
                value={pastor_nombre}
                onChange={(e) => set_pastor_nombre(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Correo del pastor *</Label>
              <Input
                type="email"
                value={pastor_correo}
                onChange={(e) => set_pastor_correo(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">N.º celular del pastor</Label>
              <Input
                value={pastor_celular}
                onChange={(e) => set_pastor_celular(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Nombre de la iglesia</Label>
              <Input
                value={iglesia_nombre}
                onChange={(e) => set_iglesia_nombre(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Dirección de la iglesia</Label>
              <Input
                value={iglesia_direccion}
                onChange={(e) => set_iglesia_direccion(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN II */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E3DCCB]">
            <FileText className="w-4 h-4 text-[#17B4C4]" />
            <h4 className="font-display text-xs font-bold text-[#063A6B] uppercase">
              II. Referencias acerca del becario universitario
            </h4>
          </div>

          <div>
            <Label className="text-xs">1. Nombre del becario</Label>
            <Input
              value={becario_nombre}
              onChange={(e) => set_becario_nombre(e.target.value)}
              className="h-8 text-xs border-[#E3DCCB] mt-1 font-semibold text-[#063A6B]"
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
                      ? "bg-[#17B4C4]/15 border-[#17B4C4] text-[#0E7A85] font-bold"
                      : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
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
                      ? "bg-[#063A6B] border-[#063A6B] text-white font-bold"
                      : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
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
                      ? "bg-[#063A6B] border-[#063A6B] text-white font-bold"
                      : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
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
                className="h-8 text-xs border-[#E3DCCB] mt-2"
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
                      ? "bg-[#17B4C4]/15 border-[#17B4C4] text-[#0E7A85] font-bold"
                      : "border-[#E3DCCB] bg-white text-slate-700 hover:bg-slate-50"
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
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">7. Áreas de ejemplo en la congregación</Label>
            <Textarea
              rows={2}
              value={pregunta_ejemplo}
              onChange={(e) => set_pregunta_ejemplo(e.target.value)}
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">8. Compromiso con capacitaciones</Label>
            <Textarea
              rows={2}
              value={pregunta_capacitaciones}
              onChange={(e) => set_pregunta_capacitaciones(e.target.value)}
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">9. Testimonio cristiano</Label>
            <Textarea
              rows={2}
              value={pregunta_testimonio}
              onChange={(e) => set_pregunta_testimonio(e.target.value)}
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">10. Relación con los demás miembros</Label>
            <Textarea
              rows={2}
              value={pregunta_relacion}
              onChange={(e) => set_pregunta_relacion(e.target.value)}
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">11. Desarrollo de nuevos líderes</Label>
            <Textarea
              rows={2}
              value={pregunta_nuevos_lideres}
              onChange={(e) => set_pregunta_nuevos_lideres(e.target.value)}
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">12. a) Fortalezas</Label>
              <Textarea
                rows={2}
                value={pregunta_fortalezas}
                onChange={(e) => set_pregunta_fortalezas(e.target.value)}
                className="text-xs border-[#E3DCCB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">12. b) Debilidades</Label>
              <Textarea
                rows={2}
                value={pregunta_debilidades}
                onChange={(e) => set_pregunta_debilidades(e.target.value)}
                className="text-xs border-[#E3DCCB] mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">13. Opinión general acerca del becario</Label>
            <Textarea
              rows={2}
              value={pregunta_opinion}
              onChange={(e) => set_pregunta_opinion(e.target.value)}
              className="text-xs border-[#E3DCCB] mt-1"
            />
          </div>
        </div>

        {/* SECCIÓN III */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E3DCCB]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-display text-xs font-bold text-[#063A6B] uppercase">
              III. Declaración
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nombre del pastor (declaración)</Label>
              <Input
                value={declara_nombre}
                onChange={(e) => set_declara_nombre(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">C.I. del pastor</Label>
              <Input
                value={declara_ci}
                onChange={(e) => set_declara_ci(e.target.value)}
                className="h-8 text-xs border-[#E3DCCB] mt-1"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg border border-[#E3DCCB] bg-slate-50 text-xs">
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

      <div className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] shrink-0 flex justify-end">
        <Button
          type="button"
          onClick={exportarPdfF03}
          className="bg-[#F8C766] hover:bg-[#F5A623] text-[#3A2400] font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" />
          Exportar PDF (F-03 firmado)
        </Button>
      </div>
    </Card>
  );
}
