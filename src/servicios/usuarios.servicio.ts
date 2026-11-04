/**
 * Servicio de Gestión de Usuarios y Perfil Institucional para Frontend
 * Integración con /usuarios y /perfil del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export type RolInstitucional = "administrador" | "supervisor" | "becario";
export type EstadoCuentaUsuario = "activo" | "inactivo";

export interface CorreoAdicional {
  id: number;
  correo: string;
  etiqueta?: string | null;
  principal?: boolean;
}

export interface UsuarioInstitucional {
  id: number;
  nombre: string;
  correo: string;
  correo_alternativo?: string | null;
  rol: RolInstitucional;
  estado?: EstadoCuentaUsuario;
  creado_en?: string;
  actualizado_en?: string;
  correos_adicionales?: CorreoAdicional[];
}

export interface PerfilCompletoUsuario extends UsuarioInstitucional {
  usuario_id: number;
  becario_id?: number | null;
  ci?: string | null;
  carrera?: string | null;
  universidad?: string | null;
  institucion?: string | null;
  unidad?: string | null;
  lugar_practica?: unknown;
  lugarPractica?: unknown;
  iglesia?: unknown;
  supervisor?: unknown;
}

export interface PeticionCrearUsuario {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolInstitucional;
  correo_alternativo?: string | null;
}

export interface PeticionActualizarPerfil {
  nombre?: string;
  correo_alternativo?: string | null;
  celular?: string;
  direccion?: string;
}

export interface PeticionCambiarContrasena {
  contrasena_actual?: string;
  nueva_contrasena: string;
}

export interface PeticionActualizarUsuarioAdmin {
  nombre?: string;
  correo?: string;
  rol?: RolInstitucional;
  estado?: EstadoCuentaUsuario;
  correo_alternativo?: string | null;
}

export interface PeticionVincularCorreo {
  correo: string;
  etiqueta?: string;
}

/**
 * Listar usuarios institucionales, opcionalmente filtrados por rol.
 */
export async function listarUsuarios(
  rol?: RolInstitucional
): Promise<UsuarioInstitucional[]> {
  const ruta = rol
    ? `${RUTAS_API.USUARIOS.BASE}?rol=${encodeURIComponent(rol)}`
    : RUTAS_API.USUARIOS.BASE;
  return clienteApi.get<UsuarioInstitucional[]>(ruta);
}

/**
 * Crear un usuario institucional (Solo Administradores).
 */
export async function crearUsuario(
  datos: PeticionCrearUsuario
): Promise<UsuarioInstitucional> {
  return clienteApi.post<UsuarioInstitucional>(RUTAS_API.USUARIOS.BASE, datos);
}

/**
 * Obtener la ficha completa de mi perfil con roles y datos vinculados.
 */
export async function obtenerMiPerfil(): Promise<PerfilCompletoUsuario> {
  return clienteApi.get<PerfilCompletoUsuario>(RUTAS_API.USUARIOS.MI_PERFIL);
}

/**
 * Actualizar datos de mi propio perfil.
 */
export async function actualizarMiPerfil(
  datos: PeticionActualizarPerfil
): Promise<PerfilCompletoUsuario> {
  return clienteApi.patch<PerfilCompletoUsuario>(
    RUTAS_API.USUARIOS.MI_PERFIL,
    datos
  );
}

/**
 * Cambiar mi propia contraseña institucional.
 */
export async function cambiarMiContrasena(
  datos: PeticionCambiarContrasena
): Promise<{ mensaje: string }> {
  return clienteApi.patch<{ mensaje: string }>(
    RUTAS_API.USUARIOS.MI_PERFIL_CONTRASENA,
    datos
  );
}

/**
 * Listar correos asociados al usuario autenticado.
 */
export async function listarMisCorreos(): Promise<{
  correo_principal: string;
  correo_alternativo: string | null;
  correos_adicionales: CorreoAdicional[];
}> {
  return clienteApi.get<{
    correo_principal: string;
    correo_alternativo: string | null;
    correos_adicionales: CorreoAdicional[];
  }>(RUTAS_API.USUARIOS.MI_PERFIL_CORREOS);
}

/**
 * Agregar un correo alternativo vinculado a la cuenta para inicio de sesión.
 */
export async function agregarMiCorreo(
  datos: PeticionVincularCorreo
): Promise<CorreoAdicional> {
  return clienteApi.post<CorreoAdicional>(
    RUTAS_API.USUARIOS.MI_PERFIL_CORREOS,
    datos
  );
}

/**
 * Desvincular un correo adicional de mi perfil.
 */
export async function eliminarMiCorreo(
  correo_id: number
): Promise<{ mensaje: string }> {
  return clienteApi.delete<{ mensaje: string }>(
    RUTAS_API.USUARIOS.MI_PERFIL_CORREO_ID(correo_id)
  );
}

/**
 * Actualizar directamente el correo alternativo de mi perfil.
 */
export async function actualizarMiCorreoAlternativo(
  correo_alternativo: string | null
): Promise<{ correo_alternativo: string | null }> {
  return clienteApi.patch<{ correo_alternativo: string | null }>(
    RUTAS_API.USUARIOS.MI_PERFIL_CORREO_ALTERNATIVO,
    { correo_alternativo }
  );
}

/**
 * Modificar datos de usuario institucional por administrador.
 */
export async function actualizarUsuarioPorAdmin(
  id: number,
  datos: PeticionActualizarUsuarioAdmin
): Promise<UsuarioInstitucional> {
  return clienteApi.patch<UsuarioInstitucional>(
    RUTAS_API.USUARIOS.POR_ID(id),
    datos
  );
}

/**
 * Restablecer forzosamente la contraseña de cualquier usuario institucional.
 */
export async function restablecerContrasenaPorAdmin(
  id: number,
  nueva_contrasena: string
): Promise<{ mensaje: string }> {
  return clienteApi.patch<{ mensaje: string }>(
    RUTAS_API.USUARIOS.CONTRASENA(id),
    { nueva_contrasena }
  );
}

/**
 * Modificar el correo alternativo de cualquier usuario por administrador.
 */
export async function actualizarCorreoAlternativoPorAdmin(
  id: number,
  correo_alternativo: string | null
): Promise<{ correo_alternativo: string | null }> {
  return clienteApi.patch<{ correo_alternativo: string | null }>(
    RUTAS_API.USUARIOS.CORREO_ALTERNATIVO(id),
    { correo_alternativo }
  );
}

/**
 * Activar o desactivar cuenta institucional de un usuario.
 */
export async function cambiarEstadoCuenta(
  id: number,
  estado: EstadoCuentaUsuario
): Promise<UsuarioInstitucional> {
  return clienteApi.put<UsuarioInstitucional>(RUTAS_API.USUARIOS.ESTADO(id), {
    estado,
  });
}
