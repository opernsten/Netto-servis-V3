import { createClient } from '@supabase/supabase-js';

// Načtení klíčů z našeho .env souboru
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pojistka, aby nám TypeScript nenadával, pokud by klíče chyběly
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Chybí Supabase klíče v .env souboru!');
}

// Vytvoření a exportování připojení
export const supabase = createClient(supabaseUrl, supabaseAnonKey);