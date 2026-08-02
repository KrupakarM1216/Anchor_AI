import "server-only";
import OpenAI from "openai";

export async function analyzeWithAI(systemPrompt: string, userInput: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED");

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1",
  });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userInput }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("EMPTY_AI_RESPONSE");
  return JSON.parse(content) as unknown;
}
