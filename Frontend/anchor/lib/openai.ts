import "server-only";
import OpenAI from "openai";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  return new OpenAI({ 
    apiKey,
    baseURL: "https://api.groq.com/openai/v1" 
  });
}

/**
 * Calls OpenAI for ANCHOR's structured AI responses.
 * This module is server-only: never import it from a client component.
 */
export async function callAnchorAI(
  systemPrompt: string,
  userInput: string,
  maxTokens = 1500,
): Promise<string> {
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0]?.message?.content;
    if (!aiResponse) throw new Error("Empty response from OpenAI");

    return aiResponse;
  } catch (error: unknown) {
    const providerError = error instanceof Error ? error : new Error("Unknown OpenAI error");
    console.error("OpenAI API request failed", { name: providerError.name });
    throw new Error("Failed to generate a response. Please try again.");
  }
}
