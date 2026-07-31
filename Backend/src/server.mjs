import { createServer } from "node:http";
import { z } from "zod";
import { hasSensitiveValue, makeDemo } from "./lib/demo.mjs";
import { callAnchorAI } from "./lib/openai.mjs";
import { PLANNER_SYSTEM_PROMPT } from "./lib/prompts/planner.mjs";
import { matchSchemes } from "./lib/matching/schemes.mjs";
import { buildSchemePrompt } from "./lib/prompts/schemes.mjs";
import { FRAUD_SYSTEM_PROMPT } from "./lib/prompts/fraud.mjs";
import { HEALTH_SYSTEM_PROMPT } from "./lib/prompts/health.mjs";

const port = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const MAX_BODY = 32 * 1024; // 32 KB
const AI_ENABLED = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const PlannerSchema = z.object({
  input: z.string().min(3, "Please describe your situation (at least 3 characters)").max(3000, "Description is too long (max 3000 characters)").optional(),
  situation: z.string().min(3).max(4000).optional(),
  earnerType: z.enum(["daily-wage", "freelancer", "retiree", "student", "joint-family", "unspecified"]).optional().default("unspecified"),
  language: z.enum(["en", "hi"]).optional().default("en"),
  incomeCadence: z.string().optional(),
}).refine(data => (data.input && data.input.trim()) || (data.situation && data.situation.trim()), {
  message: "Please describe your situation.",
});

const SchemesSchema = z.object({
  age: z.number().min(1, "Age must be at least 1"),
  income: z.number().min(0, "Income cannot be negative"),
  occupation: z.string().min(1, "Occupation is required"),
  ownsPuccaHouse: z.boolean(),
  locale: z.string().optional(),
});

const FraudSchema = z.object({
  input: z
    .string()
    .min(3, "Paste the message or describe the offer (at least 3 characters)")
    .max(5000, "Input is too long (max 5000 characters)"),
  language: z.enum(["en", "hi"]).optional().default("en"),
});

const RightsSchema = z.object({
  situation: z.string().min(20, "Please describe the situation (at least 20 characters)").max(5000),
  state: z.string().min(1, "State is required"),
  topic: z.string().optional(),
  locale: z.string().optional(),
});

const CrisisSchema = z.object({
  type: z.enum(["income_drop", "medical", "housing", "debt_trap", "utilities"]),
  immediateDanger: z.string().optional(),
  state: z.string().optional(),
  description: z.string().max(2000).optional(),
  locale: z.string().optional(),
});

const HealthSchema = z.object({
  answers: z.record(z.string()),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "X-Content-Type-Options": "nosniff",
  };
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...corsHeaders(),
  });
  res.end(payload);
}

function errorResponse(res, status, code, message, retryable = false) {
  json(res, status, {
    error: { code, message, requestId: crypto.randomUUID(), retryable },
  });
}

