"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, UserCheck, Building2, GraduationCap, Mail } from "lucide-react";

interface BecarioVista {
  id: number;
  nombre: string;
  ci: string;
  carrera: string;
  universidad: string;
  iglesia: string;
  lugar_practica: string;
  tutor_nombre: string;
  tutor_correo: string;
  estado: "activo" | "inactivo";
}

const BECARIOS_INICIALES: BecarioVista[] = [
  {
    id: 1,
    nombre: "Nilda Amalia Churata Paye",
    ci: "10028341",
    carrera: "Educación Parvularia",
    universidad: "UMSA",
    iglesia: "Iglesia Central El Alto",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Edgar Elias Alarcon Huanca",
    ci: "9160054",
    carrera: "Medicina",
    universidad: "UPEA",
    iglesia: "Comunidad Cristiana Vida Nueva",
    lugar_practica: "Sucursal Juan Pablo II",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "activo",
  },
  {
    id: 3,
    nombre: "Adai Belen Huayta Cardozo",
    ci: "13696496",
    carrera: "Estadística",
    universidad: "UMSA",
    iglesia: "Misión Alianza Central",
    lugar_practica: "Oficina Central Bloque B",
    tutor_nombre: "Rodrigo Solorzano",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
  },
];

export function GestionBecarios() {
  const [lista_becarios, set_lista_becarios] = useState<BecarioVista[]>(BECARIOS_INICIALES);
  const [busqueda, set_busqueda] = useState("");
  const [modal_abierto, set_modal_abierto] = useState(false);
  const [nuevo_nombre, set_nuevo_nombre] = useState("");
  const [nuevo_ci, set_nuevo_ci] = useState("");
  const [nueva_carrera, set_nueva_carrera] = useState("");
  const [nueva_universidad, set_nueva_universidad] = useState("UMSA");
  const [nuevo_lugar, set_nuevo_lugar] = useState("Oficina Central Bloque A");

  const becarios_filtrados = lista_becarios.filter(
    (b) =>
      b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.ci.includes(busqueda) ||
      b.carrera.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarGuardarBecario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo_nombre.trim() || !nuevo_ci.trim()) return;

    const nuevo: BecarioVista = {
      id: lista_becarios.length + 1,
      nombre: nuevo_nombre,
      ci: nuevo_ci,
      carrera: nueva_carrera || "Ingeniería de Sistemas",
      universidad: nueva_universidad,
      iglesia: "Iglesia Alianza La Paz",
      lugar_practica: nuevo_lugar,
      tutor_nombre: "Angel Javier Ali Paz",
      tutor_correo: "angel.ali@diaconia.bo",
      estado: "activo",
    };

    set_lista_becarios([nuevo, ...lista_becarios]);
    set_nuevo_nombre("");
    set_nuevo_ci("");
    set_nueva_carrera("");
    set_modal_abierto(false);
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
      <CardHeader className="pb-4 border-b border-[#E3DCCB]/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold font-display text-[#063A6B]">
              Gestión de Becarios y Perfiles
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Directorio oficial de estudiantes beneficiarios del programa BUMAND - Diaconía FRIF-IFD.
            </CardDescription>
          </div>

          <Dialog open={modal_abierto} onOpenChange={set_modal_abierto}>
            {/* @ts-ignore */}
            <DialogTrigger asChild>
              <Button className="h-10 px-4 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Nuevo Becario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl border-[#E3DCCB]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#063A6B]">
                  Registrar Nuevo Becario BUMAND
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={manejarGuardarBecario} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="nombre_completo" className="text-xs font-semibold text-[#122029]">
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombre_completo"
                    placeholder="Ej. Juan Pérez Mamani"
                    value={nuevo_nombre}
                    onChange={(e) => set_nuevo_nombre(e.target.value)}
                    required
                    className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="ci_num" className="text-xs font-semibold text-[#122029]">
                      Cédula de Identidad (C.I.)
                    </Label>
                    <Input
                      id="ci_num"
                      placeholder="12345678"
                      value={nuevo_ci}
                      onChange={(e) => set_nuevo_ci(e.target.value)}
                      required
                      className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="univ" className="text-xs font-semibold text-[#122029]">
                      Universidad
                    </Label>
                    <Select value={nueva_universidad} onValueChange={(v) => v && set_nueva_universidad(v)}>
                      <SelectTrigger className="h-10 border-[#E3DCCB]">
                        <SelectValue placeholder="Universidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UMSA">UMSA</SelectItem>
                        <SelectItem value="UPEA">UPEA</SelectItem>
                        <SelectItem value="UCB">UCB</SelectItem>
                        <SelectItem value="UNIVALLE">UNIVALLE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="carrera_txt" className="text-xs font-semibold text-[#122029]">
                    Carrera
                  </Label>
                  <Input
                    id="carrera_txt"
                    placeholder="Ej. Ingeniería de Sistemas"
                    value={nueva_carrera}
                    onChange={(e) => set_nueva_carrera(e.target.value)}
                    required
                    className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lugar_sel" className="text-xs font-semibold text-[#122029]">
                    Sede / Lugar de Práctica Asignado
                  </Label>
                  <Select value={nuevo_lugar} onValueChange={(v) => v && set_nuevo_lugar(v)}>
                    <SelectTrigger className="h-10 border-[#E3DCCB]">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oficina Central Bloque A">Oficina Central Bloque A</SelectItem>
                      <SelectItem value="Oficina Central Bloque B">Oficina Central Bloque B</SelectItem>
                      <SelectItem value="Sucursal Juan Pablo II">Sucursal Juan Pablo II</SelectItem>
                      <SelectItem value="Sucursal Villa Adela">Sucursal Villa Adela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => set_modal_abierto(false)}
                    className="h-10 border-[#E3DCCB]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold"
                  >
                    Guardar Becario
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, CI o carrera..."
              value={busqueda}
              onChange={(e) => set_busqueda(e.target.value)}
              className="h-10 pl-9 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
            />
          </div>
          <Badge variant="outline" className="h-10 px-3 border-[#E3DCCB] text-[#063A6B] font-mono text-xs font-bold">
            Total: {becarios_filtrados.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-[#E3DCCB]">
              <TableHead className="font-bold text-[#063A6B]">Becario</TableHead>
              <TableHead className="font-bold text-[#063A6B]">C.I.</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Carrera / Universidad</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Sede Asignada</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Tutor Responsable</TableHead>
              <TableHead className="font-bold text-[#063A6B]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {becarios_filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron becarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              becarios_filtrados.map((b) => (
                <TableRow key={b.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 transition-colors">
                  <TableCell className="font-medium text-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-xs">
                        {b.nombre.charAt(0)}
                      </div>
                      <span>{b.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                    {b.ci}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-[#1E293B]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#17B4C4]" />
                      <span>{b.carrera}</span>
                      <span className="text-muted-foreground">({b.universidad})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-[#063A6B] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-[#063A6B]" />
                      <span>{b.lugar_practica}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-medium text-[#1E293B]">{b.tutor_nombre}</p>
                      <p className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {b.tutor_correo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold"
                    >
                      <UserCheck className="w-3 h-3 mr-1" />
                      {b.estado.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
