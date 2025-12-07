import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Heart, ArrowLeftRight, GripVertical } from 'lucide-react';
import { useAllClientCoachingStyles, useClientCoachingStyleMutations, ClientCoachingStyle } from '@/hooks/useClientCoachingStyles';
import { useAllTrainerCoachingStyles, useTrainerCoachingStyleMutations, TrainerCoachingStyle } from '@/hooks/useTrainerCoachingStyles';
import { useCoachingStyleMappings, useCoachingStyleMappingMutations, CoachingStyleMapping } from '@/hooks/useCoachingStyleMappings';

// Client Styles Tab
function ClientStylesTab() {
  const { data: styles, isLoading } = useAllClientCoachingStyles();
  const { createStyle, updateStyle, deleteStyle } = useClientCoachingStyleMutations();
  const [editingStyle, setEditingStyle] = useState<ClientCoachingStyle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    style_key: '',
    label: '',
    description: '',
    icon: 'Heart',
    keywords: [] as string[],
    display_order: 0,
    is_active: true
  });
  
  const resetForm = () => {
    setFormData({
      style_key: '',
      label: '',
      description: '',
      icon: 'Heart',
      keywords: [],
      display_order: 0,
      is_active: true
    });
    setEditingStyle(null);
  };
  
  const handleEdit = (style: ClientCoachingStyle) => {
    setEditingStyle(style);
    setFormData({
      style_key: style.style_key,
      label: style.label,
      description: style.description || '',
      icon: style.icon || 'Heart',
      keywords: style.keywords || [],
      display_order: style.display_order,
      is_active: style.is_active
    });
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    try {
      if (editingStyle) {
        await updateStyle.mutateAsync({ id: editingStyle.id, ...formData });
        toast.success('Style updated');
      } else {
        await createStyle.mutateAsync(formData);
        toast.success('Style created');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save style');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coaching style?')) return;
    try {
      await deleteStyle.mutateAsync(id);
      toast.success('Style deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete style');
    }
  };
  
  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Options shown to clients in the survey</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Style</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStyle ? 'Edit' : 'Add'} Client Coaching Style</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Style Key</Label>
                  <Input 
                    value={formData.style_key} 
                    onChange={(e) => setFormData(prev => ({ ...prev, style_key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                    placeholder="e.g., tough_love"
                    disabled={!!editingStyle}
                  />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input 
                    value={formData.label} 
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Tough Love"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this coaching style"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <Input 
                    value={formData.icon} 
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="Lucide icon name"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input 
                    type="number"
                    value={formData.display_order} 
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label>Keywords (comma-separated)</Label>
                <Input 
                  value={formData.keywords.join(', ')} 
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                  placeholder="encouraging, supportive, positive"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={createStyle.isPending || updateStyle.isPending}>
                {editingStyle ? 'Update' : 'Create'} Style
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles?.map(style => (
            <TableRow key={style.id}>
              <TableCell><GripVertical className="w-4 h-4 text-muted-foreground" /></TableCell>
              <TableCell className="font-mono text-sm">{style.style_key}</TableCell>
              <TableCell className="font-medium">{style.label}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {style.keywords?.slice(0, 3).map(k => (
                    <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                  ))}
                  {style.keywords?.length > 3 && <Badge variant="outline" className="text-xs">+{style.keywords.length - 3}</Badge>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={style.is_active ? 'default' : 'outline'}>{style.is_active ? 'Active' : 'Inactive'}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(style)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(style.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Trainer Styles Tab
function TrainerStylesTab() {
  const { data: styles, isLoading } = useAllTrainerCoachingStyles();
  const { createStyle, updateStyle, deleteStyle } = useTrainerCoachingStyleMutations();
  const [editingStyle, setEditingStyle] = useState<TrainerCoachingStyle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    style_key: '',
    label: '',
    description: '',
    emoji: '💪',
    display_order: 0,
    is_active: true
  });
  
  const resetForm = () => {
    setFormData({
      style_key: '',
      label: '',
      description: '',
      emoji: '💪',
      display_order: 0,
      is_active: true
    });
    setEditingStyle(null);
  };
  
  const handleEdit = (style: TrainerCoachingStyle) => {
    setEditingStyle(style);
    setFormData({
      style_key: style.style_key,
      label: style.label,
      description: style.description || '',
      emoji: style.emoji || '💪',
      display_order: style.display_order,
      is_active: style.is_active
    });
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    try {
      if (editingStyle) {
        await updateStyle.mutateAsync({ id: editingStyle.id, ...formData });
        toast.success('Style updated');
      } else {
        await createStyle.mutateAsync(formData);
        toast.success('Style created');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save style');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coaching style?')) return;
    try {
      await deleteStyle.mutateAsync(id);
      toast.success('Style deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete style');
    }
  };
  
  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Options shown to trainers in their profile setup</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Style</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStyle ? 'Edit' : 'Add'} Trainer Coaching Style</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Style Key</Label>
                  <Input 
                    value={formData.style_key} 
                    onChange={(e) => setFormData(prev => ({ ...prev, style_key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                    placeholder="e.g., tough_love"
                    disabled={!!editingStyle}
                  />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input 
                    value={formData.label} 
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Tough Love"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this coaching style"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Emoji</Label>
                  <Input 
                    value={formData.emoji} 
                    onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                    placeholder="💪"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input 
                    type="number"
                    value={formData.display_order} 
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={createStyle.isPending || updateStyle.isPending}>
                {editingStyle ? 'Update' : 'Create'} Style
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles?.map(style => (
            <TableRow key={style.id}>
              <TableCell><span className="text-xl">{style.emoji}</span></TableCell>
              <TableCell className="font-mono text-sm">{style.style_key}</TableCell>
              <TableCell className="font-medium">{style.label}</TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{style.description}</TableCell>
              <TableCell>
                <Badge variant={style.is_active ? 'default' : 'outline'}>{style.is_active ? 'Active' : 'Inactive'}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(style)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(style.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Mappings Tab
function MappingsTab() {
  const { data: mappings, isLoading } = useCoachingStyleMappings();
  const { data: clientStyles } = useAllClientCoachingStyles();
  const { data: trainerStyles } = useAllTrainerCoachingStyles();
  const { createMapping, updateMapping, deleteMapping } = useCoachingStyleMappingMutations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<CoachingStyleMapping | null>(null);
  const [formData, setFormData] = useState({
    client_style_id: '',
    trainer_style_id: '',
    weight: 100,
    mapping_type: 'primary' as 'primary' | 'secondary' | 'tertiary'
  });
  
  const resetForm = () => {
    setFormData({
      client_style_id: '',
      trainer_style_id: '',
      weight: 100,
      mapping_type: 'primary'
    });
    setEditingMapping(null);
  };
  
  const handleEdit = (mapping: CoachingStyleMapping) => {
    setEditingMapping(mapping);
    setFormData({
      client_style_id: mapping.client_style_id,
      trainer_style_id: mapping.trainer_style_id,
      weight: mapping.weight,
      mapping_type: mapping.mapping_type
    });
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    try {
      if (editingMapping) {
        await updateMapping.mutateAsync({ id: editingMapping.id, weight: formData.weight, mapping_type: formData.mapping_type });
        toast.success('Mapping updated');
      } else {
        await createMapping.mutateAsync(formData);
        toast.success('Mapping created');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save mapping');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this mapping?')) return;
    try {
      await deleteMapping.mutateAsync(id);
      toast.success('Mapping deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete mapping');
    }
  };
  
  const getMappingTypeBadge = (type: string) => {
    switch (type) {
      case 'primary':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Primary (100)</Badge>;
      case 'secondary':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Secondary (60)</Badge>;
      case 'tertiary':
        return <Badge variant="outline">Tertiary (30)</Badge>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">How client coaching style preferences map to trainer styles for matching</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Mapping</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMapping ? 'Edit' : 'Add'} Style Mapping</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Client Style</Label>
                <Select 
                  value={formData.client_style_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, client_style_id: value }))}
                  disabled={!!editingMapping}
                >
                  <SelectTrigger><SelectValue placeholder="Select client style" /></SelectTrigger>
                  <SelectContent>
                    {clientStyles?.map(style => (
                      <SelectItem key={style.id} value={style.id}>{style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trainer Style</Label>
                <Select 
                  value={formData.trainer_style_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trainer_style_id: value }))}
                  disabled={!!editingMapping}
                >
                  <SelectTrigger><SelectValue placeholder="Select trainer style" /></SelectTrigger>
                  <SelectContent>
                    {trainerStyles?.map(style => (
                      <SelectItem key={style.id} value={style.id}>{style.emoji} {style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mapping Type</Label>
                <Select 
                  value={formData.mapping_type} 
                  onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => setFormData(prev => ({ ...prev, mapping_type: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (100% weight)</SelectItem>
                    <SelectItem value="secondary">Secondary (60% weight)</SelectItem>
                    <SelectItem value="tertiary">Tertiary (30% weight)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Weight: {formData.weight}%</Label>
                <Slider 
                  value={[formData.weight]} 
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, weight: value }))}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={createMapping.isPending || updateMapping.isPending}>
                {editingMapping ? 'Update' : 'Create'} Mapping
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Style</TableHead>
            <TableHead className="text-center">→</TableHead>
            <TableHead>Trainer Style</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings?.map(mapping => (
            <TableRow key={mapping.id}>
              <TableCell className="font-medium">{mapping.client_style?.label || mapping.client_style_id}</TableCell>
              <TableCell className="text-center"><ArrowLeftRight className="w-4 h-4 text-muted-foreground" /></TableCell>
              <TableCell className="font-medium">{mapping.trainer_style?.label || mapping.trainer_style_id}</TableCell>
              <TableCell>{getMappingTypeBadge(mapping.mapping_type)}</TableCell>
              <TableCell><Badge variant="outline">{mapping.weight}%</Badge></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(mapping)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(mapping.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CoachingStylesManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Coaching Styles Configuration
        </CardTitle>
        <CardDescription>
          Manage coaching style options for clients and trainers, and configure how they map for matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="client-styles">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="client-styles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Client Styles
            </TabsTrigger>
            <TabsTrigger value="trainer-styles" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Trainer Styles
            </TabsTrigger>
            <TabsTrigger value="mappings" className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Mappings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="client-styles" className="mt-6">
            <ClientStylesTab />
          </TabsContent>
          
          <TabsContent value="trainer-styles" className="mt-6">
            <TrainerStylesTab />
          </TabsContent>
          
          <TabsContent value="mappings" className="mt-6">
            <MappingsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
