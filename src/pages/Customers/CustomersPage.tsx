import { useEffect, useState } from 'react';
// Přidali jsme ikonky pro šipky (ChevronLeft, ChevronRight)
import { Building2, Plus, Trash2, Edit, ChevronRight, Search, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllCustomers, deleteCustomer } from '../../services/customerService';
import { TableSkeleton } from '../../components/ui/Skeleton';
import type { Customer } from '../../types/database';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // NOVÉ STAVY PRO STRÁNKOVÁNÍ
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Zde si můžeš změnit, kolik firem chceš vidět na jedné stránce

  async function loadCustomers() {
    setLoading(true);
    const { data } = await getAllCustomers();
    if (data) {
      setCustomers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // POJISTKA: Když uživatel začne vyhledávat, vrátíme ho vždy na 1. stránku
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`Opravdu chceš smazat zákazníka "${name}"? Tato akce je nevratná.`);
    if (isConfirmed) {
      const { error } = await deleteCustomer(id);
      if (error) {
        alert('Chyba při mazání: ' + error.message);
      } else {
        loadCustomers();
      }
    }
  };

  // 1. KROK: Nejdřív vyfiltrujeme všechny firmy podle hledání
  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.ico && customer.ico.includes(term)) ||
      (customer.city && customer.city.toLowerCase().includes(term))
    );
  });

  // 2. KROK: Výpočet pro stránkování z těch už vyfiltrovaných firem
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Toto je finální pole firem, které se reálně vykreslí na obrazovce (např. položky 0 až 10)
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="p-8">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f2c59]">Správa zákazníků</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={loadCustomers} 
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2"
          >
            Aktualizovat
          </button>
          
          <Link 
            to="/zakaznici/novy" 
            className="bg-[#0f2c59] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#0a1e3f] shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Přidat zákazníka
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800">Seznam firem v databázi</h2>
          
          <div className="relative w-full sm:w-72 tour-step-customer-search">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Hledat firmu, IČO nebo město..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>
        
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="flex flex-col h-full tour-step-customer-table">
            <div className="divide-y divide-gray-100 flex-1">
              {/* TADY JE ZMĚNA: Vykreslujeme už jen 'currentCustomers' (max 10 položek) */}
              {currentCustomers.map((customer) => (
                <div key={customer.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors group">
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        {customer.name}
                        {customer.has_service_contract && (
                          <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">SLA Smlouva</span>
                        )}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:gap-4">
                        <span><strong className="text-gray-600">IČO:</strong> {customer.ico || 'Nezadáno'}</span>
                        <span><strong className="text-gray-600">Město:</strong> {customer.city || 'Nezadáno'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link 
                      to={`/zakaznici/upravit/${customer.id}`} 
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="Upravit"
                    >
                      <Edit size={18} />
                    </Link>
                    
                    <button 
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Smazat"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-2"></div>

                    <Link 
                      to={`/zakaznici/detail/${customer.id}`}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Detail <ChevronRight size={16} />
                    </Link>
                  </div>

                </div>
              ))}
              
              {customers.length === 0 && (
                <div className="p-6 text-gray-500 font-medium">Zatím v databázi nemáte žádné zákazníky.</div>
              )}
              
              {customers.length > 0 && filteredCustomers.length === 0 && (
                <div className="p-6 text-gray-500 font-medium text-center">
                  Žádný zákazník neodpovídá hledanému výrazu "{searchTerm}".
                </div>
              )}
            </div>

            {/* NOVÁ ČÁST: Ovládací panel stránkování */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Zobrazeno <span className="font-semibold text-gray-800">{startIndex + 1}</span> až <span className="font-semibold text-gray-800">{Math.min(endIndex, filteredCustomers.length)}</span> z <span className="font-semibold text-gray-800">{filteredCustomers.length}</span> zákazníků
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