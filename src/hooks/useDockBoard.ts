import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSlotsAdmin } from "../API/serviceSlot";
import { getDokAdmin } from "../API/serviceDok";
import { getApiError } from "../Helper/helper";
import type { Slot } from "../Types/SlotType";
import type { DokTyp } from "../Types/DokType";

// ── Auto-refresh (localStorage), wzór z AdminCalendar ──────────
export const REFRESH_OPTIONS = [0, 5, 10, 15, 30, 60]; // 0 = wyłączone
const REFRESH_KEY = "doki_refresh_min";
const REFRESH_DEFAULT = 5;

function getRefreshMinStored(): number {
  const v = Number(localStorage.getItem(REFRESH_KEY));
  return REFRESH_OPTIONS.includes(v) ? v : REFRESH_DEFAULT;
}

function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const byStartDt = (a: Slot, b: Slot) => a.start_dt.localeCompare(b.start_dt);

export default function useDockBoard() {
  const [docks, setDocks] = useState<DokTyp[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshMin, setRefreshMinState] = useState<number>(getRefreshMinStored());

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const today = todayStr();
      const [docksData, slotsData] = await Promise.all([
        getDokAdmin(),
        getSlotsAdmin(today, today, "CONFIRMED"),
      ]);
      setDocks(docksData.filter(d => d.is_active));
      setSlots(slotsData);
      setLastUpdated(new Date());
    } catch (err) {
      setLoadErr(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Pierwsze załadowanie
  useEffect(() => {
    reload();
  }, [reload]);

  // Auto-odświeżanie — zawsze wywołuje najnowszy loader (ref), cleanup przy zmianie interwału
  const refreshFnRef = useRef<() => void>(() => {});
  refreshFnRef.current = () => { void reload(); };
  useEffect(() => {
    if (refreshMin <= 0) return;
    const id = setInterval(() => refreshFnRef.current(), refreshMin * 60_000);
    return () => clearInterval(id);
  }, [refreshMin]);

  const setRefreshMin = useCallback((min: number) => {
    localStorage.setItem(REFRESH_KEY, String(min));
    setRefreshMinState(min);
  }, []);

  // Grupowanie slotów po doku + sortowanie wg godziny
  const sortedDocks = useMemo(
    () => [...docks].sort((a, b) => a.alias.localeCompare(b.alias)),
    [docks],
  );

  const slotsByDock = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    for (const s of slots) {
      if (s.dock_id == null) continue;
      (map[s.dock_id] ??= []).push(s);
    }
    for (const id of Object.keys(map)) map[Number(id)].sort(byStartDt);
    return map;
  }, [slots]);

  const unassigned = useMemo(
    () => slots.filter(s => s.dock_id == null).sort(byStartDt),
    [slots],
  );

  const stats = useMemo(() => {
    const assigned = slots.filter(s => s.dock_id != null).length;
    return {
      confirmed: slots.length,
      assigned,
      unassigned: slots.length - assigned,
      inbound: slots.filter(s => s.slot_type === "INBOUND").length,
      outbound: slots.filter(s => s.slot_type === "OUTBOUND").length,
    };
  }, [slots]);

  return {
    docks: sortedDocks,
    slotsByDock,
    unassigned,
    stats,
    loading,
    loadErr,
    lastUpdated,
    reload,
    refreshMin,
    setRefreshMin,
  };
}
