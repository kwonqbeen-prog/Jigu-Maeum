import { useRef, useState } from 'react'
import PrimaryButton from '../../components/common/PrimaryButton'

// 가입 전 서비스 소개 4장 캐러셀 — 오브 4색 중 옐로우를 뺀 스카이블루/라벤더/핑크만 사용,
// 슬라이드마다 원 위치만 바꿔서 배리에이션을 만든다(--gradient-landing-wash 지역 override).
const SLIDES = [
  {
    wash: 'radial-gradient(circle at 30% 15%, #d3e7fb 0%, transparent 45%), radial-gradient(circle at 75% 30%, #e4d9f7 0%, transparent 50%), radial-gradient(circle at 30% 80%, #ffdce8 0%, transparent 50%)',
    star: { top: '9%', left: '50%' },
    headline: ['기후 위기 속에서', '마음이 무거운가요?'],
    body: ['지구 마음은 기후 불안을 겪는', '사람들을 위해 만들어진', '감정 케어 서비스예요.'],
  },
  {
    wash: 'radial-gradient(circle at 70% 20%, #d3e7fb 0%, transparent 45%), radial-gradient(circle at 25% 55%, #ffdce8 0%, transparent 50%), radial-gradient(circle at 70% 85%, #e4d9f7 0%, transparent 50%)',
    headline: ['오늘의 마음을 입력하면,', 'AI가 나에게 딱 맞는', '미션을 만들어요.'],
    body: ['미션을 실천하고, 매일매일', '달라지는 감정을 기록해요.'],
  },
  {
    wash: 'radial-gradient(circle at 50% 15%, #e4d9f7 0%, transparent 45%), radial-gradient(circle at 25% 70%, #d3e7fb 0%, transparent 50%), radial-gradient(circle at 75% 80%, #ffdce8 0%, transparent 50%)',
    headline: ['미션에 성공할수록', '마음 지구도 자라나요.'],
    body: ['일상 속 작은 노력이 쌓여', '큰 변화로 다가올 거예요.'],
  },
  {
    wash: 'radial-gradient(circle at 85% 10%, #e4d9f7 0%, transparent 50%)',
    headline: ['시작하기 전', '확인해 주세요.'],
    body: [
      '지구 마음은 마음 건강을 위한 보조 도구로,',
      '전문적인 진단·치료·처방을 대신할 수 없어요.',
      '정신 건강에 어려움이 있다면 전문가나',
      '의료 기관에 연락해 도움을 받으세요.',
    ],
    hotline: '정신건강 위기상담전화 1577-0199',
    safety: true,
  },
]

const LAST_INDEX = SLIDES.length - 1
const SWIPE_THRESHOLD = 40

function TextLines({ lines }) {
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

// 가입 전 서비스 소개 캐러셀 — 화살표/건너뛰기 버튼 없이 스와이프 또는 화면 좌/우 탭으로만
// 이동한다(오른쪽 탭·왼쪽 스와이프=다음, 왼쪽 탭·오른쪽 스와이프=이전). 4번(안전 고지)은
// "동의하고 시작하기"를 눌러야 다음(가입 폼)으로 진행. 로그인 전 화면이라 항상 라이트
// 고정(.pre-auth-light 참고)
export default function ServiceIntroCarouselScreen({ onComplete }) {
  const [index, setIndex] = useState(0)
  const dragRef = useRef({ dragging: false, startX: 0 })

  const goTo = (next) => setIndex(Math.min(LAST_INDEX, Math.max(0, next)))

  const handlePointerDown = (e) => {
    dragRef.current = { dragging: true, startX: e.clientX }
  }
  // 드래그 거리가 임계값 이상이면 스와이프, 아니면 누른 x좌표가 화면 좌/우 절반 중
  // 어느 쪽인지로 이전/다음을 판단하는 탭으로 취급한다
  const handlePointerUp = (e) => {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    const dx = e.clientX - dragRef.current.startX
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      goTo(dx < 0 ? index + 1 : index - 1)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const tappedRight = e.clientX - rect.left > rect.width / 2
    goTo(tappedRight ? index + 1 : index - 1)
  }

  const slide = SLIDES[index]

  return (
    <div
      className="landing-wash pre-auth-light relative flex min-h-svh flex-col overflow-hidden bg-surface"
      style={{ '--gradient-landing-wash': slide.wash }}
    >
      {slide.star && (
        <span
          className="mind-planet__star mind-planet__star--sparkle absolute"
          style={{ top: slide.star.top, left: slide.star.left, width: 10, height: 10, opacity: 0.3 }}
          aria-hidden="true"
        />
      )}

      <div
        className="flex flex-1 touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragRef.current.dragging = false
        }}
      >
        <span className="sr-only">화면 오른쪽을 누르면 다음, 왼쪽을 누르면 이전 슬라이드로 이동해요</span>
        <div
          className="flex flex-1 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <div key={i} className="flex w-full shrink-0 flex-col items-center justify-center px-8 text-center">
              <h1 className="text-[24px] font-medium leading-snug text-ink">
                <TextLines lines={s.headline} />
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                <TextLines lines={s.body} />
              </p>
              {s.hotline && <p className="mt-3 text-[10px] text-ink-faint">{s.hotline}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-5 px-6 pb-8">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="슬라이드 위치">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === index}
              className="h-2 w-2 rounded-full transition-colors"
              style={{ backgroundColor: i === index ? 'var(--color-ink)' : '#dcdad1' }}
            />
          ))}
        </div>

        {slide.safety && (
          <div className="w-full max-w-xs">
            <PrimaryButton label="동의하고 시작하기" onClick={onComplete} />
          </div>
        )}
      </div>
    </div>
  )
}
