import React from "react";
import { ExploreAllTrainers } from "@/components/dashboard/ExploreAllTrainers";
import { useClientProfile } from "@/hooks/useClientProfile";
import { ClientHeader } from "@/components/ClientHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ClientExplore = () => {
  const { profile, loading } = useClientProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <ClientHeader 
        profile={profile} 
        activeTab="explore"
        showNavigation={true}
      />

      {/* Main Content */}
      <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6">
        <ExploreAllTrainers profile={profile} />
      </main>
    </div>
  );
};

export default ClientExplore;