import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndustrySector {
  id: string;
  name: string;
  is_system: boolean;
  is_active: boolean;
}

export function useIndustrySectors() {
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('industry_sectors')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setSectors(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return { sectors, loading, error };
}
