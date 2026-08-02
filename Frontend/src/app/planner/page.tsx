"use client";

import { useState } from "react";
import Link from "next/link";

type PlanAction = { title: string; detail: string };
type PlanResult = { summary: string; priority: string; todayActions: PlanAction[]; sevenDayPlan: PlanAction[]; thirtyDayPlan: PlanAction[]; watchOuts: string[]; followUpQuestions: string[]; relatedFeatures: Array<"lifeline" | "health" | "fraud" | "rights"> };

const earnerTypes = [{ value: "unspecified", label: "Choose one (optional)" }, { value: "daily-wage", label: "Daily wage / informal worker" }, { value: "freelancer", label: "Freelancer / gig worker" }, { value: "retiree", label: "Retired / pensioner" }, { value: "student", label: "Student / first-time earner" }, { value: "joint-family", label: "Joint family" }] as const;
const featureNames = { lifeline: "Lifeline", health: "Financial health", fraud: "Fraud check", rights: "Rights guide" };
const disclaimer = "ANCHOR provides general information and navigation, not professional financial, legal, medical, or emergency advice. Verify important details through official sources.";

function Timeline({ label, title, actions, tone }: { label: string; title: string; actions: PlanAction[]; tone: "now" | "week" | "month" }) {
  return <section className={`planner-timeline ${tone}`}><div className="planner-timeline-heading"><span>{label}</span><div><h2>{title}</h2><p>{tone === "now" ? "Focus on essentials and immediate control." : tone === "week" ? "Turn today’s decisions into practical follow-through." : "Build a more stable routine from what worked."}</p></div></div><ol>{actions.map((action, index) => <li key={`${action.title}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{action.title}</strong><p>{action.detail}</p></div></li>)}</ol></section>;
}

export default function PlannerPage() {
  const [input, setInput] = useState(""); const [earnerType, setEarnerType] = useState("unspecified"); const [loading, setLoading] = useState(false); const [result, setResult] = useState<PlanResult | null>(null); const [error, setError] = useState<string | null>(null);
  async function handleSubmit(event: React.FormEvent) { 
    event.preventDefault(); 
    setError(null); 
    setResult(null); 
    setLoading(true); 
    try { 
      const response = await fetch(`/api/v1/planner`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ situation: input, earnerType, language: "en" }) 
      }); 
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The server returned an unexpected response (not JSON). Please try again.");
      }

      const payload = await response.json(); 
      if (!response.ok) throw new Error(payload.error?.message ?? "We could not create your plan."); 
      setResult(payload.data); 
    } catch (reason) { 
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again."); 
    } finally { 
      setLoading(false); 
    } 
  }
  const startOver = () => { setResult(null); setError(null); setInput(""); setEarnerType("unspecified"); };
  return <main className="feature-wrap planner-page"><div className="saas-grid-bg" /><div className="saas-glow" style={{ opacity: .22 }} /><Link className="back" href="/">← All guidance</Link>{!result ? <><div className="planner-hero"><p className="eyebrow">Smart life planner</p><h1>A practical plan for what comes next.</h1><p className="lede">Share your situation and get an AI-guided plan that separates urgent actions from the work you can do this week and this month.</p></div><aside className="warning"><strong>Keep it safe:</strong> Do not include account numbers, Aadhaar/PAN, passwords, OTPs, or exact addresses.</aside><form className="planner-form" onSubmit={handleSubmit} noValidate><label>What best describes your work?<select value={earnerType} onChange={(event) => setEarnerType(event.target.value)}>{earnerTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label><label>What is happening with your money right now?<textarea value={input} onChange={(event) => setInput(event.target.value)} required minLength={3} maxLength={3000} placeholder="For example: My work has reduced for two weeks. I have rent due soon and need to support my family." aria-describedby="planner-input-hint" /><span id="planner-input-hint">{input.length}/3000 · Include income changes, essential costs, and your biggest concern.</span></label><button disabled={loading || input.trim().length < 3} type="submit">{loading ? "Creating your plan…" : "Create my plan →"}</button>{error && <p role="alert" className="error">{error}</p>}</form></> : <section className="planner-results" aria-live="polite"><div className="planner-result-heading"><p className="eyebrow">Your guided plan</p><h1>{result.summary}</h1><div className="planner-priority"><span>Start here</span><p>{result.priority}</p></div></div><div className="planner-plan-meta"><span>AI-generated from your situation</span><span>Actions are ordered by time horizon</span></div><Timeline label="01 · Today" title="Stabilise the essentials" actions={result.todayActions} tone="now" /><Timeline label="02 · This week" title="Create breathing room" actions={result.sevenDayPlan} tone="week" /><Timeline label="03 · This month" title="Build a steadier base" actions={result.thirtyDayPlan} tone="month" /><div className="planner-support-grid">{result.watchOuts.length > 0 && <section className="watch-outs"><h2>Watch out for</h2><ul>{result.watchOuts.map((item) => <li key={item}>{item}</li>)}</ul></section>}{result.followUpQuestions.length > 0 && <section className="planner-questions"><h2>Questions to consider</h2><ul>{result.followUpQuestions.map((item) => <li key={item}>{item}</li>)}</ul></section>}</div>{result.relatedFeatures.length > 0 && <section className="planner-features"><h2>Explore related support</h2><div>{result.relatedFeatures.map((feature) => <Link href={`/${feature}`} key={feature}>{featureNames[feature]} <span>→</span></Link>)}</div></section>}<p className="disclaimer">{disclaimer}</p><div className="result-actions"><button onClick={() => navigator.clipboard.writeText(document.querySelector(".planner-results")?.textContent ?? "")}>Copy plan</button><button onClick={() => window.print()}>Print</button><button onClick={startOver}>Start over</button></div></section>}<p className="footer-note">{disclaimer}</p></main>;
}
