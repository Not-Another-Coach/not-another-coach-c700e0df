import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnonymousTrainerSession } from '@/hooks/useAnonymousTrainerSession';
import { TrainerDemoCalendar } from '@/components/trainer-demo/TrainerDemoCalendar';
import { GrowthTracker } from '@/components/trainer-demo/GrowthTracker';
import { CoachJourneyInfographic } from '@/components/trainer-demo/CoachJourneyInfographic';
import { DemoProfilePreview } from '@/components/trainer-demo/DemoProfilePreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/ui/app-logo';
import { CoachRecruitmentSection } from '@/components/homepage/CoachRecruitmentSection';
import { ArrowRight, MessageSquare, Target, CreditCard, TrendingUp, Star } from 'lucide-react';

export default function TrainerDemo() {
  const navigate = useNavigate();
  const { trackInteraction, updateTrainerProfile } = useAnonymousTrainerSession();

  useEffect(() => {
    trackInteraction('viewedDashboard');
  }, [trackInteraction]);

  const handleCreateProfile = () => {
    navigate('/trainer/preview');
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AppLogo onClick={() => navigate('/')} />
              <div className="text-muted-foreground hidden sm:block">Coach Demo</div>
            </div>
            
            <Button onClick={handleCreateProfile} size="sm" className="sm:size-default">
              <span className="hidden sm:inline">Create Your Profile</span>
              <span className="sm:hidden">Create Profile</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Profile Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Heading */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-success bg-clip-text text-transparent">
              Your Coaching Business, Supercharged.
            </h1>
          </div>

          {/* Middle: Description and Buttons */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <p className="text-xl text-muted-foreground mb-6">
              Explore how NAC helps you attract clients, manage your schedule, and grow your income — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={handleCreateProfile}>
                Start Building Your Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?signup=trainer">Sign Up Free</Link>
              </Button>
            </div>
          </div>

          {/* Right: Profile Preview */}
          <div className="lg:col-span-1 flex items-center">
            <DemoProfilePreview />
          </div>
        </div>

        <div className="space-y-8">
          {/* Calendar and Growth Tracker Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrainerDemoCalendar />
            <GrowthTracker />
          </div>

          {/* Coach Journey Infographic */}
          <CoachJourneyInfographic />

          {/* Why Coaches Choose NAC - Updated 4-icon layout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Why Coaches Choose NAC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">🎯 Smart Matching</div>
                    <div className="text-sm text-muted-foreground">
                      Find clients who truly fit your style
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-success/5 border border-success/10">
                  <div className="p-3 rounded-lg bg-success/10">
                    <CreditCard className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">💳 Instant Payments</div>
                    <div className="text-sm text-muted-foreground">
                      Get paid fast, with no stress
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/5 border border-secondary/10">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">📈 Growth Tools</div>
                    <div className="text-sm text-muted-foreground">
                      Automate scheduling & track progress
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-warning/5 border border-warning/10">
                  <div className="p-3 rounded-lg bg-warning/10">
                    <Star className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">⭐ Build Credibility</div>
                    <div className="text-sm text-muted-foreground">
                      Reviews & recognition
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Coach Recruitment Section */}
        <CoachRecruitmentSection 
          onBecomeCoach={handleCreateProfile}
        />

      </div>
    </div>
  );
}