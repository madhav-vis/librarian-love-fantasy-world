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

    // Segment text if too long (use first segment for quiz)
    logProgress("  → Processing passage text...");
    const segments = segmentText(textContent, 1500);
    const passage = segments[0] || textContent.substring(0, 1500);
    logComplete(`  ✓ Passage prepared (${passage.length} characters, ${segments.length} segment${segments.length !== 1 ? 's' : ''})`);

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logProgress("  ⚠ GEMINI_API_KEY not set, using mock quiz");
      return generateMockQuizNode(bookId, passage, nodeId);
    }

    // Generate quiz using LLM with explicit grounding instructions
    logProgress("  → Generating quiz with LLM (this may take 10-30 seconds)...");
    const userPrompt = QUIZ_USER_PROMPT_TEMPLATE(passage, pageNumber);
    const response = await generateWithLLM(QUIZ_SYSTEM_PROMPT, userPrompt);
    logComplete("  ✓ LLM response received");
    
    // Parse LLM response
    logProgress("  → Parsing LLM response...");
    const quizData = parseLLMResponse(response);
    logComplete("  ✓ Response parsed");

    // Validate and format quiz node
    logProgress("  → Validating quiz data...");
    if (!quizData.question || !quizData.choices || !Array.isArray(quizData.choices)) {
      throw new Error("Invalid quiz format from LLM");
    }
    logComplete("  ✓ Quiz data validated");

    // Validate that the quiz is grounded in the passage
    // Check if question and choices reference the passage content
    const passageLower = passage.toLowerCase();
    const questionLower = quizData.question.toLowerCase();
    const allChoicesText = quizData.choices.map((c: any) => c.text?.toLowerCase() || "").join(" ");
    
    // Extract key words/phrases from passage (first 100 words)
    const passageWords = passageLower.split(/\s+/).slice(0, 100).filter(w => w.length > 3);
    const passageKeywords = new Set(passageWords);
    
    // Check if question or choices contain keywords from passage
    const questionHasKeywords = passageKeywords.size > 0 && Array.from(passageKeywords).some(
      keyword => questionLower.includes(keyword)
    );
    const choicesHaveKeywords = passageKeywords.size > 0 && Array.from(passageKeywords).some(
      keyword => allChoicesText.includes(keyword)
    );

    // If no keywords match, log a warning (but don't fail - LLM might use synonyms)
    if (!questionHasKeywords && !choicesHaveKeywords && passageKeywords.size > 5) {
      console.warn("Quiz may not be grounded in passage - few keywords match. Passage length:", passage.length);
    }

    // Ensure exactly one correct answer
    const correctCount = quizData.choices.filter((c: any) => c.isCorrect).length;
    if (correctCount !== 1) {
      // Fix: mark first choice as correct if none/invalid
      if (correctCount === 0) {
        quizData.choices[0].isCorrect = true;
      } else {
        // If multiple, keep only the first one as correct
        let foundFirst = false;
        quizData.choices.forEach((c: any) => {
          if (c.isCorrect && !foundFirst) {
            foundFirst = true;
          } else {
            c.isCorrect = false;
          }
        });
      }
    }

    // Format choices with IDs
    const choices = quizData.choices.map((choice: any, index: number) => ({
      id: `choice-${index + 1}`,
      text: choice.text || `Choice ${index + 1}`,
      isCorrect: choice.isCorrect === true,
      feedback: choice.feedback || (choice.isCorrect ? "Correct!" : "Not quite. Try again."),
    }));

    // Create quiz node
    const quizNode = {
      id: nodeId || `node-${Date.now()}`,
      type: "quiz" as const,
      speaker: "Quiz Master",
      text: quizData.summary 
        ? `${quizData.summary}\n\n${quizData.question}`
        : `Read the passage and answer:\n\n${quizData.question}`,
      choices,
      next: `node-${Date.now() + 1}`,
      background: undefined,
      character: {
        id: "narrator",
        name: "Narrator",
        position: "center" as const,
      },
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
    character: {
      id: "narrator",
      name: "Narrator",
      position: "center" as const,
    },
  };
}