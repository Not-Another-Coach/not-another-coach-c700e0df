import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export const TrainerHolding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Thank You for Completing Your Profile!</CardTitle>
          <CardDescription className="text-base">
            We appreciate you setting up your trainer profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg">Limited Access Period</h3>
            <p className="text-muted-foreground">
              We're currently in a controlled access period while we fine-tune the platform. 
              Your profile has been saved and you'll be notified via email when full platform 
              access becomes available.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">What happens next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You'll receive an email notification when access is granted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You can edit your profile information anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your profile will be reviewed for verification</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={() => navigate("/trainer/profile-setup")}
            >
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
