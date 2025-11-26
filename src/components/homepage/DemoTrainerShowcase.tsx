import { EnhancedTrainerCard } from '@/components/trainer-cards/EnhancedTrainerCard';
import { SkeletonTrainerCard } from '@/components/ui/skeleton-trainer-card';
import { useDemoTrainers } from '@/hooks/useDemoTrainers';

export function DemoTrainerShowcase() {
  const { trainers, loading } = useDemoTrainers();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <SkeletonTrainerCard />
        <SkeletonTrainerCard />
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No demo trainers available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {trainers.map((trainer) => (
        <EnhancedTrainerCard
          key={trainer.id}
          trainer={trainer}
          config="anonymous"
          layout="full"
          initialView="instagram"
          allowViewSwitching={true}
          hideShortlistButton={true}
          hideViewProfileButton={false}
          onViewProfile={(trainerId) => {
            // For demo profiles, just navigate to the trainer page
            window.location.href = `/trainer/${trainerId}`;
          }}
        />
      ))}
    </div>
  );
}
