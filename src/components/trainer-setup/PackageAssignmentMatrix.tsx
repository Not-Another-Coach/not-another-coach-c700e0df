import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Circle } from "lucide-react";

interface SelectedActivity {
  id?: string;
  name: string;
  category: string;
  isCustom: boolean;
}

interface ActivityPackageAssignment {
  activityName: string;
  assignedTo: 'all' | 'specific';
  packageIds: string[];
}

interface PackageAssignmentMatrixProps {
  selectedActivities: SelectedActivity[];
  packageOptions: any[];
  assignments: ActivityPackageAssignment[];
  onAssignmentChange: (activityName: string, assignment: ActivityPackageAssignment) => void;
}

export function PackageAssignmentMatrix({
  selectedActivities,
  packageOptions,
  assignments,
  onAssignmentChange
}: PackageAssignmentMatrixProps) {
  if (selectedActivities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select activities first to configure package assignments</p>
        </CardContent>
      </Card>
    );
  }

  const getAssignment = (activityName: string): ActivityPackageAssignment => {
    return assignments.find(a => a.activityName === activityName) || {
      activityName,
      assignedTo: 'all',
      packageIds: []
    };
  };

  const handleAssignToAll = (activityName: string) => {
    onAssignmentChange(activityName, {
      activityName,
      assignedTo: 'all',
      packageIds: []
    });
  };

  const handleAssignToSpecific = (activityName: string) => {
    const currentAssignment = getAssignment(activityName);
    onAssignmentChange(activityName, {
      activityName,
      assignedTo: 'specific',
      packageIds: currentAssignment.packageIds
    });
  };

  const handlePackageToggle = (activityName: string, packageId: string) => {
    const currentAssignment = getAssignment(activityName);
    const newPackageIds = currentAssignment.packageIds.includes(packageId)
      ? currentAssignment.packageIds.filter(id => id !== packageId)
      : [...currentAssignment.packageIds, packageId];

    onAssignmentChange(activityName, {
      activityName,
      assignedTo: 'specific',
      packageIds: newPackageIds
    });
  };

  const handleBulkAssignAll = () => {
    selectedActivities.forEach(activity => {
      handleAssignToAll(activity.name);
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Assignment
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkAssignAll}
            className="text-xs"
          >
            Assign All to All Packages
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure which packages each activity applies to
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedActivities.map((activity) => {
          const assignment = getAssignment(activity.name);
          
          return (
            <div key={activity.name} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.category}
                  </Badge>
                  <span className="font-medium">{activity.name}</span>
                  {activity.isCustom && (
                    <Badge variant="secondary" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {/* Apply to All Packages */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${activity.name}-all`}
                    checked={assignment.assignedTo === 'all'}
                    onCheckedChange={() => handleAssignToAll(activity.name)}
                  />
                  <label
                    htmlFor={`${activity.name}-all`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Apply to all packages
                  </label>
                </div>

                {/* Apply to Specific Packages */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${activity.name}-specific`}
                    checked={assignment.assignedTo === 'specific'}
                    onCheckedChange={() => handleAssignToSpecific(activity.name)}
                  />
                  <label
                    htmlFor={`${activity.name}-specific`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Apply to specific packages
                  </label>
                </div>

                {/* Package Selection (when specific is selected) */}
                {assignment.assignedTo === 'specific' && (
                  <div className="ml-6 space-y-2">
                    {packageOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No packages configured yet. You can set this up later in the Rates & Packages section.
                      </p>
                    ) : (
                      <div className="grid gap-2">
                        {packageOptions.map((pkg) => (
                          <div key={pkg.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${activity.name}-${pkg.id}`}
                              checked={assignment.packageIds.includes(pkg.id)}
                              onCheckedChange={() => handlePackageToggle(activity.name, pkg.id)}
                            />
                            <label
                              htmlFor={`${activity.name}-${pkg.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                            >
                              <span>{pkg.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {pkg.duration}
                              </Badge>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}