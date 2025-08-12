import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GitBranch, Save, RotateCcw, Calendar, User, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedTemplates } from '@/hooks/useAdvancedTemplates';

interface TemplateVersionControlProps {
  templateId: string;
  templateName: string;
}

export function TemplateVersionControl({ templateId, templateName }: TemplateVersionControlProps) {
  const { toast } = useToast();
  const { versions, fetchVersions, createVersion, revertToVersion } = useAdvancedTemplates();
  const [changelog, setChangelog] = useState('');
  const [loading, setLoading] = useState(false);
  const [revertingTo, setRevertingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions(templateId);
  }, [templateId]);

  const handleCreateVersion = async () => {
    if (!changelog.trim()) {
      toast({
        title: "Changelog Required",
        description: "Please provide a description of changes for this version",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createVersion(templateId, changelog);
      if (result) {
        toast({
          title: "Version Created",
          description: "New template version has been saved successfully"
        });
        setChangelog('');
      }
    } catch (err) {
      toast({
        title: "Version Creation Failed",
        description: "Failed to create new version",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToVersion = async (versionId: string, versionNumber: number) => {
    setRevertingTo(versionId);
    try {
      const success = await revertToVersion(templateId, versionId);
      if (success) {
        toast({
          title: "Template Reverted",
          description: `Successfully reverted to version ${versionNumber}`
        });
        await fetchVersions(templateId);
      } else {
        toast({
          title: "Revert Failed",
          description: "Failed to revert to the selected version",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Revert Failed",
        description: "An error occurred while reverting",
        variant: "destructive"
      });
    } finally {
      setRevertingTo(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Version */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version Control
          </CardTitle>
          <CardDescription>
            Track changes and manage versions of {templateName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="changelog">Changelog</Label>
            <Textarea
              id="changelog"
              placeholder="Describe the changes made in this version..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleCreateVersion} 
            disabled={loading || !changelog.trim()}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating Version...' : 'Create New Version'}
          </Button>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>
            View and manage previous versions of this template
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No versions found</p>
              <p className="text-sm text-muted-foreground">
                Create your first version to start tracking changes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={version.is_current ? 'default' : 'outline'}>
                          <Tag className="h-3 w-3 mr-1" />
                          Version {version.version_number}
                        </Badge>
                        {version.is_current && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(version.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.created_by}
                          </div>
                        </div>
                        
                        {version.changelog && (
                          <p className="text-sm">{version.changelog}</p>
                        )}
                      </div>
                    </div>
                    
                    {!version.is_current && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={revertingTo === version.id}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {revertingTo === version.id ? 'Reverting...' : 'Revert'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revert to Version {version.version_number}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will replace the current template with the data from version {version.version_number}. 
                              This action cannot be undone. Are you sure you want to proceed?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevertToVersion(version.id, version.version_number)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Revert Template
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}