import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import SegmentedControl from '../../components/common/SegmentedControl'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/Icon'
import { getAllMissions } from '../../data/storage'

// S-51 · 완료 히스토리 (명세 6.6)
export default function HistoryScreen({ onBack, onStartCheckin }) {
  const [filter, setFilter] = useState('completed')
  const [missions, setMissions] = useState(null)

  useEffect(() => {
    getAllMissions().then(setMissions)
  }, [])

  if (missions === null) return null

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
                <div className="mt-2 space-y-2">
                  {rows.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 rounded-xl bg-surface-alt px-4 py-3">
                      <Icon name={m.is_completed ? 'check_circle' : 'radio_button_unchecked'} filled={m.is_completed} className={m.is_completed ? 'text-ink' : 'text-ink-faint'} />
                      <span className="flex-1 truncate text-[14px] text-ink">{m.title}</span>
                      {m.liked && <Icon name="favorite" filled className="text-[16px] text-ink" />}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
