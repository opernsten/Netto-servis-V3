import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Server, Edit, Monitor, ShieldCheck, Network, User, Contact, Truck, CalendarClock, Plus, Trash2, CheckSquare, Compass } from 'lucide-react';
import { getStatusConfig } from '../../utils/statusConfig';
import { getGoogleMapsRouteUrl } from '../../utils/mapUtils';
import { PlannedVisitModal } from '../../features/customers/components/PlannedVisitModal';
import { useCustomerDetail } from '../../features/customers/hooks/useCustomerDetail';
import type { Machine } from '../../types/database';

export function CustomerDetailPage() {
  const { id } = useParams();
  const { customer, plannedVisits, loading, loadData, handleDeleteVisit } = useCustomerDetail(id);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);



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
                      {visit.planned_visit_machines?.map((link) => (
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
              {customer.machines.map((machine: Pick<Machine, 'id' | 'model' | 'serial_number' | 'status'>) => (
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
      <PlannedVisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        customerId={id!} 
        customer={customer} 
        onVisitCreated={loadData} 
      />

    </div>
  );
}