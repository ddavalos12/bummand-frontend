import { CODIGOS_ERROR } from "./errores";

export interface OpcionesPeticion extends RequestInit {
  reintentos?: number;
  tiempo_espera_ms?: number;
}

export class ErrorApi extends Error {
  public codigo_estado: number;
  public datos: unknown;
  public codigo_error?: string;
  public tipo?: string;
  public detalles?: unknown[];
  public ruta?: string;
  public marca_tiempo?: string;

  constructor(
    mensaje: string,
    codigo_estado: number = 500,
    datos?: unknown,
    codigo_error?: string,
    tipo?: string,
    detalles?: unknown[],
    ruta?: string,
    marca_tiempo?: string
  ) {
    super(mensaje);
    this.name = "ErrorApi";
    this.codigo_estado = codigo_estado;
    this.datos = datos;
    this.codigo_error = codigo_error;
    this.tipo = tipo;
    this.detalles = detalles;
    this.ruta = ruta;
    this.marca_tiempo = marca_tiempo;
  }
}

export class ClienteApi {
  private url_base: string;

  constructor(url_base?: string) {
    this.url_base =
      url_base ||
      (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:3000");
  }

  private normalizarRuta(ruta: string): string {
    let ruta_formateada = ruta.startsWith("/") ? ruta : `/${ruta}`;
    if (ruta_formateada.startsWith("/api/")) {
      ruta_formateada = ruta_formateada.substring(4);
    }
    return ruta_formateada;
  }

  private manejarError401(mensaje: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bumand_token");
      localStorage.removeItem("bumand_usuario");
      window.dispatchEvent(
        new CustomEvent("sesion_expirada", {
          detail: { mensaje },
        })
      );
      if (window.location.pathname !== "/inicio-sesion") {
        window.location.href = "/inicio-sesion";
      }
    }
  }

  private async extraerDetallesError(respuesta: Response): Promise<{
    mensaje: string;
    codigo_error?: string;
    tipo?: string;
    detalles?: unknown[];
    datos?: unknown;
    ruta?: string;
    marca_tiempo?: string;
  }> {
    try {
      const cuerpo = await respuesta.json();
      if (typeof cuerpo === "object" && cuerpo !== null) {
        const codigo_error = typeof cuerpo.codigo_error === "string" ? cuerpo.codigo_error : undefined;
        const tipo = typeof cuerpo.tipo === "string" ? cuerpo.tipo : undefined;
        const detalles = Array.isArray(cuerpo.detalles) ? cuerpo.detalles : undefined;
        const ruta = typeof cuerpo.ruta === "string" ? cuerpo.ruta : undefined;
        const marca_tiempo = typeof cuerpo.marca_tiempo === "string" ? cuerpo.marca_tiempo : undefined;

        let mensaje = respuesta.statusText || `Error HTTP ${respuesta.status}`;
        if (typeof cuerpo.mensaje === "string") {
          mensaje = cuerpo.mensaje;
        } else if (Array.isArray(cuerpo.message)) {
          mensaje = cuerpo.message.join(", ");
        } else if (typeof cuerpo.message === "string") {
          mensaje = cuerpo.message;
        } else if (typeof cuerpo.error === "string") {
          mensaje = cuerpo.error;
        }

        return {
          mensaje,
          codigo_error,
          tipo,
          detalles,
          datos: cuerpo,
          ruta,
          marca_tiempo,
        };
      }
      return {
        mensaje: respuesta.statusText || `Error HTTP ${respuesta.status}`,
      };
    } catch {
      return {
        mensaje: respuesta.statusText || `Error HTTP ${respuesta.status}`,
      };
    }
  }

