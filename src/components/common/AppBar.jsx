import { useEffect, useState } from 'react'
import Icon from '../Icon'

// C-01 AppBar — 높이 56, 스크롤 시 하단 1px 구분선 표시
// variant="large": 마음지구/미션/마음기록 3개 탭 루트 화면 전용(뒤로가기 없는 화면).
// 타이틀 21px·상단 패딩 34px·액션 아이콘 24px로 확대. 디테일 화면(leading=back/close)은
// 기본값(15px, h-14)을 그대로 쓴다
export default function AppBar({ title, leading = 'none', onLeadingClick, actions = [], variant = 'default' }) {
  const [scrolled, setScrolled] = useState(false)
  const isLarge = variant === 'large'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between bg-surface px-4 transition-shadow ${
        isLarge ? 'pb-3 pt-[34px]' : 'h-14'
      } ${scrolled ? 'shadow-[0_1px_0_var(--color-line)]' : ''}`}
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
      <h1 className={`flex-1 truncate text-center font-bold text-ink ${isLarge ? 'text-[21px]' : 'text-[15px]'}`}>
        {title}
      </h1>
      <div className="flex w-11 items-center justify-end gap-1">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            aria-label={action.label}
            className="flex h-11 w-11 items-center justify-center -mr-2"
          >
            <Icon name={action.icon} className={isLarge ? 'text-[24px]' : undefined} />
          </button>
        ))}
      </div>
    </header>
  )
}
