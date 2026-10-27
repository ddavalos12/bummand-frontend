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
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  GraduationCap,
  ShieldCheck,
  Building2,
  FileCheck,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { ModalVisorDocumentoBecario } from "./modal-visor-documento-becario";

export interface DialogoDocumentosBecarioProps {
  abierto: boolean;
  alCerrar: () => void;
  becario: {
    id: number;
    nombre: string;
    ci: string;
    expedicion: string;
    carrera: string;
    universidad: string;
    ceti?: number;
    url_carnet?: string;
    url_kardex?: string;
    nombre_archivo_carnet?: string;
    nombre_archivo_kardex?: string;
  };
  alActualizarDocumentos?: (docs: {
    url_carnet?: string;
    nombre_archivo_carnet?: string;
    url_kardex?: string;
    nombre_archivo_kardex?: string;
  }) => void;
}

export function DialogoDocumentosBecario({
  abierto,
  alCerrar,
  becario,
  alActualizarDocumentos,
}: DialogoDocumentosBecarioProps) {
  const [carnet_url, set_carnet_url] = useState<string>(becario.url_carnet || "");
  const [carnet_nombre, set_carnet_nombre] = useState<string>(
    becario.nombre_archivo_carnet || (becario.url_carnet ? `CI_${becario.ci}_${becario.expedicion}.pdf` : "")
  );

  const [kardex_url, set_kardex_url] = useState<string>(becario.url_kardex || "");
  const [kardex_nombre, set_kardex_nombre] = useState<string>(
    becario.nombre_archivo_kardex || (becario.url_kardex ? `Kardex_2026_${becario.universidad}.pdf` : "")
  );

  const [visor_abierto, set_visor_abierto] = useState(false);
  const [tipo_visor, set_tipo_visor] = useState<"carnet" | "kardex">("carnet");
  const [guardando, set_guardando] = useState(false);

  const manejarSubirArchivo = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "carnet" | "kardex"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "El documento debe ser menor a 15 MB.",
      });
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      const dataUrl = lector.result as string;
      if (tipo === "carnet") {
        set_carnet_url(dataUrl);
        set_carnet_nombre(file.name);
        toast.success("Cédula de Identidad cargada", {
          description: file.name,
        });
      } else {
        set_kardex_url(dataUrl);
        set_kardex_nombre(file.name);
        toast.success("Kárdex académico cargado", {
          description: file.name,
        });
      }
    };
    lector.readAsDataURL(file);
  };

  const abrirVisor = (tipo: "carnet" | "kardex") => {
    set_tipo_visor(tipo);
    set_visor_abierto(true);
  };

  const manejarGuardar = () => {
    set_guardando(true);
    setTimeout(() => {
      alActualizarDocumentos?.({
        url_carnet: carnet_url || undefined,
        nombre_archivo_carnet: carnet_nombre || undefined,
        url_kardex: kardex_url || undefined,
        nombre_archivo_kardex: kardex_nombre || undefined,
      });
      set_guardando(false);
      toast.success("Documentos actualizados exitosamente", {
        description: "Tu Cédula de Identidad y Kárdex han sido registrados para revisión administrativa.",
      });
      alCerrar();
    }, 400);
  };

  return (
    <>
      <Dialog open={abierto} onOpenChange={(ab) => !ab && alCerrar()}>
        <DialogContent
          className="sm:max-w-[650px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
        >
          {/* Encabezado */}
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#035683] text-[#00ABBD] flex items-center justify-center font-bold shadow-xs">
                <FileCheck className="w-5 h-5 text-[#00ABBD]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#035683]">
                  Mi Expediente Documental (Carnet y Kárdex)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Sube y mantén actualizada tu documentación oficial requerida por BUMAND y Diaconía.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Cuerpo */}
          <DialogBody className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0 text-left">
            {/* Tarjeta 1: Cédula de Identidad */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">
                      1. Cédula de Identidad (SEGIP Bolivia)
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Anverso y reverso legible · C.I. {becario.ci} {becario.expedicion}
                    </p>
                  </div>
                </div>

                {carnet_nombre || carnet_url ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Cargado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-bold text-[10px]">
                    Pendiente
                  </Badge>
                )}
              </div>

              {/* Acciones para Carnet */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => manejarSubirArchivo(e, "carnet")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-3 text-xs border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#00ABBD]" />
                      <span>{carnet_nombre ? "Cambiar Carnet" : "Subir Carnet"}</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => abrirVisor("carnet")}
                    className="h-8 px-3 text-xs text-[#035683] hover:bg-slate-100 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00ABBD]" />
                    <span>Ver Carnet</span>
                  </Button>
                </div>

                {carnet_nombre && (
                  <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]" title={carnet_nombre}>
                    {carnet_nombre}
                  </span>
                )}
              </div>
            </div>

            {/* Tarjeta 2: Kárdex Académico / Matrícula */}
            <div className="border border-[#E5E7EB] rounded-2xl p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00ABBD]/15 text-[#035683] flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">
                      2. Kárdex Académico / Matrícula Universitaria
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {becario.universidad} · {becario.carrera}
                    </p>
                  </div>
                </div>

                {kardex_nombre || kardex_url ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Cargado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-bold text-[10px]">
                    Pendiente
                  </Badge>
                )}
              </div>

              {/* Acciones para Kardex */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => manejarSubirArchivo(e, "kardex")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-3 text-xs border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#00ABBD]" />
                      <span>{kardex_nombre ? "Cambiar Kárdex" : "Subir Kárdex"}</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => abrirVisor("kardex")}
                    className="h-8 px-3 text-xs text-[#035683] hover:bg-slate-100 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00ABBD]" />
                    <span>Ver Kárdex</span>
                  </Button>
                </div>

                {kardex_nombre && (
                  <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]" title={kardex_nombre}>
                    {kardex_nombre}
                  </span>
                )}
              </div>
            </div>

            {/* Aviso Informativo Institucional */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-[#035683] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tus documentos respaldan tu postulación y permanencia en el programa BUMAND. El Carnet valida tu identidad ante SEGIP y el Kárdex acredita tu rendimiento semestral (ponderación de 20 pts de evaluación).
              </p>
            </div>
          </DialogBody>

          {/* Pie */}
          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-slate-50 shrink-0 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              Archivos aceptados: PDF, JPG, PNG (&lt;15MB)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={alCerrar}
                className="h-9 border-[#E5E7EB] text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={manejarGuardar}
                disabled={guardando}
                className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00ABBD]" />
                <span>{guardando ? "Guardando..." : "Guardar Documentos"}</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visor Modal Integrado */}
      <ModalVisorDocumentoBecario
        abierto={visor_abierto}
        alCerrar={() => set_visor_abierto(false)}
        tipo={tipo_visor}
        becario={{
          ...becario,
          url_carnet: carnet_url,
          url_kardex: kardex_url,
          nombre_archivo_carnet: carnet_nombre,
          nombre_archivo_kardex: kardex_nombre,
        }}
      />
    </>
  );
}
