import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  GripVertical, 
  Archive, 
  FileText, 
  CheckCircle,
  Clock,
  Eye,
  Package,
  Settings,
  Users,
  CheckSquare,
  StickyNote
} from 'lucide-react';
import { OnboardingTemplate } from '@/hooks/useTrainerOnboarding';
import { useOnboardingSections } from '@/hooks/useOnboardingSections';
import { GettingStartedSection } from '@/components/onboarding/sections/GettingStartedSection';
import { OngoingSupportSection } from '@/components/onboarding/sections/OngoingSupportSection';
import { CommitmentsExpectationsSection } from '@/components/onboarding/sections/CommitmentsExpectationsSection';
import { TrainerSpecificSection } from '@/components/onboarding/sections/TrainerSpecificSection';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';

interface TemplateBuilderProps {
  templates: OnboardingTemplate[];
  packages?: Array<{ id: string; name: string }>;
  packageLinks?: Array<{ template_id: string; package_id: string; package_name: string; auto_assign: boolean }>;
  onCreateTemplate: (template: Omit<OnboardingTemplate, 'id'>) => Promise<void>;
  onUpdateTemplate: (templateId: string, updates: Partial<OnboardingTemplate>) => Promise<void>;
  onDuplicateTemplate: (templateId: string) => Promise<void>;
  onDeleteTemplate?: (templateId: string) => Promise<void>;
  onReorderTemplates: (reorderedTemplates: OnboardingTemplate[]) => Promise<void>;
  onPublishTemplate?: (templateId: string) => Promise<void>;
  onArchiveTemplate?: (templateId: string) => Promise<void>;
  onLinkToPackage?: (templateId: string, packageId: string, packageName: string, autoAssign?: boolean) => Promise<void>;
  onUnlinkFromPackage?: (templateId: string, packageId: string) => Promise<void>;
  loading?: boolean;
}

interface ExtendedTemplate extends OnboardingTemplate {
  status?: 'draft' | 'published' | 'archived';
  created_from_template_id?: string;
  package_links?: string[];
  auto_assign_on_package?: boolean;
}

