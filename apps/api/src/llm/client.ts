// Lazy import to avoid errors when package is not installed
let GoogleGenerativeAI: any = null;

async function loadGeminiModule() {
  if (!GoogleGenerativeAI) {
    try {
      const module = await import("@google/generative-ai");
      GoogleGenerativeAI = module.GoogleGenerativeAI;
    } catch (error) {
      throw new Error(
        "@google/generative-ai package not installed. Run 'npm install' in apps/api directory."
      );
    }
  }
  return GoogleGenerativeAI;
}

// Initialize Gemini client
let geminiClient: any = null;

async function getClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY not found in environment variables. Please add it to your .env file."
      );
    }
    const GeminiClass = await loadGeminiModule();
    geminiClient = new GeminiClass(apiKey);
  }
  return geminiClient;
}

export async function generateWithLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const client = await getClient();
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    const model = client.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No response from Gemini API");
    }

    return content;
  } catch (error: any) {
    console.error("LLM API Error:", error.message);
    
    // If API key is invalid or missing, provide helpful error
    if (error.message?.includes("API_KEY") || error.message?.includes("API key") || error.message?.includes("API_KEY_INVALID")) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_api_key_here") {
        throw new Error(
          "Gemini API key not configured. Please add a valid GEMINI_API_KEY to your .env file."
        );
      } else {
        throw new Error(
          `Invalid Gemini API key. Please check:\n` +
          `1. Your API key at https://makersuite.google.com/app/apikey\n` +
          `2. Make sure the key is active and has API access enabled\n` +
          `3. Regenerate the key if needed\n` +
          `4. Restart the server after updating .env`
        );
      }
    }
    
    throw error;
  }
}

// Prompt templates for quiz generation
export const QUIZ_SYSTEM_PROMPT = `You are an educational quiz generator that creates engaging, comprehension-based questions from book passages.

CRITICAL RULES:
1. Your quiz questions MUST be directly based ONLY on the provided passage text
2. Do NOT use information from outside the passage - stay strictly within the given text
3. All choices and feedback must reference specific details from the passage
4. Test understanding, not just memorization
5. Questions should have clear, unambiguous correct answers based on the passage

Always return valid JSON only, no markdown formatting or code blocks.`;

export const QUIZ_USER_PROMPT_TEMPLATE = (text: string, pageNumber?: number) => {
  const pageContext = pageNumber ? ` (from page ${pageNumber} of the book)` : '';
  return `Generate a quiz question from the following text passage${pageContext}. 

IMPORTANT: Your question and ALL answer choices MUST be grounded ONLY in this exact passage. Do not use any information not explicitly stated in this text.

Passage Text:
"""
${text.substring(0, 2000)}
"""

Return a JSON object with this exact structure:
{
  "question": "Your quiz question here - must be answerable using ONLY the passage above",
  "choices": [
    {
      "text": "Choice 1 text - must reference content from the passage",
      "isCorrect": true,
      "feedback": "Feedback explaining why this is correct, referencing the passage"
    },
    {
      "text": "Choice 2 text - must reference content from the passage",
      "isCorrect": false,
      "feedback": "Feedback explaining why this is incorrect, referencing the passage"
    },
    {
      "text": "Choice 3 text - must reference content from the passage",
      "isCorrect": false,
      "feedback": "Feedback explaining why this is incorrect, referencing the passage"
    },
    {
      "text": "Choice 4 text - must reference content from the passage",
      "isCorrect": false,
      "feedback": "Feedback explaining why this is incorrect, referencing the passage"
    }
  ],
  "summary": "Brief 1-2 sentence summary of ONLY what is in the passage above"
}

Requirements:
- Provide exactly 4 choices
- Only ONE choice should have isCorrect: true
- ALL choices must be answerable/verifiable using ONLY the provided passage
- Make the question test comprehension of main ideas in the passage, not trivia
- Keep choices concise (1-2 sentences max)
- Provide constructive feedback that references specific details from the passage
- Do NOT add information not in the passage`;
};

export function parseLLMResponse(response: string): any {
  // Try to extract JSON from response (handle cases where LLM wraps in markdown)
  let jsonStr = response.trim();
  
  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```")) {
    const lines = jsonStr.split("\n");
    const startIndex = lines.findIndex(line => line.includes("```")) + 1;
    const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes("```"));
    jsonStr = lines.slice(startIndex, endIndex >= 0 ? endIndex : undefined).join("\n");
  }
  
  // Remove leading/trailing whitespace and newlines
  jsonStr = jsonStr.trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse LLM response:", jsonStr);
    throw new Error(`Invalid JSON response from LLM: ${error}`);
  }
}