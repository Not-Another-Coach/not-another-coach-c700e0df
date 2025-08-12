import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/useAlerts";
import { 
  Bell, 
  X, 
  Star, 
  Calendar, 
  Users, 
  Package, 
  TrendingUp,
  MessageCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export function NewsAlertsSection() {
  const { alerts, loading, dismissAlert, markAsClicked } = useAlerts();

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'coach_update':
        return <Package className="h-4 w-4" />;
      case 'template_assigned':
        return <Package className="h-4 w-4" />;
      case 'platform_nudge':
        return <MessageCircle className="h-4 w-4" />;
      case 'achievement':
        return <Star className="h-4 w-4" />;
      case 'availability':
        return <Calendar className="h-4 w-4" />;
      case 'system_alert':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (alertType: string) => {
    switch (alertType) {
      case 'achievement':
        return 'default';
      case 'coach_update':
        return 'secondary';
      case 'template_assigned':
        return 'default';
      case 'availability':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleAlertClick = async (alertId: string, metadata?: any) => {
    await markAsClicked(alertId);
    
    // Handle navigation based on alert metadata
    if (metadata?.action) {
      switch (metadata.action) {
        case 'view_trainer':
          // Navigate to trainer profile
          break;
        case 'complete_survey':
          // Navigate to survey
          break;
        case 'view_matches':
          // Navigate to matches
          break;
        default:
          break;
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            News & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            News & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No new updates at the moment. Check back later for personalized alerts about your fitness journey!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          News & Alerts
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => handleAlertClick(alert.id, alert.metadata)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Badge variant={getAlertVariant(alert.alert_type)} className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
                  {getAlertIcon(alert.alert_type)}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {alert.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                      {alert.priority > 3 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {alerts.length >= 5 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}