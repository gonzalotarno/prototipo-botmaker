/**
 * Static showcase — used only for Figma capture.
 * Renders node cards outside of React Flow so the HTML-to-design
 * tool can capture them without transform/overflow issues.
 */
import { ReactFlowProvider } from '@xyflow/react'
import { DrawerProvider } from './context/DrawerContext'
import { INTEGRATIONS } from './data/integrations'
import type { NodeData } from './types'
import InstructionNode from './components/nodes/InstructionNode'
import ConditionNode from './components/nodes/ConditionNode'
import LoopNode from './components/nodes/LoopNode'
import { Bot, X, Send, HelpCircle, ArrowLeft } from 'lucide-react'

const gs   = INTEGRATIONS.find(i => i.id === 'google-sheets')!
const gcal = INTEGRATIONS.find(i => i.id === 'google-calendar')!

function chip(name: string, icon: string, color: string, bgColor: string) {
  return (
    `<span data-chip-id="x" contenteditable="false" style="` +
    `display:inline-flex;align-items:center;gap:3px;` +
    `padding:1px 8px 1px 6px;border-radius:100px;` +
    `font-size:11px;font-weight:600;` +
    `background:${bgColor};color:${color};` +
    `border:1px solid ${color}33;` +
    `white-space:nowrap;cursor:default;user-select:none;` +
    `vertical-align:middle;line-height:1.8;margin:0 2px;` +
    `">${icon} ${name}</span>`
  )
}

const gsChip   = chip('Google Sheets', '📊', '#34A853', '#f0fdf4')
const gcalChip = chip('Google Calendar', '📅', '#4285F4', '#eff6ff')

// Fake node props that satisfy React Flow's NodeProps interface enough to render
function fakeProps(data: NodeData) {
  return {
    id: 'preview',
    data,
    type: 'instructionNode',
    selected: false,
    isConnectable: false,
    zIndex: 0,
    xPos: 0,
    yPos: 0,
    dragging: false,
    width: 380,
    height: 300,
    sourcePosition: 'right' as const,
    targetPosition: 'left' as const,
    dragHandle: undefined,
    parentId: undefined,
  } as any
}

