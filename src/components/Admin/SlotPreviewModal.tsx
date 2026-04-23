import React, { useEffect, useState } from "react";
import Overlay from "../UI/Overlay";
import Spinner from "../UI/Spinner";
import ErrorBanner from "../UI/ErrorBanner";
import { t, Lang } from "../../Helper/i18n";
import { STATUS_STYLE, TYPE_STYLE, formatTime } from "../../Helper/helper";
import { getNotice, NoticePayload } from "../../API/serviceSlot";
import { getApiError } from "../../Helper/helper";
import type { Slot } from "../../Types/SlotType";

interface Props {
  slot: Slot;
  lang: Lang;
  onClose: () => void;
  onGoToDetails: (date: string) => void;
}

export default function SlotPreviewModal({ slot, lang, onClose, onGoToDetails }: Props) {
  const [notice, setNotice] = useState<NoticePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [noNotice, setNoNotice] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setNoNotice(false);

    getNotice(slot.id)
      .then(data => { if (!cancelled) setNotice(data); })
      .catch(err => {
        if (cancelled) return;
        const code = getApiError(err);
        if (code === "NOTICE_NOT_FOUND" || err?.response?.status === 404) {
          setNoNotice(true);
        } else {
          setError(code);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slot.id]);

  const statusStyle = STATUS_STYLE[slot.status];
  const typeColor = TYPE_STYLE[slot.slot_type] ?? "bg-blue-100 text-blue-800";
  const date = slot.start_dt.slice(0, 10);

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
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">{t("slot_preview_title", lang)}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">
              {formatTime(slot.start_dt)} – {formatTime(slot.end_dt)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeColor}`}>{slot.slot_type}</span>
            {statusStyle && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {lang === "pl" ? statusStyle.label_pl : statusStyle.label_en}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Company section */}
          {(slot.reserved_by_company_alias || slot.reserved_by_alias || slot.dock_alias) && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("company", lang)}</h3>
              {field(t("company", lang), slot.reserved_by_company_alias)}
              {field(t("reserved_by", lang), slot.reserved_by_alias)}
              {field(t("dock", lang), slot.dock_alias)}
            </div>
          )}

          {/* Notice section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("notice", lang)}</h3>
            {loading && (
              <div className="flex justify-center py-6"><Spinner /></div>
            )}
            {error && <ErrorBanner msg={error} />}
            {noNotice && !loading && (
              <p className="text-gray-400 text-sm text-center py-4">{t("no_notice_data", lang)}</p>
            )}
            {notice && !loading && (
              <div>
                {field(t("notice_order_number", lang), notice.numer_zlecenia)}
                {field(t("notice_reference", lang), notice.referencja)}
                {field(t("notice_vehicle_reg", lang), notice.rejestracja_auta)}
                {field(t("notice_trailer_reg", lang), notice.rejestracja_naczepy)}
                {field(t("notice_pallet_count", lang), notice.ilosc_palet)}
                {field(t("notice_driver_name", lang), notice.kierowca_imie_nazwisko)}
                {field(t("notice_driver_phone", lang), notice.kierowca_tel)}
                {field(t("notice_notes", lang), notice.uwagi)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => onGoToDetails(date)}
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t("go_to_details", lang)}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t("cancel_btn", lang)}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
