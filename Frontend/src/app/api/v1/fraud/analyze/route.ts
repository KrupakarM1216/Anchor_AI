import { NextResponse } from "next/server";
import { z } from "zod";
import { createGuidedFraudAssessment, type FraudAssessment } from "@/lib/fraud";
import { analyzeWithAI } from "@/lib/openai";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  input: z.string().trim().min(3, "Please add a little more detail so I can check it.").max(5000, "Keep the message under 5,000 characters."),
  language: z.enum(["en", "hi"]).default("en"),
});

const SYSTEM_PROMPT = `You are ANCHOR Fraud Shield, a careful Indian cyber-safety assistant. Analyse a message or offer and reply ONLY with JSON.
Use this exact schema: {"riskLevel":"safe|low|medium|high|critical","verdict":"string","confidence":"low|medium|high","scamType":"string","redFlags":[{"flag":"exact phrase or behaviour","why":"plain-language explanation","rule":"optional"}],"greenFlags":["string"],"whatWouldHappen":{"narrative":"string","estimatedLoss":"string"},"doNow":["string"],"reportTo":[{"channel":"string","how":"string"}],"shareWarning":"string","relatedFeatures":["string"]}.
Be direct and respectful. Never claim certainty about a sender's identity. For high risk, tell the user not to pay, install an APK, or share an OTP. Include 1930 and cybercrime.gov.in where reporting is relevant.`;

function isAssessment(value: unknown): value is FraudAssessment {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<FraudAssessment>;
  return ["safe", "low", "medium", "high", "critical"].includes(data.riskLevel ?? "")
    && typeof data.verdict === "string"
    && Array.isArray(data.redFlags)
    && Array.isArray(data.doNow);
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 422 });
    }

    const { input } = parsed.data;
    try {
      const assessment = await analyzeWithAI(SYSTEM_PROMPT, input);
      if (isAssessment(assessment)) return NextResponse.json({ data: { ...assessment, mode: "live" } }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error("Fraud AI unavailable; returning guided assessment.", error instanceof Error ? error.message : "Unknown error");
    }

    return NextResponse.json({ data: createGuidedFraudAssessment(input) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Please send a valid message to scan." }, { status: 400 });
  }
}
