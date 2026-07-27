import AppBar from '../../components/common/AppBar'

// S-60 "서비스 안내" 정적 화면 (명세 8.3 고지 포함)
export default function ServiceInfoScreen({ onBack }) {
  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="서비스 안내" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-4 px-6 py-6 text-[14px] leading-relaxed text-ink">
        <p>지구 마음은 기후불안을 느끼는 사람이 오늘 마음 상태를 확인하고, 지금 할 수 있는 작은 실천 미션을 받아 실천 기록을 쌓아가는 서비스예요.</p>
        <p className="font-semibold">지구 마음은 전문적인 심리 상담·진단·치료를 대신하지 않아요.</p>
        <p className="text-ink-muted">버전 0.1.0</p>
      </div>
    </div>
  )
}
