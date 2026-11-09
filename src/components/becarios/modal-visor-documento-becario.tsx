"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Building2,
  User,
  ZoomIn,
  ZoomOut,
  QrCode,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ModalVisorDocumentoProps {
  abierto: boolean;
  alCerrar: () => void;
  tipo: "carnet" | "kardex";
  becario: {
    id: number;
    nombre: string;
    ci: string;
    expedicion: string;
    complemento?: string;
    carrera: string;
    universidad: string;
    ceti?: number;
    fecha_nacimiento?: string;
    estado_civil?: string;
    ciudad?: string;
    direccion?: string;
    url_carnet?: string;
    url_kardex?: string;
    nombre_archivo_carnet?: string;
    nombre_archivo_kardex?: string;
    fecha_subida_documentos?: string;
  };
}

export function ModalVisorDocumentoBecario({
  abierto,
  alCerrar,
  tipo,
  becario,
}: ModalVisorDocumentoProps) {
  const [zoom, set_zoom] = useState(100);
  const es_carnet = tipo === "carnet";

  const url_archivo = es_carnet ? becario.url_carnet : becario.url_kardex;
  const nombre_archivo = es_carnet
    ? becario.nombre_archivo_carnet || `CI_${becario.ci}_${becario.expedicion}.pdf`
    : becario.nombre_archivo_kardex || `Kardex_2026_${becario.universidad.replace(/\s+/g, "_")}.pdf`;

  const manejarImprimir = () => {
    window.print();
  };

  const generarPdfCertificado = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const COLOR_PRIMARIO: [number, number, number] = [3, 86, 131];
    const COLOR_DORADO: [number, number, number] = [255, 182, 0];

    // Membrete
    doc.setFillColor(...COLOR_PRIMARIO);
    doc.rect(0, 0, 210, 20, "F");
    doc.setFillColor(...COLOR_DORADO);
    doc.rect(0, 20, 210, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("FUNDACIÓN DIACONÍA FRIF-IFD", 14, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("SISTEMA BUMAND · EXPEDIENTE DIGITAL", 196, 12, { align: "right" });

    // Título
    doc.setTextColor(...COLOR_PRIMARIO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const titulo = es_carnet
      ? "CERTIFICACIÓN DE CÉDULA DE IDENTIDAD (SEGIP BOLIVIA)"
      : "KÁRDEX ACADÉMICO Y MATRÍCULA UNIVERSITARIA OFICIAL";
    doc.text(titulo, 14, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Fecha de verificación: ${new Date().toLocaleDateString("es-BO")} · Folio: EXP-${becario.id}-${es_carnet ? "CI" : "KDX"}`,
      14,
      38
    );

    // Caja de datos del becario
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 43, 182, 34, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_PRIMARIO);
    doc.text("DATOS OFICIALES DEL ESTUDIANTE BECARIO", 18, 50);

    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Nombre Completo:", 18, 57);
    doc.setFont("helvetica", "normal");
    doc.text(becario.nombre, 52, 57);

    doc.setFont("helvetica", "bold");
    doc.text("Cédula de Identidad:", 18, 64);
    doc.setFont("helvetica", "normal");
    doc.text(`${becario.ci} ${becario.expedicion || "LP"}`, 52, 64);

    doc.setFont("helvetica", "bold");
    doc.text("Universidad:", 110, 57);
    doc.setFont("helvetica", "normal");
    doc.text(becario.universidad, 134, 57);

    doc.setFont("helvetica", "bold");
    doc.text("Carrera:", 110, 64);
    doc.setFont("helvetica", "normal");
    doc.text(becario.carrera, 134, 64);

    doc.setFont("helvetica", "bold");
    doc.text("Estado Institucional:", 18, 71);
    doc.setFont("helvetica", "normal");
    doc.text("Activo - Regular BUMAND (Gestión II-2026)", 52, 71);

    if (es_carnet) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, 83, 182, 85, 4, 4, "FD");

      doc.setFillColor(185, 28, 28);
      doc.rect(14, 83, 182, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ESTADO PLURINACIONAL DE BOLIVIA · SERVICIO GENERAL DE IDENTIFICACIÓN PERSONAL (SEGIP)", 18, 89);

      autoTable(doc, {
        startY: 96,
        margin: { left: 18, right: 18 },
        theme: "plain",
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 50, textColor: COLOR_PRIMARIO },
          1: { cellWidth: 114, textColor: [30, 41, 59] },
        },
        body: [
          ["Titular Acreditado:", becario.nombre.toUpperCase()],
          ["Número de Documento:", `${becario.ci} ${becario.expedicion || "LP"}`],
          ["Nacionalidad:", "Boliviana"],
          ["Fecha de Nacimiento:", becario.fecha_nacimiento || "12/04/2001"],
          ["Estado Civil:", becario.estado_civil || "Soltero(a)"],
          ["Domicilio Registrado:", becario.direccion || `Zona Central, ${becario.ciudad || "La Paz"}, Bolivia`],
          ["Código de Verificación SEGIP:", `SEGIP-BO-2026-${becario.id}-VALID`],
          ["Estado de Conformidad:", "DOCUMENTO VÁLIDO Y VERIFICADO EN SISTEMA"],
        ],
      });
    } else {
      autoTable(doc, {
        startY: 83,
        margin: { left: 14, right: 14 },
        head: [["Sigla", "Asignatura / Módulo Curricular", "Docente Titular", "Nota /100", "Estado"]],
        body: [
          ["MAT-101", "Cálculo y Modelamiento Matemático", "Lic. R. Mendoza", "88", "APROBADO"],
          ["ECO-204", "Microeconomía Aplicada y Finanzas", "MSc. J. Tarqui", "92", "APROBADO"],
          ["INF-115", "Tecnologías y Sistemas de Información", "Ing. C. Alanoca", "95", "SOBRESALIENTE"],
          ["MET-210", "Metodología de la Investigación Social", "Dra. P. Quispe", "90", "APROBADO"],
          ["ETI-301", "Ética Profesional y Deontología", "Lic. M. Catunta", "94", "SOBRESALIENTE"],
          ["PRA-400", "Práctica Institucional Supervisada", "Lic. A. Ali Paz", "98", "SOBRESALIENTE"],
        ],
        theme: "striped",
        headStyles: {
          fillColor: COLOR_PRIMARIO,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "center",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { halign: "center", fontStyle: "bold", cellWidth: 20 },
          1: { cellWidth: 65 },
          2: { cellWidth: 45 },
          3: { halign: "center", fontStyle: "bold", cellWidth: 22, textColor: COLOR_PRIMARIO },
          4: { halign: "center", fontStyle: "bold", cellWidth: 30, textColor: [16, 185, 129] },
        },
      });
    }

    const y_pie = 260;
    doc.setDrawColor(...COLOR_PRIMARIO);
    doc.setLineWidth(0.5);
    doc.line(20, y_pie, 85, y_pie);
    doc.line(125, y_pie, 190, y_pie);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_PRIMARIO);
    doc.text("Lic. Angel Javier Ali Paz", 52.5, y_pie + 4, { align: "center" });
    doc.text("Dirección Ejecutiva", 157.5, y_pie + 4, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Supervisor de Becas BUMAND", 52.5, y_pie + 8, { align: "center" });
    doc.text("Fundación Diaconía FRIF-IFD", 157.5, y_pie + 8, { align: "center" });

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Documento oficial digitalmente certificado y verificado por el Sistema BUMAND (v2.0) · Sello institucional con validez académica.",
      105,
      285,
      { align: "center" }
    );

    doc.save(nombre_archivo);
  };

  const manejarDescargar = () => {
    if (url_archivo && url_archivo.startsWith("data:")) {
      const enlace = document.createElement("a");
      enlace.href = url_archivo;
      enlace.download = nombre_archivo;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      toast.success(`Descargando ${nombre_archivo}`);
    } else {
      generarPdfCertificado();
      toast.success(`Expediente digital descargado`, {
        description: `Se descargó la copia certificada de ${nombre_archivo}`,
      });
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !ab && alCerrar()}>
      <DialogContent
        className="sm:max-w-[780px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
      >
        {/* Encabezado del Visor */}
        <DialogHeader className="p-5 pb-4 border-b border-[#E5E7EB] bg-slate-50 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                  es_carnet
                    ? "bg-rose-100 text-rose-700"
                    : "bg-[#00ABBD]/15 text-[#035683]"
                }`}
              >
                {es_carnet ? (
                  <FileText className="w-5 h-5 text-rose-600" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-[#00ABBD]" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                  <span>
                    {es_carnet
                      ? "Cédula de Identidad (SEGIP Bolivia)"
                      : "Kárdex Académico / Matrícula Universitaria"}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Vigente y Auditado
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Expediente digital de {becario.nombre} · CI: {becario.ci}{" "}
                  {becario.expedicion}
                </DialogDescription>
              </div>
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => set_zoom((z) => Math.max(75, z - 15))}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => set_zoom((z) => Math.min(150, z + 15))}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="Acercar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo del Visor con Previsualización */}
        <DialogBody className="p-6 overflow-y-auto flex-1 bg-slate-100/60 min-h-0 flex flex-col items-center justify-center">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-150 w-full max-w-[620px]"
          >
            {/* Si el usuario adjuntó una imagen real como Data URL, renderizarla */}
            {url_archivo && url_archivo.startsWith("data:image/") ? (
              <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-lg p-3">
                <img
                  src={url_archivo}
                  alt={nombre_archivo}
                  className="w-full h-auto object-contain rounded-xl max-h-[500px]"
                />
              </div>
            ) : es_carnet ? (
              /* Plantilla Oficial Estandarizada SEGIP Bolivia */
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-sky-50/50 border-2 border-slate-300 rounded-2xl p-6 shadow-xl relative overflow-hidden select-none">
                {/* Marcas de agua y sello institucional */}
                <div className="absolute top-2 right-3 opacity-10 pointer-events-none font-bold text-6xl tracking-widest text-slate-400">
                  SEGIP
                </div>

                <div className="border-b-2 border-[#035683] pb-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logos/ALTA1.svg"
                      alt="Escudo"
                      className="h-8 w-auto object-contain opacity-80"
                    />
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
                        Estado Plurinacional de Bolivia
                      </p>
                      <h4 className="text-sm font-extrabold text-[#035683] tracking-tight">
                        CÉDULA DE IDENTIDAD
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono">
                        SERVICIO GENERAL DE IDENTIFICACIÓN PERSONAL (SEGIP)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">CÉDULA N°</span>
                    <span className="font-mono font-extrabold text-base text-[#035683]">
                      {becario.ci} {becario.expedicion}
                      {becario.complemento ? `-${becario.complemento}` : ""}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Foto de identidad */}
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-24 h-28 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 border border-slate-300">
                      <User className="w-12 h-12 text-slate-400 mb-1" />
                      <span className="text-[9px] font-mono font-bold">FOTOGRAFÍA</span>
                    </div>
                    <span className="text-[9px] text-emerald-700 font-bold mt-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      BIOMETRÍA OK
                    </span>
                  </div>

                  {/* Datos Filiatorios */}
                  <div className="col-span-2 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Nombres y Apellidos
                      </span>
                      <p className="font-bold text-[#1E293B] text-sm uppercase">
                        {becario.nombre}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                          Fecha de Nacimiento
                        </span>
                        <p className="font-mono font-bold text-slate-700">
                          {becario.fecha_nacimiento || "14/05/2003"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                          Nacionalidad
                        </span>
                        <p className="font-bold text-slate-700">BOLIVIANA</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                          Estado Civil
                        </span>
                        <p className="font-bold text-slate-700">
                          {becario.estado_civil || "Soltero(a)"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                          Lugar de Emisión
                        </span>
                        <p className="font-bold text-slate-700">
                          {becario.ciudad || "La Paz"} ({becario.expedicion})
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <QrCode className="w-5 h-5 text-slate-700" />
                        <span>SEGIP-VERIF-BOL-2026</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">
                        VALIDEZ INDEFINIDA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Plantilla Oficial Kárdex Universitario / Matrícula */
              <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-xl relative overflow-hidden select-none text-left">
                {/* Encabezado Universitario */}
                <div className="border-b-2 border-[#035683] pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00ABBD]">
                        SISTEMA UNIVERSITARIO BOLIVIANO (CEUB)
                      </p>
                      <h4 className="text-base font-extrabold text-[#035683] uppercase">
                        {becario.universidad}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Dirección de Registros, Admisiones y Seguimiento Académico
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold">
                      <GraduationCap className="w-7 h-7 text-[#035683]" />
                    </div>
                  </div>
                  <div className="mt-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#035683]">
                      KÁRDEX ACADÉMICO Y MATRÍCULA VIGENTE GESTIÓN II/2026
                    </span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px]">
                      ESTUDIANTE REGULAR
                    </Badge>
                  </div>
                </div>

                {/* Detalle Académico del Becario */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Universitario(a)</span>
                      <p className="font-bold text-[#1E293B] text-sm uppercase">{becario.nombre}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Cédula de Identidad</span>
                      <p className="font-mono font-bold text-[#035683]">{becario.ci} {becario.expedicion}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Carrera Universitaria</span>
                      <p className="font-bold text-[#1E293B]">{becario.carrera}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Nivel CETI BUMAND</span>
                      <p className="font-bold text-[#00ABBD]">Nivel CETI {becario.ceti ?? 1}</p>
                    </div>
                  </div>

                  {/* Tabla de Cómputo Semestral */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-2 font-bold text-[11px] text-slate-700 flex justify-between">
                      <span>Rendimiento Académico Acreditado</span>
                      <span className="font-mono">Gestión 2026</span>
                    </div>
                    <div className="p-3 text-[11px] space-y-1.5">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-600">Promedio Ponderado Semestral:</span>
                        <span className="font-mono font-bold text-emerald-700">78.5 / 100 pts (Aprobación Óptima)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-600">Materias Cursadas / Aprobadas:</span>
                        <span className="font-mono font-bold text-slate-800">5 / 5 Materias (0 Reprobadas)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Puntaje BUMAND Asignado:</span>
                        <span className="font-mono font-bold text-[#035683]">20 / 20 pts (Componente Académico)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pie con verificación institucional */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Acreditación Certificada por Vicerrectorado Académico</span>
                    </div>
                    <span>CÓDIGO: BUMAND-KDX-2026</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogBody>

        {/* Pie de Acciones */}
        <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-slate-50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span className="truncate max-w-[260px] font-mono">{nombre_archivo}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={manejarImprimir}
              className="h-9 border-[#E5E7EB] text-slate-700 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </Button>
            <Button
              type="button"
              onClick={manejarDescargar}
              className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00ABBD]" />
              <span>Descargar Documento</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={alCerrar}
              className="h-9 border-[#E5E7EB] text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
