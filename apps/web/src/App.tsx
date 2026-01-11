import { useState } from "react";
import { UploadScreen } from "./components/UploadScreen";
import { IntroDialogueScreen } from "./components/IntroDialogueScreen";
import { NameInputScreen } from "./components/NameInputScreen";
import { MarinaIntroScreen } from "./components/MarinaIntroScreen";
import { MarinaCluesScreen } from "./components/MarinaCluesScreen";
import { PlayerResponseScreen } from "./components/PlayerResponseScreen";
import { ChapterSelectionScreen } from "./components/ChapterSelectionScreen";
import { VNScene } from "./components/VNScene";
import { LoadingScreen } from "./components/LoadingScreen";
import { VincentEndScreen } from "./components/VincentEndScreen";
import { ToBeContinuedScreen } from "./components/ToBeContinuedScreen";
import type { BookData, QuizNode } from "./types";

type AppState = "upload" | "intro-dialogue" | "name-input" | "marina-intro" | "player-response" | "chapter-selection" | "marina-clues" | "loading" | "game" | "vincent-end" | "to-be-continued";

export default function App() {
  const [state, setState] = useState<AppState>("upload");
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [bookId, setBookId] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [currentNode, setCurrentNode] = useState<QuizNode | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);

  const handleUpload = (id: string, title: string) => {
    setBookId(id);
    setBookTitle(title);
    setState("intro-dialogue");
  };

  const handleChapterSelect = async (chapterIndex: number) => {
    // Store the selected chapter index
    setSelectedChapterIndex(chapterIndex);
    // Calculate initial gems for display
    const initialGems = (chapterIndex + 1) * 10;
    setBookData({
      bookId,
      title: bookTitle,
      progress: chapterIndex + 1,
      totalPages: 0,
      currentNode: null as any, // Will be set later
      gems: initialGems,
    });
    // Show Marina clues screen first
    setState("marina-clues");
  };

  const handleMarinaCluesNext = async () => {
    // After Marina clues, show loading screen and fetch quiz
    setState("loading");
    
    try {
      // Get the stored chapter index
      const chapterIndex = selectedChapterIndex ?? 0;
      
      // Calculate initial gems = chapter number * 10 (chapterIndex is 0-based, so +1)
      const initialGems = (chapterIndex + 1) * 10;
      
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
        gems: initialGems,
      });
      
      setCurrentNode(quizNode);
      setState("game");
    } catch (error) {
      console.error("Failed to load quiz:", error);
      alert(error instanceof Error ? error.message : "Failed to start game");
      setState("chapter-selection"); // Go back to chapter selection on error
    }
  };

  if (state === "upload") {
    return <UploadScreen onUpload={handleUpload} />;
  }

  if (state === "intro-dialogue") {
    return <IntroDialogueScreen onNext={() => setState("name-input")} />;
  }

  if (state === "name-input") {
    return (
      <NameInputScreen
        onNameSubmit={(name) => {
          setPlayerName(name);
          setState("marina-intro");
        }}
      />
    );
  }

  if (state === "marina-intro") {
    return (
      <MarinaIntroScreen
        playerName={playerName}
        bookTitle={bookTitle}
        onNext={() => setState("chapter-selection")}
      />
    );
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

  if (state === "marina-clues") {
    const currentGems = bookData?.gems || ((selectedChapterIndex ?? 0) + 1) * 10;
    return (
      <MarinaCluesScreen
        gems={currentGems}
        onNext={handleMarinaCluesNext}
      />
    );
  }

  if (state === "loading") {
    return <LoadingScreen />;
  }

  const handleGameComplete = () => {
    // Game completed - show Vincent end screen
    setState("vincent-end");
  };

  if (state === "game") {
    if (!bookData || !currentNode) {
      return <div className="loading">Loading game...</div>;
    }
    return (
      <VNScene
        bookData={bookData}
        currentNode={currentNode}
        onNodeChange={setCurrentNode}
        onGameComplete={handleGameComplete}
      />
    );
  }

  if (state === "vincent-end") {
    return (
      <VincentEndScreen
        onNext={() => setState("to-be-continued")}
      />
    );
  }

  if (state === "to-be-continued") {
    return <ToBeContinuedScreen />;
  }

  // Fallback - should never reach here, but prevent blank screen
  return <UploadScreen onUpload={handleUpload} />;
}