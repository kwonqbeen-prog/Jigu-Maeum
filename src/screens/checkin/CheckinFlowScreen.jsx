import { useEffect, useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StepProgress from '../../components/common/StepProgress'
import ChipGroup from '../../components/common/ChipGroup'
import PrimaryButton from '../../components/common/PrimaryButton'
import GhostButton from '../../components/common/GhostButton'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import TextField from '../../components/common/TextField'
import MissionCard from '../../components/common/MissionCard'
import Icon from '../../components/Icon'
import SupportScreen from '../SupportScreen'
import { EMOTION_TYPES, ENERGY_LEVELS, PLACES, MISSION_COUNT_BY_ENERGY } from '../../data/constants'
import { detectSafetySignal } from '../../data/safetyKeywords'
import {
  getTodayCheckin,
  upsertCheckinDraft,
  completeCheckin,
  discardCheckin,
  incrementCheckinRetry,
  insertMissions,
} from '../../data/storage'
import { generateMissionsForCheckin } from '../../hooks/useMissionGeneration'
import { pickFallbackMissions, defaultTypePlan } from '../../data/missionPool'
import earthStage5 from '../../assets/planet-mascot/stage-5.svg'
import { navigateWithTransition } from '../../lib/viewTransition'

const GENERATING_MESSAGES = ['오늘의 미션을 준비하는 중', '지금 상황에서 할 수 있는 걸 찾는 중', '거의 다 됐어요']
const MAX_RETRY = 2

export default function CheckinFlowScreen({ profile, onClose, onGoToMissions, onMissionsSaved }) {
  const [phase, setPhase] = useState('loading')
  const [checkin, setCheckin] = useState(null)
  const [step, setStep] = useState(1)
  const [freeText, setFreeText] = useState('')
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [genResult, setGenResult] = useState(null)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    getTodayCheckin().then((existing) => {
      navigateWithTransition(() => {
        if (existing?.status === 'completed') {
          setCheckin(existing)
          setPhase('resume-completed')
        } else if (existing?.status === 'draft') {
          setCheckin(existing)
          setStep(existing.step ?? 1)
          setFreeText(existing.free_text ?? '')
          setPhase('resume-draft')
        } else {
          setCheckin({ emotion_type: null, energy_level: null, context_place: null })
          setPhase('step')
          setStep(1)
        }
      })
    })
  }, [])

  useEffect(() => {
    if (phase !== 'generating') return undefined
    const timer = setInterval(() => setMsgIndex((i) => Math.min(i + 1, GENERATING_MESSAGES.length - 1)), 1200)
    return () => clearInterval(timer)
  }, [phase])

  const persistStep = async (partial, nextStep) => {
    const updated = await upsertCheckinDraft(checkin?.id, { ...checkin, ...partial }, nextStep)
    setCheckin(updated)
    return updated
  }

  const goNext = async (partial) => {
    if (step < 4) {
      await persistStep(partial, step + 1)
      navigateWithTransition(() => setStep((s) => s + 1))
    } else {
      submitCheckin(partial)
    }
  }

  const submitCheckin = async (partial) => {
    const merged = { ...checkin, ...partial }
    if (detectSafetySignal(merged.free_text)) {
      navigateWithTransition(() => {
        setCheckin(merged)
        setShowSupport(true)
      })
      return
    }
    await runCompletion(merged)
  }

  const runCompletion = async (merged) => {
    const completed = await completeCheckin(merged.id, merged.free_text ?? '')
    setCheckin(completed)
    await startGeneration(completed)
  }

  const startGeneration = async (completedCheckin) => {
    navigateWithTransition(() => {
      setPhase('generating')
      setMsgIndex(0)
    })
    try {
      const result = await generateMissionsForCheckin(completedCheckin, profile)
      navigateWithTransition(() => {
        setGenResult(result)
        setPhase('result')
      })
    } catch {
      navigateWithTransition(() => setPhase('gen-error'))
    }
  }

  const handleRetryGenerate = async () => {
    if ((checkin.retry_count ?? 0) >= MAX_RETRY) return
    const updated = await incrementCheckinRetry(checkin.id)
    setCheckin(updated)
    await startGeneration(updated)
  }

  const handleSaveMissions = async () => {
    const rows = await insertMissions(genResult.missions, { checkinId: checkin.id, source: 'checkin' })
    onMissionsSaved(rows)
  }

  const handleDiscardDraft = async () => {
    if (checkin?.id) await discardCheckin(checkin.id)
    navigateWithTransition(() => {
      setCheckin({ emotion_type: null, energy_level: null, context_place: null })
      setStep(1)
      setFreeText('')
      setPhase('step')
    })
  }

  const handleResumeDraft = () => {
    navigateWithTransition(() => {
      setStep(checkin.step ?? 1)
      setFreeText(checkin.free_text ?? '')
      setPhase('step')
    })
  }

  if (phase === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface">
        <Icon name="progress_activity" className="animate-spin text-2xl text-ink-faint" />
      </div>
    )
  }

  if (phase === 'resume-completed') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
        <div className="w-full max-w-xs rounded-2xl bg-surface-alt p-5">
          <h2 className="text-[16px] font-medium text-ink">오늘은 이미 미션을 받으셨어요</h2>
          <div className="mt-5 space-y-2">
            <PrimaryButton label="오늘 미션 보기" onClick={onGoToMissions} />
            <GhostButton label="미션 다시 만들기" onClick={handleDiscardDraft} className="w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'resume-draft') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
        <div className="w-full max-w-xs rounded-2xl bg-surface-alt p-5">
          <h2 className="text-[16px] font-medium text-ink">오늘 쓰다 만 기록이 있어요</h2>
          <p className="mt-2 text-[13px] text-ink-muted">{checkin.step ?? 1}단계까지 골라두셨어요. 이어서 할까요?</p>
          <div className="mt-5 space-y-2">
            <PrimaryButton label="이어서 하기" onClick={handleResumeDraft} />
            <GhostButton label="새로 시작하기" onClick={handleDiscardDraft} className="w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (showSupport) {
    return (
      <SupportScreen
        onConfirm={() => {
          navigateWithTransition(() => setShowSupport(false))
          runCompletion(checkin)
        }}
      />
    )
  }

  if (phase === 'generating') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-surface px-6 text-center lg:mx-auto lg:max-w-[480px]">
        <img src={earthStage5} alt="" aria-hidden="true" className="h-16 w-16" />
        <p className="text-[15px] font-medium text-ink-muted">{GENERATING_MESSAGES[msgIndex]}</p>
      </div>
    )
  }

  if (phase === 'gen-error') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-surface px-6 text-center lg:mx-auto lg:max-w-[480px]">
        <p className="text-[15px] font-medium text-ink">지금 미션을 만들지 못했어요</p>
        <div className="w-full max-w-xs space-y-2">
          <PrimaryButton label="다시 시도" onClick={() => startGeneration(checkin)} />
          <GhostButton
            label="기본 미션 받기"
            className="w-full"
            onClick={() => {
              const count = MISSION_COUNT_BY_ENERGY[checkin.energy_level] ?? 3
              navigateWithTransition(() => {
                setGenResult({
                  missions: pickFallbackMissions(defaultTypePlan(count)).map((m) => ({ ...m, source: 'checkin' })),
                  bundleMessage: '지금 상황에서 바로 해볼 수 있는 미션으로 준비했어요.',
                })
                setPhase('result')
              })
            }}
          />
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const retryLeft = MAX_RETRY - (checkin.retry_count ?? 0)
    return (
      <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
        <div className="flex w-full flex-1 flex-col px-6 py-6 lg:mx-auto lg:max-w-[480px] lg:flex-none lg:py-12">
          <AppBar title="" leading="close" onLeadingClick={() => setShowConfirmClose(true)} transparent />
          <h1 className="mt-2 text-[20px] font-medium leading-snug text-ink">
            {profile?.displayName ? `${profile.displayName}님, ` : ''}오늘은 이렇게 해보면 어떨까요?
          </h1>
          <div className="mt-4 space-y-2">
            {genResult.missions.map((m, i) => (
              <MissionCard key={i} mission={m} onOpen={() => {}} trailing={false} />
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-surface-alt p-4">
            <p className="text-[13px] font-medium text-ink-muted">왜 이 미션인가요</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{genResult.bundleMessage}</p>
          </div>
          <div className="mt-6 space-y-2">
            <PrimaryButton label="미션함에 담기" onClick={handleSaveMissions} />
            {retryLeft > 0 ? (
              <GhostButton label="마음에 안 들면 다시 받기" onClick={handleRetryGenerate} className="w-full" />
            ) : (
              <p className="text-center text-[12px] text-ink-faint">오늘은 여기까지 받을 수 있어요</p>
            )}
          </div>
          {showConfirmClose && (
            <ConfirmDialog
              title="받은 미션을 저장하지 않고 나갈까요?"
              confirmLabel="나가기"
              onConfirm={onClose}
              onCancel={() => setShowConfirmClose(false)}
            />
          )}
        </div>
      </div>
    )
  }

  // step 1~4
  const stepConfig = {
    1: {
      headline: '지금 기후 위기를 떠올리면 어떤 마음이 드나요?',
      sub: '가장 가까운 하나만 골라주세요.',
      body: (
        <ChipGroup items={EMOTION_TYPES} mode="single" value={checkin.emotion_type} onChange={(v) => setCheckin((c) => ({ ...c, emotion_type: v }))} />
      ),
      valid: Boolean(checkin.emotion_type),
      onNext: () => goNext({ emotion_type: checkin.emotion_type }),
    },
    2: {
      headline: '오늘의 도전 에너지는 얼마나 있나요?',
      sub: '미션 난이도를 맞추는 데만 써요.',
      body: (
        <ChipGroup items={ENERGY_LEVELS} mode="single" value={checkin.energy_level} onChange={(v) => setCheckin((c) => ({ ...c, energy_level: v }))} />
      ),
      valid: Boolean(checkin.energy_level),
      onNext: () => goNext({ energy_level: checkin.energy_level }),
    },
    3: {
      headline: '오늘 미션은 어떤 장소에서 해볼까요?',
      sub: '선택한 장소에 딱 맞는 활동을 추천해 드릴게요.',
      body: (
        <ChipGroup items={PLACES} mode="single" value={checkin.context_place} onChange={(v) => setCheckin((c) => ({ ...c, context_place: v }))} />
      ),
      valid: Boolean(checkin.context_place),
      onNext: () => goNext({ context_place: checkin.context_place }),
    },
    4: {
      headline: '저에게 더 알려주고 싶은 것이 있나요?',
      sub: '안 쓰고 넘어가셔도 괜찮아요. (선택)',
      body: (
        <TextField
          id="free-text"
          multiline
          value={freeText}
          onChange={(v) => setFreeText(v.slice(0, 200))}
          maxLength={200}
          placeholder={'오늘 있었던 일, 기후 위기에 대해 들었던 생각 등을 자유롭게 말씀해 주세요.\n예: 오늘 저녁에 약속이 있어요 / 뉴스 보고 마음이 안 좋았어요'}
          counter={`${freeText.length} / 200`}
        />
      ),
      valid: true,
      nextLabel: '미션 받기',
      onNext: () => goNext({ free_text: freeText }),
    },
  }[step]

  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
      <div className="flex w-full flex-1 flex-col px-6 py-6 lg:mx-auto lg:max-w-[480px] lg:flex-none lg:py-12">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="닫기" onClick={() => setShowConfirmClose(true)} className="flex h-11 w-11 items-center justify-center -ml-2">
            <Icon name="close" />
          </button>
          <div className="flex-1 pl-2">
            <StepProgress current={step} total={4} />
          </div>
        </div>
        <h1 className="mt-6 text-[24px] font-medium leading-snug text-ink">{stepConfig.headline}</h1>
        <p className="mt-2 text-[13px] text-ink-muted">{stepConfig.sub}</p>
        <div className="mt-6 flex-1 overflow-y-auto lg:flex-none">{stepConfig.body}</div>
        <div className="flex items-center justify-between pt-6">
          {step > 1 ? (
            <GhostButton label="이전" onClick={() => navigateWithTransition(() => setStep((s) => s - 1))} />
          ) : (
            <span />
          )}
          <div className="w-40">
            <PrimaryButton label={stepConfig.nextLabel ?? '다음'} onClick={stepConfig.onNext} disabled={!stepConfig.valid} />
          </div>
        </div>
        {showConfirmClose && (
          <ConfirmDialog
            title="여기까지 저장하고 나갈까요?"
            body="다음에 이어서 할 수 있어요."
            confirmLabel="나가기"
            cancelLabel="계속하기"
            onConfirm={onClose}
            onCancel={() => setShowConfirmClose(false)}
          />
        )}
      </div>
    </div>
  )
}
