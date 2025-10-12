import { TrainerPackageExtended } from "@/types/trainer";
import { PackageWaysOfWorking } from "@/hooks/usePackageWaysOfWorking";
import { Check, Minus, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCurrencySymbol, formatPackageDuration } from "@/lib/packagePaymentUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface PackageComparisonMatrixProps {
  packages: TrainerPackageExtended[];
  packageWorkflows: PackageWaysOfWorking[];
  baseInclusions?: string[];
  highlightedPackageId?: string;
}

interface Feature {
  id: string;
  name: string;
  tooltip: string;
  presentInPackages: Set<string>;
}

interface FeatureCategory {
  id: string;
  label: string;
  features: Feature[];
}

export function PackageComparisonMatrix({ 
  packages, 
  packageWorkflows,
  baseInclusions = [],
  highlightedPackageId 
}: PackageComparisonMatrixProps) {
  const [openPackages, setOpenPackages] = useState<Set<string>>(new Set());
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  if (!packages || packages.length === 0) {
    return null;
  }

  // Toggle package accordion
  const togglePackage = (packageId: string) => {
    setOpenPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  // Build feature categories from all packages
  const buildFeatureCategories = (): FeatureCategory[] => {
    const categories: FeatureCategory[] = [];

    // 1. Base Features (always included)
    if (baseInclusions.length > 0) {
      categories.push({
        id: 'base',
        label: 'Base Features',
        features: baseInclusions.map((inclusion, idx) => ({
          id: `base-${idx}`,
          name: inclusion,
          tooltip: 'Included in all packages',
          presentInPackages: new Set(packages.map(p => p.id))
        }))
      });
    }

    // 2. Extra Inclusions (package-specific)
    const extraFeaturesMap = new Map<string, Feature>();
    packages.forEach(pkg => {
      if (pkg.extraInclusions && pkg.extraInclusions.length > 0) {
        pkg.extraInclusions.forEach(inclusion => {
          const featureId = `extra-${inclusion.toLowerCase().replace(/\s+/g, '-')}`;
          if (!extraFeaturesMap.has(featureId)) {
            extraFeaturesMap.set(featureId, {
              id: featureId,
              name: inclusion,
              tooltip: 'Additional benefit included in select packages',
              presentInPackages: new Set([pkg.id])
            });
          } else {
            extraFeaturesMap.get(featureId)!.presentInPackages.add(pkg.id);
          }
        });
      }
    });

    if (extraFeaturesMap.size > 0) {
      categories.push({
        id: 'extra',
        label: 'Extra Inclusions',
        features: Array.from(extraFeaturesMap.values())
      });
    }

    // 3-8. Ways of Working Features
    const workflowCategories: Array<{
      id: string;
      label: string;
      itemsKey: keyof Pick<PackageWaysOfWorking, 'onboarding_items' | 'first_week_items' | 'ongoing_structure_items' | 'tracking_tools_items' | 'client_expectations_items' | 'what_i_bring_items'>;
      tooltipPrefix: string;
    }> = [
      { id: 'onboarding', label: 'Onboarding Process', itemsKey: 'onboarding_items', tooltipPrefix: 'Part of the initial onboarding' },
      { id: 'first_week', label: 'First Week Experience', itemsKey: 'first_week_items', tooltipPrefix: 'Included in your first week' },
      { id: 'ongoing', label: 'Ongoing Structure', itemsKey: 'ongoing_structure_items', tooltipPrefix: 'Part of ongoing support' },
      { id: 'tracking', label: 'Tracking & Tools', itemsKey: 'tracking_tools_items', tooltipPrefix: 'Tools for tracking progress' },
      { id: 'expectations', label: 'What You Bring', itemsKey: 'client_expectations_items', tooltipPrefix: 'Expected from you as a client' },
      { id: 'trainer_brings', label: 'What Trainer Brings', itemsKey: 'what_i_bring_items', tooltipPrefix: 'Trainer provides' }
    ];

    workflowCategories.forEach(category => {
      const featuresMap = new Map<string, Feature>();
      
      packageWorkflows.forEach(workflow => {
        const items = workflow[category.itemsKey] || [];
        items.forEach((item: { id: string; text: string }) => {
          const featureId = `${category.id}-${item.text.toLowerCase().replace(/\s+/g, '-')}`;
          if (!featuresMap.has(featureId)) {
            featuresMap.set(featureId, {
              id: featureId,
              name: item.text,
              tooltip: category.tooltipPrefix,
              presentInPackages: new Set([workflow.package_id])
            });
          } else {
            featuresMap.get(featureId)!.presentInPackages.add(workflow.package_id);
          }
        });
      });

      if (featuresMap.size > 0) {
        categories.push({
          id: category.id,
          label: category.label,
          features: Array.from(featuresMap.values())
        });
      }
    });

    return categories;
  };

  const featureCategories = buildFeatureCategories();

  // Desktop table view
  const DesktopView = () => (
    <Collapsible open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
      <div className="mb-4">
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full bg-primary hover:bg-primary-600 text-primary-foreground border-primary-200"
          >
            <span className="font-medium">Compare All Packages</span>
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isComparisonOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Package Headers */}
            <thead>
              <tr className="border-b-2 border-primary-200">
                <th className="sticky left-0 z-10 bg-background text-left p-4 font-semibold min-w-[200px] text-primary shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">Feature</th>
                {packages.map(pkg => (
                  <th 
                    key={pkg.id} 
                    className={`p-4 text-center min-w-[150px] ${
                      highlightedPackageId === pkg.id ? 'bg-energy-50/30' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`font-semibold text-base ${highlightedPackageId === pkg.id ? 'text-primary' : ''}`}>
                        {pkg.name}
                      </div>
                      {highlightedPackageId === pkg.id && (
                        <Badge className="text-xs bg-energy text-energy-foreground">Popular Choice</Badge>
                      )}
                      <div className="text-2xl font-bold text-primary">
                        {getCurrencySymbol(pkg.currency)}{pkg.price.toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPackageDuration(pkg)}
                      </div>
                      {pkg.description && (
                        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {pkg.description}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Feature Rows */}
            <tbody>
              {featureCategories.map(category => (
                <>
                  {/* Category Header */}
                  <tr key={`${category.id}-header`} className="bg-gray-50">
                    <td colSpan={packages.length + 1} className="sticky left-0 z-10 bg-gray-50 p-3 font-semibold text-sm text-primary shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      {category.label}
                    </td>
                  </tr>
                  
                  {/* Category Features */}
                  {category.features.map(feature => (
                    <tr 
                      key={feature.id} 
                      className="border-b border-border hover:bg-secondary-50/30 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-background p-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help">{feature.name}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      {packages.map(pkg => (
                        <td 
                          key={pkg.id} 
                          className={`p-3 text-center ${
                            highlightedPackageId === pkg.id ? 'bg-energy-50/30' : ''
                          }`}
                        >
                          {feature.presentInPackages.has(pkg.id) ? (
                            <Check className="h-5 w-5 text-secondary mx-auto" />
                          ) : (
                            <Minus className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  // Mobile accordion view
  const MobileView = () => (
    <div className="md:hidden space-y-3">
      {packages.map(pkg => {
        const isOpen = openPackages.has(pkg.id);
        return (
          <Collapsible
            key={pkg.id}
            open={isOpen}
            onOpenChange={() => togglePackage(pkg.id)}
            className={`border rounded-lg ${
              highlightedPackageId === pkg.id ? 'border-2 border-energy ring-2 ring-energy/20' : 'border-secondary-200'
            }`}
          >
            <CollapsibleTrigger className="w-full p-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${highlightedPackageId === pkg.id ? 'text-primary' : ''}`}>
                      {pkg.name}
                    </h4>
                    {highlightedPackageId === pkg.id && (
                      <Badge className="text-xs bg-energy text-energy-foreground">Popular</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      {getCurrencySymbol(pkg.currency)}{pkg.price.toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPackageDuration(pkg)}
                    </span>
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pkg.description}
                    </p>
                  )}
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t">
              <div className="p-4 space-y-4">
                {featureCategories.map(category => {
                  const categoryFeatures = category.features.filter(f => 
                    f.presentInPackages.has(pkg.id)
                  );
                  
                  if (categoryFeatures.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <h5 className="text-sm font-semibold mb-2 text-secondary-700">
                        {category.label}
                      </h5>
                      <ul className="space-y-1.5">
                        {categoryFeatures.map(feature => (
                          <li key={feature.id} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                            <span>{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );

  return (
    <>
      <DesktopView />
      <MobileView />
    </>
  );
}
