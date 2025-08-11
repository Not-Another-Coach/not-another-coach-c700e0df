import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";
import { useTrainerOnboarding } from "@/hooks/useTrainerOnboarding";

export function OnboardingSummaryWidget() {
  const { clientsOnboarding, loading, error } = useTrainerOnboarding();

  const totalClients = clientsOnboarding.length;
  const completed = clientsOnboarding.filter(c => c.percentageComplete === 100).length;
  const inProgress = clientsOnboarding.filter(c => c.percentageComplete > 0 && c.percentageComplete < 100).length;
  const avgCompletion = totalClients > 0
    ? Math.round(clientsOnboarding.reduce((sum, c) => sum + (c.percentageComplete || 0), 0) / totalClients)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Client Onboarding Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground py-8">Loading onboarding metrics...</div>
        ) : error ? (
          <div className="text-sm text-destructive py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30 border">
              <div className="text-3xl font-bold mb-2">{totalClients}</div>
              <p className="text-sm font-medium">Total Clients</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6" /> {completed}
              </div>
              <p className="text-sm font-medium text-green-800">Completed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-3xl font-bold text-amber-600 mb-2 flex items-center justify-center gap-2">
                <Clock className="h-6 w-6" /> {inProgress}
              </div>
              <p className="text-sm font-medium text-amber-800">In Progress</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
                <Users className="h-6 w-6" /> {avgCompletion}%
              </div>
              <p className="text-sm font-medium text-blue-800">Avg Completion</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
