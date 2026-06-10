import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Server, Building2, ShieldCheck, Wrench, Cpu, Calendar, Plus, Edit } from 'lucide-react';
import { getMachineDetail } from '../../services/machineService';
import { getStatusConfig } from '../../utils/statusConfig';

export function MachineDetailPage() {
  const { id } = useParams();
  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (id) {
      setLoading(true);
      const { data } = await getMachineDetail(id);
      setMachine(data);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500 font-medium">Načítám technickou kartu...</div>;
  if (!machine) return <div className="p-8 text-red-500 font-medium">Zařízení nenalezeno.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      
      {/* HORNÍ NAVIGACE */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/stroje" className="text-gray-500 hover:text-[#0f2c59] transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Zpět na přehled strojů</span>
          <span className="sm:hidden">Zpět</span>
        </Link>
        
        {/* TLAČÍTKO PRO ÚPRAVU ZCELA VPRAVO */}
        <Link 
          to={`/stroje/upravit/${id}`} 
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm shrink-0"
        >
          <Edit size={16} />
          <span className="hidden sm:inline">Upravit údaje stroje</span>
          <span className="sm:hidden">Upravit</span>
        </Link>
      </div>

      {/* HLAVNÍ HLAVIČKA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-[#0f2c59] p-8 text-white flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Server size={40} className="text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{machine.model}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusConfig(machine?.status).bg} ${getStatusConfig(machine?.status).text} ${getStatusConfig(machine?.status).border}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 shadow-sm ${getStatusConfig(machine?.status).dot}`}></div>
                  {machine?.status || 'Neznámý stav'}
                </span>
              </div>
              <p className="text-blue-200 font-medium text-lg tracking-wide">S/N: {machine.serial_number}</p>
            </div>
          </div>
          
          <div className="text-right hidden md:block">
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-1">Zákazník</p>
            <p className="text-white font-bold text-xl flex items-center justify-end gap-2">
              <Building2 size={20} />
              {machine.customers?.name || 'Neznámý'}
            </p>
          </div>
        </div>
        
        {/* TECHNICKÉ BOXY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-200">
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={16} /> Umístění a provoz
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Linka:</span>
                <span className="font-semibold text-gray-800">{machine.placement_line || 'Neurčeno'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Instalace:</span>
                <span className="font-semibold text-gray-800">{machine.installation_date ? new Date(machine.installation_date).toLocaleDateString('cs-CZ') : 'Nezadáno'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Záruka do:</span>
                <span className="font-semibold text-gray-800">{machine.warranty_until ? new Date(machine.warranty_until).toLocaleDateString('cs-CZ') : 'Nezadáno'}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu size={16} /> Specifikace
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Dodavatel:</span>
                <span className="font-semibold text-gray-800">{machine.supplier || 'Nezadáno'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Rok výroby:</span>
                <span className="font-semibold text-gray-800">{machine.production_year || 'Nezadáno'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Verze SW:</span>
                <span className="font-semibold text-gray-800">{machine.software_version || 'Nezadáno'}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck size={16} /> Metrologie & Díly
            </h3>
            <div className="space-y-4">
              <div className={`p-3 rounded-lg border flex items-start gap-3 ${machine.is_mid ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                <ShieldCheck size={20} className={machine.is_mid ? 'text-blue-600' : 'text-gray-400'} />
                <div>
                  <div className="font-bold text-sm">{machine.is_mid ? 'MID Zařízení' : 'Bez úředního ověření'}</div>
                  {machine.is_mid && machine.mid_initial_verification_date && (
                    <div className="text-xs mt-1 opacity-80 font-medium">Prvotní ověření: {new Date(machine.mid_initial_verification_date).toLocaleDateString('cs-CZ')}</div>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${machine.has_spare_parts_package ? 'bg-green-50 border-green-100 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                <Wrench size={20} className={machine.has_spare_parts_package ? 'text-green-600' : 'text-gray-400'} />
                <div className="font-bold text-sm">
                  {machine.has_spare_parts_package ? 'Spack k dispozici' : 'Bez Spacku'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POZNÁMKY KE STROJI */}
        {machine.notes && (
          <div className="p-6 border-t border-gray-200 bg-yellow-50/50">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Doplňující poznámky</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{machine.notes}</p>
          </div>
        )}
      </div>

      {/* --- AKČNÍ TLAČÍTKA SERVISU --- */}
      <h2 className="text-xl font-extrabold text-[#0f2c59] mb-4">Servis a údržba</h2>
      <div className="flex flex-col sm:flex-row gap-6">
        <Link 
          to={`/stroje/${id}/servis`} 
          className="flex-1 bg-white border-2 border-[#0f2c59] text-[#0f2c59] rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors group"
        >
          <Calendar size={40} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl">Detail servisu (Historie)</span>
        </Link>
        <Link 
          to={`/stroje/${id}/servis/novy`} 
          className="flex-1 bg-[#0f2c59] text-white rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-[#0a1e3f] shadow-md transition-all group"
        >
          <Plus size={40} className="group-hover:scale-110 transition-transform text-blue-400" />
          <span className="font-bold text-xl">Přidat nový záznam</span>
        </Link>
      </div>

    </div>
  );
}