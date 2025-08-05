import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useDiscoveryCallFeedback } from "@/hooks/useDiscoveryCallFeedback";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MessageSquare, Star } from "lucide-react";

interface DiscoveryCallFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discoveryCall: {
    id: string;
    trainer_id: string;
    trainer_name: string;
    scheduled_for: string;
  };
  onFeedbackSubmitted: () => void;
}

export function DiscoveryCallFeedbackModal({
  open,
  onOpenChange,
  discoveryCall,
  onFeedbackSubmitted,
}: DiscoveryCallFeedbackModalProps) {
  const { submitFeedback, submitting } = useDiscoveryCallFeedback();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    comfort_level: '' as 'positive' | 'neutral' | 'negative' | '',
    would_consider_training: '' as 'yes' | 'maybe' | 'no' | '',
    what_stood_out: '',
    comparison_notes: '',
    conversation_helpful: 0,
    asked_right_questions: 0,
    professionalism: 0,
    share_with_coach: false,
    coach_notes: '',
  });

  const handleSubmit = async () => {
    try {
      const { error } = await submitFeedback(
        discoveryCall.id,
        discoveryCall.trainer_id,
        {
          comfort_level: formData.comfort_level as 'positive' | 'neutral' | 'negative',
          would_consider_training: formData.would_consider_training as 'yes' | 'maybe' | 'no',
          what_stood_out: formData.what_stood_out,
          comparison_notes: formData.comparison_notes,
          conversation_helpful: formData.conversation_helpful,
          asked_right_questions: formData.asked_right_questions,
          professionalism: formData.professionalism,
          share_with_coach: formData.share_with_coach,
          coach_notes: formData.coach_notes,
          submitted_at: new Date().toISOString(),
        }
      );

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! You can now choose this coach if you'd like.",
      });

      onFeedbackSubmitted();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.comfort_level && formData.would_consider_training;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discovery Call Feedback
          </DialogTitle>
          <DialogDescription>
            How was your discovery call with {discoveryCall.trainer_name}? Your feedback helps us improve and helps you make the right choice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Call Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{discoveryCall.trainer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Call on {new Date(discoveryCall.scheduled_for).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Private Feedback */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Private Feedback (for your records)</h3>
            
            {/* Comfort Level */}
            <div className="space-y-2">
              <Label>How did you feel during the conversation?</Label>
              <div className="flex gap-2">
                {[
                  { value: 'positive', label: '😊 Positive', color: 'bg-green-100 text-green-800' },
                  { value: 'neutral', label: '😐 Neutral', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'negative', label: '😟 Negative', color: 'bg-red-100 text-red-800' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={formData.comfort_level === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, comfort_level: option.value as 'positive' | 'neutral' | 'negative' }))}
                    className={formData.comfort_level === option.value ? option.color : ""}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Would Consider Training */}
            <div className="space-y-2">
              <Label>Would you consider training with this coach?</Label>
              <div className="flex gap-2">
                {[
                  { value: 'yes', label: '✅ Yes', color: 'bg-green-100 text-green-800' },
                  { value: 'maybe', label: '🤔 Maybe', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'no', label: '❌ No', color: 'bg-red-100 text-red-800' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={formData.would_consider_training === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, would_consider_training: option.value as 'yes' | 'maybe' | 'no' }))}
                    className={formData.would_consider_training === option.value ? option.color : ""}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* What Stood Out */}
            <div className="space-y-2">
              <Label>What stood out to you about this coach?</Label>
              <Textarea
                placeholder="e.g., Their experience with similar goals, communication style, approach to training..."
                value={formData.what_stood_out}
                onChange={(e) => setFormData(prev => ({ ...prev, what_stood_out: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Comparison Notes */}
            <div className="space-y-2">
              <Label>Notes for comparing with other coaches</Label>
              <Textarea
                placeholder="Private notes to help you compare different coaches..."
                value={formData.comparison_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, comparison_notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          {/* Coach Feedback (Optional) */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Coach Rating (Optional)</h3>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Share with coach?</Label>
                <Button
                  variant={formData.share_with_coach ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, share_with_coach: !prev.share_with_coach }))}
                >
                  {formData.share_with_coach ? "Yes" : "No"}
                </Button>
              </div>
            </div>

            {/* Rating Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'conversation_helpful', label: 'Conversation was helpful' },
                { key: 'asked_right_questions', label: 'Asked right questions' },
                { key: 'professionalism', label: 'Professional demeanor' },
              ].map((rating) => (
                <div key={rating.key} className="space-y-2">
                  <Label className="text-sm">{rating.label}</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => setFormData(prev => ({ ...prev, [rating.key]: star }))}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            star <= (formData[rating.key as keyof typeof formData] as number)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coach Notes */}
            {formData.share_with_coach && (
              <div className="space-y-2">
                <Label>Additional feedback for the coach</Label>
                <Textarea
                  placeholder="Any specific feedback you'd like to share with the coach..."
                  value={formData.coach_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, coach_notes: e.target.value }))}
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || submitting}
            className="flex-1"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}