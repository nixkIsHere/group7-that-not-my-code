import { useEffect, useState } from "react"
import { BoltIcon } from "@heroicons/react/24/outline"
import { useLang } from "../lib/i18n"

export function StunOverlay() {
  const { lang, t } = useLang()
  const isTh = lang === "th"
  const [count, setCount] = useState(3)
  useEffect(() => {
    const iv = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(iv)
  }, [])
  return (
    <div
      className="animate-shake"
      style={{
        background: "rgba(255,34,68,0.1)",
        border: "2px solid var(--red)",
        padding: "var(--space-4)",
        textAlign: "center",
        boxShadow: "var(--glow-red)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)",
          fontSize: 20,
          color: "var(--red)",
          fontWeight: 700,
          letterSpacing: isTh ? "0.02em" : "0.1em",
        }}
      >
        <BoltIcon style={{ width: 20, height: 20 }} />
        {t.stunTitle} — {count}s
      </div>
      <div
        style={{
          fontFamily: isTh ? "var(--font-thai)" : "var(--font-pixel)",
          fontSize: 13,
          color: "var(--red)",
          opacity: 0.7,
          marginTop: 3,
        }}
      >
        {t.stunSub}
      </div>
    </div>
  )
}
