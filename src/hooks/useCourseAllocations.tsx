import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CourseAllocation {
  id: string;
  course_id: string;
  allocation_type: 'user' | 'sme';
  user_id: string | null;
  sme_id: string | null;
  allocated_by: string;
  allocated_at: string;
  expires_at: string | null;
  course?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
  };
  profile?: {
    full_name: string | null;
    email: string | null;
    company_name: string | null;
  };
}

interface UserForAllocation {
  user_id: string;
  full_name: string | null;
  email: string | null;
  user_type: string;
  sme_id: string | null;
  company_name: string | null;
}

export function useCourseAllocations() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<CourseAllocation[]>([]);
  const [users, setUsers] = useState<UserForAllocation[]>([]);
  const [smes, setSmes] = useState<{ sme_id: string; company_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('course_allocations')
        .select(`
          *,
          course:courses(id, title, thumbnail_url)
        `)
        .order('allocated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch profiles for user allocations
      const userIds = data?.filter(a => a.user_id).map(a => a.user_id) || [];
      let profiles: Record<string, any> = {};
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, company_name')
          .in('user_id', userIds);
        
        profiles = (profileData || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      const allocationsWithProfiles = (data || []).map(a => ({
        ...a,
        profile: a.user_id ? profiles[a.user_id] : null
      }));

      setAllocations(allocationsWithProfiles as CourseAllocation[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndSmes = async () => {
    if (!user) return;

    try {
      // Fetch all users for allocation
      const { data: userData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, user_type, sme_id, company_name')
        .order('full_name');

      setUsers(userData || []);

      // Extract unique SMEs
      const smeMap = new Map<string, string>();
      (userData || []).forEach(u => {
        if (u.sme_id && u.company_name) {
          smeMap.set(u.sme_id, u.company_name);
        }
      });
      
      setSmes(Array.from(smeMap.entries()).map(([sme_id, company_name]) => ({
        sme_id,
        company_name
      })));
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  const allocateCourse = async (
    courseId: string,
    allocationType: 'user' | 'sme',
    targetId: string,
    expiresAt?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const insertData: any = {
        course_id: courseId,
        allocation_type: allocationType,
        allocated_by: user.id,
        expires_at: expiresAt || null
      };

      if (allocationType === 'user') {
        insertData.user_id = targetId;
      } else {
        insertData.sme_id = targetId;
      }

      const { error: insertError } = await supabase
        .from('course_allocations')
        .insert(insertData);

      if (insertError) {
        console.error('course_allocations insert error:', insertError.message, insertError.details, insertError.hint, insertError.code);
        throw insertError;
      }

      await fetchAllocations();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const removeAllocation = async (allocationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('course_allocations')
        .delete()
        .eq('id', allocationId);

      if (deleteError) throw deleteError;

      await fetchAllocations();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllocations();
      fetchUsersAndSmes();
    }
  }, [user]);

  return {
    allocations,
    users,
    smes,
    loading,
    error,
    allocateCourse,
    removeAllocation,
    refetch: fetchAllocations
  };
}
