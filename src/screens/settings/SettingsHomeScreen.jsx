import AppBar from '../../components/common/AppBar'
import Icon from '../../components/Icon'

function Row({ label, onClick, muted = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-surface-alt px-4 py-3.5 text-left"
    >
      <span className={`text-[14px] font-medium ${muted ? 'text-ink-muted' : 'text-ink'}`}>{label}</span>
      <Icon name="chevron_right" className="text-ink-faint" />
    </button>
  )
}

// S-60 · 설정 홈 (명세 7.x, 8.3)
export default function SettingsHomeScreen({ onBack, onOpenDisplay, onOpenAccount, onOpenProfile, onOpenCoachmark, onOpenSupport, onOpenLogoutWithdraw }) {
  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="설정" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-6 px-4 py-4">
        <section className="space-y-2">
          <p className="px-1 text-[12px] font-medium text-ink-faint">화면</p>
          <Row label="화면 및 접근성" onClick={onOpenDisplay} />
        </section>
        <section className="space-y-2">
          <p className="px-1 text-[12px] font-medium text-ink-faint">나</p>
          <Row label="계정 정보" onClick={onOpenAccount} />
          <Row label="나의 프로필" onClick={onOpenProfile} />
          <Row label="안내 다시 보기" onClick={onOpenCoachmark} />
        </section>
        <section className="space-y-2">
          <p className="px-1 text-[12px] font-medium text-ink-faint">안내</p>
          <Row label="도움 받을 곳" onClick={() => onOpenSupport('help')} />
          <Row label="서비스 안내" onClick={() => onOpenSupport('about')} />
        </section>
        <section className="space-y-2 pt-6">
          <Row label="로그아웃" onClick={() => onOpenLogoutWithdraw('logout')} muted />
          <Row label="회원 탈퇴" onClick={() => onOpenLogoutWithdraw('withdraw')} muted />
        </section>
      </div>
    </div>
  )
}
