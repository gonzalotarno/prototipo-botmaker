import { useState, useEffect, useId, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CHATS — rediseño moderno (estilo Intercom/Fin) con identidad Botmaker.
// Topbar con menú (drawer) · Bandeja colapsable · lista · conversación tematizada
// por CANAL (WhatsApp, Telegram, Instagram, Mercado Libre, Webchat) · panel
// derecho Perfil | Asistente de IA con HITL. Sesiones (Botmaker 2.0) o Tickets
// (Agentes de IA) según el origen del chat.
// Reglas: light · Roboto · MS Rounded weight 500 · acento azul Botmaker · pill.
// ─────────────────────────────────────────────────────────────────────────────

function MS({ name, size = 18, color = 'currentColor', fill = 0, weight = 500, style }:
  { name: string; size?: number; color?: string; fill?: 0 | 1; weight?: number; style?: React.CSSProperties }) {
  return (
    <span className="material-symbols-rounded" style={{
      fontSize: size, color, lineHeight: 1, flexShrink: 0,
      fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      ...style,
    }}>{name}</span>
  )
}

const C = {
  primary: '#304FFE', primaryHover: '#2A46E8', primaryL: '#EEF1FF',
  ink: '#1C1D22', t2: '#6A6E78', t3: '#9DA1AB',
  border: '#ECEDF0', borderSoft: '#F1F2F4',
  page: '#E7E8EB', shell: '#FFFFFF', rail: '#F5F5F7',
  hover: '#F4F5F7', sel: '#EFF0F3', convBg: '#F7F7F9',
  ok: '#16A34A', warn: '#D97706', err: '#D93025', violet: '#7C3AED', teal: '#0D9488',
  dark: '#22232A', noteBg: '#FFF8E1', noteText: '#7A5C00',
}
const FONT = 'Roboto, sans-serif'
const MONO = '"Roboto Mono", ui-monospace, monospace'
const ORB = 'linear-gradient(135deg, #5B7BFF, #2B3DD6)'

// ── Logos de canal ────────────────────────────────────────────────────────────
const WA = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'
const IG = 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84M12 16a4 4 0 110-8 4 4 0 010 8m6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88Z'
const TG = 'M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56l.4-5.56 10.1-9.13c.44-.39-.1-.61-.68-.22L6.32 13.62l-5.45-1.7c-1.18-.37-1.2-1.18.25-1.75l21.32-8.22c.97-.36 1.83.23 1.47 1.84Z'
type Channel = 'whatsapp' | 'instagram' | 'telegram' | 'mercadolibre' | 'webchat' | 'ticket'
function ChannelLogo({ channel, size }: { channel: Channel; size: number }) {
  switch (channel) {
    case 'whatsapp': return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366" /><g transform="translate(3.6,3.6) scale(0.7)"><path d={WA} fill="#fff" /></g></svg>
    case 'instagram': return <svg width={size} height={size} viewBox="0 0 24 24"><defs><linearGradient id={`ig${size}`} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80" /><stop offset="50%" stopColor="#E1306C" /><stop offset="100%" stopColor="#833AB4" /></linearGradient></defs><circle cx="12" cy="12" r="12" fill={`url(#ig${size})`} /><g transform="translate(3.6,3.6) scale(0.7)"><path d={IG} fill="#fff" /></g></svg>
    case 'telegram': return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#229ED9" /><g transform="translate(2.6,2.6) scale(0.78)"><path d={TG} fill="#fff" /></g></svg>
    case 'mercadolibre': return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FFE600" /><text x="12" y="15.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8.2" fontWeight="700" fill="#2D3277">ML</text></svg>
    case 'ticket': return <div style={{ width: size, height: size, borderRadius: 999, background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MS name="confirmation_number" size={Math.round(size * 0.56)} color="#fff" fill={1} weight={500} /></div>
    default: return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#304FFE" /><path d="M12 5.5l1.6 3.4 3.7.4-2.8 2.5.8 3.6L12 13.9 8.7 15.9l.8-3.6-2.8-2.5 3.7-.4z" fill="#fff" /></svg>
  }
}

// ── Orb / isotipo del Asistente de IA (mismo que en las propuestas) ───────────
const ISO_A = 'M57.1384 34.5928C52.5663 34.873 48.3365 36.987 45.2069 39.8396C43.6177 41.2659 42.2729 42.896 41.1238 44.6025C39.9991 46.2581 39.0456 47.99 38.1654 49.722C36.7962 52.4982 35.5982 55.3508 34.6691 58.2544C33.96 60.4449 33.3977 62.6353 32.9576 64.8766C32.6398 66.4558 32.1019 68.3915 30.097 69.0283C28.2877 69.6141 26.1362 68.9009 24.987 67.6783C23.7645 66.3794 23.3 64.7238 22.8354 63.1447C22.2731 61.2344 21.6619 59.3751 21.0017 57.5667C20.9284 57.363 20.855 57.1847 20.7817 56.9809C20.7817 56.9809 20.7817 56.9809 20.7817 56.9555C19.9504 54.7396 18.9968 52.6001 17.8477 50.5116C17.7988 50.4097 17.7499 50.3333 17.701 50.2314C17.6521 50.1295 17.6032 50.0276 17.5299 49.9257C16.3074 47.7353 14.8893 45.5959 13.2023 43.5073C13.1778 43.4564 13.1289 43.4309 13.1045 43.38C13.1045 43.38 13.1045 43.3799 13.08 43.3545C10.1461 39.7377 7.65219 38.0567 5.32947 36.7068C4.57153 36.2738 3.64244 35.8918 2.7867 35.5861C2.7867 35.5861 2.7867 35.5861 2.76225 35.5861C1.31972 35.0767 0.0483398 34.7965 0.0483398 34.7965C0.146139 34.7965 0.708481 34.7201 1.80872 34.4145H1.83317C2.49331 34.2362 3.34905 33.9306 4.37593 33.523C4.71823 33.3957 5.06052 33.2429 5.45172 33.0646C6.03851 32.8099 6.74755 32.4024 7.50549 31.893C9.02137 30.9506 10.6351 29.7025 12.2487 28.0725C12.7622 27.5885 13.1778 27.1046 13.5201 26.6971C13.5446 26.6716 13.569 26.6207 13.5935 26.5952C19.7303 18.6995 20.3171 13.147 22.4443 6.01543C22.9088 4.41081 23.789 2.85714 24.987 1.55817C26.1362 0.335611 28.2877 -0.37753 30.097 0.20828C32.0774 0.845031 32.6398 2.78073 32.9576 4.35987C33.4222 6.60124 33.96 8.79166 34.6691 10.9821C35.6226 13.8857 36.7962 16.7383 38.1654 19.5145C39.1189 21.4248 40.1703 23.3096 41.4172 25.067C42.5174 26.6207 43.7644 28.0725 45.2069 29.3969C48.3365 32.1477 52.5663 34.2872 57.1384 34.5928Z'
const ISO_B = 'M73.8869 35.026C70.2439 35.2553 66.8943 36.9618 64.4005 39.2031C61.9066 41.4445 60.2196 44.2207 58.8015 47.0479C57.7013 49.2638 56.7722 51.5051 56.0142 53.8229C55.4519 55.5549 55.0118 57.3123 54.645 59.0697C54.3761 60.3432 53.9605 61.846 52.3712 62.3808C50.9531 62.8393 49.2172 62.2789 48.3126 61.3111C47.359 60.2923 46.9678 58.9678 46.6011 57.6943C45.2564 53.1862 43.5938 48.7034 41.0999 44.5773C41.0266 44.4499 40.9288 44.3226 40.8554 44.1952C39.9508 42.8199 36.7479 38.4645 32.2002 38.4645C23.8384 38.49 21.0756 56.6501 20.9534 57.4906C20.9534 57.516 20.9534 57.5161 20.9534 57.5161C20.9534 57.5161 20.88 57.3378 20.7333 56.9302C20.3421 55.8096 19.3642 53.339 17.7994 50.4609C17.7505 50.359 17.7016 50.2571 17.6527 50.1807C17.6038 50.0788 17.5549 49.9769 17.4815 49.8751C16.3079 47.7865 14.841 45.4942 13.0561 43.3292C10.3422 40.0691 6.94371 37.1146 2.73836 35.51C1.85818 35.1789 0.953538 34.9242 0.0244498 34.7204C0.0244498 34.7204 0.684591 34.644 1.78483 34.3638C2.51832 34.1855 3.37406 33.8799 4.35204 33.4724C5.30558 33.0648 6.35692 32.5554 7.45715 31.8423C8.97303 30.8999 10.5867 29.6519 12.2004 28.0218C12.6405 27.5633 13.105 27.0794 13.5451 26.5445C16.0634 23.5645 18.4351 19.5148 20.1465 14.0133C20.1465 14.0133 22.0781 30.798 32.0046 30.9254C32.0046 30.9254 35.5743 31.0272 41.3444 24.9908C44.5229 21.6797 45.2808 16.6876 46.5522 12.3577C46.9189 11.0842 47.3101 9.78524 48.2637 8.74097C49.1683 7.77311 50.8798 7.18728 52.3223 7.67121C53.9116 8.18061 54.3272 9.70882 54.5961 10.9823C54.9629 12.7652 55.3785 14.4972 55.9653 16.2291C56.7233 18.5469 57.6524 20.7883 58.7526 23.0042C60.1707 25.8314 61.8577 28.6076 64.3516 30.8489C66.8943 33.1158 70.2439 34.7968 73.8869 35.026Z'
function Orb({ size = 36, radius }: { size?: number; radius?: number }) {
  const id = useId()
  return (
    <div style={{ width: size, height: size, borderRadius: radius ?? 999, background: '#EDF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 74 70" fill="none">
        <defs><radialGradient id={id} cx="0.3" cy="0.2" r="1"><stop offset="0" stopColor="#5B7BFF" /><stop offset="1" stopColor="#2B3DD6" /></radialGradient></defs>
        <path d={ISO_A} fill={`url(#${id})`} />
        <path d={ISO_B} fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

// ── Theming por canal (colores REALES de cada plataforma) ─────────────────────
const CH: Record<Channel, { name: string; brand: string; chatBg: string; sentBg: string; sentText: string; sentGradient?: [string, string, string]; recvBg: string; recvText: string; tick: string }> = {
  whatsapp: { name: 'WhatsApp', brand: '#25D366', chatBg: '#ECE5DD', sentBg: '#DCF8C6', sentText: '#303030', recvBg: '#FFFFFF', recvText: '#303030', tick: '#34B7F1' },
  telegram: { name: 'Telegram', brand: '#229ED9', chatBg: '#E6EBEE', sentBg: '#EFFDDE', sentText: '#1A1A1A', recvBg: '#FFFFFF', recvText: '#1A1A1A', tick: '#5DC452' },
  instagram: { name: 'Instagram', brand: '#E1306C', chatBg: '#FAFAFA', sentBg: '#5B51D8', sentText: '#FFFFFF', sentGradient: ['#5B51D8', '#C13584', '#ED4956'], recvBg: '#EFEFEF', recvText: '#000000', tick: '#FFFFFF' },
  mercadolibre: { name: 'Mercado Libre', brand: '#FFE600', chatBg: '#EBEBEB', sentBg: '#3483FA', sentText: '#FFFFFF', recvBg: '#FFFFFF', recvText: '#333333', tick: '#3483FA' },
  webchat: { name: 'Webchat', brand: '#304FFE', chatBg: '#EEF1FB', sentBg: '#304FFE', sentText: '#FFFFFF', recvBg: '#FFFFFF', recvText: '#1C1D22', tick: '#A9B8FF' },
  ticket: { name: 'Ticket', brand: '#0D9488', chatBg: '#F0FAFA', sentBg: '#0D9488', sentText: '#FFFFFF', recvBg: '#FFFFFF', recvText: '#1C1D22', tick: '#0D9488' },
}

// ── Data ─────────────────────────────────────────────────────────────────────
interface Msg { from: 'cliente' | 'bot' | 'agente'; text: string; time: string }
interface Hitl { kind: 'aprobar' | 'revisar'; action: string; agent: string; summary: string; plan: string[]; checks: string; time: string }
interface Session { id: string; date: string; when: string; active?: boolean; msgs: number; score?: string }
// Cada ticket lo crea un agente de IA y lo revisa un agente HUMANO (distinto por flujo)
interface Ticket { id: string; title: string; agent: string; agentColor: string; state: string; stateColor: string; date: string; reviewer: string; reviewerColor: string }
interface Chat {
  id: string; name: string; channel: Channel; flag?: string
  preview: string; sub: string; time: string; unread?: number
  source: 'flows' | 'agents' // flows = Botmaker 2.0 (sesiones) · agents = Agentes IA (tickets)
  score?: string // quality score de la conversación
  hitl?: Hitl; messages: Msg[]; sessions: Session[]; tickets: Ticket[]
}
// Color del quality score según el valor (verde alto · ámbar medio · rojo bajo)
function scoreTone(s: string) {
  const n = parseFloat(s)
  if (n >= 4) return { bg: '#E9F9EF', fg: '#16A34A' }
  if (n >= 3) return { bg: '#FFF6E5', fg: '#D97706' }
  return { bg: '#FDE7E7', fg: '#D93025' }
}

const MSGS_WA: Msg[] = [
  { from: 'cliente', text: 'Hola, quería confirmar el turno del martes con el oftalmólogo', time: '15:31' },
  { from: 'bot', text: '¡Hola! Soy el asistente de Botmaker. Veo tu solicitud de turno, dejame revisar la disponibilidad.', time: '15:31' },
  { from: 'cliente', text: 'Genial, sería para la mañana si se puede', time: '15:32' },
]
const MSGS_ML: Msg[] = [
  { from: 'cliente', text: 'Hola! Compré las zapatillas (compra #4521) y necesito cambiar el talle', time: '11:02' },
  { from: 'bot', text: '¡Hola! Verifico tu compra… El cambio de talle no tiene costo dentro de los 30 días. ¿A qué talle querés cambiar?', time: '11:02' },
  { from: 'cliente', text: 'Al 42 por favor. ¿Llega esta semana?', time: '11:04' },
]
const MSGS_IG: Msg[] = [
  { from: 'cliente', text: 'Hola! Quiero info sobre envíos a Lima 🇵🇪', time: '18:20' },
  { from: 'bot', text: '¡Hola! Hacemos envíos a todo Perú. A Lima llega en 2-3 días hábiles 📦', time: '18:20' },
  { from: 'cliente', text: '¿Y el costo?', time: '18:21' },
]
const MSGS_TG: Msg[] = [
  { from: 'cliente', text: 'Buenas, quiero saber el estado de mi pedido', time: '12:10' },
  { from: 'bot', text: '¡Hola! Pasame el número de pedido y lo reviso al instante.', time: '12:10' },
  { from: 'cliente', text: 'PED-88231', time: '12:11' },
]

const SESS_A: Session[] = [
  { id: 's1', date: 'Sesión de hoy', when: 'Ahora', active: true, msgs: 6 },
  { id: 's2', date: 'Sesión 28/05/2026', when: 'hace 21 días', msgs: 9, score: '4.6' },
  { id: 's3', date: 'Sesión 12/05/2026', when: 'hace 37 días', msgs: 5, score: '2.8' },
]
const SESS_B: Session[] = [
  { id: 's1', date: 'Sesión de hoy', when: 'Ahora', active: true, msgs: 4 },
  { id: 's2', date: 'Sesión 05/06/2026', when: 'hace 13 días', msgs: 7, score: '3.4' },
]
const TKT_TURNO: Ticket[] = [
  { id: '#1042', title: 'Turno oftalmólogo', agent: 'Agendador de turnos', agentColor: '#0D9488', state: 'Por aprobar', stateColor: '#D97706', date: 'Hoy', reviewer: 'Ignacio F.', reviewerColor: '#2563EB' },
  { id: '#1039', title: 'Recordatorio de control', agent: 'Agendador de turnos', agentColor: '#0D9488', state: 'Resuelto', stateColor: '#16A34A', date: 'hace 6 meses', reviewer: 'Sin asignar', reviewerColor: '#9DA1AB' },
]
const TKT_VENTA: Ticket[] = [
  { id: '#2210', title: 'Cambio de talle · compra #4521', agent: 'Agente de Ventas', agentColor: '#3483FA', state: 'En proceso', stateColor: '#D97706', date: 'Hoy', reviewer: 'Martín R.', reviewerColor: '#EA580C' },
]
const TKT_SOPORTE: Ticket[] = [
  { id: '#3088', title: 'Consulta de envíos', agent: 'Agente de Soporte', agentColor: '#7C3AED', state: 'Abierto', stateColor: '#3483FA', date: 'Hoy', reviewer: 'Gonzalo T.', reviewerColor: '#7C3AED' },
]

const MSGS_TKT1: Msg[] = [
  { from: 'cliente', text: 'Hola, quiero un turno con el Dr. Martínez para la próxima semana', time: '10:55' },
  { from: 'bot', text: 'Tengo disponibilidad el martes 13/05 a las 9:30 hs. ¿Te viene bien?', time: '10:56' },
  { from: 'cliente', text: 'Perfecto, sí. ¿Necesito llevar algo?', time: '10:57' },
  { from: 'bot', text: 'Solo el DNI y la orden médica si tenés. Te enviamos la confirmación por WhatsApp.', time: '10:58' },
]
const MSGS_TKT2: Msg[] = [
  { from: 'cliente', text: 'Me llegó un recordatorio de cobro pero yo ya pagué el mes pasado', time: '14:20' },
  { from: 'bot', text: 'Revisando tu historial de pagos… Encontré un pago de $8.200 el 15/05. ¿Tenés el comprobante?', time: '14:21' },
  { from: 'cliente', text: 'Sí, lo tengo. ¿Lo mando por acá?', time: '14:22' },
]

const CHATS: Chat[] = [
  { id: 't1', name: 'Turno · Webchat-3607107', channel: 'ticket', source: 'agents',
    preview: 'La IA generó: Confirmar turno Dr. Martínez Mar 13/05', sub: 'Agendador de turnos · Ignacio F.', time: '1m', unread: 1, score: '4.1',
    hitl: { kind: 'aprobar', action: 'Confirmar turno · Dr. Martínez · Mar 13/05 · 9:30', agent: 'Agendador de turnos', summary: 'El cliente solicitó turno de control con el Dr. Martínez. Se verificó disponibilidad el martes 13/05 a las 9:30 hs. Requiere confirmación del revisor antes de notificar al cliente y cerrar el ticket.', plan: ['Confirmar turno · Dr. Martínez · Mar 13/05 · 9:30 hs', 'Enviar confirmación por WhatsApp al cliente', 'Cerrar el ticket como resuelto'], checks: 'Disponibilidad verificada · calendario consultado', time: '1m' },
    messages: MSGS_TKT1, sessions: [],
    tickets: [{ id: '#993', title: 'Turno · Webchat-3607107', agent: 'Agendador de turnos', agentColor: '#0D9488', state: 'Solicitud de turno', stateColor: '#D97706', date: 'Hoy 10:55', reviewer: 'Ignacio F.', reviewerColor: '#2563EB' }] },
  { id: 't2', name: 'Cobranza · Plan Pro #1204', channel: 'ticket', source: 'agents',
    preview: 'Revisando historial de pagos del cliente', sub: 'Agente de Pagos · Lucía M.', time: '3m',
    hitl: { kind: 'revisar', action: 'Verificar comprobante y resolver disputa de cobro', agent: 'Agente de Pagos', summary: 'El cliente reclama un cobro que considera duplicado. El cargo es la renovación del Plan Pro del 15/05. Tiene comprobante de pago previo y pide verificación manual antes de responder.', plan: ['Verificar comprobante enviado por el cliente', 'Comparar con el historial de pagos en el sistema', 'Resolver la disputa y notificar al cliente con la decisión'], checks: 'Historial de pagos consultado · sistema de cobros verificado', time: '3m' },
    messages: MSGS_TKT2, sessions: [],
    tickets: [{ id: '#1204', title: 'Cobranza · Plan Pro', agent: 'Agente de Pagos', agentColor: '#7C3AED', state: 'Para revisar', stateColor: '#D97706', date: 'Hoy 14:20', reviewer: 'Lucía M.', reviewerColor: '#DB2777' }] },
  { id: 'c1', name: 'Carlos Lombardi', channel: 'whatsapp', flag: '🇲🇽', preview: 'Quiero confirmar el turno del martes', sub: 'Turnos · Agendador', time: '1m', unread: 1, source: 'agents', score: '4.3',
    hitl: { kind: 'aprobar', action: 'Confirmar turno · Dr. Martínez · Mar 13/05 · 9:30', agent: 'Agendador de turnos', summary: 'El cliente solicita turno de control con oftalmólogo, horario matutino. Disponibilidad verificada con 2 profesionales.', plan: ['Confirmar turno · Dr. Martínez · Mar 13/05 · 9:30 hs', 'Enviar confirmación por WhatsApp', 'Registrar nota y cerrar la conversación'], checks: 'Disponibilidad verificada · calendario consultado', time: '1m' },
    messages: MSGS_WA, sessions: SESS_A, tickets: TKT_TURNO },
  { id: 'c2', name: 'Brisa Gómez', channel: 'mercadolibre', flag: '🇦🇷', preview: 'Cambio de talle en la compra #4521', sub: 'Ventas · Agente de Ventas', time: '2m', source: 'agents', score: '4.8',
    hitl: { kind: 'revisar', action: 'Respuesta generada: cambio de talle aprobado', agent: 'Agente de Ventas', summary: 'La IA gestionó el cambio de talle y generó la etiqueta de devolución. Pide revisión antes de notificar al cliente.', plan: ['Etiqueta de devolución generada (#DEV-2231)', 'Nuevo envío programado para el jueves', 'Notificar al cliente con el tracking'], checks: 'Stock verificado · política de cambios aplicada', time: '2m' },
    messages: MSGS_ML, sessions: SESS_B, tickets: TKT_VENTA },
  { id: 'c3', name: 'Ezequiel', channel: 'instagram', flag: '🇵🇪', preview: 'Hola! Quiero info sobre envíos a Lima', sub: 'Soporte · Gonzalo', time: '3m', unread: 2, source: 'agents',
    messages: MSGS_IG, sessions: SESS_B, tickets: TKT_SOPORTE },
  { id: 'c4', name: 'Hernán Liendo', channel: 'telegram', flag: '🇨🇴', preview: 'Quiero saber el estado de mi pedido', sub: 'Flujo Pedidos 2.0 · Bot', time: '8m', source: 'flows', score: '3.1',
    messages: MSGS_TG, sessions: SESS_A, tickets: [] },
  { id: 'c5', name: 'Jenna Bailey', channel: 'whatsapp', flag: '🇲🇽', preview: '¿Tenés otras opciones de color?', sub: 'Ventas · Bot', time: '15m', source: 'agents',
    messages: MSGS_WA, sessions: SESS_B, tickets: TKT_VENTA },
  { id: 'c6', name: 'Kay Brakus', channel: 'webchat', flag: '🇨🇱', preview: 'Necesito ayuda con mi pedido…', sub: 'Flujo Soporte 2.0 · Bot', time: '22m', source: 'flows', score: '2.4',
    messages: MSGS_WA, sessions: SESS_A, tickets: [] },
  { id: 'c7', name: 'Willie Larson', channel: 'mercadolibre', flag: '🇧🇷', preview: '¿Como faço para devolver?', sub: 'Soporte · Bot', time: '30m', source: 'agents', score: '4.5',
    messages: MSGS_ML, sessions: SESS_B, tickets: TKT_SOPORTE },
  { id: 'c8', name: 'Ale Zuzenberg', channel: 'telegram', flag: '🇦🇷', preview: 'Oi! Mais alguma promoção?', sub: 'Flujo Ventas 2.0 · Bot', time: '41m', source: 'flows',
    messages: MSGS_TG, sessions: SESS_B, tickets: [] },
]

// Avatar de inicial con color
const AV = ['#16A34A', '#2563EB', '#D97706', '#DB2777', '#0D9488', '#7C3AED', '#EA580C']
function avColor(s: string) { return AV[s.charCodeAt(0) % AV.length] }
function Avatar({ chat, size = 30, channel = true }: { chat: Chat; size?: number; channel?: boolean }) {
  const badge = Math.round(size * 0.46)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: 999, background: avColor(chat.name), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.42, fontWeight: 500, color: '#fff' }}>{chat.name[0]}</span>
      </div>
      {channel && (
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: badge, height: badge, borderRadius: 999, background: C.shell, padding: 1.5, display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,.12)' }}>
          <ChannelLogo channel={chat.channel} size={badge - 3} />
        </div>
      )}
    </div>
  )
}

function CircBtn({ name, size = 18, onClick, active, fill }: { name: string; size?: number; onClick?: () => void; active?: boolean; fill?: 0 | 1 }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer', background: active ? C.primaryL : h ? C.hover : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .12s' }}>
      <MS name={name} size={size} color={active ? C.primary : C.t2} fill={fill} />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR — menú (drawer), título "Chats" y acciones
// ─────────────────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header style={{ height: 52, background: C.shell, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0, gap: 10, fontFamily: FONT }}>
      {/* Menú → abre el drawer (pendiente) */}
      <button title="Menú" style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => { e.currentTarget.style.background = C.hover }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
        <MS name="menu" size={24} color={C.primary} weight={500} />
      </button>
      <span style={{ fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: -0.2 }}>Chats</span>
      <div style={{ flex: 1 }} />
      <CircBtn name="add_comment" size={20} />
      <div style={{ position: 'relative' }}>
        <CircBtn name="notifications" size={20} />
        <span style={{ position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 999, background: C.err, border: `1.5px solid ${C.shell}` }} />
      </div>
      <CircBtn name="help" size={20} />
      <div style={{ width: 1, height: 22, background: C.border, margin: '0 4px' }} />
      {/* Estado del agente */}
      <button style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 8px 0 4px', borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: FONT }}
        onMouseEnter={e => { e.currentTarget.style.background = C.hover }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
        <div style={{ position: 'relative', width: 30, height: 30 }}>
          <div style={{ width: 30, height: 30, borderRadius: 999, background: avColor('Gonzalo'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>G</span></div>
          <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 999, background: C.warn, border: `2px solid ${C.shell}` }} />
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
          <div style={{ fontSize: 10.5, color: C.t3 }}>Estado</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink }}>Ocupado</div>
        </div>
        <MS name="keyboard_arrow_down" size={18} color={C.t3} />
      </button>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BANDEJA (carpetas) — colapsable
// ─────────────────────────────────────────────────────────────────────────────
const FOLDER_ITEMS: { id: string; label: string; icon: string; count?: number; accent?: boolean }[] = [
  { id: 'tu', label: 'Tu bandeja', icon: 'inbox', count: 8 },
  { id: 'menciones', label: 'Menciones', icon: 'alternate_email', count: 2 },
  { id: 'aprobar', label: 'Para aprobar', icon: 'verified_user', count: 1, accent: true },
  { id: 'revisar', label: 'Para revisar', icon: 'rate_review', count: 1, accent: true },
  { id: 'sin', label: 'Sin asignar', icon: 'person_off', count: 1 },
  { id: 'todas', label: 'Todas', icon: 'stacks', count: 8 },
]
const VIEW_ITEMS = [
  { id: 'soporte', label: 'Soporte', icon: 'support_agent' },
  { id: 'ventas', label: 'Ventas', icon: 'sell' },
  { id: 'turnos', label: 'Turnos', icon: 'event' },
]
function FoldersNav({ folder, setFolder, open, onToggle }: { folder: string; setFolder: (f: string) => void; open: boolean; onToggle: () => void }) {
  if (!open) {
    // Colapsada: tira angosta de íconos
    return (
      <div style={{ width: 54, flexShrink: 0, background: C.shell, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 2 }}>
        <button onClick={onToggle} title="Expandir bandeja" style={{ width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}
          onMouseEnter={e => { e.currentTarget.style.background = C.hover }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
          <MS name="menu_open" size={22} color={C.t2} style={{ transform: 'scaleX(-1)' }} />
        </button>
        {FOLDER_ITEMS.map(it => {
          const on = folder === it.id
          return (
            <button key={it.id} onClick={() => setFolder(it.id)} title={it.label} style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', background: on ? C.sel : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = C.hover }} onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}>
              <MS name={it.icon} size={20} color={it.accent ? C.primary : on ? C.ink : C.t2} fill={on ? 1 : 0} />
              {it.accent && it.count ? <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 999, background: C.primary }} /> : null}
            </button>
          )
        })}
      </div>
    )
  }
  return (
    <div style={{ width: 210, flexShrink: 0, background: C.shell, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 12px 16px' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Bandeja</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <CircBtn name="search" size={19} />
          <CircBtn name="menu_open" size={20} onClick={onToggle} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
        {FOLDER_ITEMS.map(it => {
          const on = folder === it.id
          return (
            <button key={it.id} onClick={() => setFolder(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: 'none', background: on ? C.sel : 'transparent', cursor: 'pointer', fontFamily: FONT, textAlign: 'left', marginBottom: 1, transition: 'background .1s' }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = C.hover }} onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}>
              <MS name={it.icon} size={18} color={it.accent ? C.primary : on ? C.ink : C.t2} fill={on ? 1 : 0} />
              <span style={{ flex: 1, fontSize: 13.5, color: on ? C.ink : C.t2, fontWeight: on ? 500 : 400 }}>{it.label}</span>
              {it.count != null && <span style={{ fontSize: 12, color: it.accent ? C.primary : C.t3, fontWeight: it.accent ? 600 : 400 }}>{it.count}</span>}
            </button>
          )
        })}
        <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: .6, textTransform: 'uppercase', padding: '14px 10px 6px' }}>Vistas</div>
        {VIEW_ITEMS.map(it => {
          const on = folder === it.id
          return (
            <button key={it.id} onClick={() => setFolder(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: 'none', background: on ? C.sel : 'transparent', cursor: 'pointer', fontFamily: FONT, textAlign: 'left', marginBottom: 1, transition: 'background .1s' }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = C.hover }} onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}>
              <MS name={it.icon} size={18} color={on ? C.ink : C.t2} fill={on ? 1 : 0} />
              <span style={{ flex: 1, fontSize: 13.5, color: on ? C.ink : C.t2, fontWeight: on ? 500 : 400 }}>{it.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTA de conversaciones
// ─────────────────────────────────────────────────────────────────────────────
const FOLDER_TITLE: Record<string, string> = {
  tu: 'Tu bandeja', menciones: 'Menciones', aprobar: 'Para aprobar', revisar: 'Para revisar',
  sin: 'Sin asignar', todas: 'Todas', soporte: 'Soporte', ventas: 'Ventas', turnos: 'Turnos',
}
// Contenedor que anima la expansión (alto 0fr↔1fr). Arranca colapsado y se abre
// al montarse (sin "flash"); el prop `open` permite colapsar/expandir con animación.
function ExpandPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const [entered, setEntered] = useState(false)
  useEffect(() => { const r = requestAnimationFrame(() => setEntered(true)); return () => cancelAnimationFrame(r) }, [])
  const expanded = open && entered
  return (
    <div style={{ display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr', opacity: expanded ? 1 : 0, transition: 'grid-template-rows .34s cubic-bezier(.4,0,.2,1), opacity .26s ease' }}>
      <div style={{ overflow: 'hidden', minHeight: 0 }}>{children}</div>
    </div>
  )
}

// Sesiones (Botmaker 2.0) o Tickets (Agentes de IA) del chat — diseño moderno, expandido en la lista
function ConvSessionsTickets({ chat }: { chat: Chat }) {
  const Overline = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 600, color: C.t3, letterSpacing: .4, textTransform: 'uppercase', padding: '8px 8px 6px' }}>
      <MS name={icon} size={13} color={C.t3} /> {children}
    </div>
  )
  if (chat.source === 'flows') {
    return (
      <div style={{ margin: '2px 8px 6px', padding: '4px 4px 6px', background: C.convBg, borderRadius: 12 }}>
        <Overline icon="account_tree">Sesiones · Botmaker 2.0</Overline>
        {chat.sessions.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, cursor: 'pointer', background: s.active ? C.shell : 'transparent', boxShadow: s.active ? '0 1px 2px rgba(0,0,0,.05)' : 'none', marginBottom: 2 }}
            onMouseEnter={e => { if (!s.active) e.currentTarget.style.background = C.hover }} onMouseLeave={e => { if (!s.active) e.currentTarget.style.background = 'transparent' }}>
            <MS name="subdirectory_arrow_right" size={17} color={s.active ? C.primary : C.t3} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink }}>{s.date}</div>
              <div style={{ fontSize: 11, color: C.t2, marginTop: 1 }}>{s.active ? <span style={{ color: C.ok, fontWeight: 500 }}>● En curso</span> : `${s.when} · ${s.msgs} msgs`}</div>
            </div>
            {s.score && <span style={{ fontSize: 11, fontWeight: 600, color: scoreTone(s.score).fg, background: scoreTone(s.score).bg, borderRadius: 999, padding: '2px 8px' }}>{s.score}</span>}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ margin: '2px 8px 6px', padding: '4px 4px 6px', background: C.convBg, borderRadius: 12 }}>
      <Overline icon="confirmation_number">Tickets · Agentes de IA</Overline>
      {chat.tickets.map(t => {
        const unassigned = t.reviewer === 'Sin asignar'
        return (
          <div key={t.id} onClick={() => { window.location.hash = 'tickets' }} title="Abrir en Tickets" style={{ background: C.shell, borderRadius: 10, border: `1px solid ${C.border}`, padding: '10px 11px', marginBottom: 6, cursor: 'pointer', transition: 'box-shadow .12s, border-color .12s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,28,70,.08)'; e.currentTarget.style.borderColor = '#D8DBE2' }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: C.t3, fontFamily: MONO }}>{t.id}</span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: 10.5, color: C.t3 }}>{t.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.agentColor, fontWeight: 500 }}><MS name="smart_toy" size={13} color={t.agentColor} /> {t.agent}</span>
              <div style={{ flex: 1 }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.ink, background: t.stateColor + '1A', borderRadius: 999, padding: '1px 8px' }}><span style={{ width: 5, height: 5, borderRadius: 999, background: t.stateColor }} /> {t.state}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.borderSoft}` }}>
              <span style={{ fontSize: 10.5, color: C.t3 }}>Revisa</span>
              {unassigned ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.t3 }}>
                  <span style={{ width: 19, height: 19, borderRadius: 999, border: `1.5px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="person" size={12} color={C.t3} /></span>
                  Sin asignar
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.ink, fontWeight: 500 }}>
                  <span style={{ width: 19, height: 19, borderRadius: 999, background: t.reviewerColor, color: '#fff', fontSize: 9.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.reviewer[0]}</span>
                  {t.reviewer}
                </span>
              )}
              <div style={{ flex: 1 }} />
              <MS name="chevron_right" size={16} color={C.t3} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ConvList({ folder, selectedId, onSelect, pinnedIds, onTogglePin, noExpand }: { folder: string; selectedId: string; onSelect: (id: string) => void; pinnedIds: string[]; onTogglePin: (id: string) => void; noExpand?: boolean }) {
  const [hovered, setHovered] = useState('')
  const [open, setOpen] = useState(true) // panel de sesiones/tickets del chat seleccionado
  useEffect(() => { setOpen(true) }, [selectedId]) // al cambiar de chat, se abre; reapretar el mismo lo colapsa
  const base = folder === 'aprobar' ? CHATS.filter(c => c.hitl?.kind === 'aprobar')
    : folder === 'revisar' ? CHATS.filter(c => c.hitl?.kind === 'revisar')
    : CHATS
  const hitlView = folder === 'aprobar' || folder === 'revisar'
  // Fijados arriba
  const list = [...base.filter(c => pinnedIds.includes(c.id)), ...base.filter(c => !pinnedIds.includes(c.id))]
  return (
    <div style={{ width: 304, flexShrink: 0, background: C.shell, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 10px' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{FOLDER_TITLE[folder] ?? 'Tu bandeja'}</span>
        <button style={{ display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, color: C.t2 }}>Recientes <MS name="keyboard_arrow_down" size={15} color={C.t3} /></button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px 10px' }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: C.ink }}>{base.length} abiertas</span>
        <MS name="keyboard_arrow_down" size={15} color={C.t3} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 10px' }}>
        {list.map(c => {
          const sel = selectedId === c.id
          const pinned = pinnedIds.includes(c.id)
          const showPin = pinned || hovered === c.id
          return (
            <div key={c.id}>
              <div onClick={() => { if (sel) setOpen(o => !o); else onSelect(c.id) }} onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered('')}
                style={{ display: 'flex', gap: 11, padding: '11px 12px 11px 14px', margin: '0 8px 2px', borderRadius: 10, cursor: 'pointer', background: sel ? C.sel : hovered === c.id ? C.hover : 'transparent', transition: 'background .1s' }}>
                <Avatar chat={c} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: c.unread ? 600 : 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    {c.flag && <span style={{ fontSize: 12, flexShrink: 0 }}>{c.flag}</span>}
                    <div style={{ flex: 1 }} />
                    {showPin
                      ? <button onClick={e => { e.stopPropagation(); onTogglePin(c.id) }} title={pinned ? 'Desfijar' : 'Fijar'} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
                          <MS name="keep" size={15} color={pinned ? C.primary : C.t3} fill={pinned ? 1 : 0} />
                        </button>
                      : <span style={{ fontSize: 11.5, color: c.unread ? C.primary : C.t3, fontWeight: c.unread ? 600 : 400, flexShrink: 0 }}>{c.time}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    {hitlView && c.hitl
                      ? <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.t2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MS name={c.hitl.kind === 'aprobar' ? 'verified_user' : 'rate_review'} size={13} color={C.primary} />{c.hitl.action}</span>
                      : <span style={{ flex: 1, fontSize: 12.5, color: c.unread ? C.ink : C.t2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</span>}
                    {c.score && <span style={{ fontSize: 11, fontWeight: 600, color: scoreTone(c.score).fg, background: scoreTone(c.score).bg, borderRadius: 999, padding: '1px 7px', flexShrink: 0 }}>{c.score}</span>}
                    {!!c.unread && <span style={{ minWidth: 17, height: 17, borderRadius: 999, background: C.primary, color: '#fff', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>{c.unread}</span>}
                  </div>
                </div>
              </div>
              {/* Al seleccionar: se expanden sus sesiones/tickets con animación (reapretar colapsa) */}
              {sel && !noExpand && <ExpandPanel open={open}><ConvSessionsTickets chat={c} /></ExpandPanel>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSACIÓN — tematizada por canal
// ─────────────────────────────────────────────────────────────────────────────
function Conversation({ chat, onTogglePanel, panelOpen, onOpenAssistant, assistantActive }: { chat: Chat; onTogglePanel: () => void; panelOpen: boolean; onOpenAssistant: () => void; assistantActive: boolean }) {
  const [msg, setMsg] = useState('')
  const [orbHover, setOrbHover] = useState(false)
  const th = CH[chat.channel]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: th.chatBg, position: 'relative' }}>
      {/* Orb flotante del Asistente de IA — atajo que abre el panel derecho en su tab (no tapa nada) */}
      {!assistantActive && (
        <div style={{ position: 'absolute', bottom: 92, right: 20, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10 }}
          onMouseEnter={() => setOrbHover(true)} onMouseLeave={() => setOrbHover(false)}>
          {orbHover && <span style={{ background: C.shell, border: `1px solid ${C.border}`, borderRadius: 999, padding: '7px 13px', fontSize: 12.5, fontWeight: 500, color: C.ink, boxShadow: '0 4px 14px rgba(20,28,70,.12)', whiteSpace: 'nowrap', animation: 'bmFadeUp .18s ease both' }}>Asistente de IA</span>}
          <button onClick={onOpenAssistant} title="Asistente de IA" style={{ border: 'none', cursor: 'pointer', padding: 0, background: 'transparent', borderRadius: 16, boxShadow: orbHover ? '0 8px 24px rgba(48,79,254,.38)' : '0 4px 14px rgba(48,79,254,.22)', transform: orbHover ? 'scale(1.06)' : 'none', transition: 'box-shadow .15s, transform .15s' }}>
            <Orb size={50} radius={15} />
          </button>
        </div>
      )}
      {/* Header (blanco, con el canal indicado) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', height: 56, background: C.shell, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Avatar chat={chat} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name}</span>
            {chat.flag && <span style={{ fontSize: 12.5, flexShrink: 0 }}>{chat.flag}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.t2 }}>
              <span style={{ display: 'inline-flex' }}><ChannelLogo channel={chat.channel} size={13} /></span> {th.name}
            </span>
          </div>
        </div>
        <CircBtn name="star" size={19} />
        <CircBtn name="more_horiz" size={19} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 15px', borderRadius: 999, border: 'none', background: C.dark, color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, marginLeft: 2, flexShrink: 0 }}>
          <MS name="check" size={16} color="#fff" /> Cerrar
        </button>
        {!panelOpen && <CircBtn name="right_panel_open" size={18} onClick={onTogglePanel} active />}
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,.5)', background: 'rgba(255,255,255,.75)', border: '1px solid rgba(0,0,0,.06)', borderRadius: 999, padding: '4px 13px' }}>Hoy</span>
          </div>
          {chat.messages.map((m, i) => {
            const me = m.from !== 'cliente'
            const bg = me ? (th.sentGradient ? `linear-gradient(135deg,${th.sentGradient[0]},${th.sentGradient[1]},${th.sentGradient[2]})` : th.sentBg) : th.recvBg
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', marginBottom: 12, animation: 'bmFadeUp .28s ease both', animationDelay: `${i * 50}ms` }}>
                <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: me ? '16px 16px 5px 16px' : '16px 16px 16px 5px', background: bg, color: me ? th.sentText : th.recvText, fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 1.5px rgba(0,0,0,.08)' }}>{m.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,.45)' }}>{me ? (m.from === 'bot' ? 'Bot' : 'Vos') : chat.name.split(' ')[0]} · {m.time}</span>
                  {me && <MS name="done_all" size={14} color={th.tick} fill={0} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Composer — card flotante */}
      <div style={{ padding: '0 28px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', background: C.shell, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px 4px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink }}>
              <MS name="reply" size={16} color={C.ink} /> Responder <MS name="keyboard_arrow_down" size={15} color={C.t3} />
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.t2 }}>
              <ChannelLogo channel={chat.channel} size={13} /> Respondés por {th.name}
            </span>
          </div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2}
            placeholder='Escribí un mensaje · usá ⌘K para respuestas rápidas'
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 14, color: C.ink, fontFamily: FONT, lineHeight: 1.5, padding: '4px 16px 8px', boxSizing: 'border-box', background: 'transparent' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px 10px' }}>
            <CircBtn name="bolt" size={18} />
            <CircBtn name="attach_file" size={18} />
            <CircBtn name="sentiment_satisfied" size={18} />
            <CircBtn name="auto_awesome" size={18} />
            <div style={{ flex: 1 }} />
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 16px', borderRadius: 999, border: 'none', background: msg.trim() ? C.primary : C.sel, color: msg.trim() ? '#fff' : C.t3, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, transition: 'background .12s' }}>
              Enviar <MS name="keyboard_arrow_down" size={15} color={msg.trim() ? '#fff' : C.t3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL DERECHO — Perfil (con Sesiones/Tickets según origen) | Asistente de IA
// ─────────────────────────────────────────────────────────────────────────────
function Section({ label, action, children }: { label: string; action?: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: children ? 8 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{label}</span>
        {action && <MS name={action} size={17} color={C.t3} />}
      </div>
      {children}
    </div>
  )
}

function ProfileTab({ chat }: { chat: Chat }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 18px 16px', borderBottom: `1px solid ${C.borderSoft}` }}>
        <Avatar chat={chat} size={56} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginTop: 10 }}>{chat.name} {chat.flag}</div>
        <div style={{ fontSize: 11.5, color: C.t3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          <ChannelLogo channel={chat.channel} size={13} /> {CH[chat.channel].name} · última sesión hoy
        </div>
      </div>
      <Section label="Datos del contacto" action="edit">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}><span style={{ color: C.t3 }}>Nombre</span><span style={{ color: C.ink }}>{chat.name}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}><span style={{ color: C.t3 }}>Equipo</span><span style={{ color: C.ink }}>{chat.sub}</span></div>
      </Section>
      {/* Sesiones (Botmaker 2.0) o Tickets (Agentes de IA) según el origen */}
      {chat.source === 'agents' ? (
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Tickets asociados</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.primary, background: C.primaryL, borderRadius: 999, padding: '1px 8px' }}>{chat.tickets.length}</span>
          </div>
          {chat.tickets.map(t => (
            <div key={t.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 11px', marginBottom: 7, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.convBg }} onMouseLeave={e => { e.currentTarget.style.background = C.shell }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: C.t3, fontFamily: MONO }}>{t.id}</span>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.agentColor, fontWeight: 500 }}><MS name="smart_toy" size={12} color={t.agentColor} /> {t.agent}</span>
                <div style={{ flex: 1 }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.ink, background: t.stateColor + '1A', borderRadius: 999, padding: '1px 8px' }}><span style={{ width: 5, height: 5, borderRadius: 999, background: t.stateColor }} /> {t.state}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Sesiones</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.primary, background: C.primaryL, borderRadius: 999, padding: '1px 8px' }}>{chat.sessions.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.t3, marginBottom: 8 }}>
            <MS name="account_tree" size={13} color={C.t3} /> Chat de Botmaker 2.0 (flujos manuales)
          </div>
          {chat.sessions.map(s => (
            <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 11px', marginBottom: 7 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink }}>{s.date}</div>
              <div style={{ fontSize: 11, color: C.t2, marginTop: 3 }}>{s.active ? <span style={{ color: C.ok, fontWeight: 500 }}>● En curso</span> : `${s.when} · ${s.msgs} mensajes`}</div>
            </div>
          ))}
        </div>
      )}
      <Section label="Notas" action="add" />
      <Section label="Etiquetas" action="add" />
      <Section label="Variables" action="add" />
    </div>
  )
}

// ── AI Engine — streaming + contextual replies ────────────────────────────────
type AIMsg2 = { role: 'user' | 'ai'; text: string }

function TypingDots2() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 18 }}>
      {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: C.t3, animation: `bmTyping 1s ${i * 0.18}s infinite` }} />)}
    </span>
  )
}

