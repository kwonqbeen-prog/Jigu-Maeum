import Icon from '../Icon'

// C-06 PrimaryButton — 폭 100%, 높이 52, loading 시 라벨 유지 + 스피너
export default function PrimaryButton({ label, onClick, loading = false, disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold transition ${
        disabled || loading ? 'bg-disabled text-disabled-ink' : 'bg-ink text-surface active:opacity-90'
      }`}
    >
      {loading && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
      <span>{label}</span>
    </button>
  )
}
