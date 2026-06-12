import { supabase } from './supabase';

export async function getActiveTechnicians() {
  const { data, error } = await supabase
    .from('technicians')
    .select('name')
    .eq('is_active', true) // Stáhne jen ty, co u firmy ještě pracují
    .order('name'); // Seřadí je podle abecedy
    
  return { data, error };
}