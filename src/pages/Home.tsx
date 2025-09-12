import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { useUserType } from "@/hooks/useUserType";
import { useDataMigration } from "@/hooks/useDataMigration";
import { AnonymousBrowse } from "@/components/anonymous/AnonymousBrowse";
import { MatchQuiz } from "@/components/anonymous/MatchQuiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";
import { AppLogo } from "@/components/ui/app-logo";
import { 
  Search, 
  Users, 
  Star, 
  Clock, 
  MessageCircle,
  Calendar,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, userType } = useProfileByType();
  const { user_type, loading: userTypeLoading } = useUserType();
  const { savedTrainersCount } = useAnonymousSession();
  const navigate = useNavigate();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  // Initialize data migration hook
  useDataMigration();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (!loading && !profileLoading && !userTypeLoading && user) {
      if (profile && user_type) {
        if (user_type === 'trainer') {
          if (profile.profile_setup_completed && profile.terms_agreed) {
            navigate('/trainer/dashboard');
          } else {
            navigate('/trainer/profile-setup');
          }
        } else if (user_type === 'client') {
          if (!profile.client_survey_completed) {
            navigate('/client-survey');
          } else {
            navigate('/client/dashboard');
          }
        } else if (user_type === 'admin') {
          navigate('/admin');
        }
      }
    }
  }, [user, profile, loading, profileLoading, userTypeLoading, user_type, navigate]);

  const handleQuizComplete = (results: any) => {
    setShowQuiz(false);
    setShowMatches(true);
  };

  // Show loading only while checking auth status
  if (loading || (user && (profileLoading || userTypeLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show anonymous experience for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <AppLogo />
            
            <div className="flex items-center gap-4">
              {savedTrainersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/anonymous-saved')}
                  className="gap-2"
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                  {savedTrainersCount} saved
                </Button>
              )}
              
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth?signup=true')}>
                Join Free
              </Button>
            </div>
          </div>
        </div>
      </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Find Your Perfect
                <span className="text-primary block">Personal Trainer</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Browse verified trainers, compare coaching styles, and book your perfect match. 
                No signup required to start exploring.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowQuiz(true);
                    setTimeout(() => {
                      document.getElementById('browse-trainers')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }, 100);
                  }}
                  className="text-lg px-8"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Find My Match
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => document.getElementById('browse-trainers')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-lg px-8"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Browse All Trainers
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Verified Trainers</h3>
                  <p className="text-muted-foreground">
                    All trainers are background checked and professionally certified
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Direct Messaging</h3>
                  <p className="text-muted-foreground">
                    Chat directly with trainers to find your perfect match
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
                  <p className="text-muted-foreground">
                    Book sessions and discovery calls with just a few clicks
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Browse Trainers Section */}
        <section id="browse-trainers" className="py-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Browse Trainers</h2>
              <p className="text-xl text-muted-foreground">
                Discover your perfect training match
              </p>
            </div>
            
            {showQuiz ? (
              <MatchQuiz 
                onComplete={handleQuizComplete}
                onClose={() => setShowQuiz(false)}
              />
            ) : (
              <AnonymousBrowse />
            )}
          </div>
        </section>
      </div>
    );
  }

  // Fallback for authenticated users (shouldn't reach here due to useEffect redirect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}