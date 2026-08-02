// Vercel deployment trigger
import Link from "next/link";
const cards = [
  ["planner", "Smart Life Planner", "Turn a messy financial situation into a short, realistic plan."],
  ["lifeline", "Lifeline", "Crisis plan + every scheme you qualify for — instant, personalised, free."],
  ["fraud", "Fraud Shield", "Check a financial offer before you act."],
  ["borrowing", "Borrowing Safety Checker", "Check if a loan is safe, affordable, and free of hidden traps before you sign."]
] as const;

export default function Home() { 
  return (
    <main className="home" style={{ maxWidth: "100%", padding: 0 }}>
      {/* Background Elements */}
      <div className="saas-grid-bg"></div>
      <div className="saas-glow"></div>

      {/* Hero Section */}
      <section className="hero" style={{ padding: "8rem 1.5rem 5rem" }}>
        <div className="hero-content">
          <p className="eyebrow">
            <span style={{ color: "var(--green)" }}>●</span> FREE · INSTANT · CAUTIOUS
          </p>
          <h1>Find the next <br/><span className="gradient-text">safe step.</span></h1>
          <p className="lede">
            Clear guidance for everyday money, rights, fraud, and crisis questions—without bank logins or shame.
          </p>
          <div className="hero-cta-wrapper" style={{ display: "flex", gap: "1rem" }}>
            {/* CTA removed as per user request */}
          </div>
          
          <div className="trusted-by">
            <p>TRUSTED BY EVERYDAY EARNERS AT</p>
            <div className="logos">
              {/* Dummy SVGs simulating Logos like Vercel, Cursor, Coinbase in the mockup */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontWeight: "bold" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 22h20L12 2z"/></svg>
                Vercel
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontWeight: "bold" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z"/></svg>
                Cursor
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontWeight: "bold" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
                coinbase
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          {/* 3D Isometric Animation representing "Investigated before it's a problem" */}
          <div className="isometric-container">
            <div className="isometric-grid" style={{ width: "300px", height: "300px", position: "relative" }}>
              <div className="isometric-plane" style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", zIndex: 1 }}></div>
              <div className="isometric-plane" style={{ position: "absolute", bottom: "50px", width: "80%", height: "80%", left: "10%", background: "rgba(59, 130, 246, 0.2)", zIndex: 2, transform: "translateZ(40px)" }}></div>
              <div className="isometric-plane" style={{ position: "absolute", bottom: "100px", width: "60%", height: "60%", left: "20%", background: "rgba(59, 130, 246, 0.4)", zIndex: 3, transform: "translateZ(80px)" }}></div>
              <div style={{ position: "absolute", top: "-20px", right: "-40px", color: "#3b82f6", fontSize: "0.75rem", fontFamily: "monospace", zIndex: 4, transform: "translateZ(80px) rotateZ(45deg) rotateX(-60deg)" }}>ALERT TRENDS</div>
              <div style={{ position: "absolute", bottom: "-20px", left: "-20px", color: "#3b82f6", fontSize: "0.75rem", fontFamily: "monospace", zIndex: 4, transform: "translateZ(0px) rotateZ(45deg) rotateX(-60deg)" }}>HTTP/200</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards mimicking the 4 column layout */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 1.5rem" }} aria-labelledby="tools">
        <div className="section-header">
          <h2 id="tools">Built for the alerts<br/><span>that actually matter</span></h2>
          <p style={{ color: "var(--muted)", marginTop: "1rem", fontSize: "1.1rem" }}>ANCHOR clears the noise so you can focus on real guidance.</p>
        </div>
        
        <div className="cards">
          {cards.map(([slug, title, description], i) => (
            <Link href={`/${slug}`} prefetch={slug === "lifeline"} className="card" key={slug}>
              <div className="card-icon">
                {/* Micro 3D icons for each card */}
                <div className="isometric-container" style={{ transform: "scale(0.5)" }}>
                  <div className="isometric-grid" style={{ width: "100px", height: "100px", animationDelay: `${i * 0.5}s` }}>
                    <div className="isometric-plane" style={{ position: "absolute", width: "100%", height: "100%", bottom: `${i*10}px` }}></div>
                    <div className="isometric-plane" style={{ position: "absolute", width: "100%", height: "100%", bottom: `${(i*10)+20}px`, opacity: 0.5 }}></div>
                  </div>
                </div>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Mock Dashboard preview mimicking the provided image */}
      <section id="how-it-works" className="dashboard-preview" style={{ maxWidth: "1180px", margin: "10rem auto 5rem", padding: "0 1.5rem", animation: "fadeUp 1s ease-out" }}>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "white", marginBottom: "0.25rem" }}>
          Your AI already knows
        </h2>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "#60A5FA", marginBottom: "1.5rem" }}>
          what's right for you
        </h2>
        <p style={{ color: "#9CA3AF", marginTop: "1rem", marginBottom: "4rem", fontSize: "1rem", maxWidth: "600px", lineHeight: 1.6 }}>
          ANCHOR continuously analyzes thousands of data points to find benefits and detect scams before they happen.
        </p>

        <div className="showcase-grid" style={{ background: "#09090B", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "3rem", position: "relative", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", color: "#F9FAFB", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>How ANCHOR Works</h3>
              <p style={{ color: "#9CA3AF", lineHeight: 1.6, fontSize: "1rem", maxWidth: "800px" }}>
                ANCHOR is an AI-powered financial safety net designed specifically for everyday earners in India. It acts as an objective, highly intelligent advisor that helps you navigate financial distress, predatory loans, and sophisticated scams without jargon or judgment.
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginTop: "1rem" }}>
              <div>
                <h4 style={{ color: "#60A5FA", fontSize: "1.1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(96, 165, 250, 0.1)", fontSize: "0.8rem", fontWeight: "bold" }}>1</span>
                  Context-Aware Analysis
                </h4>
                <p style={{ color: "#9CA3AF", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  ANCHOR takes in your messy, real-world financial situation—whether you're evaluating a sketchy loan offer, dealing with aggressive recovery agents, or trying to find government schemes. The AI analyzes the raw data to understand the nuances of your specific predicament.
                </p>
              </div>
              
              <div>
                <h4 style={{ color: "#34D399", fontSize: "1.1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(52, 211, 153, 0.1)", fontSize: "0.8rem", fontWeight: "bold" }}>2</span>
                  Pure Deterministic Logic
                </h4>
                <p style={{ color: "#9CA3AF", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  Before any AI generates advice, strict deterministic math and rule-based checks are applied. For example, our Borrowing Safety Checker instantly calculates the exact True Cost (APR) of a loan, catching hidden processing fees and predatory terms that AI alone might hallucinate.
                </p>
              </div>
              
              <div>
                <h4 style={{ color: "#A78BFA", fontSize: "1.1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(167, 139, 250, 0.1)", fontSize: "0.8rem", fontWeight: "bold" }}>3</span>
                  Actionable Intelligence
                </h4>
                <p style={{ color: "#9CA3AF", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  Instead of giving you a generic block of text, ANCHOR breaks down its findings into immediate, actionable steps. It provides negotiation scripts to lower interest rates, highlights red flags in contracts, and offers safer alternative funding methods tailored to your exact needs.
                </p>
              </div>

              <div>
                <h4 style={{ color: "#FBBF24", fontSize: "1.1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(251, 191, 36, 0.1)", fontSize: "0.8rem", fontWeight: "bold" }}>4</span>
                  Empathetic Guidance
                </h4>
                <p style={{ color: "#9CA3AF", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  Financial distress is overwhelming. ANCHOR acts as a calm, objective advisor that speaks plainly. It strips away complex financial jargon and presents clear, cautious guidance designed to help you find your next safe step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="protect">
        <p className="eyebrow">HOW ANCHOR PROTECTS YOU</p>
        <h2>Verified where facts matter.<br/>Honest where they do not.</h2>
        <p style={{ color: "var(--muted)", maxWidth: "600px", margin: "0 auto 2rem" }}>
          ANCHOR uses a demo catalogue for this prototype. It does not decide eligibility, legal outcomes, medical needs, or whether something is definitely a scam.
        </p>
        <Link href="/safety">Read our safety boundaries →</Link>
      </section>
    </main>
  );
}
