import { useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import AppBar from '../../components/common/AppBar'
import TextField from '../../components/common/TextField'
import InlineBanner from '../../components/common/InlineBanner'
import Icon from '../../components/Icon'
import { deleteAccount } from '../../data/storage'

// S-64D · 로그아웃 / 회원 탈퇴 (명세 7.4)
export default function LogoutWithdrawDialog({ mode, auth, onClose }) {
  const [confirmText, setConfirmText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const displayName = auth.user?.user_metadata?.display_name ?? ''

  if (mode === 'logout') {
    return (
      <ConfirmDialog
        title="로그아웃할까요?"
        confirmLabel="로그아웃"
        onConfirm={async () => {
          await auth.signOut()
          onClose()
        }}
        onCancel={onClose}
      />
    )
  }

  const canWithdraw = confirmText.trim() === displayName && displayName

  const handleWithdraw = async () => {
    setProcessing(true)
    setErrorMessage('')
    try {
      await deleteAccount()
      await auth.signOut()
      onClose()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '탈퇴 처리 중 오류가 발생했습니다.')
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="" leading="close" onLeadingClick={onClose} />
      <div className="flex-1 px-6 pb-6">
        <h1 className="text-[20px] font-medium text-ink">정말 탈퇴하실까요?</h1>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-[13px] text-ink-muted">
          <li>미션 기록</li>
          <li>미션 생성 기록</li>
          <li>회고</li>
          <li>지구 성장 단계</li>
        </ul>
        <p className="mt-3 text-[13px] font-medium text-ink">지운 기록은 되돌릴 수 없어요.</p>

        <div className="mt-6">
          <TextField
            id="withdraw-confirm"
            label={`확인을 위해 닉네임 "${displayName}"을(를) 입력해주세요`}
            value={confirmText}
            onChange={setConfirmText}
          />
        </div>

        {errorMessage && (
          <div className="mt-6">
            <InlineBanner message={errorMessage} tone="danger" />
          </div>
        )}

        <div className="mt-8">
          <button
            type="button"
            disabled={!canWithdraw || processing}
            onClick={handleWithdraw}
            className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium ${
              !canWithdraw || processing ? 'bg-disabled text-disabled-ink' : 'bg-danger-soft text-danger'
            }`}
          >
            {processing && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
            <span>탈퇴하기</span>
          </button>
        </div>
      </div>
    </div>
  )
}
