import Icon from '../Icon'

// C-08 MissionCard — §5-6. 좌측 체크 = 즉시 완료 토글, 카드 본체 탭 = 상세 시트
export default function MissionCard({ mission, onOpen, onToggle, showLike = false, onToggleLike }) {
  const completed = mission.is_completed ?? mission.isCompleted

  return (
    <div
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition ${
        completed ? 'bg-surface-sunken' : 'bg-surface-alt'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(mission)}
        aria-label={completed ? '완료 취소' : '완료로 표시'}
        aria-pressed={completed}
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition duration-300 ${
            completed ? 'scale-100 bg-ink' : 'scale-90 bg-surface border-[1.5px] border-line-input'
          }`}
        >
          {completed && <Icon name="check" className="text-[14px] text-surface" />}
        </span>
      </button>
      <button type="button" onClick={() => onOpen(mission)} className="min-w-0 flex-1 text-left">
        <p className={`line-clamp-2 text-[15px] font-bold ${completed ? 'text-ink-muted' : 'text-ink'}`}>
          {mission.title}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-ink-muted">
          {mission.description}
          {mission.est_minutes ? ` · 예상 ${mission.est_minutes}분` : ''}
        </p>
      </button>
      {showLike && (
        <button
          type="button"
          onClick={() => onToggleLike(mission)}
          aria-label={mission.liked ? '좋아요 취소' : '좋아요'}
          aria-pressed={mission.liked}
          className="flex h-11 w-11 shrink-0 items-center justify-center"
        >
          <Icon name="favorite" filled={mission.liked} className={mission.liked ? 'text-ink' : 'text-ink-faint'} />
        </button>
      )}
    </div>
  )
}