  public async realizarPeticion<T>(
    ruta: string,
    opciones: OpcionesPeticion = {}
  ): Promise<T> {
    const { reintentos = 1, tiempo_espera_ms = 8000, ...opciones_fetch } = opciones;
    const ruta_limpia = this.normalizarRuta(ruta);
    const url_completa = `${this.url_base}${ruta_limpia}`;

    const encabezados = new Headers(opciones_fetch.headers || {});
    if (!encabezados.has("Content-Type") && !(opciones_fetch.body instanceof FormData)) {
      encabezados.set("Content-Type", "application/json");
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bumand_token");
      if (token && !encabezados.has("Authorization")) {
        encabezados.set("Authorization", `Bearer ${token}`);
      }
    }

    let intentos = 0;
    while (intentos <= reintentos) {
      try {
        const controlador_aborto = new AbortController();
        const temporizador = setTimeout(() => controlador_aborto.abort(), tiempo_espera_ms);

        const respuesta = await fetch(url_completa, {
          ...opciones_fetch,
          headers: encabezados,
          signal: controlador_aborto.signal,
        });

        clearTimeout(temporizador);

        if (!respuesta.ok) {
          const info_error = await this.extraerDetallesError(respuesta);
          if (respuesta.status === 401) {
            this.manejarError401("Tu sesión ha expirado o las credenciales no son válidas.");
          }
          throw new ErrorApi(
            info_error.mensaje,
            respuesta.status,
            info_error.datos,
            info_error.codigo_error,
            info_error.tipo,
            info_error.detalles,
            info_error.ruta,
            info_error.marca_tiempo
          );
        }

        if (respuesta.status === 204) {
          return {} as T;
        }

        const texto = await respuesta.text();
        return (texto ? JSON.parse(texto) : {}) as T;
      } catch (error) {
        intentos++;
        const es_error_red =
          error instanceof Error &&
          (error.name === "AbortError" || error.message.includes("Failed to fetch"));

        if (intentos <= reintentos && es_error_red) {
          await new Promise((resolver) => setTimeout(resolver, 600));
          continue;
        }

        if (error instanceof ErrorApi) {
          throw error;
        }

        const mensaje =
          error instanceof Error && error.name === "AbortError"
            ? "Tiempo de espera agotado al conectar con el servidor."
            : error instanceof Error
            ? error.message
            : "Error de conexión con el servidor.";

        throw new ErrorApi(
          mensaje,
          0,
          null,
          CODIGOS_ERROR.ERR_5001,
          "CLIENTE_RED_VALIDACION",
          [mensaje],
          ruta_limpia,
          new Date().toISOString()
        );
      }
    }

    throw new ErrorApi(
      "Fallo de conexión tras múltiples reintentos.",
      0,
      null,
      CODIGOS_ERROR.ERR_5001,
      "CLIENTE_RED_VALIDACION",
      ["Fallo de conexión tras múltiples reintentos."],
      ruta_limpia,
      new Date().toISOString()
    );
  }

  public get<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T> {
    return this.realizarPeticion<T>(ruta, { ...opciones, method: "GET" });
  }

  public post<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return this.realizarPeticion<T>(ruta, {
      ...opciones,
      method: "POST",
      body: cuerpo !== undefined ? (cuerpo instanceof FormData ? cuerpo : JSON.stringify(cuerpo)) : undefined,
    });
  }

  public put<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return this.realizarPeticion<T>(ruta, {
      ...opciones,
      method: "PUT",
      body: cuerpo !== undefined ? (cuerpo instanceof FormData ? cuerpo : JSON.stringify(cuerpo)) : undefined,
    });
  }

  public patch<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return this.realizarPeticion<T>(ruta, {
      ...opciones,
      method: "PATCH",
      body: cuerpo !== undefined ? (cuerpo instanceof FormData ? cuerpo : JSON.stringify(cuerpo)) : undefined,
    });
  }

  public delete<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T> {
    return this.realizarPeticion<T>(ruta, { ...opciones, method: "DELETE" });
  }

  public async descargarBlob(ruta: string, opciones?: OpcionesPeticion): Promise<Blob> {
    const ruta_limpia = this.normalizarRuta(ruta);
    const token = typeof window !== "undefined" ? localStorage.getItem("bumand_token") : null;
    const encabezados = new Headers(opciones?.headers);
    if (token && !encabezados.has("Authorization")) {
      encabezados.set("Authorization", `Bearer ${token}`);
    }
    const respuesta = await fetch(`${this.url_base}${ruta_limpia}`, {
      ...opciones,
      method: opciones?.method || "GET",
      headers: encabezados,
    });
    if (!respuesta.ok) {
      const errDetalles = await this.extraerDetallesError(respuesta);
      throw new ErrorApi(errDetalles.mensaje, respuesta.status, errDetalles.datos, errDetalles.codigo_error);
    }
    return respuesta.blob();
  }
}

export const clienteApi = new ClienteApi();

export function peticionApi<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T> {
  return clienteApi.realizarPeticion<T>(ruta, opciones);
}
