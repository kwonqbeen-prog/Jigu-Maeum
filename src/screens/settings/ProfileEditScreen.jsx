import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import ChipGroup from '../../components/common/ChipGroup'
import PrimaryButton from '../../components/common/PrimaryButton'
import Icon from '../../components/Icon'
import { useToast } from '../../contexts/ToastContext'
import { COPING_STYLES, SOCIAL_PREFERENCES, INTERESTS, MAX_INTERESTS } from '../../data/constants'
import { getUserMemories, deleteUserMemory } from '../../data/storage'

// S-63 · 사용자 프로필 수정 (명세 7.3, 3.5)
export default function ProfileEditScreen({ profile, onBack, onSave }) {
  const [copingStyle, setCopingStyle] = useState(profile?.coping_style ?? null)
  const [socialPreference, setSocialPreference] = useState(profile?.social_preference ?? null)
  const [interests, setInterests] = useState(profile?.interests ?? [])
  const [memories, setMemories] = useState(null)
  const [saving, setSaving] = useState(false)
  const showToast = useToast()

  useEffect(() => {
    getUserMemories().then(setMemories)
  }, [])

  const dirty =
    copingStyle !== profile?.coping_style ||
    socialPreference !== profile?.social_preference ||
    JSON.stringify(interests) !== JSON.stringify(profile?.interests ?? [])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ coping_style: copingStyle, social_preference: socialPreference, interests })
    setSaving(false)
    showToast('저장했어요. 다음 미션부터 반영돼요.')
  }

  const handleDeleteMemory = async (id) => {
    await deleteUserMemory(id)
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <AppBar title="나의 프로필" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-6 px-4 py-4">
        <section>
          <p className="mb-2 text-[13px] font-bold text-ink-muted">마음이 무거울 때, 보통 어떻게 하세요?</p>
          <ChipGroup items={COPING_STYLES} mode="single" value={copingStyle} onChange={setCopingStyle} />
        </section>
        <section>
          <p className="mb-2 text-[13px] font-bold text-ink-muted">다른 사람과 함께하는 활동은 어떠세요?</p>
          <ChipGroup items={SOCIAL_PREFERENCES} mode="single" value={socialPreference} onChange={setSocialPreference} />
        </section>
        <section>
          <p className="mb-2 text-[13px] font-bold text-ink-muted">어떤 쪽이 더 마음이 가세요? (1~3개)</p>
          <ChipGroup
            items={INTERESTS}
            mode="multi"
            value={interests}
            maxSelected={MAX_INTERESTS}
            onChange={(next, meta) => {
              setInterests(next)
              if (meta?.limitReached) showToast('3개까지 고를 수 있어요')
            }}
          />
        </section>

        <section>
          <p className="mb-2 text-[13px] font-bold text-ink-muted">나에 대해 기억하고 있는 것</p>
          <p className="mb-2 text-[12px] text-ink-muted">대화에서 알게 된 내용이에요. 지우면 다음 미션부터 참고하지 않아요.</p>
          {memories === null ? null : memories.length === 0 ? (
            <p className="text-[13px] text-ink-faint">아직 기억하고 있는 게 없어요</p>
          ) : (
            <div className="space-y-2">
              {memories.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-alt px-4 py-3">
                  <span className="flex-1 text-[13px] text-ink">{m.content}</span>
                  <button type="button" onClick={() => handleDeleteMemory(m.id)} aria-label="삭제" className="shrink-0">
                    <Icon name="close" className="text-ink-faint" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="sticky bottom-4 pt-2">
          <PrimaryButton label="저장하기" onClick={handleSave} disabled={!dirty} loading={saving} />
        </div>
      </div>
    </div>
  )
}
