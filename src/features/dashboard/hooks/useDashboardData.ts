import { useState, useEffect } from 'react';
import { getAllCustomers } from '../../../services/customerService';
import { getMachinesWithCustomers } from '../../../services/machineService';
import { supabase } from '../../../services/supabase';
import type { MachineWithCustomer, PlannedVisitWithDetails } from '../../../types/database';

export function useDashboardData() {
  const [stats, setStats] = useState({
    customers: 0,
    machines: 0,
    errors: 0,
    maintenance: 0
  });
  
  const [urgentMachines, setUrgentMachines] = useState<MachineWithCustomer[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<PlannedVisitWithDetails[]>([]);
  const [allMachines, setAllMachines] = useState<MachineWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      
      const { data: customers } = await getAllCustomers();
      const { data: machines } = await getMachinesWithCustomers();
      
      if (customers && machines) {
        setAllMachines(machines);
        const errorMachines = machines.filter(m => m.status === 'Porucha');
        const maintMachines = machines.filter(m => m.status === 'Nutná údržba');
        
        setStats({
          customers: customers.length,
          machines: machines.length,
          errors: errorMachines.length,
          maintenance: maintMachines.length
        });
        setUrgentMachines([...errorMachines, ...maintMachines].slice(0, 5));
      }

      const { data: visits, error: visitsError } = await supabase
        .from('planned_visits')
        .select(`
          id,
          visit_date,
          note,
          customer_id,
          customers ( name ),
          planned_visit_machines ( machine_id )
        `)
        .order('visit_date', { ascending: true })
        .limit(3);

      if (visitsError) {
        console.error("Chyba výjezdů na Dashboardu:", visitsError);
      }
      if (visits) {
        setUpcomingVisits(visits as unknown as PlannedVisitWithDetails[]);
      }
      
      setLoading(false);
    }
    
    loadDashboardData();
  }, []);

  return { stats, urgentMachines, upcomingVisits, allMachines, loading };
}
