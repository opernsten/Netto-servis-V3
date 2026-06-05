import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Users, Clock, FileText, Activity, Plus, Package, Image } from 'lucide-react';
import { getLogsForMachine, deleteServiceLog } from '../../services/serviceLogService';
import { getMachineById } from '../../services/machineService';

export function ServiceHistoryPage() {
  const { id } = useParams();
  const [logs, setLogs] = useState<any[]>([]);
  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (id) {
      setLoading(true);
      const { data: logsData } = await getLogsForMachine(id);
      const { data: machineData } = await getMachineById(id);
      if (logsData) setLogs(logsData);
      if (machineData) setMachine(machineData);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeleteLog = async (logId: string) => {
    if (window.confirm('Opravdu chceš tento servisní záznam smazat?')) {
      await deleteServiceLog(logId);
      loadData();
    }
  };

  if (loading) return <div className="p-8 font-medium text-gray-500">Načítám historii servisu...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      
      <div className="flex justify-between items-center mb-6">
        <Link to={`/stroje/detail/${id}`} className="text-gray-500 hover:text-[#0f2c59] transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          Zpět na kartu stroje
        </Link>
        <Link to={`/stroje/${id}/servis/novy`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
          <Plus size={16} />
          Přidat záznam
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f2c59]">Servisní historie</h1>
        {machine && <p className="text-gray-500 mt-2 font-medium">Stroj: {machine.model} (S/N: {machine.serial_number})</p>}
      </div>

      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <Activity size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Zatím nebyl evidován žádný servisní zásah.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group">
              <button 
                onClick={() => handleDeleteLog(log.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                title="Smazat záznam"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex flex-col sm:flex-row gap-6">
                
                {/* LEVÝ SLOUPEC: Kdo, kdy a typ práce */}
                <div className="sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-100 pb-4 sm:pb-0 pr-4">
                  <div className="font-bold text-xl text-gray-800 mb-2">
                    {new Date(log.date).toLocaleDateString('cs-CZ')}
                  </div>
                  
                  {/* Druhy práce (může jich být více, jsou oddělené čárkou) */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {log.intervention_type.split(', ').map((type: string, index: number) => (
                      <span key={index} className="inline-block px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <strong>{log.technician}</strong>
                    </div>
                    {log.time_spent && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400 shrink-0" />
                        {log.time_spent} hodin
                      </div>
                    )}
                  </div>
                </div>
                
                {/* PRAVÝ SLOUPEC: Popis a Náhradní díly */}
                <div className="sm:w-2/3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} /> Popis provedené práce
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed mb-4">
                    {log.description}
                  </p>

                  {/* Vykreslení náhradních dílů, pokud existují a nejsou prázdné */}
                  {log.spare_parts && log.spare_parts.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package size={14} /> Spotřebovaný materiál
                      </h4>
                      <div className="space-y-2">
                        {log.spare_parts.map((part: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200 border-dashed pb-1 last:border-0 last:pb-0">
                            <span className="font-semibold text-gray-700">{part.article}</span>
                            <span className="text-gray-600 font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                              {part.quantity} ks
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vykreslení přílohy */}
                  {log.attachment_url && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Image size={14} /> Fotodokumentace
                      </h4>
                      <a href={log.attachment_url} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-1/2 overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:opacity-90 transition-opacity">
                        <img 
                          src={log.attachment_url} 
                          alt="Příloha servisu" 
                          className="w-full h-auto object-cover"
                          onError={(e) => {
                            // Pokud to není obrázek (třeba PDF), zobrazíme jen odkaz
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement?.classList.add('p-4', 'bg-white', 'text-blue-600', 'font-bold', 'text-center');
                            (e.target as HTMLImageElement).parentElement!.innerHTML = 'Otevřít přiložený soubor';
                          }}
                        />
                      </a>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}