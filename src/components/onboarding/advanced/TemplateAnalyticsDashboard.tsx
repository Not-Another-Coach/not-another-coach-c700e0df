import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { useAdvancedTemplates } from '@/hooks/useAdvancedTemplates';

interface TemplateAnalyticsDashboardProps {
  templateId: string;
  templateName: string;
}

export function TemplateAnalyticsDashboard({ templateId, templateName }: TemplateAnalyticsDashboardProps) {
  const { analytics, getAnalyticsSummary, fetchAnalytics } = useAdvancedTemplates();
  const [timeRange, setTimeRange] = useState('30');
  const [summary, setSummary] = useState({
    totalUsage: 0,
    totalAssignments: 0,
    totalCompletions: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchAnalytics(templateId);
  }, [templateId]);

  useEffect(() => {
    if (analytics.length > 0) {
      setSummary(getAnalyticsSummary(templateId));
    }
  }, [analytics, templateId]);

  // Process analytics data for charts
  const processedData = analytics
    .filter(a => a.template_id === templateId)
    .filter(a => {
      const daysAgo = parseInt(timeRange);
      const date = new Date(a.date_recorded);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysAgo);
      return date >= cutoff;
    })
    .reduce((acc, item) => {
      const date = new Date(item.date_recorded).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, usage: 0, assignments: 0, completions: 0 };
      }
      
      switch (item.metric_type) {
        case 'usage':
          acc[date].usage += item.metric_value;
          break;
        case 'assignment':
          acc[date].assignments += item.metric_value;
          break;
        case 'step_completion':
          acc[date].completions += item.metric_value;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

  const chartData = Object.values(processedData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const pieData = [
    { name: 'Completed', value: summary.totalCompletions, color: '#10b981' },
    { name: 'In Progress', value: summary.totalAssignments - summary.totalCompletions, color: '#f59e0b' },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Template Analytics</h3>
          <p className="text-sm text-muted-foreground">{templateName}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{summary.totalUsage}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold">{summary.totalAssignments}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completions</p>
                <p className="text-2xl font-bold">{summary.totalCompletions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{summary.completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant={summary.completionRate >= 80 ? 'default' : summary.completionRate >= 60 ? 'secondary' : 'destructive'}>
                {summary.completionRate >= 80 ? 'Excellent' : summary.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Template usage and assignments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#3b82f6" name="Usage" />
                <Bar dataKey="assignments" fill="#8b5cf6" name="Assignments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
            <CardDescription>Distribution of completion vs in-progress assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate Trend</CardTitle>
          <CardDescription>How completion rates have changed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'Completion Rate' ? `${value.toFixed(1)}%` : value,
                  name
                ]}
              />
              <Line 
                type="monotone" 
                dataKey={(data: any) => data.assignments > 0 ? (data.completions / data.assignments) * 100 : 0}
                stroke="#10b981" 
                strokeWidth={2}
                name="Completion Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}