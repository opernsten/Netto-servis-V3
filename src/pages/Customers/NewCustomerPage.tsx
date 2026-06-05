import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CustomerForm } from '../../features/customers/CustomerForm';

export function NewCustomerPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      
      {/* Tlačítko zpět */}
      <div className="mb-6">
        <Link to="/zakaznici" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          Zpět na seznam zákazníků
        </Link>
      </div>
      
      {/* Kontejner pro formulář */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl mb-4">
           <h1 className="text-2xl font-extrabold text-[#0f2c59]">Založit nového zákazníka</h1>
           <p className="text-gray-500 text-sm mt-1">Vyplňte základní údaje. (Tento formulář budeme dále rozšiřovat)</p>
        </div>
        
        {/* Zde vkládáme naši existující komponentu */}
        <div className="px-6 pb-6">
          <CustomerForm />
        </div>
      </div>

    </div>
  );
}