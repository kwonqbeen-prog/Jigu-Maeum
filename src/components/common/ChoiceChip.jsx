import Icon from '../Icon'

// C-04 ChoiceChip — 최소 높이 44, 선택 시 배경+테두리+체크 아이콘 (색만으로 구분 금지)
export default function ChoiceChip({ label, hint, selected, disabled, onClick, role = 'radio' }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        selected
          ? 'bg-accent-soft border-[1.5px] border-accent'
          : 'bg-white border-[1.5px] border-transparent'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          selected ? 'bg-ink' : 'bg-surface-sunken'
        }`}
        aria-hidden="true"
      >
        {selected && <Icon name="check" className="text-[14px] text-surface" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{hint}</span>}
      </span>
    </button>
  )
}
