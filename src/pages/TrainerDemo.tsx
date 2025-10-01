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
import { UserModeToggle } from '@/components/user-intent/UserModeToggle';
import { ArrowRight, MessageSquare, Target, CreditCard, TrendingUp, Star } from 'lucide-react';
import heroImage from '@/assets/hero-coach-success.jpg';

export default function TrainerDemo() {
  const navigate = useNavigate();
  const { trackInteraction, updateTrainerProfile } = useAnonymousTrainerSession();

  useEffect(() => {
    trackInteraction('viewedDashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProfile = () => {
    navigate('/trainer/preview');
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
          <div className="flex items-center justify-between gap-4 relative">
            <div className="flex items-center gap-3 flex-shrink-0">
              <AppLogo onClick={() => navigate('/')} />
              <div className="text-muted-foreground hidden sm:block">Coach Demo</div>
            </div>
            
            {/* User Mode Toggle - Center */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
              <UserModeToggle />
            </div>
            
            <Button onClick={handleCreateProfile} size="sm" className="sm:size-default flex-shrink-0">
              <span className="hidden sm:inline">Create Your Profile</span>
              <span className="sm:hidden">Create Profile</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Toggle - Below header */}
        <div className="md:hidden border-t py-2 px-4">
          <div className="flex justify-center">
            <UserModeToggle />
          </div>
        </div>
      </div>

      {/* Visual Hero Section */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden mb-12">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage}
            alt="Successful fitness coach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-success/90 via-success/70 to-primary/60" />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-accent/20 blur-xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-secondary/20 blur-lg animate-pulse [animation-delay:2s]" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
            Your Coaching Business,
            <span className="block bg-gradient-to-r from-accent to-energy bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-medium animate-fade-in [animation-delay:0.2s]">
            Attract clients, manage your schedule, and grow your income — all in one place.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in [animation-delay:0.4s]">
            <Button 
              size="lg" 
              onClick={handleCreateProfile}
              className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Building Your Profile
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg"
            >
              <Link to="/auth?signup=trainer">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Preview Section */}
        <div className="mb-12 max-w-md mx-auto">
          <DemoProfilePreview />
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