// C-11 SectionHeader — Section 스타일 + 우측 텍스트 액션
export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-medium text-ink">{title}</h2>
      {actionLabel && (
        <button type="button" onClick={onAction} className="text-[13px] font-medium text-ink-muted">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
