"use client";

import { useState } from "react";
import Link from "next/link";
import { checkBorrowingSafety, BorrowingSafetyInput, BorrowingSafetyResult, LoanPurpose } from "@/features/borrowingSafetyChecker/logic";

const disclaimer = "ANCHOR provides general information and navigation, not professional financial, legal, medical, or emergency advice. Verify important details through official sources.";

export default function BorrowingSafetyPage() {
  const [input, setInput] = useState<Partial<BorrowingSafetyInput>>({
    processingFeeIsPercent: false,
    purpose: "other",
    lenderName: "",
    isRegulatedLender: false,
    asksContactsAccess: false,
    asksGalleryAccess: false,
  });

  const [result, setResult] = useState<BorrowingSafetyResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{ humanSummary: string; detailedAnalysis: string; negotiationTactics: string[]; alternatives: string[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAiError(null);
    setAiAnalysis(null);
    
    // 1. Run Deterministic Math Instantly
    const safetyResult = checkBorrowingSafety(input as BorrowingSafetyInput);
    setResult(safetyResult);
    
    // 2. Fetch AI Insights in the background
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/v1/borrowing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanAmount: input.loanAmount,
          processingFeeAmount: safetyResult.processingFeeAmount,
          totalCost: safetyResult.totalCost,
          emiToIncomeRatio: safetyResult.emiToIncomeRatio,
          debtPressureLevel: safetyResult.debtPressureLevel,
          purpose: input.purpose,
          warnings: safetyResult.warnings,
        }),
      });
      
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Failed to load AI insights.");
      
      setAiAnalysis(payload.data);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const startOver = () => {
    setResult(null);
    setAiAnalysis(null);
    setAiError(null);
    setInput({
      processingFeeIsPercent: false,
      purpose: "other",
      lenderName: "",
      isRegulatedLender: false,
      asksContactsAccess: false,
      asksGalleryAccess: false,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setInput((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setInput((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <main className="feature-wrap planner-page">
      <div className="saas-grid-bg" />
      <div className="saas-glow" style={{ opacity: 0.22 }} />
      <Link className="back" href="/">← All guidance</Link>

      {!result ? (
        <>
          <div className="planner-hero">
            <p className="eyebrow">Borrowing Safety Checker</p>
            <h1>Check if a loan is actually safe.</h1>
            <p className="lede">
              Find out the true cost, hidden traps, and affordability of any loan offer before you sign or download an app.
            </p>
          </div>

          <aside className="warning">
            <strong>Keep it safe:</strong> We do not ask for your PAN, bank login, or phone number.
          </aside>

          <form className="planner-form" onSubmit={handleSubmit}>
            <h3>Your Financial Situation</h3>
            <div className="form-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <label>
                Monthly Income (₹)
                <input type="number" name="monthlyIncome" required min="0" value={input.monthlyIncome ?? ""} onChange={handleChange} placeholder="e.g. 25000" />
              </label>
              <label>
                Existing Monthly EMIs (₹)
                <input type="number" name="existingEMI" required min="0" value={input.existingEMI ?? ""} onChange={handleChange} placeholder="e.g. 3000" />
              </label>
              <label>
                Number of Active Loans (Optional)
                <input type="number" name="existingLoanCount" min="0" value={input.existingLoanCount ?? ""} onChange={handleChange} placeholder="e.g. 1" />
              </label>
              <label>
                Loan Purpose
                <select name="purpose" value={input.purpose} onChange={handleChange}>
                  <option value="medical">Medical Emergency</option>
                  <option value="education">Education</option>
                  <option value="business">Business / Work</option>
                  <option value="emergency">Other Emergency</option>
                  <option value="consumption">Personal / Consumption</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Loan Details</h3>
            <div className="form-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <label>
                Loan Amount (₹)
                <input type="number" name="loanAmount" required min="0" value={input.loanAmount ?? ""} onChange={handleChange} placeholder="e.g. 50000" />
              </label>
              <label>
                Annual Interest Rate (%)
                <input type="number" name="annualInterestRate" required min="0" step="0.1" value={input.annualInterestRate ?? ""} onChange={handleChange} placeholder="e.g. 24" />
              </label>
              <label>
                Tenure (Months)
                <input type="number" name="tenureMonths" required min="0" value={input.tenureMonths ?? ""} onChange={handleChange} placeholder="e.g. 12" />
              </label>
              <label>
                Processing Fee
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem" }}>
                  <input type="number" name="processingFee" required min="0" step="0.1" value={input.processingFee ?? ""} onChange={handleChange} placeholder="e.g. 2" />
                  <select name="processingFeeIsPercent" value={input.processingFeeIsPercent ? "true" : "false"} onChange={(e) => setInput(prev => ({ ...prev, processingFeeIsPercent: e.target.value === "true" }))} style={{ width: "auto", paddingRight: "2rem" }}>
                    <option value="true">%</option>
                    <option value="false">₹</option>
                  </select>
                </div>
              </label>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Lender Checks</h3>
            <div className="form-grid" style={{ display: 'grid', gap: '1.25rem' }}>
              <label>
                Lender / App Name
                <input type="text" name="lenderName" required value={input.lenderName || ""} onChange={handleChange} placeholder="Name of the app or bank" />
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontWeight: "normal", cursor: "pointer" }}>
                <input type="checkbox" name="isRegulatedLender" checked={input.isRegulatedLender} onChange={handleChange} style={{ width: "auto", margin: 0, marginTop: "0.25rem" }} />
                <span>I have verified this is an RBI-registered Bank/NBFC</span>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontWeight: "normal", cursor: "pointer" }}>
                <input type="checkbox" name="asksContactsAccess" checked={input.asksContactsAccess} onChange={handleChange} style={{ width: "auto", margin: 0, marginTop: "0.25rem" }} />
                <span>App asks for permission to read Contacts</span>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontWeight: "normal", cursor: "pointer" }}>
                <input type="checkbox" name="asksGalleryAccess" checked={input.asksGalleryAccess} onChange={handleChange} style={{ width: "auto", margin: 0, marginTop: "0.25rem" }} />
                <span>App asks for permission to read Photos/Gallery</span>
              </label>
            </div>

            <button type="submit" disabled={input.monthlyIncome === undefined || input.loanAmount === undefined || !input.lenderName} style={{ marginTop: '2rem' }}>
              Check Safety →
            </button>
          </form>
        </>
      ) : (
        <section className="planner-results" aria-live="polite">
          <div className="planner-result-heading">
            <p className="eyebrow" style={{ color: result.debtPressureLevel === "Safe" ? "var(--green)" : result.debtPressureLevel === "Caution" ? "orange" : "var(--red)" }}>
              {result.debtPressureLevel.toUpperCase()}
            </p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em", color: "white", marginBottom: "0.5rem" }}>
              {aiAnalysis ? aiAnalysis.humanSummary : "Calculating safety metrics..."}
            </h2>
            {aiAnalysis ? (
              <div style={{ color: "#D1D5DB", fontSize: "0.95rem", lineHeight: 1.6, marginTop: "1rem", padding: "1rem", background: "rgba(96, 165, 250, 0.05)", borderRadius: "8px", borderLeft: "4px solid #60A5FA" }}>
                {aiAnalysis.detailedAnalysis}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
                {result.summary}
              </p>
            )}
          </div>

          <div className="planner-plan-meta">
            <span>Deterministic Math Check</span>
            <span>Based on your input</span>
          </div>

          {/* AI Insights Section */}
          <section className="planner-timeline now" style={{ marginTop: "2rem" }}>
            <div className="planner-timeline-heading">
              <span>01 · AI Advisor</span>
              <div>
                <h2>Negotiation & Alternatives</h2>
                <p>Personalized advice generated securely for your situation.</p>
              </div>
            </div>
            
            {isAnalyzing ? (
              <div style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", textAlign: "center", color: "var(--muted)" }}>
                <span className="spinner" style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#60A5FA", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
                <p>Analyzing loan details and finding negotiation tactics...</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : aiError ? (
              <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", color: "#FCA5A5" }}>
                {aiError}
              </div>
            ) : aiAnalysis ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {aiAnalysis.negotiationTactics.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "8px" }}>
                    <h3 style={{ fontSize: "1.1rem", color: "#60A5FA", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      Negotiation Tactics
                    </h3>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--muted)", margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", listStyleType: "disc" }}>
                      {aiAnalysis.negotiationTactics.map((tactic, i) => (
                        <li key={i} style={{ display: "list-item", padding: 0, border: "none", background: "transparent", gridTemplateColumns: "none" }}>{tactic}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiAnalysis.alternatives.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "8px" }}>
                    <h3 style={{ fontSize: "1.1rem", color: "#10B981", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      Safer Alternatives
                    </h3>
                    <ul style={{ paddingLeft: "1.25rem", color: "var(--muted)", margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", listStyleType: "disc" }}>
                      {aiAnalysis.alternatives.map((alt, i) => (
                        <li key={i} style={{ display: "list-item", padding: 0, border: "none", background: "transparent", gridTemplateColumns: "none" }}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <section className="planner-timeline week" style={{ marginTop: "2rem" }}>
            <div className="planner-timeline-heading">
              <span>02 · True Cost</span>
              <div>
                <h2>By the numbers</h2>
                <p>Understand exactly what you are paying.</p>
              </div>
            </div>
            <ul style={{ display: "grid", gap: "1rem", listStyle: "none", padding: 0 }}>
              <li style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <strong>Monthly EMI</strong>
                <span>₹{result.monthlyEMI.toFixed(0)}</span>
              </li>
              <li style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <strong>Total Interest</strong>
                <span>₹{result.totalInterest.toFixed(0)}</span>
              </li>
              <li style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <strong>Processing Fee</strong>
                <span>₹{result.processingFeeAmount.toFixed(0)} ({result.hiddenFeeImpactPercent.toFixed(1)}%)</span>
              </li>
              <li style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", borderLeft: "3px solid var(--blue)" }}>
                <strong>Real All-In Cost</strong>
                <span>₹{result.totalCost.toFixed(0)}</span>
              </li>
            </ul>
          </section>

          {result.warnings.length > 0 && (
            <section className="planner-support-grid" style={{ marginTop: "2rem" }}>
              <section className="watch-outs" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <h2 style={{ color: "#FCA5A5" }}>⚠️ Red Flags & Traps</h2>
                <ul>
                  {result.warnings.map((warning) => (
                    <li key={warning.code} style={{ color: "white" }}>
                      <strong>{warning.code.replace(/_/g, " ")}:</strong> {warning.message}
                    </li>
                  ))}
                </ul>
              </section>
            </section>
          )}

          <section className="planner-timeline month" style={{ marginTop: "2rem" }}>
            <div className="planner-timeline-heading">
              <span>03 · Action Plan</span>
              <div>
                <h2>Safer Next Steps</h2>
                <p>What you should do before taking this loan.</p>
              </div>
            </div>
            <ol>
              {result.saferNextSteps.map((step, index) => (
                <li key={index}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <div>
                    <strong>{step}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <p className="disclaimer">{disclaimer}</p>
          <div className="result-actions">
            <button onClick={() => window.print()}>Print</button>
            <button onClick={startOver}>Check Another Loan</button>
          </div>
        </section>
      )}
      <p className="footer-note">{disclaimer}</p>
    </main>
  );
}
