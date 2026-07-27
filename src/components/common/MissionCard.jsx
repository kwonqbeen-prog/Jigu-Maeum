import Icon from '../Icon'

// 미션 타입(carbon/nature/social)별 아이콘 배지 — 배경 그라데이션은 index.css의
// .mission-type-icon[data-mission-type] 참고
const MISSION_TYPE_META = {
  carbon: { icon: 'footprint' },
  nature: { icon: 'nature' },
  social: { icon: 'digital_wellbeing' },
}

// C-08 MissionCard — 리스트 행(row) 하나. 배경/구분선은 부모 ListBlock이 담당한다.
// 오른쪽 끝은 기본 완료 체크 서클이지만, trailing을 주면 그걸로 대체된다(예: 보관함의
// "다시 도전" 버튼). 둘째 줄도 기본은 mission.description+예상 시간이지만, subtitle을
// 주면 그걸로 대체된다(예: 보관함의 날짜). 카드 본체 탭 = 상세 시트(onOpen)
export default function MissionCard({ mission, onOpen, onToggle, showLike = false, onToggleLike, subtitle, trailing }) {
  const completed = mission.is_completed ?? mission.isCompleted
  const typeMeta = MISSION_TYPE_META[mission.type]

  return (
    <div className="flex w-full items-center gap-3 px-4 py-3">
      {typeMeta && (
        <span
          className="mission-type-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          data-mission-type={mission.type}
        >
          <Icon name={typeMeta.icon} className="text-[20px] text-ink" />
        </span>
      )}
      <button type="button" onClick={() => onOpen(mission)} className="min-w-0 flex-1 text-left">
        <p className={`line-clamp-2 text-[15px] font-bold ${completed ? 'text-ink-muted' : 'text-ink'}`}>
          {mission.title}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-ink-muted">
          {subtitle ?? `${mission.description}${mission.est_minutes ? ` · 예상 ${mission.est_minutes}분` : ''}`}
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
      {trailing ?? (
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
      )}
    </div>
  )
}
