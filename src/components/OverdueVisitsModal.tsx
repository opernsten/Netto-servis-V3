// src/components/OverdueVisitsModal.tsx
import { useState } from 'react';
import { AlertTriangle, Trash2, X, CalendarX, CheckCircle, Loader2, ChevronRight, CalendarDays, Check } from 'lucide-react';
import { deletePlannedVisit, updatePlannedVisitDate } from '../services/visitService';
import type { PlannedVisitWithDetails } from '../types/database';

interface OverdueVisitsModalProps {
  overdueVisits: PlannedVisitWithDetails[];
  onClose: () => void;
  onDeleted: () => void;
}

// Minimální datum pro přeložení = zítra
function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function OverdueVisitsModal({ overdueVisits, onClose, onDeleted }: OverdueVisitsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(overdueVisits.map(v => v.id)));
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);

  // Stav pro přeložení — které ID se právě přesouvá a na jaké datum
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [reschedulingDate, setReschedulingDate] = useState(getTomorrowDate());
  const [reschedulingSaving, setReschedulingSaving] = useState(false);
  const [rescheduledIds, setRescheduledIds] = useState<Set<string>>(new Set());

  if (overdueVisits.length === 0) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(
    overdueVisits.filter(v => !rescheduledIds.has(v.id)).map(v => v.id)
  ));
  const deselectAll = () => setSelectedIds(new Set());

  const handleRescheduleOpen = (id: string) => {
    setReschedulingId(id);
    setReschedulingDate(getTomorrowDate());
    // Odznačit z batch delete když chci přeložit
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRescheduleCancel = () => {
    setReschedulingId(null);
  };

  const handleRescheduleSave = async (visitId: string) => {
    if (!reschedulingDate) return;
    setReschedulingSaving(true);
    const { error } = await updatePlannedVisitDate(visitId, reschedulingDate);
    setReschedulingSaving(false);

    if (!error) {
      setRescheduledIds(prev => new Set([...prev, visitId]));
      setReschedulingId(null);
      // Odstraníme i z delete selection pokud tam byl
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(visitId);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      // Pokud už jsou přeloženy, načteme znovu data
      if (rescheduledIds.size > 0) {
        onDeleted();
      }
      onClose();
      return;
    }

    setDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    const results = await Promise.all(idsToDelete.map(id => deletePlannedVisit(id)));
    const failed = results.filter(r => r.error);
    setDeleting(false);

    if (failed.length === 0) {
      setDone(true);
      setTimeout(() => {
        onDeleted();
        onClose();
      }, 1200);
    } else {
      onDeleted();
      onClose();
    }
  };

  const daysOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visit = new Date(dateStr);
    const diff = Math.floor((today.getTime() - visit.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const pendingVisits = overdueVisits.filter(v => !rescheduledIds.has(v.id));
  const hasAnyAction = selectedIds.size > 0 || rescheduledIds.size > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">

        {/* Hlavička */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CalendarX size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Propadlé výjezdy</h3>
              <p className="text-red-200 text-xs font-medium mt-0.5">
                {overdueVisits.length === 1
                  ? '1 výjezd má propadlé datum'
                  : `${overdueVisits.length} výjezdy mají propadlé datum`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            aria-label="Zavřít"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tělo */}
        {done ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="font-bold text-gray-800 text-lg">Hotovo!</p>
            <p className="text-gray-400 text-sm">Dashboard bude aktualizován.</p>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-gray-100 bg-red-50/40">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Níže uvedené výjezdy mají <strong>prošlé datum</strong>. Každý výjezd můžeš <strong>přeložit</strong> na nové datum nebo jej <strong>odstranit</strong>.
                </p>
              </div>
            </div>

            {/* Výběr všech pro smazání */}
            {pendingVisits.length > 1 && (
              <div className="px-5 pt-3 flex gap-3 items-center">
                <span className="text-xs text-gray-400 font-medium">Označit pro smazání:</span>
                <button
                  onClick={selectAll}
                  className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Vše
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Odznačit
                </button>
              </div>
            )}

            {/* Seznam výjezdů */}
            <div className="overflow-y-auto max-h-72 divide-y divide-gray-100 px-2 py-2">
              {overdueVisits.map(visit => {
                const overdueDays = daysOverdue(visit.visit_date);
                const isSelected = selectedIds.has(visit.id);
                const isRescheduled = rescheduledIds.has(visit.id);
                const isRescheduling = reschedulingId === visit.id;

                if (isRescheduled) {
                  // Zobrazit jako přeložený (zelený stav)
                  return (
                    <div key={visit.id} className="flex items-center gap-4 p-3 rounded-xl mx-1 my-0.5 bg-green-50 border border-green-200">
                      <div className="p-1.5 bg-green-100 rounded-full shrink-0">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-700 text-sm truncate">{visit.customers?.name || 'Neznámý zákazník'}</p>
                        <p className="text-xs text-green-600 font-semibold mt-0.5">✓ Přeloženo</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={visit.id} className={`rounded-xl mx-1 my-0.5 transition-all border ${
                    isRescheduling
                      ? 'bg-blue-50 border-blue-200'
                      : isSelected
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}>
                    {/* Hlavní řádek */}
                    <div className="flex items-center gap-3 p-3">
                      {/* Checkbox pro smazání — skryj během přeložení */}
                      {!isRescheduling && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(visit.id)}
                          className="w-4 h-4 accent-red-600 shrink-0"
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {visit.customers?.name || 'Neznámý zákazník'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Plánováno:{' '}
                          <span className="font-semibold text-red-600">
                            {new Date(visit.visit_date).toLocaleDateString('cs-CZ', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </span>
                        </p>
                        {visit.note && (
                          <p className="text-[11px] text-orange-600 truncate mt-0.5">{visit.note}</p>
                        )}
                      </div>

                      {/* Badge + akce */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} />
                          {overdueDays === 1 ? '1 den' : `${overdueDays} dní`}
                        </span>
                        {!isRescheduling && (
                          <button
                            onClick={() => handleRescheduleOpen(visit.id)}
                            title="Přeložit na jiné datum"
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          >
                            <CalendarDays size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline datepicker pro přeložení */}
                    {isRescheduling && (
                      <div className="px-3 pb-3 flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 flex-1 shadow-sm">
                          <CalendarDays size={14} className="text-blue-500 shrink-0" />
                          <input
                            type="date"
                            min={getTomorrowDate()}
                            value={reschedulingDate}
                            onChange={e => setReschedulingDate(e.target.value)}
                            className="text-sm font-semibold text-gray-800 outline-none bg-transparent w-full"
                          />
                        </div>
                        <button
                          onClick={() => handleRescheduleSave(visit.id)}
                          disabled={reschedulingSaving || !reschedulingDate}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          {reschedulingSaving ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          Uložit
                        </button>
                        <button
                          onClick={handleRescheduleCancel}
                          disabled={reschedulingSaving}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Akční tlačítka */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
                  selectedIds.size > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                    : hasAnyAction
                      ? 'bg-[#0f2c59] hover:bg-blue-900 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Odstraňuji...
                  </>
                ) : selectedIds.size > 0 ? (
                  <>
                    <Trash2 size={16} />
                    Odstranit vybrané ({selectedIds.size})
                  </>
                ) : rescheduledIds.size > 0 ? (
                  <>
                    <Check size={16} />
                    Hotovo — zavřít
                  </>
                ) : (
                  <>
                    <ChevronRight size={16} />
                    Ponechat vše
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={deleting}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors"
              >
                Přeskočit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
