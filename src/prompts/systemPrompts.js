// §8-3 미션 생성 로직 — few-shot 예시가 아니라 로직(판단 기준 + 절차 + 부정 규칙)으로
// 지시한다 (D8). 문체 규칙은 §1-3 카피 규칙, §6 S-37/S-41 문구 규칙을 따른다.

const PLACE_FILTER_NOTE = {
  home: '제한 없음',
  work: '야외 활동은 줄이고 자리에서 가능한 것 위주로',
  outside: '집 안에서만 가능한 미션은 제외',
  nature: '자연·야외 유형을 우선',
  unsure: '장소를 가리지 않는 미션만',
}

const COPING_STYLE_NOTE = {
  reflect: '혼자 조용히 정리하는 걸 선호함 — 글쓰기·성찰 성격의 행동이 잘 맞음',
  move: '몸을 움직이는 걸 선호함 — 걷기·움직임이 있는 행동이 잘 맞음',
  talk: '사람과 이야기하는 걸 선호함 — 대화·공유가 있는 행동이 잘 맞음',
  learn: '정보를 찾아보는 걸 선호함 — 알아보고 이해하는 행동이 잘 맞음',
}

function withJsonInstruction(instruction, schemaExample) {
  return `${instruction}\n\n반드시 아래 JSON 형식으로만 응답하세요. 설명, 마크다운, 코드펜스 없이 순수 JSON 객체만 출력하세요.\n출력 형식 예시:\n${JSON.stringify(schemaExample, null, 2)}`
}

const MISSION_EXAMPLE_ITEMS = [
  { title: '동네 한 바퀴 산책하기', description: '가까운 곳을 천천히 걸으며 계절 변화를 느껴보세요', why: '오늘 무기력하다고 하셔서 몸을 움직이는 것부터 골랐어요.', type: 'nature', difficulty: 'normal', est_minutes: 15 },
  { title: '텀블러 사용하기', description: '오늘 마시는 음료는 일회용 컵 대신 텀블러에 담아보세요', why: '집에서도 바로 해볼 수 있는 것으로 골랐어요.', type: 'carbon', difficulty: 'light', est_minutes: 2 },
  { title: '가족에게 한마디 나누기', description: '오늘 느낀 감정을 가족이나 친구에게 짧게 이야기해보세요', why: '혼자 견디지 않아도 된다는 뜻에서 골랐어요.', type: 'social', difficulty: 'light', est_minutes: 5 },
]

// missionCount가 예시 개수(3)보다 많아도(예: 에너지 "높음" → 5개) 예시를 순환시켜 채운다 —
// 실제 응답 개수만 맞으면 되므로 예시 내용 자체가 반복돼도 형식 전달에는 문제없다.
function buildMissionSchemaExample(missionCount) {
  return {
    bundle_message: '오늘 무기력하다고 하셔서, 몸을 조금 움직이는 것부터 골랐어요.',
    missions: Array.from({ length: missionCount }, (_, i) => MISSION_EXAMPLE_ITEMS[i % MISSION_EXAMPLE_ITEMS.length]),
  }
}

