import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import SegmentedControl from '../../components/common/SegmentedControl'
import EmptyState from '../../components/common/EmptyState'
import MissionCard from '../../components/common/MissionCard'
import ListBlock from '../../components/common/ListBlock'
import { getAllMissions, toggleMissionComplete, toggleMissionLike } from '../../data/storage'

// S-51 · 완료 히스토리 (명세 6.6)
export default function HistoryScreen({ onBack, onStartCheckin }) {
  const [filter, setFilter] = useState('completed')
  const [missions, setMissions] = useState(null)

  const refresh = () => getAllMissions().then(setMissions)

  useEffect(() => {
    refresh()
  }, [])

  if (missions === null) return null

  const handleToggle = async (mission) => {
    await toggleMissionComplete(mission)
    refresh()
  }
  const handleToggleLike = async (mission) => {
    await toggleMissionLike(mission)
    refresh()
  }

  const list = filter === 'completed' ? missions.filter((m) => m.is_completed) : missions
  const groups = new Map()
  for (const m of list) {
    const key = m.created_date
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(m)
  }
  const sortedDates = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <AppBar title="완료 히스토리" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-4 px-4 py-4">
        <SegmentedControl
          items={[
            { value: 'completed', label: '완료한 미션만' },
            { value: 'all', label: '전체 보기' },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {sortedDates.length === 0 ? (
          <EmptyState title="아직 기록이 없어요" actionLabel="오늘의 마음 확인하기" onAction={onStartCheckin} />
        ) : (
          sortedDates.map((date) => {
            const rows = groups.get(date)
            const doneCount = rows.filter((m) => m.is_completed).length
            return (
              <div key={date}>
                <p className="text-[13px] font-bold text-ink-muted">
                  {date} · {doneCount}개 마침
                </p>
                <div className="mt-2">
                  <ListBlock>
                    {rows.map((m) => (
                      <MissionCard
                        key={m.id}
                        mission={m}
                        onOpen={() => {}}
                        onToggle={handleToggle}
                        showLike
                        onToggleLike={handleToggleLike}
                      />
                    ))}
                  </ListBlock>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
