import BottomSheet from '../../components/common/BottomSheet'
import PrimaryButton from '../../components/common/PrimaryButton'
import Icon from '../../components/Icon'

// S-41 · 미션 상세 시트 (명세 4.3, 4.4, 6.4)
export default function MissionDetailSheet({ mission, onClose, onToggle, onToggleLike }) {
  return (
    <BottomSheet title={mission.title} onClose={onClose}>
      <p className="text-[13px] text-ink-muted">{mission.est_minutes ? `예상 ${mission.est_minutes}분` : ''}</p>

      {mission.why && (
        <div className="mt-5">
          <p className="text-[13px] font-bold text-ink-muted">왜 이 미션인가요</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{mission.why}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggleLike(mission)}
        className="mt-5 flex items-center gap-2 text-[14px] font-semibold text-ink"
      >
        <Icon name="favorite" filled={mission.liked} className={mission.liked ? 'text-ink' : 'text-ink-faint'} />
        이런 미션 좋아요
      </button>

      <div className="mt-6">
        <PrimaryButton
          label={mission.is_completed ? '완료 취소' : '완료했어요'}
          onClick={() => onToggle(mission)}
        />
      </div>
    </BottomSheet>
  )
}
