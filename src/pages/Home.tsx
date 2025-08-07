import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function Home() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, isClient, isTrainer, isAdmin } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (profile) {
        if (isTrainer()) {
          // Check if profile setup is needed
          if (!profile.terms_agreed || !(profile as any).profile_setup_completed) {
            navigate('/trainer/profile-setup');
          } else {
            navigate('/trainer/dashboard');
          }
        } else if (isClient()) {
          if (!profile.quiz_completed) {
            navigate('/client-survey');
          } else {
            navigate('/client/dashboard');
          }
        } else {
          // Handle admin or other user types
          navigate('/admin');
        }
      }
    }
  }, [user, profile, loading, profileLoading, isClient, isTrainer, isAdmin, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}