"use client";

import { useState } from "react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const respuesta = await fetch(`${url_base}/autenticacion/inicio-sesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (!respuesta.ok) {
        throw new Error("Credenciales inválidas o servidor inactivo");
      }

      const datos = await respuesta.json();
      
      const token = datos.access_token || datos.token;
      const usuario = datos.user || { id: 1, correo, nombre: "Usuario Demo", rol: "becario", becario_id: 1 };

      iniciarSesion(token, usuario);
      enrutador.push("/");
    } catch (error_catch: any) {
      set_error_form(error_catch.message || "Error al iniciar sesión");
    } finally {
      set_cargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-[#E3DCCB] shadow-md">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-[#E3DCCB] mb-6">
          <div className="mx-auto w-12 h-12 bg-[#063A6B] rounded-xl flex items-center justify-center mb-2">
            <span className="text-[#F8C766] font-display font-bold text-xl">B</span>
          </div>
          <CardTitle className="font-display text-2xl text-[#063A6B]">Bienvenido a BUMAND</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarInicioSesion} className="space-y-4">
            {error_form && (
              <div className="p-3 rounded-lg bg-[#E2694B]/10 text-[#E2694B] text-sm font-semibold border border-[#E2694B]/20">
                {error_form}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-[#122029] font-bold">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="ejemplo@bumand.org"
                value={correo}
                onChange={(e) => set_correo(e.target.value)}
                required
                className="h-11 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-[#122029] font-bold">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => set_contrasena(e.target.value)}
                required
                className="h-11 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl mt-4"
              disabled={cargando}
            >
              {cargando ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
