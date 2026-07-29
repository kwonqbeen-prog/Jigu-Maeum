import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'jigu-maeum:display-settings'

export const THEME_OPTIONS = ['light', 'dark', 'system', 'high-contrast']
// 화면설계서 §5-1 / §7.1: 없음 / 적록 1형(protanopia) / 적록 2형(deuteranopia) / 청황형(tritanopia)
export const COLORBLIND_OPTIONS = ['none', 'protanopia', 'deuteranopia', 'tritanopia']
// 글자 크기: 화면설계서 §7.1 5단계 슬라이더 (100~200%)
export const FONT_SCALE_STEPS = [1, 1.25, 1.5, 1.75, 2]

export const DEFAULT_SETTINGS = {
  theme: 'system',
  colorblind: 'none',
  fontScale: 1,
  reduceMotion: false,
  boldText: false,
  themeOnboardingSeen: false,
}

export function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function systemPrefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// WCAG 2.1 SC 1.4.4(Resize Text)는 200%까지 콘텐츠 손실 없이 확대 가능해야 한다고
// 명시한다. 실제로 채팅 버블/미션 카드/시작 화면을 200%로 렌더링해서 레이아웃이
// 깨지지 않는 것을 확인한 뒤 상한을 200%로 맞췄다.
function clampFontScale(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(2, Math.max(0.9, n))
}

function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS }
  return {
    theme: THEME_OPTIONS.includes(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
    colorblind: COLORBLIND_OPTIONS.includes(raw.colorblind) ? raw.colorblind : DEFAULT_SETTINGS.colorblind,
    fontScale: clampFontScale(raw.fontScale ?? DEFAULT_SETTINGS.fontScale),
    reduceMotion: Boolean(raw.reduceMotion),
    boldText: Boolean(raw.boldText),
    themeOnboardingSeen: Boolean(raw.themeOnboardingSeen),
  }
}

function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return sanitize(raw)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function writeLocal(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // 저장 실패해도 앱 사용에는 지장 없음(다음 세션에 로컬 복원만 안 될 뿐)
  }
}

function resolveTheme(theme) {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return theme
}

const ThemeContext = createContext(null)

export function ThemeProvider({ auth, children }) {
  const [settings, setSettings] = useState(readLocal)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved
  const syncedFromServerRef = useRef(false)
  const saveTimerRef = useRef(null)

  const resolvedTheme = useMemo(() => resolveTheme(settings.theme), [settings.theme])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', resolvedTheme)
    root.setAttribute('data-colorblind', settings.colorblind)
    root.setAttribute('data-motion', settings.reduceMotion ? 'reduced' : 'normal')
    if (settings.boldText) {
      root.setAttribute('data-bold-text', 'true')
    } else {
      root.removeAttribute('data-bold-text')
    }
    root.style.setProperty('--font-scale', String(settings.fontScale))
  }, [resolvedTheme, settings.colorblind, settings.reduceMotion, settings.boldText, settings.fontScale])

  useEffect(() => {
    if (settings.theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => document.documentElement.setAttribute('data-theme', resolveTheme('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [settings.theme])

  // 서버(로그인 사용자)에 저장된 설정이 있으면 그걸 우선 적용, 없으면 지금 로컬 값을 최초 1회 업로드
  useEffect(() => {
    if (!auth?.user || syncedFromServerRef.current) return
    syncedFromServerRef.current = true
    const serverSettings = auth.user.user_metadata?.display_settings
    if (serverSettings) {
      setSettings(sanitize(serverSettings))
    } else {
      auth.updateUserMetadata?.({ display_settings: settings })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user])

  useEffect(() => {
    writeLocal(settings)
    if (!auth?.user) return undefined
    setSaveState('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      await auth.updateUserMetadata?.({ display_settings: settings })
      setSaveState('saved')
    }, 600)
    return () => clearTimeout(saveTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const update = useCallback((partial) => {
    setSettings((prev) => sanitize({ ...prev, ...partial }))
  }, [])

  const saveNow = useCallback(async () => {
    clearTimeout(saveTimerRef.current)
    setSaveState('saving')
    if (auth?.user) {
      await auth.updateUserMetadata?.({ display_settings: settings })
    }
    setSaveState('saved')
  }, [auth, settings])

  const toggleQuickTheme = useCallback(() => {
    setSettings((prev) => sanitize({ ...prev, theme: resolveTheme(prev.theme) === 'dark' ? 'light' : 'dark' }))
  }, [])

  const value = useMemo(
    () => ({
      settings,
      resolvedTheme,
      saveState,
      setTheme: (theme) => update({ theme }),
      setColorblind: (colorblind) => update({ colorblind }),
      setFontScale: (fontScale) => update({ fontScale: clampFontScale(fontScale) }),
      setReduceMotion: (reduceMotion) => update({ reduceMotion }),
      setBoldText: (boldText) => update({ boldText }),
      markThemeOnboardingSeen: () => update({ themeOnboardingSeen: true }),
      toggleQuickTheme,
      saveNow,
    }),
    [settings, resolvedTheme, saveState, update, toggleQuickTheme, saveNow],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme은 ThemeProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
