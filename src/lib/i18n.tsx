import { createContext, useContext } from "react"
import { GlobeAltIcon } from "@heroicons/react/24/outline"
import type { Lang } from "../types"

export const translations = {
  en: {
    systemBoot: "[SYSTEM BOOT] — PDPA INSPECTOR v2.0 — CMU/CAMT 953420",
    titleLine1: "THAT'S NOT",
    titleLine2: "MY CODE!",
    tagline:
      "A speedrun game for Tech Inspectors.\nSpot PDPA violations before time runs out.",
    tags: ["SPEEDRUN", "MULTIPLAYER", "ANTI-CHEAT", "PDPA"],
    enterAlias: ">_ ENTER ALIAS:",
    aliasPlaceholder: "inspector_name",
    join: "JOIN",
    readyA: "> READY TO INSPECT",
    readyB: "> READY TO INSPECT_",
    lobbyTitle: "LOBBY — WAITING FOR INSPECTORS",
    you: "[YOU]",
    ready: "READY",
    briefingLabel: "// BRIEFING:",
    briefingLines: [
      "10 scenarios — backend code + frontend UI",
      "Answer: COMPLY or VIOLATE PDPA",
      "Faster answers = higher score bonus",
      "Wrong answer = 3-second STUN penalty",
    ],
    startInspection: "START INSPECTION",
    gameTitle: "THAT'S NOT MY CODE!",
    scenario: "SCENARIO",
    of: "/",
    stuns: "STUNS:",
    pts: "PTS",
    liveRankings: "LIVE RANKINGS",
    timeRemaining: "TIME",
    viewUI: "UI PREVIEW",
    viewCode: "VIEW CODE",
    scenarioContext: "SCENARIO BRIEF",
    showHint: "SHOW HINT",
    hideHint: "HIDE HINT",
    complyLabel: "COMPLY",
    complySub: "PDPA compliant",
    violateLabel: "VIOLATE",
    violateSub: "Breaks PDPA",
    stunTitle: "STUNNED",
    stunSub: "Controls locked",
    correctFlash: "CORRECT!",
    wrongFlash: "VIOLATION MISSED",
    debrief: "INSPECTION COMPLETE — DEBRIEF",
    rank: "RANK #",
    correct: "CORRECT",
    playAgain: "BACK TO MAIN PAGE",
    caseFiles: "CASE FILES",
    finalRankings: "FINAL RANKINGS",
    pdpaAnalysis: ">_ PDPA ANALYSIS",
    compliesWith: "COMPLIES WITH PDPA",
    violatesWith: "VIOLATES PDPA",
    yourAnswer: "YOUR ANSWER:",
    answerCorrect: "CORRECT",
    answerWrong: "INCORRECT",
    prev: "PREV",
    next: "NEXT",
    backend: "BACKEND",
    frontend: "FRONTEND",
    serverFile: "server.js",
    componentFile: "Component.tsx",
    langLabel: "ภาษาไทย",
    langCurrent: "EN",
  },
  th: {
    systemBoot: "[บูตระบบ] — ผู้ตรวจสอบ PDPA v2.0 — CMU/CAMT 953420",
    titleLine1: "นั่นไม่ใช่",
    titleLine2: "โค้ดฉัน!",
    tagline: "เกม Speedrun สำหรับนักตรวจสอบระบบ\nจับการละเมิด PDPA ก่อนหมดเวลา",
    tags: ["SPEEDRUN", "มัลติเพลเยอร์", "ป้องกันโกง", "PDPA"],
    enterAlias: ">_ ใส่ชื่อเล่น:",
    aliasPlaceholder: "ชื่อผู้ตรวจสอบ",
    join: "เข้าร่วม",
    readyA: "> พร้อมตรวจสอบ",
    readyB: "> พร้อมตรวจสอบ_",
    lobbyTitle: "ล็อบบี้ — รอผู้ตรวจสอบ",
    you: "[คุณ]",
    ready: "พร้อม",
    briefingLabel: "// สรุปกฎ:",
    briefingLines: [
      "10 สถานการณ์ — backend โค้ด และ frontend UI",
      "ตอบ: ถูกกฎหมาย หรือ ละเมิด PDPA",
      "ตอบเร็ว = ได้คะแนนโบนัสมากขึ้น",
      "ตอบผิด = ถูกสตัน 3 วินาที",
    ],
    startInspection: "เริ่มการตรวจสอบ",
    gameTitle: "นั่นไม่ใช่โค้ดฉัน!",
    scenario: "สถานการณ์",
    of: "/",
    stuns: "สตัน:",
    pts: "คะแนน",
    liveRankings: "อันดับสด",
    timeRemaining: "เวลา",
    viewUI: "ดู UI",
    viewCode: "ดูโค้ด",
    scenarioContext: "บริบทโจทย์",
    showHint: "ดูคำใบ้",
    hideHint: "ซ่อนคำใบ้",
    complyLabel: "ถูกกฎหมาย",
    complySub: "ปฏิบัติตาม PDPA",
    violateLabel: "ละเมิด",
    violateSub: "ผิด PDPA",
    stunTitle: "ถูกสตัน",
    stunSub: "ควบคุมถูกล็อก",
    correctFlash: "ถูกต้อง!",
    wrongFlash: "พลาดการตรวจจับ",
    debrief: "ตรวจสอบเสร็จสิ้น — สรุปผล",
    rank: "อันดับ #",
    correct: "ถูก",
    playAgain: "กลับสู่หน้าหลัก",
    caseFiles: "ไฟล์คดี",
    finalRankings: "อันดับสุดท้าย",
    pdpaAnalysis: ">_ การวิเคราะห์ PDPA",
    compliesWith: "ปฏิบัติตาม PDPA",
    violatesWith: "ละเมิด PDPA",
    yourAnswer: "คำตอบของคุณ:",
    answerCorrect: "ถูกต้อง",
    answerWrong: "ไม่ถูกต้อง",
    prev: "ก่อนหน้า",
    next: "ถัดไป",
    backend: "แบ็กเอนด์",
    frontend: "ฟรอนต์เอนด์",
    serverFile: "server.js",
    componentFile: "Component.tsx",
    langLabel: "English",
    langCurrent: "TH",
  },
} as const

export type T = typeof translations[Lang]

export const LangContext = createContext<{
  lang: Lang
  t: T
  setLang: (l: Lang) => void
}>({
  lang: "en",
  t: translations.en,
  setLang: () => {},
})

export function useLang() {
  return useContext(LangContext)
}

export function LangToggle() {
  const { lang, t, setLang } = useLang()
  const isTh = lang === "th"
  return (
    <button
      className="lang-btn"
      onClick={() => setLang(lang === "en" ? "th" : "en")}
      style={{
        fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)",
        fontSize: 12,
        letterSpacing: isTh ? 0 : "0.08em",
      }}
    >
      <GlobeAltIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
      <span style={{ opacity: 0.55 }}>{t.langCurrent}</span>
      <span style={{ opacity: 0.3 }}>|</span>
      <span>{t.langLabel}</span>
    </button>
  )
}
