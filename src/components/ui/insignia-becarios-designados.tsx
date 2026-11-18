"use client";

import { UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InsigniaBecariosDesignadosProps {
  cantidad?: number;
  className?: string;
}

/**
 * Insignia informativa que indica al Mentor autenticado que los listados están
 * filtrados exclusivamente a sus becarios designados.
 */
export function InsigniaBecariosDesignados({
  cantidad,
  className,
}: InsigniaBecariosDesignadosProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "bg-[#00ABBD]/10 text-[#035683] border-[#00ABBD]/40 font-semibold text-[11px] gap-1.5 px-2.5 py-1 rounded-full",
        className
      )}
    >
      <UserCheck className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
      <span>
        Mostrando tus becarios designados
        {typeof cantidad === "number" ? ` (${cantidad})` : ""}
      </span>
    </Badge>
  );
}
