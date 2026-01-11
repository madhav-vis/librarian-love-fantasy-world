import fs from "fs";
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
        maxOutputTokens: 10000,
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

export const QUIZ_USER_PROMPT_TEMPLATE = (chunks: string[], pageNumber?: number) => {
  const pageContext = pageNumber ? ` (from page ${pageNumber} of the book)` : '';
  
  // Build the prompt with 5 different chunks
  const chunksText = chunks.map((chunk, index) => 
    `--- Chunk ${index + 1} ---\n${chunk}\n`
  ).join('\n');
  
  return `Generate 5 quiz questions from the following text passages${pageContext}. 

IMPORTANT: 
- Generate ONE question from EACH passage (Question 1 from Passage 1, Question 2 from Passage 2, etc.)
- Each question and ALL answer choices MUST be grounded ONLY in its corresponding passage
- Do not mix information between passages
- Do not use any information not explicitly stated in the passages
- Write questions as normal quiz questions - DO NOT mention "Chunk", "Passage", or any internal references in the questions or choices
- Questions should read naturally without referencing which passage they came from

Text Passages:
"""
${chunksText}
"""

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Your quiz question based on the first passage only - write it as a normal quiz question",
      "choices": [
        {
          "text": "Choice 1 text - must be based on content from the first passage",
          "isCorrect": true,
          "feedback": "Feedback explaining why this is correct"
        },
        {
          "text": "Choice 2 text - must be based on content from the first passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 3 text - must be based on content from the first passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 4 text - must be based on content from the first passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        }
      ]
    },
    {
      "question": "Your quiz question based on the second passage only - write it as a normal quiz question",
      "choices": [
        {
          "text": "Choice 1 text - must be based on content from the corresponding passage",
          "isCorrect": true,
          "feedback": "Feedback explaining why this is correct"
        },
        {
          "text": "Choice 2 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 3 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 4 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        }
      ]
    },
    {
      "question": "Your quiz question based on the third passage only - write it as a normal quiz question",
      "choices": [
        {
          "text": "Choice 1 text - must be based on content from the corresponding passage",
          "isCorrect": true,
          "feedback": "Feedback explaining why this is correct"
        },
        {
          "text": "Choice 2 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 3 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 4 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        }
      ]
    },
    {
      "question": "Your quiz question based on the fourth passage only - write it as a normal quiz question",
      "choices": [
        {
          "text": "Choice 1 text - must be based on content from the corresponding passage",
          "isCorrect": true,
          "feedback": "Feedback explaining why this is correct"
        },
        {
          "text": "Choice 2 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 3 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 4 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        }
      ]
    },
    {
      "question": "Your quiz question based on the fifth passage only - write it as a normal quiz question",
      "choices": [
        {
          "text": "Choice 1 text - must be based on content from the corresponding passage",
          "isCorrect": true,
          "feedback": "Feedback explaining why this is correct"
        },
        {
          "text": "Choice 2 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 3 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        },
        {
          "text": "Choice 4 text - must be based on content from the corresponding passage",
          "isCorrect": false,
          "feedback": "Feedback explaining why this is incorrect"
        }
      ]
    }
  ],
  "summary": "Brief 1-2 sentence summary covering all passages"
}

Requirements:
- Provide exactly 5 questions in the "questions" array
- Question 1 MUST be from Passage 1 only
- Question 2 MUST be from Passage 2 only
- Question 3 MUST be from Passage 3 only
- Question 4 MUST be from Passage 4 only
- Question 5 MUST be from Passage 5 only
- Each question must have exactly 4 choices
- Only ONE choice per question should have isCorrect: true
- ALL choices must be answerable/verifiable using ONLY the corresponding passage
- Do NOT mix information between passages
- Make questions test comprehension of main ideas, not trivia
- Keep choices concise (1-2 sentences max)
- Provide constructive feedback that references specific details from the passage
- Do NOT add information not in the passages
- Write questions naturally - DO NOT include phrases like "According to Chunk X" or "from Passage Y" in the actual question text`;
};

export function parseLLMResponse(response: string): any {

  // dump to a file 
  fs.writeFileSync("llm_response.txt", response.trim());

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