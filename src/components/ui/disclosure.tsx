import * as React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclosureProps {
  id: string; // base id to connect trigger/content
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({ id, summary, children, defaultOpen = false, className }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  const contentId = `${id}-content`;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger
        className={cn("flex w-full items-center justify-between py-2 text-left", open && "font-medium")}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span>{summary}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")}/>
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} role="region" aria-labelledby={id} className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default Disclosure;
