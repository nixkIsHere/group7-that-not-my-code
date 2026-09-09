import { useState, type ElementType } from "react"
import type { Lang } from "../types"

export function VerdictButton({
  label,
  sublabel,
  color,
  glow,
  Icon,
  onClick,
  lang,
}: {
  label: string
  sublabel: string
  color: string
  glow: string
  Icon: ElementType
  onClick: () => void
  lang: Lang
}) {
  const isTh = lang === "th"
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? `${color}22` : "transparent",
        border: `2px solid ${color}`,
        color,
        fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)",
        fontSize: 15,
        fontWeight: 700,
        padding: "var(--space-4)",
        cursor: "pointer",
        letterSpacing: isTh ? "0.02em" : "0.08em",
        boxShadow: hover ? glow : "none",
        transition: "all 0.15s",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
        {label}
      </div>
      <div
        style={{
          fontFamily: isTh ? "var(--font-thai)" : "var(--font-pixel)",
          fontSize: 12,
          fontWeight: 400,
          opacity: 0.65,
          marginTop: 3,
        }}
      >
        {sublabel}
      </div>
    </button>
  )
}
