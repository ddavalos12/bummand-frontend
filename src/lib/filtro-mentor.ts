"use client";

import { useEffect, useMemo, useState } from "react";
import { usarAutenticacion, type Usuario } from "@/contextos/autenticacion-contexto";
import { clienteApi } from "@/lib/cliente-api";

export interface BecarioDesignadoRef {
  id: number;
  usuario_id?: number | null;
  nombre: string;
  ci: string;
  supervisor_id?: number | null;
  tutor_nombre?: string | null;
  tutor_correo?: string | null;
}

export interface AsignacionMentorSemilla {
  id_semilla: number;
  nombre: string;
  ci: string;
  supervisor_id: number;
  tutor_nombre: string;
  tutor_correo: string;
}

/**
 * Nómina canónica de asignaciones becario <-> mentor para respaldo offline/semilla.
 * Garantiza que un Mentor vea únicamente su subconjunto designado aun sin conexión al backend.
 */
export const ASIGNACIONES_MENTOR_SEMILLA: AsignacionMentorSemilla[] = [
  { id_semilla: 1, nombre: "Adai Belen Huayta Cardozo", ci: "13696496", supervisor_id: 6, tutor_nombre: "Rodrigo Solorzano San Martin", tutor_correo: "rodrigo.solorzano@diaconia.bo" },
  { id_semilla: 2, nombre: "Daniel Davalos Quiñonez", ci: "9107373", supervisor_id: 4, tutor_nombre: "Angel Javier Ali Paz", tutor_correo: "angel.ali@bumand.bo" },
  { id_semilla: 3, nombre: "Edgar Elías Alarcon Huanca", ci: "9160054", supervisor_id: 5, tutor_nombre: "Claudia Consuelo Cabrera Delgado", tutor_correo: "claudia.cabrera@diaconia.bo" },
  { id_semilla: 4, nombre: "Nilda Amalia Churata Paye", ci: "10028341", supervisor_id: 4, tutor_nombre: "Angel Javier Ali Paz", tutor_correo: "angel.ali@bumand.bo" },
  { id_semilla: 5, nombre: "Alejandro Roberth Paredes Tarquino", ci: "10064956", supervisor_id: 9, tutor_nombre: "Max Arthur Reynoso Espinoza", tutor_correo: "max.reynoso@diaconia.bo" },
  { id_semilla: 6, nombre: "Aydee Ruth Ali Condori", ci: "9952878", supervisor_id: 7, tutor_nombre: "Elsa Quinteros Aquino", tutor_correo: "elsa.quinteros@diaconia.bo" },
  { id_semilla: 7, nombre: "Carlos Oscar Luna Lizarraga", ci: "9943280", supervisor_id: 11, tutor_nombre: "Franz Raul Salazar Vasquez", tutor_correo: "franz.salazar@diaconia.bo" },
  { id_semilla: 8, nombre: "Isaías Daniel Herrera Mamani", ci: "10920862", supervisor_id: 14, tutor_nombre: "Ramiro Riera", tutor_correo: "ramiro.riera@diaconia.bo" },
  { id_semilla: 9, nombre: "José Marcos Suñagua Quispe", ci: "14378720", supervisor_id: 8, tutor_nombre: "Hugo Seifert", tutor_correo: "hugo.seifert@diaconia.bo" },
  { id_semilla: 10, nombre: "Mariela Dayana Jimenez Chambi", ci: "12959656", supervisor_id: 12, tutor_nombre: "Reynaldo Alavi Paz", tutor_correo: "reynaldo.alavi@diaconia.bo" },
  { id_semilla: 11, nombre: "Mayherli Alejandra Loza Villalobos", ci: "9925727", supervisor_id: 7, tutor_nombre: "Elsa Quinteros Aquino", tutor_correo: "elsa.quinteros@diaconia.bo" },
  { id_semilla: 12, nombre: "Noemi Callisaya Alvarez", ci: "7093658", supervisor_id: 5, tutor_nombre: "Claudia Consuelo Cabrera Delgado", tutor_correo: "claudia.cabrera@diaconia.bo" },
  { id_semilla: 13, nombre: "Ronald Mauricio Quiquijana Mayta", ci: "6172054", supervisor_id: 13, tutor_nombre: "Alberto Iber Leon Coronado", tutor_correo: "alberto.leon@diaconia.bo" },
  { id_semilla: 14, nombre: "Ruddy Flores Tapia", ci: "9974211", supervisor_id: 10, tutor_nombre: "Mildrette Rojas Soliz", tutor_correo: "mildrette.rojas@diaconia.bo" },
  { id_semilla: 15, nombre: "Gonzalo Valencia Laura", ci: "8416501", supervisor_id: 17, tutor_nombre: "Juan Perez", tutor_correo: "juan.perez@diaconia.bo" },
  { id_semilla: 16, nombre: "Gustavo Ariel Condori Montaño", ci: "13088041", supervisor_id: 16, tutor_nombre: "Cheryl Lissett Zegarra Corminales", tutor_correo: "cheryl.zegarra@diaconia.bo" },
  { id_semilla: 17, nombre: "Lisbeth Pacasi Machaca", ci: "13603536", supervisor_id: 5, tutor_nombre: "Claudia Consuelo Cabrera Delgado", tutor_correo: "claudia.cabrera@diaconia.bo" },
  { id_semilla: 18, nombre: "Selena Fernanda Pillco Mamani", ci: "13693151", supervisor_id: 16, tutor_nombre: "Cheryl Lissett Zegarra Corminales", tutor_correo: "cheryl.zegarra@diaconia.bo" },
  { id_semilla: 19, nombre: "Milenka Quispe Coarite", ci: "14155448", supervisor_id: 18, tutor_nombre: "Ricardo Martin Menacho Salas", tutor_correo: "ricardo.menacho@diaconia.bo" },
  { id_semilla: 20, nombre: "Joselin Wara Huanca Paucara", ci: "12604724", supervisor_id: 19, tutor_nombre: "Brian Marcelo Siles Loras", tutor_correo: "brian.siles@diaconia.bo" },
  { id_semilla: 21, nombre: "Johan Ludving Misme Flores", ci: "9208456", supervisor_id: 13, tutor_nombre: "Alberto Iber Leon Coronado", tutor_correo: "alberto.leon@diaconia.bo" },
  { id_semilla: 22, nombre: "Matias Jose Uri Flores", ci: "13627440", supervisor_id: 20, tutor_nombre: "Samuel Martín Durán Baspineiro", tutor_correo: "samuel.duran@diaconia.bo" },
  { id_semilla: 23, nombre: "Mateo Miguel Cussi Flores", ci: "8411610", supervisor_id: 12, tutor_nombre: "Reynaldo Alavi Paz", tutor_correo: "reynaldo.alavi@diaconia.bo" },
];

