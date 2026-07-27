import PrimaryButton from '../../components/common/PrimaryButton'

// S-09b · 온보딩 1 · 웰컴 — 오브 없음(사용자 확정), 순수 텍스트 + CTA만.
// 진행바는 화면모드~관심분야 구간에만 표시하므로 이 화면에는 없음(사용자 확정)
export default function WelcomeScreen({ onNext }) {
  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
      <div className="flex w-full flex-1 flex-col px-6 py-6 lg:mx-auto lg:max-w-[480px] lg:flex-none lg:py-12">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-[22px] font-medium leading-snug text-ink">
            반가워요.
            <br />
            마음과 지구를 돌볼
            <br />
            준비가 됐나요?
          </h1>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            당신의 여정을 시작하는 데 필요한 것들을 준비했어요.
            <br />
            지금 설정하는 내용들은 언제든 바꿀 수 있으니, 편하게 말씀해주세요.
          </p>
        </div>
        <div className="pt-8">
          <PrimaryButton label="준비됐어요!" onClick={onNext} />
        </div>
      </div>
    </div>
  )
}
