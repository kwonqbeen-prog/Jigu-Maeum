import PrimaryButton from '../../components/common/PrimaryButton'
import GhostButton from '../../components/common/GhostButton'

// S-14 · 온보딩 5 · 완료 — 오브 없음(사용자 확정).
// 진행바는 화면모드~관심분야 구간에만 표시하므로 이 화면에는 없음(사용자 확정)
export default function CompletionScreen({ onStartTour, onSkipTour }) {
  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
      <div className="flex w-full flex-1 flex-col px-6 py-6 lg:mx-auto lg:max-w-[560px] lg:flex-none lg:px-10 lg:py-14">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-[22px] font-medium leading-snug text-ink lg:text-[28px]">
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
    </div>
  )
}