const nodes: { label: string; el: React.ReactNode }[] = [
  {
    label: 'Instrucción — sin integración',
    el: (
      <InstructionNode
        {...fakeProps({
          kind: 'instruction',
          label: 'Tomar el Pedido',
          promptHtml: 'Presentá el menú de pizzas disponibles. Preguntá tamaño, ingredientes extra y cantidad. Confirmá el pedido con el cliente antes de continuar.',
          integrations: [],
        })}
      />
    ),
  },
  {
    label: 'Instrucción — con integración',
    el: (
      <InstructionNode
        {...fakeProps({
          kind: 'instruction',
          label: 'Identificar Cliente',
          promptHtml: `Preguntá el nombre y teléfono del cliente. Buscá si ya existe en ${gsChip} y traé su historial de pedidos.`,
          integrations: [
            {
              integration: gs,
              disabledActions: ['delete'],
              connectionConfig: { spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1abc' },
              accountName: 'pedidos@pizzeria.com',
            },
          ],
        })}
      />
    ),
  },
  {
    label: 'Instrucción — múltiple chips',
    el: (
      <InstructionNode
        {...fakeProps({
          kind: 'instruction',
          label: 'Agendar Entrega',
          promptHtml: `Acordá un horario de entrega. Creá el evento en ${gcalChip} y guardá en ${gsChip}.`,
          integrations: [
            {
              integration: gcal,
              disabledActions: [],
              connectionConfig: { calendarId: 'Entregas' },
              accountName: 'ops@pizzeria.com',
            },
          ],
        })}
      />
    ),
  },
  {
    label: 'Condicional',
    el: (
      <ConditionNode
        {...fakeProps({
          kind: 'condition',
          label: '¿Pedido viable?',
          promptHtml: 'Evaluá si la dirección está en zona de cobertura Y todos los ingredientes están disponibles en stock.',
          integrations: [],
        })}
      />
    ),
  },
  {
    label: 'Loop',
    el: (
      <LoopNode
        {...fakeProps({
          kind: 'loop',
          label: 'Por cada item del pedido',
          promptHtml: 'Iterá sobre cada ítem del pedido y verificá su disponibilidad en el inventario.',
          integrations: [],
        })}
      />
    ),
  },
]

const ONBOARDING_STEPS = [
  { title: 'Creá tus nodos', description: 'Agregá nodos al canvas: Instrucción para definir una tarea del agente, Condicional para bifurcar el flujo, o Loop para iterar sobre una lista.' },
  { title: 'Escribí el prompt de cada paso', description: 'En cada nodo de Instrucción describí qué debe hacer el agente. Sé específico: el agente ejecuta exactamente lo que le indicás.' },
  { title: 'Conectá integraciones', description: 'Usá "/" o "$" dentro del prompt para insertar integraciones como chips (Google Sheets, Gmail, WhatsApp y más). Hacé click en la fila de la integración para configurar cuenta y acciones.' },
  { title: 'Conectá los nodos entre sí', description: 'Arrastrá desde los handles de salida de un nodo hacia la entrada del siguiente para definir el orden del flujo. Los nodos con integración tienen salida de éxito y de error.' },
]

function ChatPanelPreview({ view }: { view: 'chat' | 'help' }) {
  const panelStyle = {
    width: 360,
    height: 520,
    boxShadow: '0 8px 40px rgba(48,79,254,0.18), 0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #E2E7FF',
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden" style={panelStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: '#304FFE' }}>
        <div className="flex items-center gap-2.5">
          {view === 'help' && (
            <div className="p-1 rounded-lg text-white/70 -ml-1 mr-0.5">
              <ArrowLeft size={15} />
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {view === 'help' ? 'Primeros pasos' : 'Asistente'}
            </p>
            <p className="text-[10px] text-blue-200 leading-tight">Canvas de automatización</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {view === 'chat' && (
            <div className="p-1.5 rounded-lg text-white/70">
              <HelpCircle size={15} />
            </div>
          )}
          <div className="p-1.5 rounded-lg text-white/70">
            <X size={15} />
          </div>
        </div>
      </div>

      {/* Help view */}
      {view === 'help' && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800 leading-snug">Cómo usar el canvas ✨</h2>
            <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">Seguí estos pasos para armar tu primer flujo de automatización.</p>
          </div>
          <div className="px-5 py-5">
            {ONBOARDING_STEPS.map((step, i) => {
              const isLast = i === ONBOARDING_STEPS.length - 1
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: i === 0 ? '#304FFE' : '#94a3b8', color: 'white' }}>
                      {i + 1}
                    </div>
                    {!isLast && <div className="w-px flex-1 mt-2 mb-2" style={{ background: '#E2E7FF', minHeight: 24 }} />}
                  </div>
                  <div className="min-w-0" style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4 }}>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{step.title}</p>
                    <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-5 pb-5">
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#304FFE' }}>
              Tengo una pregunta →
            </button>
          </div>
        </div>
      )}

      {/* Chat view */}
      {view === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: '#304FFE' }}>
                <Bot size={12} className="text-white" />
              </div>
              <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed" style={{ background: '#F0F2FF', color: '#1e293b', borderBottomLeftRadius: 4 }}>
                ¡Hola! Soy tu asistente para el canvas de automatización. ¿En qué puedo ayudarte?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed" style={{ background: '#304FFE', color: 'white', borderBottomRightRadius: 4 }}>
                ¿Cómo agrego una integración con Google Sheets?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: '#304FFE' }}>
                <Bot size={12} className="text-white" />
              </div>
              <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed" style={{ background: '#F0F2FF', color: '#1e293b', borderBottomLeftRadius: 4 }}>
                En un nodo de Instrucción, escribí <strong>/</strong> o <strong>$</strong> en el prompt para abrir el selector. Buscá Google Sheets y hacé click para insertarlo como chip. Luego podés configurar cuenta y acciones desde la fila que aparece abajo del nodo.
              </div>
            </div>
          </div>
          <div className="px-3 py-3 border-t border-slate-100 flex-shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-400">
                Escribí tu pregunta…
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e2e8f0' }}>
                <Send size={15} className="text-slate-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-300 mt-1.5 text-center">Enter para enviar · Shift+Enter nueva línea</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function Showcase() {
  return (
    <DrawerProvider>
      <ReactFlowProvider>
        <div className="min-h-screen bg-[#F0F2FF] p-16">
          <div className="flex flex-wrap gap-16 items-start">
            {nodes.map(({ label, el }) => (
              <div key={label} className="flex flex-col gap-10 items-start">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 -mb-6">
                  {label}
                </p>
                <div className="pt-10">
                  {el}
                </div>
              </div>
            ))}

            {/* WebChat previews */}
            <div className="flex flex-col gap-10 items-start">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 -mb-6">
                Webchat — Vista chat
              </p>
              <ChatPanelPreview view="chat" />
            </div>
            <div className="flex flex-col gap-10 items-start">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 -mb-6">
                Webchat — Primeros pasos
              </p>
              <ChatPanelPreview view="help" />
            </div>
          </div>
        </div>
      </ReactFlowProvider>
    </DrawerProvider>
  )
}
