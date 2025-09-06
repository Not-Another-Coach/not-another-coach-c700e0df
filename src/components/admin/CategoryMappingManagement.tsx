import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWaysOfWorkingCategories, type WaysOfWorkingCategory } from "@/hooks/useWaysOfWorkingCategories";
import { useWaysOfWorkingTemplateSections } from "@/hooks/useWaysOfWorkingTemplateSections";

export default function CategoryMappingManagement() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useWaysOfWorkingCategories();
  const { sections: templateSections, getProfileSections } = useWaysOfWorkingTemplateSections();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WaysOfWorkingCategory | null>(null);
  
  const [formData, setFormData] = useState({
    sectionKey: "",
    sectionName: "",
    activityCategory: "",
    displayOrder: 0,
    profileSectionKey: "",
  });

  const profileSections = getProfileSections();

  const resetForm = () => {
    setFormData({
      sectionKey: "",
      sectionName: "",
      activityCategory: "",
      displayOrder: 0,
      profileSectionKey: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.sectionKey.trim() || !formData.sectionName.trim() || !formData.activityCategory.trim()) {
      toast.error("All fields are required");
      return;
    }

    const result = await createCategory(
      formData.sectionKey,
      formData.sectionName,
      formData.activityCategory,
      formData.displayOrder,
      formData.profileSectionKey
    );

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Category mapping created successfully");
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !formData.sectionKey.trim() || !formData.sectionName.trim() || !formData.activityCategory.trim()) {
      toast.error("All fields are required");
      return;
    }

    const result = await updateCategory(
      editingCategory.id,
      formData.sectionKey,
      formData.sectionName,
      formData.activityCategory,
      formData.displayOrder,
      formData.profileSectionKey
    );

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Category mapping updated successfully");
      setIsEditOpen(false);
      setEditingCategory(null);
      resetForm();
    }
  };

  const handleDelete = async (category: WaysOfWorkingCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.activity_category}"?`)) return;

    const result = await deleteCategory(category.id);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Category mapping deleted successfully");
    }
  };

  const openEditDialog = (category: WaysOfWorkingCategory) => {
    setEditingCategory(category);
    setFormData({
      sectionKey: category.section_key,
      sectionName: category.section_name,
      activityCategory: category.activity_category,
      displayOrder: category.display_order,
      profileSectionKey: category.profile_section_key || "",
    });
    setIsEditOpen(true);
  };

  const handleSectionChange = (sectionKey: string) => {
    const section = templateSections.find(s => s.section_key === sectionKey);
    if (section) {
      setFormData(prev => ({
        ...prev,
        sectionKey: section.section_key,
        sectionName: section.section_name,
        profileSectionKey: section.profile_section_key,
      }));
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Category to Template Section Mappings</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Mapping
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category Mapping</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="waysSection">Template Section</Label>
                <Select value={formData.sectionKey} onValueChange={handleSectionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template section" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateSections.map((section) => (
                      <SelectItem key={section.section_key} value={section.section_key}>
                        {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="profileSection">Maps to Profile Section</Label>
                <Input
                  id="profileSection"
                  value={profileSections.find(p => p.key === formData.profileSectionKey)?.name || formData.profileSectionKey}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This is automatically set based on the selected template section
                </p>
              </div>
              <div>
                <Label htmlFor="activityCategory">Activity Category</Label>
                <Input
                  id="activityCategory"
                  placeholder="e.g., general"
                  value={formData.activityCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityCategory: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Mapping</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No category mappings found. Create your first mapping to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Section</TableHead>
                <TableHead>Activity Category</TableHead>
                <TableHead>Profile Section</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const profileSection = profileSections.find(p => p.key === category.profile_section_key);
                return (
                  <TableRow key={category.id}>
                    <TableCell>{category.section_name}</TableCell>
                    <TableCell className="font-mono text-sm">{category.activity_category}</TableCell>
                    <TableCell>{profileSection?.name || category.profile_section_key || 'Not mapped'}</TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category Mapping</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editWaysSection">Template Section</Label>
                <Select value={formData.sectionKey} onValueChange={handleSectionChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateSections.map((section) => (
                      <SelectItem key={section.section_key} value={section.section_key}>
                        {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editProfileSection">Maps to Profile Section</Label>
                <Input
                  id="editProfileSection"
                  value={profileSections.find(p => p.key === formData.profileSectionKey)?.name || formData.profileSectionKey}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="editActivityCategory">Activity Category</Label>
                <Input
                  id="editActivityCategory"
                  value={formData.activityCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityCategory: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editDisplayOrder">Display Order</Label>
                <Input
                  id="editDisplayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                />
              </div>
              <Button onClick={handleEdit} className="w-full">Update Mapping</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}