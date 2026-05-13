// Demo page to capture all Historial de Versiones states for Figma
import { useState } from 'react'
import Icon from './Icon'
import { color, spacing, radius, font, text } from './ds'

const AVATAR_COLORS = ['#304FFE', '#02C66A', '#F5A623', '#FB1531', '#673AB7', '#00BCD4']
function UserAvatar({ name, size = 22 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colorIdx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: AVATAR_COLORS[colorIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.45, fontWeight: font.bold, color: 'white', fontFamily: font.family, lineHeight: 1 }}>{initials}</span>
    </div>
  )
}

interface V { id: number; date: string; publishedBy: string; env: 'produccion' | 'demo' | null; label: string }

const VERSIONS: V[] = [
  { id: 17, date: '24/4/2026, 14:58:15', publishedBy: 'Matías R.', env: 'produccion', label: 'Ajuste de tono (Restaurado)' },
  { id: 16, date: '24/4/2026, 14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Soporte nocturno + Instagram' },
  { id: 15, date: '24/4/2026, 14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Ajuste de tono' },
  { id: 12, date: '24/4/2026, 14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Version 12' },
  { id: 10, date: '24/4/2026, 14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Canal WhatsApp Business' },
  { id:  1, date: '24/4/2026, 14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Lanzamiento inicial' },
]

const btnBase: React.CSSProperties = { padding: `6px ${spacing.sm}px`, borderRadius: 100, cursor: 'pointer', fontSize: text.paragraphXs.size, fontWeight: font.medium, fontFamily: font.family, display: 'inline-flex', alignItems: 'center', gap: spacing.xxxSm, border: 'none' }
const btnOutline: React.CSSProperties = { ...btnBase, border: `1px solid ${color.primary}`, background: 'white', color: color.primary }
const btnGhost: React.CSSProperties = { ...btnBase, border: `1px solid ${color.grey300}`, background: 'white', color: color.grey800 }

function SidebarPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xxSm }}>
      <div style={{ fontSize: text.paragraphXs.size, fontWeight: font.bold, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: font.family, textAlign: 'center' }}>{title}</div>
      <div style={{ width: 370, background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', borderRadius: radius.lg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div style={{ padding: `${spacing.sm}px ${spacing.xBig}px`, borderBottom: `1px solid ${color.grey200}`, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: text.h5.size, lineHeight: `${text.h5.lh}px`, fontWeight: font.bold, color: color.grey900, fontFamily: font.family }}>Historial de versiones</span>
        <button style={{ width: 28, height: 28, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <span style={{ fontSize: text.paragraphXs.size, color: color.grey500, fontFamily: font.family }}>Revisa una versión anterior.</span>
    </div>
  )
}

// ── Card shell shared by Draft + Version cards ────────────────────────────────
// Same paddings/radius/border treatment so the stack reads as one consistent list.
function Card({ selected, children }: { selected: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: spacing.sm,
        borderRadius: radius.md,
        background: selected ? color.primaryUltraLight : 'white',
        border: `1.5px solid ${selected ? color.primary : color.grey200}`,
        marginBottom: spacing.xSm,
        cursor: 'pointer',
        fontFamily: font.family,
      }}
    >
      {children}
    </div>
  )
}

// ── Chips ─────────────────────────────────────────────────────────────────────
function ChipEditando() {
  return (
    <span style={{ fontSize: text.paragraphXxs.size, fontWeight: font.bold, color: color.warningDark, background: color.warningLight, padding: '2px 9px', borderRadius: 100, display: 'inline-flex', alignItems: 'center' }}>
      Editando
    </span>
  )
}
function ChipProduccion() {
  return (
    <span style={{ fontSize: text.paragraphXxs.size, fontWeight: font.bold, color: color.successDark, background: color.successLight, padding: '2px 9px', borderRadius: 100, display: 'inline-flex', alignItems: 'center' }}>
      En producción
    </span>
  )
}

// ── Draft card ────────────────────────────────────────────────────────────────
function DraftCard({ selected, status }: { selected: boolean; status: 'editing' | 'synced' }) {
  return (
    <Card selected={selected}>
      <div style={{ marginBottom: spacing.xxSm }}>
        {status === 'editing'
          ? <ChipEditando />
          : <span style={{ fontSize: text.paragraphXxs.size, fontWeight: font.medium, color: color.grey500, background: color.grey100, padding: '2px 9px', borderRadius: 100 }}>Sin cambios</span>
        }
      </div>
      <div style={{ fontSize: 15, fontWeight: font.bold, color: color.grey900, marginBottom: 2 }}>
        Borrador (actual)
      </div>
      <p style={{ fontSize: text.paragraphSm.size, lineHeight: `${text.paragraphSm.lh}px`, color: color.grey500, margin: `0 0 ${spacing.sm}px` }}>
        {status === 'synced' ? 'Sincronizado con la versión en producción.' : 'Editas colaborativamente en vivo.'}
      </p>
      <button
        style={{
          ...btnBase,
          width: '100%',
          justifyContent: 'center',
          padding: `${spacing.xSm}px`,
          background: color.primary,
          color: 'white',
          fontSize: text.paragraphSm.size,
          fontWeight: font.bold,
        }}
      >
        Publicar en producción
      </button>
    </Card>
  )
}

