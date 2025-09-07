import { useState, useEffect } from "react";
import { useDataSynchronization } from "@/hooks/useDataSynchronization";
import { Button } from "@/components/ui/button";
import { ClientJourneyVisualization } from "@/components/journey/ClientJourneyVisualization";
import { ToggleLeft } from "lucide-react";

export function MyTrainersSection() {
  const { 
    refreshTrigger,
    isLoading,
    isRefreshing
  } = useDataSynchronization();

  const [useJourneyView, setUseJourneyView] = useState(() => {
    return localStorage.getItem('use-journey-view') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('use-journey-view', useJourneyView.toString());
  }, [useJourneyView]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Trainers</h2>
          <p className="text-muted-foreground">
            {useJourneyView 
              ? "Track your trainer selection journey from discovery to choice"
              : "Manage your saved, shortlisted, and connected trainers"
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={useJourneyView ? "default" : "outline"}
            size="sm"
            onClick={() => setUseJourneyView(!useJourneyView)}
            className="flex items-center gap-2"
          >
            <ToggleLeft className="h-4 w-4" />
            {useJourneyView ? "Journey View" : "Switch to Journey"}
          </Button>
        </div>
      </div>

      {/* Journey View */}
      {useJourneyView ? (
        <ClientJourneyVisualization refreshTrigger={refreshTrigger} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Traditional view coming soon. Try Journey View!</p>
        </div>
      )}
    </div>
  );
}