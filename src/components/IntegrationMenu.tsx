import { useEffect, useRef, useState } from 'react'
import { INTEGRATIONS } from '../data/integrations'
import type { Integration } from '../types'

interface Props {
  query: string
  position: { x: number; y: number }
  onSelect: (integration: Integration) => void
  onClose: () => void
}

export default function IntegrationMenu({ query, position, onSelect, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = INTEGRATIONS.filter(
    i =>
      query === '' ||
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[activeIndex]) onSelect(filtered[activeIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [filtered, activeIndex, onSelect, onClose])

  const groups = filtered.reduce<Record<string, Integration[]>>((acc, i) => {
    if (!acc[i.category]) acc[i.category] = []
    acc[i.category].push(i)
    return acc
  }, {})

  return (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x, position: 'fixed' }}
      className="z-[9999] w-64 rounded-xl border border-[#E2E7FF] bg-white shadow-2xl shadow-[#304FFE]/15 overflow-hidden"
      onMouseDown={e => e.preventDefault()}
    >
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Integración / MCP
        </p>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-sm text-slate-400">Sin resultados para "{query}"</p>
        )}
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat}>
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
              {cat}
            </p>
            {items.map(item => {
              const globalIdx = filtered.indexOf(item)
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(globalIdx)}
                  onClick={() => onSelect(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    globalIdx === activeIndex ? 'bg-[#F0F2FF]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.category}</p>
                  </div>
                  {globalIdx === activeIndex && (
                    <span className="ml-auto text-[10px] text-slate-300 font-mono">↵</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
