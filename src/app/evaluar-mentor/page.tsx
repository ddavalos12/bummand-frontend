"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { clienteApi } from "@/lib/cliente-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormularioMentorModal,
  EvaluacionInicialMentor,
} from "@/components/evaluaciones/formulario-mentor-modal";
import {
  ShieldAlert,
  UserCheck,
  Loader2,
  LogIn,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

interface DatosQrValidado {
  becario_id: number;
  nombre: string;
  carrera: string;
  universidad: string;
  unidad: string;
  supervisor_nombre: string;
  evaluado: boolean;
  estado: string;
  evaluacion_id: number | null;
  datos_formulario: Record<string, any> | null;
}

function EvaluarMentorContenido() {
  const search_params = useSearchParams();
  const enrutador = useRouter();
  const { usuario, estaAutenticado, cargando: cargando_auth } = usarAutenticacion();

  const becario_id_str = search_params.get("becario_id") || search_params.get("becario");
  const token_qr = search_params.get("token") || "";
  const becario_id = Number(becario_id_str);

  const [cargando_qr, set_cargando_qr] = useState(false);
  const [error_qr, set_error_qr] = useState<string | null>(null);
  const [datos_qr, set_datos_qr] = useState<DatosQrValidado | null>(null);
  const [modal_abierto, set_modal_abierto] = useState(false);
  const [evaluacion_guardada, set_evaluacion_guardada] = useState(false);

  const rol_normalizado = (usuario?.rol || "").toLowerCase().trim();
  const es_mentor_o_admin =
    rol_normalizado === "supervisor" ||
    rol_normalizado === "mentor" ||
    rol_normalizado === "administrador";

  const validarAccesoQr = useCallback(async () => {
    if (!becario_id || isNaN(becario_id)) {
      set_error_qr("Código QR incompleto: falta el identificador del becario.");
      return;
    }

    const token_limpio = token_qr.trim();
    if (!token_limpio) {
      set_error_qr(
        "Código QR inválido o sin firma de seguridad: falta el token de verificación. Solicite un nuevo código QR al becario o a Administración."
      );
      return;
    }

    set_cargando_qr(true);
    set_error_qr(null);
    try {
      const qs = new URLSearchParams({
        becario_id: String(becario_id),
        token: token_limpio,
      });
      const res = await clienteApi.get<DatosQrValidado>(
        `/api/evaluaciones/modulo-3/validar-qr?${qs.toString()}`
      );
      set_datos_qr(res);
      set_modal_abierto(true);
    } catch (err: any) {
      set_error_qr(
        err?.mensaje ||
          err?.message ||
          "No tienes autorización para evaluar a este becario o el código QR es inválido."
      );
    } finally {
      set_cargando_qr(false);
    }
  }, [becario_id, token_qr]);

  useEffect(() => {
    if (!cargando_auth && estaAutenticado && es_mentor_o_admin) {
      validarAccesoQr();
    }
  }, [cargando_auth, estaAutenticado, es_mentor_o_admin, validarAccesoQr]);

  const irALoginConRetorno = () => {
    const query = search_params.toString();
    const destino = `/evaluar-mentor${query ? `?${query}` : ""}`;
    enrutador.push(`/inicio-sesion?redirect=${encodeURIComponent(destino)}`);
  };

  if (cargando_auth || cargando_qr) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#E5E7EB] shadow-lg rounded-2xl">
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#035683]" />
            <p className="text-sm font-semibold text-[#035683]">
              Validando sesión y credenciales de Mentor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!estaAutenticado || !usuario) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#E5E7EB] shadow-xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#035683]/10 text-[#035683] mx-auto flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold text-[#035683]">
              Evaluación del Mentor · Acceso Exclusivo
            </CardTitle>
            <CardDescription className="text-xs">
              Para proteger la confidencialidad de las preguntas y calificaciones, solo los Mentores/Tutores asignados pueden abrir este formulario tras iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={irALoginConRetorno}
              className="w-full h-11 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión como Mentor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!es_mentor_o_admin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-rose-200 shadow-xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold text-rose-800">
              Acceso Restringido
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Has iniciado sesión como <strong>{usuario.nombre}</strong> ({usuario.rol}). Solo el Mentor/Tutor asignado o Administración puede visualizar y completar la Evaluación del Mentor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => enrutador.push("/inicio")}
              className="w-full h-10 rounded-xl gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error_qr) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-amber-200 shadow-xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold text-[#035683]">
              No se pudo abrir la evaluación
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              {error_qr}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => enrutador.push("/inicio")}
              className="flex-1 rounded-xl cursor-pointer"
            >
              Ir al Panel
            </Button>
            <Button
              onClick={validarAccesoQr}
              className="flex-1 bg-[#035683] text-white rounded-xl cursor-pointer"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const df = datos_qr?.datos_formulario;
  const evaluacion_inicial: EvaluacionInicialMentor | undefined = df
    ? {
        mentor_nombre: df.mentor_nombre || df.mentor || usuario.nombre,
        unidad_agencia: df.unidad_agencia || df.agencia || datos_qr?.unidad,
        semestre_gestion: df.semestre_gestion || "Semestre II · 2026",
        fecha: df.fecha,
        calificaciones_1_18: df.calificaciones_1_18,
        respuestas_abiertas: df.respuestas_abiertas,
        puntajes_abiertos: df.puntajes_abiertos,
        identidad_verificada: true,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-[#E5E7EB] shadow-xl rounded-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-[#035683] text-white text-[10px]">
              Módulo 03 · Evaluación del Mentor
            </Badge>
            <Badge
              variant="outline"
              className={
                evaluacion_guardada || datos_qr?.evaluado
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px]"
                  : "border-amber-300 bg-amber-50 text-amber-700 text-[10px]"
              }
            >
              {evaluacion_guardada || datos_qr?.evaluado ? "Evaluado" : "Pendiente"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-[#035683]">
            {datos_qr?.nombre || "Becario"}
          </CardTitle>
          <CardDescription className="text-xs">
            {datos_qr?.carrera} · {datos_qr?.universidad} · {datos_qr?.unidad}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {evaluacion_guardada && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Evaluación registrada correctamente en el sistema BUMAND.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => set_modal_abierto(true)}
              className="flex-1 h-11 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl gap-2 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              {datos_qr?.evaluado || evaluacion_guardada
                ? "Ver / Editar Evaluación"
                : "Abrir Formulario de Evaluación"}
            </Button>
            <Button
              variant="outline"
              onClick={() => enrutador.push("/inicio")}
              className="h-11 rounded-xl cursor-pointer"
            >
              Ir al Panel
            </Button>
          </div>
        </CardContent>
      </Card>

      {datos_qr && (
        <FormularioMentorModal
          abierto={modal_abierto}
          alCambiarAbierto={set_modal_abierto}
          becario_id={datos_qr.becario_id}
          nombre_becario={datos_qr.nombre}
          unidad_agencia_inicial={datos_qr.unidad}
          evaluacion_inicial={evaluacion_inicial}
          token_qr={token_qr.trim()}
          modalidad_llenado="perfil_supervisor"
          alGuardarExito={() => {
            set_evaluacion_guardada(true);
          }}
        />
      )}
    </div>
  );
}

export default function PaginaEvaluarMentor() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#035683]" />
        </div>
      }
    >
      <EvaluarMentorContenido />
    </Suspense>
  );
}
