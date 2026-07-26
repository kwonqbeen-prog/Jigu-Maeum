import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StatTile from '../../components/common/StatTile'
import MissionCard from '../../components/common/MissionCard'
import ListBlock from '../../components/common/ListBlock'
import { getAllMissions, getTodayMissions, getArchiveMissions, getStreakDays, getTotalCompletedCount, toggleMissionComplete } from '../../data/storage'

// S-50 · 기록 홈 (탭3) — 명세 6.1, 6.2, 6.3
export default function RecordsHomeScreen({ onOpenSettings, onOpenHistory, onOpenStreak, onOpenArchive }) {
  const [data, setData] = useState(null)

  const refresh = async () => {
    const [allMissions, todayMissions, archive] = await Promise.all([getAllMissions(), getTodayMissions(), getArchiveMissions()])
    setData({
      streak: getStreakDays(allMissions),
      total: getTotalCompletedCount(allMissions),
      todayMissions,
      retryPreview: archive.slice(0, 2),
    })
  }

  useEffect(() => {
    refresh()
  }, [])

  if (!data) return null

  return (
    <div className="flex min-h-svh flex-col bg-surface pb-4">
      <AppBar title="마음 기록" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
      <div className="flex-1 space-y-5 px-4">
        <div className="flex gap-3">
          <StatTile label="연속 실천" value={data.streak} unit="일" onClick={onOpenStreak} />
          <StatTile label="성공 미션" value={data.total} unit="개" highlight onClick={onOpenHistory} />
        </div>

        {data.todayMissions.length > 0 && (
          <div>
            <p className="mb-2 text-[15px] font-bold text-ink">오늘</p>
            <ListBlock>
              {data.todayMissions.map((m) => (
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
          </div>
        )}

        {data.retryPreview.length > 0 && (
          <div>
            <p className="text-[15px] font-bold text-ink">다시 도전해요</p>
            <p className="mb-2 mt-0.5 text-[13px] text-ink-muted">지난 미션 다시보기</p>
            <ListBlock>
              {data.retryPreview.map((m) => (
                <div key={m.id} className="flex items-center px-4 py-3">
                  <p className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">{m.title}</p>
                </div>
              ))}
            </ListBlock>
            <button
              type="button"
              onClick={onOpenArchive}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-surface-alt py-3 text-[13px] font-semibold text-ink"
            >
              더보기
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
