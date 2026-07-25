import PrimaryButton from './PrimaryButton'

// C-12 EmptyState — 반드시 다음 행동 버튼 포함
export default function EmptyState({ title, body, actionLabel, onAction, secondaryLabel, onSecondary }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-alt px-6 py-10 text-center">
      <div>
        <p className="text-[15px] font-bold text-ink">{title}</p>
        {body && <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{body}</p>}
      </div>
      {actionLabel && (
        <div className="w-full max-w-xs">
          <PrimaryButton label={actionLabel} onClick={onAction} />
        </div>
      )}
      {secondaryLabel && (
        <button type="button" onClick={onSecondary} className="text-[13px] font-semibold text-ink-muted">
          {secondaryLabel}
        </button>
      )}
    </div>
  )
}
