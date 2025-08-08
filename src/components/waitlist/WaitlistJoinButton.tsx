import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWaitlist } from '@/hooks/useWaitlist';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Users, X } from 'lucide-react';

interface WaitlistJoinButtonProps {
  coachId: string;
  coachName: string;
  nextAvailableDate?: string;
  waitlistMessage?: string;
  className?: string;
  onWaitlistChange?: () => void; // Add callback for when waitlist status changes
}

export function WaitlistJoinButton({ 
  coachId, 
  coachName, 
  nextAvailableDate, 
  waitlistMessage,
  className,
  onWaitlistChange
}: WaitlistJoinButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coachNote, setCoachNote] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilitySettings, setAvailabilitySettings] = useState<any>(null);
  const { joinWaitlist, removeFromWaitlist, checkClientWaitlistStatus } = useWaitlist();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch waitlist status
      const status = await checkClientWaitlistStatus(coachId);
      setIsOnWaitlist(!!status);
      
      // Fetch coach availability settings
      try {
        const { data: availabilityData } = await supabase
          .from('coach_availability_settings')
          .select('*')
          .eq('coach_id', coachId)
          .maybeSingle();
        
        setAvailabilitySettings(availabilityData);
      } catch (error) {
        console.error('Error fetching coach availability:', error);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [coachId, checkClientWaitlistStatus]);

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
        setIsOnWaitlist(true);
        setIsOpen(false);
        setCoachNote('');
        onWaitlistChange?.(); // Trigger refresh of other components
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

  const handleRemoveFromWaitlist = async () => {
    console.log('🔥 Removing from waitlist for coach:', coachId);
    setIsJoining(true);
    
    try {
      const result = await removeFromWaitlist(coachId);
      
      if (result.error) {
        console.error('🔥 Remove from waitlist error:', result.error);
        toast({
          title: "Error",
          description: "Failed to remove from waitlist. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('🔥 Remove from waitlist success');
        toast({
          title: "Removed from Waitlist",
          description: `You've been removed from ${coachName}'s waitlist.`,
        });
        setIsOnWaitlist(false);
        setIsOpen(false);
        onWaitlistChange?.(); // Trigger refresh of other components
      }
    } catch (error) {
      console.error('🔥 Remove from waitlist catch error:', error);
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

  if (isLoading) {
    return (
      <Button variant="outline" className={className} disabled>
        <Clock className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('🔥 WaitlistJoinButton dialog open state changing to:', open);
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button 
          variant={isOnWaitlist ? "destructive" : "outline"} 
          className={className} 
          onClick={() => {
            console.log('🔥 WaitlistJoinButton trigger clicked, isOnWaitlist:', isOnWaitlist);
          }}
        >
          {isOnWaitlist ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Remove from Waitlist
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Join Waitlist
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isOnWaitlist ? `Remove from ${coachName}'s Waitlist` : `Join ${coachName}'s Waitlist`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isOnWaitlist ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You're currently on {coachName}'s waitlist. Are you sure you want to remove yourself?
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleRemoveFromWaitlist}
                  disabled={isJoining}
                  variant="destructive"
                  className="flex-1"
                >
                  {isJoining ? 'Removing...' : 'Remove from Waitlist'}
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
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Next slots available: {formatDate(availabilitySettings?.next_available_date || nextAvailableDate)}</span>
              </div>
              
              {(availabilitySettings?.waitlist_message || waitlistMessage) && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{availabilitySettings?.waitlist_message || waitlistMessage}</p>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}