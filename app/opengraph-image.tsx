import { ImageResponse } from "next/og";

export const alt = "Money Finder — your personalised Top 3 income opportunities, why they fit, and practical first steps.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ShareImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#102c22", padding: "54px 60px", color: "#fffaf0", fontFamily: "sans-serif" }}>
      <div style={{ width: "63%", display: "flex", flexDirection: "column", paddingRight: 42 }}>
        <div style={{ display: "flex", color: "#8ae1ac", fontSize: 23, letterSpacing: 5 }}>MONEY FINDER</div>
        <div style={{ display: "flex", fontSize: 61, fontWeight: 700, marginTop: 34, lineHeight: 1.08 }}>Find income ideas that fit your life.</div>
        <div style={{ display: "flex", fontSize: 25, lineHeight: 1.4, marginTop: 25, color: "#e0e9df" }}>Your skills. Your time. Your budget.</div>
        <div style={{ display: "flex", fontSize: 24, marginTop: "auto", color: "#8ae1ac" }}>www.moneyfinderapp.com</div>
        <div style={{ display: "flex", fontSize: 17, marginTop: 18, color: "#c6d6ca" }}>Ranked fits, not a promise of income.</div>
      </div>
      <div style={{ width: "37%", display: "flex", flexDirection: "column", background: "#f6f1e5", color: "#182c22", borderRadius: 28, padding: 30 }}>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: 2, color: "#276045" }}>YOUR MONEY MAP</div>
        <div style={{ display: "flex", fontSize: 45, lineHeight: 1.1, fontWeight: 700, marginTop: 18 }}>A clearer starting point.</div>
        {["Your personalised Top 3", "Why each one fits", "Practical first actions"].map((text, i) => (
          <div key={text} style={{ display: "flex", alignItems: "center", padding: "20px 0", borderTop: "1px solid #d5d9cc", marginTop: i === 0 ? 28 : 0, fontSize: 23 }}>
            <span style={{ color: "#b46b2e", marginRight: 15 }}>0{i + 1}</span>{text}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
