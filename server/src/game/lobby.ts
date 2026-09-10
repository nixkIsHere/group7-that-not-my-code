import type { LobbyUpdatePayload, Player, RoomStatus } from "../types"

/**
 * The single global lobby: every connected socket is one entry here.
 * Scores live in this in-memory map while a player is mid-round; they're
 * only written to TiDB (leaderboard_entries) once a player finishes, via
 * leaderboardRepo.insertResult (see game/round.ts).
 */

const players = new Map<string, Player>()
let hostId: string | null = null
let status: RoomStatus = "waiting"

export function addPlayer(id: string, alias: string): boolean {
  if (status !== "waiting") return false
  const existing = players.get(id)

  players.set(id, {
    id,

    alias,

    score: existing?.score ?? 0,

    answered: existing?.answered ?? 0,

    ready: existing?.ready ?? false,
  })
  hostId ??= id
  return true
}

export function removePlayer(id: string): void {
  players.delete(id)
  if (hostId === id) hostId = players.keys().next().value ?? null
  if (players.size === 0) status = "waiting"
}

export function setReady(id: string, ready: boolean): boolean {
  if (status !== "waiting") return false
  const p = players.get(id)
  if (!p) return false
  p.ready = ready
  return true
}

/** Reserve the room synchronously before loading questions. */
export function beginStarting(requesterId: string): boolean {
  if (
    status !== "waiting" ||
    requesterId !== hostId ||
    !getSnapshot().allReady
  ) {
    return false
  }
  status = "starting"
  return true
}

export function markPlaying(): boolean {
  if (status !== "starting") return false
  status = "playing"
  return true
}

export function markFinished(): boolean {
  if (status !== "playing") return false
  status = "finished"
  return true
}

/** Call after a failed start or after the completed round is cleared. */
export function reopen(): boolean {
  if (status !== "starting" && status !== "finished") return false
  status = "waiting"
  for (const p of players.values()) {
    p.ready = false
    p.score = 0
    p.answered = 0
  }
  return true
}

export function updateScore(id: string, score: number, answered: number): void {
  const p = players.get(id)

  if (p) {
    p.score = score

    p.answered = answered
  }
}

export function getPlayer(id: string): Player | undefined {
  return players.get(id)
}

export function getRoster(): Player[] {
  return [...players.values()]
    .map((p) => ({ ...p }))
    .sort((a, b) => b.score - a.score)
}

export function getSnapshot(): LobbyUpdatePayload {
  const roster = getRoster()
  const readyCount = roster.filter((p) => p.ready).length
  return {
    players: roster,
    hostId,
    status,
    readyCount,
    allReady: roster.length > 0 && readyCount === roster.length,
  }
}
