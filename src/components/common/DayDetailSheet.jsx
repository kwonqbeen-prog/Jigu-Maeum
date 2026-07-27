import BottomSheet from './BottomSheet'
import MissionCard from './MissionCard'
import ListBlock from './ListBlock'

function formatDateLabel(dateISO) {
  return new Date(dateISO).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

// 마음 지구 탭 날짜 슬라이더에서 특정 날짜를 탭했을 때 여는 시트 — 그날 완료한 미션 + 마음 일기
export default function DayDetailSheet({ dateISO, missions, journal, onClose, onToggle, onToggleLike }) {
  return (
    <BottomSheet title={formatDateLabel(dateISO)} onClose={onClose}>
      <p className="text-[13px] font-medium text-ink-muted">해당 날짜에 완료한 미션</p>
      <div className="mt-2">
        {missions.length > 0 ? (
          <ListBlock>
            {missions.map((m) => (
              <MissionCard key={m.id} mission={m} onOpen={() => {}} onToggle={onToggle} showLike onToggleLike={onToggleLike} />
            ))}
          </ListBlock>
        ) : (
          <p className="text-[13px] text-ink-faint">이 날은 완료한 미션이 없어요.</p>
        )}
      </div>

      <p className="mt-5 text-[13px] font-medium text-ink-muted">마음 일기</p>
      <div className="mt-2 rounded-2xl bg-surface-alt px-4 py-3 text-[13px] leading-relaxed text-ink">
        {journal || <span className="text-ink-faint">작성한 마음 일기가 없어요.</span>}
      </div>
    </BottomSheet>
  )
}
