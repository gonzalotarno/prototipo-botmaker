import { useState } from 'react'

export interface IsoAgent {
  id: string
  name: string
  avatar: string      // face circle
  bodyAvatar: string  // full-body character
  color: string
  dailyCount: number
  dailyLabel: string
}

// ── Isometric projection ──────────────────────────────────────────────────────
const TW = 80   // tile width  (x → right-down, y → left-down)
const TH = 40   // tile height
const ZH = 34   // z scale (up)
const OX = 400  // origin X in SVG
const OY = 168  // origin Y in SVG

function iso(x: number, y: number, z = 0) {
  return {
    x: OX + (x - y) * TW / 2,
    y: OY + (x + y) * TH / 2 - z * ZH,
  }
}

function pts(...coords: [number, number, number?][]): string {
  return coords
    .map(([x, y, z = 0]) => { const q = iso(x, y, z); return `${q.x},${q.y}` })
    .join(' ')
}

function lerpColor(hex: string, to: string, t: number): string {
  const r = (ch: string, n = parseInt(ch, 16)) => n
  const blend = (a: string, b: string) => Math.round(r(a) + (r(b) - r(a)) * t).toString(16).padStart(2, '0')
  return `#${blend(hex.slice(1, 3), to.slice(1, 3))}${blend(hex.slice(3, 5), to.slice(3, 5))}${blend(hex.slice(5, 7), to.slice(5, 7))}`
}

const darken = (hex: string, amt: number) => lerpColor(hex, '#000000', amt)
const lighten = (hex: string, amt: number) => lerpColor(hex, '#ffffff', amt)

// ── Room layout ───────────────────────────────────────────────────────────────
const RW = 9    // room width
const RD = 5.5  // room depth
const WH = 2.6  // wall height

// Desk slot positions (back-left corner), max 6
const DESK_SLOTS: [number, number][] = [
  [0.4, 0.3],
  [3.4, 0.3],
  [6.4, 0.3],
  [0.4, 3.2],
  [3.4, 3.2],
  [6.4, 3.2],
]
const DW = 2.2   // desk width (x)
const DD = 1.4   // desk depth (y)
const DH = 0.45  // desk height (z)

// ── Desk ─────────────────────────────────────────────────────────────────────
function IsoDesk({ dx, dy, color, active }: { dx: number; dy: number; color: string; active: boolean }) {
  const top   = active ? lighten(color, 0.22) : color
  const right = darken(color, 0.32)
  const front = darken(color, 0.16)

  // Items on desk
  const lapX = dx + DW * 0.28, lapY = dy + DD * 0.22
  const cupX = dx + DW * 0.75, cupY = dy + DD * 0.25

  return (
    <g>
      {/* Right face (x = dx+DW) */}
      <polygon points={pts([dx+DW,dy,0],[dx+DW,dy+DD,0],[dx+DW,dy+DD,DH],[dx+DW,dy,DH])} fill={right} />
      {/* Front face (y = dy+DD) */}
      <polygon points={pts([dx,dy+DD,0],[dx+DW,dy+DD,0],[dx+DW,dy+DD,DH],[dx,dy+DD,DH])} fill={front} />
      {/* Top face */}
      <polygon
        points={pts([dx,dy,DH],[dx+DW,dy,DH],[dx+DW,dy+DD,DH],[dx,dy+DD,DH])}
        fill={top}
        stroke={active ? lighten(color, 0.5) : 'none'} strokeWidth={active ? 1 : 0}
      />
      {/* Laptop on desk */}
      <polygon points={pts([lapX,lapY,DH],[lapX+0.6,lapY,DH],[lapX+0.6,lapY+0.5,DH],[lapX,lapY+0.5,DH])}
        fill={darken(color, 0.55)} opacity="0.55" />
      <polygon points={pts([lapX+0.05,lapY,DH+0.35],[lapX+0.55,lapY,DH+0.35],[lapX+0.6,lapY,DH],[lapX,lapY,DH])}
        fill={darken(color, 0.45)} opacity="0.5" />
      {/* Coffee cup */}
      <polygon points={pts([cupX,cupY,DH],[cupX+0.25,cupY,DH],[cupX+0.25,cupY+0.18,DH],[cupX,cupY+0.18,DH])}
        fill="#F5F5F5" opacity="0.8" />
      <polygon points={pts([cupX,cupY,DH],[cupX+0.25,cupY,DH],[cupX+0.25,cupY,DH+0.28],[cupX,cupY,DH+0.28])}
        fill="#EEEEEE" opacity="0.7" />
    </g>
  )
}

