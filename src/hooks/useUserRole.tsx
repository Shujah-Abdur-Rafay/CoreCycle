import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'producer_admin' | 'municipality_admin' | 'sme_admin' | 'learner';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRoleContextType {
  userRole: UserRole | null;
  loading: boolean;
  error: Error | null;
  isSuperAdmin: boolean;
  isProducerAdmin: boolean;
  isMunicipalityAdmin: boolean;
  isSmeAdmin: boolean;
  isLearner: boolean;
  isApproved: boolean;
  hasReportAccess: boolean;
  canEnroll: boolean;
  refetch: () => Promise<void>;
  // Simulated role for super admin viewing
  simulatedRole: AppRole | null;
  setSimulatedRole: (role: AppRole | null) => void;
  // Effective role (simulated or actual)
  effectiveRole: AppRole | null;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<AppRole | null>(null);

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setUserRole(data as UserRole | null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    // Clear simulated role when user changes
    setSimulatedRole(null);
  }, [user]);

  // Actual role checks (ignoring simulation)
  const actualIsSuperAdmin = userRole?.role === 'super_admin';
  
  // Effective role (simulated if set and user is super admin, otherwise actual)
  const effectiveRole = (actualIsSuperAdmin && simulatedRole) ? simulatedRole : userRole?.role ?? null;
  
  // Role checks based on effective role
  const isSuperAdmin = effectiveRole === 'super_admin';
  const isProducerAdmin = effectiveRole === 'producer_admin';
  const isMunicipalityAdmin = effectiveRole === 'municipality_admin';
  const isSmeAdmin = effectiveRole === 'sme_admin';
  const isLearner = effectiveRole === 'learner';
  
  // Approval is always based on actual role (simulated users inherit approval status)
  const isApproved = userRole?.is_approved ?? false;
  
  const hasReportAccess = isApproved && (isSuperAdmin || isProducerAdmin || isMunicipalityAdmin || isSmeAdmin);
  const canEnroll = isApproved || actualIsSuperAdmin; // Super admin can always enroll

  return (
    <UserRoleContext.Provider value={{
      userRole,
      loading,
      error,
      isSuperAdmin,
      isProducerAdmin,
      isMunicipalityAdmin,
      isSmeAdmin,
      isLearner,
      isApproved,
      hasReportAccess,
      canEnroll,
      refetch: fetchUserRole,
      simulatedRole,
      setSimulatedRole: actualIsSuperAdmin ? setSimulatedRole : () => {}, // Only super admin can set
      effectiveRole,
    }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
