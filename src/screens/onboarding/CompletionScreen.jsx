import StepProgress from '../../components/common/StepProgress'
import PrimaryButton from '../../components/common/PrimaryButton'
import GhostButton from '../../components/common/GhostButton'

// S-14 · 온보딩 5 · 완료 — 오브 없음(사용자 확정)
export default function CompletionScreen({ onStartTour, onSkipTour }) {
  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface px-6 py-6 lg:mx-auto lg:max-w-[480px]">
      <StepProgress current={5} total={5} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-[22px] font-medium leading-snug text-ink">
          다 끝났어요!
          <br />
          이제 앱을 사용해 볼까요?
        </h1>
      </div>
      <div className="flex flex-col gap-2 pt-8">
        <PrimaryButton label="튜토리얼 시작하기" onClick={onStartTour} />
        <GhostButton label="직접 써보면서 알아갈래요" onClick={onSkipTour} className="justify-center" />
      </div>
    </div>
  )
}
