import React from "react";
import { ExploreAllTrainers } from "@/components/dashboard/ExploreAllTrainers";
import { useClientProfile } from "@/hooks/useClientProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ClientExplore = () => {
  const { profile, loading } = useClientProfile();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ExploreAllTrainers profile={profile} />
    </div>
  );
};

export default ClientExplore;