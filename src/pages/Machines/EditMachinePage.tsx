import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Server } from 'lucide-react';
import { MachineForm } from '../../features/machines/MachineForm';

export function EditMachinePage() {
  const { id } = useParams();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      
      <div className="mb-6">
        {/* ZMĚNA: Odkaz vede na detail stroje */}
        <Link to={`/stroje/detail/${id}`} className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          Zpět na detail stroje
        </Link>
      </div>
      
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl mb-4 flex items-center gap-3">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
             <Server size={24} />
           </div>
           <div>
             <h1 className="text-2xl font-extrabold text-[#0f2c59]">Úprava zařízení</h1>
             <p className="text-gray-500 text-sm mt-1">Aktualizujte technické údaje stroje.</p>
           </div>
        </div>
        
        <div className="px-6 pb-6">
          <MachineForm machineId={id} />
        </div>
      </div>

    </div>
  );
}