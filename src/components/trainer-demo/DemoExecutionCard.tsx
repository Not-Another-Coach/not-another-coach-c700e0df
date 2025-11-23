import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function DemoExecutionCard() {
  const weeklyScore = 78;
  const completedTasks = 5;
  const totalTasks = 8;

  const tasks = [
    { title: 'Follow up with Client #3', status: 'completed', icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Review meal plan for Sarah', status: 'in-progress', icon: Clock, color: 'text-yellow-500' },
    { title: "Prep Friday's group session", status: 'pending', icon: AlertCircle, color: 'text-muted-foreground' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Today's Execution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Score Circle */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className={`text-4xl font-bold ${getScoreColor(weeklyScore)}`}>
              {weeklyScore}%
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">Weekly Score</div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tasks Completed Today</span>
            <span className="font-semibold text-foreground">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
        </div>

        {/* Critical Tasks */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground">Critical Tasks Today</div>
          {tasks.map((task, index) => {
            const Icon = task.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Icon className={`h-4 w-4 flex-shrink-0 ${task.color}`} />
                <span className="text-sm text-foreground flex-1">{task.title}</span>
                <Badge 
                  variant={task.status === 'completed' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {task.status === 'completed' ? 'Done' : task.status === 'in-progress' ? 'Active' : 'Pending'}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
