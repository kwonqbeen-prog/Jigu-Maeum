import { useCallback, useEffect, useRef, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import PlanetOrb, { getPlanetStage } from '../../components/common/PlanetOrb'
import PrimaryButton from '../../components/common/PrimaryButton'
import {
  getAllMissions,
  getTodayMissions,
  getTodayCheckin,
  getRecentReflections,
  getAchievements,
  getReflectionsCount,
  getStreakDays,
  getAllTypesCompleted,
  getTotalCompletedCount,
  unlockAchievement,
  toggleMissionComplete,
  toggleMissionLike,
  todayISO,
  daysAgoISO,
} from '../../data/storage'
import { evaluateAchievements } from '../../data/achievementRules'
import AchievementsSheet from './AchievementsSheet'
import DayDetailSheet from '../../components/common/DayDetailSheet'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function last7Dates() {
  const dates = []
  for (let i = 6; i >= 0; i -= 1) dates.push(daysAgoISO(i))
  return dates
}

// S-20 · 마음 지구 (홈, 탭1) — 명세 5.1, 5.2, 6.1
export default function HomeScreen({ isActive = true, onStartCheckin, onGoMissions, onOpenSettings, onOpenArchive }) {
  const [data, setData] = useState(null)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const sliderRef = useRef(null)
  const dragRef = useRef({ dragging: false, moved: false, startX: 0, startScroll: 0 })

  const load = useCallback(async () => {
    const [allMissions, todayMissions, todayCheckin, reflections, achievements, reflectionsCount] = await Promise.all([
      getAllMissions(),
      getTodayMissions(),
      getTodayCheckin(),
      getRecentReflections(6),
      getAchievements(),
      getReflectionsCount(),
    ])
    const totalCompleted = getTotalCompletedCount(allMissions)
    const streak = getStreakDays(allMissions)
    const allTypesCompleted = getAllTypesCompleted(allMissions)

    const earnedCodes = evaluateAchievements({ totalCompleted, streak, allTypesCompleted, reflectionsCount })
    const existingCodes = new Set(achievements.map((a) => a.code))
    const newCodes = earnedCodes.filter((c) => !existingCodes.has(c))
    await Promise.all(newCodes.map((code) => unlockAchievement(code)))

    setData({
      totalCompleted,
      streak,
      todayMissions,
      allMissions,
      reflections,
      todayCheckinExists: Boolean(todayCheckin && todayCheckin.status === 'completed'),
      achievements: [...achievements.map((a) => a.code), ...newCodes],
    })
  }, [])

  useEffect(() => {
    if (!isActive) return
    let cancelled = false
    load().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [load, isActive])

  useEffect(() => {
    const onMove = (e) => {
      const s = dragRef.current
      if (!s.dragging || !sliderRef.current) return
      const dx = e.clientX - s.startX
      if (Math.abs(dx) > 6) s.moved = true
      sliderRef.current.scrollLeft = s.startScroll - dx
    }
    const onUp = () => {
      dragRef.current.dragging = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-svh flex-col bg-surface">
        <AppBar title="마음 지구" variant="large" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
        <div className="flex-1" />
      </div>
    )
  }

  const remaining = data.todayMissions.filter((m) => !m.is_completed)
  const allDone = data.todayMissions.length > 0 && remaining.length === 0
  const { stage, name } = getPlanetStage(data.totalCompleted)

  let cta = { label: '오늘의 마음 확인하기', onClick: onStartCheckin }
  if (data.todayCheckinExists && remaining.length > 0) {
    cta = { label: '오늘의 미션 보기', onClick: onGoMissions }
  } else if (allDone) {
    cta = { label: '미션 더 둘러보기', onClick: onOpenArchive }
  }

  const decorations = data.achievements.slice(0, 3).map((code) => ({
    code,
    icon: 'star',
  }))

  const dates = last7Dates()
  const missionsForDate = (date) => data.allMissions.filter((m) => m.is_completed && m.created_date === date)
  const journalForDate = (date) => data.reflections.find((r) => r.date === date)?.content ?? null
  const hasDataOn = (date) => missionsForDate(date).length > 0 || Boolean(journalForDate(date))

  const handlePointerDown = (e) => {
    dragRef.current = { dragging: true, moved: false, startX: e.clientX, startScroll: sliderRef.current.scrollLeft }
  }
  const handleChipClick = (date) => {
    if (dragRef.current.moved) return
    setSelectedDate(date)
  }

  const handleToggle = async (mission) => {
    await toggleMissionComplete(mission)
    load()
  }
  const handleToggleLike = async (mission) => {
    await toggleMissionLike(mission)
    load()
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <AppBar
        title="마음 지구"
        variant="large"
        actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings, dataTour: 'settings-icon' }]}
      />
      <div className="flex-1 px-4 pb-4">
        <div className="h-[40dvh]" data-tour="planet-orb">
          <PlanetOrb totalCompleted={data.totalCompleted} decorations={decorations} onClick={() => setAchievementsOpen(true)} />
        </div>
        <p className="text-center text-[12px] font-medium text-ink-muted">
          {stage}단계 · {name}
        </p>

        {data.todayCheckinExists && data.todayMissions.length > 0 && (
          <button type="button" onClick={onGoMissions} className="mt-4 w-full py-1 text-left">
            <div className="flex items-center justify-between text-[13px] font-bold text-ink">
              <span>오늘의 미션</span>
              <span>
                {data.todayMissions.length - remaining.length} / {data.todayMissions.length}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className="h-full bg-ink"
                style={{
                  width: `${((data.todayMissions.length - remaining.length) / data.todayMissions.length) * 100}%`,
                }}
              />
            </div>
          </button>
        )}

        <div className="mt-4" data-tour="home-cta">
          <PrimaryButton label={cta.label} onClick={cta.onClick} />
        </div>

        <div
          ref={sliderRef}
          onPointerDown={handlePointerDown}
          className="mt-4 flex cursor-grab select-none gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {dates.map((date) => {
            const isToday = date === todayISO()
            const dow = WEEKDAY_LABELS[new Date(date).getDay()]
            const day = new Date(date).getDate()
            return (
              <button
                key={date}
                type="button"
                onClick={() => handleChipClick(date)}
                className={`flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-2xl border-[1.5px] py-2 ${
                  isToday ? 'border-accent' : 'border-transparent'
                } bg-surface-alt`}
              >
                <span className="text-[10px] font-semibold text-ink-faint">{dow}</span>
                <span className="text-[13px] font-bold text-ink">{day}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${hasDataOn(date) ? 'day-dot--active' : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
      </div>

      {achievementsOpen && (
        <AchievementsSheet
          totalCompleted={data.totalCompleted}
          unlockedCodes={data.achievements}
          onClose={() => setAchievementsOpen(false)}
        />
      )}

      {selectedDate && (
        <DayDetailSheet
          dateISO={selectedDate}
          missions={missionsForDate(selectedDate)}
          journal={journalForDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onToggle={handleToggle}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  )
}
