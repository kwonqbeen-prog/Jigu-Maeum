import { useCallback, useEffect, useRef, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import PlanetOrb, { getPlanetStage } from '../../components/common/PlanetOrb'
import PrimaryButton from '../../components/common/PrimaryButton'
import SparkleStar from '../../components/common/SparkleStar'
import {
  getAllMissions,
  getTodayMissions,
  getTodayCheckin,
  getAllReflections,
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
  dateToLocalISO,
  allDatesSince,
} from '../../data/storage'
import { evaluateAchievements } from '../../data/achievementRules'
import AchievementsSheet from './AchievementsSheet'
import DayDetailSheet from '../../components/common/DayDetailSheet'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const DATE_CHIP_WIDTH = 44
// 가입한 지 얼마 안 됐어도(신규 계정) 날짜 바가 허전해 보이지 않도록 최소 7일 폭은 항상 확보.
// 무한 스크롤/로딩이 아니라 시작점만 최대 6일 앞당기는 것이라 데이터량은 그대로 유지됨.
const MIN_VISIBLE_DAYS = 7

// S-20 · 마음 지구 (홈, 탭1) — 명세 5.1, 5.2, 6.1
export default function HomeScreen({ isActive = true, justOnboarded = false, signupDate, onStartCheckin, onGoMissions, onOpenSettings, onOpenArchive }) {
  const [data, setData] = useState(null)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [expression, setExpression] = useState('default')
  const sliderRef = useRef(null)
  const dragRef = useRef({ dragging: false, moved: false, startX: 0, startScroll: 0 })
  const welcomeSmileConsumedRef = useRef(false)
  const hasCenteredTodayRef = useRef(false)

  // 마음 지구 오브가 1.5~2초간 "웃는 눈"으로 바뀌었다 되돌아온다 — 온보딩 직후 첫 홈 진입,
  // 새 업적 달성 두 시점에서만 호출됨(지시서 §4)
  const flashSmile = useCallback(() => {
    setExpression('smile')
    setTimeout(() => setExpression('default'), 1800)
  }, [])

  useEffect(() => {
    if (!justOnboarded || welcomeSmileConsumedRef.current) return
    welcomeSmileConsumedRef.current = true
    flashSmile()
  }, [justOnboarded, flashSmile])

  const load = useCallback(async () => {
    const [allMissions, todayMissions, todayCheckin, reflections, achievements, reflectionsCount] = await Promise.all([
      getAllMissions(),
      getTodayMissions(),
      getTodayCheckin(),
      getAllReflections(),
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
    if (newCodes.length > 0) flashSmile()

    setData({
      totalCompleted,
      streak,
      todayMissions,
      allMissions,
      reflections,
      todayCheckinExists: Boolean(todayCheckin && todayCheckin.status === 'completed'),
      achievements: [...achievements.map((a) => a.code), ...newCodes],
    })
  }, [flashSmile])

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

  // 처음 진입했을 때 오늘 날짜가 화면 가운데 오도록 한 번만 맨 끝(오른쪽)으로 스크롤.
  // 날짜 목록은 오래된 날짜→오늘 순이라 끝까지 스크롤하면 오늘이 마지막 칩이 되고,
  // 트랙 좌우 여백(50% - 반칩너비)이 그 칩을 정확히 가운데로 밀어준다.
  useEffect(() => {
    if (!data || !sliderRef.current || hasCenteredTodayRef.current) return
    hasCenteredTodayRef.current = true
    sliderRef.current.scrollLeft = sliderRef.current.scrollWidth
  }, [data])

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
      <div className="flex flex-1 flex-col bg-surface">
        <AppBar title="마음 지구" variant="large" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
        <div className="flex-1" />
      </div>
    )
  }

  const remaining = data.todayMissions.filter((m) => !m.is_completed)
  const { stage, name } = getPlanetStage(data.totalCompleted)

  let cta = { label: '미션 만들러 가기', onClick: onStartCheckin }
  if (data.todayCheckinExists) {
    cta =
      remaining.length > 0
        ? { label: '오늘의 미션', onClick: onGoMissions }
        : { label: '미션 더 둘러보기', onClick: onOpenArchive }
  }

  const decorations = data.achievements.slice(0, 3).map((code) => ({
    code,
    icon: 'star',
  }))

  const signupDateISO = signupDate ? dateToLocalISO(new Date(signupDate)) : todayISO()
  const minRangeStartISO = daysAgoISO(MIN_VISIBLE_DAYS - 1)
  const rangeStartISO = signupDateISO < minRangeStartISO ? signupDateISO : minRangeStartISO
  const dates = allDatesSince(rangeStartISO)
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
    <div className="flex flex-1 flex-col bg-surface">
      <AppBar
        title="마음 지구"
        variant="large"
        actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings, dataTour: 'settings-icon' }]}
      />
      <div className="flex flex-1 flex-col px-4 pb-4 lg:mx-auto lg:w-full lg:max-w-2xl lg:px-8 lg:py-8">
        {/* 마음 지구는 화면(AppBar 제외 영역) 높이 중앙에 오도록, 아래 고정 블록과 겹치지
            않게 이 영역이 남은 공간을 모두 차지하고 그 안에서만 스스로 중앙 정렬한다.
            min-h-0이 없으면 이 flex-1 영역이 아래 오브 박스의 내재 크기만큼 최소 높이를
            강제로 확보하려 해서, 짧은 데스크탑 창에서 전체 페이지가 늘어나며 스크롤이
            생기는 문제가 있었음 — min-h-0으로 남는 공간만큼만 쓰고 부족하면 오브 자체가
            줄어들도록 함(clamp 하한 덕분에 완전히 찌그러지진 않음) */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
          <div className="h-[clamp(11rem,32dvh,16rem)]" data-tour="planet-orb">
            <PlanetOrb
              totalCompleted={data.totalCompleted}
              decorations={decorations}
              expression={expression}
              onClick={() => setAchievementsOpen(true)}
            />
          </div>
          <p className="inline-flex items-center rounded-full bg-surface-alt px-3 py-1 text-[12px] font-medium text-ink-muted">
            {stage}단계 · {name}
          </p>

          <div className="mt-3 w-full max-w-xs">
            {data.todayCheckinExists && data.todayMissions.length > 0 && (
              <button type="button" onClick={onGoMissions} className="w-full py-1 text-left">
                <div className="flex items-center justify-between text-[13px] font-medium text-ink">
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

            {!data.todayCheckinExists && (
              <p className="mt-2 text-center text-[13px] font-medium text-ink">마음 지구를 자라게 해볼까요?</p>
            )}

            <div className="mt-2 flex justify-center" data-tour="home-cta">
              <PrimaryButton label={cta.label} onClick={cta.onClick} className="max-w-xs" />
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <div className="mb-2 flex items-center justify-center gap-1.5 px-4">
            <SparkleStar style={{ width: 12, height: 12, color: 'var(--color-highlight)' }} />
            <p className="text-[13px] font-medium text-ink">나의 발자취를 돌아봐요.</p>
            <SparkleStar style={{ width: 12, height: 12, color: 'var(--color-highlight)' }} />
          </div>
          <div
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            className="flex snap-x snap-mandatory cursor-grab select-none gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', paddingLeft: `calc(50% - ${DATE_CHIP_WIDTH / 2}px)`, paddingRight: `calc(50% - ${DATE_CHIP_WIDTH / 2}px)` }}
          >
            {dates.map((date) => {
              const isToday = date === todayISO()
              const isBeforeSignup = date < signupDateISO
              const dow = WEEKDAY_LABELS[new Date(date).getDay()]
              const day = new Date(date).getDate()
              return (
                <button
                  key={date}
                  type="button"
                  disabled={isBeforeSignup}
                  onClick={() => handleChipClick(date)}
                  style={{ scrollSnapAlign: 'center', width: DATE_CHIP_WIDTH }}
                  className={`flex shrink-0 flex-col items-center gap-1 ${isBeforeSignup ? 'opacity-40' : ''}`}
                >
                  <span className="text-[10px] font-medium text-ink-faint">{dow}</span>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium ${
                      isToday ? 'bg-ink text-surface' : 'text-ink-muted'
                    }`}
                  >
                    {day}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${hasDataOn(date) ? 'day-dot--active' : 'day-dot--empty'}`} />
                </button>
              )
            })}
          </div>
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
