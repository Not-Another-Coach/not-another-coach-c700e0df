import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus, Edit, Trash2, Target, TrendingUp, Dumbbell, Heart, Zap, Shield, Activity, Brain, Users, Moon, Flame, BookOpen, Calendar, Link2, X } from 'lucide-react';
import { useClientGoals, ClientGoal, CreateClientGoalRequest, UpdateClientGoalRequest } from '@/hooks/useClientGoals';
import { useGoalMappings, GoalSpecialtyMapping, DEFAULT_WEIGHTS } from '@/hooks/useClientGoalMappings';
import { useSpecialties } from '@/hooks/useSpecialties';

const ICON_OPTIONS = [
  { value: 'Target', label: 'Target', icon: Target },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
  { value: 'Dumbbell', label: 'Dumbbell', icon: Dumbbell },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Activity', label: 'Activity', icon: Activity },
  { value: 'Brain', label: 'Brain', icon: Brain },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Moon', label: 'Moon', icon: Moon },
  { value: 'Flame', label: 'Flame', icon: Flame },
  { value: 'BookOpen', label: 'Book', icon: BookOpen },
  { value: 'Calendar', label: 'Calendar', icon: Calendar },
];

function getIconComponent(iconName: string) {
  const option = ICON_OPTIONS.find(o => o.value === iconName);
  return option?.icon || Target;
}

