import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import type { PlannedVisitWithDetails } from '../../../types/database';

export type VisitsByDate = Record<string, PlannedVisitWithDetails[]>;

export function useCalendarData() {
  const [visitsByDate, setVisitsByDate] = useState<VisitsByDate>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('planned_visits')
      .select(`
        id,
        visit_date,
        note,
        customer_id,
        customers ( name ),
        planned_visit_machines ( machine_id )
      `)
      .order('visit_date', { ascending: true });

    if (error) {
      console.error('Chyba načítání výjezdů pro kalendář:', error);
      setLoading(false);
      return;
    }

    if (data) {
      const map: VisitsByDate = {};
      const visits = data as unknown as PlannedVisitWithDetails[];
      visits.forEach(v => {
        // Normalizujeme datum na YYYY-MM-DD (Supabase může vracet různé formáty)
        const key = v.visit_date.split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(v);
      });
      setVisitsByDate(map);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { visitsByDate, loading, reloadData: loadData };
}
