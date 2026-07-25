import BottomSheet from '../../components/common/BottomSheet'
import Icon from '../../components/Icon'
import { getPlanetStage, STAGE_THRESHOLDS } from '../../components/common/PlanetOrb'
import { ACHIEVEMENTS } from '../../data/constants'

// S-22 · 업적 목록 시트 (명세 5.2)
export default function AchievementsSheet({ totalCompleted, unlockedCodes, onClose }) {
  const current = getPlanetStage(totalCompleted)
  const nextThreshold = STAGE_THRESHOLDS.find((t) => t.min > totalCompleted)

  return (
    <BottomSheet title="마음 지구" onClose={onClose}>
      <p className="text-[14px] font-semibold text-ink">
        {current.stage}단계 · {current.name}
      </p>
      {nextThreshold && (
        <p className="mt-1 text-[13px] text-ink-muted">다음 단계까지 {nextThreshold.min - totalCompleted}개 남았어요</p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const done = unlockedCodes.includes(a.code)
          return (
            <div key={a.code} className="flex flex-col items-center gap-1.5 text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${done ? 'bg-ink' : 'bg-surface-sunken'}`}>
                <Icon name="star" filled={done} className={done ? 'text-[20px] text-surface' : 'text-[20px] text-ink-faint'} />
              </div>
              <p className="text-[12px] font-bold text-ink">{a.name}</p>
              <p className="text-[11px] text-ink-muted">{done ? '달성' : `아직 · ${a.condition}`}</p>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
