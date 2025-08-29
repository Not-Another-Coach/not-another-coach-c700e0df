import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, TrendingUp, Package, Activity } from "lucide-react";
import { useActivitySynchronization, ActivityRecommendation } from "@/hooks/useActivitySynchronization";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityRecommendationsProps {
  packageIds?: string[];
  onSelectActivity?: (activityId: string, activityName: string) => void;
  onCreateFromRecommendation?: (activityName: string, category: string) => void;
  title?: string;
  className?: string;
}

export function ActivityRecommendations({
  packageIds,
  onSelectActivity,
  onCreateFromRecommendation,
  title = "Recommended Activities",
  className
}: ActivityRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { getActivityRecommendations } = useActivitySynchronization();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getActivityRecommendations(packageIds);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to load activity recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [getActivityRecommendations, packageIds]);

  const handleSelectActivity = (recommendation: ActivityRecommendation) => {
    if (onSelectActivity) {
      onSelectActivity(recommendation.activity_id, recommendation.activity_name);
    }
  };

  const handleCreateFromRecommendation = (recommendation: ActivityRecommendation) => {
    if (onCreateFromRecommendation) {
      onCreateFromRecommendation(recommendation.activity_name, recommendation.category);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No recommendations yet</p>
            <p className="text-sm">
              Start building templates or add Ways of Working items to see personalized recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {recommendations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.activity_id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{recommendation.activity_name}</div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {recommendation.category}
                      </Badge>
                      
                      {recommendation.usage_count > 0 && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Used {recommendation.usage_count}x
                        </Badge>
                      )}
                      
                      {recommendation.source_packages.length > 0 && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {recommendation.source_packages.length} package{recommendation.source_packages.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {recommendation.source_packages.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        From: {recommendation.source_packages.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {onSelectActivity && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectActivity(recommendation)}
                      >
                        Add
                      </Button>
                    )}
                    
                    {onCreateFromRecommendation && (
                      <Button
                        size="sm"
                        onClick={() => handleCreateFromRecommendation(recommendation)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}