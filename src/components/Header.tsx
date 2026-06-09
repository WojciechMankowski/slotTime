import React, {useState } from 'react'
import {t, Lang, errorText } from '../Helper/i18n'
import type { Me } from '../Types/types'
import { patchMy2FA } from '../API/serviceUser'
import { toastBus } from '../Helper/toastBus'
import Menu from './Menu'

function Header({
    me,
    lang,
    onLang,
    onLogout,
    onMeChange,
}: {
    me: Me
    lang: Lang
    onLang: (l: Lang) => void
    onLogout: () => void
    onMeChange: (me: Me) => void
}) {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [saving2FA, setSaving2FA] = useState(false);

    const toggle2FA = async (next: boolean) => {
        if (saving2FA) return
        setSaving2FA(true)
        try {
            const updated = await patchMy2FA(next)
            onMeChange(updated)
            toastBus.emit('success', t(next ? 'two_factor_enabled_toast' : 'two_factor_disabled_toast', lang))
        } catch (ex: any) {
            const code = ex?.response?.data?.detail?.error_code || 'UNEXPECTED_ERROR'
            toastBus.emit('error', errorText[code] ? errorText[code][lang] : code)
        } finally {
            setSaving2FA(false)
        }
    };

    return (
    <header className="flex items-center gap-4 py-5 px-6 mb-8 bg-white/65 backdrop-blur-md relative z-(--z-header)">
            {/* container = max-width jak w starym index.html */}
            <div className="max-w-[1200px] mx-auto px-5 w-full flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {me.role !== 'client' && <Menu lang={lang} me={me} />}
                    <img
                        src={me.warehouse?.logo_path || '/static/app_logo.png'}
                        alt="logo"
                        className="h-8"
                    />
                </div>

                <div className="hidden sm:block flex-1">
                    <div className="text-[1.4rem] font-bold">Slot Booking</div>
                </div>

                <div className="relative inline-block mr-2 ml-auto sm:ml-0">
                    <button
                        className="flex items-center gap-2 bg-white border border-(--border) px-3 py-1.5 rounded-lg cursor-pointer font-medium text-(--text-main) transition-colors duration-200 shadow-sm hover:border-blue-600"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                    >
                        {lang === 'pl' ? (
                            <img src="https://flagcdn.com/w20/pl.png" alt="PL" width="20" />
                        ) : (
                            <img src="https://flagcdn.com/w20/gb.png" alt="EN" width="20" />
                        )}
                        <span>{lang.toUpperCase()}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {isLangOpen && (
                        <div className="absolute top-[calc(100%+0.4rem)] right-0 bg-white border border-(--border) rounded-lg shadow-lg min-w-[120px] z-(--z-dropdown) overflow-hidden">
                            <div
                                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-200 hover:bg-(--bg) ${
                                    lang === 'pl' ? 'bg-[#e0ecff] text-[#1d4ed8] font-semibold' : ''
                                }`}
                                onClick={() => {
                                    onLang('pl' as Lang);
                                    setIsLangOpen(false);
                                }}
                            >
                                <img src="https://flagcdn.com/w20/pl.png" alt="PL" width="20" />
                                <span>PL</span>
                            </div>
                            <div
                                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-200 hover:bg-(--bg) ${
                                    lang === 'en' ? 'bg-[#e0ecff] text-[#1d4ed8] font-semibold' : ''
                                }`}
                                onClick={() => {
                                    onLang('en' as Lang);
                                    setIsLangOpen(false);
                                }}
                            >
                                <img src="https://flagcdn.com/w20/gb.png" alt="EN" width="20" />
                                <span>EN</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative inline-block mr-2">
                    <button
                        className="flex items-center gap-2 bg-white border border-(--border) px-3 py-1.5 rounded-lg cursor-pointer font-medium text-(--text-main) transition-colors duration-200 shadow-sm hover:border-blue-600"
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="hidden sm:inline">{t('account', lang)}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {isAccountOpen && (
                        <div className="absolute top-[calc(100%+0.4rem)] right-0 bg-white border border-(--border) rounded-lg shadow-lg min-w-[240px] z-(--z-dropdown) p-3">
                            <label
                                htmlFor="toggle-2fa"
                                className={`flex items-center justify-between gap-3 ${me.email ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                            >
                                <span className="text-sm font-medium text-(--text-main)">{t('two_factor', lang)}</span>
                                <input
                                    id="toggle-2fa"
                                    type="checkbox"
                                    checked={me.two_factor_enabled}
                                    disabled={!me.email || saving2FA}
                                    onChange={(e) => toggle2FA(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded cursor-pointer focus:ring-blue-500 focus:ring-2 transition-colors duration-200 disabled:cursor-not-allowed"
                                />
                            </label>
                            {!me.email && (
                                <p className="text-xs text-gray-500 mt-1.5">{t('two_factor_email_required', lang)}</p>
                            )}
                        </div>
                    )}
                </div>

                <button
                  className="flex items-center gap-2 bg-white border border-(--border) rounded-full px-4 py-2 text-sm cursor-pointer transition-all duration-200 hover:-translate-y-px hover:border-gray-500 active:translate-y-0"
                  onClick={onLogout}
                >
                    <span className="hidden sm:inline">{t('logout', lang)}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </header>
    )
}

export default Header
