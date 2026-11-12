import type { NextConfig } from "next";

/**
 * Módulos del backend NestJS expuestos con doble ruta (`/modulo` y `/api/modulo`).
 * `clienteApi.normalizarRuta` recorta el prefijo `/api/`, por lo que si una petición
 * llega al origen de Next.js (puerto 3000) debe reenviarse al backend para evitar 404.
 */
const MODULOS_BACKEND = [
  "asistencia",
  "autenticacion",
  "becarios",
  "biblia",
  "dashboard",
  "devocionales",
  "evaluaciones",
  "eventos",
  "iglesias",
  "justificaciones",
  "lugares-practica",
  "notificaciones",
  "pasajes",
  "pdf",
  "perfil",
  "practicas",
  "refrigerios",
  "usuarios",
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      ...MODULOS_BACKEND.map((modulo) => ({
        source: `/${modulo}/:path*`,
        destination: `${backendUrl}/api/${modulo}/:path*`,
      })),
    ];
  },
};

export default nextConfig;
