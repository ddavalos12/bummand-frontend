"use client";

import { ProveedorAutenticacion } from "@/contextos/autenticacion-contexto";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorAutenticacion>
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </ProveedorAutenticacion>
  );
}
