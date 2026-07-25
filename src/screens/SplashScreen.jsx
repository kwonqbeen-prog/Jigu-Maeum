import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import PrimaryButton from '../components/common/PrimaryButton'

// S-00 스플래시 / 세션 판별
export default function SplashScreen({ error, onRetry }) {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (error) return undefined
    const timer = setTimeout(() => setShowSpinner(true), 600)
    return () => clearTimeout(timer)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <div className="mind-planet__orb h-20 w-20 rounded-full" data-planet-stage="1" aria-hidden="true" />
      <div>
        <p className="text-[20px] font-bold text-ink">지구 마음</p>
        <p className="mt-1 text-[13px] text-ink-muted">마음을 돌보다, 지구를 돌보다</p>
      </div>
      {error ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="text-[13px] font-medium text-danger">연결에 실패했어요</p>
          <PrimaryButton label="다시 시도" onClick={onRetry} />
        </div>
      ) : (
        showSpinner && <Icon name="progress_activity" className="mt-2 animate-spin text-2xl text-ink-faint" />
      )}
    </div>
  )
}
