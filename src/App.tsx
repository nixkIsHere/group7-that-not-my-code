import { useCallback, useEffect, useRef, useState } from "react"
import { LangContext, translations } from "./lib/i18n"
import { socket } from "./lib/socket"
import { HomeScreen } from "./screens/HomeScreen"
import { LobbyScreen } from "./screens/LobbyScreen"
import { GameScreen } from "./screens/GameScreen"
import { ReviewScreen } from "./screens/ReviewScreen"
import type {
  Lang,
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
    function onLobbyUpdate({ players }: { players: Player[] }) {
      setLobbyPlayers(players)
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
      console.error("[server]", message)
    }

    socket.on("connect", onConnect)
    socket.on("lobby:update", onLobbyUpdate)
    socket.on("round:start", onRoundStart)
    socket.on("round:scenario", onRoundScenario)
    socket.on("round:result", onRoundResult)
    socket.on("round:end", onRoundEnd)
    socket.on("server:error", onServerError)

    if (socket.id) setMyId(socket.id)

    return () => {
      socket.off("connect", onConnect)
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
    if (!aliasInput.trim()) return
    socket.emit("lobby:join", { alias: aliasInput.trim() })
    setScreen("lobby")
  }

  const handleLobbyReady = () => {
    socket.emit("lobby:ready")
  }

  const handlePlayAgain = () => {
    setReviewData(null)
    setScreen("home")
    setAliasInput("")
  }

  const handleLeaveLobby = () => {
    socket.disconnect() // สั่ง disconnect เพื่อลบชื่อเราออกจากห้องบนเซิร์ฟเวอร์
    socket.connect()    // ต่อกลับเข้ามาใหม่เพื่อพร้อมเล่นรอบถัดไป
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
