// S-22 업적 달성 조건 (명세 5.2)
export function evaluateAchievements({ totalCompleted, streak, allTypesCompleted, reflectionsCount }) {
  const earned = []
  if (totalCompleted >= 1) earned.push('first_mission')
  if (streak >= 3) earned.push('streak_3')
  if (streak >= 7) earned.push('streak_7')
  if (allTypesCompleted) earned.push('all_types')
  if (totalCompleted >= 10) earned.push('total_10')
  if (totalCompleted >= 25) earned.push('total_25')
  if (totalCompleted >= 50) earned.push('total_50')
  if (reflectionsCount >= 5) earned.push('reflect_5')
  return earned
}
