import Icon from '../Icon'

// CoachmarkTour 전용 커스텀 툴팁 — Joyride 기본 툴팁은 끄기 버튼/제목/설명이
// 서로 다른 규칙으로 배치되어(패딩·마진이 제각각) 그리드가 안 맞았다. 제목과 끄기
// 버튼을 같은 flex row에 두고, 이전/다음 버튼도 동일한 높이의 pill 한 쌍으로
// 만들어 앱의 다른 다이얼로그(ConfirmDialog 등)와 같은 레이아웃 규칙을 따르게 한다.
export default function CoachmarkTooltip({ backProps, closeProps, index, isLastStep, primaryProps, step, tooltipProps }) {
  return (
    <div
      {...tooltipProps}
      className="w-[320px] max-w-[90vw] rounded-2xl bg-surface p-5 text-left"
      style={{ boxShadow: 'var(--shadow-modal)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[16px] font-semibold leading-snug text-ink">{step.title}</h4>
        <button {...closeProps} type="button" className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon name="close" className="text-ink" />
        </button>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{step.content}</p>
      <div className="mt-5 flex gap-2">
        {index > 0 && (
          <button
            {...backProps}
            type="button"
            className="h-11 flex-1 rounded-full bg-surface-sunken text-[14px] font-semibold text-ink"
          />
        )}
        <button
          {...primaryProps}
          type="button"
          className="h-11 flex-1 rounded-full bg-ink text-[14px] font-semibold text-surface"
        />
      </div>
    </div>
  )
}
