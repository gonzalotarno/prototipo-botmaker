// ── Shared WhatsApp account data ──────────────────────────────────────────────
// Used by the channel table and the pricing-change modal so both show the same
// lines. Pure presentational demo data.

export type Quality = 'alta' | 'na'
export type Status = 'connected' | 'loading'

export interface WaAccount {
  id: string
  avatar: 'botmaker' | 'placeholder'
  phone: string
  status: Status
  quality: Quality
  type: string
  alias: string
}

export const ACCOUNTS: WaAccount[] = [
  { id: '1', avatar: 'botmaker',    phone: '+55 11 5039-2798', status: 'connected', quality: 'alta', type: 'Cloud', alias: 'Testes Botmaker 1' },
  { id: '2', avatar: 'placeholder', phone: '+55 11 5039-1907', status: 'loading',   quality: 'na',   type: 'Cloud', alias: 'Botmakerpresales' },
  { id: '3', avatar: 'placeholder', phone: '+55 11 5039-1900', status: 'connected', quality: 'alta', type: 'Cloud', alias: 'Soporte' },
]
