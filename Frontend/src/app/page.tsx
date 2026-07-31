import Link from "next/link";

const cards = [
  ["planner", "Smart Life Planner", "Turn a messy financial situation into a short, realistic plan."],
  ["schemes", "Scheme Scanner", "Find programmes you may be able to verify and apply for."],
  ["fraud", "Fraud Shield", "Check a financial offer before you act."],
  ["health", "Financial Health Score", "See an educational snapshot of your financial resilience."]
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
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link className="hero-cta" href="/planner">
              Get Early Access <span>→</span>
            </Link>
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
            <Link href={`/${slug}`} className="card" key={slug}>
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
      <section className="dashboard-preview" style={{ maxWidth: "1180px", margin: "10rem auto 5rem", padding: "0 1.5rem", animation: "fadeUp 1s ease-out" }}>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "white", marginBottom: "0.25rem" }}>
          Your AI already knows
        </h2>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "#60A5FA", marginBottom: "1.5rem" }}>
          what's right for you
        </h2>
        <p style={{ color: "#9CA3AF", marginTop: "1rem", marginBottom: "4rem", fontSize: "1rem", maxWidth: "600px", lineHeight: 1.6 }}>
          ANCHOR continuously analyzes thousands of data points to find benefits and detect scams before they happen.
        </p>

        <div style={{ background: "#09090B", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", position: "relative", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
          
          {/* Left Panel: Bar Chart */}
          <div style={{ background: "#111115", borderRadius: "12px", padding: "2.5rem 2rem", border: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Monthly Benefits Matched</div>
            <div style={{ display: "flex", gap: "3rem", marginBottom: "3rem" }}>
              <div>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>142,029</div>
                <div style={{ color: "#6B7280", fontSize: "0.8rem", marginTop: "0.25rem" }}>Potential benefits identified</div>
              </div>
              <div>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>42,562</div>
                <div style={{ color: "#6B7280", fontSize: "0.8rem", marginTop: "0.25rem" }}>Earners successfully matched</div>
              </div>
            </div>
            
            {/* CSS Bar Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", marginTop: "auto" }}>
              {[30, 15, 45, 20, 70, 100, 30, 20, 40, 25, 45, 20, 60, 20].map((h, i) => (
                <div key={i} style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: "25%", background: "rgba(255,255,255,0.05)", position: "absolute", bottom: 0, borderRadius: "3px" }}></div>
                  <div style={{ width: "100%", height: `${h}%`, background: "#3B82F6", borderRadius: "3px", position: "relative", zIndex: 1 }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Line Chart */}
          <div style={{ background: "#111115", borderRadius: "12px", padding: "2.5rem 2rem", border: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3rem" }}>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Fraud Prevented</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>₹2.8 Cr</div>
                <div style={{ color: "#10B981", fontSize: "0.85rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><span>↑</span> 15% this month</div>
              </div>
              <div>
                <div style={{ color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Scams Detected</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>12,450</div>
                <div style={{ color: "#10B981", fontSize: "0.85rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><span>↑</span> 12% this month</div>
              </div>
            </div>
            
            {/* CSS Line Chart / Area Chart */}
            <div style={{ height: "120px", marginTop: "auto", position: "relative", background: "linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 100%)", borderBottom: "3px solid #3B82F6" }}>
               {/* Glowing dots */}
               <div style={{ position: "absolute", left: "25%", bottom: "30px", width: "10px", height: "10px", background: "white", borderRadius: "50%", boxShadow: "0 0 15px 4px rgba(255,255,255,0.6)" }}></div>
               <div style={{ position: "absolute", left: "65%", bottom: "60px", width: "10px", height: "10px", background: "white", borderRadius: "50%", boxShadow: "0 0 15px 4px rgba(255,255,255,0.6)" }}></div>
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
