import { NextRequest, NextResponse } from "next/server";
import { Feature, hasSensitiveValue, makeDemo } from "@/lib/demo";

/** Server-only validation and response adapter for all demo API routes. */
export async function demoRoute(request: NextRequest, feature: Feature, required: string[]) {
  try {
    const body = await request.json() as Record<string, unknown>;
    for (const key of required) if (!String(body[key] ?? "").trim()) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Please complete the required field.", requestId: crypto.randomUUID(), retryable: false } }, { status: 422, headers: { "Cache-Control": "no-store" } });
    const narrative = String(body.text ?? body.situation ?? body.description ?? "");
    if (hasSensitiveValue(narrative)) return NextResponse.json({ error: { code: "SENSITIVE_INPUT", message: "Remove OTPs, PINs, passwords, account or identity numbers before continuing.", requestId: crypto.randomUUID(), retryable: false } }, { status: 422, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(makeDemo(feature, body), { headers: { "Cache-Control": "no-store", "Content-Type": "application/json" } });
  } catch { return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Send a valid JSON request.", requestId: crypto.randomUUID(), retryable: false } }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
}
