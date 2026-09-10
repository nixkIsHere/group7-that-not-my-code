import { useEffect, useState } from "react"
import {
  BookOpenIcon,
  CheckIcon,
  BoltIcon,
  XMarkIcon,
  SignalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"

import { useLang, LangToggle } from "../lib/i18n"

import { TerminalHeader } from "../components/TerminalHeader"

import type { LobbyUpdatePayload, Player } from "../types"

export function LobbyScreen({
  players,

  myId,

  onReady,

  onBack,
  room,
  startsAt,
  onStart,
}: {
  players: Player[]

  myId: string

  onReady: (ready: boolean) => void
  onBack: () => void
  room: LobbyUpdatePayload
  startsAt: number | null
  onStart: () => void
}) {
  const { lang, t } = useLang()

  const isTh = lang === "th"

  const monoF = isTh ? "var(--font-thai)" : "var(--font-mono)"

  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)"

  const pixelF = isTh ? "var(--font-thai)" : "var(--font-pixel)"

  const me = players.find((p) => p.id === myId)
  const isHost = room.hostId === myId
  const canReady = !!me && room.status === "waiting"
  const canStart = isHost && room.allReady && room.status === "waiting"
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (startsAt === null) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [startsAt])
  const countdown =
    startsAt === null ? null : Math.max(0, Math.ceil((startsAt - now) / 1000))

  /* briefing line icons */

  const briefingIcons = [BookOpenIcon, CheckIcon, BoltIcon, XMarkIcon]

  return (
    <div
      style={{
        minHeight: "100%",

        background: "var(--background)",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        padding: "var(--space-6) var(--space-5)",

        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <LangToggle />
      </div>

      <div
        style={{
          maxWidth: 520,

          width: "100%",

          position: "relative",

          zIndex: 1,
        }}
      >
        {/* ปุ่มย้อนกลับไปหน้าหลัก */}
        <button
          onClick={onBack}
          style={{
            background: "transparent",

            border: "1px solid var(--border)",

            color: "var(--muted-foreground)",

            fontFamily: monoF,

            fontSize: 12,

            padding: "6px 12px",

            marginBottom: "var(--space-3)",

            cursor: "pointer",

            display: "inline-flex",

            alignItems: "center",

            gap: 6,

            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--cyan)"

            e.currentTarget.style.borderColor = "var(--cyan)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted-foreground)"

            e.currentTarget.style.borderColor = "var(--border)"
          }}
        >
          <ArrowLeftIcon style={{ width: 14, height: 14 }} />
          {isTh ? "ย้อนกลับ" : "BACK"}
        </button>

        <TerminalHeader label={t.lobbyTitle} lang={lang} />
        <p role="status" style={{ color: "var(--cyan)", fontFamily: monoF }}>
          {room.status === "starting"
            ? countdown !== null
              ? `${isTh ? "เริ่มใน" : "Starting in"} ${countdown}`
              : isTh
                ? "กำลังโหลดโจทย์…"
                : "Loading questions…"
            : `${
                isTh ? "พร้อม" : "Ready"
              } ${room.readyCount}/${players.length} — ${
                room.allReady
                  ? isHost
                    ? isTh
                      ? "กดเริ่มเกมได้เลย"
                      : "You can start the game"
                    : isTh
                      ? "รอเจ้าของห้องเริ่มเกม"
                      : "Waiting for the host to start"
                  : isTh
                    ? "รอทุกคนพร้อม"
                    : "Waiting for everyone to be ready"
              }`}
        </p>

        <div style={{ margin: "var(--space-5) 0" }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              className="animate-slide-in"
              style={{
                display: "flex",

                alignItems: "center",

                gap: "var(--space-4)",

                padding: "var(--space-4) var(--space-5)",

                marginBottom: "var(--space-2)",

                background:
                  p.id === myId ? "rgba(0,245,255,0.06)" : "var(--surface-1)",

                border:
                  p.id === myId
                    ? "1px solid var(--cyan)"
                    : "1px solid var(--border)",

                animationDelay: `${i * 0.1}s`,
              }}
            >
              <SignalIcon
                style={{
                  width: 14,

                  height: 14,

                  color: "var(--green)",

                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: monoF,

                  color: p.id === myId ? "var(--cyan)" : "var(--foreground)",

                  flex: 1,

                  fontSize: 14,
                }}
              >
                {p.alias}
                {p.id === room.hostId && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: "var(--amber)",
                    }}
                  >
                    {isTh ? "เจ้าของห้อง" : "HOST"}
                  </span>
                )}
                {p.id === myId && (
                  <span
                    style={{
                      color: "var(--cyan-dim)",

                      fontSize: 11,

                      marginLeft: 8,
                    }}
                  >
                    {t.you}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontFamily: monoF,

                  color: p.ready ? "var(--green)" : "var(--muted-foreground)",

                  fontSize: 12,
                }}
              >
                {p.ready ? t.ready : ""}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "var(--surface-2)",

            border: "1px solid var(--border)",

            padding: "var(--space-5)",

            marginBottom: "var(--space-6)",
          }}
        >
          <div
            style={{
              fontFamily: pixelF,

              fontSize: isTh ? 14 : 15,

              color: "var(--amber)",

              marginBottom: "var(--space-3)",
            }}
          >
            {t.briefingLabel}
          </div>
          {t.briefingLines.map((line, i) => {
            const Icon = briefingIcons[i]

            const isWarning = i === 3

            return (
              <div
                key={i}
                style={{
                  display: "flex",

                  alignItems: "flex-start",

                  gap: "var(--space-3)",

                  marginBottom: 6,
                }}
              >
                <Icon
                  style={{
                    width: 14,

                    height: 14,

                    color: isWarning ? "var(--red)" : "var(--cyan-dim)",

                    flexShrink: 0,

                    marginTop: 3,
                  }}
                />
                <span
                  style={{
                    fontFamily: pixelF,

                    fontSize: isTh ? 14 : 16,

                    lineHeight: 1.6,

                    color: isWarning ? "var(--red)" : "var(--foreground)",

                    opacity: 0.85,
                  }}
                >
                  {line}
                </span>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onReady(!me?.ready)}
          disabled={!canReady}
          aria-pressed={!!me?.ready}
          style={{
            width: "100%",
            opacity: canReady ? 1 : 0.5,
            background: "var(--cyan)",

            color: "var(--background)",

            border: "none",

            fontFamily: displayF,

            fontSize: isTh ? 16 : 15,

            fontWeight: 700,

            padding: "var(--space-5)",

            cursor: "pointer",

            letterSpacing: isTh ? "0.04em" : "0.15em",

            boxShadow: "var(--glow-cyan)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: "var(--space-3)",
          }}
        >
          <CheckIcon style={{ width: 18, height: 18 }} />
          {me?.ready
            ? isTh
              ? "ยกเลิกพร้อม"
              : "CANCEL READY"
            : isTh
              ? "พร้อม"
              : "READY"}
        </button>
        {isHost && (
          <button
            disabled={!canStart}
            onClick={onStart}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 16,
              fontFamily: displayF,
              background: "var(--amber)",
              color: "var(--background)",
              border: "none",
              opacity: canStart ? 1 : 0.5,
              cursor: canStart ? "pointer" : "not-allowed",
            }}
          >
            {isTh ? "เริ่มเกม" : "START GAME"}
          </button>
        )}
      </div>
    </div>
  )
}
