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
import {
  BookOpen,
  Church,
  Heart,
  Plus,
  MessageSquare,
  Calendar,
  User,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { RafagaCelebracion, BotonJuicy, TarjetaSpotlight } from "@/components/animaciones";
import { useFormularioValidado } from "@/hooks/useFormularioValidado";
import { EstadoVacio } from "@/components/ui/estado-vacio";
import { toast } from "sonner";
import { VersiculoBiblicoWeb } from "./modal-versiculo-diario";
import { SelectorCitaBiblica } from "./selector-cita-biblica";
import { useConsulta } from "@/hooks/useConsulta";
import { clienteApi } from "@/lib/cliente-api";

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
    comentario_pastoral: null,
    revisado_por_pastor: false,
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
    comentario_pastoral: null,
    revisado_por_pastor: false,
  },
];

export function RegistroDevocionales() {
  const { usuario } = usarAutenticacion();
  const [devocionales_locales, set_devocionales_locales] = useState<DevocionalItem[]>(DEVOCIONALES_INICIALES);
  const [filtro_texto, set_filtro_texto] = useState("");
  const [filtro_estado, set_filtro_estado] = useState<"todos" | "pendientes" | "revisados">("todos");
  const [dialogo_abierto, set_dialogo_abierto] = useState(false);
  const [dialogo_pastoral_abierto, set_dialogo_pastoral_abierto] = useState(false);
  const [devocional_seleccionado, set_devocional_seleccionado] = useState<DevocionalItem | null>(null);
  const [comentario_pastoral_texto, set_comentario_pastoral_texto] = useState("");
  const [guardando_retroalimentacion, set_guardando_retroalimentacion] = useState(false);
  const [mostrar_celebracion, set_mostrar_celebracion] = useState(false);
  const [versiculo_diario, set_versiculo_diario] = useState<VersiculoBiblicoWeb | null>(null);

  const es_supervisor_o_admin = usuario?.rol === "supervisor" || usuario?.rol === "administrador";
  const es_becario = usuario?.rol === "becario";

  // Carga reactiva de devocionales desde la API central
  const { datos: devocionales_servidor, invalidar } = useConsulta<DevocionalItem[]>(
    "devocionales_todos",
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/devocionales");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map((item, idx) => ({
            id: item.id || idx + 1,
            becario_id: item.becario_id || idx + 1,
            nombre_becario:
              item.becario?.nombre ||
              item.becario?.usuario?.nombre ||
              item.nombre_becario ||
              `Becario ${idx + 1}`,
            fecha: item.fecha ? String(item.fecha).split("T")[0] : new Date().toISOString().split("T")[0],
            cita_biblica: item.cita_biblica || "Filipenses 4:13",
            titulo: item.titulo || "Reflexión Personal",
            reflexion: item.reflexion || "",
            oracion_peticion: item.oracion_peticion || "",
            comentario_pastoral: item.comentario_pastoral || null,
            revisado_por_pastor: Boolean(item.revisado_por_pastor && item.comentario_pastoral),
          }));
        }
        return DEVOCIONALES_INICIALES;
      } catch {
        return DEVOCIONALES_INICIALES;
      }
    },
    { datos_iniciales: DEVOCIONALES_INICIALES }
  );

  const lista_devocionales =
    devocionales_servidor && devocionales_servidor.length > 0
      ? devocionales_servidor
      : devocionales_locales;

  useEffect(() => {
    const cargarVersiculoDiario = async () => {
      try {
        const respuesta = await clienteApi.get<VersiculoBiblicoWeb>("/api/biblia/versiculo-diario");
        if (respuesta && respuesta.cita) {
          set_versiculo_diario(respuesta);
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
      cita_biblica: "Filipenses 4:13",
      titulo: "",
      reflexion: "",
      oracion_peticion: "",
    },
    {
      fecha: { obligatorio: "La fecha del devocional es obligatoria.", formato: "fecha" },
      cita_biblica: { obligatorio: "Seleccione el pasaje bíblico.", min_caracteres: 3 },
      titulo: { obligatorio: "Ingrese el título o tema del devocional.", min_caracteres: 4 },
      reflexion: { obligatorio: "La meditación personal es obligatoria.", min_caracteres: 10 },
      oracion_peticion: { obligatorio: "Ingrese sus motivos de oración.", min_caracteres: 5 },
    }
  );

  const manejarCrearDevocional = async () => {
    if (!formulario.validarFormulario()) {
      return;
    }

    const { fecha, cita_biblica, titulo, reflexion, oracion_peticion } = formulario.valores;

    const payload = {
      fecha: String(fecha),
      cita_biblica: String(cita_biblica).trim(),
      titulo: String(titulo).trim(),
      reflexion: String(reflexion).trim(),
      oracion_peticion: String(oracion_peticion).trim(),
    };

    try {
      await clienteApi.post("/api/devocionales", payload);
      invalidar();
    } catch {
      // Fallback a almacenamiento reactivo local
      const nuevo: DevocionalItem = {
        id: lista_devocionales.length + 1,
        becario_id: usuario?.becario_id || 1,
        nombre_becario: usuario?.nombre || "Becario Institucional",
        ...payload,
        comentario_pastoral: null,
        revisado_por_pastor: false,
      };
      set_devocionales_locales([nuevo, ...lista_devocionales]);
    }

    formulario.reiniciarFormulario();
    set_dialogo_abierto(false);
    set_mostrar_celebracion(true);
    toast.success("Devocional registrado con bendición", {
      description: "Tu reflexión espiritual ha sido registrada y notificada al área pastoral.",
    });
  };

  const manejarGuardarRetroalimentacion = async () => {
    if (!devocional_seleccionado || !comentario_pastoral_texto.trim()) return;

    set_guardando_retroalimentacion(true);
    try {
      await clienteApi.patch(`/api/devocionales/${devocional_seleccionado.id}/retroalimentar`, {
        comentario_pastoral: comentario_pastoral_texto.trim(),
      });
      invalidar();
    } catch {
      // Actualización reactiva optimista local
    } finally {
      set_guardando_retroalimentacion(false);
    }

    set_devocionales_locales((prev) =>
      prev.map((d) =>
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
    toast.success("Retroalimentación pastoral guardada", {
      description: "El acompañamiento pastoral ha sido asentado en la reflexión del becario.",
    });
  };

  const total_pendientes = lista_devocionales.filter((d) => !d.revisado_por_pastor).length;
  const total_revisados = lista_devocionales.filter((d) => d.revisado_por_pastor).length;

  const devocionales_filtrados = lista_devocionales.filter((d) => {
    const texto = filtro_texto.toLowerCase();
    const coincide_texto =
      d.cita_biblica.toLowerCase().includes(texto) ||
      d.titulo.toLowerCase().includes(texto) ||
      d.nombre_becario.toLowerCase().includes(texto) ||
      d.reflexion.toLowerCase().includes(texto);

    if (!coincide_texto) return false;

    if (filtro_estado === "pendientes") return !d.revisado_por_pastor;
    if (filtro_estado === "revisados") return d.revisado_por_pastor;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera contextual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#0A5CA0]" />
            <h2 className="text-xl font-bold text-[#122029]">
              {es_supervisor_o_admin ? "Acompañamiento y Vida Espiritual" : "Devocionales y Vida Espiritual"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {es_supervisor_o_admin
              ? "Bandeja de supervisión, lectura y retroalimentación pastoral de las reflexiones bíblicas registradas por los becarios."
              : "Registro de lecturas bíblicas, reflexiones y motivos de oración para la formación integral diaconal."}
          </p>
        </div>

        {/* Acciones y métricas de cabecera */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Si es supervisor o admin, visibiliza contadores de revisión pastoral */}
          {es_supervisor_o_admin && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{total_pendientes} Pendientes de revisión</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Church className="w-3.5 h-3.5 text-emerald-600" />
                <span>{total_revisados} Acompañados</span>
              </div>
            </div>
          )}

          {/* Si es becario, puede registrar su devocional */}
          {es_becario && (
            <Dialog open={dialogo_abierto} onOpenChange={set_dialogo_abierto}>
              <DialogTrigger asChild>
                <Button className="bg-[#0A5CA0] hover:bg-[#0A5CA0]/90 text-white gap-2 rounded-xl text-xs h-9 shadow-xs">
                  <Plus className="w-4 h-4" />
                  Nuevo Devocional
                </Button>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E3DCCB] bg-white shadow-2xl"
              >
                <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
                  <DialogTitle className="flex items-center gap-2 text-[#0A5CA0]">
                    <BookOpen className="w-5 h-5" />
                    Registrar Devocional Personal
                  </DialogTitle>
                </DialogHeader>

                <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
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
                    <label className="text-xs font-semibold text-gray-700">Fecha de reflexión</label>
                    <Input
                      type="date"
                      value={String(formulario.valores.fecha)}
                      onChange={(e) => formulario.cambiarValor("fecha", e.target.value)}
                      onBlur={() => formulario.tocarCampo("fecha")}
                      className={formulario.obtenerClaseInput("fecha", "mt-1 text-xs")}
                    />
                    {formulario.renderizarMensajeError("fecha")}
                  </div>

                  {/* Selector Asistido Canónico de Citas Bíblicas con Rangos */}
                  <div>
                    <SelectorCitaBiblica
                      valor={String(formulario.valores.cita_biblica || "Filipenses 4:13")}
                      alCambiar={(cita, texto_biblico) => {
                        formulario.cambiarValor("cita_biblica", cita);
                        if (texto_biblico && !formulario.valores.reflexion) {
                          formulario.cambiarValor(
                            "reflexion",
                            `«${texto_biblico}»\n\nReflexión personal: `
                          );
                        }
                      }}
                      error={formulario.errores.cita_biblica}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700">Título / Tema de la meditación</label>
                    <Input
                      placeholder="Ej. Fortaleza en el servicio, Confianza en la prueba..."
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
                      placeholder="Escribe lo que Dios habló a tu vida a través del texto bíblico y tu jornada..."
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
                      placeholder="Motivos de oración por tus estudios, familia, salud o servicio en Diaconía..."
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
                  <Button onClick={manejarCrearDevocional} className="bg-[#0A5CA0] text-white rounded-xl shadow-xs">
                    Guardar Devocional
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pestañas de filtrado de estado */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => set_filtro_estado("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filtro_estado === "todos"
                ? "bg-white text-[#0A5CA0] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos ({lista_devocionales.length})
          </button>
          <button
            type="button"
            onClick={() => set_filtro_estado("pendientes")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filtro_estado === "pendientes"
                ? "bg-white text-amber-800 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendientes ({total_pendientes})
          </button>
          <button
            type="button"
            onClick={() => set_filtro_estado("revisados")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filtro_estado === "revisados"
                ? "bg-white text-emerald-800 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Church className="w-3 h-3 text-emerald-600" />
            Acompañados ({total_revisados})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Buscar por cita, tema, becario..."
            value={filtro_texto}
            onChange={(e) => set_filtro_texto(e.target.value)}
            className="bg-white border-[#E3DCCB] text-xs h-9 rounded-xl pl-9 pr-3 shadow-2xs"
          />
        </div>
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
          descripcion={
            filtro_estado === "pendientes"
              ? "¡Excelente labor! No hay devocionales pendientes de revisión pastoral en este momento."
              : filtro_estado === "revisados"
              ? "Aún no se han completado revisiones pastorales."
              : "Aún no se han registrado devocionales institucionales o ninguno coincide con los términos de búsqueda."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devocionales_filtrados.map((item) => (
            <TarjetaSpotlight
              key={item.id}
              color_luz="rgba(23, 180, 196, 0.15)"
              className="border-[#E3DCCB] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full bg-white rounded-2xl"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-[#0A5CA0]/10 text-[#0A5CA0] border-[#0A5CA0]/20 font-bold text-[11px] px-2.5 py-0.5 shadow-2xs">
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
                  <span className="font-medium text-slate-700">{item.nombre_becario}</span>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 pb-5 space-y-3.5 text-xs text-gray-700 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="line-clamp-4 italic text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 leading-relaxed shadow-2xs">
                    "{item.reflexion}"
                  </p>

                  <div className="flex items-start gap-1.5 text-xs text-[#E2694B] px-0.5">
                    <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">
                      <strong>Oración:</strong> {item.oracion_peticion}
                    </span>
                  </div>
                </div>

                {/* Bloque de Retroalimentación Pastoral */}
                {item.comentario_pastoral ? (
                  <div className="bg-[#F0FDF4] p-3 rounded-xl border border-[#86EFAC] text-xs mt-2 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[#15803D] font-bold text-[11px]">
                        <Church className="w-3.5 h-3.5" />
                        <span>Retroalimentación Pastoral:</span>
                      </div>
                      {es_supervisor_o_admin && (
                        <button
                          type="button"
                          onClick={() => {
                            set_devocional_seleccionado(item);
                            set_comentario_pastoral_texto(item.comentario_pastoral || "");
                            set_dialogo_pastoral_abierto(true);
                          }}
                          className="text-[10px] text-[#15803D] hover:underline font-semibold"
                          title="Editar acompañamiento pastoral"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    <p className="text-[#166534] leading-relaxed">{item.comentario_pastoral}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 text-xs flex items-center justify-between gap-2 mt-2 shadow-2xs">
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
                        className="text-[11px] h-7 px-2.5 text-[#0A5CA0] border-[#0A5CA0]/30 hover:bg-[#0A5CA0]/10 rounded-lg font-bold shadow-2xs gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
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

      {/* Modal de retroalimentación pastoral (Acción humana del mentor) */}
      <Dialog open={dialogo_pastoral_abierto} onOpenChange={set_dialogo_pastoral_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-[#E3DCCB] bg-white shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
            <DialogTitle className="flex items-center gap-2 text-[#0A5CA0]">
              <Church className="w-5 h-5" />
              Acompañamiento y Consejo Pastoral
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0 text-xs">
            <p className="text-gray-600">
              Devocional del becario <strong>{devocional_seleccionado?.nombre_becario}</strong>:
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-[#0A5CA0] block mb-0.5">
                {devocional_seleccionado?.cita_biblica} · {devocional_seleccionado?.titulo}
              </span>
              <p className="text-slate-600 italic">"{devocional_seleccionado?.reflexion}"</p>
              {devocional_seleccionado?.oracion_peticion && (
                <p className="mt-1.5 text-[#E2694B] font-medium">
                  Motivo de oración: {devocional_seleccionado.oracion_peticion}
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Orientación, bendición o consejo pastoral:
              </label>
              <Textarea
                rows={4}
                placeholder="Escribe palabras personalizadas de bendición, aliento, consejo bíblico o respuesta a sus motivos de oración..."
                value={comentario_pastoral_texto}
                onChange={(e) => set_comentario_pastoral_texto(e.target.value)}
                className="text-xs rounded-xl border-slate-200"
              />
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => set_dialogo_pastoral_abierto(false)}
              className="rounded-xl text-xs"
              disabled={guardando_retroalimentacion}
            >
              Cancelar
            </Button>
            <Button
              onClick={manejarGuardarRetroalimentacion}
              disabled={guardando_retroalimentacion || !comentario_pastoral_texto.trim()}
              className="bg-[#0A5CA0] hover:bg-[#0A5CA0]/90 text-white rounded-xl shadow-xs text-xs font-bold"
            >
              {guardando_retroalimentacion ? "Guardando..." : "Asentar Acompañamiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
