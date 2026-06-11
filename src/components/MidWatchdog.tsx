// src/components/MidWatchdog.tsx
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldX, ShieldCheck } from 'lucide-react';
import { calculateMidStatus } from '../utils/midUtils';

interface MidWatchdogProps {
  machines: any[];
}

export function MidWatchdog({ machines }: MidWatchdogProps) {
  // Proženeme všechny evidované stroje přes náš výpočet a vyfiltrujeme ty ohrožené
  const alerts = machines
    .map(machine => {
      const status = calculateMidStatus(machine);
      return status ? { machine, ...status } : null;
    })
    .filter(Boolean) as any[];

  // Seřadíme je, aby ty nejkritičtější (červené) byly vždy nahoře
  alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Pokud je všechno cajk, modul se na Dashboardu vůbec neukáže
  if (alerts.length === 0) return null;

  // Zjistíme, jestli máme na seznamu alespoň jeden propadlý stroj (červený)
  const hasCritical = alerts.some(a => a.colorStatus === 'red');

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden mb-8 ${hasCritical ? 'border-red-400' : 'border-gray-200'}`}>
      
      {/* HLAVIČKA MODULU (Zčervená, pokud něco hoří) */}
      <div className={`p-6 border-b flex items-center justify-between ${hasCritical ? 'bg-red-600 text-white' : 'bg-red-50/30 border-gray-100'}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${hasCritical ? 'text-white' : 'text-gray-800'}`}>
          <ShieldAlert className={hasCritical ? 'text-white' : 'text-red-500'} size={20} />
          Hlídač metrologie (MID)
        </h2>
        {hasCritical && (
          <span className="bg-white text-red-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Vyžaduje okamžitý zásah
          </span>
        )}
      </div>
      
      <div className="divide-y divide-gray-100">
        {alerts.map((alert, index) => {
          const isCritical = alert.colorStatus === 'red';
          
          return (
            <div key={index} className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCritical ? 'bg-red-50 border-l-4 border-l-red-600' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                
                {/* Dynamické ikony (Červená pulzuje) */}
                {isCritical && <div className="p-3 bg-red-600 text-white rounded-lg shrink-0 shadow-md animate-pulse"><ShieldX size={20} /></div>}
                {alert.colorStatus === 'orange' && <div className="p-3 bg-orange-100 text-orange-600 rounded-lg shrink-0"><ShieldAlert size={20} /></div>}
                {alert.colorStatus === 'yellow' && <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg shrink-0"><ShieldCheck size={20} /></div>}

                <div>
                  <h3 className={`font-bold ${isCritical ? 'text-red-900 text-lg' : 'text-gray-800'}`}>
                    {alert.machine.model} <span className={`${isCritical ? 'text-red-700' : 'text-gray-400'} font-normal text-sm ml-1`}>(S/N: {alert.machine.serial_number})</span>
                  </h3>
                  <p className={`text-sm font-semibold mb-1 ${isCritical ? 'text-red-800' : 'text-gray-600'}`}>
                    {alert.machine.customers?.name || 'Neznámý zákazník'}
                  </p>
                  
                  {/* Textová upozornění s důrazem na červenou */}
                  {isCritical && (
                    <p className="text-xs font-extrabold text-red-600 uppercase tracking-wider mt-1 bg-white inline-block px-2 py-1 rounded border border-red-200 shadow-sm">
                      ⚠️ Propadlo před {Math.abs(alert.daysRemaining)} dny!
                    </p>
                  )}
                  {alert.colorStatus === 'orange' && (
                    <p className="text-xs font-bold text-orange-600">Propadne za {alert.daysRemaining} dní (Kritické)</p>
                  )}
                  {alert.colorStatus === 'yellow' && (
                    <p className="text-xs font-bold text-yellow-600">Propadne za {alert.daysRemaining} dní</p>
                  )}
                </div>
              </div>
              
              {/* Tlačítko se obarví podle závažnosti */}
              <Link 
                to={`/stroje/detail/${alert.machine.id}`}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors text-center shrink-0 ${isCritical ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' : 'text-[#0f2c59] bg-blue-50 hover:bg-blue-100'}`}
              >
                Vyřešit na kartě stroje
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}