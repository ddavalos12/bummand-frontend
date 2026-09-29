# BACKLOG GENERAL DEL SISTEMA BUMAND

## Sprints Completados (Referencia histórica)
- **Sprint 1-3:** Autenticación, estructura base de BD, gestión de usuarios.
- **Sprint 4:** Declaración y Aprobación de Pasajes (Módulo 80% de devolución). Flujo de Ida -> Vuelta. Lógica aritmética en servidor.

## Sprints Pendientes para la Migración y Futuro
- **Fase Inicial (Migración Técnica - *En Curso*):**
  - [ ] Migrar el esqueleto web (Vite/React) a **Next.js (App Router) + TypeScript + Shadcn UI**.
  - [ ] Refactorizar **bumand-api** (Node/Express JS) a **TypeScript** puro, manteniendo Prisma ORM (Descartar TypeORM).
  - [ ] Trasladar el código de **bumand_app** (Flutter) a `new-bumanss/bumand-movil` manteniendo arquitectura nativa (Descartar Tauri Mobile/Rust).
  
- **Sprint 5: Prácticas Preprofesionales**
  - [ ] Registro de horas acumuladas de los becarios.
  - [ ] Sistema de Firma Digital (Aprobación electrónica de supervisores).
  
- **Sprint 6: Evaluación 360°**
  - [ ] Digitalización del Formulario Pastoral F-03.
  - [ ] Módulos académicos para calcular rankings semestrales.

- **Sprint 7: Dashboard Administrativo**
  - [ ] Tarjetas estadísticas de rendimiento y presupuesto (viáticos).
  - [ ] Gráficos interactivos de indicadores de puntualidad (Data Tables).

- **Sprint 8: Motor de Reportes y Notificaciones Push**
  - [ ] Integración de **Puppeteer-Core** en backend para generación PDF de Formularios (F-03, asistencia, pasajes).
  - [ ] Integración de FCM (Firebase Cloud Messaging) para notificaciones de aprobaciones y rechazos.

- **Sprint 9: QA e Integración Final**
  - [ ] Pruebas de campo (App Flutter en Android) para geolocalización Haversine.
  - [ ] Empaquetado final y despliegue de los servicios.