export function TemplateBuilder({
  templates,
  packages = [],
  packageLinks = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onReorderTemplates,
  onPublishTemplate,
  onArchiveTemplate,
  onLinkToPackage,
  onUnlinkFromPackage,
  loading = false
}: TemplateBuilderProps) {
  const [filteredTemplates, setFilteredTemplates] = useState<ExtendedTemplate[]>(templates as ExtendedTemplate[]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPackageLinkDialog, setShowPackageLinkDialog] = useState(false);
  const [showSectionsDialog, setShowSectionsDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExtendedTemplate | null>(null);
  const [selectedTemplateForPackages, setSelectedTemplateForPackages] = useState<string | null>(null);
  const [selectedTemplateForSections, setSelectedTemplateForSections] = useState<string | null>(null);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('getting-started');
  const [newTemplate, setNewTemplate] = useState<Partial<ExtendedTemplate>>({
    step_name: '',
    step_type: 'mandatory',
    description: '',
    instructions: '',
    requires_file_upload: false,
    completion_method: 'client',
    display_order: 0,
    is_active: true,
    status: 'draft'
  });

  // Initialize onboarding sections hook
  const onboardingSections = useOnboardingSections();

  // Get linked packages for a template
  const getLinkedPackages = (templateId: string) => {
    return packageLinks
      .filter(link => link.template_id === templateId)
      .map(link => link.package_id);
  };

  // Filter templates based on status and search
  const filterTemplates = useCallback(() => {
    let filtered = templates as ExtendedTemplate[];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => (t.status || 'draft') === statusFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.step_name.toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term)
      );
    }
    
    setFilteredTemplates(filtered.sort((a, b) => a.display_order - b.display_order));
  }, [templates, statusFilter, searchTerm]);

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredTemplates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const reorderedTemplates = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    setFilteredTemplates(reorderedTemplates);
    
    try {
      await onReorderTemplates(reorderedTemplates);
      toast.success('Templates reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder templates');
      // Revert on error
      filterTemplates();
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.step_name?.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      await onCreateTemplate({
        ...newTemplate,
        display_order: templates.length
      } as Omit<OnboardingTemplate, 'id'>);
      
      setNewTemplate({
        step_name: '',
        step_type: 'mandatory',
        description: '',
        instructions: '',
        requires_file_upload: false,
        completion_method: 'client',
        display_order: 0,
        is_active: true,
        status: 'draft'
      });
      setShowCreateDialog(false);
      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleEditTemplate = async () => {
    if (!editingTemplate || !editingTemplate.step_name?.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      await onUpdateTemplate(editingTemplate.id, editingTemplate);
      setShowEditDialog(false);
      setEditingTemplate(null);
      toast.success('Template updated successfully');
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const handleSavePackageLinks = async () => {
    if (!selectedTemplateForPackages || !onLinkToPackage || !onUnlinkFromPackage) return;

    try {
      const currentLinks = getLinkedPackages(selectedTemplateForPackages);
      
      // Remove unchecked packages
      for (const packageId of currentLinks) {
        if (!selectedPackageIds.includes(packageId)) {
          await onUnlinkFromPackage(selectedTemplateForPackages, packageId);
        }
      }
      
      // Add newly checked packages
      for (const packageId of selectedPackageIds) {
        if (!currentLinks.includes(packageId)) {
          const packageName = packages.find(p => p.id === packageId)?.name || '';
          await onLinkToPackage(selectedTemplateForPackages, packageId, packageName, true);
        }
      }
      
      setShowPackageLinkDialog(false);
      setSelectedTemplateForPackages(null);
      setSelectedPackageIds([]);
      toast.success('Package links updated successfully');
    } catch (error) {
      toast.error('Failed to update package links');
    }
  };

  const openPackageLinkDialog = (templateId: string) => {
    setSelectedTemplateForPackages(templateId);
    setSelectedPackageIds(getLinkedPackages(templateId));
    setShowPackageLinkDialog(true);
  };

  const openSectionsDialog = async (templateId: string) => {
    setSelectedTemplateForSections(templateId);
    setActiveTab('getting-started');
    setShowSectionsDialog(true);
    
    // Load all sections for this template
    await onboardingSections.loadAllSections(templateId);
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      await onDuplicateTemplate(templateId);
      toast.success('Template duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const getStatusBadge = (status: string = 'draft') => {
    const variants = {
      draft: { variant: 'secondary' as const, icon: FileText, color: 'text-muted-foreground' },
      published: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      archived: { variant: 'outline' as const, icon: Archive, color: 'text-orange-600' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter templates when dependencies change
  React.useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  return (
    <div className="space-y-6">
      {/* Header with filters and create button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates list with drag and drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="templates">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filteredTemplates.map((template, index) => (
                <Draggable key={template.id} draggableId={template.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${
                        snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{template.step_name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(template.status)}
                                <Badge variant="outline">
                                  {template.step_type === 'mandatory' ? 'Required' : 'Optional'}
                                </Badge>
                                {template.package_links && template.package_links.length > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    <Package className="h-3 w-3" />
                                    {template.package_links.length} package{template.package_links.length !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                                {getLinkedPackages(template.id).length > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    <Package className="h-3 w-3" />
                                    {getLinkedPackages(template.id).length} linked
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSectionsDialog(template.id)}
                              title="Edit Template Sections"
                              aria-label={`Edit sections for ${template.step_name}`}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPackageLinkDialog(template.id)}
                              title="Link to Packages"
                              aria-label={`Link ${template.step_name} to packages`}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTemplate(template);
                                setShowEditDialog(true);
                              }}
                              title="Edit Template"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateTemplate(template.id)}
                              title="Duplicate Template"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {onDeleteTemplate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteTemplate(template.id)}
                                title="Delete Template"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {template.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.step_name || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, step_name: e.target.value })}
                  placeholder="e.g., Initial Assessment"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newTemplate.step_type || 'mandatory'}
                  onValueChange={(value: 'mandatory' | 'optional') => 
                    setNewTemplate({ ...newTemplate, step_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandatory">Mandatory</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Brief description of this template..."
              />
            </div>

            <div>
              <Label>Instructions (Rich Text)</Label>
              <div className="mt-1">
                <ReactQuill
                  value={newTemplate.instructions || ''}
                  onChange={(value) => setNewTemplate({ ...newTemplate, instructions: value })}
                  placeholder="Detailed instructions for this step..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Completion Method</Label>
                <Select
                  value={newTemplate.completion_method || 'client'}
                  onValueChange={(value: 'client' | 'trainer' | 'auto') => 
                    setNewTemplate({ ...newTemplate, completion_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client completes</SelectItem>
                    <SelectItem value="trainer">Trainer completes</SelectItem>
                    <SelectItem value="auto">Auto complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={newTemplate.requires_file_upload || false}
                  onCheckedChange={(checked) => 
                    setNewTemplate({ ...newTemplate, requires_file_upload: checked })
                  }
                />
                <Label>Requires file upload</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={editingTemplate.step_name || ''}
                    onChange={(e) => setEditingTemplate({ 
                      ...editingTemplate, 
                      step_name: e.target.value 
                    })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={editingTemplate.step_type || 'mandatory'}
                    onValueChange={(value: 'mandatory' | 'optional') => 
                      setEditingTemplate({ ...editingTemplate, step_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mandatory">Mandatory</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ 
                    ...editingTemplate, 
                    description: e.target.value 
                  })}
                />
              </div>

              <div>
                <Label>Instructions (Rich Text)</Label>
                <div className="mt-1">
                  <ReactQuill
                    value={editingTemplate.instructions || ''}
                    onChange={(value) => setEditingTemplate({ 
                      ...editingTemplate, 
                      instructions: value 
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Completion Method</Label>
                  <Select
                    value={editingTemplate.completion_method || 'client'}
                    onValueChange={(value: 'client' | 'trainer' | 'auto') => 
                      setEditingTemplate({ ...editingTemplate, completion_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client completes</SelectItem>
                      <SelectItem value="trainer">Trainer completes</SelectItem>
                      <SelectItem value="auto">Auto complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={editingTemplate.requires_file_upload || false}
                    onCheckedChange={(checked) => 
                      setEditingTemplate({ ...editingTemplate, requires_file_upload: checked })
                    }
                  />
                  <Label>Requires file upload</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditTemplate}>
                  Update Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Package Linking Dialog */}
      <Dialog open={showPackageLinkDialog} onOpenChange={setShowPackageLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Packages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link this template to packages for automatic assignment when clients select those packages.
            </p>
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No packages available. Set up your packages first in your profile.
              </p>
            ) : (
              <div className="space-y-2">
                {packages.map(pkg => {
                  const isLinked = selectedPackageIds.includes(pkg.id);
                  return (
                    <div key={pkg.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={pkg.id}
                        checked={isLinked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPackageIds([...selectedPackageIds, pkg.id]);
                          } else {
                            setSelectedPackageIds(selectedPackageIds.filter(id => id !== pkg.id));
                          }
                        }}
                      />
                      <Label htmlFor={pkg.id}>{pkg.name}</Label>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPackageLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePackageLinks}>
                Save Links
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Sections Dialog */}
      <Dialog open={showSectionsDialog} onOpenChange={setShowSectionsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template Sections</DialogTitle>
          </DialogHeader>
          {selectedTemplateForSections && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="getting-started" className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Getting Started
                </TabsTrigger>
                <TabsTrigger value="ongoing-support" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ongoing Support
                </TabsTrigger>
                <TabsTrigger value="commitments" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Commitments
                </TabsTrigger>
                <TabsTrigger value="trainer-notes" className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Trainer Notes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="getting-started" className="mt-6">
                <GettingStartedSection
                  templateId={selectedTemplateForSections}
                  tasks={onboardingSections.gettingStartedTasks}
                  onTasksChange={() => onboardingSections.fetchGettingStartedTasks(selectedTemplateForSections)}
                />
              </TabsContent>
              
              <TabsContent value="ongoing-support" className="mt-6">
                <OngoingSupportSection
                  templateId={selectedTemplateForSections}
                  settings={onboardingSections.ongoingSupportSettings}
                  onSettingsChange={() => onboardingSections.fetchOngoingSupportSettings(selectedTemplateForSections)}
                />
              </TabsContent>
              
              <TabsContent value="commitments" className="mt-6">
                <CommitmentsExpectationsSection
                  templateId={selectedTemplateForSections}
                  commitments={onboardingSections.commitments}
                  onCommitmentsChange={() => onboardingSections.fetchCommitments(selectedTemplateForSections)}
                />
              </TabsContent>
              
              <TabsContent value="trainer-notes" className="mt-6">
                <TrainerSpecificSection
                  templateId={selectedTemplateForSections}
                  notes={onboardingSections.trainerNotes}
                  onNotesChange={() => onboardingSections.fetchTrainerNotes(selectedTemplateForSections)}
                />
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSectionsDialog(false);
                setSelectedTemplateForSections(null);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}