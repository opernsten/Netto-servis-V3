import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { useCalendarData } from '../../features/calendar/hooks/useCalendarData';
import { VisitDetailPopover } from '../../features/calendar/components/VisitDetailPopover';
import { CalendarNewVisitModal } from '../../features/calendar/components/CalendarNewVisitModal';
import type { PlannedVisitWithDetails } from '../../types/database';
import { PageSkeleton } from '../../components/ui/Skeleton';

// === Konstanty ===
const DAY_NAMES_SHORT = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

// === Pomocné funkce ===
function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTodayKey(): string {
  return dateToKey(new Date());
}

function getTomorrowKey(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return dateToKey(t);
}

interface DayCell {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
}

/** Generuje 42 buněk pro měsíční grid (6 řádků × 7 sloupců, začínají v pondělí) */
function getMonthGrid(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month, 1);
  // Česky: Po=0 ... Ne=6
  const startDow = (firstDay.getDay() + 6) % 7;
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells: DayCell[] = [];

  // Doplnění z předchozího měsíce
  for (let i = startDow; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    cells.push({ date: d, key: dateToKey(d), isCurrentMonth: false });
  }
  // Aktuální měsíc
  for (let i = 1; i <= lastDate; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, key: dateToKey(d), isCurrentMonth: true });
  }
  // Doplnění do 42 buněk
  const rem = 42 - cells.length;
  for (let i = 1; i <= rem; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ date: d, key: dateToKey(d), isCurrentMonth: false });
  }
  return cells;
}

/** 7 dní týdne obsahujícího 'date', začíná v pondělí */
function getWeekDays(date: Date): DayCell[] {
  const dow = date.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d, key: dateToKey(d), isCurrentMonth: true };
  });
}

/** Barvy dle stavu výjezdu */
function getVisitStyle(dateKey: string) {
  const today = getTodayKey();
  const tomorrow = getTomorrowKey();
  if (dateKey < today) return { pill: 'bg-red-500 hover:bg-red-600', dot: 'bg-red-500' };
  if (dateKey === today) return { pill: 'bg-green-500 hover:bg-green-600', dot: 'bg-green-500' };
  if (dateKey === tomorrow) return { pill: 'bg-amber-500 hover:bg-amber-600', dot: 'bg-amber-500' };
  return { pill: 'bg-orange-500 hover:bg-orange-600', dot: 'bg-orange-500' };
}