const ETIQUETAS_MENTOR_GENERICAS = new Set([
  "",
  "mentor",
  "mentor diaconia",
  "supervisor",
  "tutor",
  "tutor pastoral diaconia",
  "administracion central",
]);

/**
 * Normaliza cadenas para comparación tolerante a tildes, mayúsculas y prefijos académicos.
 */
export function normalizarTextoComparacion(valor: unknown): string {
  if (!valor) return "";
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(ing|lic|pr|dra|dr|hno|hna|sr|sra)\.?\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarCi(valor: unknown): string {
  if (!valor) return "";
  return String(valor)
    .toUpperCase()
    .replace(/\s+(LP|SC|CB|OR|PT|TJ|CH|BN|PA|QR|EL ALTO|LA PAZ)$/i, "")
    .replace(/\D+/g, "")
    .trim();
}

/**
 * Determina si el usuario o rol proporcionado corresponde a un Mentor / Supervisor.
 */
export function esMentorAutenticado(
  usuario_o_rol?: Partial<Pick<Usuario, "rol">> | string | null
): boolean {
  const rol_raw =
    typeof usuario_o_rol === "string" ? usuario_o_rol : usuario_o_rol?.rol;
  const rol = (rol_raw || "").toLowerCase().trim();
  return rol === "supervisor" || rol === "mentor";
}

/**
 * Determina si el usuario o rol proporcionado corresponde a Administrador.
 */
export function esAdministradorAutenticado(
  usuario_o_rol?: Partial<Pick<Usuario, "rol">> | string | null
): boolean {
  const rol_raw =
    typeof usuario_o_rol === "string" ? usuario_o_rol : usuario_o_rol?.rol;
  const rol = (rol_raw || "").toLowerCase().trim();
  return rol === "administrador" || rol === "admin";
}

function extraerCorreosUsuario(usuario: Partial<Usuario> | null | undefined): string[] {
  if (!usuario) return [];
  const lista: string[] = [];
  if (usuario.correo) lista.push(usuario.correo);
  if (usuario.correo_alternativo) lista.push(usuario.correo_alternativo);
  if (Array.isArray(usuario.correos_adicionales)) {
    for (const item of usuario.correos_adicionales) {
      const correo_item = typeof item === "string" ? item : item?.correo;
      if (correo_item) lista.push(correo_item);
    }
  }
  return Array.from(
    new Set(lista.map((c) => c.toLowerCase().trim()).filter(Boolean))
  );
}

function coincideCorreoMentor(
  correo_candidato: unknown,
  usuario: Partial<Usuario> | null | undefined
): boolean {
  if (!correo_candidato || !usuario) return false;
  const c_cand = String(correo_candidato).toLowerCase().trim();
  if (!c_cand) return false;
  const prefijo_cand = c_cand.includes("@") ? c_cand.split("@")[0] : c_cand;

  const correos_usuario = extraerCorreosUsuario(usuario);
  for (const c_usr of correos_usuario) {
    if (c_usr === c_cand) return true;
    const prefijo_usr = c_usr.includes("@") ? c_usr.split("@")[0] : c_usr;
    if (prefijo_usr && prefijo_cand && prefijo_usr === prefijo_cand) {
      return true;
    }
  }
  return false;
}

function coincideNombreMentor(
  nombre_candidato: unknown,
  usuario: Partial<Usuario> | null | undefined
): boolean {
  if (!nombre_candidato || !usuario?.nombre) return false;
  const n_cand = normalizarTextoComparacion(nombre_candidato);
  if (!n_cand || ETIQUETAS_MENTOR_GENERICAS.has(n_cand)) return false;
  const n_usr = normalizarTextoComparacion(usuario.nombre);
  if (!n_usr) return false;
  return n_cand === n_usr || n_cand.includes(n_usr) || n_usr.includes(n_cand);
}

function coincideNombreBecario(nombre_a: unknown, nombre_b: unknown): boolean {
  const a = normalizarTextoComparacion(nombre_a);
  const b = normalizarTextoComparacion(nombre_b);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/**
 * Obtiene los becarios designados desde el mapa semilla para un mentor específico.
 */
export function obtenerBecariosDesignadosSemilla(
  usuario: Partial<Usuario> | null | undefined
): BecarioDesignadoRef[] {
  if (!usuario) return [];
  const coincidencias = ASIGNACIONES_MENTOR_SEMILLA.filter((item) => {
    if (usuario.id && Number(item.supervisor_id) === Number(usuario.id)) {
      return true;
    }
    if (coincideCorreoMentor(item.tutor_correo, usuario)) {
      return true;
    }
    if (coincideNombreMentor(item.tutor_nombre, usuario)) {
      return true;
    }
    return false;
  });

  return coincidencias.map((item) => ({
    id: item.id_semilla,
    nombre: item.nombre,
    ci: item.ci,
    supervisor_id: item.supervisor_id,
    tutor_nombre: item.tutor_nombre,
    tutor_correo: item.tutor_correo,
  }));
}

function normalizarBecarioRemotoARef(remoto: any): BecarioDesignadoRef | null {
  if (!remoto || typeof remoto !== "object") return null;
  const id = Number(remoto.id || remoto.becario_id || 0);
  const nombre = String(
    remoto.nombre ||
      remoto.nombre_completo ||
      remoto.usuario?.nombre ||
      ""
  ).trim();
  const ci = String(remoto.ci || "").trim();
  if (!id && !nombre && !ci) return null;

  return {
    id,
    usuario_id: remoto.usuario_id ?? remoto.usuario?.id ?? null,
    nombre,
    ci,
    supervisor_id: remoto.supervisor_id ?? remoto.supervisor?.id ?? null,
    tutor_nombre:
      remoto.tutor_nombre ||
      remoto.supervisor_nombre ||
      remoto.supervisor?.nombre ||
      remoto.supervisor?.usuario?.nombre ||
      null,
    tutor_correo:
      remoto.tutor_correo ||
      remoto.supervisor_correo ||
      remoto.supervisor?.correo ||
      remoto.supervisor?.usuario?.correo ||
      null,
  };
}

/**
 * Evalúa si un registro (becario, solicitud, asistencia, permiso o evaluación)
 * pertenece a los becarios designados del Mentor autenticado.
 */
export function esRegistroDeBecarioDesignado(
  registro: any,
  usuario: Partial<Usuario> | null | undefined,
  becarios_designados: BecarioDesignadoRef[] = []
): boolean {
  if (!esMentorAutenticado(usuario)) return true;
  if (!registro || typeof registro !== "object") return false;

  // 1. Verificar coincidencia directa por campos de mentor/supervisor en el registro
  const sup_id =
    registro.supervisor_id ??
    registro.mentor_id ??
    registro.becario?.supervisor_id ??
    registro.becario?.mentor_id ??
    registro.becario?.supervisor?.id ??
    registro.supervisor?.id;

  const sup_correo =
    registro.supervisor_correo ??
    registro.tutor_correo ??
    registro.mentor_correo ??
    registro.becario?.supervisor?.correo ??
    registro.becario?.supervisor?.usuario?.correo ??
    registro.supervisor?.correo;

  const sup_nombre_raw =
    registro.supervisor_nombre ??
    registro.tutor_nombre ??
    registro.mentor_nombre ??
    registro.responsable_mentor ??
    registro.becario?.supervisor?.nombre ??
    registro.becario?.supervisor?.usuario?.nombre ??
    registro.supervisor?.nombre;

  const sup_nombre_norm = normalizarTextoComparacion(sup_nombre_raw);
  const tiene_sup_nombre_explicito = Boolean(
    sup_nombre_norm && !ETIQUETAS_MENTOR_GENERICAS.has(sup_nombre_norm)
  );

  if (sup_id !== undefined && sup_id !== null && Number(sup_id) === Number(usuario?.id)) {
    return true;
  }
  if (coincideCorreoMentor(sup_correo, usuario)) {
    return true;
  }
  if (tiene_sup_nombre_explicito && coincideNombreMentor(sup_nombre_raw, usuario)) {
    return true;
  }

  // Si el registro trae asignación explícita a OTRO mentor, excluirlo de inmediato
  const tiene_asignacion_explicita = Boolean(
    (sup_id !== undefined && sup_id !== null && Number(sup_id) > 0) ||
      (sup_correo && String(sup_correo).trim() !== "") ||
      tiene_sup_nombre_explicito
  );
  if (tiene_asignacion_explicita) {
    return false;
  }

  // 2. Verificar pertenencia contra los becarios designados (CI, Nombre o ID sin colisión)
  const lista_ref =
    becarios_designados.length > 0
      ? becarios_designados
      : obtenerBecariosDesignadosSemilla(usuario);

  if (lista_ref.length === 0) return false;

  const reg_ci = normalizarCi(registro.ci ?? registro.becario?.ci);
  const reg_nombre = String(
    registro.becario_nombre ||
      registro.nombre_completo ||
      registro.nombre ||
      registro.becario?.nombre ||
      registro.becario?.usuario?.nombre ||
      ""
  ).trim();
  const reg_becario_id = Number(
    registro.becario_id ?? registro.becario?.id ?? (registro.ci || registro.carrera ? registro.id : 0)
  );

  for (const b_ref of lista_ref) {
    const ref_ci = normalizarCi(b_ref.ci);
    if (reg_ci && ref_ci && reg_ci === ref_ci) {
      return true;
    }
    if (reg_nombre && b_ref.nombre && coincideNombreBecario(reg_nombre, b_ref.nombre)) {
      return true;
    }
    if (reg_becario_id > 0 && Number(b_ref.id) === reg_becario_id) {
      // Evita colisión numérica entre IDs de arreglos semilla distintos cuando ambos tienen nombre distinto
      if (!reg_nombre || !b_ref.nombre || coincideNombreBecario(reg_nombre, b_ref.nombre)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filtra cualquier arreglo de registros para mostrar exclusivamente los becarios designados del Mentor.
 * Para Administrador u otros roles retorna el arreglo intacto.
 */
export function filtrarListaParaMentor<T>(
  lista: T[],
  usuario: Partial<Usuario> | null | undefined,
  becarios_designados: BecarioDesignadoRef[] = []
): T[] {
  if (!Array.isArray(lista)) return [];
  if (!esMentorAutenticado(usuario)) return lista;
  return lista.filter((item) =>
    esRegistroDeBecarioDesignado(item, usuario, becarios_designados)
  );
}

// Caché en memoria por usuario para evitar llamadas redundantes a /becarios entre pestañas
const cache_becarios_mentor = new Map<number, BecarioDesignadoRef[]>();
const promesas_en_vuelo = new Map<number, Promise<BecarioDesignadoRef[]>>();

async function obtenerBecariosMentorDesdeApi(
  usuario: Usuario
): Promise<BecarioDesignadoRef[]> {
  const uid = Number(usuario.id);
  const en_cache = cache_becarios_mentor.get(uid);
  if (en_cache) return en_cache;

  const en_vuelo = promesas_en_vuelo.get(uid);
  if (en_vuelo) return en_vuelo;

  const promesa = (async () => {
    try {
      const respuesta = await clienteApi.get<any[]>("/becarios");
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        const refs = respuesta
          .map(normalizarBecarioRemotoARef)
          .filter((r): r is BecarioDesignadoRef => r !== null);

        // Respaldo defensivo en cliente: si algún registro incluye supervisor_id/correo distinto, filtrarlo
        const filtrados = refs.filter((r) => {
          const tiene_sup_explicito = Boolean(
            r.supervisor_id || r.tutor_correo || r.tutor_nombre
          );
          if (!tiene_sup_explicito) return true;
          if (r.supervisor_id && Number(r.supervisor_id) === Number(usuario.id)) {
            return true;
          }
          if (coincideCorreoMentor(r.tutor_correo, usuario)) return true;
          if (coincideNombreMentor(r.tutor_nombre, usuario)) return true;
          return false;
        });

        const resultado =
          filtrados.length > 0 ? filtrados : obtenerBecariosDesignadosSemilla(usuario);
        cache_becarios_mentor.set(uid, resultado);
        return resultado;
      }
    } catch {
      // Silencioso en modo offline: utiliza asignaciones semilla del mentor
    } finally {
      promesas_en_vuelo.delete(uid);
    }

    const semilla = obtenerBecariosDesignadosSemilla(usuario);
    cache_becarios_mentor.set(uid, semilla);
    return semilla;
  })();

  promesas_en_vuelo.set(uid, promesa);
  return promesa;
}

/**
 * Hook Reactivo centralizado para resolver los becarios designados del Mentor autenticado
 * y proveer utilidades de filtrado consistentes en todos los módulos.
 */
export function usarBecariosDesignadosMentor() {
  const { usuario } = usarAutenticacion();
  const es_mentor = esMentorAutenticado(usuario);

  const semilla_inicial = useMemo(
    () => (es_mentor && usuario ? obtenerBecariosDesignadosSemilla(usuario) : []),
    [es_mentor, usuario]
  );

  const [becarios_designados, set_becarios_designados] = useState<BecarioDesignadoRef[]>(
    () => {
      if (es_mentor && usuario?.id && cache_becarios_mentor.has(Number(usuario.id))) {
        return cache_becarios_mentor.get(Number(usuario.id)) || semilla_inicial;
      }
      return semilla_inicial;
    }
  );
  const [cargando_designados, set_cargando_designados] = useState<boolean>(false);

  useEffect(() => {
    if (!es_mentor || !usuario) {
      set_becarios_designados([]);
      return;
    }

    set_becarios_designados(
      cache_becarios_mentor.get(Number(usuario.id)) || semilla_inicial
    );

    let montado = true;
    set_cargando_designados(true);
    obtenerBecariosMentorDesdeApi(usuario)
      .then((lista) => {
        if (montado) {
          set_becarios_designados(lista);
        }
      })
      .finally(() => {
        if (montado) {
          set_cargando_designados(false);
        }
      });

    return () => {
      montado = false;
    };
  }, [es_mentor, usuario, semilla_inicial]);

  const filtrarPorMentor = useMemo(() => {
    return <T,>(lista: T[]): T[] =>
      filtrarListaParaMentor(lista, usuario, becarios_designados);
  }, [usuario, becarios_designados]);

  return {
    usuario,
    es_mentor,
    becarios_designados,
    cargando_designados,
    filtrarPorMentor,
  };
}
