import ChoiceChip from './ChoiceChip'

// C-05 ChipGroup — 힌트 있으면 1열, 없으면 2열 그리드
export default function ChipGroup({ items, mode = 'single', value, onChange, maxSelected, layout = 'auto' }) {
  const hasHint = items.some((item) => item.hint)
  const isList = layout === 'list' || (layout === 'auto' && hasHint)
  const selectedList = mode === 'multi' ? value ?? [] : null

  const isSelected = (itemValue) => (mode === 'multi' ? selectedList.includes(itemValue) : value === itemValue)

  const handleClick = (itemValue) => {
    if (mode === 'single') {
      onChange(itemValue)
      return
    }
    const has = selectedList.includes(itemValue)
    if (has) {
      onChange(selectedList.filter((v) => v !== itemValue))
      return
    }
    if (maxSelected && selectedList.length >= maxSelected) {
      onChange(selectedList, { limitReached: true })
      return
    }
    onChange([...selectedList, itemValue])
  }

  return (
    <div
      role={mode === 'single' ? 'radiogroup' : 'group'}
      className={isList ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}
    >
      {items.map((item) => (
        <ChoiceChip
          key={item.value}
          role={mode === 'single' ? 'radio' : 'checkbox'}
          label={item.label}
          hint={item.hint}
          selected={isSelected(item.value)}
          onClick={() => handleClick(item.value)}
        />
      ))}
    </div>
  )
}
