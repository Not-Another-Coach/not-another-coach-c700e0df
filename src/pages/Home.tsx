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
          // Check if profile setup is needed
          if (!profile.terms_agreed || !profile.profile_setup_completed) {
            navigate('/trainer/profile-setup');
          } else {
            navigate('/trainer/dashboard');
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