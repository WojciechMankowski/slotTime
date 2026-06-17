import React, { useState } from "react";
import { t, Lang, errorText } from "../Helper/i18n";
import type { Me } from "../Types/types";
import useDockBoard, { REFRESH_OPTIONS } from "../hooks/useDockBoard";
import DockColumn from "../components/dockboard/DockColumn";
import Spinner from "../components/UI/Spinner";
import ErrorBanner from "../components/UI/ErrorBanner";
import EmptyState from "../components/UI/EmptyState";

type ColFilter = "all" | "busy" | "empty";

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-0.5 ${color}`}>
      <div className="text-[0.65rem] font-bold uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

export default function DockBoard({ lang }: { lang: Lang; me: Me }) {
  const board = useDockBoard();
  const [filter, setFilter] = useState<ColFilter>("all");

  const { docks, slotsByDock, unassigned, stats, loading, loadErr, lastUpdated, reload, refreshMin, setRefreshMin } = board;

  const visibleDocks = docks.filter(d => {
    const count = slotsByDock[d.id]?.length ?? 0;
    if (filter === "busy") return count > 0;
    if (filter === "empty") return count === 0;
    return true;
  });

  const showUnassigned = unassigned.length > 0 && filter !== "empty";

  const filterBtn = (key: ColFilter, label: string) => (
    <button
      onClick={() => setFilter(key)}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
        filter === key ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="py-5">
      {/* ── Pasek podsumowania ─────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-(--bg) pb-3 mb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-black text-gray-800">{t("doki_board", lang)}</h1>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              {t("doki_auto_refresh", lang)}
              <select
                value={refreshMin}
                onChange={e => setRefreshMin(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-(--border) text-sm font-medium bg-(--bg) text-(--text-main) focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REFRESH_OPTIONS.map(min => (
                  <option key={min} value={min}>
                    {min === 0 ? t("doki_refresh_off", lang) : `${min} min`}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={() => void reload()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? <Spinner /> : null}
              {t("doki_refresh_now", lang)}
            </button>

            {lastUpdated && (
              <span className="text-xs text-gray-400 tabular-nums">
                {t("doki_last_updated", lang)}:{" "}
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <KpiCard label={t("doki_kpi_confirmed", lang)} value={String(stats.confirmed)} color="bg-emerald-50 border-emerald-200 text-emerald-900" />
          <KpiCard label={t("doki_kpi_assigned", lang)} value={String(stats.assigned)} color="bg-indigo-50 border-indigo-200 text-indigo-900" />
          <KpiCard label={t("doki_kpi_unassigned", lang)} value={String(stats.unassigned)} color={stats.unassigned > 0 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-gray-50 border-gray-200 text-gray-600"} />
          <KpiCard label={`${t("inbound", lang)} / ${t("outbound", lang)}`} value={`${stats.inbound} / ${stats.outbound}`} color="bg-blue-50 border-blue-200 text-blue-900" />
        </div>

        {/* Filtr kolumn */}
        <div className="inline-flex gap-1 bg-gray-100 rounded-xl p-1">
          {filterBtn("all", t("doki_filter_all", lang))}
          {filterBtn("busy", t("doki_filter_busy", lang))}
          {filterBtn("empty", t("doki_filter_empty", lang))}
        </div>
      </div>

      {loadErr && <ErrorBanner msg={errorText[loadErr] ? errorText[loadErr][lang] : loadErr} compact />}

      {/* ── Siatka kolumn doków ────────────────────────────── */}
      {docks.length === 0 && !loading && !loadErr ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M3 11h18M8 7V4M16 7V4" />
            </svg>
          }
          title={t("doki_empty_docks", lang)}
          desc={t("doki_empty_docks_desc", lang)}
        />
      ) : (
        <div className="grid gap-3 items-start grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
          {showUnassigned && (
            <DockColumn
              title={t("doki_unassigned", lang)}
              slots={unassigned}
              lang={lang}
              variant="unassigned"
            />
          )}
          {visibleDocks.map(d => (
            <DockColumn
              key={d.id}
              title={d.alias}
              slots={slotsByDock[d.id] ?? []}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
