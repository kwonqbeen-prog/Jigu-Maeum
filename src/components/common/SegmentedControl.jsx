// C-18 SegmentedControl — 2~3개 필터 전환
export default function SegmentedControl({ items, value, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 rounded-full bg-surface-sunken p-1">
      {items.map((item) => {
        const isActive = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={`h-9 flex-1 rounded-full text-[13px] font-medium transition ${
              isActive ? 'bg-ink text-surface' : 'text-ink-muted'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
