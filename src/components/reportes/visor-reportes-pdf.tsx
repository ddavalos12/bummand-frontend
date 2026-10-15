"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Printer, CheckCircle, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ReporteItem {
  id: number;
  titulo: string;
  tipo: "asistencia" | "pasajes" | "evaluacion_f03" | "consolidado_360";
  periodo: string;
  fecha_generacion: string;
  becario_nombre: string;
  tamano_kb: number;
  estado: "emitido" | "en_proceso";
}

const REPORTES_INICIALES: ReporteItem[] = [
  {
    id: 1,
    titulo: "Informe Mensual de Horas y Prácticas Preprofesionales",
    tipo: "asistencia",
    periodo: "Septiembre 2026",
    fecha_generacion: "2026-09-30 18:30",
    becario_nombre: "Nilda Amalia Churata Paye",
    tamano_kb: 420,
    estado: "emitido",
  },
  {
    id: 2,
    titulo: "Formulario Oficial de Devolución del 80% de Pasajes",
    tipo: "pasajes",
    periodo: "Septiembre 2026",
    fecha_generacion: "2026-09-28 14:15",
    becario_nombre: "Nilda Amalia Churata Paye",
    tamano_kb: 310,
    estado: "emitido",
  },
  {
    id: 3,
    titulo: "Formulario F-03: Evaluación Pastoral y Eclesiástica",
    tipo: "evaluacion_f03",
    periodo: "Semestre II - 2026",
    fecha_generacion: "2026-09-20 11:00",
    becario_nombre: "Edgar Elias Alarcon Huanca",
    tamano_kb: 285,
    estado: "emitido",
  },
  {
    id: 4,
    titulo: "Certificado Integral de Desempeño y Liderazgo 360°",
    tipo: "consolidado_360",
    periodo: "Semestre I - 2026",
    fecha_generacion: "2026-07-02 09:45",
    becario_nombre: "Adai Belen Huayta Cardozo",
    tamano_kb: 650,
    estado: "emitido",
  },
];

