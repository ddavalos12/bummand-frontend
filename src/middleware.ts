import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(solicitud: NextRequest) {
  const tiene_sesion = solicitud.cookies.get("bumand_sesion")?.value === "1";

  if (!tiene_sesion) {
    const destino_retorno = `${solicitud.nextUrl.pathname}${solicitud.nextUrl.search}`;
    const url_login = new URL("/inicio-sesion", solicitud.url);
    url_login.searchParams.set("redirect", destino_retorno);
    return NextResponse.redirect(url_login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/evaluar-mentor/:path*"],
};
