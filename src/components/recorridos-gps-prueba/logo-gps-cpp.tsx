import { cn } from "cn";

interface PropiedadesLogoGpsCpp {
  variante?: "insignia" | "icono";
  clase_extra?: string;
}

export function LogoGpsCpp({
  variante = "insignia",
  clase_extra,
}: PropiedadesLogoGpsCpp) {
  const es_icono = variante === "icono";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none",
        es_icono ? "w-7 h-4" : "h-11 w-[108px] shadow-sm rounded-xl overflow-hidden",
        clase_extra
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 216 88"
        fill="none"
        className="w-full h-full"
        aria-label="Logo GPS C++"
      >
        <rect width="216" height="88" rx="18" fill="#1A1A1A" />
        <path
          d="M46 12C30.5 12 18 24.5 18 40C18 56.5 38 71 46 76C54 71 74 56.5 74 40C74 24.5 61.5 12 46 12Z"
          stroke="#00ABBD"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="46" cy="39" r="10.5" stroke="#00ABBD" strokeWidth="6.5" />
        <path
          d="M127 31A17 17 0 1 0 127 55"
          stroke="#FFFFFF"
          strokeWidth="10.5"
          strokeLinecap="round"
        />
        <rect x="142" y="39.5" width="24" height="7" rx="2.5" fill="#FFFFFF" />
        <rect x="150.5" y="31" width="7" height="24" rx="2.5" fill="#FFFFFF" />
        <rect x="176" y="39.5" width="24" height="7" rx="2.5" fill="#FFFFFF" />
        <rect x="184.5" y="31" width="7" height="24" rx="2.5" fill="#FFFFFF" />
      </svg>
    </span>
  );
}
