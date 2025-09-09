import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Eye,
  Star,
  Users,
  FileText,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OverviewStats {
  pending_submissions: number;
  approved_today: number;
  rejected_today: number;
  active_highlights: number;
  total_views_today: number;
  top_performer_today?: {
    title: string;
    trainer_name: string;
    views: number;
  };
}

export function HighlightsOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      // Get pending submissions count
      const { count: pendingCount } = await supabase
        .from('highlights_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('submission_status', 'submitted');

      // Get today's approved count
      const today = new Date().toISOString().split('T')[0];
      const { count: approvedCount } = await supabase
        .from('highlights_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('submission_status', 'approved')
        .gte('updated_at', today);

      // Get today's rejected count
      const { count: rejectedCount } = await supabase
        .from('highlights_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('submission_status', 'rejected')
        .gte('updated_at', today);

      // Get active highlights count
      const { count: activeCount } = await supabase
        .from('highlights_content')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get recent submissions
      const { data: submissions } = await supabase
        .from('highlights_submissions')
        .select(`
          *,
          profiles:trainer_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        pending_submissions: pendingCount || 0,
        approved_today: approvedCount || 0,
        rejected_today: rejectedCount || 0,
        active_highlights: activeCount || 0,
        total_views_today: 0 // TODO: Implement view tracking
      });

      setRecentSubmissions(submissions || []);
    } catch (error) {
      console.error('Error loading overview:', error);
      toast({
        title: "Error",
        description: "Failed to load highlights overview",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <div className="text-2xl font-bold">
                  {stats?.pending_submissions || 0}
                </div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved Today
                </p>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.approved_today || 0}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected Today
                </p>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.rejected_today || 0}
                </div>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Highlights
                </p>
                <div className="text-2xl font-bold">
                  {stats?.active_highlights || 0}
                </div>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent submissions
            </div>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getContentTypeIcon(submission.content_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{submission.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {submission.profiles?.first_name} {submission.profiles?.last_name} • {' '}
                        {formatDistanceToNow(new Date(submission.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(submission.submission_status)}>
                      {submission.submission_status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.location.hash = '#review'}
            >
              <Clock className="h-4 w-4 mr-2" />
              Review Pending Submissions ({stats?.pending_submissions || 0})
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.location.hash = '#content'}
            >
              <Star className="h-4 w-4 mr-2" />
              Manage Active Content
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.location.hash = '#analytics'}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Most Popular Type</span>
              <Badge variant="secondary">Transformation</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Review Time</span>
              <span className="font-medium">24 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Approval Rate</span>
              <span className="font-medium text-green-600">78%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}