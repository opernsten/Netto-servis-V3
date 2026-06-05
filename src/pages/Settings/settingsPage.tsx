import { useState, useEffect } from 'react';
import { Database, Download, Activity, Server, HardDrive, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';

export function SettingsPage() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Funkce pro kontrolu spojení se Supabase
  useEffect(() => {
    async function checkConnection() {
      const start = Date.now();
      // Jednoduchý "ping" do databáze (stáhne jen 1 prázdný záznam na zkoušku)
      const { error } = await supabase.from('customers').select('id').limit(1);
      const end = Date.now();
      
      if (!error) {
        setIsOnline(true);
        setPingTime(end - start);
      } else {
        setIsOnline(false);
      }
    }
    
    checkConnection();
    // Každých 10 sekund ověříme znovu
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Univerzální funkce pro převod dat do Excelu (CSV)
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
      setExportStatus(`Žádná data k exportu pro: ${filename}`);
      return;
    }

    const keys = Object.keys(data[0]);
    // Hlavička s názvy sloupců
    const header = keys.join(';');
    // Samotná data
    const rows = data.map(obj => 
      keys.map(k => {
        let val = obj[k] === null || obj[k] === undefined ? '' : obj[k];
        // Ošetření textů s uvozovkami nebo středníky
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      }).join(';')
    );

    const csvContent = [header, ...rows].join('\n');
    
    // '\uFEFF' je důležité pro Excel, aby správně pochopil UTF-8 diakritiku!
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export zákazníků
  const handleExportCustomers = async () => {
    setExportStatus('Stahuji data zákazníků...');
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      setExportStatus('Chyba exportu: ' + error.message);
    } else {
      exportToCSV(data, 'Netto_Zakaznici');
      setExportStatus('Zákazníci byli úspěšně exportováni.');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  // Export strojů
  const handleExportMachines = async () => {
    setExportStatus('Stahuji data evidovaných strojů...');
    const { data, error } = await supabase.from('machines').select('*, customers(name)');
    if (error) {
      setExportStatus('Chyba exportu: ' + error.message);
    } else {
      // Menší úprava dat, aby bylo v Excelu vidět jméno zákazníka, nejen jeho ID
      const formattedData = data.map(m => ({
        ...m,
        customer_name: m.customers?.name || 'Neznámý',
        customers: undefined // Skryjeme původní vnořený objekt
      }));
      exportToCSV(formattedData, 'Netto_Stroje');
      setExportStatus('Stroje byly úspěšně exportovány.');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="bg-[#0f2c59] p-8 rounded-2xl text-white shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Systémová nastavení</h1>
        <p className="text-blue-200 mt-2">Správa databáze, exporty a diagnostika aplikace Netto Servis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. SYSTÉMOVÉ INFORMACE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Activity className="text-[#0f2c59]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Systémové informace</h2>
          </div>
          <div className="p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Server size={20} />
                <span className="font-medium">Stav databáze (Supabase)</span>
              </div>
              <div className="flex items-center gap-2">
                {isOnline === null ? (
                  <span className="text-gray-400 text-sm font-bold animate-pulse">Ověřuji...</span>
                ) : isOnline ? (
                  <>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{pingTime} ms</span>
                    <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                      <CheckCircle size={16} /> Online
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-lg">
                    <AlertTriangle size={16} /> Offline
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-gray-600">
                <HardDrive size={20} />
                <span className="font-medium">Verze aplikace</span>
              </div>
              <span className="text-[#0f2c59] font-bold">v1.0.1 (BETA)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-600">
                <Database size={20} />
                <span className="font-medium">Lokální úložiště</span>
              </div>
              <span className="text-gray-500 text-sm">Aktivní</span>
            </div>

          </div>
        </div>

        {/* 2. SPRÁVA DAT A EXPORT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Download className="text-[#0f2c59]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Správa dat a Export</h2>
          </div>
          <div className="p-6 space-y-4">
            
            <p className="text-sm text-gray-500 mb-4">
              Stáhněte si kompletní zálohu firemních dat. Soubory se uloží ve formátu CSV, který je možné přímo otevřít v programu Microsoft Excel.
            </p>

            <button 
              onClick={handleExportCustomers}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-4 rounded-xl flex items-center justify-between font-bold transition-all group"
            >
              <span>Exportovat databázi zákazníků</span>
              <Download size={20} className="group-hover:scale-110 transition-transform" />
            </button>

            <button 
              onClick={handleExportMachines}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-4 rounded-xl flex items-center justify-between font-bold transition-all group"
            >
              <span>Exportovat evidenci strojů</span>
              <Download size={20} className="group-hover:scale-110 transition-transform" />
            </button>

            {exportStatus && (
              <div className="mt-4 p-3 bg-gray-800 text-white text-sm font-medium rounded-lg text-center animate-fadeIn">
                {exportStatus}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}