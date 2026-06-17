import React from "react";
import { t, Lang } from "../../Helper/i18n";
import { formatTime, TYPE_STYLE } from "../../Helper/helper";
import type { Slot } from "../../Types/SlotType";

interface Props {
  slot: Slot;
  lang: Lang;
}

function typeLabel(slotType: Slot["slot_type"], lang: Lang): string {
  if (slotType === "INBOUND") return t("inbound", lang);
  if (slotType === "OUTBOUND") return t("outbound", lang);
  return slotType;
}

export default function DockSlotCard({ slot, lang }: Props) {
  const now = Date.now();
  const start = new Date(slot.start_dt).getTime();
  const end = new Date(slot.end_dt).getTime();
  const isNow = start <= now && now <= end;
  const isPast = end < now;

  const typeClass = TYPE_STYLE[slot.slot_type] ?? "bg-gray-100 text-gray-700";
  const n = slot.notice;

  return (
    <div
      className={`rounded-xl border p-2.5 bg-white transition-all ${
        isNow
          ? "border-blue-400 ring-2 ring-blue-400 shadow-md"
          : "border-gray-200 shadow-sm"
      } ${isPast ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-black text-gray-800 tabular-nums">
          {formatTime(slot.start_dt)}–{formatTime(slot.end_dt)}
        </span>
        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${typeClass}`}>
          {typeLabel(slot.slot_type, lang)}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[0.72rem]">
        <dt className="text-gray-400 font-medium">{t("doki_reference", lang)}</dt>
        <dd className="text-gray-800 font-semibold text-right break-all">{n?.referencja || "—"}</dd>

        <dt className="text-gray-400 font-medium">{t("doki_reg_truck", lang)}</dt>
        <dd className="text-gray-800 font-semibold text-right break-all">{n?.rejestracja_auta || "—"}</dd>

        <dt className="text-gray-400 font-medium">{t("doki_reg_trailer", lang)}</dt>
        <dd className="text-gray-800 font-semibold text-right break-all">{n?.rejestracja_naczepy || "—"}</dd>

        <dt className="text-gray-400 font-medium">{t("doki_pallets", lang)}</dt>
        <dd className="text-gray-800 font-semibold text-right">{n?.ilosc_palet ?? "—"}</dd>
      </dl>
    </div>
  );
}
