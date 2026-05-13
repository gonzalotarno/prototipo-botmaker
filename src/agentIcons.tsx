import {
  Bot, MessageCircle, Mail, ShoppingCart, Package, Phone,
  Star, Zap, Heart, Globe, Calendar, Bell, CreditCard,
  Truck, Headphones, BookOpen, BarChart2, Coffee,
  Megaphone, ClipboardList, Repeat, Users, Building2,
  Tag, Wrench, Rocket, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AgentIconDef {
  key: string
  Icon: LucideIcon
}

export const AGENT_ICONS: AgentIconDef[] = [
  { key: 'bot',           Icon: Bot          },
  { key: 'message',       Icon: MessageCircle },
  { key: 'mail',          Icon: Mail          },
  { key: 'cart',          Icon: ShoppingCart  },
  { key: 'package',       Icon: Package       },
  { key: 'phone',         Icon: Phone         },
  { key: 'star',          Icon: Star          },
  { key: 'zap',           Icon: Zap           },
  { key: 'heart',         Icon: Heart         },
  { key: 'globe',         Icon: Globe         },
  { key: 'calendar',      Icon: Calendar      },
  { key: 'bell',          Icon: Bell          },
  { key: 'card',          Icon: CreditCard    },
  { key: 'truck',         Icon: Truck         },
  { key: 'headphones',    Icon: Headphones    },
  { key: 'book',          Icon: BookOpen      },
  { key: 'chart',         Icon: BarChart2     },
  { key: 'coffee',        Icon: Coffee        },
  { key: 'megaphone',     Icon: Megaphone     },
  { key: 'clipboard',     Icon: ClipboardList },
  { key: 'repeat',        Icon: Repeat        },
  { key: 'users',         Icon: Users         },
  { key: 'building',      Icon: Building2     },
  { key: 'tag',           Icon: Tag           },
  { key: 'wrench',        Icon: Wrench        },
  { key: 'rocket',        Icon: Rocket        },
  { key: 'sparkles',      Icon: Sparkles      },
]

export function getIcon(key: string): LucideIcon {
  return AGENT_ICONS.find(i => i.key === key)?.Icon ?? Bot
}

interface AgentIconProps {
  iconKey: string
  color: string
  size?: number
  iconSize?: number
  rounded?: boolean
}

export function AgentIcon({ iconKey, color, size = 40, iconSize = 18, rounded = true }: AgentIconProps) {
  const Icon = getIcon(iconKey)
  return (
    <div style={{
      width: size, height: size,
      borderRadius: rounded ? '50%' : size * 0.3,
      background: color + '18',
      border: `2px solid ${color}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={iconSize} color={color} />
    </div>
  )
}

// ── AgentAvatar — richer avatar with gradient + AI badge ───────────────────────

interface AgentAvatarProps {
  iconKey: string
  color: string
  size?: number
  /** show the small ✦ AI badge in the corner */
  badge?: boolean
}

export function AgentAvatar({ iconKey: _iconKey, color, size = 44, badge: _badge = true }: AgentAvatarProps) {
  const radius = Math.round(size * 0.30)
  const imgSize = Math.round(size * 0.62)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size,
        borderRadius: radius,
        background: `${color}14`,
        border: `1.5px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src="/ai-agent-icon.png"
          alt="AI Agent"
          style={{ width: imgSize, height: imgSize, objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}
