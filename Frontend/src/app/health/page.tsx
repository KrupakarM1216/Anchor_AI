'use client';

import { useState } from 'react';
import Link from 'next/link';

// Types
interface HealthResult {
  overallScore: number;
  scoreLabel: string;
  scoreColor: string;
  pillars: {
    security: { score: number; label: string; insight: string };
    growth: { score: number; label: string; insight: string };
    protection: { score: number; label: string; insight: string };
    planning: { score: number; label: string; insight: string };
    awareness: { score: number; label: string; insight: string };
  };
  biggestRisks: string[];
  biggestOpportunities: string[];
  thirtyDayPlan: Array<{ week: number; action: string }>;
  vulnerabilityScore: {
    fraud: number;
    medical: number;
    debtTrap: number;
  };
  oneMessage: string;
}

const QUESTIONS = [
  {
    key: 'incomeStability',
    text: 'How stable is your income month to month?',
    options: [
      'Very stable, same amount every month',
      'Mostly stable with small variations',
      'Varies quite a bit month to month',
      'Very unpredictable, I never know what I will earn'
    ]
  },
  {
    key: 'savingsRate',
    text: 'What percentage of your monthly income do you manage to save?',
    options: [
      'More than 20%',
      'Between 10% and 20%',
      'Less than 10%',
      'I spend everything or go into negative'
    ]
  },
  {
    key: 'emergencyFund',
    text: 'Do you have an emergency fund — money set aside for unexpected situations?',
    options: [
      'Yes, it covers more than 6 months of my expenses',
      'Yes, it covers 3 to 6 months',
      'Yes but it covers less than 3 months',
      'No emergency fund at all'
    ]
  },
  {
    key: 'debtSituation',
    text: 'Do you currently have any outstanding debt?',
    options: [
      'No debt of any kind',
      'Only a home loan or education loan — planned debt',
      'Personal loan or credit card debt I am managing',
      'Multiple loans or using one loan to pay another'
    ]
  },
  {
    key: 'healthInsurance',
    text: 'Do you have health insurance that covers you and your family?',
    options: [
      'Yes, full family covered with good coverage',
      'Yes but only for myself',
      'Only what my employer provides — no personal policy',
      'No health insurance at all'
    ]
  },
  {
    key: 'investments',
    text: 'Do you invest any money regularly — SIP, stocks, PPF, gold, or anything?',
    options: [
      'Yes, I invest more than 10% of my income every month',
      'Yes, I invest a small amount regularly',
      'Occasionally, not consistent',
      'All my money stays in a savings account or cash'
    ]
  },
  {
    key: 'financialRunway',
    text: 'If you lost your income tomorrow, how long could you survive without borrowing?',
    options: [
      'More than 6 months',
      '3 to 6 months',
      '1 to 3 months',
      'Less than 1 month'
    ]
  },
  {
    key: 'expenseTracking',
    text: 'Do you know exactly how much you spent last month and on what?',
    options: [
      'Yes, I track every expense',
      'I have a rough idea of the big categories',
      'I know the total but not the breakdown',
      'I have no idea where my money went'
    ]
  },
  {
    key: 'financialGoals',
    text: 'Do you have a clear financial goal you are actively working toward?',
    options: [
      'Yes, a specific goal with a monthly saving plan',
      'Yes, a goal but no structured plan',
      'Vague ideas but nothing concrete',
      'No financial goal at all'
    ]
  },
  {
    key: 'fraudExposure',
    text: 'Have you or someone close to you ever lost money to a financial scam or predatory loan?',
    options: [
      'No, and I know how to identify scams',
      'No, but I have had close calls',
      'Yes, a small amount',
      'Yes, a significant amount'
    ]
  }
];

const COLORS: Record<string, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  'bright green': '#00e887'
};

