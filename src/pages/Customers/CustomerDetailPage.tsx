import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Server, Edit, Monitor, ShieldCheck, Network, User, Contact, Truck, CalendarClock, AlertTriangle } from 'lucide-react';
import { getCustomerDetail } from '../../services/customerService';
import { getStatusConfig } from '../../utils/statusConfig';

export function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (id) {
        const { data, error } = await getCustomerDetail(id);
        
        // TADY JE TA PAST NA CHYBU
        if (error) {
          console.error("CHYBA SUPABASE:", error);
          alert("Databáze hlásí chybu: " + error.message);
        }
        
        setCustomer(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500 font-medium">Načítám kartu zákazníka...</div>;
  if (!customer) return <div className="p-8 text-red-500 font-medium">Zákazník nenalezen.</div>;

  // Najdeme stroje, které mají nastavené datum údržby, a seřadíme je od nejbližšího
  const plannedMachines = customer.machines
    ?.filter((m: any) => m.next_maintenance_date)
    .sort((a: any, b: any) => new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime()) || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      
      {/* Tlačítka horní navigace */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/zakaznici" className="text-gray-500 hover:text-[#0f2c59] transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Zpět na seznam zákazníků</span>
          <span className="sm:hidden">Zpět</span>
        </Link>
        
        <Link 
          to={`/zakaznici/upravit/${id}`} 
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm shrink-0"
        >
          <Edit size={16} />
          <span className="hidden sm:inline">Upravit údaje</span>
          <span className="sm:hidden">Upravit</span>
        </Link>
      </div>

      {/* HLAVNÍ KARTA ZÁKAZNÍKA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-[#0f2c59] p-8 text-white flex items-start gap-6">
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <Building2 size={40} className="text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight">{customer.name}</h1>
              {customer.has_service_contract && (
                <span className="bg-green-500/20 text-green-300 border border-green-400/30 text-xs uppercase font-bold px-3 py-1 rounded-full">
                  SLA Smlouva
                </span>
              )}
            </div>
            <p className="text-blue-200 font-medium">IČO: {customer.ico || 'Nezadáno'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          {/* Adresa */}
          <div className="flex items-start gap-3">
            <MapPin className="text-gray-400 mt-1" size={20} />
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Sídlo / Provozovna</h3>
              <p className="text-gray-800 font-medium">{customer.street || 'Ulice nezadána'}</p>
              <p className="text-gray-800 font-medium">{customer.zip} {customer.city}</p>
              <p className="text-gray-500 text-sm">{customer.country}</p>
            </div>
          </div>
          
          {/* Kontakt */}
          <div className="space-y-4 border-l-0 md:border-l border-gray-100 md:pl-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Kontaktní údaje</h3>
            {customer.coach && (
              <div className="flex items-center gap-3 text-blue-800 font-bold bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                <Contact className="text-blue-500" size={18} />
                Kouč: {customer.coach}
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-800 font-bold">
              <User className="text-gray-400" size={18} />
              {customer.contact_person || 'Osoba nezadána'}
            </div>
            <div className="flex items-center gap-3 text-gray-800 font-medium">
              <Mail className="text-gray-400" size={18} />
              {customer.email || 'E-mail nezadán'}
            </div>
            <div className="flex items-center gap-3 text-gray-800 font-medium">
              <Phone className="text-gray-400" size={18} />
              {customer.phone || 'Telefon nezadán'}
            </div>
          </div>

          {/* IT a Konektivita */}
          <div className="space-y-4 border-l-0 md:border-l border-gray-100 md:pl-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Network size={16} /> Konektivita & SW
            </h3>
            <div className={`p-2 rounded-lg border flex items-center gap-3 ${customer.has_comscale ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              <Monitor size={16} className={customer.has_comscale ? 'text-blue-600' : 'text-gray-400'} />
              <span className="font-bold text-sm">
                {customer.has_comscale ? 'Využívá ComScale' : 'Bez ComScale'}
              </span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-3 ${customer.has_vpn ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              <ShieldCheck size={16} className={customer.has_vpn ? 'text-green-600' : 'text-gray-400'} />
              <span className="font-bold text-sm">
                {customer.has_vpn ? 'VPN přístup aktivní' : 'Bez VPN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- NOVÉ: PLÁNOVANÉ VÝJEZDY --- */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
          <Truck className="text-orange-500" />
          Plánované výjezdy a údržba
        </h2>
        
        {plannedMachines.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm font-medium">
            Aktuálně není naplánován žádný výjezd k tomuto zákazníkovi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedMachines.map((machine: any) => (
              <Link to={`/stroje/detail/${machine.id}`} key={machine.id} className="bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-orange-500"></div>
                <div>
                  <div className="flex items-center justify-between mb-3 pl-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-800 bg-white px-3 py-1 rounded-lg shadow-sm border border-orange-100">
                      <CalendarClock size={16} className="text-orange-500" />
                      {new Date(machine.next_maintenance_date).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>

                  <div className="bg-white/60 p-3 rounded-lg border border-orange-100 mb-3 ml-2 group-hover:bg-white transition-colors">
                    <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Stroj k údržbě</div>
                    <div className="font-bold text-gray-800 text-base">
                      {machine.model}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      S/N: {machine.serial_number}
                    </div>
                  </div>

                  {machine.next_maintenance_note && (
                    <p className="text-orange-800 text-sm font-medium ml-2 flex items-start gap-2 bg-orange-100/50 p-2 rounded-lg">
                       <span className="mt-0.5"><AlertTriangle size={14} className="text-orange-500"/></span>
                       {machine.next_maintenance_note}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* SEZNAM STROJŮ U TOHOTO ZÁKAZNÍKA */}
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
          <div className="p-8 text-center text-gray-500 font-medium">
            U tohoto zákazníka zatím neevidujeme žádné stroje.
          </div>
        )}
      </div>

    </div>
  );
}