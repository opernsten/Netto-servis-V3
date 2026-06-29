import { useState } from 'react';
import { X, Trash2, CalendarDays, Check, Loader2, ExternalLink, Server, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deletePlannedVisit, updatePlannedVisitDate } from '../../../services/visitService';
import type { PlannedVisitWithDetails } from '../../../types/database';

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface VisitDetailPopoverProps {
  visit: PlannedVisitWithDetails;
  onClose: () => void;
  onChanged: () => void;
}

export function VisitDetailPopover({ visit, onClose, onChanged }: VisitDetailPopoverProps) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(getTomorrowDate());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const visitDateKey = visit.visit_date.split('T')[0];
  const todayKey = dateToKey(new Date());
  const tomorrowKey = getTomorrowDate();
  const isOverdue = visitDateKey < todayKey;
  const isToday = visitDateKey === todayKey;
  const isTomorrow = visitDateKey === tomorrowKey;

  const headerBg = isOverdue
    ? 'bg-gradient-to-r from-red-600 to-red-700'
    : isToday
      ? 'bg-gradient-to-r from-green-600 to-green-700'
      : isTomorrow
        ? 'bg-gradient-to-r from-amber-500 to-amber-600'
        : 'bg-gradient-to-r from-[#0f2c59] to-blue-800';

  const statusLabel = isOverdue
    ? '⚠ Propadlý výjezd'
    : isToday
      ? '📅 Dnešní výjezd'
      : isTomorrow
        ? '📅 Výjezd zítra'
        : '📅 Plánovaný výjezd';

  const handleReschedule = async () => {
    if (!newDate) return;
    setSaving(true);
    const { error } = await updatePlannedVisitDate(visit.id, newDate);
    setSaving(false);
    if (!error) {
      onChanged();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const { error } = await deletePlannedVisit(visit.id);
    setDeleting(false);
    if (!error) {
      onChanged();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Hlavička */}
        <div className={`p-5 text-white ${headerBg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{statusLabel}</p>
              <h3 className="font-extrabold text-lg leading-tight truncate">
                {visit.customers?.name || 'Neznámý zákazník'}
              </h3>
              <p className="text-sm opacity-80 mt-1 font-medium">
                {new Date(visitDateKey + 'T00:00:00').toLocaleDateString('cs-CZ', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors shrink-0 mt-0.5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tělo */}
        <div className="p-5 space-y-4">
          {/* Počet strojů */}
          <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <Server size={16} className="text-[#0f2c59] shrink-0" />
            <span>
              <strong className="text-gray-900">{visit.planned_visit_machines?.length || 0}</strong> strojů k obsloužení
            </span>
          </div>

          {/* Poznámka */}
          {visit.note && (
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-700 font-medium leading-relaxed">
              {visit.note}
            </div>
          )}

          {/* Přeložit */}
          {rescheduling ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nové datum výjezdu</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-50 border border-blue-200 rounded-xl px-3 py-2.5 flex-1">
                  <CalendarDays size={14} className="text-blue-500 shrink-0" />
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="text-sm font-semibold text-gray-800 outline-none bg-transparent w-full"
                  />
                </div>
                <button
                  onClick={handleReschedule}
                  disabled={saving || !newDate}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  Uložit
                </button>
                <button
                  onClick={() => setRescheduling(false)}
                  className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setRescheduling(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-sm transition-colors border border-blue-200"
            >
              <CalendarDays size={16} />
              Přeložit na jiné datum
            </button>
          )}

          {/* Smazat */}
          {confirmDelete ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">Opravdu chceš smazat tento výjezd? Tuto akci nelze vrátit.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Ano, smazat
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-sm transition-colors"
                >
                  Zrušit
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors border border-red-200"
            >
              <Trash2 size={16} />
              Smazat výjezd
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Link
            to={`/zakaznici/detail/${visit.customer_id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
            onClick={onClose}
          >
            <ExternalLink size={15} />
            Otevřít detail zákazníka
          </Link>
        </div>
      </div>
    </div>
  );
}
