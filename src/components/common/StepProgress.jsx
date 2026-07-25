// C-03 StepProgress — 상단 분할 바, aria-valuenow 필수, 우상단에 n/total 텍스트 병기
export default function StepProgress({ current, total }) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${total}단계 중 ${current}단계`}
        className="flex flex-1 gap-1.5"
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < current ? 'bg-ink' : 'bg-surface-sunken'}`}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-medium text-ink-muted">
        {current} / {total}
      </span>
    </div>
  )
}
