import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import MissionCard from '../../components/common/MissionCard'
import TextField from '../../components/common/TextField'
import PrimaryButton from '../../components/common/PrimaryButton'
import GhostButton from '../../components/common/GhostButton'
import SupportScreen from '../SupportScreen'
import { detectSafetySignal } from '../../data/safetyKeywords'
import { getTodayMissions, getReflection, upsertReflection, toggleMissionLike, todayISO } from '../../data/storage'

// S-52 · 하루 마무리 (명세 6.4, 6.5)
export default function DayWrapUpScreen({ onDone, onSkip }) {
  const [missions, setMissions] = useState(null)
  const [content, setContent] = useState('')
  const [existing, setExisting] = useState(null)
  const [showSupport, setShowSupport] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getTodayMissions(), getReflection(todayISO())]).then(([m, r]) => {
      setMissions(m.filter((x) => x.is_completed))
      setExisting(r)
      setContent(r?.content ?? '')
    })
  }, [])

  if (missions === null) return null

  const handleLike = async (mission) => {
    await toggleMissionLike(mission)
    setMissions((prev) => prev.map((m) => (m.id === mission.id ? { ...m, liked: !m.liked } : m)))
  }

  const doSave = async () => {
    setSaving(true)
    await upsertReflection(todayISO(), content)
    setSaving(false)
    onDone()
  }

  const handleSave = () => {
    if (detectSafetySignal(content)) {
      setShowSupport(true)
      return
    }
    doSave()
  }

  if (showSupport) {
    return (
      <SupportScreen
        onConfirm={() => {
          setShowSupport(false)
          doSave()
        }}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <AppBar title="" leading="close" onLeadingClick={onSkip} />
      <div className="flex flex-1 flex-col px-6 pb-6">
        <h1 className="text-[24px] font-bold leading-snug text-ink">오늘 하루, 어떠셨어요?</h1>

        {missions.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-bold text-ink-muted">오늘 마친 미션</p>
            <div className="space-y-2">
              {missions.map((m) => (
                <MissionCard key={m.id} mission={m} onOpen={() => {}} onToggle={() => {}} showLike onToggleLike={handleLike} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <TextField
            id="reflection"
            label="좋았던 점이나 어려웠던 점을 적어두면 다음 미션이 더 잘 맞아요. (선택)"
            multiline
            value={content}
            onChange={(v) => setContent(v.slice(0, 300))}
            maxLength={300}
            counter={`${content.length} / 300`}
          />
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <PrimaryButton label={existing ? '수정하기' : '오늘 기록 남기기'} onClick={handleSave} loading={saving} />
          <GhostButton label="다음에 할게요" onClick={onSkip} className="w-full" />
        </div>
      </div>
    </div>
  )
}
