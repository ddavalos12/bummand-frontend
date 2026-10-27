"use client";

import React from "react";
import { Toaster as ToasterPrimitivo, toast } from "sonner";

type PropiedadesToaster = React.ComponentProps<typeof ToasterPrimitivo>;

export function Toaster({ ...propiedades }: PropiedadesToaster) {
  return (
    <ToasterPrimitivo
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#122029] group-[.toaster]:border-[#E5E7EB] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-body text-sm",
          description: "group-[.toast]:text-[#5B6D77] font-body text-xs",
          actionButton:
            "group-[.toast]:bg-[#035683] group-[.toast]:text-white font-semibold text-xs rounded-lg px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium text-xs rounded-lg px-3 py-1.5",
          success:
            "group-[.toaster]:!border-[#00ABBD]/50 group-[.toaster]:!bg-[#F0FBFC] group-[.toaster]:!text-[#035683]",
          error:
            "group-[.toaster]:!border-[#E2694B]/50 group-[.toaster]:!bg-[#FDF4F2] group-[.toaster]:!text-[#9E2A0E]",
          info:
            "group-[.toaster]:!border-[#035683]/30 group-[.toaster]:!bg-[#F4F7FB] group-[.toaster]:!text-[#035683]",
          warning:
            "group-[.toaster]:!border-[#FFB600] group-[.toaster]:!bg-[#FEFBF2] group-[.toaster]:!text-[#855D00]",
        },
      }}
      {...propiedades}
    />
  );
}

export { toast };
