import { useState } from 'react'
import StepProgress from '../../components/common/StepProgress'
import TextField from '../../components/common/TextField'
import PrimaryButton from '../../components/common/PrimaryButton'

// S-11 · 온보딩 2 · 닉네임 (명세 2.2)
export default function NicknameScreen({ auth, onNext, showStepProgress = true }) {
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
    <div className="pastel-wash flex min-h-svh flex-col bg-surface px-6 py-6 lg:mx-auto lg:max-w-[480px]">
      {showStepProgress && <StepProgress current={2} total={4} />}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col">
        <h1 className="text-[24px] font-medium leading-snug text-ink">뭐라고 부르면 될까요?</h1>
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
  )
}
