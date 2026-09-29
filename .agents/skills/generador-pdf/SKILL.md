---
name: generador-pdf
description: Skill para compilar archivos LaTeX (.tex) y Markdown (.md) a PDF, y limpiar archivos residuales.
---

# Instrucciones para el Generador de PDF

Cuando se te pida generar un documento PDF a partir de `.tex` o `.md`:

1. **Si es Markdown (`.md`):**
   Utiliza Pandoc o el motor correspondiente para generar el PDF (ej. `npx md-to-pdf <archivo>.md`).

2. **Si es LaTeX (`.tex`):**
   Ejecuta el compilador local, preferiblemente `pdflatex`:
   ```bash
   pdflatex -interaction=nonstopmode <archivo>.tex
   ```
   (Puede requerir dos pasadas si hay índice o referencias cruzadas).

3. **Limpieza Residual Inmediata:**
   Tan pronto como el `.pdf` sea generado exitosamente, DEBES eliminar los archivos auxiliares generados en el directorio local:
   ```bash
   rm *.aux *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk
   ```

4. **Gestión de Repositorio:**
   Asegúrate de que `.gitignore` contenga la regla para ignorar `*.tex` (y sus auxiliares) pero **permitir** la subida de `*.pdf` (a menos que el usuario especifique lo contrario, pero la regla general solicitada es: "no subida de los *.tex* pero sí de los PDF").
