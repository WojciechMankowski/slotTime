import React from "react";
import { t, Lang } from "../../Helper/i18n";
import DockSlotCard from "./DockSlotCard";
import type { Slot } from "../../Types/SlotType";

interface Props {
  title: string;
  slots: Slot[];
  lang: Lang;
  variant?: "dock" | "unassigned";
}

export default function DockColumn({ title, slots, lang, variant = "dock" }: Props) {
  const isUnassigned = variant === "unassigned";

  return (
    <section className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50/60 overflow-hidden">
      {/* Nagłówek kolumny (sticky w obrębie przewijania) */}
      <header
        className={`flex items-center justify-between gap-2 px-3 py-2 sticky top-0 z-10 ${
          isUnassigned
            ? "bg-amber-100 text-amber-900 border-b border-amber-200"
            : "bg-white text-gray-800 border-b border-gray-200"
        }`}
      >
        <h3 className="text-sm font-black truncate">{title}</h3>
        <span
          className={`text-[0.7rem] font-black px-2 py-0.5 rounded-full shrink-0 ${
            isUnassigned ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          {slots.length}
        </span>
      </header>

      {/* Lista slotów */}
      <div className="flex flex-col gap-2 p-2">
        {slots.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6 select-none">
            {t("doki_no_slots", lang)}
          </p>
        ) : (
          slots.map(s => <DockSlotCard key={s.id} slot={s} lang={lang} />)
        )}
      </div>
    </section>
  );
}
