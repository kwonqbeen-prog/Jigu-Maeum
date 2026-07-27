import Icon from '../Icon'
import SparkleStar from './SparkleStar'

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

// 대륙 블롭 3개의 위치·크기(% 단위, 오브 크기와 무관하게 스케일됨) — 지시서 §2
const BLOB_LAYOUT = [
  { top: '10%', left: '6%', width: '52%', height: '44%' },
  { top: '44%', left: '38%', width: '46%', height: '38%' },
  { top: '26%', left: '56%', width: '34%', height: '30%' },
]

// 단계별 대륙 색상·블롭 개수·목표 opacity — 지시서 §1 색상표 그대로. 1단계는 대륙 없음
const CONTINENT_CONFIG = {
  2: { color: 'var(--mind-planet-continent-2)', opacities: [0.7] },
  3: { color: 'var(--mind-planet-continent-3)', opacities: [0.75, 0.7] },
  4: { color: 'var(--mind-planet-continent-4)', opacities: [0.8, 0.75, 0.75] },
  5: { color: 'var(--mind-planet-continent-5)', opacities: [0.85, 0.8, 0.8] },
}

// C-09 PlanetOrb — 장식 요소(업적)는 동시 최대 3개
export default function PlanetOrb({ totalCompleted = 0, decorations = [], size = 'large', expression = 'default', onClick }) {
  const { stage, name } = getPlanetStage(totalCompleted)
  const sizeClass = size === 'large' ? 'h-56 w-56 sm:h-64 sm:w-64' : 'h-24 w-24'
  const showDetail = size === 'large' // 대륙/눈은 large 사이즈에서만 — STARS와 동일한 기존 관례
  const continentConfig = CONTINENT_CONFIG[stage]

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden" aria-hidden={size !== 'large' ? undefined : false}>
      {size === 'large' &&
        STARS.map((star, i) =>
          star.shape === 'sparkle' ? (
            <SparkleStar
              key={i}
              className="absolute"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                color: 'var(--color-highlight)',
                opacity: 'var(--star-opacity)',
              }}
            />
          ) : (
            <span
              key={i}
              className="mind-planet__star mind-planet__star--dot absolute"
              style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
              aria-hidden="true"
            />
          ),
        )}
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        role="img"
        aria-label={`마음 지구 ${stage}단계 ${name}, 누적 완료 ${totalCompleted}개`}
        className="relative flex items-center justify-center"
      >
        <div className={`mind-planet__orb rounded-full ${sizeClass}`} data-planet-stage={String(stage)}>
          <div className="mind-planet__surface">
            {showDetail && continentConfig && (
              <div className="mind-planet__continents" aria-hidden="true">
                {continentConfig.opacities.map((opacity, i) => (
                  <span
                    key={i}
                    className="mind-planet__continent"
                    style={{
                      ...BLOB_LAYOUT[i],
                      '--continent-color': continentConfig.color,
                      '--continent-peak-opacity': opacity,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          {showDetail && <div className={`mind-planet__eyes mind-planet__eyes--${expression}`} aria-hidden="true" />}
        </div>
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
