import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import SegmentedControl from '../../components/common/SegmentedControl'
import EmptyState from '../../components/common/EmptyState'
import MissionCard from '../../components/common/MissionCard'
import ListBlock from '../../components/common/ListBlock'
import { getArchiveMissions, getTodayMissions, retryMission } from '../../data/storage'
import { useToast } from '../../contexts/ToastContext'

// S-42 · 미션 보관함 (명세 4.6)
export default function MissionArchiveScreen({ onBack, onStartCheckin }) {
  const [filter, setFilter] = useState('completed')
  const [archive, setArchive] = useState(null)
  const [todayTitles, setTodayTitles] = useState([])
  const [justAdded, setJustAdded] = useState(null)
  const showToast = useToast()

  const refresh = async () => {
    const [archiveRows, todayRows] = await Promise.all([getArchiveMissions(), getTodayMissions()])
    setArchive(archiveRows)
    setTodayTitles(todayRows.map((m) => m.title))
  }

  useEffect(() => {
    refresh()
  }, [])

  if (archive === null) return null

  const list = archive.filter((m) => (filter === 'completed' ? m.is_completed : !m.is_completed))

  const handleRetry = async (mission) => {
    await retryMission(mission)
    setJustAdded(mission.title)
    showToast('오늘 미션에 담았어요')
    refresh()
    setTimeout(() => setJustAdded(null), 2000)
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-2xl">
      <AppBar title="미션 보관함" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-4 px-4 py-4">
        <SegmentedControl
          items={[
            { value: 'completed', label: '완료한 미션' },
            { value: 'not-completed', label: '안 한 미션' },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {list.length === 0 ? (
          <EmptyState
            title="아직 담긴 미션이 없어요"
            body="오늘의 미션을 만들어 보세요"
            actionLabel="미션 만들러 가기"
            onAction={onStartCheckin}
          />
        ) : (
          <ListBlock>
            {list.map((m) => {
              const alreadyToday = todayTitles.includes(m.title)
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  onOpen={() => {}}
                  subtitle={m.created_date}
                  trailing={
                    <button
                      type="button"
                      disabled={alreadyToday}
                      onClick={() => handleRetry(m)}
                      className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-medium ${
                        alreadyToday ? 'bg-disabled text-disabled-ink' : 'bg-ink text-surface'
                      }`}
                    >
                      {justAdded === m.title ? '담김' : alreadyToday ? '오늘 담겨 있어요' : '다시 도전'}
                    </button>
                  }
                />
              )
            })}
          </ListBlock>
        )}
      </div>
    </div>
  )
}
