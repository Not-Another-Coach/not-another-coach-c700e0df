import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, X, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { useCoachSelection, CoachSelectionRequest } from '@/hooks/useCoachSelection';
import { useProfile } from '@/hooks/useProfile';
import { formatDistanceToNow } from 'date-fns';

export const CoachSelectionRequests = () => {
  const { profile } = useProfile();
  const { getPendingRequests, respondToRequest, loading } = useCoachSelection();
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseModal, setResponseModal] = useState(false);
  const [responseType, setResponseType] = useState<'accepted' | 'declined' | 'alternative_suggested'>('accepted');
  const [responseMessage, setResponseMessage] = useState('');
  const [alternativePackage, setAlternativePackage] = useState<any>(null);

  const isTrainer = profile?.user_type === 'trainer';

  useEffect(() => {
    if (isTrainer) {
      fetchRequests();
    }
  }, [isTrainer]);

  const fetchRequests = async () => {
    const result = await getPendingRequests();
    if (result.data) {
      setRequests(result.data);
    }
  };

  const handleRequestClick = (request: any) => {
    setSelectedRequest(request);
    setResponseModal(true);
    setResponseType('accepted');
    setResponseMessage('');
    setAlternativePackage(null);
  };

  const handleResponse = async () => {
    if (!selectedRequest) return;

    const result = await respondToRequest(
      selectedRequest.id,
      responseType,
      responseMessage.trim() || undefined,
      alternativePackage
    );

    if (result.success) {
      setResponseModal(false);
      fetchRequests(); // Refresh the list
    }
  };

  if (!isTrainer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Coach Selection Requests</h2>
        <Badge variant="secondary">
          {requests.length} pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending requests</h3>
            <p className="text-muted-foreground">
              When clients choose you as their coach, their requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request: any) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.client?.profile_photo_url} />
                      <AvatarFallback>
                        {request.client?.first_name?.[0]}{request.client?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {request.client?.first_name} {request.client?.last_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      New Request
                    </Badge>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestClick(request);
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{request.package_name}</h4>
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {request.package_price}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {request.package_duration}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {request.client_message && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Client Message:</p>
                      <p className="text-sm text-blue-800">{request.client_message}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      Click "Respond" to accept, decline, or suggest alternatives
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Dialog open={responseModal} onOpenChange={setResponseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Selection Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarImage src={(selectedRequest as any).client?.profile_photo_url} />
                  <AvatarFallback>
                    {(selectedRequest as any).client?.first_name?.[0]}{(selectedRequest as any).client?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {(selectedRequest as any).client?.first_name} {(selectedRequest as any).client?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Requested {selectedRequest.package_name} - ${selectedRequest.package_price}
                  </p>
                </div>
              </div>

              {/* Response Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Your Response:</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={responseType === 'accepted' ? 'default' : 'outline'}
                    onClick={() => setResponseType('accepted')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    variant={responseType === 'declined' ? 'default' : 'outline'}
                    onClick={() => setResponseType('declined')}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                  <Button
                    variant={responseType === 'alternative_suggested' ? 'default' : 'outline'}
                    onClick={() => setResponseType('alternative_suggested')}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Suggest Alternative
                  </Button>
                </div>
              </div>

              {/* Alternative Package Selection */}
              {responseType === 'alternative_suggested' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Suggest Alternative Package:</label>
                  <Select onValueChange={(value) => {
                    const pkg = JSON.parse(value);
                    setAlternativePackage(pkg);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {(profile as any)?.package_options?.map((pkg: any) => (
                        <SelectItem 
                          key={pkg.id} 
                          value={JSON.stringify({ id: pkg.id, name: pkg.name, price: pkg.price })}
                        >
                          {pkg.name} - ${pkg.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Response Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {responseType === 'accepted' ? 'Welcome message (optional)' : 
                   responseType === 'declined' ? 'Reason for declining (optional)' :
                   'Message about alternative package'}
                </label>
                <Textarea
                  placeholder={
                    responseType === 'accepted' ? 'Welcome! I\'m excited to work with you...' :
                    responseType === 'declined' ? 'Thank you for your interest, however...' :
                    'I\'d like to suggest a different package that might be better suited...'
                  }
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setResponseModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleResponse}
                  disabled={loading || (responseType === 'alternative_suggested' && !alternativePackage)}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};