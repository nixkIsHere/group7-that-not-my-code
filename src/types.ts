export type Lang = "en" | "th"

export type Screen = "home" | "lobby" | "game" | "review"

export type Verdict = "comply" | "violate"

export interface Scenario {
  id: number

  type: "backend" | "frontend"

  titleEn: string

  titleTh: string

  code: string

  answer: Verdict

  contextEn: string

  contextTh: string

  hintEn: string

  hintTh: string

  explanationEn: string

  explanationTh: string

  pdpaRef: string
}

/** What the server sends while a round is in progress — no answer key yet. */

export type ScenarioPublic = Omit<Scenario, "answer" | "explanationEn" | "explanationTh" | "pdpaRef">

export interface Player {
  id: string

  alias: string

  score: number

  answered: number

  ready?: boolean
}

export interface Answer {
  scenarioId: number

  given: Verdict

  correct: boolean

  timeMs: number
}

/* ── Socket event payloads (mirrors server/src/types.ts) ── */
export type RoomStatus = "waiting" | "starting" | "playing" | "finished"

export interface LobbyUpdatePayload {
  players: Player[]
  hostId: string | null
  status: RoomStatus
  readyCount: number
  allReady: boolean
}

export interface RoundStartPayload {
  totalScenarios: number
}

export interface RoundScenarioPayload {
  index: number

  scenario: ScenarioPublic

  timeLimitSec: number
}

export interface RoundResultPayload {
  correct: boolean

  scoreDelta: number

  newScore: number
}

export interface RoundEndPayload {
  scenarios: Scenario[]

  answers: Answer[]

  players: Player[]
}
