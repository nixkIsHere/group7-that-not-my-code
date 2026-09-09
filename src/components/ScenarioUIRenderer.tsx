import { useState, type CSSProperties } from "react"
import { CheckIcon } from "@heroicons/react/24/outline"

/* shared light-theme styles */
const ui = {
  body: {
    fontFamily: "system-ui, sans-serif",
    fontSize: 14,
    color: "#1a1a1a",
  } as CSSProperties,
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    maxWidth: 480,
    margin: "0 auto",
  } as CSSProperties,
  h2: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 0,
  } as CSSProperties,
  h3: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6,
    marginTop: 0,
  } as CSSProperties,
  p: {
    fontSize: 13,
    color: "#555",
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: 12,
  } as CSSProperties,
  label: {
    fontSize: 13,
    color: "#333",
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    cursor: "pointer",
    lineHeight: 1.5,
  } as CSSProperties,
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  } as CSSProperties,
  select: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    background: "#fff",
    marginBottom: 12,
  } as CSSProperties,
  btnPrimary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  } as CSSProperties,
  btnDanger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,
  hint: { fontSize: 12, color: "#888", marginTop: 8 } as CSSProperties,
  divider: {
    borderTop: "1px solid #e5e7eb",
    margin: "16px 0",
  } as CSSProperties,
}

export function ScenarioUIRenderer({ id }: { id: number }) {
  switch (id) {
    /* ── Scenario 2: Cookie Consent DARK PATTERN ── */
    case 2:
      return (
        <div style={ui.body}>
          <div style={{ ...ui.card, position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#2563eb",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: 16 }}>🍪</span>
              </div>
              <h3 style={{ ...ui.h3, margin: 0 }}>We value your privacy</h3>
            </div>
            <p style={ui.p}>
              We and our partners use cookies to improve your browsing
              experience, show you personalized content, and analyze our
              traffic.
            </p>
            {/* BIG accept button */}
            <button
              style={{
                ...ui.btnPrimary,
                fontSize: 15,
                padding: "14px 20px",
                marginBottom: 0,
              }}
            >
              Accept All Cookies
            </button>
            {/* tiny hidden reject — dark pattern */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#bbb",
                  fontSize: 9,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Reject (optional)
              </button>
            </div>
          </div>
        </div>
      )

    /* ── Scenario 4: Account Deletion UI — COMPLY ── */
    case 4:
      return (
        <div style={ui.body}>
          <div style={ui.card}>
            <h2 style={{ ...ui.h2, color: "#111" }}>Account Settings</h2>
            <div style={ui.divider} />
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <h3 style={{ ...ui.h3, color: "#991b1b" }}>Danger Zone</h3>
              <p style={{ ...ui.p, color: "#7f1d1d", marginBottom: 12 }}>
                You may request deletion of your account and all associated
                personal data. This action cannot be undone.
              </p>
              <button style={{ ...ui.btnDanger, marginBottom: 8 }}>
                Delete My Account &amp; Data
              </button>
              <p style={{ ...ui.hint, color: "#b91c1c" }}>
                Data will be permanently removed within 30 days per our privacy
                policy.
              </p>
            </div>
          </div>
        </div>
      )

    /* ── Scenario 6: DSAR Form — COMPLY ── */
    case 6: {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [submitted, setSubmitted] = useState(false)
      return (
        <div style={ui.body}>
          <div style={ui.card}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#dcfce7",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <CheckIcon
                    style={{ width: 28, height: 28, color: "#16a34a" }}
                  />
                </div>
                <h3 style={{ ...ui.h3, color: "#15803d" }}>Request Received</h3>
                <p style={ui.p}>
                  We will respond within 30 days as required by PDPA.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    ...ui.btnPrimary,
                    width: "auto",
                    padding: "8px 20px",
                    fontSize: 13,
                  }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <>
                <h2 style={ui.h2}>Data Subject Access Request</h2>
                <p style={{ ...ui.p, marginBottom: 16 }}>
                  Exercise your PDPA rights. We will process your request within
                  30 days.
                </p>
                <label
                  style={{
                    ...ui.label,
                    display: "block",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  Request Type
                </label>
                <select style={ui.select} defaultValue="">
                  <option value="" disabled>
                    Select a request type…
                  </option>
                  <option>Access — View my personal data</option>
                  <option>Rectify — Correct my data</option>
                  <option>Erase — Delete my data</option>
                  <option>Portability — Export my data</option>
                </select>
                <label
                  style={{
                    ...ui.label,
                    display: "block",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  Email Address
                </label>
                <input
                  style={{ ...ui.input, marginBottom: 12 }}
                  type="email"
                  placeholder="you@example.com"
                  readOnly
                />
                <label
                  style={{
                    ...ui.label,
                    display: "block",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  Additional Details
                </label>
                <textarea
                  style={
                    {
                      ...ui.input,
                      height: 72,
                      resize: "none",
                      marginBottom: 16,
                    } as CSSProperties
                  }
                  placeholder="Describe your request…"
                  readOnly
                />
                <button
                  onClick={() => setSubmitted(true)}
                  style={ui.btnPrimary}
                >
                  Submit Request
                </button>
              </>
            )}
          </div>
        </div>
      )
    }

    /* ── Scenario 8: Marketing Opt-in — COMPLY ── */
    case 8: {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [checked, setChecked] = useState(false)
      return (
        <div style={ui.body}>
          <div style={ui.card}>
            <h2 style={ui.h2}>Order Summary</h2>
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <span>TechShop Pro Subscription</span>
                <span style={{ fontWeight: 600 }}>฿999</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#555",
                }}
              >
                <span>Tax (7%)</span>
                <span>฿69.93</span>
              </div>
              <div style={ui.divider} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span>฿1,068.93</span>
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
                I agree to receive promotional emails and personalized offers
                from TechShop.
              </span>
            </label>
            <p style={{ ...ui.hint, marginBottom: 16 }}>
              You can unsubscribe at any time via account settings or email
              links.
            </p>
            <button style={ui.btnPrimary}>Complete Purchase</button>
          </div>
        </div>
      )
    }

    default:
      return null
  }
}
