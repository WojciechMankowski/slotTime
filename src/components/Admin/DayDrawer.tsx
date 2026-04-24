import React, { useEffect } from "react";
import { t, Lang } from "../../Helper/i18n";
import { STATUS_STYLE, TYPE_STYLE, formatDate, formatTime } from "../../Helper/helper";
import type { DaySlot } from "../../hooks/useDayDrawer";

interface Props {
  lang: Lang;
  selectedDate: string;
  slots: DaySlot[];
  loading: boolean;
  error: string | null;
  isExpanded: (id: number) => boolean;
  toggle: (id: number) => void;
  handleConfirm: (slotId: number) => Promise<void>;
  onClose: () => void;
  onOpenFullView: (date: string) => void;
}

export default function DayDrawer({
  lang, selectedDate, slots, loading, error,
  isExpanded, toggle, handleConfirm, onClose, onOpenFullView,
}: Props) {
  // Escape key closes drawer
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const statusLabel = (status: string) => {
    const s = STATUS_STYLE[status];
    if (!s) return status;
    return lang === "pl" ? s.label_pl : s.label_en;
  };

  const statusBadge = (status: string) => {
    const s = STATUS_STYLE[status];
    if (!s) return <span className="text-xs font-semibold text-gray-600">{status}</span>;
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
        {statusLabel(status)}
      </span>
    );
  };

  // Count statuses for header badges
  const statusCounts: Record<string, number> = {};
  slots.forEach(s => {
    statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
  });

  const field = (label: string, value: string | number | undefined | null) => {
    if (value == null || value === "") return null;
    return (
      <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="text-gray-900 text-sm font-medium">{value}</span>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-[9999] bg-white shadow-2xl
          w-full max-w-[480px] lg:max-w-[480px]
          transform transition-transform duration-300 ease-out translate-x-0
          flex flex-col"
        style={{ maxWidth: "min(480px, 100vw)" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">{t("day_overview", lang)}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
            >
              &times;
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">{formatDate(selectedDate + "T00:00:00", lang)}</p>

          {/* Status badges */}
          {Object.keys(statusCounts).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(statusCounts).map(([status, count]) => {
                const s = STATUS_STYLE[status];
                if (!s) return null;
                return (
                  <span key={status} className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                    {count} {statusLabel(status)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">{t("loading_slots", lang)}</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-5">
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="text-sm font-medium">{t("no_slots_this_day", lang)}</span>
            </div>
          )}

          {!loading && !error && slots.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {slots.map(slot => {
                const expanded = isExpanded(slot.id);
                const typeColor = TYPE_STYLE[slot.slot_type] ?? "bg-blue-100 text-blue-800";
                const hasDetails = slot.status !== "AVAILABLE";

                return (
                  <li key={slot.id}>
                    {/* Slot row */}
                    <button
                      onClick={() => hasDetails && toggle(slot.id)}
                      className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors
                        ${hasDetails ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}
                        ${expanded ? "bg-blue-50/50" : ""}`}
                    >
                      {/* Time */}
                      <span className="text-sm font-semibold text-gray-700 shrink-0 w-[100px]">
                        {formatTime(slot.start_dt)} – {formatTime(slot.end_dt)}
                      </span>

                      {/* Type badge */}
                      <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${typeColor}`}>
                        {slot.slot_type}
                      </span>

                      {/* Status badge */}
                      {statusBadge(slot.status)}

                      {/* Company */}
                      {slot.reserved_by_company_name && (
                        <span className="text-xs text-gray-500 truncate ml-auto">
                          {slot.reserved_by_company_name}
                        </span>
                      )}

                      {/* Chevron */}
                      {hasDetails && (
                        <svg
                          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Expanded notice details */}
                    {expanded && (
                      <div className="bg-blue-50/60 border-t border-b border-blue-100 px-6 py-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
                          {t("notice_details", lang)}
                        </div>

                        {/* Company info */}
                        {(slot.reserved_by_company_name || slot.reserved_by_alias || slot.dock_alias) && (
                          <div className="mb-3">
                            {field(t("company", lang), slot.reserved_by_company_name)}
                            {field(t("reserved_by", lang), slot.reserved_by_alias)}
                            {field(t("dock", lang), slot.dock_alias)}
                          </div>
                        )}

                        {/* Notice fields */}
                        {slot.notice ? (
                          <div>
                            {field(t("notice_order_number", lang), slot.notice.numer_zlecenia)}
                            {field(t("notice_reference", lang), slot.notice.referencja)}
                            {field(t("notice_vehicle_reg", lang), slot.notice.rejestracja_auta)}
                            {field(t("notice_trailer_reg", lang), slot.notice.rejestracja_naczepy)}
                            {field(t("notice_pallet_count", lang), slot.notice.ilosc_palet)}
                            {field(t("notice_driver_name", lang), slot.notice.kierowca_imie_nazwisko)}
                            {field(t("notice_driver_phone", lang), slot.notice.kierowca_tel)}
                            {field(t("notice_notes", lang), slot.notice.uwagi)}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">{t("no_notice_data", lang)}</p>
                        )}

                        {/* Confirm button */}
                        {slot.status === "PENDING_CONFIRMATION" && (
                          <button
                            onClick={() => handleConfirm(slot.id)}
                            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                          >
                            {t("confirm", lang)}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => onOpenFullView(selectedDate)}
            className="w-full px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t("open_full_view", lang)}
          </button>
        </div>
      </div>
    </>
  );
}
