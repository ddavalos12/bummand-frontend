'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { obtenerDetallesError } from '@/lib/errores';

export default function ErrorGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string; codigo_error?: string; detalles?: unknown[] };
  reset: () => void;
}) {
  const router = useRouter();
  const [detalles_visibles, setDetallesVisibles] = useState(false);
  const [copiado_exitoso, setCopiadoExitoso] = useState(false);

  const informacion = obtenerDetallesError(error);

  useEffect(() => {
    console.error('[BUMAND] Excepción interceptada por frontera de error:', error);
  }, [error]);

  const copiarDiagnostico = async () => {
    const cuerpo_diagnostico = JSON.stringify(
      {
        codigo_error: informacion.codigo_error,
        titulo: informacion.titulo,
        descripcion: informacion.descripcion,
        sugerencia: informacion.sugerencia,
        detalles: informacion.detalles,
        digest: error.digest,
        mensaje_original: error.message,
        pila: error.stack,
        marca_tiempo: new Date().toISOString(),
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(cuerpo_diagnostico);
      setCopiadoExitoso(true);
      setTimeout(() => setCopiadoExitoso(false), 2500);
    } catch {
      setCopiadoExitoso(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-lg overflow-hidden transition-all">
        <div className="bg-gradient-to-r from-[#007BBE] via-[#02699e] to-[#035683] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-destructive/20 border border-destructive/40 flex items-center justify-center text-rose-300">
              <AlertTriangle className="size-6 text-rose-400" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#00ABBD]">
                Fundación Diaconía • BUMAND
              </span>
              <h1 className="text-lg md:text-xl font-bold font-display text-white">
                Incidencia en la Aplicación
              </h1>
            </div>
          </div>
          <Badge
            variant="destructive"
            className="px-3 py-1 font-mono text-xs font-bold tracking-wide uppercase border border-rose-400/40"
          >
            {informacion.codigo_error}
          </Badge>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">
              {informacion.titulo}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {informacion.descripcion}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/60 border border-border flex items-start gap-3">
            <HelpCircle className="size-5 text-secondary shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <span className="font-semibold text-foreground">Sugerencia recomendada:</span>
              <p className="text-muted-foreground leading-relaxed">
                {informacion.sugerencia}
              </p>
            </div>
          </div>

          {informacion.detalles.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Detalles específicos reportados:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-foreground bg-muted/30 p-3 rounded-lg border border-border">
                {informacion.detalles.map((detalle, indice) => (
                  <li key={indice} className="leading-relaxed">
                    {detalle}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <RotateCcw className="size-4" />
              Reintentar Operación
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/inicio')}
              className="w-full sm:w-auto border-border text-foreground hover:bg-muted font-medium px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Home className="size-4" />
              Volver al Inicio
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDetallesVisibles(!detalles_visibles)}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground text-xs ml-auto flex items-center justify-center gap-1.5"
            >
              {detalles_visibles ? (
                <>
                  Ocultar auditoría técnica <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  Ver auditoría técnica <ChevronDown className="size-3.5" />
                </>
              )}
            </Button>
          </div>

          {detalles_visibles && (
            <div className="pt-4 border-t border-border space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                  Registro de Diagnóstico para Soporte
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={copiarDiagnostico}
                  className="gap-1 text-xs border-border text-muted-foreground hover:text-foreground"
                >
                  {copiado_exitoso ? (
                    <>
                      <Check className="size-3 text-emerald-600" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> Copiar reporte
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#035683] text-[#F8FAFC] text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-[#007BBE]/40">
                {JSON.stringify(
                  {
                    codigo: informacion.codigo_error,
                    mensaje: error.message,
                    digest: error.digest,
                    detalles: informacion.detalles,
                    pila: error.stack?.split('\n').slice(0, 4).join('\n'),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
