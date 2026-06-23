// ─────────────────────────────────────────────────────────────────────────────
// Onboarding — fuente única de verdad de los pasos y el progreso.
// Consumido por Onboarding.tsx (página dedicada) y GlobalAssistant.tsx
// (el asistente omnipresente que lleva los pasos a todas las superficies).
// ─────────────────────────────────────────────────────────────────────────────

export type StepId = 'agente' | 'canal' | 'probar' | 'chats'

export interface Step {
  id: StepId
  num: number
  icon: string
  title: string
  short: string          // subtítulo de una línea para el checklist minimalista
  desc: string
  cta: string
  href?: string          // navega a una superficie real
  inline?: boolean       // se resuelve dentro del onboarding
  minutes: string
}

export const STEPS: Step[] = [
  { id: 'agente', num: 1, icon: 'smart_toy', title: 'Crea tu primer agente', short: 'Define qué resuelve y quién responde', desc: 'Define qué resuelve, quién responde y qué datos necesita. Yo te guío paso a paso.', cta: 'Crear agente', href: '/estados-a', minutes: '3 min' },
  { id: 'canal', num: 2, icon: 'hub', title: 'Conecta un canal', short: 'WhatsApp, Instagram o tu sitio web', desc: 'Elige dónde va a atender tu agente: WhatsApp, Instagram o tu sitio web.', cta: 'Elegir canal', inline: true, minutes: '1 min' },
  { id: 'probar', num: 3, icon: 'play_circle', title: 'Prueba tu agente', short: 'Conversa con él como un cliente', desc: 'Conversa con él como lo haría un cliente y ajusta lo que haga falta.', cta: 'Probar ahora', inline: true, minutes: '1 min' },
  { id: 'chats', num: 4, icon: 'forum', title: 'Mira tus conversaciones', short: 'Tu bandeja con el asistente integrado', desc: 'El asistente te acompaña también en la bandeja: resume, sugiere y aprueba contigo.', cta: 'Abrir conversaciones', href: '/chats-diferente', minutes: '2 min' },
]

// ── Persistencia del progreso (sobrevive navegación entre superficies) ────────
export const STORE_KEY = 'bm_onboarding_done'
export const ACTIVE_KEY = 'bm_onboarding_active'

export function loadDone(): StepId[] {
  try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]') } catch { return [] }
}
export function saveDone(ids: StepId[]) {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(ids)) } catch { /* noop */ }
}
export function isOnboardingActive(): boolean {
  try { return sessionStorage.getItem(ACTIVE_KEY) === '1' } catch { return false }
}
export function setOnboardingActive(v: boolean) {
  try {
    if (v) sessionStorage.setItem(ACTIVE_KEY, '1')
    else sessionStorage.removeItem(ACTIVE_KEY)
  } catch { /* noop */ }
}

// El checklist se oculta para siempre una vez completado o descartado
const HIDDEN_KEY = 'bm_onboarding_hidden'
export function isChecklistHidden(): boolean {
  try { return sessionStorage.getItem(HIDDEN_KEY) === '1' } catch { return false }
}
export function hideChecklist() {
  try { sessionStorage.setItem(HIDDEN_KEY, '1') } catch { /* noop */ }
}

// ── Comentarios y respuestas de Boti (demo) ───────────────────────────────────
export const COMMENT: Record<StepId, string> = {
  agente: '¡Genial, ya tienes tu agente creado! Ahora conectémoslo a un canal para que pueda atender.',
  canal: 'Canal conectado. Probémoslo: escríbele como si fueras un cliente.',
  probar: 'Tu agente respondió bien. Último paso: mira cómo se ven las conversaciones en vivo.',
  chats: 'Ahí tienes tu bandeja con el asistente integrado.',
}

export const ANSWERS: Record<string, string> = {
  '¿Qué es un agente de IA?': 'Es un asistente que atiende a tus clientes por ti: entiende lo que necesitan, responde con el contexto de tu negocio y puede resolver tareas. Tú defines cómo se comporta y cuándo pedir ayuda a una persona.',
  '¿Cuánto tarda?': 'El onboarding completo lleva menos de 10 minutos. Crear el agente son unos 3 minutos; el resto es conectar y probar.',
  '¿Qué hace este paso?': 'Este paso te ayuda a avanzar en la configuración. Toca el botón del paso activo y te voy guiando con valores sugeridos.',
  'Dame un ejemplo': 'Por ejemplo: un agente de soporte que responde preguntas frecuentes en WhatsApp y, si el caso es delicado, lo deriva a una persona del equipo.',
  '¿Cómo mido los resultados?': 'En Métricas vas a ver conversaciones atendidas, tasa de resolución y calidad de las respuestas. Te puedo armar un resumen cuando quieras.',
  '¿Puedo agregar otro canal?': 'Sí, cuando quieras. Un mismo agente puede atender en WhatsApp, Instagram y tu web a la vez.',
}
