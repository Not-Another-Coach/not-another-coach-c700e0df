import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'trainer';
  profile_photo_url?: string;
}

interface CleanupResult {
  messages: number;
  conversations: number;
  feedback_responses: number;
  feedback: number;
  call_notifications: number;
  feedback_notifications: number;
  call_notes: number;
  discovery_calls: number;
  selection_requests: number;
  waitlist_entries: number;
  alerts: number;
  engagement_records: number;
}

export const ClientTrainerCleanup = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<CleanupResult | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type, profile_photo_url')
        .in('user_type', ['client', 'trainer'])
        .order('first_name');

      if (error) throw error;

      const clientUsers = profiles?.filter(p => p.user_type === 'client') || [];
      const trainerUsers = profiles?.filter(p => p.user_type === 'trainer') || [];

      setClients(clientUsers as User[]);
      setTrainers(trainerUsers as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleCleanup = async () => {
    if (!selectedClient || !selectedTrainer) {
      toast.error('Please select both a client and a trainer');
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    const trainer = trainers.find(t => t.id === selectedTrainer);

    if (!client || !trainer) {
      toast.error('Selected users not found');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL interaction history between:\n\n` +
      `Client: ${client.first_name} ${client.last_name}\n` +
      `Trainer: ${trainer.first_name} ${trainer.last_name}\n\n` +
      `This action cannot be undone and will remove:\n` +
      `• Messages and conversations\n` +
      `• Discovery calls and feedback\n` +
      `• Coach selection requests\n` +
      `• Waitlist entries\n` +
      `• Engagement records (likes, shortlists)\n` +
      `• Related alerts and notifications`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_cleanup_client_trainer_interactions', {
        p_client_id: selectedClient,
        p_trainer_id: selectedTrainer
      });

      if (error) throw error;

      setLastCleanupResult(data as unknown as CleanupResult);
      
      const totalDeleted = Object.values(data as unknown as CleanupResult).reduce((sum, count) => sum + count, 0);
      
      toast.success(
        `Cleanup completed! Deleted ${totalDeleted} records total.`,
        { duration: 5000 }
      );

      // Reset selections
      setSelectedClient('');
      setSelectedTrainer('');
    } catch (error: any) {
      console.error('Error during cleanup:', error);
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canRunCleanup = selectedClient && selectedTrainer && !loading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Client-Trainer Interaction Cleanup
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Remove all interaction history between a specific client and trainer. 
            Useful for testing and data management.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action is irreversible and will permanently delete all data 
              related to the interaction between the selected client and trainer.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {client.first_name} {client.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trainer Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Trainer</label>
              <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a trainer..." />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {trainer.first_name} {trainer.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Users Preview */}
          {(selectedClient || selectedTrainer) && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Selected for cleanup:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedClient && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Client: {clients.find(c => c.id === selectedClient)?.first_name} {clients.find(c => c.id === selectedClient)?.last_name}
                  </Badge>
                )}
                {selectedTrainer && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Trainer: {trainers.find(t => t.id === selectedTrainer)?.first_name} {trainers.find(t => t.id === selectedTrainer)?.last_name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleCleanup}
              disabled={!canRunCleanup}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Cleaning up...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Run Cleanup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Results */}
      {lastCleanupResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Last Cleanup Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(lastCleanupResult).map(([key, count]) => (
                <div key={key} className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  Total records deleted: {Object.values(lastCleanupResult).reduce((sum, count) => sum + count, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};