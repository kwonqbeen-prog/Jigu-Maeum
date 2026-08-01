import { askSolar } from '../api/solarClient'
import { missionGenerationPrompt } from '../prompts/systemPrompts'
import { getAllMissions, getRecentMissions, getUserMemories, getTotalCompletedCount } from '../data/storage'
import { pickFallbackMissions } from '../data/missionPool'
import { EMOTION_TYPES, ENERGY_LEVELS, PLACES, DIFFICULTY_LEVELS, MISSION_COUNT_BY_ENERGY, labelOf } from '../data/constants'

function jaccard(a, b) {
  const tokensA = new Set(a.split(''))
  const tokensB = new Set(b.split(''))
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length
  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : intersection / union
}

function isDuplicate(title, recentTitles) {
  return recentTitles.some((t) => t === title || jaccard(t, title) >= 0.7)
}

function computeBaseDifficulty(totalCompleted) {
  const step = Math.min(2, Math.floor(totalCompleted / 10))
  return DIFFICULTY_LEVELS[step]
}

function shortfallTypePlan(recentTypeCounts, socialPreference, count) {
  const order = Object.entries(recentTypeCounts)
    .sort((a, b) => a[1] - b[1])
    .map(([type]) => type)
  let plan = Array.from({ length: count }, (_, i) => order[i % order.length])
  if (socialPreference === 'avoid') {
    plan = plan.map((t) => (t === 'social' ? order.find((x) => x !== 'social') ?? 'carbon' : t))
    if (count > 1 && !plan.includes('social')) plan[plan.length - 1] = 'social'
  }
  return plan
}

export async function generateMissionsForCheckin(checkin, profile) {
  const [allMissions, recentMissions, memories] = await Promise.all([
    getAllMissions(),
    getRecentMissions(14),
    getUserMemories(5).catch(() => []),
  ])

  const totalCompleted = getTotalCompletedCount(allMissions)
  const recentTypeCounts = { carbon: 0, nature: 0, social: 0 }
  for (const m of recentMissions) {
    if (m.type && recentTypeCounts[m.type] !== undefined) recentTypeCounts[m.type] += 1
  }
  const recentTitles = recentMissions.map((m) => m.title)
  const baseDifficulty = computeBaseDifficulty(totalCompleted)
  const isFirstMission = totalCompleted === 0
  const energyLevel = ENERGY_LEVELS.find((e) => e.value === checkin.energy_level)
  const missionCount = MISSION_COUNT_BY_ENERGY[checkin.energy_level] ?? 3

  const promptArgs = {
    emotionLabel: labelOf(EMOTION_TYPES, checkin.emotion_type),
    energyLabel: energyLevel?.label ?? checkin.energy_level,
    energyNote: energyLevel?.note ?? '',
    placeValue: labelOf(PLACES, checkin.context_place),
    freeText: checkin.free_text,
    profile,
    memories: memories.map((m) => m.content),
    recentTypeCounts,
    recentTitles,
    baseDifficulty,
    isFirstMission,
    missionCount,
  }

  async function attempt(extraNote) {
    const systemPrompt = missionGenerationPrompt(promptArgs) + (extraNote ?? '')
    const result = await askSolar({ systemPrompt, userMessage: '미션을 생성해주세요.' })
    if (!Array.isArray(result?.missions) || result.missions.length !== missionCount) {
      throw new Error('미션 개수가 올바르지 않습니다.')
    }
    return result
  }

  try {
    let result = await attempt()
    const hasDup = result.missions.some((m) => isDuplicate(m.title, recentTitles))
    if (hasDup) {
      result = await attempt('\n\n[재생성 사유] 방금 만든 미션이 최근 이력과 겹쳤습니다. 완전히 다른 구체적 행동으로 다시 만드세요.')
    }
    return {
      missions: result.missions.map((m) => ({ ...m, source: 'checkin' })),
      bundleMessage: result.bundle_message,
      usedFallback: false,
    }
  } catch (err) {
    console.error('[useMissionGeneration] LLM 미션 생성 실패, fallback 사용:', err)
    const typePlan = shortfallTypePlan(recentTypeCounts, profile?.social_preference, missionCount)
    const missions = pickFallbackMissions(typePlan).map((m) => ({ ...m, source: 'checkin' }))
    return {
      missions,
      bundleMessage: '지금 상황에서 바로 해볼 수 있는 미션으로 준비했어요.',
      usedFallback: true,
    }
  }
}
