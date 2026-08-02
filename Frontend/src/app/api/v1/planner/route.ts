import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSensitiveValue } from "@/lib/demo";

const requestSchema = z.object({
  situation: z.string().trim().min(3).max(3000),
  earnerType: z.string().trim().max(100).optional().default("unspecified"),
  language: z.literal("en").optional(),
});

const actionSchema = z.object({ title: z.string().min(4).max(120), detail: z.string().min(10).max(280) });
const planSchema = z.object({
  summary: z.string().min(20).max(320), priority: z.string().min(8).max(160),
  todayActions: z.array(actionSchema).min(2).max(4), sevenDayPlan: z.array(actionSchema).min(2).max(4), thirtyDayPlan: z.array(actionSchema).min(2).max(4),
  watchOuts: z.array(z.string().min(8).max(180)).min(1).max(3), followUpQuestions: z.array(z.string().min(8).max(180)).min(1).max(3), relatedFeatures: z.array(z.enum(["lifeline", "health", "fraud", "rights"])).max(3),
});

function prompt(situation: string, earnerType: string) {
  return `You are the Smart Life Planner in ANCHOR, helping an Indian earner organise a financial situation into a calm, practical plan.

Situation: ${situation}
Earner type: ${earnerType}

Create an action plan that is specific to this situation. Do not give investment, legal, medical, or emergency advice. Do not invent government benefits or exact figures. Do not request or repeat sensitive information.

The time horizons must be distinct with NO repeated actions:
- TODAY: immediate stabilisation, essential bills, safety, or information to collect.
- THIS WEEK: conversations, applications, budget changes, documents, and follow-through.
- THIS MONTH: review outcomes, rebuild stability, and longer-term next steps.

Return JSON only with this exact shape:
{
  "summary":"one concise assessment",
  "priority":"the single most important next action",
  "todayActions":[{"title":"action title","detail":"specific next step and why"}],
  "sevenDayPlan":[{"title":"action title","detail":"specific next step and why"}],
  "thirtyDayPlan":[{"title":"action title","detail":"specific next step and why"}],
  "watchOuts":["specific risk to avoid"],
  "followUpQuestions":["one useful question to consider"],
  "relatedFeatures":["lifeline"]
}`;
}

function uniqueActions<T extends { title: string }>(actions: T[], used: Set<string>) {
  return actions.filter((action) => {
    const key = action.title.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (used.has(key)) return false;
    used.add(key);
    return true;
  });
}

function asActions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string") return { title: item, detail: "Complete this step based on your current situation." };
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    return { title: String(record.title ?? record.action ?? ""), detail: String(record.detail ?? record.why ?? record.how ?? "") };
  }).filter((item): item is { title: string; detail: string } => Boolean(item?.title && item.detail));
}

function asTextList(value: unknown) { return Array.isArray(value) ? value.map(String).filter((item) => item.length >= 8) : []; }

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { message: "Describe your situation in a little more detail." } }, { status: 422 });
    if (hasSensitiveValue(parsed.data.situation)) return NextResponse.json({ error: { message: "Remove account, identity, OTP, PIN, or password details before continuing." } }, { status: 422 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: { message: "AI planning is not configured. Add the server API key and try again." } }, { status: 503 });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "llama-3.1-8b-instant", temperature: 0.35, max_tokens: 1600, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt(parsed.data.situation, parsed.data.earnerType) }] }),
    });
    if (!response.ok) return NextResponse.json({ error: { message: "The AI planning service is temporarily unavailable. Please try again." } }, { status: 502 });

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content ?? "";
    const rawPlan = JSON.parse(content.replace(/```json\s*|```/g, "").trim()) as Record<string, unknown>;
    const plan = planSchema.safeParse({
      summary: String(rawPlan.summary ?? ""), priority: String(rawPlan.priority ?? rawPlan.oneActionNow ?? ""),
      todayActions: asActions(rawPlan.todayActions), sevenDayPlan: asActions(rawPlan.sevenDayPlan ?? rawPlan.thisWeek), thirtyDayPlan: asActions(rawPlan.thirtyDayPlan ?? rawPlan.thisMonth),
      watchOuts: asTextList(rawPlan.watchOuts ?? rawPlan.risks), followUpQuestions: asTextList(rawPlan.followUpQuestions),
      relatedFeatures: Array.isArray(rawPlan.relatedFeatures) ? rawPlan.relatedFeatures.filter((feature): feature is "lifeline" | "health" | "fraud" | "rights" => typeof feature === "string" && ["lifeline", "health", "fraud", "rights"].includes(feature)) : [],
    });
    if (!plan.success) return NextResponse.json({ error: { message: "The AI returned an incomplete plan. Please try again." } }, { status: 502 });

    const used = new Set<string>();
    const data = {
      ...plan.data,
      todayActions: uniqueActions(plan.data.todayActions, used),
      sevenDayPlan: uniqueActions(plan.data.sevenDayPlan, used),
      thirtyDayPlan: uniqueActions(plan.data.thirtyDayPlan, used),
    };
    if (data.todayActions.length < 2 || data.sevenDayPlan.length < 2 || data.thirtyDayPlan.length < 2) return NextResponse.json({ error: { message: "The AI plan repeated actions. Please try again for a distinct plan." } }, { status: 502 });
    return NextResponse.json({ data, meta: { mode: "ai", generatedAt: new Date().toISOString() } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Planner API error:", error);
    return NextResponse.json({ error: { message: "We could not create your plan. Please try again." } }, { status: 500 });
  }
}
