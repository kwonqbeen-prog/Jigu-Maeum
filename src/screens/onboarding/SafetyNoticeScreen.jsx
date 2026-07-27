import StepProgress from '../../components/common/StepProgress'
import PrimaryButton from '../../components/common/PrimaryButton'
import GhostButton from '../../components/common/GhostButton'

// S-13 · 온보딩 4 · 안전 고지 (명세 8.3)
export default function SafetyNoticeScreen({ onConfirm, onPreviewSupport }) {
  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface px-6 py-6 lg:mx-auto lg:max-w-[480px]">
      <StepProgress current={4} total={4} />
      <div className="mt-6 flex-1">
        <h1 className="text-[24px] font-medium leading-snug text-ink">시작하기 전에 한 가지만요</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink">
          지구 마음은 마음을 돌보는 걸 돕는 서비스예요. 전문적인 심리 상담이나 진단, 치료를 대신하지 않아요.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink">
          많이 힘들 땐 전문가의 도움을 받는 게 가장 빠른 길이에요. 필요할 때 볼 수 있도록 상담 채널 정보를 앱 안에 두었어요.
        </p>
      </div>
      <div className="space-y-2">
        <GhostButton label="도움 받을 곳 미리 보기" onClick={onPreviewSupport} className="w-full bg-surface-alt rounded-full" />
        <PrimaryButton label="확인했어요" onClick={onConfirm} />
      </div>
    </div>
  )
}
