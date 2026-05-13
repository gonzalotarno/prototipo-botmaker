// ── Material Symbols Icon component ──────────────────────────────────────────
// Uses inline SVGs from Google Fonts CDN for reliable rendering in captures.

import { useState, useEffect, type CSSProperties } from 'react'

interface IconProps {
  name: string
  size?: number
  color?: string
  style?: CSSProperties
  filled?: boolean
}

// Cache fetched SVGs in memory
const svgCache: Record<string, string> = {}
const pendingFetches: Record<string, Promise<string>> = {}

function fetchIconSvg(name: string, filled: boolean): Promise<string> {
  const fill = filled ? 1 : 0
  const key = `${name}_${fill}`
  if (svgCache[key]) return Promise.resolve(svgCache[key])
  if (key in pendingFetches) return pendingFetches[key]

  const url = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`
  pendingFetches[key] = fetch(url)
    .then(r => r.ok ? r.text() : '')
    .then(svg => { svgCache[key] = svg; delete pendingFetches[key]; return svg })
    .catch(() => { delete pendingFetches[key]; return '' })
  return pendingFetches[key]
}

export default function Icon({ name, size = 20, color, style, filled }: IconProps) {
  const [svg, setSvg] = useState(svgCache[`${name}_${filled ? 1 : 0}`] || '')

  useEffect(() => {
    let cancelled = false
    const key = `${name}_${filled ? 1 : 0}`
    if (svgCache[key]) { setSvg(svgCache[key]); return }
    fetchIconSvg(name, !!filled).then(s => { if (!cancelled) setSvg(s) })
    return () => { cancelled = true }
  }, [name, filled])

  if (!svg) {
    // Fallback: font-based while loading
    return (
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: size,
          color,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariationSettings: filled ? "'FILL' 1" : undefined,
          ...style,
        }}
      >
        {name}
      </span>
    )
  }

  // Render inline SVG
  return (
    <span
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{
        __html: svg
          .replace(/width="24"/, `width="${size}"`)
          .replace(/height="24"/, `height="${size}"`)
          .replace(/fill="[^"]*"/, `fill="${color || 'currentColor'}"`)
          // If no fill attribute, add one
          .replace(/<svg /, `<svg fill="${color || 'currentColor'}" `)
      }}
    />
  )
}

// ── Mapping: lucide name → Material Symbol name ─────────────────────────────
// Used as reference when migrating from lucide-react
export const ICON_MAP = {
  // Navigation
  Menu: 'menu',
  ArrowLeft: 'arrow_back',
  ArrowRight: 'arrow_forward',
  ChevronDown: 'expand_more',
  ChevronRight: 'chevron_right',

  // Actions
  Plus: 'add',
  X: 'close',
  Pencil: 'edit',
  Check: 'check',
  Trash2: 'delete',
  Copy: 'content_copy',
  Upload: 'upload',
  Settings: 'settings',
  MoreVertical: 'more_vert',

  // Content
  FileText: 'description',
  BookOpen: 'menu_book',
  Code2: 'code',
  Tag: 'label',

  // Communication
  Inbox: 'inbox',
  Globe: 'language',

  // Status / Feedback
  HelpCircle: 'help',
  AlertTriangle: 'warning',
  Circle: 'circle',
  Eye: 'visibility',
  Clock: 'schedule',

  // Domain
  GitBranch: 'account_tree',
  Cpu: 'memory',
  LayoutGrid: 'grid_view',
  User: 'person',
  Zap: 'bolt',
  Plug: 'power',
  Wrench: 'build',
  Paperclip: 'attach_file',
  Kanban: 'view_kanban',
  RotateCcw: 'replay',
  RotateCw: 'refresh',
  CalendarDays: 'calendar_month',
} as const