export function VisorReportesPdf() {
  const [reportes, set_reportes] = useState<ReporteItem[]>(REPORTES_INICIALES);
  const [generando, set_generando] = useState(false);
  const [mensaje_exito, set_mensaje_exito] = useState("");

  const manejarGenerarNuevoReporte = (tipo: ReporteItem["tipo"], titulo: string) => {
    set_generando(true);
    set_mensaje_exito("");

    setTimeout(() => {
      const nuevo: ReporteItem = {
        id: reportes.length + 1,
        titulo,
        tipo,
        periodo: "Octubre 2026",
        fecha_generacion: new Date().toISOString().replace("T", " ").substring(0, 16),
        becario_nombre: "Nilda Amalia Churata Paye",
        tamano_kb: 380,
        estado: "emitido",
      };
      set_reportes([nuevo, ...reportes]);
      set_generando(false);
      set_mensaje_exito(`Reporte "${titulo}" generado exitosamente en formato oficial BUMAND.`);
    }, 1200);
  };

  const generarHtmlReporte = (reporte: ReporteItem): string => {
    let seccion_especifica = "";

    if (reporte.tipo === "asistencia") {
      seccion_especifica = `
        <div class="resumen">
          <div><strong>Horas Programadas</strong><span>120 hrs</span></div>
          <div><strong>Horas Efectivas</strong><span>128 hrs</span></div>
          <div><strong>Cumplimiento</strong><span style="color:#059669;">106.6% (Cumplido)</span></div>
          <div><strong>Geocerca GPS</strong><span>100% Convalidada</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Horas</th>
              <th>Sede / Geocerca</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>02/09/2026</td><td>08:30 - 12:30</td><td>4.0 hrs</td><td>Sede Sopocachi (La Paz)</td><td class="badge-verde">Acreditado GPS</td></tr>
            <tr><td>05/09/2026</td><td>08:25 - 12:40</td><td>4.25 hrs</td><td>Oficina Central El Alto</td><td class="badge-verde">Acreditado GPS</td></tr>
            <tr><td>09/09/2026</td><td>08:30 - 13:00</td><td>4.5 hrs</td><td>Auditorio Miraflores</td><td class="badge-verde">Acreditado GPS</td></tr>
            <tr><td>14/09/2026</td><td>08:30 - 12:30</td><td>4.0 hrs</td><td>Sede Sopocachi (La Paz)</td><td class="badge-verde">Acreditado GPS</td></tr>
            <tr><td>21/09/2026</td><td>08:28 - 12:32</td><td>4.0 hrs</td><td>Oficina Central El Alto</td><td class="badge-verde">Acreditado GPS</td></tr>
            <tr><td>28/09/2026</td><td>08:30 - 12:30</td><td>4.0 hrs</td><td>Auditorio Miraflores</td><td class="badge-verde">Acreditado GPS</td></tr>
          </tbody>
        </table>
        <div class="firmas">
          <div class="firma"><div class="linea-firma"></div><strong>Supervisor de Prácticas</strong><br/>Fundación Diaconía FRIF-IFD</div>
          <div class="firma"><div class="linea-firma"></div><strong>Coordinación BUMAND</strong><br/>Control Académico Institucional</div>
        </div>
      `;
    } else if (reporte.tipo === "pasajes") {
      seccion_especifica = `
        <div class="resumen">
          <div><strong>Gasto Total Declarado</strong><span>Bs 345.00</span></div>
          <div><strong>Reembolso 80% BUMAND</strong><span style="color:#063A6B; font-weight:800;">Bs 276.00</span></div>
          <div><strong>Días Hábiles Computados</strong><span>23 días</span></div>
          <div><strong>Estado Liquidación</strong><span style="color:#059669;">Aprobado</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tramo de Transporte</th>
              <th>Medio Empleado</th>
              <th>Tarifa Base</th>
              <th>80% Reembolsable</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Zona 16 de Julio (El Alto) ↔ Cruce Viacha</td><td>Minibús Interurbano</td><td>Bs 2.50</td><td>Bs 2.00</td><td class="badge-verde">Convalidado</td></tr>
            <tr><td>Cruce Viacha ↔ Sede Sopocachi (La Paz)</td><td>Teleférico Plateada / Morada</td><td>Bs 5.00</td><td>Bs 4.00</td><td class="badge-verde">Convalidado</td></tr>
            <tr><td>Sede Sopocachi ↔ Campus Universitario</td><td>Micro / Transporte Urbano</td><td>Bs 2.00</td><td>Bs 1.60</td><td class="badge-verde">Convalidado</td></tr>
          </tbody>
        </table>
        <div class="firmas">
          <div class="firma"><div class="linea-firma"></div><strong>Firma del Becario</strong><br/>${reporte.becario_nombre}</div>
          <div class="firma"><div class="linea-firma"></div><strong>Administración Financiera</strong><br/>Fundación Diaconía FRIF-IFD</div>
        </div>
      `;
    } else if (reporte.tipo === "evaluacion_f03") {
      seccion_especifica = `
        <div class="resumen">
          <div><strong>Calificación Pastoral</strong><span style="color:#059669;">96 / 100</span></div>
          <div><strong>Asistencia a Cultos</strong><span>100%</span></div>
          <div><strong>Servicio Eclesiástico</strong><span>Activo y Comprometido</span></div>
          <div><strong>Evaluación F-03</strong><span>Semestral Aprobada</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Criterio Pastoral Evaluado</th>
              <th>Puntaje</th>
              <th>Observaciones Pastorales</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Testimonio de vida y carácter cristiano irreprensible</td><td>25 / 25 pts</td><td>Excelente conducta dentro y fuera de la congregación.</td></tr>
            <tr><td>Compromiso y puntualidad en ministerios asignados</td><td>24 / 25 pts</td><td>Participación activa y colaborativa en alabanza y enseñanza.</td></tr>
            <tr><td>Vida devocional, oración y estudio bíblico personal</td><td>24 / 25 pts</td><td>Constante lectura bíblica y crecimiento en la fe.</td></tr>
            <tr><td>Integración comunitaria y servicio al prójimo</td><td>23 / 25 pts</td><td>Disposición de servicio genuino y testimonio diaconal.</td></tr>
          </tbody>
        </table>
        <div class="firmas">
          <div class="firma"><div class="linea-firma"></div><strong>Pastor de la Congregación</strong><br/>Firma y Sello Eclesiástico</div>
          <div class="firma"><div class="linea-firma"></div><strong>Capellanía Institucional</strong><br/>Programa BUMAND · FRIF-IFD</div>
        </div>
      `;
    } else {
      seccion_especifica = `
        <div class="resumen">
          <div><strong>Promedio Integral 360°</strong><span style="color:#063A6B; font-weight:800;">95.2 / 100</span></div>
          <div><strong>Prácticas Preprofesionales</strong><span>98%</span></div>
          <div><strong>Evaluación Pastoral F-03</strong><span>96%</span></div>
          <div><strong>Escuelas de Líderes</strong><span>100%</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Dimensión Institucional</th>
              <th>Puntaje Ponderado</th>
              <th>Nivel de Desempeño</th>
              <th>Dictamen</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Prácticas Preprofesionales y Cumplimiento Horas</td><td>98.0 / 100</td><td>Sobresaliente</td><td class="badge-verde">Acreditado</td></tr>
            <tr><td>Compromiso Eclesiástico y Pastoral (F-03)</td><td>96.0 / 100</td><td>Sobresaliente</td><td class="badge-verde">Acreditado</td></tr>
            <tr><td>Asistencia a Encuentros y Escuelas Diaconales</td><td>100.0 / 100</td><td>Excelente</td><td class="badge-verde">Acreditado</td></tr>
            <tr><td>Rendimiento Académico Universitario</td><td>86.8 / 100</td><td>Aprobado</td><td class="badge-verde">Acreditado</td></tr>
          </tbody>
        </table>
        <div class="firmas">
          <div class="firma"><div class="linea-firma"></div><strong>Dirección Ejecutiva</strong><br/>Fundación Diaconía FRIF-IFD</div>
          <div class="firma"><div class="linea-firma"></div><strong>Coordinación Nacional BUMAND</strong><br/>Dirección de Programa de Becas</div>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reporte.titulo} - BUMAND</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 20mm 15mm 20mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
      font-size: 12px;
    }
    .header {
      border-bottom: 2.5px solid #063A6B;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .titulo {
      font-size: 17px;
      font-weight: 800;
      color: #063A6B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .subtitulo {
      font-size: 11px;
      color: #5B6D77;
      margin-top: 4px;
      font-weight: 600;
    }
    .folio {
      font-family: monospace;
      font-size: 11px;
      color: #063A6B;
      background: #F0F4F8;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #CBD5E1;
      text-align: right;
    }
    .datos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-bottom: 14px;
      font-size: 11.5px;
      background: #F8F9FA;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #E3DCCB;
    }
    .datos-grid p { margin: 2px 0; }
    .datos-grid strong { color: #063A6B; }
    .resumen {
      display: flex;
      gap: 16px;
      margin: 14px 0;
      background: #F0F9FA;
      padding: 10px 14px;
      border-radius: 8px;
      border-left: 4px solid #17B4C4;
    }
    .resumen div { flex: 1; }
    .resumen strong { color: #063A6B; display: block; font-size: 10px; text-transform: uppercase; }
    .resumen span { font-size: 15px; font-weight: bold; color: #063A6B; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      font-size: 11px;
    }
    th {
      background: #063A6B;
      color: #FFFFFF;
      padding: 7px 8px;
      text-align: left;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    td {
      border-bottom: 1px solid #E2E8F0;
      padding: 7px 8px;
    }
    tr:nth-child(even) td { background-color: #F8FAFC; }
    .badge-verde { color: #059669; font-weight: 700; }
    .firmas {
      margin-top: 48px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .firma {
      width: 42%;
      text-align: center;
      font-size: 11px;
    }
    .linea-firma {
      border-top: 1px solid #063A6B;
      margin-bottom: 6px;
    }
    .pie-pagina {
      margin-top: 28px;
      padding-top: 8px;
      border-top: 1px solid #CBD5E1;
      font-size: 9px;
      color: #64748B;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      .no-imprimir { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="titulo">${reporte.titulo}</h1>
      <div class="subtitulo">Fundación Diaconía FRIF-IFD · Programa Institucional BUMAND</div>
    </div>
    <div class="folio">
      <strong>Folio:</strong> REP-${reporte.tipo.toUpperCase()}-${reporte.id}<br/>
      <strong>Fecha:</strong> ${reporte.fecha_generacion}
    </div>
  </div>

  <div class="datos-grid">
    <p><strong>Becario Titular:</strong> ${reporte.becario_nombre}</p>
    <p><strong>Periodo Académico:</strong> ${reporte.periodo}</p>
    <p><strong>Estado del Documento:</strong> Convalidado y Emitido Oficialmente</p>
    <p><strong>Hash de Verificación:</strong> SHA256-BMND-${reporte.id}${reporte.tamano_kb}</p>
  </div>

  ${seccion_especifica}

  <div class="pie-pagina">
    <span>Documento oficial con validez institucional · BUMAND FRIF-IFD</span>
    <span>Página 1 de 1 · Generado electrónicamente conforme a reglamento</span>
  </div>
</body>
</html>`;
  };

  const manejarDescargarPdf = (reporteOtitulo: ReporteItem | string) => {
    const item =
      typeof reporteOtitulo === "object"
        ? reporteOtitulo
        : reportes.find((r) => r.titulo === reporteOtitulo) || {
            id: 99,
            titulo: reporteOtitulo,
            tipo: "asistencia" as const,
            periodo: "Periodo Actual 2026",
            fecha_generacion: new Date().toISOString().replace("T", " ").substring(0, 16),
            becario_nombre: "Nilda Amalia Churata Paye",
            tamano_kb: 380,
            estado: "emitido" as const,
          };

    try {
      const contenido_html = generarHtmlReporte(item);
      const ventana = window.open("", "_blank");
      if (!ventana) {
        toast.error("Ventana emergente bloqueada", {
          description: "Por favor permite las ventanas emergentes para abrir el documento de impresión.",
        });
        return;
      }
      ventana.document.write(contenido_html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => {
        ventana.print();
      }, 300);

      toast.success("Documento preparado para impresión / PDF", {
        description: `Se abrió la vista oficial de "${item.titulo}".`,
      });
    } catch (_error) {
      toast.error("Error al emitir el reporte PDF", {
        description: "Hubo una incidencia al preparar la vista de impresión.",
      });
    }
  };

  const simularDescarga = (titulo: string) => {
    manejarDescargarPdf(titulo);
  };

  return (
    <div className="space-y-6">
      {/* Botones de Emisión Inmediata de Reportes */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#17B4C4]" />
              Generador Oficial de Documentos y Reportes PDF
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Emite documentos con formato institucional idéntico a las planillas físicas originales para archivo y auditoría.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logos/logo-bumand.svg" alt="BUMAND" className="h-8 w-auto object-contain" />
            <img src="/logos/logo-diaconia.svg" alt="Diaconía IFD" className="h-5 w-auto object-contain opacity-80" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {mensaje_exito && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {mensaje_exito}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "asistencia",
                  "Informe Mensual de Horas y Prácticas Preprofesionales"
                )
              }
              className="h-11 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 justify-center"
            >
              <FileText className="w-4 h-4 text-[#7FE0E6]" />
              Emitir Planilla Horas
            </Button>

            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "pasajes",
                  "Formulario de Devolución 80% Pasajes"
                )
              }
              className="h-11 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center"
            >
              <Sparkles className="w-4 h-4" />
              Emitir 80% Pasajes
            </Button>

            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "evaluacion_f03",
                  "Formulario Pastoral F-03"
                )
              }
              variant="outline"
              className="h-11 border-[#E3DCCB] text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Emitir Formulario F-03
            </Button>

            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "consolidado_360",
                  "Certificado Semestral 360°"
                )
              }
              variant="outline"
              className="h-11 border-[#063A6B] text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-[#063A6B]/5"
            >
              <Printer className="w-4 h-4 text-[#063A6B]" />
              Consolidado 360°
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Documentos Emitidos */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <CardTitle className="text-base font-bold font-display text-[#063A6B]">
            Historial de Reportes Emitidos y Archivados
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Auditoría de documentos digitales generados y firmados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/60">
              <TableRow className="border-b border-[#E3DCCB]">
                <TableHead className="font-bold text-[#063A6B]">Documento Oficial</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Periodo</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Becario</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Fecha Emisión</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportes.map((r) => (
                <TableRow key={r.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 text-xs">
                  <TableCell className="font-semibold text-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#063A6B]/5 text-[#063A6B]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span>{r.titulo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] font-bold text-muted-foreground">
                    {r.periodo}
                  </TableCell>
                  <TableCell>{r.becario_nombre}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {r.fecha_generacion}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => manejarDescargarPdf(r)}
                      className="h-8 px-2.5 border-[#17B4C4] text-[#063A6B] hover:bg-[#17B4C4]/10 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#17B4C4]" />
                      Descargar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
