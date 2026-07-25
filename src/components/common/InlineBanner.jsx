import Icon from '../Icon'

// C-16 InlineBanner — 화면 전체를 대체하지 않는 오류·안내용
export default function InlineBanner({ message, actionLabel, onAction, tone = 'warning' }) {
  const toneClass = tone === 'danger' ? 'text-danger' : 'text-warning'
  return (
    <div className="flex items-center gap-2 rounded-xl bg-warning-soft px-4 py-3" role="alert">
      <Icon name="info" className={`text-[18px] ${toneClass}`} />
      <p className="flex-1 text-[13px] font-medium text-ink">{message}</p>
      {actionLabel && (
        <button type="button" onClick={onAction} className="shrink-0 text-[13px] font-bold text-ink underline">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
