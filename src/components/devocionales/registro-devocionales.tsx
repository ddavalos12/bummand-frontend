"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookOpen, Church, Heart, Plus, MessageSquare, Calendar, User, Sparkles, Search } from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { RafagaCelebracion, BotonJuicy, TarjetaSpotlight } from "@/components/animaciones";
import { useFormularioValidado } from "@/hooks/useFormularioValidado";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { toast } from "sonner";
import { VersiculoBiblicoWeb } from "./modal-versiculo-diario";

export interface DevocionalItem {
  id: number;
  becario_id: number;
  nombre_becario: string;
  fecha: string;
  cita_biblica: string;
  titulo: string;
  reflexion: string;
  oracion_peticion: string;
  comentario_pastoral?: string | null;
  revisado_por_pastor: boolean;
}

const DEVOCIONALES_INICIALES: DevocionalItem[] = [
  {
    id: 1,
    becario_id: 1,
    nombre_becario: "Nilda Amalia Churata Paye",
    fecha: "2026-10-07",
    cita_biblica: "Filipenses 4:13",
    titulo: "Fortaleza en el Servicio Diario",
    reflexion:
      "Hoy medité sobre cómo el Señor renueva las fuerzas en el servicio a la comunidad. En las tareas asignadas en Seguridad Física de Diaconía, pude experimentar Su gracia y paciencia.",
    oracion_peticion: "Sabiduría en los exámenes universitarios y salud para mi familia.",
    comentario_pastoral:
      "Amada hermana Nilda, Dios bendiga tu vocación diaconal. Sigue adelante con fidelidad.",
    revisado_por_pastor: true,
  },
  {
    id: 2,
    becario_id: 2,
    nombre_becario: "Edgar Elias Alarcon Huanca",
    fecha: "2026-10-06",
    cita_biblica: "Proverbios 3:5-6",
    titulo: "Confianza Plena en el Señor",
    reflexion:
      "Reconozco que no debo apoyarme en mi propia prudencia en las prácticas del Consultorio Médico, sino pedir dirección a Dios en cada atención.",
    oracion_peticion: "Por los pacientes de escasos recursos y provisión para mis estudios de Medicina.",
    comentario_pastoral: null,
    revisado_por_pastor: false,
  },
  {
    id: 3,
    becario_id: 3,
    nombre_becario: "Adai Belen Huayta Cardozo",
    fecha: "2026-10-04",
    cita_biblica: "Colosenses 3:23-24",
    titulo: "Trabajar con Excelencia para Cristo",
    reflexion:
      "Todo lo que hagamos en el procesamiento estadístico y en la formación de la Escuela de Líderes debe honrar el nombre de Dios.",
    oracion_peticion: "Por la unidad de los becarios y el retiro espiritual de fin de semestre.",
    comentario_pastoral: "Muy acertada reflexión. Que el Señor bendiga tu servicio en Diaconía.",
    revisado_por_pastor: true,
  },
];

