import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Archive, 
  GripVertical, 
  Eye, 
  Users, 
  Settings,
  Trash2,
  Star,
  ThumbsUp,
  MessageSquare,
  ToggleLeft
} from 'lucide-react';
import { useFeedbackQuestions, FeedbackQuestion } from '@/hooks/useFeedbackQuestions';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface QuestionFormData {
  question_text: string;
  question_type: 'free_text' | 'star_rating' | 'yes_no' | 'emoji_response' | 'toggle';
  audience: 'client' | 'pt';
  visible_to_pt: boolean;
  is_mandatory: boolean;
  question_group: string;
  placeholder_text: string;
  help_text: string;
}

export function FeedbackQuestionBuilder() {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FeedbackQuestion | null>(null);
  const [previewMode, setPreviewMode] = useState<'client' | 'pt'>('client');
  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: '',
    question_type: 'free_text',
    audience: 'client',
    visible_to_pt: false,
    is_mandatory: false,
    question_group: 'general',
    placeholder_text: '',
    help_text: ''
  });

  const { 
    getQuestions, 
    createQuestion, 
    updateQuestion, 
    archiveQuestion, 
    reorderQuestions,
    loading,
    submitting 
  } = useFeedbackQuestions();
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await getQuestions();
    if (data && !error) {
      setQuestions(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const questionData = {
      ...formData,
      display_order: questions.length + 1
    };

    let result;
    if (editingQuestion) {
      result = await updateQuestion(editingQuestion.id, questionData);
    } else {
      result = await createQuestion(questionData);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to save question. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`,
      });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      loadQuestions();
    }
  };

  const handleEdit = (question: FeedbackQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      audience: question.audience,
      visible_to_pt: question.visible_to_pt,
      is_mandatory: question.is_mandatory,
      question_group: question.question_group,
      placeholder_text: question.placeholder_text || '',
      help_text: question.help_text || ''
    });
    setIsDialogOpen(true);
  };

  const handleArchive = async (questionId: string) => {
    const { error } = await archiveQuestion(questionId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to archive question.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Question Archived",
        description: "Question has been archived successfully.",
      });
      loadQuestions();
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);

    const questionIds = items.map(item => item.id);
    const { error } = await reorderQuestions(questionIds);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to reorder questions.",
        variant: "destructive",
      });
      loadQuestions(); // Revert on error
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'free_text',
      audience: 'client',
      visible_to_pt: false,
      is_mandatory: false,
      question_group: 'general',
      placeholder_text: '',
      help_text: ''
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'star_rating': return <Star className="w-4 h-4" />;
      case 'yes_no': return <ThumbsUp className="w-4 h-4" />;
      case 'emoji_response': return <span className="text-sm">😊</span>;
      case 'toggle': return <ToggleLeft className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredQuestions = questions.filter(q => 
    previewMode === 'client' ? q.audience === 'client' : 
    previewMode === 'pt' ? q.visible_to_pt : true
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Discovery Call Feedback Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure feedback questions for discovery calls
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingQuestion(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Edit Question' : 'Create New Question'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_text">Question Text *</Label>
                    <Textarea
                      id="question_text"
                      value={formData.question_text}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question_type">Question Type *</Label>
                      <Select
                        value={formData.question_type}
                        onValueChange={(value: any) => setFormData({ ...formData, question_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free_text">Free Text</SelectItem>
                          <SelectItem value="star_rating">Star Rating (1-5)</SelectItem>
                          <SelectItem value="yes_no">Yes/No</SelectItem>
                          <SelectItem value="emoji_response">Emoji Response</SelectItem>
                          <SelectItem value="toggle">Toggle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audience">Audience *</Label>
                      <Select
                        value={formData.audience}
                        onValueChange={(value: any) => setFormData({ ...formData, audience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="pt">PT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question_group">Question Group</Label>
                      <Input
                        id="question_group"
                        value={formData.question_group}
                        onChange={(e) => setFormData({ ...formData, question_group: e.target.value })}
                        placeholder="e.g., private, coach_feedback"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placeholder_text">Placeholder Text</Label>
                      <Input
                        id="placeholder_text"
                        value={formData.placeholder_text}
                        onChange={(e) => setFormData({ ...formData, placeholder_text: e.target.value })}
                        placeholder="Optional placeholder text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="help_text">Help Text</Label>
                    <Textarea
                      id="help_text"
                      value={formData.help_text}
                      onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                      placeholder="Optional help text to guide users"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="visible_to_pt"
                        checked={formData.visible_to_pt}
                        onCheckedChange={(checked) => setFormData({ ...formData, visible_to_pt: checked })}
                      />
                      <Label htmlFor="visible_to_pt">Visible to PT</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_mandatory"
                        checked={formData.is_mandatory}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
                      />
                      <Label htmlFor="is_mandatory">Mandatory</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Preview Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview Mode
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'client' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('client')}
              >
                Client View
              </Button>
              <Button
                variant={previewMode === 'pt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('pt')}
              >
                PT View
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Questions ({filteredQuestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredQuestions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-4 bg-card"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1 text-muted-foreground hover:text-foreground cursor-grab"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getQuestionTypeIcon(question.question_type)}
                                    <Badge variant="outline" className="text-xs">
                                      {question.question_type.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant={question.audience === 'client' ? 'default' : 'secondary'}>
                                      {question.audience === 'client' ? 'Client' : 'PT'}
                                    </Badge>
                                    {question.visible_to_pt && (
                                      <Badge variant="outline" className="text-xs">
                                        Shared with PT
                                      </Badge>
                                    )}
                                    {question.is_mandatory && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium">{question.question_text}</p>
                                  {question.help_text && (
                                    <p className="text-sm text-muted-foreground">{question.help_text}</p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(question)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleArchive(question.id)}
                                  >
                                    <Archive className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No questions configured
              </h3>
              <p className="text-sm text-muted-foreground">
                Create your first feedback question to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}