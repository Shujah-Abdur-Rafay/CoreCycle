import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, AppRole } from './useUserRole';

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  user_type: string;
  company_name: string | null;
  sme_id: string | null;
  municipality: string | null;
  created_at: string;
  role: AppRole;
  is_approved: boolean;
  role_id: string;
}

export function useAdminUsers() {
  const { isSuperAdmin } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine data
      const combined = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role || 'learner') as AppRole,
          is_approved: userRole?.is_approved || false,
          role_id: userRole?.id || ''
        };
      });

      setUsers(combined);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
    await fetchUsers();
  };

  const approveUser = async (userId: string, approved: boolean) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ 
        is_approved: approved, 
        approved_at: approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    await fetchUsers();
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  return {
    users,
    loading,
    error,
    updateUserRole,
    approveUser,
    refetch: fetchUsers
  };
}
