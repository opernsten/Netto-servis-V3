import { supabase } from './supabase';
import type { PlannedVisitForCustomer } from '../types/database';

// 1. Vytvoření nového výjezdu a připojení vybraných strojů
export async function createPlannedVisit(customerId: string, visitDate: string, note: string, machineIds: string[]) {
  // Nejprve založíme samotný výjezd
  const { data: visit, error: visitError } = await supabase
    .from('planned_visits')
    .insert([{ customer_id: customerId, visit_date: visitDate, note: note }])
    .select()
    .single();

  if (visitError) return { error: visitError };

  // Poté vytvoříme vazby na zaškrtnuté stroje
  if (machineIds.length > 0) {
    const machineLinks = machineIds.map(id => ({
      visit_id: visit.id,
      machine_id: id
    }));

    const { error: linkError } = await supabase
      .from('planned_visit_machines')
      .insert(machineLinks);

    if (linkError) return { error: linkError };
  }

  return { data: visit, error: null };
}

// 2. Načtení všech výjezdů pro daného zákazníka (včetně detailu o strojích)
export async function getPlannedVisitsForCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('planned_visits')
    .select(`
      id, 
      visit_date, 
      note,
      planned_visit_machines (
        machine:machines (id, model, serial_number)
      )
    `)
    .eq('customer_id', customerId)
    .order('visit_date', { ascending: true });

  return { data: data as unknown as PlannedVisitForCustomer[] | null, error };
}

// 3. Smazání celého výjezdu (díky kaskádě v databázi se automaticky smažou i vazby na stroje)
export async function deletePlannedVisit(visitId: string) {
  const { error } = await supabase
    .from('planned_visits')
    .delete()
    .eq('id', visitId);

  return { error };
}

// 4. Přeložení výjezdu na nové datum
export async function updatePlannedVisitDate(visitId: string, newDate: string) {
  const { error } = await supabase
    .from('planned_visits')
    .update({ visit_date: newDate })
    .eq('id', visitId);

  return { error };
}