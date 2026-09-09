import type { Player } from "../types"

/**
 * The single global lobby: every connected socket is one entry here.
 * Scores live in this in-memory map while a player is mid-round; they're
 * only written to TiDB (leaderboard_entries) once a player finishes, via
 * leaderboardRepo.insertResult (see game/round.ts).
 */
const players = new Map<string, Player>()

export function addPlayer(id: string, alias: string): void {
  const existing = players.get(id)
  players.set(id, {
    id,
    alias,
    score: existing?.score ?? 0,
    answered: existing?.answered ?? 0,
    ready: existing?.ready ?? false,
  })
}

export function removePlayer(id: string): void {
  players.delete(id)
}

export function setReady(id: string, ready: boolean): void {
  const p = players.get(id)
  if (p) p.ready = ready
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
  return [...players.values()].sort((a, b) => b.score - a.score)
}