function genAIReply(q: string, chat: Chat): string {
  const lower = q.toLowerCase()
  const fn = chat.name.split(' ')[0]
  if (lower.includes('aprov') || lower.includes('confirmar') || lower.includes('ejecutar')) {
    return chat.hitl
      ? `Plan para aprobar el caso de ${fn}:\n${chat.hitl.plan.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nVerificaciones realizadas: ${chat.hitl.checks}.\n\nTodo listo. Si aprobás, el agente ejecuta el plan automáticamente y cierra el caso.`
      : `No hay acciones HITL pendientes en este chat por ahora.`
  }
  if (lower.includes('resumi') || lower.includes('contexto') || lower.includes('estado')) {
    return chat.hitl
      ? `Resumen del caso: ${chat.hitl.summary}\n\nAgente responsable: ${chat.hitl.agent}\nAcción propuesta: "${chat.hitl.action}"\nVerificaciones: ${chat.hitl.checks}`
      : `${fn} tiene ${chat.messages.length} mensajes en la sesión activa. Último mensaje: "${chat.messages[chat.messages.length - 1]?.text ?? '—'}". Sin acciones HITL pendientes.`
  }
  if (lower.includes('respond') || lower.includes('redact') || lower.includes('respuesta') || lower.includes('sugerir') || lower.includes('mensaje')) {
    return chat.hitl
      ? `Hola ${fn}! Tu solicitud fue procesada. ${chat.hitl.action.replace(/·/g, ',').toLowerCase()}. Te enviamos la confirmación en breve. ¿Necesitás algo más?`
      : `Hola ${fn}! Revisé tu consulta y ya estoy en eso. Dame un momento para darte la respuesta más completa. ¿Hay algo más que quieras agregar antes de que te responda?`
  }
  if (lower.includes('analiz') || lower.includes('caso') || lower.includes('detalle') || lower.includes('plan')) {
    return chat.hitl
      ? `Análisis del caso:\n\nEste ticket requiere ${chat.hitl.kind === 'aprobar' ? 'una aprobación' : 'revisión manual'} porque ${chat.hitl.summary.toLowerCase()}\n\nEl agente ${chat.hitl.agent} ya verificó: ${chat.hitl.checks}.\n\nRecomendación: ${chat.hitl.kind === 'aprobar' ? 'aprobar directamente, los checks están verificados' : 'revisar el detalle antes de confirmar'}.`
      : `Chat de ${fn}: ${chat.source === 'agents' ? 'originado por un Agente de IA' : 'viene de un flujo de Botmaker 2.0'}. ${chat.tickets.length} tickets asociados. Sin acciones HITL pendientes — podés responder directamente o esperar al agente.`
  }
  if (lower.includes('nota') || lower.includes('interno') || lower.includes('comentar')) {
    return `Nota interna sugerida para el caso de ${fn}:\n\n"${chat.hitl?.summary ?? `Cliente contactó para ${chat.messages[0]?.text?.slice(0, 60) ?? 'consulta'}.`} ${chat.hitl ? `Agente ${chat.hitl.agent} tiene el plan listo. Pendiente de aprobación.` : 'Caso en atención.'}"\n\n¿La guardo o querés ajustar algo?`
  }
  if (lower.includes('document') || lower.includes('buscar') || lower.includes('info') || lower.includes('artículo')) {
    return `Encontré 3 artículos relevantes en la documentación de Botmaker:\n\n1. "Cómo funciona el HITL y cuándo intervenir"\n2. "Agentes de IA: flujos de aprobación paso a paso"\n3. "Métricas de calidad de conversaciones"\n\n¿Querés que te resuma alguno o te paso el link directo?`
  }
  return chat.hitl
    ? `Basándome en el caso de ${fn}: ${chat.hitl.summary} Llevás ${chat.hitl.time} en este estado — recomiendo actuar ahora. ¿Aprobás el plan o querés ajustar algo antes?`
    : `Entendido. Para el chat de ${fn} puedo: resumir la conversación, redactar una respuesta, analizar el caso o buscar info en la documentación. ¿Qué necesitás?`
}

