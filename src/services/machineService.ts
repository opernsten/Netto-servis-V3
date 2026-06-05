import { supabase } from './supabase';

// Funkce pro načtení seznamu zákazníků (pro roletku)
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name')
    .order('name'); // Seřadí firmy podle abecedy

  return { data, error };
}

// Funkce pro uložení nového stroje
export async function createMachine(
  customerId: string, 
  model: string, 
  serialNumber: string,
  status: string,
  installationDate: string | null,
  warrantyUntil: string | null,
  softwareVersion: string,
  notes: string,
  supplier: string,
  isMid: boolean,
  midInitialVerificationDate: string | null,
  hasSparePartsPackage: boolean,
  placementLine: string,
  productionYear: number | null
) {
  const { data, error } = await supabase
    .from('machines')
    .insert([
      { 
        customer_id: customerId, 
        model: model, 
        serial_number: serialNumber,
        status: status,
        installation_date: installationDate || null,
        warranty_until: warrantyUntil || null,
        software_version: softwareVersion,
        notes: notes,
        supplier: supplier,
        is_mid: isMid,
        mid_initial_verification_date: midInitialVerificationDate || null,
        has_spare_parts_package: hasSparePartsPackage,
        placement_line: placementLine,
        production_year: productionYear
      }
    ])
    .select();

  return { data, error };
}

export async function getMachineById(id: string) {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// ZBRUSU NOVÁ: Aktualizace stroje
export async function updateMachine(
  id: string,
  customerId: string, 
  model: string, 
  serialNumber: string,
  status: string,
  installationDate: string | null,
  warrantyUntil: string | null,
  softwareVersion: string,
  notes: string,
  supplier: string,
  isMid: boolean,
  midInitialVerificationDate: string | null,
  hasSparePartsPackage: boolean,
  placementLine: string,
  productionYear: number | null
) {
  const { data, error } = await supabase
    .from('machines')
    .update({ 
        customer_id: customerId, 
        model: model, 
        serial_number: serialNumber,
        status: status,
        installation_date: installationDate || null,
        warranty_until: warrantyUntil || null,
        software_version: softwareVersion,
        notes: notes,
        supplier: supplier,
        is_mid: isMid,
        mid_initial_verification_date: midInitialVerificationDate || null,
        has_spare_parts_package: hasSparePartsPackage,
        placement_line: placementLine,
        production_year: productionYear
    })
    .eq('id', id)
    .select();

  return { data, error };
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
    .order('created_at', { ascending: false }); // Nejnovější přidáme nahoru

  return { data, error };
}

// Funkce pro smazání stroje podle jeho ID
export async function deleteMachine(id: string) {
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id);

  return { error };
}

// Funkce pro načtení kompletního detailu stroje včetně jména zákazníka
export async function getMachineDetail(id: string) {
  const { data, error } = await supabase
    .from('machines')
    .select(`
      *,
      customers (
        name,
        city
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
}

// Funkce pro rychlé nastavení nebo zrušení plánované údržby
export async function updateMachineMaintenance(id: string, date: string | null, note: string | null) {
  const { data, error } = await supabase
    .from('machines')
    .update({ 
      next_maintenance_date: date,
      next_maintenance_note: note
    })
    .eq('id', id)
    .select();

  return { data, error };
}