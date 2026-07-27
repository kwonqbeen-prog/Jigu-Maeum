import { useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StepProgress from '../../components/common/StepProgress'
import ChipGroup from '../../components/common/ChipGroup'
import PrimaryButton from '../../components/common/PrimaryButton'
import { useToast } from '../../contexts/ToastContext'
import { COPING_STYLES, SOCIAL_PREFERENCES, INTERESTS, MAX_INTERESTS } from '../../data/constants'

// S-12a/b/c · 온보딩 3 · 사용자 프로필 (명세 2.3)
export default function ProfileFlowScreen({ onNext, onBack }) {
  const [internalStep, setInternalStep] = useState(0) // 0=coping 1=social 2=interests
  const [copingStyle, setCopingStyle] = useState(null)
  const [socialPreference, setSocialPreference] = useState(null)
  const [interests, setInterests] = useState([])
  const showToast = useToast()

  const steps = [
    {
      headline: '마음이 무거울 때, 보통 어떻게 하세요?',
      body: <ChipGroup items={COPING_STYLES} mode="single" value={copingStyle} onChange={setCopingStyle} />,
      valid: Boolean(copingStyle),
    },
    {
      headline: '다른 사람과 함께하는 활동은 어떠세요?',
      body: (
        <>
          <ChipGroup items={SOCIAL_PREFERENCES} mode="single" value={socialPreference} onChange={setSocialPreference} />
          {socialPreference === 'avoid' && (
            <p className="mt-3 text-[13px] text-ink-muted">부담스러운 건 아주 가벼운 것부터 드릴게요.</p>
          )}
        </>
      ),
      valid: Boolean(socialPreference),
    },
    {
      headline: '어떤 쪽이 더 마음이 가세요?',
      sub: '1~3개 골라주세요',
      body: (
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
      ),
      valid: interests.length >= 1,
      nextLabel: '다 골랐어요',
    },
  ]

  const step = steps[internalStep]

  const handleBack = () => {
    if (internalStep === 0) {
      onBack()
      return
    }
    setInternalStep((s) => s - 1)
  }

  const handleNext = () => {
    if (internalStep < steps.length - 1) {
      setInternalStep((s) => s + 1)
      return
    }
    onNext({ coping_style: copingStyle, social_preference: socialPreference, interests })
  }

  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="" leading="back" onLeadingClick={handleBack} />
      <div className="flex flex-1 flex-col px-6 pb-6">
        <StepProgress current={3} total={4} />
        <h1 className="mt-6 text-[24px] font-bold leading-snug text-ink">{step.headline}</h1>
        {step.sub && <p className="mt-2 text-[13px] text-ink-muted">{step.sub}</p>}
        <div className="mt-6 flex-1 overflow-y-auto">{step.body}</div>
        <div className="pt-6">
          <PrimaryButton label={step.nextLabel ?? '다음'} onClick={handleNext} disabled={!step.valid} />
        </div>
      </div>
    </div>
  )
}
