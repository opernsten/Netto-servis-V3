import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Server, Edit, Monitor, ShieldCheck, Network, User, Contact, Truck, CalendarClock, Plus, Trash2, X, CheckSquare, Compass } from 'lucide-react';
import { getCustomerDetail } from '../../services/customerService';
import { createPlannedVisit, getPlannedVisitsForCustomer, deletePlannedVisit } from '../../services/visitService';
import { getStatusConfig } from '../../utils/statusConfig';
import { getGoogleMapsRouteUrl } from '../../utils/mapUtils'; // <-- TADY IMPORTUJEME NAŠI NOVOU FUNKCI
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [plannedVisits, setPlannedVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitNote, setVisitNote] = useState('');
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [modalStatus, setModalStatus] = useState<string | null>(null);

  async function loadData() {
    if (id) {
      setLoading(true);
      const { data: custData } = await getCustomerDetail(id);
      setCustomer(custData);
      
      const { data: visitsData } = await getPlannedVisitsForCustomer(id);
      if (visitsData) setPlannedVisits(visitsData);
      
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const toggleMachineSelection = (machineId: string) => {
    if (selectedMachineIds.includes(machineId)) {
      setSelectedMachineIds(selectedMachineIds.filter(id => id !== machineId));
    } else {
      setSelectedMachineIds([...selectedMachineIds, machineId]);
    }
  };

  const handleSaveVisit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (selectedMachineIds.length === 0) {
      setModalStatus('Musíš vybrat alespoň jeden stroj pro výjezd!');
      return;
    }
    
    setModalStatus('Ukládám výjezd...');
    const { error } = await createPlannedVisit(id, visitDate, visitNote, selectedMachineIds);
    
    if (error) {
      setModalStatus('Chyba: ' + error.message);
    } else {
      setIsVisitModalOpen(false);
      setVisitDate('');
      setVisitNote('');
      setSelectedMachineIds([]);
      setModalStatus(null);
      loadData(); 
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (window.confirm('Opravdu chcete tento výjezd kompletně zrušit?')) {
      await deletePlannedVisit(visitId);
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Načítám kartu zákazníka...</div>;
  if (!customer) return <div className="p-8 text-red-500 font-medium">Zákazník nenalezen.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      
      <div className="flex items-center justify-between mb-6">
        <Link to="/zakaznici" className="text-gray-500 hover:text-[#0f2c59] transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Zpět na seznam zákazníků</span>
        </Link>
        <Link 
          to={`/zakaznici/upravit/${id}`} 
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm shrink-0"
        >
          <Edit size={16} />
          <span>Upravit údaje</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-[#0f2c59] p-8 text-white flex items-start gap-6">
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <Building2 size={40} className="text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight">{customer.name}</h1>
              {customer.has_service_contract && (
                <span className="bg-green-500/20 text-green-300 border border-green-400/30 text-xs uppercase font-bold px-3 py-1 rounded-full">SLA Smlouva</span>
              )}
            </div>
            <p className="text-blue-200 font-medium">IČO: {customer.ico || 'Nezadáno'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          {/* Adresa + TLAČÍTKO PRO NAVIGACI */}
          <div className="flex items-start gap-3 flex-col justify-between h-full">
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1 shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Sídlo / Provozovna</h3>
                <p className="text-gray-800 font-bold text-base">{customer.street || 'Ulice nezadána'}</p>
                <p className="text-gray-800 font-semibold">{customer.zip} {customer.city}</p>
                <p className="text-gray-500 text-sm">{customer.country}</p>
              </div>
            </div>
            
            {/* VOLÁNÍ TÉ NAŠÍ NOVÉ FUNKCE */}
            <a 
              href={getGoogleMapsRouteUrl(customer)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs p-3 rounded-xl border border-blue-200 flex items-center justify-center gap-2 transition-all shadow-sm group"
            >
              <Compass size={16} className="group-hover:rotate-45 transition-transform text-blue-600 animate-pulse" />
              Spustit navigaci z firmy
            </a>
          </div>

          <div className="space-y-4 border-l-0 md:border-l border-gray-100 md:pl-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Kontaktní údaje</h3>
            {customer.coach && (
              <div className="flex items-center gap-3 text-blue-800 font-bold bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                <Contact className="text-blue-500" size={18} /> Kouč: {customer.coach}
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-800 font-bold"><User className="text-gray-400" size={18} /> {customer.contact_person || 'Osoba nezadána'}</div>
            <div className="flex items-center gap-3 text-gray-800 font-medium"><Mail className="text-gray-400" size={18} /> {customer.email || 'E-mail nezadán'}</div>
            <div className="flex items-center gap-3 text-gray-800 font-medium"><Phone className="text-gray-400" size={18} /> {customer.phone || 'Telefon nezadán'}</div>
          </div>

          <div className="space-y-4 border-l-0 md:border-l border-gray-100 md:pl-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Network size={16} /> Konektivita & SW</h3>
            <div className={`p-2 rounded-lg border flex items-center gap-3 ${customer.has_comscale ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              <Monitor size={16} className={customer.has_comscale ? 'text-blue-600' : 'text-gray-400'} />
              <span className="font-bold text-sm">{customer.has_comscale ? 'Využívá ComScale' : 'Bez ComScale'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-3 ${customer.has_vpn ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              <ShieldCheck size={16} className={customer.has_vpn ? 'text-green-600' : 'text-gray-400'} />
              <span className="font-bold text-sm">{customer.has_vpn ? 'VPN přístup aktivní' : 'Bez VPN'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PLÁNOVANÉ VÝJEZDY */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Truck className="text-orange-500" />
            Plánované výjezdy
          </h2>
          <button 
            onClick={() => setIsVisitModalOpen(true)}
            className="bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus size={16} /> Nový výjezd
          </button>
        </div>
        
        {plannedVisits.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm font-medium">
            Aktuálně není naplánován žádný výjezd k tomuto zákazníkovi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedVisits.map((visit) => (
              <div key={visit.id} className="bg-white border-2 border-orange-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-orange-500"></div>
                <div>
                  <div className="flex items-start justify-between mb-4 pl-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-800 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                        <CalendarClock size={16} className="text-orange-500" />
                        {new Date(visit.visit_date).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteVisit(visit.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Zrušit výjezd">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {visit.note && (
                    <p className="text-gray-700 text-sm font-medium ml-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                       {visit.note}
                    </p>
                  )}

                  <div className="ml-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stroje k obsloužení ({visit.planned_visit_machines?.length || 0})</h4>
                    <div className="space-y-1.5">
                      {visit.planned_visit_machines?.map((link: any) => (
                        <Link to={`/stroje/detail/${link.machine.id}`} key={link.machine.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-colors">
                          <CheckSquare size={14} className="text-green-500" />
                          <span className="font-bold text-sm text-[#0f2c59] group-hover:text-blue-600 transition-colors">{link.machine.model}</span>
                          <span className="text-xs text-gray-400">({link.machine.serial_number})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEZNAM STROJŮ */}
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
        <Server className="text-blue-600" />
        Evidované stroje
      </h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {customer.machines && customer.machines.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {customer.machines.map((machine: any) => (
              <Link to={`/stroje/detail/${machine.id}`} key={machine.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors block">
                <div>
                  <div className="font-bold text-gray-800 text-lg">{machine.model}</div>
                  <div className="text-sm text-gray-500">S/N: {machine.serial_number}</div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusConfig(machine.status).bg} ${getStatusConfig(machine.status).text} ${getStatusConfig(machine.status).border}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusConfig(machine.status).dot}`}></div>
                  {machine.status || 'Neznámý stav'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-medium">U tohoto zákazníka zatím neevidujeme žádné stroje.</div>
        )}
      </div>

      {/* MODAL PRO VÝJEZDY */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0f2c59] p-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold flex items-center gap-2">
                <Truck size={20} className="text-orange-400" />
                Nový plánovaný výjezd
              </h3>
              <button onClick={() => setIsVisitModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datum výjezdu *</label>
                <Input type="date" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cíl výjezdu / Poznámka</label>
                <textarea
                  placeholder="např. Hromadná kalibrace, výměny senzorů..."
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckSquare size={16} /> Zařízení k údržbě (Vyberte 1 a více) *
                </label>
                
                {customer.machines && customer.machines.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {customer.machines.map((machine: any) => (
                      <label key={machine.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMachineIds.includes(machine.id) 
                          ? 'bg-blue-50 border-blue-400 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                          checked={selectedMachineIds.includes(machine.id)}
                          onChange={() => toggleMachineSelection(machine.id)}
                        />
                        <div className="ml-3">
                          <div className={`font-bold text-sm ${selectedMachineIds.includes(machine.id) ? 'text-blue-800' : 'text-gray-800'}`}>
                            {machine.model}
                          </div>
                          <div className="text-xs text-gray-500">S/N: {machine.serial_number}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-lg">Zákazník nemá evidované žádné stroje.</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
              <Button type="button" onClick={handleSaveVisit} className="flex-1">Uložit výjezd</Button>
              <button type="button" onClick={() => setIsVisitModalOpen(false)} className="px-6 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg transition-colors">
                Zrušit
              </button>
            </div>
            
            {modalStatus && <div className="p-3 bg-red-50 text-sm font-semibold text-red-600 text-center border-t border-red-100">{modalStatus}</div>}
          </div>
        </div>
      )}

    </div>
  );
}