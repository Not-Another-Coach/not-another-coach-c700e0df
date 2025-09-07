import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { JourneyStageConfig, ClientJourneyStage, TrainerWithJourneyStage } from '@/types/journey';
import { TrainerList } from './TrainerList';

interface FunnelViewProps {
  stageConfigs: JourneyStageConfig[];
  getTrainersForStage: (stage: ClientJourneyStage) => TrainerWithJourneyStage[];
  onTrainerAction: (trainerId: string, action: string) => void;
}

export function FunnelView({ stageConfigs, getTrainersForStage, onTrainerAction }: FunnelViewProps) {
  const [expandedStage, setExpandedStage] = useState<ClientJourneyStage | null>(null);

  const handleStageClick = (stage: ClientJourneyStage) => {
    setExpandedStage(expandedStage === stage ? null : stage);
  };

  const totalTrainers = stageConfigs.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="space-y-4">
      {/* Funnel Overview */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        {stageConfigs.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <Button
              variant="outline"
              onClick={() => handleStageClick(stage.id)}
              className="relative px-4 py-2 min-w-[120px]"
              style={{ borderColor: stage.color }}
            >
              <div className="text-center">
                <div className="font-medium text-sm">{stage.title}</div>
                <Badge variant="secondary" className="mt-1">
                  {stage.count}
                </Badge>
              </div>
            </Button>
            {index < stageConfigs.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Conversion Rates */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-4 text-center">
            {stageConfigs.map((stage, index) => {
              const percentage = totalTrainers > 0 
                ? ((stage.count / totalTrainers) * 100).toFixed(1)
                : '0';
              
              return (
                <div key={stage.id} className="space-y-1">
                  <div className="text-2xl font-bold" style={{ color: stage.color }}>
                    {percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stage.title}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Stage Details */}
      {expandedStage && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">
                  {stageConfigs.find(s => s.id === expandedStage)?.title} Trainers
                </h3>
                <Badge variant="outline">
                  {getTrainersForStage(expandedStage).length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedStage(null)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <TrainerList
              trainers={getTrainersForStage(expandedStage)}
              onTrainerAction={onTrainerAction}
            />
          </CardContent>
        </Card>
      )}

      {/* Stage Cards (when no stage is expanded) */}
      {!expandedStage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stageConfigs
            .filter(stage => stage.count > 0)
            .map((stage) => (
            <Card 
              key={stage.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStageClick(stage.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{stage.title}</h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {stage.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                  >
                    {stage.count} trainers
                  </Badge>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}