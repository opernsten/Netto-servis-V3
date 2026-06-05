import { supabase } from './supabase';

/**
 * Funkce pro přihlášení uživatele pomocí e-mailu a hesla do Supabase Auth.
 */
export async function signInWithEmail(email: string, databasePassword: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: databasePassword,
  });

  return { data, error };
}