import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { useDataSynchronization } from "@/hooks/useDataSynchronization";
import { ClientHeader } from "@/components/ClientHeader";
import { Button } from "@/components/ui/button";
import { DataSyncIndicator } from "@/components/ui/data-sync-indicator";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { ClientJourneyVisualization } from "@/components/journey/ClientJourneyVisualization";
import { ToggleLeft } from "lucide-react";

export default function MyTrainers() {
  const { user } = useAuth();
  const { profile } = useProfileByType();
  
  const { 
    refreshData, 
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
    <div className="min-h-screen bg-background px-4 py-6">
      {profile && <ClientHeader profile={profile} />}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trainers</h1>
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
          
          <DataSyncIndicator 
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            isConnected={true}
          />
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
      
      <FloatingMessageButton />
    </div>
  );
}