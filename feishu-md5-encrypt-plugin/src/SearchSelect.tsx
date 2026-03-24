import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function SearchSelect({ options, value, onChange, placeholder = '请选择字段...', disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)
  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 打开时聚焦搜索框
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSelect = (opt: Option) => {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* 触发器 */}
      <div
        style={{
          ...css.trigger,
          ...(open ? css.triggerOpen : {}),
          ...(disabled ? css.triggerDisabled : {}),
        }}
        onClick={() => {
          if (!disabled) setOpen(o => !o)
        }}
      >
        {open ? (
          <input
            ref={inputRef}
            style={css.searchInput}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索字段..."
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span style={selected ? css.selectedText : css.placeholder}>
            {selected ? selected.label : placeholder}
          </span>
        )}
        <div style={css.suffix}>
          {value && !open && (
            <span style={css.clearBtn} onClick={handleClear} title="清除">×</span>
          )}
          <span style={{ ...css.arrow, ...(open ? css.arrowUp : {}) }}>▾</span>
        </div>
      </div>

      {/* 下拉列表 */}
      {open && (
        <div style={css.dropdown}>
          {filtered.length === 0 ? (
            <div style={css.empty}>无匹配字段</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.value}
                style={{
                  ...css.option,
                  ...(opt.value === value ? css.optionActive : {}),
                }}
                onMouseDown={() => handleSelect(opt)}
                title={opt.label}
              >
                {opt.value === value && <span style={css.check}>✓</span>}
                <span style={css.optionText}>{opt.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const css: Record<string, React.CSSProperties> = {
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    padding: '0 10px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    background: '#fafafa',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'border-color 0.15s',
  },
  triggerOpen: {
    borderColor: '#1677FF',
    background: '#fff',
    boxShadow: '0 0 0 2px rgba(22,119,255,0.12)',
  },
  triggerDisabled: {
    background: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 13,
    color: '#1a1a1a',
    minWidth: 0,
  },
  selectedText: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  placeholder: {
    flex: 1,
    fontSize: 13,
    color: '#bbb',
  },
  suffix: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    marginLeft: 4,
  },
  clearBtn: {
    fontSize: 15,
    color: '#bbb',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 2px',
  },
  arrow: {
    fontSize: 12,
    color: '#999',
    transition: 'transform 0.15s',
    display: 'inline-block',
  },
  arrowUp: {
    transform: 'rotate(180deg)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    zIndex: 999,
    maxHeight: 220,
    overflowY: 'auto',
    padding: '4px 0',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    fontSize: 13,
    color: '#1a1a1a',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  optionActive: {
    background: '#f0f6ff',
    color: '#1677FF',
    fontWeight: 600,
  },
  check: {
    fontSize: 11,
    color: '#1677FF',
    flexShrink: 0,
    width: 14,
  },
  optionText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  empty: {
    padding: '10px 12px',
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
  },
}
