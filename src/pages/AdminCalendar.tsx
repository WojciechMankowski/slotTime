import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { t, Lang } from "../Helper/i18n";
import useAdminCalendar, { CalendarMode } from "../hooks/useAdminCalendar";
import useAdminCalendarWeek from "../hooks/useAdminCalendarWeek";
import { useDayDrawer } from "../hooks/useDayDrawer";
import ErrorBanner from "../components/UI/ErrorBanner";
import Spinner from "../components/UI/Spinner";
import SlotPreviewModal from "../components/Admin/SlotPreviewModal";
import DayDrawer from "../components/Admin/DayDrawer";
import Select from "../components/UI/Select";
import Checkbox from "../components/UI/Checkbox";
import { TYPE_STYLE } from "../Helper/helper";
import type { CalendarDaySummary } from "../API/serviceSlot";
import type { Slot } from "../Types/SlotType";

interface Props { lang: Lang }

function getMonthNames(lang: Lang) { return t("cal_months", lang).split("|"); }
function getDayNames(lang: Lang)   { return t("cal_days",   lang).split("|"); }

const GRID_START = 6 * 60;  // 06:00
const GRID_END   = 19 * 60; // 19:00
const GRID_SPAN  = GRID_END - GRID_START; // 960 min

function dtToMinutes(dt: string): number {
  const d = new Date(dt);
  return d.getHours() * 60 + d.getMinutes();
}

// ── Auto-refresh preference (localStorage) ──────────────────
const REFRESH_KEY = "cal_refresh_min";
const REFRESH_OPTIONS = [0, 5, 10, 15, 30, 60]; // 0 = wyłączone; 1 = testowo
const REFRESH_DEFAULT = 10;

function getRefreshMin(): number {
  const v = Number(localStorage.getItem(REFRESH_KEY));
  return REFRESH_OPTIONS.includes(v) ? v : REFRESH_DEFAULT;
}

function setRefreshMinStored(min: number) {
  localStorage.setItem(REFRESH_KEY, String(min));
}

