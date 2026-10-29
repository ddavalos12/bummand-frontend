"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface PropiedadesFondoOndasLiquidas {
  imagePath?: string;
  text?: string;
  color_fondo_centro?: string;
  color_fondo_borde?: string;
  modo?: "login" | "dashboard";
  intensidad_distorsion?: number;
  fuerza_especular?: number;
  fuerza_raton?: number;
  ondulacion_autonoma?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Simulación líquida física canónica con Three.js (Skipper UI / GPGPU Ping-Pong FBO)
 * Soporta dos modos:
 * - 'login': Ondas con mayor distorsión óptica y presencia para pantallas de autenticación.
 * - 'dashboard': "Aguas de Reposo" — Muchísimo más suave, muchísimo más claro, con sutil
 *    respiración autónoma y sin luces molestas, diseñado para cubrir toda la interfaz.
 */
export const FondoOndasLiquidas: React.FC<PropiedadesFondoOndasLiquidas> = ({
  imagePath,
  text,
  modo = "login",
  color_fondo_centro,
  color_fondo_borde,
  intensidad_distorsion,
  fuerza_especular,
  fuerza_raton,
  ondulacion_autonoma,
  className = "",
  children,
}) => {
  const contenedor_ref = useRef<HTMLDivElement | null>(null);
  const es_dashboard = modo === "dashboard";

  // Calibración diferenciada y precisa según modo
  const centro_color = color_fondo_centro ?? "#FFFFFF";
  const borde_color = color_fondo_borde ?? (es_dashboard ? "#ECF5FA" : "#BAE6FD");
  const distorsion_valor = intensidad_distorsion ?? (es_dashboard ? 0.08 : 0.35);
  const especular_valor = fuerza_especular ?? (es_dashboard ? 0.12 : 1.6);
  const raton_valor = fuerza_raton ?? (es_dashboard ? 0.6 : 2.0);
  const autonoma_valor = ondulacion_autonoma ?? es_dashboard;

  useEffect(() => {
    const contenedor = contenedor_ref.current;
    if (!contenedor) return;

    // Comprobación de disponibilidad de contexto WebGL
    try {
      const lienzo_prueba = document.createElement("canvas");
      const gl = lienzo_prueba.getContext("webgl") || lienzo_prueba.getContext("experimental-webgl");
      if (!gl) {
        console.warn("FondoOndasLiquidas: WebGL no está disponible en este entorno.");
        return;
      }
    } catch (_) {
      return;
    }

    // Escena principal y escena de simulación física (GPGPU Ping-Pong)
    const escena_principal = new THREE.Scene();
    const escena_simulacion = new THREE.Scene();
    const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let renderizador: THREE.WebGLRenderer;
    try {
      renderizador = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("FondoOndasLiquidas: Error instanciando WebGLRenderer:", e);
      return;
    }
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.domElement.style.position = "absolute";
    renderizador.domElement.style.inset = "0";
    renderizador.domElement.style.width = "100%";
    renderizador.domElement.style.height = "100%";
    contenedor.appendChild(renderizador.domElement);

    const raton = new THREE.Vector2(-1000, -1000);
    let cuadro = 0;
    let ancho_dpr = window.innerWidth * (window.devicePixelRatio || 1);
    let alto_dpr = window.innerHeight * (window.devicePixelRatio || 1);

    // Opciones canónicas de FBO de textura de punto flotante
    const opciones_fbo = {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    let target_a = new THREE.WebGLRenderTarget(ancho_dpr, alto_dpr, opciones_fbo);
    let target_b = new THREE.WebGLRenderTarget(ancho_dpr, alto_dpr, opciones_fbo);

    // Shader de simulación física de ondas de agua
    const material_simulacion = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        mouse: { value: raton },
        resolution: { value: new THREE.Vector2(ancho_dpr, alto_dpr) },
        time: { value: 0 },
        frame: { value: 0 },
        uFuerzaRaton: { value: raton_valor },
        uAutonoma: { value: autonoma_valor ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D textureA;
        uniform vec2 mouse;
        uniform vec2 resolution;
        uniform float time;
        uniform int frame;
        uniform float uFuerzaRaton;
        uniform float uAutonoma;
        varying vec2 vUv;

        const float delta = 1.4;

        void main() {
          vec2 uv = vUv;
          if (frame == 0) {
            gl_FragColor = vec4(0.0);
            return;
          }

          vec4 data = texture2D(textureA, uv);
          float pressure = data.x;
          float pVel = data.y;

          vec2 texelSize = 1.0 / resolution;
          float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
          float p_left = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
          float p_up = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
          float p_down = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;

          if (uv.x <= texelSize.x) p_left = p_right;
          if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
          if (uv.y <= texelSize.y) p_down = p_up;
          if (uv.y >= 1.0 - texelSize.y) p_up = p_down;

          // Ecuación de propagación física de onda líquida
          pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
          pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

          pressure += delta * pVel;
          pVel -= 0.005 * delta * pressure;
          pVel *= 1.0 - 0.002 * delta;
          pressure *= 0.999;

          // Interacción con el ratón o toques
          vec2 mouseUV = mouse / resolution;
          if (mouse.x > 0.0) {
            float dist = distance(uv, mouseUV);
            if (dist <= 0.025) {
              pressure += uFuerzaRaton * (1.0 - dist / 0.025);
            }
          }

          // Ondulación autónoma serena y suave para que el agua siempre respire con vida
          if (uAutonoma > 0.5) {
            float t1 = time * 0.65;
            float t2 = time * 0.50 + 2.0;
            float t3 = time * 0.40 + 4.2;
            vec2 gota1 = vec2(0.38 + sin(t1 * 0.25) * 0.20, 0.40 + cos(t1 * 0.20) * 0.14);
            vec2 gota2 = vec2(0.65 + cos(t2 * 0.22) * 0.18, 0.55 + sin(t2 * 0.30) * 0.16);
            vec2 gota3 = vec2(0.50 + sin(t3 * 0.18) * 0.15, 0.68 + cos(t3 * 0.24) * 0.12);

            float dist1 = distance(uv, gota1);
            float dist2 = distance(uv, gota2);
            float dist3 = distance(uv, gota3);

            float pulso1 = pow(max(0.0, sin(t1 * 1.4)), 4.0) * 0.14;
            float pulso2 = pow(max(0.0, cos(t2 * 1.1)), 4.0) * 0.12;
            float pulso3 = pow(max(0.0, sin(t3 * 1.2)), 4.0) * 0.10;

            if (dist1 <= 0.045) pressure += pulso1 * (1.0 - dist1 / 0.045);
            if (dist2 <= 0.045) pressure += pulso2 * (1.0 - dist2 / 0.045);
            if (dist3 <= 0.045) pressure += pulso3 * (1.0 - dist3 / 0.045);
          }

          gl_FragColor = vec4(
            pressure,
            pVel,
            (p_right - p_left) / 2.0,
            (p_up - p_down) / 2.0
          );
        }
      `,
    });

    // Shader de renderizado final con refracción óptica e iluminación especular calibrada
    const material_renderizado = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
        uDistorsion: { value: distorsion_valor },
        uEspecular: { value: especular_valor },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        uniform float uDistorsion;
        uniform float uEspecular;
        varying vec2 vUv;

        void main() {
          vec4 data = texture2D(textureA, vUv);

          // Refracción y distorsión líquida pura
          vec2 distortion = uDistorsion * data.zw;
          vec4 color = texture2D(textureB, vUv + distortion);

          // Normal de superficie acuosa e iluminación especular suave
          vec3 normal = normalize(vec3(-data.z * 2.2, 0.5, -data.w * 2.2));
          vec3 lightDir = normalize(vec3(-2.2, 8.5, 3.2));
          float specular = pow(max(0.0, dot(normal, lightDir)), 70.0) * uEspecular;

          gl_FragColor = color + vec4(vec3(specular), 0.0);
        }
      `,
      transparent: true,
    });

    const geometria_plano = new THREE.PlaneGeometry(2, 2);
    const malla_simulacion = new THREE.Mesh(geometria_plano, material_simulacion);
    const malla_renderizado = new THREE.Mesh(geometria_plano, material_renderizado);

    escena_simulacion.add(malla_simulacion);
    escena_principal.add(malla_renderizado);

    // Textura B: Lienzo 2D con el degradado celestial
    const lienzo_fondo = document.createElement("canvas");
    lienzo_fondo.width = ancho_dpr;
    lienzo_fondo.height = alto_dpr;
    const ctx = lienzo_fondo.getContext("2d", { alpha: true });

    let textura_fondo: THREE.CanvasTexture | null = null;

    const redibujarFondoLienzo = () => {
      if (!ctx) return;
      const ancho = lienzo_fondo.width;
      const alto = lienzo_fondo.height;

      // 1. Degradado celestial diáfano
      const gradiente = ctx.createRadialGradient(
        ancho * 0.5,
        alto * 0.42,
        alto * 0.1,
        ancho * 0.5,
        alto * 0.5,
        Math.max(ancho, alto) * 0.85
      );
      gradiente.addColorStop(0, centro_color);
      gradiente.addColorStop(0.35, es_dashboard ? "#FAFDFE" : "#F0F8FF");
      gradiente.addColorStop(0.70, es_dashboard ? "#F0F7FB" : "#E0F2FE");
      gradiente.addColorStop(1.0, borde_color);

      ctx.fillStyle = gradiente;
      ctx.fillRect(0, 0, ancho, alto);

      // 2. Anillos sutiles de agua en reposo
      ctx.save();
      ctx.strokeStyle = es_dashboard ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = (es_dashboard ? 1.0 : 1.5) * (window.devicePixelRatio || 1);
      for (let r = 80; r < Math.max(ancho, alto); r += 140) {
        ctx.beginPath();
        ctx.arc(ancho * 0.5, alto * 0.45, r * (window.devicePixelRatio || 1), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Marca de agua opcional (solo si se proporciona explícitamente imagePath o text)
      if (imagePath) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const escala = ancho / alto;
          const img_escala = img.width / img.height;
          let w: number;
          let h: number;
          if (img_escala > escala) {
            w = ancho * 0.45;
            h = w / img_escala;
          } else {
            h = alto * 0.45;
            w = h * img_escala;
          }
          const x = (ancho - w) / 2;
          const y = (alto - h) / 2;
          ctx.globalAlpha = 0.85;
          ctx.drawImage(img, x, y, w, h);
          ctx.globalAlpha = 1.0;
          if (textura_fondo) textura_fondo.needsUpdate = true;
        };
        img.src = imagePath;
      } else if (text) {
        const tamano_fuente = Math.round(180 * (window.devicePixelRatio || 1));
        ctx.fillStyle = "rgba(6, 58, 107, 0.08)";
        ctx.font = `bold ${tamano_fuente}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, ancho / 2, alto / 2);
      }

      if (textura_fondo) {
        textura_fondo.needsUpdate = true;
      }
    };

    if (ctx) {
      redibujarFondoLienzo();
      textura_fondo = new THREE.CanvasTexture(lienzo_fondo);
      textura_fondo.minFilter = THREE.LinearFilter;
      textura_fondo.magFilter = THREE.LinearFilter;
      textura_fondo.format = THREE.RGBAFormat;
    }

    // Manejo de redimensionamiento
    const manejarResize = () => {
      const w = window.innerWidth * (window.devicePixelRatio || 1);
      const h = window.innerHeight * (window.devicePixelRatio || 1);

      renderizador.setSize(window.innerWidth, window.innerHeight);
      target_a.setSize(w, h);
      target_b.setSize(w, h);
      material_simulacion.uniforms.resolution.value.set(w, h);

      lienzo_fondo.width = w;
      lienzo_fondo.height = h;
      redibujarFondoLienzo();
    };
    window.addEventListener("resize", manejarResize);

    // Eventos de ratón y toques
    const actualizarRaton = (cliente_x: number, cliente_y: number) => {
      const dpr = window.devicePixelRatio || 1;
      raton.x = cliente_x * dpr;
      raton.y = (window.innerHeight - cliente_y) * dpr;
    };

    const manejarMouseMove = (e: MouseEvent) => {
      actualizarRaton(e.clientX, e.clientY);
    };

    const manejarMouseLeave = () => {
      raton.set(-1000, -1000);
    };

    const manejarTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        actualizarRaton(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const dom = renderizador.domElement;
    dom.addEventListener("mousemove", manejarMouseMove);
    dom.addEventListener("mouseleave", manejarMouseLeave);
    dom.addEventListener("touchmove", manejarTouchMove, { passive: true });
    window.addEventListener("mousemove", manejarMouseMove);

    // Bucle de renderizado canónico de dos pasadas FBO Ping-Pong
    let anim_id: number;
    let visible = true;
    const manejarVisibilidad = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", manejarVisibilidad);

    const animar = () => {
      anim_id = requestAnimationFrame(animar);
      if (!visible) return;

      material_simulacion.uniforms.frame.value = cuadro++;
      material_simulacion.uniforms.time.value = performance.now() / 1000;
      material_simulacion.uniforms.textureA.value = target_a.texture;

      // Paso 1: Simulación física en Target B
      renderizador.setRenderTarget(target_b);
      renderizador.render(escena_simulacion, camara);

      // Paso 2: Renderizado final en pantalla distorsionando Textura B
      material_renderizado.uniforms.textureA.value = target_b.texture;
      material_renderizado.uniforms.textureB.value = textura_fondo;

      renderizador.setRenderTarget(null);
      renderizador.render(escena_principal, camara);

      // Intercambio (Ping-Pong swap) de buffers
      const temp = target_a;
      target_a = target_b;
      target_b = temp;
    };

    animar();

    return () => {
      cancelAnimationFrame(anim_id);
      window.removeEventListener("resize", manejarResize);
      window.removeEventListener("mousemove", manejarMouseMove);
      document.removeEventListener("visibilitychange", manejarVisibilidad);
      dom.removeEventListener("mousemove", manejarMouseMove);
      dom.removeEventListener("mouseleave", manejarMouseLeave);
      dom.removeEventListener("touchmove", manejarTouchMove);
      renderizador.dispose();
      target_a.dispose();
      target_b.dispose();
      geometria_plano.dispose();
      material_simulacion.dispose();
      material_renderizado.dispose();
      if (textura_fondo) textura_fondo.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [
    imagePath,
    text,
    centro_color,
    borde_color,
    distorsion_valor,
    especular_valor,
    raton_valor,
    autonoma_valor,
    es_dashboard,
  ]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div ref={contenedor_ref} className="absolute inset-0 w-full h-full pointer-events-auto" />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
};
