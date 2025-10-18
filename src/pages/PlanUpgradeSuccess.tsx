import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PlanUpgradeSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processUpgrade = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('No session ID found');
        setIsProcessing(false);
        return;
      }

      try {
        // Call edge function to complete the upgrade
        const { error: completeError } = await supabase.functions.invoke(
          'complete-plan-upgrade',
          {
            body: { session_id: sessionId },
          }
        );

        if (completeError) {
          throw completeError;
        }

        setIsProcessing(false);
        
        toast({
          title: "Plan Upgraded!",
          description: "Your membership plan has been successfully upgraded.",
        });
      } catch (err: any) {
        console.error('Upgrade completion error:', err);
        setError(err.message || 'Failed to complete upgrade');
        setIsProcessing(false);
      }
    };

    processUpgrade();
  }, [searchParams, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing your upgrade...</p>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we complete your plan upgrade
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Upgrade Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/trainer/settings')} className="w-full">
              Return to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Plan Upgraded Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Your membership plan has been upgraded and payment has been processed.
            </p>
            <p className="text-sm text-muted-foreground">
              Your new plan benefits are now active.
            </p>
          </div>
          
          <Button onClick={() => navigate('/trainer/settings')} className="w-full">
            View Membership Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanUpgradeSuccess;
