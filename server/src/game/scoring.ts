import type { Verdict } from "../types"

export const ROUND_TIME_SEC = 20
export const CORRECT_ADVANCE_DELAY_MS = 800
export const STUN_MS = 3000

/** Ported from the original client-side handleAnswer math — same formula, now server-authoritative. */
export function computeScore(
  verdict: Verdict | null,
  correctAnswer: Verdict,
  elapsedMs: number,
): { correct: boolean; scoreDelta: number } {
  const correct = verdict === correctAnswer
  const elapsedSec = elapsedMs / 1000
  const timeBonus = verdict
    ? Math.max(0, Math.floor((ROUND_TIME_SEC - elapsedSec) * 30))
    : 0
  const scoreDelta = correct ? 500 + timeBonus : 0
  return { correct, scoreDelta }
}
