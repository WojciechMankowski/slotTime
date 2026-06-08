import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { t, Lang, errorText } from '../Helper/i18n'
import { toastBus } from '../Helper/toastBus'
import { forgotPassword, verifyResetCode, resetPassword } from '../API/serviceUser'

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:bg-white transition-colors'

const buttonClass =
  'w-full bg-linear-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 mt-1'

const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wide'

export default function ForgotPassword({
  lang,
  onLang,
}: {
  lang: Lang
  onLang: (l: Lang) => void
}) {
  const nav = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const showError = (ex: any) => {
    const codeErr = ex?.response?.data?.detail?.error_code || 'UNEXPECTED_ERROR'
    setErr(errorText[codeErr] ? errorText[codeErr][lang] : codeErr)
  }

  // Krok 1 — wysłanie kodu (backend zawsze zwraca 200, więc zawsze przechodzimy dalej)
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErr(null)
    setLoading(true)
    try {
      await forgotPassword(email)
      setInfo(t('code_sent_info', lang))
      setStep(2)
    } catch (ex: any) {
      showError(ex)
    } finally {
      setLoading(false)
    }
  }

  // Krok 2 — weryfikacja kodu (bez konsumpcji)
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErr(null)
    setLoading(true)
    try {
      await verifyResetCode(email, code)
      setInfo(null)
      setStep(3)
    } catch (ex: any) {
      showError(ex)
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (loading) return
    setErr(null)
    setLoading(true)
    try {
      await forgotPassword(email)
      setInfo(t('code_sent_info', lang))
    } catch (ex: any) {
      showError(ex)
    } finally {
      setLoading(false)
    }
  }

  // Krok 3 — ustawienie nowego hasła
  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErr(null)
    if (newPassword.length < 8) {
      setErr(t('password_too_short', lang))
      return
    }
    if (newPassword !== confirmPassword) {
      setErr(t('passwords_mismatch', lang))
      return
    }
    setLoading(true)
    try {
      await resetPassword(email, code, newPassword)
      toastBus.emit('success', t('reset_success', lang))
      nav('/login')
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
            {/* Przełącznik języka */}
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
              {t('forgot_password_title', lang)}
            </h2>
            <p className="text-blue-200 text-xs mt-0.5">
              {t('system_subtitle', lang)}
            </p>
          </div>

          {/* Treść */}
          <div className="px-8 py-7">
            {step === 1 && (
              <form onSubmit={submitEmail} className="grid gap-4">
                <p className="text-[13px] text-gray-500">{t('forgot_password_desc', lang)}</p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className={labelClass}>{t('email', lang)}</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? t('loading', lang) : t('send_code', lang)}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={submitCode} className="grid gap-4">
                {info && (
                  <div className="text-[13px] text-gray-600 bg-blue-50 border border-blue-200 rounded-lg py-2 px-3">
                    {info}
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className={labelClass}>{t('code', lang)}</label>
                  <input
                    id="code"
                    type="text"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className={`${inputClass} tracking-[0.4em] text-center`}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    required
                  />
                </div>
                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? t('loading', lang) : t('verify', lang)}
                </button>
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

            {step === 3 && (
              <form onSubmit={submitNewPassword} className="grid gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new_password" className={labelClass}>{t('new_password', lang)}</label>
                  <input
                    id="new_password"
                    type="password"
                    name="new_password"
                    autoComplete="new-password"
                    className={inputClass}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm_password" className={labelClass}>{t('confirm_password', lang)}</label>
                  <input
                    id="confirm_password"
                    type="password"
                    name="confirm_password"
                    autoComplete="new-password"
                    className={inputClass}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={buttonClass} disabled={loading}>
                  {loading ? t('loading', lang) : t('reset_password_action', lang)}
                </button>
              </form>
            )}

            {err && (
              <div role="alert" className="text-red-600 text-[13px] text-center bg-red-50 border border-red-200 rounded-lg py-2 px-3 mt-4">
                {err}
              </div>
            )}

            <div className="text-center mt-5">
              <NavLink to="/login" className="text-xs text-blue-600 hover:text-blue-800">
                {t('back_to_login', lang)}
              </NavLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
