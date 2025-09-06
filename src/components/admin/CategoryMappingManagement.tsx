import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { useWaysOfWorkingCategories, type WaysOfWorkingCategory } from "@/hooks/useWaysOfWorkingCategories";
import { useWaysOfWorkingTemplateSections } from "@/hooks/useWaysOfWorkingTemplateSections";

// Activity categories from the system
const ACTIVITY_CATEGORIES = [
  'Onboarding',
  'First Week', 
  'Ongoing Structure',
  'Tracking Tools',
  'Client Expectations',
  'What I Bring',
  'Assessment',
  'Goal Setting',
  'Planning'
];

// Profile sections for direct mapping
const PROFILE_SECTIONS = [
  { key: 'how_i_work', name: 'How I Work' },
  { key: 'what_i_provide', name: 'What I Provide' },
  { key: 'client_expectations', name: 'Client Expectations' }
];

type CategoryRow = {
  activityCategory: string;
  mapping?: WaysOfWorkingCategory;
  isAssigned: boolean;
};

export default function CategoryMappingManagement() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useWaysOfWorkingCategories();
  const { sections: templateSections } = useWaysOfWorkingTemplateSections();
  const [updatingCategories, setUpdatingCategories] = useState<Set<string>>(new Set());

  // Create comprehensive category rows showing all 9 categories
  const categoryRows: CategoryRow[] = ACTIVITY_CATEGORIES.map(activityCategory => {
    const mapping = categories.find(c => c.activity_category === activityCategory);
    return {
      activityCategory,
      mapping,
      isAssigned: !!mapping
    };
  });

  const handleTemplateSection = async (activityCategory: string, sectionKey: string | null) => {
    // Handle unassignment when special unassign value is selected
    if (!sectionKey || sectionKey === "UNASSIGN") {
      await handleUnassign(activityCategory);
      return;
    }

    const section = templateSections.find(s => s.section_key === sectionKey);
    if (!section) return;

    setUpdatingCategories(prev => new Set(prev).add(activityCategory));

    try {
      const existingMapping = categories.find(c => c.activity_category === activityCategory);
      
      if (existingMapping) {
        // Update existing mapping
        const result = await updateCategory(
          existingMapping.id,
          section.section_key,
          section.section_name,
          activityCategory,
          existingMapping.display_order,
          section.profile_section_key
        );
        
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(`Updated ${activityCategory} mapping`);
        }
      } else {
        // Create new mapping
        const result = await createCategory(
          section.section_key,
          section.section_name,
          activityCategory,
          0, // Default display order
          section.profile_section_key
        );
        
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(`Created ${activityCategory} mapping`);
        }
      }
    } finally {
      setUpdatingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityCategory);
        return newSet;
      });
    }
  };

  const handleProfileSection = async (activityCategory: string, profileSectionKey: string | null) => {
    // Handle unassignment when special unassign value is selected
    if (!profileSectionKey || profileSectionKey === "UNASSIGN") {
      const existingMapping = categories.find(c => c.activity_category === activityCategory);
      if (existingMapping) {
        setUpdatingCategories(prev => new Set(prev).add(activityCategory));
        try {
          const result = await updateCategory(
            existingMapping.id,
            existingMapping.section_key,
            existingMapping.section_name,
            activityCategory,
            existingMapping.display_order,
            undefined // Clear profile section mapping
          );
          
          if ("error" in result) {
            toast.error(result.error);
          } else {
            toast.success(`Removed profile section mapping for ${activityCategory}`);
          }
        } finally {
          setUpdatingCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(activityCategory);
            return newSet;
          });
        }
      }
      return;
    }

    const profileSection = PROFILE_SECTIONS.find(ps => ps.key === profileSectionKey);
    if (!profileSection) return;

    setUpdatingCategories(prev => new Set(prev).add(activityCategory));

    try {
      const existingMapping = categories.find(c => c.activity_category === activityCategory);
      
      if (existingMapping) {
        // Update existing mapping with profile section
        const result = await updateCategory(
          existingMapping.id,
          existingMapping.section_key,
          existingMapping.section_name,
          activityCategory,
          existingMapping.display_order,
          profileSectionKey
        );
        
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(`Updated profile section mapping for ${activityCategory}`);
        }
      } else {
        // Create new mapping with only profile section (no template section)
        const result = await createCategory(
          'direct_profile_mapping', // Placeholder section key
          'Direct Profile Mapping', // Placeholder section name
          activityCategory,
          0, // Default display order
          profileSectionKey
        );
        
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success(`Created profile section mapping for ${activityCategory}`);
        }
      }
    } finally {
      setUpdatingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityCategory);
        return newSet;
      });
    }
  };

  const handleDisplayOrder = async (activityCategory: string, displayOrder: number) => {
    const existingMapping = categories.find(c => c.activity_category === activityCategory);
    if (!existingMapping) return;

    setUpdatingCategories(prev => new Set(prev).add(activityCategory));

    try {
      const result = await updateCategory(
        existingMapping.id,
        existingMapping.section_key,
        existingMapping.section_name,
        activityCategory,
        displayOrder,
        existingMapping.profile_section_key
      );
      
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Updated display order for ${activityCategory}`);
      }
    } finally {
      setUpdatingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityCategory);
        return newSet;
      });
    }
  };

  const handleUnassign = async (activityCategory: string) => {
    const existingMapping = categories.find(c => c.activity_category === activityCategory);
    if (!existingMapping) return;

    setUpdatingCategories(prev => new Set(prev).add(activityCategory));

    try {
      const result = await deleteCategory(existingMapping.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Unassigned ${activityCategory}`);
      }
    } finally {
      setUpdatingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityCategory);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Category to Template Section Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading category mappings...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Category to Template Section Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const assignedCount = categoryRows.filter(row => row.isAssigned).length;
  const unassignedCount = ACTIVITY_CATEGORIES.length - assignedCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Activity Category to Template Section Mappings</span>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {assignedCount} Assigned
            </Badge>
            {unassignedCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                {unassignedCount} Unassigned
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Complete Category Mapping Overview</p>
            <p>All 9 activity categories are shown below. Assign each category to a template section to organize activities during trainer setup. Categories without assignments will not appear in the trainer interface.</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ways of Working Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Template Section</TableHead>
              <TableHead>Profile Section</TableHead>
              <TableHead>Display Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryRows.map((row) => {
              const isUpdating = updatingCategories.has(row.activityCategory);
              
              return (
                <TableRow 
                  key={row.activityCategory}
                  className={!row.isAssigned ? "bg-amber-50/30 dark:bg-amber-950/10" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        {row.activityCategory}
                      </code>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {row.isAssigned ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Assigned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        Not Assigned
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Select
                      value={row.mapping?.section_key || "UNASSIGN"}
                      onValueChange={(value) => handleTemplateSection(row.activityCategory, value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select template section..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNASSIGN" className="text-muted-foreground italic">
                          — Not assigned —
                        </SelectItem>
                        {templateSections.map((section) => (
                          <SelectItem key={section.section_key} value={section.section_key}>
                            {section.section_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>
                    <Select
                      value={row.mapping?.profile_section_key || "UNASSIGN"}
                      onValueChange={(value) => handleProfileSection(row.activityCategory, value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select profile section..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNASSIGN" className="text-muted-foreground italic">
                          — Not assigned —
                        </SelectItem>
                        {PROFILE_SECTIONS.map((section) => (
                          <SelectItem key={section.key} value={section.key}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>
                    {row.mapping ? (
                      <Input
                        type="number"
                        value={row.mapping.display_order}
                        onChange={(e) => handleDisplayOrder(row.activityCategory, parseInt(e.target.value) || 0)}
                        className="w-20"
                        disabled={isUpdating}
                        min="0"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <p><strong>Template Section:</strong> Maps activities to sections used in trainer onboarding templates.</p>
          <p><strong>Profile Section:</strong> Directly maps activities to one of the 3 main profile sections for display.</p>
          <p><strong>Display Order:</strong> Controls the sequence in which activity categories appear within each section (lower numbers appear first).</p>
        </div>
      </CardContent>
    </Card>
  );
}