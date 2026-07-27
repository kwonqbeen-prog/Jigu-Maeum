import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import DayDetailSheet from '../../components/common/DayDetailSheet'
import { getAllMissions, getRecentReflections, getStreakDays, toggleMissionComplete, toggleMissionLike, todayISO } from '../../data/storage'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function pad(n) {
  return String(n).padStart(2, '0')
}
function isoOf(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}
function buildMonthCells(year, month) {
  const startDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDow; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  return cells
}

// 기록 탭 · 연속 실천 (월간 캘린더) — records-home의 "연속 실천" 스탯 타일에서 진입
export default function StreakCalendarScreen({ onBack }) {
  const [data, setData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  const load = () =>
    Promise.all([getAllMissions(), getRecentReflections(31)]).then(([allMissions, reflections]) => {
      setData({ allMissions, reflections, streak: getStreakDays(allMissions) })
    })

  useEffect(() => {
    load()
  }, [])

  if (!data) return null

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const cells = buildMonthCells(year, month)

  const missionsForDate = (date) => data.allMissions.filter((m) => m.is_completed && m.created_date === date)
  const journalForDate = (date) => data.reflections.find((r) => r.date === date)?.content ?? null
  const hasDataOn = (date) => missionsForDate(date).length > 0 || Boolean(journalForDate(date))

  const handleToggle = async (mission) => {
    await toggleMissionComplete(mission)
    load()
  }
  const handleToggleLike = async (mission) => {
    await toggleMissionLike(mission)
    load()
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-2xl">
      <AppBar title={`연속 실천 ${data.streak}일`} leading="back" onLeadingClick={onBack} />
      <div className="flex-1 px-4 py-4">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="pb-1 text-center text-[11px] font-semibold text-ink-faint">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={`blank-${i}`} />
            const dateISO = isoOf(year, month, d)
            const isToday = dateISO === todayISO()
            return (
              <button
                key={dateISO}
                type="button"
                onClick={() => setSelectedDate(dateISO)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border-[1.5px] bg-surface-alt text-[13px] font-semibold text-ink ${
                  isToday ? 'border-accent' : 'border-transparent'
                }`}
              >
                {d}
                <span className={`h-1.5 w-1.5 rounded-full ${hasDataOn(dateISO) ? 'day-dot--active' : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
      </div>

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
