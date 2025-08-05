import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Calendar, Eye } from 'lucide-react';
import { useFeedbackQuestions } from '@/hooks/useFeedbackQuestions';
import { format } from 'date-fns';

interface FeedbackResponse {
  id: string;
  response_value?: string;
  response_data: Record<string, any>;
  submitted_at: string;
  discovery_call_feedback_questions: {
    id: string;
    question_text: string;
    question_type: string;
    question_group: string;
  };
  discovery_calls: {
    scheduled_for: string;
  };
}

export function CoachFeedbackSummary() {
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { getTrainerFeedback } = useFeedbackQuestions();

  useEffect(() => {
    const loadFeedback = async () => {
      const { data } = await getTrainerFeedback();
      if (data) {
        setFeedbackData(data);
      }
      setLoading(false);
    };

    loadFeedback();
  }, [getTrainerFeedback]);

  const calculateAverages = () => {
    if (feedbackData.length === 0) return null;

    const starRatingResponses = feedbackData.filter(
      response => response.discovery_call_feedback_questions.question_type === 'star_rating'
    );

    if (starRatingResponses.length === 0) return null;

    const total = starRatingResponses.reduce((sum, response) => {
      const rating = parseInt(response.response_value || '0');
      return sum + rating;
    }, 0);

    const average = (total / starRatingResponses.length).toFixed(1);
    return { overallRating: average };
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/5</span>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (feedbackData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discovery Call Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No feedback yet</h3>
            <p className="text-sm text-muted-foreground">
              When clients share feedback about their discovery calls, it will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averages = calculateAverages();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discovery Call Feedback ({feedbackData.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        {averages && (
          <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
              {renderStars(parseFloat(averages.overallRating))}
              <p className="text-xs text-muted-foreground mt-1">
                Based on {feedbackData.filter(r => r.discovery_call_feedback_questions.question_type === 'star_rating').length} star ratings
              </p>
            </div>
          </div>
        )}

        {/* Individual Feedback */}
        <div className="space-y-4">
          <h4 className="font-medium">Recent Feedback</h4>
          {feedbackData.slice(0, 5).map((response) => (
            <div key={response.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Call on {format(new Date(response.discovery_calls.scheduled_for), 'MMM d, yyyy')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {response.discovery_call_feedback_questions.question_type.replace('_', ' ')}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(response.submitted_at), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">{response.discovery_call_feedback_questions.question_text}</p>
                {response.discovery_call_feedback_questions.question_type === 'star_rating' && response.response_value ? (
                  <div>{renderStars(parseInt(response.response_value))}</div>
                ) : response.response_value ? (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    "{response.response_value}"
                  </p>
                ) : null}
              </div>
            </div>
          ))}
          
          {feedbackData.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing 5 most recent. Total feedback received: {feedbackData.length}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}