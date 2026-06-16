// src/types/database.ts

export interface Technician {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  ico: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
  has_service_contract: boolean;
  has_comscale: boolean;
  has_vpn: boolean;
  contact_person: string;
  coach: string;
  created_at?: string; // Databáze doplňuje sama
}

export interface Machine {
  id: string;
  customer_id: string;
  model: string;
  serial_number: string;
  status: string;
  supplier?: string;
  is_mid: boolean;
  mid_initial_verification_date?: string;
  mid_last_verification_date?: string;
  has_spare_parts_package: boolean;
  placement_line?: string;
  production_year?: number;
  installation_date?: string;
  warranty_until?: string;
  software_version?: string;
  notes?: string;
  created_at?: string; // Databáze doplňuje sama
}

export interface ServiceLog {
  id: string;
  machine_id: string;
  date: string;
  technician: string;
  intervention_type: string;
  description: string;
  time_spent: number;
  spare_parts?: string; // V databázi to máš uložené jako text (JSON strukturu)
  attachment_url?: string;
  created_at?: string; // Databáze doplňuje sama
}

export interface PlannedVisit {
  id: string;
  customer_id: string;
  visit_date: string;
  note?: string;
  created_at?: string; // Databáze doplňuje sama
}

export interface PlannedVisitMachine {
  visit_id: string;
  machine_id: string;
}