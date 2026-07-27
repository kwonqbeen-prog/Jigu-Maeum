import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import PrimaryButton from '../components/common/PrimaryButton'

// S-00 스플래시 / 세션 판별 — 로그인 여부와 무관하게 항상 라이트 고정(.pre-auth-light 참고).
// 세 가지 상태를 표현한다: (1) 세션 확인 중(스피너), (2) 프로필 로딩 실패(재시도),
// (3) 세션 복구됨(짧은 환영 문구, 버튼 없이 자동으로 다음 화면 진입)
export default function SplashScreen({ error, onRetry, welcome = false, displayName }) {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (error || welcome) return undefined
    const timer = setTimeout(() => setShowSpinner(true), 600)
    return () => clearTimeout(timer)
  }, [error, welcome])

  return (
    <div className="landing-wash pre-auth-light flex min-h-svh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <div className="mind-planet__orb h-20 w-20 rounded-full" data-planet-stage="1" aria-hidden="true" />
      <div>
        <p className="text-[20px] font-medium text-ink">지구 마음</p>
        <p className="mt-1 text-[13px] text-ink-muted">마음을 돌보다, 지구를 돌보다</p>
      </div>
      {error ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-[13px] font-medium text-danger">연결에 실패했어요</p>
          <PrimaryButton label="다시 시도" onClick={onRetry} />
        </div>
      ) : welcome ? (
        <p className="mt-2 text-[15px] font-medium text-ink">
          {displayName ? `${displayName}님, ` : ''}돌아오신 걸 환영해요
        </p>
      ) : (
        showSpinner && <Icon name="progress_activity" className="mt-2 animate-spin text-2xl text-ink-faint" />
      )}
    </div>
  )
}
