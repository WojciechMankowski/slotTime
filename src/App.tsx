import React, { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, setToken, setRefreshToken } from './API/api'
import { patchMyLang } from './API/serviceUser'
import { getLang, setLang, t, Lang } from './Helper/i18n'
import type { Me } from './Types/types'

import Login from './pages/Login'
import LangConflictModal from './components/UI/LangConflictModal'

import Slots from './pages/Slots'
import Notices from './pages/Notices'
import AdminCompanies from './pages/AdminCompanies'
import AdminUsers from './pages/AdminUsers'
import AdminDocks from './pages/AdminDocks'
import GenerateSlots from './pages/GenerateSlots'
import TestPage from './pages/TestPage'
import ClientBooking from './pages/ClientBooking'
import AdminArchive from './pages/AdminArchive'
import AdminCalendar from './pages/AdminCalendar'
import AdminWarehouses from './pages/AdminWarehouses'
import AdminReports from './pages/AdminReports'
import Header from './components/Header'
import CompanyBlocked from './pages/CompanyBlocked'
import ToastContainer from './components/UI/ToastContainer'


export default function App() {
  const [me, setMe] = useState<Me | null>(null)
  const [lang, setLangState] = useState<Lang>(getLang())
  const [langConflict, setLangConflict] = useState<{ local: Lang; account: Lang } | null>(null)
  const nav = useNavigate()

  const loadMe = async () => {
    if (!localStorage.getItem('token')) return
    try {
      const res = await api.get('/api/me')
      setMe(res.data)
    } catch {
      setMe(null)
    }
  }

  // Po udanym logowaniu: porównaj język przeglądarki z językiem konta.
  // Przy rozbieżności pokaż modal do rozstrzygnięcia (nie cicho nadpisuj).
  const onLoggedIn = async () => {
    if (!localStorage.getItem('token')) return
    try {
      const res = await api.get('/api/me')
      const meData: Me = res.data
      setMe(meData)
      const localLang = getLang()
      if (meData.lang !== localLang) {
        setLangConflict({ local: localLang, account: meData.lang })
      }
    } catch {
      setMe(null)
    }
  }

  const resolveLangConflict = async (chosen: Lang) => {
    onLang(chosen)
    if (langConflict && chosen === langConflict.local) {
      // Wybrano język przeglądarki — zapisz go do konta, by kolejne logowania były spójne.
      try {
        await patchMyLang(chosen)
        setMe((prev) => (prev ? { ...prev, lang: chosen } : prev))
      } catch {
        /* zapis najlepszym wysiłkiem — UI i tak ustawione na wybrany język */
      }
    }
    setLangConflict(null)
  }

  useEffect(() => {
    loadMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLogout = () => {
    setToken(null)
    setRefreshToken(null)
    setMe(null)
    nav('/login')
  }

  const onLang = (l: Lang) => {
    setLang(l)
    setLangState(l)
  }

  if (!me) {
    return (
      <Routes>
        <Route path="/login" element={<Login lang={lang} onLang={onLang} onLoggedIn={onLoggedIn} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const isCompanyBlocked =
    me.role === 'client' && (!me.company || !me.company.is_active)

  if (isCompanyBlocked) {
    return <CompanyBlocked lang={lang} onLogout={onLogout} />
  }

  return (
    <div className="flex min-h-screen bg-(--bg) text-(--text-main) font-sans text-sm">
      <div className="flex-1 pt-0">
        <Header me={me} lang={lang} onLang={onLang} onLogout={onLogout} />

        {/* container = max-width dla contentu (tabele, formularze itd.) */}
        <div className="max-w-1400px mx-auto px-5 pb-8">
          <Routes>
            <Route path="/slots" element={<Slots lang={lang} me={me} />} />
            <Route path="/notices" element={<Notices lang={lang} />}/>
            {/* widok klienta: wolne sloty + rezerwacja — strona główna */}
            <Route path="/" element={<ClientBooking lang={lang} me={me} />} />
            <Route path="/book" element={<ClientBooking lang={lang} me={me} />} />

            {/* główny route (zgodnie z ustaleniami: /generate) */}
            <Route
              path="/generate"
              element={me.role !== 'client' ? <GenerateSlots lang={lang} /> : <Navigate to="/" replace />}
            />

            {/* kompatybilność wstecz: stare ścieżki */}
            <Route path="/admin/generate-slots" element={<Navigate to="/generate" replace />} />
            <Route path="/admin/generateslots" element={<Navigate to="/generate" replace />} />

            <Route
              path="/admin/companies"
              element={me.role !== 'client' ? <AdminCompanies lang={lang} me={me} /> : <Navigate to="/" replace />}
            />

            <Route
              path="/admin/users"
              element={me.role !== 'client' ? <AdminUsers lang={lang} me={me} /> : <Navigate to="/" replace />}
            />

            <Route
              path="/admin/docks"
              element={me.role !== 'client' ? <AdminDocks lang={lang} me={me} /> : <Navigate to="/" replace />}
            />

            <Route
              path="/admin/archive"
              element={me.role !== 'client' ? <AdminArchive lang={lang} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/calendar"
              element={me.role !== 'client' ? <AdminCalendar lang={lang} /> : <Navigate to="/" replace />}
            />

            <Route
              path="/admin/warehouses"
              element={me.role === 'superadmin' ? <AdminWarehouses lang={lang} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/admin/reports"
              element={me.role !== 'client' ? <AdminReports lang={lang} me={me} /> : <Navigate to="/" replace />}
            />

            <Route path="/test" element={<TestPage lang={lang} />} />

            <Route path="*" element={<Navigate to={me.role === 'client' ? '/' : '/slots'} replace />} />

          </Routes>
        </div>
      </div>
      {langConflict && (
        <LangConflictModal
          local={langConflict.local}
          account={langConflict.account}
          lang={lang}
          onChoose={resolveLangConflict}
        />
      )}
      <ToastContainer />
    </div>
  )
}
