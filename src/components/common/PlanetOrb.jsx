import Icon from '../Icon'

// 화면설계서 §6 S-20 — 누적 완료 수 → 5단계 임계값 [결정필요 → Q6, 문서 기본값 그대로 적용].
// 0단계("막 태어난 지구")는 아무 미션도 완료하지 않은 순간만을 위한 별도 단계 — 기존
// 1단계는 min:0이라 가입 직후부터 바로 붙었으나, "완전히 갓 태어난" 느낌을 위해 최초
// 1개 완료 전까지만 보이는 상태를 따로 뺐다
export const STAGE_THRESHOLDS = [
  { stage: 0, min: 0, name: '막 태어난 지구' },
  { stage: 1, min: 1, name: '조용한 지구' },
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

// 대륙 블롭 3개의 위치·크기(% 단위, 오브 크기와 무관하게 스케일됨) — 지시서 §2
const BLOB_LAYOUT = [
  { top: '10%', left: '6%', width: '52%', height: '44%' },
  { top: '44%', left: '38%', width: '46%', height: '38%' },
  { top: '26%', left: '56%', width: '34%', height: '30%' },
]

// 단계별 대륙 색상·블롭 개수·목표 opacity — 지시서 §1 색상표 기준. 1단계는 원래 대륙
// 없음이었으나, "완전히 하얗게만 보여서 지구 같지 않다"는 피드백으로 옅은 블롭을 추가함.
// 이후 "블롭 개수를 5단계 모두 3개로 통일해달라"는 요청으로 1~3단계도 블롭 3개(opacities
// 3개)로 맞추고, 값은 4·5단계에서 이미 쓰던 감소 패턴을 그대로 이어서 채움
const CONTINENT_CONFIG = {
  1: { color: 'var(--mind-planet-continent-1)', opacities: [0.6, 0.55, 0.5] },
  2: { color: 'var(--mind-planet-continent-2)', opacities: [0.7, 0.65, 0.6] },
  3: { color: 'var(--mind-planet-continent-3)', opacities: [0.75, 0.7, 0.65] },
  4: { color: 'var(--mind-planet-continent-4)', opacities: [0.8, 0.75, 0.75] },
  5: { color: 'var(--mind-planet-continent-5)', opacities: [0.85, 0.8, 0.8] },
}

// C-09 PlanetOrb — 장식 요소(업적)는 동시 최대 3개
export default function PlanetOrb({ totalCompleted = 0, decorations = [], size = 'large', expression = 'default', onClick }) {
  const { stage, name } = getPlanetStage(totalCompleted)
  // 0단계("막 태어난 지구")는 아직 아무것도 없는 작은 크기로 표시
  const sizeClass =
    size === 'large' ? (stage === 0 ? 'h-40 w-40 sm:h-48 sm:w-48' : 'h-56 w-56 sm:h-64 sm:w-64') : 'h-24 w-24'
  const showDetail = size === 'large' // 대륙/눈은 large 사이즈에서만
  const continentConfig = CONTINENT_CONFIG[stage]

  return (
    <div className="relative flex h-full items-center justify-center" aria-hidden={size !== 'large' ? undefined : false}>
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
