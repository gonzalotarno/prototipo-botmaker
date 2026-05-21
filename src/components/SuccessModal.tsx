import { useState } from 'react'

// ─── Replace with your deployed Google Apps Script URL ───────────────────────
// Script code: see comment at bottom of this file
const FEEDBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwH_MRYYhNIAQjMYMuYzt3yXd62Z613FNNbh6LQoI9vIj01lL7Xeb2jYRdVESFqtb_LCw/exec'
// ─────────────────────────────────────────────────────────────────────────────

const COPY = {
  pt: {
    title:       'Muito bem!',
    subtitle:    'Você adicionou um fluxo ao estado.',
    question:    'Como foi encontrar essa funcionalidade?',
    placeholder: 'Algum comentário? (opcional)',
    submit:      'Enviar feedback',
    thanks:      'Obrigado pelo feedback!',
  },
  es: {
    title:       '¡Muy bien!',
    subtitle:    'Agregaste un flujo al estado.',
    question:    '¿Qué tan fácil fue encontrar esta funcionalidad?',
    placeholder: '¿Algún comentario? (opcional)',
    submit:      'Enviar feedback',
    thanks:      '¡Gracias por el feedback!',
  },
}

const EMOJIS = [
  { value: 1, emoji: '😕', label: 'Muy difícil' },
  { value: 2, emoji: '😐', label: 'Difícil' },
  { value: 3, emoji: '🙂', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Fácil' },
  { value: 5, emoji: '🤩', label: 'Muy fácil' },
]

const GREEN = '#059669'
const PRIMARY = '#304FFE'

interface Props {
  onClose: () => void
}

export default function SuccessModal({ onClose }: Props) {
  const lang = (sessionStorage.getItem('bm-lang') ?? 'es') as 'pt' | 'es'
  const t = COPY[lang]

  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  function handleSubmit() {
    try {
      const url = new URL(FEEDBACK_ENDPOINT)
      url.searchParams.set('lang', lang)
      url.searchParams.set('rating', String(rating ?? ''))
      url.searchParams.set('comment', comment)
      url.searchParams.set('ts', new Date().toISOString())
      new Image().src = url.toString()
    } catch {}
    setSubmitted(true)
    setTimeout(onClose, 2200)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'smBackdrop 250ms ease both',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes smBackdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes smCard { from { opacity: 0; transform: scale(0.94) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400,
          background: '#FFFFFF', borderRadius: 20,
          boxShadow: '0 32px 80px -16px rgba(15,23,42,0.30)',
          fontFamily: 'Roboto, sans-serif',
          overflow: 'hidden',
          animation: 'smCard 280ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {submitted ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{t.thanks}</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              background: GREEN, padding: '28px 28px 24px',
              display: 'flex', flexDirection: 'column', gap: 4, position: 'relative',
            }}>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: '#FFFFFF', cursor: 'pointer', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
              <div style={{ fontSize: 28 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {t.subtitle}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Emoji rating */}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
                  {t.question}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  {EMOJIS.map(e => (
                    <button
                      key={e.value}
                      onClick={() => setRating(e.value)}
                      onMouseEnter={() => setHover(e.value)}
                      onMouseLeave={() => setHover(null)}
                      title={e.label}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 12,
                        border: `2px solid ${rating === e.value ? PRIMARY : '#E2E8F0'}`,
                        background: rating === e.value ? 'rgba(48,79,254,0.06)' : hover === e.value ? '#F8FAFC' : 'white',
                        cursor: 'pointer', fontSize: 22, lineHeight: 1,
                        transition: 'all 120ms',
                        transform: (hover === e.value || rating === e.value) ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >{e.emoji}</button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t.placeholder}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1.5px solid #E2E8F0', borderRadius: 10,
                  padding: '10px 12px', resize: 'none', outline: 'none',
                  fontFamily: 'Roboto, sans-serif', fontSize: 13.5, color: '#0F172A',
                  lineHeight: 1.55, background: '#F8FAFC',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = PRIMARY)}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />

              {/* Submit */}
              <button
                onClick={handleSubmit}
                style={{
                  padding: '13px 0', borderRadius: 12, border: 'none',
                  background: PRIMARY, color: '#FFFFFF',
                  fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 150ms',
                  boxShadow: '0 4px 16px -4px rgba(48,79,254,0.40)',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {t.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/*
── Google Apps Script (paste in script.google.com, deploy as Web App) ──────────

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  sheet.appendRow([
    new Date(),
    e.parameter.lang    || '',
    e.parameter.rating  || '',
    e.parameter.comment || '',
    e.parameter.ts      || '',
  ])
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}

Deploy: Execute as "Me", access "Anyone". Copy the /exec URL and paste above.
────────────────────────────────────────────────────────────────────────────────
*/