// ── Chair ─────────────────────────────────────────────────────────────────────
function IsoChair({ cx, cy }: { cx: number; cy: number }) {
  const h = 0.38, sw = 0.55, sd = 0.55, bh = 0.7
  return (
    <g opacity="0.9">
      {/* seat */}
      <polygon points={pts([cx,cy,h],[cx+sw,cy,h],[cx+sw,cy+sd,h],[cx,cy+sd,h])} fill="#546E7A" />
      {/* back */}
      <polygon points={pts([cx,cy,h],[cx+sw,cy,h],[cx+sw,cy,h+bh],[cx,cy,h+bh])} fill="#455A64" />
      {/* legs */}
      <polygon points={pts([cx,cy,0],[cx,cy+0.08,0],[cx,cy+0.08,h],[cx,cy,h])} fill="#37474F" />
      <polygon points={pts([cx+sw,cy,0],[cx+sw,cy+0.08,0],[cx+sw,cy+0.08,h],[cx+sw,cy,h])} fill="#37474F" />
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IsometricOffice({ agents }: { agents: IsoAgent[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered]   = useState<string | null>(null)

  // Painter's algorithm: sort agents by their y position (higher y = closer to viewer = drawn last)
  const slots = agents.map((a, i) => ({ a, slot: DESK_SLOTS[i % DESK_SLOTS.length] }))
  const sorted = [...slots].sort((a, b) => a.slot[1] - b.slot[1])

  return (
    <div style={{ background: 'linear-gradient(180deg, #F0F3FF 0%, #E8ECFF 100%)', position: 'relative' }}>
      <svg viewBox="0 0 800 480" style={{ width: '100%', display: 'block' }}>
        <defs>
          <filter id="iso-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(48,79,254,0.13)" />
          </filter>
          <filter id="chip-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="rgba(0,0,0,0.12)" />
          </filter>
        </defs>

        {/* ── WALLS ── */}
        {/* Right back wall (y=0 face) */}
        <polygon points={pts([0,0,WH],[RW,0,WH],[RW,0,0],[0,0,0])} fill="#EEF1FF" stroke="#E2E7FF" strokeWidth="0.5" />
        {/* Left back wall (x=0 face) */}
        <polygon points={pts([0,0,WH],[0,RD,WH],[0,RD,0],[0,0,0])} fill="#E6EAFF" stroke="#DCE1FF" strokeWidth="0.5" />
        {/* Wall top cap right */}
        <polygon points={pts([0,0,WH],[RW,0,WH],[RW,0,WH+0.08],[0,0,WH+0.08])} fill="#D4D9F5" />
        {/* Wall top cap left */}
        <polygon points={pts([0,0,WH],[0,RD,WH],[0,RD,WH+0.08],[0,0,WH+0.08])} fill="#CBD0EE" />

        {/* ── FLOOR ── */}
        {Array.from({ length: Math.ceil(RW) }, (_, xi) =>
          Array.from({ length: Math.ceil(RD) }, (_, yi) => {
            const x1 = xi, x2 = Math.min(xi + 1, RW)
            const y1 = yi, y2 = Math.min(yi + 1, RD)
            return (
              <polygon
                key={`f${xi}-${yi}`}
                points={pts([x1,y1,0],[x2,y1,0],[x2,y2,0],[x1,y2,0])}
                fill={(xi + yi) % 2 === 0 ? '#E9EDFF' : '#E2E6FF'}
                stroke="#D5DAFF"
                strokeWidth="0.5"
              />
            )
          })
        )}

        {/* ── SKIRTING BOARD ── */}
        <polygon points={pts([0,0,0],[RW,0,0],[RW,0,0.14],[0,0,0.14])} fill="#D0D5F0" />
        <polygon points={pts([0,0,0],[0,RD,0],[0,RD,0.14],[0,0,0.14])} fill="#C8CEF0" />

        {/* ── PLANT ── */}
        <polygon points={pts([0.1,4.8,0],[0.55,4.8,0],[0.55,4.8,0.42],[0.1,4.8,0.42])} fill="#8D6E63" />
        <polygon points={pts([0.1,4.8,0.42],[0.55,4.8,0.42],[0.5,5.1,0.42],[0.15,5.1,0.42])} fill="#6D4C41" />
        {/* leaves */}
        {[
          { cx: 0.33, cy: 4.8, z: 0.85, rx: 18, ry: 10, fill: '#4CAF50' },
          { cx: 0.2, cy: 4.85, z: 1.0, rx: 13, ry: 8, fill: '#388E3C' },
          { cx: 0.42, cy: 4.7, z: 1.05, rx: 11, ry: 7, fill: '#43A047' },
          { cx: 0.28, cy: 4.6, z: 1.2, rx: 9, ry: 6, fill: '#2E7D32' },
        ].map((l, k) => {
          const q = iso(l.cx, l.cy, l.z)
          return <ellipse key={k} cx={q.x} cy={q.y} rx={l.rx} ry={l.ry} fill={l.fill} />
        })}

        {/* ── AGENTS ── */}
        {sorted.map(({ a, slot }) => {
          const [dx, dy] = slot
          const active = hovered === a.id || selected === a.id

          // Character stands just behind back edge of desk (dy - 0.15)
          // feet at floor level (z=0) so desk appears in front
          const charFeet  = iso(dx + DW * 0.5, dy - 0.05, 0)
          const chairPos  = { cx: dx + DW * 0.5 - 0.28, cy: dy - 0.05 }
          // Label floats above character head
          const labelCtr  = iso(dx + DW * 0.5, dy - 0.05, 1.95)
          // Stat tooltip: to the right of desk top when selected
          const tooltipPt = iso(dx + DW + 0.1, dy + DD * 0.3, DH + 1.1)

          const CHAR_W = 58, CHAR_H = 88

          return (
            <g
              key={a.id}
              onClick={() => setSelected(selected === a.id ? null : a.id)}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Chair (behind desk, drawn before desk) */}
              <IsoChair cx={chairPos.cx} cy={chairPos.cy} />

              {/* Character body (drawn before desk so desk overlaps their lower half) */}
              <image
                href={a.bodyAvatar}
                x={charFeet.x - CHAR_W / 2}
                y={charFeet.y - CHAR_H}
                width={CHAR_W}
                height={CHAR_H}
                style={{ imageRendering: 'auto' }}
              />

              {/* Desk (drawn on top of character's lower half) */}
              <IsoDesk dx={dx} dy={dy} color={a.color} active={active} />

              {/* Name label chip */}
              <g filter="url(#chip-shadow)">
                <rect
                  x={labelCtr.x - 44} y={labelCtr.y - 13}
                  width={88} height={26} rx={13}
                  fill={active ? a.color : 'white'}
                />
              </g>
              {/* Face avatar circle inside chip */}
              <clipPath id={`fc-${a.id}`}>
                <circle cx={labelCtr.x - 28} cy={labelCtr.y} r={9} />
              </clipPath>
              <circle cx={labelCtr.x - 28} cy={labelCtr.y} r={10}
                fill={active ? lighten(a.color, 0.3) : '#f1f5f9'} />
              <image
                href={a.avatar}
                x={labelCtr.x - 37} y={labelCtr.y - 9}
                width={18} height={18}
                clipPath={`url(#fc-${a.id})`}
              />
              <text
                x={labelCtr.x - 14} y={labelCtr.y + 4}
                fill={active ? 'white' : '#1e293b'}
                fontSize={10.5} fontWeight={600}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {a.name.split(' ')[0]}
              </text>

              {/* Stat tooltip (only when selected) */}
              {selected === a.id && (
                <g filter="url(#iso-shadow)">
                  <rect x={tooltipPt.x} y={tooltipPt.y - 4} width={122} height={70} rx={10} fill="white" />
                  {/* color bar on left */}
                  <rect x={tooltipPt.x} y={tooltipPt.y - 4} width={4} height={70} rx={10} fill={a.color} />
                  <text x={tooltipPt.x + 14} y={tooltipPt.y + 15}
                    fill="#0f172a" fontSize={11} fontWeight={700}
                    fontFamily="system-ui, -apple-system, sans-serif">{a.name}</text>
                  <text x={tooltipPt.x + 14} y={tooltipPt.y + 38}
                    fill={a.color} fontSize={22} fontWeight={800}
                    fontFamily="system-ui, -apple-system, sans-serif">{a.dailyCount}</text>
                  <text x={tooltipPt.x + 14} y={tooltipPt.y + 56}
                    fill="#64748b" fontSize={9.5}
                    fontFamily="system-ui, -apple-system, sans-serif">{a.dailyLabel}</text>
                </g>
              )}
            </g>
          )
        })}

        {/* ── ROOM LABEL ── */}
        {(() => {
          const lb = iso(RW * 0.5, RD + 0.4, 0)
          return (
            <text x={lb.x} y={lb.y} textAnchor="middle"
              fill="#304FFE" fontSize={11} fontWeight={600} opacity={0.45}
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.12em"
            >
              TU EQUIPO
            </text>
          )
        })()}
      </svg>

      {/* Hint */}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', padding: '0 0 14px', margin: 0 }}>
        Hacé click en un asistente para ver su actividad
      </p>
    </div>
  )
}
