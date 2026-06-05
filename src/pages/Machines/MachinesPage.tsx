import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server, Plus, Trash2, Edit, ChevronRight, Search, ChevronLeft, Filter } from 'lucide-react';
import { getMachinesWithCustomers, deleteMachine } from '../../services/machineService';
import { getStatusConfig } from '../../utils/statusConfig';

export function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stavy pro vyhledávání a filtrování
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'OK', 'V poruše' atd.
  
  // Stavy pro stránkování
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function loadMachines() {
    setLoading(true);
    const { data } = await getMachinesWithCustomers();
    if (data) {
      setMachines(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMachines();
  }, []);

  // Vrácení na první stránku při hledání nebo změně filtru
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (id: string, sn: string) => {
    const isConfirmed = window.confirm(`Opravdu chceš smazat stroj se S/N: ${sn}?`);
    if (isConfirmed) {
      const { error } = await deleteMachine(id);
      if (error) {
        alert('Chyba při mazání: ' + error.message);
      } else {
        loadMachines();
      }
    }
  };

  // 1. KROK: Filtrace (podle textu A ZÁROVEŇ podle stavu)
  const filteredMachines = machines.filter((machine) => {
    const term = searchTerm.toLowerCase();
    
    // Hledání v Modelu, S/N nebo jménu zákazníka
    const matchesSearch = 
      (machine.model && machine.model.toLowerCase().includes(term)) ||
      (machine.serial_number && machine.serial_number.toLowerCase().includes(term)) ||
      (machine.customers?.name && machine.customers.name.toLowerCase().includes(term));
      
    // Hledání podle stavu (pokud je ALL, propustí vše)
    const matchesStatus = statusFilter === 'ALL' || machine.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 2. KROK: Stránkování
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMachines = filteredMachines.slice(startIndex, endIndex);

  return (
    <div className="p-8">
      
      {/* Hlavička */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f2c59]">Správa strojů</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={loadMachines} 
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2"
          >
            Aktualizovat
          </button>
          
          <Link 
            to="/stroje/novy" // Tuto stránku si vytvoříme v dalším kroku
            className="bg-[#0f2c59] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#0a1e3f] shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Přidat stroj
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Ovládací panel s Vyhledávačem a Filtry */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Server className="text-blue-600" />
            Evidovaná zařízení
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            
            {/* Filtr stavu */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 w-full sm:w-48 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="ALL">Všechny stavy</option>
                <option value="OK">Stav: OK</option>
                <option value="Nutná údržba">Nutná údržba</option>
                <option value="Porucha">Porucha</option>
              </select>
            </div>

            {/* Vyhledávač */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Hledat S/N, model nebo firmu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Výpis strojů */}
        {loading ? (
          <div className="p-6 text-gray-500 font-medium">Načítám data...</div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="divide-y divide-gray-100 flex-1">
              {currentMachines.map((machine) => (
                <div key={machine.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors group">
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Server size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 flex items-center gap-3">
                        {machine.model}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                          S/N: <strong>{machine.serial_number}</strong>
                        </span>
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        Zákazník: <strong className="text-gray-700">{machine.customers?.name || 'Neznámý'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Zobrazení stavu */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusConfig(machine?.status).bg} ${getStatusConfig(machine?.status).text} ${getStatusConfig(machine?.status).border}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 shadow-sm ${getStatusConfig(machine?.status).dot}`}></div>
                      {machine?.status || 'Neznámý stav'}
                    </span>

                    {/* Akční tlačítka */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
                      <Link 
                        to={`/stroje/upravit/${machine.id}`} // Připravujeme si odkaz na editaci
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Upravit"
                      >
                        <Edit size={18} />
                      </Link>
                      
                      <button 
                        onClick={() => handleDelete(machine.id, machine.serial_number)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Smazat"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="w-px h-6 bg-gray-200 mx-1"></div>

                      <Link 
                        to={`/stroje/detail/${machine.id}`}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Detail <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
              
              {machines.length === 0 && (
                <div className="p-6 text-gray-500 font-medium">Zatím v databázi nemáte evidované žádné stroje.</div>
              )}
              
              {machines.length > 0 && filteredMachines.length === 0 && (
                <div className="p-6 text-gray-500 font-medium text-center">
                  Žádný stroj neodpovídá hledanému výrazu nebo zvolenému filtru.
                </div>
              )}
            </div>

            {/* Stránkování */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Zobrazeno <span className="font-semibold text-gray-800">{startIndex + 1}</span> až <span className="font-semibold text-gray-800">{Math.min(endIndex, filteredMachines.length)}</span> z <span className="font-semibold text-gray-800">{filteredMachines.length}</span> strojů
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium text-gray-700 px-2">
                    Stránka {currentPage} z {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}