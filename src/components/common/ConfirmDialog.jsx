// C-15 ConfirmDialog — 파괴적 동작은 danger
export default function ConfirmDialog({ title, body, confirmLabel, cancelLabel = '취소', tone = 'default', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button type="button" aria-label="취소" onClick={onCancel} className="absolute inset-0 bg-black/40" />
      <div role="alertdialog" aria-modal="true" aria-label={title} className="relative w-full max-w-xs rounded-2xl bg-surface-alt p-5">
        <h2 className="text-[16px] font-medium text-ink">{title}</h2>
        {body && <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{body}</p>}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-full bg-surface-sunken text-[14px] font-medium text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 flex-1 rounded-full text-[14px] font-medium ${
              tone === 'danger' ? 'bg-danger text-white' : 'bg-ink text-surface'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
