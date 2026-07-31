/** Demo data generation and sensitive-value detection for all 6 ANCHOR features. */

export const disclaimer = "ANCHOR provides general information and navigation, not professional financial, legal, medical, or emergency advice. Rules and programmes change; verify through official sources.";

export const source = {
  id: "demo-source",
  title: "Demo catalogue — verify before public launch",
  publisher: "ANCHOR demo evidence",
  url: "https://www.india.gov.in/",
  jurisdiction: "IN",
  verifiedAt: "2026-07-30T00:00:00Z",
};

const actions = [
  "Pause before sharing money, credentials, or documents.",
  "Keep only the records you need and use an official channel to verify.",
  "Take the next small step today; ask a qualified local service if facts are unclear.",
];

/** Detects OTP, PAN, Aadhaar, card numbers, and credential keywords. */
export function hasSensitiveValue(value) {
  return /\b\d{6}\b|\b[A-Z]{5}\d{4}[A-Z]\b|\b\d{12}\b|\b\d{13,19}\b|\b(?:otp|pin|password|cvv|private key)\b/i.test(value);
}

/** Generates a demo response for the given feature. */
export function makeDemo(feature, input) {
  const base = {
    meta: {
      requestId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      locale: "en-IN",
      mode: "demo",
      confidence: "medium",
      evidenceIds: [source.id],
    },
  };

  if (feature === "fraud") {
    const text = String(input.text ?? "").toLowerCase();
    const flags = ["guaranteed", "otp", "pin", "apk", "urgent", "today", "remote access", "fee", "crypto"].filter((s) => text.includes(s));
    const critical = input.alreadyActed === "yes";
    const risk = critical ? "critical" : flags.length >= 2 ? "high" : flags.length ? "medium" : "low";
    return {
      data: {
        risk,
        summary: critical
          ? "Because you may already have shared details or paid, focus on containment first."
          : risk === "low"
            ? "No strong warning signs were detected in this text. This is not proof of safety."
            : "This text shows warning signs that need careful verification.",
        redFlags: flags.map((type) => ({
          type,
          excerpt: type,
          explanation: "This can be used to pressure people into acting before verifying.",
        })),
        actions: critical
          ? [
              "Contact your bank or payment provider through its official app or number.",
              "Change passwords from a trusted device if credentials were shared.",
              "Use an official cybercrime reporting channel shown below.",
            ]
          : actions,
        ifAlreadyActed: critical ? actions : [],
        resources: [source],
        limitations: ["Demo text analysis cannot verify a sender or investigate a link."],
        disclaimer,
      },
      ...base,
    };
  }

  if (feature === "health") {
    return {
      data: {
        financialHealth: 58,
        overallVulnerability: 46,
        fraudVulnerability: 40,
        medicalVulnerability: 52,
        debtTrapVulnerability: 48,
        confidence: "medium",
        bandLabels: { health: "Watch", vulnerability: "Moderate" },
        drivers: [
          "Income may be less predictable",
          "Emergency buffer needs checking",
          "Debt payment pressure may need attention",
        ],
        actions,
        methodologyVersion: "1.0.0",
        disclaimer: "Educational screening, not a credit score or diagnosis.",
      },
      ...base,
    };
  }

  if (feature === "schemes") {
    return {
      data: {
        matches: [
          {
            schemeId: "demo-scheme",
            officialName: "Demo programme catalogue",
            match: "possible_match",
            why: ["Some answers may align with this programme category."],
            unknowns: ["The demo catalogue is not approved for public reliance."],
            applicationSteps: [
              "Verify current conditions on the official portal.",
              "Review document categories before applying.",
            ],
            sources: [source],
            verifiedAt: source.verifiedAt,
          },
        ],
        disclaimer: "Possible matches are not approval or a guarantee.",
      },
      ...base,
    };
  }

  if (feature === "rights") {
    return {
      data: {
        issueSummary: "Based on what you shared, this may need verification through the relevant organization or authority.",
        jurisdiction: `IN-${String(input.state ?? "")}`,
        missingFacts: ["The applicable rule and dates need verification."],
        potentialRights: ["A curated legal source would be required before making a specific legal claim."],
        evidenceToPreserve: ["Keep dated messages, payslips, bills, or receipts that you already have."],
        nextSteps: actions,
        escalation: [
          "Ask the organization for a written response.",
          "Use the relevant official grievance route.",
          "Seek legal aid or professional help if needed.",
        ],
        sources: [source],
        urgency: "routine",
        disclaimer: "General legal information, not legal advice.",
      },
      ...base,
    };
  }

  if (feature === "crisis") {
    const danger = input.immediateDanger === "yes";
    return {
      data: {
        urgency: danger ? "immediate" : "high",
        immediateActions: danger
          ? [
              "Move to a safer place or seek urgent medical help now.",
              "Contact a trusted nearby person if you can do so safely.",
              "Use a verified local emergency service; ANCHOR cannot contact one for you.",
            ]
          : actions,
        next24Hours: ["Make a short list of essential food, medicine, shelter, and communication needs."],
        next7Days: ["Check official local support and income-stabilization options."],
        preserve: ["Keep relevant notices and payment records."],
        avoid: ["Do not take a new high-cost loan just to repay another loan."],
        resources: [source],
        relatedFeature: "schemes",
        disclaimer,
      },
      ...base,
    };
  }

  // Default: planner
  return {
    data: {
      summary: "Plan against your lower-income period first and protect essentials before longer-term goals.",
      assumptions: ["This demo uses broad assumptions because income and expenses may vary."],
      priorityOrder: [
        "Food, housing, medicine and communication",
        "Minimum essential obligations",
        "A small buffer when possible",
      ],
      todayActions: actions.slice(0, 3),
      sevenDayPlan: actions,
      thirtyDayPlan: ["Review what changed and update your plan using real amounts you are comfortable sharing."],
      budgetGuide: ["Use ranges rather than exact targets when income changes."],
      risks: ["Unexpected costs may affect this plan."],
      followUpQuestions: ["Which essential cost is most urgent this week?"],
      relatedFeatures: ["schemes", "health"],
      disclaimer,
    },
    ...base,
  };
}