/** Read and parse JSON body with size limit. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        req.destroy();
        reject({ status: 413, code: "INPUT_TOO_LARGE", message: "Request body exceeds 32 KB limit." });
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject({ status: 400, code: "VALIDATION_ERROR", message: "Send a valid JSON request." });
      }
    });
    req.on("error", () => reject({ status: 500, code: "INTERNAL_ERROR", message: "Request read failed." }));
  });
}

// ─── Planner Handler (AI + Demo fallback) ─────────────────────────────────────

async function handlePlanner(req, res) {
  try {
    const body = await readBody(req);
    const validation = PlannerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(res, 422, "VALIDATION_ERROR", validation.error.errors[0].message);
    }

    const { input, situation, earnerType, language } = validation.data;
    const userText = (input || situation || "").trim();

    // Sensitive value check
    if (hasSensitiveValue(userText)) {
      return errorResponse(res, 422, "SENSITIVE_INPUT", "Remove OTPs, PINs, passwords, account or identity numbers before continuing.");
    }

    // Try AI if API key is available
    if (AI_ENABLED) {
      try {
        const systemPrompt = PLANNER_SYSTEM_PROMPT
          .replace("{{earnerType}}", earnerType)
          .replace("{{language}}", language)
          .replace("{{userInput}}", userText);

        const aiResponse = await callAnchorAI(systemPrompt, userText, 1500);

        // Parse JSON response
        const cleanResponse = aiResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const planData = JSON.parse(cleanResponse);

        return json(res, 200, {
          ...planData,
          meta: {
            requestId: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
            locale: `${language}-IN`,
            mode: "live",
            confidence: "high",
            evidenceIds: [],
          },
        });
      } catch (aiError) {
        console.error("AI planner error:", aiError.message);
        return errorResponse(res, 500, "AI_ERROR", aiError.message);
      }
    }

    // Demo fallback (only used if AI is not enabled)
    json(res, 200, makeDemo("planner", { ...body, situation: userText }));
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return errorResponse(res, err.status, err.code, err.message);
    }
    console.error("Planner error:", err);
    errorResponse(res, 500, "INTERNAL_ERROR", "Something went wrong reading your situation. Please try again.");
  }
}

async function handleSchemesMatch(req, res) {
  try {
    const body = await readBody(req);
    const validation = SchemesSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(res, 422, "VALIDATION_ERROR", validation.error.errors[0].message);
    }

    const userProfile = validation.data;
    const matches = matchSchemes(userProfile);

    if (AI_ENABLED) {
      try {
        const prompt = buildSchemePrompt(userProfile, matches);
        const aiResponse = await callAnchorAI(prompt, JSON.stringify(userProfile), 1000);
        
        const cleanResponse = aiResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const explanationData = JSON.parse(cleanResponse);

        return json(res, 200, {
          matches,
          explanation: explanationData.explanationMarkdown,
          nextStep: explanationData.recommendedNextStep,
          meta: {
            requestId: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
            mode: "live"
          }
        });
      } catch (aiError) {
        console.error("AI schemes error:", aiError.message);
        return errorResponse(res, 500, "AI_ERROR", aiError.message);
      }
    }

    // Demo fallback if AI is off
    json(res, 200, {
      matches,
      explanation: "This is a demo response because AI is disabled.",
      nextStep: "Enable AI to get personalized advice.",
      meta: { mode: "demo" }
    });

  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return errorResponse(res, err.status, err.code, err.message);
    }
    console.error("Schemes error:", err);
    errorResponse(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}

async function handleFraudAnalyze(req, res) {
  try {
    const body = await readBody(req);
    const validation = FraudSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(res, 422, "VALIDATION_ERROR", validation.error.errors[0].message);
    }

    const { input, language } = validation.data;

    if (AI_ENABLED) {
      try {
        const systemPrompt = FRAUD_SYSTEM_PROMPT.replace('{language}', language).replace(
          '{userInput}',
          input
        );
        const aiResponse = await callAnchorAI(systemPrompt, input, 2000);
        
        let fraudData;
        try {
          const cleanResponse = aiResponse
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          fraudData = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          return errorResponse(res, 500, "AI_ERROR", "AI returned invalid format");
        }

        return json(res, 200, fraudData);
      } catch (aiError) {
        console.error("AI fraud error:", aiError.message);
        return errorResponse(res, 500, "AI_ERROR", aiError.message);
      }
    }

    // Demo fallback if AI is off
    json(res, 200, makeDemo("fraud", validation.data));
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return errorResponse(res, err.status, err.code, err.message);
    }
    console.error("Fraud error:", err);
    errorResponse(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}

async function handleHealthScore(req, res) {
  try {
    const body = await readBody(req);
    const validation = HealthSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(res, 422, "VALIDATION_ERROR", validation.error.errors[0].message);
    }

    const { answers } = validation.data;

    if (AI_ENABLED) {
      try {
        const answersText = Object.entries(answers)
          .map(([question, answer]) => `${question}: ${answer}`)
          .join('\n');

        const systemPrompt = HEALTH_SYSTEM_PROMPT.replace('{answersText}', answersText);
        
        // We pass the stringified answers as the user input, or just a dummy string if prompt is all we need.
        const aiResponse = await callAnchorAI(systemPrompt, "Please analyze my answers.", 2000);
        
        let healthData;
        try {
          const cleanResponse = aiResponse
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          healthData = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          return errorResponse(res, 500, "AI_ERROR", "AI returned invalid format");
        }

        return json(res, 200, healthData);
      } catch (aiError) {
        console.error("AI health error:", aiError.message);
        return errorResponse(res, 500, "AI_ERROR", aiError.message);
      }
    }

    // Demo fallback if AI is off
    json(res, 200, makeDemo("health", validation.data));
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return errorResponse(res, err.status, err.code, err.message);
    }
    console.error("Health Score error:", err);
    errorResponse(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}

// ─── Generic demo feature handler (for non-planner features) ──────────────────

async function handleFeature(req, res, feature, schema) {
  try {
    const body = await readBody(req);
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return errorResponse(res, 422, "VALIDATION_ERROR", validation.error.errors[0].message);
    }

    // Sensitive value check on narrative fields
    const narrative = String(body.text ?? body.situation ?? body.description ?? "");
    if (narrative && hasSensitiveValue(narrative)) {
      return errorResponse(res, 422, "SENSITIVE_INPUT", "Remove OTPs, PINs, passwords, account or identity numbers before continuing.");
    }

    json(res, 200, makeDemo(feature, validation.data));
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return errorResponse(res, err.status, err.code, err.message);
    }
    console.error(`${feature} error:`, err);
    errorResponse(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}

// ─── Route table ──────────────────────────────────────────────────────────────

const routes = {
  "POST /api/v1/planner":        (req, res) => handlePlanner(req, res),
  "POST /api/v1/schemes/match":  (req, res) => handleSchemesMatch(req, res),
  "POST /api/v1/fraud/analyze":  (req, res) => handleFraudAnalyze(req, res),
  "POST /api/v1/rights/analyze": (req, res) => handleFeature(req, res, "rights", RightsSchema),
  "POST /api/v1/crisis/navigate":(req, res) => handleFeature(req, res, "crisis", CrisisSchema),
  "POST /api/v1/health/score":   (req, res) => handleHealthScore(req, res),
};

// ─── Server ───────────────────────────────────────────────────────────────────

const server = createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { status: "ok", service: "anchor-backend", aiEnabled: !!AI_ENABLED });
  }

  // Match route
  const routeKey = `${req.method} ${req.url}`;
  const handler = routes[routeKey];
  if (handler) {
    return handler(req, res);
  }

  // 404 fallback
  errorResponse(res, 404, "NOT_FOUND", `No handler for ${req.method} ${req.url}.`);
});

server.listen(port, () => {
  console.log(`ANCHOR backend listening on http://localhost:${port}`);
  console.log(`AI mode: ${AI_ENABLED ? "LIVE (OpenAI)" : "DEMO (no API key)"}`);
  console.log(`Routes:`);
  console.log(`  GET  /health`);
  Object.keys(routes).forEach((r) => console.log(`  ${r}`));
});
