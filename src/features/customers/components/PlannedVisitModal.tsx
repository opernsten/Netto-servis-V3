import { useState, type FormEvent } from 'react';
import { Truck, X, CheckSquare } from 'lucide-react';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { createPlannedVisit } from '../../../services/visitService';
import type { Machine, CustomerWithMachines } from '../../../types/database';

interface PlannedVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customer: Pick<CustomerWithMachines, 'machines'> | null;
  onVisitCreated: () => void;
}

export function PlannedVisitModal({ isOpen, onClose, customerId, customer, onVisitCreated }: PlannedVisitModalProps) {
  const [visitDate, setVisitDate] = useState('');
  const [visitNote, setVisitNote] = useState('');
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [modalStatus, setModalStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMachineSelection = (machineId: string) => {
    if (selectedMachineIds.includes(machineId)) {
      setSelectedMachineIds(selectedMachineIds.filter(id => id !== machineId));
    } else {
      setSelectedMachineIds([...selectedMachineIds, machineId]);
    }
  };

  const handleSaveVisit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    if (selectedMachineIds.length === 0) {
      setModalStatus('Musíš vybrat alespoň jeden stroj pro výjezd!');
      return;
    }
    
    setModalStatus('Ukládám výjezd...');
    const { error } = await createPlannedVisit(customerId, visitDate, visitNote, selectedMachineIds);
    
    if (error) {
      setModalStatus('Chyba: ' + error.message);
    } else {
      setVisitDate('');
      setVisitNote('');
      setSelectedMachineIds([]);
      setModalStatus(null);
      onVisitCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#0f2c59] p-4 flex items-center justify-between text-white shrink-0">
          <h3 className="font-bold flex items-center gap-2">
            <Truck size={20} className="text-orange-400" />
            Nový plánovaný výjezd
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
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
            
            {customer?.machines && customer.machines.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                {customer.machines.map((machine: Pick<Machine, 'id' | 'model' | 'serial_number' | 'status'>) => (
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
          <button type="button" onClick={onClose} className="px-6 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg transition-colors">
            Zrušit
          </button>
        </div>
        
        {modalStatus && <div className="p-3 bg-red-50 text-sm font-semibold text-red-600 text-center border-t border-red-100">{modalStatus}</div>}
      </div>
    </div>
  );
}
