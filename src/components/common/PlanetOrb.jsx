import Icon from '../Icon'

// 화면설계서 §6 S-20 — 누적 완료 수 → 5단계 임계값 [결정필요 → Q6, 문서 기본값 그대로 적용]
export const STAGE_THRESHOLDS = [
  { stage: 1, min: 0, name: '조용한 지구' },
  { stage: 2, min: 3, name: '깨어나는 지구' },
  { stage: 3, min: 10, name: '함께 걷는 지구' },
  { stage: 4, min: 25, name: '숨쉬는 지구' },
  { stage: 5, min: 50, name: '빛나는 지구' },
]

export function getPlanetStage(totalCompleted) {
  let result = STAGE_THRESHOLDS[0]
  for (const t of STAGE_THRESHOLDS) {
    if (totalCompleted >= t.min) result = t
  }
  return result
}

// 정적 배경 장식 — 고정 좌표라 리렌더링마다 위치가 바뀌지 않는다
const STARS = [
  { top: '6%', left: '18%', size: 8, shape: 'sparkle' },
  { top: '12%', left: '82%', size: 5, shape: 'dot' },
  { top: '20%', left: '45%', size: 5, shape: 'dot' },
  { top: '9%', left: '62%', size: 5, shape: 'sparkle' },
  { top: '28%', left: '10%', size: 5, shape: 'dot' },
  { top: '32%', left: '92%', size: 8, shape: 'dot' },
  { top: '40%', left: '30%', size: 5, shape: 'sparkle' },
  { top: '46%', left: '70%', size: 5, shape: 'dot' },
  { top: '54%', left: '15%', size: 8, shape: 'sparkle' },
  { top: '58%', left: '55%', size: 5, shape: 'dot' },
  { top: '64%', left: '88%', size: 5, shape: 'dot' },
  { top: '70%', left: '38%', size: 5, shape: 'sparkle' },
  { top: '76%', left: '8%', size: 5, shape: 'dot' },
  { top: '80%', left: '68%', size: 8, shape: 'dot' },
  { top: '86%', left: '25%', size: 5, shape: 'sparkle' },
  { top: '90%', left: '80%', size: 5, shape: 'dot' },
]

// C-09 PlanetOrb — 장식 요소(업적)는 동시 최대 3개
export default function PlanetOrb({ totalCompleted = 0, decorations = [], size = 'large', onClick }) {
  const { stage, name } = getPlanetStage(totalCompleted)
  const sizeClass = size === 'large' ? 'h-56 w-56 sm:h-64 sm:w-64' : 'h-24 w-24'

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden" aria-hidden={size !== 'large' ? undefined : false}>
      {size === 'large' &&
        STARS.map((star, i) => (
          <span
            key={i}
            className={`mind-planet__star mind-planet__star--${star.shape} absolute`}
            style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            aria-hidden="true"
          />
        ))}
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        role="img"
        aria-label={`마음 지구 ${stage}단계 ${name}, 누적 완료 ${totalCompleted}개`}
        className="relative flex items-center justify-center"
      >
        <div className={`mind-planet__orb rounded-full ${sizeClass}`} data-planet-stage={String(stage)} />
        {decorations.slice(0, 3).map((deco, i) => (
          <span
            key={deco.code ?? i}
            className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-surface-alt"
            style={deco.position ?? { top: `${10 + i * 20}%`, right: `${-4 + i * 6}%` }}
            aria-hidden="true"
          >
            <Icon name={deco.icon ?? 'star'} filled className="text-[14px] text-ink" />
          </span>
        ))}
      </button>
    </div>
  )
}
