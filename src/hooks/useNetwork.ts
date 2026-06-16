import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; // Cesta k tvé Supabase

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        // 1. Nejprve rychlý test prohlížeče (pokud máme vypnutou Wi-Fi, rovnou hlásíme offline)
        if (!navigator.onLine) {
          setIsOnline(false);
          return;
        }

        // 2. Tvůj reálný ping do databáze (pokud projde, jsme stoprocentně online)
        const start = Date.now();
        const { error } = await supabase.from('machines').select('id').limit(1);
        const end = Date.now();
        setPing(end - start);
        setIsOnline(!error);
      } catch (error) {
        setIsOnline(false);
      }
    };

    // Zkontrolujeme ihned po načtení
    checkOnlineStatus();
    
    // Poté kontrolujeme každých 5 vteřin (tvůj původní interval)
    const interval = setInterval(checkOnlineStatus, 5000);

    // Přidáme bleskové reakce na vytažení kabelu/vypnutí Wi-Fi
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', handleOffline);

    // Úklid po zavření
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, ping };
}