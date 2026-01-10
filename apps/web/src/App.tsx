import { useState } from "react";
import { UploadScreen } from "./components/UploadScreen";
import { ChapterSelectionScreen } from "./components/ChapterSelectionScreen";
import { VNScene } from "./components/VNScene";
import type { BookData, QuizNode } from "./types";

type AppState = "upload" | "chapter-selection" | "game";

export default function App() {
  const [state, setState] = useState<AppState>("upload");
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [bookId, setBookId] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [currentNode, setCurrentNode] = useState<QuizNode | null>(null);

  const handleUpload = (id: string, title: string) => {
    setBookId(id);
    setBookTitle(title);
    setState("chapter-selection");
  };

  const handleChapterSelect = async (chapterIndex: number) => {
    try {
      // Fetch quiz for selected chapter
      const quizResponse = await fetch(`/api/quiz/${bookId}?chapterIndex=${chapterIndex}`);
      
      if (!quizResponse.ok) {
        throw new Error(`Quiz generation failed: ${quizResponse.statusText}`);
      }
      
      const quizNode = await quizResponse.json();
      
      setBookData({
        bookId,
        title: bookTitle,
        progress: chapterIndex + 1,
        totalPages: 0, // Not needed for chapter-based flow
        currentNode: quizNode,
      });
      
      setCurrentNode(quizNode);
      setState("game");
    } catch (error) {
      console.error("Failed to load quiz:", error);
      alert(error instanceof Error ? error.message : "Failed to start game");
    }
  };

  if (state === "upload") {
    return <UploadScreen onUpload={handleUpload} />;
  }

  if (state === "chapter-selection") {
    return (
      <ChapterSelectionScreen
        bookId={bookId}
        title={bookTitle}
        onChapterSelect={handleChapterSelect}
        onBack={() => setState("upload")}
      />
    );
  }

  if (state === "game") {
    if (!bookData || !currentNode) {
      return <div className="loading">Loading game...</div>;
    }
    return (
      <VNScene
        bookData={bookData}
        currentNode={currentNode}
        onNodeChange={setCurrentNode}
      />
    );
  }

  // Fallback - should never reach here, but prevent blank screen
  return <UploadScreen onUpload={handleUpload} />;
}