import { useEffect, useRef, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import MissionCard from '../../components/common/MissionCard'
import ListBlock from '../../components/common/ListBlock'
import SectionHeader from '../../components/common/SectionHeader'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/Icon'
import MissionDetailSheet from './MissionDetailSheet'
import { getTodayMissions, toggleMissionComplete, toggleMissionLike, getReflection, upsertReflection, todayISO } from '../../data/storage'

const MOOD_OPTIONS = [
  { value: 'bad', label: '그냥 그래요', icon: 'sentiment_neutral' },
  { value: 'ok', label: '괜찮아요', icon: 'sentiment_calm' },
  { value: 'great', label: '최고예요', icon: 'sentiment_excited' },
]

// 접근성 설정(ThemeContext)의 자동저장 디바운스와 동일하게 맞춘 값
const AUTOSAVE_DEBOUNCE_MS = 600

// S-40 · 오늘의 미션 (탭2, 명세 4.4, 4.5, 6.1)
export default function TodayMissionsScreen({ isActive = true, onOpenSettings, onStartCheckin, onOpenArchive, onMissionsChanged }) {
  const [missions, setMissions] = useState(null)
  const [selected, setSelected] = useState(null)
  const [journalContent, setJournalContent] = useState('')
  const [mood, setMood] = useState(null)
  const [saveState, setSaveState] = useState('idle')
  const saveTimerRef = useRef(null)
  const loadedRef = useRef(false)

  const refresh = () => getTodayMissions().then(setMissions)

  useEffect(() => {
    if (!isActive) return
    refresh()
    getReflection(todayISO()).then((reflection) => {
      setJournalContent(reflection?.content ?? '')
      setMood(reflection?.mood ?? null)
      loadedRef.current = true
    })
  }, [isActive])

  useEffect(() => {
    if (!loadedRef.current) return undefined
    setSaveState('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      await upsertReflection(todayISO(), journalContent, mood)
      setSaveState('saved')
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => clearTimeout(saveTimerRef.current)
  }, [journalContent, mood])

  if (missions === null) {
    return (
      <div className="flex min-h-svh flex-col bg-surface">
        <AppBar title="미션" variant="large" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
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
    onMissionsChanged?.()
  }
  const handleToggleLike = async (mission) => {
    await toggleMissionLike(mission)
    refresh()
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface pb-4">
      <AppBar title="미션" variant="large" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
      <div className="flex flex-1 flex-col justify-center space-y-5 px-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-8 lg:py-8">
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
            <div className="flex items-center justify-between text-[13px] font-medium text-ink-muted">
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
                <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
                  <Icon name="celebration" /> 오늘 미션을 다 마쳤어요
                </p>
              </div>
            )}

            {remaining.length > 0 && (
              <div>
                <SectionHeader title="남은 미션" />
                <div className="mt-2">
                  <ListBlock>
                    {remaining.map((m) => (
                      <MissionCard key={m.id} mission={m} onOpen={setSelected} onToggle={handleToggle} />
                    ))}
                  </ListBlock>
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <SectionHeader title="마친 미션" />
                <div className="mt-2">
                  <ListBlock>
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
                  </ListBlock>
                </div>
              </div>
            )}

            <div>
              <p className="mb-1 text-[15px] font-medium text-ink">마음 일기</p>
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="오늘 느낀 점을 자유롭게 적어보세요"
                rows={4}
                className="w-full resize-none rounded-2xl bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <p
                className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium text-ink-faint transition-opacity ${
                  saveState === 'idle' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <Icon name={saveState === 'saving' ? 'progress_activity' : 'check_circle'} className={`text-[13px] ${saveState === 'saving' ? 'animate-spin' : ''}`} />
                {saveState === 'saving' ? '자동 저장 중...' : '자동 저장됨'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[15px] font-medium text-ink">미션 후 기분이 어땠나요?</p>
              <div className="flex gap-2">
                {MOOD_OPTIONS.map((opt) => {
                  const active = mood === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMood(opt.value)}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-[1.5px] py-3 text-[12px] font-medium transition ${
                        active ? 'border-accent bg-accent-soft text-ink' : 'border-transparent bg-surface-alt text-ink-muted'
                      }`}
                    >
                      <Icon name={opt.icon} className={`text-[22px] ${active ? 'text-ink' : 'text-ink-faint'}`} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenArchive}
              className="w-full rounded-full bg-surface-alt py-3 text-[14px] font-medium text-ink"
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
