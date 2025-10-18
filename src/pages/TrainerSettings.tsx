import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { InstagramIntegration } from "@/components/instagram/InstagramIntegration";
import { MembershipSettings } from "@/components/payment-statements/MembershipSettings";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const TrainerSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('upgrade_cancelled') === 'true') {
      toast({
        title: "Upgrade Cancelled",
        description: "Your plan upgrade was cancelled. No charges were made.",
        variant: "default",
      });
      // Remove the parameter from the URL
      searchParams.delete('upgrade_cancelled');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trainer/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-semibold">Trainer Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Membership Plan</CardTitle>
            <CardDescription>
              View your current membership plan and commission structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MembershipSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instagram Integration</CardTitle>
            <CardDescription>
              Connect your Instagram account to showcase your fitness content and build trust with potential clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InstagramIntegration />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerSettings;