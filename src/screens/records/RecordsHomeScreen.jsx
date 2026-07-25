import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StatTile from '../../components/common/StatTile'
import MissionCard from '../../components/common/MissionCard'
import PrimaryButton from '../../components/common/PrimaryButton'
import {
  getAllMissions,
  getTodayMissions,
  getReflection,
  getStreakDays,
  getTotalCompletedCount,
  getWeekDots,
  toggleMissionComplete,
  todayISO,
} from '../../data/storage'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// S-50 · 기록 홈 (탭3) — 명세 6.1, 6.2, 6.3
export default function RecordsHomeScreen({ onOpenSettings, onOpenHistory, onOpenDayWrapUp }) {
  const [data, setData] = useState(null)

  const refresh = async () => {
    const [allMissions, todayMissions, reflection] = await Promise.all([
      getAllMissions(),
      getTodayMissions(),
      getReflection(todayISO()),
    ])
    setData({
      streak: getStreakDays(allMissions),
      total: getTotalCompletedCount(allMissions),
      todayMissions,
      reflectionDone: Boolean(reflection),
      weekDots: getWeekDots(allMissions),
    })
  }

  useEffect(() => {
    refresh()
  }, [])

  if (!data) return null

  const todayDone = data.todayMissions.filter((m) => m.is_completed).length
  const showWrapUpCta = todayDone >= 1 && !data.reflectionDone

  return (
    <div className="flex min-h-svh flex-col bg-surface pb-4">
      <AppBar title="기록" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
      <div className="flex-1 space-y-5 px-4">
        <div className="flex gap-3">
          <StatTile label="연속 실천" value={data.streak} unit="일" />
          <StatTile label="누적 완료" value={data.total} unit="개" highlight />
        </div>

        {data.todayMissions.length > 0 && (
          <div>
            <p className="mb-2 text-[15px] font-bold text-ink">오늘</p>
            <div className="space-y-2">
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
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-[15px] font-bold text-ink">이번 주</p>
          <div className="flex justify-between rounded-2xl bg-surface-alt px-3 py-4">
            {data.weekDots.map((d) => {
              const isFuture = new Date(d.date) > new Date(todayISO())
              return (
                <div key={d.date} className="flex flex-col items-center gap-1.5">
                  <span
                    aria-label={`${d.date}, ${d.count}개 완료`}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      isFuture ? 'text-ink-faint' : d.count > 0 ? 'bg-ink text-surface' : 'border border-line-input text-ink-faint'
                    }`}
                  >
                    {isFuture ? '·' : d.count > 0 ? '●' : '○'}
                  </span>
                  <span className="text-[11px] text-ink-muted">{WEEKDAY_LABELS[new Date(d.date).getDay()]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {showWrapUpCta && <PrimaryButton label="오늘 하루 마무리하기" onClick={onOpenDayWrapUp} />}

        <button type="button" onClick={onOpenHistory} className="flex w-full items-center justify-between text-[14px] font-semibold text-ink">
          전체 기록 보기
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
