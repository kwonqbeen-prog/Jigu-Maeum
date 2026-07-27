import Icon from '../Icon'

// C-06 PrimaryButton — 폭 100%(부모 기준), 높이 52, loading 시 라벨 유지 + 스피너.
// className으로 lg:max-w-*+lg:mx-auto를 넘기면 넓은 데스크탑 컨테이너 안에서도
// 버튼 자체가 가로로 과하게 늘어나지 않도록 캡을 걸 수 있다
export default function PrimaryButton({ label, onClick, loading = false, disabled = false, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium transition ${
        disabled || loading ? 'bg-disabled text-disabled-ink' : 'bg-ink text-surface active:opacity-90'
      } ${className}`}
    >
      {loading && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
      <span>{label}</span>
    </button>
  )
}
