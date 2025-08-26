import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, Users, Calendar, Zap } from 'lucide-react';
import { Trainer } from '@/components/TrainerCard';

interface ResultsViewProps {
  trainer: Trainer;
}

// Mock data for results - would come from trainer profile in real implementation
const mockResults = {
  beforeAfterImages: [
    {
      id: 1,
      clientName: "Sarah M.",
      before: "/api/placeholder/300/400",
      after: "/api/placeholder/300/400",
      timeframe: "12 weeks",
      goals: ["Weight Loss", "Strength Building"]
    },
    {
      id: 2,
      clientName: "John D.",
      before: "/api/placeholder/300/400", 
      after: "/api/placeholder/300/400",
      timeframe: "16 weeks",
      goals: ["Muscle Gain", "Body Recomposition"]
    }
  ],
  stats: {
    clientsTransformed: 127,
    averageWeightLoss: 18,
    averageMuscleGain: 12,
    clientRetention: 89,
    averageTimeToGoal: 14
  },
  achievements: [
    { label: "Client Success Rate", value: 95, unit: "%" },
    { label: "Average Weight Loss", value: 18, unit: "lbs" },
    { label: "Muscle Gain Average", value: 12, unit: "lbs" },
    { label: "Program Completion", value: 89, unit: "%" }
  ]
};

export const ResultsView = ({ trainer }: ResultsViewProps) => {
  return (
    <div className="space-y-6">
      {/* Success Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Success Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{mockResults.stats.clientsTransformed}</div>
              <div className="text-sm text-muted-foreground">Clients Transformed</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">{mockResults.stats.clientRetention}%</div>
              <div className="text-sm text-muted-foreground">Client Retention</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">{mockResults.stats.averageTimeToGoal}</div>
              <div className="text-sm text-muted-foreground">Avg. Weeks to Goal</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-energy/10 to-energy/5 rounded-lg">
              <div className="text-2xl font-bold text-energy">{trainer.rating}</div>
              <div className="text-sm text-muted-foreground">Star Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockResults.achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{achievement.label}</span>
                  <span className="text-sm font-bold">{achievement.value}{achievement.unit}</span>
                </div>
                <Progress value={achievement.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Before & After Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Client Transformations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {mockResults.beforeAfterImages.map((transformation) => (
              <div key={transformation.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Before</h4>
                    <div className="relative">
                      <img
                        src={transformation.before}
                        alt="Before transformation"
                        className="w-full h-48 object-cover rounded-lg bg-muted"
                      />
                      <Badge className="absolute top-2 left-2 bg-red-500">Before</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">After</h4>
                    <div className="relative">
                      <img
                        src={transformation.after}
                        alt="After transformation"
                        className="w-full h-48 object-cover rounded-lg bg-muted"
                      />
                      <Badge className="absolute top-2 left-2 bg-success">After</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{transformation.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{transformation.timeframe}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex gap-2">
                    {transformation.goals.map((goal, goalIndex) => (
                      <Badge key={goalIndex} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialized Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Specialized Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Weight Loss Specialization</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Average loss per client:</span>
                  <span className="font-medium">18 lbs</span>
                </div>
                <div className="flex justify-between">
                  <span>Success rate (10+ lbs):</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average timeframe:</span>
                  <span className="font-medium">12 weeks</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Strength Building</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Average strength increase:</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Injury prevention rate:</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="flex justify-between">
                  <span>Form improvement:</span>
                  <span className="font-medium">100%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};