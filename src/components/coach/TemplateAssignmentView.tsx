import React from 'react';
import { CheckCircle, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTemplatePackageAssignment } from '@/hooks/useTemplatePackageAssignment';
import { toast } from 'sonner';

interface TemplateAssignmentViewProps {
  onCreateTemplate?: () => void;
}

export function TemplateAssignmentView({ onCreateTemplate }: TemplateAssignmentViewProps) {
  const { 
    assignments, 
    templates, 
    loading, 
    error, 
    assignTemplate, 
    unassignTemplate 
  } = useTemplatePackageAssignment();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const handleTemplateChange = async (packageId: string, templateId: string) => {
    if (templateId === 'none') {
      const result = await unassignTemplate(packageId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Template unassigned successfully');
      }
    } else {
      const result = await assignTemplate(packageId, templateId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Template assigned successfully');
      }
    }
  };

  // Get unique categories from all activities
  const categories = Array.from(
    new Set(
      assignments.flatMap(assignment => 
        assignment.activities.map(activity => activity.category)
      )
    )
  ).sort();

  const renderAssignmentTable = () => {
    if (!assignments || assignments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No packages found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set up your packages in your profile to assign templates.
          </p>
        </div>
      );
    }

    // Get all unique activities across all categories
    const allActivities: Array<{
      category: string;
      activityId: string;
      activityName: string;
      assignmentStatus: { [packageId: string]: boolean };
    }> = [];

    categories.forEach(category => {
      const categoryActivities = assignments[0]?.activities.filter(a => a.category === category) || [];
      
      categoryActivities.forEach(activity => {
        const assignmentStatus: { [packageId: string]: boolean } = {};
        
        assignments.forEach(assignment => {
          // For now, assume all activities are included when template is assigned
          // TODO: Implement proper activity inclusion logic
          assignmentStatus[assignment.packageId] = !!assignment.templateId;
        });

        allActivities.push({
          category,
          activityId: activity.id,
          activityName: activity.name,
          assignmentStatus
        });
      });
    });

    return (
      <div className="space-y-4">
        {/* Template Assignment Row */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3 font-semibold bg-muted/50 min-w-48">Package</th>
                <th className="text-left p-3 font-semibold bg-muted/50 min-w-64">Assigned Template</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.packageId} className="border-b border-border hover:bg-muted/20">
                  <td className="p-3 font-medium">
                    {assignment.packageName}
                  </td>
                  <td className="p-3">
                    <Select
                      value={assignment.templateId || 'none'}
                      onValueChange={(value) => handleTemplateChange(assignment.packageId, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No template assigned</span>
                        </SelectItem>
                        {templates.filter(t => t.status === 'published').map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <span>{template.step_name}</span>
                              <Badge variant="default" className="text-xs">
                                {template.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activities Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3 font-semibold bg-muted/50">Category</th>
                <th className="text-left p-3 font-semibold bg-muted/50">Activity</th>
                {assignments.map(assignment => (
                  <th key={assignment.packageId} className="text-center p-3 font-semibold bg-primary/10 min-w-24">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">{assignment.packageName}</span>
                      {assignment.templateId && (
                        <span className="text-xs text-muted-foreground">({assignment.templateName})</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allActivities.length === 0 ? (
                <tr>
                  <td colSpan={2 + assignments.length} className="text-center py-8 text-muted-foreground">
                    No activities found. Create activities in the Activities tab.
                  </td>
                </tr>
              ) : (
                allActivities.map((activity, index) => {
                  const isFirstInCategory = index === 0 || allActivities[index - 1].category !== activity.category;
                  
                  return (
                    <tr key={activity.activityId} className="border-b border-border hover:bg-muted/20">
                      <td className="p-3 font-medium text-primary">
                        {isFirstInCategory ? activity.category : ''}
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{activity.activityName}</span>
                        </div>
                      </td>
                      {assignments.map(assignment => (
                        <td key={assignment.packageId} className="text-center p-3">
                          {assignment.templateId && activity.assignmentStatus[assignment.packageId] ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <div className="w-5 h-5 border border-muted-foreground/30 rounded-full mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Template Assignment</CardTitle>
        <div className="flex gap-2">
          {templates.length === 0 && onCreateTemplate && (
            <Button onClick={onCreateTemplate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Assign templates to packages for automatic assignment when clients select those packages.
            Each package can only have one template assigned.
          </div>
          {renderAssignmentTable()}
        </div>
      </CardContent>
    </Card>
  );
}