import { pool } from "../pool"
import type { Verdict } from "../../types"

/** Raw per-question response log — one row per answer, no round/session grouping. */
export async function logAnswer(entry: {
  alias: string
  scenarioId: number
  given: Verdict
  correct: boolean
  timeMs: number
}): Promise<void> {
  await pool.execute(
    "INSERT INTO answer_log (alias, scenario_id, given, correct, time_ms) VALUES (?, ?, ?, ?, ?)",
    [entry.alias, entry.scenarioId, entry.given, entry.correct, entry.timeMs],
  )
}
