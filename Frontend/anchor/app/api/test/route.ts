import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Safe development-only configuration check: it never reveals secret material. */
export async function GET() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "API key not loaded" }, { status: 500 });
  }

  return NextResponse.json({ status: "OK", configured: true });
}