export default function FinancialHealthScore() {
  const [screen, setScreen] = useState<'intro' | 'questions' | 'loading' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<HealthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (questionKey: string, selectedOption: string) => {
    const newAnswers = { ...answers, [questionKey]: selectedOption };
    setAnswers(newAnswers);
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 400);
    } else {
      setScreen('loading');
      callAPI(newAnswers);
    }
  };

  const callAPI = async (allAnswers: Record<string, string>) => {
    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const API_URL = rawApiUrl.split(/[\n\r]+/).pop()?.trim() || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/v1/health/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: allAnswers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');
      
      // Wait a minimum of 3 seconds for the loading screen effect
      setTimeout(() => {
        setResult(data);
        setScreen('results');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setScreen('intro'); // Fall back
    }
  };

  const retake = () => {
    setScreen('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'transparent',
    color: 'var(--ink)',
    fontFamily: 'inherit',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 1
  };

  const contentMaxWidth = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  };

  if (screen === 'intro') {
    return (
      <div style={containerStyle}>
        <div className="saas-grid-bg"></div>
        <div className="saas-glow" style={{ opacity: 0.3 }}></div>
        <div style={contentMaxWidth}>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
            ← Back to Home
          </Link>
          
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h1 style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '28px', marginBottom: '0.5rem' }}>
              Financial Health Score
            </h1>
            <p style={{ color: '#d1d5db', fontSize: '16px', marginBottom: '3rem' }}>
              Find out where you actually stand — in 90 seconds
            </p>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '3rem' }}>
              <p style={{ margin: '0.5rem 0' }}>✅ 10 quick questions</p>
              <p style={{ margin: '0.5rem 0' }}>✅ Personalised score out of 100</p>
              <p style={{ margin: '0 0 0.5rem 0' }}>✅ Your exact 30-day action plan</p>
            </div>

            {error && (
              <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                {error}
              </div>
            )}

            <button 
              onClick={() => setScreen('questions')}
              style={{
                background: '#f59e0b',
                color: '#000000',
                width: '100%',
                borderRadius: '999px',
                height: '52px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Start My Assessment →
            </button>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>
              Takes 90 seconds. No sign up. No data stored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'questions') {
    const q = QUESTIONS[currentQuestion];
    const progressPercent = ((currentQuestion) / QUESTIONS.length) * 100;

    return (
      <div style={containerStyle}>
        <div className="saas-grid-bg"></div>
        <div className="saas-glow" style={{ opacity: 0.3 }}></div>
        <div style={contentMaxWidth}>
          {/* Progress */}
          <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '14px' }}>
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </div>
          <div style={{ background: '#1e293b', height: '6px', borderRadius: '4px', marginBottom: '3rem', overflow: 'hidden' }}>
            <div style={{ background: '#f59e0b', height: '100%', width: `${progressPercent}%`, transition: 'width 0.3s ease' }} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem', lineHeight: 1.4 }}>
            {q.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {q.options.map((opt, idx) => {
              const isSelected = answers[q.key] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(q.key, opt)}
                  style={{
                    background: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#000000' : '#ffffff',
                    border: '1px solid',
                    borderColor: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    fontSize: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'loading') {
    return (
      <div style={{ ...containerStyle, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            border: '4px solid rgba(245, 158, 11, 0.2)', 
            borderTopColor: '#f59e0b', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem' 
          }} />
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <p style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 'bold', marginBottom: '2rem' }}>
            ANCHOR AI is analysing your financial health...
          </p>
          <div style={{ color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>Calculating your score...</p>
            <p style={{ animation: 'fadeIn 1s ease 1s backwards' }}>Identifying your risks...</p>
            <p style={{ animation: 'fadeIn 1s ease 2s backwards' }}>Building your action plan...</p>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </div>
      </div>
    );
  }

  if (screen === 'results' && result) {
    const mainColor = COLORS[result.scoreColor?.toLowerCase()] || '#f59e0b';

    return (
      <div style={containerStyle}>
        <div className="saas-grid-bg"></div>
        <div className="saas-glow" style={{ opacity: 0.3 }}></div>
        <div style={contentMaxWidth}>
          {/* Section A: The Big Score */}
          <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: `8px solid ${mainColor}40`,
              borderTopColor: mainColor,
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: '900',
              color: '#fff'
            }}>
              {result.overallScore}
            </div>
            <h2 style={{ color: mainColor, fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
              {result.scoreLabel}
            </h2>
            <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '18px', lineHeight: 1.5 }}>
              "{result.oneMessage}"
            </p>
          </div>

          {/* Section B: 5 Pillar Breakdown */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Your 5 Pillars
            </h3>
            {Object.entries(result.pillars).map(([key, pillar]) => {
              // Determine pillar color loosely based on score
              let pColor = COLORS.red;
              if (pillar.score > 40) pColor = COLORS.orange;
              if (pillar.score > 60) pColor = COLORS.yellow;
              if (pillar.score > 75) pColor = COLORS.green;
              if (pillar.score >= 90) pColor = COLORS['bright green'];

              return (
                <div key={key} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', textTransform: 'capitalize', fontWeight: 'bold' }}>
                    <span>{key}</span>
                    <span style={{ color: pColor }}>{pillar.score}/100</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${pillar.score}%`, height: '100%', background: pColor }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    {pillar.insight}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Section C: Biggest Risks */}
          <div style={{ display: 'flex', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '20px', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#ef4444', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '1rem', flexShrink: 0, marginTop: '0.2rem' }}>
              !
            </div>
            <div>
              <h3 style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold', margin: '0 0 0.5rem 0', lineHeight: '32px' }}>
                Your 3 Biggest Risks
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.biggestRisks && result.biggestRisks.length > 0 ? (
                  result.biggestRisks.map((risk, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', color: '#d1d5db', lineHeight: 1.5 }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>•</span>
                      <span>{risk}</span>
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#d1d5db', lineHeight: 1.5, fontStyle: 'italic' }}>
                    No significant risks identified based on your current profile.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Section D: Biggest Opportunities */}
          <div style={{ display: 'flex', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1.5rem', borderRadius: '20px', marginBottom: '3rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#22c55e', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '1rem', flexShrink: 0, marginTop: '0.2rem' }}>
              ✓
            </div>
            <div>
              <h3 style={{ color: '#22c55e', fontSize: '18px', fontWeight: 'bold', margin: '0 0 0.5rem 0', lineHeight: '32px' }}>
                Your 3 Biggest Opportunities
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.biggestOpportunities && result.biggestOpportunities.length > 0 ? (
                  result.biggestOpportunities.map((opp, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', color: '#d1d5db', lineHeight: 1.5 }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                      <span>{opp}</span>
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#d1d5db', lineHeight: 1.5, fontStyle: 'italic' }}>
                    No specific opportunities identified at this time.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Section E: 30 Day Action Plan */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📅 Your 30-Day Action Plan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.thirtyDayPlan?.map((plan, i) => {
                const weekColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
                const wColor = weekColors[i] || '#f59e0b';
                return (
                  <div key={i} style={{ border: `1px solid ${wColor}40`, padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ color: wColor, fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Week {plan.week}
                    </div>
                    <p style={{ margin: 0, color: '#e5e7eb' }}>{plan.action}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section F: Vulnerability Score */}
          <div style={{ marginBottom: '3rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              🛡️ Your Vulnerability Check
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              
              {/* Fraud Risk */}
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.5rem' }}>Fraud Risk</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: result.vulnerabilityScore.fraud > 60 ? '#ef4444' : '#22c55e' }}>
                  {result.vulnerabilityScore.fraud}/100
                </div>
                <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '0.25rem' }}>
                  {result.vulnerabilityScore.fraud > 60 ? 'High' : (result.vulnerabilityScore.fraud > 30 ? 'Moderate' : 'Low')}
                </div>
              </div>

              {/* Medical Risk */}
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.5rem' }}>Medical Risk</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: result.vulnerabilityScore.medical > 60 ? '#ef4444' : '#22c55e' }}>
                  {result.vulnerabilityScore.medical}/100
                </div>
                <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '0.25rem' }}>
                  {result.vulnerabilityScore.medical > 60 ? 'High' : (result.vulnerabilityScore.medical > 30 ? 'Moderate' : 'Low')}
                </div>
              </div>

              {/* Debt Risk */}
              <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.5rem' }}>Debt Risk</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: result.vulnerabilityScore.debtTrap > 60 ? '#ef4444' : '#22c55e' }}>
                  {result.vulnerabilityScore.debtTrap}/100
                </div>
                <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '0.25rem' }}>
                  {result.vulnerabilityScore.debtTrap > 60 ? 'High' : (result.vulnerabilityScore.debtTrap > 30 ? 'Moderate' : 'Low')}
                </div>
              </div>

            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
              Tap <Link href="/fraud" style={{color: '#f59e0b'}}>Fraud Shield</Link> or <Link href="/rights" style={{color: '#f59e0b'}}>Rights Finder</Link> to take action on your highest risk
            </p>
          </div>

          {/* Section G: Retake Button */}
          <button 
            onClick={retake}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#f59e0b',
              border: '2px solid #f59e0b',
              padding: '1rem',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '4rem'
            }}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return null;
}
