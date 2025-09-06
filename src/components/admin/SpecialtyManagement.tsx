import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, Check, X, Users, Target, Dumbbell, Heart, Trophy, Brain, Activity } from 'lucide-react';
import { useSpecialties, useSpecialtyCategories, useTrainingTypes, useCustomSpecialtyRequests } from '@/hooks/useSpecialties';
import { useSpecialtyCategoryAdmin, useSpecialtyAdmin, useTrainingTypeAdmin, useCustomSpecialtyRequestAdmin } from '@/hooks/useSpecialtyAdmin';

const ICON_OPTIONS = [
  { value: 'Dumbbell', label: 'Dumbbell', icon: Dumbbell },
  { value: 'Target', label: 'Target', icon: Target },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Trophy', label: 'Trophy', icon: Trophy },
  { value: 'Brain', label: 'Brain', icon: Brain },
  { value: 'Activity', label: 'Activity', icon: Activity }
];

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal', label: 'Teal' },
  { value: 'pink', label: 'Pink' }
];

export function SpecialtyManagement() {
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useSpecialtyCategories();
  const { specialties, loading: specialtiesLoading, refetch: refetchSpecialties } = useSpecialties();
  const { trainingTypes, loading: trainingTypesLoading, refetch: refetchTrainingTypes } = useTrainingTypes();
  const { requests, loading: requestsLoading, refetch: refetchRequests } = useCustomSpecialtyRequests();

  const { createCategory, updateCategory, deleteCategory } = useSpecialtyCategoryAdmin();
  const { createSpecialty, updateSpecialty, deleteSpecialty } = useSpecialtyAdmin();
  const { createTrainingType, updateTrainingType, deleteTrainingType } = useTrainingTypeAdmin();
  const { reviewRequest } = useCustomSpecialtyRequestAdmin();

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSpecialtyDialog, setShowSpecialtyDialog] = useState(false);
  const [showTrainingTypeDialog, setShowTrainingTypeDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<any>(null);
  const [editingTrainingType, setEditingTrainingType] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Dumbbell',
    color: 'blue'
  });

  // Specialty form state
  const [specialtyForm, setSpecialtyForm] = useState({
    name: '',
    category_id: '',
    description: '',
    requires_qualification: false,
    matching_keywords: ''
  });

  // Training type form state
  const [trainingTypeForm, setTrainingTypeForm] = useState({
    name: '',
    description: '',
    delivery_formats: ['in-person', 'online'],
    min_participants: 1,
    max_participants: ''
  });

  const handleCreateCategory = async () => {
    try {
      await createCategory({
        ...categoryForm,
        display_order: categories.length + 1,
        is_active: true
      });
      setShowCategoryDialog(false);
      setCategoryForm({ name: '', description: '', icon: 'Dumbbell', color: 'blue' });
      refetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, categoryForm);
      setEditingCategory(null);
      setShowCategoryDialog(false);
      setCategoryForm({ name: '', description: '', icon: 'Dumbbell', color: 'blue' });
      refetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleCreateSpecialty = async () => {
    try {
      const keywordsArray = specialtyForm.matching_keywords
        ? specialtyForm.matching_keywords.split(',').map(k => k.trim()).filter(k => k)
        : [];

      await createSpecialty({
        name: specialtyForm.name,
        category_id: specialtyForm.category_id || null,
        description: specialtyForm.description || null,
        requires_qualification: specialtyForm.requires_qualification,
        matching_keywords: keywordsArray,
        display_order: specialties.filter(s => s.category_id === specialtyForm.category_id).length + 1,
        is_active: true
      });
      
      setShowSpecialtyDialog(false);
      setSpecialtyForm({
        name: '',
        category_id: '',
        description: '',
        requires_qualification: false,
        matching_keywords: ''
      });
      refetchSpecialties();
    } catch (error) {
      console.error('Error creating specialty:', error);
    }
  };

  const handleCreateTrainingType = async () => {
    try {
      await createTrainingType({
        name: trainingTypeForm.name,
        description: trainingTypeForm.description || null,
        delivery_formats: trainingTypeForm.delivery_formats,
        min_participants: trainingTypeForm.min_participants,
        max_participants: trainingTypeForm.max_participants ? parseInt(trainingTypeForm.max_participants) : null,
        display_order: trainingTypes.length + 1,
        is_active: true
      });

      setShowTrainingTypeDialog(false);
      setTrainingTypeForm({
        name: '',
        description: '',
        delivery_formats: ['in-person', 'online'],
        min_participants: 1,
        max_participants: ''
      });
      refetchTrainingTypes();
    } catch (error) {
      console.error('Error creating training type:', error);
    }
  };

  const handleReviewRequest = async (id: string, status: 'approved' | 'rejected', promoteToSpecialty = false) => {
    try {
      await reviewRequest(id, status, undefined, promoteToSpecialty);
      refetchRequests();
      if (promoteToSpecialty) {
        refetchSpecialties();
      }
    } catch (error) {
      console.error('Error reviewing request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Specialty & Training Type Management</h2>
          <p className="text-muted-foreground">
            Configure specialties, categories, and training types for the platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 sm:inline-flex sm:h-10 sm:w-auto min-w-max">
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="specialties" className="text-xs sm:text-sm">
              Specialties
            </TabsTrigger>
            <TabsTrigger value="training-types" className="text-xs sm:text-sm">
              Training Types
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm">
              Requests {requests.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1">
                  {requests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Specialty Categories</CardTitle>
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingCategory(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Create Category'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon">Icon</Label>
                      <Select value={categoryForm.icon} onValueChange={(value) => setCategoryForm({...categoryForm, icon: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="w-4 h-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Select value={categoryForm.color} onValueChange={(value) => setCategoryForm({...categoryForm, color: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                        {editingCategory ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div>Loading categories...</div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Name</TableHead>
                        <TableHead className="min-w-[150px]">Description</TableHead>
                        <TableHead className="min-w-[60px]">Icon</TableHead>
                        <TableHead className="min-w-[60px]">Color</TableHead>
                        <TableHead className="min-w-[80px]">Specialties Count</TableHead>
                        <TableHead className="min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => {
                        const IconComponent = ICON_OPTIONS.find(i => i.value === category.icon)?.icon || Dumbbell;
                        const specialtyCount = specialties.filter(s => s.category_id === category.id).length;
                        
                        return (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{category.description}</TableCell>
                            <TableCell>
                              <IconComponent className="w-4 h-4" />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-${category.color}-600 text-xs`}>
                                {category.color}
                              </Badge>
                            </TableCell>
                            <TableCell>{specialtyCount}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setCategoryForm({
                                      name: category.name,
                                      description: category.description || '',
                                      icon: category.icon || 'Dumbbell',
                                      color: category.color
                                    });
                                    setShowCategoryDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteConfirmId(category.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Specialties</CardTitle>
              <Dialog open={showSpecialtyDialog} onOpenChange={setShowSpecialtyDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Specialty
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Specialty</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={specialtyForm.name}
                        onChange={(e) => setSpecialtyForm({...specialtyForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={specialtyForm.category_id} onValueChange={(value) => setSpecialtyForm({...specialtyForm, category_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={specialtyForm.description}
                        onChange={(e) => setSpecialtyForm({...specialtyForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="keywords">Matching Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={specialtyForm.matching_keywords}
                        onChange={(e) => setSpecialtyForm({...specialtyForm, matching_keywords: e.target.value})}
                        placeholder="weight loss, fat loss, body transformation"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowSpecialtyDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSpecialty}>
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {specialtiesLoading ? (
                <div>Loading specialties...</div>
              ) : (
                <div className="space-y-6">
                  {categories.map((category) => {
                    const categorySpecialties = specialties.filter(s => s.category_id === category.id);
                    if (categorySpecialties.length === 0) return null;

                    const IconComponent = ICON_OPTIONS.find(i => i.value === category.icon)?.icon || Dumbbell;

                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5" />
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          <Badge variant="outline">{categorySpecialties.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categorySpecialties.map((specialty) => (
                            <Card key={specialty.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{specialty.name}</h4>
                                  {specialty.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{specialty.description}</p>
                                  )}
                                  {specialty.matching_keywords && specialty.matching_keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {specialty.matching_keywords.slice(0, 3).map((keyword, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {keyword}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteConfirmId(specialty.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training-types">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Training Types</CardTitle>
              <Dialog open={showTrainingTypeDialog} onOpenChange={setShowTrainingTypeDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Training Type
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Training Type</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={trainingTypeForm.name}
                        onChange={(e) => setTrainingTypeForm({...trainingTypeForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={trainingTypeForm.description}
                        onChange={(e) => setTrainingTypeForm({...trainingTypeForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Delivery Formats</Label>
                      <div className="flex gap-2 mt-2">
                        {['in-person', 'online', 'hybrid'].map((format) => (
                          <label key={format} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={trainingTypeForm.delivery_formats.includes(format)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTrainingTypeForm({
                                    ...trainingTypeForm,
                                    delivery_formats: [...trainingTypeForm.delivery_formats, format]
                                  });
                                } else {
                                  setTrainingTypeForm({
                                    ...trainingTypeForm,
                                    delivery_formats: trainingTypeForm.delivery_formats.filter(f => f !== format)
                                  });
                                }
                              }}
                            />
                            <span className="capitalize">{format}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-participants">Min Participants</Label>
                        <Input
                          id="min-participants"
                          type="number"
                          value={trainingTypeForm.min_participants}
                          onChange={(e) => setTrainingTypeForm({...trainingTypeForm, min_participants: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-participants">Max Participants</Label>
                        <Input
                          id="max-participants"
                          type="number"
                          value={trainingTypeForm.max_participants}
                          onChange={(e) => setTrainingTypeForm({...trainingTypeForm, max_participants: e.target.value})}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowTrainingTypeDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTrainingType}>
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {trainingTypesLoading ? (
                <div>Loading training types...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainingTypes.map((type) => (
                    <Card key={type.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          {type.description && (
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {type.delivery_formats.map((format) => (
                              <Badge key={format} variant="secondary" className="text-xs capitalize">
                                {format}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Participants: {type.min_participants}{type.max_participants ? `-${type.max_participants}` : '+'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirmId(type.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Custom Specialty Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div>Loading requests...</div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Specialty Name</TableHead>
                        <TableHead className="min-w-[120px]">Trainer</TableHead>
                        <TableHead className="min-w-[150px]">Description</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.requested_name}</TableCell>
                          <TableCell className="text-sm">
                            {request.profiles ? 
                              `${request.profiles.first_name || ''} ${request.profiles.last_name || ''}`.trim() || `Trainer #${request.trainer_id.slice(0, 8)}`
                              : `Trainer #${request.trainer_id.slice(0, 8)}`
                            }
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm">{request.description}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleReviewRequest(request.id, 'approved', true)}
                                  title="Approve and add as specialty"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReviewRequest(request.id, 'rejected')}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the item. It won't be visible to users but historical data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteConfirmId) {
                  // Determine which type of item we're deleting based on which tab is active
                  // This is a simplified approach - in practice you'd track the type
                  try {
                    await deleteCategory(deleteConfirmId);
                    refetchCategories();
                  } catch (error) {
                    // If category delete fails, try specialty or training type
                    try {
                      await deleteSpecialty(deleteConfirmId);
                      refetchSpecialties();
                    } catch (error2) {
                      await deleteTrainingType(deleteConfirmId);
                      refetchTrainingTypes();
                    }
                  }
                  setDeleteConfirmId(null);
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}