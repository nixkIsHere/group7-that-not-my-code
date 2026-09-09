import type { RowDataPacket } from "mysql2"
import { pool } from "../pool"

export async function insertResult(entry: {
  alias: string
  score: number
  correctCount: number
  stunCount: number
}): Promise<void> {
  await pool.execute(
    "INSERT INTO leaderboard_entries (alias, score, correct_count, stun_count) VALUES (?, ?, ?, ?)",
    [entry.alias, entry.score, entry.correctCount, entry.stunCount],
  )
}

interface LeaderboardRow extends RowDataPacket {
  alias: string
  score: number
  correct_count: number
  stun_count: number
  played_at: string
}

export async function getTopN(n = 20) {
  const [rows] = await pool.query<LeaderboardRow[]>(
    "SELECT alias, score, correct_count, stun_count, played_at FROM leaderboard_entries ORDER BY score DESC LIMIT ?",
    [n],
  )
  return rows
}
