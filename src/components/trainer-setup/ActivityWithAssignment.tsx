import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Package, ChevronDown } from "lucide-react";

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

interface ActivityWithAssignmentProps {
  activity: SelectedActivity;
  assignment: ActivityPackageAssignment;
  packageOptions: any[];
  onAssignmentChange: (assignment: ActivityPackageAssignment) => void;
  onRemove: () => void;
}

export function ActivityWithAssignment({
  activity,
  assignment,
  packageOptions,
  onAssignmentChange,
  onRemove
}: ActivityWithAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAssignToAll = () => {
    onAssignmentChange({
      activityName: activity.name,
      assignedTo: 'all',
      packageIds: []
    });
  };

  const handleAssignToSpecific = () => {
    onAssignmentChange({
      activityName: activity.name,
      assignedTo: 'specific',
      packageIds: assignment.packageIds
    });
  };

  const handlePackageToggle = (packageId: string) => {
    const newPackageIds = assignment.packageIds.includes(packageId)
      ? assignment.packageIds.filter(id => id !== packageId)
      : [...assignment.packageIds, packageId];

    onAssignmentChange({
      activityName: activity.name,
      assignedTo: 'specific',
      packageIds: newPackageIds
    });
  };

  const getAssignmentDisplay = () => {
    if (assignment.assignedTo === 'all') {
      return "All packages";
    } else if (assignment.packageIds.length === 0) {
      return "No packages selected";
    } else {
      const packageNames = packageOptions
        .filter(pkg => assignment.packageIds.includes(pkg.id))
        .map(pkg => pkg.name);
      return packageNames.length <= 2 
        ? packageNames.join(", ")
        : `${packageNames[0]} +${packageNames.length - 1} more`;
    }
  };

  const getAssignmentColor = () => {
    if (assignment.assignedTo === 'all') {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (assignment.packageIds.length === 0) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
      <Badge
        variant="secondary"
        className="text-sm flex items-center gap-1"
      >
        {activity.name}
        {activity.isCustom && <span className="text-xs opacity-70">(Custom)</span>}
      </Badge>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`text-xs h-6 px-2 ${getAssignmentColor()}`}
          >
            <Package className="h-3 w-3 mr-1" />
            {getAssignmentDisplay()}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div className="font-medium text-sm">Package Assignment</div>
            
            {/* Apply to All Packages */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${activity.name}-all`}
                checked={assignment.assignedTo === 'all'}
                onCheckedChange={handleAssignToAll}
              />
              <label
                htmlFor={`${activity.name}-all`}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Apply to all packages
              </label>
            </div>

            {/* Apply to Specific Packages */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${activity.name}-specific`}
                checked={assignment.assignedTo === 'specific'}
                onCheckedChange={handleAssignToSpecific}
              />
              <label
                htmlFor={`${activity.name}-specific`}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Apply to specific packages
              </label>
            </div>

            {/* Package Selection */}
            {assignment.assignedTo === 'specific' && (
              <div className="ml-6 space-y-2 max-h-32 overflow-y-auto">
                {packageOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No packages configured yet
                  </p>
                ) : (
                  packageOptions.map((pkg) => (
                    <div key={pkg.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${activity.name}-${pkg.id}`}
                        checked={assignment.packageIds.includes(pkg.id)}
                        onCheckedChange={() => handlePackageToggle(pkg.id)}
                      />
                      <label
                        htmlFor={`${activity.name}-${pkg.id}`}
                        className="text-sm leading-none cursor-pointer flex items-center gap-1"
                      >
                        <span>{pkg.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {pkg.duration}
                        </Badge>
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}