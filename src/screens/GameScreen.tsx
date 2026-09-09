import { useEffect, useState } from "react"
import {
  BoltIcon,
  CheckIcon,
  XMarkIcon,
  SignalIcon,
  BookOpenIcon,
  CodeBracketIcon,
  WindowIcon,
} from "@heroicons/react/24/outline"
import { useLang, LangToggle } from "../lib/i18n"
import { VerdictButton } from "../components/VerdictButton"
import { StunOverlay } from "../components/StunOverlay"
import { ResultFlash } from "../components/ResultFlash"
import { ScenarioUIRenderer } from "../components/ScenarioUIRenderer"
import type { Player, ScenarioPublic, Verdict } from "../types"

export function GameScreen({
  scenario,
  currentIdx,
  totalScenarios,
  score,
  timeLeft,
  timerPct,
  timerColor,
  stunned,
  stunCount,
  lastResult,
  allPlayers,
  myId,
  onAnswer,
}: {
  scenario: ScenarioPublic
  currentIdx: number
  totalScenarios: number
  score: number
  timeLeft: number
  timerPct: number
  timerColor: string
  stunned: boolean
  stunCount: number
  lastResult: "correct" | "wrong" | null
  allPlayers: Player[]
  myId: string
  onAnswer: (v: Verdict) => void
}) {
  const { lang, t } = useLang()
  const isTh = lang === "th"
  const monoF = isTh ? "var(--font-thai)" : "var(--font-mono)"
  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)"
  const typeLabel = isTh
    ? scenario.type === "backend"
      ? t.backend
      : t.frontend
    : scenario.type.toUpperCase()
  const title = isTh ? scenario.titleTh : scenario.titleEn
  const typeColor =
    scenario.type === "backend" ? "var(--green)" : "var(--magenta)"
  const typeBg =
    scenario.type === "backend" ? "rgba(0,255,65,0.15)" : "rgba(255,0,204,0.15)"
  const [showCode, setShowCode] = useState(false)
  const [showHint, setShowHint] = useState(false)

  /* reset view when scenario changes */
  useEffect(() => {
    setShowCode(false)
    setShowHint(false)
  }, [scenario.id])

  return (
    <div className="game-layout" style={{ background: "var(--background)" }}>
      {/* TOP BAR */}
      <div className="game-topbar topbar-inner">
        <span
          className="topbar-title"
          style={{
            fontFamily: displayF,
            fontSize: 13,
            color: "var(--magenta)",
            fontWeight: 700,
            letterSpacing: isTh ? "0.02em" : "0.1em",
          }}
        >
          {t.gameTitle}
        </span>
        <span
          className="topbar-meta"
          style={{
            fontFamily: monoF,
            fontSize: 12,
            color: "var(--muted-foreground)",
          }}
        >
          {t.scenario} {currentIdx + 1}
          {t.of}
          {totalScenarios} — {typeLabel}
        </span>
        <div className="topbar-right">
          {stunCount > 0 && (
            <span
              style={{
                fontFamily: monoF,
                fontSize: 12,
                color: "var(--red)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <BoltIcon style={{ width: 13, height: 13 }} />
              {t.stuns} {stunCount}
            </span>
          )}
          <span
            style={{
              fontFamily: displayF,
              fontSize: 14,
              color: "var(--amber)",
              fontWeight: 700,
            }}
          >
            {score.toLocaleString()} {t.pts}
          </span>
          <LangToggle />
        </div>
      </div>

      {/* CODE / UI PANEL */}
      <div
        className="game-code"
        style={{ padding: "var(--space-5)", gap: "var(--space-3)" }}
      >
        {/* scenario header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexWrap: "wrap",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: monoF,
              fontSize: 11,
              padding: "2px 8px",
              background: typeBg,
              border: `1px solid ${typeColor}`,
              color: typeColor,
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            {typeLabel}
          </span>
          <span
            style={{
              fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground)",
              flex: 1,
            }}
          >
            {title}
          </span>
          {/* UI/Code toggle — only for frontend scenarios */}
          {scenario.type === "frontend" && (
            <button
              onClick={() => setShowCode((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "transparent",
                border: `1px solid ${
                  showCode ? "var(--cyan)" : "var(--magenta)"
                }`,
                color: showCode ? "var(--cyan)" : "var(--magenta)",
                fontFamily: monoF,
                fontSize: 11,
                padding: "3px 10px",
                cursor: "pointer",
                letterSpacing: "0.08em",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {showCode ? (
                <>
                  <WindowIcon style={{ width: 13, height: 13 }} />
                  {t.viewUI}
                </>
              ) : (
                <>
                  <CodeBracketIcon style={{ width: 13, height: 13 }} />
                  {t.viewCode}
                </>
              )}
            </button>
          )}
        </div>

        {/* Scenario context brief */}
        <div
          style={{
            background: "rgba(0,245,255,0.04)",
            border: "1px solid rgba(0,245,255,0.2)",
            padding: "var(--space-3) var(--space-4)",
          }}
        >
          <div
            style={{
              fontFamily: monoF,
              fontSize: 10,
              color: "var(--cyan)",
              letterSpacing: isTh ? "0.03em" : "0.2em",
              marginBottom: "var(--space-2)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <BookOpenIcon style={{ width: 12, height: 12 }} />
            {t.scenarioContext}
          </div>
          <p
            style={{
              fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)",
              fontSize: isTh ? 14 : 13,
              color: "var(--foreground)",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {isTh ? scenario.contextTh : scenario.contextEn}
          </p>
          {/* Hint toggle */}
          <button
            onClick={() => setShowHint((v) => !v)}
            style={{
              marginTop: "var(--space-3)",
              background: "transparent",
              border: "none",
              color: "var(--amber)",
              fontFamily: monoF,
              fontSize: 11,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 5,
              letterSpacing: isTh ? "0.02em" : "0.08em",
            }}
          >
            <BoltIcon style={{ width: 12, height: 12 }} />
            {showHint ? t.hideHint : t.showHint}
          </button>
          {showHint && (
            <div
              className="animate-slide-in"
              style={{
                marginTop: "var(--space-2)",
                background: "rgba(255,204,0,0.07)",
                border: "1px solid rgba(255,204,0,0.3)",
                padding: "var(--space-3)",
                fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)",
                fontSize: isTh ? 14 : 12,
                color: "var(--amber)",
                lineHeight: 1.7,
              }}
            >
              {isTh ? scenario.hintTh : scenario.hintEn}
            </div>
          )}
        </div>

        {/* Content: rendered UI or code */}
        {scenario.type === "frontend" && !showCode ? (
          <div
            style={{
              flex: 1,
              overflow: "auto",
              border: "1px solid var(--border-bright)",
              background: "#f5f5f5",
              minHeight: 220,
              position: "relative",
            }}
          >
            {/* browser chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "8px 12px",
                background: "#e0e0e0",
                borderBottom: "1px solid #ccc",
              }}
            >
              {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: 4,
                  padding: "3px 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#888",
                  marginLeft: 8,
                }}
              >
                https://app.example.com
              </div>
            </div>
            {/* rendered UI */}
            <div style={{ padding: "var(--space-6)" }}>
              <ScenarioUIRenderer id={scenario.id} />
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-bright)",
              flex: 1,
              overflow: "auto",
              minHeight: 200,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "7px 12px",
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["var(--red)", "var(--amber)", "var(--green)"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.7,
                  }}
                />
              ))}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  marginLeft: 8,
                }}
              >
                {scenario.type === "backend" ? t.serverFile : t.componentFile}
              </span>
            </div>
            <pre
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--foreground)",
                padding: "var(--space-4)",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowX: "auto",
              }}
            >
              {scenario.code}
            </pre>
          </div>
        )}
      </div>

      {/* LEADERBOARD SIDEBAR */}
      <div className="game-sidebar">
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--border)",
            fontFamily: monoF,
            fontSize: 11,
            color: "var(--cyan)",
            letterSpacing: isTh ? "0.04em" : "0.2em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <SignalIcon style={{ width: 13, height: 13 }} />
          {t.liveRankings}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "var(--space-2)" }}>
          {allPlayers.map((p, rank) => (
            <div
              key={p.id}
              className="lb-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-3)",
                marginBottom: "var(--space-1)",
                background:
                  p.id === myId ? "rgba(0,245,255,0.07)" : "transparent",
                border:
                  p.id === myId
                    ? "1px solid rgba(0,245,255,0.3)"
                    : "1px solid transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    rank === 0
                      ? "var(--amber)"
                      : rank === 1
                        ? "#aaa"
                        : rank === 2
                          ? "#cd7f32"
                          : "var(--muted-foreground)",
                  minWidth: 22,
                }}
              >
                #{rank + 1}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: p.id === myId ? "var(--cyan)" : "var(--foreground)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.alias}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--amber)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div
        className="game-controls"
        style={{ padding: "var(--space-4) var(--space-5)" }}
      >
        <div style={{ marginBottom: "var(--space-3)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontFamily: monoF,
                fontSize: 11,
                color: "var(--muted-foreground)",
              }}
            >
              {t.timeRemaining}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: 700,
                color: timerColor,
                textShadow: `0 0 8px ${timerColor}`,
              }}
            >
              {timeLeft}s
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: "var(--surface-3)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${timerPct}%`,
                background: timerColor,
                boxShadow: `0 0 6px ${timerColor}`,
                transition: "width 1s linear, background 0.5s",
              }}
            />
          </div>
        </div>

        {stunned ? (
          <StunOverlay />
        ) : lastResult ? (
          <ResultFlash result={lastResult} />
        ) : (
          <div className="verdict-grid">
            <VerdictButton
              label={t.complyLabel}
              sublabel={t.complySub}
              color="var(--green)"
              glow="var(--glow-green)"
              Icon={CheckIcon}
              onClick={() => onAnswer("comply")}
              lang={lang}
            />
            <VerdictButton
              label={t.violateLabel}
              sublabel={t.violateSub}
              color="var(--red)"
              glow="var(--glow-red)"
              Icon={XMarkIcon}
              onClick={() => onAnswer("violate")}
              lang={lang}
            />
          </div>
        )}
      </div>
    </div>
  )
}
