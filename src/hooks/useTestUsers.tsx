import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TestUser {
  id: string;
  email: string;
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

      // Get emails for users (only admins can access this)
      const { data: userEmails, error: emailError } = await supabase
        .rpc('get_user_emails_for_admin');

      if (emailError) {
        console.error('Error fetching emails:', emailError);
        // If not admin, create a limited test user list with known test accounts
        setTestUsers(getDefaultTestUsers());
        setLoading(false);
        return;
      }

      // Combine profile data with emails and roles
      const combinedUsers: TestUser[] = profiles.map(profile => {
        const emailData = userEmails.find((e: any) => e.user_id === profile.id);
        const roles = userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [];
        
        return {
          id: profile.id,
          email: emailData?.email || 'Unknown',
          first_name: profile.first_name,
          last_name: profile.last_name,
          user_type: profile.user_type,
          roles,
          password: getTestPassword(emailData?.email || '')
        };
      }).filter(user => user.email !== 'Unknown');

      setTestUsers(combinedUsers);
    } catch (error) {
      console.error('Error in fetchTestUsers:', error);
      setTestUsers(getDefaultTestUsers());
    } finally {
      setLoading(false);
    }
  };

  // Default test users for non-admin access
  const getDefaultTestUsers = (): TestUser[] => [
    {
      id: 'test-client-1',
      email: 'client@test.com',
      first_name: 'Test',
      last_name: 'Client',
      user_type: 'client',
      roles: [],
      password: 'password123'
    },
    {
      id: 'test-trainer-1',
      email: 'trainer@test.com',
      first_name: 'Test',
      last_name: 'Trainer',
      user_type: 'trainer',
      roles: [],
      password: 'password123'
    },
    {
      id: 'test-admin-1',
      email: 'admin@test.com',
      first_name: 'Test',
      last_name: 'Admin',
      user_type: 'admin',
      roles: ['admin'],
      password: 'password123'
    }
  ];

  // Assign test passwords based on email patterns
  const getTestPassword = (email: string): string => {
    if (email.includes('test')) return 'password123';
    if (email.includes('demo')) return 'demo123';
    if (email.includes('admin')) return 'admin123';
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