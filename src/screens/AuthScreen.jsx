import { useState } from 'react'
import Icon from '../components/Icon'
import TextField from '../components/common/TextField'
import PrimaryButton from '../components/common/PrimaryButton'
import InlineBanner from '../components/common/InlineBanner'
import SparkleStar from '../components/common/SparkleStar'

// S-01 · 로그인 · 회원가입 (명세 1.1, 1.2)
export default function AuthScreen({ auth, initialMode = 'login', onForgotPassword, onSignupSuccess }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  const passwordTooShort = mode === 'signup' && password.length > 0 && password.length < 8
  const passwordMismatch = mode === 'signup' && passwordConfirm.length > 0 && password !== passwordConfirm
  const canSubmit =
    email.trim() &&
    password.length >= (mode === 'signup' ? 8 : 1) &&
    (mode === 'login' || (passwordConfirm && !passwordMismatch))

  const switchMode = (next) => {
    setMode(next)
    setSignupDone(false)
    auth.clearAuthError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setSignupDone(false)
    if (mode === 'login') {
      await auth.signInWithEmail(email, password)
    } else {
      const ok = await auth.signUpWithEmail(email, password)
      if (ok) {
        setSignupDone(true)
        onSignupSuccess?.()
      }
    }
    setSubmitting(false)
  }

  const isAlreadyRegistered = /already registered|user already exists/i.test(auth.authError ?? '')
  if (isAlreadyRegistered && mode === 'signup') {
    // 하단에 안내와 함께 자동으로 로그인 모드로 전환
  }

  return (
    <div className="landing-wash pre-auth-light relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-surface px-6 py-10">
      <SparkleStar
        className="absolute"
        style={{ top: '9%', right: '14%', width: 20, height: 20, color: 'var(--color-highlight)', opacity: 'var(--star-opacity)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ bottom: '10%', left: '12%', width: 16, height: 16, color: 'var(--color-highlight)', opacity: 'var(--star-opacity)' }}
      />

      <div className="relative w-full max-w-xs">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mind-planet__orb h-14 w-14 rounded-full" data-planet-stage="1" aria-hidden="true" />
          <p className="text-[20px] font-medium text-ink">지구 마음</p>
          <p className="text-[13px] text-ink-muted">마음을 돌보다, 지구를 돌보다</p>
        </div>

        <button
          type="button"
          onClick={auth.signInWithKakao}
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] text-[15px] font-medium text-[#191919]"
        >
          카카오로 시작하기
        </button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[12px] text-ink-faint">또는</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <TextField
            id="email"
            label="이메일"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
          />
          <TextField
            id="password"
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={setPassword}
            error={passwordTooShort ? '8자 이상 입력해주세요' : undefined}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="shrink-0"
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-ink-faint" />
              </button>
            }
          />
          {mode === 'signup' && (
            <TextField
              id="password-confirm"
              label="비밀번호 확인"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              error={passwordMismatch ? '비밀번호가 일치하지 않아요' : undefined}
            />
          )}

          {auth.authError && !isAlreadyRegistered && (
            <InlineBanner
              tone="danger"
              message={mode === 'login' ? '이메일 또는 비밀번호가 일치하지 않아요' : '가입을 완료하지 못했어요. 잠시 후 다시 시도해 주세요'}
            />
          )}
          {isAlreadyRegistered && (
            <InlineBanner
              tone="warning"
              message="이미 가입된 이메일이에요. 로그인해 주세요"
              actionLabel="로그인하기"
              onAction={() => switchMode('login')}
            />
          )}
          {signupDone && <InlineBanner tone="warning" message="가입 확인 메일을 보냈어요. 메일함을 확인한 뒤 로그인해주세요." />}

          <PrimaryButton
            type="submit"
            label={mode === 'login' ? '로그인' : '가입하고 시작하기'}
            loading={submitting}
            disabled={!canSubmit}
          />
        </form>

        <div className="mt-4 flex items-center justify-between text-[13px] font-medium text-ink-muted">
          <button type="button" onClick={onForgotPassword}>
            비밀번호를 잊었어요
          </button>
          <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  )
}
