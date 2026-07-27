import { useState } from 'react'
import AppBar from '../components/common/AppBar'
import TextField from '../components/common/TextField'
import PrimaryButton from '../components/common/PrimaryButton'

// S-02 · 비밀번호 재설정 (명세 1.1)
export default function ResetPasswordScreen({ auth, onBack }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    await auth.sendPasswordReset(email.trim())
    setSubmitting(false)
    setDone(true)
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="비밀번호 재설정" leading="back" onLeadingClick={onBack} />
      <div className="flex flex-1 flex-col px-6 py-6">
        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-[15px] font-medium text-ink">
              메일함을 확인해 주세요. 5분 안에 오지 않으면 스팸함도 확인해 보세요.
            </p>
            <PrimaryButton label="로그인으로 돌아가기" onClick={onBack} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[13px] text-ink-muted">가입하신 이메일로 재설정 링크를 보내드릴게요.</p>
            <TextField id="reset-email" label="이메일" type="email" autoComplete="email" value={email} onChange={setEmail} />
            <PrimaryButton type="submit" label="재설정 링크 보내기" loading={submitting} disabled={!email.trim()} />
          </form>
        )}
      </div>
    </div>
  )
}
