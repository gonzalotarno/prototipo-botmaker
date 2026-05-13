import { useRef, useLayoutEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Integration } from '../types'
import IntegrationMenu from './IntegrationMenu'

interface Props {
  initialHtml: string
  onHtmlChange: (html: string) => void
  onIntegrationAdd: (integration: Integration, html: string) => void
  allowIntegrations?: boolean
}

function createChipSpan(integration: Integration): HTMLSpanElement {
  const span = document.createElement('span')
  span.dataset.chipId = integration.id
  span.setAttribute('contenteditable', 'false')
  Object.assign(span.style, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '1px 8px 1px 6px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '600',
    background: integration.bgColor,
    color: integration.color,
    border: `1px solid ${integration.color}33`,
    whiteSpace: 'nowrap',
    cursor: 'default',
    userSelect: 'none',
    verticalAlign: 'middle',
    lineHeight: '1.8',
    margin: '0 2px',
  })
  const iconEl = document.createElement('span')
  iconEl.textContent = integration.icon
  const nameEl = document.createElement('span')
  nameEl.textContent = integration.name
  span.appendChild(iconEl)
  span.appendChild(nameEl)
  return span
}

interface MenuState {
  open: boolean
  query: string
  pos: { x: number; y: number }
}

export default function PromptEditor({ initialHtml, onHtmlChange, onIntegrationAdd, allowIntegrations = false }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)
  const savedTrigger = useRef<{ node: Node; triggerOffset: number } | null>(null)

  const [menu, setMenu] = useState<MenuState>({ open: false, query: '', pos: { x: 0, y: 0 } })

  // Set initial HTML once on mount — uncontrolled after that
  useLayoutEffect(() => {
    if (isInitialized.current || !editorRef.current) return
    isInitialized.current = true
    editorRef.current.innerHTML = initialHtml || ''
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (!allowIntegrations) return

    const selection = window.getSelection()
    if (!selection?.rangeCount) return
    const range = selection.getRangeAt(0)
    const container = range.startContainer

    if (container.nodeType !== Node.TEXT_NODE) {
      setMenu(m => (m.open ? { ...m, open: false } : m))
      return
    }

    const textBefore = (container.textContent ?? '').slice(0, range.startOffset)
    const lastSlash = textBefore.lastIndexOf('/')
    const lastDollar = textBefore.lastIndexOf('$')
    const triggerIdx = Math.max(lastSlash, lastDollar)

    if (triggerIdx !== -1) {
      const afterTrigger = textBefore.slice(triggerIdx + 1)
      if (/^[\w ]*$/.test(afterTrigger)) {
        savedTrigger.current = { node: container, triggerOffset: triggerIdx }

        // Use viewport coordinates so the portal renders correctly
        const caretRange = document.createRange()
        caretRange.setStart(container, range.startOffset)
        caretRange.collapse(true)
        const rect = caretRange.getBoundingClientRect()

        setMenu({
          open: true,
          query: afterTrigger,
          pos: { x: rect.left, y: rect.bottom + 6 },
        })
        return
      }
    }

    setMenu(m => (m.open ? { ...m, open: false } : m))
  }, [allowIntegrations])

  const insertChip = useCallback(
    (integration: Integration) => {
      const trigger = savedTrigger.current
      const editor = editorRef.current
      if (!trigger || !editor) return

      const { node, triggerOffset } = trigger
      const textLen = node.textContent?.length ?? 0
      const deleteEnd = Math.min(triggerOffset + 1 + menu.query.length, textLen)

      // Delete the trigger char + query text
      const deleteRange = document.createRange()
      deleteRange.setStart(node, triggerOffset)
      deleteRange.setEnd(node, deleteEnd)
      deleteRange.deleteContents()

      // Insert chip element at the trigger offset
      const chip = createChipSpan(integration)
      deleteRange.insertNode(chip)

      // Add non-breaking space after chip so cursor can land after it
      const space = document.createTextNode('\u00A0')
      chip.after(space)

      // Move cursor after the space
      const sel = window.getSelection()
      const afterRange = document.createRange()
      afterRange.setStart(space, 1)
      afterRange.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(afterRange)

      // Close menu
      setMenu({ open: false, query: '', pos: { x: 0, y: 0 } })
      savedTrigger.current = null

      // Notify parent with both integration and updated HTML in one call
      onIntegrationAdd(integration, editor.innerHTML)
    },
    [menu.query, onIntegrationAdd, onHtmlChange]
  )

  const handleBlur = useCallback(() => {
    // Small delay so click on menu item fires before blur closes menu
    setTimeout(() => {
      if (editorRef.current) onHtmlChange(editorRef.current.innerHTML)
    }, 150)
  }, [onHtmlChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (menu.open && ['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'Escape' && menu.open) {
        setMenu(m => ({ ...m, open: false }))
      }
    },
    [menu.open]
  )

  return (
    <div className="relative px-3 pt-1 pb-2">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-placeholder="Describe lo que debe hacer este nodo… (/ o $ para integración)"
        className="nodrag prompt-editor min-h-[80px] w-full rounded-xl bg-slate-100 px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:bg-slate-100/80 transition-colors leading-relaxed"
      />

      {menu.open &&
        createPortal(
          <IntegrationMenu
            query={menu.query}
            position={menu.pos}
            onSelect={insertChip}
            onClose={() => setMenu(m => ({ ...m, open: false }))}
          />,
          document.body
        )}
    </div>
  )
}
