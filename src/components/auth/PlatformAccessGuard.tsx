import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { supabase } from '@/integrations/supabase/client';

interface PlatformAccessGuardProps {
  children: ReactNode;
}

export function PlatformAccessGuard({ children }: PlatformAccessGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { user_type, loading: userTypeLoading } = useUserType();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Skip access check for exempt paths
    const exemptPaths = ['/profile-setup', '/survey', '/settings', '/access-pending', '/holding'];
    const isExempt = exemptPaths.some(p => location.pathname.includes(p));
    
    if (isExempt) {
      setCanAccess(true); // Immediately allow
      return;
    }
    
    if (!user || !user_type) {
      setCanAccess(true); // Allow unauthenticated access to public routes
      return;
    }
    
    checkAccess();
  }, [user, user_type, location.pathname]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('can_user_access_platform', { user_id: user.id });

      if (error) {
        console.error('Error checking platform access:', error);
        setCanAccess(true); // Default to allowing access on error
        return;
      }

      setCanAccess(data);
    } catch (error) {
      console.error('Exception checking platform access:', error);
      setCanAccess(true); // Default to allowing access on error
    }
  };

  // Check path exemptions FIRST (before any loading checks)
  const publicPaths = ['/', '/auth', '/about', '/how-it-works', '/pricing', '/privacy', '/terms'];
  const isPublicPath = publicPaths.some(path => 
    location.pathname === path || location.pathname.startsWith('/auth')
  );

  // Allow access to profile setup routes
  const isProfileSetupPath = location.pathname.includes('/profile-setup') || 
                             location.pathname.includes('/survey') ||
                             location.pathname.includes('/settings');

  // Allow access to holding pages
  const isHoldingPage = location.pathname === '/trainer/access-pending' || 
                        location.pathname === '/client/access-pending' ||
                        location.pathname === '/trainer/holding';

  // Allow exempt paths immediately - no loading check needed
  if (isPublicPath || isProfileSetupPath || isHoldingPage) {
    return <>{children}</>;
  }

  // Only show loading for paths that actually need access control
  if (authLoading || userTypeLoading || canAccess === null) {
    return null; // Loading state
  }

  // If access is denied, redirect to appropriate holding page
  if (!canAccess) {
    if (user_type === 'trainer') {
      return <Navigate to="/trainer/access-pending" replace />;
    }
    if (user_type === 'client') {
      return <Navigate to="/client/access-pending" replace />;
    }
  }

  return <>{children}</>;
}
