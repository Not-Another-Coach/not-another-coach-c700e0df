import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
        const { svg } = await mermaid.render(`${id}-svg`, mermaidCode);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Mermaid render failed", err);
      }
    };
    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [id, mermaidCode]);

  const handleDownloadPdf = async () => {
    const node = containerRef.current;
    if (!node) return;

    try {
      const bg = getComputedStyle(document.body).backgroundColor;
      const canvas = await html2canvas(node, { backgroundColor: bg || undefined, scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: canvas.width >= canvas.height ? "landscape" : "portrait", unit: "mm", format: "a4" });
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

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST");
      pdf.setProperties({ title });
      pdf.save(`${id}.pdf`);
      toast({ title: "Exported", description: `${title} downloaded as PDF.` });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PDF export failed", err);
      toast({ title: "Export failed", description: "Could not generate PDF for this diagram.", variant: "destructive" });
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
