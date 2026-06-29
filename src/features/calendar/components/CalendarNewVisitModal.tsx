import { useState, useEffect, type FormEvent } from 'react';
import { X, Truck, CheckSquare, Loader2 } from 'lucide-react';
import { getAllCustomers } from '../../../services/customerService';
import { createPlannedVisit } from '../../../services/visitService';
import { supabase } from '../../../services/supabase';
import type { Customer, Machine } from '../../../types/database';

interface CalendarNewVisitModalProps {
  initialDate: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CalendarNewVisitModal({ initialDate, onClose, onCreated }: CalendarNewVisitModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [machines, setMachines] = useState<Pick<Machine, 'id' | 'model' | 'serial_number'>[]>([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [visitDate, setVisitDate] = useState(initialDate);
  const [note, setNote] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Načti zákazníky při otevření
  useEffect(() => {
    getAllCustomers().then(({ data }) => {
      if (data) setCustomers(data);
      setLoadingCustomers(false);
    });
  }, []);

  // Načti stroje při změně zákazníka
  useEffect(() => {
    if (!selectedCustomerId) {
      setMachines([]);
      setSelectedMachineIds([]);
      return;
    }
    setLoadingMachines(true);
    supabase
      .from('machines')
      .select('id, model, serial_number')
      .eq('customer_id', selectedCustomerId)
      .order('model', { ascending: true })
      .then(({ data }) => {
        setMachines((data as Pick<Machine, 'id' | 'model' | 'serial_number'>[]) || []);
        setSelectedMachineIds([]);
        setLoadingMachines(false);
      });
  }, [selectedCustomerId]);

  const toggleMachine = (id: string) => {
    setSelectedMachineIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) { setError('Vyber zákazníka.'); return; }
    if (selectedMachineIds.length === 0) { setError('Vyber alespoň jeden stroj.'); return; }
    if (!visitDate) { setError('Zadej datum výjezdu.'); return; }

    setSaving(true);
    setError(null);
    const { error: err } = await createPlannedVisit(selectedCustomerId, visitDate, note, selectedMachineIds);
    setSaving(false);

    if (err) {
      setError('Chyba při ukládání: ' + err.message);
    } else {
      onCreated();
      onClose();
    }
  };

  const formattedDate = (() => {
    try {
      return new Date(visitDate + 'T00:00:00').toLocaleDateString('cs-CZ', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
    } catch { return visitDate; }
  })();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hlavička */}
        <div className="bg-[#0f2c59] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <Truck size={20} className="text-orange-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Nový plánovaný výjezd</h3>
              <p className="text-blue-300 text-xs font-medium mt-0.5 capitalize">{formattedDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Formulář */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Datum */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Datum výjezdu *
            </label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* Zákazník */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Zákazník *
            </label>
            {loadingCustomers ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-gray-50 rounded-lg">
                <Loader2 size={16} className="animate-spin" /> Načítám zákazníky...
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              >
                <option value="">— Vyber zákazníka —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Stroje */}
          {selectedCustomerId && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckSquare size={13} /> Stroje k obsloužení *
              </label>
              {loadingMachines ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-gray-50 rounded-lg">
                  <Loader2 size={16} className="animate-spin" /> Načítám stroje...
                </div>
              ) : machines.length === 0 ? (
                <div className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-lg border border-red-100">
                  Zákazník nemá evidované žádné stroje.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {machines.map(m => (
                    <label key={m.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedMachineIds.includes(m.id)
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        checked={selectedMachineIds.includes(m.id)}
                        onChange={() => toggleMachine(m.id)}
                      />
                      <div className="ml-3">
                        <div className={`font-bold text-sm ${selectedMachineIds.includes(m.id) ? 'text-blue-800' : 'text-gray-800'}`}>
                          {m.model}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">S/N: {m.serial_number}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poznámka */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Poznámka / Cíl výjezdu
            </label>
            <textarea
              placeholder="např. Hromadná kalibrace, výměna senzorů..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Akce */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0f2c59] hover:bg-blue-900 text-white font-bold rounded-xl transition-colors disabled:opacity-60 shadow-sm text-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
            {saving ? 'Ukládám...' : 'Uložit výjezd'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors text-sm"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
