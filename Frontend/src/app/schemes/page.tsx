"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function SchemesPage() {
  const [age, setAge] = useState<number | string>("");
  const [income, setIncome] = useState<number | string>("");
  const [occupation, setOccupation] = useState<string>("street_vendor");
  const [ownsPuccaHouse, setOwnsPuccaHouse] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        age: Number(age),
        income: Number(income),
        occupation,
        ownsPuccaHouse
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/v1/schemes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch matches");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const occupations = [
    { value: "street_vendor", label: "Street Vendor / Hawker" },
    { value: "traditional_artisan", label: "Traditional Artisan / Craftsperson" },
    { value: "domestic_worker", label: "Domestic Worker" },
    { value: "construction_worker", label: "Construction Worker" },
    { value: "unorganized_worker", label: "Other Unorganized Sector Worker" },
    { value: "salaried_private", label: "Salaried Private Employee" },
    { value: "unemployed", label: "Unemployed" }
  ];

  return (
    <div className="feature-wrap">
      <div className="saas-grid-bg"></div>
      <div className="saas-glow" style={{ opacity: 0.3 }}></div>
      <Link href="/" className="back">
        ← All guidance
      </Link>

      <p className="eyebrow">SCHEME SCANNER</p>
      <h1>Discover benefits you qualify for.</h1>
      <p className="lede">
        Check your eligibility for government schemes and subsidies securely and accurately. We use deterministic matching, not AI guessing.
      </p>

      <aside className="warning">
        <strong>Privacy First:</strong> We do not store your age, income, or occupational data. This check is processed instantly and then discarded.
      </aside>

      {!result ? (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label>
              Your Age
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </label>

            <label>
              Annual Household Income (₹)
              <input
                type="number"
                min={0}
                value={income}
                onChange={(e) => setIncome(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </label>

            <label>
              Primary Occupation
              <select value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                {occupations.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 'auto', transform: 'scale(1.2)' }}
                checked={ownsPuccaHouse}
                onChange={(e) => setOwnsPuccaHouse(e.target.checked)}
              />
              Do you own a Pucca (permanent) house?
            </label>
          </div>

          <button style={{ marginTop: '2rem' }} disabled={loading} type="submit">
            {loading ? "Scanning schemes…" : "Scan Schemes →"}
          </button>

          {error && (
            <div className="error" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="result">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2>Your Matches</h2>
            <button onClick={() => setResult(null)} style={{ padding: '0.5rem 1rem', background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
              Start Over
            </button>
          </div>

          <div className="card" style={{ background: 'var(--surface)', borderColor: 'var(--primary)', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary)' }}>✨ AI Summary</h3>
            <div className="markdown-content" style={{ color: "var(--ink)", lineHeight: "1.6", marginTop: "1rem" }}>
              <ReactMarkdown>{result.explanation}</ReactMarkdown>
            </div>
            {result.nextStep && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '0.5rem', fontWeight: 600 }}>
                Next Step: {result.nextStep}
              </div>
            )}
          </div>

          {result.matches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
              {result.matches.map((match: any) => (
                <div key={match.schemeId} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                    <h3 style={{ margin: 0, lineHeight: 1.3 }}>{match.officialName}</h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      background: match.matchLevel === 'likely_match' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: match.matchLevel === 'likely_match' ? '#86efac' : '#fef08a'
                    }}>
                      {match.matchLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <p style={{ marginBottom: '1rem' }}>{match.summary}</p>

                  <div className="number-card" style={{ marginBottom: '1rem' }}>
                    <span className="number-label">{match.benefit.type}</span>
                    <span className="number-value">{match.benefit.displayText}</span>
                  </div>

                  {match.matchedCriteria?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Criteria you met:</strong>
                      <ul style={{ margin: '0.5rem 0', color: 'var(--green)', fontSize: '0.9rem' }}>
                        {match.matchedCriteria.map((c: string, i: number) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  {match.unmetCriteria?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Criteria not met / Unknown:</strong>
                      <ul style={{ margin: '0.5rem 0', color: 'var(--danger)', fontSize: '0.9rem' }}>
                        {match.unmetCriteria.map((c: string, i: number) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  <div>
                    <strong>Application Steps:</strong>
                    <ol className="action-steps" style={{ marginTop: '0.5rem' }}>
                      {match.applicationSteps.map((step: string, index: number) => (
                        <li key={index} className="action-step" style={{ padding: '0.75rem' }}>
                          <span className="step-number">{index + 1}</span>
                          <div>{step}</div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="disclaimer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--line)', fontSize: '0.75rem' }}>
                    Source: <a href={match.sources[0]?.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{match.sources[0]?.title}</a>
                    <br />
                    Verified At: {new Date(match.verifiedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <p>No deterministic matches found in our curated database for your profile. Please check state-level schemes for more local benefits.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
