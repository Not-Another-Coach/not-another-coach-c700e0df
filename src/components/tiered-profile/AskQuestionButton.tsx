import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, Clock } from 'lucide-react';

interface AskQuestionButtonProps {
  trainer: any;
}

export const AskQuestionButton = ({ trainer }: AskQuestionButtonProps) => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-1">
            <h4 className="font-medium text-blue-900">Have a question?</h4>
            <p className="text-sm text-blue-700">
              Ask {trainer.first_name} anything before deciding to match
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Ask a Question
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ask {trainer.first_name} a Question</DialogTitle>
                <DialogDescription>
                  Send a one-time message before matching. They typically respond within 24 hours.
                </DialogDescription>
              </DialogHeader>

              {!isSubmitted ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Your question</Label>
                    <Textarea
                      id="question"
                      placeholder="e.g., Do you have experience with beginners? What's your training style like?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Typically responds in 12-24 hours</span>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    disabled={!question.trim() || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Question
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3 py-4">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-green-900">Question sent!</h4>
                    <p className="text-sm text-green-700">
                      {trainer.first_name} will respond directly to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};