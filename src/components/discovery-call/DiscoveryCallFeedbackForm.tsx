import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Star, ThumbsUp, Meh, ThumbsDown, CheckCircle } from 'lucide-react';
import { useDiscoveryCallFeedback } from '@/hooks/useDiscoveryCallFeedback';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryCallFeedbackFormProps {
  discoveryCallId: string;
  trainerId: string;
  trainerName: string;
  onSubmitted?: () => void;
}

export function DiscoveryCallFeedbackForm({
  discoveryCallId,
  trainerId,
  trainerName,
  onSubmitted
}: DiscoveryCallFeedbackFormProps) {
  const { submitFeedback, submitting } = useDiscoveryCallFeedback();
  const { toast } = useToast();
  
  // Private feedback state
  const [comfortLevel, setComfortLevel] = useState<'positive' | 'neutral' | 'negative' | undefined>();
  const [wouldConsider, setWouldConsider] = useState<'yes' | 'maybe' | 'no' | undefined>();
  const [whatStoodOut, setWhatStoodOut] = useState('');
  const [comparisonNotes, setComparisonNotes] = useState('');
  
  // Coach feedback state
  const [conversationHelpful, setConversationHelpful] = useState<number | undefined>();
  const [askedRightQuestions, setAskedRightQuestions] = useState<number | undefined>();
  const [professionalism, setProfessionalism] = useState<number | undefined>();
  const [shareWithCoach, setShareWithCoach] = useState(true);
  const [coachNotes, setCoachNotes] = useState('');

  const handleSubmit = async () => {
    const feedback = {
      comfort_level: comfortLevel,
      would_consider_training: wouldConsider,
      what_stood_out: whatStoodOut || undefined,
      comparison_notes: comparisonNotes || undefined,
      conversation_helpful: conversationHelpful,
      asked_right_questions: askedRightQuestions,
      professionalism: professionalism,
      share_with_coach: shareWithCoach,
      coach_notes: coachNotes || undefined
    };

    const { error } = await submitFeedback(discoveryCallId, trainerId, feedback);
    
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

  const renderStarRating = (
    value: number | undefined,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                value && star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {value && (
          <span className="ml-2 text-sm text-muted-foreground">
            {value} star{value !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );

  const renderComfortLevel = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Did you feel comfortable with this coach?</Label>
      <div className="flex gap-3">
        {[
          { value: 'positive', icon: ThumbsUp, label: 'Yes', color: 'bg-green-100 text-green-800' },
          { value: 'neutral', icon: Meh, label: 'Okay', color: 'bg-yellow-100 text-yellow-800' },
          { value: 'negative', icon: ThumbsDown, label: 'No', color: 'bg-red-100 text-red-800' }
        ].map(({ value, icon: Icon, label, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => setComfortLevel(value as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              comfortLevel === value
                ? `${color} border-current`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderWouldConsider = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Would you consider training with them?</Label>
      <div className="flex gap-3">
        {[
          { value: 'yes', label: 'Yes', color: 'bg-green-100 text-green-800' },
          { value: 'maybe', label: 'Maybe', color: 'bg-yellow-100 text-yellow-800' },
          { value: 'no', label: 'No', color: 'bg-red-100 text-red-800' }
        ].map(({ value, label, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => setWouldConsider(value as any)}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              wouldConsider === value
                ? `${color} border-current`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

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
        {/* Section 1: Private Feedback */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Private Feedback
            </Badge>
            <span className="text-xs text-muted-foreground">Only visible to you</span>
          </div>
          
          {renderComfortLevel()}
          {renderWouldConsider()}
          
          <div className="space-y-2">
            <Label htmlFor="what-stood-out" className="text-sm font-medium">
              What stood out to you?
            </Label>
            <Textarea
              id="what-stood-out"
              value={whatStoodOut}
              onChange={(e) => setWhatStoodOut(e.target.value)}
              placeholder="What did you like or dislike about their approach, communication style, etc.?"
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comparison-notes" className="text-sm font-medium">
              How do they compare to others?
            </Label>
            <Textarea
              id="comparison-notes"
              value={comparisonNotes}
              onChange={(e) => setComparisonNotes(e.target.value)}
              placeholder="Any thoughts on how this coach compares to others you've spoken with?"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <Separator />

        {/* Section 2: Coach Feedback */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Coach Feedback
            </Badge>
            <span className="text-xs text-muted-foreground">Shared anonymously (optional)</span>
          </div>
          
          {renderStarRating(
            conversationHelpful,
            setConversationHelpful,
            "Was the conversation helpful?"
          )}
          
          {renderStarRating(
            askedRightQuestions,
            setAskedRightQuestions,
            "Did the coach ask the right questions?"
          )}
          
          {renderStarRating(
            professionalism,
            setProfessionalism,
            "How professional did they seem?"
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-feedback" className="text-sm font-medium">
                Share this feedback anonymously with the coach?
              </Label>
              <Switch
                id="share-feedback"
                checked={shareWithCoach}
                onCheckedChange={setShareWithCoach}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Anonymous feedback helps coaches improve. They won't know it's from you unless you book training.
            </p>
          </div>
          
          {shareWithCoach && (
            <div className="space-y-2">
              <Label htmlFor="coach-notes" className="text-sm font-medium">
                Any notes you'd like the coach to know? (Optional)
              </Label>
              <Textarea
                id="coach-notes"
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Any constructive feedback or positive comments for the coach?"
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

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