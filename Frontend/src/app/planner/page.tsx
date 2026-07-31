"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface PlanResult {
  summary: string;
  situationType?: string;
  assumptions?: string[];
  keyNumbers?: Array<{ label: string; value: string }>;
  priorityOrder?: string[];
  actionPlan?: Array<{ step: number; action: string; why: string }>;
  todayActions?: string[];
  sevenDayPlan?: string[];
  thirtyDayPlan?: string[];
  budgetGuide?: string[];
  risks?: string[];
  watchOuts?: string[];
  followUpQuestions?: string[];
  relatedFeatures?: string[];
  disclaimer?: string;
}

const earnerTypes = [
  { value: "unspecified", label: "Choose one (optional)" },
  { value: "daily-wage", label: "Daily wage / informal worker" },
  { value: "freelancer", label: "Freelancer / gig worker" },
  { value: "retiree", label: "Retired / pensioner" },
  { value: "student", label: "Student / first-time earner" },
  { value: "joint-family", label: "Joint family" },
] as const;

const disclaimer =
  "ANCHOR provides general information and navigation, not professional financial, legal, medical, or emergency advice. Rules and programmes change; verify through official sources.";

export default function PlannerPage() {
  const [input, setInput] = useState("");
  const [earnerType, setEarnerType] = useState("unspecified");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          situation: input,
          earnerType,
          language: "en",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? data.error ?? "Failed to generate plan");
      }

      // Handle both AI responses (direct) and demo responses (wrapped in data)
      setResult(data.data ?? data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleStartOver() {
    setResult(null);
    setError(null);
    setInput("");
    setEarnerType("unspecified");
  }

  // Merge action plan sources (AI uses actionPlan, demo uses todayActions/sevenDayPlan)
  const actionSteps = result?.actionPlan ?? [];
  const todayActions = result?.todayActions ?? [];
  const sevenDayPlan = result?.sevenDayPlan ?? [];
  const thirtyDayPlan = result?.thirtyDayPlan ?? [];
  const watchOuts = result?.watchOuts ?? [];
  const risks = result?.risks ?? [];
  const relatedFeatures = result?.relatedFeatures ?? [];
  const keyNumbers = result?.keyNumbers ?? [];
  const followUpQuestions = result?.followUpQuestions ?? [];

  return (
    <main className="feature-wrap">
      <div className="saas-grid-bg"></div>
      <div className="saas-glow" style={{ opacity: 0.3 }}></div>
      <Link className="back" href="/">
        ← All guidance
      </Link>

      <p className="eyebrow">SMART LIFE PLANNER</p>
      <h1>Turn a messy situation into a clear plan.</h1>
      <p className="lede">
        Tell us what&rsquo;s going on with your money. No judgment, no jargon — just a realistic next-step plan.
      </p>

      <aside className="warning">
        <strong>Before you continue:</strong> Do not include account numbers, Aadhaar/PAN, passwords, or exact
        addresses. We do not need them and cannot protect them.
      </aside>

      {!result ? (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Earner type selector */}
            <label>
              What kind of earner are you?
              <select value={earnerType} onChange={(e) => setEarnerType(e.target.value)}>
                {earnerTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Main input */}
            <label>
              Describe your current financial situation
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                minLength={3}
                maxLength={3000}
                placeholder={"Example: Lost my job 3 weeks ago, have ₹45,000 saved, rent is ₹8,000/month, need to support parents too"}
                aria-describedby="input-hint"
              />
              <span id="input-hint" style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                {input.length}/3000 characters · Describe your income, expenses, worries, and goals
              </span>
            </label>
          </div>

          <button disabled={loading || input.trim().length < 3} type="submit">
            {loading ? "Reading your situation…" : "Get my plan →"}
          </button>

          {error && (
            <p role="alert" className="error" style={{ marginTop: "1rem" }}>
              ⚠️ {error}
            </p>
          )}
        </form>
      ) : (
        <section className="result" aria-live="polite">
          {/* Mode badge */}
          <p className="eyebrow">
            {result.situationType
              ? `${result.situationType.toUpperCase()} SITUATION`
              : "YOUR GUIDANCE"}
          </p>

          {/* Summary */}
          <h2>{result.summary ?? "Your plan is ready."}</h2>

          {/* Key Numbers */}
          {keyNumbers.length > 0 && (
            <div className="key-numbers">
              <h3>Key numbers</h3>
              <div className="numbers-grid">
                {keyNumbers.map((num, i) => (
                  <div key={i} className="number-card">
                    <span className="number-label">{num.label}</span>
                    <span className="number-value">{num.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Action Plan (numbered steps with explanations) */}
          {actionSteps.length > 0 && (
            <section>
              <h3>Your action plan</h3>
              <ol className="action-steps">
                {actionSteps.map((step) => (
                  <li key={step.step} className="action-step">
                    <span className="step-number">{step.step}</span>
                    <div>
                      <strong>{step.action}</strong>
                      <p style={{ color: "var(--muted)", margin: "0.25rem 0 0" }}>{step.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Demo: Today Actions */}
          {todayActions.length > 0 && actionSteps.length === 0 && (
            <section>
              <h3>Today actions</h3>
              <ol>
                {todayActions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Demo: 7-day plan */}
          {sevenDayPlan.length > 0 && actionSteps.length === 0 && (
            <section>
              <h3>This week</h3>
              <ol>
                {sevenDayPlan.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Demo: 30-day plan */}
          {thirtyDayPlan.length > 0 && actionSteps.length === 0 && (
            <section>
              <h3>This month</h3>
              <ol>
                {thirtyDayPlan.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </section>
          )}

          {/* Watch Outs */}
          {(watchOuts.length > 0 || risks.length > 0) && (
            <section className="watch-outs">
              <h3>⚠️ Watch out for</h3>
              <ul>
                {watchOuts.map((w, i) => (
                  <li key={`w-${i}`}>{w}</li>
                ))}
                {risks.map((r, i) => (
                  <li key={`r-${i}`}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Follow-up Questions */}
          {followUpQuestions.length > 0 && (
            <section>
              <h3>Questions to think about</h3>
              <ul>
                {followUpQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Features */}
          {relatedFeatures.length > 0 && (
            <section>
              <h3>Other ANCHOR features that can help</h3>
              <ul>
                {relatedFeatures.map((f, i) => (
                  <li key={i}>→ {typeof f === "string" ? f : String(f)}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Disclaimer */}
          <p className="disclaimer">{result.disclaimer ?? disclaimer}</p>

          {/* Actions */}
          <div className="result-actions">
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText((document.querySelector(".result") as HTMLElement)?.innerText ?? "")}>
                Copy guidance
            </button>
            <button onClick={() => window.print()}>Print</button>
            <button onClick={handleStartOver}>Start over</button>
          </div>
        </section>
      )}

      <p className="footer-note">{disclaimer}</p>
    </main>
  );
}
