import { useState } from "react";

const tracks = {
  ingame: {
    label: "In-game item / currency",
    icon: "💎",
    steps: [
      {
        id: "items",
        question: "How many offers will you promote?",
        options: [
          { value: "single", label: "Single offer", icon: "🎯", desc: "One specific game or item" },
          { value: "multi", label: "Multiple offers", icon: "🗂️", desc: "A catalog or store with many games" },
        ],
      },
      {
        id: "placement",
        question: "Who manages the store page?",
        options: [
          { value: "partner", label: "We manage it", icon: "🏢", desc: "Partner hosts and manages the page" },
          { value: "xsolla_white", label: "Xsolla — white-label", icon: "🎨", desc: "Xsolla-hosted, styled with your brand" },
          { value: "xsolla_store", label: "Xsolla Store", icon: "⚡", desc: "Standard Xsolla storefront" },
        ],
      },
      {
        id: "identity",
        question: "How is the recipient identified?",
        options: [
          { value: "playerid", label: "Player ID input", icon: "🎮", desc: "User types their in-game ID manually" },
          { value: "gamelogin", label: "Game account login", icon: "🔐", desc: "User logs in via the developer's account" },
          { value: "xsollalogin", label: "Xsolla account", icon: "✦", desc: "Identified via Xsolla wallet / account" },
        ],
      },
    ],
    getFlow: (answers) => {
      const { items, placement, identity } = answers;
      const s = [];
      if (placement === "partner") s.push({ label: items === "single" ? "Partner displays single offer banner" : "Partner displays multi-game hub", type: "start" });
      else if (placement === "xsolla_white") s.push({ label: "Xsolla white-label store (partner branding)", type: "start" });
      else s.push({ label: "Xsolla Store page", type: "start" });
      if (items === "multi") s.push({ label: "User browses catalog → selects game", type: "step" });
      s.push({ label: "User views offer page", type: "step" });
      if (identity === "playerid") s.push({ label: "User enters Player ID", type: "identity" });
      else if (identity === "gamelogin") s.push({ label: "User logs in to game account", type: "identity" });
      else s.push({ label: "User logs in to Xsolla account", type: "identity" });
      s.push({ label: "Redirect to Developer's Webshop", type: "step" });
      s.push({ label: "PayStation — payment processed", type: "payment" });
      s.push({ label: "In-game item delivered to account", type: "delivery" });
      s.push({ label: "x.la success page + retry if payment failed", type: "step" });
      s.push({ label: "Optional: other offers shown on success page", type: "optional" });
      s.push({ label: "Affiliate commission calculated", type: "end" });
      return s;
    },
  },
  key: {
    label: "Game key",
    icon: "🔑",
    steps: [
      {
        id: "items",
        question: "How many offers will you promote?",
        options: [
          { value: "single", label: "Single offer", icon: "🎯", desc: "One specific game key" },
          { value: "multi", label: "Multiple offers", icon: "🗂️", desc: "A catalog of game keys" },
        ],
      },
      {
        id: "placement",
        question: "Who manages the store page?",
        options: [
          { value: "partner", label: "We manage it", icon: "🏢", desc: "Partner hosts and manages the page" },
          { value: "xsolla_white", label: "Xsolla — white-label", icon: "🎨", desc: "Xsolla-hosted, styled with your brand" },
          { value: "xsolla_store", label: "Xsolla Store", icon: "⚡", desc: "Standard Xsolla storefront" },
        ],
      },
    ],
    getFlow: (answers) => {
      const { items, placement } = answers;
      const s = [];
      if (placement === "partner") s.push({ label: items === "single" ? "Partner displays single key offer" : "Partner displays key catalog", type: "start" });
      else if (placement === "xsolla_white") s.push({ label: "Xsolla white-label store (partner branding)", type: "start" });
      else s.push({ label: "Xsolla Store page", type: "start" });
      if (items === "multi") s.push({ label: "User browses catalog → selects game", type: "step" });
      s.push({ label: "Tracking link with partner ID → x.la page", type: "step" });
      s.push({ label: "User enters email address", type: "identity" });
      s.push({ label: "PayStation — payment processed", type: "payment" });
      s.push({ label: "Game key + redemption instructions sent to email", type: "delivery" });
      s.push({ label: "x.la success page + retry if payment failed", type: "step" });
      s.push({ label: "Optional: other offers shown on success page", type: "optional" });
      s.push({ label: "Affiliate commission calculated", type: "end" });
      return s;
    },
  },
};

const typeStyles = {
  start:    { bg: "#1a1a2e", color: "#80EAFF",   border: "#80EAFF" },
  step:     { bg: "#13131f", color: "#ccc",       border: "#2a2a3e" },
  identity: { bg: "#1e1330", color: "#9580FF",   border: "#9580FF" },
  payment:  { bg: "#9580FF", color: "#fff",       border: "#9580FF" },
  delivery: { bg: "#0d1f15", color: "#80EAB0",   border: "#80EAB055" },
  end:      { bg: "#80EAFF12", color: "#80EAFF", border: "#80EAFF44" },
  optional: { bg: "#0d1a1a", color: "#80EAFF66", border: "#80EAFF22" },
};

const SLIDE_TITLE = "title";
const SLIDE_CONFIG = "config";
const SLIDE_RESULT = "result";

