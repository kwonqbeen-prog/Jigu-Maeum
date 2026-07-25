import { useEffect, useRef } from 'react'

// C-14 BottomSheet — 드래그 핸들, 스크림 탭 시 닫힘, 최대 90dvh, 포커스 트랩
export default function BottomSheet({ title, children, onClose }) {
  const sheetRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    sheetRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90dvh] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-[20px] bg-surface-alt px-5 pb-6 pt-3 focus:outline-none"
      >
        <div className="mx-auto mb-2 h-1 w-9 shrink-0 rounded-full bg-surface-sunken" aria-hidden="true" />
        {title && <h2 className="mb-2 text-[20px] font-bold text-ink">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
