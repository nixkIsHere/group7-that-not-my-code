import { useEffect, useState, type CSSProperties } from "react"
import {
  BoltIcon,
  UsersIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  PlayIcon,
} from "@heroicons/react/24/outline"
import { useLang, LangToggle } from "../lib/i18n"

const TAG_ICONS = [BoltIcon, UsersIcon, ShieldCheckIcon, BookOpenIcon]

export function HomeScreen({
  aliasInput,
  setAliasInput,
  onStart,
}: {
  aliasInput: string
  setAliasInput: (v: string) => void
  onStart: () => void
}) {
  const { lang, t } = useLang()
  const isTh = lang === "th"
  const monoF = isTh ? "var(--font-thai)" : "var(--font-mono)"
  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)"
  const pixelF = isTh ? "var(--font-thai)" : "var(--font-pixel)"
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 500)
    return () => clearInterval(i)
  }, [])

  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8) var(--space-5)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* grid bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,245,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Lang toggle */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <LangToggle />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 580,
          width: "100%",
          paddingTop: 44,
        }}
      >
        <div
          style={{
            fontFamily: monoF,
            fontSize: isTh ? 12 : 11,
            color: "var(--cyan)",
            letterSpacing: isTh ? "0.04em" : "0.25em",
            marginBottom: "var(--space-4)",
            opacity: 0.8,
          }}
        >
          {t.systemBoot}
        </div>

        <h1
          style={{
            fontFamily: displayF,
            fontSize: "clamp(2rem, 8vw, 3.8rem)",
            fontWeight: 900,
            color: "var(--cyan)",
            textShadow: "var(--glow-cyan)",
            lineHeight: 1.15,
            marginBottom: "var(--space-1)",
            letterSpacing: isTh ? "0.02em" : "0.05em",
          }}
        >
          {t.titleLine1}
        </h1>
        <h1
          style={{
            fontFamily: displayF,
            fontSize: "clamp(2rem, 8vw, 3.8rem)",
            fontWeight: 900,
            color: "var(--magenta)",
            textShadow: "var(--glow-magenta)",
            lineHeight: 1.15,
            marginBottom: "var(--space-6)",
            letterSpacing: isTh ? "0.02em" : "0.05em",
          }}
        >
          {t.titleLine2}
        </h1>

        <p
          style={{
            fontFamily: pixelF,
            fontSize: isTh ? 16 : 19,
            color: "var(--foreground)",
            opacity: 0.75,
            marginBottom: "var(--space-8)",
            lineHeight: 1.8,
            whiteSpace: "pre-line",
          }}
        >
          {t.tagline}
        </p>

        {/* Feature tags with Heroicons */}
        <div className="tags-row" style={{ marginBottom: "var(--space-8)" }}>
          {t.tags.map((tag, i) => {
            const Icon = TAG_ICONS[i]
            return (
              <span
                key={tag}
                style={{
                  fontFamily: monoF,
                  fontSize: isTh ? 11 : 11,
                  padding: "5px 11px",
                  border: "1px solid var(--border-bright)",
                  color: "var(--cyan-dim)",
                  background: "rgba(0,245,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                {tag}
              </span>
            )
          })}
        </div>

        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-bright)",
            padding: "var(--space-6)",
            marginBottom: "var(--space-4)",
            boxShadow: "var(--glow-cyan)",
          }}
        >
          <label
            style={{
              fontFamily: monoF,
              fontSize: isTh ? 14 : 12,
              color: "var(--cyan)",
              letterSpacing: isTh ? "0.04em" : "0.2em",
              display: "block",
              marginBottom: "var(--space-3)",
            }}
          >
            {t.enterAlias}
          </label>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <input
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onStart()}
              placeholder={t.aliasPlaceholder}
              maxLength={20}
              style={{
                flex: 1,
                minWidth: 0,
                background: "var(--background)",
                border: "1px solid var(--border-bright)",
                color: "var(--green)",
                fontFamily: monoF,
                fontSize: 17,
                padding: "9px 12px",
                outline: "none",
              }}
            />
            <button
              onClick={onStart}
              disabled={!aliasInput.trim()}
              style={{
                background: aliasInput.trim() ? "var(--cyan)" : "transparent",
                border: "1px solid var(--cyan)",
                color: aliasInput.trim() ? "var(--background)" : "var(--cyan)",
                fontFamily: displayF,
                fontSize: isTh ? 14 : 13,
                fontWeight: 700,
                padding: "9px 18px",
                cursor: aliasInput.trim() ? "pointer" : "not-allowed",
                letterSpacing: isTh ? "0.02em" : "0.1em",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <PlayIcon style={{ width: 14, height: 14 }} />
              {t.join}
            </button>
          </div>
        </div>

        <div
          style={{
            fontFamily: pixelF,
            fontSize: isTh ? 14 : 15,
            color: "var(--muted-foreground)",
          }}
        >
          {tick % 2 === 0 ? t.readyA : t.readyB}
        </div>
      </div>

      {/* Corner decorations */}
      {([
        { top: 16, left: 16 },
        { top: 16, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ] as CSSProperties[]).map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            borderTop: i < 2 ? "2px solid var(--cyan)" : "none",
            borderBottom: i >= 2 ? "2px solid var(--cyan)" : "none",
            borderLeft: i % 2 === 0 ? "2px solid var(--cyan)" : "none",
            borderRight: i % 2 === 1 ? "2px solid var(--cyan)" : "none",
            opacity: 0.4,
            ...s,
          }}
        />
      ))}
    </div>
  )
}
