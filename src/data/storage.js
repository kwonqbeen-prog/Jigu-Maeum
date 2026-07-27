import { supabase } from '../lib/supabaseClient'

// §8-1: 하루의 경계는 기기 로컬 자정 — UTC 기준 toISOString()을 쓰면 자정 근처에서
// 날짜가 하루 밀리는 문제가 생기므로 로컬 날짜를 직접 조합한다.
export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysAgoISO(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function getUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    throw new Error('로그인이 필요합니다.')
  }
  return data.user.id
}

// ============================================================
// user_profiles (명세 2.3 / 2.4 / 7.3)
// ============================================================

export async function getUserProfile() {
  const userId = await getUserId()
  const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertUserProfile(partial) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...partial, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markOnboardingCompleted() {
  return upsertUserProfile({ onboarding_completed_at: new Date().toISOString() })
}

export async function markCoachmarkSeen() {
  return upsertUserProfile({ coachmark_seen_at: new Date().toISOString() })
}

// ============================================================
// checkins (명세 3.1~3.4, 3.6)
// ============================================================

export async function getTodayCheckin() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayISO())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertCheckinDraft(id, partial, step) {
  const userId = await getUserId()
  const payload = {
    ...partial,
    step,
    status: 'draft',
    date: todayISO(),
    updated_at: new Date().toISOString(),
  }
  if (id) {
    const { data, error } = await supabase
      .from('checkins')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('checkins')
    .insert({ user_id: userId, ...payload })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeCheckin(id, freeText) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('checkins')
    .update({ free_text: freeText, status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function discardCheckin(id) {
  const userId = await getUserId()
  const { error } = await supabase.from('checkins').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

export async function incrementCheckinRetry(id) {
  const userId = await getUserId()
  const { data: current, error: fetchError } = await supabase
    .from('checkins')
    .select('retry_count')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (fetchError) throw fetchError
  const { data, error } = await supabase
    .from('checkins')
    .update({ retry_count: (current?.retry_count ?? 0) + 1 })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// missions (명세 4.x, 6.4)
// ============================================================

export async function getAllMissions() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getTodayMissions() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .eq('created_date', todayISO())
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getRecentMissions(days) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_date', daysAgoISO(days))
  if (error) throw error
  return data
}

export async function insertMissions(missionDrafts, { checkinId, source = 'checkin' } = {}) {
  const userId = await getUserId()
  const today = todayISO()
  const rows = missionDrafts.map((m) => ({
    user_id: userId,
    checkin_id: checkinId ?? null,
    title: m.title,
    description: m.description,
    why: m.why ?? null,
    category: m.category ?? m.type,
    type: m.type,
    difficulty: m.difficulty ?? 'normal',
    est_minutes: m.est_minutes ?? null,
    source,
    created_date: today,
    is_completed: false,
    liked: false,
  }))
  const { data, error } = await supabase.from('missions').insert(rows).select()
  if (error) throw error
  return data
}

export async function toggleMissionComplete(mission) {
  const userId = await getUserId()
  const nextCompleted = !mission.is_completed
  const { data, error } = await supabase
    .from('missions')
    .update({ is_completed: nextCompleted, completed_at: nextCompleted ? new Date().toISOString() : null })
    .eq('id', mission.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleMissionLike(mission) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('missions')
    .update({ liked: !mission.liked })
    .eq('id', mission.id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// S-42 보관함: 미션명 기준 최신 1건만 (마지막 실천일 내림차순)
export async function getArchiveMissions() {
  const all = await getAllMissions()
  const byTitle = new Map()
  for (const m of all) {
    const existing = byTitle.get(m.title)
    if (!existing || new Date(m.created_at) > new Date(existing.created_at)) {
      byTitle.set(m.title, m)
    }
  }
  return Array.from(byTitle.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function retryMission(mission) {
  return insertMissions(
    [
      {
        title: mission.title,
        description: mission.description,
        why: mission.why,
        type: mission.type,
        difficulty: mission.difficulty,
        est_minutes: mission.est_minutes,
      },
    ],
    { source: 'retry' },
  )
}

// ============================================================
// reflections (명세 6.5)
// ============================================================

export async function getReflection(date) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertReflection(date, content, mood = null) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('reflections')
    .upsert(
      { user_id: userId, date, content, mood, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRecentReflections(days) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .gte('date', daysAgoISO(days))
  if (error) throw error
  return data
}

// ============================================================
// 하단 탭 배지
// ============================================================

// 미션 탭 배지 — 오늘 미완료 미션 개수
export async function getTodayIncompleteMissionCount() {
  const userId = await getUserId()
  const { count, error } = await supabase
    .from('missions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('created_date', todayISO())
    .eq('is_completed', false)
  if (error) throw error
  return count ?? 0
}

// 기록 탭 배지 — 마지막으로 기록 탭을 본 시각 이후 새로 생긴 완료 미션/회고가 있는지
export async function hasNewRecordsSince(isoTimestamp) {
  const userId = await getUserId()
  const [missionRes, reflectionRes] = await Promise.all([
    supabase
      .from('missions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gt('completed_at', isoTimestamp),
    supabase
      .from('reflections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('updated_at', isoTimestamp),
  ])
  if (missionRes.error) throw missionRes.error
  if (reflectionRes.error) throw reflectionRes.error
  return (missionRes.count ?? 0) > 0 || (reflectionRes.count ?? 0) > 0
}

// ============================================================
// achievements (명세 5.2)
// ============================================================

export async function getAchievements() {
  const userId = await getUserId()
  const { data, error } = await supabase.from('achievements').select('*').eq('user_id', userId)
  if (error) throw error
  return data
}

export async function getReflectionsCount() {
  const userId = await getUserId()
  const { count, error } = await supabase
    .from('reflections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw error
  return count ?? 0
}

export async function unlockAchievement(code) {
  const userId = await getUserId()
  const { error } = await supabase
    .from('achievements')
    .upsert({ user_id: userId, code }, { onConflict: 'user_id,code', ignoreDuplicates: true })
  if (error) throw error
}

// ============================================================
// user_memories (명세 3.5)
// ============================================================

export async function getUserMemories(limit = 20) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('user_memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function addUserMemory(content) {
  const userId = await getUserId()
  const { error } = await supabase.from('user_memories').insert({ user_id: userId, content })
  if (error) throw error
}

export async function deleteUserMemory(id) {
  const userId = await getUserId()
  const { error } = await supabase.from('user_memories').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

// ============================================================
// §7-2 파생값 — 테이블로 저장하지 않고 계산
// ============================================================

export function getTotalCompletedCount(missions) {
  return missions.filter((m) => m.is_completed).length
}

// 연속 실천일: "미션을 1개 이상 완료한 날"이 오늘(또는 어제)부터 역순 연속인 일수
export function getStreakDays(missions) {
  const completedDates = new Set(
    missions.filter((m) => m.is_completed && m.completed_at).map((m) => m.completed_at.slice(0, 10)),
  )
  if (completedDates.size === 0) return 0

  let streak = 0
  let cursor = new Date()
  const today = todayISO()
  const cursorISO = () => {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  if (!completedDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (completedDates.has(cursorISO())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// 최근 N일 완료된 미션의 유형 분포
export function getTypeDistribution(missions, days = 30) {
  const cutoff = daysAgoISO(days)
  const relevant = missions.filter((m) => m.created_date >= cutoff)
  const counts = { carbon: 0, nature: 0, social: 0 }
  for (const m of relevant) {
    if (m.type && counts[m.type] !== undefined) counts[m.type] += 1
  }
  return counts
}

export function getAllTypesCompleted(missions) {
  const types = new Set(missions.filter((m) => m.is_completed).map((m) => m.type))
  return ['carbon', 'nature', 'social'].every((t) => types.has(t))
}

// S-64D 회원 탈퇴 — 사용자 소유 데이터를 전부 지운다.
export async function deleteAllUserData() {
  const userId = await getUserId()
  const tables = ['missions', 'checkins', 'reflections', 'achievements', 'user_memories', 'user_profiles']
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) throw error
  }
}

// S-64D 회원 탈퇴 — auth.users 계정 자체는 서비스 롤 권한이 필요해 클라이언트에서
// 직접 지울 수 없다. deleteAllUserData()로 데이터를 먼저 지운 뒤 이 함수로
// delete-account Edge Function을 호출해 실제 계정을 삭제한다.
export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke('delete-account')
  if (error) {
    const detail = await error.context
      ?.clone()
      .json()
      .then((body) => body?.error)
      .catch(() => null)
    throw new Error(`회원 탈퇴 처리 실패: ${detail ?? error.message}`)
  }
  if (data?.error) throw new Error(data.error)
}
