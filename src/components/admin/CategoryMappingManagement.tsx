import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus } from "lucide-react";
import { useWaysOfWorkingCategories, WaysOfWorkingCategory } from "@/hooks/useWaysOfWorkingCategories";
import { useToast } from "@/hooks/use-toast";

const SECTION_OPTIONS = [
  { key: "onboarding", name: "Onboarding Process" },
  { key: "first_week", name: "First Week Experience" },
  { key: "ongoing_structure", name: "Ongoing Structure" },
  { key: "tracking_tools", name: "Tracking & Progress Tools" },
  { key: "client_expectations", name: "What I Expect From Clients" },
  { key: "what_i_bring", name: "What I Bring" },
];

export function CategoryMappingManagement() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useWaysOfWorkingCategories();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WaysOfWorkingCategory | null>(null);
  const [formData, setFormData] = useState({
    section_key: "",
    section_name: "",
    activity_category: "",
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      section_key: "",
      section_name: "",
      activity_category: "",
      display_order: 0,
    });
  };

  const handleCreate = async () => {
    if (!formData.section_key || !formData.activity_category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const result = await createCategory(
      formData.section_key,
      formData.section_name || SECTION_OPTIONS.find(s => s.key === formData.section_key)?.name || formData.section_key,
      formData.activity_category,
      formData.display_order
    );

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category mapping created successfully",
      });
      resetForm();
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !formData.section_key || !formData.activity_category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const result = await updateCategory(
      editingCategory.id,
      formData.section_key,
      formData.section_name || SECTION_OPTIONS.find(s => s.key === formData.section_key)?.name || formData.section_key,
      formData.activity_category,
      formData.display_order
    );

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category mapping updated successfully",
      });
      resetForm();
      setIsEditOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDelete = async (category: WaysOfWorkingCategory) => {
    if (!confirm(`Are you sure you want to delete the mapping for "${category.activity_category}"?`)) {
      return;
    }

    const result = await deleteCategory(category.id);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category mapping deleted successfully",
      });
    }
  };

  const openEditDialog = (category: WaysOfWorkingCategory) => {
    setEditingCategory(category);
    setFormData({
      section_key: category.section_key,
      section_name: category.section_name,
      activity_category: category.activity_category,
      display_order: category.display_order,
    });
    setIsEditOpen(true);
  };

  const handleSectionChange = (sectionKey: string) => {
    const section = SECTION_OPTIONS.find(s => s.key === sectionKey);
    setFormData(prev => ({
      ...prev,
      section_key: sectionKey,
      section_name: section?.name || sectionKey,
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading category mappings...</div>;
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ways of Working Category Mappings</CardTitle>
              <CardDescription>
                Manage how activity categories map to "Ways of Working" sections. This determines where activities appear in trainer profiles.
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Category Mapping</DialogTitle>
                  <DialogDescription>
                    Map an activity category to a "Ways of Working" section.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="section">Ways of Working Section</Label>
                    <Select value={formData.section_key} onValueChange={handleSectionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_OPTIONS.map(section => (
                          <SelectItem key={section.key} value={section.key}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Activity Category</Label>
                    <Input
                      id="category"
                      value={formData.activity_category}
                      onChange={(e) => setFormData(prev => ({ ...prev, activity_category: e.target.value }))}
                      placeholder="Enter activity category"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleCreate}>
                    Create Mapping
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ways of Working Section</TableHead>
                <TableHead>Activity Category</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{category.section_name}</div>
                      <Badge variant="outline" className="text-xs">
                        {category.section_key}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{category.activity_category}</TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No category mappings found. Create your first mapping to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category Mapping</DialogTitle>
                <DialogDescription>
                  Update the mapping between activity category and "Ways of Working" section.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-section">Ways of Working Section</Label>
                  <Select value={formData.section_key} onValueChange={handleSectionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_OPTIONS.map(section => (
                        <SelectItem key={section.key} value={section.key}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Activity Category</Label>
                  <Input
                    id="edit-category"
                    value={formData.activity_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, activity_category: e.target.value }))}
                    placeholder="Enter activity category"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-order">Display Order</Label>
                  <Input
                    id="edit-order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleEdit}>
                  Update Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}