// ── Version card ──────────────────────────────────────────────────────────────
function VersionItem({ v, selected }: { v: V; selected: boolean }) {
  return (
    <Card selected={selected}>
      {v.env === 'produccion' && (
        <div style={{ marginBottom: spacing.xxSm }}>
          <ChipProduccion />
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: font.bold, color: color.grey900, marginBottom: spacing.xxxSm }}>
        {v.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, fontSize: text.paragraphXs.size, color: color.grey500 }}>
        <span>{v.date}</span>
        <span style={{ color: color.grey300 }}>·</span>
        <UserAvatar name={v.publishedBy} size={18} />
        <span>{v.publishedBy}</span>
      </div>
      {selected && (
        <div style={{ display: 'flex', gap: spacing.xxSm, marginTop: spacing.sm }}>
          <button style={{ ...btnOutline, flex: 1, justifyContent: 'center', padding: `${spacing.xxSm}px`, fontWeight: font.bold }}>
            Aplicar en borrador
          </button>
          <button style={{ ...btnBase, flex: 1, justifyContent: 'center', padding: `${spacing.xxSm}px`, background: color.primary, color: 'white', fontWeight: font.bold }}>
            Publicar en producción
          </button>
        </div>
      )}
    </Card>
  )
}

function PublishModal() {
  return (
    <div style={{ width: 420, background: 'white', borderRadius: radius.lg, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: spacing.xBig, fontFamily: font.family }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xBig }}>
        <span style={{ fontSize: text.h4.size, fontWeight: font.bold, color: color.grey900 }}>Publicar versión</span>
        <button style={{ width: 28, height: 28, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <p style={{ fontSize: text.paragraphSm.size, color: color.grey600, margin: `0 0 ${spacing.sm}px`, lineHeight: `${text.paragraphSm.lh}px` }}>
        Se creará la <b>versión 22</b> con el contenido actual del borrador.
      </p>
      <div style={{ marginBottom: spacing.sm }}>
        <label style={{ display: 'block', fontSize: text.paragraphXs.size, fontWeight: font.medium, color: color.grey700, marginBottom: spacing.xxxSm }}>Nombre (opcional)</label>
        <input
          defaultValue="Mejora de prompts de venta"
          style={{ width: '100%', padding: `${spacing.xxSm}px ${spacing.xSm}px`, borderRadius: radius.sm, border: `1px solid ${color.primary}`, fontSize: text.paragraphSm.size, fontFamily: font.family, color: color.grey900, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: spacing.xBig }}>
        <label style={{ display: 'block', fontSize: text.paragraphXs.size, fontWeight: font.medium, color: color.grey700, marginBottom: spacing.xxxSm }}>Notas (opcional)</label>
        <textarea
          defaultValue="Ajuste de prompts para el flujo de ventas y corrección de timeout."
          rows={3}
          style={{ width: '100%', padding: `${spacing.xxSm}px ${spacing.xSm}px`, borderRadius: radius.sm, border: `1px solid ${color.grey300}`, fontSize: text.paragraphSm.size, fontFamily: font.family, color: color.grey900, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ display: 'flex', gap: spacing.xxSm, justifyContent: 'flex-end' }}>
        <button style={btnGhost}>Cancelar</button>
        <button style={{ ...btnBase, background: color.primary, color: 'white' }}><Icon name="publish" size={14} color="white" />Publicar</button>
      </div>
    </div>
  )
}

// Floating banner shown over the canvas when previewing a non-draft version.
// The user is in read-only mode and can: return to their draft, replace the draft
// with this version, or publish this version straight to production.
function ReadOnlyBanner({ v }: { v: V }) {
  const isProd = v.env === 'produccion'
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.xxSm}px ${spacing.xSm}px ${spacing.xxSm}px ${spacing.sm}px`,
        background: 'white',
        border: `1px solid ${color.grey200}`,
        borderRadius: 100,
        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.06)',
        fontFamily: font.family,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: color.warningLight,
          color: color.warningDark,
          flexShrink: 0,
        }}
      >
        <Icon name="visibility" size={15} color={color.warningDark} />
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, paddingRight: spacing.xxSm }}>
        <span style={{ fontSize: text.paragraphSm.size, fontWeight: font.bold, color: color.grey900 }}>
          Modo lectura
        </span>
        <span style={{ fontSize: text.paragraphXs.size, color: color.grey500 }}>
          Viendo {v.label} · v{v.id}{isProd && ' (producción)'}
        </span>
      </div>

      <div style={{ width: 1, height: 24, background: color.grey200, flexShrink: 0 }} />

      <button style={btnGhost} title="Descartar lo que ves y volver a tu borrador">
        <Icon name="arrow_back" size={13} color={color.grey600} />Volver al borrador
      </button>
      <button style={btnGhost} title="Reemplazar el borrador con el contenido de esta versión">
        <Icon name="content_copy" size={13} color={color.grey600} />Cargar en borrador
      </button>
      {isProd ? (
        <span
          style={{
            ...btnBase,
            background: color.successLight,
            color: color.successDark,
            border: `1px solid ${color.successLight}`,
            cursor: 'default',
          }}
        >
          <Icon name="check_circle" size={13} color={color.successDark} />Activa en producción
        </span>
      ) : (
        <button style={{ ...btnBase, background: color.primary, color: 'white' }} title="Publicar esta versión directamente a producción">
          <Icon name="rocket_launch" size={13} color="white" />Publicar en producción
        </button>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ width: 370, height: 500, background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', borderRadius: radius.lg, position: 'relative', overflow: 'hidden' }}>
      <Header />
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.xSm }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${color.grey200}`, borderTopColor: color.primary, borderRadius: '50%' }} />
        <span style={{ fontSize: text.paragraphXs.size, color: color.grey600, fontFamily: font.family }}>Cargando versión...</span>
      </div>
    </div>
  )
}

