import { NextRequest, NextResponse } from "next/server";
import type { LifelineFormData, LifelineResult } from "@/types/lifeline";

const RURAL_ONLY_SCHEME = /mgnrega|national rural livelihood|day[-\s]?nrlm|pmay[-\s]?g|gramin/i;
const OFFICIAL_URL = /^https:\/\/([a-z0-9-]+\.)*(gov\.in|nic\.in)(\/|$)/i;

const CRISIS_LABELS: Record<string, string> = {
  job_loss: "Lost job or sudden income drop",
  medical_emergency: "Medical emergency in family",
  housing_crisis: "Housing crisis or eviction threat",
  debt_trap: "Trapped in debt or loan harassment",
  utility_disconnection: "Utility disconnection crisis",
};

function buildPrompt(data: LifelineFormData): string {
  const crisisLabel = CRISIS_LABELS[data.crisisType] || data.crisisType;
  return `You are Lifeline, the crisis response engine inside ANCHOR, a free AI life manager for ordinary earners in Indian cities. A real person in crisis needs calm, accurate, immediate help.

THEIR SITUATION
Crisis type: ${crisisLabel}
What happened: ${data.description}
Monthly income: ₹${data.monthlyIncome}
City: ${data.city}
State: ${data.state}
Family size: ${data.familySize || "not specified"}
Earner type: ${data.earnerType}

Generate a complete personalised response combining: (1) a precise crisis plan for now, this week, and this month; (2) real national government support relevant to this person; and (3) real ${data.state} state-government support that may be relevant.

CRITICAL RULES
- Use only real, currently active Indian central or state government schemes. Never invent a scheme, benefit, eligibility criterion, URL, helpline, or rupee value. If uncertain, omit it.
- Every applyUrl must be a real official government URL (for example beneficiary.nha.gov.in, eshram.gov.in, epfindia.gov.in, pmvishwakarma.gov.in, pmsvanidhi.mohua.gov.in, pmayg.nic.in, mudra.org.in).
- Use only real helplines. Useful verified numbers include: National Cyber Crime 1930, Labour Helpline 1800 180 5412, Legal Aid 15100, EPFO 1800 118 005, Banking Ombudsman 14448, Consumer Helpline 1915.
- Personalise every action and scheme to this income, city, crisis type, family situation and earner type. Do not give generic advice.
- Return nationalSchemes for central-government programmes only. Return stateSchemes for programmes funded or run by the ${data.state} state government only. Do not mix the two lists.
- Include at least 3 next24Hours actions, 3 thisWeek actions, 2 thisMonth actions, exactly 3 doNotDo items, and at least 3 helplines. Include schemes only when they are plausibly relevant from the facts provided; an empty array is better than an unsupported suggestion.
- Do not calculate, estimate, or add monetary values. Schemes often provide non-cash support, have different benefit periods, or need facts we have not collected. Set valuePerYear to 0 and valueDisplay to "Eligibility check required" for every scheme.
- Do not use Markdown in any field. In particular, howToApply must be plain text; the official application URL belongs only in applyUrl.
- The openingMessage must be warm and specific; never start it with "I understand" or "I'm sorry".
- Return JSON only: no markdown fences or surrounding prose.

Return this exact JSON shape:
{
  "urgencyLevel":"critical|high|moderate",
  "openingMessage":"string",
  "next24Hours":[{"action":"string","why":"string","how":"string"}],
  "thisWeek":[{"action":"string","why":"string","how":"string"}],
  "thisMonth":[{"action":"string","why":"string","how":"string"}],
  "nationalSchemes":[{"name":"string","ministry":"string","benefit":"string","valuePerYear":0,"valueDisplay":"Eligibility check required","eligibility":"string","howToApply":"string","applyUrl":"https://official-url","timeToAccess":"string"}],
  "stateSchemes":[{"name":"string","ministry":"string","benefit":"string","valuePerYear":0,"valueDisplay":"Eligibility check required","eligibility":"string","howToApply":"string","applyUrl":"https://official-url","timeToAccess":"string"}],
  "stateName":"${data.state}",
  "totalSupportAvailable":0,
  "totalSupportDisplay":"₹0",
  "doNotDo":["string","string","string"],
  "helplines":[{"name":"string","number":"string","available":"string","useFor":"string"}],
  "oneActionNow":"string"
}`;
}

function isCompleteResult(value: unknown): value is LifelineResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<LifelineResult>;
  return Boolean(
    result.urgencyLevel && result.openingMessage && result.oneActionNow &&
      Array.isArray(result.next24Hours) && Array.isArray(result.thisWeek) &&
      Array.isArray(result.thisMonth) && Array.isArray(result.nationalSchemes) &&
      Array.isArray(result.stateSchemes) && typeof result.stateName === "string" &&
      Array.isArray(result.doNotDo) && Array.isArray(result.helplines),
  );
}

/**
 * The model may suggest useful routes, but it cannot establish legal eligibility.
 * Keep only official links and remove any unsupported money total before the UI sees it.
 */
function makeConservativeResult(result: LifelineResult, form: LifelineFormData): LifelineResult {
  const context = `${form.city} ${form.description}`.toLowerCase();
  const explicitlyRural = /\brural\b|\bvillage\b|\bgram panchayat\b/.test(context);
  const normaliseSchemes = (schemes: LifelineResult["nationalSchemes"]) => schemes
    .filter((scheme) => OFFICIAL_URL.test(scheme.applyUrl))
    .filter((scheme) => explicitlyRural || !RURAL_ONLY_SCHEME.test(scheme.name))
    .slice(0, 6)
    .map((scheme) => ({
      ...scheme,
      valuePerYear: 0,
      valueDisplay: "Eligibility check required",
      benefit: scheme.benefit.replace(/\[[^\]]+\]\([^)]*\)/g, "").trim(),
      howToApply: scheme.howToApply.replace(/\[[^\]]+\]\([^)]*\)/g, "").trim(),
    }));

  return {
    ...result,
    nationalSchemes: normaliseSchemes(result.nationalSchemes),
    stateSchemes: normaliseSchemes(result.stateSchemes),
    stateName: form.state,
    totalSupportAvailable: 0,
    totalSupportDisplay: "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LifelineFormData;
    const { crisisType, description, monthlyIncome, city, state, earnerType } = body;

    if (!crisisType || !description || !monthlyIncome || !city || !state || !earnerType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    if (description.trim().length < 20) {
      return NextResponse.json({ success: false, error: "Description too short — minimum 20 characters" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured.");
      return NextResponse.json({ success: false, error: "Lifeline is not configured yet. Please try again later." }, { status: 503 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
        max_tokens: 2500,
        messages: [{ role: "user", content: buildPrompt(body) }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("Groq request failed:", response.status, await response.text());
      return NextResponse.json({ success: false, error: "AI service is unavailable. Please try again." }, { status: 502 });
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const rawText = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let result: unknown;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("Lifeline JSON parse failed. Raw output:", rawText);
      return NextResponse.json({ success: false, error: "AI response could not be parsed." }, { status: 500 });
    }

    if (!isCompleteResult(result)) {
      return NextResponse.json({ success: false, error: "Incomplete AI response. Please retry." }, { status: 500 });
    }
    return NextResponse.json({ success: true, result: makeConservativeResult(result, body) });
  } catch (error) {
    console.error("Lifeline API error:", error);
    return NextResponse.json({ success: false, error: "Server error. Please try again." }, { status: 500 });
  }
}
