import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  operatorName: string;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [operatorName, setOperatorName] = useState<string>('Načítám...');
  const [isLoading, setIsLoading] = useState(true);

  // Funkce, která znovu načte jméno/data uživatele (volá se např. po uložení profilu)
  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const nameFromEmail = user.email?.split('@')[0] || 'Neznámý uživatel';
      setOperatorName(user.user_metadata?.name || nameFromEmail);
    } else {
      setUser(null);
      setOperatorName('Neznámý uživatel');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Prvotní načtení
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const nameFromEmail = session.user.email?.split('@')[0] || 'Neznámý uživatel';
        setOperatorName(session.user.user_metadata?.name || nameFromEmail);
      }
      setTimeout(() => setIsLoading(false), 800); // Simulace načítání pro zobrazení LoadingScreen
    });

    // Naslouchání na změny auth (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const nameFromEmail = session.user.email?.split('@')[0] || 'Neznámý uživatel';
        setOperatorName(session.user.user_metadata?.name || nameFromEmail);
      } else {
        setUser(null);
        setOperatorName('Neznámý uživatel');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, operatorName, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
