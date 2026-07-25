// C-07 GhostButton — 테두리 없는 텍스트 버튼
export default function GhostButton({ label, onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 items-center justify-center px-2 text-[14px] font-semibold text-ink-muted disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  )
}
