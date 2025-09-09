import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Settings, Eye, EyeOff, Lock, RotateCcw } from 'lucide-react';
import { ContentType, VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { toast } from 'sonner';

interface TrainerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
  verification_status: string;
  profile_published: boolean;
}

const visibilityStateLabels: Record<VisibilityState, { label: string; icon: any; color: string }> = {
  hidden: { label: 'Hidden', icon: Lock, color: 'text-destructive' },
  blurred: { label: 'Blurred', icon: EyeOff, color: 'text-warning' },
  visible: { label: 'Visible', icon: Eye, color: 'text-success' }
};

export function TrainerVisibilityManagement() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<TrainerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTrainers(trainers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTrainers(
        trainers.filter(trainer => 
          trainer.first_name?.toLowerCase().includes(query) ||
          trainer.last_name?.toLowerCase().includes(query) ||
          trainer.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, trainers]);

  const loadTrainers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to fetch trainers
      const mockTrainers: TrainerProfile[] = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe', 
          email: 'john@example.com',
          verification_status: 'verified',
          profile_published: true
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com', 
          verification_status: 'pending',
          profile_published: false
        }
      ];
      setTrainers(mockTrainers);
    } catch (error) {
      console.error('Error loading trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const resetTrainerVisibilityToDefaults = async (trainerId: string) => {
    try {
      // TODO: Implement API call to reset trainer visibility to system defaults
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Trainer visibility settings reset to defaults');
    } catch (error) {
      console.error('Error resetting visibility:', error);
      toast.error('Failed to reset visibility settings');
    }
  };

  const TrainerVisibilityEditor = ({ trainer }: { trainer: TrainerProfile }) => {
    const [trainerSettings, setTrainerSettings] = useState<Record<string, VisibilityState>>({});
    const [saving, setSaving] = useState(false);

    const saveTrainerSettings = async () => {
      setSaving(true);
      try {
        // TODO: Implement API call to save trainer-specific settings
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Trainer visibility settings saved');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Visibility Overrides for {trainer.first_name} {trainer.last_name}</h4>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => resetTrainerVisibilityToDefaults(trainer.id)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button size="sm" onClick={saveTrainerSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Configure specific visibility overrides for this trainer. Empty settings will use system defaults.
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Individual trainer visibility editor will be implemented here with the same matrix interface as system defaults.
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trainer Visibility Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainer Visibility Management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage visibility settings for individual trainers and apply overrides to system defaults.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trainers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-12 gap-4 p-3 border-b font-medium text-sm">
              <div className="col-span-4">Trainer</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Published</div>
              <div className="col-span-2">Visibility Override</div>
              <div className="col-span-2">Actions</div>
            </div>
            
            {filteredTrainers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No trainers found matching your search' : 'No trainers found'}
              </div>
            ) : (
              filteredTrainers.map((trainer) => (
                <div key={trainer.id} className="grid grid-cols-12 gap-4 p-3 border-b last:border-b-0 hover:bg-muted/50">
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={trainer.profile_image_url} />
                      <AvatarFallback>
                        {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {trainer.first_name} {trainer.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trainer.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge variant={trainer.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {trainer.verification_status}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge variant={trainer.profile_published ? 'default' : 'secondary'}>
                      {trainer.profile_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline">
                      System Defaults
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Trainer Visibility Settings</DialogTitle>
                          <DialogDescription>
                            Configure visibility overrides for {trainer.first_name} {trainer.last_name}
                          </DialogDescription>
                        </DialogHeader>
                        <TrainerVisibilityEditor trainer={trainer} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}