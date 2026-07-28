import { useState } from 'react'
import AppBar from '../../components/common/AppBar'
import StepProgress from '../../components/common/StepProgress'
import PrimaryButton from '../../components/common/PrimaryButton'
import ThemePreviewThumb from '../../components/ThemePreviewThumb'
import { useTheme } from '../../contexts/ThemeContext'

const CHOICES = [
  { value: 'light', label: '라이트', note: null },
  { value: 'dark', label: '다크', note: null },
  { value: 'system', label: '시스템', note: '기기 설정을 따라요' },
  { value: 'high-contrast', label: '고대비', note: '글자와 배경 대비를 최대로 높여요' },
]

// S-10 · 온보딩 1 · 화면 모드 (명세 2.1)
// AppBar+본문 구조를 NicknameScreen/ProfileFlowScreen과 동일하게 맞춤(뒤로가기·헤더 높이 통일)
export default function ThemeModeScreen({ onNext, onBack }) {
  const { settings, setTheme } = useTheme()
  const [selected, setSelected] = useState(settings.theme)

  const select = (value) => {
    setSelected(value)
    setTheme(value)
  }

  return (
    <div className="pastel-wash flex min-h-svh flex-col bg-surface lg:justify-center">
      <div className="flex w-full flex-1 flex-col lg:mx-auto lg:max-w-[480px] lg:flex-none">
        <AppBar title="" leading="back" onLeadingClick={onBack} transparent />
        <div className="flex flex-1 flex-col px-6 pb-6 lg:flex-none">
          <StepProgress current={1} total={5} />
          <h1 className="mt-6 text-[24px] font-medium leading-snug text-ink">원하시는 화면 모드를 선택해 주세요.</h1>
          <p className="mt-2 text-[13px] text-ink-muted">화면 모드는 설정-화면 및 접근성에서 언제든지 바꿀 수 있어요.</p>

          <div role="radiogroup" aria-label="화면 모드" className="mt-6 grid grid-cols-2 gap-3">
            {CHOICES.map((choice) => {
              const checked = selected === choice.value
              return (
                <button
                  key={choice.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => select(choice.value)}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-3 transition ${
                    checked ? 'bg-accent-soft border-[1.5px] border-accent' : 'bg-surface-alt border-[1.5px] border-transparent'
                  }`}
                >
                  <ThemePreviewThumb variant={choice.value} />
                  <span className="text-[13px] font-medium text-ink">{choice.label}</span>
                  {choice.note && <span className="text-center text-[11px] leading-tight text-ink-muted">{choice.note}</span>}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-8">
            <PrimaryButton label="다음" onClick={onNext} />
          </div>
        </div>
      </div>
    </div>
  )
}
