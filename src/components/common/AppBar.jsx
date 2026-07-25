import { useEffect, useState } from 'react'
import Icon from '../Icon'

// C-01 AppBar — 높이 56, 스크롤 시 하단 1px 구분선 표시
export default function AppBar({ title, leading = 'none', onLeadingClick, actions = [] }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-20 flex h-14 items-center justify-between bg-surface px-4 transition-shadow ${
        scrolled ? 'shadow-[0_1px_0_var(--color-line)]' : ''
      }`}
    >
      <div className="flex w-11 items-center">
        {leading === 'back' && (
          <button
            type="button"
            onClick={onLeadingClick}
            aria-label="뒤로"
            className="flex h-11 w-11 items-center justify-center -ml-2"
          >
            <Icon name="arrow_back" />
          </button>
        )}
        {leading === 'close' && (
          <button
            type="button"
            onClick={onLeadingClick}
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center -ml-2"
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      <h1 className="flex-1 truncate text-center text-[15px] font-bold text-ink">{title}</h1>
      <div className="flex w-11 items-center justify-end gap-1">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            aria-label={action.label}
            className="flex h-11 w-11 items-center justify-center -mr-2"
          >
            <Icon name={action.icon} />
          </button>
        ))}
      </div>
    </header>
  )
}
