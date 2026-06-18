// src/utils/midUtils.ts

import type { Machine, MidStatus } from '../types/database';

export function calculateMidStatus(machine: Machine): MidStatus | null {
  if (!machine || !machine.is_mid || !machine.mid_initial_verification_date) {
    return null;
  }

  // Přečteme si uživatelské nastavení (pokud není, použijeme výchozí 60 a 30)
  const warningThreshold = parseInt(localStorage.getItem('midWarningDays') || '60', 10);
  const criticalThreshold = parseInt(localStorage.getItem('midCriticalDays') || '30', 10);

  const baseDateString = machine.mid_last_verification_date || machine.mid_initial_verification_date;
  const baseDate = new Date(baseDateString);

  // Přičteme přesně 1 rok
  const expirationDate = new Date(baseDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  // Vypočítáme, kolik dní zbývá do expirace
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  const timeDiff = expirationDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Logika Semaforu podle TVÉHO nastavení
  let colorStatus: 'ok' | 'yellow' | 'orange' | 'red' = 'ok';
  
  if (daysRemaining < 0) colorStatus = 'red';
  else if (daysRemaining <= criticalThreshold) colorStatus = 'orange';
  else if (daysRemaining <= warningThreshold) colorStatus = 'yellow';

  // Pokud je stroj mimo tvůj sledovaný interval, pes spí
  if (colorStatus === 'ok') return null;

  return {
    expirationDate,
    daysRemaining,
    colorStatus
  };
}