export default function App() {
  const [slide, setSlide] = useState(SLIDE_TITLE);
  const [track, setTrack] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(null);

  const t = track ? tracks[track] : null;
  const allAnswered = t && t.steps.every(s => answers[s.id]);
  const flow = allAnswered ? t.getFlow(answers) : null;

  const select = (stepId, value) => {
    const a = { ...answers, [stepId]: value };
    setAnswers(a);
    if (current < t.steps.length - 1) setCurrent(current + 1);
    else setTimeout(() => setSlide(SLIDE_RESULT), 300);
  };

  const reset = () => { setTrack(null); setAnswers({}); setCurrent(0); setSlide(SLIDE_CONFIG); };
  const goBack = () => {
    if (current === 0) { setTrack(null); setAnswers({}); return; }
    const prev = t.steps[current - 1];
    const a = { ...answers }; delete a[prev.id];
    setAnswers(a); setCurrent(current - 1);
  };

  const bg = "#0d0d1a";
  const font = "Inter, sans-serif";

  // SLIDE: TITLE
  if (slide === SLIDE_TITLE) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 11, letterSpacing: 4, color: "#80EAFF", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>Xsolla D2C Affiliates</div>
      <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.15, maxWidth: 600 }}>
        Integration<br /><span style={{ color: "#80EAFF" }}>Flow Builder</span>
      </h1>
      <p style={{ color: "#555", fontSize: 15, marginTop: 20, maxWidth: 420, lineHeight: 1.6 }}>
        Select your product type and answer a few questions — get your exact integration flow instantly.
      </p>
      <button onClick={() => setSlide(SLIDE_CONFIG)}
        style={{ marginTop: 40, padding: "14px 36px", borderRadius: 12, background: "#80EAFF", color: "#0d0d1a", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
        Get started →
      </button>
      <div style={{ position: "absolute", bottom: 32, display: "flex", gap: 8 }}>
        {[SLIDE_TITLE, SLIDE_CONFIG, SLIDE_RESULT].map((s, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: slide === s ? "#80EAFF" : "#2a2a3e" }} />
        ))}
      </div>
    </div>
  );

  // SLIDE: CONFIGURATOR
  if (slide === SLIDE_CONFIG) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#80EAFF", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Xsolla D2C Affiliates</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Configure your flow</h2>
        </div>

        {/* Progress */}
        {track && (
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {t.steps.map((s, i) => (
              <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, background: answers[s.id] ? "#80EAFF" : i === current ? "#333" : "#1e1e2e", transition: "background 0.3s" }} />
            ))}
          </div>
        )}

        {/* Pills */}
        {track && Object.keys(answers).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <span style={{ background: "#80EAFF10", color: "#80EAFF", fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid #80EAFF22" }}>
              {t.icon} {t.label}
            </span>
            {t.steps.filter(s => answers[s.id]).map(s => {
              const opt = s.options.find(o => o.value === answers[s.id]);
              return <span key={s.id} style={{ background: "#80EAFF10", color: "#80EAFF", fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid #80EAFF22" }}>{opt.icon} {opt.label}</span>;
            })}
          </div>
        )}

        {/* Step 0: product type */}
        {!track && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
              <span style={{ color: "#80EAFF", marginRight: 8 }}>1.</span>What are you selling?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(tracks).map(([key, tr]) => (
                <button key={key} onClick={() => setTrack(key)}
                  onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)}
                  style={{ textAlign: "left", padding: "16px 20px", borderRadius: 12, border: `1.5px solid ${hovered === key ? "#80EAFF" : "#2a2a3e"}`, background: hovered === key ? "#80EAFF0d" : "#13131f", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 26 }}>{tr.icon}</span>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>{tr.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {track && !allAnswered && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
              <span style={{ color: "#80EAFF", marginRight: 8 }}>{current + 2}.</span>{t.steps[current].question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {t.steps[current].options.map(opt => (
                <button key={opt.value} onClick={() => select(t.steps[current].id, opt.value)}
                  onMouseEnter={() => setHovered(opt.value)} onMouseLeave={() => setHovered(null)}
                  style={{ textAlign: "left", padding: "16px 20px", borderRadius: 12, border: `1.5px solid ${hovered === opt.value ? "#80EAFF" : "#2a2a3e"}`, background: hovered === opt.value ? "#80EAFF0d" : "#13131f", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 22 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={goBack} style={{ marginTop: 16, background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer" }}>← Back</button>
          </div>
        )}
      </div>

      {/* Dot nav */}
      <div style={{ position: "absolute", bottom: 32, display: "flex", gap: 8 }}>
        {[SLIDE_TITLE, SLIDE_CONFIG, SLIDE_RESULT].map((s, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: slide === s ? "#80EAFF" : "#2a2a3e" }} />
        ))}
      </div>
    </div>
  );

  // SLIDE: RESULT
  if (slide === SLIDE_RESULT) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#80EAFF", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Your integration flow</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
            {t?.icon} {t?.label}
          </h2>
        </div>

        {flow && (
          <div style={{ position: "relative", paddingLeft: 16 }}>
            <div style={{ position: "absolute", left: 19, top: 24, bottom: 24, width: 2, background: "#1e1e2e" }} />
            {flow.map((step, i) => {
              const ts = typeStyles[step.type] || typeStyles.step;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 14 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: ts.border, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#0d0d1a", fontWeight: 700, zIndex: 1, boxShadow: "0 0 0 3px #0d0d1a" }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: ts.bg, border: `1px solid ${ts.border}`, fontSize: 13, color: ts.color, fontWeight: step.type === "payment" || step.type === "end" ? 600 : 400 }}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={reset} style={{ marginTop: 24, padding: "12px 24px", borderRadius: 10, background: "#80EAFF", color: "#0d0d1a", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 700, width: "100%" }}>
          ↩ Configure another flow
        </button>
      </div>

      <div style={{ position: "absolute", bottom: 32, display: "flex", gap: 8 }}>
        {[SLIDE_TITLE, SLIDE_CONFIG, SLIDE_RESULT].map((s, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: slide === s ? "#80EAFF" : "#2a2a3e" }} />
        ))}
      </div>
    </div>
  );
}
