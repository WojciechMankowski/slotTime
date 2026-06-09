import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { api, setToken, setRefreshToken } from '../API/api'
import { loginVerify } from '../API/serviceUser'
import { t, Lang, errorText } from '../Helper/i18n'

export default function Login({
  lang,
  onLang,
  onLoggedIn,
}: {
  lang: Lang
  onLang: (l: Lang) => void
  onLoggedIn: () => void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [preAuthToken, setPreAuthToken] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const showError = (ex: any, fallback = 'BAD_CREDENTIALS') => {
    const c = ex?.response?.data?.detail?.error_code || fallback
    setErr(errorText[c] ? errorText[c][lang] : c)
  }

  // Krok 1 — login/hasło. Przy włączonym 2FA backend zwraca pre_auth_token zamiast tokenów.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setErr(null)
    setLoading(true)
    try {
      const res = await api.post('/api/login', { username, password })
      if (res.data.two_factor_required) {
        setPreAuthToken(res.data.pre_auth_token)
        setCode('')
        setStep(2)
        return
      }
      setToken(res.data.access_token)
      setRefreshToken(res.data.refresh_token)
      await onLoggedIn()
    } catch (ex: any) {
      showError(ex)
    } finally {
      setLoading(false)
    }
  }

  // Krok 2 — weryfikacja kodu z e-maila.
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErr(null)
    if (!/^\d{6}$/.test(code)) {
      setErr(t('code_invalid', lang))
      return
    }
    setLoading(true)
    try {
      const data = await loginVerify(preAuthToken, code)
      setToken(data.access_token)
      setRefreshToken(data.refresh_token)
      await onLoggedIn()
    } catch (ex: any) {
      showError(ex, 'INVALID_CODE')
    } finally {
      setLoading(false)
    }
  }

  // Ponowne wysłanie kodu — backend przy każdym /login generuje i wysyła nowy kod.
  const resendCode = async () => {
    if (loading) return
    setErr(null)
    setLoading(true)
    try {
      const res = await api.post('/api/login', { username, password })
      if (res.data.two_factor_required) setPreAuthToken(res.data.pre_auth_token)
    } catch (ex: any) {
      showError(ex)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url(/logo-MCG-background.png)' }}
    >
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Nagłówek karty */}
          <div className="relative bg-linear-to-br from-blue-600 to-blue-800 px-8 py-6 text-center">
            {/* Przełącznik języka (dotyczy tylko ekranu logowania) */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {(['pl', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-label={l.toUpperCase()}
                  onClick={() => onLang(l)}
                  className={`flex items-center justify-center rounded-md p-1 transition-opacity ${lang === l ? 'opacity-100 ring-2 ring-white/80' : 'opacity-50 hover:opacity-80'}`}
                >
                  <img
                    src={l === 'pl' ? 'https://flagcdn.com/w20/pl.png' : 'https://flagcdn.com/w20/gb.png'}
                    alt={l.toUpperCase()}
                    width="20"
                  />
                </button>
              ))}
            </div>
            <img
              src="/static/MCG-logo.png"
              alt="Logo"
              className="h-8 mx-auto mb-3 brightness-0 invert"
            />
            <h2 className="text-lg font-bold text-white tracking-wide">
              {t('login_title', lang)}
            </h2>
            <p className="text-blue-200 text-xs mt-0.5">
              {t('system_subtitle', lang)}
            </p>
          </div>

          {/* Formularz */}
          <div className="px-8 py-7">
            {step === 1 && (
              <form onSubmit={submit} className="grid gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('username', lang)}
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:bg-white transition-colors"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('password', lang)}
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:bg-white transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 mt-1"
                  disabled={loading}
                >
                  {loading ? t('loading', lang) : t('sign_in', lang)}
                </button>

                {err && (
                  <div role="alert" className="text-red-600 text-[13px] text-center bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                    {err}
                  </div>
                )}

                <NavLink to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 text-center mt-1">
                  {t('forgot_password', lang)}
                </NavLink>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={submitCode} className="grid gap-4">
                <p className="text-[13px] text-gray-500">{t('login_2fa_desc', lang)}</p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('code', lang)}
                  </label>
                  <input
                    id="code"
                    type="text"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:bg-white transition-colors tracking-[0.4em] text-center"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 mt-1"
                  disabled={loading}
                >
                  {loading ? t('loading', lang) : t('verify', lang)}
                </button>

                {err && (
                  <div role="alert" className="text-red-600 text-[13px] text-center bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                    {err}
                  </div>
                )}

                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 text-center disabled:opacity-60"
                >
                  {t('resend_code', lang)}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