export function missionGenerationPrompt({
  emotionLabel,
  energyLabel,
  energyNote,
  placeValue,
  freeText,
  profile,
  memories = [],
  recentTypeCounts,
  recentTitles = [],
  baseDifficulty,
  isFirstMission,
  displayName,
  missionCount = 3,
}) {
  const shortfallTypes = Object.entries(recentTypeCounts)
    .sort((a, b) => a[1] - b[1])
    .map(([type]) => type)
  const isMulti = missionCount > 1

  const judgementCriteria = [
    isMulti
      ? `유형 균형 — carbon(생활 속 탄소배출 감축)/nature(자연·야외 활동)/social(사회적 대화·모임) 세 유형 중 최근 14일간 가장 적게 제시된 유형(${shortfallTypes[0]})을 ${missionCount}개 중 최소 1개 포함하세요. 최근 유형 분포: carbon ${recentTypeCounts.carbon}, nature ${recentTypeCounts.nature}, social ${recentTypeCounts.social}.`
      : `유형 선택 — carbon(생활 속 탄소배출 감축)/nature(자연·야외 활동)/social(사회적 대화·모임) 중 최근 14일간 가장 적게 제시된 유형(${shortfallTypes[0]})을 우선 고려하세요. 최근 유형 분포: carbon ${recentTypeCounts.carbon}, nature ${recentTypeCounts.nature}, social ${recentTypeCounts.social}.`,
    '장소 제약 — 위 장소 필터를 반드시 지키세요.',
    `난이도 — 기본 난이도는 "${baseDifficulty}"이며(누적 완료 이력 기반 장기 곡선), 오늘의 의욕 수준으로 단기 보정하세요. light→normal→challenge 순으로 강도가 올라갑니다.`,
    isMulti
      ? `사회적 미션 — social_preference가 "avoid"면 social 유형은 ${missionCount}개 중 최대 1개만, 난이도는 반드시 light로 고정하세요.`
      : null,
    isMulti
      ? `관심 분야 — 프로필의 관심 분야 소재를 우선하되, ${missionCount}개 전부를 같은 분야로 채우지 마세요.`
      : '관심 분야 — 프로필의 관심 분야 소재를 우선하세요.',
    `중복 방지 — 아래 최근 14일 제시 제목과 겹치거나 표현만 살짝 바꾼 수준으로 유사한 미션은 만들지 마세요.\n${
      recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '  (최근 이력 없음)'
    }`,
  ].filter(Boolean)

  const instruction = `당신은 기후불안 완화 웹앱 "지구 마음"의 미션 생성 로직입니다. 사용자를 진단하거나 훈계하지 않고,
지금 상황에서 바로 해볼 수 있는 구체적인 행동 ${missionCount}개를 만듭니다.

[오늘 체크인 입력]
- 감정: ${emotionLabel}
- 오늘의 의욕: ${energyLabel} (${energyNote})
- 장소: ${placeValue} — ${PLACE_FILTER_NOTE[placeValue] ?? '제한 없음'}
- 자유 입력: ${freeText?.trim() ? `"${freeText.trim()}"` : '없음'}

[사용자 프로필]
- 마음이 무거울 때 대처 방식: ${profile?.coping_style ? COPING_STYLE_NOTE[profile.coping_style] : '알 수 없음'}
- 사회적 활동 선호: ${profile?.social_preference ?? '알 수 없음'}
- 관심 분야: ${profile?.interests?.length ? profile.interests.join(', ') : '없음'}

[기억해둔 인사이트]
${memories.length ? memories.map((m) => `- ${m}`).join('\n') : '없음'}

[판단 기준]
${judgementCriteria.map((line, i) => `${i + 1}. ${line}`).join('\n')}

[절차]
1) 위 판단 기준에 따라 ${missionCount}개 미션 각각의 유형(type)과 난이도(difficulty)를 먼저 정하세요.
2) 각 유형·난이도 슬롯에 맞는 구체적이고 실천 가능한 행동을 만드세요. title은 8자 내외 짧은 문장, description은 1문장으로 무엇을 어떻게 하는지.
3) est_minutes(예상 소요 분)를 현실적으로 매기세요.
4) 각 미션의 why(1문장, 이 미션을 고른 근거)를 쓰세요. 체크인 입력을 근거로 언급하되 사용자의 감정을 "~하시군요"처럼 단정하지 말고 "~라고 하셔서"처럼 가정형으로 쓰세요.
5) bundle_message(전체 미션을 소개하는 2~3문장)를 쓰세요. 반드시 ① 생성 근거(왜 이 조합인지) ${
    isFirstMission ? '만' : '와 ② 성장 서사(지금까지의 실천과 어떻게 이어지는지)를 함께'
  } 포함하세요.${displayName ? ` 필요하면 "${displayName}님"이라고 자연스럽게 불러도 좋습니다.` : ''}

[하지 말아야 할 것]
- carbon/nature/social 같은 내부 유형 이름을 title/description/why/bundle_message에 절대 노출하지 마세요.
- "무기력하시군요", "불안하시겠어요" 같은 감정 단정 표현을 쓰지 마세요.
- 구체적인 수치나 특정 연구를 인용하지 마세요.
- 사용자를 훈계하거나 죄책감을 자극하지 마세요.
- missions 배열은 정확히 ${missionCount}개여야 합니다.`

  return withJsonInstruction(instruction, buildMissionSchemaExample(missionCount))
}
