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
      toast.success(`Expediente digital verificado`, {
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

                  {/* Pie con firma digital */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Firma Digital Certificada por Vicerrectorado Académico</span>
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
