import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Server, AlertTriangle, Activity, ArrowRight, Wrench, PlusCircle, CalendarClock } from 'lucide-react';
import { getAllCustomers } from '../../services/customerService';
import { getMachinesWithCustomers } from '../../services/machineService';

export function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    machines: 0,
    errors: 0,
    maintenance: 0
  });
  
  const [urgentMachines, setUrgentMachines] = useState<any[]>([]);
  // NOVÝ STAV: Sem uložíme seřazené plánované výjezdy
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      
      const { data: customers } = await getAllCustomers();
      const { data: machines } = await getMachinesWithCustomers();
      
      if (customers && machines) {
        const errorMachines = machines.filter(m => m.status === 'Porucha');
        const maintMachines = machines.filter(m => m.status === 'Nutná údržba');
        
        setStats({
          customers: customers.length,
          machines: machines.length,
          errors: errorMachines.length,
          maintenance: maintMachines.length
        });

        // 1. Stroje vyžadující okamžitou pozornost (poruchy)
        setUrgentMachines([...errorMachines, ...maintMachines].slice(0, 5));

        // 2. NOVÉ: Vyfiltrujeme stroje s plánovaným termínem a seřadíme je od nejbližšího
        const planned = machines
          .filter(m => m.next_maintenance_date)
          .sort((a, b) => new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime())
          .slice(0, 5); // Ukážeme max 5 nejbližších výjezdů
          
        setUpcomingMaintenance(planned);
      }
      
      setLoading(false);
    }
    
    loadDashboardData();
  }, []);

  const today = new Date().toLocaleDateString('cs-CZ', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  if (loading) return <div className="p-8 text-gray-500 font-medium">Načítám velín...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. UVÍTACÍ HLAVIČKA */}
      <div className="bg-gradient-to-r from-[#0f2c59] to-blue-900 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            Vítej zpět, O.ERNSTEN!
          </h1>
          <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">
            {today}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/stroje/novy" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 transition-colors flex items-center gap-2 text-sm font-bold">
            <PlusCircle size={18} />
            Nový stroj
          </Link>
          <Link to="/zakaznici/novy" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 transition-colors flex items-center gap-2 text-sm font-bold">
            <Users size={18} />
            Nový zákazník
          </Link>
        </div>
      </div>

      {/* 2. STATISTIKY (KPI Karty) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Zákazníci</p>
            <p className="text-2xl font-extrabold text-gray-800">{stats.customers}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Evidované stroje</p>
            <p className="text-2xl font-extrabold text-gray-800">{stats.machines}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Kritické poruchy</p>
            <p className="text-2xl font-extrabold text-red-600">{stats.errors}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-200 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-2 h-full bg-orange-400"></div>
          <div className="p-4 bg-orange-50 text-orange-500 rounded-xl">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nutná údržba</p>
            <p className="text-2xl font-extrabold text-orange-500">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* 3. MONITORING PLOCHA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEVÝ A STŘEDNÍ SLOUPEC (Zabírá 2/3 šířky) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NOVÝ MODUL: NEJBLIŽŠÍ PLÁNOVANÉ VÝJEZDY */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-orange-50/30 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CalendarClock className="text-orange-500" size={20} />
                Nejbližší plánované výjezdy a údržby
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {upcomingMaintenance.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-medium">
                  Aktuálně nemáš naplánované žádné budoucí servisy.
                </div>
              ) : (
                upcomingMaintenance.map((machine) => (
                  <div key={machine.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Výrazný datumový štítek */}
                      {/* Vypočítáme, jestli už datum propadlo (je menší než dnešek) */}
                        {(() => {
                          const isOverdue = new Date(machine.next_maintenance_date) < new Date(new Date().setHours(0,0,0,0));
                          return (
                            <div className={`${isOverdue ? 'bg-red-100 border-red-200 text-red-700' : 'bg-orange-100 border-orange-200 text-orange-800'} rounded-lg p-2.5 text-center min-w-[90px] font-bold text-sm shadow-sm shrink-0`}>
                              {new Date(machine.next_maintenance_date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                              {isOverdue && <div className="text-[10px] uppercase font-extrabold mt-0.5">Propadlé</div>}
                            </div>
                          );
                        })()}
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {machine.model} <span className="text-gray-400 font-normal text-sm ml-1">S/N: {machine.serial_number}</span>
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">{machine.customers?.name}</p>
                        {machine.next_maintenance_note && (
                          <p className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 mt-1.5 inline-block font-medium">
                            {machine.next_maintenance_note}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link 
                      to={`/stroje/detail/${machine.id}`}
                      className="px-4 py-2 text-sm font-bold text-[#0f2c59] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center shrink-0"
                    >
                      Otevřít kartu
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STROJE V PORUŠE (Původní modul posunutý níže) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-red-500" size={20} />
                Stroje vyžadující okamžitou pozornost (Poruchy)
              </h2>
              <Link to="/stroje" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Všechny stroje <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-50">
              {urgentMachines.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-medium">
                  Všechny stroje jsou aktuálně v pořádku. Skvělá práce!
                </div>
              ) : (
                urgentMachines.map((machine) => (
                  <div key={machine.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${machine.status === 'Porucha' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                      <div>
                        <h3 className="font-bold text-gray-800">{machine.model} <span className="text-gray-400 font-normal text-sm ml-2">S/N: {machine.serial_number}</span></h3>
                        <p className="text-sm text-gray-500">{machine.customers?.name}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/stroje/detail/${machine.id}`}
                      className="px-4 py-2 text-sm font-bold text-[#0f2c59] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Detail
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* PRAVÝ SLOUPEC: RYCHLÁ NAVIGACE (Zabírá 1/3 šířky) */}
        <div className="bg-[#0f2c59] rounded-xl shadow-sm border border-blue-900 p-6 text-white h-fit sticky top-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-blue-800 pb-2">
            <Activity size={20} className="text-blue-400" />
            Rychlé akce
          </h3>
          <div className="space-y-3">
            <Link to="/zakaznici" className="block w-full p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
              <div className="font-bold">Databáze firem</div>
              <div className="text-xs text-blue-300 mt-1">Správa zákazníků a smluv</div>
            </Link>
            <Link to="/stroje" className="block w-full p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
              <div className="font-bold">Evidovaná zařízení</div>
              <div className="text-xs text-blue-300 mt-1">Seznam vah a jejich stavů</div>
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-blue-950/50 rounded-lg border border-blue-900">
            <p className="text-sm text-blue-200">
              <strong>Tip:</strong> Kalendářový přehled řadí výjezdy automaticky od nejbližšího termínu, abyste měli stále přehled o blížících se MID lhůtách.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}