import { supabase } from './supabase';

export async function createCustomer(
  name: string, 
  ico: string, 
  street: string,
  city: string,
  zip: string,
  country: string,
  email: string,
  phone: string,
  hasServiceContract: boolean
) {
  const { data, error } = await supabase
    .from('customers')
    .insert([
      { 
        name: name, 
        ico: ico, 
        street: street,
        city: city,
        zip: zip,
        country: country,
        email: email,
        phone: phone,
        has_service_contract: hasServiceContract
      }
    ])
    .select();

  return { data, error };
}

// Funkci getAllCustomers dole nech beze změny!
export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  return { data, error };
}

// Funkce pro smazání zákazníka podle jeho ID
export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id); // Smaže pouze ten řádek, kde se ID shoduje

  return { error };
}

// Funkce pro načtení jednoho konkrétního zákazníka podle ID
export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single(); // Chceme vrátit jen jeden objekt, ne pole

  return { data, error };
}

// Funkce pro aktualizaci existujícího zákazníka
export async function updateCustomer(
  id: string,
  name: string, 
  ico: string, 
  street: string,
  city: string,
  zip: string,
  country: string,
  email: string,
  phone: string,
  hasServiceContract: boolean
) {
  const { data, error } = await supabase
    .from('customers')
    .update({ 
      name: name, 
      ico: ico, 
      street: street,
      city: city,
      zip: zip,
      country: country,
      email: email,
      phone: phone,
      has_service_contract: hasServiceContract
    })
    .eq('id', id)
    .select();

  return { data, error };
}

// Funkce pro načtení detailu zákazníka včetně všech jeho strojů
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