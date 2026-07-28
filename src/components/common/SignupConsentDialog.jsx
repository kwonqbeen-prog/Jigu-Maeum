import { useState } from 'react'
import Icon from '../Icon'

const NOTICE_ITEMS = [
  '지구마음은 감정 상태, 대화 내용을 저장해 서비스를 제공해요.',
  '수집한 정보는 서비스 제공 목적으로만 사용하고, 제3자에게 제공하지 않아요.',
  '언제든 설정에서 데이터 삭제를 요청할 수 있어요.',
]

// 가입 전 데이터 수집·이용에 대한 명시적 동의를 받는 다이얼로그
export default function SignupConsentDialog({ onAgree, onCancel }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button type="button" aria-label="닫기" onClick={onCancel} className="absolute inset-0 bg-black/40" />
      <div role="alertdialog" aria-modal="true" aria-label="데이터 수집 안내" className="relative w-full max-w-xs rounded-2xl bg-surface-alt p-5">
        <h2 className="text-[16px] font-medium text-ink">시작하기 전에 알려드려요</h2>
        <ul className="mt-3 space-y-2 text-left">
          {NOTICE_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2 break-keep text-left text-[13px] leading-relaxed text-ink-muted">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          role="checkbox"
          aria-checked={agreed}
          onClick={() => setAgreed((v) => !v)}
          className="mt-4 flex w-full items-center justify-center gap-2 py-2"
        >
          <span
            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${
              agreed ? 'border-ink bg-ink' : 'border-ink bg-transparent'
            }`}
            aria-hidden="true"
          >
            {agreed && <Icon name="check" className="text-[13px] text-surface" />}
          </span>
          <span className="text-[14px] font-medium text-ink">네, 동의할게요</span>
        </button>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-full bg-surface-sunken text-[14px] font-medium text-ink"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!agreed}
            onClick={onAgree}
            className="h-11 flex-1 rounded-full bg-ink text-[14px] font-medium text-surface disabled:opacity-40"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
