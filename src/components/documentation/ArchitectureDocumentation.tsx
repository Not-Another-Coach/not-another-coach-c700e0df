import React from "react";
import { architectureDiagrams } from "@/utils/architectureDiagrams";
import { DiagramCard } from "@/components/documentation/DiagramCard";
import { EngineerGuidelines } from "@/components/documentation/EngineerGuidelines";

export const ArchitectureDocumentation: React.FC = () => {
  return (
    <section>
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Architecture</h2>
        <p className="text-muted-foreground">High-level system design, data model, key flows, and engineering guidelines.</p>
      </header>
      <div className="space-y-10">
        <EngineerGuidelines />
        <div className="space-y-6">
          {architectureDiagrams.map((d) => (
            <article key={d.id}>
              <DiagramCard id={d.id} title={d.title} description={d.description} mermaid={d.mermaid} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
