/**
 * Servicio de Autenticación Institucional para Frontend
 * Integración con /autenticacion del backend BUMAND.
 */

import { clienteApi } from "../lib/cliente-api";
import { RUTAS_API } from "./rutas-api.constantes";

export interface CredencialesInicioSesion {
  correo: string;
  contrasena: string;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: "administrador" | "supervisor" | "becario";
  correo_alternativo?: string | null;
  becario_id?: number | null;
}

export interface RespuestaInicioSesion {
  token: string;
  usuario: UsuarioSesion;
}

export interface RespuestaRenovarSesion {
  token: string;
  usuario?: UsuarioSesion;
}

export interface PeticionRegistroBecario {
  ci: string;
  correo: string;
  contrasena: string;
  nombre?: string;
  celular?: string;
}

export interface PeticionConfirmarCorreo {
  token: string;
}

export interface RespuestaVerificarCi {
  existe: boolean;
  registrado: boolean;
  nombre?: string;
  correo?: string;
  carrera?: string;
  universidad?: string;
}

/**
 * Iniciar sesión institucional con credenciales y recibir token JWT.
 */
export async function iniciarSesion(
  credenciales: CredencialesInicioSesion
): Promise<RespuestaInicioSesion> {
  const respuesta = await clienteApi.post<RespuestaInicioSesion>(
    RUTAS_API.AUTENTICACION.INICIO_SESION,
    credenciales
  );

  if (typeof window !== "undefined" && respuesta.token) {
    localStorage.setItem("bumand_token", respuesta.token);
    if (respuesta.usuario) {
      localStorage.setItem("bumand_usuario", JSON.stringify(respuesta.usuario));
    }
  }

  return respuesta;
}

/**
 * Renovar el token de sesión JWT activo.
 */
export async function renovarSesion(): Promise<RespuestaRenovarSesion> {
  const respuesta = await clienteApi.post<RespuestaRenovarSesion>(
    RUTAS_API.AUTENTICACION.RENOVAR_SESION
  );

  if (typeof window !== "undefined" && respuesta.token) {
    localStorage.setItem("bumand_token", respuesta.token);
    if (respuesta.usuario) {
      localStorage.setItem("bumand_usuario", JSON.stringify(respuesta.usuario));
    }
  }

  return respuesta;
}

/**
 * Registrar nueva cuenta de becario validando CI previo en la nómina.
 */
export async function registrarBecario(
  datos: PeticionRegistroBecario
): Promise<{ mensaje: string; usuario: UsuarioSesion }> {
  return clienteApi.post<{ mensaje: string; usuario: UsuarioSesion }>(
    RUTAS_API.AUTENTICACION.REGISTRO,
    datos
  );
}

/**
 * Confirmar correo electrónico mediante token emitido.
 */
export async function confirmarCorreo(
  datos: PeticionConfirmarCorreo
): Promise<{ mensaje: string }> {
  return clienteApi.post<{ mensaje: string }>(
    RUTAS_API.AUTENTICACION.CONFIRMAR_CORREO,
    datos
  );
}

/**
 * Comprobar si un C.I. está pre-registrado en nómina oficial antes del registro.
 */
export async function verificarCi(ci: string): Promise<RespuestaVerificarCi> {
  return clienteApi.get<RespuestaVerificarCi>(
    RUTAS_API.AUTENTICACION.VERIFICAR_CI(ci)
  );
}

/**
 * Cerrar sesión localmente limpiando almacenamiento y tokens.
 */
export function cerrarSesionLocal(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bumand_token");
    localStorage.removeItem("bumand_usuario");
    window.dispatchEvent(new CustomEvent("sesion_cerrada"));
  }
}
