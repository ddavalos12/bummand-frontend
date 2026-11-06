"use client";

import React, { useState, useEffect } from "react";
import {
  Utensils,
  Coffee,
  Plus,
  FileText,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  Coins,
  ShieldCheck,
  Search,
  Receipt,
  UserCheck,
  Sparkles,
  Trash2,
  ChefHat,
  ShoppingBag,
  Users,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  BotonJuicy,
} from "@/components/animaciones";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { toast } from "sonner";
import { descargarPdfConResiliencia } from "@/lib/generador-pdf-cliente";

export type ModalidadPreparacionRefrigerio =
  | "cocina_diaconia"
  | "traido_de_casa"
  | "compra_directa";

export interface InsumoRefrigerio {
  id: string;
  insumo: string;
  cantidad: string;
  costo_bs: number;
  pagado_por_becario: string;
}

export interface RegistroRacionRefrigerio {
  id: number;
  fecha: string;
  evento_o_jornada: string;
  tipo_refrigerio?: "desayuno" | "refrigerio_tarde" | "almuerzo_taller" | "especial_diaconal";
  becario_encargado: string;
  becario_encargado_1: string;
  becario_encargado_2: string;
  modalidad_preparacion?: ModalidadPreparacionRefrigerio;
  ingredientes_detalle?: InsumoRefrigerio[];
  cantidad_raciones: number;
  costo_unitario_bs: number;
  costo_total_bs: number;
  presupuesto_referencial_bs?: number;
  porcentaje_devolucion?: number;
  monto_devolucion_bs?: number;
  becario_receptor_devolucion_nombre?: string | null;
  fecha_devolucion?: string | null;
  sede_nombre: string;
  bloque: string;
  responsable_entrega: string;
  estado_reposicion:
    | "pendiente"
    | "sorteado_programado"
    | "rendido_pendiente"
    | "revisado_supervisor"
    | "aprobado_administracion"
    | "reembolsada";
  supervisor_revisor?: string | null;
  fecha_revision_supervisor?: string | null;
  administrador_revisor?: string | null;
  fecha_aprobacion_admin?: string | null;
  observaciones?: string;
}

export const BECARIOS_OFICIALES = [
  "Adai Belen Huayta Cardozo",
  "Alejandro Roberth Paredes Tarquino",
  "Aydee Ruth Ali Condori",
  "Carlos Oscar Luna Lizarraga",
  "Christian David Mamani Alanoca",
  "Daniel Davalos Quiñoñez",
  "Edgar Elias Alarcon Huanca",
  "Fernando Rene Yujra Quispe",
  "Isaias Daniel Herrera Mamani",
  "Jhonny Poma",
  "Jhoselin Quispe Morales",
  "José Marcos Suñagua Quispe",
  "Luis Santiago Enrriquez Conde",
  "Mariela Dayana Jimenez Chambi",
  "Mario Catunta Laime",
  "Mayherli Alejandra Loza Villalobos",
  "Mónica Mamani Mamani",
  "Nilda Amalia Churata Paye",
  "Noemi Callisaya Alvarez",
  "Ronald Franz Mamani Quispe",
  "Ronald Mauricio Quiquijana Mayta",
  "Ruddy Flores Tapia",
  "Ruth Alesandra Choque Huanca",
];

const REGISTROS_REFRIGERIOS_INICIALES: RegistroRacionRefrigerio[] = [
  {
    id: 1,
    fecha: "2026-10-23",
    evento_o_jornada: "Viernes Formativo - Escuela de Líderes",
    tipo_refrigerio: "refrigerio_tarde",
    becario_encargado: "Adai Belen Huayta Cardozo y Alejandro Roberth Paredes Tarquino",
    becario_encargado_1: "Adai Belen Huayta Cardozo",
    becario_encargado_2: "Alejandro Roberth Paredes Tarquino",
    modalidad_preparacion: "cocina_diaconia",
    cantidad_raciones: 23,
    costo_unitario_bs: 5.0,
    costo_total_bs: 115.0,
    presupuesto_referencial_bs: 115.0,
    porcentaje_devolucion: 100,
    monto_devolucion_bs: 115.0,
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque B (Auditorio)",
    responsable_entrega: "Administración Central",
    estado_reposicion: "rendido_pendiente",
    observaciones:
      "Refrigerio preparado para la jornada de Escuela de Líderes.",
  },
  {
    id: 2,
    fecha: "2026-10-16",
    evento_o_jornada: "Viernes Formativo - Escuela de Líderes",
    tipo_refrigerio: "refrigerio_tarde",
    becario_encargado: "Aydee Ruth Ali Condori y Carlos Oscar Luna Lizarraga",
    becario_encargado_1: "Aydee Ruth Ali Condori",
    becario_encargado_2: "Carlos Oscar Luna Lizarraga",
    modalidad_preparacion: "traido_de_casa",
    cantidad_raciones: 23,
    costo_unitario_bs: 5.0,
    costo_total_bs: 115.0,
    presupuesto_referencial_bs: 115.0,
    porcentaje_devolucion: 100,
    monto_devolucion_bs: 115.0,
    becario_receptor_devolucion_nombre: "Carlos Oscar Luna Lizarraga",
    fecha_devolucion: "2026-10-17",
    administrador_revisor: "Lic. Claudia Cabrera",
    fecha_aprobacion_admin: "2026-10-17",
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque A (Administración)",
    responsable_entrega: "Claudia Cabrera",
    estado_reposicion: "aprobado_administracion",
    observaciones:
      "Refrigerio casero preparado para los becarios y servido puntualmente.",
  },
  {
    id: 3,
    fecha: "2026-10-09",
    evento_o_jornada: "Viernes Formativo - Escuela de Líderes",
    tipo_refrigerio: "refrigerio_tarde",
    becario_encargado: "Daniel Davalos Quiñoñez y Nilda Amalia Churata Paye",
    becario_encargado_1: "Daniel Davalos Quiñoñez",
    becario_encargado_2: "Nilda Amalia Churata Paye",
    modalidad_preparacion: "compra_directa",
    cantidad_raciones: 23,
    costo_unitario_bs: 5.0,
    costo_total_bs: 115.0,
    presupuesto_referencial_bs: 115.0,
    porcentaje_devolucion: 100,
    monto_devolucion_bs: 115.0,
    administrador_revisor: "Lic. Claudia Cabrera",
    fecha_aprobacion_admin: "2026-10-10",
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque B (Auditorio)",
    responsable_entrega: "Administración Central",
    estado_reposicion: "aprobado_administracion",
    observaciones: "Refrigerio adquirido y distribuido a los becarios.",
  },
  {
    id: 4,
    fecha: "2026-10-30",
    evento_o_jornada: "Viernes Formativo - Escuela de Líderes",
    tipo_refrigerio: "refrigerio_tarde",
    becario_encargado: "Edgar Elias Alarcon Huanca e Isaias Daniel Herrera Mamani",
    becario_encargado_1: "Edgar Elias Alarcon Huanca",
    becario_encargado_2: "Isaias Daniel Herrera Mamani",
    modalidad_preparacion: "cocina_diaconia",
    cantidad_raciones: 23,
    costo_unitario_bs: 5.0,
    costo_total_bs: 115.0,
    presupuesto_referencial_bs: 115.0,
    porcentaje_devolucion: 100,
    sede_nombre: "Oficina Central El Alto",
    bloque: "Bloque B (Auditorio)",
    responsable_entrega: "Administración Central",
    estado_reposicion: "sorteado_programado",
    observaciones: "Dupla sorteada en ronda oficial de Escuela de Líderes.",
  },
];

