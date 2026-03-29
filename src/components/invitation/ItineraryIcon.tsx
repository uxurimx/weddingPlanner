type SvgProps = { size?: number }

function Svg({ children, size = 26 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function Church({ size }: SvgProps) {
  return (
    <Svg size={size}>
      <line x1="16" y1="2" x2="16" y2="9" strokeWidth="1.3" />
      <line x1="13" y1="4.5" x2="19" y2="4.5" strokeWidth="1.3" />
      <path d="M5,17 L16,9 L27,17" strokeWidth="1.2" />
      <line x1="5" y1="17" x2="5" y2="30" strokeWidth="1.2" />
      <line x1="27" y1="17" x2="27" y2="30" strokeWidth="1.2" />
      <line x1="5" y1="30" x2="27" y2="30" strokeWidth="1.2" />
      <path d="M13,30 V24 Q16,21 19,24 V30" strokeWidth="1" />
    </Svg>
  )
}

function Champagne({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Left flute */}
      <path d="M8,5 H13 L11.5,18 H9.5 Z" strokeWidth="1.1" />
      <line x1="10.5" y1="18" x2="10.5" y2="24" strokeWidth="1" />
      <line x1="7.5" y1="24" x2="13.5" y2="24" strokeWidth="1.1" />
      {/* Right flute */}
      <path d="M19,5 H24 L22.5,18 H20.5 Z" strokeWidth="1.1" />
      <line x1="21.5" y1="18" x2="21.5" y2="24" strokeWidth="1" />
      <line x1="18.5" y1="24" x2="24.5" y2="24" strokeWidth="1.1" />
      {/* Clink */}
      <line x1="13" y1="6.5" x2="16" y2="4.5" strokeWidth="0.9" />
      <line x1="19" y1="6.5" x2="16" y2="4.5" strokeWidth="0.9" />
      {/* Bubbles */}
      <circle cx="10" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="14" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="22" cy="11" r="0.7" fill="currentColor" stroke="none" />
    </Svg>
  )
}

function Dinner({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Fork */}
      <line x1="11" y1="6" x2="11" y2="28" strokeWidth="1.1" />
      <line x1="9" y1="6" x2="9" y2="13" strokeWidth="0.9" />
      <line x1="13" y1="6" x2="13" y2="13" strokeWidth="0.9" />
      <path d="M9,13 Q11,15.5 13,13" strokeWidth="0.9" fill="none" />
      {/* Knife */}
      <line x1="21" y1="6" x2="21" y2="28" strokeWidth="1.1" />
      <path d="M21,6 C24.5,9 24.5,15 21,17" strokeWidth="1" fill="none" />
    </Svg>
  )
}

function Dance({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Head */}
      <circle cx="20" cy="7" r="3" strokeWidth="1.2" />
      {/* Body */}
      <path d="M20,10 Q18,15 16,18" strokeWidth="1.2" />
      {/* Arm up */}
      <path d="M20,12 Q23,10 26,7" strokeWidth="1.1" />
      {/* Arm side */}
      <path d="M19,13 Q16,15 13,16" strokeWidth="1.1" />
      {/* Skirt / legs */}
      <path d="M16,18 Q12,23 10,28" strokeWidth="1.2" />
      <path d="M16,18 Q19,22 22,27" strokeWidth="1.2" />
    </Svg>
  )
}

function Cake({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Candle */}
      <line x1="16" y1="5" x2="16" y2="10" strokeWidth="1.2" />
      {/* Flame */}
      <path d="M14.5,5 Q16,2 17.5,5 Q16,4 14.5,5 Z" strokeWidth="0.9" />
      {/* Top tier */}
      <rect x="12" y="10" width="8" height="6" rx="1" strokeWidth="1.1" />
      {/* Middle tier */}
      <rect x="8" y="16" width="16" height="7" rx="1" strokeWidth="1.1" />
      {/* Bottom tier */}
      <rect x="4" y="23" width="24" height="7" rx="1" strokeWidth="1.2" />
      {/* Decoration dots on tiers */}
      <circle cx="16" cy="27" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="20" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="21" cy="20" r="0.8" fill="currentColor" stroke="none" />
    </Svg>
  )
}

