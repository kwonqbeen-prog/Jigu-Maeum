import Icon from '../Icon'

const NAV_ITEMS = [
  { key: 'planet', label: '마음 지구', icon: 'orbit' },
  { key: 'missions', label: '미션', icon: 'rocket' },
  { key: 'records', label: '마음 기록', icon: 'calendar_today' },
]

// 데스크탑(lg 1024px+) 전용 사이드바 — BottomTabBar와 같은 탭 상태를 공유하는 데스크탑 내비게이션.
// 모바일에서는 렌더링하지 않는다(hidden lg:flex)
export default function Sidebar({ active, badges = {}, onChange, onOpenSettings }) {
  return (
    <nav className="hidden shrink-0 border-r border-line bg-surface-alt lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-60 lg:flex-col lg:gap-1 lg:px-3 lg:py-6">
      <div className="mb-6 flex items-center gap-2 px-3">
        <span className="mind-planet__orb h-8 w-8 rounded-full" data-planet-stage="1" aria-hidden="true" />
        <span className="text-[15px] font-medium text-ink">지구 마음</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = active === item.key
        const badge = badges[item.key]
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-current={isActive ? 'page' : undefined}
            data-tour={`sidebar-${item.key}`}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
              isActive ? 'bg-surface text-ink' : 'text-ink-faint'
            }`}
          >
            <span className="relative flex">
              <Icon name={item.icon} filled={isActive} className={isActive ? 'text-ink' : 'text-ink-faint'} />
              {badge ? (
                <span
                  className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-surface"
                  aria-hidden="true"
                >
                  {badge === true ? '' : badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </button>
        )
      })}

      <button
        type="button"
        onClick={onOpenSettings}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-ink-faint"
      >
        <Icon name="settings" />
        설정
      </button>
    </nav>
  )
}
