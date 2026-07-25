// §8-3 폴백 풀 — API 장애 시 사용하는 로컬 기본 미션. 유형당 최소 8개 확보
// (기존 3개는 장애 시 금방 바닥나서 8개 이상으로 확충, §9 항목 15)

export const MISSION_POOL = {
  carbon: [
    { title: '대중교통으로 이동하기', description: '자동차 대신 버스나 지하철을 이용해보세요', est_minutes: 15, difficulty: 'normal' },
    { title: '텀블러 사용하기', description: '오늘 마시는 음료는 일회용 컵 대신 텀블러에 담아보세요', est_minutes: 2, difficulty: 'light' },
    { title: '안 쓰는 플러그 뽑기', description: '집에서 사용하지 않는 가전 플러그를 뽑아 대기전력을 줄여보세요', est_minutes: 3, difficulty: 'light' },
    { title: '냉장고 파먹기 한 끼', description: '장을 보지 않고 냉장고에 있는 재료로 한 끼를 차려보세요', est_minutes: 20, difficulty: 'normal' },
    { title: '실내 적정 온도 맞추기', description: '냉난방 온도를 1도만 조정해보세요', est_minutes: 1, difficulty: 'light' },
    { title: '고기 없는 한 끼', description: '오늘 한 끼는 채식으로 먹어보세요', est_minutes: 20, difficulty: 'normal' },
    { title: '분리배출 다시 점검하기', description: '오늘 나온 쓰레기를 기준에 맞게 다시 분류해보세요', est_minutes: 10, difficulty: 'light' },
    { title: '한 정거장 걸어보기', description: '평소보다 한 정거장 먼저 내려서 걸어보세요', est_minutes: 15, difficulty: 'challenge' },
    { title: '중고 거래로 하나 구해보기', description: '새 제품 대신 중고로 필요한 물건을 찾아보세요', est_minutes: 20, difficulty: 'normal' },
  ],
  nature: [
    { title: '창밖 하늘 3분 바라보기', description: '잠시 하던 일을 멈추고 하늘이나 나무를 3분만 바라보며 숨을 골라보세요', est_minutes: 3, difficulty: 'light' },
    { title: '식물에 물 주기', description: '집이나 주변의 식물에게 물을 주며 잠시 마음을 가라앉혀보세요', est_minutes: 5, difficulty: 'light' },
    { title: '동네 한 바퀴 산책하기', description: '가까운 곳을 천천히 걸으며 계절의 변화를 느껴보세요', est_minutes: 15, difficulty: 'normal' },
    { title: '맨발로 흙 밟아보기', description: '가까운 공원이나 마당에서 잠시 맨발로 서 있어보세요', est_minutes: 5, difficulty: 'normal' },
    { title: '나무 한 그루 관찰하기', description: '주변의 나무 하나를 골라 잎과 가지를 자세히 살펴보세요', est_minutes: 5, difficulty: 'light' },
    { title: '햇볕 쬐며 스트레칭', description: '해가 드는 곳에서 몸을 가볍게 풀어보세요', est_minutes: 10, difficulty: 'light' },
    { title: '가까운 공원 다녀오기', description: '가장 가까운 공원까지 다녀오는 짧은 산책을 해보세요', est_minutes: 25, difficulty: 'challenge' },
    { title: '자연 소리 3분 듣기', description: '창문을 열고 새소리나 바람 소리에 귀 기울여보세요', est_minutes: 3, difficulty: 'light' },
    { title: '화분 하나 돌보기', description: '작은 화분을 하나 골라 흙 상태를 살피고 다듬어주세요', est_minutes: 10, difficulty: 'normal' },
  ],
  social: [
    { title: '가족에게 한마디 나누기', description: '오늘 느낀 감정을 가족이나 친구에게 짧게 이야기해보세요', est_minutes: 5, difficulty: 'light' },
    { title: '기후 행동 하는 사람 응원하기', description: '기후 행동을 하고 있는 누군가에게 응원 메시지를 보내보세요', est_minutes: 5, difficulty: 'light' },
    { title: '작은 실천 공유하기', description: '오늘 한 작은 실천을 메신저로 한 사람에게 공유해보세요', est_minutes: 5, difficulty: 'light' },
    { title: '동네 소모임 찾아보기', description: '관심 있는 환경 모임이나 커뮤니티를 검색해보세요', est_minutes: 10, difficulty: 'normal' },
    { title: '함께 사는 사람과 규칙 정하기', description: '가족이나 룸메이트와 분리배출 같은 작은 규칙 하나를 같이 정해보세요', est_minutes: 15, difficulty: 'normal' },
    { title: '고마운 마음 전하기', description: '환경을 위해 애쓰는 주변 사람에게 고맙다는 말을 전해보세요', est_minutes: 5, difficulty: 'light' },
    { title: '동네 행사 알아보기', description: '가까운 곳에서 열리는 환경 관련 행사나 캠페인을 찾아보세요', est_minutes: 15, difficulty: 'normal' },
    { title: '함께 걷자고 제안하기', description: '가까운 사람에게 다음에 같이 산책하자고 제안해보세요', est_minutes: 5, difficulty: 'challenge' },
    { title: '고민을 나눠보기', description: '요즘 드는 기후 관련 생각을 가까운 사람과 짧게 나눠보세요', est_minutes: 10, difficulty: 'normal' },
  ],
}

export function pickFallbackMissions(typePlan) {
  const usedIndexByType = {}
  return typePlan.map((type) => {
    const pool = MISSION_POOL[type] ?? MISSION_POOL.carbon
    const idx = (usedIndexByType[type] ?? 0) % pool.length
    usedIndexByType[type] = idx + 1
    return { ...pool[idx], type, why: '지금 상황에서 바로 해볼 수 있는 걸로 골랐어요.' }
  })
}
