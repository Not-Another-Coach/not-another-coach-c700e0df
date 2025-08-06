import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWaitlist } from '@/hooks/useWaitlist';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Users, MessageCircle, Calendar, UserPlus, Archive, Clock, Settings, ExternalLink, Bell } from 'lucide-react';

export function WaitlistManagement() {
  const { waitlistEntries, updateWaitlistEntry, loading } = useWaitlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
      case 'contacted':
        return { label: 'Contacted', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' };
      case 'converted':
        return { label: 'Converted', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
      case 'archived':
        return { label: 'Archived', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: 'Active', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
    }
  };

  const handleUpdateStatus = async (entryId: string, newStatus: string) => {
    setIsUpdating(true);
    
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'contacted') {
        updates.last_contacted_at = new Date().toISOString();
      }
      
      const result = await updateWaitlistEntry(entryId, updates);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to update waitlist entry.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Updated",
          description: "Waitlist entry has been updated."
        });
      }
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotifySpaceAvailable = async (entryId: string) => {
    setIsUpdating(true);
    
    try {
      const result = await updateWaitlistEntry(entryId, { 
        status: 'contacted',
        last_contacted_at: new Date().toISOString()
      });
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to notify client.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Client Notified",
          description: "The client has been notified that space is available and can now book a discovery call."
        });
        // TODO: Trigger in-app notification and email to client
        // TODO: Unlock discovery call booking for this client
      }
    } catch (error) {
      console.error('Error notifying client:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNotes = async () => {
    if (!selectedEntry || !notes.trim()) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateWaitlistEntry(selectedEntry.id, {
        coach_notes: notes.trim()
      });
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to save notes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Notes Saved",
          description: "Your notes have been added to this client."
        });
        setSelectedEntry(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Waitlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Waitlist ({waitlistEntries.length})
          </CardTitle>
        </CardHeader>
      <CardContent>
        {waitlistEntries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No clients on waitlist</h3>
            <p className="text-sm text-muted-foreground">
              When you set your status to "Waitlist Only", clients will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {waitlistEntries.map((entry) => {
              const statusInfo = getStatusInfo(entry.status);
              
              return (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Client {entry.client_id.slice(0, 8)}</h4>
                        <Badge variant={statusInfo.variant} className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {format(new Date(entry.joined_at), 'MMM d, yyyy')}
                        </span>
                        {entry.estimated_start_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Est. start {format(new Date(entry.estimated_start_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      {entry.client_goals && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Goals:</strong> {entry.client_goals}
                        </p>
                      )}
                      {entry.coach_notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Notes:</strong> {entry.coach_notes}
                        </p>
                      )}
                      {entry.last_contacted_at && (
                        <p className="text-sm text-muted-foreground">
                          Last contacted: {format(new Date(entry.last_contacted_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {entry.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(entry.id, 'contacted')}
                          disabled={isUpdating}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Message Client
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(entry.id, 'converted')}
                          disabled={isUpdating}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Open Slot + Invite
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotifySpaceAvailable(entry.id)}
                          disabled={isUpdating}
                        >
                          <Bell className="w-3 h-3 mr-1" />
                          Notify Space Available
                        </Button>
                      </>
                    )}
                    
                    {entry.status === 'contacted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(entry.id, 'converted')}
                        disabled={isUpdating}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Convert to Client
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setNotes(entry.coach_notes || '');
                          }}
                        >
                          Add Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Notes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Add notes about this client (e.g., 'Wants morning sessions', 'Prefers home workouts')..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedEntry(null);
                                setNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddNotes} disabled={isUpdating}>
                              {isUpdating ? 'Saving...' : 'Save Notes'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(entry.id, 'archived')}
                      disabled={isUpdating}
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      Archive
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}