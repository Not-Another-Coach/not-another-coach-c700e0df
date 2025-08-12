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
  Eye, 
  EyeOff, 
  Clock, 
  AlertTriangle,
  CheckSquare,
  GripVertical
} from 'lucide-react';
import { TrainerNote, useOnboardingSections } from '@/hooks/useOnboardingSections';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface TrainerSpecificSectionProps {
  templateId: string;
  notes: TrainerNote[];
  onNotesChange: () => void;
}

export function TrainerSpecificSection({ templateId, notes, onNotesChange }: TrainerSpecificSectionProps) {
  const {
    createTrainerNote,
    updateTrainerNote,
    deleteTrainerNote
  } = useOnboardingSections();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<TrainerNote | null>(null);
  const [newNote, setNewNote] = useState<Partial<TrainerNote>>({
    note_type: 'setup_action',
    title: '',
    content: '',
    is_checklist_item: false,
    due_before_client_start: true,
    priority: 'medium',
    estimated_time_minutes: undefined,
    display_order: 0
  });

  const handleCreateNote = async () => {
    if (!newNote.title?.trim() || !newNote.content?.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await createTrainerNote(templateId, {
        ...newNote,
        display_order: notes.length
      } as Omit<TrainerNote, 'id' | 'template_id'>);
      
      setNewNote({
        note_type: 'setup_action',
        title: '',
        content: '',
        is_checklist_item: false,
        due_before_client_start: true,
        priority: 'medium',
        estimated_time_minutes: undefined,
        display_order: 0
      });
      setShowCreateDialog(false);
      onNotesChange();
      toast.success('Trainer note created successfully');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !editingNote.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await updateTrainerNote(editingNote.id, editingNote);
      setShowEditDialog(false);
      setEditingNote(null);
      onNotesChange();
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteTrainerNote(noteId);
      onNotesChange();
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updates = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    try {
      await Promise.all(
        updates.map(item => updateTrainerNote(item.id, { display_order: item.display_order }))
      );
      onNotesChange();
      toast.success('Notes reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder notes');
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'setup_action':
        return <CheckSquare className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'client_info':
        return <Eye className="h-4 w-4" />;
      case 'preparation':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'setup_action':
        return 'bg-blue-100 text-blue-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'client_info':
        return 'bg-green-100 text-green-800';
      case 'preparation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const noteTypeOptions = [
    { value: 'setup_action', label: 'Setup Action' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'client_info', label: 'Client Information' },
    { value: 'preparation', label: 'Preparation' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Trainer-Only Notes & Setup
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Private notes and setup actions - not visible to clients
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Trainer Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Note Type</Label>
                    <Select
                      value={newNote.note_type}
                      onValueChange={(value: any) => setNewNote({ ...newNote, note_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noteTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newNote.priority}
                      onValueChange={(value: any) => setNewNote({ ...newNote, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={newNote.title || ''}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="e.g., Set up client program in TrueCoach"
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newNote.content || ''}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Detailed notes or instructions for yourself..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Time (minutes)</Label>
                    <Input
                      type="number"
                      value={newNote.estimated_time_minutes || ''}
                      onChange={(e) => setNewNote({ 
                        ...newNote, 
                        estimated_time_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newNote.is_checklist_item}
                        onCheckedChange={(checked) => setNewNote({ ...newNote, is_checklist_item: checked })}
                      />
                      <Label>Checklist Item</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newNote.due_before_client_start}
                        onCheckedChange={(checked) => setNewNote({ ...newNote, due_before_client_start: checked })}
                      />
                      <Label>Due Before Client Starts</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNote}>
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <EyeOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No trainer notes created yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add private setup actions and reminders for yourself.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="trainer-notes">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {notes.map((note, index) => (
                    <Draggable key={note.id} draggableId={note.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-shadow border-l-4 ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                          } ${
                            note.priority === 'high' ? 'border-l-red-500' :
                            note.priority === 'medium' ? 'border-l-orange-500' : 'border-l-green-500'
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
                                    <h4 className="font-medium">{note.title}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className={`gap-1 ${getNoteTypeColor(note.note_type)}`}
                                    >
                                      {getNoteTypeIcon(note.note_type)}
                                      {noteTypeOptions.find(opt => opt.value === note.note_type)?.label}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={getPriorityColor(note.priority)}
                                    >
                                      {note.priority.toUpperCase()}
                                    </Badge>
                                    {note.is_checklist_item && (
                                      <Badge variant="outline" className="gap-1">
                                        <CheckSquare className="h-3 w-3" />
                                        Checklist
                                      </Badge>
                                    )}
                                    {note.estimated_time_minutes && (
                                      <Badge variant="outline" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {note.estimated_time_minutes}m
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {note.content}
                                  </p>
                                  {note.due_before_client_start && (
                                    <p className="text-xs text-orange-600">
                                      ⚠️ Due before client starts
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingNote(note);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNote(note.id)}
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

        {/* Edit Note Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Trainer Note</DialogTitle>
            </DialogHeader>
            {editingNote && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Note Type</Label>
                    <Select
                      value={editingNote.note_type}
                      onValueChange={(value: any) => setEditingNote({ ...editingNote, note_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noteTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={editingNote.priority}
                      onValueChange={(value: any) => setEditingNote({ ...editingNote, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingNote.title || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={editingNote.content || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Time (minutes)</Label>
                    <Input
                      type="number"
                      value={editingNote.estimated_time_minutes || ''}
                      onChange={(e) => setEditingNote({ 
                        ...editingNote, 
                        estimated_time_minutes: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingNote.is_checklist_item}
                        onCheckedChange={(checked) => setEditingNote({ ...editingNote, is_checklist_item: checked })}
                      />
                      <Label>Checklist Item</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingNote.due_before_client_start}
                        onCheckedChange={(checked) => setEditingNote({ ...editingNote, due_before_client_start: checked })}
                      />
                      <Label>Due Before Client Starts</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditNote}>
                    Update Note
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