export default function HistorialDemo() {
  return (
    <div style={{ padding: 40, background: '#F0F0F0', minHeight: '100vh', fontFamily: font.family }}>
      <h1 style={{ fontSize: text.h3.size, fontWeight: font.bold, color: color.grey900, marginBottom: 32 }}>Historial de versiones — Todos los estados</h1>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* 1. Default - draft selected */}
        <SidebarPanel title="Estado inicial (borrador)">
          <Header />
          <div style={{ padding: spacing.sm }}>
            <DraftCard selected status="editing" />
            {VERSIONS.map(v => <VersionItem key={v.id} v={v} selected={false} />)}
          </div>
        </SidebarPanel>

        {/* 2. Production version selected — shows the two inline actions */}
        <SidebarPanel title="Versión en producción seleccionada">
          <Header />
          <div style={{ padding: spacing.sm }}>
            <DraftCard selected={false} status="editing" />
            {VERSIONS.map(v => <VersionItem key={v.id} v={v} selected={v.env === 'produccion'} />)}
          </div>
        </SidebarPanel>

        {/* 3. Other (non-prod) version selected — same actions, no chip */}
        <SidebarPanel title="Versión sin entorno seleccionada">
          <Header />
          <div style={{ padding: spacing.sm }}>
            <DraftCard selected={false} status="editing" />
            {VERSIONS.map(v => <VersionItem key={v.id} v={v} selected={v.id === 16} />)}
          </div>
        </SidebarPanel>

        {/* 4. After publishing - synced draft */}
        <SidebarPanel title="Post publicación (sin cambios)">
          <Header />
          <div style={{ padding: spacing.sm }}>
            <DraftCard selected status="synced" />
            {VERSIONS.map(v => <VersionItem key={v.id} v={v} selected={false} />)}
          </div>
        </SidebarPanel>

        {/* 5. Loading state */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xxSm }}>
          <div style={{ fontSize: text.paragraphXs.size, fontWeight: font.bold, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: font.family, textAlign: 'center' }}>Cargando</div>
          <LoadingState />
        </div>

        {/* 6. Publish modal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xxSm }}>
          <div style={{ fontSize: text.paragraphXs.size, fontWeight: font.bold, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: font.family, textAlign: 'center' }}>Modal publicar versión</div>
          <PublishModal />
        </div>

      </div>

      {/* ── Read-only floating banner (over canvas) ────────────────────── */}
      <h2 style={{ fontSize: text.h4.size, fontWeight: font.bold, color: color.grey900, margin: '48px 0 16px' }}>
        Banner flotante de modo lectura
      </h2>
      <p style={{ fontSize: text.paragraphSm.size, color: color.grey500, maxWidth: 640, margin: `0 0 ${spacing.xBig}px` }}>
        Aparece sobre el canvas cuando el usuario está viendo una versión que no es su borrador. Permite volver al borrador, reemplazar el borrador con esa versión, o publicarla directo a producción.
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Banner — versión común */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xxSm }}>
          <div style={{ fontSize: text.paragraphXs.size, fontWeight: font.bold, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: font.family, textAlign: 'center' }}>
            Versión sin entorno
          </div>
          <CanvasFrame>
            <ReadOnlyBanner v={VERSIONS.find(v => v.id === 16)!} />
          </CanvasFrame>
        </div>

        {/* Banner — versión en producción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xxSm }}>
          <div style={{ fontSize: text.paragraphXs.size, fontWeight: font.bold, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: font.family, textAlign: 'center' }}>
            Versión en producción
          </div>
          <CanvasFrame>
            <ReadOnlyBanner v={VERSIONS.find(v => v.id === 17)!} />
          </CanvasFrame>
        </div>

      </div>
    </div>
  )
}

// Stand-in for the canvas behind the floating banner — just gives the banner a
// realistic backdrop in the demo so the floating treatment reads correctly.
function CanvasFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 720,
        height: 220,
        borderRadius: radius.lg,
        background:
          'repeating-linear-gradient(0deg, #FAFBFF 0 28px, #F1F4FF 28px 29px), ' +
          'repeating-linear-gradient(90deg, transparent 0 28px, #E2E7FF55 28px 29px)',
        border: `1px solid ${color.grey200}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 24,
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  )
}
