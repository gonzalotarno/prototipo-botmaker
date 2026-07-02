import { useState } from 'react'
import WhatsAppChannel from './WhatsAppChannel'
import WebChatDerivationAlert from './WebChatDerivationAlert'
import { ACCOUNTS } from './accounts'

// ── Shared option screen ──────────────────────────────────────────────────────
// Holds the per-account "migrating to WebChat" state, shared between the 2-column
// derivation alert (master control) and the table's checkbox column.

export default function WhatsAppOptionScreen({ variant }: { variant: number }) {
  const [migrating, setMigrating] = useState<string[]>(ACCOUNTS.map(a => a.id))

  const toggle = (id: string) =>
    setMigrating(m => (m.includes(id) ? m.filter(x => x !== id) : [...m, id]))
  const setAll = (all: boolean) =>
    setMigrating(all ? ACCOUNTS.map(a => a.id) : [])

  return (
    <WhatsAppChannel
      alert={<WebChatDerivationAlert variant={variant} total={ACCOUNTS.length} migratingCount={migrating.length} onSetAll={setAll} />}
      consent={{ migrating, onToggle: toggle }}
    />
  )
}
