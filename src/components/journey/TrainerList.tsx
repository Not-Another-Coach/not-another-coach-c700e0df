import { TrainerWithJourneyStage } from '@/types/journey';
import { TrainerCard } from './TrainerCard';

interface TrainerListProps {
  trainers: TrainerWithJourneyStage[];
  onTrainerAction: (trainerId: string, action: string) => void;
}

export function TrainerList({ trainers, onTrainerAction }: TrainerListProps) {
  if (trainers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No trainers in this stage</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trainers.map((trainer) => (
        <TrainerCard
          key={trainer.id}
          trainer={trainer}
          onAction={(action) => onTrainerAction(trainer.id, action)}
        />
      ))}
    </div>
  );
}