import { supabase } from './supabase';
import type { Machine, MachineWithCustomer, MachineDetail } from '../types/database';

// Typ pro odesílání stroje (vynecháme ID a časy, které generuje databáze)
export type MachineInsertData = Omit<Machine, 'id' | 'created_at' | 'mid_last_verification_date'>;

// Funkce pro načtení seznamu zákazníků (pro roletku)
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name')
    .order('name');

  return { data, error };
}

// Zkrácená a bezpečná funkce pro vytvoření stroje
export async function createMachine(machineData: MachineInsertData) {
  const { data, error } = await supabase
    .from('machines')
    .insert([machineData]) // Posíláme celý zabalený objekt stroje
    .select();

  return { data: data as Machine[] | null, error };
}

export async function getMachineById(id: string) {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data as Machine | null, error };
}

// Zkrácená a bezpečná funkce pro aktualizaci
export async function updateMachine(id: string, machineData: MachineInsertData) {
  const { data, error } = await supabase
    .from('machines')
    .update(machineData) // Posíláme balíček
    .eq('id', id)
    .select();

  return { data: data as Machine[] | null, error };
}

// Funkce pro načtení všech strojů včetně jména zákazníka
export async function getMachinesWithCustomers() {
  const { data, error } = await supabase
    .from('machines')
    .select(`
      *,
      customers (
        name
      )
    `)
    .order('created_at', { ascending: false });

  return { data: data as MachineWithCustomer[] | null, error };
}

// Funkce pro smazání stroje podle jeho ID
export async function deleteMachine(id: string) {
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getMachineDetail(id: string) {
  const { data, error } = await supabase
    .from('machines')
    .select(`
      *,
      customers (
        id,
        name,
        city
      ),
      planned_visit_machines (
        visit:planned_visits (
          id,
          visit_date,
          note
        )
      )
    `)
    .eq('id', id)
    .single();

  return { data: data as MachineDetail | null, error };
}

// Zapsání nové roční MID zkoušky (aktualizuje datum na dnešek)
export async function updateMidLastVerification(machineId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('machines')
    .update({ mid_last_verification_date: today })
    .eq('id', machineId)
    .select();

  return { data: data as Machine[] | null, error };
}