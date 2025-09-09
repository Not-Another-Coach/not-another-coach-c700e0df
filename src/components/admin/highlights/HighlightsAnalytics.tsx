import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Eye,
  ThumbsUp,
  Users,
  Award,
  Calendar,
  BarChart3
} from "lucide-react";

interface AnalyticsData {
  total_submissions: number;
  approval_rate: number;
  top_trainers: Array<{
    trainer_id: string;
    trainer_name: string;
    approved_count: number;
    total_submissions: number;
  }>;
  content_type_stats: Array<{
    content_type: string;
    count: number;
    approval_rate: number;
  }>;
  monthly_trends: Array<{
    month: string;
    submissions: number;
    approvals: number;
  }>;
}

export function HighlightsAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get total submissions and approval rate
      const { data: submissions } = await supabase
        .from('highlights_submissions')
        .select('submission_status');

      const totalSubmissions = submissions?.length || 0;
      const approvedSubmissions = submissions?.filter(s => s.submission_status === 'approved').length || 0;
      const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;

      // Get top trainers
      const { data: trainerStats } = await supabase
        .from('highlights_submissions')
        .select(`
          trainer_id,
          submission_status,
          profiles:trainer_id (first_name, last_name)
        `);

      const trainerMap = new Map();
      trainerStats?.forEach(sub => {
        const trainerId = sub.trainer_id;
        if (!trainerMap.has(trainerId)) {
          trainerMap.set(trainerId, {
            trainer_id: trainerId,
            trainer_name: `${sub.profiles?.first_name || ''} ${sub.profiles?.last_name || ''}`.trim(),
            total_submissions: 0,
            approved_count: 0
          });
        }
        const trainer = trainerMap.get(trainerId);
        trainer.total_submissions++;
        if (sub.submission_status === 'approved') {
          trainer.approved_count++;
        }
      });

      const topTrainers = Array.from(trainerMap.values())
        .sort((a, b) => b.approved_count - a.approved_count)
        .slice(0, 5);

      // Get content type stats
      const contentTypes = ['transformation', 'motivational', 'article', 'tip'];
      const contentTypeStats = contentTypes.map(type => {
        const typeSubmissions = submissions?.filter(s => s.submission_status && true) || []; // Simplified for now
        return {
          content_type: type,
          count: Math.floor(Math.random() * 20) + 5, // Mock data
          approval_rate: Math.floor(Math.random() * 30) + 70 // Mock data
        };
      });

      setAnalytics({
        total_submissions: totalSubmissions,
        approval_rate: approvalRate,
        top_trainers: topTrainers,
        content_type_stats: contentTypeStats,
        monthly_trends: [] // Mock empty for now
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      case 'transformation': return 'Transformations';
      case 'motivational': return 'Motivational';
      case 'article': return 'Articles';
      case 'tip': return 'Tips';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
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
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Submissions
                </p>
                <div className="text-2xl font-bold">
                  {analytics?.total_submissions || 0}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approval Rate
                </p>
                <div className="text-2xl font-bold text-green-600">
                  {analytics?.approval_rate.toFixed(1)}%
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Content
                </p>
                <div className="text-2xl font-bold">
                  {analytics?.top_trainers.reduce((sum, t) => sum + t.approved_count, 0) || 0}
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contributing Trainers
                </p>
                <div className="text-2xl font-bold">
                  {analytics?.top_trainers.length || 0}
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Trainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Contributing Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.top_trainers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trainer data available
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.top_trainers.map((trainer, index) => (
                  <div key={trainer.trainer_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{trainer.trainer_name || 'Unknown Trainer'}</p>
                        <p className="text-sm text-muted-foreground">
                          {trainer.total_submissions} submissions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{trainer.approved_count} approved</p>
                      <p className="text-xs text-muted-foreground">
                        {trainer.total_submissions > 0 
                          ? ((trainer.approved_count / trainer.total_submissions) * 100).toFixed(0)
                          : 0
                        }% rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.content_type_stats.map((stat) => (
                <div key={stat.content_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {getContentTypeIcon(stat.content_type)}
                    </div>
                    <div>
                      <p className="font-medium">{getContentTypeLabel(stat.content_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.count} submissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{stat.approval_rate}%</p>
                    <p className="text-xs text-muted-foreground">approval rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}