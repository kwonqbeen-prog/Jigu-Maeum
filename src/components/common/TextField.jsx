// C-17 TextField — 라벨 상시 노출(플레이스홀더로 대체 금지)
export default function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  counter,
  multiline = false,
  maxLength,
  type = 'text',
  autoComplete,
  inputMode,
  rightSlot,
  fieldClassName = 'bg-surface-alt',
  labelHidden = false,
}) {
  const Component = multiline ? 'textarea' : 'input'
  return (
    <div>
      {label && (
        <label htmlFor={id} className={labelHidden ? 'sr-only' : 'mb-1.5 block text-[13px] font-medium text-ink-muted'}>
          {label}
        </label>
      )}
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${fieldClassName}`}>
        <Component
          id={id}
          type={multiline ? undefined : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          rows={multiline ? 3 : undefined}
          className="w-full flex-1 resize-none bg-transparent text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
        {rightSlot}
      </div>
      <div className="mt-1 flex items-center justify-between">
        {error ? (
          <p className="text-[12px] font-medium text-danger" aria-live="polite">
            {error}
          </p>
        ) : (
          <span />
        )}
        {counter && (
          <p className="text-[12px] text-ink-faint" aria-live="polite">
            {counter}
          </p>
        )}
      </div>
    </div>
  )
}