export function ControlRefrigerios() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";
  const es_supervisor = usuario?.rol === "supervisor" || es_admin;

  const {
    confirmarCierreSinCompletar,
    confirmarEliminacionRegistro,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  const [registros, set_registros] = useState<RegistroRacionRefrigerio[]>(
    REGISTROS_REFRIGERIOS_INICIALES
  );

  const { datos: registros_servidor, invalidar } = useConsulta<RegistroRacionRefrigerio[]>(
    "refrigerios_lista",
    async () => {
      try {
        const resp = await clienteApi.get<any[]>("/api/refrigerios");
        if (Array.isArray(resp) && resp.length > 0) {
          return resp.map((item, idx) => ({
            id: item.id || idx + 1,
            fecha: item.fecha ? String(item.fecha).split("T")[0] : "2026-10-23",
            evento_o_jornada: item.descripcion || item.evento_o_jornada || "Viernes Formativo - Escuela de Líderes",
            tipo_refrigerio: item.tipo_refrigerio || "refrigerio_tarde",
            becario_encargado: item.becario_encargado || item.becario_nombre || "Becarios Asignados",
            becario_encargado_1: item.becario_encargado_1 || (item.becario_encargado ? item.becario_encargado.split(" y ")[0] : "Becario 1"),
            becario_encargado_2: item.becario_encargado_2 || (item.becario_encargado ? item.becario_encargado.split(" y ")[1] : "Becario 2"),
            modalidad_preparacion: item.modalidad_preparacion || "cocina_diaconia",
            cantidad_raciones: Number(item.cantidad_raciones) || 23,
            costo_unitario_bs: Number(item.costo_unitario_bs) || 5.0,
            costo_total_bs: Number(item.costo_total_bs) || 115.0,
            presupuesto_referencial_bs: 115.0,
            porcentaje_devolucion: 100,
            monto_devolucion_bs: Number(item.monto_devolucion_bs || item.costo_total_bs) || 115.0,
            becario_receptor_devolucion_nombre: item.becario_receptor_devolucion_nombre || null,
            fecha_devolucion: item.fecha_devolucion || null,
            sede_nombre: item.sede_nombre || "Oficina Central El Alto",
            bloque: item.bloque || "Bloque B (Auditorio)",
            responsable_entrega: item.responsable_entrega || "Coordinación General BUMAND",
            estado_reposicion: (item.estado_reposicion || "rendido_pendiente") as RegistroRacionRefrigerio["estado_reposicion"],
            administrador_revisor: item.administrador_revisor || item.administrador_nombre || null,
            fecha_aprobacion_admin: item.fecha_aprobacion_admin || null,
            observaciones: item.observaciones || "Rendición de refrigerio por la dupla.",
          }));
        }
      } catch {}
      return REGISTROS_REFRIGERIOS_INICIALES;
    },
    { datos_iniciales: REGISTROS_REFRIGERIOS_INICIALES }
  );

  useEffect(() => {
    if (registros_servidor && registros_servidor.length > 0) {
      set_registros(registros_servidor);
    }
  }, [registros_servidor]);
  const [busqueda, set_busqueda] = useState("");
  const [modal_nuevo_abierto, set_modal_nuevo_abierto] = useState(false);
  const [modal_sorteo_abierto, set_modal_sorteo_abierto] = useState(false);
  const [modal_devolucion_abierto, set_modal_devolucion_abierto] = useState(false);
  const [item_para_devolucion, set_item_para_devolucion] =
    useState<RegistroRacionRefrigerio | null>(null);
  const [becario_receptor_elegido, set_becario_receptor_elegido] = useState<string>("");

  const [planilla_seleccionada, set_planilla_seleccionada] =
    useState<RegistroRacionRefrigerio | null>(null);

  const [lista_becarios, set_lista_becarios] = useState<string[]>(BECARIOS_OFICIALES);

  // Estados para la asignación de duplas por directiva
  const [sorteo_viernes_fecha, set_sorteo_viernes_fecha] = useState("2026-10-30");
  const [sorteo_evento, set_sorteo_evento] = useState("Escuela de Líderes (Viernes Formativo)");
  const [sorteo_encargado_1, set_sorteo_encargado_1] = useState(BECARIOS_OFICIALES[0]);
  const [sorteo_encargado_2, set_sorteo_encargado_2] = useState(BECARIOS_OFICIALES[1]);

  // Estados para auditoría por intervalo de fechas
  const [fecha_inicio_auditoria, set_fecha_inicio_auditoria] = useState("2026-10-01");
  const [fecha_fin_auditoria, set_fecha_fin_auditoria] = useState("2026-10-31");
  const [descargando_pdf_auditoria, set_descargando_pdf_auditoria] = useState(false);
  const [descargando_pdf_id, set_descargando_pdf_id] = useState<number | null>(null);

  useEffect(() => {
    async function cargarBecarios() {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/becarios");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          const nombres = respuesta
            .map((b) => b.nombre || (b.usuario ? b.usuario.nombre : null))
            .filter(Boolean);
          if (nombres.length > 0) {
            set_lista_becarios(nombres);
          }
        }
      } catch {
        // Usa lista oficial predeterminada
      }
    }
    cargarBecarios();
  }, []);

  // Formulario nuevo refrigerio (Escuela de Líderes - Dupla del Viernes)
  const [nueva_fecha, set_nueva_fecha] = useState("2026-10-23");
  const [nuevo_evento, set_nuevo_evento] = useState("Escuela de Líderes (Viernes Formativo)");
  const [nuevo_encargado_1, set_nuevo_encargado_1] = useState(
    BECARIOS_OFICIALES[0] || "Adai Belen Huayta Cardozo"
  );
  const [nuevo_encargado_2, set_nuevo_encargado_2] = useState(
    BECARIOS_OFICIALES[1] || "Alejandro Roberth Paredes Tarquino"
  );
  const [nueva_cantidad, set_nueva_cantidad] = useState("23");
  const [nuevo_costo_total, set_nuevo_costo_total] = useState("115.00");
  const [nuevo_costo_unitario, set_nuevo_costo_unitario] = useState("5.00");
  const [nueva_sede, set_nueva_sede] = useState("Oficina Central El Alto");
  const [nuevo_bloque, set_nuevo_bloque] = useState("Bloque A (Administración)");
  const [nuevo_responsable_entrega, set_nuevo_responsable_entrega] = useState("Coordinación General BUMAND");
  const [nuevas_observaciones, set_nuevas_observaciones] = useState("");

  const resetearFormularioRefrigerio = () => {
    set_nueva_fecha("2026-10-23");
    set_nuevo_evento("Escuela de Líderes (Viernes Formativo)");
    set_nuevo_encargado_1(BECARIOS_OFICIALES[0] || "Adai Belen Huayta Cardozo");
    set_nuevo_encargado_2(BECARIOS_OFICIALES[1] || "Alejandro Roberth Paredes Tarquino");
    set_nueva_cantidad("23");
    set_nuevo_costo_total("115.00");
    set_nuevo_costo_unitario("5.00");
    set_nueva_sede("Oficina Central El Alto");
    set_nuevo_bloque("Bloque A (Administración)");
    set_nuevo_responsable_entrega("Coordinación General BUMAND");
    set_nuevas_observaciones("");
  };

  const tiene_cambios_refrigerio =
    nueva_fecha !== "2026-10-23" ||
    nuevo_evento !== "Escuela de Líderes (Viernes Formativo)" ||
    nuevo_encargado_1 !== (BECARIOS_OFICIALES[0] || "Adai Belen Huayta Cardozo") ||
    nuevo_encargado_2 !== (BECARIOS_OFICIALES[1] || "Alejandro Roberth Paredes Tarquino") ||
    nueva_cantidad !== "23" ||
    nuevo_costo_total !== "115.00" ||
    nuevo_costo_unitario !== "5.00" ||
    nueva_sede !== "Oficina Central El Alto" ||
    nuevo_bloque !== "Bloque A (Administración)" ||
    nuevo_responsable_entrega !== "Coordinación General BUMAND" ||
    nuevas_observaciones !== "";

  const intentarCerrarModalRefrigerio = () => {
    confirmarCierreSinCompletar(
      tiene_cambios_refrigerio,
      () => {
        resetearFormularioRefrigerio();
        set_modal_nuevo_abierto(false);
      },
      "Registro de Refrigerios"
    );
  };

  const manejarCambioCantidad = (val: string) => {
    set_nueva_cantidad(val);
    const cant = parseFloat(val) || 0;
    set_nuevo_costo_unitario("5.00");
    set_nuevo_costo_total((cant * 5).toFixed(2));
  };

  const manejarCambioCostoTotal = (val: string) => {
    set_nuevo_costo_total(val);
    const total = parseFloat(val) || 0;
    const cant = parseFloat(nueva_cantidad) || 0;
    if (cant > 0) {
      set_nuevo_costo_unitario((total / cant).toFixed(2));
    }
  };

  const manejarCambioCostoUnitario = (val: string) => {
    set_nuevo_costo_unitario(val);
    const unitario = parseFloat(val) || 0;
    const cant = parseFloat(nueva_cantidad) || 0;
    if (cant > 0) {
      set_nuevo_costo_total((cant * unitario).toFixed(2));
    }
  };

  const confirmarProgramacionDupla = async () => {
    if (sorteo_encargado_1 === sorteo_encargado_2) {
      toast.error("Deben ser dos becarios distintos para conformar la dupla.");
      return;
    }

    const nuevo_refrigerio: RegistroRacionRefrigerio = {
      id: Date.now(),
      fecha: sorteo_viernes_fecha,
      evento_o_jornada: sorteo_evento,
      tipo_refrigerio: "refrigerio_tarde",
      becario_encargado: `${sorteo_encargado_1} y ${sorteo_encargado_2}`,
      becario_encargado_1: sorteo_encargado_1,
      becario_encargado_2: sorteo_encargado_2,
      modalidad_preparacion: "cocina_diaconia",
      cantidad_raciones: 23,
      costo_unitario_bs: 5.0,
      costo_total_bs: 115.0,
      presupuesto_referencial_bs: 115.0,
      porcentaje_devolucion: 100,
      sede_nombre: "Oficina Central El Alto",
      bloque: "Bloque B (Auditorio)",
      responsable_entrega: usuario?.nombre || "Administración Central",
      estado_reposicion: "sorteado_programado",
      observaciones: "Dupla oficial designada por la Directiva para este viernes. Presupuesto asignado Bs 115.00.",
    };

    set_registros([nuevo_refrigerio, ...registros]);
    set_modal_sorteo_abierto(false);
    toast.success("Viernes de refrigerio programado exitosamente", {
      description: `Dupla designada por Directiva: ${sorteo_encargado_1} y ${sorteo_encargado_2} para el ${sorteo_viernes_fecha}.`,
    });
    await invalidar();
  };

  // Guardar nuevo registro de entrega de raciones de refrigerio
  const manejarGuardarRefrigerio = async (e: React.FormEvent) => {
    e.preventDefault();

    const cant = parseInt(nueva_cantidad, 10) || 23;
    const costo_t = parseFloat(nuevo_costo_total) || 115.0;
    const precio_u = parseFloat(nuevo_costo_unitario) || 5.0;
    const evento_final = nuevo_evento.trim() || "Escuela de Líderes (Viernes Formativo)";

    const nuevo: RegistroRacionRefrigerio = {
      id: Date.now(),
      fecha: nueva_fecha,
      evento_o_jornada: evento_final,
      tipo_refrigerio: "refrigerio_tarde",
      becario_encargado: `${nuevo_encargado_1} y ${nuevo_encargado_2}`,
      becario_encargado_1: nuevo_encargado_1,
      becario_encargado_2: nuevo_encargado_2,
      cantidad_raciones: cant,
      costo_unitario_bs: precio_u,
      costo_total_bs: costo_t,
      presupuesto_referencial_bs: 115.0,
      porcentaje_devolucion: 100,
      monto_devolucion_bs: costo_t,
      sede_nombre: nueva_sede,
      bloque: nuevo_bloque,
      responsable_entrega: nuevo_responsable_entrega.trim() || "Coordinación General BUMAND",
      estado_reposicion: "rendido_pendiente",
      observaciones: nuevas_observaciones.trim() || "Sin observaciones adicionales.",
    };

    set_registros([nuevo, ...registros]);
    resetearFormularioRefrigerio();
    set_modal_nuevo_abierto(false);
    toast.success(`Rendición de refrigerio registrada para ${cant} raciones.`, {
      description: `Dupla: ${nuevo_encargado_1} y ${nuevo_encargado_2}. Costo total: Bs ${costo_t.toFixed(2)}.`,
    });

    try {
      await clienteApi.post("/api/refrigerios", {
        fecha: nueva_fecha,
        descripcion: evento_final,
        cantidad_raciones: cant,
        costo_unitario_bs: precio_u,
        costo_total_bs: costo_t,
        responsable_id: usuario?.id || 1,
        responsable_entrega: nuevo_responsable_entrega.trim() || "Coordinación General BUMAND",
        observaciones: nuevas_observaciones.trim() || undefined,
        becario_nombre: `${nuevo_encargado_1} y ${nuevo_encargado_2}`,
        estado_reposicion: "rendido_pendiente",
      });
      await invalidar();
    } catch {
      // Fallback local
    }
  };

  // Flujo de 2 pasos: Nivel 1 - Revisado por Supervisor
  const manejarRevisarSupervisor = async (item: RegistroRacionRefrigerio) => {
    const nombre_revisor = usuario?.nombre || "Supervisor Diaconía";
    const fecha_actual = new Date().toISOString().split("T")[0];

    try {
      await clienteApi.patch(`/api/refrigerios/${item.id}/revisar-supervisor`, {
        supervisor_nombre: nombre_revisor,
      });
    } catch {
      // Fallback local
    }

    set_registros((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? {
              ...r,
              estado_reposicion: "revisado_supervisor",
              supervisor_revisor: nombre_revisor,
              fecha_revision_supervisor: fecha_actual,
            }
          : r
      )
    );

    toast.success("Planilla marcada como Revisada por Supervisor", {
      description: `Se validó el descargo de insumos de ${item.becario_encargado}. Listo para aprobación de Administración.`,
    });
  };

  // Flujo de 2 pasos: Nivel 2 - Abrir modal de devolución 100% por Administración
  const abrirModalAprobarAdministracion = (item: RegistroRacionRefrigerio) => {
    set_item_para_devolucion(item);
    // Seleccionar por defecto al primer becario o al que más gastó
    set_becario_receptor_elegido(item.becario_encargado_1);
    set_modal_devolucion_abierto(true);
  };

  const confirmarAprobacionDevolucion100 = async () => {
    if (!item_para_devolucion || !becario_receptor_elegido) {
      toast.error("Debes seleccionar a cuál de los dos becarios se le entrega la devolución del 100%.");
      return;
    }

    const nombre_admin = usuario?.nombre || "Administración Central";
    const fecha_actual = new Date().toISOString().split("T")[0];

    try {
      await clienteApi.patch(
        `/api/refrigerios/${item_para_devolucion.id}/aprobar-administracion`,
        {
          becario_receptor_devolucion_nombre: becario_receptor_elegido,
          monto_devolucion_bs: item_para_devolucion.costo_total_bs,
          administrador_nombre: nombre_admin,
        }
      );
    } catch {
      // Fallback local
    }

    set_registros((prev) =>
      prev.map((r) =>
        r.id === item_para_devolucion.id
          ? {
              ...r,
              estado_reposicion: "aprobado_administracion",
              porcentaje_devolucion: 100,
              monto_devolucion_bs: r.costo_total_bs,
              becario_receptor_devolucion_nombre: becario_receptor_elegido,
              fecha_devolucion: fecha_actual,
              administrador_revisor: nombre_admin,
              fecha_aprobacion_admin: fecha_actual,
            }
          : r
      )
    );

    set_modal_devolucion_abierto(false);
    toast.success("¡Devolución del 100% Aprobada y Desembolsada!", {
      description: `Monto total de Bs ${item_para_devolucion.costo_total_bs.toFixed(2)} reembolsado al 100% a: ${becario_receptor_elegido}.`,
    });
    set_item_para_devolucion(null);
    await invalidar();
  };

  // Descarga del PDF oficial real con resiliencia
  const manejarDescargarPlanillaPdf = async (reg: RegistroRacionRefrigerio) => {
    try {
      set_descargando_pdf_id(reg.id);
      toast.info("Generando Reporte Oficial de Refrigerio en PDF...", {
        description: `Procesando descargo del ${reg.fecha}.`,
      });

      await descargarPdfConResiliencia(
        `/api/pdf/refrigerios/${reg.id}`,
        `Reporte_Refrigerio_${reg.id}_${reg.fecha}.pdf`,
        "refrigerios",
        { becario_id: reg.id, fecha_inicio: reg.fecha, fecha_fin: reg.fecha }
      );

      toast.success("Reporte de Refrigerio en PDF descargado exitosamente");
    } catch {
      toast.error("No se pudo generar el PDF de refrigerio", {
        description: "Ocurrió un problema al procesar el archivo.",
      });
    } finally {
      set_descargando_pdf_id(null);
    }
  };

  // Extracción de Reporte PDF por Intervalo de Fechas para Auditoría con resiliencia
  const manejarDescargarPdfAuditoria = async () => {
    try {
      set_descargando_pdf_auditoria(true);
      toast.info("Extrayendo Reporte de Auditoría de Refrigerios en PDF...", {
        description: `Intervalo: Desde ${fecha_inicio_auditoria} hasta ${fecha_fin_auditoria}.`,
      });

      const endpoint = `/api/pdf/refrigerios?fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}`;
      const nombre_archivo = `Reporte_Refrigerios_Auditoria_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      await descargarPdfConResiliencia(endpoint, nombre_archivo, "auditoria", {
        modulo: "refrigerios",
        fecha_inicio: fecha_inicio_auditoria,
        fecha_fin: fecha_fin_auditoria,
      });

      toast.success("Reporte de Auditoría de Refrigerios descargado exitosamente");
    } catch {
      toast.error("Error al extraer reporte PDF de auditoría de refrigerios", {
        description: "Ocurrió un problema al procesar el documento.",
      });
    } finally {
      set_descargando_pdf_auditoria(false);
    }
  };

  const manejarEliminarRegistro = (item: RegistroRacionRefrigerio) => {
    confirmarEliminacionRegistro({
      titulo: "¿Eliminar registro de refrigerio?",
      descripcion: `¿Está seguro de eliminar el registro de raciones de "${item.evento_o_jornada}" del ${item.fecha}? Esta acción no se puede deshacer.`,
      nombre_item: `${item.evento_o_jornada} (${item.fecha})`,
      onConfirmar: () => {
        set_registros((prev) => prev.filter((r) => r.id !== item.id));
      },
    });
  };

  // Detectar si el usuario actual es uno de los 2 encargados de este viernes
  const refrigerio_vigente = registros[0];
  const es_encargado_este_viernes =
    Boolean(usuario?.nombre) &&
    (refrigerio_vigente?.becario_encargado_1 === usuario?.nombre ||
      refrigerio_vigente?.becario_encargado_2 === usuario?.nombre ||
      usuario?.rol === "becario");

  const companero_dupla =
    refrigerio_vigente?.becario_encargado_1 === usuario?.nombre
      ? refrigerio_vigente?.becario_encargado_2
      : refrigerio_vigente?.becario_encargado_1 || "Compañero Asignado";

  // Métricas dinámicas
  const total_raciones = registros.reduce((acc, r) => acc + r.cantidad_raciones, 0);
  const costo_total_acumulado = registros.reduce((acc, r) => acc + r.costo_total_bs, 0);
  const raciones_pendientes = registros.filter(
    (r) =>
      r.estado_reposicion === "pendiente" ||
      r.estado_reposicion === "rendido_pendiente" ||
      r.estado_reposicion === "sorteado_programado"
  ).length;
  const fondo_multas_aplicado = 850.0;

  const registros_filtrados = registros.filter(
    (r) =>
      r.evento_o_jornada.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.sede_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.responsable_entrega.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.becario_encargado.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.becario_encargado_1.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.becario_encargado_2.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* BANNER DESTACADO SI EL USUARIO ES UNO DE LOS 2 ENCARGADOS      */}
      {/* ============================================================== */}
      {es_encargado_este_viernes && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#035683] via-[#007BBE] to-[#00808E] p-6 text-white shadow-md border border-[#00ABBD]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#FFB600] text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TU TURNO EN LA DUPLA DEL VIERNES</span>
              </div>
              <h3 className="text-xl font-bold font-display tracking-tight text-white">
                ¡Eres el encargado del refrigerio de este viernes junto a {companero_dupla}!
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                El presupuesto institucional asignado es de <strong>Bs 5.50 a Bs 6.00 por ración</strong> (presupuesto estimado de <strong>Bs 125.00 a Bs 150.00</strong> para 23 raciones), con su respectiva <strong>devolución íntegra al 100%</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                onClick={() => {
                  set_nuevo_encargado_1(usuario?.nombre || BECARIOS_OFICIALES[0]);
                  set_nuevo_encargado_2(companero_dupla);
                  set_modal_nuevo_abierto(true);
                }}
                className="bg-[#FFB600] hover:bg-[#FFB600]/90 text-[#035683] font-bold text-xs h-10 px-4 rounded-xl shadow-sm gap-2"
              >
                <ChefHat className="w-4 h-4 text-[#035683]" />
                <span>Registrar Raciones de Refrigerio</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CABECERA PRINCIPAL Y ACCIONES DEL MÓDULO                       */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="w-5 h-5 text-[#035683]" />
            <h2 className="text-xl font-bold font-display text-[#035683]">
              Control y Liquidación de Refrigerios Institucionales
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestión de duplas de los viernes, asignación de raciones y devolución íntegra al 100%.
          </p>
        </div>

        {es_admin && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón: Asignar Dupla del Viernes */}
            <Button
              onClick={() => set_modal_sorteo_abierto(true)}
              variant="outline"
              className="border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 font-bold rounded-xl text-xs h-10 px-3.5 gap-2 shadow-2xs cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#00ABBD]" />
              <span>👥 Asignar Dupla del Viernes</span>
            </Button>

            {/* Botón: Registrar Raciones e Ingredientes */}
            <Dialog
              open={modal_nuevo_abierto}
              onOpenChange={(abierto) => {
                if (!abierto) {
                  intentarCerrarModalRefrigerio();
                } else {
                  set_modal_nuevo_abierto(true);
                }
              }}
            >
              <DialogTrigger asChild>
                <div>
                  <BotonJuicy variante="primario" tamaño="md">
                    <Plus className="w-4 h-4" />
                    <span>Registrar Raciones de Refrigerio</span>
                  </BotonJuicy>
                </div>
              </DialogTrigger>

              <DialogContent
                showCloseButton={false}
                className="sm:max-w-[620px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl"
              >
                <DialogHeader
                  showCloseButton={false}
                  className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex flex-row items-center justify-between"
                >
                  <div>
                    <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-[#00ABBD]" />
                      <span>Registrar Raciones de Refrigerio</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Descargo oficial de la dupla del viernes para devolución íntegra al 100%.
                    </DialogDescription>
                  </div>
                  {/* Botón X de cierre solicitado por el usuario */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={intentarCerrarModalRefrigerio}
                    className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogHeader>

                <form onSubmit={manejarGuardarRefrigerio} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <DialogBody className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0 bg-white">
                    {/* Recuadro informativo destacado de Presupuesto Oficial */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-[#035683]">
                        <Coins className="w-3.5 h-3.5 text-[#FFB600]" />
                        Presupuesto Oficial: Bs 5.00 por persona ({nueva_cantidad || 23} raciones × Bs 5.00 = Bs {((Number(nueva_cantidad) || 23) * 5).toFixed(2)})
                      </span>
                      <p className="text-[11px] text-slate-600">
                        Tarifa institucional oficial de Bs 5.00 por persona. Al rendir el descargo, se procesará la devolución íntegra del 100%.
                      </p>
                    </div>

                    {/* Fila 1: Fecha de Entrega (Viernes) y Evento o Jornada Vinculada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Fecha de Entrega (Viernes)</Label>
                      <SeleccionadorFecha
                        valorString={nueva_fecha}
                        alCambiarString={(val) => set_nueva_fecha(val)}
                        className="h-9 text-xs border-[#E5E7EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Evento o Jornada Vinculada</Label>
                      <Input
                        placeholder="Ej. Escuela de Líderes (Viernes Formativo)"
                        value={nuevo_evento}
                        onChange={(e) => set_nuevo_evento(e.target.value)}
                        required
                        className="h-9 text-xs border-[#E5E7EB]"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Dupla de Becarios Encargados del Viernes */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#035683]">
                      <Users className="w-4 h-4 text-[#00ABBD]" />
                      <span>Dupla de Becarios Encargados del Viernes</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">Becario Encargado 1</Label>
                        <Select
                          value={nuevo_encargado_1}
                          onValueChange={(val) => val && set_nuevo_encargado_1(val)}
                        >
                          <SelectTrigger className="h-9 text-xs border-[#E5E7EB] bg-white">
                            <SelectValue placeholder="Encargado 1" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {lista_becarios.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">Becario Encargado 2</Label>
                        <Select
                          value={nuevo_encargado_2}
                          onValueChange={(val) => val && set_nuevo_encargado_2(val)}
                        >
                          <SelectTrigger className="h-9 text-xs border-[#E5E7EB] bg-white">
                            <SelectValue placeholder="Encargado 2" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {lista_becarios.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: Cantidad de Raciones, Costo Total y Costo Unitario */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Cantidad de Raciones</Label>
                      <Input
                        type="number"
                        min={1}
                        value={nueva_cantidad}
                        onChange={(e) => manejarCambioCantidad(e.target.value)}
                        required
                        className="h-9 text-xs font-mono border-[#E5E7EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Costo Total (Bs)</Label>
                      <Input
                        type="number"
                        step="0.50"
                        min={0}
                        value={nuevo_costo_total}
                        onChange={(e) => manejarCambioCostoTotal(e.target.value)}
                        required
                        className="h-9 text-xs font-mono border-[#E5E7EB] font-bold text-[#035683]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Costo Unitario (Bs)</Label>
                      <Input
                        type="number"
                        step="0.10"
                        min={0}
                        value={nuevo_costo_unitario}
                        onChange={(e) => manejarCambioCostoUnitario(e.target.value)}
                        required
                        className="h-9 text-xs font-mono border-[#E5E7EB]"
                      />
                    </div>
                  </div>

                  {/* Fila 4: Sede Institucional y Bloque */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Sede Institucional</Label>
                      <Select value={nueva_sede} onValueChange={(val) => val && set_nueva_sede(val)}>
                        <SelectTrigger className="h-9 text-xs border-[#E5E7EB]">
                          <SelectValue placeholder="Oficina Central El Alto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oficina Central El Alto">Oficina Central El Alto</SelectItem>
                          <SelectItem value="Agencia Juan Pablo II">Agencia Juan Pablo II</SelectItem>
                          <SelectItem value="Agencia La Paz Central">Agencia La Paz Central</SelectItem>
                          <SelectItem value="Sucursal Villa Adela">Sucursal Villa Adela</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Bloque</Label>
                      <Select value={nuevo_bloque} onValueChange={(val) => val && set_nuevo_bloque(val)}>
                        <SelectTrigger className="h-9 text-xs border-[#E5E7EB]">
                          <SelectValue placeholder="Bloque A (Administración)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bloque A (Administración)">Bloque A (Administración)</SelectItem>
                          <SelectItem value="Bloque B (Auditorio)">Bloque B (Auditorio)</SelectItem>
                          <SelectItem value="Bloque Único">Bloque Único</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fila 5: Supervisor / Responsable de Entrega */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Supervisor / Responsable de Entrega</Label>
                    <Input
                      placeholder="Coordinación General BUMAND"
                      value={nuevo_responsable_entrega}
                      onChange={(e) => set_nuevo_responsable_entrega(e.target.value)}
                      className="h-9 text-xs border-[#E5E7EB]"
                    />
                  </div>

                  {/* Fila 6: Observaciones / Menú Detallado */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Observaciones / Menú Detallado</Label>
                    <Textarea
                      placeholder="Detalle de los alimentos entregados a los becarios..."
                      value={nuevas_observaciones}
                      onChange={(e) => set_nuevas_observaciones(e.target.value)}
                      rows={3}
                      className="text-xs border-[#E5E7EB] rounded-xl resize-none"
                    />
                  </div>
                </DialogBody>

                <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={intentarCerrarModalRefrigerio}
                    className="rounded-xl text-xs h-9"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs h-9 shadow-sm"
                  >
                    Guardar Rendición
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BARRA DE AUDITORÍA: INTERVALO DE FECHAS Y EXTRACCIÓN PDF       */}
      {/* ============================================================== */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00ABBD]" />
            <span className="text-xs font-bold text-[#035683] uppercase tracking-wider">
              Auditoría de Refrigerios:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Desde:</span>
            <SeleccionadorFecha
              valorString={fecha_inicio_auditoria}
              alCambiarString={(val) => set_fecha_inicio_auditoria(val)}
              className="h-8 text-xs border-[#E5E7EB] w-36"
            />
            <span className="text-[11px] text-muted-foreground font-medium">Hasta:</span>
            <SeleccionadorFecha
              valorString={fecha_fin_auditoria}
              alCambiarString={(val) => set_fecha_fin_auditoria(val)}
              className="h-8 text-xs border-[#E5E7EB] w-36"
            />
          </div>
        </div>

        <Button
          size="sm"
          disabled={descargando_pdf_auditoria}
          onClick={manejarDescargarPdfAuditoria}
          className="h-9 px-3.5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 shrink-0"
        >
          {descargando_pdf_auditoria ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB600]" />
          ) : (
            <Printer className="w-3.5 h-3.5 text-[#FFB600]" />
          )}
          <span>Extraer Reporte PDF para Auditoría</span>
        </Button>
      </div>

      {/* ============================================================== */}
      {/* TARJETAS DE MÉTRICAS EJECUTIVAS DE REFRIGERIOS                 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaSpotlight
          color_luz="rgba(23, 180, 196, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Raciones Distribuidas
          </span>
          <div className="text-3xl font-bold font-display text-[#035683]">
            <ContadorRodilloAnimado valor={total_raciones} sufijo=" raciones" />
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">23 becarios beneficiarios por viernes</p>
        </TarjetaSpotlight>

        <TarjetaSpotlight
          color_luz="rgba(6, 58, 107, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Devolución al 100% Acumulada
          </span>
          <div className="text-3xl font-bold font-display text-[#035683]">
            Bs <ContadorRodilloAnimado valor={Math.round(costo_total_acumulado)} />
          </div>
          <p className="text-[11px] text-muted-foreground">Presupuesto: Bs 5.50 – 6.00 / ración</p>
        </TarjetaSpotlight>

        <TarjetaSpotlight
          color_luz="rgba(248, 199, 102, 0.2)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-[#035683] flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-[#FFB600]" />
            Aporte de Fondo Multas
          </span>
          <div className="text-3xl font-bold font-display text-[#FFB600]">
            Bs {fondo_multas_aplicado.toFixed(2)}
          </div>
          <p className="text-[11px] text-muted-foreground">Recaudación reinvertida en refrigerios</p>
        </TarjetaSpotlight>

        <TarjetaSpotlight
          color_luz="rgba(226, 105, 75, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
            Planillas en Proceso
          </span>
          <div className="text-3xl font-bold font-display text-amber-600">
            <ContadorRodilloAnimado valor={raciones_pendientes} sufijo=" planillas" />
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Revisión o desembolso pendiente</p>
        </TarjetaSpotlight>
      </div>

      {/* ============================================================== */}
      {/* BARRA DE FILTRO Y BÚSQUEDA                                     */}
      {/* ============================================================== */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por dupla, jornada o sede..."
            value={busqueda}
            onChange={(e) => set_busqueda(e.target.value)}
            className="pl-9 text-xs rounded-xl border-[#E5E7EB] h-10 bg-slate-50/50"
          />
        </div>
        <Badge variant="outline" className="text-xs font-mono border-[#00ABBD] text-[#035683]">
          {registros_filtrados.length} Registros de Viernes
        </Badge>
      </div>

      {/* ============================================================== */}
      {/* TABLA PRINCIPAL DE REGISTROS DE REFRIGERIO                     */}
      {/* ============================================================== */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E5E7EB]/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-[#035683]">
              Historial de Raciones, Duplas y Devolución del 100%
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#E5E7EB]/50">
            {registros_filtrados.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-sm shrink-0">
                    <Coffee className="w-5 h-5 text-[#035683]" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#035683]">
                        {item.evento_o_jornada}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-[#00ABBD]" /> {item.fecha}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium text-[#1E293B]">
                        <Building className="w-3.5 h-3.5 text-[#035683]" />
                        {item.sede_nombre} ({item.bloque})
                      </span>
                    </div>

                    {/* Dupla Destacada */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-[#035683] bg-[#00ABBD]/10 px-2.5 py-1 rounded-lg">
                        <UserCheck className="w-3.5 h-3.5 text-[#00ABBD]" />
                        Dupla Encargada: <strong>{item.becario_encargado_1}</strong> & <strong>{item.becario_encargado_2}</strong>
                      </span>
                    </div>


                    {item.observaciones && (
                      <p className="text-[11px] text-muted-foreground italic">{item.observaciones}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3.5 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                  <div className="text-left sm:text-right space-y-0.5 font-mono">
                    <div className="text-xs font-bold text-[#035683]">
                      {item.cantidad_raciones} raciones x Bs {item.costo_unitario_bs.toFixed(2)}
                    </div>
                    <div className="text-sm font-bold text-[#E2694B]">
                      Gasto 100%: Bs {item.costo_total_bs.toFixed(2)}
                    </div>
                  </div>

                  {/* Estado de Reposición y Devolución 100% */}
                  <div className="min-w-[140px] text-right space-y-1">
                    {item.estado_reposicion === "aprobado_administracion" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs gap-1.5 py-1 px-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>100% Devuelto a: {item.becario_receptor_devolucion_nombre || item.becario_encargado_1}</span>
                      </Badge>
                    ) : item.estado_reposicion === "revisado_supervisor" ? (
                      <Badge className="bg-sky-100 text-sky-800 border-sky-300 font-bold text-xs gap-1 py-1 px-2.5">
                        <Check className="w-3.5 h-3.5 text-sky-700" />
                        <span>Revisado por Supervisor</span>
                      </Badge>
                    ) : item.estado_reposicion === "sorteado_programado" ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-bold text-xs gap-1 py-1 px-2.5">
                        <Users className="w-3.5 h-3.5 text-purple-700" />
                        <span>Dupla Asignada</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-xs gap-1 py-1 px-2.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Rendición Pendiente</span>
                      </Badge>
                    )}
                  </div>

                  {/* Acciones de Flujo */}
                  <div className="flex items-center gap-1.5">
                    {/* Botón Flujo: Aprobar Devolución 100% por Administración */}
                    {es_admin &&
                      item.estado_reposicion !== "aprobado_administracion" && (
                        <Button
                          size="sm"
                          onClick={() => abrirModalAprobarAdministracion(item)}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Aprobar y Registrar Devolución 100% de fondos"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#FFB600]" />
                          <span>Aprobar 100%</span>
                        </Button>
                      )}

                    {/* Botón: Ver Planilla */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => set_planilla_seleccionada(item)}
                      className="h-8 px-2 text-xs border-slate-300 text-slate-700 rounded-lg font-bold flex items-center gap-1"
                      title="Ver Planilla Oficial"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </Button>

                    {/* Botón: Descargar PDF Real */}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={descargando_pdf_id === item.id}
                      onClick={() => manejarDescargarPlanillaPdf(item)}
                      className="h-8 px-2 text-xs rounded-lg hover:bg-slate-100 text-[#035683]"
                      title="Descargar Reporte Oficial en PDF"
                    >
                      {descargando_pdf_id === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </Button>

                    {/* Botón: Eliminar */}
                    {es_admin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => manejarEliminarRegistro(item)}
                        className="h-8 px-2 text-xs rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700"
                        title="Eliminar Registro de Raciones"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: ASIGNACIÓN DE DUPLA DEL VIERNES (DIRECTIVA)    */}
      {/* ============================================================== */}
      <Dialog open={modal_sorteo_abierto} onOpenChange={set_modal_sorteo_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E5E7EB] rounded-2xl shadow-2xl"
        >
          <DialogHeader
            showCloseButton={false}
            className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex flex-row items-center justify-between"
          >
            <div>
              <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00ABBD]" />
                Asignación de Dupla del Viernes
              </DialogTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Registro oficial de los 2 becarios designados por la Directiva para el refrigerio de la Escuela de Líderes.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={() => set_modal_sorteo_abierto(false)}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors ml-2"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <DialogBody className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Selección de Integrantes Designados */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-[#035683]">
                Becarios Designados por Directiva:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-semibold">Becario Encargado 1</Label>
                  <Select
                    value={sorteo_encargado_1}
                    onValueChange={(val) => val && set_sorteo_encargado_1(val)}
                  >
                    <SelectTrigger className="h-9 text-xs border-[#E5E7EB]">
                      <SelectValue placeholder="Encargado 1" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {lista_becarios.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-semibold">Becario Encargado 2</Label>
                  <Select
                    value={sorteo_encargado_2}
                    onValueChange={(val) => val && set_sorteo_encargado_2(val)}
                  >
                    <SelectTrigger className="h-9 text-xs border-[#E5E7EB]">
                      <SelectValue placeholder="Encargado 2" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {lista_becarios.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Fecha del Viernes y Evento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Fecha del Viernes</Label>
                <SeleccionadorFecha
                  valorString={sorteo_viernes_fecha}
                  alCambiarString={(val) => set_sorteo_viernes_fecha(val)}
                  className="h-9 text-xs border-[#E5E7EB]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Evento / Formato</Label>
                <Input
                  value={sorteo_evento}
                  onChange={(e) => set_sorteo_evento(e.target.value)}
                  className="h-9 text-xs border-[#E5E7EB]"
                />
              </div>
            </div>

            {/* Información de presupuesto referencial */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-[#035683]">
                <Coins className="w-3.5 h-3.5 text-[#FFB600]" />
                Presupuesto Oficial de Escuela de Líderes:
              </span>
              <p className="text-[11px] text-slate-600">
                23 raciones × Bs 5.00 = <strong>Bs 115.00</strong> (tarifa institucional de Bs 5.00 por persona). Al rendir la entrega del refrigerio, se procesará la <strong>devolución íntegra del 100%</strong>.
              </p>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_sorteo_abierto(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmarProgramacionDupla}
              className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs h-9"
            >
              Confirmar Dupla de Refrigerio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL OBLIGATORIO: APROBACIÓN DEVOLUCIÓN 100%          */}
      {/* ============================================================== */}
      {item_para_devolucion && (
        <Dialog open={modal_devolucion_abierto} onOpenChange={set_modal_devolucion_abierto}>
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-[#E5E7EB] rounded-2xl shadow-2xl"
          >
            <DialogHeader
              showCloseButton={false}
              className="p-5 pb-3 border-b border-[#E5E7EB] bg-gradient-to-r from-emerald-50 to-teal-50"
            >
              <DialogTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                Aprobación de Devolución del 100% (Administración)
              </DialogTitle>
              <CardDescription className="text-xs text-emerald-800">
                Selección obligatoria del becario receptor único para el desembolso total del descargo.
              </CardDescription>
            </DialogHeader>

            <DialogBody className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
              {/* Resumen Financiero */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#035683]">
                    {item_para_devolucion.evento_o_jornada}
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-mono font-bold">
                    100% REEMBOLSO
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-slate-200">
                  <div>
                    <span>Fecha: </span>
                    <strong className="text-slate-800">{item_para_devolucion.fecha}</strong>
                  </div>
                  <div>
                    <span>Raciones: </span>
                    <strong className="text-slate-800">{item_para_devolucion.cantidad_raciones} becarios</strong>
                  </div>
                  <div className="col-span-2">
                    <span>Monto Total Rendido (100%): </span>
                    <strong className="text-base text-emerald-700 font-mono">
                      Bs {item_para_devolucion.costo_total_bs.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Selector Obligatorio del Receptor Único */}
              <div className="space-y-3 p-4 rounded-xl border-2 border-[#00ABBD]/40 bg-[#00ABBD]/5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#035683] block">
                    ¿A cuál de los 2 becarios encargados se realiza la devolución total (100% — Bs {item_para_devolucion.costo_total_bs.toFixed(2)})?
                  </Label>
                  <p className="text-[11px] text-slate-600">
                    Por normativa institucional, el monto total se transfiere a un único integrante de la dupla, quien luego concilia internamente con su compañero según los gastos realizados.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {/* Opción 1: Encargado 1 */}
                  <label
                    onClick={() => set_becario_receptor_elegido(item_para_devolucion.becario_encargado_1)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      becario_receptor_elegido === item_para_devolucion.becario_encargado_1
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          becario_receptor_elegido === item_para_devolucion.becario_encargado_1
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {becario_receptor_elegido === item_para_devolucion.becario_encargado_1 && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {item_para_devolucion.becario_encargado_1}
                        </span>
                        <span className="text-[10px] text-slate-500">Becario Encargado 1 de la Dupla</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800 font-mono">
                      Receptor 100%
                    </Badge>
                  </label>

                  {/* Opción 2: Encargado 2 */}
                  <label
                    onClick={() => set_becario_receptor_elegido(item_para_devolucion.becario_encargado_2)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      becario_receptor_elegido === item_para_devolucion.becario_encargado_2
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          becario_receptor_elegido === item_para_devolucion.becario_encargado_2
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {becario_receptor_elegido === item_para_devolucion.becario_encargado_2 && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {item_para_devolucion.becario_encargado_2}
                        </span>
                        <span className="text-[10px] text-slate-500">Becario Encargado 2 de la Dupla</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800 font-mono">
                      Receptor 100%
                    </Badge>
                  </label>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => set_modal_devolucion_abierto(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmarAprobacionDevolucion100}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Desembolso al 100%</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: VISOR DE PLANILLA OFICIAL DE REPOSICIÓN         */}
      {/* ============================================================== */}
      {planilla_seleccionada && (
        <Dialog
          open={Boolean(planilla_seleccionada)}
          onOpenChange={(abierto) => !abierto && set_planilla_seleccionada(null)}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E5E7EB] shadow-2xl"
          >
            <DialogHeader
              showCloseButton={false}
              className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]"
            >
              <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Planilla Oficial de Refrigerios y Devolución 100%
              </DialogTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Documento de auditoría diaconal emitido para reintegro íntegro de fondos.
              </CardDescription>
            </DialogHeader>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#035683]">
                    {planilla_seleccionada.evento_o_jornada}
                  </span>
                  <Badge className="font-mono text-[10px] bg-[#035683] text-white">
                    REP-{planilla_seleccionada.id.toString().slice(-4)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Fecha del Viernes:</span>
                    <strong className="text-slate-800">{planilla_seleccionada.fecha}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dupla Encargada:</span>
                    <strong className="text-[#035683]">
                      {planilla_seleccionada.becario_encargado_1} & {planilla_seleccionada.becario_encargado_2}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sede y Bloque:</span>
                    <strong className="text-slate-800">
                      {planilla_seleccionada.sede_nombre} ({planilla_seleccionada.bloque})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Raciones Entregadas:</span>
                    <strong className="text-slate-800">
                      {planilla_seleccionada.cantidad_raciones} becarios
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Costo Unitario:</span>
                    <strong className="text-slate-800">
                      Bs {planilla_seleccionada.costo_unitario_bs.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>


              {/* Tarjeta de Importe Total al 100% */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#035683] to-[#00808E] text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono text-[#FFB600] block font-bold">
                    Devolución Íntegra al 100%
                  </span>
                  <span className="text-2xl font-bold font-display text-white">
                    Bs {planilla_seleccionada.costo_total_bs.toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-xs text-white/90">
                  {planilla_seleccionada.becario_receptor_devolucion_nombre ? (
                    <div>
                      <p className="text-[10px] text-white/70">100% Desembolsado a:</p>
                      <p className="font-bold text-[#FFB600]">
                        {planilla_seleccionada.becario_receptor_devolucion_nombre}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-white/70">Estado:</p>
                      <p className="font-bold text-amber-300">Pendiente de Desembolso</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => set_planilla_seleccionada(null)}
                className="rounded-xl text-xs"
              >
                Cerrar
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => manejarDescargarPlanillaPdf(planilla_seleccionada)}
                  className="rounded-xl text-xs bg-[#035683] hover:bg-[#035683]/90 text-white font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF Oficial
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </div>
  );
}
