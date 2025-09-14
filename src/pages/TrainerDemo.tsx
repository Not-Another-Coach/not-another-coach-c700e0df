import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnonymousTrainerSession } from '@/hooks/useAnonymousTrainerSession';
import { TrainerDemoCalendar } from '@/components/trainer-demo/TrainerDemoCalendar';
import { EarningsCalculator } from '@/components/trainer-demo/EarningsCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/ui/app-logo';
import { CoachRecruitmentSection } from '@/components/homepage/CoachRecruitmentSection';
import { ArrowRight, MessageSquare, Users, TrendingUp, Star, Shield, Zap } from 'lucide-react';

export default function TrainerDemo() {
  const navigate = useNavigate();
  const { trackInteraction, updateTrainerProfile } = useAnonymousTrainerSession();

  useEffect(() => {
    trackInteraction('viewedDashboard');
  }, [trackInteraction]);

  const handleCreateProfile = () => {
    navigate('/trainer/preview');
  };

  const handleEarningsInteraction = () => {
    trackInteraction('usedCalculator');
  };

  const handleRateChange = (rate: number) => {
    updateTrainerProfile({ hourlyRate: rate });
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
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Your Coaching Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            This is what your experience would be like as a coach on NAC. 
            Explore the features, see potential earnings, and imagine building your coaching business.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={handleCreateProfile}>
              Start Building Your Profile
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Sign Up Now</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Calendar & Management */}
          <div className="space-y-6">
            <TrainerDemoCalendar />
            
            {/* Client Communication Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Client Messages
                  <Badge variant="destructive" className="ml-auto">3 New</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                    <div className="font-medium">Sarah M.</div>
                    <div className="text-xs text-muted-foreground ml-auto">2 hours ago</div>
                  </div>
                  <div className="text-sm">Thank you for yesterday's session! I'm feeling much more confident about my form. Looking forward to our next meeting.</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                    <div className="font-medium">Mike R.</div>
                    <div className="text-xs text-muted-foreground ml-auto">5 hours ago</div>
                  </div>
                  <div className="text-sm">Can we reschedule tomorrow's session to 3 PM instead? Thanks!</div>
                </div>
                <Button disabled className="w-full opacity-50">
                  View All Messages
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  💬 Sign up to enable direct client messaging
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Earnings & Growth */}
          <div className="space-y-6">
            <EarningsCalculator 
              onInteraction={handleEarningsInteraction}
              onRateChange={handleRateChange}
            />

            {/* Platform Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Why Coaches Choose NAC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Quality Client Matching</div>
                    <div className="text-sm text-muted-foreground">
                      Our smart matching system connects you with clients who truly fit your coaching style
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Secure Payments</div>
                    <div className="text-sm text-muted-foreground">
                      Automatic payment processing, transparent fees, weekly payouts
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Business Growth Tools</div>
                    <div className="text-sm text-muted-foreground">
                      Analytics, client management, automated scheduling, and marketing support
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Professional Recognition</div>
                    <div className="text-sm text-muted-foreground">
                      Verification system, client reviews, and showcase your expertise
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
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                      JD
                    </div>
                    <div className="font-medium">John D., Personal Trainer</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    "I've grown from 3 clients to 15+ in just 6 months. The platform makes client management so much easier."
                  </div>
                  <div className="text-xs text-primary mt-2">
                    Now earning £3,200/month
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">
                      AL
                    </div>
                    <div className="font-medium">Anna L., Nutrition Coach</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    "The quality of clients is amazing. Everyone I work with is genuinely committed to their goals."
                  </div>
                  <div className="text-xs text-primary mt-2">
                    4.9 star average rating
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coach Recruitment Section */}
        <CoachRecruitmentSection 
          onBecomeCoach={handleCreateProfile}
        />

        {/* Call to Action */}
        <div className="mt-12 text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Coaching Journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join hundreds of successful coaches who've built thriving businesses on NAC. 
            Create your profile in minutes and start connecting with clients today.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={handleCreateProfile}>
              Create Your Profile Preview
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Sign Up & Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}