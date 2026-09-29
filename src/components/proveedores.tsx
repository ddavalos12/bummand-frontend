"use client";

import { ProveedorAutenticacion } from "@/contextos/autenticacion-contexto";

export function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorAutenticacion>
      {children}
    </ProveedorAutenticacion>
  );
}
