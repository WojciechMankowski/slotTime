import { useState, useCallback } from 'react'
import { getSlotsAdmin } from '../API/serviceSlot'
import { getNotices } from '../API/serviceNotice'
import { confirmSlot } from '../API/serviceSlot'
import { getApiError } from '../Helper/helper'
import type { Slot } from '../Types/SlotType'
import type { NoticeData } from '../Types/NoticeType'

export interface DaySlot extends Slot {
  notice?: NoticeData | null
}

export interface UseDayDrawerReturn {
  selectedDate: string | null
  slots: DaySlot[]
  loading: boolean
  error: string | null
  open: (date: string) => void
  close: () => void
  toggle: (id: number) => void
  isExpanded: (id: number) => boolean
  handleConfirm: (slotId: number) => Promise<void>
}

export function useDayDrawer(): UseDayDrawerReturn {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<DaySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchDay = useCallback(async (date: string) => {
    setLoading(true)
    setError(null)
    setExpandedId(null)

    try {
      const [allSlots, notices] = await Promise.all([
        getSlotsAdmin(date, date),
        getNotices({ dateFrom: date, dateTo: date }),
      ])

      const noticeMap = new Map(notices.map(n => [n.id, n.notice]))

      const daySlots: DaySlot[] = allSlots
        .filter(s => s.start_dt.slice(0, 10) === date)
        .sort((a, b) => a.start_dt.localeCompare(b.start_dt))
        .map(s => ({ ...s, notice: noticeMap.get(s.id) ?? null }))

      setSlots(daySlots)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const open = useCallback((date: string) => {
    setSelectedDate(date)
    fetchDay(date)
  }, [fetchDay])

  const close = useCallback(() => {
    setSelectedDate(null)
    setSlots([])
    setExpandedId(null)
  }, [])

  const toggle = useCallback((id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }, [])

  const isExpanded = useCallback((id: number) => expandedId === id, [expandedId])

  const handleConfirm = useCallback(async (slotId: number) => {
    try {
      await confirmSlot(slotId)
      if (selectedDate) await fetchDay(selectedDate)
    } catch (err) {
      setError(getApiError(err))
    }
  }, [selectedDate, fetchDay])

  return { selectedDate, slots, loading, error, open, close, toggle, isExpanded, handleConfirm }
}
