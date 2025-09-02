import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the full URL including any encoded fragments
        const urlString = window.location.href;
        
        // Handle encoded fragment (#access_token becomes %23access_token)
        let hashFragment = '';
        if (urlString.includes('%23')) {
          // Extract everything after %23 and decode it
          hashFragment = decodeURIComponent(urlString.split('%23')[1]);
        } else if (window.location.hash) {
          // Normal fragment handling
          hashFragment = window.location.hash.substring(1);
        }

        if (hashFragment) {
          // Parse the fragment parameters
          const params = new URLSearchParams(hashFragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && refreshToken && type === 'signup') {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('Session error:', error);
              toast({
                title: "Authentication Error",
                description: "Failed to complete email verification. Please try again.",
                variant: "destructive",
              });
              navigate('/auth');
              return;
            }

            if (data.user) {
              toast({
                title: "Email Verified!",
                description: "Your email has been verified successfully. Welcome!",
              });
              
              // Navigate to home to trigger the normal role-based redirect
              navigate('/', { replace: true });
              return;
            }
          }
        }

        // If we get here, something went wrong or it's not a valid callback
        toast({
          title: "Invalid Link",
          description: "This email verification link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/auth');

      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "An error occurred during email verification.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg">Verifying your email...</p>
        <p className="text-sm text-muted-foreground">Please wait while we complete your registration.</p>
      </div>
    </div>
  );
}