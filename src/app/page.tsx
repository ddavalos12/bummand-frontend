"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ListaEvaluaciones } from "@/components/evaluaciones/lista-evaluaciones";
import { FormularioF03 } from "@/components/evaluaciones/formulario-f03";
import { FirmaDigital } from "@/components/evaluaciones/firma-digital";
import { RadarGeocerca } from "@/components/recorridos/radar-geocerca";
import { RegistroRecorrido } from "@/components/recorridos/registro-recorrido";
import { RegistroHoras } from "@/components/asistencia/registro-horas";
import { PanelAdministrativo } from "@/components/panel-control/panel-administrativo";

export default function PaginaInicio() {
  const [rol_usuario, set_rol_usuario] = useState<"becario" | "supervisor">("becario");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
      <header className="p-6 flex justify-between items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#7FE0E6] mb-3">
            PORTAL BUMAND
          </p>
          <h1 className="font-display font-bold text-4xl text-primary-foreground dark:text-primary mb-2">
            Panel de Control <span className="text-[#F8C766]">BUMAND</span>
          </h1>
          <p className="text-muted-foreground text-[15px] max-w-xl">
            Gestiona tus rutas, horas, y evalúa el rendimiento en el nuevo sistema BUMAND.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B]">
            Modo Demostración: {rol_usuario.toUpperCase()}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => set_rol_usuario(rol_usuario === "becario" ? "supervisor" : "becario")}
            className="text-xs"
          >
            Cambiar a {rol_usuario === "becario" ? "Supervisor" : "Becario"}
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 w-full max-w-5xl mx-auto">
        <Tabs defaultValue={rol_usuario === "supervisor" ? "administracion" : "resumen"} className="w-full">
          <TabsList className="mb-6 h-auto flex-wrap bg-muted/50 p-1 gap-1">
            {rol_usuario === "supervisor" && (
              <TabsTrigger value="administracion" className="rounded-md font-mono text-xs h-8 px-4 data-[state=active]:bg-[#17B4C4]/10 data-[state=active]:text-[#063A6B] data-[state=active]:border-[#17B4C4]/30 border border-transparent font-bold">
                Panel Administración
              </TabsTrigger>
            )}
            <TabsTrigger value="resumen" className="rounded-md font-mono text-xs h-8 px-4 data-[state=active]:bg-[#17B4C4]/10 data-[state=active]:text-[#063A6B] data-[state=active]:border-[#17B4C4]/30 border border-transparent font-bold">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="asistencia" className="rounded-md font-mono text-xs h-8 px-4 data-[state=active]:bg-[#17B4C4]/10 data-[state=active]:text-[#063A6B] data-[state=active]:border-[#17B4C4]/30 border border-transparent font-bold">
              Asistencia
            </TabsTrigger>
            <TabsTrigger value="evaluacion" className="rounded-md font-mono text-xs h-8 px-4 data-[state=active]:bg-[#17B4C4]/10 data-[state=active]:text-[#063A6B] data-[state=active]:border-[#17B4C4]/30 border border-transparent font-bold">
              Evaluación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="administracion" className="space-y-6">
            <PanelAdministrativo />
          </TabsContent>

          <TabsContent value="asistencia" className="space-y-6">
            <div className="max-w-xl mx-auto">
              <RegistroHoras />
            </div>
          </TabsContent>

          <TabsContent value="resumen" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-[#063A6B] text-white border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-[11px] text-[#7FE0E6] uppercase font-normal">
                    Pasajes del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-3xl font-bold text-[#F8C766] mb-1">
                    Bs 345.00
                  </div>
                  <p className="font-mono text-[11px] text-white/60">
                    Gastado este mes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E3DCCB]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-[11px] text-muted-foreground uppercase font-bold">
                    Estado de Evaluación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-[#E3F9FA] text-[#17B4C4] border-none font-mono text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                      En Progreso
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-[#063A6B]">Faltan 2 módulos</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#E3DCCB]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-[11px] text-muted-foreground uppercase font-bold">
                    Próxima Parada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-sm mb-1 text-[#063A6B]">
                    Iglesia Central
                  </div>
                  <p className="text-xs text-muted-foreground font-bold">10:00 AM - Hoy</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-6">
              {/* Columna Radar */}
              <div className="flex-1">
                <RadarGeocerca />
              </div>

              {/* Columna Acciones */}
              <div className="flex-1 flex flex-col gap-4 justify-end">
                <Dialog>
                  {/* @ts-ignore */}
                  <DialogTrigger asChild>
                    <Button className="h-11 px-6 font-bold bg-[#17B4C4] text-[#063A6B] hover:bg-[#17B4C4]/90 rounded-xl w-full">
                      Agregar Recorrido
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                    <RegistroRecorrido />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  {/* @ts-ignore */}
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-11 px-6 font-bold rounded-xl border-[#E3DCCB] text-[#5B6D77] w-full bg-white hover:bg-gray-50">
                      Rellenar Formulario F-03
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
                    <FormularioF03 becario_id={1} />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  {/* @ts-ignore */}
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-11 px-6 font-bold rounded-xl border-[#E3DCCB] text-[#5B6D77] w-full bg-white hover:bg-gray-50">
                      Firma de Supervisor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
                    <FirmaDigital alFirmar={(b64) => alert("Firma guardada exitosamente.")} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evaluacion" className="space-y-4">
            <Card className="border-[#E3DCCB]">
              <CardContent className="pt-6">
                <p className="text-sm font-bold text-[#063A6B] mb-4">Módulos de evaluación de desempeño.</p>
                <ListaEvaluaciones />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
