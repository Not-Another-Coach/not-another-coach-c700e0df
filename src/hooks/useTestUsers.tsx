import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useTestUsers = () => {
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTestUsers = async () => {
    setLoading(true);
    try {
      // First fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setTestUsers(getDefaultTestUsers());
        setLoading(false);
        return;
      }

      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Try to get emails for users (development function allows all authenticated users)
      let userEmails: any[] = [];
      let emailError: any = null;
      
      // First try the development function
      const { data: devEmails, error: devEmailError } = await supabase
        .rpc('get_user_emails_for_development');
        
      if (devEmailError) {
        console.error('Development email fetch failed, trying admin function:', devEmailError);
        // Fallback to admin function
        const { data: adminEmails, error: adminEmailError } = await supabase
          .rpc('get_user_emails_for_admin');
        if (adminEmailError) {
          emailError = adminEmailError;
        } else {
          userEmails = adminEmails || [];
        }
      } else {
        userEmails = devEmails || [];
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
      setTestUsers(getDefaultTestUsers());
    } finally {
      setLoading(false);
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
      password: 'demo123'
    },
    {
      id: 'demo-trainer-1',
      email: 'trainer@demo.com',
      displayEmail: 'trainer@***',
      first_name: 'Demo',
      last_name: 'Trainer', 
      user_type: 'trainer',
      roles: [],
      password: 'demo123'
    },
    {
      id: 'demo-admin-1',
      email: 'admin@demo.com',
      displayEmail: 'admin@***',
      first_name: 'Demo',
      last_name: 'Admin',
      user_type: 'admin',
      roles: ['admin'],
      password: 'admin123'
    },
    {
      id: 'test-client-1',
      email: 'test.client@example.com',
      displayEmail: 'test.client@***',
      first_name: 'Test',
      last_name: 'Client',
      user_type: 'client',
      roles: [],
      password: 'password123'
    },
    {
      id: 'test-trainer-1',
      email: 'test.trainer@example.com',
      displayEmail: 'test.trainer@***',
      first_name: 'Test',
      last_name: 'Trainer',
      user_type: 'trainer',
      roles: [],
      password: 'password123'
    }
  ];

  // For development: all users now use the standard Password123! password
  const getTestPassword = (email: string): string => {
    // All users in development now use the same password for simplicity
    return 'Password123!';
  };

  useEffect(() => {
    fetchTestUsers();
  }, []);

  return {
    testUsers,
    loading,
    refreshTestUsers: fetchTestUsers
  };
};