export function RegistroDevocionales() {
  const { usuario } = usarAutenticacion();
  const [devocionales, set_devocionales] = useState<DevocionalItem[]>(DEVOCIONALES_INICIALES);
  const [filtro_texto, set_filtro_texto] = useState("");
  const [dialogo_abierto, set_dialogo_abierto] = useState(false);
  const [dialogo_pastoral_abierto, set_dialogo_pastoral_abierto] = useState(false);
  const [devocional_seleccionado, set_devocional_seleccionado] = useState<DevocionalItem | null>(null);
  const [comentario_pastoral_texto, set_comentario_pastoral_texto] = useState("");
  const [mostrar_celebracion, set_mostrar_celebracion] = useState(false);
  const [versiculo_diario, set_versiculo_diario] = useState<VersiculoBiblicoWeb | null>(null);

  useEffect(() => {
    const cargarVersiculoDiario = async () => {
      try {
        const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        const respuesta = await fetch(`${url_base}/biblia/versiculo-diario`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos && datos.cita) {
            set_versiculo_diario(datos);
          }
        }
      } catch (_) {
        set_versiculo_diario({
          cita: "Filipenses 4:13",
          libro: "Filipenses",
          capitulo: 4,
          versiculo: 13,
          texto: "Todo lo puedo en Cristo que me fortalece.",
          version: "Reina-Valera 1960 (RVR60)",
          tema: "Fortaleza y Servicio",
          reflexion_diaconal:
            "En cada labor y apoyo formativo dentro de Diaconía, Cristo es quien renueva nuestras capacidades para servir con excelencia.",
        });
      }
    };
    cargarVersiculoDiario();
  }, []);

  const aplicarVersiculoAlFormulario = (v?: VersiculoBiblicoWeb) => {
    const datos_v = v || versiculo_diario;
    if (!datos_v) return;
    formulario.cambiarValor("cita_biblica", datos_v.cita);
    formulario.cambiarValor("titulo", datos_v.tema || "Reflexión del Día");
    formulario.cambiarValor(
      "reflexion",
      `«${datos_v.texto}» (${datos_v.version})\n\nReflexión personal: `
    );
    set_dialogo_abierto(true);
    toast.info("Versículo diario cargado", {
      description: `Se completó la cita ${datos_v.cita} para tu reflexión.`,
    });
  };

  // Formulario nuevo devocional con validación institucional
  const formulario = useFormularioValidado(
    {
      fecha: new Date().toISOString().split("T")[0],
      cita_biblica: "",
      titulo: "",
      reflexion: "",
      oracion_peticion: "",
    },
    {
      fecha: { obligatorio: "La fecha del devocional es obligatoria.", formato: "fecha" },
      cita_biblica: { obligatorio: "Ingrese el pasaje o cita bíblica.", min_caracteres: 3 },
      titulo: { obligatorio: "Ingrese el título o tema del devocional.", min_caracteres: 4 },
      reflexion: { obligatorio: "La meditación personal es obligatoria.", min_caracteres: 10 },
      oracion_peticion: { obligatorio: "Ingrese sus motivos de oración.", min_caracteres: 5 },
    }
  );

  const es_supervisor_o_admin = usuario?.rol === "supervisor" || usuario?.rol === "administrador";

  const manejarCrearDevocional = () => {
    if (!formulario.validarFormulario()) {
      return;
    }

    const { fecha, cita_biblica, titulo, reflexion, oracion_peticion } = formulario.valores;

    const nuevo: DevocionalItem = {
      id: devocionales.length + 1,
      becario_id: usuario?.becario_id || 1,
      nombre_becario: usuario?.nombre || "Becario Institucional",
      fecha: String(fecha),
      cita_biblica: String(cita_biblica).trim(),
      titulo: String(titulo).trim(),
      reflexion: String(reflexion).trim(),
      oracion_peticion: String(oracion_peticion).trim(),
      revisado_por_pastor: false,
    };

    set_devocionales([nuevo, ...devocionales]);
    formulario.reiniciarFormulario();
    set_dialogo_abierto(false);
    set_mostrar_celebracion(true);
    toast.success("Devocional registrado con bendición", {
      description: "Tu reflexión espiritual ha sido registrada y notificada al área pastoral.",
    });
  };

  const manejarGuardarRetroalimentacion = () => {
    if (!devocional_seleccionado || !comentario_pastoral_texto.trim()) return;

    set_devocionales(
      devocionales.map((d) =>
        d.id === devocional_seleccionado.id
          ? {
              ...d,
              comentario_pastoral: comentario_pastoral_texto.trim(),
              revisado_por_pastor: true,
            }
          : d
      )
    );

    set_dialogo_pastoral_abierto(false);
    set_devocional_seleccionado(null);
    set_comentario_pastoral_texto("");
    toast.success("Retroalimentación guardada", {
      description: "El acompañamiento pastoral ha sido asentado en la reflexión del becario.",
    });
  };

  const devocionales_filtrados = devocionales.filter((d) => {
    const texto = filtro_texto.toLowerCase();
    return (
      d.cita_biblica.toLowerCase().includes(texto) ||
      d.titulo.toLowerCase().includes(texto) ||
      d.nombre_becario.toLowerCase().includes(texto) ||
      d.reflexion.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#0A5CA0]" />
            <h2 className="text-xl font-bold text-[#122029]">Devocionales y Vida Espiritual</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Registro de lecturas bíblicas, reflexiones y motivos de oración para la formación integral diaconal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={dialogo_abierto} onOpenChange={set_dialogo_abierto}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A5CA0] hover:bg-[#0A5CA0]/90 text-white gap-2 rounded-xl text-xs h-9">
                <Plus className="w-4 h-4" />
                Nuevo Devocional
              </Button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E3DCCB] bg-white shadow-2xl"
            >
              <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
                <DialogTitle className="flex items-center gap-2 text-[#0A5CA0]">
                  <BookOpen className="w-5 h-5" />
                  Registrar Devocional Personal
                </DialogTitle>
              </DialogHeader>

              <DialogBody className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
                {versiculo_diario && (
                  <button
                    type="button"
                    onClick={() => aplicarVersiculoAlFormulario()}
                    className="w-full text-left text-xs bg-[#17B4C4]/10 hover:bg-[#17B4C4]/15 border border-[#17B4C4]/20 rounded-xl p-2.5 flex items-center justify-between text-[#0E7A85] transition-colors"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#17B4C4]" />
                      Cargar versículo de hoy ({versiculo_diario.cita})
                    </span>
                    <span className="text-[11px] font-bold text-[#17B4C4]">Auto-llenar</span>
                  </button>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-700">Fecha</label>
                  <Input
                    type="date"
                    value={String(formulario.valores.fecha)}
                    onChange={(e) => formulario.cambiarValor("fecha", e.target.value)}
                    onBlur={() => formulario.tocarCampo("fecha")}
                    className={formulario.obtenerClaseInput("fecha", "mt-1 text-xs")}
                  />
                  {formulario.renderizarMensajeError("fecha")}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Cita Bíblica</label>
                  <Input
                    placeholder="Ej. Filipenses 4:13, Salmos 23:1"
                    value={String(formulario.valores.cita_biblica)}
                    onChange={(e) => formulario.cambiarValor("cita_biblica", e.target.value)}
                    onBlur={() => formulario.tocarCampo("cita_biblica")}
                    className={formulario.obtenerClaseInput("cita_biblica", "mt-1 text-xs")}
                  />
                  {formulario.renderizarMensajeError("cita_biblica")}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Título / Tema</label>
                  <Input
                    placeholder="Ej. Fortaleza en la debilidad"
                    value={String(formulario.valores.titulo)}
                    onChange={(e) => formulario.cambiarValor("titulo", e.target.value)}
                    onBlur={() => formulario.tocarCampo("titulo")}
                    className={formulario.obtenerClaseInput("titulo", "mt-1 text-xs")}
                  />
                  {formulario.renderizarMensajeError("titulo")}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Reflexión Personal</label>
                  <Textarea
                    placeholder="Escribe lo que Dios habló a tu vida a través del texto bíblico..."
                    rows={4}
                    value={String(formulario.valores.reflexion)}
                    onChange={(e) => formulario.cambiarValor("reflexion", e.target.value)}
                    onBlur={() => formulario.tocarCampo("reflexion")}
                    className={formulario.obtenerClaseInput("reflexion", "mt-1 text-xs")}
                  />
                  {formulario.renderizarMensajeError("reflexion")}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Petición de Oración</label>
                  <Textarea
                    placeholder="Motivos de oración por tus estudios, familia o servicio..."
                    rows={2}
                    value={String(formulario.valores.oracion_peticion)}
                    onChange={(e) => formulario.cambiarValor("oracion_peticion", e.target.value)}
                    onBlur={() => formulario.tocarCampo("oracion_peticion")}
                    className={formulario.obtenerClaseInput("oracion_peticion", "mt-1 text-xs")}
                  />
                  {formulario.renderizarMensajeError("oracion_peticion")}
                </div>
              </DialogBody>

              <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
                <Button variant="outline" onClick={() => set_dialogo_abierto(false)} className="rounded-xl">
                  Cancelar
                </Button>
                <Button onClick={manejarCrearDevocional} className="bg-[#0A5CA0] text-white rounded-xl shadow-sm">
                  Guardar Devocional
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          placeholder="Buscar por cita bíblica, tema, becario o reflexión..."
          value={filtro_texto}
          onChange={(e) => set_filtro_texto(e.target.value)}
          className="bg-white border-[#E3DCCB] text-xs h-10 rounded-xl pl-10 pr-4"
        />
      </div>

      {/* Ráfaga de Celebración Watermelon UI */}
      <RafagaCelebracion
        activo={mostrar_celebracion}
        alTerminar={() => set_mostrar_celebracion(false)}
      />

      {/* Cuadrícula de devocionales con Cult UI TarjetaSpotlight o EstadoVacio */}
      {devocionales_filtrados.length === 0 ? (
        <EstadoVacio
          icono={BookOpen}
          titulo="Sin reflexiones espirituales"
          descripcion="Aún no se han registrado devocionales institucionales o ninguno coincide con los términos de búsqueda."
          accion={{
            texto: "Registrar Nuevo Devocional",
            alHacerClic: () => set_dialogo_abierto(true),
            icono: Plus,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {devocionales_filtrados.map((item) => (
          <TarjetaSpotlight
            key={item.id}
            color_luz="rgba(23, 180, 196, 0.15)"
            className="border-[#E3DCCB] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full"
          >
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge className="bg-[#0A5CA0]/10 text-[#0A5CA0] border-[#0A5CA0]/20 font-bold text-[11px] px-2.5 py-0.5">
                  {item.cita_biblica}
                </Badge>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.fecha}</span>
                </div>
              </div>
              <CardTitle className="text-sm font-bold text-[#122029] mt-2.5 line-clamp-1">
                {item.titulo}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <User className="w-3 h-3" />
                <span>{item.nombre_becario}</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 pb-5 space-y-3.5 text-xs text-gray-700 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="line-clamp-4 italic text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 leading-relaxed">
                  "{item.reflexion}"
                </p>

                <div className="flex items-start gap-1.5 text-xs text-[#E2694B] px-0.5">
                  <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">
                    <strong>Oración:</strong> {item.oracion_peticion}
                  </span>
                </div>
              </div>

              {item.comentario_pastoral ? (
                <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#86EFAC] text-xs mt-2">
                  <div className="flex items-center gap-1.5 text-[#15803D] font-bold text-[11px] mb-1">
                    <Church className="w-3.5 h-3.5" />
                    <span>Retroalimentación Pastoral:</span>
                  </div>
                  <p className="text-[#166534] leading-relaxed">{item.comentario_pastoral}</p>
                </div>
              ) : (
                <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/70 text-xs flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Pendiente de revisión pastoral</span>
                  </div>
                  {es_supervisor_o_admin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        set_devocional_seleccionado(item);
                        set_comentario_pastoral_texto("");
                        set_dialogo_pastoral_abierto(true);
                      }}
                      className="text-[10px] h-6 px-2 text-[#0A5CA0] border-[#0A5CA0]/30 hover:bg-[#0A5CA0]/10 rounded-md font-semibold"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Retroalimentar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </TarjetaSpotlight>
        ))}
      </div>
      )}

      {/* Modal de retroalimentación pastoral */}
      <Dialog open={dialogo_pastoral_abierto} onOpenChange={set_dialogo_pastoral_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E3DCCB] bg-white shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#0A5CA0]">
              <Church className="w-5 h-5" />
              Retroalimentación Pastoral
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0 text-xs">
            <p className="text-gray-600">
              Devocional de <strong>{devocional_seleccionado?.nombre_becario}</strong>:
            </p>
            <p className="p-2 bg-gray-50 rounded border italic">
              "{devocional_seleccionado?.cita_biblica} - {devocional_seleccionado?.titulo}"
            </p>
            <div>
              <label className="font-semibold text-gray-700">Comentario u orientación pastoral:</label>
              <Textarea
                rows={3}
                placeholder="Ingresa palabras de aliento, consejo bíblico o guía formativa..."
                value={comentario_pastoral_texto}
                onChange={(e) => set_comentario_pastoral_texto(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button variant="outline" onClick={() => set_dialogo_pastoral_abierto(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={manejarGuardarRetroalimentacion} className="bg-[#0A5CA0] text-white rounded-xl shadow-sm">
              Guardar Observación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
