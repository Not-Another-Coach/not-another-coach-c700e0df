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
        <div className="mx-auto px-6 lg:px-8 xl:px-12 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo onClick={() => navigate('/')} />
              <div className="text-muted-foreground">Coach Demo</div>
              
              {/* Demo Mode Badge */}
              <div className="flex items-center gap-2 ml-6 px-3 py-1 bg-muted/50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <div className="text-sm font-medium text-warning">
                  Demo Mode
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/">← Back to Homepage</Link>
              </Button>
              <Button onClick={handleCreateProfile}>
                Create Your Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-success bg-clip-text text-transparent">
            Your Coaching Business, Supercharged.
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Explore how NAC helps you attract clients, manage your schedule, and grow your income — all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={handleCreateProfile}>
              Start Building Your Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Sign Up Free</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Your Coaching Calendar */}
          <TrainerDemoCalendar />

          {/* Coach Profile Preview */}
          <DemoProfilePreview />

          {/* Growth Tracker (replacing earnings calculator) */}
          <GrowthTracker />

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

          {/* Success Stories */}
          <Card>
            <CardHeader>
              <CardTitle>Coach Success Stories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                    JD
                  </div>
                  <div>
                    <div className="font-medium">John D.</div>
                    <div className="text-xs text-muted-foreground">Personal Trainer</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  "I've grown from 3 clients to 15+ in just 6 months. The platform makes client management so much easier."
                </div>
                <div className="text-xs font-semibold text-primary">
                  Now earning £3,200/month
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-sm font-bold">
                    AL
                  </div>
                  <div>
                    <div className="font-medium">Anna L.</div>
                    <div className="text-xs text-muted-foreground">Nutrition Coach</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  "The quality of clients is amazing. Everyone I work with is genuinely committed to their goals."
                </div>
                <div className="text-xs font-semibold text-secondary">
                  4.9 star average rating
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coach Recruitment Section */}
        <CoachRecruitmentSection 
          onBecomeCoach={handleCreateProfile}
        />

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-success/10 rounded-lg p-8 border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Grow Your Coaching Business?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join hundreds of successful coaches who've built thriving businesses on NAC. 
            Create your profile in minutes and start connecting with clients today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={handleCreateProfile} className="shadow-lg">
              Create Your Profile Preview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild className="shadow-lg">
              <Link to="/auth">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}