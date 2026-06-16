import { supabase } from './supabase';
import type { Customer } from '../types/database';

// Vytvoříme speciální typ pro ODESÍLÁNÍ dat (zákazník bez ID a data vytvoření, to doplní databáze)
export type CustomerInsertData = Omit<Customer, 'id' | 'created_at'>;

export async function createCustomer(customerData: CustomerInsertData) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData]) // Posíláme rovnou celý zabalený objekt!
    .select();

  return { data: data as Customer[] | null, error };
}

export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  return { data: data as Customer[] | null, error };
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data as Customer | null, error };
}

export async function updateCustomer(id: string, customerData: CustomerInsertData) {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData) // Znovu předáváme rovnou balíček
    .eq('id', id)
    .select();

  return { data: data as Customer[] | null, error };
}

export async function getCustomerDetail(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      machines (
        id,
        model,
        serial_number,
        status
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
}