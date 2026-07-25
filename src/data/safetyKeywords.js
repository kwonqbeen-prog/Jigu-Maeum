// §8-5 위험 신호 감지 — 1차(클라이언트) 검사용 핵심 표현 사전.
// 판별을 정교하게 가르려 하지 않고, 감지되면 판단 없이 최소 대응한다 (D11).
const KEYWORDS = [
  '자살',
  '죽고 싶',
  '죽고싶',
  '살기 싫',
  '살기싫',
  '사라지고 싶',
  '없어지고 싶',
  '자해',
  '극단적 선택',
  '더 이상 못 견디',
  '더이상 못 견디',
  '희망이 없',
]

export function detectSafetySignal(text) {
  if (!text) return false
  const normalized = text.replace(/\s+/g, '')
  return KEYWORDS.some((kw) => normalized.includes(kw.replace(/\s+/g, '')))
}

export const SUPPORT_CHANNELS = [
  { name: '자살예방상담전화', number: '109', note: '24시간 · 무료' },
  { name: '정신건강상담전화', number: '1577-0199', note: '24시간' },
  { name: '청소년전화', number: '1388', note: '24시간' },
]
