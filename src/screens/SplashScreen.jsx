import PrimaryButton from '../components/common/PrimaryButton'
import earthStage5 from '../assets/planet-mascot/stage-5.svg'

// S-00 스플래시 / 세션 판별 — 로그인 여부와 무관하게 항상 라이트 고정(.pre-auth-light 참고).
// 세 가지 상태를 표현한다: (1) 세션 확인 중, (2) 프로필 로딩 실패(재시도),
// (3) 세션 복구됨(짧은 환영 문구, 버튼 없이 자동으로 다음 화면 진입)
//
// (1)에는 원래 진행 아이콘 스피너가 있었으나, 접속 초기(Material Symbols 폰트가 아직
// 로드되기 전) 타이밍에 걸리면 font-display: swap 폴백으로 아이콘 리거처 문자열("progress_
// activity")이 그대로 텍스트로 노출된 채 회전해 보이는 문제가 있어 제거함.
export default function SplashScreen({ error, onRetry, welcome = false, displayName }) {
  return (
    <div className="landing-wash pre-auth-light flex min-h-svh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <img src={earthStage5} alt="" aria-hidden="true" className="h-20 w-20" />
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
      ) : null}
    </div>
  )
}
