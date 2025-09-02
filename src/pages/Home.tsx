import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { useUserTypeChecks } from "@/hooks/useUserType";

export default function Home() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfileByType();
  const { isClient, isTrainer, isAdmin } = useUserTypeChecks();
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
          if (!profile.terms_agreed || !profile.profile_setup_completed) {
            navigate('/trainer/profile-setup');
          } else {
            navigate('/trainer/dashboard');
          }
        } else if (isClient()) {
          if (!profile.client_survey_completed) {
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