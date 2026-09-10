import type { Server } from "socket.io"
import { pickRandomTen } from "../db/repositories/scenariosRepo"
import { insertResult } from "../db/repositories/leaderboardRepo"
import { logAnswer } from "../db/repositories/answerLogRepo"
import * as lobby from "./lobby"
import {
  computeScore,
  ROUND_TIME_SEC,
  CORRECT_ADVANCE_DELAY_MS,
  STUN_MS,
} from "./scoring"
import { toScenarioPublic } from "../types"
import type { Answer, Scenario, Verdict } from "../types"

interface PlayerRound {
  scenarios: Scenario[]
  index: number
  sentAt: number
  score: number
  correctCount: number
  stunCount: number
  answers: Answer[]
  answeredCurrent: boolean
  timeoutHandle: ReturnType<typeof setTimeout> | null
  advanceHandle: ReturnType<typeof setTimeout> | null
}

/**
 * Each player progresses through their own 10 scenarios at their own pace
 * (matches proposal §2.2: "immediately serves the next scenario ... without
 * waiting for other players"). Only score updates are broadcast to the
 * shared lobby; the per-player question sequence stays private to that
 * socket's room (Socket.IO auto-joins every socket to a room named after
 * its own id).
 */
const activeRounds = new Map<string, PlayerRound>()

export async function startRoundForPlayer(
  io: Server,
  socketId: string,
): Promise<void> {
  if (activeRounds.has(socketId)) return // ignore duplicate "ready" clicks

  const scenarios = await pickRandomTen()
  const state: PlayerRound = {
    scenarios,
    index: 0,
    sentAt: 0,
    score: 0,
    correctCount: 0,
    stunCount: 0,
    answers: [],
    answeredCurrent: false,
    timeoutHandle: null,
    advanceHandle: null,
  }
  activeRounds.set(socketId, state)

  io.to(socketId).emit("round:start", { totalScenarios: scenarios.length })
  sendScenario(io, socketId)
}

function sendScenario(io: Server, socketId: string): void {
  const state = activeRounds.get(socketId)
  if (!state) return

  const scenario = state.scenarios[state.index]
  state.sentAt = Date.now()
  state.answeredCurrent = false
  io.to(socketId).emit("round:scenario", {
    index: state.index,
    scenario: toScenarioPublic(scenario),
    timeLimitSec: ROUND_TIME_SEC,
  })

  // Server-side backstop: if the player never answers, treat it as a timeout.
  state.timeoutHandle = setTimeout(
    () => {
      handleAnswer(io, socketId, scenario.id, null)
    },
    (ROUND_TIME_SEC + 2) * 1000,
  )
}

export function handleAnswer(
  io: Server,
  socketId: string,
  scenarioId: number,
  verdict: Verdict | null,
): void {
  const state = activeRounds.get(socketId)
  if (!state || state.answeredCurrent) return

  const scenario = state.scenarios[state.index]
  if (!scenario || scenario.id !== scenarioId) return // stale/duplicate answer — ignore

  state.answeredCurrent = true
  if (state.timeoutHandle) {
    clearTimeout(state.timeoutHandle)
    state.timeoutHandle = null
  }

  const elapsedMs = Date.now() - state.sentAt
  const { correct, scoreDelta } = computeScore(
    verdict,
    scenario.answer,
    elapsedMs,
  )

  state.score += scoreDelta
  state.correctCount += correct ? 1 : 0
  if (!correct) state.stunCount += 1
  const given = verdict ?? "comply"
  state.answers.push({
    scenarioId: scenario.id,
    given,
    correct,
    timeMs: elapsedMs,
  })

  const player = lobby.getPlayer(socketId)
  logAnswer({
    alias: player?.alias ?? "player",
    scenarioId: scenario.id,
    given,
    correct,
    timeMs: elapsedMs,
  }).catch((err) => {
    console.error("[round] failed to log answer:", err)
  })

  lobby.updateScore(socketId, state.score, state.answers.length)
  io.emit("lobby:update", { players: lobby.getRoster() })

  io.to(socketId).emit("round:result", {
    correct,
    scoreDelta,
    newScore: state.score,
  })

  const delay = correct ? CORRECT_ADVANCE_DELAY_MS : STUN_MS
  state.advanceHandle = setTimeout(() => advance(io, socketId), delay)
}

function advance(io: Server, socketId: string): void {
  const state = activeRounds.get(socketId)
  if (!state) return

  state.index += 1
  if (state.index >= state.scenarios.length) {
    void finishRound(io, socketId)
  } else {
    sendScenario(io, socketId)
  }
}

async function finishRound(io: Server, socketId: string): Promise<void> {
  const state = activeRounds.get(socketId)
  if (!state) return

  const player = lobby.getPlayer(socketId)
  try {
    await insertResult({
      alias: player?.alias ?? "player",
      score: state.score,
      correctCount: state.correctCount,
      stunCount: state.stunCount,
    })
  } catch (err) {
    console.error("[round] failed to persist leaderboard entry:", err)
  }

  io.to(socketId).emit("round:end", {
    scenarios: state.scenarios,
    answers: state.answers,
    players: lobby.getRoster(),
  })

  activeRounds.delete(socketId)
}

/** Called on disconnect so a dropped player doesn't leave dangling timers. */
export function cancelRound(socketId: string): void {
  const state = activeRounds.get(socketId)
  if (!state) return
  if (state.timeoutHandle) clearTimeout(state.timeoutHandle)
  if (state.advanceHandle) clearTimeout(state.advanceHandle)
  activeRounds.delete(socketId)
}
