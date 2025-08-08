import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icons: LucideIcon[];
  title: string;
  description: string;
}

export function SectionHeader({ icons, title, description }: SectionHeaderProps) {
  return (
    <div className="text-center space-y-2 mb-6">
      <div className="flex items-center justify-center gap-2 text-primary">
        {icons.map((Icon, index) => (
          <Icon key={index} className="w-6 h-6" />
        ))}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
}