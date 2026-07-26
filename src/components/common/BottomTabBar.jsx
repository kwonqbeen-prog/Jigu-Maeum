import Icon from '../Icon'

const TABS = [
  { key: 'planet', label: '마음 지구', icon: 'public' },
  { key: 'missions', label: '미션', icon: 'check_circle' },
  { key: 'records', label: '마음 기록', icon: 'calendar_month' },
]

// C-02 BottomTabBar — 높이 56 + safe-area
export default function BottomTabBar({ active, badges = {}, onChange }) {
  return (
    <nav
      className="sticky bottom-0 z-20 flex border-t border-transparent bg-surface-alt pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: '0 -1px 0 var(--color-line)' }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key
        const badge = badges[tab.key]
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5"
          >
            <span className="relative">
              <Icon name={tab.icon} filled={isActive} className={isActive ? 'text-ink' : 'text-ink-faint'} />
              {badge ? (
                <span
                  className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
                  aria-hidden="true"
                >
                  {badge === true ? '' : badge}
                </span>
              ) : null}
            </span>
            <span className={`text-[11px] font-medium ${isActive ? 'text-ink' : 'text-ink-faint'}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
