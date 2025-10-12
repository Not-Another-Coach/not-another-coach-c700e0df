import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol, formatPackageDuration } from "@/lib/packagePaymentUtils";
import { TrainerPackageExtended } from "@/types/trainer";
import { Check } from "lucide-react";

interface PackageComparisonTableProps {
  packages: TrainerPackageExtended[];
  highlightedPackageId?: string;
}

export function PackageComparisonTable({ packages, highlightedPackageId }: PackageComparisonTableProps) {
  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Package</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Extra Inclusions</TableHead>
              <TableHead className="font-semibold text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow 
                key={pkg.id}
                className={highlightedPackageId === pkg.id ? "bg-energy-50/30" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className={highlightedPackageId === pkg.id ? "text-primary font-semibold" : ""}>
                      {pkg.name}
                    </span>
                    {highlightedPackageId === pkg.id && (
                      <Badge className="text-xs bg-energy text-energy-foreground">
                        Popular Choice
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {formatPackageDuration(pkg)}
                </TableCell>
                <TableCell>
                  {pkg.extraInclusions && pkg.extraInclusions.length > 0 ? (
                    <ul className="space-y-1">
                      {pkg.extraInclusions.slice(0, 4).map((inclusion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span>{inclusion}</span>
                        </li>
                      ))}
                      {pkg.extraInclusions.length > 4 && (
                        <li className="text-xs text-muted-foreground italic pl-6">
                          ...and {pkg.extraInclusions.length - 4} more
                        </li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground text-sm">Standard package</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {getCurrencySymbol(pkg.currency)}{pkg.price.toFixed(2)}
                  {formatPackageDuration(pkg) === 'Per session' && (
                    <span className="text-sm font-normal text-muted-foreground">/session</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id}
            className={highlightedPackageId === pkg.id ? "border-2 border-energy ring-2 ring-energy/20" : "border-secondary-200"}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{pkg.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatPackageDuration(pkg)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {getCurrencySymbol(pkg.currency)}{pkg.price.toFixed(2)}
                  </div>
                  {formatPackageDuration(pkg) === 'Per session' && (
                    <span className="text-xs text-muted-foreground">/session</span>
                  )}
                </div>
              </div>
              
              {highlightedPackageId === pkg.id && (
                <Badge className="text-xs bg-energy text-energy-foreground">
                  Popular Choice
                </Badge>
              )}

              {pkg.extraInclusions && pkg.extraInclusions.length > 0 && (
                <div className="bg-secondary-50/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide mb-2">
                    Extended Features
                  </p>
                  <ul className="space-y-1.5">
                    {pkg.extraInclusions.slice(0, 4).map((inclusion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span>{inclusion}</span>
                      </li>
                    ))}
                    {pkg.extraInclusions.length > 4 && (
                      <li className="text-xs text-muted-foreground italic pl-6">
                        +{pkg.extraInclusions.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
