import { useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StepProgress from '../../components/common/StepProgress'
import TextField from '../../components/common/TextField'
import PrimaryButton from '../../components/common/PrimaryButton'

// S-11 · 온보딩 2 · 닉네임 (명세 2.2)
// showStepProgress=false는 다른 화면(예: 설정 > 닉네임 변경)에서 이 컴포넌트를 재사용할
// 경우를 위해 남겨둔 것 — 그 경우 onBack도 안 넘겨주면 AppBar의 뒤로가기가 빈 동작이 되니
// 재사용 시 반드시 onBack도 같이 넘길 것
export default function NicknameScreen({ auth, onNext, onBack, showStepProgress = true }) {
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const trimmed = displayName.trim()
  const isValid = trimmed.length >= 1 && trimmed.length <= 12

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    const { error } = await auth.updateDisplayName(trimmed)
    setSubmitting(false)
    if (!error) onNext()
  }

  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
      <div className="flex w-full flex-1 flex-col lg:mx-auto lg:max-w-[480px] lg:flex-none">
        <AppBar title="" leading="back" onLeadingClick={onBack} />
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-6 pb-6 lg:flex-none">
          {showStepProgress && <StepProgress current={2} total={5} />}
          <h1 className="mt-6 text-[24px] font-medium leading-snug text-ink">뭐라고 부르면 될까요?</h1>
          <div className="mt-6">
            <TextField
              id="nickname"
              label="닉네임"
              value={displayName}
              onChange={(v) => setDisplayName(v.slice(0, 12))}
              maxLength={12}
              counter={`${trimmed.length}/12`}
            />
          </div>
          {trimmed && <p className="mt-3 text-[15px] text-ink-muted">안녕하세요, <span className="font-medium text-ink">{trimmed}</span>님.</p>}
          {auth.authError && <p className="mt-3 text-[13px] font-medium text-danger">{auth.authError}</p>}
          <div className="mt-auto pt-8">
            <PrimaryButton type="submit" label="이 이름으로 시작하기" loading={submitting} disabled={!isValid} />
          </div>
        </form>
      </div>
    </div>
  )
}
