import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'trainer' | 'client';

export interface AdminAction {
  id: string;
  action_type: string;
  action_details: any;
  reason?: string;
  created_at: string;
  admin_id: string;
}

export interface LoginHistory {
  id: string;
  login_at: string;
  ip_address?: unknown;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
}

export interface UserWithRoles {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_type: string;
  created_at: string;
  roles: AppRole[];
  account_status?: string;
  suspended_at?: string;
  suspended_until?: string;
  suspended_reason?: string;
  admin_notes?: string;
  last_login_at?: string;
  communication_restricted?: boolean;
  communication_restricted_reason?: string;
  force_password_reset?: boolean;
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

      try {
        // Use the security definer function for role checking
        const { data, error } = await supabase
          .rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchUsers = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      // Fetch all profiles with additional admin fields
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, first_name, last_name, user_type, created_at,
          account_status, suspended_at, suspended_until, suspended_reason,
          admin_notes, last_login_at, communication_restricted,
          communication_restricted_reason, force_password_reset
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user emails using the database function
      const { data: userEmails, error: emailsError } = await supabase
        .rpc('get_user_emails_for_admin');

      if (emailsError) {
        console.error('Error fetching emails:', emailsError);
      }

      // Create a map of user IDs to emails for easier lookup
      const emailMap = new Map();
      userEmails?.forEach(item => {
        emailMap.set(item.user_id, item.email);
      });

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles and emails
      const usersWithRoles: UserWithRoles[] = profiles?.map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || null,
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

  const deleteUser = async (userId: string, confirmationPhrase: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      // Call the complete user deletion edge function
      const { data, error } = await supabase.functions.invoke('complete-user-deletion', {
        body: { userId, confirmationPhrase }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Deletion failed');
      }

      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Success toast will be handled by UserManagement component
      return { success: true, data };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return { error: error.message };
    }
  };

  const suspendUser = async (userId: string, reason: string, durationDays?: number) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase.rpc('suspend_user', {
        p_user_id: userId,
        p_reason: reason,
        p_duration_days: durationDays
      });

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return { error: error.message };
    }
  };

  const reactivateUser = async (userId: string, reason?: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase.rpc('reactivate_user', {
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error reactivating user:', error);
      return { error: error.message };
    }
  };

  const updateAdminNotes = async (userId: string, notes: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase.rpc('update_admin_notes', {
        p_user_id: userId,
        p_notes: notes
      });

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating admin notes:', error);
      return { error: error.message };
    }
  };

  const restrictCommunication = async (userId: string, reason: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase.rpc('restrict_communication', {
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error restricting communication:', error);
      return { error: error.message };
    }
  };

  const getLoginHistory = async (userId: string): Promise<LoginHistory[]> => {
    if (!isAdmin) return [];

    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('login_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching login history:', error);
      return [];
    }
  };

  const getAdminActions = async (userId: string): Promise<AdminAction[]> => {
    if (!isAdmin) return [];

    try {
      const { data, error } = await supabase
        .from('admin_actions_log')
        .select('*')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      return [];
    }
  };

  const updateProfile = async (userId: string, updates: any) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      // Separate email updates from profile updates
      const { email, ...profileUpdates } = updates;

      // Update profile fields
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      // Update email using the database function if provided
      if (email) {
        const { error: emailError } = await supabase
          .rpc('update_user_email_for_admin', {
            target_user_id: userId,
            new_email: email
          });

        if (emailError) throw emailError;
      }

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error.message };
    }
  };

  const forcePasswordReset = async (userId: string) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ force_password_reset: true })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error forcing password reset:', error);
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
    deleteUser,
    suspendUser,
    reactivateUser,
    updateAdminNotes,
    restrictCommunication,
    getLoginHistory,
    getAdminActions,
    updateProfile,
    forcePasswordReset
  };
}