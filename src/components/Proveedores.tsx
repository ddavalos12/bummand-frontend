"use client";

import { ProveedorAutenticacion } from "@/context/AutenticacionContexto";
import { ReactNode } from "react";

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <ProveedorAutenticacion>
      {children}
    </ProveedorAutenticacion>
  );
}
