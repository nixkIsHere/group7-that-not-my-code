import "dotenv/config"
import { pool } from "./pool"
import type { Scenario } from "../types"

/**
 * The 10 synthetic PDPA case studies (moved here from the old client-side
 * `SCENARIOS` const so the answer key never ships in the frontend bundle).
 */
const SCENARIOS: Scenario[] = [
  {
    id: 1,
    type: "backend",
    titleEn: "User Registration API",
    titleTh: "API ลงทะเบียนผู้ใช้",
    contextEn:
      "A startup is building a new healthcare app. You've been assigned to review the user registration endpoint before it ships to production. The PR author says it 'collects everything we might need later.'",
    contextTh:
      "สตาร์ทอัพกำลังสร้างแอปด้านสุขภาพ คุณได้รับมอบหมายให้ตรวจสอบ endpoint การลงทะเบียนก่อนนำขึ้น production ผู้เขียน PR บอกว่า 'เก็บทุกอย่างที่อาจต้องการในอนาคต'",
    hintEn:
      "Think about what a registration form actually needs vs. what this collects. Also check how the query is built.",
    hintTh:
      "คิดดูว่าฟอร์มลงทะเบียนต้องการอะไรจริงๆ เทียบกับสิ่งที่เก็บ และตรวจสอบวิธีสร้าง query",
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
    explanationEn:
      "Collects excessive personal data (national ID, blood type, medical history, income) far beyond registration needs. Violates PDPA's Data Minimization principle (§22). String interpolation also creates SQL injection vulnerabilities, and sensitive data is stored without explicit consent.",
    explanationTh:
      "เก็บข้อมูลส่วนบุคคลเกินความจำเป็น (เลขบัตรประชาชน, หมู่เลือด, ประวัติการรักษา, รายได้) ละเมิดหลักการ Data Minimization ของ PDPA (มาตรา 22) นอกจากนี้ยังมีช่องโหว่ SQL Injection และจัดเก็บข้อมูลโดยไม่ได้รับความยินยอม",
    pdpaRef: "PDPA §22 — Data Minimization",
  },
  {
    id: 2,
    type: "frontend",
    titleEn: "Cookie Consent Banner",
    titleTh: "แบนเนอร์ขอความยินยอม Cookie",
    contextEn:
      "An e-commerce site redesigned their cookie consent dialog. The marketing team requested the new design to 'maximize opt-in rates.' Review whether the consent UI respects user choice.",
    contextTh:
      "เว็บไซต์อีคอมเมิร์ซออกแบบ cookie consent ใหม่ ทีมการตลาดขอให้ออกแบบเพื่อ 'เพิ่มอัตราการยอมรับ' ตรวจสอบว่า UI ยินยอมให้ผู้ใช้เลือกอย่างเสรีหรือไม่",
    hintEn:
      "Look at the visual weight and size of each option. PDPA requires both Accept and Reject to be equally accessible.",
    hintTh:
      "สังเกตน้ำหนักภาพและขนาดของแต่ละตัวเลือก PDPA กำหนดให้ทั้ง 'ยอมรับ' และ 'ปฏิเสธ' ต้องเข้าถึงได้เท่าเทียมกัน",
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
    explanationEn:
      "A classic Dark Pattern. 'Accept All' is large and prominent while 'Reject' is visually suppressed (tiny, grey, pushed down). PDPA requires consent to be freely given — unequal options manipulate consent and violate §19.",
    explanationTh:
      "Dark Pattern แบบคลาสสิก ปุ่ม 'ยอมรับ' ใหญ่และเด่นชัด ขณะที่ 'ปฏิเสธ' ถูกซ่อนไว้ PDPA กำหนดว่าความยินยอมต้องเป็นไปโดยเสรี การนำเสนอตัวเลือกที่ไม่เท่าเทียมถือเป็นการบิดเบือนความยินยอม ละเมิดมาตรา 19",
    pdpaRef: "PDPA §19 — Consent Requirements",
  },
  {
    id: 3,
    type: "backend",
    titleEn: "Password Storage Handler",
    titleTh: "การจัดเก็บรหัสผ่าน",
    contextEn:
      "You're auditing the authentication service of a fintech application. A mid-level dev submitted this password update handler. The team lead flagged it for your review before merging.",
    contextTh:
      "คุณกำลังตรวจสอบ authentication service ของแอปฟินเทค นักพัฒนาระดับกลางส่ง password update handler นี้ หัวหน้าทีมให้คุณตรวจก่อน merge",
    hintEn:
      "Check: (1) How is the password stored? (2) Is the SQL query safe from injection? (3) Is plaintext ever saved?",
    hintTh:
      "ตรวจสอบ: (1) รหัสผ่านถูกจัดเก็บอย่างไร? (2) SQL query ปลอดภัยจาก injection หรือไม่? (3) มีการบันทึก plaintext หรือไม่?",
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
    explanationEn:
      "Correctly implements password security: bcrypt with 12 salt rounds (strong hashing), parameterized queries (no SQL injection), and never stores plaintext passwords. Aligns with PDPA's security safeguard requirements.",
    explanationTh:
      "ปฏิบัติตามมาตรฐานความปลอดภัยอย่างถูกต้อง: ใช้ bcrypt กับ 12 salt rounds, parameterized queries ป้องกัน SQL injection และไม่เก็บรหัสผ่าน plaintext สอดคล้องกับ PDPA มาตรา 37",
    pdpaRef: "PDPA §37 — Security Safeguards",
  },
  {
    id: 4,
    type: "frontend",
    titleEn: "Account Deletion UI",
    titleTh: "UI ลบบัญชีผู้ใช้",
    contextEn:
      "A SaaS product received user complaints that there was no way to delete their account. Engineering shipped this account deletion section in the settings page. Does it properly implement the Right to Erasure?",
    contextTh:
      "ผลิตภัณฑ์ SaaS ได้รับร้องเรียนว่าไม่มีวิธีลบบัญชี วิศวกรทำส่วนลบบัญชีในหน้าตั้งค่า ตรวจสอบว่าปฏิบัติตาม Right to Erasure ถูกต้องหรือไม่",
    hintEn:
      "Is the option clearly visible? Does the user know what happens to their data and when? Is there a safety confirmation step?",
    hintTh:
      "ตัวเลือกมองเห็นชัดเจนหรือไม่? ผู้ใช้รู้ว่าข้อมูลจะเกิดอะไรขึ้นและเมื่อไหร่? มีขั้นตอนยืนยันความปลอดภัยหรือไม่?",
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
    explanationEn:
      "Correctly implements the Right to Erasure. The deletion option is clearly visible, a confirmation step prevents accidents, and the 30-day processing window is disclosed. Fulfills data subject rights under §33.",
    explanationTh:
      "ปฏิบัติตามสิทธิ์การลบข้อมูลอย่างถูกต้อง ตัวเลือกการลบมองเห็นชัดเจน มีขั้นตอนยืนยัน และเปิดเผยระยะเวลา 30 วัน ปฏิบัติตามสิทธิ์เจ้าของข้อมูล PDPA มาตรา 33",
    pdpaRef: "PDPA §33 — Right to Erasure",
  },
  {
    id: 5,
    type: "backend",
    titleEn: "Analytics Data Export",
    titleTh: "ส่งออกข้อมูลวิเคราะห์",
    contextEn:
      "The growth team wants richer targeting data from their analytics partner. A backend dev wrote this scheduled export job. The team claims users 'implicitly agreed' by using the app. Review the code.",
    contextTh:
      "ทีม Growth ต้องการข้อมูลเพื่อ targeting จากพาร์ทเนอร์วิเคราะห์ข้อมูล นักพัฒนาเขียน export job นี้ ทีมอ้างว่าผู้ใช้ 'ยินยอมโดยปริยาย' จากการใช้แอป",
    hintEn:
      "Did users explicitly consent to their data being sent to a third party? What kind of data is being shared?",
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
    explanationEn:
      "Sharing personal data (name, email, phone, location logs) with a third-party analytics partner without explicit consent violates PDPA §27. No anonymization or consent verification is performed.",
    explanationTh:
      "การแบ่งปันข้อมูลส่วนบุคคลกับบุคคลที่สามโดยไม่ได้รับความยินยอม ละเมิด PDPA มาตรา 27 ไม่มีการทำ Anonymization หรือตรวจสอบความยินยอม",
    pdpaRef: "PDPA §27 — Third-Party Data Sharing",
  },
  {
    id: 6,
    type: "frontend",
    titleEn: "Data Access Request Form",
    titleTh: "แบบฟอร์มขอเข้าถึงข้อมูล",
    contextEn:
      "The legal team asked engineering to build a PDPA-compliant Data Subject Access Request (DSAR) portal. This is the result. Does it give users proper access to all their rights?",
    contextTh:
      "ทีมกฎหมายขอให้วิศวกรสร้างพอร์ทัล DSAR ที่สอดคล้องกับ PDPA นี่คือผลลัพธ์ ตรวจสอบว่าให้ผู้ใช้เข้าถึงสิทธิ์ทั้งหมดได้หรือไม่",
    hintEn:
      "PDPA grants 4 main rights: Access, Rectification, Erasure, and Portability. Check if all are available and if the response timeline is correct.",
    hintTh:
      "PDPA กำหนดสิทธิ์หลัก 4 ประการ: เข้าถึง, แก้ไข, ลบ และโอนย้าย ตรวจสอบว่ามีครบและระยะเวลาตอบกลับถูกต้อง",
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
    explanationEn:
      "Correctly implements a Data Subject Access Request workflow supporting all four major rights (Access, Rectification, Erasure, Portability) with a clear confirmation and the legally required 30-day response window per PDPA §30–34.",
    explanationTh:
      "ปฏิบัติตาม DSAR workflow อย่างถูกต้อง รองรับสิทธิ์ 4 ประการ (เข้าถึง, แก้ไข, ลบ, โอนย้าย) พร้อมการยืนยันและระยะเวลาตอบกลับ 30 วัน ตาม PDPA มาตรา 30-34",
    pdpaRef: "PDPA §30-34 — Data Subject Rights",
  },
  {
    id: 7,
    type: "backend",
    titleEn: "Error Logging Middleware",
    titleTh: "มิดเดิลแวร์บันทึกข้อผิดพลาด",
    contextEn:
      "The backend team added centralized error logging to speed up debugging in production. It's been running for 2 weeks. No one has reviewed it for privacy implications yet — that's your job.",
    contextTh:
      "ทีม Backend เพิ่ม error logging แบบรวมศูนย์เพื่อเร่ง debug ใน production ทำงานมา 2 สัปดาห์แล้ว ยังไม่มีใครตรวจสอบด้านความเป็นส่วนตัว นั่นคืองานของคุณ",
    hintEn:
      "What data ends up in the log file? Is the log file protected? Could this log contain passwords or personal data from request bodies?",
    hintTh:
      "ข้อมูลอะไรถูกบันทึกในไฟล์ log? ไฟล์ log ได้รับการป้องกันหรือไม่? log อาจมีรหัสผ่านหรือข้อมูลส่วนบุคคลจาก request body หรือไม่?",
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
    explanationEn:
      "Dumps the full user object and entire request body (possibly containing passwords and personal data) into an unprotected log file. Logging sensitive personal data without redaction violates PDPA's security safeguard principles.",
    explanationTh:
      "บันทึก object ผู้ใช้ทั้งหมดและข้อมูล request (อาจมีรหัสผ่าน, ข้อมูลส่วนบุคคล) ลงไฟล์ log ที่ไม่ได้รับการป้องกัน ละเมิดหลักการความปลอดภัยของ PDPA",
    pdpaRef: "PDPA §37 — Security Safeguards",
  },
  {
    id: 8,
    type: "frontend",
    titleEn: "Marketing Opt-in Checkbox",
    titleTh: "ช่องรับข้อมูลการตลาด",
    contextEn:
      "Marketing wants to build an email list from the checkout flow. Engineering added this opt-in checkbox. The product manager says 'users can always unsubscribe later.' Is the consent implementation legal?",
    contextTh:
      "ฝ่ายการตลาดต้องการสร้าง email list จากขั้นตอนชำระเงิน วิศวกรเพิ่ม opt-in checkbox นี้ Product manager บอกว่า 'ผู้ใช้ยกเลิกได้ทีหลัง' การ implement consent นี้ถูกกฎหมายหรือไม่?",
    hintEn:
      "Is the checkbox pre-ticked? Is marketing consent bundled with completing the purchase? Is opting out clearly explained?",
    hintTh:
      "ช่องถูกเลือกล่วงหน้าหรือไม่? ความยินยอมด้านการตลาดถูกรวมกับการชำระเงินหรือไม่? มีคำอธิบายวิธียกเลิกชัดเจนหรือไม่?",
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
    explanationEn:
      "Compliant marketing consent: checkbox is unchecked by default, consent is separate from the purchase action, purpose is clearly stated, and an easy opt-out is disclosed. Satisfies PDPA's freely-given, informed consent requirements.",
    explanationTh:
      "การขอความยินยอมด้านการตลาดที่ถูกต้อง: ช่องไม่ถูกเลือกล่วงหน้า, ความยินยอมแยกออกจากการซื้อ, ระบุวัตถุประสงค์ชัดเจน และมีวิธียกเลิก ปฏิบัติตาม PDPA มาตรา 19",
    pdpaRef: "PDPA §19 — Consent Requirements",
  },
  {
    id: 9,
    type: "backend",
    titleEn: "Session Token Storage",
    titleTh: "การจัดเก็บ Session Token",
    contextEn:
      "The auth team rebuilt session management using JWTs for a government-adjacent platform handling citizen data. They claim JWTs are 'stateless and secure.' Review the token generation logic carefully.",
    contextTh:
      "ทีม Auth สร้างระบบ session ใหม่ด้วย JWT สำหรับแพลตฟอร์มที่เกี่ยวข้องกับภาครัฐซึ่งจัดการข้อมูลพลเมือง พวกเขาอ้างว่า JWT 'stateless และปลอดภัย' ตรวจสอบ logic การสร้าง token อย่างละเอียด",
    hintEn:
      "JWT payloads are only base64-encoded, not encrypted. What data is embedded? Is the expiry duration appropriate?",
    hintTh:
      "JWT payload เป็นเพียง base64 ไม่ได้เข้ารหัส ข้อมูลอะไรถูกฝังไว้? ระยะหมดอายุเหมาะสมหรือไม่?",
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
    explanationEn:
      "Embedding sensitive personal data (email, national ID) and a 90-day expiry in JWT tokens violates data minimization and security principles. JWTs are base64-encoded (not encrypted) and may be logged insecurely. Only userId and role should be in the payload.",
    explanationTh:
      "ฝังข้อมูลส่วนบุคคลที่ละเอียดอ่อน (อีเมล, เลขบัตรประชาชน) และระยะหมดอายุ 90 วันใน JWT ละเมิดหลักการ Data Minimization JWT เป็น base64 (ไม่เข้ารหัส) และอาจถูกบันทึกโดยไม่ปลอดภัย",
    pdpaRef: "PDPA §22, §37 — Minimization & Security",
  },
  {
    id: 10,
    type: "backend",
    titleEn: "Data Retention Cleanup",
    titleTh: "การทำความสะอาดข้อมูล",
    contextEn:
      "The compliance team mandated a data retention policy after a regulatory audit. Engineering shipped this weekly cleanup job. It's scheduled to run for the first time tonight — sign off if it's compliant.",
    contextTh:
      "ทีม Compliance สั่งให้มีนโยบายเก็บรักษาข้อมูลหลังการตรวจสอบ วิศวกรทำ cleanup job รายสัปดาห์นี้ กำหนดรันคืนนี้เป็นครั้งแรก — อนุมัติถ้ามันสอดคล้องกฎหมาย",
    hintEn:
      "What data is deleted vs. archived? Who does the deletion affect? Is the archived data truly anonymized?",
    hintTh:
      "ข้อมูลใดถูกลบ vs ถูก archive? การลบส่งผลต่อใคร? ข้อมูลที่ archive ถูก anonymize จริงๆ หรือไม่?",
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
    explanationEn:
      "Proper data retention: deletes data after 3 years only for users who withdrew consent, archives only anonymized data (PII nulled out). Complies with PDPA's storage limitation principle.",
    explanationTh:
      "การจัดการข้อมูลตามนโยบายที่ถูกต้อง: ลบข้อมูลหลัง 3 ปีเฉพาะผู้ถอนความยินยอม และเก็บเฉพาะข้อมูล Anonymized ปฏิบัติตาม PDPA มาตรา 26",
    pdpaRef: "PDPA §26 — Storage Limitation",
  },
]

async function seed() {
  for (const s of SCENARIOS) {
    await pool.execute(
      `INSERT INTO scenarios
        (id, type, title_en, title_th, code, answer, context_en, context_th, hint_en, hint_th, explanation_en, explanation_th, pdpa_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        type = VALUES(type), title_en = VALUES(title_en), title_th = VALUES(title_th),
        code = VALUES(code), answer = VALUES(answer),
        context_en = VALUES(context_en), context_th = VALUES(context_th),
        hint_en = VALUES(hint_en), hint_th = VALUES(hint_th),
        explanation_en = VALUES(explanation_en), explanation_th = VALUES(explanation_th),
        pdpa_ref = VALUES(pdpa_ref)`,
      [
        s.id,
        s.type,
        s.titleEn,
        s.titleTh,
        s.code,
        s.answer,
        s.contextEn,
        s.contextTh,
        s.hintEn,
        s.hintTh,
        s.explanationEn,
        s.explanationTh,
        s.pdpaRef,
      ],
    )
  }
  console.log(`Seeded ${SCENARIOS.length} scenarios.`)
  await pool.end()
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
