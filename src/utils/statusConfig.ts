// src/utils/statusConfig.ts

export const MACHINE_STATUSES = [
  { id: 'OK', label: 'OK (V provozu)', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  { id: 'Nutná údržba', label: 'Nutná údržba', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  { id: 'Porucha', label: 'Porucha (Mimo provoz)', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  { id: 'Čeká na díl', label: 'Čeká na náhradní díl', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  { id: 'Vyřazeno', label: 'Vyřazeno z evidence', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' }
];

// Když funkci nedáš nic (nebo něco co nezná), vrátí jako pojistku šedou (Vyřazeno/Neznámo)
export const getStatusConfig = (statusId?: string | null) => {
  return MACHINE_STATUSES.find(s => s.id === statusId) || MACHINE_STATUSES[4]; 
};
