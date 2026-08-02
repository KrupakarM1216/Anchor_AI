'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FraudAssessment } from '@/lib/fraud';

const examples = {
  'Investment offer': 'I saw screenshots of people earning ₹40,000 to ₹80,000 a week from a trading app called WealthPro. They promise guaranteed 35% monthly returns, ask for a ₹5,000 minimum investment, and want me to download an APK from their website tonight.',
  'Bank call': 'A caller says they are from my bank and my account will be frozen unless I share the OTP just sent to my phone to update KYC.',
  'Job offer': 'I got a work-from-home data entry job offer for ₹25,000 a month. They want ₹4,500 as a security deposit and laptop registration fee before I start.',
  'Loan app': 'An app promises a ₹50,000 loan in 5 minutes with no documents or CIBIL check. It asks for contacts and gallery access.',
};

const riskCopy = {
  critical: ['Critical risk', 'Stop and secure your accounts now.'],
  high: ['High risk', 'Do not send money, install an app, or share any code.'],
  medium: ['Needs verification', 'Pause before acting and check the details independently.'],
  low: ['Low risk', 'No strong pattern detected, but still verify the source.'],
  safe: ['Looks safer', 'Continue only after checking the official details.'],
} as const;

export default function FraudPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<FraudAssessment | null>(null);
  const [status, setStatus] = useState<'idle' | 'reading' | 'analysing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const scan = async () => {
    const message = input.trim();
    if (message.length < 3) return;
    setError(null); setResult(null); setStatus('reading');
    const timer = window.setTimeout(() => setStatus('analysing'), 550);
    try {
      const response = await fetch('/api/v1/fraud/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: message, language: 'en' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message ?? payload.error ?? 'The scan could not be completed.');
      setResult(payload.data ?? payload);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Unable to scan this right now. Please try again.');
    } finally { window.clearTimeout(timer); setStatus('idle'); }
  };

  const selectExample = (text: string) => { setInput(text); setResult(null); setError(null); };
  const copyWarning = async () => {
    if (!result?.shareWarning) return;
    await navigator.clipboard?.writeText(result.shareWarning);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };
  const busy = status !== 'idle';

  return <main className="fraud-page">
    <div className="fraud-glow" />
    <Link href="/" className="fraud-back">← Back to ANCHOR</Link>
    <section className="fraud-hero">
      <div className="fraud-kicker"><span /> AI-powered safety check</div>
      <h1>Check an offer <em>before it costs you.</em></h1>
      <p>Paste a message, describe a call, or explain an offer. ANCHOR checks common scam patterns in real time and tells you what to do next.</p>
    </section>

    <section className="fraud-workspace" aria-label="Fraud scan">
      <div className="fraud-input-card">
        <div className="fraud-card-heading"><div><h2>What happened?</h2><p>Do not include OTPs, PINs, passwords, or full account numbers.</p></div><span className="fraud-private">🔒 Private scan</span></div>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Example: Someone offered guaranteed returns and asked me to install an app…" aria-label="Message or offer to scan" />
        <div className="fraud-editor-footer"><span>{input.length}/5,000</span><span>We analyse the text, not your contacts or device.</span></div>
        <div className="fraud-examples"><span>Quick examples</span>{Object.entries(examples).map(([label, text]) => <button key={label} className="fraud-chip" onClick={() => selectExample(text)}>{label}</button>)}</div>
        <button className="fraud-scan-button" onClick={scan} disabled={busy || input.trim().length < 3}>
          {busy ? <><i className="fraud-spinner" />{status === 'reading' ? 'Reading the message…' : 'Checking risk signals…'}</> : <>Scan safely <span>→</span></>}
        </button>
      </div>
      <aside className="fraud-side-card"><span className="fraud-side-icon">⌁</span><h2>Made for a quick decision</h2><ul><li>Clear risk level, not jargon</li><li>Exact warning signs explained</li><li>Practical steps if you already acted</li></ul><p>AI helps assess patterns. Always verify a company through its official channels.</p></aside>
    </section>

    {error && <div className="fraud-error" role="alert"><strong>Scan unavailable</strong><span>{error}</span><button onClick={scan}>Try again</button></div>}

    {result && <section className="fraud-results" aria-live="polite">
      <div className={`fraud-verdict fraud-${result.riskLevel}`}><div><span className="fraud-risk-dot" />{riskCopy[result.riskLevel][0]} <small>· {result.mode === 'live' ? 'Live AI analysis' : 'Guided safety analysis'} · {result.confidence} confidence</small></div><h2>{result.verdict}</h2><p>{riskCopy[result.riskLevel][1]} <span>{result.scamType}</span></p></div>
      <div className="fraud-result-grid">
        <div className="fraud-main-results">
          {result.redFlags.length > 0 && <article className="fraud-panel"><h2>Warning signs found</h2>{result.redFlags.map((flag, index) => <div className="fraud-flag" key={`${flag.flag}-${index}`}><b>{flag.flag}</b><p>{flag.why}</p>{flag.rule && <small>{flag.rule}</small>}</div>)}</article>}
          <article className="fraud-panel"><h2>If you continue</h2><p className="fraud-narrative">{result.whatWouldHappen.narrative}</p><div className="fraud-loss"><span>Potential loss</span><strong>{result.whatWouldHappen.estimatedLoss}</strong></div></article>
        </div>
        <div className="fraud-actions"><article className="fraud-panel fraud-now"><h2>Do this now</h2><ol>{result.doNow.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol></article><article className="fraud-panel"><h2>Need to report it?</h2>{result.reportTo.map((channel) => <p className="fraud-report" key={channel.channel}><b>{channel.channel}</b>{channel.how}</p>)}</article></div>
      </div>
      <div className="fraud-share"><div><span>Protect someone else</span><p>{result.shareWarning}</p></div><button onClick={copyWarning}>{copied ? 'Copied' : 'Copy warning'}</button></div>
    </section>}
  </main>;
}
