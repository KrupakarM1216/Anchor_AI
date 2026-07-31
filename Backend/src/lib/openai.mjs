import OpenAI from "openai";

// Initialize OpenAI client (lazy — only created when first called)
let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    _client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }
  return _client;
}

/**
 * Call OpenAI API for ANCHOR AI responses.
 * @param {string} systemPrompt - Instructions for AI behavior
 * @param {string} userInput - User's financial situation description
 * @param {number} [maxTokens=1500] - Maximum response length
 * @returns {Promise<string>} AI response text
 */
export async function callAnchorAI(systemPrompt, userInput, maxTokens = 1500) {
  const client = getClient();

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Empty response from OpenAI");
    }

    return aiResponse;
  } catch (error) {
    console.error("OpenAI API Error:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    if (error.code === "insufficient_quota") {
      throw new Error("AI service quota exceeded. Please try again later.");
    }

    throw new Error("Failed to generate AI response. Please try again.");
  }
}
