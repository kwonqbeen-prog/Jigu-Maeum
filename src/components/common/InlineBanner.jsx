import Icon from '../Icon'

// C-16 InlineBanner — 화면 전체를 대체하지 않는 오류·안내용
export default function InlineBanner({ message, actionLabel, onAction, tone = 'warning' }) {
  const toneClass = tone === 'danger' ? 'text-danger' : 'text-warning'
  const bgClass = tone === 'danger' ? 'bg-danger-soft' : 'bg-warning-soft'
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${bgClass}`} role="alert">
      <Icon name="info" className={`text-[18px] ${toneClass}`} />
      <p className="flex-1 text-[13px] font-medium text-ink">{message}</p>
      {actionLabel && (
        <button type="button" onClick={onAction} className="shrink-0 text-[13px] font-medium text-ink underline">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
