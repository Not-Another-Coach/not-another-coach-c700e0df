import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { HighlightSubmissionForm } from "@/components/trainer/HighlightSubmissionForm";
import { 
  Plus, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Calendar,
  Image as ImageIcon,
  Video,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Submission {
  id: string;
  title: string;
  description: string;
  content_type: string;
  media_urls: string[];
  submission_status: string;
  created_at: string;
  admin_notes?: string;
  reviewed_at?: string;
}

export function HighlightsContentTab() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights_submissions')
        .select('*')
        .eq('trainer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load your submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'transformation': return 'Transformation Story';
      case 'motivational': return 'Motivational Content';
      case 'article': return 'Article';
      case 'tip': return 'Training Tip';
      default: return type;
    }
  };

  const handleEdit = (submission: Submission) => {
    if (submission.submission_status === 'draft' || submission.submission_status === 'rejected') {
      setEditingSubmission(submission);
      setShowForm(true);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSubmission(null);
    loadSubmissions();
  };

  const stats = {
    total: submissions.length,
    draft: submissions.filter(s => s.submission_status === 'draft').length,
    pending: submissions.filter(s => s.submission_status === 'submitted').length,
    approved: submissions.filter(s => s.submission_status === 'approved').length,
    rejected: submissions.filter(s => s.submission_status === 'rejected').length,
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {editingSubmission ? 'Edit Submission' : 'Create New Highlight'}
            </h2>
            <p className="text-muted-foreground">
              Share your expertise with the community
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowForm(false);
              setEditingSubmission(null);
            }}
          >
            Cancel
          </Button>
        </div>

        <HighlightSubmissionForm 
          existingSubmission={editingSubmission}
          onSuccess={handleFormSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Highlights</h2>
          <p className="text-muted-foreground">
            Create and manage your content submissions for today's highlights
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Highlight
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <div className="text-xl font-bold">{stats.total}</div>
              </div>
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <div className="text-xl font-bold">{stats.draft}</div>
              </div>
              <Edit className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <div className="text-xl font-bold">{stats.pending}</div>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <div className="text-xl font-bold text-green-600">{stats.approved}</div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
              </div>
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Submissions
          </CardTitle>
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
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No submissions yet</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Highlight
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-xl">
                        {getContentTypeIcon(submission.content_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{submission.title}</h4>
                          <Badge className={getStatusColor(submission.submission_status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(submission.submission_status)}
                              {submission.submission_status}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {submission.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{getContentTypeLabel(submission.content_type)}</span>
                          <span>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDistanceToNow(new Date(submission.created_at))} ago
                          </span>
                          {submission.reviewed_at && (
                            <span>
                              Reviewed {formatDistanceToNow(new Date(submission.reviewed_at))} ago
                            </span>
                          )}
                        </div>
                        {submission.media_urls?.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {submission.media_urls.map((url, index) => (
                              <Button key={index} variant="ghost" size="sm" asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  {url.includes('video') ? (
                                    <Video className="h-3 w-3" />
                                  ) : (
                                    <ImageIcon className="h-3 w-3" />
                                  )}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            ))}
                          </div>
                        )}
                        {submission.admin_notes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Admin Feedback:</strong> {submission.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {(submission.submission_status === 'draft' || submission.submission_status === 'rejected') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(submission)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
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
  );
}