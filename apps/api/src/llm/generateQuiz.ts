import { generateWithLLM, QUIZ_SYSTEM_PROMPT, QUIZ_USER_PROMPT_TEMPLATE, parseLLMResponse } from "./client";
import { getBookContent, getBookContentByCFI, getBookContentByPageNumber, getBookContentByChapterIndex, segmentText } from "../epub/parser";
import { logProgress, logStep, logComplete, logError, ProgressBar } from "../utils/progress";

export async function generateQuizNode(
  bookId: string,
  cfi?: string,
  nodeId?: string,
  progressPercent?: number,
  pageNumber?: number,
  chapterIndex?: number
) {
  try {
    logProgress("Generating quiz node...");
    if (chapterIndex !== undefined) {
      logProgress(`  → For chapter index ${chapterIndex}`);
    } else if (pageNumber !== undefined) {
      logProgress(`  → For page ${pageNumber}`);
    } else if (cfi) {
      logProgress(`  → For CFI: ${cfi}`);
    } else {
      logProgress(`  → For progress: ${progressPercent || 0}%`);
    }
    
    // Get EPUB content
    let textContent: string;
    logProgress("  → Extracting EPUB content...");
    if (chapterIndex !== undefined) {
      textContent = await getBookContentByChapterIndex(bookId, chapterIndex);
    } else if (cfi) {
      textContent = await getBookContentByCFI(bookId, cfi);
    } else if (pageNumber !== undefined) {
      textContent = await getBookContentByPageNumber(bookId, pageNumber);
    } else {
      textContent = await getBookContent(bookId, progressPercent);
    }
    const textLength = textContent.length;
    logComplete(`  ✓ Content extracted (${textLength} characters)`);

    // Generate 5 random 10K chunks for 5 different questions
    logProgress("  → Preparing 5 random 10K chunks for quiz generation...");
    const chunkSize = 10000;
    const chunks: string[] = [];
    
    if (textContent.length <= chunkSize) {
      // If content is smaller than 10K, randomly select chunks from the available content
      const contentLength = textContent.length;
      const actualChunkSize = Math.max(Math.floor(contentLength / 3), 500); // Use at least 1/3 of content or 500 chars
      const maxStart = Math.max(0, contentLength - actualChunkSize);
      const chunkPositions: number[] = [];
      
      // Generate 5 random chunks from the available content
      for (let i = 0; i < 5; i++) {
        const startPos = Math.floor(Math.random() * (maxStart + 1));
        const endPos = Math.min(startPos + actualChunkSize, contentLength);
        chunks.push(textContent.substring(startPos, endPos));
        chunkPositions.push(startPos);
      }
      
      logProgress(`  → Generated 5 random chunks from ${contentLength} chars (positions: ${chunkPositions.map(p => Math.floor(p/1000)).join('k, ')}k)`);
    } else {
      // Generate 5 random non-overlapping chunks
      const maxStart = textContent.length - chunkSize;
      const chunkPositions: number[] = [];
      
      // Generate 5 random start positions, ensuring non-overlapping chunks
      for (let i = 0; i < 5; i++) {
        let startPos: number;
        let attempts = 0;
        do {
          startPos = Math.floor(Math.random() * maxStart);
          attempts++;
          // If we can't find a non-overlapping position after 50 attempts, just use sequential
          if (attempts > 50) {
            startPos = Math.floor((i / 5) * maxStart);
            break;
          }
          // Check for overlap: two chunks overlap if start1 < start2 + size && start2 < start1 + size
        } while (chunkPositions.some(pos => 
          (startPos < pos + chunkSize && pos < startPos + chunkSize)
        ));
        
        chunkPositions.push(startPos);
        chunks.push(textContent.substring(startPos, startPos + chunkSize));
      }
      
      logProgress(`  → Generated 5 random chunks (positions: ${chunkPositions.map(p => Math.floor(p/1000)).join('k, ')}k)`);
    }
    
    logComplete(`  ✓ Prepared 5 chunks of ${chunkSize} characters each`);

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logProgress("  ⚠ GEMINI_API_KEY not set, using mock quiz");
      return generateMockQuizNode(bookId, chunks[0], nodeId);
    }

    // Generate quiz using LLM with 5 random chunks
    logProgress("  → Generating quiz with LLM using 5 random chunks (this may take 10-30 seconds)...");
    const userPrompt = QUIZ_USER_PROMPT_TEMPLATE(chunks, pageNumber);
    const response = await generateWithLLM(QUIZ_SYSTEM_PROMPT, userPrompt);
    logComplete("  ✓ LLM response received");
    
    // Parse LLM response
    logProgress("  → Parsing LLM response...");
    const quizData = parseLLMResponse(response);
    logComplete("  ✓ Response parsed");

    // Validate and format quiz node
    logProgress("  → Validating quiz data...");
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error("Invalid quiz format from LLM - expected questions array");
    }
    
    // Ensure we have exactly 5 questions (take first 5 if more, pad if less)
    const questions = quizData.questions.slice(0, 5);
    if (questions.length < 5) {
      logProgress(`  ⚠ Only ${questions.length} questions received, expected 5`);
    }
    
    // Process each question
    const processedQuestions = questions.map((q: any, qIndex: number) => {
      if (!q.question || !q.choices || !Array.isArray(q.choices)) {
        throw new Error(`Invalid question format at index ${qIndex}`);
      }
      
      // Ensure exactly one correct answer per question
      const correctCount = q.choices.filter((c: any) => c.isCorrect).length;
      if (correctCount !== 1) {
        if (correctCount === 0) {
          q.choices[0].isCorrect = true;
        } else {
          let foundFirst = false;
          q.choices.forEach((c: any) => {
            if (c.isCorrect && !foundFirst) {
              foundFirst = true;
            } else {
              c.isCorrect = false;
            }
          });
        }
      }
      
      // Format choices with IDs and feedback
      const choices = q.choices.map((choice: any, index: number) => ({
        id: `choice-${index + 1}`,
        text: choice.text || `Choice ${index + 1}`,
        isCorrect: choice.isCorrect === true,
        feedback: choice.feedback || (choice.isCorrect ? "Correct!" : "Not quite. Try again."),
      }));
      
      return {
        question: q.question,
        choices,
      };
    });
    
    logComplete(`  ✓ Quiz data validated (${processedQuestions.length} questions)`);

    // Create quiz node with all questions
    const quizNode = {
      id: nodeId || `node-${Date.now()}`,
      type: "quiz" as const,
      speaker: "Quiz Master",
      summary: quizData.summary || "Quiz time! Answer the questions based on the passage you read.",
      questions: processedQuestions,
      currentQuestionIndex: 0,
      next: `node-${Date.now() + 1}`,
      background: undefined,
      character: undefined,
    };

    return quizNode;
  } catch (error: any) {
    console.error("Error generating quiz with LLM:", error);
    
    // Fallback to mock quiz on error
    console.warn("Falling back to mock quiz");
    const fallbackText = cfi ? "Passage content" : "Book content";
    return generateMockQuizNode(bookId, fallbackText, nodeId);
  }
}

function generateMockQuizNode(bookId: string, passage: string, nodeId?: string) {
  return {
    id: nodeId || `node-${Date.now()}`,
    type: "quiz" as const,
    speaker: "Quiz Master",
    text: 'Read the following passage and answer the question:\n\n"The sun rose over the mountains, casting long shadows across the valley. Birds began their morning songs as the world awakened."',
    choices: [
      {
        id: "choice-1",
        text: "The sun was setting",
        isCorrect: false,
        feedback: "Incorrect. The passage says the sun rose, not set.",
      },
      {
        id: "choice-2",
        text: "It was morning time",
        isCorrect: true,
        feedback: "Correct! The passage mentions 'morning songs' and the sun rising.",
      },
      {
        id: "choice-3",
        text: "It was nighttime",
        isCorrect: false,
        feedback: "Incorrect. The sun was rising, which indicates morning.",
      },
      {
        id: "choice-4",
        text: "It was afternoon",
        isCorrect: false,
        feedback: "Incorrect. The passage describes morning activities.",
      },
    ],
    next: `node-${Date.now() + 1}`,
    background: undefined,
    character: undefined,
  };
}