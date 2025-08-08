import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, User, Search, TrendingUp } from 'lucide-react';
import { useTrainerOnboarding } from '@/hooks/useTrainerOnboarding';

export function ClientOnboardingTracker() {
  const { clientsOnboarding, loading, markClientStepComplete } = useTrainerOnboarding();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');

  const filteredClients = clientsOnboarding.filter(client => {
    const matchesSearch = client.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && client.percentageComplete === 100) ||
      (filter === 'active' && client.percentageComplete > 0 && client.percentageComplete < 100) ||
      (filter === 'pending' && client.percentageComplete === 0);
    
    return matchesSearch && matchesFilter;
  });

  const overallStats = {
    totalClients: clientsOnboarding.length,
    completedClients: clientsOnboarding.filter(c => c.percentageComplete === 100).length,
    activeClients: clientsOnboarding.filter(c => c.percentageComplete > 0 && c.percentageComplete < 100).length,
    averageCompletion: clientsOnboarding.length > 0 
      ? Math.round(clientsOnboarding.reduce((sum, c) => sum + c.percentageComplete, 0) / clientsOnboarding.length)
      : 0
  };

  const handleMarkComplete = async (stepId: string, notes?: string) => {
    await markClientStepComplete(stepId, notes);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Client Onboarding Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{overallStats.totalClients}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.completedClients}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.activeClients}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{overallStats.averageCompletion}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Client Onboarding Progress</CardTitle>
          <CardDescription>
            Track and manage your clients' onboarding journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={filter} className="space-y-4">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No clients found matching your search.' : 'No clients to track yet.'}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <Card key={client.clientId} className="border border-border">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{client.clientName}</CardTitle>
                          <CardDescription>
                            {client.completedCount} of {client.totalCount} steps completed
                          </CardDescription>
                        </div>
                        <Badge variant={client.percentageComplete === 100 ? "default" : "secondary"}>
                          {client.percentageComplete}%
                        </Badge>
                      </div>
                      <Progress value={client.percentageComplete} className="w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {client.steps.map((step) => (
                          <div key={step.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {step.status === 'completed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{step.step_name}</p>
                                {step.trainer_notes && (
                                  <p className="text-sm text-muted-foreground">
                                    Note: {step.trainer_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            {step.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkComplete(step.id)}
                                variant="outline"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}