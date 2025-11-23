import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const ClientAccessPending = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">You're All Set ✅</CardTitle>
          <CardDescription className="text-lg">
            We're just putting the final touches on your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <p className="text-muted-foreground">
                  You'll be the first to know when you can start browsing and booking coaches. We're working to create an amazing experience for you.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Want to update your preferences? You can still access your settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/settings/profile')}
              >
                Edit Preferences
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
