import { demoRoute } from "@/backend/http/demo-route"; export async function POST(r: Request){ return demoRoute(r as import("next/server").NextRequest,"fraud",["text"]); }
