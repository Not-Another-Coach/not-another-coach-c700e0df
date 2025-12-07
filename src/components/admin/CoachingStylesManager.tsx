import { useState, useMemo } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Heart, ArrowLeftRight, GripVertical, AlertTriangle, CheckCircle2, Info, HelpCircle } from 'lucide-react';
import { useAllClientCoachingStyles, useClientCoachingStyleMutations, ClientCoachingStyle } from '@/hooks/useClientCoachingStyles';
import { useAllTrainerCoachingStyles, useTrainerCoachingStyleMutations, TrainerCoachingStyle } from '@/hooks/useTrainerCoachingStyles';
import { useCoachingStyleMappings, useCoachingStyleMappingMutations, CoachingStyleMapping } from '@/hooks/useCoachingStyleMappings';
import { EmojiPicker } from './EmojiPicker';

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
                  <EmojiPicker
                    value={formData.emoji}
                    onChange={(emoji) => setFormData(prev => ({ ...prev, emoji }))}
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

// Mappings Tab with grouped accordion view
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
  
  // Compute unmapped styles
  const { unmappedClientStyles, unmappedTrainerStyles, groupedMappings } = useMemo(() => {
    const mappedClientIds = new Set(mappings?.map(m => m.client_style_id) || []);
    const mappedTrainerIds = new Set(mappings?.map(m => m.trainer_style_id) || []);
    
    const unmappedClient = clientStyles?.filter(s => s.is_active && !mappedClientIds.has(s.id)) || [];
    const unmappedTrainer = trainerStyles?.filter(s => s.is_active && !mappedTrainerIds.has(s.id)) || [];
    
    // Group mappings by client style
    const grouped: Record<string, { clientStyle: ClientCoachingStyle; mappings: CoachingStyleMapping[] }> = {};
    
    clientStyles?.forEach(cs => {
      if (cs.is_active) {
        grouped[cs.id] = { clientStyle: cs, mappings: [] };
      }
    });
    
    mappings?.forEach(m => {
      if (grouped[m.client_style_id]) {
        grouped[m.client_style_id].mappings.push(m);
      }
    });
    
    return {
      unmappedClientStyles: unmappedClient,
      unmappedTrainerStyles: unmappedTrainer,
      groupedMappings: Object.values(grouped).sort((a, b) => a.clientStyle.display_order - b.clientStyle.display_order)
    };
  }, [mappings, clientStyles, trainerStyles]);
  
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
  
  const getMappingTypeBadge = (type: string, weight: number) => {
    switch (type) {
      case 'primary':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Primary ({weight}%)</Badge>;
      case 'secondary':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Secondary ({weight}%)</Badge>;
      case 'tertiary':
        return <Badge variant="outline">Tertiary ({weight}%)</Badge>;
      default:
        return null;
    }
  };
  
  const getMappingStatus = (mappings: CoachingStyleMapping[]) => {
    if (mappings.length === 0) {
      return { icon: AlertTriangle, color: 'text-destructive', label: 'No mappings' };
    }
    const hasPrimary = mappings.some(m => m.mapping_type === 'primary');
    if (hasPrimary) {
      return { icon: CheckCircle2, color: 'text-emerald-600', label: 'Complete' };
    }
    return { icon: AlertTriangle, color: 'text-amber-500', label: 'No primary' };
  };
  
  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Unmapped Styles Warnings */}
        {(unmappedClientStyles.length > 0 || unmappedTrainerStyles.length > 0) && (
          <div className="space-y-2">
            {unmappedClientStyles.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Unmapped Client Styles</AlertTitle>
                <AlertDescription>
                  These client preferences have no trainer style mappings and won't affect matching: {' '}
                  <span className="font-medium">{unmappedClientStyles.map(s => s.label).join(', ')}</span>
                </AlertDescription>
              </Alert>
            )}
            {unmappedTrainerStyles.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Unused Trainer Styles</AlertTitle>
                <AlertDescription>
                  These trainer styles aren't linked to any client preference: {' '}
                  <span className="font-medium">{unmappedTrainerStyles.map(s => `${s.emoji} ${s.label}`).join(', ')}</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {/* Header with info tooltip */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">How client preferences map to trainer styles</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">How weight affects matching:</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Primary (100%)</strong>: Full match credit when trainer has this style</li>
                  <li>• <strong>Secondary (60%)</strong>: Partial match credit</li>
                  <li>• <strong>Tertiary (30%)</strong>: Minor match credit</li>
                </ul>
                <p className="text-sm mt-2 text-muted-foreground">
                  Multiple primary mappings mean trainers with ANY of those styles get full credit.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
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
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Mapping Type</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Primary = strongest match, Secondary = moderate, Tertiary = weak</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select 
                    value={formData.mapping_type} 
                    onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => {
                      const weightMap = { primary: 100, secondary: 60, tertiary: 30 };
                      setFormData(prev => ({ ...prev, mapping_type: value, weight: weightMap[value] }));
                    }}
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
        
        {/* Grouped Accordion View */}
        <Accordion type="multiple" className="space-y-2" defaultValue={groupedMappings.filter(g => g.mappings.length > 0).map(g => g.clientStyle.id)}>
          {groupedMappings.map(({ clientStyle, mappings: styleMappings }) => {
            const status = getMappingStatus(styleMappings);
            const StatusIcon = status.icon;
            const primaryCount = styleMappings.filter(m => m.mapping_type === 'primary').length;
            
            return (
              <AccordionItem 
                key={clientStyle.id} 
                value={clientStyle.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className="font-medium">{clientStyle.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {styleMappings.length} mapping{styleMappings.length !== 1 ? 's' : ''}
                    </Badge>
                    {primaryCount > 1 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs cursor-help">
                            {primaryCount} primary
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Multiple primary mappings: trainers with ANY of these styles get 100% match credit</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {styleMappings.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No trainer styles mapped. Add a mapping to include this preference in matching.
                    </p>
                  ) : (
                    <div className="space-y-2 pb-2">
                      {styleMappings
                        .sort((a, b) => b.weight - a.weight)
                        .map(mapping => {
                          const trainerStyle = trainerStyles?.find(ts => ts.id === mapping.trainer_style_id);
                          return (
                            <div 
                              key={mapping.id}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{trainerStyle?.emoji}</span>
                                <span className="font-medium">{trainerStyle?.label || mapping.trainer_style_id}</span>
                                {getMappingTypeBadge(mapping.mapping_type, mapping.weight)}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(mapping)}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(mapping.id)}>
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </TooltipProvider>
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
