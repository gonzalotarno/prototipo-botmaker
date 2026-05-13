/**
 * AgentsLogo — Brand lockup for the sidebar header.
 *
 * Design decisions:
 * - Gradient icon uses a two-stop blue → indigo sweep to feel premium without
 *   being generic. The subtle inner glow (box-shadow) adds depth without noise.
 * - The icon character is a stylised spark (⚡) rather than a plain "A" —
 *   it communicates intelligence/automation at a glance, consistent with the
 *   Botmaker product language already used in HubView.
 * - Typography hierarchy: product name in slate-800 semibold, sub-brand in
 *   slate-400 at 10px — enough contrast for legibility without competing with
 *   the nav items below.
 * - Border-bottom uses the brand-border token (#E2E7FF) so the lockup
 *   separates cleanly from the nav without a hard grey line.
 */

export default function AgentsLogo() {
  return (
    <div className="flex items-center gap-3 px-4 py-[14px] border-b border-[#E2E7FF] select-none">
      {/* Brand icon — rounded square with gradient + inner glow */}
      <div
        className="relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #304FFE 0%, #5B6EF5 55%, #7C5CFC 100%)',
          boxShadow: '0 2px 8px rgba(48, 79, 254, 0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        {/* Spark / bolt — represents AI automation */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9.5 1.5L4 9h5l-2.5 5.5L14 7H9L11.5 1.5z"
            fill="white"
            fillOpacity="0.95"
            strokeLinejoin="round"
          />
        </svg>

        {/* Subtle top-left highlight dot for premium feel */}
        <span
          className="absolute top-[3px] left-[3px] w-1 h-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.45)' }}
        />
      </div>

      {/* Text lockup */}
      <div className="flex flex-col leading-none gap-[3px]">
        <span className="text-[13px] font-semibold text-slate-800 tracking-tight leading-none">
          Agents
        </span>
        <span className="text-[10px] text-slate-400 leading-none tracking-wide font-medium uppercase">
          by Botmaker
        </span>
      </div>
    </div>
  )
}
