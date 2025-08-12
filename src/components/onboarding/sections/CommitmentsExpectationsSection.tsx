import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileSignature, 
  CheckCircle, 
  User, 
  Users,
  GripVertical
} from 'lucide-react';
import { CommitmentExpectation, useOnboardingSections } from '@/hooks/useOnboardingSections';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface CommitmentsExpectationsSectionProps {
  templateId: string;
  commitments: CommitmentExpectation[];
  onCommitmentsChange: () => void;
}

export function CommitmentsExpectationsSection({ 
  templateId, 
  commitments, 
  onCommitmentsChange 
}: CommitmentsExpectationsSectionProps) {
  const {
    createCommitment,
    updateCommitment,
    deleteCommitment
  } = useOnboardingSections();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<CommitmentExpectation | null>(null);
  const [newCommitment, setNewCommitment] = useState<Partial<CommitmentExpectation>>({
    commitment_type: 'mutual',
    commitment_title: '',
    commitment_description: '',
    requires_acknowledgment: true,
    requires_signature: false,
    display_order: 0
  });

  const handleCreateCommitment = async () => {
    if (!newCommitment.commitment_title?.trim() || !newCommitment.commitment_description?.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      await createCommitment(templateId, {
        ...newCommitment,
        display_order: commitments.length
      } as Omit<CommitmentExpectation, 'id' | 'template_id'>);
      
      setNewCommitment({
        commitment_type: 'mutual',
        commitment_title: '',
        commitment_description: '',
        requires_acknowledgment: true,
        requires_signature: false,
        display_order: 0
      });
      setShowCreateDialog(false);
      onCommitmentsChange();
      toast.success('Commitment created successfully');
    } catch (error) {
      toast.error('Failed to create commitment');
    }
  };

  const handleEditCommitment = async () => {
    if (!editingCommitment || !editingCommitment.commitment_title?.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await updateCommitment(editingCommitment.id, editingCommitment);
      setShowEditDialog(false);
      setEditingCommitment(null);
      onCommitmentsChange();
      toast.success('Commitment updated successfully');
    } catch (error) {
      toast.error('Failed to update commitment');
    }
  };

  const handleDeleteCommitment = async (commitmentId: string) => {
    try {
      await deleteCommitment(commitmentId);
      onCommitmentsChange();
      toast.success('Commitment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete commitment');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(commitments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updates = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    try {
      await Promise.all(
        updates.map(item => updateCommitment(item.id, { display_order: item.display_order }))
      );
      onCommitmentsChange();
      toast.success('Commitments reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder commitments');
    }
  };

  const getCommitmentTypeIcon = (type: string) => {
    switch (type) {
      case 'trainer':
        return <User className="h-4 w-4" />;
      case 'client':
        return <User className="h-4 w-4" />;
      case 'mutual':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getCommitmentTypeColor = (type: string) => {
    switch (type) {
      case 'trainer':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'mutual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Commitments & Expectations
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Commitment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Commitment or Expectation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newCommitment.commitment_type}
                      onValueChange={(value: 'trainer' | 'client' | 'mutual') => 
                        setNewCommitment({ ...newCommitment, commitment_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trainer">Trainer Commitment</SelectItem>
                        <SelectItem value="client">Client Commitment</SelectItem>
                        <SelectItem value="mutual">Mutual Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCommitment.requires_acknowledgment}
                        onCheckedChange={(checked) => 
                          setNewCommitment({ ...newCommitment, requires_acknowledgment: checked })
                        }
                      />
                      <Label>Requires Acknowledgment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCommitment.requires_signature}
                        onCheckedChange={(checked) => 
                          setNewCommitment({ ...newCommitment, requires_signature: checked })
                        }
                      />
                      <Label>Requires Digital Signature</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={newCommitment.commitment_title || ''}
                    onChange={(e) => setNewCommitment({ ...newCommitment, commitment_title: e.target.value })}
                    placeholder="e.g., Session Attendance Commitment"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCommitment.commitment_description || ''}
                    onChange={(e) => setNewCommitment({ ...newCommitment, commitment_description: e.target.value })}
                    placeholder="Detailed description of the commitment or expectation..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCommitment}>
                    Create Commitment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {commitments.length === 0 ? (
          <div className="text-center py-8">
            <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No commitments or expectations set.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Define mutual agreements and expectations between you and your clients.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="commitments">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {commitments.map((commitment, index) => (
                    <Draggable key={commitment.id} draggableId={commitment.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{commitment.commitment_title}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className={`gap-1 ${getCommitmentTypeColor(commitment.commitment_type)}`}
                                    >
                                      {getCommitmentTypeIcon(commitment.commitment_type)}
                                      {commitment.commitment_type === 'trainer' ? 'Trainer' :
                                       commitment.commitment_type === 'client' ? 'Client' : 'Mutual'}
                                    </Badge>
                                    {commitment.requires_acknowledgment && (
                                      <Badge variant="outline" className="gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Acknowledgment
                                      </Badge>
                                    )}
                                    {commitment.requires_signature && (
                                      <Badge variant="outline" className="gap-1">
                                        <FileSignature className="h-3 w-3" />
                                        Signature
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {commitment.commitment_description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCommitment(commitment);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCommitment(commitment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Edit Commitment Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Commitment or Expectation</DialogTitle>
            </DialogHeader>
            {editingCommitment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={editingCommitment.commitment_type}
                      onValueChange={(value: 'trainer' | 'client' | 'mutual') => 
                        setEditingCommitment({ ...editingCommitment, commitment_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trainer">Trainer Commitment</SelectItem>
                        <SelectItem value="client">Client Commitment</SelectItem>
                        <SelectItem value="mutual">Mutual Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingCommitment.requires_acknowledgment}
                        onCheckedChange={(checked) => 
                          setEditingCommitment({ ...editingCommitment, requires_acknowledgment: checked })
                        }
                      />
                      <Label>Requires Acknowledgment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingCommitment.requires_signature}
                        onCheckedChange={(checked) => 
                          setEditingCommitment({ ...editingCommitment, requires_signature: checked })
                        }
                      />
                      <Label>Requires Digital Signature</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingCommitment.commitment_title || ''}
                    onChange={(e) => setEditingCommitment({ 
                      ...editingCommitment, 
                      commitment_title: e.target.value 
                    })}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingCommitment.commitment_description || ''}
                    onChange={(e) => setEditingCommitment({ 
                      ...editingCommitment, 
                      commitment_description: e.target.value 
                    })}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditCommitment}>
                    Update Commitment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}