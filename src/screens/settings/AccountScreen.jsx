import { useState } from 'react'
import AppBar from '../../components/common/AppBar'
import TextField from '../../components/common/TextField'
import { useToast } from '../../contexts/ToastContext'

// S-62 · 계정 정보 (명세 7.2)
export default function AccountScreen({ auth, onBack, onChangePassword }) {
  const isKakao = auth.user?.app_metadata?.provider === 'kakao'
  const [nickname, setNickname] = useState(auth.user?.user_metadata?.display_name ?? '')
  const showToast = useToast()

  const handleBlur = async () => {
    const trimmed = nickname.trim()
    if (!trimmed || trimmed === auth.user?.user_metadata?.display_name) return
    const { error } = await auth.updateDisplayName(trimmed.slice(0, 12))
    if (!error) showToast('닉네임을 바꿨어요')
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <AppBar title="계정 정보" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-4 px-4 py-4">
        <div className="rounded-2xl bg-surface-alt p-4 text-[13px] text-ink-muted">
          <p>로그인 방식 · {isKakao ? '카카오' : '이메일'}</p>
          {!isKakao && <p className="mt-1">{auth.user?.email}</p>}
          <p className="mt-1">
            가입일 · {auth.user?.created_at ? new Date(auth.user.created_at).toLocaleDateString('ko-KR') : '-'}
          </p>
        </div>

        <TextField
          id="account-nickname"
          label="닉네임"
          value={nickname}
          onChange={(v) => setNickname(v.slice(0, 12))}
          maxLength={12}
          counter={`${nickname.length}/12`}
          rightSlot={
            <button type="button" onClick={handleBlur} className="text-[13px] font-bold text-ink shrink-0">
              저장
            </button>
          }
        />

        {!isKakao && (
          <button type="button" onClick={onChangePassword} className="w-full rounded-xl bg-surface-alt px-4 py-3 text-left text-[14px] font-semibold text-ink">
            비밀번호 변경
          </button>
        )}
      </div>
    </div>
  )
}
