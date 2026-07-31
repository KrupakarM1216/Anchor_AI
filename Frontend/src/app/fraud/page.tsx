'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FraudResult {
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  verdict: string;
  confidence: string;
  scamType: string;
  redFlags: Array<{ flag: string; why: string; rule?: string }>;
  greenFlags: string[];
  whatWouldHappen: { narrative: string; estimatedLoss: string };
  doNow: string[];
  reportTo: Array<{ channel: string; how: string }>;
  shareWarning: string;
  relatedFeatures: string[];
}

const EXAMPLES = [
  '🎯 Investment scam',
  '📞 Fake bank call',
  '💼 Job deposit scam',
  '💰 Instant loan app',
];

const EXAMPLE_INPUTS: Record<string, string> = {
  '🎯 Investment scam':
    'Bhai ek app hai, guaranteed 35% return monthly. Sirf ₹10,000 se start karo. APK bhej raha hu, download karo, aaj hi invest kar do, kal price badh jayega.',
  '📞 Fake bank call':
    'A caller said he is from SBI, my account will be frozen unless I share the OTP just received to update my KYC. He knew my name and last 4 digits of my card.',
  '💼 Job deposit scam':
    'Got a work-from-home data entry job offer, ₹25,000/month. They said I need to pay ₹4,500 as security deposit and laptop registration fee before starting.',
  '💰 Instant loan app':
    '"Rupee Boost" app is offering ₹50,000 loan in 5 minutes, no documents, no CIBIL check. They asked for contacts and gallery access.',
};

const riskStyles = (level: string) => {
  switch (level) {
    case 'critical':
      return { bg: 'rgba(244, 63, 94, 0.1)', border: '#f43f5e', text: '#fda4af', label: 'CRITICAL RISK', emoji: '🚨' };
    case 'high':
      return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#fca5a5', label: 'HIGH RISK', emoji: '⚠️' };
    case 'medium':
      return { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#fcd34d', label: 'MEDIUM RISK', emoji: '⚠️' };
    case 'low':
      return { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', text: '#fef08a', label: 'LOW RISK', emoji: '👀' };
    default:
      return { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#86efac', label: 'LOOKS SAFE', emoji: '✅' };
  }
};

export default function FraudPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const API_URL = rawApiUrl.split(/[\n\r]+/).pop()?.trim() || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/v1/fraud/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, language: 'en' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to scan');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (key: string) => {
    setInput(EXAMPLE_INPUTS[key]);
    setResult(null);
    setError(null);
  };

  const risk = result ? riskStyles(result.riskLevel) : null;

  return (
    <div className="feature-wrap">
      <div className="saas-grid-bg"></div>
      <div className="saas-glow" style={{ opacity: 0.3 }}></div>
      <Link href="/" className="back">
        ← All guidance
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>🛡️ Fraud Shield</h1>
        <p className="lede">
          Scan any message, call, or offer before you say yes. We'll tell you if it's a scam in 3 seconds.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--surface)' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
          Paste the message, describe the call, or type what someone is offering you.
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: Got a WhatsApp about an investment app promising 35% guaranteed returns..."
          style={{
            width: '100%',
            height: '160px',
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            borderRadius: '0.5rem',
            padding: '1rem',
            color: 'var(--ink)',
            resize: 'none',
            fontSize: '1rem'
          }}
        />

        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => loadExample(ex)}
              style={{
                fontSize: '0.75rem',
                background: 'var(--bg)',
                color: 'var(--ink)',
                padding: '0.25rem 0.75rem',
                borderRadius: '99px',
                border: '1px solid var(--line)',
                cursor: 'pointer'
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || input.trim().length < 3}
          style={{ width: '100%', marginTop: '1.5rem', opacity: (loading || input.trim().length < 3) ? 0.5 : 1 }}
        >
          {loading ? 'Scanning for red flags…' : '🛡️ Scan This Now'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#fca5a5', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {result && risk && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ borderRadius: '0.5rem', padding: '1.5rem', background: risk.bg, border: `2px solid ${risk.border}` }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: risk.text, marginBottom: '0.5rem' }}>
              {risk.emoji} {risk.label} · Confidence: {result.confidence}
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--ink)' }}>{result.verdict}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>Type: {result.scamType}</p>
          </div>

          {result.redFlags?.length > 0 && (
            <div className="card" style={{ border: '1px solid #fca5a5' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '1rem' }}>
                🔴 Red Flags Detected
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.redFlags.map((rf, i) => (
                  <li key={i} style={{ borderLeft: '3px solid #ef4444', paddingLeft: '1rem' }}>
                    <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>"{rf.flag}"</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink)', margin: '0 0 0.25rem 0' }}>{rf.why}</p>
                    {rf.rule && (
                      <p style={{ fontSize: '0.8rem', color: '#ef4444', fontStyle: 'italic', margin: 0 }}>{rf.rule}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.greenFlags?.length > 0 && (
            <div className="card" style={{ border: '1px solid #86efac' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.75rem' }}>
                ✅ What Looks Legit
              </h2>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {result.greenFlags.map((g, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {result.whatWouldHappen?.narrative && (
            <div className="card" style={{ border: '1px solid #fcd34d' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d97706', marginBottom: '0.75rem' }}>
                🎬 What Would Actually Happen
              </h2>
              <p style={{ lineHeight: 1.5, margin: 0 }}>
                {result.whatWouldHappen.narrative}
              </p>
              {result.whatWouldHappen.estimatedLoss && (
                <div style={{ marginTop: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Estimated loss</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', margin: 0 }}>
                    {result.whatWouldHappen.estimatedLoss}
                  </p>
                </div>
              )}
            </div>
          )}

          {result.doNow?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Do This Now</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.doNow.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', fontWeight: 500 }}>
                    <span style={{ color: '#d97706' }}>✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.reportTo?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                📢 Report It
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.reportTo.map((r, i) => (
                  <li key={i}>
                    <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{r.channel}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>{r.how}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.shareWarning && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d97706', margin: '0 0 0.5rem 0' }}>
                📲 Forward This to Family
              </h2>
              <p style={{ color: '#b45309', fontStyle: 'italic', margin: '0 0 1rem 0' }}>"{result.shareWarning}"</p>
              <button
                onClick={() => navigator.clipboard?.writeText(result.shareWarning)}
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '0.25rem' }}
              >
                Copy Warning
              </button>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setInput(''); }}
            style={{ width: '100%', background: 'var(--ink)', color: 'var(--bg)', padding: '1rem', border: 'none', borderRadius: '0.5rem', fontWeight: 600 }}
          >
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}
