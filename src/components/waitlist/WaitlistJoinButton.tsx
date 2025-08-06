import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWaitlist } from '@/hooks/useWaitlist';
import { useToast } from '@/hooks/use-toast';
import { Clock, Users } from 'lucide-react';

interface WaitlistJoinButtonProps {
  coachId: string;
  coachName: string;
  nextAvailableDate?: string;
  waitlistMessage?: string;
  className?: string;
}

export function WaitlistJoinButton({ 
  coachId, 
  coachName, 
  nextAvailableDate, 
  waitlistMessage,
  className 
}: WaitlistJoinButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coachNote, setCoachNote] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinWaitlist } = useWaitlist();
  const { toast } = useToast();

  const handleJoinWaitlist = async () => {
    console.log('🔥 WaitlistJoinButton clicked for coach:', coachId);
    setIsJoining(true);
    
    try {
      console.log('🔥 Calling joinWaitlist with note:', coachNote);
      const result = await joinWaitlist(coachId, coachNote);
      console.log('🔥 WaitlistJoinButton result:', result);
      
      if (result.error) {
        console.error('🔥 WaitlistJoinButton error:', result.error);
        toast({
          title: "Error",
          description: typeof result.error === 'string' ? result.error : "Failed to join waitlist. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('🔥 WaitlistJoinButton success');
        toast({
          title: "Joined Waitlist!",
          description: `You've been added to ${coachName}'s waitlist. They'll reach out closer to your potential start date.`,
        });
        setIsOpen(false);
        setCoachNote('');
      }
    } catch (error) {
      console.error('🔥 WaitlistJoinButton catch error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🔥 WaitlistJoinButton dialog open state changing to:', open);
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className} onClick={() => {
          console.log('🔥 WaitlistJoinButton trigger clicked');
        }}>
          <Users className="w-4 h-4 mr-2" />
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join {coachName}'s Waitlist</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Next slots available: {formatDate(nextAvailableDate)}</span>
          </div>
          
          {waitlistMessage && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{waitlistMessage}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="note">Note for coach (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Any specific events you're training for, when you'd like to start, or other relevant details..."
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleJoinWaitlist}
              disabled={isJoining}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 'Join Waitlist'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}