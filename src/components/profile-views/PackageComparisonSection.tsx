import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PackageComparisonTable } from "./PackageComparisonTable";
import { PackageComparisonMatrix } from "./PackageComparisonMatrix";
import { TrainerPackageExtended } from "@/types/trainer";
import { PackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";

interface PackageComparisonSectionProps {
  baseInclusions?: string[];
  packages: TrainerPackageExtended[];
  packageWorkflows?: PackageWaysOfWorking[];
  highlightedPackageId?: string;
}

export function PackageComparisonSection({ 
  baseInclusions = [], 
  packages,
  packageWorkflows = [],
  highlightedPackageId 
}: PackageComparisonSectionProps) {
  if (!packages || packages.length === 0) {
    return null;
  }

  // Default base inclusions if none provided
  const defaultBaseInclusions = [
    "Personalised training plan",
    "Progress tracking & check-ins",
    "Ongoing support"
  ];

  const displayBaseInclusions = baseInclusions.length > 0 ? baseInclusions : defaultBaseInclusions;

  // Show detailed matrix if workflows are available, otherwise show basic table
  const showDetailedMatrix = packageWorkflows.length > 0;

  return (
    <div className="space-y-6">
      {/* What's Always Included Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            What's Always Included
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These are included in all packages
          </p>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayBaseInclusions.map((inclusion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{inclusion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Packages Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Training Packages</CardTitle>
          <p className="text-sm text-muted-foreground">
            {showDetailedMatrix 
              ? 'Compare packages and see what\'s included in each'
              : 'Choose the package that best fits your goals'
            }
          </p>
        </CardHeader>
        <CardContent>
          {showDetailedMatrix ? (
            <PackageComparisonMatrix
              packages={packages}
              packageWorkflows={packageWorkflows}
              baseInclusions={displayBaseInclusions}
              highlightedPackageId={highlightedPackageId}
            />
          ) : (
            <PackageComparisonTable 
              packages={packages} 
              highlightedPackageId={highlightedPackageId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
