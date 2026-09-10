import type { RowDataPacket } from "mysql2"
import { pool } from "../pool"
import type { Scenario } from "../../types"

interface ScenarioRow extends RowDataPacket {
  id: number
  type: "backend" | "frontend"
  title_en: string
  title_th: string
  code: string
  answer: "comply" | "violate"
  context_en: string
  context_th: string
  hint_en: string
  hint_th: string
  explanation_en: string
  explanation_th: string
  pdpa_ref: string
}

function rowToScenario(row: ScenarioRow): Scenario {
  return {
    id: row.id,
    type: row.type,
    titleEn: row.title_en,
    titleTh: row.title_th,
    code: row.code,
    answer: row.answer,
    contextEn: row.context_en,
    contextTh: row.context_th,
    hintEn: row.hint_en,
    hintTh: row.hint_th,
    explanationEn: row.explanation_en,
    explanationTh: row.explanation_th,
    pdpaRef: row.pdpa_ref,
  }
}

export async function getAllScenarios(): Promise<Scenario[]> {
  const [rows] = await pool.query<ScenarioRow[]>("SELECT * FROM scenarios")
  return rows.map(rowToScenario)
}

/** Picks up to 10 scenarios once for the whole room. */
export async function pickRandomTen(): Promise<Scenario[]> {
  const all = await getAllScenarios()
  if (all.length === 0) {
    throw new Error(
      "No scenarios found in the database — did you run `npm run seed`?",
    )
  }
  const shuffled = [...all].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10)
}