// === Hlavní komponenta ===
export function CalendarPage() {
  const { visitsByDate, loading, reloadData } = useCalendarData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedVisit, setSelectedVisit] = useState<PlannedVisitWithDetails | null>(null);
  const [newVisitDate, setNewVisitDate] = useState<string | null>(null);

  const today = getTodayKey();

  // === Navigace ===
  const navigatePrev = () => {
    const d = new Date(currentDate);
    viewMode === 'month' ? d.setMonth(d.getMonth() - 1) : d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);
    viewMode === 'month' ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // === Nadpis ===
  const headerTitle = viewMode === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : (() => {
        const days = getWeekDays(currentDate);
        const [first, last] = [days[0].date, days[6].date];
        if (first.getMonth() === last.getMonth()) {
          return `${first.getDate()}. – ${last.getDate()}. ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
        }
        return `${first.getDate()}. ${MONTH_NAMES[first.getMonth()].substring(0, 3)}. – ${last.getDate()}. ${MONTH_NAMES[last.getMonth()].substring(0, 3)}. ${last.getFullYear()}`;
      })();

  const days = viewMode === 'month'
    ? getMonthGrid(currentDate.getFullYear(), currentDate.getMonth())
    : getWeekDays(currentDate);

  const isWeek = viewMode === 'week';

  if (loading) return <PageSkeleton />;

  // === Render kartičky výjezdu ===
  const renderVisitPill = (visit: PlannedVisitWithDetails, dateKey: string) => {
    const style = getVisitStyle(dateKey);
    return (
      <button
        key={visit.id}
        onClick={e => { e.stopPropagation(); setSelectedVisit(visit); }}
        className={`w-full text-left text-[11px] font-bold px-1.5 py-[3px] rounded-md truncate text-white transition-colors ${style.pill}`}
        title={visit.customers?.name || 'Neznámý zákazník'}
      >
        {visit.customers?.name || '—'}
      </button>
    );
  };

  // === Render buňky dne ===
  const renderDayCell = (cell: DayCell) => {
    const visits = visitsByDate[cell.key] || [];
    const isToday = cell.key === today;
    const isPast = cell.key < today;
    const maxVisible = isWeek ? 8 : 3;
    const overflow = visits.length - maxVisible;

    return (
      <div
        key={cell.key}
        onClick={() => setNewVisitDate(cell.key)}
        className={`
          border-r border-b border-gray-100 cursor-pointer group transition-colors relative
          ${isWeek ? 'min-h-[160px]' : 'min-h-[88px]'}
          ${isToday ? 'bg-blue-50/70' : !cell.isCurrentMonth ? 'bg-gray-50/40' : 'bg-white hover:bg-orange-50/30'}
        `}
      >
        {/* Číslo dne */}
        <div className="flex items-center justify-between p-1.5 pb-1">
          <span className={`
            w-6 h-6 flex items-center justify-center rounded-full text-xs font-extrabold transition-all
            ${isToday
              ? 'bg-blue-600 text-white shadow-sm'
              : !cell.isCurrentMonth
                ? 'text-gray-300'
                : isPast
                  ? 'text-gray-400'
                  : 'text-gray-700 group-hover:text-[#0f2c59]'}
          `}>
            {cell.date.getDate()}
          </span>
          {/* Ikona přidání při hoveru */}
          <span className="opacity-0 group-hover:opacity-60 transition-opacity pr-0.5">
            <Plus size={11} className="text-gray-400" />
          </span>
        </div>

        {/* Výjezdy */}
        <div className="px-1 pb-1 space-y-0.5">
          {visits.slice(0, maxVisible).map(v => renderVisitPill(v, cell.key))}
          {overflow > 0 && (
            <div className="text-[10px] text-gray-400 font-bold px-1.5 pt-0.5">
              +{overflow} dalších
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* === Záhlaví stránky === */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Titulek */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0f2c59] rounded-xl shadow-sm">
              <CalendarDays size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800 leading-tight">Servisní kalendář</h1>
              <p className="text-xs text-gray-400 font-medium">Přehled a správa plánovaných výjezdů</p>
            </div>
          </div>

          {/* Ovládání */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Přepínač pohledu */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
              {(['month', 'week'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode === 'month' ? 'Měsíc' : 'Týden'}
                </button>
              ))}
            </div>

            {/* Dnes */}
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              Dnes
            </button>

            {/* Šipky + název */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1 py-1">
              <button
                onClick={navigatePrev}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-extrabold text-gray-800 px-2 min-w-[170px] text-center">
                {headerTitle}
              </span>
              <button
                onClick={navigateNext}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Nový výjezd */}
            <button
              onClick={() => setNewVisitDate(today)}
              className="tour-step-calendar-add flex items-center gap-2 px-4 py-2 bg-[#0f2c59] hover:bg-blue-900 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              <Plus size={16} /> Nový výjezd
            </button>
          </div>
        </div>
      </div>

      {/* === Kalendářní grid === */}
      <div className="flex-1 overflow-auto p-4 pb-2">
        <div className="tour-step-calendar-view bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hlavičky dnů */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {DAY_NAMES_SHORT.map((name, i) => (
              <div
                key={name}
                className={`py-3 text-center text-xs font-extrabold uppercase tracking-wider ${
                  i >= 5 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Buňky */}
          <div className="grid grid-cols-7">
            {days.map(cell => renderDayCell(cell))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 mb-2 flex items-center gap-6 px-1 flex-wrap">
          <span className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">Legenda:</span>
          {[
            { color: 'bg-green-500', label: 'Dnes' },
            { color: 'bg-amber-500', label: 'Zítra' },
            { color: 'bg-orange-500', label: 'Budoucí výjezd' },
            { color: 'bg-red-500', label: 'Propadlý výjezd' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${color}`} />
              <span className="text-xs text-gray-500 font-medium">{label}</span>
            </div>
          ))}
          <span className="text-xs text-gray-300 ml-auto">Klikni na prázdný den pro přidání výjezdu</span>
        </div>
      </div>

      {/* === Modaly === */}
      {selectedVisit && (
        <VisitDetailPopover
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onChanged={() => { reloadData(); setSelectedVisit(null); }}
        />
      )}
      {newVisitDate && (
        <CalendarNewVisitModal
          initialDate={newVisitDate}
          onClose={() => setNewVisitDate(null)}
          onCreated={() => { reloadData(); setNewVisitDate(null); }}
        />
      )}
    </div>
  );
}
