import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, AppRole } from './useUserRole';

export interface SMEMember {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  is_approved: boolean;
  created_at: string;
}

export interface SME {
  sme_id: string;
  company_name: string | null;
  municipality: string | null;
  industry_sector: string | null;
  admin: SMEMember | null;
  members: SMEMember[];
  member_count: number;
}

export function useAdminSMEs() {
  const { isSuperAdmin } = useUserRole();
  const [smes, setSMEs] = useState<SME[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSMEs = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all SMEs from the smes table
      const { data: smeRecords, error: smeError } = await supabase
        .from('smes')
        .select('*')
        .order('company_name', { ascending: true });

      if (smeError) throw smeError;

      // Fetch all profiles that have an sme_id
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('sme_id', 'is', null);

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Create a map from sme_id to SME (start with smes table data)
      const smeMap = new Map<string, SME>();

      // Add SMEs from the smes table first
      (smeRecords || []).forEach(smeRecord => {
        smeMap.set(smeRecord.sme_id, {
          sme_id: smeRecord.sme_id,
          company_name: smeRecord.company_name,
          municipality: smeRecord.municipality,
          industry_sector: smeRecord.industry_sector,
          admin: null,
          members: [],
          member_count: 0
        });
      });

      // Then add/merge profiles
      (profiles || []).forEach(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        const role = (userRole?.role || 'learner') as AppRole;
        const is_approved = userRole?.is_approved || false;

        const member: SMEMember = {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          role,
          is_approved,
          created_at: profile.created_at
        };

        // If SME doesn't exist in map (legacy data), create it from profile
        if (!smeMap.has(profile.sme_id)) {
          smeMap.set(profile.sme_id, {
            sme_id: profile.sme_id,
            company_name: profile.company_name,
            municipality: profile.municipality,
            industry_sector: profile.industry_sector,
            admin: null,
            members: [],
            member_count: 0
          });
        }

        const sme = smeMap.get(profile.sme_id)!;
        
        if (role === 'sme_admin') {
          sme.admin = member;
        } else {
          sme.members.push(member);
        }
        sme.member_count++;
      });

      setSMEs(Array.from(smeMap.values()));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
    await fetchSMEs();
  };

  const removeMemberFromSME = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ sme_id: null })
      .eq('user_id', userId);

    if (error) throw error;
    await fetchSMEs();
  };

  const createSME = async (companyName: string, municipality?: string, industrySector?: string) => {
    // Generate a unique SME ID
    const smeId = `SME-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    // Insert into the smes table
    const { data, error } = await supabase
      .from('smes')
      .insert({
        sme_id: smeId,
        company_name: companyName,
        municipality: municipality || null,
        industry_sector: industrySector || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchSMEs();
    return data;
  };

  const assignUserToSME = async (userId: string, smeId: string, companyName: string, municipality?: string, industrySector?: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        sme_id: smeId, 
        company_name: companyName,
        municipality: municipality || null,
        industry_sector: industrySector || null
      })
      .eq('user_id', userId);

    if (error) throw error;
    await fetchSMEs();
  };

  const mergeSMEs = async (targetSmeId: string, sourceSmeIds: string[]) => {
    // Move all profiles from source SMEs to target SME
    for (const sourceSmeId of sourceSmeIds) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ sme_id: targetSmeId })
        .eq('sme_id', sourceSmeId);
      
      if (profileError) throw profileError;

      // Update course allocations
      const { error: allocError } = await supabase
        .from('course_allocations')
        .update({ sme_id: targetSmeId })
        .eq('sme_id', sourceSmeId);
      
      if (allocError) throw allocError;

      // Delete the source SME record
      const { error: deleteError } = await supabase
        .from('smes')
        .delete()
        .eq('sme_id', sourceSmeId);
      
      if (deleteError) throw deleteError;
    }

    await fetchSMEs();
  };

  const getDuplicateSMEs = () => {
    const companyMap = new Map<string, SME[]>();
    smes.forEach(sme => {
      const name = sme.company_name?.toLowerCase() || '';
      if (!companyMap.has(name)) {
        companyMap.set(name, []);
      }
      companyMap.get(name)!.push(sme);
    });
    
    return Array.from(companyMap.entries())
      .filter(([_, smes]) => smes.length > 1)
      .map(([name, smes]) => ({ companyName: name, smes }));
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSMEs();
    }
  }, [isSuperAdmin]);

  return {
    smes,
    loading,
    error,
    updateMemberRole,
    removeMemberFromSME,
    createSME,
    assignUserToSME,
    mergeSMEs,
    getDuplicateSMEs,
    refetch: fetchSMEs
  };
}
