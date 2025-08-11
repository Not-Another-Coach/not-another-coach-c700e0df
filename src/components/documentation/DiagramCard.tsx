import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDiagnostics } from "@/diagnostics/DiagnosticsContext";

let mermaidInitialized = false;

export interface DiagramCardProps {
  id: string;
  title: string;
  description?: string;
  mermaid: string;
}

export const DiagramCard: React.FC<DiagramCardProps> = ({ id, title, description, mermaid: mermaidCode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const { add } = useDiagnostics();
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      // Initialize once
      mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
      mermaidInitialized = true;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const renderDiagram = async () => {
      try {
        const code = (mermaidCode || "").trim();
        // Simple pre-validation of Mermaid code to avoid throwing on empty/invalid strings
        if (!code || !/(^|\n)\s*(graph|sequenceDiagram|classDiagram|erDiagram|journey|gantt)\b/.test(code)) {
          setRenderError("Invalid or unsupported Mermaid syntax.");
          add({ level: "warn", source: "DiagramCard", message: "Mermaid pre-validation failed", details: code.slice(0, 160) });
          return;
        }
        const { svg } = await mermaid.render(`${id}-svg`, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRenderError(null);
        }
      } catch (err: any) {
        if (!cancelled) setRenderError("Diagram failed to render.");
        add({ level: "error", source: "DiagramCard", message: "Mermaid render failed", details: String(err?.stack || err) });
      }
    };
    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [id, mermaidCode, add]);

  const handleDownloadPdf = async () => {
    const node = containerRef.current;
    if (!node) return;

    // Ensure the diagram SVG exists (Mermaid render is async)
    let svg = node.querySelector('svg') as SVGSVGElement | null;
    if (!svg) {
      // Wait briefly for render
      await new Promise((r) => setTimeout(r, 150));
      svg = node.querySelector('svg');
    }

    const fallbackHtml2Canvas = async () => {
      try {
        const bg = getComputedStyle(document.body).backgroundColor;
        const canvas = await html2canvas(node, { backgroundColor: bg || '#ffffff', scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10; // mm
        const drawableWidth = pageWidth - margin * 2;
        const drawableHeight = pageHeight - margin * 2;
        const ratio = Math.min(drawableWidth / canvas.width, drawableHeight / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
        pdf.setProperties({ title });
        pdf.save(`${id}.pdf`);
        toast({ title: 'Exported', description: `${title} downloaded as PDF.` });
      } catch (err) {
        console.error('PDF export failed', err);
        toast({ title: 'Export failed', description: 'Could not generate PDF for this diagram.', variant: 'destructive' });
      }
    };

    if (!svg) {
      // No SVG yet – use fallback to capture the node
      return fallbackHtml2Canvas();
    }

    // Serialize SVG with xmlns to improve rasterization reliability
    try {
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!svgString.startsWith('<?xml')) {
        svgString = `<?xml version="1.0" encoding="UTF-8"?>\n` + svgString;
      }

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.decoding = 'async';
      img.onload = async () => {
        try {
          // Determine intrinsic size
          const vb = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
          let rawWidth = vb && vb.width ? vb.width : (svg.width.baseVal?.value || svg.clientWidth || 1200);
          let rawHeight = vb && vb.height ? vb.height : (svg.height.baseVal?.value || svg.clientHeight || 800);

          // As another fallback, use getBBox if dimension is 0
          if (!rawWidth || !rawHeight) {
            try {
              const bbox = svg.getBBox();
              rawWidth = rawWidth || bbox.width || 1200;
              rawHeight = rawHeight || bbox.height || 800;
            } catch {}
          }

          const scale = 2; // improve sharpness
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(rawWidth * scale));
          canvas.height = Math.max(1, Math.floor(rawHeight * scale));

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas not supported');

          const bg = getComputedStyle(document.body).backgroundColor || '#ffffff';
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          URL.revokeObjectURL(url);

          const pdf = new jsPDF({ orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 10; // mm
          const drawableWidth = pageWidth - margin * 2;
          const drawableHeight = pageHeight - margin * 2;
          const ratio = Math.min(drawableWidth / canvas.width, drawableHeight / canvas.height);
          const imgWidth = canvas.width * ratio;
          const imgHeight = canvas.height * ratio;
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;

          const dataUrl = canvas.toDataURL('image/png');
          pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
          pdf.setProperties({ title });
          pdf.save(`${id}.pdf`);
          toast({ title: 'Exported', description: `${title} downloaded as PDF.` });
        } catch (err) {
          console.error('SVG -> PDF failed, falling back to html2canvas', err);
          await fallbackHtml2Canvas();
        }
      };
      img.onerror = async (e) => {
        console.error('SVG image load failed', e);
        URL.revokeObjectURL(url);
        await fallbackHtml2Canvas();
      };
      img.src = url;
    } catch (err) {
      console.error('SVG serialization failed, falling back to html2canvas', err);
      await fallbackHtml2Canvas();
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleDownloadPdf} aria-label={`Download ${title} as PDF`}>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full overflow-auto rounded-md border"
          aria-label={`${title} diagram`}
        />
      </CardContent>
    </Card>
  );
};
