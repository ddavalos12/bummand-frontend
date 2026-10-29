import { clienteApi, type OpcionesPeticion } from "./cliente-api";

/**
 * Función canónica para realizar peticiones autenticadas al backend de BUMAND
 * integrando token JWT institucional desde almacenamiento local y cabeceras RBAC.
 */
export async function peticionAutenticada<T = any>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const metodo = (opciones.method || "GET").toUpperCase();

  let cuerpo: any = undefined;
  if (opciones.body) {
    if (typeof opciones.body === "string") {
      try {
        cuerpo = JSON.parse(opciones.body);
      } catch {
        cuerpo = opciones.body;
      }
    } else {
      cuerpo = opciones.body;
    }
  }

  const opciones_peticion: OpcionesPeticion = {
    ...opciones,
    tiempo_espera_ms: 10000,
    reintentos: 1,
  };

  switch (metodo) {
    case "GET":
      return clienteApi.get<T>(ruta, opciones_peticion);
    case "POST":
      return clienteApi.post<T>(ruta, cuerpo, opciones_peticion);
    case "PATCH":
      return clienteApi.patch<T>(ruta, cuerpo, opciones_peticion);
    case "PUT":
      return clienteApi.put<T>(ruta, cuerpo, opciones_peticion);
    case "DELETE":
      return clienteApi.delete<T>(ruta, opciones_peticion);
    default:
      return clienteApi.realizarPeticion<T>(ruta, opciones_peticion);
  }
}
