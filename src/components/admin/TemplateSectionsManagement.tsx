import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Info, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useWaysOfWorkingTemplateSections, type WaysOfWorkingTemplateSection } from "@/hooks/useWaysOfWorkingTemplateSections";

export default function TemplateSectionsManagement() {
  const { sections, loading, error, createSection, updateSection, deleteSection, getProfileSections } = useWaysOfWorkingTemplateSections();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<WaysOfWorkingTemplateSection | null>(null);
  
  const [formData, setFormData] = useState({
    sectionKey: "",
    sectionName: "",
    profileSectionKey: "",
    displayOrder: 0,
  });

  const profileSections = getProfileSections();

  const resetForm = () => {
    setFormData({
      sectionKey: "",
      sectionName: "",
      profileSectionKey: "",
      displayOrder: 0,
    });
  };

  const handleCreate = async () => {
    if (!formData.sectionKey.trim() || !formData.sectionName.trim() || !formData.profileSectionKey) {
      toast.error("All fields are required");
      return;
    }

    const result = await createSection(
      formData.sectionKey,
      formData.sectionName,
      formData.profileSectionKey,
      formData.displayOrder
    );

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Template section created successfully");
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!editingSection || !formData.sectionKey.trim() || !formData.sectionName.trim() || !formData.profileSectionKey) {
      toast.error("All fields are required");
      return;
    }

    const result = await updateSection(
      editingSection.id,
      formData.sectionKey,
      formData.sectionName,
      formData.profileSectionKey,
      formData.displayOrder
    );

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Template section updated successfully");
      setIsEditOpen(false);
      setEditingSection(null);
      resetForm();
    }
  };

  const handleDelete = async (section: WaysOfWorkingTemplateSection) => {
    if (!confirm(`Are you sure you want to delete "${section.section_name}"?`)) return;

    const result = await deleteSection(section.id);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Template section deleted successfully");
    }
  };

  const openEditDialog = (section: WaysOfWorkingTemplateSection) => {
    setEditingSection(section);
    setFormData({
      sectionKey: section.section_key,
      sectionName: section.section_name,
      profileSectionKey: section.profile_section_key,
      displayOrder: section.display_order,
    });
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Sections Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading template sections...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Sections Management</CardTitle>
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
        <div>
          <CardTitle>Template Sections Management</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Configure template sections and map them to profile sections
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Info className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  <p className="font-medium mb-1">Template Section to Profile Section Mapping</p>
                  <p>Template sections group activities in trainer setup and map to profile sections that are displayed on trainer profiles.</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded">Template Section</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded">Profile Section</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="sectionKey">Section Key</Label>
                <Input
                  id="sectionKey"
                  placeholder="e.g., onboarding_welcome"
                  value={formData.sectionKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, sectionKey: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Unique identifier for this template section
                </p>
              </div>
              <div>
                <Label htmlFor="sectionName">Section Name</Label>
                <Input
                  id="sectionName"
                  placeholder="e.g., Onboarding & Welcome"
                  value={formData.sectionName}
                  onChange={(e) => setFormData(prev => ({ ...prev, sectionName: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Display name shown in trainer setup
                </p>
              </div>
              <div>
                <Label htmlFor="profileSection">Maps to Profile Section</Label>
                <Select value={formData.profileSectionKey} onValueChange={(value) => setFormData(prev => ({ ...prev, profileSectionKey: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile section" />
                  </SelectTrigger>
                  <SelectContent>
                    {profileSections.map((section) => (
                      <SelectItem key={section.key} value={section.key}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Which profile section will display these activities
                </p>
              </div>
              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Order of template sections in trainer setup (lower numbers appear first)
                </p>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Template Section</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No template sections found. Create your first template section to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Key</TableHead>
                <TableHead>Section Name</TableHead>
                <TableHead>Maps to Profile Section</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => {
                const profileSection = profileSections.find(p => p.key === section.profile_section_key);
                return (
                  <TableRow key={section.id}>
                    <TableCell className="font-mono text-sm">{section.section_key}</TableCell>
                    <TableCell>{section.section_name}</TableCell>
                    <TableCell>{profileSection?.name || section.profile_section_key}</TableCell>
                    <TableCell>{section.display_order}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(section)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(section)}>
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
              <DialogTitle>Edit Template Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editSectionKey">Section Key</Label>
                <Input
                  id="editSectionKey"
                  value={formData.sectionKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, sectionKey: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Unique identifier for this template section
                </p>
              </div>
              <div>
                <Label htmlFor="editSectionName">Section Name</Label>
                <Input
                  id="editSectionName"
                  value={formData.sectionName}
                  onChange={(e) => setFormData(prev => ({ ...prev, sectionName: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Display name shown in trainer setup
                </p>
              </div>
              <div>
                <Label htmlFor="editProfileSection">Maps to Profile Section</Label>
                <Select value={formData.profileSectionKey} onValueChange={(value) => setFormData(prev => ({ ...prev, profileSectionKey: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profileSections.map((section) => (
                      <SelectItem key={section.key} value={section.key}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Which profile section will display these activities
                </p>
              </div>
              <div>
                <Label htmlFor="editDisplayOrder">Display Order</Label>
                <Input
                  id="editDisplayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Order of template sections in trainer setup (lower numbers appear first)
                </p>
              </div>
              <Button onClick={handleEdit} className="w-full">Update Template Section</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}