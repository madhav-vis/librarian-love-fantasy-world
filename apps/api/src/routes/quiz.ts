import { Router } from "express";
import { generateQuizNode } from "../llm/generateQuiz";
import { logProgress, logComplete, logError } from "../utils/progress";

const router = Router();

router.get("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { nodeId, cfi, pageNumber, chapterIndex } = req.query;

    logProgress(`Quiz Request - Book: ${bookId}`);
    if (chapterIndex !== undefined) {
      logProgress(`  → Chapter Index: ${chapterIndex}`);
    } else if (pageNumber) {
      logProgress(`  → Page: ${pageNumber}`);
    }
    if (nodeId) {
      logProgress(`  → Node ID: ${nodeId}`);
    }

    // Get chapter index if provided (preferred), otherwise page number
    const chapterIdx = chapterIndex !== undefined 
      ? parseInt(chapterIndex as string) 
      : undefined;
    const page = pageNumber 
      ? parseInt(pageNumber as string) 
      : undefined;

    const quizNode = await generateQuizNode(
      bookId, 
      cfi as string, 
      nodeId as string,
      undefined, // progressPercent (deprecated)
      page,
      chapterIdx
    );

    logComplete("  ✓ Quiz node generated successfully");
    res.json(quizNode);
  } catch (error: any) {
    logError("Quiz generation failed", error);
    res.status(500).json({ 
      error: "Failed to generate quiz",
      message: error.message 
    });
  }
});

export { router as quizRouter };