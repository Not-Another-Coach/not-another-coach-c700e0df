import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'trainer' | 'client';

export interface UserWithRoles {
  id: string;
  first_name?: string;
  last_name?: string;
  user_type: string;
  created_at: string;
  roles: AppRole[];
}

export function useUserRoles() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data && !error);
    };

    checkAdminStatus();
  }, [user]);

  const fetchUsers = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(role => role.user_id === profile.id)
          .map(role => role.role as AppRole) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (userId: string, role: AppRole) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error adding role:', error);
      return { error: error.message };
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error removing role:', error);
      return { error: error.message };
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      // First delete from profiles (this will cascade to user_roles due to foreign key)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Note: Deleting from auth.users requires admin privileges
      // You may need to handle this through Supabase dashboard or admin API
      
      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error: error.message };
    }
  };

  return {
    users,
    loading,
    isAdmin,
    fetchUsers,
    addRole,
    removeRole,
    deleteUser
  };
}