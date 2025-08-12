import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  History,
  Calendar
} from 'lucide-react';
import { useAdvancedOnboarding, TemplateAuditLog } from '@/hooks/useAdvancedOnboarding';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PublishingWorkflowProps {
  templateId: string;
  template: {
    published_at?: string;
    is_locked?: boolean;
    lock_reason?: string;
    published_version?: number;
    step_name: string;
  };
  onTemplateUpdate: () => void;
}

export function PublishingWorkflow({
  templateId,
  template,
  onTemplateUpdate
}: PublishingWorkflowProps) {
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  
  const {
    publishTemplate,
    unpublishTemplate,
    fetchAuditLog,
    auditLogs,
    loading
  } = useAdvancedOnboarding();

  useEffect(() => {
    if (showAuditDialog) {
      fetchAuditLog(templateId);
    }
  }, [showAuditDialog, templateId, fetchAuditLog]);

  const handlePublish = async () => {
    try {
      await publishTemplate(templateId);
      onTemplateUpdate();
      toast.success('Template published successfully');
    } catch (error) {
      toast.error('Failed to publish template');
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishTemplate(templateId, unpublishReason || undefined);
      setShowUnpublishDialog(false);
      setUnpublishReason('');
      onTemplateUpdate();
      toast.success('Template unpublished successfully');
    } catch (error) {
      toast.error('Failed to unpublish template');
    }
  };

  const getStatusBadge = () => {
    if (template.published_at) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Published
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Eye className="h-3 w-3" />
        Draft
      </Badge>
    );
  };

  const getLockBadge = () => {
    if (template.is_locked) {
      return (
        <Badge variant="outline" className="gap-1">
          <Lock className="h-3 w-3" />
          Locked
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Unlock className="h-3 w-3" />
        Unlocked
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Publishing Status</span>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getLockBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="space-y-2">
          {template.published_at && (
            <div className="text-sm">
              <span className="text-muted-foreground">Published:</span>{' '}
              {format(new Date(template.published_at), 'PPp')}
            </div>
          )}
          {template.published_version && (
            <div className="text-sm">
              <span className="text-muted-foreground">Version:</span>{' '}
              {template.published_version}
            </div>
          )}
          {template.lock_reason && (
            <div className="text-sm">
              <span className="text-muted-foreground">Lock Reason:</span>{' '}
              {template.lock_reason}
            </div>
          )}
        </div>

        {/* Lock Warning */}
        {template.is_locked && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This template is locked to prevent structural changes after publishing. 
              Unpublish the template to make structural modifications.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!template.published_at ? (
            <Button onClick={handlePublish} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish Template
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowUnpublishDialog(true)}
              disabled={loading}
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => setShowAuditDialog(true)}
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>

        {/* Unpublish Dialog */}
        <Dialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unpublish Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unpublishing will remove this template from active use and unlock it for editing.
                  Clients currently using this template will not be affected.
                </AlertDescription>
              </Alert>

              <div>
                <Label>Reason for Unpublishing (Optional)</Label>
                <Textarea
                  value={unpublishReason}
                  onChange={(e) => setUnpublishReason(e.target.value)}
                  placeholder="Describe why you're unpublishing this template..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUnpublishDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnpublish}
                  disabled={loading}
                >
                  Unpublish Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Audit Log Dialog */}
        <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
          <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No history available for this template yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {log.action_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.created_at), 'PPp')}
                        </div>
                      </div>
                      
                      {log.action_reason && (
                        <p className="text-sm text-muted-foreground">
                          {log.action_reason}
                        </p>
                      )}
                      
                      {log.version_number && (
                        <p className="text-xs text-muted-foreground">
                          Version: {log.version_number}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}