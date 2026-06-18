import { useState, useEffect } from 'react';
import { Database, Download, Activity, Server, HardDrive, CheckCircle, AlertTriangle, BellRing, Save } from 'lucide-react';
import { supabase } from '../../services/supabase';
import packageInfo from '../../../package.json';
import { useNetwork } from '../../hooks/useNetwork';

export function SettingsPage() {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const { isOnline, ping } = useNetwork();

  // Stavy pro Hlídacího psa
  const [warningDays, setWarningDays] = useState<number>(60);
  const [criticalDays, setCriticalDays] = useState<number>(30);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {

    // 2. Načtení uloženého nastavení pro Hlídacího psa z lokální paměti
    const savedWarning = localStorage.getItem('midWarningDays');
    const savedCritical = localStorage.getItem('midCriticalDays');
    
    if (savedWarning) setWarningDays(parseInt(savedWarning, 10));
    if (savedCritical) setCriticalDays(parseInt(savedCritical, 10));

  }, []);

  // Uložení nastavení Hlídacího psa
  const handleSaveMidSettings = () => {
    if (criticalDays >= warningDays) {
      setSaveStatus('Chyba: Kritický čas musí být menší než čas varování!');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    localStorage.setItem('midWarningDays', warningDays.toString());
    localStorage.setItem('midCriticalDays', criticalDays.toString());
    
    setSaveStatus('Nastavení psa bylo úspěšně uloženo!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Univerzální funkce pro export CSV
  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data || !data.length) {
      setExportStatus(`Žádná data k exportu pro: ${filename}`);
      return;
    }

    const keys = Object.keys(data[0]);
    const header = keys.join(';');
    const rows = data.map(obj => 
      keys.map(k => {
        let val = obj[k] === null || obj[k] === undefined ? '' : obj[k];
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      }).join(';')
    );

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCustomers = async () => {
    setExportStatus('Stahuji data zákazníků...');
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      setExportStatus('Chyba exportu: ' + error.message);
    } else {
      exportToCSV(data, 'Netto_Zakaznici');
      setExportStatus('Zákazníci exportováni.');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleExportMachines = async () => {
    setExportStatus('Stahuji data evidovaných strojů...');
    const { data, error } = await supabase.from('machines').select('*, customers(name)');
    if (error) {
      setExportStatus('Chyba exportu: ' + error.message);
    } else {
      const formattedData = data.map(m => ({
        ...m,
        customer_name: m.customers?.name || 'Neznámý',
        customers: undefined
      }));
      exportToCSV(formattedData, 'Netto_Stroje');
      setExportStatus('Stroje exportovány.');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="bg-[#0f2c59] p-8 rounded-2xl text-white shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Systémová nastavení</h1>
        <p className="text-blue-200 mt-2">Správa databáze, exporty a personalizace aplikace Netto Servis.</p>
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
                <span className="font-medium">Stav databáze</span>
              </div>
              <div className="flex items-center gap-2">
                {isOnline === null ? (
                  <span className="text-gray-400 text-sm font-bold animate-pulse">Ověřuji...</span>
                ) : isOnline ? (
                  <>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{ping} ms</span>
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
              <span className="text-[#0f2c59] font-bold">v{packageInfo.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-600">
                <Database size={20} />
                <span className="font-medium">Lokální úložiště</span>
              </div>
              <span className="text-green-600 text-sm font-bold">Aktivní</span>
            </div>
          </div>
        </div>

        {/* 2. KALIBRACE HLÍDACÍHO PSA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-orange-50 flex items-center gap-3">
            <BellRing className="text-orange-600" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Kalibrace Hlídacího psa</h2>
          </div>
          <div className="p-6 space-y-5">
            
            <p className="text-sm text-gray-500">
              Nastavte si, s jakým předstihem vás má systém upozorňovat na propadající MID ověření u zákazníků.
            </p>

            <div>
              <label className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                <span>Žluté varování (Upozornění)</span>
                <span className="text-yellow-600">{warningDays} dní</span>
              </label>
              <input 
                type="range" 
                min="30" max="120" step="5"
                value={warningDays}
                onChange={(e) => setWarningDays(parseInt(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                <span>Oranžové varování (Kritické)</span>
                <span className="text-orange-600">{criticalDays} dní</span>
              </label>
              <input 
                type="range" 
                min="7" max="60" step="1"
                value={criticalDays}
                onChange={(e) => setCriticalDays(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <button 
              onClick={handleSaveMidSettings}
              className="w-full bg-[#0f2c59] hover:bg-[#0a1e3f] text-white p-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-sm"
            >
              <Save size={18} /> Uložit kalibraci
            </button>

            {saveStatus && (
              <div className={`p-3 text-sm font-medium rounded-lg text-center animate-fadeIn ${saveStatus.includes('Chyba') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>

        {/* 3. SPRÁVA DAT A EXPORT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Download className="text-[#0f2c59]" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Správa dat a Export</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Stáhněte si kompletní zálohu firemních dat. Soubory se uloží ve formátu CSV, který je možné přímo otevřít v Excelu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleExportCustomers}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-4 rounded-xl flex items-center justify-between font-bold transition-all group"
              >
                <span>Exportovat databázi zákazníků</span>
                <Download size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              <button 
                onClick={handleExportMachines}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-4 rounded-xl flex items-center justify-between font-bold transition-all group"
              >
                <span>Exportovat evidenci strojů</span>
                <Download size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {exportStatus && (
              <div className="mt-4 p-3 bg-gray-800 text-white text-sm font-medium rounded-lg text-center animate-fadeIn max-w-md mx-auto">
                {exportStatus}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}