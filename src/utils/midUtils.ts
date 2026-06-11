// src/utils/midUtils.ts

export function calculateMidStatus(machine: any) {
  // Pokud stroj nemá úřední ověření nebo chybí rodný list, pes neštěká
  if (!machine || !machine.is_mid || !machine.mid_initial_verification_date) {
    return null;
  }

  // Bereme datum poslední zkoušky. Pokud ještě nebyla, bereme datum prvotního ověření z výroby.
  const baseDateString = machine.mid_last_verification_date || machine.mid_initial_verification_date;
  const baseDate = new Date(baseDateString);

  // Přičteme přesně 1 rok
  const expirationDate = new Date(baseDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  // Vypočítáme, kolik dní zbývá do expirace
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Vynulujeme hodiny pro přesný výpočet celých dnů
  
  const timeDiff = expirationDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Logika Semaforu
  let colorStatus: 'ok' | 'yellow' | 'orange' | 'red' = 'ok';
  
  if (daysRemaining < 0) colorStatus = 'red';
  else if (daysRemaining <= 30) colorStatus = 'orange';
  else if (daysRemaining <= 60) colorStatus = 'yellow';

  // Pokud zbývá víc než 60 dní, vůbec nic nevracíme (pes spí)
  if (colorStatus === 'ok') return null;

  return {
    expirationDate,
    daysRemaining,
    colorStatus
  };
}