// ── Shared WhatsApp account data ──────────────────────────────────────────────
// Used by the channel table and the consent alert so both show the same lines.
// Pure presentational demo data — mirrors the real go.botmaker.com WhatsApp table.

export type Quality = 'alta' | 'na'
export type Status = 'connected' | 'unknown' | 'loading'

export interface WaAccount {
  id: string
  avatar: 'botmaker' | 'placeholder'
  phone: string
  profileName: string // sublabel under the line
  waba: string
  status: Status
  quality: Quality
}

export const ACCOUNTS: WaAccount[] = [
  { id: '1', avatar: 'botmaker',    phone: '+551150392798', profileName: 'Botmaker (Testes Botmaker 1)', waba: '219257479232001', status: 'connected', quality: 'alta' },
  { id: '2', avatar: 'placeholder', phone: '+551150391907', profileName: 'Botmakerpresales',             waba: '871262513217753', status: 'unknown',   quality: 'na'   },
  { id: '3', avatar: 'placeholder', phone: '+551150391900', profileName: 'Soporte',                      waba: '553120984471882', status: 'connected', quality: 'alta' },
]
