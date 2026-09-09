import { useEffect, useState } from "react"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"
import {
  BoltIcon,
  BookOpenIcon,
  ScaleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CodeBracketIcon,
  WindowIcon,
} from "@heroicons/react/24/outline"
import { useLang, LangToggle } from "../lib/i18n"
import { TerminalHeader } from "../components/TerminalHeader"
import { Badge } from "../components/Badge"
import { ScenarioUIRenderer } from "../components/ScenarioUIRenderer"
import type { Answer, Player, Scenario } from "../types"

export function ReviewScreen({
  scenarios,
  answers,
  score,
  correctCount,
  stunCount,
  allPlayers,
  myId,
  reviewIdx,
  setReviewIdx,
  onPlayAgain,
}: {
  scenarios: Scenario[]
  answers: Answer[]
  score: number
  correctCount: number
  stunCount: number
  allPlayers: Player[]
  myId: string
  reviewIdx: number
  setReviewIdx: (i: number) => void
  onPlayAgain: () => void
}) {
  const { lang, t } = useLang()
  const isTh = lang === "th"
  const monoF = isTh ? "var(--font-thai)" : "var(--font-mono)"
  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)"
  const pixelF = isTh ? "var(--font-thai)" : "var(--font-pixel)"

  const [showCode, setShowCode] = useState(false)
  useEffect(() => {
    setShowCode(false)
  }, [reviewIdx])

  const myRank = allPlayers.findIndex((p) => p.id === myId) + 1
  const scenario = scenarios[reviewIdx]
  const answer = answers.find((a) => a.scenarioId === scenario.id)
  const isCorrect = answer?.correct ?? false
  const title = isTh ? scenario.titleTh : scenario.titleEn
  const expl = isTh ? scenario.explanationTh : scenario.explanationEn
  const typeLabel = isTh
    ? scenario.type === "backend"
      ? t.backend
      : t.frontend
    : scenario.type.toUpperCase()
  const typeColor =
    scenario.type === "backend" ? "var(--green)" : "var(--magenta)"
  const typeBg =
    scenario.type === "backend" ? "rgba(0,255,65,0.15)" : "rgba(255,0,204,0.15)"

  return (
    <div className="review-layout" style={{ background: "var(--background)" }}>
      {/* TOP BAR */}
      <div
        className="review-topbar topbar-inner"
        style={{ flexWrap: "wrap", gap: "var(--space-3)" }}
      >
        <span
          className="topbar-title"
          style={{
            fontFamily: displayF,
            fontSize: 13,
            color: "var(--magenta)",
            fontWeight: 700,
            letterSpacing: isTh ? "0.02em" : "0.08em",
          }}
        >
          {t.debrief}
        </span>
        <div
          className="topbar-right"
          style={{
            flex: 1,
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <span
            style={{ fontFamily: monoF, fontSize: 12, color: "var(--amber)" }}
          >
            {t.rank}
            {myRank}
          </span>
          <span
            style={{ fontFamily: monoF, fontSize: 12, color: "var(--cyan)" }}
          >
            {score.toLocaleString()} {t.pts}
          </span>
          <span
            style={{ fontFamily: monoF, fontSize: 12, color: "var(--green)" }}
          >
            {correctCount}/{scenarios.length} {t.correct}
          </span>
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
              <BoltIcon style={{ width: 12, height: 12 }} />
              {stunCount}
            </span>
          )}
          <LangToggle />
          <button
            onClick={onPlayAgain}
            style={{
              background: "transparent",
              border: "1px solid var(--cyan)",
              color: "var(--cyan)",
              fontFamily: monoF,
              fontSize: 12,
              padding: "5px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <ArrowPathIcon style={{ width: 13, height: 13 }} />
            {t.playAgain}
          </button>
        </div>
      </div>

      {/* CASE LIST */}
      <div className="review-sidebar">
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--border)",
            fontFamily: monoF,
            fontSize: 11,
            color: "var(--muted-foreground)",
            letterSpacing: isTh ? "0.03em" : "0.18em",
          }}
        >
          {t.caseFiles}
        </div>
        {scenarios.map((s, i) => {
          const a = answers.find((x) => x.scenarioId === s.id)
          const ok = a?.correct
          return (
            <button
              key={s.id}
              onClick={() => setReviewIdx(i)}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                background:
                  reviewIdx === i ? "rgba(0,245,255,0.07)" : "transparent",
                borderLeft:
                  reviewIdx === i
                    ? "2px solid var(--cyan)"
                    : "2px solid transparent",
                borderRight: "none",
                borderTop: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {ok ? (
                <CheckCircleIcon
                  style={{
                    width: 15,
                    height: 15,
                    color: "var(--green)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <XCircleIcon
                  style={{
                    width: 15,
                    height: 15,
                    color: "var(--red)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontFamily: monoF,
                    fontSize: 11,
                    color: ok ? "var(--green)" : "var(--red)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {isTh ? s.titleTh : s.titleEn}
                </div>
                <div
                  style={{
                    fontFamily: monoF,
                    fontSize: 10,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {isTh
                    ? s.type === "backend"
                      ? t.backend
                      : t.frontend
                    : s.type.toUpperCase()}
                </div>
              </div>
            </button>
          )
        })}

        <div
          style={{
            padding: "var(--space-4)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontFamily: monoF,
              fontSize: 10,
              color: "var(--muted-foreground)",
              letterSpacing: isTh ? "0.02em" : "0.18em",
              marginBottom: "var(--space-2)",
            }}
          >
            {t.finalRankings}
          </div>
          {allPlayers.map((p, rank) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "4px 0",
                fontFamily: monoF,
                fontSize: 11,
              }}
            >
              <span
                style={{
                  color:
                    rank === 0 ? "var(--amber)" : "var(--muted-foreground)",
                  minWidth: 22,
                }}
              >
                #{rank + 1}
              </span>
              <span
                style={{
                  flex: 1,
                  color: p.id === myId ? "var(--cyan)" : "var(--foreground)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.alias}
              </span>
              <span style={{ color: "var(--amber)" }}>
                {p.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FEEDBACK PANEL */}
      <div className="review-main" style={{ padding: "var(--space-5)" }}>
        <TerminalHeader
          label={`CASE ${reviewIdx + 1} — ${title}`}
          lang={lang}
        />

        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            margin: "var(--space-4) 0",
            flexWrap: "wrap",
          }}
        >
          <Badge bg={typeBg} border={typeColor} color={typeColor} font={monoF}>
            {typeLabel}
          </Badge>
          <Badge
            bg={
              scenario.answer === "comply"
                ? "rgba(0,255,65,0.15)"
                : "rgba(255,34,68,0.15)"
            }
            border={
              scenario.answer === "comply" ? "var(--green)" : "var(--red)"
            }
            color={scenario.answer === "comply" ? "var(--green)" : "var(--red)"}
            font={monoF}
          >
            {scenario.answer === "comply" ? t.compliesWith : t.violatesWith}
          </Badge>
          <Badge
            bg={isCorrect ? "rgba(0,245,255,0.1)" : "rgba(255,34,68,0.1)"}
            border={isCorrect ? "var(--cyan)" : "var(--red)"}
            color={isCorrect ? "var(--cyan)" : "var(--red)"}
            font={monoF}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {isCorrect ? (
                <CheckCircleIcon style={{ width: 12, height: 12 }} />
              ) : (
                <XCircleIcon style={{ width: 12, height: 12 }} />
              )}
              {t.yourAnswer} {isCorrect ? t.answerCorrect : t.answerWrong}
            </span>
          </Badge>
        </div>

        {/* Scenario context brief */}
        <div
          style={{
            background: "rgba(0,245,255,0.04)",
            border: "1px solid rgba(0,245,255,0.2)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
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
          <div
            style={{
              marginTop: "var(--space-3)",
              background: "rgba(255,204,0,0.07)",
              border: "1px solid rgba(255,204,0,0.3)",
              padding: "var(--space-3)",
              fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)",
              fontSize: isTh ? 14 : 12,
              color: "var(--amber)",
              lineHeight: 1.7,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <BoltIcon
              style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2 }}
            />
            <span>{isTh ? scenario.hintTh : scenario.hintEn}</span>
          </div>
        </div>

        {/* Code / UI preview with toggle for frontend scenarios */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          {/* toggle header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "5px 12px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderBottom: "none",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted-foreground)",
                flex: 1,
              }}
            >
              {scenario.type === "backend"
                ? t.serverFile
                : showCode
                  ? t.componentFile
                  : "preview.render"}
            </span>
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

          {scenario.type === "frontend" && !showCode ? (
            /* rendered UI */
            <div
              style={{
                border: "1px solid var(--border)",
                background: "#f5f5f5",
                maxHeight: 240,
                overflow: "auto",
              }}
            >
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
              <div style={{ padding: "var(--space-6)" }}>
                <ScenarioUIRenderer id={scenario.id} />
              </div>
            </div>
          ) : (
            /* code */
            <div
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: "var(--foreground)",
                  padding: "var(--space-4)",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {scenario.code}
              </pre>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div
          style={{
            background: "var(--surface-2)",
            border: `1px solid ${
              isCorrect ? "rgba(0,245,255,0.25)" : "rgba(255,34,68,0.25)"
            }`,
            padding: "var(--space-5)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              fontFamily: monoF,
              fontSize: 11,
              color: "var(--cyan)",
              letterSpacing: isTh ? "0.03em" : "0.18em",
              marginBottom: "var(--space-3)",
            }}
          >
            {t.pdpaAnalysis}
          </div>
          <p
            style={{
              fontFamily: isTh ? "var(--font-thai)" : pixelF,
              fontSize: isTh ? 15 : 17,
              lineHeight: 1.8,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {expl}
          </p>
        </div>

        {/* PDPA reference */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: monoF,
            fontSize: 11,
            padding: "5px 12px",
            background: "rgba(255,204,0,0.1)",
            border: "1px solid var(--amber)",
            color: "var(--amber)",
          }}
        >
          <ScaleIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
          {scenario.pdpaRef}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginTop: "var(--space-6)",
          }}
        >
          <button
            onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
            disabled={reviewIdx === 0}
            style={{
              background: "transparent",
              border: "1px solid var(--border-bright)",
              color: "var(--foreground)",
              fontFamily: monoF,
              fontSize: 12,
              padding: "var(--space-3) var(--space-5)",
              cursor: reviewIdx === 0 ? "not-allowed" : "pointer",
              opacity: reviewIdx === 0 ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <ChevronLeftIcon style={{ width: 15, height: 15 }} />
            {t.prev}
          </button>
          <button
            onClick={() =>
              setReviewIdx(Math.min(scenarios.length - 1, reviewIdx + 1))
            }
            disabled={reviewIdx === scenarios.length - 1}
            style={{
              background: "transparent",
              border: "1px solid var(--border-bright)",
              color: "var(--foreground)",
              fontFamily: monoF,
              fontSize: 12,
              padding: "var(--space-3) var(--space-5)",
              cursor:
                reviewIdx === scenarios.length - 1 ? "not-allowed" : "pointer",
              opacity: reviewIdx === scenarios.length - 1 ? 0.4 : 1,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {t.next}
            <ChevronRightIcon style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
