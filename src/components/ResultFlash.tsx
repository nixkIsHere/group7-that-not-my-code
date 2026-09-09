import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"
import { useLang } from "../lib/i18n"

export function ResultFlash({ result }: { result: "correct" | "wrong" }) {
  const { lang, t } = useLang()
  const isTh = lang === "th"
  const ok = result === "correct"
  const Icon = ok ? CheckCircleIcon : XCircleIcon
  return (
    <div
      className="animate-slide-in"
      style={{
        background: ok ? "rgba(0,255,65,0.1)" : "rgba(255,34,68,0.1)",
        border: `2px solid ${ok ? "var(--green)" : "var(--red)"}`,
        padding: "var(--space-4)",
        textAlign: "center",
        boxShadow: ok ? "var(--glow-green)" : "var(--glow-red)",
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
          color: ok ? "var(--green)" : "var(--red)",
          fontWeight: 700,
          letterSpacing: isTh ? "0.02em" : "0.12em",
        }}
      >
        <Icon style={{ width: 22, height: 22 }} />
        {ok ? t.correctFlash : t.wrongFlash}
      </div>
    </div>
  )
}
