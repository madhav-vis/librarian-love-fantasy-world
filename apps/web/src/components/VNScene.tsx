import { useEffect, useState } from "react";
import type { BookData, QuizNode } from "../types";
import { DialogueBox } from "./DialogueBox";
import { ChoiceMenu } from "./ChoiceMenu";
import { CharacterSprite } from "./CharacterSprite";

interface VNSceneProps {
  bookData: BookData;
  currentNode: QuizNode | null;
  onNodeChange: (node: QuizNode | null) => void;
}

export function VNScene({ bookData, currentNode, onNodeChange }: VNSceneProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (bookData.currentNode) {
      onNodeChange(bookData.currentNode);
    }
  }, [bookData]);

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentNode?.next) {
      // Load next node
      fetch(`/api/quiz/${bookData.bookId}?nodeId=${currentNode.next}`)
        .then((res) => res.json())
        .then((node) => {
          onNodeChange(node);
          setSelectedChoice(null);
          setShowFeedback(false);
        });
    }
  };

  if (!currentNode) {
    return <div className="loading">Loading quiz...</div>;
  }

  const selectedChoiceData = currentNode.choices?.find(
    (c) => c.id === selectedChoice
  );

  return (
    <div className="vn-scene">
      {/* Background */}
      <div
        className="vn-background"
        style={{
          backgroundImage: currentNode.background
            ? `url(${currentNode.background})`
            : undefined,
        }}
      >
        {/* Character Sprites */}
        {currentNode.character && (
          <CharacterSprite character={currentNode.character} />
        )}
      </div>

      {/* Dialogue Box (RenPy style at bottom) */}
      <DialogueBox
        speaker={currentNode.speaker || "Narrator"}
        text={
          showFeedback && selectedChoiceData?.feedback
            ? selectedChoiceData.feedback
            : currentNode.text
        }
        onNext={handleNext}
        canAdvance={!currentNode.choices || showFeedback}
      />

      {/* Choice Menu */}
      {currentNode.choices && !showFeedback && (
        <ChoiceMenu
          choices={currentNode.choices}
          onSelect={handleChoiceSelect}
        />
      )}

      {/* Progress Indicator */}
      <div className="progress-indicator">
        <span>{bookData.title}</span>
        <span>Page: {bookData.progress}{bookData.totalPages ? ` / ${bookData.totalPages}` : ""}</span>
      </div>
    </div>
  );
}