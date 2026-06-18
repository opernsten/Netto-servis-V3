import { supabase } from './supabase';
import type { ServiceLog, SparePart } from '../types/database';

// NOVÁ FUNKCE: Nahrání souboru do Supabase Storage
export async function uploadAttachment(file: File) {
  // Vytvoříme unikátní název souboru, ať se nám nepřepisují (např. 167890123-fotka.jpg)
  const fileName = `${Date.now()}-${file.name}`;
  
  // Nahrajeme soubor do bucketu 'service-attachments'
  const { error } = await supabase.storage
    .from('service-attachments')
    .upload(fileName, file);

  if (error) return { url: null, error };

  // Získáme veřejnou URL adresu nahraného souboru
  const { data: publicUrlData } = supabase.storage
    .from('service-attachments')
    .getPublicUrl(fileName);

  return { url: publicUrlData.publicUrl, error: null };
}

// UPRAVENÁ FUNKCE: Přidán parametr pro URL přílohy
export async function createServiceLog(
  machineId: string,
  date: string,
  technician: string,
  interventionType: string,
  description: string,
  timeSpent: string,
  spareParts: SparePart[],
  attachmentUrl: string | null // NOVÉ
) {
  const parsedTime = timeSpent ? parseFloat(timeSpent) : null;

  const { data, error } = await supabase
    .from('service_logs')
    .insert([
      { 
        machine_id: machineId,
        date: date,
        technician: technician,
        intervention_type: interventionType,
        description: description,
        time_spent: parsedTime,
        spare_parts: spareParts,
        attachment_url: attachmentUrl // NOVÉ
      }
    ])
    .select();

  return { data, error };
}

export async function getLogsForMachine(machineId: string) {
  const { data, error } = await supabase
    .from('service_logs')
    .select('*')
    .eq('machine_id', machineId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  return { data: data as ServiceLog[] | null, error };
}

export async function deleteServiceLog(id: string) {
  const { error } = await supabase
    .from('service_logs')
    .delete()
    .eq('id', id);

  return { error };
}