function Camera({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Body */}
      <rect x="3" y="11" width="26" height="18" rx="2.5" strokeWidth="1.2" />
      {/* Viewfinder hump */}
      <path d="M11,11 V8 H21 V11" strokeWidth="1.1" />
      {/* Lens outer */}
      <circle cx="16" cy="20" r="6" strokeWidth="1.2" />
      {/* Lens inner */}
      <circle cx="16" cy="20" r="3" strokeWidth="0.8" />
      {/* Flash */}
      <circle cx="25" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  )
}

function Music({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Note heads */}
      <ellipse cx="10" cy="26" rx="3.5" ry="2.5" fill="currentColor" stroke="none" transform="rotate(-10 10 26)" />
      <ellipse cx="22" cy="23" rx="3.5" ry="2.5" fill="currentColor" stroke="none" transform="rotate(-10 22 23)" />
      {/* Stems */}
      <line x1="13" y1="25" x2="13" y2="11" strokeWidth="1.2" />
      <line x1="25" y1="22" x2="25" y2="8" strokeWidth="1.2" />
      {/* Beam */}
      <path d="M13,11 L25,8" strokeWidth="1.4" />
    </Svg>
  )
}

function Moon({ size }: SvgProps) {
  return (
    <Svg size={size}>
      <path
        d="M22,5 C13,7 8,13 8,19 C8,25 13,29 20,29 C14,27 10,23 10,18 C10,12 15,7 22,5 Z"
        strokeWidth="1.2"
      />
      {/* Stars */}
      <circle cx="25" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="28" cy="19" r="0.7" fill="currentColor" stroke="none" />
    </Svg>
  )
}

function Rose({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Stem */}
      <path d="M16,29 V18" strokeWidth="1.2" />
      {/* Leaves */}
      <path d="M16,24 Q11,21 10,25 Q13,24 16,24" strokeWidth="0.9" fill="none" />
      <path d="M16,24 Q21,21 22,25 Q19,24 16,24" strokeWidth="0.9" fill="none" />
      {/* Bloom */}
      <circle cx="16" cy="12" r="5.5" strokeWidth="1.2" />
      {/* Inner petals */}
      <path d="M13,9.5 Q16,7 19,9.5" strokeWidth="0.9" fill="none" />
      <path d="M11.5,13 Q13,9 16,10 Q19,9 20.5,13" strokeWidth="0.9" fill="none" />
      <circle cx="16" cy="12" r="1.5" strokeWidth="0.8" />
    </Svg>
  )
}

function Car({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Body */}
      <path d="M3,20 H29 V26 H3 Z" strokeWidth="1.2" />
      {/* Cabin */}
      <path d="M7,20 L10,13 H22 L25,20" strokeWidth="1.2" />
      {/* Windows */}
      <path d="M11,14 H15 V19 H11 Z" strokeWidth="0.9" rx="0.5" />
      <path d="M17,14 H21 V19 H17 Z" strokeWidth="0.9" />
      {/* Wheels */}
      <circle cx="9" cy="26" r="4" strokeWidth="1.2" />
      <circle cx="23" cy="26" r="4" strokeWidth="1.2" />
      <circle cx="9" cy="26" r="1.5" strokeWidth="0.8" />
      <circle cx="23" cy="26" r="1.5" strokeWidth="0.8" />
    </Svg>
  )
}

function Plane({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Fuselage */}
      <path d="M3,16 Q5,13 28,14 Q30,16 28,19 Q5,19 3,16 Z" strokeWidth="1.1" />
      {/* Main wing */}
      <path d="M10,14 L15,5 L22,14" strokeWidth="1.2" />
      {/* Tail fin */}
      <path d="M4,15 L4,10 L9,14" strokeWidth="1" />
      {/* Tail horizontal */}
      <path d="M6,18 L10,21 L13,18" strokeWidth="1" />
    </Svg>
  )
}

