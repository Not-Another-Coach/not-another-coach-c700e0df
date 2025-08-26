import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Target, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WeeklyExecutionCard = () => {
  // Mock data - this will connect to the Goals system once database is set up
  const currentWeekScore = 75;
  const todaysTasks = [
    {
      id: '1',
      title: 'Send 10 outreach messages',
      type: 'outreach',
      status: 'done'
    },
    {
      id: '2',
      title: 'Follow up with 3 prospects',
      type: 'check_in',
      status: 'in_progress'
    },
    {
      id: '3',
      title: 'Update client progress notes',
      type: 'admin',
      status: 'to_do'
    }
  ];

  const completedTasks = todaysTasks.filter(task => task.status === 'done').length;
  const totalTasks = todaysTasks.length;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'done' ? 'text-green-600' : 'text-muted-foreground';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Today's Execution
          </CardTitle>
          <Button size="sm" variant="outline" className="h-8">
            <Plus className="w-3 h-3 mr-1" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Execution Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - currentWeekScore / 100)}`}
                  className={getScoreColor(currentWeekScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${getScoreColor(currentWeekScore)}`}>
                  {currentWeekScore}%
                </span>
              </div>
            </div>
            <div>
              <p className="font-medium">Weekly Score</p>
              <p className="text-sm text-muted-foreground">
                {currentWeekScore >= 85 ? 'Excellent' : currentWeekScore >= 70 ? 'Good' : 'Needs Focus'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{completedTasks}/{totalTasks} Tasks</p>
            <p className="text-xs text-muted-foreground">Completed Today</p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Critical Tasks Today
          </h4>
          <div className="space-y-2">
            {todaysTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 ${getStatusIcon(task.status)}`} />
                  <span className={`truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                </div>
                <Badge className={`${getStatusColor(task.status)} text-xs ml-2`}>
                  {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                </Badge>
              </div>
            ))}
          </div>
          
          {/* Quick Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Today's Progress</span>
              <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
            </div>
            <Progress value={(completedTasks / totalTasks) * 100} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};