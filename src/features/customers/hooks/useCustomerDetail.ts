import { useState, useEffect } from 'react';
import { getCustomerDetail } from '../../../services/customerService';
import { getPlannedVisitsForCustomer, deletePlannedVisit } from '../../../services/visitService';
import type { CustomerWithMachines, PlannedVisitForCustomer } from '../../../types/database';

export function useCustomerDetail(id: string | undefined) {
  const [customer, setCustomer] = useState<CustomerWithMachines | null>(null);
  const [plannedVisits, setPlannedVisits] = useState<PlannedVisitForCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (id) {
      setLoading(true);
      const { data: custData } = await getCustomerDetail(id);
      setCustomer(custData);
      
      const { data: visitsData } = await getPlannedVisitsForCustomer(id);
      if (visitsData) setPlannedVisits(visitsData);
      
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeleteVisit = async (visitId: string) => {
    if (window.confirm('Opravdu chcete tento výjezd kompletně zrušit?')) {
      await deletePlannedVisit(visitId);
      loadData();
    }
  };

  return {
    customer,
    plannedVisits,
    loading,
    loadData,
    handleDeleteVisit
  };
}