function Rings({ size }: SvgProps) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="19" r="7.5" strokeWidth="1.3" />
      <circle cx="20" cy="19" r="7.5" strokeWidth="1.3" />
      {/* Diamond */}
      <path d="M14,10 L16,7 L18,10 L16,13 Z" strokeWidth="1" />
    </Svg>
  )
}

function Party({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Party popper body */}
      <path d="M4,28 L10,26 L6,22 Z" strokeWidth="1" fill="none" />
      <path d="M4,28 L20,12" strokeWidth="1.3" />
      {/* Streamers */}
      <path d="M20,12 Q24,8 22,5" strokeWidth="1" fill="none" />
      <path d="M20,12 Q26,14 28,11" strokeWidth="1" fill="none" />
      {/* Confetti */}
      <circle cx="25" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="27" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <line x1="22" y1="20" x2="25" y2="18" strokeWidth="1" />
      <line x1="17" y1="5" x2="20" y2="7" strokeWidth="1" />
    </Svg>
  )
}

function Arch({ size }: SvgProps) {
  return (
    <Svg size={size}>
      {/* Left pillar */}
      <line x1="6" y1="30" x2="6" y2="14" strokeWidth="1.3" />
      {/* Right pillar */}
      <line x1="26" y1="30" x2="26" y2="14" strokeWidth="1.3" />
      {/* Arch */}
      <path d="M6,14 Q16,4 26,14" strokeWidth="1.3" fill="none" />
      {/* Flower left */}
      <circle cx="6" cy="14" r="3" strokeWidth="0.9" />
      {/* Flower right */}
      <circle cx="26" cy="14" r="3" strokeWidth="0.9" />
      {/* Top center */}
      <circle cx="16" cy="5" r="2.5" strokeWidth="0.9" />
      {/* Hanging greenery */}
      <path d="M6,18 Q9,22 8,26" strokeWidth="0.8" fill="none" />
      <path d="M26,18 Q23,22 24,26" strokeWidth="0.8" fill="none" />
    </Svg>
  )
}

function DefaultDot({ size }: SvgProps) {
  return (
    <Svg size={size}>
      <circle cx="16" cy="16" r="5" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="1.8" fill="currentColor" stroke="none" />
    </Svg>
  )
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────

type IconRenderer = (size?: number) => React.ReactElement

const iconMap: Record<string, IconRenderer> = {
  '⛪': s => <Church size={s} />,
  '🕍': s => <Church size={s} />,
  '🥂': s => <Champagne size={s} />,
  '🍽️': s => <Dinner size={s} />,
  '💃': s => <Dance size={s} />,
  '🕺': s => <Dance size={s} />,
  '🎂': s => <Cake size={s} />,
  '📸': s => <Camera size={s} />,
  '📷': s => <Camera size={s} />,
  '🎵': s => <Music size={s} />,
  '🎶': s => <Music size={s} />,
  '🌙': s => <Moon size={s} />,
  '🌹': s => <Rose size={s} />,
  '🚗': s => <Car size={s} />,
  '✈️': s => <Plane size={s} />,
  '💑': s => <Rings size={s} />,
  '💍': s => <Rings size={s} />,
  '🎉': s => <Party size={s} />,
  '🎊': s => <Party size={s} />,
  '🏛️': s => <Arch size={s} />,
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  icon: string | null
  size?: number
}

export default function ItineraryIcon({ icon, size = 26 }: Props) {
  if (!icon) return <DefaultDot size={size} />
  const renderer = iconMap[icon]
  if (!renderer) return <span style={{ fontSize: size * 0.65, lineHeight: 1 }}>{icon}</span>
  return renderer(size)
}
