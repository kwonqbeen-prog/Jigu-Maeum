import AppBar from '../../components/common/AppBar'
import ThemePreviewThumb from '../../components/ThemePreviewThumb'
import PrimaryButton from '../../components/common/PrimaryButton'
import { useTheme, THEME_OPTIONS, COLORBLIND_OPTIONS, FONT_SCALE_STEPS } from '../../contexts/ThemeContext'

const THEME_LABELS = { light: '라이트', dark: '다크', system: '시스템', 'high-contrast': '고대비' }
const COLORBLIND_LABELS = {
  none: '없음',
  protanopia: '적록 1형 (protanopia)',
  deuteranopia: '적록 2형 (deuteranopia)',
  tritanopia: '청황형 (tritanopia)',
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-alt p-3">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[12px] text-ink-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-ink' : 'bg-surface-sunken'}`}
      >
        <span
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-alt shadow-sm transition-all ${
            checked ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

// S-61 · 화면 및 접근성 (명세 7.1)
export default function DisplayAccessibilityScreen({ onBack }) {
  const { settings, saveState, setTheme, setColorblind, setFontScale, setReduceMotion, setBoldText, saveNow } = useTheme()
  const stepIndex = FONT_SCALE_STEPS.reduce(
    (closest, v, i) => (Math.abs(v - settings.fontScale) < Math.abs(FONT_SCALE_STEPS[closest] - settings.fontScale) ? i : closest),
    0,
  )

  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]">
      <AppBar title="화면 및 접근성" leading="back" onLeadingClick={onBack} />
      <div className="flex-1 space-y-6 px-4 py-4">
        <div className="rounded-2xl bg-surface-alt p-4">
          <p className="text-[15px] font-bold text-ink">미리보기</p>
          <p className="mt-1 text-[13px] text-ink-muted">본문 텍스트가 이렇게 보여요.</p>
          <button type="button" className="cta-neutral mt-2 rounded-full px-4 py-2 text-[13px] font-bold">
            버튼 샘플
          </button>
        </div>

        <section>
          <p className="mb-2 text-[13px] font-bold text-ink-muted">화면 모드</p>
          <div role="radiogroup" aria-label="화면 모드" className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((value) => {
              const checked = settings.theme === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-2 rounded-xl p-2.5 ${checked ? 'bg-accent-soft border-[1.5px] border-accent' : 'bg-surface-alt border-[1.5px] border-transparent'}`}
                >
                  <ThemePreviewThumb variant={value} />
                  <span className="text-[13px] font-semibold text-ink">{THEME_LABELS[value]}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-[13px] font-bold text-ink-muted">보정</p>
          <div className="rounded-xl bg-surface-alt p-3">
            <label htmlFor="colorblind" className="block text-[14px] font-semibold text-ink">
              색약 보정
            </label>
            <select
              id="colorblind"
              value={settings.colorblind}
              onChange={(e) => setColorblind(e.target.value)}
              className="mt-2 w-full rounded-lg bg-surface-sunken px-3 py-2 text-[14px] text-ink outline-none"
            >
              {COLORBLIND_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {COLORBLIND_LABELS[v]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-surface-alt p-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink">글자 크기</span>
              <span className="text-[13px] font-semibold text-ink-muted">{Math.round(FONT_SCALE_STEPS[stepIndex] * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={FONT_SCALE_STEPS.length - 1}
              step={1}
              value={stepIndex}
              onChange={(e) => setFontScale(FONT_SCALE_STEPS[Number(e.target.value)])}
              className="mt-2 w-full accent-[color:var(--color-accent)]"
              aria-valuetext={`${Math.round(FONT_SCALE_STEPS[stepIndex] * 100)}%`}
            />
          </div>

          <ToggleRow label="움직임 줄이기" checked={settings.reduceMotion} onChange={setReduceMotion} />
          <ToggleRow label="굵은 텍스트" checked={settings.boldText} onChange={setBoldText} />
        </section>

        <PrimaryButton
          label={saveState === 'saving' ? '저장 중...' : '저장됨'}
          onClick={saveNow}
          disabled={saveState === 'saving'}
        />
      </div>
    </div>
  )
}
