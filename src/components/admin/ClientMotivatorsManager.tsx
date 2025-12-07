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
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Flame, Link2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  useAllClientMotivators, 
  useClientMotivatorMutations, 
  ClientMotivator 
} from '@/hooks/useClientMotivators';
import { 
  useMotivatorActivityMappings, 
  useSystemActivities,
  useMotivatorActivityMappingMutations 
} from '@/hooks/useMotivatorActivityMappings';

// Motivators Tab
function MotivatorsTab() {
  const { data: motivators, isLoading } = useAllClientMotivators();
  const { createMotivator, updateMotivator, deleteMotivator } = useClientMotivatorMutations();
  const [editingMotivator, setEditingMotivator] = useState<ClientMotivator | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    icon: 'Flame',
    display_order: 0,
    is_active: true
  });
  
  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      description: '',
      icon: 'Flame',
      display_order: 0,
      is_active: true
    });
    setEditingMotivator(null);
  };
  
  const handleEdit = (motivator: ClientMotivator) => {
    setEditingMotivator(motivator);
    setFormData({
      key: motivator.key,
      label: motivator.label,
      description: motivator.description || '',
      icon: motivator.icon || 'Flame',
      display_order: motivator.display_order,
      is_active: motivator.is_active
    });
    setIsDialogOpen(true);
  };
  
  const handleSave = async () => {
    try {
      if (editingMotivator) {
        await updateMotivator.mutateAsync({ id: editingMotivator.id, ...formData });
        toast.success('Motivator updated');
      } else {
        await createMotivator.mutateAsync(formData);
        toast.success('Motivator created');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save motivator');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this motivator? This will also remove all activity mappings.')) return;
    try {
      await deleteMotivator.mutateAsync(id);
      toast.success('Motivator deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete motivator');
    }
  };
  
  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Motivation factors shown to clients in the survey</p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Motivator</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMotivator ? 'Edit' : 'Add'} Client Motivator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Key</Label>
                  <Input 
                    value={formData.key} 
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                    placeholder="e.g., positive_reinforcement"
                    disabled={!!editingMotivator}
                  />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input 
                    value={formData.label} 
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Positive reinforcement"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this motivation factor"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon (Lucide name)</Label>
                  <Input 
                    value={formData.icon} 
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g., Flame, Target, Heart"
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
              <Button onClick={handleSave} className="w-full" disabled={createMotivator.isPending || updateMotivator.isPending}>
                {editingMotivator ? 'Update' : 'Create'} Motivator
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
          {motivators?.map(motivator => (
            <TableRow key={motivator.id}>
              <TableCell><GripVertical className="w-4 h-4 text-muted-foreground" /></TableCell>
              <TableCell className="font-mono text-sm">{motivator.key}</TableCell>
              <TableCell className="font-medium">{motivator.label}</TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{motivator.description}</TableCell>
              <TableCell>
                <Badge variant={motivator.is_active ? 'default' : 'outline'}>
                  {motivator.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(motivator)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(motivator.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Activity Mappings Tab
function ActivityMappingsTab() {
  const { data: motivators, isLoading: motivatorsLoading } = useAllClientMotivators();
  const { data: mappings, isLoading: mappingsLoading } = useMotivatorActivityMappings();
  const { data: activities, isLoading: activitiesLoading } = useSystemActivities();
  const { setMappingsForMotivator } = useMotivatorActivityMappingMutations();
  
  // Group mappings by motivator
  const groupedMappings = useMemo(() => {
    const groups: Record<string, { motivator: ClientMotivator; activityIds: string[] }> = {};
    
    motivators?.forEach(m => {
      groups[m.id] = { motivator: m, activityIds: [] };
    });
    
    mappings?.forEach(mapping => {
      if (groups[mapping.motivator_id]) {
        groups[mapping.motivator_id].activityIds.push(mapping.activity_id);
      }
    });
    
    return Object.values(groups).sort((a, b) => a.motivator.display_order - b.motivator.display_order);
  }, [motivators, mappings]);
  
  // Group activities by category
  const activitiesByCategory = useMemo(() => {
    const grouped: Record<string, typeof activities> = {};
    activities?.forEach(activity => {
      const cat = activity.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat]!.push(activity);
    });
    return grouped;
  }, [activities]);
  
  const handleToggleActivity = async (motivatorId: string, activityId: string, currentActivityIds: string[]) => {
    const isCurrentlyMapped = currentActivityIds.includes(activityId);
    const newActivityIds = isCurrentlyMapped
      ? currentActivityIds.filter(id => id !== activityId)
      : [...currentActivityIds, activityId];
    
    try {
      await setMappingsForMotivator.mutateAsync({ motivatorId, activityIds: newActivityIds });
      toast.success('Mapping updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update mapping');
    }
  };
  
  if (motivatorsLoading || mappingsLoading || activitiesLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }
  
  // Find unmapped motivators
  const unmappedMotivators = groupedMappings.filter(g => g.activityIds.length === 0);
  
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Map each motivator to Ways of Working activities. When a trainer includes these activities in their packages, 
        they'll score higher for clients who selected that motivator.
      </p>
      
      {unmappedMotivators.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unmapped Motivators</AlertTitle>
          <AlertDescription>
            The following motivators have no activity mappings: {unmappedMotivators.map(g => g.motivator.label).join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      <Accordion type="multiple" className="space-y-2">
        {groupedMappings.map(({ motivator, activityIds }) => (
          <AccordionItem key={motivator.id} value={motivator.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 flex-1">
                <Flame className="w-4 h-4 text-primary" />
                <span className="font-medium">{motivator.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {activityIds.length} {activityIds.length === 1 ? 'activity' : 'activities'}
                </Badge>
                <div className="ml-auto mr-4">
                  {activityIds.length === 0 ? (
                    <span className="flex items-center gap-1 text-destructive text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      No mappings
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Complete
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 space-y-4">
                {motivator.description && (
                  <p className="text-sm text-muted-foreground">{motivator.description}</p>
                )}
                
                {Object.entries(activitiesByCategory).map(([category, categoryActivities]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryActivities?.map(activity => {
                        const isMapped = activityIds.includes(activity.id);
                        return (
                          <Badge
                            key={activity.id}
                            variant={isMapped ? 'default' : 'outline'}
                            className="cursor-pointer transition-colors"
                            onClick={() => handleToggleActivity(motivator.id, activity.id, activityIds)}
                          >
                            {isMapped && <Link2 className="w-3 h-3 mr-1" />}
                            {activity.activity_name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// Main Manager Component
export function ClientMotivatorsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Client Motivators
        </CardTitle>
        <CardDescription>
          Manage motivation factors that clients select in their survey, and map them to trainer activities for matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="motivators" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="motivators" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Motivators
            </TabsTrigger>
            <TabsTrigger value="mappings" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Activity Mappings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="motivators" className="mt-6">
            <MotivatorsTab />
          </TabsContent>
          
          <TabsContent value="mappings" className="mt-6">
            <ActivityMappingsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
