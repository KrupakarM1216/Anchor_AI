import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  loanAmount: z.number(),
  processingFeeAmount: z.number(),
  totalCost: z.number(),
  emiToIncomeRatio: z.number(),
  debtPressureLevel: z.string(),
  purpose: z.string(),
  warnings: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
    })
  ),
});

const responseSchema = z.object({
  humanSummary: z.string(),
  detailedAnalysis: z.string(),
  negotiationTactics: z.array(z.string()),
  alternatives: z.array(z.string()),
});

function prompt(data: z.infer<typeof requestSchema>) {
  return `You are a financial safety advisor. A user is considering a loan and we ran a deterministic math check on it.
Here are the results:
- Loan Amount: ₹${data.loanAmount}
- Total Cost (including interest and fees): ₹${data.totalCost}
- EMI to Income Ratio: ${(data.emiToIncomeRatio * 100).toFixed(0)}%
- Debt Pressure Level: ${data.debtPressureLevel}
- Loan Purpose: ${data.purpose}
- Red Flag Warnings: ${
    data.warnings.length > 0
      ? data.warnings.map((w) => w.code + " - " + w.message).join(" | ")
      : "None"
  }

Please provide:
1. "humanSummary": A short, empathetic, professional 1-2 sentence summary of this loan's safety (do not use massive headings). 
2. "detailedAnalysis": A thorough, 1-2 paragraph professional analysis of the loan data, explaining the risks, the true cost implications, and what the user should watch out for based on the data provided.
3. "negotiationTactics": 2-3 specific things the user can say to the lender to get a better deal (e.g. "Ask to waive the processing fee since...").
4. "alternatives": 1-2 alternative ways to fund a '${data.purpose}' need instead of this loan.

Return JSON strictly matching this shape:
{
  "humanSummary": "string",
  "detailedAnalysis": "string",
  "negotiationTactics": ["string"],
  "alternatives": ["string"]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid request payload." } }, { status: 422 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: { message: "AI advisor is not configured. Add the server API key and try again." } }, { status: 503 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
        temperature: 0.35,
        max_tokens: 1000,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt(parsed.data) }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: { message: "The AI advisor is temporarily unavailable." } }, { status: 502 });
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content ?? "";
    const rawResult = JSON.parse(content.replace(/```json\s*|```/g, "").trim());

    const result = responseSchema.safeParse({
      humanSummary: String(rawResult.humanSummary ?? ""),
      detailedAnalysis: String(rawResult.detailedAnalysis ?? ""),
      negotiationTactics: Array.isArray(rawResult.negotiationTactics) ? rawResult.negotiationTactics.map(String) : [],
      alternatives: Array.isArray(rawResult.alternatives) ? rawResult.alternatives.map(String) : [],
    });

    if (!result.success) {
      return NextResponse.json({ error: { message: "The AI returned an incomplete response." } }, { status: 502 });
    }

    return NextResponse.json({ data: result.data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Borrowing AI API error:", error);
    return NextResponse.json({ error: { message: "We could not analyze this loan. Please try again." } }, { status: 500 });
  }
}
