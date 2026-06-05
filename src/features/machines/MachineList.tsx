import { useEffect, useState } from 'react';
import { getMachinesWithCustomers } from '../../services/machineService';
import { Server, CheckCircle, AlertTriangle } from 'lucide-react';

export function MachineList() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Funkce pro načtení dat
  async function loadMachines() {
    setLoading(true);
    const { data } = await getMachinesWithCustomers();
    if (data) {
      setMachines(data);
    }
    setLoading(false);
  }

  // Načteme stroje při prvním zobrazení
  useEffect(() => {
    loadMachines();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-500">Načítám seznam strojů...</div>;
  }

  if (machines.length === 0) {
    return <div className="p-4 text-gray-500">Zatím nejsou evidovány žádné stroje.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-extrabold text-[#0f2c59]">Přehled strojů v terénu</h2>
        <button 
          onClick={loadMachines} 
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Aktualizovat
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">Model (S/N)</th>
              <th className="p-4 font-semibold">Zákazník</th>
              <th className="p-4 font-semibold">Stav</th>
              <th className="p-4 font-semibold text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {machines.map((machine) => (
              <tr key={machine.id} className="hover:bg-blue-50/50 transition-colors">
                
                {/* Sloupec: Model a Sériové číslo */}
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                      <Server size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{machine.model}</div>
                      <div className="text-xs text-gray-500">S/N: {machine.serial_number}</div>
                    </div>
                  </div>
                </td>
                
                {/* Sloupec: Název firmy */}
                <td className="p-4">
                  <div className="font-medium text-gray-700">
                    {/* Zde čteme název z té propojené tabulky customers */}
                    {machine.customers?.name || 'Neznámý zákazník'}
                  </div>
                </td>
                
                {/* Sloupec: Stav stroje */}
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    machine.status === 'OK' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {machine.status === 'OK' ? <CheckCircle size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                    {machine.status}
                  </span>
                </td>
                
                {/* Sloupec: Tlačítko akce */}
                <td className="p-4 text-right">
                  <button className="text-sm font-semibold text-blue-600 hover:underline">
                    Detail
                  </button>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}