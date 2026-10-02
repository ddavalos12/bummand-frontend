"use client";

import { ProveedorAutenticacion } from "@/contextos/autenticacion-contexto";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorAutenticacion>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ProveedorAutenticacion>
  );
}
