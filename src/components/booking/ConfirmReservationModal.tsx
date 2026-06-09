import React from "react";
import Overlay from "../UI/Overlay";
import Spinner from "../UI/Spinner";
import ErrorBanner from "../UI/ErrorBanner";
import DetailRow from "../UI/DetailRow";
import NoticeField from "../UI/NoticeField";
import { CalendarIcon, ClockIcon, StarIcon } from "../UI/Icons";
import { formatDate, formatTime } from "../../Helper/helper";
import { t, Lang } from "../../Helper/i18n";
import type { Slot } from "../../Types/SlotType";
import type { NoticePayload } from "../../API/serviceSlot";

interface ConfirmReservationModalProps {
  slot: Slot;
  lang: Lang;
  requestedType: "INBOUND" | "OUTBOUND";
  onRequestedTypeChange: (type: "INBOUND" | "OUTBOUND") => void;
  reserving: boolean;
  reserveErr: string | null;
  form: NoticePayload;
  errors: Partial<Record<keyof NoticePayload, string>>;
  onFormChange: (updater: (prev: NoticePayload) => NoticePayload) => void;
  onClearError: (field: keyof NoticePayload) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmReservationModal({
  slot,
  lang,
  requestedType,
  onRequestedTypeChange,
  reserving,
  reserveErr,
  form,
  errors,
  onFormChange,
  onClearError,
  onConfirm,
  onClose,
}: ConfirmReservationModalProps) {
  return (
    <Overlay onClose={onClose} labelledBy="confirm-reservation-title">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-linear-to-br from-blue-600 to-blue-800 px-7 py-5 shrink-0">
          <h3 id="confirm-reservation-title" className="text-xl font-bold text-white mb-0.5">
            {t("confirm_reservation", lang)}
          </h3>
          <p className="text-blue-200 text-sm">
            {t("confirm_reservation_desc", lang)}
          </p>
        </div>

        <div className="px-7 py-6 overflow-y-auto flex-1">
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5">
            <DetailRow
              icon={<CalendarIcon sm />}
              label={t("date", lang)}
              value={formatDate(slot.start_dt, lang)}
            />
            <DetailRow
              icon={<ClockIcon sm />}
              label={t("start", lang)}
              value={formatTime(slot.start_dt)}
            />
            <DetailRow
              icon={<ClockIcon sm />}
              label={t("end", lang)}
              value={formatTime(slot.end_dt)}
            />
            <DetailRow
              icon={<StarIcon sm />}
              label={t("type", lang)}
              value={t(slot.slot_type.toLowerCase() as any, lang)}
            />
          </div>

          {/* ANY type chooser */}
          {slot.slot_type === "ANY" && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("choose_type", lang)}
              </label>
              <div className="flex gap-3">
                {(["INBOUND", "OUTBOUND"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onRequestedTypeChange(type)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                      requestedType === type
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    {t(type.toLowerCase() as any, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notice form */}
          <div className="border-t border-gray-200 pt-5 mb-4">
            <h4 className="text-sm font-bold text-gray-700 mb-1">
              {t("notice_form_title", lang)}
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              {t("notice_form_desc", lang)}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <NoticeField
                label={t("notice_order_no", lang)}
                value={form.numer_zlecenia}
                error={errors.numer_zlecenia}
                onChange={(v) => onFormChange((f) => ({ ...f, numer_zlecenia: v }))}
                onFocus={() => onClearError("numer_zlecenia")}
              />
              <NoticeField
                label={t("notice_reference", lang)}
                value={form.referencja}
                error={errors.referencja}
                onChange={(v) => onFormChange((f) => ({ ...f, referencja: v }))}
                onFocus={() => onClearError("referencja")}
              />
              <NoticeField
                label={t("notice_truck_plate", lang)}
                value={form.rejestracja_auta}
                error={errors.rejestracja_auta}
                onChange={(v) => onFormChange((f) => ({ ...f, rejestracja_auta: v }))}
                onFocus={() => onClearError("rejestracja_auta")}
              />
              <NoticeField
                label={t("notice_trailer_plate", lang)}
                value={form.rejestracja_naczepy}
                error={errors.rejestracja_naczepy}
                onChange={(v) => onFormChange((f) => ({ ...f, rejestracja_naczepy: v }))}
                onFocus={() => onClearError("rejestracja_naczepy")}
              />
              <NoticeField
                label={t("notice_pallets", lang)}
                value={String(form.ilosc_palet)}
                error={errors.ilosc_palet}
                type="number"
                onChange={(v) => onFormChange((f) => ({ ...f, ilosc_palet: parseInt(v) || 0 }))}
                onFocus={() => onClearError("ilosc_palet")}
              />
              <NoticeField
                label={t("notice_driver_name", lang)}
                value={form.kierowca_imie_nazwisko ?? ""}
                onChange={(v) => onFormChange((f) => ({ ...f, kierowca_imie_nazwisko: v }))}
              />
              <NoticeField
                label={t("notice_driver_phone", lang)}
                value={form.kierowca_tel ?? ""}
                type="tel"
                onChange={(v) => onFormChange((f) => ({ ...f, kierowca_tel: v }))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {t("notice_remarks", lang)}
              </label>
              <textarea
                rows={3}
                value={form.uwagi ?? ""}
                onChange={(e) =>
                  onFormChange((f) => ({ ...f, uwagi: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={t("add_remarks", lang)}
              />
            </div>
          </div>

          {reserveErr && <ErrorBanner msg={reserveErr} compact />}

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={reserving}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t("cancel_btn", lang)}
            </button>
            <button
              id="btn-confirm-reserve"
              onClick={onConfirm}
              disabled={reserving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {reserving ? (
                <>
                  <Spinner />
                  {t("reserving", lang)}
                </>
              ) : (
                t("book_and_notify", lang)
              )}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