export function ClientGoalManagement() {
  const { goals, loading, primaryGoals, secondaryGoals, createGoal, updateGoal, deleteGoal, refetch } = useClientGoals();
  const { specialties } = useSpecialties();
  
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ClientGoal | null>(null);
  const [selectedGoalForMapping, setSelectedGoalForMapping] = useState<ClientGoal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [goalForm, setGoalForm] = useState<Partial<CreateClientGoalRequest>>({
    goal_key: '',
    label: '',
    description: '',
    icon: 'Target',
    goal_type: 'primary',
    display_order: 0,
    is_active: true,
  });

  const resetGoalForm = () => {
    setGoalForm({
      goal_key: '',
      label: '',
      description: '',
      icon: 'Target',
      goal_type: 'primary',
      display_order: 0,
      is_active: true,
    });
  };

  const handleCreateGoal = async () => {
    if (!goalForm.goal_key || !goalForm.label) return;
    
    const success = await createGoal({
      goal_key: goalForm.goal_key,
      label: goalForm.label,
      description: goalForm.description || null,
      icon: goalForm.icon || 'Target',
      goal_type: goalForm.goal_type || 'primary',
      display_order: goalForm.display_order || (goalForm.goal_type === 'primary' ? primaryGoals.length + 1 : secondaryGoals.length + 1),
      is_active: goalForm.is_active ?? true,
    });

    if (success) {
      setShowGoalDialog(false);
      resetGoalForm();
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    const success = await updateGoal(editingGoal.id, {
      goal_key: goalForm.goal_key,
      label: goalForm.label,
      description: goalForm.description,
      icon: goalForm.icon,
      goal_type: goalForm.goal_type,
      display_order: goalForm.display_order,
      is_active: goalForm.is_active,
    } as UpdateClientGoalRequest);

    if (success) {
      setShowGoalDialog(false);
      setEditingGoal(null);
      resetGoalForm();
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteConfirmId) return;
    await deleteGoal(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const openEditDialog = (goal: ClientGoal) => {
    setEditingGoal(goal);
    setGoalForm({
      goal_key: goal.goal_key,
      label: goal.label,
      description: goal.description || '',
      icon: goal.icon,
      goal_type: goal.goal_type,
      display_order: goal.display_order,
      is_active: goal.is_active,
    });
    setShowGoalDialog(true);
  };

  const openMappingDialog = (goal: ClientGoal) => {
    setSelectedGoalForMapping(goal);
    setShowMappingDialog(true);
  };

  const generateGoalKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  };

  const GoalTable = ({ goalsList, type }: { goalsList: ClientGoal[], type: 'primary' | 'secondary' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Order</TableHead>
          <TableHead className="w-12">Icon</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-20">Active</TableHead>
          <TableHead className="w-24">Mappings</TableHead>
          <TableHead className="w-32">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {goalsList.map((goal) => {
          const IconComponent = getIconComponent(goal.icon);
          return (
            <TableRow key={goal.id}>
              <TableCell className="font-mono text-xs">{goal.display_order}</TableCell>
              <TableCell>
                <IconComponent className="h-4 w-4" />
              </TableCell>
              <TableCell className="font-medium">{goal.label}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{goal.goal_key}</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {goal.description || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={goal.is_active ? 'default' : 'secondary'}>
                  {goal.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openMappingDialog(goal)}
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(goal)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirmId(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {goalsList.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No {type} goals found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Goal Management</h2>
          <p className="text-muted-foreground">
            Configure client-facing goals and their specialty mappings for the matching algorithm
          </p>
        </div>
      </div>

      <Tabs defaultValue="primary" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="primary">
              Primary Goals
              <Badge variant="secondary" className="ml-2">{primaryGoals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="secondary">
              Secondary Goals
              <Badge variant="secondary" className="ml-2">{secondaryGoals.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <Dialog open={showGoalDialog} onOpenChange={(open) => {
            setShowGoalDialog(open);
            if (!open) {
              setEditingGoal(null);
              resetGoalForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingGoal(null);
                resetGoalForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? 'Edit Goal' : 'Create Goal'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="label">Label (Client-Facing) *</Label>
                  <Input
                    id="label"
                    value={goalForm.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setGoalForm({
                        ...goalForm, 
                        label,
                        goal_key: editingGoal ? goalForm.goal_key : generateGoalKey(label),
                      });
                    }}
                    placeholder="e.g. Lose Weight & Tone Up"
                  />
                </div>

                <div>
                  <Label htmlFor="goal_key">Goal Key *</Label>
                  <Input
                    id="goal_key"
                    value={goalForm.goal_key}
                    onChange={(e) => setGoalForm({...goalForm, goal_key: e.target.value})}
                    placeholder="e.g. weight_loss"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier used in the system (auto-generated from label)
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={goalForm.description || ''}
                    onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                    placeholder="Brief description shown to clients"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal_type">Goal Type</Label>
                    <Select 
                      value={goalForm.goal_type} 
                      onValueChange={(value: 'primary' | 'secondary') => setGoalForm({...goalForm, goal_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select 
                      value={goalForm.icon} 
                      onValueChange={(value) => setGoalForm({...goalForm, icon: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={goalForm.display_order}
                      onChange={(e) => setGoalForm({...goalForm, display_order: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={goalForm.is_active}
                      onCheckedChange={(checked) => setGoalForm({...goalForm, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowGoalDialog(false);
                    setEditingGoal(null);
                    resetGoalForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}>
                    {editingGoal ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="primary">
          <Card>
            <CardHeader>
              <CardTitle>Primary Goals</CardTitle>
              <CardDescription>
                Main fitness goals that clients select during onboarding. These have the strongest impact on trainer matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <GoalTable goalsList={primaryGoals} type="primary" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secondary">
          <Card>
            <CardHeader>
              <CardTitle>Secondary Goals</CardTitle>
              <CardDescription>
                Additional benefits that clients can optionally select. These provide secondary matching signals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <GoalTable goalsList={secondaryGoals} type="secondary" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mapping Dialog */}
      <MappingEditorDialog
        goal={selectedGoalForMapping}
        open={showMappingDialog}
        onOpenChange={(open) => {
          setShowMappingDialog(open);
          if (!open) setSelectedGoalForMapping(null);
        }}
        specialties={specialties}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the goal, hiding it from clients. The goal and its mappings will be preserved and can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Mapping Editor Dialog Component
function MappingEditorDialog({ 
  goal, 
  open, 
  onOpenChange,
  specialties 
}: { 
  goal: ClientGoal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialties: any[];
}) {
  const { mappings, loading, createMapping, updateMapping, deleteMapping } = useGoalMappings(goal?.id);
  const [addingSpecialty, setAddingSpecialty] = useState(false);
  const [newMappingSpecialtyId, setNewMappingSpecialtyId] = useState('');
  const [newMappingType, setNewMappingType] = useState<'primary' | 'secondary' | 'optional'>('primary');

  const mappedSpecialtyIds = mappings.map(m => m.specialty_id);
  const availableSpecialties = specialties.filter(s => !mappedSpecialtyIds.includes(s.id) && s.is_active);

  const handleAddMapping = async () => {
    if (!goal || !newMappingSpecialtyId) return;
    
    const success = await createMapping({
      goal_id: goal.id,
      specialty_id: newMappingSpecialtyId,
      mapping_type: newMappingType,
    });

    if (success) {
      setAddingSpecialty(false);
      setNewMappingSpecialtyId('');
      setNewMappingType('primary');
    }
  };

  const handleUpdateWeight = async (mappingId: string, weight: number) => {
    await updateMapping(mappingId, { weight });
  };

  const handleUpdateType = async (mappingId: string, mappingType: 'primary' | 'secondary' | 'optional') => {
    await updateMapping(mappingId, { 
      mapping_type: mappingType,
      weight: DEFAULT_WEIGHTS[mappingType],
    });
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Specialty Mappings: {goal.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Configure which trainer specialties match this client goal and how strongly they count toward the match score.
          </div>

          {/* Mapping Type Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Badge variant="default">Primary</Badge>
              <span className="text-muted-foreground">= 100% weight (strong match)</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary">Secondary</Badge>
              <span className="text-muted-foreground">= 60% weight</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline">Optional</Badge>
              <span className="text-muted-foreground">= 30% weight</span>
            </div>
          </div>

          {/* Current Mappings */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {mappings.map((mapping) => (
                <Card key={mapping.id} className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{mapping.specialty?.name || 'Unknown Specialty'}</div>
                    </div>
                    
                    <Select 
                      value={mapping.mapping_type} 
                      onValueChange={(value: 'primary' | 'secondary' | 'optional') => handleUpdateType(mapping.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 w-32">
                      <Slider
                        value={[mapping.weight]}
                        onValueChange={(values) => handleUpdateWeight(mapping.id, values[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs font-mono w-8">{mapping.weight}%</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMapping(mapping.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {mappings.length === 0 && (
                <div className="text-center text-muted-foreground py-6 border border-dashed rounded-lg">
                  No specialty mappings configured for this goal
                </div>
              )}
            </div>
          )}

          {/* Add New Mapping */}
          {addingSpecialty ? (
            <Card className="p-4 border-primary/50">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Specialty</Label>
                    <Select value={newMappingSpecialtyId} onValueChange={setNewMappingSpecialtyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSpecialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Mapping Type</Label>
                    <Select 
                      value={newMappingType} 
                      onValueChange={(value: 'primary' | 'secondary' | 'optional') => setNewMappingType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary (100%)</SelectItem>
                        <SelectItem value="secondary">Secondary (60%)</SelectItem>
                        <SelectItem value="optional">Optional (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAddingSpecialty(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddMapping} disabled={!newMappingSpecialtyId}>
                    Add Mapping
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setAddingSpecialty(true)}
              disabled={availableSpecialties.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              {availableSpecialties.length === 0 ? 'All specialties mapped' : 'Add Specialty Mapping'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
