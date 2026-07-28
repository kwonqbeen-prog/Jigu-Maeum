import { useState } from 'react'
import PrimaryButton from '../components/common/PrimaryButton'
import SparkleStar from '../components/common/SparkleStar'
import SignupConsentDialog from '../components/common/SignupConsentDialog'
import logo from '../assets/planet-mascot/logo.svg'

// S-00b · 랜딩 — 세션 없음이 확인된 뒤 보여지는 가입하기/로그인 진입 화면.
// 로그인 전 화면이라 항상 라이트 고정(.pre-auth-light 참고)
export default function LandingScreen({ onSignup, onLogin }) {
  const [showConsent, setShowConsent] = useState(false)

  return (
    <div className="landing-wash pre-auth-light relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-surface px-6 text-center">
      <SparkleStar
        className="absolute"
        style={{ top: '13%', right: '16%', width: 60, height: 60, color: '#fff', opacity: 'var(--star-opacity)', filter: 'blur(1px)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ top: '30%', left: '12%', width: 42, height: 42, color: '#fff', opacity: 'var(--star-opacity)', filter: 'blur(1px)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ bottom: '26%', right: '20%', width: 36, height: 36, color: '#fff', opacity: 'var(--star-opacity)', filter: 'blur(1px)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ bottom: '14%', left: '18%', width: 48, height: 48, color: '#fff', opacity: 'var(--star-opacity)', filter: 'blur(1px)' }}
      />

      <img src={logo} alt="" aria-hidden="true" className="h-16 w-16" />
      <p className="mt-3 text-[20px] font-medium text-ink">지구 마음</p>
      <p className="mt-1 text-[13px] text-ink-muted">마음을 돌보다, 지구를 돌보다</p>

      <div className="relative mt-10 w-full max-w-xs space-y-2">
        <PrimaryButton label="가입하기" onClick={() => setShowConsent(true)} />
        <button
          type="button"
          onClick={onLogin}
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-white/60 text-[15px] font-medium text-ink"
        >
          로그인
        </button>
      </div>

      {showConsent && (
        <SignupConsentDialog
          onCancel={() => setShowConsent(false)}
          onAgree={() => {
            setShowConsent(false)
            onSignup()
          }}
        />
      )}
    </div>
  )
}
