import { useRef, useEffect } from 'react'

export interface PixelAgent {
  id: string
  name: string
  avatar: string      // face circle (not used in pixel office)
  bodyAvatar: string  // full-body isometric character
  color: string
  dailyCount: number
  dailyLabel: string
}

export default function PixelOffice({ agents }: { agents: PixelAgent[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const agentsRef = useRef(agents)
  agentsRef.current = agents

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    // 1 logical pixel = 3 CSS pixels. Canvas: 300×100 logical → 900×300 physical
    const S = 3

    // Lazy image cache — loads on first request, shows next frame
    const imgCache: Record<string, HTMLImageElement> = {}
    const getImg = (src: string): HTMLImageElement | null => {
      if (!src) return null
      if (imgCache[src]) return imgCache[src].complete && imgCache[src].naturalWidth > 0 ? imgCache[src] : null
      const img = new Image()
      img.src = src
      imgCache[src] = img
      return null
    }

    const px = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(x * S, y * S, w * S, h * S)
    }

    // Per-agent notification state (lives outside render loop)
    const notifs = Array.from({ length: 8 }, (_, i) => ({
      active: false, floatY: 0, alpha: 0,
      nextAt: 40 + i * 30 + Math.floor(Math.random() * 25),
    }))

    let tick = 0
    let raf: number

    const render = () => {
      const agts = agentsRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ── WALL ──────────────────────────────────────────────────────────────
      px(0, 0, 300, 40, '#EDE9E3')
      px(0, 38, 300, 2, '#CBC5B8')
      px(0, 40, 300, 2, '#B2AA9C')

      // ── FLOOR TILES ────────────────────────────────────────────────────────
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 15; col++) {
          const light = (row + col) % 2 === 0
          px(col * 20, 42 + row * 9, 20, 9, light ? '#C8A85C' : '#BC9C52')
        }
      }
      ctx.fillStyle = '#AA8840'
      for (let row = 0; row <= 7; row++) ctx.fillRect(0, (42 + row * 9) * S, 300 * S, S)
      for (let col = 0; col <= 14; col++) ctx.fillRect(col * 20 * S, 42 * S, S, 63 * S)

      // ── WINDOW (left) ──────────────────────────────────────────────────────
      px(5, 3, 48, 33, '#87CEEB')
      // clouds
      px(8, 7, 9, 4, '#FFF'); px(7, 9, 11, 3, '#FFF')
      px(27, 5, 7, 3, '#FFF'); px(26, 7, 9, 3, '#FFF')
      px(40, 14, 6, 3, '#FFF')
      // sun
      px(42, 4, 6, 6, '#FFD700'); px(40, 6, 10, 2, '#FFE066'); px(45, 3, 2, 8, '#FFE066')
      // frame
      px(5, 3, 48, 2, '#8B7355'); px(5, 34, 48, 2, '#8B7355')
      px(5, 3, 2, 33, '#8B7355'); px(51, 3, 2, 33, '#8B7355')
      px(28, 3, 2, 33, '#8B7355'); px(5, 18, 48, 2, '#8B7355')
      // sill
      px(3, 35, 52, 3, '#A0917E')

      // ── PLANT ──────────────────────────────────────────────────────────────
      px(60, 27, 10, 12, '#795548'); px(61, 25, 8, 3, '#6D4C41')
      px(64, 19, 3, 8, '#558B2F')
      px(57, 13, 9, 8, '#388E3C'); px(64, 11, 9, 8, '#2E7D32'); px(59, 9, 8, 6, '#43A047')

      // ── BOOKSHELF (right) ──────────────────────────────────────────────────
      px(248, 2, 50, 36, '#A1765A')
      px(248, 13, 50, 2, '#8B6347'); px(248, 25, 50, 2, '#8B6347')
      const row1 = ['#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00838F','#D81B60','#F57F17']
      const row2 = ['#3949AB','#00897B','#E64A19','#5E35B1','#039BE5','#C0CA33','#F4511E','#4E342E']
      const row3 = ['#1565C0','#2E7D32','#C62828','#6A1B9A','#00695C','#F9A825','#4527A0','#558B2F']
      row1.forEach((c, b) => px(250 + b * 6, 3, 5, 10, c))
      row2.forEach((c, b) => px(250 + b * 6, 15, 5, 10, c))
      row3.forEach((c, b) => px(250 + b * 6, 27, 5, 8, c))

      // ── CLOCK ──────────────────────────────────────────────────────────────
      px(228, 3, 18, 18, '#F5F0E8')
      px(228, 3, 18, 1, '#8B7355'); px(228, 20, 18, 1, '#8B7355')
      px(228, 3, 1, 18, '#8B7355'); px(245, 3, 1, 18, '#8B7355')
      px(228, 11, 1, 1, '#8B7355'); px(245, 11, 1, 1, '#8B7355')
      px(236, 3, 1, 1, '#8B7355'); px(236, 20, 1, 1, '#8B7355')
      // Animated hands
      const sec = Math.floor(tick / 2) % 60
      const min = Math.floor(tick / 120) % 60
      const cx2 = 236, cy2 = 11
      const hAngle = (min / 60) * Math.PI * 2 - Math.PI / 2
      const mAngle = (sec / 60) * Math.PI * 2 - Math.PI / 2
      ctx.strokeStyle = '#333'
      ctx.lineWidth = S
      ctx.beginPath()
      ctx.moveTo(cx2 * S, cy2 * S)
      ctx.lineTo((cx2 + Math.cos(hAngle) * 5) * S, (cy2 + Math.sin(hAngle) * 5) * S)
      ctx.stroke()
      ctx.strokeStyle = '#E53935'
      ctx.lineWidth = S * 0.5
      ctx.beginPath()
      ctx.moveTo(cx2 * S, cy2 * S)
      ctx.lineTo((cx2 + Math.cos(mAngle) * 7) * S, (cy2 + Math.sin(mAngle) * 7) * S)
      ctx.stroke()
      px(cx2 - 1, cy2 - 1, 2, 2, '#333')

      // ── STATUS BAR (top right) ────────────────────────────────────────────
      const totalWork = agts.reduce((s, a) => s + a.dailyCount, 0)
      px(200, 3, 26, 11, '#1e293b')
      ctx.fillStyle = '#22c55e'
      ctx.font = `bold ${S * 3}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`${totalWork} done`, 213 * S, 4 * S)
      // Pulsing dot
      const pulse = Math.sin(tick * 0.1) > 0
      px(202, 5, 3, 3, pulse ? '#22c55e' : '#166534')

      // ── AGENTS ────────────────────────────────────────────────────────────
      const count = agts.length
      const positions = agts.map((_, i) => {
        if (count === 1) return 150
        return Math.floor(78 + i * (148 / Math.max(1, count - 1)))
      })

      agts.forEach((agent, i) => {
        const ax = positions[i]

        // ── FULL-BODY CHARACTER (drawn first so desk/monitor appear in front) ─
        // Character stands 32px tall in logical space, feet at y=58 (desk surface level)
        const charH = 34 * S   // character height in physical px
        const charW = 20 * S   // character width in physical px
        const charX = ax * S - charW / 2
        const charY = (58 - 34) * S  // top of character = feet_y - height

        const bodyImg = getImg(agent.bodyAvatar)
        if (bodyImg) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(bodyImg, charX, charY, charW, charH)
          ctx.imageSmoothingEnabled = false
        } else {
          // Placeholder while loading: colored rectangle
          ctx.fillStyle = agent.color + '44'
          ctx.fillRect(charX, charY, charW, charH)
        }

        // Chair (drawn on top of lower part of avatar)
        px(ax - 9, 57, 18, 4, '#37474F')   // seat
        px(ax - 8, 48, 16, 9, '#263238')   // chair back
        px(ax - 9, 48, 2, 9, '#1C2B33')    // back left edge
        px(ax + 6, 48, 2, 9, '#1C2B33')    // back right edge
        px(ax - 10, 61, 3, 7, '#37474F')   // leg L
        px(ax + 7, 61, 3, 7, '#37474F')    // leg R

        // ── DESK ──────────────────────────────────────────────────────────
        px(ax - 18, 59, 36, 7, '#8D6E63')  // surface
        px(ax - 18, 66, 36, 4, '#6D4C41')  // front
        px(ax - 17, 70, 4, 8, '#5D4037')   // leg L
        px(ax + 13, 70, 4, 8, '#5D4037')   // leg R
        px(ax - 18, 59, 36, 1, '#A07060')  // edge highlight

        // Coffee cup
        px(ax - 14, 60, 5, 5, '#F0EDE8'); px(ax - 13, 59, 3, 1, '#6F4E37')
        px(ax - 9, 62, 2, 2, '#F0EDE8') // handle

        // Mouse
        px(ax + 10, 62, 5, 4, '#B0BEC5'); px(ax + 11, 61, 3, 1, '#90A4AE')
        px(ax + 12, 62, 1, 2, '#78909C') // click line

        // ── MONITOR (drawn on top of avatar) ─────────────────────────────
        const monX = ax - 8
        const monY = 43
        px(monX, monY, 16, 14, '#37474F')
        const flicker = tick % 4 === 0 ? '#42A5F5' : '#1565C0'
        px(monX + 1, monY + 1, 14, 11, flicker)
        for (let l = 0; l < 3; l++) {
          const len = 2 + Math.abs(Math.round(Math.sin(tick * 0.07 + l * 2.2 + i * 1.3) * 5))
          const col = l === 0 ? '#90CAF9' : l === 1 ? '#80DEEA' : '#A5D6A7'
          px(monX + 2, monY + 2 + l * 3, len, 2, col)
        }
        if (Math.floor(tick / 20) % 2 === 0) {
          px(monX + 2 + Math.abs(Math.round(Math.sin(tick * 0.07) * 3)), monY + 2, 1, 2, '#FFFFFF')
        }
        px(ax - 2, monY + 14, 4, 3, '#546E7A')  // stand
        px(ax - 5, monY + 17, 10, 2, '#546E7A')
        px(ax - 1, monY + 12, 2, 1, '#546E7A')  // brand dot

        // Keyboard
        px(ax - 10, 60, 18, 5, '#CFD8DC')
        px(ax - 9, 60, 16, 1, '#B0BEC5'); px(ax - 9, 62, 16, 1, '#B0BEC5')
        px(ax - 6, 64, 10, 1, '#B0BEC5')

        // ── NOTIFICATION BUBBLE ───────────────────────────────────────────
        const n = notifs[i]
        if (tick >= n.nextAt && !n.active) {
          n.active = true
          n.floatY = 20  // start above character head
          n.alpha = 1.0
        }
        if (n.active) {
          n.floatY -= 0.22
          n.alpha -= 0.013
          if (n.alpha <= 0) {
            n.active = false
            n.nextAt = tick + 55 + Math.floor(Math.random() * 75)
          }
          const by = Math.floor(n.floatY)
          ctx.globalAlpha = Math.max(0, n.alpha)
          // Bubble body
          px(ax + 5, by, 14, 9, '#FFFFFF')
          px(ax + 5, by + 9, 4, 2, '#FFFFFF') // tail
          // Shadow on bubble
          px(ax + 5, by + 8, 14, 1, '#E2E7FF')
          // Message lines
          px(ax + 7, by + 2, 8, 1, '#304FFE')
          px(ax + 7, by + 4, 5, 1, '#304FFE')
          px(ax + 7, by + 6, 8, 1, '#CBD5E1')
          ctx.globalAlpha = 1.0
        }

        // ── LABELS ────────────────────────────────────────────────────────
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        // Name
        ctx.fillStyle = '#0f172a'
        ctx.font = `bold ${S * 4}px "Courier New", monospace`
        ctx.fillText(agent.name.split(' ')[0], ax * S, 79 * S)

        // Stat pill
        const statText = `${agent.dailyCount} ${agent.dailyLabel.split(' ')[0]}`
        ctx.font = `${S * 3}px "Courier New", monospace`
        const tw = ctx.measureText(statText).width
        const bw = tw + S * 8
        const bx = ax * S - bw / 2
        // pill background
        ctx.fillStyle = agent.color + '28'
        roundRect(ctx, bx, 86 * S, bw, S * 6, S * 2)
        ctx.fill()
        ctx.fillStyle = agent.color
        ctx.fillText(statText, ax * S, 87 * S)
      })

      tick++
      raf = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(raf)
  }, []) // runs once; agents accessed via ref

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={300}
      style={{
        width: '100%',
        aspectRatio: '3 / 1',
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