function CopilotPanel({ chat, done, onDone, compMode }: { chat: Chat; done: boolean; onDone: () => void; compMode: 'ai' | 'direct' }) {
  const [thread, setThread] = useState<AIMsg2[]>([])
  const [q, setQ] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fn = chat.name.split(' ')[0]
  const ch = CH[chat.channel]

  const streamWords = useCallback((text: string, onFinish?: () => void) => {
    const words = text.split(' '); let i = 0; let built = ''
    setStreaming(true); setStreamText('')
    const tick = () => {
      if (i >= words.length) { setStreaming(false); onFinish?.(); return }
      built += (i > 0 ? ' ' : '') + words[i++]
      setStreamText(built)
      streamRef.current = setTimeout(tick, 36 + Math.random() * 28)
    }
    tick()
  }, [])

  const ask = useCallback((question: string) => {
    if (!question.trim() || streaming) return
    const reply = genAIReply(question, chat)
    setThread(t => [...t, { role: 'user', text: question }, { role: 'ai', text: '' }])
    setQ('')
    setTimeout(() => {
      streamWords(reply, () => {
        setThread(t => { const c = [...t]; c[c.length - 1] = { role: 'ai', text: reply }; return c })
        setStreamText('')
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      })
    }, 520)
  }, [streaming, streamWords, chat])

  const sendDirect = useCallback(() => {
    if (!q.trim()) return
    const sent = q
    setThread(t => [...t, { role: 'user', text: `✉️ Enviado a ${fn} por ${ch.name}: "${sent}"` }])
    setQ('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [q, fn, ch.name])

  const send = useCallback(() => {
    if (compMode === 'ai') ask(q)
    else sendDirect()
  }, [compMode, q, ask, sendDirect])

  useEffect(() => {
    if (streamRef.current) clearTimeout(streamRef.current)
    setThread([]); setStreaming(false); setStreamText(''); setQ('')
    const greeting = done
      ? `Acción aprobada. El caso de ${fn} quedó cerrado. ¿Necesitás algo más?`
      : chat.hitl
      ? `Tengo el contexto listo. ${chat.hitl.agent} necesita tu ${chat.hitl.kind === 'aprobar' ? 'aprobación' : 'revisión'} para: "${chat.hitl.action}". ${chat.hitl.checks}. ¿Aprobás directamente o querés revisar el plan?`
      : `Hola! Estoy revisando el chat de ${fn}. Tengo acceso a la conversación completa${chat.tickets.length ? ` y ${chat.tickets.length} ticket${chat.tickets.length > 1 ? 's' : ''} asociado${chat.tickets.length > 1 ? 's' : ''}` : ''}. ¿Por dónde empezamos?`
    setTimeout(() => {
      setThread([{ role: 'ai', text: '' }])
      streamWords(greeting, () => { setThread([{ role: 'ai', text: greeting }]); setStreamText('') })
    }, 380)
    return () => { if (streamRef.current) clearTimeout(streamRef.current) }
  }, [chat.id]) // eslint-disable-line

  useEffect(() => () => { if (streamRef.current) clearTimeout(streamRef.current) }, [])

  type ChipDef = [string, string, string | (() => void)]
  const CHIPS: ChipDef[] = chat.hitl && !done
    ? chat.hitl.kind === 'aprobar'
      ? [['Aprobar ahora', 'check_circle', onDone], ['Ver el plan', 'list', 'Ver el plan completo de acción'], ['Redactar respuesta', 'edit_note', 'Sugerir una respuesta para el cliente'], ['Resumir', 'summarize', 'Resumir el caso']]
      : [['Aprobar revisión', 'verified', onDone], ['Redactar respuesta', 'edit_note', 'Sugerir una respuesta para el cliente'], ['Analizar en detalle', 'psychology', 'Analizar el caso en detalle'], ['Nota interna', 'edit', 'Redactar una nota interna']]
    : [['Resumir', 'summarize', 'Resumir la conversación'], ['Redactar respuesta', 'edit_note', 'Sugerir una respuesta'], ['Analizar caso', 'psychology', 'Analizar el caso'], ['Buscar en docs', 'menu_book', 'Buscar en la documentación']]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 4px' }}>
        {/* Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {thread.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'bmFadeUp .22s ease both' }}>
              {m.role === 'ai' && i > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <Orb size={15} radius={4} /><span style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>Asistente</span>
                </div>
              )}
              <div style={{ maxWidth: '93%', padding: '10px 13px', borderRadius: m.role === 'user' ? '13px 13px 4px 13px' : '4px 13px 13px 13px', background: m.role === 'user' ? C.primaryL : C.convBg, border: `1px solid ${m.role === 'user' ? C.primaryL : C.border}`, fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {m.role === 'ai' && i === thread.length - 1 && streaming
                  ? <>{streamText || ''}<span style={{ display: 'inline-block', width: 2, height: 12, background: C.primary, borderRadius: 1, marginLeft: 2, verticalAlign: 'middle', animation: 'pulse-dot .6s infinite' }} /></>
                  : m.role === 'ai' && i === thread.length - 1 && !m.text ? <TypingDots2 /> : m.text}
              </div>
            </div>
          ))}
        </div>
        {/* Chips */}
        {!streaming && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
            {CHIPS.map(([label, icon, action], i) => {
              const isPrimary = typeof action === 'function'
              return (
                <button key={i} onClick={() => typeof action === 'function' ? action() : ask(action)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: `1.5px solid ${isPrimary ? C.primary : C.border}`, background: isPrimary ? C.primaryL : C.shell, cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 500, color: isPrimary ? C.primary : C.ink, transition: 'border-color .12s, transform .1s, box-shadow .12s', animation: `bmFadeUp .3s ease ${i * 55}ms both` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(48,79,254,.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = isPrimary ? C.primary : C.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  <MS name={icon} size={14} color={isPrimary ? C.primary : C.t2} weight={500} />{label}
                </button>
              )
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer flotante */}
      <div style={{ padding: '10px 14px 14px', flexShrink: 0 }}>
        <div style={{ background: C.shell, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 4px 16px rgba(20,28,70,.09)', overflow: 'hidden' }}>
          {compMode === 'direct' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 6px', borderBottom: `1px solid ${C.borderSoft}` }}>
              <ChannelLogo channel={chat.channel} size={14} />
              <span style={{ fontSize: 12, color: C.t2 }}>Respondés por {ch.name} directamente a {fn}</span>
            </div>
          )}
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={compMode === 'ai' ? `Preguntale al Asistente sobre ${fn}…` : `Escribí tu respuesta directa a ${fn}…`}
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 13.5, color: C.ink, fontFamily: FONT, lineHeight: 1.5, padding: '11px 14px 7px', boxSizing: 'border-box', background: 'transparent' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 10px 10px' }}>
            {compMode === 'ai'
              ? <><CircBtn name="auto_awesome" size={17} /><CircBtn name="menu_book" size={17} /></>
              : <><CircBtn name="bolt" size={17} /><CircBtn name="attach_file" size={17} /><CircBtn name="sentiment_satisfied" size={17} /></>
            }
            <div style={{ flex: 1 }} />
            <button onClick={send} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 15px', borderRadius: 999, border: 'none', background: q.trim() ? C.primary : C.sel, color: q.trim() ? '#fff' : C.t3, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, transition: 'background .12s' }}>
              {compMode === 'ai' ? 'Preguntar' : 'Enviar'} <MS name="keyboard_arrow_down" size={14} color={q.trim() ? '#fff' : C.t3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RightPanel({ chat, onToggle, done, onDone, tab, onTab }: { chat: Chat; onToggle: () => void; done: boolean; onDone: () => void; tab: 'perfil' | 'copilot'; onTab: (t: 'perfil' | 'copilot') => void }) {
  const setTab = onTab
  return (
    <div style={{ width: 340, flexShrink: 0, background: C.shell, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', height: 48, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {([['perfil', 'Perfil'], ['copilot', 'Asistente de IA']] as const).map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 47, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: tab === id ? C.ink : C.t2, fontWeight: tab === id ? 600 : 400, borderBottom: tab === id ? `2px solid ${C.primary}` : '2px solid transparent', position: 'relative' }}>
            {id === 'copilot' && <Orb size={16} radius={5} />}{lbl}
            {id === 'copilot' && chat.hitl && !done && <span style={{ width: 6, height: 6, borderRadius: 999, background: C.primary }} />}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <CircBtn name="right_panel_close" size={18} onClick={onToggle} />
      </div>
      {tab === 'copilot' ? <CopilotPanel chat={chat} done={done} onDone={onDone} compMode="ai" /> : <ProfileTab chat={chat} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatsView() {
  const [folder, setFolder] = useState('tu')
  const [selectedId, setSelectedId] = useState('c1')
  const [panelOpen, setPanelOpen] = useState(true)
  const [foldersOpen, setFoldersOpen] = useState(true)
  const [doneIds, setDoneIds] = useState<string[]>([])
  const [pinnedIds, setPinnedIds] = useState<string[]>(['c1'])
  const [rightTab, setRightTab] = useState<'perfil' | 'copilot'>('copilot')
  const chat = CHATS.find(c => c.id === selectedId) ?? CHATS[0]
  const togglePin = (id: string) => setPinnedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  // Al cambiar de chat, el panel arranca en Asistente si hay algo pendiente (HITL), si no en Perfil
  useEffect(() => { setRightTab(chat.hitl ? 'copilot' : 'perfil') }, [selectedId]) // eslint-disable-line
  const openAssistant = () => { setPanelOpen(true); setRightTab('copilot') }

  return (
    <div style={{ height: '100vh', background: C.shell, fontFamily: FONT, color: C.ink, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <FoldersNav folder={folder} setFolder={setFolder} open={foldersOpen} onToggle={() => setFoldersOpen(o => !o)} />
        <ConvList folder={folder} selectedId={selectedId} onSelect={setSelectedId} pinnedIds={pinnedIds} onTogglePin={togglePin} />
        <Conversation chat={chat} panelOpen={panelOpen} onTogglePanel={() => setPanelOpen(true)} onOpenAssistant={openAssistant} assistantActive={panelOpen && rightTab === 'copilot'} />
        {panelOpen && <RightPanel key={selectedId} chat={chat} onToggle={() => setPanelOpen(false)} done={doneIds.includes(chat.id)} onDone={() => setDoneIds(d => [...d, chat.id])} tab={rightTab} onTab={setRightTab} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OPCIÓN DIFERENTE — perfil y tickets como tabs dentro del chat · IA dedicada
// ─────────────────────────────────────────────────────────────────────────────
type ChatTab = 'conv' | 'perfil' | 'historial'

// Mensajes + composer (sin header ni orb) — reutilizado en ChatsDiferente
function ConvArea({ chat }: { chat: Chat }) {
  const [msg, setMsg] = useState('')
  const th = CH[chat.channel]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: th.chatBg }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,.5)', background: 'rgba(255,255,255,.75)', border: '1px solid rgba(0,0,0,.06)', borderRadius: 999, padding: '4px 13px' }}>Hoy</span>
          </div>
          {chat.messages.map((m, i) => {
            const me = m.from !== 'cliente'
            const bg = me ? (th.sentGradient ? `linear-gradient(135deg,${th.sentGradient[0]},${th.sentGradient[1]},${th.sentGradient[2]})` : th.sentBg) : th.recvBg
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', marginBottom: 12, animation: 'bmFadeUp .28s ease both', animationDelay: `${i * 50}ms` }}>
                <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: me ? '16px 16px 5px 16px' : '16px 16px 16px 5px', background: bg, color: me ? th.sentText : th.recvText, fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 1.5px rgba(0,0,0,.08)' }}>{m.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,.45)' }}>{me ? (m.from === 'bot' ? 'Bot' : 'Vos') : chat.name.split(' ')[0]} · {m.time}</span>
                  {me && <MS name="done_all" size={14} color={th.tick} fill={0} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '0 28px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: 660, margin: '0 auto', background: C.shell, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px 4px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink }}>
              <MS name="reply" size={16} color={C.ink} /> Responder <MS name="keyboard_arrow_down" size={15} color={C.t3} />
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.t2 }}>
              <ChannelLogo channel={chat.channel} size={13} /> Respondés por {CH[chat.channel].name}
            </span>
          </div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2}
            placeholder='Escribí un mensaje · usá ⌘K para respuestas rápidas'
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 14, color: C.ink, fontFamily: FONT, lineHeight: 1.5, padding: '4px 16px 8px', boxSizing: 'border-box', background: 'transparent' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px 10px' }}>
            <CircBtn name="bolt" size={18} /><CircBtn name="attach_file" size={18} /><CircBtn name="sentiment_satisfied" size={18} /><CircBtn name="auto_awesome" size={18} />
            <div style={{ flex: 1 }} />
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 16px', borderRadius: 999, border: 'none', background: msg.trim() ? C.primary : C.sel, color: msg.trim() ? '#fff' : C.t3, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 600, transition: 'background .12s' }}>
              Enviar <MS name="keyboard_arrow_down" size={15} color={msg.trim() ? '#fff' : C.t3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sesiones o tickets del chat como contenido de tab (versión lista expandida)
function HistorialContent({ chat }: { chat: Chat }) {
  if (chat.source === 'flows') return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <MS name="account_tree" size={20} color={C.primary} weight={500} />
        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>Sesiones · Botmaker 2.0</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.primary, background: C.primaryL, borderRadius: 999, padding: '1px 8px', marginLeft: 2 }}>{chat.sessions.length}</span>
      </div>
      {chat.sessions.map(s => (
        <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 15px', marginBottom: 8, background: s.active ? C.primaryL + '55' : C.shell, cursor: 'pointer' }}
          onMouseEnter={e => { if (!s.active) e.currentTarget.style.background = C.hover }} onMouseLeave={e => { if (!s.active) e.currentTarget.style.background = C.shell }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{s.date}</div>
          <div style={{ fontSize: 11.5, color: C.t2, marginTop: 4 }}>{s.active ? <span style={{ color: C.ok, fontWeight: 600 }}>● En curso</span> : `${s.when} · ${s.msgs} mensajes`}</div>
          {s.score && <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 600, color: scoreTone(s.score).fg, background: scoreTone(s.score).bg, borderRadius: 999, padding: '2px 10px' }}>{s.score}</span>}
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <MS name="confirmation_number" size={20} color={C.primary} weight={500} />
        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>Tickets · Agentes de IA</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.primary, background: C.primaryL, borderRadius: 999, padding: '1px 8px', marginLeft: 2 }}>{chat.tickets.length}</span>
      </div>
      {chat.tickets.map(t => {
        const unassigned = t.reviewer === 'Sin asignar'
        return (
          <div key={t.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 15px', marginBottom: 10, cursor: 'pointer', transition: 'box-shadow .12s, border-color .12s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,28,70,.08)'; e.currentTarget.style.borderColor = '#D8DBE2' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: C.t3, fontFamily: MONO }}>{t.id}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
              <span style={{ fontSize: 10.5, color: C.t3, flexShrink: 0 }}>{t.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.agentColor, fontWeight: 500 }}><MS name="smart_toy" size={13} color={t.agentColor} weight={500} /> {t.agent}</span>
              <div style={{ flex: 1 }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.ink, background: t.stateColor + '1A', borderRadius: 999, padding: '1px 8px' }}><span style={{ width: 5, height: 5, borderRadius: 999, background: t.stateColor }} /> {t.state}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.borderSoft}` }}>
              <span style={{ fontSize: 10.5, color: C.t3 }}>Revisa</span>
              {unassigned ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.t3 }}>
                  <span style={{ width: 19, height: 19, borderRadius: 999, border: `1.5px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MS name="person" size={12} color={C.t3} weight={500} /></span>
                  Sin asignar
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.ink, fontWeight: 500 }}>
                  <span style={{ width: 19, height: 19, borderRadius: 999, background: t.reviewerColor, color: '#fff', fontSize: 9.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.reviewer[0]}</span>
                  {t.reviewer}
                </span>
              )}
              <div style={{ flex: 1 }} />
              <MS name="chevron_right" size={16} color={C.t3} weight={500} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Columna del chat con tabs internos: Conversación | Perfil | Tickets/Sesiones
function ChatColumnDif({ chat, chatTab, onChatTab }: { chat: Chat; chatTab: ChatTab; onChatTab: (t: ChatTab) => void }) {
  const th = CH[chat.channel]
  const TABS: { id: ChatTab; label: string; icon: string }[] = [
    { id: 'conv', label: 'Conversación', icon: 'chat' },
    { id: 'perfil', label: 'Perfil', icon: 'person' },
    { id: 'historial', label: chat.source === 'agents' ? 'Tickets' : 'Sesiones', icon: chat.source === 'agents' ? 'confirmation_number' : 'account_tree' },
  ]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', height: 56, background: C.shell, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Avatar chat={chat} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name}</span>
            {chat.flag && <span style={{ fontSize: 12.5, flexShrink: 0 }}>{chat.flag}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: C.t2, display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <ChannelLogo channel={chat.channel} size={13} /> {th.name}
          </div>
        </div>
        <CircBtn name="star" size={19} />
        <CircBtn name="more_horiz" size={19} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 15px', borderRadius: 999, border: 'none', background: C.dark, color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
          <MS name="check" size={16} color="#fff" /> Cerrar
        </button>
      </div>
      {/* Tabs internos */}
      <div style={{ display: 'flex', background: C.shell, borderBottom: `1px solid ${C.border}`, padding: '0 10px', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => onChatTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 40, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: chatTab === t.id ? C.ink : C.t2, fontWeight: chatTab === t.id ? 600 : 400, borderBottom: chatTab === t.id ? `2px solid ${C.primary}` : '2px solid transparent', transition: 'color .12s' }}>
            <MS name={t.icon} size={16} color={chatTab === t.id ? C.primary : C.t3} weight={500} />{t.label}
          </button>
        ))}
      </div>
      {chatTab === 'conv' ? (
        <ConvArea chat={chat} />
      ) : chatTab === 'perfil' ? (
        <div style={{ flex: 1, overflowY: 'auto', background: C.shell }}><ProfileTab chat={chat} /></div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', background: C.shell }}><HistorialContent chat={chat} /></div>
      )}
    </div>
  )
}

// Panel derecho dedicado solo a la IA (sin tab de Perfil) — 420px
function AIOnlyPanel({ chat, done, onDone, onClose }: { chat: Chat; done: boolean; onDone: () => void; onClose: () => void }) {
  const [compMode, setCompMode] = useState<'ai' | 'direct'>('ai')
  const fn = chat.name.split(' ')[0]
  return (
    <div style={{ width: 420, flexShrink: 0, background: C.shell, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px 0 14px', height: 48, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Orb size={22} radius={7} />
        <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Asistente de IA</span>
        <div style={{ flex: 1 }} />
        {/* Toggle IA / Responder directo */}
        <div style={{ display: 'flex', background: C.convBg, borderRadius: 999, padding: 2, gap: 1, marginRight: 6 }}>
          {([['ai', 'IA', 'smart_toy'], ['direct', fn, 'reply']] as const).map(([mode, label, icon]) => (
            <button key={mode} onClick={() => setCompMode(mode as 'ai' | 'direct')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, border: 'none', background: compMode === mode ? C.shell : 'transparent', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: compMode === mode ? 600 : 400, color: compMode === mode ? C.ink : C.t2, boxShadow: compMode === mode ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              <MS name={icon} size={13} color={compMode === mode ? C.primary : C.t3} weight={500} />{label}
            </button>
          ))}
        </div>
        {chat.hitl && !done && (
          <span style={{ fontSize: 11, fontWeight: 600, color: C.warn, background: C.noteBg, borderRadius: 999, padding: '2px 9px', marginRight: 2, flexShrink: 0 }}>
            {chat.hitl.kind === 'aprobar' ? '●' : '●'}
          </span>
        )}
        <CircBtn name="right_panel_close" size={18} onClick={onClose} />
      </div>
      <CopilotPanel chat={chat} done={done} onDone={onDone} compMode={compMode} />
    </div>
  )
}

// Switcher pill entre Diferente y Disruptiva
function ViewSwitcher({ current }: { current: 'diferente' | 'disruptiva' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 38, background: C.convBg, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 6 }}>
      <span style={{ fontSize: 11.5, color: C.t3, fontWeight: 500 }}>Propuesta:</span>
      <div style={{ display: 'flex', background: C.shell, borderRadius: 999, border: `1px solid ${C.border}`, padding: 2, gap: 1 }}>
        {([['/chats-diferente', 'Diferente', 'diferente'], ['/chats-disruptiva', 'Disruptiva ⚡', 'disruptiva']] as const).map(([route, label, id]) => (
          <a key={id} href={route} style={{ textDecoration: 'none', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: current === id ? 600 : 400, color: current === id ? '#fff' : C.t2, background: current === id ? C.primary : 'transparent', transition: 'all .15s' }}>
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}

// Fila de metadata del ticket (Estado, Asignado, etc.)
function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
      <div style={{ fontSize: 11, color: C.t3, marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: .4 }}>{label}</div>
      {children}
    </div>
  )
}

// Vista de ticket como canal — tabs: HITL | Detalle | Conversación | Actividad
function TicketDetailCenter({ chat }: { chat: Chat }) {
  const [tab, setTab] = useState<'hitl' | 'detalle' | 'conv' | 'actividad'>('hitl')
  const tkt = chat.tickets[0]
  const TABS = [
    { id: 'hitl', label: 'Human in the Loop', icon: 'manage_accounts' },
    { id: 'detalle', label: 'Detalle', icon: 'info' },
    { id: 'conv', label: 'Conversación', icon: 'chat' },
    { id: 'actividad', label: 'Actividad', icon: 'history' },
  ]
  const HITL_ACTIONS = [
    { title: chat.hitl?.kind === 'aprobar' ? 'Aprobar y ejecutar' : 'Aprobar revisión', desc: chat.hitl?.action ?? '', icon: 'check_circle', primary: true },
    { title: 'Editar respuesta', desc: 'Ajustá la respuesta antes de enviarla al cliente.', icon: 'edit_note', primary: false },
    { title: 'Reasignar ticket', desc: 'Cambia el agente asignado a otro miembro del equipo.', icon: 'swap_horiz', primary: false },
    { title: 'Ver historial del cliente', desc: 'Consultá los mensajes anteriores para entender el contexto.', icon: 'history', primary: false },
  ]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.shell }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', height: 56, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <MS name="confirmation_number" size={20} color="#0D9488" fill={1} weight={500} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: C.ink }}>{chat.name}</span>
            {tkt && <span style={{ fontSize: 11, color: C.t3, fontFamily: MONO }}>ID {tkt.id}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: C.t2, display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            {tkt && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MS name="smart_toy" size={13} color={tkt.agentColor} weight={500} /> {tkt.agent}</span>}
            <span>·</span><span>{chat.sub}</span>
          </div>
        </div>
        {tkt && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: tkt.stateColor, background: tkt.stateColor + '18', borderRadius: 999, padding: '4px 12px', border: `1px solid ${tkt.stateColor}30`, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: tkt.stateColor }} />{tkt.state}
          </span>
        )}
        <CircBtn name="more_horiz" size={19} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 15px', borderRadius: 999, border: 'none', background: '#0D9488', color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
          <MS name="check" size={16} color="#fff" /> Resolver
        </button>
      </div>
      {/* 2 columnas: tabs+contenido (flex:1) + metadata (280px) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Izquierda: tabs + contenido */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 20px', flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 44, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: tab === t.id ? C.ink : C.t2, fontWeight: tab === t.id ? 600 : 400, borderBottom: tab === t.id ? `2px solid ${C.primary}` : '2px solid transparent', whiteSpace: 'nowrap' }}>
                <MS name={t.icon} size={15} color={tab === t.id ? C.primary : C.t3} weight={500} />{t.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {tab === 'hitl' && (
              <div>
                {chat.hitl && <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.6, background: C.convBg, borderRadius: 12, padding: '13px 16px', marginBottom: 16 }}>{chat.hitl.summary}</div>}
                {HITL_ACTIONS.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: i === 0 ? C.primaryL : C.shell, border: `1px solid ${i === 0 ? C.primary + '55' : C.border}`, borderRadius: 12, marginBottom: 8, cursor: 'pointer', transition: 'box-shadow .12s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 3px 10px rgba(20,28,70,.09)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <MS name={a.icon} size={20} color={i === 0 ? C.primary : C.t2} fill={i === 0 ? 1 : 0} weight={500} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: i === 0 ? C.primary : C.ink }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>{a.desc}</div>
                    </div>
                    <MS name="chevron_right" size={18} color={i === 0 ? C.primary : C.t3} weight={500} />
                  </div>
                ))}
              </div>
            )}
            {tab === 'detalle' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>Descripción</span>
                  <MS name="edit" size={15} color={C.t3} weight={500} />
                </div>
                <div style={{ background: C.convBg, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: C.t2, lineHeight: 1.6, marginBottom: 20 }}>{chat.hitl?.summary ?? 'Sin descripción.'}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>G</span></div>
                  <input placeholder="Escribí un comentario…" style={{ flex: 1, height: 38, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0 12px', fontSize: 13, color: C.ink, fontFamily: FONT, outline: 'none', background: C.shell }} />
                </div>
              </div>
            )}
            {tab === 'conv' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 11.5, color: C.t3, background: C.convBg, borderRadius: 999, padding: '4px 14px' }}>Conversación asociada al ticket</span>
                </div>
                {chat.messages.map((m, i) => {
                  const me = m.from !== 'cliente'
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', marginBottom: 12, animation: 'bmFadeUp .22s ease both', animationDelay: `${i * 40}ms` }}>
                      <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: me ? '16px 16px 5px 16px' : '16px 16px 16px 5px', background: me ? '#0D9488' : C.shell, color: me ? '#fff' : C.ink, fontSize: 13.5, lineHeight: 1.5, border: me ? 'none' : `1px solid ${C.border}`, boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>{m.text}</div>
                      <span style={{ fontSize: 10.5, color: C.t3, marginTop: 3 }}>{me ? 'Bot' : chat.name.split(' ')[0]} · {m.time}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {tab === 'actividad' && (
              <div>
                {[
                  { who: tkt?.agent ?? 'Agente de IA', action: 'La IA generó un resultado', time: 'Hoy 13:01', isBot: true },
                  { who: tkt?.reviewer ?? 'Revisor', action: 'Inició sesión HITL', time: 'Hoy 13:00', isBot: false },
                  { who: tkt?.agent ?? 'Agente de IA', action: 'La IA generó un resultado', time: 'Ayer 11:44', isBot: true },
                  { who: tkt?.reviewer ?? 'Revisor', action: 'Inició sesión HITL', time: 'Ayer 11:43', isBot: false },
                  { who: tkt?.agent ?? 'Agente de IA', action: 'Ticket creado por el agente de IA', time: 'Hace 3 días', isBot: true },
                ].map((a, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: a.isBot ? C.primaryL : '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {a.isBot ? <MS name="smart_toy" size={16} color={C.primary} weight={500} /> : <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED' }}>{(tkt?.reviewer?.[0] ?? 'R')}</span>}
                      </div>
                      {i < arr.length - 1 && <div style={{ width: 1, height: 22, background: C.border, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 16 }}>
                      <div style={{ fontSize: 13, color: C.ink }}><strong>{a.who}</strong> · {a.action}</div>
                      <div style={{ fontSize: 11.5, color: C.t3, marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Derecha: metadata del ticket (280px) */}
        <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', padding: '16px' }}>
          {tkt && (
            <>
              <MetaRow label="Estado">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: tkt.stateColor, background: tkt.stateColor + '18', borderRadius: 999, padding: '4px 10px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: tkt.stateColor }} />{tkt.state}
                </span>
              </MetaRow>
              <MetaRow label="Fecha de creación">
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.ink }}><MS name="calendar_today" size={13} color={C.t3} weight={500} /> {tkt.date}</div>
              </MetaRow>
              <MetaRow label="Asignado">
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: tkt.reviewerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>{tkt.reviewer[0]}</span></div>
                  <span style={{ fontSize: 12.5, color: C.ink }}>{tkt.reviewer}</span>
                </div>
              </MetaRow>
              <MetaRow label="Agente de IA">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: tkt.agentColor, fontWeight: 500 }}>
                  <MS name="smart_toy" size={14} color={tkt.agentColor} weight={500} /> {tkt.agent}
                </div>
              </MetaRow>
              <MetaRow label="Equipo de soporte">
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.t2 }}>
                  <MS name="groups" size={14} color={C.t3} weight={500} /> Sin asignar
                </div>
              </MetaRow>
            </>
          )}
          <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>Campos personalizados</span>
              <MS name="settings" size={16} color={C.t3} weight={500} />
            </div>
            {[['Horario', '9:30 hs'], ['Motivo', 'Control'], ['Plataforma', 'Webchat']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                <span style={{ fontSize: 12, color: C.t3 }}>{k}</span>
                <span style={{ fontSize: 12.5, color: C.ink }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Panel lateral de ticket para Disruptiva (conversación + detalle en 390px)
function TicketSidePanel({ chat }: { chat: Chat }) {
  const [tab, setTab] = useState<'conv' | 'detalle'>('conv')
  const tkt = chat.tickets[0]
  return (
    <div style={{ width: 390, flexShrink: 0, display: 'flex', flexDirection: 'column', background: C.shell, borderLeft: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', height: 56, background: C.shell, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <MS name="confirmation_number" size={18} color="#0D9488" fill={1} weight={500} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name}</div>
          <div style={{ fontSize: 11, color: C.t2, marginTop: 1 }}>{tkt?.id} · {chat.sub}</div>
        </div>
        {tkt && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: tkt.stateColor, background: tkt.stateColor + '18', borderRadius: 999, padding: '3px 9px', flexShrink: 0 }}><span style={{ width: 5, height: 5, borderRadius: 999, background: tkt.stateColor }} />{tkt.state}</span>}
      </div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 14px', flexShrink: 0 }}>
        {([['conv', 'Conversación', 'chat'], ['detalle', 'Detalle', 'info']] as const).map(([id, lbl, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 40, border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13, color: tab === id ? C.ink : C.t2, fontWeight: tab === id ? 600 : 400, borderBottom: tab === id ? `2px solid ${C.primary}` : '2px solid transparent' }}>
            <MS name={icon} size={15} color={tab === id ? C.primary : C.t3} weight={500} />{lbl}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'conv' ? (
          <div style={{ padding: '16px 16px' }}>
            {chat.messages.map((m, i) => {
              const me = m.from !== 'cliente'
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', marginBottom: 10, animation: 'bmFadeUp .22s ease both', animationDelay: `${i * 40}ms` }}>
                  <div style={{ maxWidth: '82%', padding: '9px 13px', borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: me ? '#0D9488' : C.convBg, color: me ? '#fff' : C.ink, fontSize: 13.5, lineHeight: 1.5, border: me ? 'none' : `1px solid ${C.border}` }}>{m.text}</div>
                  <span style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{me ? 'Bot' : chat.name.split(' ')[0]} · {m.time}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {tkt && (
              <>
                <MetaRow label="Estado"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: tkt.stateColor, background: tkt.stateColor + '18', borderRadius: 999, padding: '4px 10px' }}><span style={{ width: 5, height: 5, borderRadius: 999, background: tkt.stateColor }} />{tkt.state}</span></MetaRow>
                <MetaRow label="Fecha de creación"><div style={{ fontSize: 12.5, color: C.ink, display: 'flex', alignItems: 'center', gap: 5 }}><MS name="calendar_today" size={13} color={C.t3} weight={500} /> {tkt.date}</div></MetaRow>
                <MetaRow label="Asignado"><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 22, height: 22, borderRadius: 999, background: tkt.reviewerColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>{tkt.reviewer[0]}</span></div><span style={{ fontSize: 12.5, color: C.ink }}>{tkt.reviewer}</span></div></MetaRow>
                <MetaRow label="Agente de IA"><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: tkt.agentColor, fontWeight: 500 }}><MS name="smart_toy" size={14} color={tkt.agentColor} weight={500} /> {tkt.agent}</div></MetaRow>
                <MetaRow label="Equipo de soporte"><span style={{ fontSize: 12.5, color: C.t2 }}>Sin asignar</span></MetaRow>
                <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Campos personalizados</span>
                  {[['Horario', '9:30 hs'], ['Motivo', 'Control']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                      <span style={{ fontSize: 12, color: C.t3 }}>{k}</span><span style={{ fontSize: 12.5, color: C.ink }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatsDiferente() {
  const [folder, setFolder] = useState('tu')
  const [selectedId, setSelectedId] = useState('c1')
  const [aiPanelOpen, setAIPanelOpen] = useState(true)
  const [foldersOpen, setFoldersOpen] = useState(true)
  const [doneIds, setDoneIds] = useState<string[]>([])
  const [pinnedIds, setPinnedIds] = useState<string[]>(['c1'])
  const [chatTab, setChatTab] = useState<ChatTab>('conv')
  const chat = CHATS.find(c => c.id === selectedId) ?? CHATS[0]
  const togglePin = (id: string) => setPinnedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  useEffect(() => { setChatTab('conv') }, [selectedId])

  const isTicket = chat.channel === 'ticket'

  return (
    <div style={{ height: '100vh', background: C.shell, fontFamily: FONT, color: C.ink, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar />
      <ViewSwitcher current="diferente" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        <FoldersNav folder={folder} setFolder={setFolder} open={foldersOpen} onToggle={() => setFoldersOpen(o => !o)} />
        <ConvList folder={folder} selectedId={selectedId} onSelect={setSelectedId} pinnedIds={pinnedIds} onTogglePin={togglePin} noExpand />
        {isTicket
          ? <TicketDetailCenter key={selectedId} chat={chat} />
          : <ChatColumnDif key={selectedId} chat={chat} chatTab={chatTab} onChatTab={setChatTab} />
        }
        {!isTicket && (aiPanelOpen
          ? <AIOnlyPanel key={`ai-${selectedId}`} chat={chat} done={doneIds.includes(chat.id)} onDone={() => setDoneIds(d => [...d, chat.id])} onClose={() => setAIPanelOpen(false)} />
          : <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 20 }}>
              <button onClick={() => setAIPanelOpen(true)} title="Asistente de IA" style={{ border: 'none', cursor: 'pointer', background: 'none', padding: 0, boxShadow: '0 4px 14px rgba(48,79,254,.22)', borderRadius: 15 }}>
                <Orb size={50} radius={15} />
              </button>
            </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OPCIÓN DISRUPTIVA — IA en el centro · chat del usuario como panel derecho
// ─────────────────────────────────────────────────────────────────────────────

// Panel central: la IA es la protagonista
function AICenterPanel({ chat, done, onDone }: { chat: Chat; done: boolean; onDone: () => void }) {
  const [thread, setThread] = useState<AIMsg2[]>([])
  const [q, setQ] = useState('')
  const [compMode, setCompMode] = useState<'ai' | 'direct'>('ai')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fn = chat.name.split(' ')[0]
  const ch = CH[chat.channel]

  const streamWords = useCallback((text: string, onFinish?: () => void) => {
    const words = text.split(' '); let i = 0; let built = ''
    setStreaming(true); setStreamText('')
    const tick = () => {
      if (i >= words.length) { setStreaming(false); onFinish?.(); return }
      built += (i > 0 ? ' ' : '') + words[i++]
      setStreamText(built)
      streamRef.current = setTimeout(tick, 32 + Math.random() * 26)
    }
    tick()
  }, [])

  const ask = useCallback((question: string) => {
    if (!question.trim() || streaming) return
    const reply = genAIReply(question, chat)
    setThread(t => [...t, { role: 'user', text: question }, { role: 'ai', text: '' }])
    setQ('')
    setTimeout(() => {
      streamWords(reply, () => {
        setThread(t => { const c = [...t]; c[c.length - 1] = { role: 'ai', text: reply }; return c })
        setStreamText('')
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      })
    }, 500)
  }, [streaming, streamWords, chat])

  const sendDirect = useCallback(() => {
    if (!q.trim()) return
    setThread(t => [...t, { role: 'user', text: `✉️ Enviado a ${fn} por ${ch.name}: "${q}"` }])
    setQ('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [q, fn, ch.name])

  const send = useCallback(() => {
    if (compMode === 'ai') ask(q); else sendDirect()
  }, [compMode, q, ask, sendDirect])

  // Saludo proactivo + análisis automático al cambiar de chat
  useEffect(() => {
    if (streamRef.current) clearTimeout(streamRef.current)
    setThread([]); setStreaming(false); setStreamText(''); setQ(''); setCompMode('ai')
    const greeting = done
      ? `Acción aprobada y ejecutada. El caso de ${fn} quedó cerrado. ¿Necesitás algo más?`
      : chat.hitl
      ? `Tengo el caso listo. ${chat.hitl.agent} está esperando tu ${chat.hitl.kind === 'aprobar' ? 'aprobación' : 'revisión'}. Acción propuesta: "${chat.hitl.action}". Verificaciones completadas: ${chat.hitl.checks}. ¿Aprobás o querés revisar el plan completo?`
      : `Hola! Tomé el contexto del chat de ${fn}. ${chat.messages.length} mensajes en la sesión activa${chat.tickets.length ? `, ${chat.tickets.length} ticket${chat.tickets.length > 1 ? 's' : ''} asociado${chat.tickets.length > 1 ? 's' : ''}` : ''}. Sin acciones HITL pendientes. ¿Cómo puedo ayudarte a resolver este caso?`
    setTimeout(() => {
      setThread([{ role: 'ai', text: '' }])
      streamWords(greeting, () => {
        setThread([{ role: 'ai', text: greeting }])
        setStreamText('')
      })
    }, 360)
    return () => { if (streamRef.current) clearTimeout(streamRef.current) }
  }, [chat.id]) // eslint-disable-line

  useEffect(() => () => { if (streamRef.current) clearTimeout(streamRef.current) }, [])

  type ChipDef2 = [string, string, string | (() => void)]
  const CHIPS: ChipDef2[] = chat.hitl && !done
    ? chat.hitl.kind === 'aprobar'
      ? [['Aprobar y ejecutar', 'check_circle', onDone], ['Ver plan completo', 'list', 'Ver el plan completo de acción'], ['Redactar respuesta', 'edit_note', 'Sugerir una respuesta para el cliente'], ['Resumir', 'summarize', 'Resumir el caso']]
      : [['Aprobar revisión', 'verified', onDone], ['Redactar respuesta', 'edit_note', 'Sugerir una respuesta para el cliente'], ['Analizar en detalle', 'psychology', 'Analizar el caso en detalle'], ['Nota interna', 'edit', 'Redactar una nota interna']]
    : [['Resumir', 'summarize', 'Resumir la conversación'], ['Redactar respuesta', 'edit_note', 'Sugerir una respuesta'], ['Analizar el caso', 'psychology', 'Analizar el caso'], ['Nota interna', 'edit', 'Redactar una nota interna'], ['Buscar en docs', 'menu_book', 'Buscar en la documentación']]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.convBg }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 56, background: C.shell, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ animation: 'bmFloat 3.5s ease-in-out infinite', display: 'flex' }}><Orb size={32} radius={10} /></div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Asistente de IA</div>
          <div style={{ fontSize: 11, color: C.ok, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: C.ok }} /> En línea · {chat.hitl && !done ? 'acción pendiente' : done ? 'caso cerrado' : `chat de ${fn}`}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Toggle IA / Directo */}
        <div style={{ display: 'flex', background: C.convBg, borderRadius: 999, padding: 2, gap: 1, marginRight: 8 }}>
          {([['ai', 'Preguntar a la IA', 'smart_toy'], ['direct', `Responder a ${fn}`, 'reply']] as const).map(([mode, label, icon]) => (
            <button key={mode} onClick={() => setCompMode(mode as 'ai' | 'direct')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, border: 'none', background: compMode === mode ? C.shell : 'transparent', cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: compMode === mode ? 600 : 400, color: compMode === mode ? C.ink : C.t2, boxShadow: compMode === mode ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              <MS name={icon} size={14} color={compMode === mode ? C.primary : C.t3} weight={500} />{label}
            </button>
          ))}
        </div>
        {chat.hitl && !done && <span style={{ fontSize: 11, fontWeight: 600, color: C.warn, background: C.noteBg, borderRadius: 999, padding: '3px 12px', flexShrink: 0 }}>{chat.hitl.kind === 'aprobar' ? '● Aprobar' : '● Revisar'}</span>}
        {done && <span style={{ fontSize: 11, fontWeight: 600, color: C.ok, background: '#ECFDF5', borderRadius: 999, padding: '3px 12px', flexShrink: 0 }}>✓ Aprobado</span>}
        <CircBtn name="more_horiz" size={18} />
      </div>

      {/* Área principal */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {thread.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'bmFadeUp .24s ease both' }}>
                {m.role === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Orb size={18} radius={6} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: C.primary }}>Asistente de IA</span>
                  </div>
                )}
                <div style={{ maxWidth: '80%', padding: '13px 17px', borderRadius: m.role === 'user' ? '18px 18px 5px 18px' : '5px 18px 18px 18px', background: m.role === 'user' ? C.primary : C.shell, color: m.role === 'user' ? '#fff' : C.ink, fontSize: 14, lineHeight: 1.6, border: m.role === 'ai' ? `1px solid ${C.border}` : 'none', boxShadow: m.role === 'ai' ? '0 2px 10px rgba(20,28,70,.06)' : 'none', whiteSpace: 'pre-line' }}>
                  {m.role === 'ai' && i === thread.length - 1 && streaming
                    ? <>{streamText || ''}<span style={{ display: 'inline-block', width: 2, height: 14, background: C.primary, borderRadius: 1, marginLeft: 2, verticalAlign: 'middle', animation: 'pulse-dot .6s infinite' }} /></>
                    : m.role === 'ai' && i === thread.length - 1 && !m.text
                    ? <TypingDots2 />
                    : m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chips — aparecen cuando no hay streaming */}
          {!streaming && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {CHIPS.map(([label, icon, action], i) => {
                const isPrimary = typeof action === 'function'
                return (
                  <button key={i}
                    onClick={() => typeof action === 'function' ? action() : ask(action)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, border: `1.5px solid ${isPrimary ? C.primary : C.border}`, background: isPrimary ? C.primaryL : C.shell, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: isPrimary ? C.primary : C.ink, transition: 'border-color .13s, transform .1s, box-shadow .13s', animation: `bmFadeUp .32s ease ${i * 60}ms both`, boxShadow: '0 1px 3px rgba(20,28,70,.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(48,79,254,.18)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isPrimary ? C.primary : C.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(20,28,70,.06)' }}>
                    <MS name={icon} size={15} color={isPrimary ? C.primary : C.t2} weight={500} />{label}
                  </button>
                )
              })}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer flotante grande */}
      <div style={{ padding: '12px 32px 20px', flexShrink: 0, background: C.convBg }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ background: C.shell, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: '0 6px 20px rgba(20,28,70,.10)', overflow: 'hidden' }}>
            {compMode === 'direct' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px 7px', borderBottom: `1px solid ${C.borderSoft}` }}>
                <ChannelLogo channel={chat.channel} size={15} />
                <span style={{ fontSize: 12.5, color: C.t2 }}>Respondés por {ch.name} directamente a {fn}</span>
              </div>
            )}
            <textarea value={q} onChange={e => setQ(e.target.value)} rows={3}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={compMode === 'ai' ? `Preguntale al Asistente sobre ${fn}…` : `Escribí tu respuesta directa a ${fn}…`}
              style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 14.5, color: C.ink, fontFamily: FONT, lineHeight: 1.5, padding: '14px 18px 8px', boxSizing: 'border-box', background: 'transparent' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 14px 12px' }}>
              {compMode === 'ai'
                ? <><CircBtn name="auto_awesome" size={18} /><CircBtn name="menu_book" size={18} /></>
                : <><CircBtn name="bolt" size={18} /><CircBtn name="attach_file" size={18} /><CircBtn name="sentiment_satisfied" size={18} /></>
              }
              <div style={{ flex: 1 }} />
              <button onClick={send}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 20px', borderRadius: 999, border: 'none', background: q.trim() ? C.primary : C.sel, color: q.trim() ? '#fff' : C.t3, cursor: 'pointer', fontFamily: FONT, fontSize: 13.5, fontWeight: 600, transition: 'background .12s' }}>
                {compMode === 'ai' ? 'Preguntar' : 'Enviar'} <MS name="keyboard_arrow_down" size={15} color={q.trim() ? '#fff' : C.t3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Panel derecho: chat del usuario (monitor + respuesta) — 390px
function UserChatRight({ chat }: { chat: Chat }) {
  const [msg, setMsg] = useState('')
  const th = CH[chat.channel]
  return (
    <div style={{ width: 390, flexShrink: 0, display: 'flex', flexDirection: 'column', background: th.chatBg, borderLeft: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px', height: 56, background: C.shell, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Avatar chat={chat} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name} {chat.flag ?? ''}</div>
          <div style={{ fontSize: 11, color: C.t2, display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}><ChannelLogo channel={chat.channel} size={12} /> {th.name}</div>
        </div>
        <CircBtn name="more_horiz" size={17} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 999, border: 'none', background: C.dark, color: '#fff', cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 500, flexShrink: 0 }}>
          <MS name="check" size={15} color="#fff" /> Cerrar
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,.45)', background: 'rgba(255,255,255,.75)', border: '1px solid rgba(0,0,0,.06)', borderRadius: 999, padding: '3px 11px' }}>Hoy</span>
        </div>
        {chat.messages.map((m, i) => {
          const me = m.from !== 'cliente'
          const bg = me ? (th.sentGradient ? `linear-gradient(135deg,${th.sentGradient[0]},${th.sentGradient[1]},${th.sentGradient[2]})` : th.sentBg) : th.recvBg
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', marginBottom: 10, animation: 'bmFadeUp .28s ease both', animationDelay: `${i * 50}ms` }}>
              <div style={{ maxWidth: '82%', padding: '9px 13px', borderRadius: me ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: bg, color: me ? th.sentText : th.recvText, fontSize: 13.5, lineHeight: 1.5, boxShadow: '0 1px 1.5px rgba(0,0,0,.08)' }}>{m.text}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <span style={{ fontSize: 10, color: 'rgba(0,0,0,.4)' }}>{me ? (m.from === 'bot' ? 'Bot' : 'Vos') : chat.name.split(' ')[0]} · {m.time}</span>
                {me && <MS name="done_all" size={13} color={th.tick} fill={0} />}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: '0 12px 14px', flexShrink: 0 }}>
        <div style={{ background: C.shell, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 2px 6px rgba(0,0,0,.05)', overflow: 'hidden' }}>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={2} placeholder='Responder al usuario…'
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 13.5, color: C.ink, fontFamily: FONT, lineHeight: 1.5, padding: '10px 14px 6px', boxSizing: 'border-box', background: 'transparent' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 8px 8px' }}>
            <CircBtn name="bolt" size={17} /><CircBtn name="attach_file" size={17} /><CircBtn name="auto_awesome" size={17} />
            <div style={{ flex: 1 }} />
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 14px', borderRadius: 999, border: 'none', background: msg.trim() ? C.primary : C.sel, color: msg.trim() ? '#fff' : C.t3, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 600, transition: 'background .12s' }}>
              Enviar <MS name="keyboard_arrow_down" size={13} color={msg.trim() ? '#fff' : C.t3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatsDisruptiva() {
  const [folder, setFolder] = useState('tu')
  const [selectedId, setSelectedId] = useState('t1')
  const [foldersOpen, setFoldersOpen] = useState(true)
  const [doneIds, setDoneIds] = useState<string[]>([])
  const [pinnedIds, setPinnedIds] = useState<string[]>(['t1'])
  const chat = CHATS.find(c => c.id === selectedId) ?? CHATS[0]
  const togglePin = (id: string) => setPinnedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const isTicket = chat.channel === 'ticket'

  return (
    <div style={{ height: '100vh', background: C.shell, fontFamily: FONT, color: C.ink, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar />
      <ViewSwitcher current="disruptiva" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <FoldersNav folder={folder} setFolder={setFolder} open={foldersOpen} onToggle={() => setFoldersOpen(o => !o)} />
        <ConvList folder={folder} selectedId={selectedId} onSelect={setSelectedId} pinnedIds={pinnedIds} onTogglePin={togglePin} noExpand />
        <AICenterPanel key={selectedId} chat={chat} done={doneIds.includes(chat.id)} onDone={() => setDoneIds(d => [...d, chat.id])} />
        {isTicket ? <TicketSidePanel chat={chat} /> : <UserChatRight chat={chat} />}
      </div>
    </div>
  )
}
