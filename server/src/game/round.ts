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

/** One shared question order; players advance independently after a common start. */
export function createRoundManager(
  services = { pickRandomTen, insertResult, logAnswer },
  countdownMs = 3000,
) {
  const activeRounds = new Map<string, PlayerRound>()
  let pendingStart: { timer: ReturnType<typeof setTimeout> | null } | null =
    null

  async function startRoom(io: Server, requesterId: string): Promise<void> {
    if (!lobby.beginStarting(requesterId)) {
      io.to(requesterId).emit("server:error", {
        message: "Only the host can start when everyone is ready.",
      })
      return
    }
    const attempt = { timer: null as ReturnType<typeof setTimeout> | null }
    pendingStart = attempt
    io.emit("lobby:update", lobby.getSnapshot())
    try {
      const scenarios = await services.pickRandomTen()
      if (pendingStart !== attempt) return
      if (!scenarios.length) throw new Error("No scenarios available")
      const startsAt = Date.now() + countdownMs
      io.emit("lobby:countdown", { startsAt })
      attempt.timer = setTimeout(() => {
        if (pendingStart !== attempt) return
        pendingStart = null
        if (!lobby.markPlaying()) return
        const roster = lobby.getRoster()
        // Create every state before sending the first question to anyone.
        for (const player of roster) initializePlayer(player.id, scenarios)
        io.emit("lobby:update", lobby.getSnapshot())
        for (const player of roster) {
          io.to(player.id).emit("round:start", {
            totalScenarios: scenarios.length,
          })
          sendScenario(io, player.id)
        }
      }, countdownMs)
    } catch (err) {
      if (pendingStart !== attempt) return
      console.error("[round] failed to load questions:", err)
      abortStart(io)
      for (const player of lobby.getRoster()) {
        io.to(player.id).emit("server:error", {
          message: "Could not load questions. Please ready up and try again.",
        })
      }
    }
  }

  function abortStart(io: Server): void {
    if (!pendingStart) return
    if (pendingStart.timer) clearTimeout(pendingStart.timer)
    pendingStart = null
    lobby.reopen()
    io.emit("lobby:update", lobby.getSnapshot())
  }

  function initializePlayer(socketId: string, scenarios: Scenario[]): void {
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
    lobby.updateScore(socketId, 0, 0)
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

  function handleAnswer(
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

    services
      .logAnswer({
        alias: player?.alias ?? "player",

        scenarioId: scenario.id,

        given,

        correct,

        timeMs: elapsedMs,
      })
      .catch((err) => {
        console.error("[round] failed to log answer:", err)
      })

    lobby.updateScore(socketId, state.score, state.answers.length)

    io.emit("lobby:update", lobby.getSnapshot())

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
      await services.insertResult({
        alias: player?.alias ?? "player",

        score: state.score,

        correctCount: state.correctCount,

        stunCount: state.stunCount,
      })
    } catch (err) {
      console.error("[round] failed to persist leaderboard entry:", err)
    }

    // A disconnect/rejoin while persistence is pending must not affect a new round.
    if (activeRounds.get(socketId) !== state) return
    io.to(socketId).emit("round:end", {
      scenarios: state.scenarios,

      answers: state.answers,

      players: lobby.getRoster(),
    })

    activeRounds.delete(socketId)
    reopenIfComplete(io)
  }

  function reopenIfComplete(io: Server): void {
    if (activeRounds.size > 0 || !lobby.markFinished()) return
    io.emit("lobby:update", lobby.getSnapshot())
    lobby.reopen()
    io.emit("lobby:update", lobby.getSnapshot())
  }

  /** Called on disconnect so a dropped player doesn't leave dangling timers. */

  function cancelRound(io: Server, socketId: string): void {
    if (lobby.getPlayer(socketId)) abortStart(io)
    const state = activeRounds.get(socketId)
    if (!state) return

    if (state.timeoutHandle) clearTimeout(state.timeoutHandle)

    if (state.advanceHandle) clearTimeout(state.advanceHandle)

    activeRounds.delete(socketId)
    reopenIfComplete(io)
  }

  return { startRoom, handleAnswer, cancelRound }
}

export const { startRoom, handleAnswer, cancelRound } = createRoundManager()
