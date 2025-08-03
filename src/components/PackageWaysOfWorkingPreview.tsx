import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { usePackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";

interface PackageWaysOfWorkingPreviewProps {
  packages: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
  }>;
}

export function PackageWaysOfWorkingPreview({ packages }: PackageWaysOfWorkingPreviewProps) {
  const { packageWorkflows, loading } = usePackageWaysOfWorking();
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  const togglePackageExpansion = (packageId: string) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId);
    } else {
      newExpanded.add(packageId);
    }
    setExpandedPackages(newExpanded);
  };

  const getPackageWorkflow = (packageId: string) => {
    return packageWorkflows.find(workflow => workflow.package_id === packageId);
  };

  const hasAnyWorkflow = packageWorkflows.length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading package workflows...</div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyWorkflow) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ways of Working by Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {packages.map(pkg => {
          const workflow = getPackageWorkflow(pkg.id);
          if (!workflow) return null;

          const isExpanded = expandedPackages.has(pkg.id);
          const hasContent = [
            workflow.onboarding_items,
            workflow.first_week_items,
            workflow.ongoing_structure_items,
            workflow.tracking_tools_items,
            workflow.client_expectations_items,
            workflow.what_i_bring_items
          ].some(items => items && items.length > 0);

          if (!hasContent) return null;

          return (
            <Collapsible key={pkg.id} open={isExpanded} onOpenChange={() => togglePackageExpansion(pkg.id)}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-muted-foreground">
                        £{pkg.price}/{pkg.duration}
                        {workflow.visibility === 'post_match' && (
                          <Badge variant="secondary" className="ml-2 text-xs">Post-Match Only</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3 space-y-4 pl-4 border-l-2 border-muted">
                {workflow.onboarding_items?.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">Onboarding Process</h5>
                    <div className="space-y-1">
                      {workflow.onboarding_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.first_week_items?.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">First Week Experience</h5>
                    <div className="space-y-1">
                      {workflow.first_week_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.ongoing_structure_items?.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">Ongoing Structure</h5>
                    <div className="space-y-1">
                      {workflow.ongoing_structure_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.tracking_tools_items?.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">Tracking & Progress Tools</h5>
                    <div className="flex flex-wrap gap-2">
                      {workflow.tracking_tools_items.map((item: any) => (
                        <Badge key={item.id} variant="outline" className="text-xs">
                          {item.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.client_expectations_items?.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">What I Expect From Clients</h5>
                    <div className="space-y-1">
                      {workflow.client_expectations_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.what_i_bring_items?.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 text-sm">What I Bring</h5>
                    <div className="space-y-1">
                      {workflow.what_i_bring_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}