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

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left p-3 font-semibold bg-muted/50 min-w-32">Package</th>
              <th className="text-left p-3 font-semibold bg-muted/50 min-w-48">Template</th>
              {categories.map(category => (
                <th key={category} className="text-center p-3 font-semibold bg-primary/10 min-w-28">
                  {category}
                </th>
              ))}
              <th className="text-center p-3 font-semibold bg-muted/50 min-w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment, index) => (
              <tr key={assignment.packageId} className="border-b border-border hover:bg-muted/20">
                <td className="p-3 font-medium">
                  <div className="flex flex-col">
                    <span>{assignment.packageName}</span>
                    <span className="text-xs text-muted-foreground">ID: {assignment.packageId}</span>
                  </div>
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
                      {templates.filter(t => t.status !== 'archived').map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <span>{template.step_name}</span>
                            <Badge variant={template.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                              {template.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                {categories.map(category => {
                  const categoryActivities = assignment.activities.filter(a => a.category === category);
                  const includedCount = categoryActivities.filter(a => a.included).length;
                  const totalCount = categoryActivities.length;
                  
                  return (
                    <td key={category} className="text-center p-3">
                      <div className="flex flex-col items-center gap-1">
                        {assignment.templateId ? (
                          <>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(totalCount, 5) }).map((_, idx) => (
                                <div key={idx} className="relative">
                                  {idx < includedCount ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <div className="w-4 h-4 border border-muted-foreground/30 rounded-full"></div>
                                  )}
                                </div>
                              ))}
                              {totalCount > 5 && <span className="text-xs text-muted-foreground">+{totalCount - 5}</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {includedCount}/{totalCount}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center p-3">
                  {assignment.templateId && (
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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