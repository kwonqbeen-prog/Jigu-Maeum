import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import MissionCard from '../../components/common/MissionCard'
import SectionHeader from '../../components/common/SectionHeader'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/Icon'
import MissionDetailSheet from './MissionDetailSheet'
import { getTodayMissions, toggleMissionComplete, toggleMissionLike } from '../../data/storage'

// S-40 · 오늘의 미션 (탭2, 명세 4.4, 4.5, 6.1)
export default function TodayMissionsScreen({ onOpenSettings, onStartCheckin, onOpenArchive, onOpenDayWrapUp }) {
  const [missions, setMissions] = useState(null)
  const [selected, setSelected] = useState(null)

  const refresh = () => getTodayMissions().then(setMissions)

  useEffect(() => {
    refresh()
  }, [])

  if (missions === null) {
    return (
      <div className="flex min-h-svh flex-col bg-surface">
        <AppBar title="미션" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
        <div className="space-y-2 px-4 py-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-alt" />
          ))}
        </div>
      </div>
    )
  }

  const remaining = missions.filter((m) => !m.is_completed)
  const completed = missions.filter((m) => m.is_completed)
  const allDone = missions.length > 0 && remaining.length === 0

  const handleToggle = async (mission) => {
    await toggleMissionComplete(mission)
    refresh()
  }
  const handleToggleLike = async (mission) => {
    await toggleMissionLike(mission)
    refresh()
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface pb-4">
      <AppBar title="미션" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
      <div className="flex-1 space-y-5 px-4">
        {missions.length === 0 ? (
          <EmptyState
            title="아직 오늘 미션이 없어요"
            body="지금 마음을 알려주시면 맞는 미션을 찾아드릴게요"
            actionLabel="오늘의 마음 확인하기"
            onAction={onStartCheckin}
            secondaryLabel="지난 미션 보관함"
            onSecondary={onOpenArchive}
          />
        ) : (
          <>
            <div className="flex items-center justify-between text-[13px] font-semibold text-ink-muted">
              <span>
                오늘 {completed.length} / {missions.length}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full bg-ink transition-all"
                style={{ width: `${missions.length ? (completed.length / missions.length) * 100 : 0}%` }}
              />
            </div>

            {allDone && (
              <div className="rounded-2xl bg-surface-alt px-4 py-3">
                <p className="flex items-center gap-2 text-[14px] font-bold text-ink">
                  <Icon name="celebration" /> 오늘 미션을 다 마쳤어요
                </p>
                <button type="button" onClick={onOpenDayWrapUp} className="mt-2 text-[13px] font-bold text-ink underline">
                  하루 마무리하기
                </button>
              </div>
            )}

            {remaining.length > 0 && (
              <div>
                <SectionHeader title="남은 미션" />
                <div className="mt-2 space-y-2">
                  {remaining.map((m) => (
                    <MissionCard key={m.id} mission={m} onOpen={setSelected} onToggle={handleToggle} />
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <SectionHeader title="마친 미션" />
                <div className="mt-2 space-y-2">
                  {completed.map((m) => (
                    <MissionCard
                      key={m.id}
                      mission={m}
                      onOpen={setSelected}
                      onToggle={handleToggle}
                      showLike
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenArchive}
              className="w-full rounded-full bg-surface-alt py-3 text-[14px] font-bold text-ink"
            >
              미션 보관함 둘러보기
            </button>
          </>
        )}
      </div>

      {selected && (
        <MissionDetailSheet
          mission={selected}
          onClose={() => setSelected(null)}
          onToggle={async (m) => {
            await handleToggle(m)
            setSelected(null)
          }}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  )
}
