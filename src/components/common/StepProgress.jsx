// C-03 StepProgress — 단일 진행 바, 숫자 표기 없음. 스크린리더용 aria는 유지.
export default function StepProgress({ current, total }) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`${total}단계 중 ${current}단계`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
    >
      <div className="h-full rounded-full bg-ink transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  )
}
