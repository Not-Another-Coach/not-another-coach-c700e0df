import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Send, 
  Archive, 
  ArchiveX, 
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkTemplateActionsProps {
  templates: Array<{
    id: string;
    step_name: string;
    status?: 'draft' | 'published' | 'archived';
  }>;
  onPublishTemplates?: (templateIds: string[]) => Promise<void>;
  onArchiveTemplates?: (templateIds: string[]) => Promise<void>;
  onReactivateTemplates?: (templateIds: string[]) => Promise<void>;
}

export function BulkTemplateActions({
  templates,
  onPublishTemplates,
  onArchiveTemplates,
  onReactivateTemplates
}: BulkTemplateActionsProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'publish' | 'archive' | 'reactivate' | ''>('');
  const [loading, setLoading] = useState(false);

  const draftTemplates = templates.filter(t => (t.status || 'draft') === 'draft');
  const publishedTemplates = templates.filter(t => t.status === 'published');
  const archivedTemplates = templates.filter(t => t.status === 'archived');

  const getAvailableActions = () => {
    const actions = [];
    if (draftTemplates.length > 0 && onPublishTemplates) {
      actions.push({ value: 'publish', label: 'Publish Templates', icon: Send });
    }
    if (publishedTemplates.length > 0 && onArchiveTemplates) {
      actions.push({ value: 'archive', label: 'Archive Templates', icon: Archive });
    }
    if (archivedTemplates.length > 0 && onReactivateTemplates) {
      actions.push({ value: 'reactivate', label: 'Reactivate Templates', icon: ArchiveX });
    }
    return actions;
  };

  const getFilteredTemplates = () => {
    switch (bulkAction) {
      case 'publish':
        return draftTemplates;
      case 'archive':
        return publishedTemplates;
      case 'reactivate':
        return archivedTemplates;
      default:
        return [];
    }
  };

  const handleSelectTemplate = (templateId: string, checked: boolean) => {
    setSelectedTemplates(prev => 
      checked 
        ? [...prev, templateId]
        : prev.filter(id => id !== templateId)
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTemplates.length === 0) return;

    setLoading(true);
    try {
      switch (bulkAction) {
        case 'publish':
          if (onPublishTemplates) {
            await onPublishTemplates(selectedTemplates);
            toast.success(`Published ${selectedTemplates.length} templates`);
          }
          break;
        case 'archive':
          if (onArchiveTemplates) {
            await onArchiveTemplates(selectedTemplates);
            toast.success(`Archived ${selectedTemplates.length} templates`);
          }
          break;
        case 'reactivate':
          if (onReactivateTemplates) {
            await onReactivateTemplates(selectedTemplates);
            toast.success(`Reactivated ${selectedTemplates.length} templates`);
          }
          break;
      }
      
      setSelectedTemplates([]);
      setOpen(false);
      setBulkAction('');
    } catch (error) {
      toast.error('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const availableActions = getAvailableActions();
  const filteredTemplates = getFilteredTemplates();

  if (availableActions.length === 0) {
    return null;
  }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Bulk Actions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Template Actions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Action Selection */}
          <div>
            <Label>Select Action</Label>
            <Select value={bulkAction} onValueChange={(value: typeof bulkAction) => {
              setBulkAction(value);
              setSelectedTemplates([]);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                {availableActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Templates List */}
          {bulkAction && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedTemplates.length} of {filteredTemplates.length} templates selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplates(filteredTemplates.map(t => t.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplates([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={(checked) => 
                            handleSelectTemplate(template.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-medium">{template.step_name}</span>
                          {getStatusBadge(template.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Warning Messages */}
              {bulkAction === 'archive' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Archiving published templates will remove them from active use but won't affect 
                    clients who are already using them.
                  </AlertDescription>
                </Alert>
              )}

              {bulkAction === 'publish' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Publishing templates will make them available for client onboarding and lock 
                    them to prevent structural changes.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAction}
                  disabled={selectedTemplates.length === 0 || loading}
                >
                  {loading ? 'Processing...' : `${bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)} ${selectedTemplates.length} Templates`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}