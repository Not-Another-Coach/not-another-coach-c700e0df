import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const TrainerProfileSetup = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, isTrainer } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);

  // Redirect if not trainer
  useEffect(() => {
    if (!loading && !profileLoading && user && profile && !isTrainer()) {
      navigate('/');
    }
  }, [user, profile, loading, profileLoading, isTrainer, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trainer/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold">Profile Setup</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of 7: Basic Setup (Minimal Version)
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Minimal Profile Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-8">
              <p className="text-lg mb-4">Testing minimal component...</p>
              <p className="text-sm text-muted-foreground">
                User: {user?.email}<br/>
                Profile loaded: {profile ? 'Yes' : 'No'}<br/>
                Current step: {currentStep}
              </p>
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="mt-4"
              >
                Next Step ({currentStep + 1})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerProfileSetup;