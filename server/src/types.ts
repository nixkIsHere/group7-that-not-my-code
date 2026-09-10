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

/** What gets sent to a client mid-round — no answer key yet. */

export type ScenarioPublic = Omit<Scenario, "answer" | "explanationEn" | "explanationTh" | "pdpaRef">

export function toScenarioPublic(s: Scenario): ScenarioPublic {
  const {
    answer: _answer,

    explanationEn: _en,

    explanationTh: _th,

    pdpaRef: _ref,

    ...rest
  } = s

  return rest
}

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

export type RoomStatus = "waiting" | "starting" | "playing" | "finished"

export interface LobbyUpdatePayload {
  players: Player[]
  hostId: string | null
  status: RoomStatus
  readyCount: number
  allReady: boolean
}
