import type { Lang } from "../types"

export function TerminalHeader({ label, lang }: { label: string; lang: Lang }) {
  const isTh = lang === "th"
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        marginBottom: "var(--space-2)",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          background: "var(--cyan)",
          boxShadow: "var(--glow-cyan)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)",
          fontSize: 12,
          color: "var(--cyan)",
          letterSpacing: isTh ? "0.03em" : "0.18em",
          textTransform: "uppercase",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "var(--border)",
          flexShrink: 0,
        }}
      />
    </div>
  )
}
