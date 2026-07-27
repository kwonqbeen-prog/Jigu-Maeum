import { useEffect, useRef } from 'react'
import AppBar from '../components/common/AppBar'
import PrimaryButton from '../components/common/PrimaryButton'
import { SUPPORT_CHANNELS } from '../data/safetyKeywords'

// S-70 · 전문 지원 안내 (명세 8.2, 8.3)
// 흐름을 끊지 않는 짧은 안내 화면. 되묻거나 판단을 요구하지 않고, 경고색/아이콘 없이
// 차분하게 보여준 뒤 확인하면 원래 흐름으로 그대로 이어진다 (D12).
export default function SupportScreen({ readOnly = false, onConfirm, onBack }) {
  const headlineRef = useRef(null)

  useEffect(() => {
    headlineRef.current?.focus()
  }, [])

  return (
    <div className="flex min-h-svh flex-col bg-surface lg:mx-auto lg:max-w-[480px]" role="dialog" aria-modal="true">
      {readOnly && <AppBar title="도움 받을 곳" leading="back" onLeadingClick={onBack} />}
      <div className="flex flex-1 flex-col px-6 py-8">
        {!readOnly && (
          <h1 ref={headlineRef} tabIndex={-1} className="text-[20px] font-medium leading-snug text-ink outline-none">
            혹시 지금 많이 힘드셨다면, 이런 도움도 있어요.
          </h1>
        )}
        {!readOnly && <p className="mt-2 text-[13px] text-ink-muted">언제든 이야기 나눌 수 있는 곳들이에요.</p>}

        <div className="mt-6 space-y-2">
          {SUPPORT_CHANNELS.map((channel) => (
            <div key={channel.number} className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink">{channel.name} {channel.number}</p>
                <p className="text-[12px] text-ink-muted">{channel.note}</p>
              </div>
              <a
                href={`tel:${channel.number}`}
                className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-surface"
              >
                전화
              </a>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] leading-relaxed text-ink-muted">
          지구 마음은 전문적인 심리 상담·진단·치료를 대신하지 않아요.
        </p>

        {!readOnly && (
          <div className="mt-auto pt-8">
            <PrimaryButton label="확인했어요" onClick={onConfirm} />
          </div>
        )}
      </div>
    </div>
  )
}
