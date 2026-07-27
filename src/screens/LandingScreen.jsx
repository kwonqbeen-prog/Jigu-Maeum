import PrimaryButton from '../components/common/PrimaryButton'
import SparkleStar from '../components/common/SparkleStar'

// S-00b · 랜딩 — 세션 없음이 확인된 뒤 보여지는 가입하기/로그인 진입 화면.
// 로그인 전 화면이라 항상 라이트 고정(.pre-auth-light 참고)
export default function LandingScreen({ onSignup, onLogin }) {
  return (
    <div className="landing-wash pre-auth-light relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-surface px-6 text-center">
      <SparkleStar
        className="absolute"
        style={{ top: '13%', right: '16%', width: 30, height: 30, color: 'var(--color-highlight)', opacity: 'var(--star-opacity)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ top: '30%', left: '12%', width: 21, height: 21, color: 'var(--color-highlight)', opacity: 'var(--star-opacity)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ bottom: '26%', right: '20%', width: 18, height: 18, color: 'var(--color-highlight)', opacity: 'var(--star-opacity)' }}
      />
      <SparkleStar
        className="absolute"
        style={{ bottom: '14%', left: '18%', width: 24, height: 24, color: 'var(--color-highlight)', opacity: 'var(--star-opacity)' }}
      />

      <div className="mind-planet__orb h-16 w-16 rounded-full" data-planet-stage="1" aria-hidden="true" />
      <p className="mt-3 text-[20px] font-medium text-ink">지구 마음</p>
      <p className="mt-1 text-[13px] text-ink-muted">마음을 돌보다, 지구를 돌보다</p>

      <div className="relative mt-10 w-full max-w-xs space-y-2">
        <PrimaryButton label="가입하기" onClick={onSignup} />
        <button
          type="button"
          onClick={onLogin}
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-white/60 text-[15px] font-medium text-ink"
        >
          로그인
        </button>
      </div>

      <p className="relative mt-5 max-w-xs text-[10px] leading-relaxed text-ink-faint">
        계속 진행하면 서비스 이용약관 및
        <br />
        개인정보 처리방침에 동의하는 것으로 간주돼요
      </p>
    </div>
  )
}
