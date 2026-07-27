import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Icon from '../components/Icon'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message, tone = 'default') => {
    clearTimeout(timerRef.current)
    setToast({ message, tone, key: Date.now() + Math.random() })
    timerRef.current = setTimeout(() => setToast(null), 2500)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 flex justify-center px-4" aria-live="polite">
          <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-surface shadow-lg">
            {toast.tone === 'danger' && <Icon name="error" className="text-[16px]" />}
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
