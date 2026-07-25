// 화면설계서 §3 체크인 4스텝 + §1-2 온보딩 프로필 값 목록.
// 문서에 "[결정필요 → Qn]"으로 남은 항목은 문서 자체의 현재 전제값을 그대로 채택했다.

export const EMOTION_TYPES = [
  { value: 'anxiety', label: '불안해요', hint: '기후 관련 뉴스나 미래가 자꾸 불안하게 느껴져요' },
  { value: 'helplessness', label: '무기력해요', hint: '내가 뭘 해도 소용없을 것 같은 기분이에요' },
  { value: 'guilt', label: '죄책감이 들어요', hint: '내 행동이 환경에 나쁜 영향을 주는 것 같아 마음이 무거워요' },
  { value: 'info_fatigue', label: '지쳤어요', hint: '기후 관련 정보가 너무 많아서 피로하고 무뎌졌어요' },
  { value: 'okay', label: '그럭저럭 괜찮아요', hint: '특별히 힘들진 않아요' },
]

export const ENERGY_LEVELS = [
  { value: 'low', label: '조금만요', hint: '오늘은 최소한만 하고 싶어요', note: '아주 가벼운 미션 위주 (1~3분)' },
  { value: 'mid', label: '적당히요', hint: '무리 없는 선에서 해볼게요', note: '보통 (5~15분)' },
  { value: 'high', label: '좀 더요', hint: '오늘은 해볼 마음이 있어요', note: '도전적인 것 1개 포함 (15~30분)' },
]

export const PLACES = [
  { value: 'home', label: '집' },
  { value: 'work', label: '직장·학교' },
  { value: 'outside', label: '밖 / 이동 중' },
  { value: 'nature', label: '공원·자연 근처' },
  { value: 'unsure', label: '잘 모르겠어요' },
]

export const COPING_STYLES = [
  { value: 'reflect', label: '혼자 정리하는 편이에요', hint: '글로 쓰거나 조용히 생각을 정리해요' },
  { value: 'move', label: '몸을 움직이는 편이에요', hint: '걷거나 밖에 나가면 좀 나아져요' },
  { value: 'talk', label: '사람들과 이야기해요', hint: '누군가와 말하면 정리가 돼요' },
  { value: 'learn', label: '정보를 찾아봐요', hint: '알아보고 이해하면 덜 막막해요' },
]

export const SOCIAL_PREFERENCES = [
  { value: 'like', label: '좋아요' },
  { value: 'neutral', label: '상황에 따라요' },
  { value: 'avoid', label: '부담스러워요' },
]

export const INTERESTS = [
  { value: 'energy', label: '에너지·전기' },
  { value: 'food', label: '먹거리' },
  { value: 'mobility', label: '이동·교통' },
  { value: 'waste', label: '쓰레기·자원순환' },
  { value: 'nature', label: '자연·생물다양성' },
  { value: 'community', label: '지역·이웃' },
]

export const MAX_INTERESTS = 3

// §8-4 미션 유형 3분류 — 사용자 화면에는 노출하지 않음 (D4)
export const MISSION_TYPES = [
  { value: 'carbon', name: '생활 속 탄소배출 감축 실천' },
  { value: 'nature', name: '자연·야외 활동' },
  { value: 'social', name: '사회적 대화·모임 참여' },
]

export const DIFFICULTY_LEVELS = ['light', 'normal', 'challenge']

// S-22 업적 목록 [결정필요 → Q6②, 문서 기본값 그대로 적용]
export const ACHIEVEMENTS = [
  { code: 'first_mission', name: '첫 걸음', condition: '미션 1개 완료' },
  { code: 'streak_3', name: '사흘', condition: '3일 연속 실천' },
  { code: 'streak_7', name: '한 주', condition: '7일 연속 실천' },
  { code: 'all_types', name: '세 갈래', condition: '세 유형 미션 모두 경험' },
  { code: 'total_10', name: '열', condition: '누적 완료 10개' },
  { code: 'total_25', name: '스물다섯', condition: '누적 완료 25개' },
  { code: 'total_50', name: '쉰', condition: '누적 완료 50개' },
  { code: 'reflect_5', name: '돌아보기', condition: '회고 5회 작성' },
]

export function clampInterests(values) {
  return (values ?? []).slice(0, MAX_INTERESTS)
}

export function labelOf(list, value) {
  return list.find((item) => item.value === value)?.label ?? value
}
