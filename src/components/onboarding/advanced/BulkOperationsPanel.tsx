import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Play, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedTemplates } from '@/hooks/useAdvancedTemplates';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface BulkOperationsPanelProps {
  templateId: string;
}

export function BulkOperationsPanel({ templateId }: BulkOperationsPanelProps) {
  const { toast } = useToast();
  const { bulkOperations, createBulkOperation, fetchBulkOperations } = useAdvancedTemplates();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [operationType, setOperationType] = useState<string>('');
  const [operationData, setOperationData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Fetch available clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('user_type', 'client')
          .limit(50);

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      }
    };

    fetchClients();
  }, []);

  const handleClientSelection = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(clients.map(c => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleCreateOperation = async () => {
    if (!operationType || selectedClients.length === 0) {
      toast({
        title: "Incomplete Operation",
        description: "Please select operation type and at least one client",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createBulkOperation(
        operationType as any,
        templateId,
        selectedClients,
        operationData
      );

      if (result) {
        toast({
          title: "Operation Created",
          description: `Bulk operation for ${selectedClients.length} clients has been queued`
        });
        
        // Reset form
        setSelectedClients([]);
        setOperationType('');
        setOperationData({});
      }
    } catch (err) {
      toast({
        title: "Operation Failed",
        description: "Failed to create bulk operation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Operation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
          <CardDescription>
            Perform actions across multiple clients simultaneously
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Operation Type */}
          <div className="space-y-2">
            <Label>Operation Type</Label>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign_template">Assign Template</SelectItem>
                <SelectItem value="bulk_complete">Mark Steps Complete</SelectItem>
                <SelectItem value="bulk_update">Update Step Details</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Operation-specific fields */}
          {operationType === 'bulk_complete' && (
            <div className="space-y-2">
              <Label>Step Names to Complete (comma-separated)</Label>
              <Input
                placeholder="e.g., Initial Assessment, Goal Setting"
                value={operationData.step_names || ''}
                onChange={(e) => setOperationData(prev => ({ 
                  ...prev, 
                  step_names: e.target.value.split(',').map(s => s.trim()) 
                }))}
              />
            </div>
          )}

          {operationType === 'bulk_update' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Instructions (optional)</Label>
                <Textarea
                  placeholder="New instructions for steps"
                  value={operationData.instructions || ''}
                  onChange={(e) => setOperationData(prev => ({ ...prev, instructions: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="New description for steps"
                  value={operationData.description || ''}
                  onChange={(e) => setOperationData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Client Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Clients ({selectedClients.length} selected)</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedClients.length === clients.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">Select All</Label>
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={client.id}
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => handleClientSelection(client.id, checked as boolean)}
                  />
                  <Label htmlFor={client.id} className="text-sm">
                    {client.first_name} {client.last_name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleCreateOperation} 
            disabled={loading || !operationType || selectedClients.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Operation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Create Bulk Operation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
          <CardDescription>Track the status of your bulk operations</CardDescription>
        </CardHeader>
        <CardContent>
          {bulkOperations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No bulk operations found
            </p>
          ) : (
            <div className="space-y-4">
              {bulkOperations.slice(0, 5).map((operation) => (
                <div key={operation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(operation.status)}
                      <span className="font-medium capitalize">
                        {operation.operation_type.replace('_', ' ')}
                      </span>
                      <Badge variant={getStatusVariant(operation.status)}>
                        {operation.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(operation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: {operation.progress_count} / {operation.total_count}</span>
                      <span>{Math.round((operation.progress_count / operation.total_count) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(operation.progress_count / operation.total_count) * 100} 
                      className="h-2"
                    />
                  </div>

                  {operation.error_log && operation.error_log.length > 0 && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                      <p className="text-destructive font-medium">Errors:</p>
                      <ul className="list-disc list-inside text-destructive/80">
                        {operation.error_log.slice(0, 3).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {operation.error_log.length > 3 && (
                          <li>... and {operation.error_log.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}