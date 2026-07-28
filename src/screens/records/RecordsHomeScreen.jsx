import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StatTile from '../../components/common/StatTile'
import MissionCard from '../../components/common/MissionCard'
import ListBlock from '../../components/common/ListBlock'
import { getAllMissions, getArchiveMissions, getStreakDays, getTotalCompletedCount, toggleMissionComplete } from '../../data/storage'

// S-50 · 기록 홈 (탭3) — 명세 6.1, 6.2, 6.3
export default function RecordsHomeScreen({ isActive = true, onOpenSettings, onOpenHistory, onOpenStreak, onOpenArchive }) {
  const [data, setData] = useState(null)

  const refresh = async () => {
    try {
      const [allMissions, archive] = await Promise.all([getAllMissions(), getArchiveMissions()])
      setData({
        streak: getStreakDays(allMissions),
        total: getTotalCompletedCount(allMissions),
        retryPreview: archive.slice(0, 2),
      })
    } catch (err) {
      console.error('[RecordsHomeScreen] refresh failed', err)
    }
  }

  useEffect(() => {
    if (!isActive) return
    refresh()
  }, [isActive])

  if (!data) return null

  return (
    <div className="flex flex-1 flex-col bg-surface pb-4">
      <AppBar title="마음 기록" variant="large" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
      <div className="flex-1 space-y-5 px-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:space-y-8 lg:px-8 lg:py-8">
        <div className="flex gap-3 lg:gap-5">
          <StatTile label="연속 실천" value={data.streak} unit="일" onClick={onOpenStreak} />
          <StatTile label="성공 미션" value={data.total} unit="개" highlight onClick={onOpenHistory} />
        </div>

        <div>
          <p className="text-[15px] font-medium text-ink lg:text-[17px]">다시 도전해요</p>
          <p className="mb-2 mt-0.5 text-[13px] text-ink-muted lg:text-[14px]">지난 미션 다시보기</p>
          {data.retryPreview.length > 0 ? (
            <>
              <ListBlock>
                {data.retryPreview.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    onOpen={() => {}}
                    onToggle={async (mission) => {
                      await toggleMissionComplete(mission)
                      refresh()
                    }}
                  />
                ))}
              </ListBlock>
              <button
                type="button"
                onClick={onOpenArchive}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-surface-alt py-3 text-[13px] font-medium text-ink lg:py-4"
              >
                더보기
                <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <div className="rounded-2xl bg-surface-alt px-4 py-6 text-center text-[13px] text-ink-muted lg:py-10">
              아직 지나간 미션이 없어요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
