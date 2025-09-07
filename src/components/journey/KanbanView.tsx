import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JourneyStageConfig, ClientJourneyStage, TrainerWithJourneyStage } from '@/types/journey';
import { TrainerCard } from './TrainerCard';

interface KanbanViewProps {
  stageConfigs: JourneyStageConfig[];
  getTrainersForStage: (stage: ClientJourneyStage) => TrainerWithJourneyStage[];
  onTrainerMove: (trainerId: string, newStage: ClientJourneyStage) => void;
  onTrainerAction: (trainerId: string, action: string) => void;
}

export function KanbanView({ 
  stageConfigs, 
  getTrainersForStage, 
  onTrainerMove, 
  onTrainerAction 
}: KanbanViewProps) {
  
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const trainerId = draggableId;
    const newStage = destination.droppableId as ClientJourneyStage;
    
    onTrainerMove(trainerId, newStage);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stageConfigs.map((stage) => {
          const trainers = getTrainersForStage(stage.id);
          
          return (
            <Card key={stage.id} className="flex flex-col h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {stage.title}
                  </CardTitle>
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                  >
                    {stage.count}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stage.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0 flex-1">
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] space-y-2 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-muted' : 'bg-background'
                      }`}
                    >
                      {trainers.map((trainer, index) => (
                        <Draggable
                          key={trainer.id}
                          draggableId={trainer.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}`}
                            >
                              <TrainerCard
                                trainer={trainer}
                                onAction={(action) => onTrainerAction(trainer.id, action)}
                                compact={true}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {trainers.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          No trainers in this stage
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DragDropContext>
  );
}