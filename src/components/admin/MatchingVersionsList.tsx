import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  Rocket, 
  Trash2,
  CheckCircle,
  FileEdit,
  Archive,
  Loader2
} from "lucide-react";
import { MatchingVersion } from "@/types/matching";
import { 
  useMatchingVersions, 
  useCreateMatchingVersion, 
  useCloneMatchingVersion,
  usePublishMatchingVersion,
  useDeleteMatchingVersion 
} from "@/hooks/useMatchingVersions";

interface MatchingVersionsListProps {
  onSelectVersion: (version: MatchingVersion, mode: 'view' | 'edit') => void;
}

export function MatchingVersionsList({ onSelectVersion }: MatchingVersionsListProps) {
  const { data: versions = [], isLoading } = useMatchingVersions();
  const createMutation = useCreateMatchingVersion();
  const cloneMutation = useCloneMatchingVersion();
  const publishMutation = usePublishMatchingVersion();
  const deleteMutation = useDeleteMatchingVersion();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState<MatchingVersion | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<MatchingVersion | null>(null);
  const [newVersionName, setNewVersionName] = useState("Default");
  const [newVersionNotes, setNewVersionNotes] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20"><FileEdit className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreate = () => {
    createMutation.mutate(
      { name: newVersionName, notes: newVersionNotes },
      {
        onSuccess: (newVersion) => {
          setShowCreateDialog(false);
          setNewVersionName("Default");
          setNewVersionNotes("");
          onSelectVersion(newVersion, 'edit');
        },
      }
    );
  };

  const handleClone = (version: MatchingVersion) => {
    cloneMutation.mutate(
      { sourceVersionId: version.id },
      {
        onSuccess: (newVersion) => {
          onSelectVersion(newVersion, 'edit');
        },
      }
    );
  };

  const handlePublish = () => {
    if (!showPublishDialog) return;
    publishMutation.mutate(showPublishDialog.id, {
      onSuccess: () => setShowPublishDialog(null),
    });
  };

  const handleDelete = () => {
    if (!showDeleteDialog) return;
    deleteMutation.mutate(showDeleteDialog.id, {
      onSuccess: () => setShowDeleteDialog(null),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Algorithm Versions</CardTitle>
            <CardDescription>
              Manage matching algorithm configurations with immutable versioning
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Version
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Version</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-mono font-medium">v{version.version_number}</TableCell>
                  <TableCell>{version.name}</TableCell>
                  <TableCell>{getStatusBadge(version.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(version.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {version.published_at 
                      ? format(new Date(version.published_at), 'MMM d, yyyy')
                      : '—'
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-48 truncate">
                    {version.notes || '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelectVersion(version, 'view')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        {version.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onSelectVersion(version, 'edit')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleClone(version)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Clone as New Version
                        </DropdownMenuItem>
                        {version.status === 'draft' && (
                          <>
                            <DropdownMenuItem onClick={() => setShowPublishDialog(version)}>
                              <Rocket className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setShowDeleteDialog(version)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {versions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No versions found. Create your first version to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Version</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new draft version with default configuration. You can edit it before publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="e.g., Default UK, High Budget Focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={newVersionNotes}
                onChange={(e) => setNewVersionNotes(e.target.value)}
                placeholder="Describe the purpose of this version..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={!!showPublishDialog} onOpenChange={() => setShowPublishDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Version {showPublishDialog?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make v{showPublishDialog?.version_number} the live version used for all trainer matching. 
              The current live version will be archived.
              <br /><br />
              <strong>This action cannot be undone.</strong> You can always clone the archived version to create a new draft if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish} 
              disabled={publishMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {publishMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
              Publish v{showPublishDialog?.version_number}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft v{showDeleteDialog?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft version. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
