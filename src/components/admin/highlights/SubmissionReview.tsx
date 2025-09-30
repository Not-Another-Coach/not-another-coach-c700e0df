import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services";
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Filter,
  Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Submission {
  id: string;
  title: string;
  description: string;
  content_type: string;
  media_urls: string[];
  submission_status: string;
  created_at: string;
  trainer_id: string;
  admin_notes?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

export function SubmissionReview() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState("submitted");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      // Use mock data for now
      const mockSubmissions: Submission[] = [
        {
          id: '1',
          title: 'Amazing Client Transformation',
          description: 'This client lost 30lbs in 12 weeks through our comprehensive program.',
          content_type: 'transformation',
          media_urls: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
          submission_status: 'submitted',
          created_at: new Date().toISOString(),
          trainer_id: 'trainer-1',
          profiles: {
            first_name: 'John',
            last_name: 'Smith',
            profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
          }
        },
        {
          id: '2',
          title: 'Daily Motivation Tips',
          description: 'Start your day right with these powerful motivational messages.',
          content_type: 'motivational',
          media_urls: ['https://images.unsplash.com/photo-1549476464-37392f717541?w=400'],
          submission_status: filter === 'all' || filter === 'approved' ? 'approved' : 'submitted',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          trainer_id: 'trainer-2',
          profiles: {
            first_name: 'Sarah',
            last_name: 'Johnson',
            profile_photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
          }
        }
      ];

      const filteredData = filter === 'all' 
        ? mockSubmissions 
        : mockSubmissions.filter(s => s.submission_status === filter);
      
      setSubmissions(filteredData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (submissionId: string, action: 'approve' | 'reject') => {
    setProcessing(true);
    try {
      // Update submission status
      const userResponse = await AuthService.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error('Not authenticated');
      }

      const { error: updateError } = await supabase
        .from('highlights_submissions')
        .update({
          submission_status: action === 'approve' ? 'approved' : 'rejected',
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userResponse.data.id
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // If approved, create highlights_content entry
      if (action === 'approve' && selectedSubmission) {
        const { error: contentError } = await supabase
          .from('highlights_content')
          .insert({
            trainer_id: selectedSubmission.trainer_id,
            submission_id: selectedSubmission.id,
            title: selectedSubmission.title,
            description: selectedSubmission.description,
            content_type: selectedSubmission.content_type,
            media_urls: selectedSubmission.media_urls,
            is_active: true,
            featured_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          });

        if (contentError) throw contentError;
      }

      toast({
        title: "Success",
        description: `Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      // Refresh submissions and clear selection
      await loadSubmissions();
      setSelectedSubmission(null);
      setAdminNotes("");
    } catch (error) {
      console.error(`Error ${action}ing submission:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} submission`,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'transformation': return '✨';
      case 'motivational': return '💪';
      case 'article': return '📖';
      case 'tip': return '💡';
      default: return '⭐';
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${submission.profiles?.first_name} ${submission.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submissions List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submissions
            </CardTitle>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-lg">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setAdminNotes(submission.admin_notes || "");
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-xl">
                          {getContentTypeIcon(submission.content_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{submission.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {submission.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {submission.profiles?.profile_photo_url && (
                              <img
                                src={submission.profiles.profile_photo_url}
                                alt=""
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {submission.profiles?.first_name} {submission.profiles?.last_name} • {' '}
                              {formatDistanceToNow(new Date(submission.created_at))} ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(submission.submission_status)}>
                          {submission.submission_status}
                        </Badge>
                        {submission.media_urls?.length > 0 && (
                          <div className="flex gap-1">
                            {submission.media_urls.map((url, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                {url.includes('video') ? (
                                  <Video className="h-3 w-3" />
                                ) : (
                                  <ImageIcon className="h-3 w-3" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Detail & Review */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Review Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSubmission ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedSubmission.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSubmission.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedSubmission.submission_status)}>
                    {selectedSubmission.submission_status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedSubmission.content_type}
                  </span>
                </div>

                {selectedSubmission.media_urls?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Media</Label>
                    <div className="space-y-2">
                      {selectedSubmission.media_urls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2 text-sm">
                            {url.includes('video') ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                            <span className="truncate">Media {index + 1}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="admin-notes" className="text-sm font-medium">
                    Admin Notes
                  </Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add notes for the trainer..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {selectedSubmission.submission_status === 'submitted' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproval(selectedSubmission.id, 'approve')}
                      disabled={processing}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(selectedSubmission.id, 'reject')}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a submission to review
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}