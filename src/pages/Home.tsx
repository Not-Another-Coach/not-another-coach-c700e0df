import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { useUserType } from "@/hooks/useUserType";

export default function Home() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, userType } = useProfileByType();
  const { user_type, loading: userTypeLoading } = useUserType();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !profileLoading && !userTypeLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (profile && user_type) {
        if (user_type === 'trainer') {
          // If profile is completed (submitted), go to dashboard regardless of verification status
          if (profile.profile_setup_completed && profile.terms_agreed) {
            navigate('/trainer/dashboard');
          } else {
            // If profile is not completed/submitted, go to profile setup
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

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}