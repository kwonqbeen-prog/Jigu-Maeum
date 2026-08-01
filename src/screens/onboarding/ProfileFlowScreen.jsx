import { useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StepProgress from '../../components/common/StepProgress'
import ChipGroup from '../../components/common/ChipGroup'
import PrimaryButton from '../../components/common/PrimaryButton'
import { COPING_STYLES, SOCIAL_PREFERENCES, INTERESTS } from '../../data/constants'
import { navigateWithTransition } from '../../lib/viewTransition'

const STEP_REACTIONS = ['좋은 방법이네요.', '알려줘서 고마워요.', '멋져요. 거의 다 왔어요!']

// S-12a/b/c · 온보딩 3 · 사용자 프로필 (명세 2.3)
export default function ProfileFlowScreen({ onNext, onBack }) {
  const [internalStep, setInternalStep] = useState(0) // 0=coping 1=social 2=interests
  const [copingStyle, setCopingStyle] = useState(null)
  const [socialPreference, setSocialPreference] = useState(null)
  const [interests, setInterests] = useState([])
  const [reaction, setReaction] = useState(null)
  const [advancing, setAdvancing] = useState(false)

  const steps = [
    {
      headline: '마음이 무거울 때, 보통 어떻게 하세요?',
      body: <ChipGroup items={COPING_STYLES} mode="single" value={copingStyle} onChange={setCopingStyle} />,
      valid: Boolean(copingStyle),
    },
    {
      headline: '다른 사람과 함께하는 것과 혼자만의 시간, 어느 쪽이 더 편하세요?',
      body: <ChipGroup items={SOCIAL_PREFERENCES} mode="single" value={socialPreference} onChange={setSocialPreference} />,
      valid: Boolean(socialPreference),
    },
    {
      headline: '어떤 기후 문제에 관심이 있나요?',
      sub: '원하는 만큼 골라주세요.',
      body: <ChipGroup items={INTERESTS} mode="multi" value={interests} onChange={setInterests} />,
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
    navigateWithTransition(() => setInternalStep((s) => s - 1))
  }

  const handleNext = () => {
    setAdvancing(true)
    setReaction(STEP_REACTIONS[internalStep])
    setTimeout(() => {
      if (internalStep < steps.length - 1) {
        navigateWithTransition(() => {
          setReaction(null)
          setAdvancing(false)
          setInternalStep((s) => s + 1)
        })
        return
      }
      setReaction(null)
      setAdvancing(false)
      onNext({ coping_style: copingStyle, social_preference: socialPreference, interests })
    }, 1200)
  }

  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
      <div className="flex w-full flex-1 flex-col lg:mx-auto lg:max-w-[560px] lg:flex-none lg:py-2">
        <AppBar title="" leading="back" onLeadingClick={handleBack} transparent />
        <div className="flex flex-1 flex-col px-6 pb-6 lg:flex-none lg:px-10 lg:pb-10">
          <StepProgress current={3 + internalStep} total={5} />
          <h1 className="mt-6 text-[24px] font-medium leading-snug text-ink lg:text-[28px]">{step.headline}</h1>
          {step.sub && <p className="mt-2 text-[13px] text-ink-muted lg:text-[14px]">{step.sub}</p>}
          <p className={`text-[13px] text-ink-muted lg:text-[14px] ${step.sub ? 'mt-1' : 'mt-2'}`}>
            이 내용은 설정-나의 프로필에서 언제든지 바꿀 수 있어요.
          </p>
          <div className="mt-6 flex-1 overflow-y-auto">{step.body}</div>
          <div className="pt-6">
            <PrimaryButton label={step.nextLabel ?? '다음'} onClick={handleNext} loading={advancing} disabled={!step.valid || advancing} />
          </div>
        </div>
      </div>

      {reaction && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="animate-pop-in rounded-2xl bg-ink px-6 py-4 text-center shadow-lg">
            <p className="text-[16px] font-medium text-surface">{reaction}</p>
          </div>
        </div>
      )}
    </div>
  )
}
