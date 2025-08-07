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

      // Try to get emails for users (admins can see full emails)
      const { data: userEmails, error: emailError } = await supabase
        .rpc('get_user_emails_for_admin');

      let combinedUsers: TestUser[];

      if (emailError) {
        console.error('Error fetching full emails (not admin):', emailError);
        // For non-admin users, try to get emails from auth metadata or use common patterns
        // We'll show partial emails but provide full emails for known test accounts
        combinedUsers = profiles.map(profile => {
          const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
          
          // Generate likely email patterns for test accounts
          const firstName = profile.first_name?.toLowerCase() || 'user';
          const lastName = profile.last_name?.toLowerCase() || '';
          const userType = profile.user_type || 'user';
          
          // Common test email patterns
          const possibleEmails = [
            `${firstName}.${lastName}@example.com`,
            `${firstName}@demo.com`,
            `${userType}@demo.com`,
            `test.${userType}@example.com`,
            `${firstName}@test.com`
          ].filter(email => email.includes('.') || !email.includes('..'));

          const primaryEmail = possibleEmails[0];
          const displayEmail = `${firstName}${lastName ? '.' + lastName : ''}@***`;
          
          return {
            id: profile.id,
            email: primaryEmail, // Full email for login attempts
            displayEmail: displayEmail, // Partial email for display
            first_name: profile.first_name,
            last_name: profile.last_name,
            user_type: profile.user_type,
            roles,
            password: getTestPassword(primaryEmail)
          };
        });
      } else {
        // Admin view - combine profile data with real emails and roles
        combinedUsers = profiles.map(profile => {
          const emailData = userEmails.find((e: any) => e.user_id === profile.id);
          const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
          const fullEmail = emailData?.email || '';
          
          // Create display email (partial)
          const displayEmail = fullEmail ? 
            fullEmail.split('@')[0] + '@***' : 
            'Unknown';
          
          return {
            id: profile.id,
            email: fullEmail, // Full email for login
            displayEmail: displayEmail, // Partial email for display
            first_name: profile.first_name,
            last_name: profile.last_name,
            user_type: profile.user_type,
            roles,
            password: getTestPassword(fullEmail)
          };
        }).filter(user => user.email !== '');
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

  // Assign test passwords based on email patterns
  const getTestPassword = (email: string): string => {
    if (email.includes('demo')) return 'demo123';
    if (email.includes('test')) return 'password123';
    if (email.includes('admin')) return 'admin123';
    if (email.includes('trainer')) return 'trainer123';
    if (email.includes('client')) return 'client123';
    return 'password123'; // Default test password
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