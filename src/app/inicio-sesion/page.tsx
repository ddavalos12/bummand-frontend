"use client";

import { useState } from "react";
import { usarAutenticacion, Usuario } from "@/contextos/autenticacion-contexto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, GraduationCap } from "lucide-react";

export default function PaginaInicioSesion() {
  const [correo, set_correo] = useState("");
  const [contrasena, set_contrasena] = useState("");
  const [cargando, set_cargando] = useState(false);
  const [error_form, set_error_form] = useState("");
  const { iniciarSesion } = usarAutenticacion();
  const enrutador = useRouter();

  const manejarInicioSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    set_cargando(true);
    set_error_form("");

    try {
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      let token_acceso: string | null = null;
      let usuario_autenticado: Usuario | null = null;

      try {
        const respuesta = await fetch(`${url_base}/autenticacion/inicio-sesion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: correo.trim(), contrasena }),
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          token_acceso = datos.token || datos.access_token;
          usuario_autenticado = datos.usuario || datos.user;
        } else if (respuesta.status === 401) {
          throw new Error("Credenciales inválidas o cuenta institucional deshabilitada.");
        }
      } catch (error_api: any) {
        if (error_api.message?.includes("Credenciales inválidas")) {
          throw error_api;
        }
        // Servidor no disponible, verificación con cuentas institucionales semilla
      }

      if (!usuario_autenticado) {
        const cuentas_semilla: Record<string, { pass: string; user: Usuario }> = {
          "admin@wscrt.com": {
            pass: "admin",
            user: {
              id: 1,
              nombre: "Administrador General",
              correo: "admin@wscrt.com",
              rol: "administrador",
            },
          },
          "angel.ali@bumand.bo": {
            pass: "Bumand2026!",
            user: {
              id: 2,
              nombre: "Angel Javier Ali Paz",
              correo: "angel.ali@bumand.bo",
              rol: "supervisor",
            },
          },
          "nilda.churata@bumand.bo": {
            pass: "Bumand2026!",
            user: {
              id: 3,
              nombre: "Nilda Churata Paye",
              correo: "nilda.churata@bumand.bo",
              rol: "becario",
              becario_id: 1,
            },
          },
          "edgar.alarcon@bumand.bo": {
            pass: "Bumand2026!",
            user: {
              id: 4,
              nombre: "Edgar Alarcón",
              correo: "edgar.alarcon@bumand.bo",
              rol: "becario",
              becario_id: 2,
            },
          },
          "adai.huayta@bumand.bo": {
            pass: "Bumand2026!",
            user: {
              id: 5,
              nombre: "Adai Huayta",
              correo: "adai.huayta@bumand.bo",
              rol: "becario",
              becario_id: 3,
            },
          },
        };

        const cuenta = cuentas_semilla[correo.toLowerCase().trim()];
        if (cuenta && cuenta.pass === contrasena) {
          token_acceso = "jwt_bumand_auth_" + cuenta.user.rol + "_" + Date.now();
          usuario_autenticado = cuenta.user;
        } else {
          throw new Error("Credenciales inválidas. Verifique su correo y contraseña corporativa.");
        }
      }

      if (token_acceso && usuario_autenticado) {
        iniciarSesion(token_acceso, usuario_autenticado);
        enrutador.push("/");
      }
    } catch (error_catch: any) {
      set_error_form(error_catch.message || "Error al iniciar sesión");
    } finally {
      set_cargando(false);
    }
  };

  const seleccionarUsuarioPrueba = (correo_demo: string, contrasena_demo: string) => {
    set_correo(correo_demo);
    set_contrasena(contrasena_demo);
    set_error_form("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <Card className="w-full max-w-md border-[#E3DCCB] shadow-lg bg-white rounded-2xl">
        <CardHeader className="text-center space-y-3 pb-6 border-b border-[#E3DCCB]/70">
          <div className="flex flex-col items-center justify-center gap-2 mb-1">
            {/* Logo BUMAND Oficial SVG */}
            <img
              src="/logos/logo-bumand.svg"
              alt="Logo BUMAND Oficial"
              className="h-16 w-auto object-contain"
            />
            {/* Logo Diaconía IFD Oficial SVG */}
            <img
              src="/logos/logo-diaconia.svg"
              alt="Logo Diaconía FRIF-IFD"
              className="h-7 w-auto object-contain opacity-90"
            />
          </div>
          <CardTitle className="font-display text-xl text-[#063A6B]">Plataforma Institucional</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Ingreso corporativo y control de acceso basado en roles institucionales (RBAC).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={manejarInicioSesion} className="space-y-4">
            {error_form && (
              <div className="p-3 rounded-xl bg-[#E2694B]/10 text-[#E2694B] text-xs font-semibold border border-[#E2694B]/30 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error_form}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="correo" className="text-xs font-bold text-[#063A6B]">
                Correo electrónico institucional
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder="usuario@bumand.bo"
                value={correo}
                onChange={(e) => set_correo(e.target.value)}
                required
                className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4] rounded-xl text-xs"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="contrasena" className="text-xs font-bold text-[#063A6B]">
                Contraseña institucional
              </Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => set_contrasena(e.target.value)}
                required
                className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4] rounded-xl text-xs"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs mt-2 transition-all shadow-sm"
              disabled={cargando}
            >
              {cargando ? "Verificando credenciales..." : "Acceder al Sistema"}
            </Button>
          </form>

          {/* Accesos rápidos con credenciales de prueba predefinidas */}
          <div className="mt-6 pt-5 border-t border-[#E3DCCB]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5B6D77] uppercase tracking-wider">
                Credenciales de Prueba RBAC
              </span>
              <Badge variant="outline" className="text-[10px] border-[#17B4C4] text-[#063A6B] font-mono">
                Semilla Diaconía
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => seleccionarUsuarioPrueba("admin@wscrt.com", "admin")}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F6F2E9]/40 hover:bg-[#F6F2E9] text-left transition-colors text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#063A6B]/10 flex items-center justify-center text-[#063A6B]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#063A6B]">Administrador General</p>
                    <p className="text-[#5B6D77] font-mono text-[11px]">admin@wscrt.com</p>
                  </div>
                </div>
                <span className="text-[#17B4C4] font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">Cargar →</span>
              </button>

              <button
                type="button"
                onClick={() => seleccionarUsuarioPrueba("angel.ali@bumand.bo", "Bumand2026!")}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F6F2E9]/40 hover:bg-[#F6F2E9] text-left transition-colors text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#17B4C4]/15 flex items-center justify-center text-[#063A6B]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#063A6B]">Supervisor (Angel Ali Paz)</p>
                    <p className="text-[#5B6D77] font-mono text-[11px]">angel.ali@bumand.bo</p>
                  </div>
                </div>
                <span className="text-[#17B4C4] font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">Cargar →</span>
              </button>

              <button
                type="button"
                onClick={() => seleccionarUsuarioPrueba("nilda.churata@bumand.bo", "Bumand2026!")}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F6F2E9]/40 hover:bg-[#F6F2E9] text-left transition-colors text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#063A6B]">Becaria (Nilda Churata Paye)</p>
                    <p className="text-[#5B6D77] font-mono text-[11px]">nilda.churata@bumand.bo</p>
                  </div>
                </div>
                <span className="text-[#17B4C4] font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform">Cargar →</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
