// C-10 StatTile — 숫자 Numeric, 라벨 Micro ink-muted. onClick을 주면 눌러서 이동 가능
export default function StatTile({ label, value, unit, highlight = false, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="flex-1 rounded-2xl bg-surface-alt px-4 py-4 text-center"
    >
      <div className={`text-[28px] font-extrabold leading-tight ${highlight ? 'text-highlight' : 'text-ink'}`}>
        {value}
        {unit && <span className="ml-0.5 text-[15px] font-bold">{unit}</span>}
      </div>
      <div className="mt-1 text-[12px] font-medium text-ink-muted">{label}</div>
    </Tag>
  )
}
