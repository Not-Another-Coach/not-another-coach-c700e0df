import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Star, ThumbsUp, Meh, ThumbsDown, CheckCircle } from 'lucide-react';
import { useFeedbackQuestions, FeedbackQuestion } from '@/hooks/useFeedbackQuestions';
import { useToast } from '@/hooks/use-toast';

interface DynamicFeedbackFormProps {
  discoveryCallId: string;
  trainerId: string;
  trainerName: string;
  onSubmitted?: () => void;
}

interface FormResponses {
  [questionId: string]: {
    value?: string;
    data?: Record<string, any>;
  };
}

export function DynamicDiscoveryCallFeedbackForm({
  discoveryCallId,
  trainerId,
  trainerName,
  onSubmitted
}: DynamicFeedbackFormProps) {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [responses, setResponses] = useState<FormResponses>({});
  const [shareWithCoach, setShareWithCoach] = useState(true);
  
  const { getQuestions, submitResponses, loading, submitting } = useFeedbackQuestions();
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await getQuestions('client');
    if (data && !error) {
      setQuestions(data);
    }
  };

  const handleResponseChange = (questionId: string, value?: string, data?: Record<string, any>) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { value, data }
    }));
  };

  const handleSubmit = async () => {
    // Validate mandatory fields
    const missingMandatory = questions
      .filter(q => q.is_mandatory && !responses[q.id]?.value && !responses[q.id]?.data?.value)
      .map(q => q.question_text);

    if (missingMandatory.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill out: ${missingMandatory.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    const responseArray = Object.entries(responses).map(([questionId, response]) => ({
      questionId,
      value: response.value,
      data: response.data
    }));

    const { error } = await submitResponses(discoveryCallId, trainerId, responseArray);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      onSubmitted?.();
    }
  };

  const renderQuestionInput = (question: FeedbackQuestion) => {
    const currentResponse = responses[question.id];

    switch (question.question_type) {
      case 'star_rating':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleResponseChange(question.id, star.toString())}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      currentResponse?.value && parseInt(currentResponse.value) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {currentResponse?.value && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {currentResponse.value} star{parseInt(currentResponse.value) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-3">
            {[
              { value: 'yes', label: 'Yes', color: 'bg-green-100 text-green-800' },
              { value: 'maybe', label: 'Maybe', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'no', label: 'No', color: 'bg-red-100 text-red-800' }
            ].map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleResponseChange(question.id, value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  currentResponse?.value === value
                    ? `${color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        );

      case 'emoji_response':
        return (
          <div className="flex gap-3">
            {[
              { value: 'positive', icon: ThumbsUp, label: 'Yes', color: 'bg-green-100 text-green-800' },
              { value: 'neutral', icon: Meh, label: 'Okay', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'negative', icon: ThumbsDown, label: 'No', color: 'bg-red-100 text-red-800' }
            ].map(({ value, icon: Icon, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleResponseChange(question.id, value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  currentResponse?.value === value
                    ? `${color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentResponse?.value === 'true'}
              onCheckedChange={(checked) => handleResponseChange(question.id, checked.toString())}
            />
            <Label className="text-sm">
              {currentResponse?.value === 'true' ? 'Yes' : 'No'}
            </Label>
          </div>
        );

      case 'free_text':
      default:
        return (
          <Textarea
            value={currentResponse?.value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder_text || 'Enter your response...'}
            className="min-h-[80px]"
          />
        );
    }
  };

  const groupedQuestions = questions.reduce((groups, question) => {
    const group = question.question_group || 'general';
    if (!groups[group]) groups[group] = [];
    groups[group].push(question);
    return groups;
  }, {} as Record<string, FeedbackQuestion[]>);

  const getGroupTitle = (group: string) => {
    switch (group) {
      case 'private': return 'Private Feedback';
      case 'coach_feedback': return 'Coach Feedback';
      case 'sharing': return 'Sharing Preferences';
      default: return 'Feedback';
    }
  };

  const getGroupDescription = (group: string) => {
    switch (group) {
      case 'private': return 'Only visible to you';
      case 'coach_feedback': return 'Shared anonymously (optional)';
      case 'sharing': return 'Control what gets shared';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          How was your call with Coach {trainerName}?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your feedback helps you make informed decisions and helps coaches improve.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Object.entries(groupedQuestions).map(([group, groupQuestions]) => (
          <div key={group} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  group === 'private' ? 'bg-blue-50 text-blue-700' :
                  group === 'coach_feedback' ? 'bg-green-50 text-green-700' :
                  'bg-gray-50 text-gray-700'
                }
              >
                {getGroupTitle(group)}
              </Badge>
              {getGroupDescription(group) && (
                <span className="text-xs text-muted-foreground">
                  {getGroupDescription(group)}
                </span>
              )}
            </div>
            
            {groupQuestions.map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1">
                  {question.question_text}
                  {question.is_mandatory && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                
                {question.help_text && (
                  <p className="text-xs text-muted-foreground">
                    {question.help_text}
                  </p>
                )}
                
                {renderQuestionInput(question)}
              </div>
            ))}
            
            {group !== Object.keys(groupedQuestions)[Object.keys(groupedQuestions).length - 1] && (
              <Separator />
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="min-w-[120px]"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}