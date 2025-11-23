import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services';

export interface TestUser {
  id: string;
  email: string;
  displayEmail?: string; // Partial email for display
  first_name: string | null;
  last_name: string | null;
  user_type: string;
  roles: string[];
  password?: string; // For test users only
}

export const useTestUsers = (shouldLoad: boolean = true) => {
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTestUsers = async () => {
    setLoading(true);
    try {
      console.log('TestUsers: Starting fetch...');
      
      // Add a timeout wrapper for all operations
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TestUsers fetch timeout')), 5000)
      );
      
      // If not authenticated, return demo users immediately
      const sessionResult = await AuthService.getSession();
      
      if (!sessionResult.success || !sessionResult.data) {
        console.log('TestUsers: No session, using default users');
        setTestUsers(getDefaultTestUsers());
        return;
      }
      console.log('TestUsers: Fetching profiles...');
      // First fetch profiles with timeout
      const profilesPromise = supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type')
        .order('created_at', { ascending: false });
        
      const { data: profiles, error: profilesError } = await Promise.race([profilesPromise, timeoutPromise]) as any;

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setTestUsers(getDefaultTestUsers());
        setLoading(false);
        return;
      }
      
      console.log('TestUsers: Profiles fetched:', profiles?.length);

      console.log('TestUsers: Fetching user roles...');
      // Fetch user roles separately with timeout
      const rolesPromise = supabase
        .from('user_roles')
        .select('user_id, role');
        
      const { data: userRoles, error: rolesError } = await Promise.race([rolesPromise, timeoutPromise]) as any;

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }
      
      console.log('TestUsers: User roles fetched:', userRoles?.length);

      console.log('TestUsers: Attempting to fetch emails...');
      // Try to get emails for users (development function allows all authenticated users)
      let userEmails: any[] = [];
      let emailError: any = null;
      
      try {
        // First try the new admin-only RPC that combines profiles + emails
        console.log('TestUsers: Trying admin list function...');
        const adminPromise = supabase.rpc('list_users_minimal_admin');
        const { data: adminUserList, error: adminListError } = await Promise.race([adminPromise, timeoutPromise]) as any;
          
        if (adminListError) {
          console.log('Admin list function failed (not admin or error):', adminListError);
          // Fallback to development function for email only
          console.log('TestUsers: Trying development email function...');
          const devPromise = supabase.rpc('get_user_emails_for_development');
          const { data: devEmails, error: devEmailError } = await Promise.race([devPromise, timeoutPromise]) as any;
            
          if (devEmailError) {
            console.error('Development email fetch failed:', devEmailError);
            emailError = devEmailError;
          } else {
            userEmails = devEmails || [];
            console.log('TestUsers: Development emails fetched:', userEmails.length);
          }
        } else {
          console.log('TestUsers: Admin list success:', adminUserList?.length);
          // Admin RPC succeeded - use it directly
          const combinedUsersFromAdmin = adminUserList.map((user: any) => ({
            id: user.id,
            email: user.email,
            displayEmail: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            user_type: user.user_type,
            roles: user.roles || [],
            password: getTestPassword(user.email)
          }));
          
          setTestUsers(combinedUsersFromAdmin);
          setLoading(false);
          return;
        }
      } catch (rpcError) {
        console.error('RPC functions timed out or failed:', rpcError);
        emailError = rpcError;
      }

      let combinedUsers: TestUser[];

      if (emailError && userEmails.length === 0) {
        console.error('Could not fetch emails:', emailError);
        // Fallback to default test users
        combinedUsers = getDefaultTestUsers();
      } else {
        // Combine profile data with real emails and roles
        combinedUsers = profiles.map(profile => {
          const emailData = userEmails.find((e: any) => e.user_id === profile.id);
          const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
          const fullEmail = emailData?.email || '';
          
          if (!fullEmail) return null; // Skip users without emails
          
          return {
            id: profile.id,
            email: fullEmail, // Real email for login
            displayEmail: fullEmail, // Show full email for development
            first_name: profile.first_name,
            last_name: profile.last_name,
            user_type: profile.user_type,
            roles,
            password: getTestPassword(fullEmail)
          };
        }).filter(user => user !== null) as TestUser[];
      }

      setTestUsers(combinedUsers);
    } catch (error) {
      console.error('Error in fetchTestUsers:', error);
      console.log('TestUsers: Falling back to default users due to error');
      setTestUsers(getDefaultTestUsers());
    } finally {
      setLoading(false);
      console.log('TestUsers: Fetch complete');
    }
  };

  // Default test users for non-admin access or when no real users exist
  const getDefaultTestUsers = (): TestUser[] => [
    {
      id: 'demo-client-1',
      email: 'client@demo.com',
      displayEmail: 'client@***',
      first_name: 'Demo',
      last_name: 'Client',
      user_type: 'client',
      roles: [],
      password: 'Password123!'
    },
    {
      id: 'demo-trainer-1',
      email: 'trainer@demo.com',
      displayEmail: 'trainer@***',
      first_name: 'Demo',
      last_name: 'Trainer', 
      user_type: 'trainer',
      roles: [],
      password: 'Password123!'
    },
    {
      id: 'demo-admin-1',
      email: 'admin@demo.com',
      displayEmail: 'admin@***',
      first_name: 'Demo',
      last_name: 'Admin',
      user_type: 'admin',
      roles: ['admin'],
      password: 'Password123!'
    }
  ];

  // For development: all users now use the standard Password123! password
  const getTestPassword = (email: string): string => {
    // All users in development now use the same password for simplicity
    return 'Password123!';
  };

  useEffect(() => {
    if (!shouldLoad) {
      // If we shouldn't load, set default test users immediately
      setTestUsers(getDefaultTestUsers());
      return;
    }
    
    // Add a small delay to prevent blocking the initial page load
    const timer = setTimeout(() => {
      fetchTestUsers();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [shouldLoad]);

  return {
    testUsers,
    loading,
    refreshTestUsers: fetchTestUsers
  };
};