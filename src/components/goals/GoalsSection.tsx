import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Calendar,
  Plus,
  Award
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const GoalsSection = () => {
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    type: '',
    timeframe: '',
    targetValue: '',
    targetUnit: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: '',
    dueDate: '',
    weight: '1'
  });

  // Mock data until database tables are created
  const currentWeekScore = 75;
  const mockGoals = [
    {
      id: '1',
      title: 'Convert 3 new clients this month',
      type: 'sales',
      status: 'on_track',
      progress: 66,
      target: '3 clients',
      current: '2 clients',
      timeframe: 'monthly'
    },
    {
      id: '2', 
      title: 'Complete 5 discovery calls this week',
      type: 'coaching',
      status: 'at_risk',
      progress: 40,
      target: '5 calls',
      current: '2 calls',
      timeframe: 'weekly'
    }
  ];

  const mockTasks = [
    {
      id: '1',
      title: 'Send 10 outreach messages',
      type: 'outreach',
      status: 'done',
      dueDate: 'Today'
    },
    {
      id: '2',
      title: 'Follow up with 3 prospects',
      type: 'check_in',
      status: 'in_progress',
      dueDate: 'Today'
    },
    {
      id: '3',
      title: 'Create content for social media',
      type: 'content',
      status: 'to_do',
      dueDate: 'Tomorrow'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'on_track':
        return 'bg-blue-100 text-blue-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const handleCreateGoal = () => {
    if (!goalForm.title || !goalForm.type || !goalForm.timeframe) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Goal form submitted! Database integration coming soon.');
    console.log('Goal to create:', goalForm);
    setCreateGoalOpen(false);
    setGoalForm({
      title: '',
      description: '',
      type: '',
      timeframe: '',
      targetValue: '',
      targetUnit: ''
    });
  };

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.type || !taskForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Task form submitted! Database integration coming soon.');
    console.log('Task to create:', taskForm);
    setCreateTaskOpen(false);
    setTaskForm({
      title: '',
      description: '',
      type: '',
      dueDate: '',
      weight: '1'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals & Execution Framework</h2>
          <p className="text-muted-foreground">Track your strategic objectives and weekly critical tasks</p>
        </div>
        <Dialog open={createGoalOpen} onOpenChange={setCreateGoalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Title *</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Convert 5 new clients this month"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  placeholder="Optional details about this goal..."
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-type">Type *</Label>
                  <Select value={goalForm.type} onValueChange={(value) => setGoalForm({...goalForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="ops">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-timeframe">Timeframe *</Label>
                  <Select value={goalForm.timeframe} onValueChange={(value) => setGoalForm({...goalForm, timeframe: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    placeholder="e.g., 5"
                    value={goalForm.targetValue}
                    onChange={(e) => setGoalForm({...goalForm, targetValue: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-unit">Unit</Label>
                  <Input
                    id="target-unit"
                    placeholder="e.g., clients, calls, posts"
                    value={goalForm.targetUnit}
                    onChange={(e) => setGoalForm({...goalForm, targetUnit: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCreateGoalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>
                  Create Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Weekly Dashboard</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="tasks">Critical Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Execution Score Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <CardTitle className="text-sm font-medium">Weekly Execution Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentWeekScore / 100)}`}
                      className={getScoreColor(currentWeekScore)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute">
                    <div className={`text-2xl font-bold ${getScoreColor(currentWeekScore)}`}>
                      {currentWeekScore}%
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentWeekScore >= 85 ? 'Excellent' : currentWeekScore >= 70 ? 'Good' : 'Needs Focus'}
                </p>
                <Progress value={currentWeekScore} className="w-full mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">On Track</span>
                  <Badge variant="outline" className="text-green-600">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">At Risk</span>
                  <Badge variant="outline" className="text-yellow-600">1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge variant="outline" className="text-blue-600">0</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  This Week's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Today</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Week</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge variant="outline" className="text-green-600">1</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Critical Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Today's Critical Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTasks.filter(task => task.dueDate === 'Today').map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${task.status === 'done' ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <div>
                        <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{task.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Strategic Goals</h3>
            <Dialog open={createGoalOpen} onOpenChange={setCreateGoalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <div className="space-y-4">
            {mockGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">{goal.timeframe}</Badge>
                        <Badge variant="outline" className="capitalize">{goal.type}</Badge>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {goal.current} / {goal.target}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Critical Tasks</h3>
            <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Critical Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="e.g., Send 10 outreach messages"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Optional details about this task..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-type">Type *</Label>
                      <Select value={taskForm.type} onValueChange={(value) => setTaskForm({...taskForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outreach">Outreach</SelectItem>
                          <SelectItem value="check_in">Check-in</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-due-date">Due Date *</Label>
                      <Input
                        id="task-due-date"
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-weight">Weight (Priority)</Label>
                    <Select value={taskForm.weight} onValueChange={(value) => setTaskForm({...taskForm, weight: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Normal</SelectItem>
                        <SelectItem value="2">2 - Important</SelectItem>
                        <SelectItem value="3">3 - Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setCreateTaskOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {mockTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${task.status === 'done' ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <div>
                        <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground capitalize">
                            {task.type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};