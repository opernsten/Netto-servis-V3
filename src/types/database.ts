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

// ============================
// Kompozitní typy pro Supabase relace
// ============================

/** Stroj s názvem zákazníka (z getMachinesWithCustomers) */
export type MachineWithCustomer = Machine & {
  customers: Pick<Customer, 'name'> | null;
};

/** Detail stroje včetně zákazníka a plánovaných výjezdů (z getMachineDetail) */
export type MachineDetail = Machine & {
  customers: Pick<Customer, 'id' | 'name' | 'city'> | null;
  planned_visit_machines: {
    visit: Pick<PlannedVisit, 'id' | 'visit_date' | 'note'>;
  }[];
};

/** Zákazník s jeho stroji (z getCustomerDetail) */
export type CustomerWithMachines = Customer & {
  machines: Pick<Machine, 'id' | 'model' | 'serial_number' | 'status'>[];
};

/** Plánovaný výjezd s detaily pro Dashboard */
export type PlannedVisitWithDetails = PlannedVisit & {
  customers: Pick<Customer, 'name'> | null;
  planned_visit_machines: {
    machine_id: string;
  }[];
};

/** Plánovaný výjezd pro zákaznický detail (včetně info o strojích) */
export type PlannedVisitForCustomer = Pick<PlannedVisit, 'id' | 'visit_date' | 'note'> & {
  planned_visit_machines: {
    machine: Pick<Machine, 'id' | 'model' | 'serial_number'>;
  }[];
};

/** Náhradní díl použitý při servisu */
export interface SparePart {
  article: string;
  quantity: number;
}

/** Výsledek výpočtu MID expirace */
export interface MidStatus {
  expirationDate: Date;
  daysRemaining: number;
  colorStatus: 'ok' | 'yellow' | 'orange' | 'red';
}

/** MID upozornění se strojem (pro MidWatchdog) */
export type MidAlert = MidStatus & {
  machine: MachineWithCustomer;
};