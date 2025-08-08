import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MessageCircle, Users, Bell } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useActiveDiscoveryCallsCount } from "@/hooks/useActiveDiscoveryCallsCount";
import { NewsAlertsSection } from "./NewsAlertsSection";
import { DiscoveryCallNotificationsWidget } from "./DiscoveryCallNotificationsWidget";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";

interface OnboardingSectionProps {
  profile: any;
}

export function OnboardingSection({ profile }: OnboardingSectionProps) {
  const { user } = useAuth();
  const { conversations } = useConversations();
  const { count: upcomingCalls } = useActiveDiscoveryCallsCount();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Welcome to Your Training Journey!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Congratulations on selecting your trainer! You're now ready to begin your personalized fitness journey. 
            Your trainer will guide you through the onboarding process and help you achieve your goals.
          </p>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Active Client
          </Badge>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {/* This would show recent notifications count */}
              3
            </div>
            <p className="text-xs text-muted-foreground">New updates</p>
          </CardContent>
        </Card>

        {/* Active Conversations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Active Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {conversations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">With your trainer</p>
          </CardContent>
        </Card>

        {/* Upcoming Discovery Calls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {upcomingCalls}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Call Notifications Widget */}
      <DiscoveryCallNotificationsWidget />

      {/* News & Alerts Section */}
      <NewsAlertsSection />
    </div>
  );
}