// ── Month Day Cell ──────────────────────────────────────────
function DayCell({ summary, dateStr, isToday, isOtherMonth, isSelected, onClick }: {
  summary: CalendarDaySummary | undefined;
  dateStr: string;
  isToday: boolean;
  isOtherMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const dayNum = parseInt(dateStr.slice(8), 10);

  if (isOtherMonth) {
    return (
      <div className="min-h-[88px] rounded-xl bg-gray-50 border border-gray-100 p-2 opacity-35 select-none">
        <span className="text-sm font-medium text-gray-400">{dayNum}</span>
      </div>
    );
  }

  const booked   = summary?.booked    ?? 0;
  const avail    = summary?.available ?? 0;
  const total    = summary?.total     ?? 0;
  const progress = total > 0 ? Math.round((booked / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`min-h-[88px] rounded-xl border p-2 text-left w-full transition-all hover:shadow-md hover:scale-[1.02] active:scale-100
        ${isSelected ? "ring-2 ring-blue-600 bg-blue-100 border-blue-300" : isToday ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:border-blue-300"}`}
    >
      <span className={`text-sm font-bold leading-none ${isToday ? "text-blue-600" : "text-gray-800"}`}>{dayNum}</span>

      {total > 0 ? (
        <>
          {/* total badge */}
          <span className="ml-1.5 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{total}</span>

          {/* dots */}
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {avail > 0 && (
              <span className="flex items-center gap-0.5 text-[0.6rem] font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{avail}
              </span>
            )}
            {booked > 0 && (
              <span className="flex items-center gap-0.5 text-[0.6rem] font-semibold text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{booked}
              </span>
            )}
            {(summary?.cancelled ?? 0) + (summary?.completed ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[0.6rem] font-semibold text-gray-400">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{(summary?.cancelled ?? 0) + (summary?.completed ?? 0)}</span>
            )}
            {(summary?.inbound ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[0.6rem] font-semibold text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />{summary?.inbound}
              </span>
            )}
            {(summary?.outbound ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[0.6rem] font-semibold text-purple-700">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />{summary?.outbound}
              </span>
            )}
          </div>

          {/* mini progress bar */}
          <div className="mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress === 0 ? "bg-emerald-400" :
                progress < 40  ? "bg-blue-400" :
                progress < 75  ? "bg-amber-400" : "bg-red-400"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <span className="block text-[0.6rem] text-gray-300 mt-1">—</span>
      )}
    </button>
  );
}

// ── Week Grid ───────────────────────────────────────────────
function WeekGrid({ slots, weekRef, lang, onDayClick, onSlotClick }: {
  slots: Slot[];
  weekRef: Date;
  lang: Lang;
  onDayClick: (date: string) => void;
  onSlotClick: (slot: Slot) => void;
}) {
  const dayNames = getDayNames(lang);
  const today = new Date().toISOString().slice(0, 10);

  // Build 7-day column dates (Mon–Sun)
  const monday = new Date(weekRef);
  monday.setDate(weekRef.getDate() - ((weekRef.getDay() + 6) % 7));
  const cols: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    cols.push(d.toISOString().slice(0, 10));
  }

  // Bucket slots by day
  const byDay: Record<string, Slot[]> = {};
  cols.forEach(d => { byDay[d] = []; });
  slots.forEach(s => {
    const day = s.start_dt.slice(0, 10);
    if (byDay[day]) byDay[day].push(s);
  });

  // Hour labels 06–19
  const hours: number[] = [];
  for (let h = 6; h <= 19; h++) hours.push(h);

  const CELL_H = 84; // px per hour row
  const MIN_SLOT_H = 40; // px – minimalna wysokość bloku slotu
  const GRID_H = (GRID_SPAN / 60) * CELL_H; // total grid height px

  return (
    <div>
        {/* Column headers */}
        <div className="flex border-b border-gray-200 mb-0">
          <div className="w-14 shrink-0" />
          {cols.map((date, i) => {
            const dayNum = parseInt(date.slice(8), 10);
            const monthNum = parseInt(date.slice(5, 7), 10);
            const isToday = date === today;
            return (
              <button key={date} onClick={() => onDayClick(date)} className="flex-1 text-center py-2 border-l border-gray-100 first:border-l-0 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className={`text-[0.7rem] font-bold uppercase tracking-wider ${isToday ? "text-blue-500" : "text-gray-400"}`}>
                  {dayNames[i]}
                </div>
                <div className={`text-base font-extrabold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                  {dayNum}
                  <span className="text-[0.6rem] font-normal text-gray-400 ml-0.5">/{monthNum}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="flex">
          {/* Hour labels */}
          <div className="w-14 shrink-0 relative" style={{ height: GRID_H }}>
            {hours.map(h => (
              <div
                key={h}
                className="absolute text-[0.65rem] text-gray-400 font-medium pr-2 text-right w-full"
                style={{ top: ((h - 6) * 60 / GRID_SPAN) * GRID_H - 8 }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {cols.map(date => (
            <div
              key={date}
              className="flex-1 border-l border-gray-100 relative"
              style={{ height: GRID_H }}
            >
              {/* Hour lines */}
              {hours.map(h => (
                <div
                  key={h}
                  className="absolute w-full border-t border-gray-100"
                  style={{ top: ((h - 6) * 60 / GRID_SPAN) * GRID_H }}
                />
              ))}

              {/* Slot blocks */}
              {byDay[date].map(slot => {
                const startMin = Math.max(dtToMinutes(slot.start_dt), GRID_START);
                const endMin   = Math.min(dtToMinutes(slot.end_dt),   GRID_END);
                const topPct   = (startMin - GRID_START) / GRID_SPAN;
                const heightPct = Math.max((endMin - startMin) / GRID_SPAN, MIN_SLOT_H / GRID_H);
                const colorClass = TYPE_STYLE[slot.slot_type] ?? "bg-blue-100 text-blue-800";

                return (
                  <button
                    key={slot.id}
                    onClick={() => onSlotClick(slot)}
                    className={`absolute inset-x-0.5 rounded-lg px-1.5 py-1 text-left overflow-hidden border border-white/50 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all ${colorClass}`}
                    style={{
                      top: `${topPct * 100}%`,
                      height: `${Math.max(heightPct * 100, (MIN_SLOT_H / GRID_H) * 100)}%`,
                      minHeight: `${MIN_SLOT_H}px`,
                    }}
                  >
                    <div className="text-[0.6rem] font-bold leading-tight truncate">
                      {new Date(slot.start_dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" "}
                      {slot.slot_type}
                    </div>
                    {slot.reserved_by_company_alias && (
                      <div className="text-[0.55rem] font-semibold leading-tight truncate">{slot.reserved_by_company_alias}</div>
                    )}
                    <div className="text-[0.55rem] opacity-70 truncate">{slot.status}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function AdminCalendar({ lang }: Props) {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cal  = useAdminCalendar();
  const week = useAdminCalendarWeek();
  const dayDrawer = useDayDrawer();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [weekConfirmedOnly, setWeekConfirmedOnly] = useState(false);
  const [refreshMin, setRefreshMin] = useState<number>(getRefreshMin());

  useEffect(() => {
    cal.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-odświeżanie aktywnego widoku — zawsze wywołuje najnowszy loader
  const refreshFnRef = useRef<() => void>(() => {});
  refreshFnRef.current = () => { cal.mode === "month" ? cal.load() : week.load(); };
  useEffect(() => {
    if (refreshMin <= 0) return;
    const id = setInterval(() => refreshFnRef.current(), refreshMin * 60_000);
    return () => clearInterval(id);
  }, [refreshMin]);

  // Open drawer from URL ?date= on mount
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && !dayDrawer.selectedDate) {
      dayDrawer.open(dateParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchMode = (m: CalendarMode) => {
    cal.switchMode(m);
    if (m === "week") week.load();
  };

  const handleDayClick = (dateStr: string) => {
    dayDrawer.open(dateStr);
    setSearchParams({ date: dateStr });
  };

  const handleDrawerClose = () => {
    dayDrawer.close();
    searchParams.delete("date");
    setSearchParams(searchParams);
  };

  // Month grid builder
  const buildMonthGrid = () => {
    const firstDay = new Date(cal.year, cal.month, 1);
    const lastDay  = new Date(cal.year, cal.month + 1, 0);
    const offset   = (firstDay.getDay() + 6) % 7;
    const cells: { dateStr: string; isOtherMonth: boolean }[] = [];

    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(firstDay); d.setDate(d.getDate() - (i + 1));
      cells.push({ dateStr: d.toISOString().slice(0, 10), isOtherMonth: true });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      cells.push({ dateStr: new Date(cal.year, cal.month, i).toISOString().slice(0, 10), isOtherMonth: false });
    }
    const rem = cells.length % 7;
    if (rem !== 0) {
      for (let i = 1; i <= 7 - rem; i++) {
        const d = new Date(lastDay); d.setDate(d.getDate() + i);
        cells.push({ dateStr: d.toISOString().slice(0, 10), isOtherMonth: true });
      }
    }
    return cells;
  };

  const summaryMap = Object.fromEntries(cal.days.map(d => [d.date, d]));
  const todayStr   = new Date().toISOString().slice(0, 10);
  const monthNames = getMonthNames(lang);
  const dayNames   = getDayNames(lang);

  // Week label
  const weekLabel = (() => {
    const ref = week.weekRef;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
    return `${fmt(monday)} – ${fmt(sunday)}.${sunday.getFullYear()}`;
  })();

  const navLabel = cal.mode === "month" ? `${monthNames[cal.month]} ${cal.year}` : weekLabel;
  const loading  = cal.mode === "month" ? cal.loading : week.loading;
  const loadErr  = cal.mode === "month" ? cal.loadErr : week.loadErr;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("calendar", lang)}</h1>
          <p className="text-gray-500 text-sm">{navLabel}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{t("cal_autorefresh", lang)}</span>
            <Select
              id="cal-refresh"
              defaultValue={String(refreshMin)}
              options={REFRESH_OPTIONS.map(n => ({
                value: String(n),
                label: n === 0 ? t("cal_autorefresh_off", lang) : `${n} min`,
              }))}
              onChange={(v) => { const n = Number(v); setRefreshMin(n); setRefreshMinStored(n); }}
            />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(["month", "week"] as CalendarMode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  cal.mode === m ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "month" ? t("month_view", lang) : t("week_view", lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={cal.mode === "month" ? cal.prevMonth : week.prevWeek}
          className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="font-bold text-gray-700 text-lg">{navLabel}</span>
        <button
          onClick={cal.mode === "month" ? cal.nextMonth : week.nextWeek}
          className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {loadErr && <ErrorBanner msg={loadErr} />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          {cal.mode === "month" ? (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest pb-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {buildMonthGrid().map(({ dateStr, isOtherMonth }) => (
                  <DayCell
                    key={dateStr}
                    dateStr={dateStr}
                    summary={summaryMap[dateStr]}
                    isToday={dateStr === todayStr}
                    isOtherMonth={isOtherMonth}
                    isSelected={dateStr === dayDrawer.selectedDate}
                    onClick={() => handleDayClick(dateStr)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-end">
                <Checkbox
                  id="week-confirmed-only"
                  checked={weekConfirmedOnly}
                  onChange={setWeekConfirmedOnly}
                  label={t("cal_week_confirmed_only", lang)}
                />
              </div>
              <WeekGrid
                slots={weekConfirmedOnly
                  ? week.slots.filter(s =>
                      (s.status === "CONFIRMED" || s.status === "COMPLETED") &&
                      (s.slot_type === "INBOUND" || s.slot_type === "OUTBOUND"))
                  : week.slots}
                weekRef={week.weekRef}
                lang={lang}
                onDayClick={handleDayClick}
                onSlotClick={setSelectedSlot}
              />
            </>
          )}
        </div>
      )}

      {selectedSlot && (
        <SlotPreviewModal
          slot={selectedSlot}
          lang={lang}
          onClose={() => setSelectedSlot(null)}
          onGoToDetails={(date) => { setSelectedSlot(null); nav(`/slots?date=${date}`); }}
        />
      )}

      {dayDrawer.selectedDate && (
        <DayDrawer
          lang={lang}
          selectedDate={dayDrawer.selectedDate}
          slots={dayDrawer.slots}
          loading={dayDrawer.loading}
          error={dayDrawer.error}
          isExpanded={dayDrawer.isExpanded}
          toggle={dayDrawer.toggle}
          handleConfirm={dayDrawer.handleConfirm}
          onClose={handleDrawerClose}
          onOpenFullView={(date) => { handleDrawerClose(); nav(`/slots?date=${date}`); }}
        />
      )}

      {/* Legend (month only) */}
      {cal.mode === "month" && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />{t("cal_legend_available", lang)}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{t("cal_legend_booked", lang)}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />{t("cal_legend_done", lang)}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />{t("cal_legend_inbound", lang)}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />{t("cal_legend_outbound", lang)}</span>
          <span className="ml-2 flex items-center gap-1.5 text-gray-400">{t("cal_legend_bar", lang)}</span>
        </div>
      )}
    </div>
  );
}
