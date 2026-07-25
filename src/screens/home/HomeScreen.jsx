import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import PlanetOrb, { getPlanetStage } from '../../components/common/PlanetOrb'
import PrimaryButton from '../../components/common/PrimaryButton'
import {
  getAllMissions,
  getTodayMissions,
  getTodayCheckin,
  getReflection,
  getAchievements,
  getReflectionsCount,
  getStreakDays,
  getAllTypesCompleted,
  getTotalCompletedCount,
  unlockAchievement,
  todayISO,
} from '../../data/storage'
import { evaluateAchievements } from '../../data/achievementRules'
import AchievementsSheet from './AchievementsSheet'

// S-20 · 마음 지구 (홈, 탭1) — 명세 5.1, 5.2, 6.1
export default function HomeScreen({ onStartCheckin, onGoMissions, onOpenSettings, onOpenDayWrapUp, onOpenArchive }) {
  const [data, setData] = useState(null)
  const [achievementsOpen, setAchievementsOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [allMissions, todayMissions, todayCheckin, reflection, achievements, reflectionsCount] = await Promise.all([
        getAllMissions(),
        getTodayMissions(),
        getTodayCheckin(),
        getReflection(todayISO()),
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

      if (!cancelled) {
        setData({
          totalCompleted,
          streak,
          todayMissions,
          todayCheckinExists: Boolean(todayCheckin && todayCheckin.status === 'completed'),
          reflectionDone: Boolean(reflection),
          achievements: [...achievements.map((a) => a.code), ...newCodes],
        })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-svh flex-col bg-surface">
        <AppBar title="지구 마음" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
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
  } else if (allDone && !data.reflectionDone) {
    cta = { label: '오늘 하루 마무리하기', onClick: onOpenDayWrapUp }
  } else if (allDone && data.reflectionDone) {
    cta = { label: '미션 더 둘러보기', onClick: onOpenArchive }
  }

  const decorations = data.achievements.slice(0, 3).map((code) => ({
    code,
    icon: 'star',
  }))

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <AppBar title="지구 마음" actions={[{ icon: 'settings', label: '설정', onClick: onOpenSettings }]} />
      <div className="flex-1 px-4 pb-4">
        <div className="h-[45dvh]">
          <PlanetOrb totalCompleted={data.totalCompleted} decorations={decorations} onClick={() => setAchievementsOpen(true)} />
        </div>
        <p className="text-center text-[12px] font-medium text-ink-muted">
          {stage}단계 · {name}
        </p>

        {data.todayCheckinExists && data.todayMissions.length > 0 && (
          <button
            type="button"
            onClick={onGoMissions}
            className="mt-4 w-full rounded-2xl bg-surface-alt px-4 py-3 text-left"
          >
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

        <div className="mt-4">
          <PrimaryButton label={cta.label} onClick={cta.onClick} />
        </div>

        {allDone && !data.reflectionDone && (
          <button type="button" onClick={onOpenDayWrapUp} className="mt-3 w-full text-center text-[13px] font-semibold text-ink-muted underline">
            오늘 어땠는지 남겨볼까요?
          </button>
        )}
      </div>

      {achievementsOpen && (
        <AchievementsSheet
          totalCompleted={data.totalCompleted}
          unlockedCodes={data.achievements}
          onClose={() => setAchievementsOpen(false)}
        />
      )}
    </div>
  )
}
