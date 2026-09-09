import type { ReactNode } from "react"

export function Badge({
  bg,
  border,
  color,
  font,
  children,
}: {
  bg: string
  border: string
  color: string
  font: string
  children: ReactNode
}) {
  return (
    <span
      style={{
        fontFamily: font,
        fontSize: 11,
        padding: "3px 9px",
        background: bg,
        border: `1px solid ${border}`,
        color,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  )
}
