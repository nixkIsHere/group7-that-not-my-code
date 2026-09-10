import { useCallback, useEffect, useRef, useState } from "react"

import { LangContext, translations } from "./lib/i18n"

import { socket } from "./lib/socket"

import { HomeScreen } from "./screens/HomeScreen"

import { LobbyScreen } from "./screens/LobbyScreen"

import { GameScreen } from "./screens/GameScreen"

import { ReviewScreen } from "./screens/ReviewScreen"

import type {
  Lang,
  LobbyUpdatePayload,
  Player,
  RoundEndPayload,
  ScenarioPublic,
  Screen,
  Verdict,
} from "./types"

export default function App() {
  const [lang, setLang] = useState<Lang>("en")

  const t = translations[lang]

  const [screen, setScreen] = useState<Screen>("home")

  const [aliasInput, setAliasInput] = useState("")

  const [myId, setMyId] = useState("")

  const [lobbyPlayers, setLobbyPlayers] = useState<Player[]>([])
  const [room, setRoom] = useState<LobbyUpdatePayload>({
    players: [],
    hostId: null,
    status: "waiting",
    readyCount: 0,
    allReady: false,
  })
  const [startsAt, setStartsAt] = useState<number | null>(null)
  const [error, setError] = useState("")
  const joiningRef = useRef(false)

  const [currentScenario, setCurrentScenario] = useState<ScenarioPublic | null>(
    null,
  )

  const [currentIdx, setCurrentIdx] = useState(0)

  const [totalScenarios, setTotalScenarios] = useState(10)

  const [score, setScore] = useState(0)

  const [timeLimit, setTimeLimit] = useState(20)

  const [timeLeft, setTimeLeft] = useState(20)

  const [stunned, setStunned] = useState(false)

  const [stunCount, setStunCount] = useState(0)

  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null)

  const [answeredThisScenario, setAnsweredThisScenario] = useState(false)

  const [reviewData, setReviewData] = useState<RoundEndPayload | null>(null)

  const [reviewIdx, setReviewIdx] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)

      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(
    (limitSec: number) => {
      stopTimer()

      setTimeLeft(limitSec)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer()

            return 0
          }

          return prev - 1
        })
      }, 1000)
    },

    [stopTimer],
  )

  /* ── socket wiring — the server is the source of truth for scenarios, scoring and timing ── */

  useEffect(() => {
    function onConnect() {
      setMyId(socket.id ?? "")
    }

    function onLobbyUpdate(payload: LobbyUpdatePayload) {
      setLobbyPlayers(payload.players)
      setRoom(payload)
      if (payload.status !== "starting") setStartsAt(null)
    }
    function onCountdown({ startsAt }: { startsAt: number }) {
      setStartsAt(startsAt)
    }
    function onDisconnect() {
      stopTimer()
      joiningRef.current = false
      setMyId("")
      setScreen("home")
      setReviewData(null)
      setCurrentScenario(null)
      setLobbyPlayers([])
      setStartsAt(null)
      setError(
        "Connection lost. Please rejoin the room. / การเชื่อมต่อหลุด กรุณาเข้าห้องใหม่",
      )
    }
    function onConnectError() {
      setError("Cannot connect to the server. / เชื่อมต่อเซิร์ฟเวอร์ไม่ได้")
    }

    function onRoundStart({
      totalScenarios: total,
    }: {
      totalScenarios: number
    }) {
      setTotalScenarios(total)

      setScore(0)

      setStunCount(0)

      setStunned(false)

      setLastResult(null)
      setCurrentScenario(null)
      setAnsweredThisScenario(false)
      setStartsAt(null)
      setError("")
      setScreen("game")
    }

    function onRoundScenario({
      index,

      scenario,

      timeLimitSec,
    }: {
      index: number

      scenario: ScenarioPublic

      timeLimitSec: number
    }) {
      setCurrentScenario(scenario)

      setCurrentIdx(index)

      setStunned(false)

      setLastResult(null)

      setAnsweredThisScenario(false)

      setTimeLimit(timeLimitSec)

      startTimer(timeLimitSec)
    }

    function onRoundResult({
      correct,

      newScore,
    }: {
      correct: boolean

      scoreDelta: number

      newScore: number
    }) {
      stopTimer()

      setScore(newScore)

      setLastResult(correct ? "correct" : "wrong")

      if (!correct) {
        setStunned(true)

        setStunCount((c) => c + 1)
      }
    }

    function onRoundEnd(payload: RoundEndPayload) {
      stopTimer()

      setReviewData(payload)

      setReviewIdx(0)

      setScreen("review")
    }

    function onServerError({ message }: { message: string }) {
      setError(message)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)
    socket.on("lobby:countdown", onCountdown)
    socket.on("lobby:update", onLobbyUpdate)

    socket.on("round:start", onRoundStart)

    socket.on("round:scenario", onRoundScenario)

    socket.on("round:result", onRoundResult)

    socket.on("round:end", onRoundEnd)

    socket.on("server:error", onServerError)

    if (socket.id) setMyId(socket.id)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      socket.off("lobby:countdown", onCountdown)
      socket.off("lobby:update", onLobbyUpdate)

      socket.off("round:start", onRoundStart)

      socket.off("round:scenario", onRoundScenario)

      socket.off("round:result", onRoundResult)

      socket.off("round:end", onRoundEnd)

      socket.off("server:error", onServerError)
    }
  }, [startTimer, stopTimer])

  const handleAnswer = useCallback(
    (verdict: Verdict | null) => {
      if (!currentScenario || answeredThisScenario) return

      setAnsweredThisScenario(true)

      stopTimer()

      socket.emit("round:answer", { scenarioId: currentScenario.id, verdict })
    },

    [currentScenario, answeredThisScenario, stopTimer],
  )

  const handleAnswerClick = (verdict: Verdict) => {
    if (stunned || lastResult !== null) return

    handleAnswer(verdict)
  }

  /* auto-submit when the visible countdown runs out */

  useEffect(() => {
    if (
      screen === "game" &&
      timeLeft === 0 &&
      !stunned &&
      !lastResult &&
      !answeredThisScenario
    ) {
      handleAnswer(null)
    }
  }, [
    timeLeft,

    screen,

    stunned,

    lastResult,

    answeredThisScenario,

    handleAnswer,
  ])

  const handleStart = () => {
    if (!aliasInput.trim() || joiningRef.current) return
    if (!socket.connected) {
      setError("Cannot connect to the server. / เชื่อมต่อเซิร์ฟเวอร์ไม่ได้")
      return
    }
    joiningRef.current = true
    setError("")
    socket
      .timeout(5000)
      .emit("lobby:join", { alias: aliasInput.trim() }, (err, result) => {
        joiningRef.current = false
        if (err || !result?.ok) {
          if (err && socket.connected) socket.emit("lobby:leave")
          setError(
            result?.message ??
              "Could not join. Please try again. / เข้าห้องไม่สำเร็จ กรุณาลองใหม่",
          )
          return
        }
        setScreen("lobby")
      })
  }

  const handleLobbyReady = (ready: boolean) => {
    if (!socket.connected || room.status !== "waiting") return
    setError("")
    socket.emit("lobby:ready", { ready })
  }

  const handleRoomStart = () => {
    if (
      !socket.connected ||
      room.hostId !== myId ||
      !room.allReady ||
      room.status !== "waiting"
    )
      return
    setError("")
    socket.emit("lobby:start")
  }

  const handlePlayAgain = () => {
    handleLeaveLobby()
  }

  const handleLeaveLobby = () => {
    if (socket.connected) socket.emit("lobby:leave")
    stopTimer()
    setReviewData(null)
    setCurrentScenario(null)
    setStartsAt(null)
    setError("")
    setScreen("home")

    setAliasInput("")
  }

  const allPlayers = [...lobbyPlayers].sort((a, b) => b.score - a.score)

  const timerPct = (timeLeft / timeLimit) * 100

  const timerColor =
    timeLeft > 10 ? "var(--cyan)" : timeLeft > 5 ? "var(--amber)" : "var(--red)"

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="scanlines" />
      {error && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            maxWidth: "90vw",
            padding: 12,
            background: "var(--surface-2)",
            color: "var(--red)",
            border: "1px solid var(--red)",
          }}
        >
          {error}{" "}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}
      {screen === "home" && (
        <HomeScreen
          aliasInput={aliasInput}
          setAliasInput={setAliasInput}
          onStart={handleStart}
        />
      )}
      {screen === "lobby" && (
        <LobbyScreen
          players={lobbyPlayers}
          myId={myId}
          onReady={handleLobbyReady}
          room={room}
          startsAt={startsAt}
          onStart={handleRoomStart}
          onBack={handleLeaveLobby}
        />
      )}
      {screen === "game" && currentScenario && (
        <GameScreen
          scenario={currentScenario}
          currentIdx={currentIdx}
          totalScenarios={totalScenarios}
          score={score}
          timeLeft={timeLeft}
          timerPct={timerPct}
          timerColor={timerColor}
          stunned={stunned}
          stunCount={stunCount}
          lastResult={lastResult}
          allPlayers={allPlayers}
          myId={myId}
          onAnswer={handleAnswerClick}
        />
      )}
      {screen === "review" && reviewData && (
        <ReviewScreen
          scenarios={reviewData.scenarios}
          answers={reviewData.answers}
          score={score}
          correctCount={reviewData.answers.filter((a) => a.correct).length}
          stunCount={stunCount}
          allPlayers={reviewData.players}
          myId={myId}
          reviewIdx={reviewIdx}
          setReviewIdx={setReviewIdx}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </LangContext.Provider>
  )
}
