import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import {
  BoltIcon,
  UsersIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  CheckIcon,
  XMarkIcon,
  ScaleIcon,
  SignalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  WindowIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

/* ════════════════════════════════════════════
   I18N
═══════════════════════════════════════════ */
type Lang = "en" | "th";

const translations = {
  en: {
    systemBoot: "[SYSTEM BOOT] — PDPA INSPECTOR v2.0 — CMU/CAMT 953420",
    titleLine1: "THAT'S NOT",
    titleLine2: "MY CODE!",
    tagline: "A speedrun game for Tech Inspectors.\nSpot PDPA violations before time runs out.",
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
    playAgain: "PLAY AGAIN",
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
    playAgain: "เล่นอีกครั้ง",
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
} as const;

type T = (typeof translations)[Lang];
const LangContext = createContext<{ lang: Lang; t: T; setLang: (l: Lang) => void }>({
  lang: "en", t: translations.en, setLang: () => {},
});
function useLang() { return useContext(LangContext); }

/* tag icon map (index-based for the 4 feature tags) */
const TAG_ICONS = [BoltIcon, UsersIcon, ShieldCheckIcon, BookOpenIcon];

/* ════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════ */
type Screen = "home" | "lobby" | "game" | "review";
type Verdict = "comply" | "violate";

interface Scenario {
  id: number; type: "backend" | "frontend";
  titleEn: string; titleTh: string; code: string; answer: Verdict;
  contextEn: string; contextTh: string;
  hintEn: string; hintTh: string;
  explanationEn: string; explanationTh: string; pdpaRef: string;
}
interface Player { id: string; alias: string; score: number; answered: number; }
interface Answer { scenarioId: number; given: Verdict; correct: boolean; timeMs: number; }

const SCENARIOS: Scenario[] = [
  {
    id: 1, type: "backend", titleEn: "User Registration API", titleTh: "API ลงทะเบียนผู้ใช้",
    contextEn: "A startup is building a new healthcare app. You've been assigned to review the user registration endpoint before it ships to production. The PR author says it 'collects everything we might need later.'",
    contextTh: "สตาร์ทอัพกำลังสร้างแอปด้านสุขภาพ คุณได้รับมอบหมายให้ตรวจสอบ endpoint การลงทะเบียนก่อนนำขึ้น production ผู้เขียน PR บอกว่า 'เก็บทุกอย่างที่อาจต้องการในอนาคต'",
    hintEn: "Think about what a registration form actually needs vs. what this collects. Also check how the query is built.",
    hintTh: "คิดดูว่าฟอร์มลงทะเบียนต้องการอะไรจริงๆ เทียบกับสิ่งที่เก็บ และตรวจสอบวิธีสร้าง query",
    code: `// POST /api/register
const registerUser = async (req, res) => {
  const { name, email, password,
          dob, nationalId, bloodType,
          medHistory, income } = req.body;

  const user = await db.query(\`
    INSERT INTO users VALUES (
      '\${name}', '\${email}',
      '\${nationalId}', '\${bloodType}',
      '\${medHistory}', '\${income}'
    )
  \`);
  res.json({ success: true });
};`,
    answer: "violate",
    explanationEn: "Collects excessive personal data (national ID, blood type, medical history, income) far beyond registration needs. Violates PDPA's Data Minimization principle (§22). String interpolation also creates SQL injection vulnerabilities, and sensitive data is stored without explicit consent.",
    explanationTh: "เก็บข้อมูลส่วนบุคคลเกินความจำเป็น (เลขบัตรประชาชน, หมู่เลือด, ประวัติการรักษา, รายได้) ละเมิดหลักการ Data Minimization ของ PDPA (มาตรา 22) นอกจากนี้ยังมีช่องโหว่ SQL Injection และจัดเก็บข้อมูลโดยไม่ได้รับความยินยอม",
    pdpaRef: "PDPA §22 — Data Minimization",
  },
  {
    id: 2, type: "frontend", titleEn: "Cookie Consent Banner", titleTh: "แบนเนอร์ขอความยินยอม Cookie",
    contextEn: "An e-commerce site redesigned their cookie consent dialog. The marketing team requested the new design to 'maximize opt-in rates.' Review whether the consent UI respects user choice.",
    contextTh: "เว็บไซต์อีคอมเมิร์ซออกแบบ cookie consent ใหม่ ทีมการตลาดขอให้ออกแบบเพื่อ 'เพิ่มอัตราการยอมรับ' ตรวจสอบว่า UI ยินยอมให้ผู้ใช้เลือกอย่างเสรีหรือไม่",
    hintEn: "Look at the visual weight and size of each option. PDPA requires both Accept and Reject to be equally accessible.",
    hintTh: "สังเกตน้ำหนักภาพและขนาดของแต่ละตัวเลือก PDPA กำหนดให้ทั้ง 'ยอมรับ' และ 'ปฏิเสธ' ต้องเข้าถึงได้เท่าเทียมกัน",
    code: `<!-- Cookie Consent UI -->
<div class="consent-banner">
  <h3>We value your privacy</h3>
  <p>We use cookies to improve your experience.</p>

  <button class="btn-primary btn-large">
    Accept All Cookies
  </button>

  <button class="btn-link btn-tiny"
          style="color:#aaa; font-size:9px;
                 margin-top:40px;">
    Reject (optional)
  </button>
</div>`,
    answer: "violate",
    explanationEn: "A classic Dark Pattern. 'Accept All' is large and prominent while 'Reject' is visually suppressed (tiny, grey, pushed down). PDPA requires consent to be freely given — unequal options manipulate consent and violate §19.",
    explanationTh: "Dark Pattern แบบคลาสสิก ปุ่ม 'ยอมรับ' ใหญ่และเด่นชัด ขณะที่ 'ปฏิเสธ' ถูกซ่อนไว้ PDPA กำหนดว่าความยินยอมต้องเป็นไปโดยเสรี การนำเสนอตัวเลือกที่ไม่เท่าเทียมถือเป็นการบิดเบือนความยินยอม ละเมิดมาตรา 19",
    pdpaRef: "PDPA §19 — Consent Requirements",
  },
  {
    id: 3, type: "backend", titleEn: "Password Storage Handler", titleTh: "การจัดเก็บรหัสผ่าน",
    contextEn: "You're auditing the authentication service of a fintech application. A mid-level dev submitted this password update handler. The team lead flagged it for your review before merging.",
    contextTh: "คุณกำลังตรวจสอบ authentication service ของแอปฟินเทค นักพัฒนาระดับกลางส่ง password update handler นี้ หัวหน้าทีมให้คุณตรวจก่อน merge",
    hintEn: "Check: (1) How is the password stored? (2) Is the SQL query safe from injection? (3) Is plaintext ever saved?",
    hintTh: "ตรวจสอบ: (1) รหัสผ่านถูกจัดเก็บอย่างไร? (2) SQL query ปลอดภัยจาก injection หรือไม่? (3) มีการบันทึก plaintext หรือไม่?",
    code: `// User authentication service
const saveUserPassword = async (userId, password) => {
  const bcrypt = require('bcrypt');
  const saltRounds = 12;

  const hashed = await bcrypt.hash(password, saltRounds);

  await db.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [hashed, userId]
  );

  console.log(\`Password updated for user \${userId}\`);
  return { success: true };
};`,
    answer: "comply",
    explanationEn: "Correctly implements password security: bcrypt with 12 salt rounds (strong hashing), parameterized queries (no SQL injection), and never stores plaintext passwords. Aligns with PDPA's security safeguard requirements.",
    explanationTh: "ปฏิบัติตามมาตรฐานความปลอดภัยอย่างถูกต้อง: ใช้ bcrypt กับ 12 salt rounds, parameterized queries ป้องกัน SQL injection และไม่เก็บรหัสผ่าน plaintext สอดคล้องกับ PDPA มาตรา 37",
    pdpaRef: "PDPA §37 — Security Safeguards",
  },
  {
    id: 4, type: "frontend", titleEn: "Account Deletion UI", titleTh: "UI ลบบัญชีผู้ใช้",
    contextEn: "A SaaS product received user complaints that there was no way to delete their account. Engineering shipped this account deletion section in the settings page. Does it properly implement the Right to Erasure?",
    contextTh: "ผลิตภัณฑ์ SaaS ได้รับร้องเรียนว่าไม่มีวิธีลบบัญชี วิศวกรทำส่วนลบบัญชีในหน้าตั้งค่า ตรวจสอบว่าปฏิบัติตาม Right to Erasure ถูกต้องหรือไม่",
    hintEn: "Is the option clearly visible? Does the user know what happens to their data and when? Is there a safety confirmation step?",
    hintTh: "ตัวเลือกมองเห็นชัดเจนหรือไม่? ผู้ใช้รู้ว่าข้อมูลจะเกิดอะไรขึ้นและเมื่อไหร่? มีขั้นตอนยืนยันความปลอดภัยหรือไม่?",
    code: `// Account deletion flow
function DeleteAccountSection() {
  return (
    <section>
      <h2>Danger Zone</h2>
      <p>You may request deletion of your account
         and all associated personal data.</p>

      <button
        onClick={() => setShowConfirmModal(true)}
        className="btn-danger">
        Delete My Account & Data
      </button>

      <p className="hint">
        Data will be permanently removed within
        30 days per our privacy policy.
      </p>
    </section>
  );
}`,
    answer: "comply",
    explanationEn: "Correctly implements the Right to Erasure. The deletion option is clearly visible, a confirmation step prevents accidents, and the 30-day processing window is disclosed. Fulfills data subject rights under §33.",
    explanationTh: "ปฏิบัติตามสิทธิ์การลบข้อมูลอย่างถูกต้อง ตัวเลือกการลบมองเห็นชัดเจน มีขั้นตอนยืนยัน และเปิดเผยระยะเวลา 30 วัน ปฏิบัติตามสิทธิ์เจ้าของข้อมูล PDPA มาตรา 33",
    pdpaRef: "PDPA §33 — Right to Erasure",
  },
  {
    id: 5, type: "backend", titleEn: "Analytics Data Export", titleTh: "ส่งออกข้อมูลวิเคราะห์",
    contextEn: "The growth team wants richer targeting data from their analytics partner. A backend dev wrote this scheduled export job. The team claims users 'implicitly agreed' by using the app. Review the code.",
    contextTh: "ทีม Growth ต้องการข้อมูลเพื่อ targeting จากพาร์ทเนอร์วิเคราะห์ข้อมูล นักพัฒนาเขียน export job นี้ ทีมอ้างว่าผู้ใช้ 'ยินยอมโดยปริยาย' จากการใช้แอป",
    hintEn: "Did users explicitly consent to their data being sent to a third party? What kind of data is being shared?",
    hintTh: "ผู้ใช้ยินยอมให้ส่งข้อมูลไปยังบุคคลที่สามอย่างชัดเจนหรือไม่? ข้อมูลประเภทใดถูกแชร์?",
    code: `// Export user data for analytics partner
const exportToPartner = async () => {
  const users = await db.query(\`
    SELECT id, name, email, phone,
           purchase_history, location_log,
           device_fingerprint
    FROM users
    WHERE created_at > '2024-01-01'
  \`);

  await axios.post('https://analytics.partner.com/ingest',
    { data: users, apiKey: PARTNER_KEY }
  );
};`,
    answer: "violate",
    explanationEn: "Sharing personal data (name, email, phone, location logs) with a third-party analytics partner without explicit consent violates PDPA §27. No anonymization or consent verification is performed.",
    explanationTh: "การแบ่งปันข้อมูลส่วนบุคคลกับบุคคลที่สามโดยไม่ได้รับความยินยอม ละเมิด PDPA มาตรา 27 ไม่มีการทำ Anonymization หรือตรวจสอบความยินยอม",
    pdpaRef: "PDPA §27 — Third-Party Data Sharing",
  },
  {
    id: 6, type: "frontend", titleEn: "Data Access Request Form", titleTh: "แบบฟอร์มขอเข้าถึงข้อมูล",
    contextEn: "The legal team asked engineering to build a PDPA-compliant Data Subject Access Request (DSAR) portal. This is the result. Does it give users proper access to all their rights?",
    contextTh: "ทีมกฎหมายขอให้วิศวกรสร้างพอร์ทัล DSAR ที่สอดคล้องกับ PDPA นี่คือผลลัพธ์ ตรวจสอบว่าให้ผู้ใช้เข้าถึงสิทธิ์ทั้งหมดได้หรือไม่",
    hintEn: "PDPA grants 4 main rights: Access, Rectification, Erasure, and Portability. Check if all are available and if the response timeline is correct.",
    hintTh: "PDPA กำหนดสิทธิ์หลัก 4 ประการ: เข้าถึง, แก้ไข, ลบ และโอนย้าย ตรวจสอบว่ามีครบและระยะเวลาตอบกลับถูกต้อง",
    code: `// DSAR (Data Subject Access Request) Form
function DSARForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData) => {
    await api.submitDSAR({
      type: formData.requestType,
      email: formData.email,
      details: formData.details
    });
    setSubmitted(true);
  };

  return submitted
    ? <SuccessMessage
        text="Request received. We will respond
              within 30 days as required by PDPA." />
    : <RequestForm onSubmit={handleSubmit}
                   types={['Access','Rectify',
                           'Erase','Portability']} />;
}`,
    answer: "comply",
    explanationEn: "Correctly implements a Data Subject Access Request workflow supporting all four major rights (Access, Rectification, Erasure, Portability) with a clear confirmation and the legally required 30-day response window per PDPA §30–34.",
    explanationTh: "ปฏิบัติตาม DSAR workflow อย่างถูกต้อง รองรับสิทธิ์ 4 ประการ (เข้าถึง, แก้ไข, ลบ, โอนย้าย) พร้อมการยืนยันและระยะเวลาตอบกลับ 30 วัน ตาม PDPA มาตรา 30-34",
    pdpaRef: "PDPA §30-34 — Data Subject Rights",
  },
  {
    id: 7, type: "backend", titleEn: "Error Logging Middleware", titleTh: "มิดเดิลแวร์บันทึกข้อผิดพลาด",
    contextEn: "The backend team added centralized error logging to speed up debugging in production. It's been running for 2 weeks. No one has reviewed it for privacy implications yet — that's your job.",
    contextTh: "ทีม Backend เพิ่ม error logging แบบรวมศูนย์เพื่อเร่ง debug ใน production ทำงานมา 2 สัปดาห์แล้ว ยังไม่มีใครตรวจสอบด้านความเป็นส่วนตัว นั่นคืองานของคุณ",
    hintEn: "What data ends up in the log file? Is the log file protected? Could this log contain passwords or personal data from request bodies?",
    hintTh: "ข้อมูลอะไรถูกบันทึกในไฟล์ log? ไฟล์ log ได้รับการป้องกันหรือไม่? log อาจมีรหัสผ่านหรือข้อมูลส่วนบุคคลจาก request body หรือไม่?",
    code: `// Global error logger
app.use((err, req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    user: req.user,        // Full user object
    body: req.body,        // All request data
    ip: req.ip
  };

  // Write to public log file
  fs.appendFileSync('./logs/errors.log',
    JSON.stringify(logEntry) + '\\n'
  );

  res.status(500).json({ error: 'Internal error' });
});`,
    answer: "violate",
    explanationEn: "Dumps the full user object and entire request body (possibly containing passwords and personal data) into an unprotected log file. Logging sensitive personal data without redaction violates PDPA's security safeguard principles.",
    explanationTh: "บันทึก object ผู้ใช้ทั้งหมดและข้อมูล request (อาจมีรหัสผ่าน, ข้อมูลส่วนบุคคล) ลงไฟล์ log ที่ไม่ได้รับการป้องกัน ละเมิดหลักการความปลอดภัยของ PDPA",
    pdpaRef: "PDPA §37 — Security Safeguards",
  },
  {
    id: 8, type: "frontend", titleEn: "Marketing Opt-in Checkbox", titleTh: "ช่องรับข้อมูลการตลาด",
    contextEn: "Marketing wants to build an email list from the checkout flow. Engineering added this opt-in checkbox. The product manager says 'users can always unsubscribe later.' Is the consent implementation legal?",
    contextTh: "ฝ่ายการตลาดต้องการสร้าง email list จากขั้นตอนชำระเงิน วิศวกรเพิ่ม opt-in checkbox นี้ Product manager บอกว่า 'ผู้ใช้ยกเลิกได้ทีหลัง' การ implement consent นี้ถูกกฎหมายหรือไม่?",
    hintEn: "Is the checkbox pre-ticked? Is marketing consent bundled with completing the purchase? Is opting out clearly explained?",
    hintTh: "ช่องถูกเลือกล่วงหน้าหรือไม่? ความยินยอมด้านการตลาดถูกรวมกับการชำระเงินหรือไม่? มีคำอธิบายวิธียกเลิกชัดเจนหรือไม่?",
    code: `// Newsletter subscription during checkout
<FormGroup>
  <label>Order Summary</label>

  <CheckboxField
    name="marketingConsent"
    defaultChecked={false}
    label="I agree to receive promotional emails
           and personalized offers from TechShop."
  />

  <p className="consent-note">
    You can unsubscribe at any time via
    account settings or email links.
  </p>

  <Button type="submit">Complete Purchase</Button>
</FormGroup>`,
    answer: "comply",
    explanationEn: "Compliant marketing consent: checkbox is unchecked by default, consent is separate from the purchase action, purpose is clearly stated, and an easy opt-out is disclosed. Satisfies PDPA's freely-given, informed consent requirements.",
    explanationTh: "การขอความยินยอมด้านการตลาดที่ถูกต้อง: ช่องไม่ถูกเลือกล่วงหน้า, ความยินยอมแยกออกจากการซื้อ, ระบุวัตถุประสงค์ชัดเจน และมีวิธียกเลิก ปฏิบัติตาม PDPA มาตรา 19",
    pdpaRef: "PDPA §19 — Consent Requirements",
  },
  {
    id: 9, type: "backend", titleEn: "Session Token Storage", titleTh: "การจัดเก็บ Session Token",
    contextEn: "The auth team rebuilt session management using JWTs for a government-adjacent platform handling citizen data. They claim JWTs are 'stateless and secure.' Review the token generation logic carefully.",
    contextTh: "ทีม Auth สร้างระบบ session ใหม่ด้วย JWT สำหรับแพลตฟอร์มที่เกี่ยวข้องกับภาครัฐซึ่งจัดการข้อมูลพลเมือง พวกเขาอ้างว่า JWT 'stateless และปลอดภัย' ตรวจสอบ logic การสร้าง token อย่างละเอียด",
    hintEn: "JWT payloads are only base64-encoded, not encrypted. What data is embedded? Is the expiry duration appropriate?",
    hintTh: "JWT payload เป็นเพียง base64 ไม่ได้เข้ารหัส ข้อมูลอะไรถูกฝังไว้? ระยะหมดอายุเหมาะสมหรือไม่?",
    code: `// JWT token generation
const createSession = (userId) => {
  const token = jwt.sign(
    {
      userId,
      email: user.email,
      nationalId: user.nationalId,
      role: user.role,
      allPermissions: user.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '90d' }
  );
  return token;
};`,
    answer: "violate",
    explanationEn: "Embedding sensitive personal data (email, national ID) and a 90-day expiry in JWT tokens violates data minimization and security principles. JWTs are base64-encoded (not encrypted) and may be logged insecurely. Only userId and role should be in the payload.",
    explanationTh: "ฝังข้อมูลส่วนบุคคลที่ละเอียดอ่อน (อีเมล, เลขบัตรประชาชน) และระยะหมดอายุ 90 วันใน JWT ละเมิดหลักการ Data Minimization JWT เป็น base64 (ไม่เข้ารหัส) และอาจถูกบันทึกโดยไม่ปลอดภัย",
    pdpaRef: "PDPA §22, §37 — Minimization & Security",
  },
  {
    id: 10, type: "backend", titleEn: "Data Retention Cleanup", titleTh: "การทำความสะอาดข้อมูล",
    contextEn: "The compliance team mandated a data retention policy after a regulatory audit. Engineering shipped this weekly cleanup job. It's scheduled to run for the first time tonight — sign off if it's compliant.",
    contextTh: "ทีม Compliance สั่งให้มีนโยบายเก็บรักษาข้อมูลหลังการตรวจสอบ วิศวกรทำ cleanup job รายสัปดาห์นี้ กำหนดรันคืนนี้เป็นครั้งแรก — อนุมัติถ้ามันสอดคล้องกฎหมาย",
    hintEn: "What data is deleted vs. archived? Who does the deletion affect? Is the archived data truly anonymized?",
    hintTh: "ข้อมูลใดถูกลบ vs ถูก archive? การลบส่งผลต่อใคร? ข้อมูลที่ archive ถูก anonymize จริงๆ หรือไม่?",
    code: `// Scheduled data retention job (runs weekly)
const cleanupExpiredData = async () => {
  await db.query(\`
    DELETE FROM users
    WHERE last_login < DATE_SUB(NOW(), INTERVAL 3 YEAR)
    AND consent_withdrawn = TRUE
  \`);

  await db.query(\`
    INSERT INTO analytics_archive
    SELECT id, country, age_range,
           NULL as email, NULL as name,
           purchase_count
    FROM users WHERE archived = FALSE
  \`);
};`,
    answer: "comply",
    explanationEn: "Proper data retention: deletes data after 3 years only for users who withdrew consent, archives only anonymized data (PII nulled out). Complies with PDPA's storage limitation principle.",
    explanationTh: "การจัดการข้อมูลตามนโยบายที่ถูกต้อง: ลบข้อมูลหลัง 3 ปีเฉพาะผู้ถอนความยินยอม และเก็บเฉพาะข้อมูล Anonymized ปฏิบัติตาม PDPA มาตรา 26",
    pdpaRef: "PDPA §26 — Storage Limitation",
  },
];

const FAKE_PLAYERS: Player[] = [
  { id: "p1", alias: "n4tthaphum",  score: 1840, answered: 7 },
  { id: "p2", alias: "ch4tchapong", score: 1620, answered: 6 },
  { id: "p3", alias: "siwak0rn",    score: 980,  answered: 4 },
  { id: "p4", alias: "thipph4rake", score: 760,  answered: 3 },
];

const ROUND_TIME = 20;

/* ════════════════════════════════════════════
   LANG TOGGLE
═══════════════════════════════════════════ */
function LangToggle() {
  const { lang, t, setLang } = useLang();
  const isTh = lang === "th";
  return (
    <button
      className="lang-btn"
      onClick={() => setLang(lang === "en" ? "th" : "en")}
      style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)", fontSize: 12, letterSpacing: isTh ? 0 : "0.08em" }}
    >
      <GlobeAltIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
      <span style={{ opacity: 0.55 }}>{t.langCurrent}</span>
      <span style={{ opacity: 0.3 }}>|</span>
      <span>{t.langLabel}</span>
    </button>
  );
}

/* ════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  const [screen, setScreen]         = useState<Screen>("home");
  const [alias, setAlias]           = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]       = useState<Answer[]>([]);
  const [score, setScore]           = useState(0);
  const [timeLeft, setTimeLeft]     = useState(ROUND_TIME);
  const [stunned, setStunned]       = useState(false);
  const [stunCount, setStunCount]   = useState(0);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [players, setPlayers]       = useState<Player[]>(FAKE_PLAYERS);
  const [reviewIdx, setReviewIdx]   = useState(0);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const currentScenario = SCENARIOS[currentIdx];
  const myPlayer: Player = { id: "me", alias: alias || "you", score, answered: answers.length };
  const allPlayers = [...players, myPlayer].sort((a, b) => b.score - a.score);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(ROUND_TIME);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { stopTimer(); return 0; } return prev - 1; });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (screen === "game" && !stunned) startTimer();
    return stopTimer;
  }, [screen, currentIdx, stunned]);

  useEffect(() => {
    if (screen === "game" && timeLeft === 0 && !stunned) handleAnswer(null);
  }, [timeLeft, screen, stunned]);

  useEffect(() => {
    if (screen !== "game") return;
    const iv = setInterval(() => {
      setPlayers((prev) => prev.map((p) =>
        Math.random() > 0.7 && p.answered < SCENARIOS.length
          ? { ...p, score: p.score + Math.floor(Math.random() * 200) + 100, answered: p.answered + 1 }
          : p
      ));
    }, 3000);
    return () => clearInterval(iv);
  }, [screen]);

  const handleAnswer = (verdict: Verdict | null) => {
    if (stunned || screen !== "game") return;
    stopTimer();
    const elapsed   = Date.now() - startTimeRef.current;
    const correct   = verdict === currentScenario.answer;
    const timeBonus = verdict ? Math.max(0, Math.floor((ROUND_TIME - elapsed / 1000) * 30)) : 0;
    setLastResult(correct ? "correct" : "wrong");
    setAnswers((prev) => [...prev, { scenarioId: currentScenario.id, given: verdict ?? "comply", correct, timeMs: elapsed }]);
    if (correct) {
      setScore((s) => s + 500 + timeBonus);
      setTimeout(() => { setLastResult(null); advance(); }, 800);
    } else {
      setStunned(true);
      setStunCount((c) => c + 1);
      setTimeout(() => { setStunned(false); setLastResult(null); advance(); }, 3000);
    }
  };

  const advance = () => {
    setCurrentIdx((i) => {
      const next = i + 1;
      if (next >= SCENARIOS.length) { setScreen("review"); return i; }
      return next;
    });
  };

  const startGame = () => {
    if (!aliasInput.trim()) return;
    setAlias(aliasInput.trim());
    setScreen("lobby");
  };

  const beginRound = () => {
    setCurrentIdx(0); setAnswers([]); setScore(0);
    setStunned(false); setStunCount(0); setLastResult(null);
    setScreen("game");
  };

  const correctCount = answers.filter((a) => a.correct).length;
  const timerPct   = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft > 10 ? "var(--cyan)" : timeLeft > 5 ? "var(--amber)" : "var(--red)";

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="scanlines" />
      {screen === "home" && (
        <HomeScreen aliasInput={aliasInput} setAliasInput={setAliasInput} onStart={startGame} />
      )}
      {screen === "lobby" && (
        <LobbyScreen alias={alias} players={FAKE_PLAYERS} onBegin={beginRound} />
      )}
      {screen === "game" && (
        <GameScreen
          scenario={currentScenario}
          currentIdx={currentIdx}
          totalScenarios={SCENARIOS.length}
          score={score}
          timeLeft={timeLeft}
          timerPct={timerPct}
          timerColor={timerColor}
          stunned={stunned}
          stunCount={stunCount}
          lastResult={lastResult}
          allPlayers={allPlayers}
          myAlias={alias}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "review" && (
        <ReviewScreen
          scenarios={SCENARIOS}
          answers={answers}
          score={score}
          correctCount={correctCount}
          stunCount={stunCount}
          allPlayers={allPlayers}
          myAlias={alias}
          reviewIdx={reviewIdx}
          setReviewIdx={setReviewIdx}
          onPlayAgain={() => { setScreen("home"); setAliasInput(""); }}
        />
      )}
    </LangContext.Provider>
  );
}

/* ════════════════════════════════════════════
   HOME
═══════════════════════════════════════════ */
function HomeScreen({ aliasInput, setAliasInput, onStart }: {
  aliasInput: string; setAliasInput: (v: string) => void; onStart: () => void;
}) {
  const { lang, t } = useLang();
  const isTh     = lang === "th";
  const monoF    = isTh ? "var(--font-thai)" : "var(--font-mono)";
  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)";
  const pixelF   = isTh ? "var(--font-thai)" : "var(--font-pixel)";
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick((n) => n + 1), 500); return () => clearInterval(i); }, []);

  return (
    <div style={{ minHeight: "100%", background: "var(--background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-8) var(--space-5)", position: "relative", overflow: "hidden" }}>
      {/* grid bg */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,245,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      {/* Lang toggle */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <LangToggle />
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 580, width: "100%", paddingTop: 44 }}>
        <div style={{ fontFamily: monoF, fontSize: isTh ? 12 : 11, color: "var(--cyan)", letterSpacing: isTh ? "0.04em" : "0.25em", marginBottom: "var(--space-4)", opacity: 0.8 }}>
          {t.systemBoot}
        </div>

        <h1 style={{ fontFamily: displayF, fontSize: "clamp(2rem, 8vw, 3.8rem)", fontWeight: 900, color: "var(--cyan)", textShadow: "var(--glow-cyan)", lineHeight: 1.15, marginBottom: "var(--space-1)", letterSpacing: isTh ? "0.02em" : "0.05em" }}>
          {t.titleLine1}
        </h1>
        <h1 style={{ fontFamily: displayF, fontSize: "clamp(2rem, 8vw, 3.8rem)", fontWeight: 900, color: "var(--magenta)", textShadow: "var(--glow-magenta)", lineHeight: 1.15, marginBottom: "var(--space-6)", letterSpacing: isTh ? "0.02em" : "0.05em" }}>
          {t.titleLine2}
        </h1>

        <p style={{ fontFamily: pixelF, fontSize: isTh ? 16 : 19, color: "var(--foreground)", opacity: 0.75, marginBottom: "var(--space-8)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
          {t.tagline}
        </p>

        {/* Feature tags with Heroicons */}
        <div className="tags-row" style={{ marginBottom: "var(--space-8)" }}>
          {t.tags.map((tag, i) => {
            const Icon = TAG_ICONS[i];
            return (
              <span key={tag} style={{ fontFamily: monoF, fontSize: isTh ? 11 : 11, padding: "5px 11px", border: "1px solid var(--border-bright)", color: "var(--cyan-dim)", background: "rgba(0,245,255,0.05)", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                {tag}
              </span>
            );
          })}
        </div>

        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-bright)", padding: "var(--space-6)", marginBottom: "var(--space-4)", boxShadow: "var(--glow-cyan)" }}>
          <label style={{ fontFamily: monoF, fontSize: isTh ? 14 : 12, color: "var(--cyan)", letterSpacing: isTh ? "0.04em" : "0.2em", display: "block", marginBottom: "var(--space-3)" }}>
            {t.enterAlias}
          </label>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <input
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onStart()}
              placeholder={t.aliasPlaceholder}
              maxLength={20}
              style={{ flex: 1, minWidth: 0, background: "var(--background)", border: "1px solid var(--border-bright)", color: "var(--green)", fontFamily: monoF, fontSize: 17, padding: "9px 12px", outline: "none" }}
            />
            <button
              onClick={onStart}
              disabled={!aliasInput.trim()}
              style={{ background: aliasInput.trim() ? "var(--cyan)" : "transparent", border: "1px solid var(--cyan)", color: aliasInput.trim() ? "var(--background)" : "var(--cyan)", fontFamily: displayF, fontSize: isTh ? 14 : 13, fontWeight: 700, padding: "9px 18px", cursor: aliasInput.trim() ? "pointer" : "not-allowed", letterSpacing: isTh ? "0.02em" : "0.1em", transition: "all 0.15s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}
            >
              <PlayIcon style={{ width: 14, height: 14 }} />
              {t.join}
            </button>
          </div>
        </div>

        <div style={{ fontFamily: pixelF, fontSize: isTh ? 14 : 15, color: "var(--muted-foreground)" }}>
          {tick % 2 === 0 ? t.readyA : t.readyB}
        </div>
      </div>

      {/* Corner decorations */}
      {([{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 18, height: 18, borderTop: i < 2 ? "2px solid var(--cyan)" : "none", borderBottom: i >= 2 ? "2px solid var(--cyan)" : "none", borderLeft: i % 2 === 0 ? "2px solid var(--cyan)" : "none", borderRight: i % 2 === 1 ? "2px solid var(--cyan)" : "none", opacity: 0.4, ...s }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   LOBBY
═══════════════════════════════════════════ */
function LobbyScreen({ alias, players, onBegin }: { alias: string; players: Player[]; onBegin: () => void }) {
  const { lang, t } = useLang();
  const isTh     = lang === "th";
  const monoF    = isTh ? "var(--font-thai)" : "var(--font-mono)";
  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)";
  const pixelF   = isTh ? "var(--font-thai)" : "var(--font-pixel)";

  const allInLobby = [...players, { id: "me", alias, score: 0, answered: 0 }];
  const [countdown, setCountdown] = useState<number | null>(null);

  /* briefing line icons */
  const briefingIcons = [BookOpenIcon, CheckIcon, BoltIcon, XMarkIcon];

  const handleReady = () => {
    setCountdown(3);
    let current = 3;
    const iv = setInterval(() => {
      current -= 1;
      if (current <= 0) { clearInterval(iv); setCountdown(null); onBegin(); }
      else setCountdown(current);
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-6) var(--space-5)", position: "relative" }}>
      <div style={{ position: "absolute", top: 16, right: 16 }}><LangToggle /></div>

      <div style={{ maxWidth: 520, width: "100%", position: "relative", zIndex: 1 }}>
        <TerminalHeader label={t.lobbyTitle} lang={lang} />

        <div style={{ margin: "var(--space-5) 0" }}>
          {allInLobby.map((p, i) => (
            <div key={p.id} className="animate-slide-in" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) var(--space-5)", marginBottom: "var(--space-2)", background: p.id === "me" ? "rgba(0,245,255,0.06)" : "var(--surface-1)", border: p.id === "me" ? "1px solid var(--cyan)" : "1px solid var(--border)", animationDelay: `${i * 0.1}s` }}>
              <SignalIcon style={{ width: 14, height: 14, color: "var(--green)", flexShrink: 0 }} />
              <span style={{ fontFamily: monoF, color: p.id === "me" ? "var(--cyan)" : "var(--foreground)", flex: 1, fontSize: 14 }}>
                {p.alias}
                {p.id === "me" && <span style={{ color: "var(--cyan-dim)", fontSize: 11, marginLeft: 8 }}>{t.you}</span>}
              </span>
              <span style={{ fontFamily: monoF, color: "var(--green)", fontSize: 12 }}>{t.ready}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "var(--space-5)", marginBottom: "var(--space-6)" }}>
          <div style={{ fontFamily: pixelF, fontSize: isTh ? 14 : 15, color: "var(--amber)", marginBottom: "var(--space-3)" }}>{t.briefingLabel}</div>
          {t.briefingLines.map((line, i) => {
            const Icon = briefingIcons[i];
            const isWarning = i === 3;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", marginBottom: 6 }}>
                <Icon style={{ width: 14, height: 14, color: isWarning ? "var(--red)" : "var(--cyan-dim)", flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontFamily: pixelF, fontSize: isTh ? 14 : 16, lineHeight: 1.6, color: isWarning ? "var(--red)" : "var(--foreground)", opacity: 0.85 }}>{line}</span>
              </div>
            );
          })}
        </div>

        {countdown !== null ? (
          <div style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: 72, color: "var(--cyan)", textShadow: "var(--glow-cyan)" }}>
            {countdown}
          </div>
        ) : (
          <button onClick={handleReady} style={{ width: "100%", background: "var(--cyan)", color: "var(--background)", border: "none", fontFamily: displayF, fontSize: isTh ? 16 : 15, fontWeight: 700, padding: "var(--space-5)", cursor: "pointer", letterSpacing: isTh ? "0.04em" : "0.15em", boxShadow: "var(--glow-cyan)", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
            <PlayIcon style={{ width: 18, height: 18 }} />
            {t.startInspection}
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   GAME
═══════════════════════════════════════════ */
function GameScreen({ scenario, currentIdx, totalScenarios, score, timeLeft, timerPct, timerColor, stunned, stunCount, lastResult, allPlayers, myAlias, onAnswer }: {
  scenario: Scenario; currentIdx: number; totalScenarios: number; score: number;
  timeLeft: number; timerPct: number; timerColor: string; stunned: boolean;
  stunCount: number; lastResult: "correct" | "wrong" | null; allPlayers: Player[];
  myAlias: string; onAnswer: (v: Verdict | null) => void;
}) {
  const { lang, t } = useLang();
  const isTh      = lang === "th";
  const monoF     = isTh ? "var(--font-thai)" : "var(--font-mono)";
  const displayF  = isTh ? "var(--font-thai)" : "var(--font-display)";
  const typeLabel = isTh ? (scenario.type === "backend" ? t.backend : t.frontend) : scenario.type.toUpperCase();
  const title     = isTh ? scenario.titleTh : scenario.titleEn;
  const typeColor = scenario.type === "backend" ? "var(--green)" : "var(--magenta)";
  const typeBg    = scenario.type === "backend" ? "rgba(0,255,65,0.15)" : "rgba(255,0,204,0.15)";
  const [showCode, setShowCode] = useState(false);
  const [showHint, setShowHint] = useState(false);

  /* reset view when scenario changes */
  useEffect(() => { setShowCode(false); setShowHint(false); }, [scenario.id]);

  return (
    <div className="game-layout" style={{ background: "var(--background)" }}>
      {/* TOP BAR */}
      <div className="game-topbar topbar-inner">
        <span className="topbar-title" style={{ fontFamily: displayF, fontSize: 13, color: "var(--magenta)", fontWeight: 700, letterSpacing: isTh ? "0.02em" : "0.1em" }}>
          {t.gameTitle}
        </span>
        <span className="topbar-meta" style={{ fontFamily: monoF, fontSize: 12, color: "var(--muted-foreground)" }}>
          {t.scenario} {currentIdx + 1}{t.of}{totalScenarios} — {typeLabel}
        </span>
        <div className="topbar-right">
          {stunCount > 0 && (
            <span style={{ fontFamily: monoF, fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
              <BoltIcon style={{ width: 13, height: 13 }} />
              {t.stuns} {stunCount}
            </span>
          )}
          <span style={{ fontFamily: displayF, fontSize: 14, color: "var(--amber)", fontWeight: 700 }}>
            {score.toLocaleString()} {t.pts}
          </span>
          <LangToggle />
        </div>
      </div>

      {/* CODE / UI PANEL */}
      <div className="game-code" style={{ padding: "var(--space-5)", gap: "var(--space-3)" }}>
        {/* scenario header */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", padding: "var(--space-3) var(--space-4)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <span style={{ fontFamily: monoF, fontSize: 11, padding: "2px 8px", background: typeBg, border: `1px solid ${typeColor}`, color: typeColor, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            {typeLabel}
          </span>
          <span style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--foreground)", flex: 1 }}>
            {title}
          </span>
          {/* UI/Code toggle — only for frontend scenarios */}
          {scenario.type === "frontend" && (
            <button
              onClick={() => setShowCode((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${showCode ? "var(--cyan)" : "var(--magenta)"}`, color: showCode ? "var(--cyan)" : "var(--magenta)", fontFamily: monoF, fontSize: 11, padding: "3px 10px", cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.15s", whiteSpace: "nowrap" }}
            >
              {showCode
                ? <><WindowIcon style={{ width: 13, height: 13 }} />{t.viewUI}</>
                : <><CodeBracketIcon style={{ width: 13, height: 13 }} />{t.viewCode}</>
              }
            </button>
          )}
        </div>

        {/* Scenario context brief */}
        <div style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.2)", padding: "var(--space-3) var(--space-4)" }}>
          <div style={{ fontFamily: monoF, fontSize: 10, color: "var(--cyan)", letterSpacing: isTh ? "0.03em" : "0.2em", marginBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpenIcon style={{ width: 12, height: 12 }} />
            {t.scenarioContext}
          </div>
          <p style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)", fontSize: isTh ? 14 : 13, color: "var(--foreground)", margin: 0, lineHeight: 1.7 }}>
            {isTh ? scenario.contextTh : scenario.contextEn}
          </p>
          {/* Hint toggle */}
          <button
            onClick={() => setShowHint((v) => !v)}
            style={{ marginTop: "var(--space-3)", background: "transparent", border: "none", color: "var(--amber)", fontFamily: monoF, fontSize: 11, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5, letterSpacing: isTh ? "0.02em" : "0.08em" }}
          >
            <BoltIcon style={{ width: 12, height: 12 }} />
            {showHint ? t.hideHint : t.showHint}
          </button>
          {showHint && (
            <div className="animate-slide-in" style={{ marginTop: "var(--space-2)", background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.3)", padding: "var(--space-3)", fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)", fontSize: isTh ? 14 : 12, color: "var(--amber)", lineHeight: 1.7 }}>
              {isTh ? scenario.hintTh : scenario.hintEn}
            </div>
          )}
        </div>

        {/* Content: rendered UI or code */}
        {scenario.type === "frontend" && !showCode ? (
          <div style={{ flex: 1, overflow: "auto", border: "1px solid var(--border-bright)", background: "#f5f5f5", minHeight: 220, position: "relative" }}>
            {/* browser chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "8px 12px", background: "#e0e0e0", borderBottom: "1px solid #ccc" }}>
              {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ flex: 1, background: "#fff", borderRadius: 4, padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginLeft: 8 }}>
                https://app.example.com
              </div>
            </div>
            {/* rendered UI */}
            <div style={{ padding: "var(--space-6)" }}>
              <ScenarioUIRenderer id={scenario.id} />
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-bright)", flex: 1, overflow: "auto", minHeight: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "7px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {["var(--red)", "var(--amber)", "var(--green)"].map((c, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", marginLeft: 8 }}>
                {scenario.type === "backend" ? t.serverFile : t.componentFile}
              </span>
            </div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7, color: "var(--foreground)", padding: "var(--space-4)", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "auto" }}>
              {scenario.code}
            </pre>
          </div>
        )}
      </div>

      {/* LEADERBOARD SIDEBAR */}
      <div className="game-sidebar">
        <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border)", fontFamily: monoF, fontSize: 11, color: "var(--cyan)", letterSpacing: isTh ? "0.04em" : "0.2em", display: "flex", alignItems: "center", gap: 6 }}>
          <SignalIcon style={{ width: 13, height: 13 }} />
          {t.liveRankings}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "var(--space-2)" }}>
          {allPlayers.map((p, rank) => (
            <div key={p.id} className="lb-row" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", marginBottom: "var(--space-1)", background: p.alias === myAlias ? "rgba(0,245,255,0.07)" : "transparent", border: p.alias === myAlias ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: rank === 0 ? "var(--amber)" : rank === 1 ? "#aaa" : rank === 2 ? "#cd7f32" : "var(--muted-foreground)", minWidth: 22 }}>#{rank + 1}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: p.alias === myAlias ? "var(--cyan)" : "var(--foreground)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.alias}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber)", whiteSpace: "nowrap" }}>{p.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="game-controls" style={{ padding: "var(--space-4) var(--space-5)" }}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontFamily: monoF, fontSize: 11, color: "var(--muted-foreground)" }}>{t.timeRemaining}</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: timerColor, textShadow: `0 0 8px ${timerColor}` }}>{timeLeft}s</span>
          </div>
          <div style={{ height: 5, background: "var(--surface-3)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, boxShadow: `0 0 6px ${timerColor}`, transition: "width 1s linear, background 0.5s" }} />
          </div>
        </div>

        {stunned ? (
          <StunOverlay />
        ) : lastResult ? (
          <ResultFlash result={lastResult} />
        ) : (
          <div className="verdict-grid">
            <VerdictButton label={t.complyLabel} sublabel={t.complySub} color="var(--green)" glow="var(--glow-green)" Icon={CheckIcon} onClick={() => onAnswer("comply")} lang={lang} />
            <VerdictButton label={t.violateLabel} sublabel={t.violateSub} color="var(--red)" glow="var(--glow-red)" Icon={XMarkIcon} onClick={() => onAnswer("violate")} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   VERDICT BUTTON
═══════════════════════════════════════════ */
function VerdictButton({ label, sublabel, color, glow, Icon, onClick, lang }: {
  label: string; sublabel: string; color: string; glow: string;
  Icon: React.ElementType; onClick: () => void; lang: Lang;
}) {
  const isTh = lang === "th";
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? `${color}22` : "transparent", border: `2px solid ${color}`, color, fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)", fontSize: 15, fontWeight: 700, padding: "var(--space-4)", cursor: "pointer", letterSpacing: isTh ? "0.02em" : "0.08em", boxShadow: hover ? glow : "none", transition: "all 0.15s", textAlign: "center" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
        {label}
      </div>
      <div style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-pixel)", fontSize: 12, fontWeight: 400, opacity: 0.65, marginTop: 3 }}>{sublabel}</div>
    </button>
  );
}

/* ════════════════════════════════════════════
   STUN / FLASH
═══════════════════════════════════════════ */
function StunOverlay() {
  const { lang, t } = useLang();
  const isTh = lang === "th";
  const [count, setCount] = useState(3);
  useEffect(() => { const iv = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000); return () => clearInterval(iv); }, []);
  return (
    <div className="animate-shake" style={{ background: "rgba(255,34,68,0.1)", border: "2px solid var(--red)", padding: "var(--space-4)", textAlign: "center", boxShadow: "var(--glow-red)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)", fontSize: 20, color: "var(--red)", fontWeight: 700, letterSpacing: isTh ? "0.02em" : "0.1em" }}>
        <BoltIcon style={{ width: 20, height: 20 }} />
        {t.stunTitle} — {count}s
      </div>
      <div style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-pixel)", fontSize: 13, color: "var(--red)", opacity: 0.7, marginTop: 3 }}>{t.stunSub}</div>
    </div>
  );
}

function ResultFlash({ result }: { result: "correct" | "wrong" }) {
  const { lang, t } = useLang();
  const isTh = lang === "th";
  const ok = result === "correct";
  const Icon = ok ? CheckCircleIcon : XCircleIcon;
  return (
    <div className="animate-slide-in" style={{ background: ok ? "rgba(0,255,65,0.1)" : "rgba(255,34,68,0.1)", border: `2px solid ${ok ? "var(--green)" : "var(--red)"}`, padding: "var(--space-4)", textAlign: "center", boxShadow: ok ? "var(--glow-green)" : "var(--glow-red)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: isTh ? "var(--font-thai)" : "var(--font-display)", fontSize: 20, color: ok ? "var(--green)" : "var(--red)", fontWeight: 700, letterSpacing: isTh ? "0.02em" : "0.12em" }}>
        <Icon style={{ width: 22, height: 22 }} />
        {ok ? t.correctFlash : t.wrongFlash}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   REVIEW
═══════════════════════════════════════════ */
function ReviewScreen({ scenarios, answers, score, correctCount, stunCount, allPlayers, myAlias, reviewIdx, setReviewIdx, onPlayAgain }: {
  scenarios: Scenario[]; answers: Answer[]; score: number; correctCount: number;
  stunCount: number; allPlayers: Player[]; myAlias: string;
  reviewIdx: number; setReviewIdx: (i: number) => void; onPlayAgain: () => void;
}) {
  const { lang, t } = useLang();
  const isTh     = lang === "th";
  const monoF    = isTh ? "var(--font-thai)" : "var(--font-mono)";
  const displayF = isTh ? "var(--font-thai)" : "var(--font-display)";
  const pixelF   = isTh ? "var(--font-thai)" : "var(--font-pixel)";

  const [showCode, setShowCode] = useState(false);
  useEffect(() => { setShowCode(false); }, [reviewIdx]);

  const myRank    = allPlayers.findIndex((p) => p.alias === myAlias) + 1;
  const scenario  = scenarios[reviewIdx];
  const answer    = answers.find((a) => a.scenarioId === scenario.id);
  const isCorrect = answer?.correct ?? false;
  const title     = isTh ? scenario.titleTh : scenario.titleEn;
  const expl      = isTh ? scenario.explanationTh : scenario.explanationEn;
  const typeLabel = isTh ? (scenario.type === "backend" ? t.backend : t.frontend) : scenario.type.toUpperCase();
  const typeColor = scenario.type === "backend" ? "var(--green)" : "var(--magenta)";
  const typeBg    = scenario.type === "backend" ? "rgba(0,255,65,0.15)" : "rgba(255,0,204,0.15)";

  return (
    <div className="review-layout" style={{ background: "var(--background)" }}>
      {/* TOP BAR */}
      <div className="review-topbar topbar-inner" style={{ flexWrap: "wrap", gap: "var(--space-3)" }}>
        <span className="topbar-title" style={{ fontFamily: displayF, fontSize: 13, color: "var(--magenta)", fontWeight: 700, letterSpacing: isTh ? "0.02em" : "0.08em" }}>
          {t.debrief}
        </span>
        <div className="topbar-right" style={{ flex: 1, justifyContent: "flex-end", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <span style={{ fontFamily: monoF, fontSize: 12, color: "var(--amber)" }}>{t.rank}{myRank}</span>
          <span style={{ fontFamily: monoF, fontSize: 12, color: "var(--cyan)" }}>{score.toLocaleString()} {t.pts}</span>
          <span style={{ fontFamily: monoF, fontSize: 12, color: "var(--green)" }}>{correctCount}/{scenarios.length} {t.correct}</span>
          {stunCount > 0 && (
            <span style={{ fontFamily: monoF, fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 4 }}>
              <BoltIcon style={{ width: 12, height: 12 }} />
              {stunCount}
            </span>
          )}
          <LangToggle />
          <button onClick={onPlayAgain} style={{ background: "transparent", border: "1px solid var(--cyan)", color: "var(--cyan)", fontFamily: monoF, fontSize: 12, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
            <ArrowPathIcon style={{ width: 13, height: 13 }} />
            {t.playAgain}
          </button>
        </div>
      </div>

      {/* CASE LIST */}
      <div className="review-sidebar">
        <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border)", fontFamily: monoF, fontSize: 11, color: "var(--muted-foreground)", letterSpacing: isTh ? "0.03em" : "0.18em" }}>
          {t.caseFiles}
        </div>
        {scenarios.map((s, i) => {
          const a = answers.find((x) => x.scenarioId === s.id);
          const ok = a?.correct;
          return (
            <button key={s.id} onClick={() => setReviewIdx(i)} style={{ display: "flex", width: "100%", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: reviewIdx === i ? "rgba(0,245,255,0.07)" : "transparent", borderLeft: reviewIdx === i ? "2px solid var(--cyan)" : "2px solid transparent", borderRight: "none", borderTop: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", textAlign: "left" }}>
              {ok
                ? <CheckCircleIcon style={{ width: 15, height: 15, color: "var(--green)", flexShrink: 0 }} />
                : <XCircleIcon style={{ width: 15, height: 15, color: "var(--red)", flexShrink: 0 }} />
              }
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontFamily: monoF, fontSize: 11, color: ok ? "var(--green)" : "var(--red)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {isTh ? s.titleTh : s.titleEn}
                </div>
                <div style={{ fontFamily: monoF, fontSize: 10, color: "var(--muted-foreground)" }}>
                  {isTh ? (s.type === "backend" ? t.backend : t.frontend) : s.type.toUpperCase()}
                </div>
              </div>
            </button>
          );
        })}

        <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontFamily: monoF, fontSize: 10, color: "var(--muted-foreground)", letterSpacing: isTh ? "0.02em" : "0.18em", marginBottom: "var(--space-2)" }}>{t.finalRankings}</div>
          {allPlayers.map((p, rank) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "4px 0", fontFamily: monoF, fontSize: 11 }}>
              <span style={{ color: rank === 0 ? "var(--amber)" : "var(--muted-foreground)", minWidth: 22 }}>#{rank + 1}</span>
              <span style={{ flex: 1, color: p.alias === myAlias ? "var(--cyan)" : "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.alias}</span>
              <span style={{ color: "var(--amber)" }}>{p.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FEEDBACK PANEL */}
      <div className="review-main" style={{ padding: "var(--space-5)" }}>
        <TerminalHeader label={`CASE ${reviewIdx + 1} — ${title}`} lang={lang} />

        <div style={{ display: "flex", gap: "var(--space-2)", margin: "var(--space-4) 0", flexWrap: "wrap" }}>
          <Badge bg={typeBg} border={typeColor} color={typeColor} font={monoF}>{typeLabel}</Badge>
          <Badge
            bg={scenario.answer === "comply" ? "rgba(0,255,65,0.15)" : "rgba(255,34,68,0.15)"}
            border={scenario.answer === "comply" ? "var(--green)" : "var(--red)"}
            color={scenario.answer === "comply" ? "var(--green)" : "var(--red)"}
            font={monoF}
          >
            {scenario.answer === "comply" ? t.compliesWith : t.violatesWith}
          </Badge>
          <Badge
            bg={isCorrect ? "rgba(0,245,255,0.1)" : "rgba(255,34,68,0.1)"}
            border={isCorrect ? "var(--cyan)" : "var(--red)"}
            color={isCorrect ? "var(--cyan)" : "var(--red)"}
            font={monoF}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {isCorrect
                ? <CheckCircleIcon style={{ width: 12, height: 12 }} />
                : <XCircleIcon style={{ width: 12, height: 12 }} />
              }
              {t.yourAnswer} {isCorrect ? t.answerCorrect : t.answerWrong}
            </span>
          </Badge>
        </div>

        {/* Scenario context brief */}
        <div style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.2)", padding: "var(--space-3) var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div style={{ fontFamily: monoF, fontSize: 10, color: "var(--cyan)", letterSpacing: isTh ? "0.03em" : "0.2em", marginBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpenIcon style={{ width: 12, height: 12 }} />
            {t.scenarioContext}
          </div>
          <p style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)", fontSize: isTh ? 14 : 13, color: "var(--foreground)", margin: 0, lineHeight: 1.7 }}>
            {isTh ? scenario.contextTh : scenario.contextEn}
          </p>
          <div style={{ marginTop: "var(--space-3)", background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.3)", padding: "var(--space-3)", fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)", fontSize: isTh ? 14 : 12, color: "var(--amber)", lineHeight: 1.7, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <BoltIcon style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2 }} />
            <span>{isTh ? scenario.hintTh : scenario.hintEn}</span>
          </div>
        </div>

        {/* Code / UI preview with toggle for frontend scenarios */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          {/* toggle header */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "5px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderBottom: "none", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", flex: 1 }}>
              {scenario.type === "backend" ? t.serverFile : (showCode ? t.componentFile : "preview.render")}
            </span>
            {scenario.type === "frontend" && (
              <button
                onClick={() => setShowCode((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${showCode ? "var(--cyan)" : "var(--magenta)"}`, color: showCode ? "var(--cyan)" : "var(--magenta)", fontFamily: monoF, fontSize: 11, padding: "3px 10px", cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.15s", whiteSpace: "nowrap" }}
              >
                {showCode
                  ? <><WindowIcon style={{ width: 13, height: 13 }} />{t.viewUI}</>
                  : <><CodeBracketIcon style={{ width: 13, height: 13 }} />{t.viewCode}</>
                }
              </button>
            )}
          </div>

          {scenario.type === "frontend" && !showCode ? (
            /* rendered UI */
            <div style={{ border: "1px solid var(--border)", background: "#f5f5f5", maxHeight: 240, overflow: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "8px 12px", background: "#e0e0e0", borderBottom: "1px solid #ccc" }}>
                {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
                <div style={{ flex: 1, background: "#fff", borderRadius: 4, padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginLeft: 8 }}>
                  https://app.example.com
                </div>
              </div>
              <div style={{ padding: "var(--space-6)" }}>
                <ScenarioUIRenderer id={scenario.id} />
              </div>
            </div>
          ) : (
            /* code */
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", maxHeight: 200, overflow: "auto" }}>
              <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.65, color: "var(--foreground)", padding: "var(--space-4)", margin: 0, whiteSpace: "pre-wrap" }}>
                {scenario.code}
              </pre>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div style={{ background: "var(--surface-2)", border: `1px solid ${isCorrect ? "rgba(0,245,255,0.25)" : "rgba(255,34,68,0.25)"}`, padding: "var(--space-5)", marginBottom: "var(--space-4)" }}>
          <div style={{ fontFamily: monoF, fontSize: 11, color: "var(--cyan)", letterSpacing: isTh ? "0.03em" : "0.18em", marginBottom: "var(--space-3)" }}>{t.pdpaAnalysis}</div>
          <p style={{ fontFamily: isTh ? "var(--font-thai)" : pixelF, fontSize: isTh ? 15 : 17, lineHeight: 1.8, color: "var(--foreground)", margin: 0 }}>
            {expl}
          </p>
        </div>

        {/* PDPA reference */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: monoF, fontSize: 11, padding: "5px 12px", background: "rgba(255,204,0,0.1)", border: "1px solid var(--amber)", color: "var(--amber)" }}>
          <ScaleIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
          {scenario.pdpaRef}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
          <button onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))} disabled={reviewIdx === 0} style={{ background: "transparent", border: "1px solid var(--border-bright)", color: "var(--foreground)", fontFamily: monoF, fontSize: 12, padding: "var(--space-3) var(--space-5)", cursor: reviewIdx === 0 ? "not-allowed" : "pointer", opacity: reviewIdx === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: 5 }}>
            <ChevronLeftIcon style={{ width: 15, height: 15 }} />
            {t.prev}
          </button>
          <button onClick={() => setReviewIdx(Math.min(scenarios.length - 1, reviewIdx + 1))} disabled={reviewIdx === scenarios.length - 1} style={{ background: "transparent", border: "1px solid var(--border-bright)", color: "var(--foreground)", fontFamily: monoF, fontSize: 12, padding: "var(--space-3) var(--space-5)", cursor: reviewIdx === scenarios.length - 1 ? "not-allowed" : "pointer", opacity: reviewIdx === scenarios.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", gap: 5 }}>
            {t.next}
            <ChevronRightIcon style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SCENARIO UI RENDERER
   Renders an authentic-looking UI for each
   frontend scenario so players can spot
   dark patterns / compliance visually.
═══════════════════════════════════════════ */

/* shared light-theme styles */
const ui = {
  body: { fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#1a1a1a" } as React.CSSProperties,
  card: { background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: 480, margin: "0 auto" } as React.CSSProperties,
  h2: { fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 0 } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginBottom: 6, marginTop: 0 } as React.CSSProperties,
  p: { fontSize: 13, color: "#555", lineHeight: 1.6, marginTop: 0, marginBottom: 12 } as React.CSSProperties,
  label: { fontSize: 13, color: "#333", display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", lineHeight: 1.5 } as React.CSSProperties,
  input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" } as React.CSSProperties,
  select: { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", fontSize: 14, background: "#fff", marginBottom: 12 } as React.CSSProperties,
  btnPrimary: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" } as React.CSSProperties,
  btnDanger: { background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" } as React.CSSProperties,
  hint: { fontSize: 12, color: "#888", marginTop: 8 } as React.CSSProperties,
  divider: { borderTop: "1px solid #e5e7eb", margin: "16px 0" } as React.CSSProperties,
};

function ScenarioUIRenderer({ id }: { id: number }) {
  switch (id) {
    /* ── Scenario 2: Cookie Consent DARK PATTERN ── */
    case 2:
      return (
        <div style={ui.body}>
          <div style={{ ...ui.card, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 16 }}>🍪</span>
              </div>
              <h3 style={{ ...ui.h3, margin: 0 }}>We value your privacy</h3>
            </div>
            <p style={ui.p}>
              We and our partners use cookies to improve your browsing experience,
              show you personalized content, and analyze our traffic.
            </p>
            {/* BIG accept button */}
            <button style={{ ...ui.btnPrimary, fontSize: 15, padding: "14px 20px", marginBottom: 0 }}>
              Accept All Cookies
            </button>
            {/* tiny hidden reject — dark pattern */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button style={{ background: "none", border: "none", color: "#bbb", fontSize: 9, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                Reject (optional)
              </button>
            </div>
          </div>
        </div>
      );

    /* ── Scenario 4: Account Deletion UI — COMPLY ── */
    case 4:
      return (
        <div style={ui.body}>
          <div style={ui.card}>
            <h2 style={{ ...ui.h2, color: "#111" }}>Account Settings</h2>
            <div style={ui.divider} />
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: 16 }}>
              <h3 style={{ ...ui.h3, color: "#991b1b" }}>Danger Zone</h3>
              <p style={{ ...ui.p, color: "#7f1d1d", marginBottom: 12 }}>
                You may request deletion of your account and all associated personal data.
                This action cannot be undone.
              </p>
              <button style={{ ...ui.btnDanger, marginBottom: 8 }}>
                Delete My Account &amp; Data
              </button>
              <p style={{ ...ui.hint, color: "#b91c1c" }}>
                Data will be permanently removed within 30 days per our privacy policy.
              </p>
            </div>
          </div>
        </div>
      );

    /* ── Scenario 6: DSAR Form — COMPLY ── */
    case 6: {
      const [submitted, setSubmitted] = useState(false);
      return (
        <div style={ui.body}>
          <div style={ui.card}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: 48, height: 48, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CheckIcon style={{ width: 28, height: 28, color: "#16a34a" }} />
                </div>
                <h3 style={{ ...ui.h3, color: "#15803d" }}>Request Received</h3>
                <p style={ui.p}>We will respond within 30 days as required by PDPA.</p>
                <button onClick={() => setSubmitted(false)} style={{ ...ui.btnPrimary, width: "auto", padding: "8px 20px", fontSize: 13 }}>Submit Another</button>
              </div>
            ) : (
              <>
                <h2 style={ui.h2}>Data Subject Access Request</h2>
                <p style={{ ...ui.p, marginBottom: 16 }}>Exercise your PDPA rights. We will process your request within 30 days.</p>
                <label style={{ ...ui.label, display: "block", marginBottom: 4, fontWeight: 600 }}>Request Type</label>
                <select style={ui.select} defaultValue="">
                  <option value="" disabled>Select a request type…</option>
                  <option>Access — View my personal data</option>
                  <option>Rectify — Correct my data</option>
                  <option>Erase — Delete my data</option>
                  <option>Portability — Export my data</option>
                </select>
                <label style={{ ...ui.label, display: "block", marginBottom: 4, fontWeight: 600 }}>Email Address</label>
                <input style={{ ...ui.input, marginBottom: 12 }} type="email" placeholder="you@example.com" readOnly />
                <label style={{ ...ui.label, display: "block", marginBottom: 4, fontWeight: 600 }}>Additional Details</label>
                <textarea style={{ ...ui.input, height: 72, resize: "none", marginBottom: 16 } as React.CSSProperties} placeholder="Describe your request…" readOnly />
                <button onClick={() => setSubmitted(true)} style={ui.btnPrimary}>Submit Request</button>
              </>
            )}
          </div>
        </div>
      );
    }

    /* ── Scenario 8: Marketing Opt-in — COMPLY ── */
    case 8: {
      const [checked, setChecked] = useState(false);
      return (
        <div style={ui.body}>
          <div style={ui.card}>
            <h2 style={ui.h2}>Order Summary</h2>
            <div style={{ background: "#f9fafb", borderRadius: 6, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span>TechShop Pro Subscription</span><span style={{ fontWeight: 600 }}>฿999</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555" }}>
                <span>Tax (7%)</span><span>฿69.93</span>
              </div>
              <div style={ui.divider} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>Total</span><span>฿1,068.93</span>
              </div>
            </div>
            <div style={ui.divider} />
            {/* checkbox unchecked by default — compliant */}
            <label style={{ ...ui.label, marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: "#374151" }}>
                I agree to receive promotional emails and personalized offers from TechShop.
              </span>
            </label>
            <p style={{ ...ui.hint, marginBottom: 16 }}>
              You can unsubscribe at any time via account settings or email links.
            </p>
            <button style={ui.btnPrimary}>Complete Purchase</button>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

/* ════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════ */
function TerminalHeader({ label, lang }: { label: string; lang: Lang }) {
  const isTh = lang === "th";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
      <div style={{ width: 7, height: 7, background: "var(--cyan)", boxShadow: "var(--glow-cyan)", flexShrink: 0 }} />
      <span style={{ fontFamily: isTh ? "var(--font-thai)" : "var(--font-mono)", fontSize: 12, color: "var(--cyan)", letterSpacing: isTh ? "0.03em" : "0.18em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--border)", flexShrink: 0 }} />
    </div>
  );
}

function Badge({ bg, border, color, font, children }: { bg: string; border: string; color: string; font: string; children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: font, fontSize: 11, padding: "3px 9px", background: bg, border: `1px solid ${border}`, color, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
      {children}
    </span>
  );
}
